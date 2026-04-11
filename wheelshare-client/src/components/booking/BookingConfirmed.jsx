import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Download, MessageCircle } from 'lucide-react';

function fmt(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = Number(h);
  return `${hr % 12 || 12}:${m} ${hr < 12 ? 'AM' : 'PM'}`;
}

export default function BookingConfirmed({ vehicle, booking, total, savedBooking }) {
  const navigate = useNavigate();
  // Use real DB booking ID if available, otherwise generate a display ID
  const bookingId = savedBooking?._id
    ? `WS${savedBooking._id.toString().slice(-8).toUpperCase()}`
    : `WS${Date.now().toString().slice(-8)}`;

  return (
    <div className="max-w-lg mx-auto text-center space-y-6">
      {/* Success animation */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          <div className="absolute -top-1 -right-1 text-2xl animate-bounce">🎉</div>
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">Booking Confirmed!</h2>
          <p className="text-gray-500 text-sm mt-1">
            {vehicle.owner} will confirm within 30 minutes
          </p>
        </div>
      </div>

      {/* Booking ID */}
      <div className="bg-gradient-to-r from-orange-500 to-blue-600 rounded-2xl p-4 text-white">
        <div className="text-xs font-bold opacity-80 mb-1">Booking ID</div>
        <div className="text-2xl font-black tracking-widest">{bookingId}</div>
        <div className="text-xs opacity-70 mt-1">Save this for your records</div>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-left overflow-hidden">
        <div className="flex gap-4 p-4 border-b border-gray-100">
          <img src={vehicle.image} alt={vehicle.name} className="w-16 h-12 rounded-xl object-cover flex-shrink-0" />
          <div>
            <div className="font-black text-gray-900 text-sm">{vehicle.name}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin size={10} /> {vehicle.area}, {vehicle.city}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
          <div className="p-4">
            <div className="text-xs text-gray-500 flex items-center gap-1 mb-1"><Calendar size={10} /> Pickup</div>
            <div className="text-sm font-black text-gray-900">{booking.startDate}</div>
            <div className="text-xs text-gray-500">{fmt(booking.startTime)}</div>
          </div>
          <div className="p-4">
            <div className="text-xs text-gray-500 flex items-center gap-1 mb-1"><Calendar size={10} /> Return</div>
            <div className="text-sm font-black text-gray-900">{booking.endDate}</div>
            <div className="text-xs text-gray-500">{fmt(booking.endTime)}</div>
          </div>
        </div>

        <div className="p-4 flex items-center justify-between">
          <span className="text-sm text-gray-600 font-semibold">Total Paid</span>
          <span className="text-xl font-black text-orange-500">₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Next steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-left space-y-2">
        <div className="text-sm font-black text-blue-800 mb-3">What happens next?</div>
        {[
          { step: '1', text: `${vehicle.owner} confirms your booking (within 30 min)` },
          { step: '2', text: 'You receive exact pickup address via WhatsApp & email' },
          { step: '3', text: 'Show your Aadhaar + DL at pickup' },
          { step: '4', text: 'Enjoy your ride! 🚀' },
        ].map(s => (
          <div key={s.step} className="flex items-start gap-3 text-sm text-blue-700">
            <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
              {s.step}
            </span>
            {s.text}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-gray-200 text-sm font-bold text-gray-700 hover:border-orange-300 hover:text-orange-600 transition-all">
          <Download size={15} /> Download Receipt
        </button>
        <button className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-green-200 text-sm font-bold text-green-700 hover:bg-green-50 transition-all">
          <MessageCircle size={15} /> WhatsApp Owner
        </button>
      </div>

      <button
        onClick={() => navigate('/bookings')}
        className="btn-primary w-full py-4 text-white font-black rounded-2xl text-sm"
      >
        View My Bookings →
      </button>
    </div>
  );
}
