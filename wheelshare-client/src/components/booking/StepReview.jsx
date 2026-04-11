import { Shield, Calendar, Clock, MapPin, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useState } from 'react';

const ADDON_MAP = {
  insurance_premium: { icon: '🛡️', label: 'Premium Insurance', price: 199, per: 'day' },
  helmet:            { icon: '⛑️', label: 'Extra Helmet',       price: 49,  per: 'day' },
  gps:               { icon: '📍', label: 'GPS Device',         price: 99,  per: 'trip' },
  roadside:          { icon: '🔧', label: 'Roadside Assistance',price: 149, per: 'trip' },
  child_seat:        { icon: '👶', label: 'Child Seat',         price: 99,  per: 'day' },
  fuel_prepaid:      { icon: '⛽', label: 'Prepaid Fuel',       price: 299, per: 'trip' },
};

function fmt(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = Number(h);
  return `${hr % 12 || 12}:${m} ${hr < 12 ? 'AM' : 'PM'}`;
}

export default function StepReview({ booking, vehicle, days, leftoverHours, totalHours, isHourly, pricing }) {
  const [showDetails, setShowDetails] = useState(true);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'WHEEL200') {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code');
      setCouponApplied(false);
    }
  };

  const discount = couponApplied ? 200 : 0;
  const finalTotal = pricing.total - discount;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black text-gray-900">Review your booking</h2>
        <p className="text-gray-500 text-sm mt-1">Double-check everything before you pay</p>
      </div>

      {/* Vehicle summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex gap-4 p-4">
          <img
            src={vehicle.image}
            alt={vehicle.name}
            className="w-24 h-18 rounded-xl object-cover flex-shrink-0"
            style={{ height: '72px' }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-orange-500 uppercase tracking-wide mb-0.5">
              {vehicle.type === 'bike' ? '🏍️ Bike' : '🚗 Car'}
            </div>
            <h3 className="font-black text-gray-900 text-sm leading-tight">{vehicle.name}</h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              <MapPin size={11} className="text-orange-400" />
              {vehicle.area}, {vehicle.city}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-yellow-400 text-xs">⭐</span>
              <span className="text-xs font-bold text-gray-700">{vehicle.rating}</span>
              <span className="text-xs text-gray-400">({vehicle.reviews} reviews)</span>
            </div>
          </div>
        </div>

        {/* Trip details */}
        <div className="border-t border-gray-100 grid grid-cols-2 divide-x divide-gray-100">
          <div className="p-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <Calendar size={11} className="text-orange-400" /> Pickup
            </div>
            <div className="text-sm font-black text-gray-900">{booking.startDate}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Clock size={10} /> {fmt(booking.startTime)}
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <Calendar size={11} className="text-blue-400" /> Return
            </div>
            <div className="text-sm font-black text-gray-900">{booking.endDate}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Clock size={10} /> {fmt(booking.endTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Price breakdown card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <span className="font-black text-gray-900 text-sm">Price Breakdown</span>
          {showDetails ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {showDetails && (
          <div className="px-4 pb-4 space-y-2.5 border-t border-gray-100 pt-4">
            {/* Base fare */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {isHourly 
                  ? `₹${(vehicle.hourlyPrice || 0).toLocaleString('en-IN')} × ${totalHours} hr${totalHours > 1 ? 's' : ''}` 
                  : `₹${vehicle.price.toLocaleString('en-IN')} × ${Math.max(1, days)} day${Math.max(1, days) > 1 ? 's' : ''}${days > 0 && leftoverHours > 0 ? ` + ${leftoverHours} hr${leftoverHours > 1 ? 's' : ''}` : ''}`}
              </span>
              <span className="font-bold text-gray-800">₹{pricing.subtotal.toLocaleString('en-IN')}</span>
            </div>

            {/* Add-ons */}
            {booking.addons.map(id => {
              const a = ADDON_MAP[id];
              if (!a) return null;
              const billDays = isHourly ? 1 : Math.max(1, days);
              const cost = a.per === 'day' ? a.price * billDays : a.price;
              return (
                <div key={id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1.5">
                    {a.icon} {a.label}
                    <span className="text-xs text-gray-400">
                      {a.per === 'day' ? `(×${billDays})` : '(flat)'}
                    </span>
                  </span>
                  <span className="font-bold text-gray-800">+₹{cost.toLocaleString('en-IN')}</span>
                </div>
              );
            })}

            {/* Base insurance */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1.5">
                <Shield size={12} className="text-green-500" /> Basic Insurance
              </span>
              <span className="font-bold text-gray-800">₹{pricing.insurance.toLocaleString('en-IN')}</span>
            </div>

            {/* Service fee */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1.5">
                Service fee
                <Info size={11} className="text-gray-400" />
              </span>
              <span className="font-bold text-gray-800">₹{pricing.serviceFee.toLocaleString('en-IN')}</span>
            </div>

            {/* Coupon discount */}
            {couponApplied && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600 flex items-center gap-1.5">🎟️ WHEEL200 applied</span>
                <span className="font-bold text-green-600">−₹200</span>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-dashed border-gray-200 pt-3 mt-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-gray-900">Total Payable</span>
                <div className="text-right">
                  {couponApplied && (
                    <div className="text-xs text-gray-400 line-through">₹{pricing.total.toLocaleString('en-IN')}</div>
                  )}
                  <span className="text-2xl font-black text-orange-500">
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-1 text-right">Inclusive of all taxes & fees</div>
            </div>
          </div>
        )}

        {/* Collapsed total */}
        {!showDetails && (
          <div className="px-4 pb-4 flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-sm text-gray-600">{isHourly ? `${totalHours} hr${totalHours > 1 ? 's' : ''}` : `${Math.max(1, days)} day${Math.max(1, days) > 1 ? 's' : ''}${days > 0 && leftoverHours > 0 ? ` + ${leftoverHours} hr${leftoverHours > 1 ? 's' : ''}` : ''}`} · {booking.addons.length} add-on{booking.addons.length !== 1 ? 's' : ''}</span>
            <span className="text-xl font-black text-orange-500">₹{finalTotal.toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>

      {/* Coupon */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          🎟️ Have a coupon?
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={coupon}
            onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponError(''); }}
            placeholder="Enter code (try WHEEL200)"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 uppercase placeholder-normal"
          />
          <button
            onClick={applyCoupon}
            disabled={!coupon}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${coupon ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            Apply
          </button>
        </div>
        {couponApplied && <p className="text-green-600 text-xs font-bold mt-2">✓ ₹200 discount applied!</p>}
        {couponError && <p className="text-red-500 text-xs font-bold mt-2">✗ {couponError}</p>}
      </div>

      {/* Payment methods */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="text-sm font-bold text-gray-800 mb-3">Pay via</div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'upi', icon: '📱', label: 'UPI' },
            { id: 'card', icon: '💳', label: 'Card' },
            { id: 'netbanking', icon: '🏦', label: 'Net Banking' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setShowDetails(s => s)} // placeholder
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-gray-100 hover:border-orange-300 hover:bg-orange-50 transition-all"
            >
              <span className="text-xl">{m.icon}</span>
              <span className="text-xs font-bold text-gray-700">{m.label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center flex items-center justify-center gap-1">
          <Shield size={11} className="text-green-500" />
          Secured by Razorpay · 256-bit SSL encryption
        </p>
      </div>

      {/* Cancellation note */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <span className="text-xl flex-shrink-0">↩️</span>
        <div>
          <div className="text-sm font-bold text-blue-800">Free cancellation</div>
          <div className="text-xs text-blue-600 mt-0.5">
            Cancel for free up to 24 hours before pickup on {booking.startDate}. After that, 50% refund applies.
          </div>
        </div>
      </div>
    </div>
  );
}
