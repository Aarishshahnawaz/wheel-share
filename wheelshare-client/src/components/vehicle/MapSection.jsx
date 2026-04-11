import { MapPin, Navigation } from 'lucide-react';

export default function MapSection({ vehicle }) {
  // Using OpenStreetMap embed (no API key needed)
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${vehicle.lng - 0.02}%2C${vehicle.lat - 0.02}%2C${vehicle.lng + 0.02}%2C${vehicle.lat + 0.02}&layer=mapnik&marker=${vehicle.lat}%2C${vehicle.lng}`;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${vehicle.lat},${vehicle.lng}`;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-black text-gray-900 text-base">Pickup Location</h3>
        <div className="flex items-center gap-2 mt-1.5">
          <MapPin size={14} className="text-orange-500" />
          <span className="text-sm text-gray-600 font-medium">{vehicle.area}, {vehicle.city}</span>
          <span className="text-xs text-gray-400">· {vehicle.distance} km from you</span>
        </div>
      </div>

      {/* Map embed */}
      <div className="relative h-56 bg-gray-100">
        <iframe
          src={mapUrl}
          title="Vehicle location"
          className="w-full h-full border-0"
          loading="lazy"
        />
        {/* Overlay gradient at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/60 to-transparent pointer-events-none" />
      </div>

      <div className="p-4 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Exact location shared after booking confirmation
        </div>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Navigation size={12} /> Open in Maps
        </a>
      </div>
    </div>
  );
}
