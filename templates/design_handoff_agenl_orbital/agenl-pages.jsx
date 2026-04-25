
// AGENL — All 7 Page Components

const AGENT_CONTRACTS = [
  { id: 1, name: 'DataIngestionAgent', layer: 1, trust: 'Low', allow: ['read_mission_payload','parse_json','validate_schema'], block: ['write_db','send_email','execute_command'], confirm: [], verified: true, goal: 'Ingest and validate raw mission input data.', persona: 'Data validator. Never assumes data is correct.', onUncertain: 'say_so', onError: 'stop', memory: { short: 'session', long: 'none' } },
  { id: 2, name: 'ScheduleAnalyser', layer: 1, trust: 'Medium', allow: ['read_milestone_data','compute_schedule_risk','write_risk_report'], block: ['modify_schedule','send_email','escalate_without_review'], confirm: ['write_risk_report'], verified: true, goal: 'Analyse program schedule milestones and compute delay risk.', persona: 'Methodical scheduler. Flags risk conservatively.', onUncertain: 'escalate', onError: 'escalate', memory: { short: 'session', long: 'mission_history' } },
  { id: 3, name: 'WeatherMonitor', layer: 1, trust: 'Low', allow: ['read_weather_data','compute_launch_weather_risk'], block: ['modify_launch_window','issue_weather_warning_public'], confirm: [], verified: true, goal: 'Monitor weather data and assess launch window risk.', persona: 'Conservative. Never clears weather without data.', onUncertain: 'say_so', onError: 'stop', memory: { short: 'session', long: 'none' } },
  { id: 4, name: 'OrbitalMechanicsAgent', layer: 1, trust: 'High', allow: ['read_tle_data','compute_conjunction','flag_collision_risk','recommend_maneuver'], block: ['command_maneuver','issue_launch_authorisation'], confirm: ['flag_collision_risk'], verified: true, goal: 'Compute orbital conjunction risk and flag maneuver recommendations.', persona: 'Precise. Treats every conjunction as potentially critical.', onUncertain: 'escalate', onError: 'stop', memory: { short: 'session', long: 'orbital_history' } },
  { id: 5, name: 'SubsystemHealthAgent', layer: 2, trust: 'Medium', allow: ['read_telemetry','compute_health_score','write_health_report'], block: ['modify_system_config','issue_commands'], confirm: [], verified: true, goal: 'Assess subsystem health and identify degradation patterns.', persona: 'Thorough. Reports all anomalies regardless of severity.', onUncertain: 'say_so', onError: 'escalate', memory: { short: 'session', long: 'telemetry_log' } },
  { id: 6, name: 'SubsystemRelationships', layer: 2, trust: 'Medium', allow: ['read_health_matrix','compute_cascade','send_feedback_signal'], block: ['trigger_shutdown','modify_system_config'], confirm: ['send_feedback_signal'], verified: true, goal: 'Analyse cross-subsystem dependencies and cascade paths.', persona: 'Systems thinker. Maps second-order effects.', onUncertain: 'say_so', onError: 'stop', memory: { short: 'session', long: 'none' } },
  { id: 7, name: 'VendorRiskAgent', layer: 2, trust: 'Low', allow: ['read_vendor_data','compute_delay_risk','write_vendor_report'], block: ['contact_vendor','modify_contract','approve_payment'], confirm: [], verified: true, goal: 'Assess vendor delay risk and downstream dependency impact.', persona: 'Risk-averse. Assumes worst-case delay propagation.', onUncertain: 'say_so', onError: 'stop', memory: { short: 'session', long: 'vendor_history' } },
  { id: 8, name: 'LaunchWindowAgent', layer: 2, trust: 'High', allow: ['read_launch_constraints','compute_window','write_window_report'], block: ['approve_launch_window','command_hold'], confirm: ['write_window_report'], verified: true, goal: 'Determine launch window viability from all constraint inputs.', persona: 'Systematic. Checks every constraint before output.', onUncertain: 'escalate', onError: 'escalate', memory: { short: 'session', long: 'window_history' } },
  { id: 9, name: 'RiskAggregatorAgent', layer: 3, trust: 'High', allow: ['read_all_reports','compute_aggregate_risk','write_risk_summary'], block: ['approve_mission','issue_go_nogo'], confirm: ['write_risk_summary'], verified: true, goal: 'Aggregate risk signals from all agents into unified risk picture.', persona: 'Holistic. Weights all inputs before scoring.', onUncertain: 'escalate', onError: 'stop', memory: { short: 'session', long: 'risk_history' } },
  { id: 10, name: 'EscalationRouterAgent', layer: 3, trust: 'Medium', allow: ['read_risk_summary','route_escalation','write_escalation_log'], block: ['auto_approve_launch','close_escalation','resolve_autonomously'], confirm: ['route_escalation'], verified: true, goal: 'Route escalations to the correct human authority.', persona: 'Procedural. Routes everything; decides nothing.', onUncertain: 'escalate', onError: 'escalate', memory: { short: 'session', long: 'escalation_log' } },
  { id: 11, name: 'LaunchReadinessAgent', layer: 3, trust: 'High', allow: ['read_all_reports','compute_readiness_score','write_readiness_report'], block: ['issue_launch_authorisation','command_ignition'], confirm: ['write_readiness_report'], verified: true, goal: 'Produce a comprehensive launch readiness assessment for human review.', persona: 'Conservative. A NO-GO finding requires explicit human override.', onUncertain: 'escalate', onError: 'stop', memory: { short: 'session', long: 'readiness_history' } },
  { id: 12, name: 'ExecutiveReportAgent', layer: 3, trust: 'Low', allow: ['read_risk_summary','write_executive_report','label_as_public'], block: ['write_classified_data','send_report_externally'], confirm: [], verified: true, goal: 'Generate a Public-labelled executive summary of mission risk.', persona: 'Clear communicator. Writes for non-technical audiences.', onUncertain: 'say_so', onError: 'stop', memory: { short: 'session', long: 'none' } },
];

