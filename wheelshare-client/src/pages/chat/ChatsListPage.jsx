import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, RefreshCw, Clock } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { apiGetMyChats } from '../../services/api';

function fmt(d) {
  if (!d) return '';
  const date = new Date(d);
  const now  = new Date();
  const diff  = (now - date) / 1000;
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function ChatsListPage() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const [chats,   setChats]   = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = user?.id || user?._id;

  useEffect(() => {
    apiGetMyChats()
      .then(res => { if (res.success) setChats(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-5 sticky top-0 z-30">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-gray-900">Messages</h1>
              <p className="text-xs text-gray-500 mt-0.5">{chats.length} conversation{chats.length !== 1 ? 's' : ''}</p>
            </div>
            <button onClick={() => { setLoading(true); apiGetMyChats().then(r => r.success && setChats(r.data)).finally(() => setLoading(false)); }}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
              <RefreshCw size={20} className="animate-spin" />
              <span className="text-sm font-semibold">Loading chats...</span>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-4xl mb-5">
                <MessageCircle size={36} className="text-blue-300" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-1">No messages yet</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                Chats appear here after a booking is made. Book a vehicle or accept a booking request to start chatting.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {chats.map(chat => {
                const other = String(chat.renterId?._id || chat.renterId) === String(currentUserId)
                  ? chat.ownerId
                  : chat.renterId;
                const last  = chat.lastMessage;
                const snap  = chat.bookingId?.vehicleSnapshot || {};
                const vName = snap.name || 'Vehicle';

                return (
                  <button
                    key={chat._id}
                    onClick={() => navigate(`/chat/${chat.bookingId?._id || chat.bookingId}`)}
                    className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md hover:border-orange-200 transition-all group"
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-blue-100 flex items-center justify-center font-black text-orange-500 text-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                      {other?.name?.[0]?.toUpperCase() || '?'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black text-gray-900 text-sm truncate">{other?.name || 'User'}</span>
                        {last?.createdAt && (
                          <span className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
                            <Clock size={10} /> {fmt(last.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {last?.text
                          ? (String(last.senderId) === String(currentUserId) ? 'You: ' : '') + last.text
                          : `Booking: ${vName}`}
                      </p>
                      <p className="text-xs text-orange-400 font-semibold mt-0.5 truncate">{vName}</p>
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-300 group-hover:text-orange-400 transition-colors flex-shrink-0">›</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
