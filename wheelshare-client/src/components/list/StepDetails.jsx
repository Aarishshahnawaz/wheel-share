import { useState } from 'react';
import { AlertCircle, Navigation, Loader, MapPin } from 'lucide-react';
import { INDIA_CITIES } from '../../data/cities';

const BIKE_BRANDS = ['Royal Enfield', 'Honda', 'Bajaj', 'TVS', 'Hero', 'Yamaha', 'Suzuki', 'KTM', 'Kawasaki', 'Ather', 'Ola Electric', 'Other'];
const CAR_BRANDS  = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Honda', 'Toyota', 'Kia', 'MG', 'Volkswagen', 'Skoda', 'Renault', 'Nissan', 'Other'];
const FUEL_TYPES  = ['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'];

const BIKE_FEATURES = [
  { id: 'helmet',       label: '⛑️ Helmet included' },
  { id: 'self_start',   label: '🔑 Self start' },
  { id: 'abs',          label: '🛞 ABS' },
  { id: 'disc_brake',   label: '🔴 Disc brake' },
  { id: 'mobile_holder',label: '📱 Mobile holder' },
  { id: 'full_tank',    label: '⛽ Full tank' },
  { id: 'insured',      label: '🛡️ Insured' },
  { id: 'usb_charge',   label: '🔌 USB charging' },
];

const CAR_FEATURES = [
  { id: 'ac',            label: '❄️ AC' },
  { id: 'gps',           label: '📍 GPS' },
  { id: 'bluetooth',     label: '🎵 Bluetooth' },
  { id: 'sunroof',       label: '🌤️ Sunroof' },
  { id: 'reverse_cam',   label: '📷 Reverse camera' },
  { id: 'child_seat',    label: '👶 Child seat' },
  { id: 'airbags',       label: '💨 Airbags' },
  { id: 'full_tank',     label: '⛽ Full tank' },
  { id: 'insured',       label: '🛡️ Insured' },
  { id: 'cruise_ctrl',   label: '🚀 Cruise control' },
];

