import { Star } from 'lucide-react';

function StarBar({ label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-20 text-right">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full" style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-700 w-6">{(value / 20).toFixed(1)}</span>
    </div>
  );
}

export default function ReviewsSection({ vehicle }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-black text-gray-900 text-base">
          Reviews <span className="text-gray-400 font-semibold text-sm">({vehicle.reviews})</span>
        </h3>
        <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-200">
          <Star size={14} className="text-yellow-500" fill="currentColor" />
          <span className="font-black text-gray-900">{vehicle.rating}</span>
          <span className="text-gray-400 text-xs">/ 5</span>
        </div>
      </div>

      {/* Rating breakdown */}
      <div className="space-y-2 mb-7 p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <StarBar label="Cleanliness" value={96} />
        <StarBar label="Condition" value={92} />
        <StarBar label="Accuracy" value={94} />
        <StarBar label="Owner" value={98} />
        <StarBar label="Value" value={88} />
      </div>

      {/* Review list */}
      <div className="space-y-5">
        {vehicle.reviewList.map((r, i) => (
          <div key={i} className="flex gap-4 pb-5 border-b border-gray-100 last:border-0 last:pb-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-blue-100 flex items-center justify-center text-xl flex-shrink-0">
              {r.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-gray-900 text-sm">{r.name}</span>
                <span className="text-xs text-gray-400">{r.date}</span>
              </div>
              <div className="flex items-center gap-0.5 mt-1 mb-2">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={11} className={j < r.rating ? 'text-yellow-400' : 'text-gray-200'} fill="currentColor" />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-5 w-full py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:border-orange-300 hover:text-orange-500 transition-all">
        View all {vehicle.reviews} reviews
      </button>
    </div>
  );
}
