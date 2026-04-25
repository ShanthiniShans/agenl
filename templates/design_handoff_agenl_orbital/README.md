# Handoff: AGENL · ORBITAL — Mission Intelligence Suite

## Overview

This package contains high-fidelity interactive prototypes for two linked products:

- **AGENL** — Agent Definition Language Framework: a developer/auditor tool for defining, verifying, and inspecting AI agent contracts, Lean proofs, information flow, and safety logs.
- **ORBITAL** — Mission Risk Intelligence Platform: a mission management tool where 12 verified AI agents analyse mission data and produce a unified risk picture.

The prototypes include voice narration (Web Speech API), full navigation, live pipeline animation, interactive forms, and all 15+ screens across both products.

---

## About the Design Files

The files in this bundle are **design references built in HTML + React (Babel)**. They are prototypes showing intended look, layout, and interactive behaviour — not production code to copy directly.

The task is to **recreate these designs in your target codebase** using its established framework, component library, and patterns. If no framework exists yet, React + TypeScript is recommended given the component complexity and state requirements.

---

## Fidelity

**High-fidelity.** These are pixel-precise mockups with final colours, typography, spacing, animations, and interactions. Recreate them as closely as possible using your codebase's existing design system — or use the exact token values listed below if starting fresh.

---

## Design Tokens

### Colours — ORBITAL

| Token | Hex | Usage |
|---|---|---|
| `bg` | `#080c14` | Page background |
| `surface-1` | `#0d1420` | Sidebar |
| `surface-2` | `#111927` | Cards |
| `surface-3` | `#1a2535` | Inputs, inner blocks |
| `border` | `#1e2d42` | Card/divider borders |
| `border-2` | `#243347` | Input borders |
| `text` | `#e2e8f0` | Primary text |
| `text-sec` | `#7a9ab8` | Secondary text |
| `text-muted` | `#4a6785` | Labels, muted |
| `blue` | `#3b9eff` | Primary accent, links, active nav |
| `amber` | `#f59e0b` | Warnings, At Risk |
| `green` | `#10b981` | Success, GO, nominal |
| `red` | `#ef4444` | Critical, NO-GO, blocked |
| `purple` | `#a78bfa` | Feedback loop indicators |
| `cyan` | `#22d3ee` | Log highlights |

### Colours — AGENL

| Token | Hex | Usage |
|---|---|---|
| `bg` | `#08090f` | Page background |
| `surface-1` | `#0d0f1a` | Sidebar |
| `surface-2` | `#111422` | Cards |
| `surface-3` | `#171b2e` | Inputs, inner blocks |
| `border` | `#1d2138` | Borders |
| `border-2` | `#252844` | Input borders |
| `text` | `#e8eaf6` | Primary text |
| `text-sec` | `#7b82b4` | Secondary text |
| `text-muted` | `#454a72` | Labels, muted |
| `blue` | `#6366f1` | Primary accent, active nav |
| `green` | `#22c55e` | Verified, allowed, build pass |
| `red` | `#f43f5e` | Blocked, unverified |
| `amber` | `#f59e0b` | Warnings, confirm list |
| `cyan` | `#22d3ee` | Data labels, trace |
| `purple` | `#a78bfa` | Feedback loop |

### Typography

| Role | Family | Weight | Size |
|---|---|---|---|
| Headings / UI | Space Grotesk | 400 / 600 / 700 | 22px (h1), 13px (body), 11px (label), 10px (micro) |
| Code / Data / Mono | JetBrains Mono | 400 / 600 / 700 | 13px (code blocks), 11px (inline), 10px (log rows), 9px (micro) |

Letter-spacing on page titles: none. Letter-spacing on uppercase micro labels: 1px. Letter-spacing on product wordmarks: 2–6px.

### Spacing

Base unit: 8px. Common values: 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 32, 36.

Card padding: 16px 18px. Page padding: 32px 36px. Sidebar width: 220px.

### Border Radius

Cards: 8px. Buttons: 6–8px. Badges/pills: 4px. Circular gauge: n/a (SVG).

### Shadows

Blue glow (active card): `box-shadow: 0 0 16px #3b9eff22`
Product icon glow: `box-shadow: 0 0 12px #3b9eff55`
Green proof dot: `box-shadow: 0 0 6px #22c55e`

