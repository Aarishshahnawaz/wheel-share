import React, { useState } from 'react';
import { Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';

const TIME_SLOTS = ['06:00','07:00','08:00','09:00','10:00','11:00','12:00',
  '13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'];

function fmt(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = Number(h);
  return `${hr % 12 || 12}:${m} ${hr < 12 ? 'AM' : 'PM'}`;
}

function addDays(dateStr, days) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export default function StepSchedule({ booking, setBooking, vehicle, isHourly }) {
  const today = new Date().toISOString().split('T')[0];

  const isPersonal = vehicle.ownerListingType === 'personal';
  const ownerStart = vehicle.startTime || '08:00';
  const ownerEnd   = vehicle.endTime   || '20:00';

  // For personal: fixed date = today, filter slots within owner window
  const personalDate = today;

  // Time slots filtered to owner's window (for personal vehicles)
  const toMins = (t) => { const [h,m] = t.split(':').map(Number); return h*60+m; };
  const personalSlots = TIME_SLOTS.filter(t => {
    const mins = toMins(t);
    return mins >= toMins(ownerStart) && mins <= toMins(ownerEnd);
  });

  // Validation for personal booking
  const [personalError, setPersonalError] = React.useState('');

  const handlePersonalPickup = (t) => {
    setPersonalError('');
    setBooking(b => {
      // Auto-set return to pickup + 2 hrs minimum
      const pickupMins = toMins(t);
      const minReturnMins = pickupMins + 120;
      const ownerEndMins  = toMins(ownerEnd);
      if (minReturnMins > ownerEndMins) {
        setPersonalError('Not enough time in the window for a 2-hour booking from this time.');
        return b;
      }
      // Find the slot >= minReturn
      const autoReturn = personalSlots.find(s => toMins(s) >= minReturnMins) || '';
      return { ...b, startDate: personalDate, endDate: personalDate, startTime: t, endTime: autoReturn };
    });
  };

  const handlePersonalReturn = (t) => {
    setPersonalError('');
    const pickupMins = toMins(booking.startTime || ownerStart);
    const returnMins = toMins(t);
    if (returnMins - pickupMins < 120) {
      setPersonalError('Minimum booking duration is 2 hours.');
      return;
    }
    if (returnMins > toMins(ownerEnd)) {
      setPersonalError(`Please select time within available window (until ${fmt(ownerEnd)}).`);
      return;
    }
    setBooking(b => ({ ...b, endDate: personalDate, endTime: t }));
  };

  const { days, hours } = (() => {
    if (!booking.startDate || !booking.endDate) return { days: 0, hours: 0 };
    const start = new Date(`${booking.startDate}T${booking.startTime || '10:00'}`);
    const end   = new Date(`${booking.endDate}T${booking.endTime || '10:00'}`);
    const diff  = (end - start) / 3600000;
    if (diff <= 0) return { days: 0, hours: 0 };
    return { days: Math.floor(diff / 24), hours: diff % 24 };
  })();

  const set = (key) => (val) => setBooking(b => ({ ...b, [key]: val }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-gray-900">Choose your schedule</h2>
        <p className="text-gray-500 text-sm mt-1">Select pickup and return date & time</p>
      </div>

      {/* Pickup location */}
      <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3">
        <MapPin size={16} className="text-orange-500 flex-shrink-0" />
        <div>
          <div className="text-xs text-orange-600 font-bold">Pickup Location</div>
          <div className="text-sm font-semibold text-gray-800">{vehicle.area}, {vehicle.city}</div>
        </div>
        <span className="ml-auto text-xs text-orange-500 font-bold">{vehicle.distance} km away</span>
      </div>

      {/* Personal vehicle — fixed date, selectable time within window */}
      {isPersonal && (
        <div className="space-y-4">
          {/* Fixed date banner */}
          <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 flex items-center gap-3">
            <Calendar size={16} className="text-orange-500 flex-shrink-0" />
            <div>
              <div className="text-xs text-orange-600 font-bold">Fixed Date</div>
              <div className="text-sm font-black text-gray-900">{new Date(personalDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>

          {/* Available window info */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 text-sm text-blue-700 font-semibold flex items-center gap-2">
            <Clock size={14} className="flex-shrink-0" />
            Available between <span className="font-black">{fmt(ownerStart)} – {fmt(ownerEnd)}</span>
            &nbsp;· Minimum 2 hours
          </div>

          {/* Pricing mode selector — show if daily price exists */}
          {vehicle.hourlyPrice > 0 && (vehicle.price > 0 || vehicle.dailyPrice > 0) && (
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Choose booking type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: 'hourly', label: '⚡ Hourly', sub: `₹${vehicle.hourlyPrice}/hr · min 2 hrs` },
                  { val: 'daily',  label: '📅 Full Day', sub: `₹${vehicle.price || vehicle.dailyPrice} flat` },
                ].map(opt => (
                  <button key={opt.val}
                    onClick={() => setBooking(b => ({ ...b, personalMode: opt.val }))}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      (booking.personalMode || 'hourly') === opt.val
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`text-sm font-black ${(booking.personalMode || 'hourly') === opt.val ? 'text-orange-700' : 'text-gray-800'}`}>{opt.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Pickup + Return time — side by side, only for hourly mode */}
          {(booking.personalMode || 'hourly') === 'hourly' && (
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Pickup time */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Clock size={15} className="text-orange-500" />
                </div>
                <span className="font-bold text-gray-800 text-sm">Pickup Time</span>
                {booking.startTime && (
                  <span className="ml-auto text-xs font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{fmt(booking.startTime)}</span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {personalSlots.filter(t => toMins(t) + 120 <= toMins(ownerEnd)).map(t => (
                  <button key={t} onClick={() => handlePersonalPickup(t)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                      booking.startTime === t ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                    }`}>
                    {fmt(t)}
                  </button>
                ))}
              </div>
            </div>

            {/* Return time */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Clock size={15} className="text-blue-500" />
                </div>
                <span className="font-bold text-gray-800 text-sm">Return Time</span>
                {booking.endTime && (
                  <span className="ml-auto text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{fmt(booking.endTime)}</span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {personalSlots.filter(t => {
                  if (!booking.startTime) return false;
                  return toMins(t) >= toMins(booking.startTime) + 120 && toMins(t) <= toMins(ownerEnd);
                }).map(t => (
                  <button key={t} onClick={() => handlePersonalReturn(t)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                      booking.endTime === t ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                    }`}>
                    {fmt(t)}
                  </button>
                ))}
                {!booking.startTime && (
                  <div className="col-span-3 text-xs text-gray-400 text-center py-2">Select pickup time first</div>
                )}
              </div>
            </div>
          </div>
          )}

          {/* Daily mode — show full day info */}
          {(booking.personalMode === 'daily') && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center">
              <div className="font-black text-orange-900 text-base mb-1">📅 Full Day Booking</div>
              <div className="text-sm text-orange-700">
                {fmt(ownerStart)} – {fmt(ownerEnd)} · Flat rate ₹{vehicle.price || vehicle.dailyPrice}
              </div>
            </div>
          )}

          {/* Validation error */}
          {personalError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-600 text-sm font-semibold">
              <AlertCircle size={15} /> {personalError}
            </div>
          )}
        </div>
      )}

      {/* Date row - Hidden for Personal Vehicles */}
      {!isPersonal && (
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          {/* Pickup date */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
                <Calendar size={15} className="text-orange-500" />
              </div>
              <span className="font-bold text-gray-800 text-sm">Pickup Date</span>
            </div>
            <input
              type="date"
              min={today}
              value={booking.startDate}
              onChange={e => {
                const newStart = e.target.value;
                set('startDate')(newStart);
                const minEnd = isHourly ? newStart : addDays(newStart, 1);
                if (booking.endDate && booking.endDate < minEnd) {
                  set('endDate')(minEnd);
                }
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Return date */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar size={15} className="text-blue-500" />
              </div>
              <span className="font-bold text-gray-800 text-sm">Return Date</span>
            </div>
            <input
              type="date"
              min={isHourly ? (booking.startDate || today) : addDays(booking.startDate || today, 1)}
              value={booking.endDate}
              onChange={e => set('endDate')(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>
      )}

      {/* Time slots */}
      {!isPersonal && (
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {[
            { key: 'startTime', label: 'Pickup Time', color: 'orange' },
            { key: 'endTime',   label: 'Return Time', color: 'blue' },
          ].map(({ key, label, color }) => (
            <div key={key} className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 bg-${color}-100 rounded-xl flex items-center justify-center`}>
                  <Clock size={15} className={`text-${color}-500`} />
                </div>
                <span className="font-bold text-gray-800 text-sm">{label}</span>
                {booking[key] && (
                  <span className={`ml-auto text-xs font-black text-${color}-600 bg-${color}-50 px-2 py-0.5 rounded-full`}>
                    {fmt(booking[key])}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {TIME_SLOTS.map(t => (
                  <button
                    key={t}
                    onClick={() => {
                      set(key)(t);
                      if (key === 'startTime' && !isHourly) {
                        set('endTime')(t);
                      }
                    }}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                      booking[key] === t
                        ? color === 'orange'
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'bg-blue-500 text-white shadow-sm'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                    }`}
                  >
                    {fmt(t)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Duration summary */}
      {days > 0 || hours > 0 ? (
        <div className="bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="text-3xl">⏱️</div>
          <div>
            <div className="font-black text-gray-900">
              {days > 0 && `${days} day${days > 1 ? 's' : ''}`}
              {days > 0 && hours > 0 && ' '}
              {hours > 0 && `${hours} hour${hours > 1 ? 's' : ''}`}
            </div>
            <div className="text-sm text-gray-500">
              {booking.startDate} {fmt(booking.startTime)} → {booking.endDate} {fmt(booking.endTime)}
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs text-gray-500">Estimated</div>
            <div className="text-lg font-black text-orange-500">
              {isHourly
                ? `₹${((days * 24 + hours) * (vehicle.hourlyPrice || 0)).toLocaleString('en-IN')}`
                : `₹${((Math.max(1, days) * vehicle.price) + (days > 0 ? Math.min(hours * vehicle.hourlyPrice, vehicle.price) : 0)).toLocaleString('en-IN')}`}
            </div>
          </div>
        </div>
      ) : booking.startDate && booking.endDate ? (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-600 text-sm font-semibold">
          <AlertCircle size={15} /> Return date/time must be after pickup
        </div>
      ) : null}
    </div>
  );
}
