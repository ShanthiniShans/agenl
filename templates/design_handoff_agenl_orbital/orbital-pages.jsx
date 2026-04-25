
// ORBITAL — All 8 Page Components

const AGENTS_TEMPLATE = (d) => [
  { id: 1, name: 'DataIngestionAgent', layer: 1, input: `Mission: ${d.missionName}, Orbit: ${d.orbit}`, decision: 'All required fields present. Data validated.', output: 'Structured mission payload — Internal', blockedAction: null },
  { id: 2, name: 'ScheduleAnalyser', layer: 1, input: 'Mission payload + milestone health scores', decision: `Avg milestone health ${Math.round((d.milestones.reduce((a,b)=>a+b.value,0)/5))}%. ${d.milestones.filter(m=>m.value<60).length} milestones below threshold.`, output: `Schedule risk: ${d.milestones.filter(m=>m.value<60).length > 2 ? 'HIGH' : 'MEDIUM'}. Delay probability flagged.`, blockedAction: null },
  { id: 3, name: 'WeatherMonitor', layer: 1, input: `Weather probability: ${d.weatherProb}%`, decision: d.weatherProb > 60 ? 'Weather exceeds acceptable threshold. Flag for launch window.' : 'Weather within acceptable parameters.', output: d.weatherProb > 60 ? 'WEATHER RISK — escalate to LaunchWindowAgent' : 'Weather: nominal', blockedAction: null },
  { id: 4, name: 'OrbitalMechanicsAgent', layer: 1, input: `Conjunction events: ${d.conjunctions}, Closest approach: ${d.closestApproach}km`, decision: d.conjunctions > 3 ? 'Multiple conjunction events detected. Risk elevated.' : 'Conjunction profile within bounds.', output: `Collision probability: ${d.conjunctions > 3 ? 'ELEVATED' : 'LOW'}. Approach margin: ${d.closestApproach}km`, blockedAction: null },
  { id: 5, name: 'SubsystemHealthAgent', layer: 2, input: 'Subsystem health readings from mission payload', decision: `${d.subsystems.filter(s=>s.value<60).length} subsystems below 60%. Critical path analysis initiated.`, output: `Health matrix computed. ${d.subsystems.filter(s=>s.value<40).map(s=>s.name).join(', ') || 'No'} critical failures.`, blockedAction: null },
  { id: 6, name: 'SubsystemRelationships', layer: 2, input: 'Health matrix from SubsystemHealthAgent', decision: d.subsystems.find(s=>s.name==='Thermal')?.value < 60 ? 'Thermal degradation detected. Power distribution cascade identified.' : 'No critical cascades detected.', output: 'Feedback signal sent to ScheduleAnalyser (runs once). Cascade map produced.', blockedAction: null },
  { id: 7, name: 'VendorRiskAgent', layer: 2, input: `Vendor delay: ${d.vendorDelay} days`, decision: d.vendorDelay > 5 ? `${d.vendorDelay}-day vendor slip exceeds tolerance. Dependencies at risk.` : 'Vendor delay within tolerance.', output: d.vendorDelay > 5 ? `P${d.vendorDelay > 10 ? 1 : 2} vendor risk. Cascade to 3 dependencies.` : 'Vendor risk: nominal', blockedAction: null },
  { id: 8, name: 'LaunchWindowAgent', layer: 2, input: 'Weather, orbital clearance, subsystem status', decision: `Primary window ${d.weatherProb > 60 || d.subsystems.filter(s=>s.value<60).length > 2 ? 'at risk' : 'viable'}. Backup computed.`, output: 'Window analysis complete. GO/NO-GO inputs prepared.', blockedAction: null },
  { id: 9, name: 'RiskAggregatorAgent', layer: 3, input: 'All Layer 1 + 2 outputs', decision: 'Aggregating risk signals across all domains. Weighted risk score computed.', output: `Mission risk level: ${d.subsystems.filter(s=>s.value<60).length + d.milestones.filter(m=>m.value<60).length > 4 ? 'HIGH' : d.subsystems.filter(s=>s.value<60).length + d.milestones.filter(m=>m.value<60).length > 2 ? 'MEDIUM' : 'LOW'}`, blockedAction: null },
  { id: 10, name: 'EscalationRouterAgent', layer: 3, input: 'Aggregated risk signals', decision: `${d.milestones.filter(m=>m.value<40).length + (d.vendorDelay>5?1:0) + (d.conjunctions>3?1:0)} items require escalation routing.`, output: 'Escalations routed to Mission Director and Systems Engineer.', blockedAction: 'auto_approve_launch' },
  { id: 11, name: 'LaunchReadinessAgent', layer: 3, input: 'Full risk picture from all agents', decision: 'GO/NO-GO assessment based on all inputs. Human sign-off required for final authorisation.', output: 'Readiness package prepared. Awaiting human authorisation.', blockedAction: 'issue_launch_authorisation' },
  { id: 12, name: 'ExecutiveReportAgent', layer: 3, input: 'Complete mission risk picture', decision: 'Generating executive summary. Classifying as Public output.', output: 'Executive report generated — Public', blockedAction: null },
];

