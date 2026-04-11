import { useState, useRef, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';

const DAYS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = [
  '00:00','01:00','02:00','03:00','04:00','05:00',
  '06:00','07:00','08:00','09:00','10:00','11:00',
  '12:00','13:00','14:00','15:00','16:00','17:00',
  '18:00','19:00','20:00','21:00','22:00','23:00','23:59',
];

function fmt(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = Number(h);
  return `${hr % 12 || 12}:${m} ${hr < 12 ? 'AM' : 'PM'}`;
}
function toMins(t) {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

// ── Compact multi-date picker ─────────────────────────────────────────────────
function DatePicker({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => {
    const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() };
  });
  const ref = useRef();

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const daysInMonth = new Date(month.year, month.month + 1, 0).getDate();
  const firstDay    = new Date(month.year, month.month, 1).getDay(); // 0=Sun
  const startOffset = (firstDay + 6) % 7; // Mon=0

  const dateStr = (d) => {
    const mm = String(month.month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${month.year}-${mm}-${dd}`;
  };

  const toggle = (d) => {
    const s = dateStr(d);
    if (s < today) return;
    onChange(selected.includes(s) ? selected.filter(x => x !== s) : [...selected, s].sort());
  };

  const prevMonth = () => setMonth(m => {
    const d = new Date(m.year, m.month - 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const nextMonth = () => setMonth(m => {
    const d = new Date(m.year, m.month + 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const monthName = new Date(month.year, month.month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button type="button" onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700 hover:border-orange-300 transition-all w-full">
        <Calendar size={15} className="text-orange-400" />
        {selected.length === 0
          ? 'Select dates'
          : `${selected.length} date${selected.length > 1 ? 's' : ''} selected`}
        <span className="ml-auto text-xs text-orange-500 font-bold">📅</span>
      </button>

      {/* Dropdown calendar */}
      {open && (
        <div className="absolute z-50 top-full mt-2 bg-white rounded-3xl border border-gray-200 shadow-2xl p-4 w-72">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">‹</button>
            <span className="text-sm font-black text-gray-900">{monthName}</span>
            <button onClick={nextMonth} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">›</button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {['M','T','W','T','F','S','S'].map((d, i) => (
              <div key={i} className="text-center text-xs text-gray-400 font-bold py-1">{d}</div>
            ))}
          </div>

          {/* Date grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: startOffset }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
              const ds  = dateStr(d);
              const sel = selected.includes(ds);
              const past = ds < today;
              return (
                <button key={d} onClick={() => toggle(d)} disabled={past}
                  className={`aspect-square rounded-xl text-xs font-bold transition-all
                    ${past ? 'text-gray-300 cursor-not-allowed' :
                      sel  ? 'bg-orange-500 text-white shadow-sm' :
                             'hover:bg-orange-50 text-gray-700'}`}>
                  {d}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
            <button onClick={() => onChange([])} className="text-xs text-gray-400 hover:text-gray-600 font-semibold">Clear</button>
            <button onClick={() => setOpen(false)} className="text-xs font-bold text-orange-500 hover:text-orange-600">Done</button>
          </div>
        </div>
      )}

      {/* Selected date chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map(d => (
            <span key={d} className="flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              <button onClick={() => onChange(selected.filter(x => x !== d))} className="hover:text-orange-900 leading-none">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function StepAvailability({ avail, setAvail, ownerListingType }) {
  const set = k => v => setAvail(a => ({ ...a, [k]: v }));
  const [timeError, setTimeError] = useState('');

  const isPersonal = ownerListingType === 'personal';
  const today = new Date().toISOString().split('T')[0];

  const handleStartTime = (t) => {
    setTimeError('');
    if (avail.endTime && toMins(t) >= toMins(avail.endTime)) {
      setTimeError('"Available from" must be before "Available until"'); return;
    }
    set('startTime')(t);
  };

  const handleEndTime = (t) => {
    setTimeError('');
    if (avail.startTime && toMins(t) <= toMins(avail.startTime)) {
      setTimeError('"Available until" must be after "Available from"'); return;
    }
    set('endTime')(t);
  };

  const setFullDay = () => {
    setTimeError('');
    setAvail(a => ({ ...a, startTime: '00:00', endTime: '23:59' }));
  };

  // Day toggle (business)
  const toggleDay = d => setAvail(a => ({
    ...a, days: a.days.includes(d) ? a.days.filter(x => x !== d) : [...a.days, d],
  }));
  const allDays = avail.days.length === 7;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-gray-900">Set availability</h2>
        <p className="text-gray-500 text-sm mt-1">
          {isPersonal ? 'Select specific dates and time window' : 'Control when renters can book your vehicle'}
        </p>
      </div>

      {/* ── PERSONAL: compact date picker ── */}
      {isPersonal && (
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">Available dates</label>
          <DatePicker
            selected={avail.availableDates || []}
            onChange={dates => setAvail(a => ({ ...a, availableDates: dates }))}
          />
        </div>
      )}

      {/* ── BUSINESS: day buttons ── */}
      {!isPersonal && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-gray-700">Available days</label>
            <button onClick={() => setAvail(a => ({ ...a, days: allDays ? [] : [...DAYS] }))}
              className="text-xs font-bold text-orange-500 hover:underline">
              {allDays ? 'Deselect all' : 'Select all'}
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map(d => (
              <button key={d} onClick={() => toggleDay(d)}
                className={`py-3 rounded-2xl text-xs font-black transition-all
                  ${avail.days.includes(d)
                    ? 'bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-md shadow-orange-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Time window (both types) ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-bold text-gray-700">Available time window</label>
          <button onClick={setFullDay} className="text-xs font-bold text-orange-500 hover:underline flex items-center gap-1">
            ⏰ Full day
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { key: 'startTime', label: 'Available from',  color: 'orange', handler: handleStartTime },
            { key: 'endTime',   label: 'Available until', color: 'blue',   handler: handleEndTime },
          ].map(({ key, label, color, handler }) => (
            <div key={key} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <label className="text-sm font-bold text-gray-700 block mb-2">{label}</label>
              <div className="grid grid-cols-3 gap-1.5 max-h-44 overflow-y-auto">
                {TIMES.map(t => (
                  <button key={t} onClick={() => handler(t)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all
                      ${avail[key] === t
                        ? color === 'orange' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'}`}>
                    {fmt(t)}
                  </button>
                ))}
              </div>
              {avail[key] && (
                <div className={`mt-2 text-xs font-black ${color === 'orange' ? 'text-orange-600' : 'text-blue-600'}`}>
                  Selected: {fmt(avail[key])}
                </div>
              )}
            </div>
          ))}
        </div>
        {timeError && (
          <div className="mt-2 text-xs text-red-500 font-semibold bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            ⚠️ {timeError}
          </div>
        )}
      </div>

      {/* ── Advance notice ── */}
      <div>
        <label className="text-sm font-bold text-gray-700 block mb-3">Minimum advance notice</label>
        <div className="grid grid-cols-4 gap-2">
          {[{ val:'1h',label:'1 hour'},{ val:'3h',label:'3 hours'},{ val:'6h',label:'6 hours'},{ val:'24h',label:'1 day'}].map(n => (
            <button key={n.val} onClick={() => set('notice')(n.val)}
              className={`py-3 rounded-2xl text-xs font-bold transition-all
                ${avail.notice === n.val ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {n.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Booking Preference ── */}
      <div>
        <label className="text-sm font-bold text-gray-700 block mb-3">Booking Preference</label>
        <div className="space-y-2">
          {[
            { val:'instant', label:'⚡ Instant booking only',    sub:'Renters can book right now (real-time)' },
            { val:'advance', label:'📅 Advance booking only',    sub:'Renters must book for a future date/time' },
            { val:'both',    label:'⚡📅 Both instant & advance', sub:'Allow both real-time and future bookings' },
          ].map(opt => (
            <button key={opt.val} onClick={() => set('bookingType')(opt.val)}
              className={`w-full flex items-start gap-3 p-3 rounded-2xl border-2 text-left transition-all
                ${(avail.bookingType || 'both') === opt.val ? 'border-orange-400 bg-orange-50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${(avail.bookingType || 'both') === opt.val ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`} />
              <div>
                <div className={`text-sm font-bold ${(avail.bookingType || 'both') === opt.val ? 'text-orange-700' : 'text-gray-800'}`}>{opt.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{opt.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Instant Book ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
        <div>
          <div className="font-bold text-gray-900 text-sm">Instant Book</div>
          <div className="text-xs text-gray-500 mt-0.5">Renters can book without waiting for your approval</div>
        </div>
        <button onClick={() => set('instantBook')(!avail.instantBook)}
          className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${avail.instantBook ? 'bg-orange-500' : 'bg-gray-200'}`}>
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${avail.instantBook ? 'left-7' : 'left-1'}`} />
        </button>
      </div>

      {/* ── Go Live ── */}
      <div className={`rounded-2xl border p-4 flex items-center justify-between ${avail.isLive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
        <div>
          <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${avail.isLive ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
            {avail.isLive ? '🟢 Live — Available Now' : '🔴 Offline'}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {avail.isLive ? 'Your vehicle is visible and bookable right now' : 'Turn on to make your vehicle available instantly'}
          </div>
        </div>
        <button onClick={() => set('isLive')(!avail.isLive)}
          className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${avail.isLive ? 'bg-green-500' : 'bg-gray-200'}`}>
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${avail.isLive ? 'left-7' : 'left-1'}`} />
        </button>
      </div>

      {/* ── Block specific dates ── */}
      <div>
        <label className="text-sm font-bold text-gray-700 block mb-2">Block specific dates <span className="text-gray-400 font-normal">— optional</span></label>
        <input type="date" min={today} onChange={e => {
          const d = e.target.value;
          if (d) setAvail(a => ({ ...a, blocked: a.blocked.includes(d) ? a.blocked : [...a.blocked, d] }));
        }} className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400" />
        {avail.blocked.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {avail.blocked.map(d => (
              <span key={d} className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full">
                {d}
                <button onClick={() => setAvail(a => ({ ...a, blocked: a.blocked.filter(x => x !== d) }))} className="hover:text-red-800">×</button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