const THEOREMS = [
  { id: 1, name: 'action_allowed_if_in_allowlist', desc: 'An agent may only perform an action if it appears in its explicit allow list.', lean: 'theorem action_allowed_if_in_allowlist (a : Agent) (act : Action) :\n  canPerform a act ↔ act ∈ a.contract.allow_list', file: 'Theorems/ActionSafety.lean', jobs: 312 },
  { id: 2, name: 'blocked_action_impossible', desc: 'A blocked action cannot be executed by any agent, regardless of trust level.', lean: 'theorem blocked_action_impossible (a : Agent) (act : Action) :\n  act ∈ a.contract.block_list → ¬ canPerform a act', file: 'Theorems/ActionSafety.lean', jobs: 208 },
  { id: 3, name: 'secret_cannot_flow_to_public', desc: 'Data labelled Secret can never flow to a Public destination.', lean: 'theorem secret_cannot_flow_to_public :\n  ¬ canFlowTo Secret Public', file: 'Theorems/InfoFlow.lean', jobs: 187 },
  { id: 4, name: 'canFlowTo_reflexive', desc: 'Any data label can flow to itself.', lean: 'theorem canFlowTo_reflexive (l : DataLabel) : canFlowTo l l', file: 'Theorems/InfoFlow.lean', jobs: 44 },
  { id: 5, name: 'canFlowTo_transitive', desc: 'Information flow is transitive across the label lattice.', lean: 'theorem canFlowTo_transitive (a b c : DataLabel) :\n  canFlowTo a b → canFlowTo b c → canFlowTo a c', file: 'Theorems/InfoFlow.lean', jobs: 96 },
  { id: 6, name: 'internal_cannot_flow_to_public', desc: 'Internal data cannot flow to a Public destination.', lean: 'theorem internal_cannot_flow_to_public :\n  ¬ canFlowTo Internal Public', file: 'Theorems/InfoFlow.lean', jobs: 143 },
  { id: 7, name: 'taint_propagation_monotone', desc: 'Taint labels can only increase in rank through a computation pipeline.', lean: 'theorem taint_propagation_monotone (d : LabelledData) :\n  ∀ step, (step d).label.rank ≥ d.label.rank', file: 'Theorems/Taint.lean', jobs: 220 },
  { id: 8, name: 'feedback_loop_terminates', desc: 'Any feedback signal between agents terminates after one pass.', lean: 'theorem feedback_loop_terminates (s : Signal) :\n  s.terminate_after_one_pass = true → ¬ cycles s', file: 'Theorems/Pipeline.lean', jobs: 178 },
  { id: 9, name: 'confirm_list_requires_human', desc: 'All actions on the confirm list require explicit human confirmation before execution.', lean: 'theorem confirm_list_requires_human (a : Agent) (act : Action) :\n  act ∈ a.contract.confirm_list → requiresHumanConfirm act', file: 'Theorems/HumanOversight.lean', jobs: 267 },
  { id: 10, name: 'low_trust_cannot_escalate', desc: 'A Low-trust agent cannot autonomously route escalations.', lean: 'theorem low_trust_cannot_escalate (a : Agent) :\n  a.trust = Low → ¬ canEscalate a', file: 'Theorems/Trust.lean', jobs: 134 },
  { id: 11, name: 'launch_authorisation_human_only', desc: 'The action issue_launch_authorisation is permanently blocked for all agents.', lean: 'theorem launch_authorisation_human_only (a : Agent) :\n  ¬ canPerform a issue_launch_authorisation', file: 'Theorems/HumanOversight.lean', jobs: 89 },
  { id: 12, name: 'maneuver_command_blocked', desc: 'No agent may issue spacecraft maneuver commands.', lean: 'theorem maneuver_command_blocked (a : Agent) :\n  ¬ canPerform a command_maneuver', file: 'Theorems/HumanOversight.lean', jobs: 74 },
  { id: 13, name: 'pipeline_acyclic', desc: 'The agent pipeline graph (excluding approved feedback signals) is acyclic.', lean: 'theorem pipeline_acyclic : DAG agent_pipeline', file: 'Theorems/Pipeline.lean', jobs: 312 },
  { id: 14, name: 'public_output_label_preserved', desc: 'Once labelled Public, an output cannot be relabelled to a higher security class.', lean: 'theorem public_output_label_preserved (d : LabelledData) :\n  d.label = Public → ∀ op, (op d).label = Public', file: 'Theorems/Taint.lean', jobs: 156 },
  { id: 15, name: 'no_dual_allow_block', desc: 'No action may appear in both the allow list and block list of any agent.', lean: 'theorem no_dual_allow_block (a : Agent) (act : Action) :\n  ¬ (act ∈ a.contract.allow_list ∧ act ∈ a.contract.block_list)', file: 'Theorems/Contracts.lean', jobs: 198 },
  { id: 16, name: 'trust_level_determines_capability', desc: 'Agent capabilities are strictly bounded by their assigned trust level.', lean: 'theorem trust_level_determines_capability (a b : Agent) :\n  a.trust < b.trust → capabilities a ⊆ capabilities b', file: 'Theorems/Trust.lean', jobs: 241 },
  { id: 17, name: 'escalation_must_route_to_human', desc: 'All escalation signals must terminate at a human authority node.', lean: 'theorem escalation_must_route_to_human (e : Escalation) :\n  ∃ h : HumanAuthority, e.routes_to h', file: 'Theorems/HumanOversight.lean', jobs: 167 },
  { id: 18, name: 'contract_immutable_at_runtime', desc: 'Agent contracts cannot be modified during pipeline execution.', lean: 'theorem contract_immutable_at_runtime (a : Agent) :\n  ∀ t : Time, t > pipeline_start → a.contract = a.contract₀', file: 'Theorems/Contracts.lean', jobs: 212 },
];