---

## Product 1 — AGENL

### Navigation (left sidebar, 220px)

Pages in order: Agent Contracts · Define Agent · Verification · Execution Trace · Info Flow · Safety Log · Proofs

Active state: 2px left border in `blue`, background `blue/10%`, text white, weight 600.
Inactive: no border, text `text-sec`, weight 400.
Build status strip below logo: green dot + "18 theorems · exit 0" in `JetBrains Mono 10px`.

---

### Page 1 — Agent Contracts

**Layout:** 2-column grid, gap 14px. Max-width unrestricted.

**Each agent card:**
- Background: `surface-2`, border `border`, border-radius 8px, padding 16px 18px
- Left border: 3px solid `green` (Verified) or `red` (Unverified)
- Header row: agent name (`Space Grotesk 13px 600 text`), layer (`JetBrains Mono 10px text-muted`), trust badge + verified badge right-aligned
- Stats row: allow count, block count, confirm count in `Space Grotesk 10px text-sec`
- Click to expand: shows goal text, allow list (green, `+` prefix), block list (red, `✗` prefix), on_uncertain and on_error values in `cyan JetBrains Mono`
- Cursor: pointer

**Trust badges:**
- Low: amber bg/border/text
- Medium: blue bg/border/text
- High: green bg/border/text

**Verified badge:** green bg/border. Unverified: red bg/border.

All 12 agents:
1. DataIngestionAgent — L1 — Low — 3 allow / 3 block — Verified
2. ScheduleAnalyser — L1 — Medium — 3 allow / 3 block — 1 confirm — Verified
3. WeatherMonitor — L1 — Low — 2 allow / 2 block — Verified
4. OrbitalMechanicsAgent — L1 — High — 4 allow / 2 block — 1 confirm — Verified
5. SubsystemHealthAgent — L2 — Medium — 3 allow / 2 block — Verified
6. SubsystemRelationships — L2 — Medium — 3 allow / 2 block — 1 confirm — Verified
7. VendorRiskAgent — L2 — Low — 3 allow / 3 block — Verified
8. LaunchWindowAgent — L2 — High — 3 allow / 2 block — 1 confirm — Verified
9. RiskAggregatorAgent — L3 — High — 3 allow / 2 block — 1 confirm — Verified
10. EscalationRouterAgent — L3 — Medium — 3 allow / 3 block — 1 confirm — Verified
11. LaunchReadinessAgent — L3 — High — 3 allow / 2 block — 1 confirm — Verified
12. ExecutiveReportAgent — L3 — Low — 3 allow / 2 block — Verified

---

### Page 2 — Define Agent

**Layout:** 2-column grid, gap 20px. Max-width 900px.

**Left column:**
- Card 1 — "Identity": name, goal, persona (text inputs), trust level, on_uncertain, on_error (dropdowns)
- Card 2 — "Memory": short-term dropdown (session/none), long-term text input

**Right column:**
- Card 1 — "Permissions": three tool-list inputs (Allow, Block, Confirm). Each has a text field + Add button + tag list below. Tags are clickable to remove (append ` ×`). Allow = green, Block = red, Confirm = amber.
- Card 2 — "Live Validation": real-time warnings. Checks: (a) any tool in both allow AND block → red error, (b) allow list empty → amber warning, (c) name empty → amber warning. If no warnings: green `✓ Contract valid`. Two action buttons: "Generate Contract" (blue) and "Verify with Lean" (green).

**Generated contract:** monospace pre block showing `.agenl` file syntax. Background `bg`, border `border`, green text.

**Lean verify result:** green block if valid ("`✓ lake build: exit 0 — all theorems satisfied`"), red if not.

---

### Page 3 — Verification

**Layout:** 2-column grid, gap 20px. Max-width 900px.

**Left card — Action Permission Check:**
- Agent dropdown (all 12 agents)
- Action name text input
- "Check Permission" button (full width, blue)
- Result block: ALLOWED (green), BLOCKED (red, shows theorem name in monospace), NOT PERMITTED (amber)
- Example buttons below (3 preset agent/action pairs, transparent with border, JetBrains Mono 10px)

