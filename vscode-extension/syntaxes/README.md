# AGENL — Agent Definition Language

> The governance and escalation layer for enterprise AI agents.
> Define what agents can do. Enforce it structurally.
> Escalate to humans when it matters.

---

## The problem

AI agents in production are governed by English prompts.
Prompts are interpreted by the model — not enforced by the system.
When interpretation goes wrong, the agent takes a real-world
action you cannot undo.

**AGENL fixes this.** You define agent behaviour in a structured
contract. The runtime enforces every rule before the model sees
the request. Blocked tools are removed entirely — the model never
has the option to use them.

---

## Who this is for

| Role | How AGENL helps |
|---|---|
| **Engineering teams** | Define agent permissions in code, not prompts |
| **Compliance officers** | Audit exactly what every agent was allowed to do |
| **Operations teams** | Build escalation workflows with human-in-the-loop |
| **Enterprise AI teams** | Deploy agents with governance from day one |

---

## 60-second quickstart

### Install
```bash
git clone https://github.com/ShanthiniShans/agenl.git
cd agenl
pip install -e .
```

### Add your API key
```bash
echo "ANTHROPIC_API_KEY=your-key-here" > .env
```

Get a key at console.anthropic.com — $5 credit covers
hundreds of conversions.

### Convert plain English to an agent contract
```bash
agenl convert "an agent that handles IT incidents but never
restarts servers or deploys code without human approval"
```

### Run an enterprise agent
```bash
agenl run agents/incident_handler.agent
```

### Validate before deploying
```bash
agenl validate agents/compliance_checker.agent
```

---

## Real-world use cases

### 1. Incident escalation — IT operations

An agent monitors systems, triages incidents, and creates
tickets automatically. Before it pages an on-call engineer
or rolls back a deployment, it confirms with a human.
Every decision is logged with full context.
```bash
agenl run agents/incident_handler.agent
```

### 2. Compliance checking — financial services

An agent reviews transactions for regulatory violations.
It can query databases and generate reports — but cannot
approve transactions, modify records, or notify regulators
without explicit human confirmation. Every decision is
auditable.
```bash
agenl run agents/compliance_checker.agent
```

### 3. Research pipeline — enterprise knowledge work

A three-agent team where a researcher gathers findings,
an analyst structures the data, and a writer produces
the report. Each agent has its own enforced contract.
The pipeline is defined in a single file.
```bash
agenl pipeline agents/research_team.pipeline
```

---

## What an agent contract looks like
```
agent IncidentHandler {
  goal: "Detect, triage and escalate system incidents"
  persona: "calm, methodical, always escalates when uncertain"

  tools {
    allow:   [query_database, read_file, summarise]
    block:   [delete_file, modify_config, restart_service]
    confirm: [send_email, page_oncall, rollback_deployment]
  }

  escalation {
    trigger:  on_uncertain
    notify:   human_in_loop
    context:  full_trace
    timeout:  30_minutes
    fallback: stop_and_log
  }

  trust: low
  on_uncertain: escalate
  on_error:     escalate
}
```

**What each section enforces:**

| Section | What it does |
|---|---|
| `tools.allow` | Agent can use these freely |
| `tools.block` | Hard removed — model never sees these as options |
| `tools.confirm` | Agent must get human approval before proceeding |
| `escalation` | What happens when agent hits uncertainty or failure |
| `trust` | Autonomy level — low means confirm frequently |
| `on_uncertain` | Escalate rather than guess |
| `on_error` | Escalate rather than retry blindly |

---

## How AGENL is different

| | LangChain | CrewAI | AutoGen | **AGENL** |
|---|---|---|---|---|
| Agent rules defined by | Python code | Python code | Config + code | Structured DSL |
| Rules enforced by | Developer discipline | Developer discipline | Framework conventions | **Runtime — structurally** |
| Natural language input | No | No | No | **Yes — built in** |
| Audit trail | No | No | No | **Yes — every .agent file** |
| Human escalation | Manual to build | Manual to build | Partial | **First-class feature** |
| Non-developer friendly | No | No | No | **Yes — readable contracts** |
| Composable via inheritance | No | No | No | **Yes — extends keyword** |

**The key difference:** LangChain, CrewAI, and AutoGen are
frameworks for building agents. AGENL is the governance layer
that sits above any framework — defining what agents are allowed
to do and enforcing it structurally.

---

## CLI commands
```bash
agenl convert "describe your agent in plain English"
agenl run     agents/my_agent.agent
agenl validate agents/my_agent.agent
agenl list
agenl pipeline agents/my_team.pipeline
agenl publish  agents/my_agent.agent --author yourname
agenl search   [query]
agenl pull     AgentName
```

---

## Agent inheritance

Build a governance hierarchy. Define rules once at the base
level. Specialised agents inherit and extend.
```
agent BaseEnterpriseAgent {
  trust: low
  on_uncertain: escalate
  on_error: escalate
  tools {
    block: [delete_file, modify_config]
  }
}

agent IncidentHandler extends BaseEnterpriseAgent {
  goal: "Handle IT incidents"
  tools.allow: [query_database, create_ticket]
  tools.confirm: [page_oncall, rollback_deployment]
}

agent ComplianceChecker extends BaseEnterpriseAgent {
  goal: "Review compliance violations"
  tools.allow: [query_database, export_pdf]
  tools.confirm: [flag_transaction, notify_regulator]
}
```

Update `BaseEnterpriseAgent` once — every agent that
extends it updates automatically.

---

## Project structure
```
agenl/
│
├── agenl/
│   ├── parser.py      — Lark grammar, validates .agent files
│   ├── converter.py   — Natural language → AGENL via Claude
│   ├── runtime.py     — Enforces contracts structurally
│   └── cli.py         — 8 CLI commands
│
├── agents/
│   ├── incident_handler.agent    — IT operations example
│   ├── compliance_checker.agent  — Financial services example
│   ├── research_bot.agent        — Research pipeline example
│   └── senior_analyst.agent      — Inheritance example
│
├── registry/          — Local agent registry
├── vscode-extension/  — Syntax highlighting for .agent files
└── setup.py           — pip install -e .
```

---

## Live demo

[![AGENL Demo](https://asciinema.org/a/a4SNeFFyCzjKqcPZ.svg)](https://asciinema.org/a/a4SNeFFyCzjKqcPZ)

---

## Roadmap

- [x] Phase 1 — Natural language converter, parser, runtime
- [x] Phase 2 — CLI, agent inheritance, multi-agent pipelines
- [x] Phase 3 — VS Code extension, agent registry, public launch
- [ ] Phase 4 — Cloud hosting, web dashboard, observability
- [ ] Phase 5 — Enterprise audit trails, SSO, compliance exports

---

## Discussion

[Hacker News](https://news.ycombinator.com/item?id=47481950)

---

## License

MIT — free to use, modify, and build on.

---

*AGENL — because enterprise AI agents need contracts, not wishes.*