function MissionSetupPage({ data, setData, onRun }) {
  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      <OPageHeader title="Mission Setup" subtitle="Define mission parameters. All 12 agents will analyse the inputs when you run the pipeline." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left column */}
        <div>
          <OCard style={{ marginBottom: 16 }}>
            <OCardTitle>Mission Identity</OCardTitle>
            <OInput label="Mission Name" value={data.missionName} onChange={v => setData(p => ({...p, missionName: v}))} />
            <OInput label="Target Orbit" value={data.orbit} onChange={v => setData(p => ({...p, orbit: v}))}
              options={[
                {value:'LEO-400km', label:'LEO — 400 km'},{value:'LEO-550km', label:'LEO — 550 km'},
                {value:'MEO-8000km', label:'MEO — 8,000 km'},{value:'GEO-35786km', label:'GEO — 35,786 km'},
              ]} />
            <OInput label="Days to Launch" value={data.daysToLaunch} onChange={v => setData(p => ({...p, daysToLaunch: v}))} type="number" />
            <OInput label="Mission Phase" value={data.phase} onChange={v => setData(p => ({...p, phase: v}))}
              options={['Design','Integration','Test','Launch Prep']} />
          </OCard>
          <OCard>
            <OCardTitle>Orbital Parameters</OCardTitle>
            <OInput label="Conjunction Events in 24h" value={data.conjunctions} onChange={v => setData(p => ({...p, conjunctions: Number(v)}))} type="number" />
            <OInput label="Closest Approach (km)" value={data.closestApproach} onChange={v => setData(p => ({...p, closestApproach: Number(v)}))} type="number" />
            <OInput label="Vendor Delay (days)" value={data.vendorDelay} onChange={v => setData(p => ({...p, vendorDelay: Number(v)}))} type="number" />
            <OSlider label="Weather Probability (%)" value={data.weatherProb} onChange={v => setData(p => ({...p, weatherProb: v}))} />
          </OCard>
        </div>
        {/* Right column */}
        <div>
          <OCard style={{ marginBottom: 16 }}>
            <OCardTitle>Schedule Milestone Health</OCardTitle>
            {data.milestones.map((m, i) => (
              <OSlider key={m.name} label={m.name} value={m.value}
                onChange={v => setData(p => { const ms = [...p.milestones]; ms[i] = {...ms[i], value: v}; return {...p, milestones: ms}; })} />
            ))}
          </OCard>
          <OCard>
            <OCardTitle>Subsystem Health</OCardTitle>
            {data.subsystems.map((s, i) => (
              <OSlider key={s.name} label={s.name} value={s.value}
                onChange={v => setData(p => { const ss = [...p.subsystems]; ss[i] = {...ss[i], value: v}; return {...p, subsystems: ss}; })} />
            ))}
          </OCard>
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <button onClick={onRun} style={{
          width: '100%', padding: '16px', background: O_COLORS.blue,
          border: 'none', borderRadius: 8, color: '#fff',
          fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 15,
          letterSpacing: 1, cursor: 'pointer', textTransform: 'uppercase',
          boxShadow: `0 0 24px ${O_COLORS.blue}55`,
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => e.target.style.background = '#5aaaff'}
          onMouseLeave={e => e.target.style.background = O_COLORS.blue}
        >
          ▶ Run Analysis — Deploy 12 Agents
        </button>
      </div>
    </div>
  );
}

