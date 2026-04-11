import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation, Phone, MessageCircle, Shield, Clock, MapPin, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

// Simulated live position updates around Mumbai
const ROUTE_POINTS = [
  { lat: 19.0596, lng: 72.8295, label: 'Bandra West' },
  { lat: 19.0650, lng: 72.8350, label: 'Bandra Kurla' },
  { lat: 19.0720, lng: 72.8420, label: 'Kurla' },
  { lat: 19.0800, lng: 72.8500, label: 'Ghatkopar' },
  { lat: 19.0880, lng: 72.8580, label: 'Vikhroli' },
];

export default function TrackingPage() {
  const navigate = useNavigate();
  const [posIdx, setPosIdx] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  // Simulate vehicle moving
  useEffect(() => {
    const iv = setInterval(() => {
      setPosIdx(i => (i + 1) % ROUTE_POINTS.length);
      setElapsed(e => e + 30);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const pos = ROUTE_POINTS[posIdx];
  const nextPos = ROUTE_POINTS[(posIdx + 1) % ROUTE_POINTS.length];

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${pos.lng - 0.03}%2C${pos.lat - 0.03}%2C${pos.lng + 0.03}%2C${pos.lat + 0.03}&layer=mapnik&marker=${pos.lat}%2C${pos.lng}`;

  const fmtTime = s => `${Math.floor(s / 3600).toString().padStart(2,'0')}:${Math.floor((s % 3600) / 60).toString().padStart(2,'0')}:${(s % 60).toString().padStart(2,'0')}`;

  return (
    <DashboardLayout>
      <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
        {/* Top bar */}
        <div className="bg-gray-900/95 backdrop-blur px-4 py-3 flex items-center gap-3 z-30 border-b border-white/10">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1">
            <div className="text-white font-black text-sm">Live Tracking</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-bold">Vehicle is moving</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <Phone size={15} />
            </button>
            <button className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <MessageCircle size={15} />
            </button>
          </div>
        </div>

        {/* Map — fills remaining space */}
        <div className="flex-1 relative">
          <iframe
            key={posIdx} // re-render on position change
            src={mapUrl}
            title="Live tracking map"
            className="w-full h-full border-0"
          />

          {/* Map overlays */}
          {/* Live badge */}
          <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE
          </div>

          {/* Speed badge */}
          <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur text-white rounded-2xl px-4 py-2 text-center shadow-lg">
            <div className="text-xl font-black">32</div>
            <div className="text-xs opacity-70">km/h</div>
          </div>

          {/* Current location pill */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur text-white rounded-full px-4 py-2 flex items-center gap-2 shadow-xl text-sm font-semibold">
            <MapPin size={13} className="text-orange-400" />
            Near {pos.label}
            <span className="text-white/50 mx-1">→</span>
            <Navigation size={13} className="text-blue-400" />
            {nextPos.label}
          </div>
        </div>

        {/* Bottom panel */}
        <div className={`bg-white transition-all duration-300 ${panelOpen ? 'max-h-80' : 'max-h-16'} overflow-hidden`}>
          {/* Handle */}
          <button onClick={() => setPanelOpen(!panelOpen)}
            className="w-full flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <span className="font-black text-gray-900 text-sm">Booking Details</span>
            {panelOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronUp size={16} className="text-gray-400" />}
          </button>

          <div className="px-5 py-4 space-y-4">
            {/* Vehicle + timer */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-blue-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
                🏍️
              </div>
              <div className="flex-1">
                <div className="font-black text-gray-900">Royal Enfield Classic 350</div>
                <div className="text-xs text-gray-500 mt-0.5">Booking #WS20260330 · Arjun Mehta</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Elapsed</div>
                <div className="font-black text-orange-500 font-mono">{fmtTime(elapsed)}</div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: <Clock size={14} className="text-blue-500" />, label: 'Return in', val: '4h 30m' },
                { icon: <MapPin size={14} className="text-orange-500" />, label: 'Distance', val: '12.4 km' },
                { icon: <Zap size={14} className="text-green-500" />, label: 'Status', val: 'Active' },
                { icon: <Shield size={14} className="text-purple-500" />, label: 'Insured', val: '✓ Yes' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-2.5 text-center border border-gray-100">
                  <div className="flex justify-center mb-1">{s.icon}</div>
                  <div className="text-xs font-black text-gray-900">{s.val}</div>
                  <div className="text-xs text-gray-400 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Return location */}
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3">
              <Navigation size={15} className="text-blue-500 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-blue-700">Return to</div>
                <div className="text-sm font-semibold text-gray-800">Bandra West, Mumbai · by 6:00 PM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
