import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, CheckCircle, XCircle, MessageCircle, RefreshCw, Star } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { apiGetOwnerBookings, apiAcceptBooking, apiRejectBooking, apiCompleteBooking } from '../services/api';

const STATUS = {
  pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700 border-green-200' },
  active:    { label: 'Active',    color: 'bg-blue-100 text-blue-700 border-blue-200' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-500 border-red-200' },
};

export default function OwnerBookingsPage() {
  const navigate = useNavigate();
  const [bookings,  setBookings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [acting,    setActing]    = useState(null);
  const [tab,       setTab]       = useState('All');
  const [fullReview, setFullReview] = useState(null); // review object for modal

  const fetch_ = async () => {
    setLoading(true);
    try {
      const res = await apiGetOwnerBookings();
      if (res.success) setBookings(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch_(); }, []);

  const act = async (id, action, reason = '') => {
    setActing(id + action);
    try {
      let res;
      if (action === 'accept')   res = await apiAcceptBooking(id);
      if (action === 'reject')   res = await apiRejectBooking(id, reason);
      if (action === 'complete') res = await apiCompleteBooking(id);
      if (res?.success) {
        setBookings(prev => prev.map(b => b._id === id ? { ...b, status: res.data.status } : b));
      }
    } catch (err) { alert(err.message); }
    finally { setActing(null); }
  };

  const filtered = bookings.filter(b => tab === 'All' || b.status === tab.toLowerCase());
  const TABS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">

        {/* Full review modal */}
        {fullReview && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setFullReview(null)}>
            <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-gray-900">Renter's Review</h3>
                <button onClick={() => setFullReview(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
              </div>
              {/* Stars */}
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={20} className={s <= fullReview.rating ? 'text-yellow-400' : 'text-gray-200'} fill="currentColor" />
                ))}
                <span className="ml-2 text-sm font-black text-gray-700">{fullReview.rating}/5</span>
              </div>
              {/* Review text */}
              {fullReview.text && <p className="text-sm text-gray-600 leading-relaxed mb-4">"{fullReview.text}"</p>}
              {/* Category breakdown */}
              {fullReview.categories && Object.values(fullReview.categories).some(Boolean) && (
                <div className="space-y-2 border-t border-gray-100 pt-4">
                  {[['cleanliness','🧹 Cleanliness'],['condition','🔧 Condition'],['communication','💬 Communication'],['accuracy','✅ Accuracy'],['value','💰 Value']]
                    .filter(([k]) => fullReview.categories[k])
                    .map(([k, label]) => (
                      <div key={k} className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">{label}</span>
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={11} className={s <= fullReview.categories[k] ? 'text-yellow-400' : 'text-gray-200'} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-4">
                {new Date(fullReview.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        )}
        <div className="bg-white border-b border-gray-100 px-6 py-5 sticky top-0 z-30">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-gray-900">Booking Requests</h1>
              <p className="text-xs text-gray-500 mt-0.5">{bookings.filter(b => b.status === 'pending').length} pending action</p>
            </div>
            <button onClick={fetch_} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-orange-300 transition-all disabled:opacity-50">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${tab === t ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'}`}>
                {t} {t !== 'All' && `(${bookings.filter(b => b.status === t.toLowerCase()).length})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
              <RefreshCw size={20} className="animate-spin" />
              <span className="text-sm font-semibold">Loading bookings...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📋</div>
              <p className="font-bold text-gray-700">No {tab.toLowerCase()} bookings</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(b => {
                const st   = STATUS[b.status] || STATUS.pending;
                const snap = b.vehicleSnapshot || {};
                const renter = b.userId || {};
                const vName  = snap.name || 'Vehicle';
                const vImage = snap.image || null;

                return (
                  <div key={b._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                    <div className="p-5 space-y-4">
                      {/* Vehicle + renter */}
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                          {vImage
                            ? <img src={vImage} alt={vName} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-2xl">{snap.type === 'bike' ? '🏍️' : '🚗'}</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <h3 className="font-black text-gray-900 text-sm">{vName}</h3>
                              {snap.city && (
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                  <MapPin size={10} className="text-orange-400" /> {snap.area ? `${snap.area}, ` : ''}{snap.city}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${st.color}`}>{st.label}</span>
                              <button onClick={() => navigate(`/booking/${b._id}`)}
                                className="text-xs font-bold text-orange-500 hover:text-orange-600 hover:underline whitespace-nowrap">
                                View Detail →
                              </button>
                            </div>
                          </div>

                          {/* Renter info */}
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center text-xs font-black text-violet-600">
                              {renter.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <span className="text-xs font-bold text-gray-700">{renter.name || 'Renter'}</span>
                            {renter.phone && <span className="text-xs text-gray-400">{renter.phone}</span>}
                          </div>

                          {/* Dates */}
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600">
                            <span className="flex items-center gap-1"><Calendar size={10} className="text-blue-400" /> {b.startDate} → {b.endDate}</span>
                            <span className="flex items-center gap-1"><Clock size={10} className="text-green-400" /> {b.days} day{b.days > 1 ? 's' : ''}</span>
                            <span className="font-black text-orange-500">₹{Number(b.total).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Review from renter — shown on completed bookings */}
                      {b.review && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3 flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex items-center gap-0.5">
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} size={12}
                                    className={s <= b.review.rating ? 'text-yellow-400' : 'text-gray-300'}
                                    fill="currentColor" />
                                ))}
                              </div>
                              <span className="text-xs font-black text-yellow-700">{b.review.rating}/5</span>
                              <span className="text-xs text-gray-400">by {renter.name?.split(' ')[0]}</span>
                            </div>
                            {b.review.text && (
                              <p className="text-xs text-gray-600 truncate">"{b.review.text}"</p>
                            )}
                          </div>
                          <button
                            onClick={() => setFullReview(b.review)}
                            className="text-xs font-bold text-yellow-700 hover:text-yellow-800 whitespace-nowrap flex-shrink-0 underline"
                          >
                            View full
                          </button>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100" onClick={e => e.stopPropagation()}>

                        {/* Chat button — always visible */}
                        <button
                          onClick={() => navigate(`/chat/${b._id}`)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all"
                        >
                          <MessageCircle size={13} /> Chat
                        </button>

                        {b.status === 'pending' && (
                          <>
                            <button
                              onClick={() => act(b._id, 'accept')}
                              disabled={acting === b._id + 'accept'}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-all disabled:opacity-60 shadow-sm"
                            >
                              {acting === b._id + 'accept'
                                ? <><div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Accepting...</>
                                : <><CheckCircle size={13} /> Accept</>}
                            </button>
                            <button
                              onClick={() => act(b._id, 'reject')}
                              disabled={acting === b._id + 'reject'}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold hover:bg-red-100 transition-all disabled:opacity-60"
                            >
                              {acting === b._id + 'reject'
                                ? <><div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> Rejecting...</>
                                : <><XCircle size={13} /> Reject</>}
                            </button>
                          </>
                        )}

                        {(b.status === 'confirmed' || b.status === 'active') && (
                          <button
                            onClick={() => act(b._id, 'complete')}
                            disabled={acting === b._id + 'complete'}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all disabled:opacity-60 shadow-sm"
                          >
                            {acting === b._id + 'complete'
                              ? <><div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Completing...</>
                              : '✅ Mark Complete'}
                          </button>
                        )}
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
