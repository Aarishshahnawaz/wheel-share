import { useState } from 'react';
import { Star, MapPin, Fuel, Users, Heart, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';

const TAG_COLORS = {
  'Top Rated':   'bg-yellow-100 text-yellow-700',
  'Insured':     'bg-green-100 text-green-700',
  'AC':          'bg-blue-100 text-blue-700',
  'Premium':     'bg-purple-100 text-purple-700',
  'Budget Pick': 'bg-orange-100 text-orange-700',
  'EV':          'bg-emerald-100 text-emerald-700',
  'Eco':         'bg-teal-100 text-teal-700',
  'Sports':      'bg-red-100 text-red-700',
  '7 Seater':    'bg-indigo-100 text-indigo-700',
};

export default function VehicleCard({ vehicle }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role } = useRole();
  const [liked,    setLiked]    = useState(false);
  const [imgError, setImgError] = useState(false);

  // DEBUG: log pricing values to verify
  console.log(`[VehicleCard] ${vehicle.name} | dailyPrice=${vehicle.price} | hourlyPrice=${vehicle.hourlyPrice} | isLive=${vehicle.isLive} | startTime=${vehicle.startTime} | endTime=${vehicle.endTime}`);

  const fallback = vehicle.type === 'bike'
    ? 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'
    : 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&q=80';

  // Compute ownership: vehicle.isOwner (pre-computed) OR fallback ID comparison
  const currentUserId = user?.id || user?._id;
  const isActuallyOwner = vehicle.isOwner ||
    (vehicle.ownerId && currentUserId && vehicle.ownerId === currentUserId);
    
  const isOwner = isActuallyOwner && role === 'owner';

  // Owners can't book their own vehicle; non-owners can
  const canBook = vehicle.available && !vehicle.isCurrentlyBooked && !isActuallyOwner;

  const handleClick = () => {
    if (isOwner) return;
    // Navigate to detail page for static vehicles, book directly for DB vehicles
    const vehicleId = vehicle.id || vehicle._id;
    navigate(`/vehicle/${vehicleId}`);
  };

  const handleBookClick = (e) => {
    e.stopPropagation();
    if (!canBook) return;
    const vehicleId = vehicle.id || vehicle._id;
    navigate(`/vehicle/${vehicleId}`);
  };

  return (
    <div
      className={`group bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col
        ${!vehicle.available ? 'opacity-70' : 'border-gray-100'}
        ${isOwner ? 'ring-2 ring-blue-200' : ''}`}
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={imgError ? fallback : vehicle.image}
          alt={vehicle.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {vehicle.tags.slice(0, 2).map(tag => (
            <span key={tag} className={`text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm bg-white/90 ${TAG_COLORS[tag] || 'text-gray-700'}`}>
              {tag}
            </span>
          ))}
        </div>

        {/* Wishlist — hide for own vehicles */}
        {!isOwner && (
          <button
            onClick={e => { e.stopPropagation(); setLiked(!liked); }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          >
            <Heart size={15} className={liked ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
          </button>
        )}

        {/* Owner badge */}
        {isOwner && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
            Your listing
          </div>
        )}

        {/* Unavailable or Booked overlay */}
        {(!vehicle.available || vehicle.isCurrentlyBooked) && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 font-black text-sm px-4 py-2 rounded-full shadow-lg">
              {!vehicle.available ? 'Not Available' : 'Booked'}
            </span>
          </div>
        )}

        {/* Type pill */}
        <div className="absolute bottom-3 left-3">
          <span className="text-xs font-bold bg-gray-900/80 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
            {vehicle.type === 'bike' ? '🏍️ Bike' : '🚗 Car'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Name & rating */}
        <div className="flex items-start justify-between gap-2 mb-2 overflow-hidden">
          <h3 className="font-black text-gray-900 text-sm leading-tight group-hover:text-orange-500 transition-colors min-w-0 truncate">
            {vehicle.name}
          </h3>
          {vehicle.rating > 0 ? (
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-xl flex-shrink-0 ml-1">
              <Star size={11} className="text-yellow-500" fill="currentColor" />
              <span className="text-xs font-black text-gray-800">{vehicle.rating}</span>
              <span className="text-xs text-gray-400">({vehicle.reviews})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-xl flex-shrink-0 ml-1">
              <span className="text-xs text-gray-400">New</span>
            </div>
          )}
        </div>

        {/* Meta — Issue 5: hide seats for bikes */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 flex-wrap">
          <span className="flex items-center gap-1">
            <MapPin size={11} className="text-orange-400" />
            {vehicle.city}{vehicle.distance > 0 ? ` · ${vehicle.distance} km` : ''}
          </span>
          <span className="flex items-center gap-1">
            <Fuel size={11} className="text-blue-400" />
            {vehicle.fuel}
          </span>
          {vehicle.type === 'car' && (
            <span className="flex items-center gap-1">
              <Users size={11} className="text-green-400" />
              {vehicle.seats} seats
            </span>
          )}
        </div>

        {/* Issues 1, 2, 3: single availability line with correct logic + AM/PM */}
        {(() => {
          const fmt12 = (t) => {
            if (!t) return '—';
            const [h, m] = t.split(':').map(Number);
            const ampm = h < 12 ? 'AM' : 'PM';
            const h12  = h % 12 || 12;
            return `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
          };
          const now     = new Date();
          const nowMins = now.getHours() * 60 + now.getMinutes();
          const toMins  = (t) => { if (!t) return null; const [h,m] = t.split(':').map(Number); return h*60+m; };
          const startM  = toMins(vehicle.startTime);
          const endM    = toMins(vehicle.endTime);
          const withinWindow = startM !== null && endM !== null && nowMins >= startM && nowMins <= endM;
          // isLive acts as a manual "Available Now" override.
          // Additionally, personal vehicles naturally become available if it's within their time window.
          const isAvailableNow = vehicle.isLive === true || 
            (vehicle.ownerListingType === 'personal' && withinWindow);

          // Debug log
          console.log(`[AVAIL] ${vehicle.name} | isLive=${vehicle.isLive} | startTime=${vehicle.startTime} | endTime=${vehicle.endTime} | nowMins=${nowMins} | startM=${startM} | endM=${endM} | withinWindow=${withinWindow} | isAvailableNow=${isAvailableNow}`);

          const fromFmt = fmt12(vehicle.startTime);
          const tillFmt = fmt12(vehicle.endTime);

          if (isAvailableNow) {
            return <div className="text-xs font-bold text-green-600 mb-3">🟢 Available: {fromFmt} – {tillFmt}</div>;
          }
          if (vehicle.startTime || vehicle.endTime) {
            return <div className="text-xs text-gray-400 mb-3">🔴 Offline · Available: {fromFmt} – {tillFmt}</div>;
          }
          return null;
        })()}

        {/* Owner row */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">{vehicle.ownerAvatar}</span>
          <div>
            <span className="text-xs text-gray-500">Owner: </span>
            <span className="text-xs font-bold text-gray-700">
              {isOwner ? 'You' : vehicle.owner}
            </span>
          </div>
          {vehicle.tags.includes('Insured') && (
            <div className="ml-auto flex items-center gap-1 text-green-600">
              <Shield size={11} />
              <span className="text-xs font-bold">Insured</span>
            </div>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div>
            {/* Pricing based on actual values */}
            {(() => {
              const hp = vehicle.hourlyPrice || 0;
              const dp = vehicle.price || vehicle.dailyPrice || 0;
              if (hp > 0 && dp > 0) {
                return (
                  <div className="flex flex-col gap-0.5">
                    <div className="text-lg font-black text-orange-500">
                      ₹{hp.toLocaleString('en-IN')} <span className="text-xs text-gray-400 font-medium">/hr</span>
                    </div>
                    <div className="text-lg font-black text-orange-500 mt-[-4px]">
                      ₹{dp.toLocaleString('en-IN')} <span className="text-xs text-gray-400 font-medium">/day</span>
                    </div>
                  </div>
                );
              }
              return (
                <div className="flex items-baseline mb-1">
                  <span className="text-xl font-black text-orange-500">
                    ₹{(hp > 0 ? hp : dp).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-gray-400 font-medium ml-1">
                    {hp > 0 ? '/hr' : '/day'}
                  </span>
                </div>
              );
            })()}
            {/* Booking type badge — remove duplicate availability text */}
            <div className="mt-1">
              {vehicle.ownerListingType !== 'personal' && (
                vehicle.bookingType === 'instant'
                  ? <span className="text-xs font-bold text-green-600">⚡ Instant booking</span>
                  : <span className="text-xs font-bold text-blue-600">📅 Book anytime</span>
              )}
            </div>
          </div>

          {isOwner ? (
            // Owner sees manage button
            <button
              onClick={e => { e.stopPropagation(); navigate('/my-vehicles'); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
            >
              Manage →
            </button>
          ) : (
            // Other users see Book Now
            <button
              onClick={handleBookClick}
              disabled={!canBook}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                canBook
                  ? 'btn-primary text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Zap size={12} fill={canBook ? 'white' : 'none'} />
              {isActuallyOwner ? 'Your Listing' : (vehicle.isCurrentlyBooked ? 'Booked' : (vehicle.available ? 'Book Now' : 'Unavailable'))}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
