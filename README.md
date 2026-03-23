# AGENL — Agent Definition Language

> Convert natural language into verified, enforceable AI agent contracts.

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

## Quick start

### 1. Clone the repo
```bash
git clone https://github.com/ShanthiniShans/agenl.git
cd agenl
```

### 2. Install
```bash
pip install -e .
```

### 3. Add your API key

AGENL uses Claude to convert natural language into agent 
definitions. You need an Anthropic API key for this step.

Get one free at console.anthropic.com — add $5 credit 
which covers hundreds of agent conversions.

Create a `.env` file in the root:
```
ANTHROPIC_API_KEY=your-api-key-here
```

> **Note:** Your key stays on your machine and is never 
> shared. The `.gitignore` file ensures it's never 
> accidentally committed to GitHub.

### 4. Run your first agent

```bash
agenl run agents/research_bot.agent
```

---

## CLI commands

### Convert plain English to an agent contract
```bash
agenl convert "an agent that searches the web but never sends emails"
```

Optionally save the generated definition:
```bash
agenl convert "an agent that monitors my inbox" --save agents/inbox_monitor.agent
```

### Run an agent from a file
```bash
agenl run agents/research_bot.agent
```

### Validate an agent file
```bash
agenl validate agents/research_bot.agent
```

### List all agents in the project
```bash
agenl list
```

### Run a multi-agent pipeline
```bash
agenl pipeline agents/research_team.pipeline
```

---

## The AGENL language

### Basic agent definition
```
agent ResearchBot {
  goal: "Search the web and summarise findings"
  persona: "precise, always cites sources, never speculates"

  tools {
    allow:   [web_search, summarise, read_file]
    block:   [send_email, delete_file, write_file]
    confirm: [run_python]
  }

  memory {
    short: last_10_turns
    long: vector_store("research_history")
  }

  trust: medium
  on_uncertain: say_so
  on_error: escalate
}
```

### Agent inheritance
```
agent SeniorAnalyst extends ResearchBot {
  goal: "Research topics deeply and produce formal reports"
  persona: "thorough, formal, always cites sources"

  tools {
    allow:   [write_file, export_pdf]
    confirm: [send_email]
  }

  trust: high
}
```

`SeniorAnalyst` automatically inherits all rules from `ResearchBot`
and adds its own on top. Update `ResearchBot` once — all children
update automatically.

### Multi-agent pipeline
```
pipeline ResearchTeam {
  description: "Three agents that research, analyse and report"

  agents {
    researcher: ResearchBot
    analyst:    SeniorAnalyst
    summariser: SummaryBot
  }

  flow {
    step_1: researcher  -> "search and gather raw findings"
    step_2: analyst     -> "analyse findings and structure data"
    step_3: summariser  -> "produce final report for user"
  }

  on_failure: stop_and_escalate
  output: step_3
}
```

---

## Language reference

### Tool permission levels

| Level | Meaning |
|---|---|
| `allow` | Agent can use freely |
| `block` | Hard no — enforced by runtime, model never sees the option |
| `confirm` | Must get user approval before proceeding |

### Agent properties

| Property | Options | Meaning |
|---|---|---|
| `trust` | low, medium, high | How much autonomy the agent has |
| `on_uncertain` | say_so, best_guess | What to do when unsure |
| `on_error` | escalate, retry, stop | What to do on failure |

### Why this beats prompt engineering

| | Prompt engineering | AGENL |
|---|---|---|
| Rules enforced by | Model interpretation | Runtime — structurally |
| Auditable | No | Yes — one readable file |
| Consistent | Drifts over time | Same every run |
| Composable | Copy-paste prompts | extends keyword |
| Enterprise-ready | No | Yes |

---

## Project structure
```
agenl/
│
├── README.md
├── .env                       ← your API key (never commit this)
├── requirements.txt
├── setup.py                   ← makes agenl a real CLI tool
│
├── agenl/
│   ├── __init__.py
│   ├── parser.py              ← reads and validates .agent files
│   ├── converter.py           ← natural language → AGENL via Claude
│   ├── runtime.py             ← enforces the contract structurally
│   └── cli.py                 ← all CLI commands
│
└── agents/
    ├── research_bot.agent     ← base agent example
    ├── senior_analyst.agent   ← inheritance example
    ├── research_team.pipeline ← pipeline example
    └── claude_co_founder.agent
```

---

## Roadmap

- [x] **Phase 1** — Natural language converter + parser + runtime
- [x] **Phase 2** — CLI, agent inheritance, pipeline support
- [ ] **Phase 3** — VS Code extension, agent registry, open source launch
- [ ] **Phase 4** — Cloud hosting, enterprise audit trails, team features

---

## Status

Phase 2 complete. Actively building toward open source launch.

Star the repo to follow progress.
Open an issue to share ideas or feedback.

## Live demo

[![AGENL Demo](https://asciinema.org/a/a4SNeFFyCzjKqcPZ.svg)](https://asciinema.org/a/a4SNeFFyCzjKqcPZ)

Watch AGENL convert a complex healthcare agent description into a
verified, enforced contract in real time.

---

## License

MIT — free to use, modify, and build on.

---

*AGENL — because AI agents need contracts, not wishes.*