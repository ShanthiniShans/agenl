# AGENL — Agent Definition Language

> Convert plain English into verified, enforceable AI agent contracts.

---

## What is AGENL?

Building AI agents today means writing hundreds of words of English
instructions and hoping the model follows them correctly every time.
AGENL replaces that with a structured, readable contract that is
enforced by the runtime — not by the model's interpretation.

You describe what you want in plain English.
AGENL converts it into a verified agent definition.
The runtime enforces the rules structurally.
No prompt drift. No ambiguity. No surprises.

---

## The problem it solves
```python
# Today — fragile, unverifiable
system_prompt = """Never send emails. Never delete files.
Always ask before running code. If uncertain say so.
Be precise. Cite sources. Don't speculate..."""
# Hope the model remembers all of this. Every time.
```
```
# AGENL — structured, enforced, auditable
agent ResearchBot {
  goal: "Search the web and summarise findings"
  persona: "precise, always cites sources"

  tools {
    allow:   [web_search, summarise]
    block:   [send_email, delete_file]
    confirm: [run_python]
  }

  trust: medium
  on_uncertain: say_so
  on_error: escalate
}
```

Same intent. One is a wish. The other is a contract.

---

## How it works
```
You speak plain English
        ↓
AGENL converter (powered by Claude)
        ↓
Structured .agent definition generated
        ↓
You review and approve
        ↓
Runtime enforces the contract — structurally
```

---

## Quick start

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/agenl.git
cd agenl
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Add your API key

Create a `.env` file in the root:
```
ANTHROPIC_API_KEY=your-api-key-here
```

### 4. Run AGENL
```bash
python main.py
```

When prompted, describe your agent in plain English:
```
Describe your agent: I want an agent that searches the web and answers
questions but never sends emails or deletes anything
```

AGENL will generate, parse, and verify the agent contract instantly.

---

## Example output
```
Agent: WebSearchAgent
Goal: Search the web and provide accurate answers

┏━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ Property       ┃ Value                             ┃
┡━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┩
│ Allowed tools  │ web_search, browse_web, summarise │
│ Blocked tools  │ send_email, delete_file           │
│ Confirm before │ run_python                        │
│ Trust level    │ medium                            │
│ On uncertain   │ say_so                            │
│ On error       │ escalate                          │
└────────────────┴───────────────────────────────────┘

Agent contract verified and enforced.
Rules are structurally locked — not prompt-based.
```

---

## Project structure
```
agenl/
│
├── README.md                  ← you are here
├── .env                       ← your API key (never commit this)
├── requirements.txt           ← dependencies
│
├── agenl/
│   ├── __init__.py            ← package init
│   ├── parser.py              ← reads .agent files
│   ├── converter.py           ← natural language → AGENL
│   └── runtime.py             ← enforces the contract
│
├── agents/
│   └── research_bot.agent     ← example agent definition
│
└── main.py                    ← entry point
```

---

## The AGENL language

An agent definition has six sections:

| Section | What it does |
|---|---|
| `goal` | What the agent is trying to accomplish |
| `persona` | How it should behave and communicate |
| `tools` | What it can, cannot, and must confirm before doing |
| `memory` | Short and long term memory configuration |
| `trust` | Autonomy level — low, medium, or high |
| `on_uncertain` | What to do when unsure — say_so or best_guess |
| `on_error` | What to do on failure — escalate, retry, or stop |

### Tool permission levels
```
allow   — agent can use freely
block   — hard no, enforced by runtime, model never sees the option
confirm — must get user approval before proceeding
```

---

## Why this matters

| | Prompt engineering | AGENL |
|---|---|---|
| Rules enforced by | Model interpretation | Runtime — structurally |
| Auditable | No | Yes — one readable file |
| Consistent | Drifts over time | Same every run |
| Composable | Copy-paste prompts | extends keyword |
| Enterprise-ready | No | Yes |

---

## Roadmap

- [x] **Phase 1** — Natural language → AGENL converter + parser + runtime
- [ ] **Phase 2** — CLI, agent inheritance, pipeline support
- [ ] **Phase 3** — VS Code extension, agent registry, open source launch
- [ ] **Phase 4** — Cloud hosting, enterprise audit trails, team features

---

## Status

Phase 1 complete. Actively building.

This is an early-stage open source project.
Star the repo to follow progress.
Open an issue to share ideas or feedback.

---

## License

MIT — free to use, modify, and build on.

---

*AGENL — because AI agents need contracts, not wishes.*