function LivePipelinePage({ agents, logLines }) {
  const complete = agents.filter(a => a.status === 'Complete' || a.status === 'Escalated').length;
  return (
    <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 100px)' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <OPageHeader title="Live Pipeline" subtitle={`${complete} / 12 agents completed`} />
        {/* Layer labels */}
        {[1,2,3].map(layer => {
          const layerAgents = agents.filter(a => a.layer === layer);
          const layerNames = ['Data Ingestion & Analysis', 'Cross-Domain Synthesis', 'Risk Integration & Output'];
          return (
            <div key={layer} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: O_COLORS.blue, fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
                ◈ Layer {layer} — {layerNames[layer-1]}
              </div>
              {layerAgents.map(a => <AgentPipelineCard key={a.id} agent={a} visible={true} />)}
            </div>
          );
        })}
        {/* Feedback arrow */}
        {agents[5]?.status === 'Complete' && (
          <div style={{ background: `${O_COLORS.purple}11`, border: `1px solid ${O_COLORS.purple}44`, borderRadius: 8, padding: '12px 16px', marginTop: 8 }}>
            <div style={{ fontSize: 10, color: O_COLORS.purple, fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>↺ FEEDBACK LOOP</div>
            <div style={{ fontSize: 12, color: O_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif' }}>
              SubsystemRelationships → ScheduleAnalyser — feedback signal transmitted. <strong style={{color: O_COLORS.purple}}>Runs once and terminates.</strong> Loop guard prevents recursive re-entry.
            </div>
          </div>
        )}
      </div>
      {/* Log panel */}
      <div style={{ width: 300, flexShrink: 0 }}>
        <OCard style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <OCardTitle>Live Agent Log</OCardTitle>
          <div style={{ flex: 1, overflowY: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}>
            {logLines.map((line, i) => (
              <div key={i} style={{ padding: '3px 0', borderBottom: `1px solid ${O_COLORS.border}`, color: line.color || O_COLORS.textSec, lineHeight: 1.5 }}>
                <span style={{ color: O_COLORS.textMut }}>{line.time} </span>{line.text}
              </div>
            ))}
          </div>
        </OCard>
      </div>
    </div>
  );
}

function ProgramSchedulePage({ data, agents }) {
  const getStatus = (v) => v >= 70 ? 'On Track' : v >= 40 ? 'At Risk' : 'Critical';
  const daysAhead = (v) => {
    const base = parseInt(data.daysToLaunch) || 90;
    return v >= 70 ? `T-${base} (nominal)` : v >= 40 ? `T-${base + Math.round((70-v)/3)} (slipping)` : `T-${base + Math.round((70-v)/2)} (critical)`;
  };
  const schedAgent = agents.find(a => a.name === 'ScheduleAnalyser');
  const vendorAgent = agents.find(a => a.name === 'VendorRiskAgent');
  return (
    <div>
      <OPageHeader title="Program Schedule" subtitle="Milestone tracking and delay risk signals from agent analysis" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <OCard style={{ marginBottom: 16 }}>
            <OCardTitle>Milestone Progress</OCardTitle>
            {data.milestones.map(m => (
              <div key={m.name} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${O_COLORS.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: O_COLORS.text, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 500 }}>{m.name}</span>
                  <OStatusBadge status={getStatus(m.value)} />
                </div>
                <div style={{ height: 6, background: O_COLORS.s3, borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                  <div style={{ width: `${m.value}%`, height: '100%', background: m.value >= 70 ? O_COLORS.green : m.value >= 40 ? O_COLORS.amber : O_COLORS.red, borderRadius: 3, transition: 'width 1s ease' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10, color: O_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace' }}>{m.value}% complete</span>
                  <span style={{ fontSize: 10, color: O_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace' }}>{daysAhead(m.value)}</span>
                </div>
              </div>
            ))}
          </OCard>
        </div>
        <div>
          <OCard style={{ marginBottom: 16 }}>
            <OCardTitle>Risk Signals Detected</OCardTitle>
            {data.milestones.filter(m => m.value < 70).map(m => (
              <div key={m.name} style={{ background: `${m.value < 40 ? O_COLORS.red : O_COLORS.amber}11`, border: `1px solid ${m.value < 40 ? O_COLORS.red : O_COLORS.amber}33`, borderRadius: 6, padding: '10px 12px', marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: m.value < 40 ? O_COLORS.red : O_COLORS.amber, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 2 }}>{m.name} — {m.value < 40 ? 'Critical Delay Risk' : 'Slip Risk Detected'}</div>
                <div style={{ fontSize: 10, color: O_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif' }}>Current completion: {m.value}%. Required: 70%+ for nominal. Flagged by ScheduleAnalyser.</div>
              </div>
            ))}
            {data.milestones.every(m => m.value >= 70) && <div style={{ color: O_COLORS.green, fontSize: 12, fontFamily: 'Space Grotesk, sans-serif' }}>✓ All milestones nominal</div>}
          </OCard>
          <OCard style={{ marginBottom: 16 }}>
            <OCardTitle>Vendor Risk & Cascade</OCardTitle>
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: O_COLORS.text, fontFamily: 'Space Grotesk, sans-serif' }}>Vendor Delay</span>
                <span style={{ fontSize: 12, color: data.vendorDelay > 5 ? O_COLORS.red : O_COLORS.green, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{data.vendorDelay} days</span>
              </div>
              {data.vendorDelay > 5 && (
                <>
                  <div style={{ fontSize: 10, color: O_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 8 }}>Cascade dependencies at risk:</div>
                  {['Avionics Test', 'Systems Integration', 'Launch Rehearsal'].map(dep => (
                    <div key={dep} style={{ fontSize: 10, color: O_COLORS.amber, fontFamily: 'JetBrains Mono, monospace', padding: '3px 0' }}>↳ {dep} — slip risk</div>
                  ))}
                </>
              )}
            </div>
          </OCard>
          <OCard>
            <OCardTitle>Agent Attribution</OCardTitle>
            <div style={{ fontSize: 10, color: O_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.6 }}>
              <div>• Milestone analysis — <span style={{ color: O_COLORS.blue }}>ScheduleAnalyser</span></div>
              <div>• Vendor risk — <span style={{ color: O_COLORS.blue }}>VendorRiskAgent</span></div>
              <div>• Cascade mapping — <span style={{ color: O_COLORS.blue }}>SubsystemRelationships</span></div>
              <div>• Risk aggregation — <span style={{ color: O_COLORS.blue }}>RiskAggregatorAgent</span></div>
            </div>
          </OCard>
        </div>
      </div>
    </div>
  );
}

function SubsystemsPage({ data }) {
  const thermalHealth = data.subsystems.find(s => s.name === 'Thermal')?.value || 80;
  const powerHealth = data.subsystems.find(s => s.name === 'Power')?.value || 80;
  const feedbackSignal = data.subsystems.find(s => s.name === 'Thermal')?.value < 60;
  const allSubs = [
    ...data.subsystems,
    { name: 'Structure', value: 88 },
    { name: 'Attitude Control', value: 74 },
    { name: 'Payload', value: 91 },
  ];
  const displaySubs = allSubs.slice(0, 8);
  return (
    <div>
      <OPageHeader title="Subsystems" subtitle="Health grid, failure cascade analysis, and relationship feedback" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {displaySubs.map(s => {
          const c = s.value >= 70 ? O_COLORS.green : s.value >= 40 ? O_COLORS.amber : O_COLORS.red;
          const label = s.value >= 70 ? 'Nominal' : s.value >= 40 ? 'Degraded' : 'Critical';
          return (
            <OCard key={s.name} style={{ borderLeft: `3px solid ${c}` }}>
              <div style={{ fontSize: 11, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, color: O_COLORS.text, marginBottom: 8 }}>{s.name}</div>
              <div style={{ fontSize: 24, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: c, marginBottom: 4 }}>{s.value}%</div>
              <OStatusBadge status={s.value >= 70 ? 'On Track' : s.value >= 40 ? 'At Risk' : 'Critical'} />
              <div style={{ marginTop: 8, height: 4, background: O_COLORS.s3, borderRadius: 2 }}>
                <div style={{ width: `${s.value}%`, height: '100%', background: c, borderRadius: 2 }}></div>
              </div>
              <div style={{ fontSize: 10, color: O_COLORS.textMut, fontFamily: 'Space Grotesk, sans-serif', marginTop: 6 }}>{label}</div>
            </OCard>
          );
        })}
      </div>
      {thermalHealth < 60 && (
        <OCard style={{ marginBottom: 16, borderLeft: `3px solid ${O_COLORS.red}` }}>
          <OCardTitle>Failure Cascade Analysis</OCardTitle>
          <div style={{ fontSize: 12, color: O_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 12 }}>Thermal degradation detected ({thermalHealth}%). Cascade path identified:</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {[
              { name: 'Thermal', health: thermalHealth, issue: 'Primary' },
              { name: '→', health: null },
              { name: 'Power Distribution', health: powerHealth, issue: 'At Risk' },
              { name: '→', health: null },
              { name: 'Avionics', health: data.subsystems.find(s=>s.name==='Avionics')?.value || 80, issue: 'Secondary risk' },
            ].map((n, i) => n.health === null ? (
              <span key={i} style={{ color: O_COLORS.red, fontSize: 18 }}>→</span>
            ) : (
              <div key={i} style={{ background: O_COLORS.s3, borderRadius: 6, padding: '8px 12px', border: `1px solid ${O_COLORS.red}33` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: O_COLORS.text, fontFamily: 'Space Grotesk, sans-serif' }}>{n.name}</div>
                <div style={{ fontSize: 10, color: O_COLORS.red, fontFamily: 'JetBrains Mono, monospace' }}>{n.health}% — {n.issue}</div>
              </div>
            ))}
          </div>
        </OCard>
      )}
      <OCard>
        <OCardTitle>SubsystemRelationships Feedback Signal</OCardTitle>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: O_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.6, marginBottom: 8 }}>
              The SubsystemRelationships agent analysed cross-system dependencies and {feedbackSignal ? 'detected a critical thermal cascade' : 'found no critical cascades'}.
            </div>
            {feedbackSignal ? (
              <div style={{ background: `${O_COLORS.purple}11`, border: `1px solid ${O_COLORS.purple}44`, borderRadius: 6, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: O_COLORS.purple, fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>↺ FEEDBACK SIGNAL SENT</div>
                <div style={{ fontSize: 11, color: O_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif' }}>Signal to ScheduleAnalyser: "Thermal cascade affects integration timeline." <strong style={{color: O_COLORS.purple}}>Ran once and stopped.</strong></div>
              </div>
            ) : (
              <div style={{ fontSize: 11, color: O_COLORS.green, fontFamily: 'Space Grotesk, sans-serif' }}>✓ No feedback signal required — all cascades within tolerance</div>
            )}
          </div>
        </div>
      </OCard>
    </div>
  );
}

function LaunchWindowPage({ data }) {
  const subsystemsOk = data.subsystems.filter(s => s.value >= 70).length >= 4;
  const weatherOk = data.weatherProb <= 60;
  const thermalOk = (data.subsystems.find(s => s.name === 'Thermal')?.value || 0) >= 70;
  const propOk = (data.subsystems.find(s => s.name === 'Propulsion')?.value || 0) >= 70;
  const conjOk = data.conjunctions <= 3;
  const checks = [
    { label: 'Weather', go: weatherOk, note: weatherOk ? `Probability ${data.weatherProb}% — within limits` : `Probability ${data.weatherProb}% — exceeds 60% threshold` },
    { label: 'Range Availability', go: true, note: 'Range confirmed clear — nominal' },
    { label: 'Thermal Qualification', go: thermalOk, note: thermalOk ? 'Qualification complete' : `Health ${data.subsystems.find(s=>s.name==='Thermal')?.value}% — below threshold` },
    { label: 'Propulsion Readiness', go: propOk, note: propOk ? 'Propulsion nominal' : `Health ${data.subsystems.find(s=>s.name==='Propulsion')?.value}% — not ready` },
    { label: 'Orbital Clearance', go: conjOk, note: conjOk ? `${data.conjunctions} conjunction events — acceptable` : `${data.conjunctions} events — clearance at risk` },
  ];
  const goCount = checks.filter(c => c.go).length;
  const readiness = Math.round((goCount / checks.length) * 100);
  const t = parseInt(data.daysToLaunch) || 90;
  return (
    <div style={{ maxWidth: 880 }}>
      <OPageHeader title="Launch Window" subtitle="Readiness assessment and GO/NO-GO checklist" />
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20 }}>
        <div>
          <OCard style={{ textAlign: 'center', marginBottom: 16 }}>
            <CircularGauge value={readiness} size={180} />
            <div style={{ marginTop: 12, fontSize: 11, color: O_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif' }}>{goCount}/{checks.length} criteria met</div>
          </OCard>
          <OCard>
            <OCardTitle>Launch Windows</OCardTitle>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: O_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', marginBottom: 3 }}>PRIMARY</div>
              <div style={{ fontSize: 12, color: O_COLORS.text, fontFamily: 'Space Grotesk, sans-serif' }}>T+{t}d · 04:22 UTC</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: O_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', marginBottom: 3 }}>BACKUP</div>
              <div style={{ fontSize: 12, color: O_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif' }}>T+{t+2}d · 04:38 UTC</div>
            </div>
          </OCard>
        </div>
        <div>
          <OCard style={{ marginBottom: 16 }}>
            <OCardTitle>GO / NO-GO Checklist</OCardTitle>
            {checks.map(c => (
              <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: `1px solid ${O_COLORS.border}` }}>
                <div style={{ width: 64, flexShrink: 0 }}><OStatusBadge status={c.go ? 'GO' : 'NO-GO'} /></div>
                <div>
                  <div style={{ fontSize: 12, color: O_COLORS.text, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 500 }}>{c.label}</div>
                  <div style={{ fontSize: 10, color: O_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif' }}>{c.note}</div>
                </div>
              </div>
            ))}
          </OCard>
          <OSystemNote>
            Launch authorisation is NOT possible through this system. ORBITAL provides the risk picture and readiness assessment only. Final launch authorisation requires human sign-off from the Mission Director. No agent in this system can issue a launch command.
          </OSystemNote>
        </div>
      </div>
    </div>
  );
}

function OrbitalRiskPage({ data }) {
  const riskLevel = data.conjunctions > 5 ? 'HIGH' : data.conjunctions > 2 ? 'MEDIUM' : 'LOW';
  const collisionProb = data.conjunctions > 5 ? '1.2×10⁻⁴' : data.conjunctions > 2 ? '3.8×10⁻⁵' : '7.1×10⁻⁶';
  return (
    <div style={{ maxWidth: 880 }}>
      <OPageHeader title="Orbital Risk" subtitle="Conjunction analysis, space weather, and maneuver recommendations" badge={riskLevel} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <OCard>
          <OCardTitle>Conjunction Event Summary</OCardTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Events in 24h', value: data.conjunctions, highlight: data.conjunctions > 3 },
              { label: 'Closest Approach', value: `${data.closestApproach} km`, highlight: data.closestApproach < 5 },
              { label: 'Collision Probability', value: collisionProb, highlight: data.conjunctions > 3 },
              { label: 'Risk Level', value: riskLevel, highlight: riskLevel !== 'LOW' },
            ].map(item => (
              <div key={item.label} style={{ background: O_COLORS.s3, borderRadius: 6, padding: '12px' }}>
                <div style={{ fontSize: 9, color: O_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 16, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: item.highlight ? O_COLORS.amber : O_COLORS.text }}>{item.value}</div>
              </div>
            ))}
          </div>
        </OCard>
        <OCard>
          <OCardTitle>Orbital Parameters</OCardTitle>
          {[
            { label: 'Target Orbit', value: data.orbit },
            { label: 'Inclination', value: '51.6°' },
            { label: 'Eccentricity', value: '0.0002' },
            { label: 'Space Weather', value: 'Kp index: 3 — Minor' },
            { label: 'Solar Flux (F10.7)', value: '148 sfu' },
          ].map(p => (
            <div key={p.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${O_COLORS.border}` }}>
              <span style={{ fontSize: 11, color: O_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif' }}>{p.label}</span>
              <span style={{ fontSize: 11, color: O_COLORS.text, fontFamily: 'JetBrains Mono, monospace' }}>{p.value}</span>
            </div>
          ))}
        </OCard>
      </div>
      <OCard style={{ marginBottom: 16 }}>
        <OCardTitle>Maneuver Recommendations</OCardTitle>
        {data.conjunctions > 2 ? (
          <>
            {[
              { action: 'Conjunction avoidance burn', delta_v: '0.3 m/s', timing: 'T-24h before closest approach', priority: 'Recommended' },
              { action: 'Orbit raising — +2km', delta_v: '1.1 m/s', timing: 'If conjunction probability > 1×10⁻⁴', priority: 'Contingency' },
            ].map(r => (
              <div key={r.action} style={{ background: O_COLORS.s3, borderRadius: 6, padding: '12px', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: O_COLORS.text, fontFamily: 'Space Grotesk, sans-serif' }}>{r.action}</span>
                  <OStatusBadge status={r.priority === 'Recommended' ? 'At Risk' : 'Queued'} />
                </div>
                <div style={{ fontSize: 10, color: O_COLORS.textSec, fontFamily: 'JetBrains Mono, monospace' }}>Δv: {r.delta_v} · {r.timing}</div>
              </div>
            ))}
          </>
        ) : (
          <div style={{ color: O_COLORS.green, fontSize: 12, fontFamily: 'Space Grotesk, sans-serif' }}>✓ No maneuvers required — conjunction profile nominal</div>
        )}
        <OSystemNote>
          Maneuver recommendations are flagged by OrbitalMechanicsAgent for human review. Execution authorisation is human-only. This system cannot command spacecraft operations.
        </OSystemNote>
      </OCard>
    </div>
  );
}

function EscalationsPage({ data, agents }) {
  const escItems = [
    data.milestones.some(m => m.value < 40) && { id: 1, priority: 'P1', desc: 'Critical milestone below threshold — schedule slip imminent', agent: 'ScheduleAnalyser', routed: 'Mission Director', time: '14:02 UTC', status: 'Open' },
    data.vendorDelay > 10 && { id: 2, priority: 'P1', desc: `Vendor delay ${data.vendorDelay} days — cascade risk to 3 dependencies`, agent: 'VendorRiskAgent', routed: 'Program Manager', time: '14:03 UTC', status: 'Open' },
    data.conjunctions > 5 && { id: 3, priority: 'P1', desc: 'High conjunction count — collision probability elevated', agent: 'OrbitalMechanicsAgent', routed: 'Flight Dynamics', time: '14:04 UTC', status: 'Open' },
    data.weatherProb > 70 && { id: 4, priority: 'P2', desc: `Weather probability ${data.weatherProb}% — launch window at risk`, agent: 'WeatherMonitor', routed: 'Launch Director', time: '14:05 UTC', status: 'Open' },
    data.subsystems.some(s => s.value < 40) && { id: 5, priority: 'P2', desc: `Subsystem critical: ${data.subsystems.filter(s=>s.value<40).map(s=>s.name).join(', ')}`, agent: 'SubsystemHealthAgent', routed: 'Systems Engineer', time: '14:06 UTC', status: 'Open' },
  ].filter(Boolean);
  const resolved = [
    { id: 99, priority: 'P2', desc: 'Communications latency exceeded threshold — resolved by system reconfig', agent: 'SubsystemHealthAgent', routed: 'Comms Lead', time: '13:41 UTC', status: 'Resolved' },
  ];
  return (
    <div style={{ maxWidth: 880 }}>
      <OPageHeader title="Escalations" subtitle={`${escItems.length} open · ${resolved.length} resolved`} />
      <OSystemNote>All approve actions require human confirmation. Escalations are routed for human review — no agent in this system can resolve, approve, or close an escalation autonomously.</OSystemNote>
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 11, color: O_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', marginBottom: 10, letterSpacing: 1 }}>OPEN ESCALATIONS</div>
        {escItems.length === 0 && <div style={{ color: O_COLORS.green, fontSize: 13, fontFamily: 'Space Grotesk, sans-serif', padding: '16px 0' }}>✓ No open escalations</div>}
        {escItems.map(e => (
          <OCard key={e.id} style={{ marginBottom: 10, borderLeft: `3px solid ${e.priority === 'P1' ? O_COLORS.red : O_COLORS.amber}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <OStatusBadge status={e.priority} />
                <OStatusBadge status={e.status} />
              </div>
              <span style={{ fontSize: 10, color: O_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace' }}>{e.time}</span>
            </div>
            <div style={{ fontSize: 13, color: O_COLORS.text, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 500, marginBottom: 6 }}>{e.desc}</div>
            <div style={{ display: 'flex', gap: 16 }}>
              <span style={{ fontSize: 10, color: O_COLORS.textMut, fontFamily: 'Space Grotesk, sans-serif' }}>Raised by: <span style={{ color: O_COLORS.blue }}>{e.agent}</span></span>
              <span style={{ fontSize: 10, color: O_COLORS.textMut, fontFamily: 'Space Grotesk, sans-serif' }}>Routed to: <span style={{ color: O_COLORS.textSec }}>{e.routed}</span></span>
            </div>
          </OCard>
        ))}
        <div style={{ fontSize: 11, color: O_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', margin: '20px 0 10px', letterSpacing: 1 }}>RESOLVED</div>
        {resolved.map(e => (
          <OCard key={e.id} style={{ marginBottom: 10, opacity: 0.6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}><OStatusBadge status={e.priority} /><OStatusBadge status="Resolved" /></div>
              <span style={{ fontSize: 10, color: O_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace' }}>{e.time}</span>
            </div>
            <div style={{ fontSize: 12, color: O_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif' }}>{e.desc}</div>
          </OCard>
        ))}
      </div>
    </div>
  );
}

function ExecutiveReportPage({ data, agents }) {
  const riskLevel = (() => {
    const score = data.subsystems.filter(s=>s.value<60).length + data.milestones.filter(m=>m.value<60).length + (data.conjunctions > 3 ? 2 : 0) + (data.vendorDelay > 5 ? 1 : 0);
    return score > 5 ? 'HIGH' : score > 2 ? 'MEDIUM' : 'LOW';
  })();
  const today = new Date().toLocaleDateString('en-GB', {day:'2-digit', month:'long', year:'numeric'});
  const critSubs = data.subsystems.filter(s => s.value < 60).map(s => s.name);
  const critMilestones = data.milestones.filter(m => m.value < 60).map(m => m.name);
  return (
    <div style={{ maxWidth: 780 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <OPageHeader title="Executive Report" subtitle="Auto-generated by ExecutiveReportAgent · Public output" badge={riskLevel} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ fontSize: 10, color: O_COLORS.green, fontFamily: 'JetBrains Mono, monospace', background: `${O_COLORS.green}11`, border: `1px solid ${O_COLORS.green}33`, borderRadius: 4, padding: '4px 8px' }}>PUBLIC</div>
          <button style={{ background: O_COLORS.blue, border: 'none', borderRadius: 6, padding: '8px 16px', color: '#fff', fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>↓ Download PDF</button>
        </div>
      </div>
      <OCard>
        <div style={{ borderBottom: `1px solid ${O_COLORS.border}`, paddingBottom: 16, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div><div style={{ fontSize: 9, color: O_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', marginBottom: 3 }}>MISSION</div><div style={{ fontSize: 13, color: O_COLORS.text, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>{data.missionName}</div></div>
            <div><div style={{ fontSize: 9, color: O_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', marginBottom: 3 }}>DATE</div><div style={{ fontSize: 13, color: O_COLORS.text, fontFamily: 'Space Grotesk, sans-serif' }}>{today}</div></div>
            <div><div style={{ fontSize: 9, color: O_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', marginBottom: 3 }}>RISK LEVEL</div><OStatusBadge status={riskLevel} /></div>
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: O_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', marginBottom: 8, letterSpacing: 1 }}>MISSION STATUS</div>
          <p style={{ margin: 0, fontSize: 13, color: O_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.7 }}>
            Mission {data.missionName} is currently in the <strong style={{color: O_COLORS.text}}>{data.phase}</strong> phase with <strong style={{color: O_COLORS.text}}>{data.daysToLaunch} days</strong> to launch targeting <strong style={{color: O_COLORS.text}}>{data.orbit}</strong>. Pipeline analysis by 12 verified AI agents has identified an overall mission risk level of <strong style={{color: riskLevel === 'HIGH' ? O_COLORS.red : riskLevel === 'MEDIUM' ? O_COLORS.amber : O_COLORS.green}}>{riskLevel}</strong>. {critSubs.length > 0 ? `Critical subsystem concerns exist in ${critSubs.join(', ')}.` : 'All subsystems are reporting within acceptable parameters.'} {critMilestones.length > 0 ? `Schedule milestones requiring attention: ${critMilestones.join(', ')}.` : 'All schedule milestones are on track.'}
          </p>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: O_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', marginBottom: 8, letterSpacing: 1 }}>KEY RISKS</div>
          {[
            critSubs.length > 0 && `Subsystem degradation: ${critSubs.join(', ')} — health below 60%`,
            critMilestones.length > 0 && `Schedule slippage risk: ${critMilestones.join(', ')}`,
            data.vendorDelay > 5 && `Vendor delay of ${data.vendorDelay} days — dependency cascade identified`,
            data.conjunctions > 3 && `${data.conjunctions} conjunction events in 24h — orbital clearance at risk`,
            data.weatherProb > 60 && `Weather probability ${data.weatherProb}% — launch window viability reduced`,
          ].filter(Boolean).map((risk, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: `1px solid ${O_COLORS.border}` }}>
              <span style={{ color: O_COLORS.red, fontSize: 10, marginTop: 2 }}>▲</span>
              <span style={{ fontSize: 12, color: O_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif' }}>{risk}</span>
            </div>
          ))}
          {[critSubs.length, critMilestones.length, data.vendorDelay > 5 ? 1 : 0, data.conjunctions > 3 ? 1 : 0].every(v => v === 0) && (
            <div style={{ color: O_COLORS.green, fontSize: 12, fontFamily: 'Space Grotesk, sans-serif' }}>✓ No significant risks identified</div>
          )}
        </div>
        <div>
          <div style={{ fontSize: 11, color: O_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', marginBottom: 8, letterSpacing: 1 }}>RECOMMENDED ACTIONS</div>
          {[
            critSubs.length > 0 && `Review and remediate ${critSubs[0]} subsystem before next milestone gate`,
            critMilestones.length > 0 && `Convene schedule review board for slipping milestones`,
            data.vendorDelay > 5 && `Activate contingency vendor pathway; assess cascade impact on CDR`,
            data.conjunctions > 3 && `Flight dynamics to review conjunction avoidance burn options`,
          ].filter(Boolean).map((action, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 0' }}>
              <span style={{ color: O_COLORS.blue, fontSize: 10, marginTop: 2 }}>→</span>
              <span style={{ fontSize: 12, color: O_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif' }}>{action}</span>
            </div>
          ))}
        </div>
        <OSystemNote>This report is generated by ExecutiveReportAgent as a Public output. It represents the AI risk picture only. All operational decisions, launch authorisations, and maneuver commands require human authority.</OSystemNote>
      </OCard>
    </div>
  );
}

Object.assign(window, {
  AGENTS_TEMPLATE, MissionSetupPage, LivePipelinePage, ProgramSchedulePage,
  SubsystemsPage, LaunchWindowPage, OrbitalRiskPage, EscalationsPage, ExecutiveReportPage,
});