**Right card — Information Flow Check:**
- Source label dropdown: Public / Internal / Secret
- Destination label dropdown: Public / Internal / Secret
- "Check Flow" button
- Result: PERMITTED (green, shows canFlowTo proof details) or BLOCKED (red, shows theorem name)
- Label rank table below: Public rank 0, Internal rank 1, Secret rank 2

**Logic:**
- Action BLOCKED if action ∈ agent.block_list → theorem: `blocked_action_impossible`
- Action ALLOWED if action ∈ agent.allow_list
- Action NOT PERMITTED if action ∉ allow_list and ∉ block_list
- Flow PERMITTED if source.rank ≤ destination.rank
- Flow BLOCKED with `secret_cannot_flow_to_public` if Secret→Public, `internal_cannot_flow_to_public` if Internal→Public

---

### Page 4 — Execution Trace

**Layout:** full width. Filter bar at top (3 buttons: All / Blocked only / Allowed only).

**Header row** (JetBrains Mono 9px text-muted, letterSpacing 1): AGENT · LAYER · IN LABEL · OUT LABEL · BLOCKED ACTION

**Each agent row:**
- Background `surface-2`, border `border`, border-radius 6px, padding 10px 14px
- Columns: name (140px, 11px 600), layer (60px, mono muted), input label (80px, cyan mono), output label (80px, green if Public else cyan), blocked action (red mono if present)
- Clickable to expand: shows INPUT description, OUTPUT LABEL as `DataLabel.X`, and blocked action box (red bg/border, theorem reference)

**ExecutiveReportAgent** output label is `Public` (green). All others `Internal` (cyan).

---

### Page 5 — Info Flow

**Layout:** full-width card for lattice, then 2-column grid.

**Lattice diagram:**
- Three boxes side by side with `→ canFlowTo` arrows between them
- Public (green, rank 0) → Internal (cyan, rank 1) → Secret (red, rank 2)
- Each box: coloured bg/border at 10% opacity, large name text, "rank N" in mono muted

**Agent label assignments listed below lattice** — each label shows which agents handle that data level as coloured pill tags.

**Left card — Taint Tracking:** monospace code block showing `LabelledData` structure and `taint` function.

**Right card — Feedback Arrow:** text explanation + monospace theorem block for `feedback_loop_terminates` in purple.

---

### Page 6 — Safety Log

**Layout:** filter bar (agent dropdown + All/BLOCKED/ALLOWED buttons), then log table.

**Table columns** (JetBrains Mono 10px): TIMESTAMP · AGENT · ACTION · STATUS · REFERENCE

**Row styling:**
- Blocked rows: red `#08` background tint
- BLOCKED status text: red. ALLOWED status text: green
- Theorem reference (if blocked): red. Allow list reference: text-muted
- Column widths: 120px / 200px / 180px / 80px / remainder

---

### Page 7 — Proofs

**Layout:** build status banner at top, then collapsible list of 18 theorems.

**Build banner:** green background tint, green left pulsing dot, bold text "All 18 theorems verified · lake build exit 0 · 3298 jobs", subtitle with build time.

**Each theorem row:**
- Background `surface-2`, border-radius 8px, padding 12px 16px
- Left: theorem index (T01–T18, mono muted), name (mono 12px 600 text), plain English description (11px text-sec)
- Right: job count (mono muted) + green pulsing status dot
- Expand to show: file path (mono muted 9px), Lean 4 notation in monospace code block (green)

All 18 theorem names and descriptions are in the reference HTML file `AGENL.html` / `agenl-pages.jsx`.

---

## Product 2 — ORBITAL

### Navigation (left sidebar, 220px)

Pages in order: Mission Setup · Live Pipeline · Program Schedule · Subsystems · Launch Window · Orbital Risk · Escalations · Executive Report

Pages 3–8 are **locked** (opacity 0.35, cursor not-allowed) until the pipeline has been run. They unlock after all 12 agents complete.

Active nav item: 2px left border `blue`, blue bg tint, text white, weight 600.
Mission name shown below logo after pipeline runs.

---

### Page 1 — Mission Setup

**Layout:** 2-column grid (max-width 820px). Large "RUN ANALYSIS" button at bottom spanning full width.

