import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, RefreshCw, MessageCircle } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useSocket } from '../hooks/useSocket';
import { apiGetNotifications, apiMarkNotificationRead, apiMarkAllNotificationsRead } from '../services/api';

const TYPE_ICON = {
  booking_request:   '🚗',
  booking_accepted:  '✅',
  booking_rejected:  '❌',
  booking_cancelled: '↩️',
  booking_completed: '🎉',
  new_message:       '💬',
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { on }   = useSocket();

  const [notifs,   setNotifs]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await apiGetNotifications();
      if (res.success) setNotifs(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifs(); }, []);

  // Real-time: push new notifications via Socket.io
  useEffect(() => {
    const off = on('notification', (notif) => {
      setNotifs(prev => [notif, ...prev]);
    });
    return off;
  }, [on]);

  const markRead = async (id) => {
    await apiMarkNotificationRead(id).catch(() => {});
    setNotifs(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  const markAll = async () => {
    await apiMarkAllNotificationsRead().catch(() => {});
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleClick = (n) => {
    markRead(n._id);
    if (!n.bookingId) return;

    if (n.type === 'new_message') {
      navigate(`/chat/${n.bookingId}`);
    } else if (n.type === 'booking_request') {
      // Owner receives this — take them to Booking Requests page
      navigate('/owner-bookings');
    } else if (n.type === 'booking_accepted' || n.type === 'booking_rejected' || n.type === 'booking_completed' || n.type === 'booking_cancelled') {
      // Renter receives these — take them to My Bookings
      navigate('/bookings');
    } else {
      navigate('/bookings');
    }
  };

  const unread   = notifs.filter(n => !n.isRead).length;
  const filtered = filter === 'unread' ? notifs.filter(n => !n.isRead) : notifs;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-100 px-6 py-5 sticky top-0 z-30">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-gray-900">Notifications</h1>
              {unread > 0 && (
                <span className="bg-orange-500 text-white text-xs font-black px-2.5 py-1 rounded-full">{unread} new</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchNotifs} disabled={loading}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 disabled:opacity-50">
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
              {unread > 0 && (
                <button onClick={markAll}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline">
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          {/* Filter */}
          <div className="flex gap-2">
            {[['all', 'All'], ['unread', `Unread (${unread})`]].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === val ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'}`}>
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
              <RefreshCw size={20} className="animate-spin" />
              <span className="text-sm font-semibold">Loading notifications...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Bell size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-semibold text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(n => (
                <button
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left bg-white rounded-2xl border p-4 flex items-start gap-4 transition-all hover:shadow-md ${!n.isRead ? 'border-orange-200 shadow-sm' : 'border-gray-100'}`}
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${!n.isRead ? 'bg-orange-50' : 'bg-gray-50'}`}>
                    {TYPE_ICON[n.type] || '🔔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-sm font-black ${!n.isRead ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</span>
                      {!n.isRead && <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400">
                        {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {n.type === 'new_message' && (
                        <span className="flex items-center gap-1 text-xs text-blue-600 font-bold">
                          <MessageCircle size={10} /> Open Chat
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