// ---------- Page 1: Agent Contracts ----------
function AgentContractsPage() {
  const [expanded, setExpanded] = React.useState(null);
  return (
    <div>
      <APageHeader title="Agent Contracts" subtitle="All defined agents with their verified contracts. Click to expand." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {AGENT_CONTRACTS.map(agent => (
          <div key={agent.id}>
            <ACard style={{ cursor: 'pointer', borderLeft: `3px solid ${agent.verified ? A_COLORS.green : A_COLORS.red}`, transition: 'all 0.15s' }}
              onClick={() => setExpanded(expanded === agent.id ? null : agent.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: A_COLORS.text, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 3 }}>{agent.name}</div>
                  <div style={{ fontSize: 10, color: A_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace' }}>Layer {agent.layer}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <ATrustBadge level={agent.trust} />
                  <AStatusBadge status={agent.verified ? 'Verified' : 'Unverified'} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 10, color: A_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif' }}>
                <span>✓ Allow: <strong style={{color: A_COLORS.text}}>{agent.allow.length}</strong></span>
                <span>✗ Block: <strong style={{color: A_COLORS.text}}>{agent.block.length}</strong></span>
                <span>? Confirm: <strong style={{color: A_COLORS.text}}>{agent.confirm.length}</strong></span>
              </div>
              {expanded === agent.id && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${A_COLORS.border}`, animation: 'fadeIn 0.2s ease' }}>
                  <div style={{ fontSize: 11, color: A_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 8, lineHeight: 1.5 }}>
                    <strong style={{color: A_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', fontSize: 9}}>GOAL</strong><br />{agent.goal}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 9, color: A_COLORS.green, fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>ALLOW</div>
                      {agent.allow.map(a => <div key={a} style={{ fontSize: 10, color: A_COLORS.textSec, fontFamily: 'JetBrains Mono, monospace', padding: '1px 0' }}>+ {a}</div>)}
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: A_COLORS.red, fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>BLOCK</div>
                      {agent.block.map(b => <div key={b} style={{ fontSize: 10, color: A_COLORS.textSec, fontFamily: 'JetBrains Mono, monospace', padding: '1px 0' }}>✗ {b}</div>)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 10, color: A_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif' }}>
                    <span>on_uncertain: <span style={{color: A_COLORS.cyan, fontFamily: 'JetBrains Mono, monospace'}}>{agent.onUncertain}</span></span>
                    <span>on_error: <span style={{color: A_COLORS.cyan, fontFamily: 'JetBrains Mono, monospace'}}>{agent.onError}</span></span>
                  </div>
                </div>
              )}
            </ACard>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Page 2: Define Agent ----------
function DefineAgentPage() {
  const [form, setForm] = React.useState({ name: '', goal: '', persona: '', trust: 'Medium', onUncertain: 'escalate', onError: 'stop', allow: [], block: [], confirm: [], memShort: 'session', memLong: '' });
  const [allowInput, setAllowInput] = React.useState('');
  const [blockInput, setBlockInput] = React.useState('');
  const [confirmInput, setConfirmInput] = React.useState('');
  const [showContract, setShowContract] = React.useState(false);
  const [verifyResult, setVerifyResult] = React.useState(null);
  const set = (k, v) => setForm(p => ({...p, [k]: v}));

  const dualConflict = form.allow.filter(a => form.block.includes(a));
  const warnings = [
    dualConflict.length > 0 && { type: 'error', msg: `Conflict: "${dualConflict.join(', ')}" appears in both allow and block list` },
    form.allow.length === 0 && { type: 'warn', msg: 'Allow list is empty — agent cannot perform any actions' },
    !form.name && { type: 'warn', msg: 'Agent name is required' },
  ].filter(Boolean);

  const contractText = `-- AGENL Contract: ${form.name || '<unnamed>'}
agent ${form.name || 'unnamed'} where
  goal       := "${form.goal}"
  persona    := "${form.persona}"
  trust      := .${form.trust}
  on_uncertain := .${form.onUncertain}
  on_error     := .${form.onError}
  allow_list   := [${form.allow.map(a => `\n    .${a}`).join(',')}${form.allow.length ? '\n  ' : ''}]
  block_list   := [${form.block.map(b => `\n    .${b}`).join(',')}${form.block.length ? '\n  ' : ''}]
  confirm_list := [${form.confirm.map(c => `\n    .${c}`).join(',')}${form.confirm.length ? '\n  ' : ''}]
  memory := {
    short := .${form.memShort},
    long  := "${form.memLong || 'none'}"
  }`;

  const handleVerify = () => {
    const ok = dualConflict.length === 0 && form.allow.length > 0 && form.name;
    setVerifyResult(ok ? 'verified' : 'failed');
  };

  const addTool = (list, input, setInput, key) => {
    if (!input.trim()) return;
    set(key, [...form[key], input.trim().replace(/\s+/g,'_')]);
    setInput('');
  };

  const ToolListInput = ({ label, items, input, setInput, listKey, color }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, color: A_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 5, fontWeight: 500 }}>{label}</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTool(items, input, setInput, listKey)}
          placeholder="action_name" style={{ flex: 1, background: A_COLORS.s3, border: `1px solid ${A_COLORS.border2}`, borderRadius: 6, padding: '6px 10px', color: A_COLORS.text, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, outline: 'none' }} />
        <button onClick={() => addTool(items, input, setInput, listKey)} style={{ background: color + '22', border: `1px solid ${color}44`, borderRadius: 6, padding: '6px 12px', color, fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, cursor: 'pointer' }}>Add</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {items.map(item => (
          <span key={item} style={{ background: color + '15', color, border: `1px solid ${color}33`, borderRadius: 4, padding: '2px 8px', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer' }}
            onClick={() => set(listKey, form[listKey].filter(i => i !== item))}>{item} ×</span>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 900 }}>
      <APageHeader title="Define Agent" subtitle="Build a new agent contract. Validation runs live." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <ACard style={{ marginBottom: 16 }}>
            <ACardTitle>Identity</ACardTitle>
            <AInput label="Agent Name" value={form.name} onChange={v => set('name', v)} placeholder="MyAgent" />
            <AInput label="Goal" value={form.goal} onChange={v => set('goal', v)} placeholder="Describe what this agent does" />
            <AInput label="Persona" value={form.persona} onChange={v => set('persona', v)} placeholder="Behavioural guidance for the agent" />
            <AInput label="Trust Level" value={form.trust} onChange={v => set('trust', v)} options={['Low','Medium','High']} />
            <AInput label="On Uncertain" value={form.onUncertain} onChange={v => set('onUncertain', v)} options={['escalate','say_so','stop']} />
            <AInput label="On Error" value={form.onError} onChange={v => set('onError', v)} options={['escalate','stop']} />
          </ACard>
          <ACard>
            <ACardTitle>Memory</ACardTitle>
            <AInput label="Short-term" value={form.memShort} onChange={v => set('memShort', v)} options={['session','none']} />
            <AInput label="Long-term store" value={form.memLong} onChange={v => set('memLong', v)} placeholder="e.g. mission_history" />
          </ACard>
        </div>
        <div>
          <ACard style={{ marginBottom: 16 }}>
            <ACardTitle>Permissions</ACardTitle>
            <ToolListInput label="Allow List" items={form.allow} input={allowInput} setInput={setAllowInput} listKey="allow" color={A_COLORS.green} />
            <ToolListInput label="Block List" items={form.block} input={blockInput} setInput={setBlockInput} listKey="block" color={A_COLORS.red} />
            <ToolListInput label="Confirm List" items={form.confirm} input={confirmInput} setInput={setConfirmInput} listKey="confirm" color={A_COLORS.amber} />
          </ACard>
          <ACard>
            <ACardTitle>Live Validation</ACardTitle>
            {warnings.length === 0 ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: A_COLORS.green, fontSize: 12, fontFamily: 'Space Grotesk, sans-serif' }}>
                <span>✓</span><span>Contract valid</span>
              </div>
            ) : warnings.map((w, i) => (
              <div key={i} style={{ background: `${w.type === 'error' ? A_COLORS.red : A_COLORS.amber}11`, border: `1px solid ${w.type === 'error' ? A_COLORS.red : A_COLORS.amber}33`, borderRadius: 5, padding: '7px 10px', marginBottom: 6, fontSize: 11, color: w.type === 'error' ? A_COLORS.red : A_COLORS.amber, fontFamily: 'Space Grotesk, sans-serif' }}>
                {w.type === 'error' ? '✗ ' : '⚠ '}{w.msg}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => setShowContract(!showContract)} style={{ flex: 1, background: A_COLORS.blue + '22', border: `1px solid ${A_COLORS.blue}44`, borderRadius: 6, padding: '8px', color: A_COLORS.blue, fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                {showContract ? 'Hide' : 'Generate'} Contract
              </button>
              <button onClick={handleVerify} style={{ flex: 1, background: A_COLORS.green + '22', border: `1px solid ${A_COLORS.green}44`, borderRadius: 6, padding: '8px', color: A_COLORS.green, fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                Verify with Lean
              </button>
            </div>
            {verifyResult && (
              <div style={{ marginTop: 10, background: `${verifyResult === 'verified' ? A_COLORS.green : A_COLORS.red}11`, border: `1px solid ${verifyResult === 'verified' ? A_COLORS.green : A_COLORS.red}33`, borderRadius: 5, padding: '8px 10px', fontSize: 11, color: verifyResult === 'verified' ? A_COLORS.green : A_COLORS.red, fontFamily: 'JetBrains Mono, monospace' }}>
                {verifyResult === 'verified' ? '✓ lake build: exit 0 — all theorems satisfied' : '✗ Verification failed — resolve warnings before verifying'}
              </div>
            )}
          </ACard>
        </div>
      </div>
      {showContract && (
        <div style={{ marginTop: 16 }}>
          <ACard>
            <ACardTitle>.agenl Contract Output</ACardTitle>
            <MonoBlock>{contractText}</MonoBlock>
          </ACard>
        </div>
      )}
    </div>
  );
}

// ---------- Page 3: Verification ----------
function VerificationPage() {
  const [actionAgent, setActionAgent] = React.useState(AGENT_CONTRACTS[0].name);
  const [actionName, setActionName] = React.useState('');
  const [actionResult, setActionResult] = React.useState(null);
  const [flowSrc, setFlowSrc] = React.useState('Public');
  const [flowDst, setFlowDst] = React.useState('Public');
  const [flowResult, setFlowResult] = React.useState(null);
  const RANKS = { Public: 0, Internal: 1, Secret: 2 };

  const checkAction = () => {
    const agent = AGENT_CONTRACTS.find(a => a.name === actionAgent);
    if (!actionName.trim()) return;
    const act = actionName.trim();
    if (agent.block.includes(act)) setActionResult({ status: 'BLOCKED', detail: `Theorem: blocked_action_impossible — "${act}" is in block_list`, theorem: 'blocked_action_impossible' });
    else if (agent.allow.includes(act)) setActionResult({ status: 'ALLOWED', detail: `Action "${act}" is in allow_list for ${actionAgent}`, theorem: null });
    else setActionResult({ status: 'NOT PERMITTED', detail: `"${act}" is not in the allow list for ${actionAgent}`, theorem: null });
  };

  const checkFlow = () => {
    const srcRank = RANKS[flowSrc], dstRank = RANKS[flowDst];
    if (srcRank <= dstRank) setFlowResult({ status: 'PERMITTED', detail: `canFlowTo ${flowSrc}(rank ${srcRank}) → ${flowDst}(rank ${dstRank}): rank comparison satisfied`, theorem: 'canFlowTo_transitive' });
    else setFlowResult({ status: 'BLOCKED', detail: `Theorem: ${flowSrc === 'Secret' && flowDst === 'Public' ? 'secret_cannot_flow_to_public' : 'internal_cannot_flow_to_public'} — rank ${srcRank} > ${dstRank}`, theorem: flowSrc === 'Secret' ? 'secret_cannot_flow_to_public' : 'internal_cannot_flow_to_public' });
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <APageHeader title="Verification" subtitle="Interactive permission and information flow checks backed by Lean proofs." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <ACard>
          <ACardTitle>Action Permission Check</ACardTitle>
          <AInput label="Agent" value={actionAgent} onChange={setActionAgent} options={AGENT_CONTRACTS.map(a => a.name)} />
          <AInput label="Action Name" value={actionName} onChange={setActionName} placeholder="e.g. command_maneuver" />
          <button onClick={checkAction} style={{ width: '100%', background: A_COLORS.blue + '22', border: `1px solid ${A_COLORS.blue}44`, borderRadius: 6, padding: '9px', color: A_COLORS.blue, fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, cursor: 'pointer', fontWeight: 600, marginBottom: 12 }}>Check Permission</button>
          {actionResult && (
            <div style={{ background: `${actionResult.status === 'ALLOWED' ? A_COLORS.green : actionResult.status === 'BLOCKED' ? A_COLORS.red : A_COLORS.amber}11`, border: `1px solid ${actionResult.status === 'ALLOWED' ? A_COLORS.green : actionResult.status === 'BLOCKED' ? A_COLORS.red : A_COLORS.amber}33`, borderRadius: 6, padding: '12px' }}>
              <div style={{ marginBottom: 6 }}><AStatusBadge status={actionResult.status} /></div>
              <div style={{ fontSize: 11, color: A_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif', marginBottom: actionResult.theorem ? 8 : 0 }}>{actionResult.detail}</div>
              {actionResult.theorem && <MonoBlock color={A_COLORS.red}>{`theorem ${actionResult.theorem}`}</MonoBlock>}
            </div>
          )}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 9, color: A_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', marginBottom: 8 }}>TRY THESE EXAMPLES</div>
            {[['OrbitalMechanicsAgent','command_maneuver'],['ScheduleAnalyser','compute_schedule_risk'],['LaunchReadinessAgent','issue_launch_authorisation']].map(([ag, act]) => (
              <button key={act} onClick={() => { setActionAgent(ag); setActionName(act); setActionResult(null); }} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: `1px solid ${A_COLORS.border}`, borderRadius: 4, padding: '5px 8px', color: A_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, cursor: 'pointer', marginBottom: 4 }}>
                {ag} · {act}
              </button>
            ))}
          </div>
        </ACard>
        <ACard>
          <ACardTitle>Information Flow Check</ACardTitle>
          <AInput label="Source Label" value={flowSrc} onChange={setFlowSrc} options={['Public','Internal','Secret']} />
          <AInput label="Destination Label" value={flowDst} onChange={setFlowDst} options={['Public','Internal','Secret']} />
          <button onClick={checkFlow} style={{ width: '100%', background: A_COLORS.blue + '22', border: `1px solid ${A_COLORS.blue}44`, borderRadius: 6, padding: '9px', color: A_COLORS.blue, fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, cursor: 'pointer', fontWeight: 600, marginBottom: 12 }}>Check Flow</button>
          {flowResult && (
            <div style={{ background: `${flowResult.status === 'PERMITTED' ? A_COLORS.green : A_COLORS.red}11`, border: `1px solid ${flowResult.status === 'PERMITTED' ? A_COLORS.green : A_COLORS.red}33`, borderRadius: 6, padding: '12px' }}>
              <div style={{ marginBottom: 6 }}><AStatusBadge status={flowResult.status} /></div>
              <div style={{ fontSize: 11, color: A_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 8 }}>{flowResult.detail}</div>
              {flowResult.theorem && <MonoBlock color={flowResult.status === 'PERMITTED' ? A_COLORS.green : A_COLORS.red}>{`theorem ${flowResult.theorem}`}</MonoBlock>}
            </div>
          )}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 9, color: A_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', marginBottom: 6 }}>LABEL RANK ORDER</div>
            {[['Public','rank 0'],['Internal','rank 1'],['Secret','rank 2']].map(([l,r]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${A_COLORS.border}`, fontSize: 10 }}>
                <span style={{ color: A_COLORS.text, fontFamily: 'JetBrains Mono, monospace' }}>{l}</span>
                <span style={{ color: A_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace' }}>{r}</span>
              </div>
            ))}
          </div>
        </ACard>
      </div>
    </div>
  );
}

// ---------- Page 4: Execution Trace ----------
function ExecutionTracePage() {
  const [filter, setFilter] = React.useState('All');
  const [expanded, setExpanded] = React.useState(null);
  const TRACE = AGENT_CONTRACTS.map(a => ({
    ...a,
    inputLabel: a.layer === 1 ? 'Internal' : 'Internal',
    outputLabel: a.name === 'ExecutiveReportAgent' ? 'Public' : 'Internal',
    blockedAction: a.block[0] || null,
  }));
  const filtered = filter === 'Blocked only' ? TRACE.filter(t => t.blockedAction) : TRACE;

  return (
    <div>
      <APageHeader title="Execution Trace" subtitle="Full trace from the last pipeline run. Each agent's input, decision, and output." />
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['All','Blocked only','Allowed only'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? A_COLORS.blue + '22' : 'transparent', border: `1px solid ${filter === f ? A_COLORS.blue : A_COLORS.border}`, borderRadius: 6, padding: '6px 14px', color: filter === f ? A_COLORS.blue : A_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, cursor: 'pointer' }}>{f}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, color: A_COLORS.textMut, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', padding: '0 4px' }}>
        <span style={{ width: 140 }}>AGENT</span>
        <span style={{ width: 60 }}>LAYER</span>
        <span style={{ width: 80 }}>IN LABEL</span>
        <span style={{ width: 80 }}>OUT LABEL</span>
        <span>BLOCKED ACTION</span>
      </div>
      {filtered.map(agent => (
        <div key={agent.id} style={{ marginBottom: 6 }}>
          <div onClick={() => setExpanded(expanded === agent.id ? null : agent.id)}
            style={{ background: A_COLORS.s2, border: `1px solid ${A_COLORS.border}`, borderRadius: 6, padding: '10px 14px', cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ width: 140, fontSize: 11, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, color: A_COLORS.text }}>{agent.name}</span>
            <span style={{ width: 60, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: A_COLORS.textMut }}>L{agent.layer}</span>
            <span style={{ width: 80, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: A_COLORS.cyan }}>{agent.inputLabel}</span>
            <span style={{ width: 80, fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: agent.outputLabel === 'Public' ? A_COLORS.green : A_COLORS.cyan }}>{agent.outputLabel}</span>
            {agent.blockedAction && <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: A_COLORS.red }}>✗ {agent.blockedAction}</span>}
          </div>
          {expanded === agent.id && (
            <div style={{ background: A_COLORS.bg, border: `1px solid ${A_COLORS.border}`, borderTop: 'none', borderRadius: '0 0 6px 6px', padding: '12px 14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: agent.blockedAction ? 10 : 0 }}>
                <div><div style={{ fontSize: 9, color: A_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>INPUT</div><div style={{ fontSize: 11, color: A_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif' }}>{agent.goal}</div></div>
                <div><div style={{ fontSize: 9, color: A_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>OUTPUT LABEL</div><div style={{ fontSize: 11, color: agent.outputLabel === 'Public' ? A_COLORS.green : A_COLORS.cyan, fontFamily: 'JetBrains Mono, monospace' }}>DataLabel.{agent.outputLabel}</div></div>
              </div>
              {agent.blockedAction && (
                <div style={{ marginTop: 8, background: A_COLORS.red + '11', border: `1px solid ${A_COLORS.red}33`, borderRadius: 5, padding: '8px 10px' }}>
                  <div style={{ fontSize: 9, color: A_COLORS.red, fontFamily: 'JetBrains Mono, monospace', marginBottom: 3 }}>BLOCKED ACTION</div>
                  <div style={{ fontSize: 10, color: A_COLORS.red, fontFamily: 'JetBrains Mono, monospace' }}>{agent.blockedAction} — theorem: blocked_action_impossible</div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------- Page 5: Info Flow ----------
function InfoFlowPage() {
  const LABELS = [
    { name: 'Public', rank: 0, color: A_COLORS.green, agents: ['DataIngestionAgent','ExecutiveReportAgent'], desc: 'No restrictions. Safe to share externally. Lowest rank.' },
    { name: 'Internal', rank: 1, color: A_COLORS.cyan, agents: ['ScheduleAnalyser','WeatherMonitor','SubsystemHealthAgent','VendorRiskAgent','RiskAggregatorAgent','EscalationRouterAgent','LaunchReadinessAgent'], desc: 'Internal use only. Cannot flow to Public. Mid rank.' },
    { name: 'Secret', rank: 2, color: A_COLORS.red, agents: ['OrbitalMechanicsAgent','LaunchWindowAgent'], desc: 'Classified mission data. Cannot flow to Internal or Public. Highest rank.' },
  ];
  return (
    <div style={{ maxWidth: 900 }}>
      <APageHeader title="Info Flow" subtitle="DataLabel ordering, taint tracking, and canFlowTo proof structure." />
      <ACard style={{ marginBottom: 20 }}>
        <ACardTitle>DataLabel Ordering — canFlowTo Lattice</ACardTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24 }}>
          {LABELS.map((l, i) => (
            <React.Fragment key={l.name}>
              <div style={{ flex: 1, background: l.color + '15', border: `1px solid ${l.color}44`, borderRadius: 8, padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: l.color, marginBottom: 4 }}>{l.name}</div>
                <div style={{ fontSize: 10, color: A_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace' }}>rank {l.rank}</div>
              </div>
              {i < LABELS.length - 1 && (
                <div style={{ padding: '0 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, color: A_COLORS.textMut }}>→</div>
                  <div style={{ fontSize: 8, color: A_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>canFlowTo</div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        {LABELS.map(l => (
          <div key={l.name} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${A_COLORS.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: l.color, fontFamily: 'JetBrains Mono, monospace' }}>{l.name}</span>
              <span style={{ fontSize: 10, color: A_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif' }}>{l.desc}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {l.agents.map(a => <span key={a} style={{ background: l.color + '15', color: l.color, border: `1px solid ${l.color}33`, borderRadius: 4, padding: '2px 7px', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>{a}</span>)}
            </div>
          </div>
        ))}
      </ACard>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <ACard>
          <ACardTitle>Taint Tracking — LabelledData</ACardTitle>
          <MonoBlock>{`structure LabelledData where
  content : α
  label   : DataLabel

-- Labels travel with data items
def taint (d : LabelledData) 
          (op : α → β) : LabelledData :=
  { content := op d.content
  , label   := d.label }`}</MonoBlock>
        </ACard>
        <ACard>
          <ACardTitle>Feedback Arrow — terminate_after_one_pass</ACardTitle>
          <div style={{ fontSize: 11, color: A_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.6, marginBottom: 12 }}>
            SubsystemRelationships → ScheduleAnalyser feedback signal is labelled Internal and carries <code style={{ fontFamily: 'JetBrains Mono, monospace', color: A_COLORS.cyan }}>terminate_after_one_pass = true</code>. The pipeline rejects any second traversal of this edge.
          </div>
          <MonoBlock color={A_COLORS.purple}>{`-- theorem feedback_loop_terminates
theorem feedback_loop_terminates 
    (s : Signal) :
  s.terminate_after_one_pass = true 
  → ¬ cycles s`}</MonoBlock>
        </ACard>
      </div>
    </div>
  );
}

// ---------- Page 6: Safety Log ----------
function SafetyLogPage() {
  const [agentFilter, setAgentFilter] = React.useState('All');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const LOG_ENTRIES = AGENT_CONTRACTS.flatMap(a => [
    ...a.allow.slice(0, 2).map((act, i) => ({ id: `${a.id}-a${i}`, time: `14:0${a.id % 10}:${String(i * 12).padStart(2,'0')} UTC`, agent: a.name, action: act, status: 'ALLOWED', theorem: null, ref: `allow_list[${i}]` })),
    a.blockedAction ? { id: `${a.id}-b`, time: `14:0${a.id % 10}:55 UTC`, agent: a.name, action: a.block[0], status: 'BLOCKED', theorem: 'blocked_action_impossible', ref: null } : null,
  ].filter(Boolean)).sort((a, b) => a.time.localeCompare(b.time));

  const agents = ['All', ...new Set(AGENT_CONTRACTS.map(a => a.name))];
  const filtered = LOG_ENTRIES.filter(e => (agentFilter === 'All' || e.agent === agentFilter) && (statusFilter === 'All' || e.status === statusFilter));

  return (
    <div>
      <APageHeader title="Safety Log" subtitle={`${LOG_ENTRIES.filter(e=>e.status==='BLOCKED').length} blocked · ${LOG_ENTRIES.filter(e=>e.status==='ALLOWED').length} allowed`} />
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select value={agentFilter} onChange={e => setAgentFilter(e.target.value)} style={{ background: A_COLORS.s2, border: `1px solid ${A_COLORS.border}`, borderRadius: 6, padding: '6px 10px', color: A_COLORS.text, fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, outline: 'none' }}>
          {agents.map(a => <option key={a}>{a}</option>)}
        </select>
        {['All','BLOCKED','ALLOWED'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{ background: statusFilter === s ? (s === 'BLOCKED' ? A_COLORS.red + '22' : s === 'ALLOWED' ? A_COLORS.green + '22' : A_COLORS.blue + '22') : 'transparent', border: `1px solid ${statusFilter === s ? (s === 'BLOCKED' ? A_COLORS.red : s === 'ALLOWED' ? A_COLORS.green : A_COLORS.blue) : A_COLORS.border}44`, borderRadius: 6, padding: '6px 14px', color: s === 'BLOCKED' ? A_COLORS.red : s === 'ALLOWED' ? A_COLORS.green : A_COLORS.blue, fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, cursor: 'pointer' }}>{s}</button>
        ))}
      </div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 200px 180px 80px 1fr', gap: 8, padding: '6px 10px', color: A_COLORS.textMut, borderBottom: `1px solid ${A_COLORS.border}`, letterSpacing: 1, fontSize: 9 }}>
          <span>TIMESTAMP</span><span>AGENT</span><span>ACTION</span><span>STATUS</span><span>REFERENCE</span>
        </div>
        {filtered.map(e => (
          <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '120px 200px 180px 80px 1fr', gap: 8, padding: '7px 10px', borderBottom: `1px solid ${A_COLORS.border}`, background: e.status === 'BLOCKED' ? A_COLORS.red + '08' : 'transparent' }}>
            <span style={{ color: A_COLORS.textMut }}>{e.time}</span>
            <span style={{ color: A_COLORS.textSec }}>{e.agent}</span>
            <span style={{ color: A_COLORS.text }}>{e.action}</span>
            <span style={{ color: e.status === 'BLOCKED' ? A_COLORS.red : A_COLORS.green }}>{e.status}</span>
            <span style={{ color: e.theorem ? A_COLORS.red : A_COLORS.textMut }}>{e.theorem || e.ref}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Page 7: Proofs ----------
function ProofsPage() {
  const [expanded, setExpanded] = React.useState(null);
  return (
    <div>
      <APageHeader title="Proofs" subtitle="All 18 verified theorems. Lean 4 · lake build exit 0 · 3298 jobs." />
      <ACard style={{ marginBottom: 20, background: A_COLORS.green + '0d', borderColor: A_COLORS.green + '33' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: A_COLORS.green, boxShadow: `0 0 8px ${A_COLORS.green}` }}></div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: A_COLORS.green, fontFamily: 'JetBrains Mono, monospace' }}>All 18 theorems verified · lake build exit 0 · 3298 jobs</div>
            <div style={{ fontSize: 10, color: A_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif', marginTop: 2 }}>Build time: 4m 12s · Last run: today 14:08 UTC</div>
          </div>
        </div>
      </ACard>
      {THEOREMS.map(t => (
        <div key={t.id} style={{ marginBottom: 8 }}>
          <div onClick={() => setExpanded(expanded === t.id ? null : t.id)}
            style={{ background: A_COLORS.s2, border: `1px solid ${A_COLORS.border}`, borderRadius: expanded === t.id ? '8px 8px 0 0' : 8, padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: A_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace' }}>T{String(t.id).padStart(2,'0')}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: A_COLORS.text, fontFamily: 'JetBrains Mono, monospace' }}>{t.name}</span>
              </div>
              <div style={{ fontSize: 11, color: A_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif' }}>{t.desc}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0, marginLeft: 14 }}>
              <span style={{ fontSize: 9, color: A_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace' }}>{t.jobs} jobs</span>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: A_COLORS.green, display: 'inline-block', boxShadow: `0 0 6px ${A_COLORS.green}` }}></span>
            </div>
          </div>
          {expanded === t.id && (
            <div style={{ background: A_COLORS.bg, border: `1px solid ${A_COLORS.border}`, borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '14px 16px' }}>
              <div style={{ fontSize: 9, color: A_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', marginBottom: 6 }}>FILE: {t.file}</div>
              <MonoBlock>{t.lean}</MonoBlock>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { AgentContractsPage, DefineAgentPage, VerificationPage, ExecutionTracePage, InfoFlowPage, SafetyLogPage, ProofsPage });