function CityDropdown({ value, onChange, error }) {
  const [query, setQuery] = useState('');
  const [open,  setOpen]  = useState(false);

  // Show all 28 cities when empty, filter when typing
  const filtered = query.length >= 1
    ? INDIA_CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, 20)
    : INDIA_CITIES; // show ALL cities when no query

  const select = (city) => { onChange(city); setOpen(false); setQuery(''); };

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setOpen(true);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query || value || ''}
        onChange={handleInput}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Type or select city..."
        className={`w-full px-4 py-3 rounded-2xl border bg-gray-50 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all
          ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
      />

      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden max-h-52 overflow-y-auto">
          {filtered.length === 0
            ? <div className="px-4 py-3 text-sm text-gray-400 text-center">No cities found</div>
            : filtered.map(c => (
              <button key={c} type="button" onMouseDown={() => select(c)}
                className={`w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-orange-50 hover:text-orange-600 transition-colors
                  ${value === c ? 'bg-orange-50 text-orange-600' : 'text-gray-700'}`}
              >
                📍 {c}
              </button>
            ))
          }
        </div>
      )}
    </div>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5 text-red-500 text-xs font-semibold">
      <AlertCircle size={11} /> {msg}
    </div>
  );
}

export default function StepDetails({ details, setDetails, errors = {} }) {
  const isBike = details.type === 'bike';
  const brands = isBike ? BIKE_BRANDS : CAR_BRANDS;
  const features = isBike ? BIKE_FEATURES : CAR_FEATURES;
  const [detecting,   setDetecting]   = useState(false);
  const [addrSuggestions, setAddrSuggestions] = useState([]);
  const [showMapModal,    setShowMapModal]    = useState(false);
  const addrTimer = useState(null);

  const set = k => v => setDetails(d => ({ ...d, [k]: v }));
  const setE = k => e => set(k)(e.target.value);
  const isPersonal = (details.ownerListingType || 'business') === 'personal';

  // ── Use Current Location (button-only, NOT on mount) ──────────────────────
  const useCurrentLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setDetails(d => ({ ...d, lat, lng }));
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { 'Accept-Language': 'en' } });
          const data = await res.json();
          const addr = data.address || {};

          // Extract city — check multiple fields in order
          const candidates = [
            addr.city, addr.town, addr.village,
            addr.state_district, addr.county, addr.suburb,
          ].filter(Boolean);

          // Try to match against our city list (flexible matching)
          let matchedCity = null;
          for (const candidate of candidates) {
            const cLower = candidate.toLowerCase().trim();
            // Exact match first
            const exact = INDIA_CITIES.find(c => c.toLowerCase() === cLower);
            if (exact) { matchedCity = exact; break; }
            // Partial match — city list contains candidate word
            const partial = INDIA_CITIES.find(c =>
              cLower.includes(c.toLowerCase()) || c.toLowerCase().includes(cLower.split(' ')[0])
            );
            if (partial) { matchedCity = partial; break; }
          }

          if (matchedCity) {
            setDetails(d => ({ ...d, city: matchedCity }));
          } else {
            // No match in predefined list — set directly as free text
            const detectedCity = candidates[0] || '';
            if (detectedCity) setDetails(d => ({ ...d, city: detectedCity }));
          }

          // Fill pickup address separately (street-level, not city)
          const streetParts = [addr.road, addr.neighbourhood, addr.suburb, addr.village || addr.town].filter(Boolean);
          const fullAddr = streetParts.join(', ');
          if (fullAddr) setDetails(d => ({ ...d, address: fullAddr }));

        } catch { /* ignore network errors */ }
        setDetecting(false);
      },
      () => { setDetecting(false); alert('Could not get location. Please select city manually.'); },
      { timeout: 8000 }
    );
  };

  // ── Address autocomplete via Nominatim ────────────────────────────────────
  const handleAddressChange = (e) => {
    const val = e.target.value;
    set('address')(val);
    if (addrTimer[0]) clearTimeout(addrTimer[0]);
    if (val.length < 4) { setAddrSuggestions([]); return; }
    addrTimer[0] = setTimeout(async () => {
      try {
        const city = details.city ? `&city=${encodeURIComponent(details.city)}` : '';
        const res  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}${city}&countrycodes=in&format=json&limit=5`, { headers: { 'Accept-Language': 'en' } });
        const data = await res.json();
        setAddrSuggestions(data.map(r => ({ label: r.display_name.split(',').slice(0, 3).join(','), lat: r.lat, lng: r.lon })));
      } catch { setAddrSuggestions([]); }
    }, 500);
  };

  const selectSuggestion = (s) => {
    setDetails(d => ({ ...d, address: s.label, lat: Number(s.lat), lng: Number(s.lng) }));
    setAddrSuggestions([]);
  };

  const switchType = (type) => {
    setDetails(d => ({ ...d, type, brand: '', features: [], seats: '' }));
  };

  const toggleFeature = (id) => {
    setDetails(d => ({
      ...d,
      features: d.features.includes(id)
        ? d.features.filter(x => x !== id)
        : [...d.features, id],
    }));
  };

  const inputCls = (field) =>
    `w-full px-4 py-3 rounded-2xl border bg-gray-50 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all
    ${errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-200'}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-gray-900">Vehicle details</h2>
        <p className="text-gray-500 text-sm mt-1">Accurate details build trust with renters</p>
      </div>

      {/* Listing Type — NEW */}
      <div>
        <label className="text-sm font-bold text-gray-700 block mb-3">Listing Type</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { val: 'personal', emoji: '👤', label: 'Personal',  sub: 'Earn from idle vehicle (hourly, time-based)' },
            { val: 'business', emoji: '🏢', label: 'Business',  sub: 'Rental business with full flexibility' },
          ].map(opt => (
            <button key={opt.val} type="button"
              onClick={() => set('ownerListingType')(opt.val)}
              className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all
                ${(details.ownerListingType || 'business') === opt.val
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-gray-100 hover:border-gray-200 bg-white'}`}
            >
              <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
              <div>
                <div className={`text-sm font-black ${(details.ownerListingType || 'business') === opt.val ? 'text-orange-700' : 'text-gray-800'}`}>{opt.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{opt.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Type toggle */}
      <div>
        <label className="text-sm font-bold text-gray-700 block mb-2">Vehicle Type <span className="text-red-400">*</span></label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { val: 'bike', emoji: '🏍️', label: 'Bike / Scooter' },
            { val: 'car',  emoji: '🚗', label: 'Car' },
          ].map(t => (
            <button key={t.val} type="button" onClick={() => switchType(t.val)}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 font-bold text-sm transition-all
                ${details.type === t.val
                  ? 'border-orange-400 bg-orange-50 text-orange-700 shadow-sm'
                  : 'border-gray-100 text-gray-600 hover:border-gray-200 bg-white'}`}
            >
              <span className="text-2xl">{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Brand & Model */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">Brand <span className="text-red-400">*</span></label>
          <select value={details.brand} onChange={setE('brand')} className={inputCls('brand')}>
            <option value="">Select brand</option>
            {brands.map(b => <option key={b}>{b}</option>)}
          </select>
          <FieldError msg={errors.brand} />
        </div>
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">Model Name <span className="text-red-400">*</span></label>
          <input value={details.model} onChange={setE('model')}
            placeholder={isBike ? 'e.g. Classic 350, Activa 6G' : 'e.g. Swift Dzire, Creta'}
            className={inputCls('model')} />
          <FieldError msg={errors.model} />
        </div>
      </div>

      {/* Year + Fuel + Seats (car only) */}
      <div className={`grid gap-4 ${isBike ? 'grid-cols-2' : 'grid-cols-3'}`}>
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">Year <span className="text-red-400">*</span></label>
          <select value={details.year} onChange={setE('year')} className={inputCls('year')}>
            <option value="">Select year</option>
            {Array.from({ length: 12 }, (_, i) => 2025 - i).map(y => <option key={y}>{y}</option>)}
          </select>
          <FieldError msg={errors.year} />
        </div>
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">Fuel Type <span className="text-red-400">*</span></label>
          <select value={details.fuel} onChange={setE('fuel')} className={inputCls('fuel')}>
            <option value="">Select fuel</option>
            {FUEL_TYPES.map(f => <option key={f}>{f}</option>)}
          </select>
          <FieldError msg={errors.fuel} />
        </div>

        {/* Seats — CAR ONLY */}
        {!isBike && (
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Seats <span className="text-red-400">*</span></label>
            <select value={details.seats} onChange={setE('seats')} className={inputCls('seats')}>
              <option value="">Select seats</option>
              {[4, 5, 6, 7, 8].map(s => <option key={s}>{s}</option>)}
            </select>
            <FieldError msg={errors.seats} />
          </div>
        )}
      </div>

      {/* City + Address + Landmark */}
      <div className="space-y-4">
        {/* City — manual select + "Use Current Location" button */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-gray-700">City <span className="text-red-400">*</span></label>
            <button type="button" onClick={useCurrentLocation} disabled={detecting}
              className="flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-600 disabled:opacity-50 transition-colors">
              {detecting ? <Loader size={12} className="animate-spin" /> : <Navigation size={12} />}
              {detecting ? 'Detecting...' : 'Use Current Location'}
            </button>
          </div>
          <CityDropdown value={details.city} onChange={v => set('city')(v)} error={errors.city} />
          <FieldError msg={errors.city} />
        </div>

        {/* Pickup Address with autocomplete */}
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">
            Pickup Address <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <MapPin size={14} className="absolute left-3.5 top-3.5 text-orange-400 pointer-events-none z-10" />
            <input
              value={details.address || ''}
              onChange={handleAddressChange}
              onBlur={() => setTimeout(() => setAddrSuggestions([]), 200)}
              placeholder="e.g. 12, MG Road, Bandra West"
              className={`${inputCls('area')} pl-9`}
              autoComplete="off"
            />
            {/* Autocomplete suggestions */}
            {addrSuggestions.length > 0 && (
              <div className="absolute z-50 top-full mt-1 w-full bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                {addrSuggestions.map((s, i) => (
                  <button key={i} type="button" onMouseDown={() => selectSuggestion(s)}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors border-b border-gray-50 last:border-0 flex items-start gap-2">
                    <MapPin size={11} className="text-orange-400 flex-shrink-0 mt-0.5" />
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-400">🔒 This address will be shared only after booking is confirmed</p>
            <button type="button" onClick={() => setShowMapModal(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 flex-shrink-0 ml-2">
              🗺️ Pick from map
            </button>
          </div>
          <FieldError msg={errors.area} />
        </div>

        {/* Landmark */}
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">
            Landmark <span className="text-gray-400 font-normal">— optional</span>
          </label>
          <input value={details.landmark || ''} onChange={setE('landmark')}
            placeholder="e.g. Near Starbucks, Opposite City Mall"
            className={inputCls('landmark')} />
        </div>

        {/* Location pinned indicator — only shown after user explicitly sets it */}
        {details.lat && details.lng && (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2 text-xs text-green-700 font-semibold">
              <Navigation size={12} />
              📍 Location pinned: {Number(details.lat).toFixed(4)}, {Number(details.lng).toFixed(4)}
            </div>
            <button type="button" onClick={() => setDetails(d => ({ ...d, lat: null, lng: null }))}
              className="text-xs text-red-400 hover:text-red-600 font-bold">✕ Clear</button>
          </div>
        )}
      </div>

      {/* Map picker modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-gray-900">Pick Pickup Location</h3>
              <button onClick={() => setShowMapModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Enter coordinates manually or use "Use Current Location" to pin your exact pickup spot.</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Latitude</label>
                <input type="number" step="any"
                  value={details.lat || ''}
                  onChange={e => setDetails(d => ({ ...d, lat: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="e.g. 28.6139"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">Longitude</label>
                <input type="number" step="any"
                  value={details.lng || ''}
                  onChange={e => setDetails(d => ({ ...d, lng: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="e.g. 77.2090"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            </div>
            <button type="button" onClick={async () => {
                if (!navigator.geolocation) return alert('Geolocation not supported');
                setDetecting(true);
                navigator.geolocation.getCurrentPosition(
                  async (pos) => {
                    const { latitude: lat, longitude: lng } = pos.coords;
                    setDetails(d => ({ ...d, lat, lng }));
                    try {
                      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { headers: { 'Accept-Language': 'en' } });
                      const data = await res.json();
                      const addr = data.address || {};
                      // Fill pickup address with street-level detail
                      const streetParts = [addr.road, addr.neighbourhood, addr.suburb, addr.village || addr.town].filter(Boolean);
                      const fullAddr = streetParts.join(', ') || data.display_name?.split(',').slice(0,3).join(',') || '';
                      if (fullAddr) setDetails(d => ({ ...d, address: fullAddr }));
                      // Also fill city
                      const candidates = [addr.city, addr.town, addr.village, addr.state_district, addr.county].filter(Boolean);
                      const city = candidates[0] || '';
                      if (city) setDetails(d => ({ ...d, city }));
                    } catch { /* ignore */ }
                    setDetecting(false);
                    setShowMapModal(false);
                  },
                  () => { setDetecting(false); alert('Could not get location.'); },
                  { timeout: 8000 }
                );
              }}
              disabled={detecting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-all disabled:opacity-60 mb-3">
              {detecting ? <Loader size={15} className="animate-spin" /> : <Navigation size={15} />}
              {detecting ? 'Detecting...' : 'Use My Current Location'}
            </button>
            {details.lat && details.lng && (
              <a href={`https://www.google.com/maps?q=${details.lat},${details.lng}`} target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-blue-200 text-blue-600 font-bold text-sm hover:bg-blue-50 transition-all">
                🗺️ Verify on Google Maps
              </a>
            )}
            <button onClick={() => setShowMapModal(false)}
              className="w-full mt-2 py-2.5 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
              Done
            </button>
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="text-sm font-bold text-gray-700 block mb-2">Description</label>
        <textarea value={details.description} onChange={setE('description')} rows={3}
          placeholder={isBike
            ? 'Tell renters about your bike — condition, best routes, what\'s included...'
            : 'Tell renters about your car — condition, AC quality, trip suitability...'}
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
        />
      </div>

      {/* Features — type-specific */}
      <div>
        <label className="text-sm font-bold text-gray-700 block mb-1">
          {isBike ? '🏍️ Bike Features' : '🚗 Car Features'}
        </label>
        <p className="text-xs text-gray-400 mb-3">Select all that apply</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {features.map(f => {
            const selected = details.features.includes(f.id);
            return (
              <button key={f.id} type="button" onClick={() => toggleFeature(f.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all text-left
                  ${selected
                    ? 'border-orange-400 bg-orange-50 text-orange-700'
                    : 'border-gray-100 text-gray-600 hover:border-gray-200 bg-white'}`}
              >
                <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${selected ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}>
                  {selected && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