**Left column:**
- Card "Mission Identity": Mission Name (text), Target Orbit (dropdown: LEO 400km / LEO 550km / MEO 8000km / GEO 35786km), Days to Launch (number), Mission Phase (dropdown: Design / Integration / Test / Launch Prep)
- Card "Orbital Parameters": Conjunction Events in 24h (number), Closest Approach in km (number), Vendor Delay in days (number), Weather Probability slider (0–100%)

**Right column:**
- Card "Schedule Milestone Health": 5 sliders (Systems Integration, Avionics Test, Propulsion Integration, Thermal Qualification, Launch Rehearsal)
- Card "Subsystem Health": 5 sliders (Thermal, Propulsion, Power, Avionics, Communications)

**Slider colour:** green if ≥70%, amber if 40–69%, red if <40%.

**RUN ANALYSIS button:** full width, `blue` background, white text, `Space Grotesk 700 15px uppercase`, letter-spacing 1. Box shadow `0 0 24px blue/33%`. Hover: lighten to `#5aaaff`.

**Pre-loaded demo data:** Mission ASTRA-7, LEO-550km, 90 days, Integration phase, with mixed health scores to demonstrate risk detection.

---

### Page 2 — Live Pipeline

**Layout:** 2-column. Left: scrollable agent list (flex 1). Right: log panel (300px fixed).

**Layer groupings** — three sections with monospace blue label:
- Layer 1 — Data Ingestion & Analysis (agents 1–4)
- Layer 2 — Cross-Domain Synthesis (agents 5–8)
- Layer 3 — Risk Integration & Output (agents 9–12)

**Agent card states:**
- Queued: default surface-2 card, muted badge
- Running: blue border glow (`blue/33%`), blue badge, pulsing blue dot + "Processing…"
- Complete: green badge, 3-column info grid (INPUT / DECISION / OUTPUT)
- Escalated: red badge, 3-column grid + red blocked action notice

**Agent card animation:** `fadeSlideIn` — opacity 0 + translateY(8px) → opacity 1 + translateY(0), 0.4s ease.

**Animation timing:** agents appear 900ms apart. Each stays "Running" for 700ms then transitions to Complete/Escalated.

**Feedback loop notice** (purple, appears after SubsystemRelationships completes): "↺ FEEDBACK LOOP — SubsystemRelationships → ScheduleAnalyser. Runs once and terminates."

**Log panel (right):** card with scrollable list. Each entry: timestamp (muted) + coloured message text. Blue for start, green for complete, red for escalated, cyan for pipeline complete.

---

### Page 3 — Program Schedule

**Layout:** 2-column grid.

**Left — Milestone Progress card:**
Each milestone row: name + status badge (On Track/At Risk/Critical) + 6px progress bar (coloured by value) + completion % and predicted date.

Date logic: On Track → "T-{days} (nominal)", At Risk → "T-{days+N} (slipping)", Critical → "T-{days+N} (critical)".

**Right:**
- Risk Signals card: amber/red warning cards for each milestone below 70%. Shows milestone name, current %, threshold, and which agent flagged it.
- Vendor Risk card: vendor delay days, cascade dependency list if >5 days.
- Agent Attribution card: bullet list of which agent produced each insight.

---

### Page 4 — Subsystems

**Layout:** 4×2 grid of health cards, then cascade analysis card, then feedback signal card.

**Each subsystem card:**
- Left border: 3px solid health colour
- Large health % (24px mono bold, coloured)
- Status badge
- 4px progress bar
- Status label: Nominal / Degraded / Critical

**Subsystems:** Thermal, Propulsion, Power, Avionics, Communications + Structure (88%), Attitude Control (74%), Payload (91%).

**Cascade analysis** (shown if Thermal < 60%): horizontal chain diagram. Thermal → Power Distribution → Avionics, connected with red arrows. Each node shows name and health/issue label. Background red tint.

**Feedback signal card:** if Thermal < 60%, shows purple box "FEEDBACK SIGNAL SENT — signal to ScheduleAnalyser: thermal cascade affects integration timeline. Ran once and stopped." Otherwise shows green "No feedback signal required."

---

### Page 5 — Launch Window

**Layout:** 2-column (240px left, 1fr right). Max-width 880px.

