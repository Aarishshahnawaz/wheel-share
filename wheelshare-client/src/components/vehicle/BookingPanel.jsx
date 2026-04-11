import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Shield, Zap, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function fmt12(t) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${ampm}`;
}

export default function BookingPanel({ vehicle }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const currentUserId = user?.id || user?._id;
  const ownerIdString = vehicle.ownerId?._id || vehicle.ownerId;
  const isActuallyOwner = vehicle.isOwner || (ownerIdString && currentUserId && String(ownerIdString) === String(currentUserId));

  const isPersonal = vehicle.ownerListingType === 'personal';
  const isBusiness = !isPersonal;
  const displayDailyPrice = vehicle.price || vehicle.dailyPrice || 0;
  // Personal: show both if isDailyEnabled OR dailyPrice > 0
  const personalHasBoth = isPersonal && vehicle.hourlyPrice > 0 && displayDailyPrice > 0;
  const hasBothPrices = (isBusiness && vehicle.hourlyPrice > 0 && displayDailyPrice > 0) || personalHasBoth;

  const [rentalMode, setRentalMode] = useState('hourly');
  const [booked,  setBooked]  = useState(false);
  const [loading, setLoading] = useState(false);

  const canBook = isActuallyOwner ? false : (vehicle.available && !vehicle.isCurrentlyBooked);

  if (booked) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-7 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-black text-gray-900 mb-2">Booking Confirmed!</h3>
        <p className="text-gray-500 text-sm mb-4">
          {vehicle.owner} will confirm within 30 minutes. Check your bookings for details.
        </p>
        <button onClick={() => setBooked(false)} className="text-sm text-orange-500 font-bold hover:underline">
          Make another booking
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
      {/* Price header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
        <div className="flex items-end gap-2 flex-wrap">
          {hasBothPrices ? (
            <>
              <span className="text-3xl font-black">₹{(vehicle.hourlyPrice || 0).toLocaleString('en-IN')}</span>
              <span className="text-orange-200 mb-1">/hr</span>
              <span className="text-orange-300 mb-1 text-lg">or</span>
              <span className="text-3xl font-black">₹{displayDailyPrice.toLocaleString('en-IN')}</span>
              <span className="text-orange-200 mb-1">/day</span>
            </>
          ) : displayDailyPrice > 0 ? (
            <>
              <span className="text-3xl font-black">₹{displayDailyPrice.toLocaleString('en-IN')}</span>
              <span className="text-orange-200 mb-1">/day</span>
            </>
          ) : (
            <>
              <span className="text-3xl font-black">₹{(vehicle.hourlyPrice || 0).toLocaleString('en-IN')}</span>
              <span className="text-orange-200 mb-1">/hr</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-orange-200 text-sm">⭐ {vehicle.rating}</span>
          <span className="text-orange-300 text-xs">·</span>
          <span className="text-orange-200 text-sm">{vehicle.reviews} reviews</span>
          {vehicle.isCurrentlyBooked
            ? <span className="ml-auto bg-red-400/30 text-red-100 text-xs font-bold px-2.5 py-1 rounded-full">🔴 Not Available</span>
            : vehicle.isLive
              ? <span className="ml-auto bg-green-500 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md shadow-green-400/40">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />Available Now
                </span>
              : vehicle.available
                ? <span className="ml-auto bg-green-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md shadow-green-400/40">🟢 Available Now</span>
                : <span className="ml-auto bg-red-400/30 text-red-100 text-xs font-bold px-2.5 py-1 rounded-full">🔴 Not Available</span>
          }
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* PERSONAL: show availability window */}
        {isPersonal && (vehicle.startTime || vehicle.endTime) && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-sm font-bold text-green-700">
            🕐 Available: {fmt12(vehicle.startTime)} – {fmt12(vehicle.endTime)}
          </div>
        )}

        {/* Rental type selector — shown when both prices available (personal or business) */}
        {hasBothPrices && (
          <div>
            <label className="text-xs font-bold text-gray-600 mb-2 block">Will you rent per day or hour?</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: 'hourly', label: `⚡ Hourly`, sub: `₹${vehicle.hourlyPrice}/hr` },
                { val: 'daily',  label: `📅 Daily`,  sub: `₹${displayDailyPrice}/day` },
              ].map(opt => (
                <button key={opt.val} onClick={() => setRentalMode(opt.val)}
                  className={`py-2.5 px-3 rounded-xl border-2 text-left transition-all ${rentalMode === opt.val ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className={`text-xs font-black ${rentalMode === opt.val ? 'text-orange-700' : 'text-gray-700'}`}>{opt.label}</div>
                  <div className="text-xs text-gray-400">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Book button */}
        <button
          onClick={() => navigate(`/book/${vehicle.id}?mode=${rentalMode}`)}
          disabled={!canBook || loading}
          className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all
            ${canBook
              ? 'btn-primary text-white shadow-lg shadow-orange-200 hover:shadow-xl hover:-translate-y-0.5'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
        >
          {isActuallyOwner ? (
            <><Zap size={18} fill="none" /> Your Listing</>
          ) : loading ? (
            <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing...</>
          ) : vehicle.isCurrentlyBooked ? (
            '🔴 Booked'
          ) : vehicle.available ? (
            <><Zap size={18} fill="white" /> ⚡ Book Now</>
          ) : (
            'Currently Unavailable'
          )}
        </button>

        {!vehicle.available && (
          <button className="w-full py-3 rounded-2xl font-bold text-sm border-2 border-orange-500 text-orange-500 hover:bg-orange-50 transition-all">
            🔔 Join Waitlist
          </button>
        )}

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 pt-1">
          {[
            { icon: '🔒', text: 'Secure payment' },
            { icon: '↩️', text: 'Free cancellation' },
            { icon: '🛡️', text: 'Insured ride' },
          ].map(b => (
            <div key={b.text} className="flex flex-col items-center gap-1">
              <span className="text-base">{b.icon}</span>
              <span className="text-xs text-gray-500 font-medium text-center leading-tight">{b.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
