import { SlidersHorizontal, X, Star } from 'lucide-react';

const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric'];
const SEAT_OPTIONS = ['2', '5', '7'];
const TAG_OPTIONS = ['Insured', 'AC', 'Top Rated', 'Budget Pick', 'EV', 'Sports', 'Premium'];

export default function FilterSidebar({ filters, setFilters, total, onReset, mobileOpen, setMobileOpen }) {
  const set = (key) => (val) => setFilters(f => ({ ...f, [key]: val }));

  const toggleFuel = (fuel) => {
    setFilters(f => ({
      ...f,
      fuel: f.fuel.includes(fuel) ? f.fuel.filter(x => x !== fuel) : [...f.fuel, fuel],
    }));
  };

  const toggleTag = (tag) => {
    setFilters(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(x => x !== tag) : [...f.tags, tag],
    }));
  };

  const content = (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-orange-500" />
          <span className="font-black text-gray-900 text-sm">Filters</span>
          <span className="text-xs bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">{total} results</span>
        </div>
        <button onClick={onReset} className="text-xs text-gray-400 hover:text-orange-500 font-semibold transition-colors">
          Reset all
        </button>
      </div>

      {/* Tags */}
      <div>
        <span className="text-sm font-bold text-gray-800 block mb-3">Features</span>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                filters.tags.includes(tag)
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'border-gray-200 text-gray-600 hover:border-blue-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => set('availableOnly')(!filters.availableOnly)}
            className={`w-11 h-6 rounded-full transition-all relative ${filters.availableOnly ? 'bg-green-500' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${filters.availableOnly ? 'left-6' : 'left-1'}`} />
          </div>
          <span className="text-sm font-semibold text-gray-700">Available only</span>
        </label>
      </div>

      {/* Available Now toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => set('availableNow')(!filters.availableNow)}
            className={`w-11 h-6 rounded-full transition-all relative ${filters.availableNow ? 'bg-orange-500' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${filters.availableNow ? 'left-6' : 'left-1'}`} />
          </div>
          <span className="text-sm font-semibold text-gray-700">⚡ Available Now</span>
        </label>
      </div>

      {/* Booking Type */}
      <div>
        <span className="text-sm font-bold text-gray-800 block mb-3">Booking Type</span>
        <div className="flex flex-col gap-2">
          {[
            { val: 'all',     label: 'All' },
            { val: 'instant', label: '⚡ Instant only' },
            { val: 'advance', label: '📅 Advance allowed' },
          ].map(opt => (
            <button key={opt.val} onClick={() => set('bookingType')(opt.val)}
              className={`text-xs font-bold px-3 py-2 rounded-xl border text-left transition-all ${
                filters.bookingType === opt.val
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'border-gray-200 text-gray-600 hover:border-orange-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <span className="text-sm font-bold text-gray-800 block mb-3">Duration</span>
        <div className="flex gap-2 flex-wrap">
          {[
            { val: 0, label: 'Any' },
            { val: 1, label: '1 hr' },
            { val: 2, label: '2 hr' },
            { val: 3, label: '3 hr' },
          ].map(opt => (
            <button key={opt.val} onClick={() => set('duration')(opt.val)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                filters.duration === opt.val
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'border-gray-200 text-gray-600 hover:border-blue-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-800">Price per day</span>
          <span className="text-sm font-black text-orange-500">
            ₹{filters.priceMin} – ₹{filters.priceMax}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-6">Min</span>
            <input
              type="range" min={0} max={5000} step={100}
              value={filters.priceMin}
              onChange={e => set('priceMin')(Number(e.target.value))}
              className="flex-1 accent-orange-500 cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-6">Max</span>
            <input
              type="range" min={0} max={5000} step={100}
              value={filters.priceMax}
              onChange={e => set('priceMax')(Number(e.target.value))}
              className="flex-1 accent-orange-500 cursor-pointer"
            />
          </div>
        </div>
        {/* Quick price chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[['Under ₹500', 0, 499], ['₹500–₹1500', 500, 1500], ['₹1500+', 1500, 5000]].map(([label, min, max]) => (
            <button
              key={label}
              onClick={() => setFilters(f => ({ ...f, priceMin: min, priceMax: max }))}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                filters.priceMin === min && filters.priceMax === max
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'border-gray-200 text-gray-600 hover:border-orange-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Min rating */}
      <div>
        <span className="text-sm font-bold text-gray-800 block mb-3">Minimum Rating</span>
        <div className="flex flex-wrap gap-2">
          {[3, 3.5, 4, 4.5].map(r => (
            <button
              key={r}
              onClick={() => set('minRating')(r)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                filters.minRating === r
                  ? 'bg-yellow-400 text-white border-yellow-400 shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:border-yellow-300'
              }`}
            >
              <Star size={10} fill={filters.minRating === r ? 'white' : 'none'} />
              {r}+
            </button>
          ))}
        </div>
      </div>

      {/* Fuel type */}
      <div>
        <span className="text-sm font-bold text-gray-800 block mb-3">Fuel Type</span>
        <div className="space-y-2">
          {FUEL_TYPES.map(fuel => (
            <label key={fuel} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => toggleFuel(fuel)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  filters.fuel.includes(fuel)
                    ? 'bg-orange-500 border-orange-500'
                    : 'border-gray-300 group-hover:border-orange-300'
                }`}
              >
                {filters.fuel.includes(fuel) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-700 font-medium">{fuel}</span>
            </label>
          ))}
        </div>
      </div>

    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}} />

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto sidebar-scroll">
          {content}
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto animate-modal">
            <div className="flex items-center justify-between mb-6">
              <span className="font-black text-gray-900">Filters</span>
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <X size={15} />
              </button>
            </div>
            {content}
            <button
              onClick={() => setMobileOpen(false)}
              className="btn-primary w-full py-3 text-white font-bold rounded-2xl mt-6 text-sm"
            >
              Show {total} results
            </button>
          </div>
        </div>
      )}
    </>
  );
}