**Left:**
- Card with `CircularGauge` SVG component (180px diameter)
  - Outer ring: `surface-3` 10px stroke
  - Progress ring: coloured by value, `drop-shadow` glow, rotated -90deg, strokeLinecap round
  - Centre text: large % value (coloured) + "READINESS" label
- Windows card: PRIMARY and BACKUP launch times (T+{days}d · HH:MM UTC)

**Right:**
- GO/NO-GO checklist card: 5 items. Each row: GO/NO-GO badge (64px fixed width) + item name + descriptive note.
  - Weather: GO if weatherProb ≤ 60%
  - Range Availability: always GO
  - Thermal Qualification: GO if Thermal ≥ 70%
  - Propulsion Readiness: GO if Propulsion ≥ 70%
  - Orbital Clearance: GO if conjunctions ≤ 3
- Readiness % = (GO count / 5) × 100
- System note (amber): "Launch authorisation is NOT possible through this system…"

**System note styling:** amber bg tint, amber border/text, warning icon, 11px Space Grotesk.

---

### Page 6 — Orbital Risk

**Layout:** 2-column grid top row + full-width card below. Max-width 880px.

**Conjunction Summary card (4 stat blocks in 2×2 grid):**
- Events in 24h, Closest Approach, Collision Probability, Risk Level
- Each: `surface-3` bg, 9px mono label, 16px mono bold value
- Highlight (amber) if: events > 3, approach < 5km, risk ≠ LOW

**Orbital Parameters card:** key-value rows (target orbit, inclination, eccentricity, space weather, solar flux).

**Risk level logic:** HIGH if conjunctions > 5, MEDIUM if > 2, LOW otherwise.
**Collision probability:** `1.2×10⁻⁴` (HIGH), `3.8×10⁻⁵` (MEDIUM), `7.1×10⁻⁶` (LOW).

**Maneuver Recommendations card:** if conjunctions > 2, show 2 recommendation cards with action, Δv, timing, and priority badge. System note (amber): maneuver authorisation is human-only.

---

### Page 7 — Escalations

**Layout:** full width. Max-width 880px. System note at top. Open escalations list, then Resolved list.

**Escalation card:**
- Left border: 3px red (P1) or amber (P2)
- Priority badge + status badge + timestamp (right-aligned)
- Description text (13px 500)
- "Raised by: [AgentName]" and "Routed to: [Human]" in 10px

**Escalation generation logic:**
- P1: any milestone < 40%, vendor delay > 10 days, conjunctions > 5
- P2: weather > 70%, any subsystem < 40%, vendor delay > 5

**Resolved escalations:** same layout, opacity 0.6.

**System note:** "All approve actions require human confirmation. No agent can resolve, approve, or close an escalation autonomously."

---

### Page 8 — Executive Report

**Layout:** max-width 780px. Header row with title + PUBLIC badge + Download PDF button (visual only). Single large card.

**Card sections:**
1. **Header grid** (3 columns): Mission name, Date, Risk Level badge
2. **Mission Status** paragraph: generated text combining phase, days, orbit, risk level, subsystem issues, and milestone issues.
3. **Key Risks** list: red ▲ bullet + description per risk. Auto-generated from input data.
4. **Recommended Actions** list: blue → bullet + action per item.
5. **System note** (amber): AI risk picture only, human authority required.

**PUBLIC badge:** green mono text, green bg/border tint.
**Download PDF button:** blue background, no actual download in prototype.

**Risk level logic:** score = (subsystems < 60%) + (milestones < 60%) + (conjunctions > 3 ? 2 : 0) + (vendorDelay > 5 ? 1 : 0). HIGH if > 5, MEDIUM if > 2, LOW otherwise.

---

## Interactions & Behaviour

### Voice Narration (Web Speech API)
- Both dashboards use `window.speechSynthesis` for page narration
- Each page triggers narration on mount (300ms delay)
- ORBITAL pipeline narrates each agent start and completion in sequence
- Voice toggle button: fixed top-right, shows 🔊/🔇, blue accent when on
- Mute cancels current speech immediately
- Rate: 0.92, pitch: 1.0, volume: 1

