import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, CheckCircle, XCircle, Star, RefreshCw, MessageCircle } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { apiGetMyBookings, apiCancelBooking, apiRateBooking, apiCreateReview } from '../services/api';

const STATUS = {
  pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Clock size={12} /> },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700 border-green-200',   icon: <CheckCircle size={12} /> },
  active:    { label: 'Active',    color: 'bg-blue-100 text-blue-700 border-blue-200',       icon: <CheckCircle size={12} /> },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-600 border-gray-200',       icon: <CheckCircle size={12} /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-500 border-red-200',          icon: <XCircle size={12} /> },
};

const TABS = ['All', 'Pending', 'Active', 'Completed', 'Cancelled'];

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const { user }  = useAuth();

  const [bookings,  setBookings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [tab,       setTab]       = useState('All');
  const [cancelling, setCancelling] = useState(null);
  const [confirmId,  setConfirmId]  = useState(null);
  const [ratingId,   setRatingId]   = useState(null);
  const [stars,      setStars]      = useState(0);
  const [hoverStar,  setHoverStar]  = useState(0);
  const [review,     setReview]     = useState('');
  const [catRatings, setCatRatings] = useState({ cleanliness: 0, condition: 0, communication: 0, accuracy: 0, value: 0 });
  const [submitting, setSubmitting] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiGetMyBookings();
      if (res.success) setBookings(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancel = async (bookingId) => {
    setConfirmId(null);
    setCancelling(bookingId);
    try {
      await apiCancelBooking(bookingId);
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  };

  const openRating = (bookingId) => {
    setRatingId(bookingId);
    setStars(0);
    setHoverStar(0);
    setReview('');
    setCatRatings({ cleanliness: 0, condition: 0, communication: 0, accuracy: 0, value: 0 });
  };

  const handleRate = async () => {
    if (!stars) return;
    setSubmitting(true);
    try {
      // Save to Review collection (visible to owner) + update booking rating field
      const categories = Object.fromEntries(
        Object.entries(catRatings).filter(([, v]) => v > 0)
      );
      await apiCreateReview({ bookingId: ratingId, rating: stars, text: review, categories });
      setBookings(prev => prev.map(b =>
        b._id === ratingId ? { ...b, rating: { stars, review } } : b
      ));
      setRatingId(null);
    } catch (err) {
      alert(err.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = bookings.filter(b =>
    tab === 'All' ? true : b.status === tab.toLowerCase()
  );

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* ── Rating modal ─────────────────────────────────────────────── */}
        {ratingId && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full">
              <h3 className="text-base font-black text-gray-900 text-center mb-1">Rate your ride</h3>
              <p className="text-xs text-gray-500 text-center mb-5">How was your experience?</p>

              {/* Stars */}
              <div className="flex items-center justify-center gap-2 mb-5">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    onClick={() => setStars(s)}
                    onMouseEnter={() => setHoverStar(s)}
                    onMouseLeave={() => setHoverStar(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={36}
                      className={`transition-colors ${s <= (hoverStar || stars) ? 'text-yellow-400' : 'text-gray-200'}`}
                      fill={s <= (hoverStar || stars) ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
              </div>

              {/* Star label */}
              {(hoverStar || stars) > 0 && (
                <p className="text-center text-sm font-bold text-yellow-500 mb-3">
                  {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][(hoverStar || stars)]}
                </p>
              )}

              {/* Category ratings */}
              <div className="space-y-2 mb-4">
                {[['cleanliness','🧹 Cleanliness'],['condition','🔧 Condition'],['communication','💬 Communication'],['accuracy','✅ Accuracy'],['value','💰 Value']].map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 w-32">{label}</span>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} onClick={() => setCatRatings(p => ({ ...p, [key]: s }))}>
                          <Star size={14} className={s <= catRatings[key] ? 'text-yellow-400' : 'text-gray-200'} fill={s <= catRatings[key] ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Review text */}
              <textarea
                value={review}
                onChange={e => setReview(e.target.value)}
                placeholder="Write a review (optional)..."
                rows={2}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none mb-4"
              />

              <div className="flex gap-3">
                <button onClick={() => setRatingId(null)}
                  className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                  Cancel
                </button>
                <button
                  onClick={handleRate}
                  disabled={!stars || submitting}
                  className="flex-1 py-2.5 rounded-2xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting
                    ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Submitting...</>
                    : <><Star size={14} fill="white" /> Submit Rating</>
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm cancel modal */}
        {confirmId && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <XCircle size={24} className="text-red-500" />
              </div>
              <h3 className="text-base font-black text-gray-900 text-center mb-1">Cancel Booking?</h3>
              <p className="text-sm text-gray-500 text-center mb-5">
                This action cannot be undone. You can only cancel pending bookings — once the owner confirms, cancellation is not allowed.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmId(null)}
                  className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                  Keep Booking
                </button>
                <button onClick={() => handleCancel(confirmId)}
                  className="flex-1 py-2.5 rounded-2xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all">
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-5 sticky top-0 z-30">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-gray-900">My Bookings</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {loading ? 'Loading...' : `${bookings.length} total booking${bookings.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button onClick={fetchBookings} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-orange-300 hover:text-orange-600 transition-all disabled:opacity-50">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  tab === t ? 'bg-orange-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
                }`}>
                {t}
                {t !== 'All' && (
                  <span className="ml-1 opacity-70">
                    ({bookings.filter(b => b.status === t.toLowerCase()).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
              <RefreshCw size={20} className="animate-spin" />
              <span className="text-sm font-semibold">Loading your bookings...</span>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
              <p className="text-red-600 font-semibold text-sm">{error}</p>
              <button onClick={fetchBookings} className="mt-3 text-xs text-red-500 font-bold hover:underline">
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-4xl mb-5">📋</div>
              <h3 className="text-lg font-black text-gray-900 mb-1">
                No {tab === 'All' ? '' : tab.toLowerCase()} bookings yet
              </h3>
              <p className="text-gray-500 text-sm mb-6 max-w-xs">
                {tab === 'All'
                  ? `Hey ${firstName}, your bookings will appear here once you rent a vehicle.`
                  : `No ${tab.toLowerCase()} bookings to show.`}
              </p>
              {tab === 'All' && (
                <button onClick={() => navigate('/rent')}
                  className="btn-primary px-6 py-3 text-white font-bold rounded-2xl text-sm">
                  Browse Vehicles →
                </button>
              )}
            </div>
          )}

          {/* Booking cards */}
          {!loading && !error && filtered.length > 0 && (
            <div className="space-y-4">
              {filtered.map(b => {
                const st = STATUS[b.status] || STATUS.pending;
                // Vehicle info from populated field or snapshot
                const v = b.vehicleId || {};
                const snap = b.vehicleSnapshot || {};
                const vName  = v.brand ? `${v.brand} ${v.model}` : snap.name  || 'Vehicle';
                const vImage = v.photos?.[0]?.url || snap.image || null;
                const vCity  = v.city  || snap.city  || '';
                const vArea  = v.area  || snap.area  || '';
                const bookingRef = `WS${b._id.toString().slice(-8).toUpperCase()}`;

                return (
                  <div key={b._id}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
                  >
                    <div className="flex gap-4 p-5">
                      {/* Vehicle image */}
                      <div className="w-24 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {vImage
                          ? <img src={vImage} alt={vName} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-2xl">
                              {snap.type === 'bike' ? '🏍️' : '🚗'}
                            </div>
                        }
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Name + status */}
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <h3 className="font-black text-gray-900 text-sm">{vName}</h3>
                            {(vCity || vArea) && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                <MapPin size={11} className="text-orange-400" />
                                {vArea ? `${vArea}, ` : ''}{vCity}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${st.color}`}>
                              {st.icon} {st.label}
                            </div>
                            <button onClick={() => navigate(`/booking/${b._id}`)}
                              className="text-xs font-bold text-orange-500 hover:text-orange-600 hover:underline whitespace-nowrap">
                              View Detail →
                            </button>
                          </div>
                        </div>

                        {/* Dates + total */}
                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} className="text-blue-400" />
                            {b.startDate} → {b.endDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} className="text-green-400" />
                            {b.days} day{b.days > 1 ? 's' : ''}
                          </span>
                          <span className="font-black text-orange-500">
                            ₹{Number(b.total).toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Actions row */}
                        <div className="flex items-center gap-2 mt-3 flex-wrap" onClick={e => e.stopPropagation()}>
                          <span className="text-xs text-gray-400 font-mono">{bookingRef}</span>

                          {/* Chat with owner — available once booking is confirmed */}
                          {['confirmed', 'active', 'completed'].includes(b.status) && (
                            <button onClick={() => navigate(`/chat/${b._id}`)}
                              className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full hover:bg-blue-100 transition-all flex items-center gap-1">
                              <MessageCircle size={10} /> Chat with Owner
                            </button>
                          )}

                          {b.status === 'active' && (
                            <button onClick={() => navigate('/track')}
                              className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full hover:bg-blue-100 transition-all">
                              📍 Track Live
                            </button>
                          )}
                          {b.status === 'completed' && (
                            b.rating?.stars
                              ? /* Already rated — show stars */
                                <div className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full">
                                  {[1,2,3,4,5].map(s => (
                                    <Star key={s} size={10} className={s <= b.rating.stars ? 'text-yellow-400' : 'text-gray-300'} fill={s <= b.rating.stars ? 'currentColor' : 'none'} />
                                  ))}
                                  <span className="ml-1">{b.rating.stars}/5</span>
                                </div>
                              : /* Not yet rated */
                                <button
                                  onClick={() => openRating(b._id)}
                                  className="text-xs font-bold text-yellow-600 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full hover:bg-yellow-100 transition-all flex items-center gap-1"
                                >
                                  <Star size={10} /> Rate this ride
                                </button>
                          )}

                          {/* Cancel — only allowed when Pending */}
                          {b.status === 'pending' && (
                            <button
                              onClick={() => setConfirmId(b._id)}
                              disabled={cancelling === b._id}
                              className="text-xs font-bold text-red-500 bg-red-50 border border-red-200 px-3 py-1 rounded-full hover:bg-red-100 transition-all flex items-center gap-1 disabled:opacity-50"
                            >
                              {cancelling === b._id
                                ? <><div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" /> Cancelling...</>
                                : <><XCircle size={10} /> Cancel</>}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
