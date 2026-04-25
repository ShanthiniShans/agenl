
// AGENL — Shared Components

const A_COLORS = {
  bg: '#08090f', s1: '#0d0f1a', s2: '#111422', s3: '#171b2e',
  border: '#1d2138', border2: '#252844',
  text: '#e8eaf6', textSec: '#7b82b4', textMut: '#454a72',
  green: '#22c55e', red: '#f43f5e', amber: '#f59e0b',
  blue: '#6366f1', cyan: '#22d3ee', purple: '#a78bfa',
  teal: '#2dd4bf',
};

const A_NAV = [
  { id: 'contracts', icon: '▣', label: 'Agent Contracts' },
  { id: 'define', icon: '+', label: 'Define Agent' },
  { id: 'verification', icon: '✓', label: 'Verification' },
  { id: 'trace', icon: '⋮', label: 'Execution Trace' },
  { id: 'infoflow', icon: '→', label: 'Info Flow' },
  { id: 'safetylog', icon: '▦', label: 'Safety Log' },
  { id: 'proofs', icon: '∀', label: 'Proofs' },
];

function AgenLSidebar({ page, setPage }) {
  return (
    <div style={{
      width: 220, flexShrink: 0, background: A_COLORS.s1,
      borderRight: `1px solid ${A_COLORS.border}`,
      display: 'flex', flexDirection: 'column', height: '100vh',
      position: 'sticky', top: 0,
    }}>
      <div style={{ padding: '20px 18px 16px', borderBottom: `1px solid ${A_COLORS.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ width: 28, height: 28, borderRadius: 4, background: `linear-gradient(135deg, ${A_COLORS.blue}, ${A_COLORS.purple})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>AL</div>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 15, color: A_COLORS.text, letterSpacing: 2 }}>AGENL</span>
        </div>
        <div style={{ fontSize: 10, color: A_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1 }}>AGENT DEFINITION LANGUAGE</div>
      </div>
      <div style={{ padding: '10px 18px', background: `${A_COLORS.green}11`, borderBottom: `1px solid ${A_COLORS.border}` }}>
        <div style={{ fontSize: 9, color: A_COLORS.green, fontFamily: 'JetBrains Mono, monospace', letterSpacing: 1 }}>● BUILD STATUS</div>
        <div style={{ fontSize: 10, color: A_COLORS.green, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>18 theorems · exit 0</div>
      </div>
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {A_NAV.map(item => {
          const active = page === item.id;
          return (
            <div key={item.id} onClick={() => setPage(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 18px', cursor: 'pointer',
                background: active ? `${A_COLORS.blue}18` : 'transparent',
                borderLeft: active ? `2px solid ${A_COLORS.blue}` : '2px solid transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = A_COLORS.s3; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 12, color: active ? A_COLORS.blue : A_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace' }}>{item.icon}</span>
              <span style={{ fontSize: 12, fontFamily: 'Space Grotesk, sans-serif', fontWeight: active ? 600 : 400, color: active ? A_COLORS.text : A_COLORS.textSec }}>{item.label}</span>
            </div>
          );
        })}
      </nav>
      <div style={{ padding: '14px 18px', borderTop: `1px solid ${A_COLORS.border}`, fontSize: 10, color: A_COLORS.textMut, fontFamily: 'JetBrains Mono, monospace' }}>
        lake build · 3298 jobs
      </div>
    </div>
  );
}

function ATrustBadge({ level }) {
  const map = { Low: { bg: '#f59e0b22', color: '#f59e0b' }, Medium: { bg: '#6366f122', color: '#6366f1' }, High: { bg: '#22c55e22', color: '#22c55e' } };
  const s = map[level] || map.Medium;
  return <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}44`, borderRadius: 4, padding: '2px 7px', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{level}</span>;
}

function AStatusBadge({ status }) {
  const map = {
    'Verified': { bg: '#22c55e22', color: '#22c55e' },
    'Unverified': { bg: '#f43f5e22', color: '#f43f5e' },
    'ALLOWED': { bg: '#22c55e22', color: '#22c55e' },
    'BLOCKED': { bg: '#f43f5e22', color: '#f43f5e' },
    'PERMITTED': { bg: '#22c55e22', color: '#22c55e' },
    'NOT PERMITTED': { bg: '#f59e0b22', color: '#f59e0b' },
  };
  const s = map[status] || { bg: '#45487222', color: '#454a72' };
  return <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}44`, borderRadius: 4, padding: '2px 7px', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, letterSpacing: 0.5 }}>{status}</span>;
}

function ACard({ children, style = {} }) {
  return <div style={{ background: A_COLORS.s2, border: `1px solid ${A_COLORS.border}`, borderRadius: 8, padding: '16px 18px', ...style }}>{children}</div>;
}

function ACardTitle({ children }) {
  return <div style={{ fontSize: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, color: A_COLORS.textMut, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>{children}</div>;
}

function APageHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h1 style={{ margin: 0, fontSize: 22, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: A_COLORS.text }}>{title}</h1>
      {subtitle && <p style={{ margin: '4px 0 0', fontSize: 12, color: A_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif' }}>{subtitle}</p>}
    </div>
  );
}

function AInput({ label, value, onChange, type = 'text', options, placeholder }) {
  const base = { width: '100%', background: A_COLORS.s3, border: `1px solid ${A_COLORS.border2}`, borderRadius: 6, padding: '8px 12px', color: A_COLORS.text, fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, outline: 'none', boxSizing: 'border-box' };
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ display: 'block', fontSize: 10, color: A_COLORS.textSec, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 4, fontWeight: 500 }}>{label}</label>}
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={{ ...base, cursor: 'pointer' }}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} />
      )}
    </div>
  );
}

function MonoBlock({ children, color }) {
  return (
    <pre style={{ background: A_COLORS.bg, border: `1px solid ${A_COLORS.border}`, borderRadius: 6, padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: color || A_COLORS.green, overflowX: 'auto', margin: 0, lineHeight: 1.6 }}>{children}</pre>
  );
}

Object.assign(window, { A_COLORS, A_NAV, AgenLSidebar, ATrustBadge, AStatusBadge, ACard, ACardTitle, APageHeader, AInput, MonoBlock });
