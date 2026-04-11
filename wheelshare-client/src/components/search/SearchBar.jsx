import { useState, useRef, useEffect } from 'react';
import { MapPin, Calendar, Clock, Search, Navigation, Loader, ChevronDown, X } from 'lucide-react';
import { INDIA_CITIES, CITIES_WITH_STATE, getCityState } from '../../data/cities';

// Reverse geocode lat/lng → city name
async function reverseGeocode(lat, lng) {
  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const addr = data.address || {};
    const candidates = [addr.city, addr.town, addr.village, addr.state_district, addr.county].filter(Boolean);
    // Try exact match first, then partial
    for (const raw of candidates) {
      const exact = INDIA_CITIES.find(c => c.toLowerCase() === raw.toLowerCase());
      if (exact) return exact;
      const partial = INDIA_CITIES.find(c => raw.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(raw.toLowerCase().split(' ')[0]));
      if (partial) return partial;
    }
    return candidates[0] || ''; // fallback: use raw detected name
  } catch {
    return '';
  }
}

// Searchable city dropdown with state labels
function CityDropdown({ value, onChange }) {
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState('');
  const [locating, setLocating] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filter by city name or state
  const filtered = CITIES_WITH_STATE.filter(c =>
    c.city.toLowerCase().includes(query.toLowerCase()) ||
    c.state.toLowerCase().includes(query.toLowerCase())
  );

  const select = (city) => {
    onChange(city);
    localStorage.setItem('userCity', city);
    setOpen(false);
    setQuery('');
  };
  const clear = (e) => { e.stopPropagation(); onChange(''); localStorage.removeItem('userCity'); setQuery(''); };

  const useLocation = async (e) => {
    e.stopPropagation();
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const city = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        if (city) select(city);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  };

  const stateLabel = getCityState(value || '');
  const displayText = value
    ? (stateLabel ? `${value}, ${stateLabel}` : value)
    : 'All Cities';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 pl-9 pr-3 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold text-left focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all hover:border-orange-300"
      >
        <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none" />
        <span className={`flex-1 truncate ${value ? 'text-gray-800' : 'text-gray-400'}`}>
          {displayText}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {value && (
            <button onClick={clear} className="text-gray-400 hover:text-gray-600 p-0.5 rounded">
              <X size={12} />
            </button>
          )}
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search city or state..."
                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          <button onClick={useLocation} disabled={locating}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition-colors border-b border-gray-100 disabled:opacity-60">
            {locating ? <Loader size={14} className="animate-spin" /> : <Navigation size={14} />}
            {locating ? 'Detecting location...' : 'Use Current Location'}
          </button>

          <button onClick={() => select('')}
            className={`w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-orange-50 transition-colors ${!value ? 'text-orange-600 bg-orange-50' : 'text-gray-600'}`}>
            🌍 All Cities
          </button>

          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0
              ? <div className="px-4 py-3 text-sm text-gray-400 text-center">No cities found</div>
              : filtered.map(c => (
                <button key={c.city} onClick={() => select(c.city)}
                  className={`w-full text-left px-4 py-2.5 hover:bg-orange-50 transition-colors flex items-center justify-between
                    ${value === c.city ? 'text-orange-600 bg-orange-50' : 'text-gray-700'}`}>
                  <span className="text-sm font-semibold">📍 {c.city}</span>
                  <span className="text-xs text-gray-400">{c.state}</span>
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchBar({ filters, setFilters, onSearch }) {
  const set = (key) => (e) => setFilters(f => ({ ...f, [key]: e.target.value }));

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-5">
      {/* Vehicle type toggle */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { val: 'all',  label: 'All Vehicles', emoji: '🚦' },
          { val: 'bike', label: 'Bikes',         emoji: '🏍️' },
          { val: 'car',  label: 'Cars',          emoji: '🚗' },
        ].map(t => (
          <button
            key={t.val}
            onClick={() => setFilters(f => ({ ...f, type: t.val }))}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              filters.type === t.val
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Search fields */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* City — searchable with location detection */}
        <CityDropdown
          value={filters.city}
          onChange={city => setFilters(f => ({ ...f, city }))}
        />

        {/* Date */}
        <div className="relative">
          <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" />
          <input
            type="date"
            value={filters.date}
            onChange={set('date')}
            min={new Date().toISOString().split('T')[0]}
            className="w-full pl-9 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Time */}
        <div className="relative">
          <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-400 pointer-events-none" />
          <input
            type="time"
            value={filters.time}
            onChange={set('time')}
            className="w-full pl-9 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Search button */}
        <button
          onClick={onSearch}
          className="btn-primary flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-bold text-sm shadow-md"
        >
          <Search size={16} /> Search Vehicles
        </button>
      </div>
    </div>
  );
}
