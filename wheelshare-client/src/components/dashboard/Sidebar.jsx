import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Zap, LayoutDashboard, Search, PlusCircle, ClipboardList,
  Star, Wallet, Settings, LogOut, ChevronLeft, ChevronRight,
  RefreshCw, Bell, MapPin, Car, User, MessageCircle, Inbox
} from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { useAuth } from '../../context/AuthContext';
import RoleModal from '../RoleModal';
import { apiGetNotifications } from '../../services/api';

export default function Sidebar({ collapsed, setCollapsed }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { role, clearRole } = useRole();
  const { logout, user }    = useAuth();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [unreadNotifs, setUnreadNotifs]   = useState(0);
  const [unreadMsgs,   setUnreadMsgs]     = useState(0);
  const [pendingReqs,  setPendingReqs]    = useState(0);

  // Fetch badge counts
  useEffect(() => {
    if (!user) return;
    apiGetNotifications()
      .then(res => {
        if (!res.success) return;
        const notifs = res.data || [];
        setUnreadNotifs(notifs.filter(n => !n.isRead).length);
        setUnreadMsgs(notifs.filter(n => n.type === 'new_message' && !n.isRead).length);
        setPendingReqs(notifs.filter(n => n.type === 'booking_request' && !n.isRead).length);
      })
      .catch(() => {});
  }, [user, location.pathname]); // re-fetch when navigating

  const NAV = [
    { icon: LayoutDashboard, label: 'Dashboard',        path: '/dashboard' },
    { icon: Search,          label: 'Find a Ride',      path: '/rent',           role: 'renter' },
    { icon: PlusCircle,      label: 'List Vehicle',     path: '/list',           role: 'owner' },
    { icon: Car,             label: 'My Vehicles',      path: '/my-vehicles',    role: 'owner' },
    { icon: Inbox,           label: 'Booking Requests', path: '/owner-bookings', role: 'owner',  badge: pendingReqs },
    { icon: ClipboardList,   label: 'My Bookings',      path: '/bookings',       role: 'renter' },
    { icon: MessageCircle,   label: 'Messages',         path: '/chat',           badge: unreadMsgs },
    { icon: Star,            label: 'Reviews',          path: '/reviews' },
    { icon: Wallet,          label: 'Earnings',         path: '/earnings',       role: 'owner' },
    { icon: MapPin,          label: 'Live Tracking',    path: '/track',          role: 'renter' },
    { icon: Bell,            label: 'Notifications',    path: '/notifications',  badge: unreadNotifs },
    { icon: User,            label: 'Profile',          path: '/profile' },
    { icon: Settings,        label: 'Settings',         path: '/settings' },
  ];

  const visibleNav = NAV.filter(n => !n.role || n.role === role);
  const handleLogout = () => { clearRole(); logout(); navigate('/'); };

  return (
    <>
      {showRoleModal && <RoleModal onClose={() => setShowRoleModal(false)} />}

      <aside className={`fixed left-0 top-0 h-full bg-gray-900 text-white z-40 flex flex-col transition-all duration-300 ease-in-out ${collapsed ? 'w-[72px]' : 'w-60'}`}>

        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-white/10 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold">
              <span className="text-orange-400">Wheel</span><span className="text-blue-400">Share</span>
            </span>
          )}
        </div>

        {/* Role badge */}
        {!collapsed && (
          <button onClick={() => setShowRoleModal(true)}
            className="mx-3 mt-4 flex items-center justify-between bg-white/10 hover:bg-white/15 rounded-xl px-3 py-2 transition-all group">
            <div className="flex items-center gap-2">
              <span className="text-base">{role === 'owner' ? '💰' : '🏍️'}</span>
              <span className="text-xs font-bold text-white/80">{role === 'owner' ? 'Vehicle Owner' : 'Renter'}</span>
            </div>
            <RefreshCw size={12} className="text-white/40 group-hover:text-white/70 transition-colors" />
          </button>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {visibleNav.map(({ icon: Icon, label, path, badge }) => {
            const active = location.pathname === path || location.pathname.startsWith(path + '/');
            return (
              <button key={label} onClick={() => navigate(path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative
                  ${active ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30' : 'text-white/60 hover:text-white hover:bg-white/10'}
                  ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? label : undefined}
              >
                <div className="relative flex-shrink-0">
                  <Icon size={18} />
                  {badge > 0 && collapsed && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 rounded-full text-white text-[9px] font-black flex items-center justify-center">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{label}</span>
                    {badge > 0 && (
                      <span className="bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="px-2 pb-3 border-t border-white/10 pt-3">
          {!collapsed && user && (
            <button onClick={() => navigate('/profile')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-blue-500 flex items-center justify-center text-xs text-white font-black flex-shrink-0 overflow-hidden">
                {user.profileImage
                  ? <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                  : user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-bold text-white truncate">{user.name}</div>
                <div className="text-xs text-white/40 truncate">{user.email || user.phone}</div>
              </div>
            </button>
          )}
          <button onClick={handleLogout} title="Logout"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all ${collapsed ? 'justify-center' : ''}`}>
            <LogOut size={17} className="flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-gray-800 border border-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors shadow-lg">
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
    </>
  );
}
