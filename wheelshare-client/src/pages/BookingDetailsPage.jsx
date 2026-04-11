import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, RefreshCw, CheckCircle, Clock, XCircle, Star, Phone, MapPin, Shield } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';
import { apiGetMyBookings, apiGetOwnerBookings, apiCancelBooking, apiCreateReview } from '../services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt12(t) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function fmtDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return d; }
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:   { label: 'Waiting for Owner',  color: 'bg-yellow-50 border-yellow-200 text-yellow-700', dot: 'bg-yellow-400', icon: '⏳' },
  confirmed: { label: 'Confirmed',          color: 'bg-green-50 border-green-200 text-green-700',   dot: 'bg-green-500',  icon: '✅' },
  active:    { label: 'Ride Active',        color: 'bg-blue-50 border-blue-200 text-blue-700',      dot: 'bg-blue-500',   icon: '🚗' },
  completed: { label: 'Completed',          color: 'bg-gray-50 border-gray-200 text-gray-700',      dot: 'bg-gray-500',   icon: '🎉' },
  cancelled: { label: 'Cancelled',          color: 'bg-red-50 border-red-200 text-red-600',         dot: 'bg-red-500',    icon: '❌' },
};

// ── Progress tracker steps ────────────────────────────────────────────────────
const RENTER_STEPS = [
  { key: 'payment',   label: 'Payment Done',          statuses: ['pending','confirmed','active','completed'] },
  { key: 'pending',   label: 'Waiting for Owner',     statuses: ['confirmed','active','completed'] },
  { key: 'confirmed', label: 'Ride Confirmed',        statuses: ['active','completed'] },
  { key: 'active',    label: 'Ride Started',          statuses: ['completed'] },
  { key: 'completed', label: 'Ride Completed',        statuses: ['completed'] },
];

const OWNER_STEPS = [
  { key: 'request',   label: 'New Booking Request',   statuses: ['pending','confirmed','active','completed'] },
  { key: 'pending',   label: 'Pending Your Approval', statuses: ['confirmed','active','completed'] },
  { key: 'confirmed', label: 'Booking Accepted',      statuses: ['active','completed'] },
  { key: 'active',    label: 'Ride Active',           statuses: ['completed'] },
  { key: 'completed', label: 'Ride Completed',        statuses: ['completed'] },
];

