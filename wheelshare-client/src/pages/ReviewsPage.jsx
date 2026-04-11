import { useState, useEffect } from 'react';
import { Star, ThumbsUp, RefreshCw } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useRole } from '../context/RoleContext';
import { apiGetOwnerReviews, apiGetMyReviews } from '../services/api';

const CATS = [
  { key: 'cleanliness',   label: 'Cleanliness',   emoji: '🧹' },
  { key: 'condition',     label: 'Condition',     emoji: '🔧' },
  { key: 'communication', label: 'Communication', emoji: '💬' },
  { key: 'accuracy',      label: 'Accuracy',      emoji: '✅' },
  { key: 'value',         label: 'Value',         emoji: '💰' },
];

function Stars({ rating, size = 13 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={size}
          className={s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}
          fill="currentColor" />
      ))}
    </div>
  );
}

function BreakdownBar({ label, emoji, value, max = 5 }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-28 flex items-center gap-1">{emoji} {label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-black text-gray-700 w-7 text-right">
        {value > 0 ? value.toFixed(1) : '—'}
      </span>
    </div>
  );
}

function ReviewCard({ review, showVehicle = true }) {
  const [helpful, setHelpful] = useState(false);
  const user    = review.userId || {};
  const vehicle = review.vehicleId || {};
  const vName   = vehicle.brand ? `${vehicle.brand} ${vehicle.model}` : 'Vehicle';
  const date    = new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 bg-gradient-to-br from-orange-100 to-blue-100 rounded-2xl flex items-center justify-center font-black text-orange-500 text-base flex-shrink-0 overflow-hidden">
          {user.profileImage
            ? <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
            : user.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="font-black text-gray-900 text-sm">{user.name || 'Renter'}</span>
              <span className="text-xs text-gray-400 ml-2">{date}</span>
            </div>
            <Stars rating={review.rating} />
          </div>
          {showVehicle && (
            <div className="text-xs text-orange-500 font-bold mt-0.5">{vName}</div>
          )}
          {review.text && (
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{review.text}</p>
          )}

          {/* Category breakdown if present */}
          {review.categories && Object.values(review.categories).some(Boolean) && (
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
              {CATS.filter(c => review.categories[c.key]).map(c => (
                <div key={c.key} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span>{c.emoji}</span>
                  <span>{c.label}:</span>
                  <Stars rating={review.categories[c.key]} size={10} />
                </div>
              ))}
            </div>
          )}

          <button onClick={() => setHelpful(h => !h)}
            className={`flex items-center gap-1.5 mt-3 text-xs font-bold transition-all ${helpful ? 'text-orange-500' : 'text-gray-400 hover:text-orange-400'}`}>
            <ThumbsUp size={11} fill={helpful ? 'currentColor' : 'none'} />
            Helpful
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const { role } = useRole();
  const [tab,     setTab]     = useState(role === 'owner' ? 'received' : 'given');
  const [reviews, setReviews] = useState([]);
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fn = tab === 'received' ? apiGetOwnerReviews : apiGetMyReviews;
    fn()
      .then(res => {
        if (res.success) {
          setReviews(res.data);
          if (res.stats) setStats(res.stats);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  // Compute stats from "given" reviews if no server stats
  const displayStats = stats || (() => {
    const total = reviews.length;
    const avg   = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
    return { total, average: Math.round(avg * 10) / 10, categories: {} };
  })();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-100 px-6 py-5 sticky top-0 z-30">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-black text-gray-900">Reviews ⭐</h1>
            <button onClick={() => setLoading(true)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">

          {/* Summary card */}
          {tab === 'received' && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start gap-6">
                {/* Big number */}
                <div className="text-center flex-shrink-0">
                  <div className="text-5xl font-black text-gray-900">{displayStats.average || '—'}</div>
                  <Stars rating={displayStats.average} size={14} />
                  <div className="text-xs text-gray-400 mt-1">{displayStats.total} review{displayStats.total !== 1 ? 's' : ''}</div>
                </div>

                {/* Breakdown bars */}
                <div className="flex-1 space-y-2.5">
                  {CATS.map(c => (
                    <BreakdownBar
                      key={c.key}
                      label={c.label}
                      emoji={c.emoji}
                      value={displayStats.categories?.[c.key] || 0}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2">
            {role === 'owner'
              ? [['received', `Received (${tab === 'received' ? displayStats.total : '…'})`]].map(([v, l]) => (
                  <button key={v} onClick={() => setTab(v)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === v ? 'bg-orange-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'}`}>
                    {l}
                  </button>
                ))
              : [['given', 'Reviews Given'], ['received', 'Reviews Received']].map(([v, l]) => (
                  <button key={v} onClick={() => setTab(v)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === v ? 'bg-orange-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'}`}>
                    {l}
                  </button>
                ))
            }
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
              <RefreshCw size={20} className="animate-spin" />
              <span className="text-sm font-semibold">Loading reviews...</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-yellow-50 rounded-3xl flex items-center justify-center text-4xl mb-5">⭐</div>
              <h3 className="text-lg font-black text-gray-900 mb-1">No reviews yet</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                {tab === 'received'
                  ? 'Reviews from renters will appear here after completed trips.'
                  : 'Rate your completed rides to see them here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => <ReviewCard key={r._id} review={r} showVehicle />)}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
