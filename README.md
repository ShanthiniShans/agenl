# AGENL — Agent Definition Language

> "Today's agents run on hope. AGENL runs on proofs."

AGENL is a domain-specific language for defining AI agents with mathematically verified safety guarantees. Define what agents can do. Prove what they cannot. Enforce it structurally. Escalate to humans when it matters.

---

## Origin

This project was built during the **LeanLang for Verified Autonomy Hackathon** (April 17–18 + online through May 1, 2026) at the **Indian Institute of Science (IISc), Bangalore**.
Sponsored by [Emergence AI](https://emergence.ai)
Organized by [Emergence India Labs](https://east.emergence.ai) in collaboration with **IISc Bangalore**.

---

## The Problem

AI agents in production are governed by English prompts. Prompts are interpreted by the model — not enforced by the system. When interpretation goes wrong, the agent takes a real-world action you cannot undo.

AGENL fixes this on two levels:

**Runtime enforcement** — You define agent behaviour in a structured contract. The runtime enforces every rule before the model sees the request. Blocked tools are removed entirely — the model never has the option to use them.

**Mathematical proof** — Lean 4 proves theorems about agent contracts. When Lean verifies a theorem, it is not a test result. It is a mathematical certainty. True in every possible execution, with no exceptions.

---

## Who This Is For

| Role | How AGENL helps |
|---|---|
| Engineering teams | Define agent permissions in code, not prompts |
| Compliance officers | Audit exactly what every agent was allowed to do |
| Operations teams | Build escalation workflows with human-in-the-loop |
| Enterprise AI teams | Deploy agents with governance from day one |
| Aerospace and defence | Prove agent constraints meet certification requirements |

---

## 60-Second Quickstart

**Install**
```bash
git clone https://github.com/ShanthiniShans/agenl.git
cd agenl
pip install -e .
```

**Add your API key**
```bash
echo "ANTHROPIC_API_KEY=your-key-here" > .env
```

**Convert plain English to an agent contract**
```bash
agenl convert "an agent that handles IT incidents
but never restarts servers or deploys code without
human approval"
```

**Run an enterprise agent**
```bash
agenl run agents/incident_handler.agent
```

**Validate before deploying**
```bash
agenl validate agents/compliance_checker.agent
```

**Open the ORBITAL mission dashboard**
```bash
open templates/orbital_dashboard.html
```

**Open the AGENL verification dashboard**
```bash
open templates/agenl_dashboard.html
```

---

## What an Agent Contract Looks Like

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

| Section | What it does |
|---|---|
| tools.allow | Agent can use these freely |
| tools.block | Hard removed — model never sees these as options |
| tools.confirm | Agent must get human approval before proceeding |
| escalation | What happens when agent hits uncertainty or failure |
| trust | Autonomy level — low means confirm frequently |
| on_uncertain | Escalate rather than guess |
| on_error | Escalate rather than retry blindly |

---

## Real-World Use Cases

**1. Incident escalation — IT operations**

An agent monitors systems, triages incidents, and creates tickets automatically. Before it pages an on-call engineer or rolls back a deployment, it confirms with a human. Every decision is logged with full context.

```bash
agenl run agents/incident_handler.agent
```

**2. Compliance checking — financial services**

An agent reviews transactions for regulatory violations. It can query databases and generate reports — but cannot approve transactions, modify records, or notify regulators without explicit human confirmation. Every decision is auditable.

```bash
agenl run agents/compliance_checker.agent
```

**3. Space mission risk intelligence — ORBITAL**

A 12-agent pipeline where each agent is mathematically verified. LaunchWindowAnalyser cannot approve a launch — not by policy, by theorem. OrbitalRiskAgent cannot approve a maneuver. Secret telemetry cannot appear in public reports. Proven by Lean 4.

```bash
agenl pipeline agents/orbital/pipeline.agenl
```

---

## Formal Verification — Lean 4

AGENL uses Lean 4 to generate mathematical proofs of contract correctness. These are not tests — they are theorems. Once verified by Lean's kernel, they are mathematically certain.

```
lake build · exit 0 · 3298 jobs · 18 theorems verified
```

### Verified Theorems — Core Library

All 5 AGENL Lean modules verified ✓

**AGENL/InfoFlow.lean — Information flow security**
- `secret_cannot_flow_to_public` — Secret data cannot flow to Public destinations. Proven.
- `flow_transitive` — Information flow respects label ordering across all pipeline stages.
- `all_public_excludes_secret` — Public memory contains no Secret items.
- `add_public_preserves_secrets` — Adding Public items does not change Secret memory.

**AGENL/Effects.lean — Free Monad execution model**
- `AgentProgram` Free Monad over `ToolEffect`
- `SafeProg` inductive safety proof
- Agents modelled as mathematical objects following FileM pattern

**AGENL/Liveness.lean — Agent liveness**
- `pure_always_completes` — Pure computations always reach completion.
- `effect_completes_if_allowed` — Effectful steps complete if the tool is in the allow list.

**AGENL/Memory.lean — Formal memory model**
- `public_filter_no_secret` — Filtering for Public items excludes all Secret items.
- `add_public_preserves_secrets` — Adding Public items does not change Secret memory contents.

**AGENL/ValidAgent.lean — Typeclass architecture**
- `ValidAgent` typeclass: no_overlap, allow_nonempty, trust_bounded
- `ValidPipeline` typeclass: composition property across all pipeline agents
- Inheritance is automatic — Lean enforces base properties in all derived instances

### Verified Theorems — ORBITAL Domain

**proofs/orbital/launch_window_analyser.lean**
- `launch_approval_blocked` — approve_launch is in the block list. Mathematical fact.
- `launch_approval_not_allowed` — approve_launch is not in the allow list. Mathematical fact.
- `launch_no_overlap` — No tool in both lists.
- `launch_window_valid_execution` — A valid cautious execution exists with trust = 0.

**proofs/orbital/orbital_risk_agent.lean**
- `orbital_maneuver_blocked` — approve_maneuver is mathematically blocked.
- `orbital_plan_modification_blocked` — modify_orbit_plan is mathematically blocked.

**proofs/orbital/risk_synthesiser.lean**
- `risk_no_secret_to_public` — Secret input cannot produce Public output.
- `risk_synthesis_label_monotone` — Combined output label is at least as high as any input.
- `risk_approve_mission_blocked` — approve_mission is mathematically blocked.

**proofs/orbital/escalation_coordinator.lean**
- `escalation_approve_blocked` — approve_action is mathematically blocked.

**proofs/orbital/knowledge_memory_agent.lean**
- `knowledge_delete_blocked` — delete_knowledge is mathematically blocked.
- `knowledge_history_blocked` — modify_historical_record is mathematically blocked.

**proofs/orbital/pipeline_validity.lean**
- `orbital_pipeline_valid` — All agents in the pipeline satisfy ValidAgent. Composition proven.
- `pipeline_no_approve_in_allow` — No approve_* action appears in any agent's allow list.

---

## ORBITAL — Space Mission Risk Intelligence

ORBITAL is a 12-agent verified pipeline demonstrating AGENL at aerospace scale.

```
Layer 1 — Program Management
  MissionContextAgent → ScheduleAnalyser →
  DependencyMapper → MilestonePredictor → DelayRiskDetector

Layer 2 — Space Domain
  SubsystemRelationships → LaunchWindowAnalyser → OrbitalRiskAgent

Layer 3 — Intelligence and Synthesis
  RiskSynthesiser → ExecutiveReportAgent →
  EscalationCoordinator → KnowledgeMemoryAgent

Feedback Arrow: SubsystemRelationships → ScheduleAnalyser
  label: Internal · terminate_after_one_pass
```

Every agent in the pipeline:
- Has a mathematically verified contract
- Cannot call blocked tools — proven impossible
- Carries DataLabels on all data items (taint tracking)
- Fails safe — on_failure: stop_and_escalate

### The Dashboards

**ORBITAL Dashboard** (`templates/orbital_dashboard.html`)
A live mission control app. Enter mission parameters, click RUN ANALYSIS, watch all 12 agents process data sequentially. Every blocked action shown with theorem reference. Executive report auto-generated.

**AGENL Dashboard** (`templates/agenl_dashboard.html`)
The framework verification tool. Inspect all agent contracts, define new agents with live validation, check any action against any agent, view all 18 theorems with Lean notation.

```bash
# Open ORBITAL mission dashboard
open templates/orbital_dashboard.html

# Open AGENL verification dashboard
open templates/agenl_dashboard.html
```

---

## How AGENL is Different

| | LangChain | CrewAI | AutoGen | AGENL |
|---|---|---|---|---|
| Rules defined by | Python code | Python code | Config | Structured DSL |
| Rules enforced by | Developer discipline | Developer discipline | Framework | Runtime + Lean proofs |
| Mathematical proof | No | No | No | Yes — Lean 4 |
| Audit trail | No | No | No | Yes — every contract |
| Human escalation | Manual | Manual | Partial | First-class feature |
| Non-developer friendly | No | No | No | Yes |
| Composable inheritance | No | No | No | Yes — extends keyword |

The key difference: LangChain, CrewAI, and AutoGen are frameworks for building agents. AGENL is the governance and verification layer that sits above any framework.

---

## Agent Inheritance

Build a governance hierarchy. Define rules once at the base level. Specialised agents inherit and extend.

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

Update BaseEnterpriseAgent once — every agent that extends it updates automatically. Lean proves inherited safety properties hold in all derived instances automatically.

---

## Plugin Layer — Govern Any Existing Agent

The biggest adoption barrier for any new framework is
migration cost. AGENL solves this with AGENLWrapper —
a one-line drop-in that governs any existing agent
without requiring a rebuild.

```python
# Your existing LangChain agent — unchanged
from langchain.agents import create_react_agent
agent = create_react_agent(llm, tools, prompt)

# Wrap it with AGENL governance — one line
from agenl.plugins import AGENLWrapper
governed_agent = AGENLWrapper(
    agent=agent,
    contract="agents/my_agent.agent"
)

# Now governed — same interface, enforced contract
governed_agent.run(user_input)
```

**What AGENLWrapper does on every tool call:**

| Action | What happens |
|---|---|
| Tool in allow list | Execution proceeds — logged |
| Tool in block list | AGENLBlockedError raised — logged immediately |
| Tool in confirm list | AGENLConfirmationRequired — human approval needed |
| on_uncertain fires | AGENLEscalationError — full context logged |
| on_error fires | AGENLEscalationError — pipeline halts |

Every action is written to `escalation_log.json` with
timestamp, tool name, status, and reason.

**Works with any framework:**

```python
# LangChain
from agenl.plugins import AGENLWrapper
governed = AGENLWrapper(langchain_agent, 
                        "agents/my_agent.agent")

# AutoGen
governed = AGENLWrapper(autogen_agent,
                        "agents/my_agent.agent")

# Any custom agent with .run() or .invoke()
governed = AGENLWrapper(your_agent,
                        "agents/my_agent.agent")
```

AGENL is not a replacement for your existing framework.
It is the governance layer that sits above any framework.

---

## CLI Commands

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

## Project Structure

```
agenl/
├── AGENL/                    ← Lean 4 verified library
│   ├── InfoFlow.lean         ← Information flow + taint tracking
│   ├── Effects.lean          ← Free Monad execution model
│   ├── Liveness.lean         ← Agent liveness proofs
│   ├── Memory.lean           ← Formal memory model
│   └── ValidAgent.lean       ← ValidAgent + ValidPipeline typeclasses
│
├── agents/
│   ├── incident_handler.agent
│   ├── compliance_checker.agent
│   ├── research_bot.agent
│   └── orbital/              ← 12 ORBITAL agent files + pipeline
│       ├── pipeline.agenl    ← SpaceMissionIntelligence pipeline
│       └── [12 agent files]
│
├── proofs/
│   ├── incident_handler.lean
│   ├── research_bot.lean
│   └── orbital/              ← 7 ORBITAL proof files
│       ├── mission_context_agent.lean
│       ├── launch_window_analyser.lean
│       ├── orbital_risk_agent.lean
│       ├── risk_synthesiser.lean
│       ├── escalation_coordinator.lean
│       ├── knowledge_memory_agent.lean
│       └── pipeline_validity.lean
│
├── templates/
│   ├── orbital_dashboard.html  ← ORBITAL mission dashboard
│   ├── agenl_dashboard.html    ← AGENL verification dashboard
│   └── design_handoff_agenl_orbital/
│
├── agenl/
│   ├── parser.py             ← Lark grammar
│   ├── converter.py          ← Natural language → AGENL
│   ├── runtime.py            ← Contract enforcement
│   ├── plugins.py            ← AGENLWrapper — governs any agent
│   ├── exceptions.py         ← AGENLBlockedError, escalation errors
│   └── cli.py                ← 8 CLI commands
│
├── lakefile.toml             ← Lean 4 package config
├── LICENSE                   ← BSL 1.1
└── README.md
```

---

## Roadmap

- [x] Phase 1 — Natural language converter, parser, runtime
- [x] Phase 2 — CLI, agent inheritance, multi-agent pipelines
- [x] Phase 3 — VS Code extension, agent registry
- [x] Phase 4 — Live dashboard, human-in-loop escalation
- [x] Phase 5 — Lean library: InfoFlow, Effects, Liveness, Memory, ValidAgent
- [x] Phase 6 — ORBITAL: 12-agent verified aerospace pipeline, 7 proof files, 18 theorems
- [x] Phase 6.1 — ValidAgent + ValidPipeline typeclasses, pipeline composition proven
- [x] Phase 6.2 — ORBITAL and AGENL dashboards with live pipeline animation
- [x] Phase 6.3 — AGENLWrapper: govern any existing agent framework without rebuild
- [ ] Phase 7 — safeRun: connect Lean proofs to live agent execution
- [ ] Phase 8 — First customer: aerospace certification tooling, design partner
- [ ] Phase 9 — SaaS platform: per-agent verification, domain agent packs, DO-178C compliance

---

## Built With IISc Guidance

AGENL was developed during the LeanLang for Verified Autonomy Hackathon at IISc Bangalore with direct mentorship from Prof. Siddhartha Gadgil (IISc + Emergence AI). Five theory challenges were posted to the Zulip group and answered directly:

| Challenge | Question | Answer | Impact |
|---|---|---|---|
| C1 | Information flow model | Labels on data items, not agents | Taint tracking in InfoFlow.lean |
| C2 | Free Monad structure | Follow FileM pattern | AgentProgram and SafeProg |
| C3 | Pipeline liveness | Existence proofs, not termination | ValidPipeline typeclass |
| C4 | Typeclass inheritance | Automatic in Lean | No extra proof work needed |
| C5 | Pipeline composition | Theorem for specific pipelines | orbital_pipeline_valid |

---

## Acknowledgements
Built during the LeanLang for Verified Autonomy Hackathon
organised by Emergence AI · IISc Bangalore · April 2026
Mentor: Prof. Siddhartha Gadgil

---

## License

Business Source License 1.1
Commercial use requires a license from the author.
Community use, research, and contributions are free.
See LICENSE for full terms.

---

*AGENL — because enterprise AI agents need contracts, not wishes. And contracts need proofs, not hope.*

---

## Acknowledgments

This project was made possible by:

- **Emergence AI** — Hackathon sponsor
- **Emergence India Labs** — Event organizer and research direction
- **Indian Institute of Science (IISc), Bangalore** — Academic partner, hackathon co-design, tutorials, and mentorship

## Links

- [Hackathon Page](https://east.emergence.ai/hackathon-march2026.html)
- [Emergence India Labs](https://east.emergence.ai)
- [Emergence AI](https://emergence.ai)