function StatusTracker({ status, isOwner }) {
  const STEPS = isOwner ? OWNER_STEPS : RENTER_STEPS;
  if (status === 'cancelled') return (
    <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3">
      <span className="text-2xl">❌</span>
      <div>
        <div className="font-black text-red-700">Booking Cancelled</div>
        <div className="text-xs text-red-500 mt-0.5">This booking has been cancelled.</div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-black text-gray-900 text-sm mb-4">Booking Progress</h3>
      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const done    = step.statuses.includes(status);
          const current = (status === 'pending'   && step.key === 'pending') ||
                          (status === 'confirmed' && step.key === 'confirmed') ||
                          (status === 'active'    && step.key === 'active');
          return (
            <div key={step.key} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black
                ${done ? 'bg-green-500 text-white' : current ? 'bg-orange-500 text-white animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
                {done ? <CheckCircle size={14} /> : current ? <Clock size={14} /> : i + 1}
              </div>
              <div className="flex-1">
                <span className={`text-sm font-bold ${done ? 'text-green-700' : current ? 'text-orange-600' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
              {done && <span className="text-xs text-green-500 font-bold">✓</span>}
              {current && <span className="text-xs text-orange-500 font-bold animate-pulse">Now</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── InfoRow ───────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, sub }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 text-base">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-400 font-semibold">{label}</div>
        <div className="text-sm font-bold text-gray-900 mt-0.5">{value || '—'}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BookingDetailsPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role } = useRole();
  const isOwner  = role === 'owner';
  const backPath  = isOwner ? '/owner-bookings' : '/bookings';
  const backLabel = isOwner ? 'Booking Requests' : 'My Bookings';

  const [booking,    setBooking]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [imgModal,   setImgModal]   = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [stars,      setStars]      = useState(0);
  const [hoverStar,  setHoverStar]  = useState(0);
  const [review,     setReview]     = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.allSettled([apiGetMyBookings(), apiGetOwnerBookings()])
      .then(([rRes, oRes]) => {
        const all = [
          ...(rRes.status === 'fulfilled' && rRes.value.success ? rRes.value.data : []),
          ...(oRes.status === 'fulfilled' && oRes.value.success ? oRes.value.data : []),
        ];
        setBooking(all.find(b => b._id === id) || null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(true);
    try { await apiCancelBooking(id); setBooking(b => ({ ...b, status: 'cancelled' })); }
    catch (err) { alert(err.message); }
    finally { setCancelling(false); }
  };

  const handleRate = async () => {
    if (!stars) return;
    setSubmitting(true);
    try {
      await apiCreateReview({ bookingId: id, rating: stars, text: review });
      setBooking(b => ({ ...b, rating: { stars, review } }));
      setShowRating(false);
    } catch (err) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-screen gap-3 text-gray-400">
        <RefreshCw size={20} className="animate-spin" /><span className="text-sm font-semibold">Loading...</span>
      </div>
    </DashboardLayout>
  );

  if (!booking) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-5xl">📋</div>
        <h2 className="text-xl font-black text-gray-900">Booking not found</h2>
        <button onClick={() => navigate(backPath)} className="btn-primary px-6 py-3 text-white font-bold rounded-2xl text-sm">
          Back to {backLabel}
        </button>
      </div>
    </DashboardLayout>
  );

  const st   = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const v    = booking.vehicleId || {};
  const snap = booking.vehicleSnapshot || {};
  const vName  = v.brand ? `${v.brand} ${v.model}` : snap.name || 'Vehicle';
  const vImage = v.photos?.[0]?.url || snap.image || null;
  const vCity  = v.city  || snap.city  || '';
  const vArea  = v.area  || snap.area  || '';
  const vState = v.state || snap.state || '';
  const bookingRef = `WS${booking._id.toString().slice(-8).toUpperCase()}`;
  const isConfirmedOrActive = ['confirmed', 'active'].includes(booking.status);

  // Full pickup address — combine all available parts
  const addrParts = [
    v.address  || snap.address  || '',   // street address
    v.area     || snap.area     || '',   // area/locality
    v.city     || snap.city     || '',   // city
    v.state    || snap.state    || '',   // state
  ].filter(Boolean);
  const pickupAddr = addrParts.join(', ') || '—';
  const landmark   = v.landmark || snap.landmark || '';

  // Owner info — try multiple sources
  const ownerObj   = v.ownerId || booking.ownerId || {};
  const ownerName  = ownerObj?.name  || snap.ownerName  || booking.ownerName  || '—';
  const ownerPhone = ownerObj?.phone || snap.ownerPhone || booking.ownerPhone || '';
  const ownerImage = ownerObj?.profileImage || null;

  // Renter info
  const renterName  = booking.userId?.name  || '—';
  const renterPhone = booking.userId?.phone || '—';

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-30">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate(backPath)}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-500 font-semibold text-sm transition-colors group">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              {backLabel}
            </button>
            <h1 className="text-base font-black text-gray-900">Booking Details</h1>
            <span className="text-xs text-gray-400 font-mono">{bookingRef}</span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">

          {/* Image lightbox modal */}
          {imgModal && vImage && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setImgModal(false)}>
              <div className="relative max-w-lg w-full">
                <img src={vImage} alt={vName} className="w-full rounded-3xl shadow-2xl" />
                <button onClick={() => setImgModal(false)}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors">
                  ×
                </button>
              </div>
            </div>
          )}

          {/* ── Status badge ── */}
          <div className={`rounded-3xl border p-4 flex items-center gap-4 ${st.color}`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${st.dot} bg-opacity-20`}>
              {st.icon}
            </div>
            <div>
              <div className="font-black text-base">{st.label}</div>
              <div className="text-xs mt-0.5 opacity-75">
                {booking.status === 'pending'   && (isOwner ? 'A renter is waiting for your approval.' : 'Owner will confirm your booking shortly.')}
                {booking.status === 'confirmed' && (isOwner ? 'You accepted this booking.' : 'Booking confirmed! Get ready for your ride.')}
                {booking.status === 'active'    && 'Ride is currently active.'}
                {booking.status === 'completed' && (isOwner ? `You earned ₹${Number(booking.total).toLocaleString('en-IN')} from this ride.` : 'Ride completed. Hope you enjoyed!')}
                {booking.status === 'cancelled' && 'This booking has been cancelled.'}
              </div>
            </div>
          </div>

          {/* ── Vehicle card — ALWAYS FIRST ── */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex gap-4 p-5">
              {/* Clickable image */}
              <div className="relative w-24 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => vImage && setImgModal(true)}>
                {vImage
                  ? <img src={vImage} alt={vName} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-3xl">{snap.type === 'bike' ? '🏍️' : '🚗'}</div>
                }
                {vImage && <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 transition-opacity"><span className="text-white text-xs font-bold">🔍</span></div>}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-black text-gray-900 text-base">{vName}</h2>
                {vCity && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                    <MapPin size={11} className="text-orange-400" />{vArea ? `${vArea}, ` : ''}{vCity}
                  </div>
                )}
                <div className="mt-2">
                  <span className="text-xl font-black text-orange-500">₹{Number(booking.total).toLocaleString('en-IN')}</span>
                  <span className="text-xs text-gray-400 ml-1">total paid</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Progress tracker ── */}
          <StatusTracker status={booking.status} isOwner={isOwner} />

          {/* ── Date & Time ── */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-black text-gray-900 text-sm mb-3">📅 Date & Time</h3>
            <InfoRow icon="📅" label="Pickup Date & Time"
              value={fmtDate(booking.startDate)}
              sub={booking.startTime ? `⏰ ${fmt12(booking.startTime)}` : undefined} />
            <InfoRow icon="🏁" label="Return Date & Time"
              value={fmtDate(booking.endDate)}
              sub={booking.endTime ? `⏰ ${fmt12(booking.endTime)}` : undefined} />
            <InfoRow icon="⏱️" label="Duration"
              value={`${booking.days} day${booking.days > 1 ? 's' : ''}`} />
          </div>

          {/* ── Payment ── */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-black text-gray-900 text-sm mb-3">💳 Payment Details</h3>
            {booking.subtotal > 0    && <InfoRow icon="💰" label="Subtotal"       value={`₹${Number(booking.subtotal).toLocaleString('en-IN')}`} />}
            {booking.addonsTotal > 0 && <InfoRow icon="➕" label="Add-ons"        value={`₹${Number(booking.addonsTotal).toLocaleString('en-IN')}`} />}
            {booking.insurance > 0   && <InfoRow icon="🛡️" label="Insurance"      value={`₹${Number(booking.insurance).toLocaleString('en-IN')}`} />}
            {booking.serviceFee > 0  && <InfoRow icon="🔧" label="Service Fee"    value={`₹${Number(booking.serviceFee).toLocaleString('en-IN')}`} />}
            {booking.deposit > 0     && <InfoRow icon="🔒" label="Security Deposit" value={`₹${Number(booking.deposit).toLocaleString('en-IN')}`} sub="Refundable after return" />}
            <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-100">
              <span className="font-black text-gray-900">Total Paid</span>
              <span className="text-xl font-black text-orange-500">₹{Number(booking.total).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* ── Pickup Location — renter only (owner already knows their address) ── */}
          {!isOwner && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-black text-gray-900 text-sm mb-3">📍 Pickup Location</h3>
            {isConfirmedOrActive || booking.status === 'completed' ? (
              <>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} className="text-orange-500" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-semibold mb-1">Full Address</div>
                    <div className="text-sm font-black text-gray-900 leading-relaxed">{pickupAddr}</div>
                    {landmark && (
                      <div className="text-xs text-gray-500 mt-1">🏢 Near: <span className="font-semibold">{landmark}</span></div>
                    )}
                  </div>
                </div>
                {v.lat && v.lng && (
                  <a href={`https://www.google.com/maps?q=${v.lat},${v.lng}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-2xl hover:bg-blue-100 transition-all w-fit">
                    🗺️ View on Google Maps
                  </a>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-2xl px-4 py-3">
                🔒 Full address will be shared after owner confirms booking
              </div>
            )}
          </div>
          )}

          {/* ── Owner Info (renter view) ── */}
          {!isOwner && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-black text-gray-900 text-sm mb-4">👤 Owner Details</h3>
              <div className="flex items-center gap-4 mb-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-100 to-blue-100 flex items-center justify-center font-black text-orange-500 text-xl flex-shrink-0 overflow-hidden">
                  {ownerImage
                    ? <img src={ownerImage} alt={ownerName} className="w-full h-full object-cover" />
                    : ownerName?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div className="font-black text-gray-900 text-base">{ownerName}</div>
                  {ownerPhone && <div className="text-xs text-gray-500 mt-0.5">📞 {ownerPhone}</div>}
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={11} className="text-yellow-400" fill="currentColor" />
                    <span className="text-xs font-bold text-gray-600">5.0</span>
                    <span className="text-xs text-gray-400">· Verified Owner</span>
                    <Shield size={11} className="text-green-500 ml-1" />
                  </div>
                </div>
              </div>
              {isConfirmedOrActive && (
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => navigate(`/chat/${booking._id}`)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all">
                    <MessageCircle size={13} /> Chat with Owner
                  </button>
                  {ownerPhone && (
                    <a href={`tel:${ownerPhone}`}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-xs font-bold hover:bg-green-100 transition-all">
                      <Phone size={13} /> Call Owner
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Renter Info (owner view) ── */}
          {isOwner && booking.userId && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-black text-gray-900 text-sm mb-3">🏍️ Renter Details</h3>
              <InfoRow icon="👤" label="Renter Name" value={renterName} />
              {renterPhone !== '—' && <InfoRow icon={<Phone size={14} className="text-green-500" />} label="Phone" value={renterPhone} />}
              {booking.userId?.email && <InfoRow icon="📧" label="Email" value={booking.userId.email} />}
              {isConfirmedOrActive && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  <button onClick={() => navigate(`/chat/${booking._id}`)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all">
                    <MessageCircle size={13} /> Chat with Renter
                  </button>
                  {renterPhone !== '—' && (
                    <a href={`tel:${renterPhone}`}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-xs font-bold hover:bg-green-100 transition-all">
                      <Phone size={13} /> Call Renter
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Rating (completed, renter only) ── */}
          {!isOwner && booking.status === 'completed' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-black text-gray-900 text-sm mb-3">⭐ Rate this Ride</h3>
              {booking.rating?.stars ? (
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={22} className={s <= booking.rating.stars ? 'text-yellow-400' : 'text-gray-200'} fill="currentColor" />
                  ))}
                  <span className="text-sm font-bold text-gray-700 ml-1">{booking.rating.stars}/5</span>
                  {booking.rating.review && <span className="text-xs text-gray-500 ml-2">"{booking.rating.review}"</span>}
                </div>
              ) : showRating ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setStars(s)}
                        onMouseEnter={() => setHoverStar(s)} onMouseLeave={() => setHoverStar(0)}
                        className="transition-transform hover:scale-110">
                        <Star size={30} className={s <= (hoverStar || stars) ? 'text-yellow-400' : 'text-gray-200'} fill={s <= (hoverStar || stars) ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                    {(hoverStar || stars) > 0 && (
                      <span className="text-xs font-bold text-yellow-500 ml-1">
                        {['','Poor','Fair','Good','Great','Excellent!'][hoverStar || stars]}
                      </span>
                    )}
                  </div>
                  <textarea value={review} onChange={e => setReview(e.target.value)}
                    placeholder="Write a review (optional)..." rows={2}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => setShowRating(false)}
                      className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button onClick={handleRate} disabled={!stars || submitting}
                      className="flex-1 py-2.5 rounded-2xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2">
                      {submitting ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Submitting...</> : '⭐ Submit Rating'}
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowRating(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-bold hover:bg-yellow-100 transition-all">
                  <Star size={13} /> Rate this ride
                </button>
              )}
            </div>
          )}

          {/* ── What happens next (pending, renter only) ── */}
          {booking.status === 'pending' && !isOwner && (
            <div className="bg-blue-50 border border-blue-200 rounded-3xl p-5">
              <h3 className="font-black text-blue-900 text-sm mb-3">📋 What happens next?</h3>
              <div className="space-y-2.5">
                {[
                  '1️⃣  Owner will confirm your booking',
                  '2️⃣  You will receive full pickup address',
                  '3️⃣  Show your ID at pickup',
                  '4️⃣  Enjoy your ride!',
                ].map(s => (
                  <div key={s} className="text-xs text-blue-700 font-semibold">{s}</div>
                ))}
              </div>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="flex flex-col gap-2 pb-6">
            {booking.status === 'pending' && !isOwner && (
              <button onClick={handleCancel} disabled={cancelling}
                className="w-full py-3.5 rounded-2xl border-2 border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {cancelling
                  ? <><div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> Cancelling...</>
                  : <><XCircle size={15} /> Cancel Booking</>}
              </button>
            )}
            {booking.status === 'active' && (
              <button onClick={() => navigate('/track')}
                className="w-full py-3.5 rounded-2xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                📍 Track Live
              </button>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
