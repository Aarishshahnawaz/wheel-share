import { useNavigate, useLocation } from 'react-router-dom';
import { Zap, Shield, LayoutDashboard, LogOut, Users } from 'lucide-react';

const NAV = [
  { icon: LayoutDashboard, label: 'Overview',     path: '/admin' },
  { icon: Shield,          label: 'KYC Requests', path: '/admin/kyc' },
  { icon: Users,           label: 'All Users',    path: '/admin/users' },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const admin = (() => { try { return JSON.parse(localStorage.getItem('ws_admin') || '{}'); } catch { return {}; } })();

  const handleLogout = () => { localStorage.removeItem('ws_admin'); navigate('/admin/login'); };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 border-r border-white/10 flex flex-col fixed h-full">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center">
            <Zap size={15} className="text-white" fill="white" />
          </div>
          <div>
            <div className="text-sm font-black text-white leading-tight">WheelShare</div>
            <div className="text-xs text-orange-400 font-bold">Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path;
            return (
              <button key={path} onClick={() => navigate(path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${active ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-white/50 hover:text-white hover:bg-white/10'}`}>
                <Icon size={17} className="flex-shrink-0" />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Admin user */}
        <div className="px-3 pb-4 border-t border-white/10 pt-3 space-y-2">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-blue-500 flex items-center justify-center text-xs text-white font-black">
              {admin.name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white/90 truncate">{admin.name || 'Admin'}</div>
              <div className="text-xs text-white/40 truncate">{admin.email}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-56 min-h-screen bg-gray-50">
        {children}
      </main>
    </div>
  );
}
