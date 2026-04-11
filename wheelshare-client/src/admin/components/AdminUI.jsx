// Admin panel shared UI — premium SaaS style, orange-accented

export function StatCard({ label, value, sub, trend, icon, accent, onClick }) {
  const map = {
    violet: { grad: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', border: '#ddd6fe', iconBg: 'linear-gradient(135deg,#7c3aed,#4f46e5)', glow: 'rgba(124,58,237,0.12)' },
    blue:   { grad: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '#bfdbfe', iconBg: 'linear-gradient(135deg,#3b82f6,#2563eb)', glow: 'rgba(59,130,246,0.12)' },
    green:  { grad: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '#bbf7d0', iconBg: 'linear-gradient(135deg,#22c55e,#16a34a)', glow: 'rgba(34,197,94,0.12)' },
    orange: { grad: 'linear-gradient(135deg,#fff7ed,#ffedd5)', border: '#fed7aa', iconBg: 'linear-gradient(135deg,#f97316,#ea580c)', glow: 'rgba(249,115,22,0.12)' },
    red:    { grad: 'linear-gradient(135deg,#fef2f2,#fee2e2)', border: '#fecaca', iconBg: 'linear-gradient(135deg,#f87171,#dc2626)', glow: 'rgba(239,68,68,0.12)' },
  };
  const c = map[accent] || map.violet;

  return (
    <div
      onClick={onClick}
      className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200"
      style={{ background: c.grad, border: `1px solid ${c.border}`, boxShadow: `0 2px 8px ${c.glow}`, cursor: onClick ? 'pointer' : 'default' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 10px 28px ${c.glow}`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 2px 8px ${c.glow}`; }}
    >
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ background: c.iconBg }}>
          <span className="text-white">{icon}</span>
        </div>
        {trend !== undefined && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: trend >= 0 ? '#f0fdf4' : '#fef2f2', color: trend >= 0 ? '#15803d' : '#b91c1c', border: `1px solid ${trend >= 0 ? '#bbf7d0' : '#fecaca'}` }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <div className="text-3xl font-black tracking-tight" style={{ color: '#0f172a' }}>{value}</div>
        <div className="text-sm font-bold mt-1" style={{ color: '#374151' }}>{label}</div>
        {sub && <div className="text-xs mt-0.5 font-medium" style={{ color: '#6b7280' }}>{sub}</div>}
      </div>
    </div>
  );
}

export function AdminBadge({ status }) {
  const map = {
    active:   { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', dot: '#22c55e' },
    banned:   { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', dot: '#ef4444' },
    inactive: { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', dot: '#94a3b8' },
    pending:  { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa', dot: '#f97316' },
    verified: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', dot: '#22c55e' },
    rejected: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', dot: '#ef4444' },
    approved: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', dot: '#22c55e' },
    removed:  { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', dot: '#94a3b8' },
  };
  const s = map[status] || map.inactive;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full capitalize"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {status}
    </span>
  );
}

export function AdminTable({ headers, children, empty }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden"
      style={{ border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background: 'linear-gradient(to right,#f8fafc,#f1f5f9)', borderBottom: '1px solid #e2e8f0' }}>
              {headers.map(h => (
                <th key={h} className="text-left px-5 py-4 text-xs font-black uppercase tracking-wider whitespace-nowrap"
                  style={{ color: '#64748b' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: '#f1f5f9' }}>
            {children}
          </tbody>
        </table>
        {empty && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm font-semibold" style={{ color: '#94a3b8' }}>{empty}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminPageHeader({ title, sub, action }) {
  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: '#0f172a' }}>{title}</h1>
        {sub && <p className="text-sm mt-0.5 font-medium" style={{ color: '#64748b' }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative flex-1">
      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke="#94a3b8" strokeWidth="2.5">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
        style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' }} />
    </div>
  );
}

export function FilterTabs({ options, value, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(o => (
        <button key={o.val} onClick={() => onChange(o.val)}
          className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150"
          style={{
            background: value === o.val ? 'linear-gradient(135deg,#f97316,#ea580c)' : '#ffffff',
            color: value === o.val ? '#ffffff' : '#64748b',
            border: value === o.val ? '1px solid #ea580c' : '1px solid #e2e8f0',
            boxShadow: value === o.val ? '0 2px 8px rgba(249,115,22,0.3)' : 'none',
          }}>
          {o.label}{o.count !== undefined ? ` (${o.count})` : ''}
        </button>
      ))}
    </div>
  );
}

export function ActionBtn({ label, onClick, variant = 'primary', size = 'sm', disabled }) {
  const variants = {
    primary: { bg: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', border: '#ea580c', shadow: 'rgba(249,115,22,0.3)' },
    success: { bg: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', border: '#16a34a', shadow: 'rgba(22,163,74,0.25)' },
    danger:  { bg: 'linear-gradient(135deg,#f87171,#dc2626)', color: '#fff', border: '#dc2626', shadow: 'rgba(220,38,38,0.25)' },
    ghost:   { bg: '#f8fafc', color: '#475569', border: '#e2e8f0', shadow: 'none' },
    outline: { bg: '#ffffff', color: '#475569', border: '#e2e8f0', shadow: 'none' },
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-sm' };
  const v = variants[variant] || variants.primary;
  return (
    <button onClick={onClick} disabled={disabled}
      className={`font-bold rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]}`}
      style={{ background: v.bg, color: v.color, border: `1px solid ${v.border}`, boxShadow: v.shadow !== 'none' ? `0 2px 6px ${v.shadow}` : 'none' }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {label}
    </button>
  );
}

export function SectionCard({ title, action, children, noPad }) {
  return (
    <div className="bg-white rounded-2xl" style={{ border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
          {title && <h3 className="font-black text-sm tracking-tight" style={{ color: '#0f172a' }}>{title}</h3>}
          {action}
        </div>
      )}
      <div className={noPad ? '' : 'p-6'}>{children}</div>
    </div>
  );
}
