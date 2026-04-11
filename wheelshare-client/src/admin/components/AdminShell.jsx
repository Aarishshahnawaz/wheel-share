import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Shield, Users, Car, TrendingUp,
  LogOut, ChevronLeft, ChevronRight, Bell, Zap, Menu
} from 'lucide-react';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',    path: '/admin2' },
  { icon: Shield,          label: 'KYC Requests', path: '/admin2/kyc' },
  { icon: Users,           label: 'Users',         path: '/admin2/users' },
  { icon: Car,             label: 'Vehicles',      path: '/admin2/vehicles' },
  { icon: TrendingUp,      label: 'Earnings',      path: '/admin2/earnings' },
];

const SIDEBAR_W  = 224; // px — expanded
const COLLAPSED_W = 68; // px — collapsed

export default function AdminShell({ children }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const admin = (() => { try { return JSON.parse(localStorage.getItem('ws_admin') || '{}'); } catch { return {}; } })();
  const handleLogout = () => { localStorage.removeItem('ws_admin'); navigate('/admin2/login'); };
  const currentLabel = NAV.find(n => n.path === location.pathname)?.label || 'Admin Console';
  const sw = collapsed ? COLLAPSED_W : SIDEBAR_W;

  /* ── Sidebar content (shared between desktop & mobile) ── */
  const SidebarContent = ({ isMobile = false }) => (
    <div
      className="flex flex-col h-full"
      style={{ background: 'linear-gradient(180deg,#111827 0%,#0f172a 100%)' }}
    >
      {/* ── Logo ── */}
      <div
        className={`flex items-center h-16 px-4 flex-shrink-0 ${collapsed && !isMobile ? 'justify-center' : 'gap-3'}`}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
          style={{ background: 'linear-gradient(135deg,#fb923c,#f97316,#ea580c)' }}
        >
          <Zap size={16} className="text-white" fill="white" />
        </div>
        {(!collapsed || isMobile) && (
          <div>
            <div className="text-sm font-black text-white leading-tight">WheelShare</div>
            <div className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>Admin Console</div>
          </div>
        )}
      </div>

      {/* ── Nav items ── */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => { navigate(path); setMobileOpen(false); }}
              title={collapsed && !isMobile ? label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${collapsed && !isMobile ? 'justify-center' : ''}`}
              style={{
                background: active ? 'rgba(249,115,22,0.18)' : 'transparent',
                color:      active ? '#fb923c' : 'rgba(255,255,255,0.45)',
                border:     active ? '1px solid rgba(249,115,22,0.25)' : '1px solid transparent',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; } }}
            >
              <Icon size={17} className="flex-shrink-0" />
              {(!collapsed || isMobile) && <span>{label}</span>}
              {active && (!collapsed || isMobile) && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Bottom: profile + logout ── */}
      <div
        className="px-2 pb-4 flex-shrink-0 space-y-1"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '12px' }}
      >
        {/* Profile pill */}
        {(!collapsed || isMobile) && admin.name && (
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs text-white font-black flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
            >
              {admin.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{admin.name}</div>
              <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{admin.email}</div>
            </div>
          </div>
        )}

        {/* Collapsed avatar */}
        {collapsed && !isMobile && admin.name && (
          <div className="flex justify-center py-1">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs text-white font-black"
              style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
            >
              {admin.name[0]}
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${collapsed && !isMobile ? 'justify-center' : ''}`}
          style={{ color: 'rgba(255,255,255,0.3)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut size={16} className="flex-shrink-0" />
          {(!collapsed || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>

      {/* ── Desktop sidebar — fixed, full height ── */}
      <aside
        className="hidden lg:block fixed top-0 left-0 h-screen z-40 transition-all duration-300 overflow-hidden"
        style={{ width: `${sw}px` }}
      >
        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-[72px] w-6 h-6 rounded-full flex items-center justify-center shadow-lg z-50 transition-all duration-150"
          style={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f97316'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#1f2937'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
        >
          {collapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
        </button>
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 h-full" style={{ width: `${SIDEBAR_W}px` }}>
            <SidebarContent isMobile />
          </aside>
        </div>
      )}

      {/* ── Main area — offset by sidebar width ── */}
      <div
        className="flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: `${sw}px` }}
      >
        {/* ── Topbar ── */}
        <header
          className="flex items-center justify-between px-6 h-16 sticky top-0 z-30 flex-shrink-0"
          style={{
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Menu size={18} />
            </button>
            <span className="font-black text-gray-900 text-sm">{currentLabel}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Bell */}
            <button
              className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fff7ed'; e.currentTarget.style.borderColor = '#fed7aa'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <Bell size={15} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-pulse" style={{ background: '#f97316' }} />
            </button>

            {/* Admin pill */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs text-white font-black"
                style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
              >
                {admin.name?.[0] || 'A'}
              </div>
              <span className="text-sm font-semibold text-gray-700 hidden sm:block">{admin.name || 'Admin'}</span>
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-auto" style={{ background: '#f8fafc' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