### ORBITAL Pipeline Animation
- Triggered by "RUN ANALYSIS" button
- Navigates to Live Pipeline page immediately
- Each agent: Running state at `i × 900ms`, Complete/Escalated at `i × 900ms + 700ms`
- Voice narration interleaved with state transitions
- `pipelineComplete` flag unlocks sidebar navigation after last agent
- Log panel appends entries in real time

### AGENL Define Agent — Live Validation
- Runs on every keystroke / list change
- Checks: dual allow/block conflict (red), empty allow list (amber), missing name (amber)
- Generate Contract: toggles pre block below the form
- Verify with Lean: sets result state, shows green or red result block

### AGENL Verification — Check Actions
- Action check: string match against agent's allow_list and block_list arrays
- Flow check: numeric rank comparison (Public=0, Internal=1, Secret=2). canFlowTo iff src.rank ≤ dst.rank
- Results appear inline below the button

### Navigation — Locked Pages (ORBITAL)
- Pages 3–8 rendered with `opacity: 0.35`, `cursor: not-allowed`, `pointer-events: none` until `pipelineComplete = true`

### Expand / Collapse
- Agent contract cards (AGENL): toggle on click, animated with `fadeIn` CSS keyframe
- Execution trace rows: same toggle pattern
- Proof theorem rows: same pattern, border-radius changes on open (8px 8px 0 0)

---

## State Management

### ORBITAL App State
```
missionData: {
  missionName: string,
  orbit: string,
  daysToLaunch: string,
  phase: string,
  milestones: [{ name: string, value: number }] × 5,
  subsystems: [{ name: string, value: number }] × 5,
  conjunctions: number,
  closestApproach: number,
  vendorDelay: number,
  weatherProb: number,
}
agents: Agent[]  // populated on pipeline run
logLines: LogEntry[]
pipelineRunning: boolean
pipelineComplete: boolean
voiceEnabled: boolean  // ref + state for stale closure safety
```

### AGENL App State
All state is local to each page component. No global state needed. Voice state lives in App.

---

## Assets

- **Fonts:** Space Grotesk (400/500/600/700) + JetBrains Mono (400/600/700) via Google Fonts
- **Icons:** All symbols are Unicode characters — no icon library required (⬡ ◈ ▦ ◉ △ ○ ⚑ ▤ ▣ ∀)
- **Images:** None — all visuals are CSS and SVG
- **External dependencies:** React 18.3.1, ReactDOM 18.3.1, Babel Standalone 7.29.0 (dev prototyping only — replace with proper build pipeline in production)

---

## Files in This Package

| File | Description |
|---|---|
| `index.html` | Launcher — links to both products |
| `ORBITAL.html` | ORBITAL main app shell (React, all state, voice, pipeline logic) |
| `orbital-components.jsx` | ORBITAL shared components (sidebar, badges, cards, gauge, sliders) |
| `orbital-pages.jsx` | ORBITAL all 8 page components + agent data template |
| `AGENL.html` | AGENL main app shell (React, navigation, voice) |
| `agenl-components.jsx` | AGENL shared components (sidebar, badges, mono block, inputs) |
| `agenl-pages.jsx` | AGENL all 7 page components + agent contracts + theorem data |

---

## Implementation Notes for Claude Code

1. **Split by product first** — implement AGENL and ORBITAL as separate route groups or apps.
2. **Data layer** — `AGENTS_TEMPLATE(missionData)` in `orbital-pages.jsx` and `AGENT_CONTRACTS` / `THEOREMS` arrays in `agenl-pages.jsx` are the canonical data. Extract these into typed constants/fixtures.
3. **Pipeline timing** — the `runPipeline` function in `ORBITAL.html` uses nested `setTimeout` chains. In production, replace with a proper async queue or a state machine (XState recommended).
4. **Voice narration** — the Web Speech API is sufficient for a demo. For production, consider a proper TTS service if cross-browser consistency or custom voices are required.
5. **Circular gauge** — implemented as a raw SVG with `strokeDasharray` animation. Can be replaced with a charting library (Recharts, Nivo) if available.
6. **Locked nav** — the `pipelineComplete` flag is the gate. In a real app this would be driven by a pipeline run status from the backend.
7. **Human-only actions** — all blocked actions (`issue_launch_authorisation`, `command_maneuver`, `auto_approve_launch`) are enforced at the UI layer with system notes. In production, these must also be enforced server-side.
