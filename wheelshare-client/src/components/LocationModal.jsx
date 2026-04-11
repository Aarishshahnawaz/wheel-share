import { useState } from 'react';
import { MapPin, Navigation, Loader, Search, X } from 'lucide-react';
import { CITIES_WITH_STATE, getCityState } from '../data/cities';
import { useLocation_ } from '../context/LocationContext';

async function reverseGeocodeCity(lat, lng) {
  try {
    const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    const addr = data.address || {};
    const candidates = [addr.city, addr.town, addr.village, addr.state_district, addr.county].filter(Boolean);
    for (const raw of candidates) {
      const exact = CITIES_WITH_STATE.find(c => c.city.toLowerCase() === raw.toLowerCase());
      if (exact) return exact;
      const partial = CITIES_WITH_STATE.find(c => raw.toLowerCase().includes(c.city.toLowerCase()) || c.city.toLowerCase().includes(raw.toLowerCase().split(' ')[0]));
      if (partial) return partial;
    }
    // Not in list — create entry with detected name
    return { city: candidates[0] || '', state: addr.state || '' };
  } catch { return null; }
}

export default function LocationModal({ onClose }) {
  const { setLocation } = useLocation_();
  const [query,     setQuery]     = useState('');
  const [detecting, setDetecting] = useState(false);

  const filtered = query.length >= 1
    ? CITIES_WITH_STATE.filter(c =>
        c.city.toLowerCase().includes(query.toLowerCase()) ||
        c.state.toLowerCase().includes(query.toLowerCase())
      )
    : CITIES_WITH_STATE;

  const select = (cityObj) => {
    setLocation({ city: cityObj.city, state: cityObj.state, lat: null, lng: null });
    onClose?.();
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const cityObj = await reverseGeocodeCity(lat, lng);
        if (cityObj?.city) {
          setLocation({ city: cityObj.city, state: cityObj.state || getCityState(cityObj.city), lat, lng });
          onClose?.();
        } else {
          alert('Could not detect city. Please select manually.');
        }
        setDetecting(false);
      },
      () => { setDetecting(false); alert('Location access denied. Please select manually.'); },
      { timeout: 8000 }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-blue-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black">📍 Select your city</h2>
              <p className="text-white/80 text-xs mt-0.5">We'll show vehicles available near you</p>
            </div>
            {onClose && (
              <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                <X size={15} className="text-white" />
              </button>
            )}
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Use Current Location */}
          <button onClick={useCurrentLocation} disabled={detecting}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 border-orange-200 bg-orange-50 text-orange-700 font-bold text-sm hover:bg-orange-100 transition-all disabled:opacity-60">
            {detecting ? <Loader size={18} className="animate-spin flex-shrink-0" /> : <Navigation size={18} className="flex-shrink-0" />}
            {detecting ? 'Detecting your location...' : 'Use Current Location'}
          </button>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search city or state..."
              className="w-full pl-9 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* City list */}
          <div className="max-h-64 overflow-y-auto space-y-0.5 -mx-1 px-1">
            {filtered.length === 0
              ? <div className="text-center py-6 text-sm text-gray-400">No cities found</div>
              : filtered.map(c => (
                <button key={c.city} onClick={() => select(c)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-orange-50 transition-colors text-left group">
                  <div className="flex items-center gap-2.5">
                    <MapPin size={13} className="text-orange-400 flex-shrink-0" />
                    <span className="text-sm font-bold text-gray-800 group-hover:text-orange-600">{c.city}</span>
                  </div>
                  <span className="text-xs text-gray-400">{c.state}</span>
                </button>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
