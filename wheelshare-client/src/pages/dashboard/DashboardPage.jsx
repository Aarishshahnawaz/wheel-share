import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertCircle, X, CheckCheck, ArrowRight, MessageCircle, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { useLocation_ } from '../../context/LocationContext';
import LocationModal from '../../components/LocationModal';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import ProfileCard from '../../components/dashboard/ProfileCard';
import QuickActions from '../../components/dashboard/QuickActions';
import RecentActivity from '../../components/dashboard/RecentActivity';
import StatsBar from '../../components/dashboard/StatsBar';
import EarningsChart from '../../components/dashboard/EarningsChart';
import PerformanceCard from '../../components/dashboard/PerformanceCard';
import { apiGetNotifications, apiMarkAllNotificationsRead, apiMarkNotificationRead } from '../../services/api';

const TYPE_ICON = {
  booking_request:   '🚗',
  booking_accepted:  '✅',
  booking_rejected:  '❌',
  booking_completed: '🎉',
  new_message:       '💬',
};

// ── Fade-up animation variant ─────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial:   { opacity: 0, y: 18 },
  animate:   { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function DashboardPage() {
  const { role }  = useRole();
  const { user, isKycVerified } = useAuth();
  const { location, setLocation } = useLocation_();
  const navigate  = useNavigate();

  const [kycDismissed,   setKycDismissed]   = useState(false);
  const [notifOpen,      setNotifOpen]      = useState(false);
  const [notifs,         setNotifs]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [showLocModal,   setShowLocModal]   = useState(!location); // show on first load if no location
  const notifRef = useRef();

  const firstName = user?.name?.split(' ')[0] || 'there';
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const unread    = notifs.filter(n => !n.isRead).length;

  useEffect(() => {
    apiGetNotifications()
      .then(res => { if (res.success) setNotifs(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id) => {
    await apiMarkNotificationRead(id).catch(() => {});
    setNotifs(p => p.map(n => n._id === id ? { ...n, isRead: true } : n));
  };
  const markAll = async () => {
    await apiMarkAllNotificationsRead().catch(() => {});
    setNotifs(p => p.map(n => ({ ...n, isRead: true })));
  };
  const handleNotifClick = (n) => {
    markRead(n._id);
    setNotifOpen(false);
    if (n.type === 'new_message')          navigate(`/chat/${n.bookingId}`);
    else if (n.type === 'booking_request') navigate('/owner-bookings');
    else                                   navigate('/bookings');
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#f8fafc]">

        {/* Location modal — shown on first load or when user clicks location */}
        {showLocModal && <LocationModal onClose={() => setShowLocModal(false)} />}

        {/* ── Topbar ──────────────────────────────────────────────────────── */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div>
            <h1 className="text-lg font-black text-gray-900">{greeting}, {firstName} 👋</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {role === 'owner' ? "Here's how your vehicles are performing today" : 'Ready for your next ride?'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Location pill */}
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowLocModal(true)}
              className="hidden sm:flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl px-3 py-2 text-xs font-bold hover:bg-orange-100 transition-all"
            >
              <MapPin size={13} className="text-orange-500" />
              {location ? `${location.city}${location.state ? `, ${location.state}` : ''}` : 'Select City'}
            </motion.button>
            {/* Bell */}
            <div className="relative" ref={notifRef}>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setNotifOpen(o => !o)}
                className="relative w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Bell size={17} className="text-gray-600" />
                {unread > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full text-white text-[10px] font-black flex items-center justify-center shadow"
                  >
                    {unread > 9 ? '9+' : unread}
                  </motion.span>
                )}
              </motion.button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <span className="font-black text-gray-900 text-sm">Notifications</span>
                      <div className="flex items-center gap-2">
                        {unread > 0 && (
                          <button onClick={markAll} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline">
                            <CheckCheck size={11} /> Mark all read
                          </button>
                        )}
                        <button onClick={() => { setNotifOpen(false); navigate('/notifications'); }}
                          className="text-xs font-bold text-orange-500 hover:underline">View all</button>
                      </div>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifs.length === 0
                        ? <div className="py-8 text-center text-sm text-gray-400">No notifications yet</div>
                        : notifs.slice(0, 6).map(n => (
                          <button key={n._id} onClick={() => handleNotifClick(n)}
                            className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!n.isRead ? 'bg-orange-50/40' : ''}`}
                          >
                            <span className="text-lg flex-shrink-0 mt-0.5">{TYPE_ICON[n.type] || '🔔'}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-gray-900 truncate">{n.title}</span>
                                {!n.isRead && <span className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0" />}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5 truncate">{n.body}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {n.type === 'new_message' && <MessageCircle size={13} className="text-blue-500 flex-shrink-0 mt-1" />}
                          </button>
                        ))
                      }
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Avatar */}
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 hover:bg-orange-50 border border-transparent hover:border-orange-200 transition-all"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-400 to-blue-500 flex items-center justify-center text-xs text-white font-bold overflow-hidden flex-shrink-0">
                {user?.profileImage
                  ? <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                  : user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-semibold text-gray-700 hidden sm:block max-w-[100px] truncate">{firstName}</span>
            </motion.button>
          </div>
        </header>

        {/* ── KYC Banner ──────────────────────────────────────────────────── */}
        <AnimatePresence>
          {!isKycVerified && !kycDismissed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className={`border-b px-6 py-3 overflow-hidden ${user?.kycStatus === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}
            >
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${user?.kycStatus === 'rejected' ? 'bg-red-100' : 'bg-amber-100'}`}>
                    <AlertCircle size={16} className={user?.kycStatus === 'rejected' ? 'text-red-600' : 'text-amber-600'} />
                  </div>
                  <div>
                    {user?.kycStatus === 'rejected' ? (
                      <>
                        <span className="text-sm font-bold text-red-800">❌ Your KYC was rejected · </span>
                        <span className="text-sm text-red-700">
                          {user?.kyc?.rejectionReason ? `Reason: ${user.kyc.rejectionReason}` : 'Please re-upload your documents and apply again.'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-bold text-amber-800">KYC verification required · </span>
                        <span className="text-sm text-amber-700">
                          {user?.kyc?.license ? 'Your documents are under review (24–48 hrs).' : 'Upload your Driving License & Aadhaar to rent or list vehicles.'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => navigate('/profile')}
                    className={`text-xs font-black text-white px-4 py-1.5 rounded-xl transition-colors whitespace-nowrap ${user?.kycStatus === 'rejected' ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'}`}>
                    {user?.kycStatus === 'rejected' ? 'Apply Again →' : 'Verify Now →'}
                  </button>
                  <button onClick={() => setKycDismissed(true)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${user?.kycStatus === 'rejected' ? 'hover:bg-red-200 text-red-600' : 'hover:bg-amber-200 text-amber-600'}`}>
                    <X size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Page content ─────────────────────────────────────────────────── */}
        <div className="p-6 space-y-6 max-w-7xl mx-auto">

          {/* ── ROW 1: Profile (left) + Earnings Chart (right) ─────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            <motion.div {...fadeUp(0)} className="lg:col-span-1 flex flex-col">
              <ProfileCard />
            </motion.div>
            <motion.div {...fadeUp(0.08)} className="lg:col-span-2 flex flex-col">
              {role === 'owner'
                ? <EarningsChart />
                : <RenterHeroCard navigate={navigate} />
              }
            </motion.div>
          </div>

          {/* ── ROW 2: Stats cards ──────────────────────────────────────────── */}
          <motion.div {...fadeUp(0.14)}>
            <StatsBar />
          </motion.div>

          {/* ── ROW 3: Quick Actions + Performance ─────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div {...fadeUp(0.18)} className="lg:col-span-2">
              <QuickActions />
            </motion.div>
            {role === 'owner' && (
              <motion.div {...fadeUp(0.22)} className="lg:col-span-1">
                <PerformanceCard />
              </motion.div>
            )}
          </div>

          {/* ── ROW 4: Recent Activity ──────────────────────────────────────── */}
          <motion.div {...fadeUp(0.26)}>
            <RecentActivity role={role} />
          </motion.div>

          {/* ── Promo banner ────────────────────────────────────────────────── */}
          <motion.div {...fadeUp(0.3)}
            className="bg-gradient-to-r from-orange-500 to-blue-600 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg"
          >
            <div className="text-white">
              <p className="text-xs font-bold opacity-80 uppercase tracking-wider mb-1">
                {role === 'owner' ? '🚀 Boost your earnings' : '🎉 Special offer'}
              </p>
              <h3 className="text-xl font-black">
                {role === 'owner' ? 'Add a second vehicle & earn 2x this weekend' : 'First ride discount — ₹200 off your next booking'}
              </h3>
              <p className="text-white/70 text-sm mt-1">
                {role === 'owner' ? 'Limited slots available in your city' : 'Use code WHEEL200 at checkout'}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate(role === 'owner' ? '/list' : '/rent')}
              className="flex-shrink-0 bg-white text-orange-600 font-black px-6 py-3 rounded-2xl text-sm hover:bg-orange-50 transition-all shadow-md whitespace-nowrap flex items-center gap-2"
            >
              {role === 'owner' ? 'List Now' : 'Rent Now'} <ArrowRight size={15} />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Renter hero card (shown instead of earnings chart for renters)
function RenterHeroCard({ navigate }) {
  return (
    <div className="flex-1 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-8 flex flex-col justify-between shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="relative">
        <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">Ready to ride?</p>
        <h2 className="text-white text-3xl font-black leading-tight mb-3">Find your perfect<br />vehicle today</h2>
        <p className="text-blue-200 text-sm">500+ bikes & cars available across 20+ Indian cities</p>
      </div>
      <div className="relative flex items-end justify-between mt-8">
        <div className="flex gap-6">
          {[['500+', 'Vehicles'], ['20+', 'Cities'], ['4.8★', 'Rating']].map(([v, l]) => (
            <div key={l}>
              <div className="text-white text-xl font-black">{v}</div>
              <div className="text-blue-300 text-xs font-semibold">{l}</div>
            </div>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/rent')}
          className="bg-white text-blue-700 font-black px-6 py-3 rounded-2xl text-sm shadow-lg flex items-center gap-2 hover:bg-blue-50 transition-colors"
        >
          Search Now <ArrowRight size={15} />
        </motion.button>
      </div>
    </div>
  );
}
