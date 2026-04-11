import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MapPin, Phone, Loader, Navigation } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import {
  apiGetChatByBooking, apiGetMessages, apiSendMessage,
} from '../../services/api';

function fmt(d) {
  const date = new Date(d);
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function MessageBubble({ msg, isMe }) {
  const bg = isMe ? 'bg-orange-500 text-white' : 'bg-white text-gray-900 border border-gray-200';
  const align = isMe ? 'items-end' : 'items-start';

  if (msg.type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{msg.text}</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${align} gap-1 max-w-[75%] ${isMe ? 'ml-auto' : 'mr-auto'}`}>
      {msg.type === 'location' && msg.location ? (
        <div className={`${bg} rounded-2xl p-3 shadow-sm`}>
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={14} className={isMe ? 'text-white/80' : 'text-orange-500'} />
            <span className="text-xs font-bold">Location Shared</span>
          </div>
          <a
            href={`https://www.google.com/maps?q=${msg.location.lat},${msg.location.lng}`}
            target="_blank" rel="noopener noreferrer"
            className={`text-xs underline ${isMe ? 'text-white/90' : 'text-blue-600'}`}
          >
            {msg.location.address || `${msg.location.lat.toFixed(4)}, ${msg.location.lng.toFixed(4)}`}
          </a>
        </div>
      ) : msg.type === 'contact' && msg.contact ? (
        <div className={`${bg} rounded-2xl p-3 shadow-sm`}>
          <div className="flex items-center gap-2 mb-1">
            <Phone size={14} className={isMe ? 'text-white/80' : 'text-green-500'} />
            <span className="text-xs font-bold">Contact Shared</span>
          </div>
          <div className={`text-sm font-bold ${isMe ? 'text-white' : 'text-gray-900'}`}>{msg.contact.name}</div>
          <div className={`text-xs ${isMe ? 'text-white/80' : 'text-gray-500'}`}>{msg.contact.phone}</div>
        </div>
      ) : (
        <div className={`${bg} rounded-2xl px-4 py-2.5 shadow-sm`}>
          <p className="text-sm leading-relaxed">{msg.text}</p>
        </div>
      )}
      <span className="text-xs text-gray-400 px-1">{fmt(msg.createdAt)}</span>
    </div>
  );
}

export default function ChatPage() {
  const { bookingId } = useParams();
  const navigate      = useNavigate();
  const { user }      = useAuth();
  const { joinChat, leaveChat, on } = useSocket();

  const [chat,     setChat]     = useState(null);
  const [messages, setMessages] = useState([]);
  const [text,     setText]     = useState('');
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);
  const [showExtra, setShowExtra] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const currentUserId = user?.id || user?._id;

  // Load chat + messages
  useEffect(() => {
    if (!bookingId) return;
    setLoading(true);
    apiGetChatByBooking(bookingId)
      .then(res => {
        setChat(res.data);
        return apiGetMessages(res.data._id);
      })
      .then(res => setMessages(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bookingId]);

  // Socket.io — join room + listen for new messages
  useEffect(() => {
    if (!chat?._id) return;
    joinChat(chat._id);
    const off = on('new_message', ({ chatId, message }) => {
      // Only handle messages for this chat
      if (String(chatId) !== String(chat._id)) return;
      // Deduplicate — if we already have this message (sent by us via API), skip it
      setMessages(prev => {
        if (prev.some(m => String(m._id) === String(message._id))) return prev;
        return [...prev, message];
      });
    });
    return () => { leaveChat(chat._id); off?.(); };
  }, [chat?._id, joinChat, leaveChat, on]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(async (type = 'text', extra = {}) => {
    if (type === 'text' && !text.trim()) return;
    setSending(true);
    try {
      const body = { type, text: type === 'text' ? text.trim() : '', ...extra };
      // Send to server — the socket broadcast will add it to messages for everyone
      // (including sender via the chat room), so we don't add it manually here
      await apiSendMessage(chat._id, body);
      setText('');
      setShowExtra(false);
      inputRef.current?.focus();
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  }, [chat?._id, text]);

  const shareLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      pos => send('location', {
        location: {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        },
      }),
      () => alert('Could not get location')
    );
  };

  const shareContact = () => {
    send('contact', { contact: { name: user.name, phone: user.phone || 'Not shared' } });
  };

  const other = chat
    ? (String(chat.renterId?._id || chat.renterId) === String(currentUserId) ? chat.ownerId : chat.renterId)
    : null;

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-screen gap-3 text-gray-400">
        <Loader size={20} className="animate-spin" />
        <span className="text-sm font-semibold">Loading chat...</span>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-30 shadow-sm">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          {other && (
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-100 to-blue-100 flex items-center justify-center font-black text-orange-500 text-base">
                {other.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div className="font-black text-gray-900 text-sm">{other.name}</div>
                <div className="text-xs text-green-500 font-semibold">● Online</div>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map(msg => (
            <MessageBubble
              key={msg._id}
              msg={msg}
              isMe={String(msg.senderId?._id || msg.senderId) === String(currentUserId)}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Extra actions */}
        {showExtra && (
          <div className="bg-white border-t border-gray-100 px-4 py-3 flex gap-3">
            <button onClick={shareLocation}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold hover:bg-orange-100 transition-all">
              <Navigation size={14} /> Share Location
            </button>
            <button onClick={shareContact}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-xs font-bold hover:bg-green-100 transition-all">
              <Phone size={14} /> Share Contact
            </button>
          </div>
        )}

        {/* Input */}
        <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setShowExtra(s => !s)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${showExtra ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            <span className="text-lg font-black leading-none">{showExtra ? '×' : '+'}</span>
          </button>
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            onClick={() => send()}
            disabled={!text.trim() || sending}
            className="w-10 h-10 rounded-xl bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-all disabled:opacity-50 flex-shrink-0 shadow-md"
          >
            {sending ? <Loader size={16} className="text-white animate-spin" /> : <Send size={16} className="text-white" />}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
