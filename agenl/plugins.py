import json
from datetime import datetime, timezone
from pathlib import Path

from agenl.exceptions import (
    AGENLBlockedError,
    AGENLConfirmationRequired,
    AGENLEscalationError,
)
from agenl.parser import parse_agent


class AGENLWrapper:
    """
    Wraps any existing agent with AGENL governance.
    Works as a drop-in plugin for LangChain, AutoGen,
    or any Python agent — no rebuild required.
    """

    def __init__(self, agent, contract_path, log_path="escalation_log.json"):
        self.agent = agent
        self.contract = self._load_contract(contract_path)
        self.log_path = log_path
        self._wrap_agent_tools()

    def _load_contract(self, path):
        with open(path, encoding="utf-8") as f:
            text = f.read()
        return parse_agent(text)

    def _wrap_agent_tools(self):
        """Wrap the agent's tools list in-place if exposed (LangChain-style)."""
        tools = getattr(self.agent, "tools", None)
        if not tools:
            return
        try:
            self.agent.tools = [self._make_governed_tool(t) for t in tools]
        except (AttributeError, TypeError):
            pass

    def _make_governed_tool(self, tool):
        """Return a thin proxy that enforces AGENL policy before invoking the real tool."""
        wrapper = self
        tool_name = getattr(tool, "name", repr(tool))

        class _GovernedTool:
            name = tool_name

            def __call__(self, *args, **kwargs):
                return wrapper._governed_call(tool_name, tool, *args, **kwargs)

            def run(self, *args, **kwargs):
                fn = getattr(tool, "run", tool)
                return wrapper._governed_call(tool_name, fn, *args, **kwargs)

            def invoke(self, *args, **kwargs):
                fn = getattr(tool, "invoke", tool)
                return wrapper._governed_call(tool_name, fn, *args, **kwargs)

            def __getattr__(self, item):
                return getattr(tool, item)

        return _GovernedTool()

    def _governed_call(self, tool_name, callable_obj, *args, **kwargs):
        status = self._check_tool(tool_name)
        if status == "block":
            self._log_action(tool_name, "blocked", reason="tool in block list")
            raise AGENLBlockedError(
                f"Tool '{tool_name}' is blocked by AGENL contract.",
                tool_name=tool_name,
            )
        if status == "confirm":
            self._log_action(tool_name, "pending_confirmation", reason="tool in confirm list")
            raise AGENLConfirmationRequired(
                f"Tool '{tool_name}' requires human confirmation before use.",
                tool_name=tool_name,
                args=args,
                kwargs=kwargs,
            )
        self._log_action(tool_name, "allowed")
        return callable_obj(*args, **kwargs)

    def run(self, user_input):
        on_error = self.contract.get("on_error", "escalate")
        try:
            if hasattr(self.agent, "run"):
                return self.agent.run(user_input)
            if hasattr(self.agent, "invoke"):
                return self.agent.invoke(user_input)
            raise AGENLEscalationError(
                "Wrapped agent has neither .run() nor .invoke() method.",
                context={"user_input": user_input},
            )
        except (AGENLBlockedError, AGENLConfirmationRequired, AGENLEscalationError):
            raise
        except Exception as exc:
            if on_error == "escalate":
                self._escalate(str(exc), {"user_input": user_input, "error": str(exc)})
            raise

    def _check_tool(self, tool_name):
        """Returns: 'allow', 'block', or 'confirm'."""
        tools = self.contract.get("tools", {})
        if tool_name in tools.get("block", []):
            return "block"
        if tool_name in tools.get("confirm", []):
            return "confirm"
        if tool_name in tools.get("allow", []):
            return "allow"
        # Tool not listed — treat as uncertain and apply on_uncertain policy
        on_uncertain = self.contract.get("on_uncertain", "say_so")
        if on_uncertain == "escalate":
            self._escalate(
                f"Tool '{tool_name}' is not listed in the contract.",
                {"tool": tool_name},
            )
        return "allow"

    def _log_action(self, tool, status, reason=""):
        """Append one action record to escalation_log.json."""
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "agent": self.contract.get("name"),
            "tool": tool,
            "status": status,
            "reason": reason,
        }
        log_path = Path(self.log_path)
        try:
            with open(log_path, encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, list):
                data = {"escalations": data, "actions": []}
        except (FileNotFoundError, json.JSONDecodeError):
            data = {"escalations": [], "actions": []}

        data.setdefault("actions", []).append(entry)

        tmp = log_path.with_suffix(log_path.suffix + ".tmp")
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
            f.write("\n")
        tmp.replace(log_path)

    def _escalate(self, reason, context):
        """Log the escalation then raise AGENLEscalationError."""
        self._log_action(context.get("tool", "unknown"), "escalated", reason=reason)
        raise AGENLEscalationError(reason, context=context)
