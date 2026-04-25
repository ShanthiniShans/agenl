
// ORBITAL — Shared Components
// Exports to window for cross-file use

const O_COLORS = {
  bg: '#080c14', s1: '#0d1420', s2: '#111927', s3: '#1a2535',
  border: '#1e2d42', border2: '#243347',
  text: '#e2e8f0', textSec: '#7a9ab8', textMut: '#4a6785',
  blue: '#3b9eff', amber: '#f59e0b', green: '#10b981',
  red: '#ef4444', purple: '#a78bfa', cyan: '#22d3ee',
};

const O_NAV = [
  { id: 'setup', icon: '⬡', label: 'Mission Setup' },
  { id: 'pipeline', icon: '◈', label: 'Live Pipeline' },
  { id: 'schedule', icon: '▦', label: 'Program Schedule' },
  { id: 'subsystems', icon: '◉', label: 'Subsystems' },
  { id: 'launch', icon: '△', label: 'Launch Window' },
  { id: 'orbital', icon: '○', label: 'Orbital Risk' },
  { id: 'escalations', icon: '⚑', label: 'Escalations' },
  { id: 'report', icon: '▤', label: 'Executive Report' },
];

function OrbitalSidebar({ page, setPage, pipelineComplete, missionName }) {
  return (
    <div style={{
      width: 220, flexShrink: 0, background: O_COLORS.s1,
      borderRight: `1px solid ${O_COLORS.border}`,
      display: 'flex', flexDirection: 'column', height: '100vh',
      position: 'sticky', top: 0,
    }}>
      <div style={{ padding: '20px 18px 16px', borderBottom: `1px solid ${O_COLORS.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, ${O_COLORS.blue}, #0a1a3a)`,
            boxShadow: `0 0 12px ${O_COLORS.blue}55`,
            flexShrink: 0,
          }}></div>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 15, color: O_COLORS.text, letterSpacing: 2 }}>ORBITAL</span>
        </div>
        <div style={{ fontSize: 10, color: O_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1 }}>MISSION RISK INTELLIGENCE</div>
        {missionName && <div style={{ marginTop: 10, fontSize: 11, color: O_COLORS.blue, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>{missionName}</div>}
      </div>
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {O_NAV.map((item, i) => {
          const locked = !pipelineComplete && item.id !== 'setup' && item.id !== 'pipeline';
          const active = page === item.id;
          return (
            <div key={item.id}
              onClick={() => !locked && setPage(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 18px', cursor: locked ? 'not-allowed' : 'pointer',
                background: active ? `${O_COLORS.blue}18` : 'transparent',
                borderLeft: active ? `2px solid ${O_COLORS.blue}` : '2px solid transparent',
                opacity: locked ? 0.35 : 1,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!locked && !active) e.currentTarget.style.background = `${O_COLORS.s3}`; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 13, color: active ? O_COLORS.blue : O_COLORS.textMut }}>{item.icon}</span>
              <span style={{ fontSize: 12, fontFamily: 'Space Grotesk, sans-serif', fontWeight: active ? 600 : 400, color: active ? O_COLORS.text : O_COLORS.textSec }}>{item.label}</span>
            </div>
          );
        })}
      </nav>
      <div style={{ padding: '14px 18px', borderTop: `1px solid ${O_COLORS.border}`, fontSize: 10, color: O_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace' }}>
        v2.4.1 · CLASSIFIED
      </div>
    </div>
  );
}

function OStatusBadge({ status }) {
  const map = {
    'On Track': { bg: '#10b98122', color: '#10b981', label: 'On Track' },
    'At Risk': { bg: '#f59e0b22', color: '#f59e0b', label: 'At Risk' },
    'Critical': { bg: '#ef444422', color: '#ef4444', label: 'Critical' },
    'GO': { bg: '#10b98122', color: '#10b981', label: 'GO' },
    'NO-GO': { bg: '#ef444422', color: '#ef4444', label: 'NO-GO' },
    'LOW': { bg: '#10b98122', color: '#10b981', label: 'LOW' },
    'MEDIUM': { bg: '#f59e0b22', color: '#f59e0b', label: 'MEDIUM' },
    'HIGH': { bg: '#ef444422', color: '#ef4444', label: 'HIGH' },
    'CRITICAL': { bg: '#ef444422', color: '#ef4444', label: 'CRITICAL' },
    'P1': { bg: '#ef444422', color: '#ef4444', label: 'P1' },
    'P2': { bg: '#f59e0b22', color: '#f59e0b', label: 'P2' },
    'Queued': { bg: '#4a678522', color: '#4a6785', label: 'Queued' },
    'Running': { bg: '#3b9eff22', color: '#3b9eff', label: 'Running' },
    'Complete': { bg: '#10b98122', color: '#10b981', label: 'Complete' },
    'Escalated': { bg: '#ef444422', color: '#ef4444', label: 'Escalated' },
    'Open': { bg: '#ef444422', color: '#ef4444', label: 'Open' },
    'Resolved': { bg: '#10b98122', color: '#10b981', label: 'Resolved' },
  };
  const s = map[status] || { bg: '#4a678522', color: '#4a6785', label: status };
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.color}44`,
      borderRadius: 4, padding: '2px 7px', fontSize: 10,
      fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, letterSpacing: 0.5,
    }}>{s.label}</span>
  );
}

function OHealthBar({ value, label, color }) {
  const c = color || (value >= 70 ? O_COLORS.green : value >= 40 ? O_COLORS.amber : O_COLORS.red);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: O_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif' }}>{label}</span>
        <span style={{ fontSize: 11, color: c, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{value}%</span>
      </div>
      <div style={{ height: 4, background: O_COLORS.s3, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: c, borderRadius: 2, transition: 'width 0.8s ease' }}></div>
      </div>
    </div>
  );
}

function OCard({ children, style = {} }) {
  return (
    <div style={{
      background: O_COLORS.s2, border: `1px solid ${O_COLORS.border}`,
      borderRadius: 8, padding: '16px 18px', ...style,
    }}>{children}</div>
  );
}

function OCardTitle({ children, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, color: O_COLORS.textMut, letterSpacing: 1, textTransform: 'uppercase' }}>{children}</span>
      {action}
    </div>
  );
}

function OPageHeader({ title, subtitle, badge }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: O_COLORS.text }}>{title}</h1>
        {badge && <OStatusBadge status={badge} />}
      </div>
      {subtitle && <p style={{ margin: 0, fontSize: 12, color: O_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif' }}>{subtitle}</p>}
    </div>
  );
}

function OInput({ label, value, onChange, type = 'text', options }) {
  const baseStyle = {
    width: '100%', background: O_COLORS.s3, border: `1px solid ${O_COLORS.border2}`,
    borderRadius: 6, padding: '8px 12px', color: O_COLORS.text,
    fontFamily: 'Space Grotesk, sans-serif', fontSize: 13,
    outline: 'none', boxSizing: 'border-box',
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, color: O_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 5, fontWeight: 500 }}>{label}</label>
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={{ ...baseStyle, cursor: 'pointer' }}>
          {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} style={baseStyle} />
      )}
    </div>
  );
}

function OSlider({ label, value, onChange }) {
  const c = value >= 70 ? O_COLORS.green : value >= 40 ? O_COLORS.amber : O_COLORS.red;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 11, color: O_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 500 }}>{label}</label>
        <span style={{ fontSize: 11, color: c, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{value}%</span>
      </div>
      <input type="range" min="0" max="100" value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: c, cursor: 'pointer' }} />
    </div>
  );
}

function CircularGauge({ value, size = 160, label }) {
  const r = (size / 2) - 16;
  const circ = 2 * Math.PI * r;
  const progress = (value / 100) * circ;
  const color = value >= 70 ? O_COLORS.green : value >= 40 ? O_COLORS.amber : O_COLORS.red;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={O_COLORS.s3} strokeWidth={10} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth={10} strokeDasharray={`${progress} ${circ}`}
          strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 6px ${color}88)` }} />
        <text x={size/2} y={size/2 - 8} textAnchor="middle" fill={color}
          fontSize={size < 100 ? 18 : 28} fontFamily="JetBrains Mono, monospace" fontWeight="700">{value}%</text>
        <text x={size/2} y={size/2 + 12} textAnchor="middle" fill={O_COLORS.textMut}
          fontSize={9} fontFamily="Space Grotesk, sans-serif" letterSpacing="1">READINESS</text>
      </svg>
      {label && <div style={{ fontSize: 12, color: O_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif', marginTop: 4 }}>{label}</div>}
    </div>
  );
}

function OSystemNote({ children }) {
  return (
    <div style={{
      background: `${O_COLORS.amber}11`, border: `1px solid ${O_COLORS.amber}44`,
      borderRadius: 6, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'flex-start',
      marginTop: 12,
    }}>
      <span style={{ color: O_COLORS.amber, fontSize: 12 }}>⚠</span>
      <p style={{ margin: 0, fontSize: 11, color: O_COLORS.amber, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.5 }}>{children}</p>
    </div>
  );
}

function AgentPipelineCard({ agent, visible }) {
  if (!visible) return null;
  const statusColor = {
    'Queued': O_COLORS.textMut, 'Running': O_COLORS.blue,
    'Complete': O_COLORS.green, 'Escalated': O_COLORS.red,
  }[agent.status] || O_COLORS.textMut;

  return (
    <div style={{
      background: O_COLORS.s2, border: `1px solid ${agent.status === 'Running' ? O_COLORS.blue + '55' : O_COLORS.border}`,
      borderRadius: 8, padding: '14px 16px', marginBottom: 10,
      boxShadow: agent.status === 'Running' ? `0 0 16px ${O_COLORS.blue}22` : 'none',
      transition: 'all 0.3s ease',
      animation: 'fadeSlideIn 0.4s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: 13, color: O_COLORS.text }}>{agent.name}</div>
          <div style={{ fontSize: 10, color: O_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>Layer {agent.layer}</div>
        </div>
        <OStatusBadge status={agent.status} />
      </div>
      {(agent.status === 'Complete' || agent.status === 'Escalated') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 8 }}>
          <div style={{ background: O_COLORS.s3, borderRadius: 5, padding: '8px 10px' }}>
            <div style={{ fontSize: 9, color: O_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', marginBottom: 3 }}>INPUT</div>
            <div style={{ fontSize: 10, color: O_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.4 }}>{agent.input}</div>
          </div>
          <div style={{ background: O_COLORS.s3, borderRadius: 5, padding: '8px 10px' }}>
            <div style={{ fontSize: 9, color: O_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', marginBottom: 3 }}>DECISION</div>
            <div style={{ fontSize: 10, color: O_COLORS.text, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.4 }}>{agent.decision}</div>
          </div>
          <div style={{ background: O_COLORS.s3, borderRadius: 5, padding: '8px 10px' }}>
            <div style={{ fontSize: 9, color: O_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', marginBottom: 3 }}>OUTPUT</div>
            <div style={{ fontSize: 10, color: statusColor, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.4 }}>{agent.output}</div>
          </div>
        </div>
      )}
      {agent.blockedAction && (
        <div style={{ marginTop: 8, background: `${O_COLORS.red}11`, border: `1px solid ${O_COLORS.red}33`, borderRadius: 5, padding: '6px 10px' }}>
          <span style={{ fontSize: 9, color: O_COLORS.red, fontFamily: 'JetBrains Mono, monospace' }}>BLOCKED ACTION: </span>
          <span style={{ fontSize: 10, color: O_COLORS.red, fontFamily: 'Space Grotesk, sans-serif' }}>{agent.blockedAction} — prevented by system safety layer</span>
        </div>
      )}
      {agent.status === 'Running' && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: O_COLORS.blue, animation: 'pulse 1s infinite' }}></div>
          <span style={{ fontSize: 10, color: O_COLORS.blue, fontFamily: 'JetBrains Mono, monospace' }}>Processing...</span>
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  O_COLORS, O_NAV, OrbitalSidebar, OStatusBadge, OHealthBar,
  OCard, OCardTitle, OPageHeader, OInput, OSlider,
  CircularGauge, OSystemNote, AgentPipelineCard,
});
