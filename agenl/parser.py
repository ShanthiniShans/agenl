from lark import Lark, Transformer, v_args

AGENL_GRAMMAR = r"""
    start: agent_def

    agent_def: "agent" NAME ("extends" NAME)? "{" section* "}"

    section: goal_section
           | persona_section
           | tools_section
           | memory_section
           | trust_section
           | on_uncertain_section
           | on_error_section
           | tools_override_section

    goal_section:         "goal"         ":" ESCAPED_STRING
    persona_section:      "persona"      ":" ESCAPED_STRING
    trust_section:        "trust"        ":" NAME
    on_uncertain_section: "on_uncertain" ":" NAME
    on_error_section:     "on_error"     ":" NAME

    tools_section: "tools" "{" tools_body* "}"
    tools_body: allow_line | block_line | confirm_line
    allow_line:   "allow"   ":" "[" [NAME ("," NAME)*] "]"
    block_line:   "block"   ":" "[" [NAME ("," NAME)*] "]"
    confirm_line: "confirm" ":" "[" [NAME ("," NAME)*] "]"

    tools_override_section: "tools." NAME ":" "[" [NAME ("," NAME)*] "]"

    memory_section: "memory" "{" memory_body* "}"
    memory_body: short_line | long_line
    short_line: "short" ":" NAME
    long_line:  "long"  ":" NAME "(" ESCAPED_STRING ")"

    NAME: /[a-zA-Z_][a-zA-Z0-9_]*/

    %import common.ESCAPED_STRING
    %import common.WS
    %import common.SH_COMMENT
    %ignore WS
    %ignore SH_COMMENT
"""

@v_args(inline=True)
class AgentTransformer(Transformer):

    def start(self, agent):
        return agent

    def agent_def(self, *args):
        if len(args) >= 2 and isinstance(args[1], str) and args[1] != "{":
            name = str(args[0])
            parent = str(args[1])
            sections = args[2:]
        else:
            name = str(args[0])
            parent = None
            sections = args[1:]

        result = {
            "name": name,
            "parent": parent,
            "tools": {"allow": [], "block": [], "confirm": []},
            "memory": {}
        }

        for s in sections:
            if s and isinstance(s, dict):
                if "tools_override" in s:
                    override = s["tools_override"]
                    key = override["key"]
                    vals = override["values"]
                    if key in result["tools"]:
                        result["tools"][key].extend(vals)
                    else:
                        result["tools"][key] = vals
                elif "tools" in s:
                    for k, v in s["tools"].items():
                        result["tools"][k] = v
                else:
                    result.update(s)

        return result

    def section(self, s):
        return s

    def goal_section(self, val):
        return {"goal": str(val).strip('"')}

    def persona_section(self, val):
        return {"persona": str(val).strip('"')}

    def trust_section(self, val):
        return {"trust": str(val)}

    def on_uncertain_section(self, val):
        return {"on_uncertain": str(val)}

    def on_error_section(self, val):
        return {"on_error": str(val)}

    def tools_section(self, *lines):
        tools = {"allow": [], "block": [], "confirm": []}
        for line in lines:
            if line:
                tools.update(line)
        return {"tools": tools}

    def tools_body(self, line):
        return line

    def allow_line(self, *names):
        return {"allow": [str(n) for n in names]}

    def block_line(self, *names):
        return {"block": [str(n) for n in names]}

    def confirm_line(self, *names):
        return {"confirm": [str(n) for n in names]}

    def tools_override_section(self, key, *names):
        return {"tools_override": {
            "key": str(key),
            "values": [str(n) for n in names]
        }}

    def memory_section(self, *lines):
        mem = {}
        for line in lines:
            if line:
                mem.update(line)
        return {"memory": mem}

    def memory_body(self, line):
        return line

    def short_line(self, val):
        return {"short": str(val)}

    def long_line(self, name, val):
        return {"long": f"{name}:{str(val).strip(chr(34))}"}


parser = Lark(AGENL_GRAMMAR, parser="earley")


def parse_agent(text: str) -> dict:
    tree = parser.parse(text)
    return AgentTransformer().transform(tree)


def resolve_inheritance(child: dict, parent: dict) -> dict:
    resolved = {
        "name":        child["name"],
        "parent":      child.get("parent"),
        "goal":        child.get("goal")        or parent.get("goal", ""),
        "persona":     child.get("persona")     or parent.get("persona", ""),
        "trust":       child.get("trust")        or parent.get("trust", "medium"),
        "on_uncertain":child.get("on_uncertain") or parent.get("on_uncertain", "say_so"),
        "on_error":    child.get("on_error")     or parent.get("on_error", "escalate"),
        "memory":      child.get("memory")       or parent.get("memory", {}),
    }

    parent_tools = parent.get("tools", {"allow": [], "block": [], "confirm": []})
    child_tools  = child.get("tools",  {"allow": [], "block": [], "confirm": []})

    resolved["tools"] = {
        "allow":   list(set(parent_tools.get("allow",   []) + child_tools.get("allow",   []))),
        "block":   list(set(parent_tools.get("block",   []) + child_tools.get("block",   []))),
        "confirm": list(set(parent_tools.get("confirm", []) + child_tools.get("confirm", []))),
    }

    return resolved