import { TrendingUp, Info } from 'lucide-react';

export default function StepPricing({ pricing, setPricing, vehicleType, ownerListingType }) {
  const set  = k => v => setPricing(p => ({ ...p, [k]: v }));
  const setE = k => e => set(k)(e.target.value);

  const isPersonal = ownerListingType === 'personal';
  const isBusiness = !isPersonal;

  const weeklyDiscount   = pricing.dailyPrice ? Math.round(pricing.dailyPrice * 7  * (1 - (pricing.weeklyDiscount  || 10) / 100)) : 0;
  const monthlyDiscount  = pricing.dailyPrice ? Math.round(pricing.dailyPrice * 30 * (1 - (pricing.monthlyDiscount || 20) / 100)) : 0;
  const estimatedMonthly = pricing.dailyPrice ? Math.round(pricing.dailyPrice * 20) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-gray-900">Set your price</h2>
        <p className="text-gray-500 text-sm mt-1">You're in control — change anytime</p>
      </div>

      {/* Personal notice */}
      {isPersonal && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 text-xs text-blue-700 font-semibold">
          👤 Personal listing — hourly pricing required. Daily pricing is optional.
        </div>
      )}

      {/* Business notice */}
      {isBusiness && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 text-xs text-orange-700 font-semibold">
          🏢 Business listing — set both prices. Renters choose hourly or daily at booking.
        </div>
      )}

      {/* ── Daily price — business always, personal optional ── */}
      {isBusiness && (
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">Price per day (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-orange-500">₹</span>
            <input type="number" value={pricing.dailyPrice || ''} onChange={setE('dailyPrice')} placeholder="0"
              className="w-full pl-10 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50 text-2xl font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-semibold">/day</span>
          </div>
        </div>
      )}

      {/* ── Personal: optional daily pricing toggle ── */}
      {isPersonal && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
          <div>
            <div className="font-bold text-gray-900 text-sm">Enable Daily Pricing</div>
            <div className="text-xs text-gray-500 mt-0.5">Allow renters to book for a full day at a flat rate</div>
          </div>
          <button onClick={() => set('isDailyEnabled')(!pricing.isDailyEnabled)}
            className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${pricing.isDailyEnabled ? 'bg-orange-500' : 'bg-gray-200'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${pricing.isDailyEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      )}

      {/* Personal daily price input — only when enabled */}
      {isPersonal && pricing.isDailyEnabled && (
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">Price per day (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-orange-500">₹</span>
            <input type="number" value={pricing.dailyPrice || ''} onChange={setE('dailyPrice')} placeholder="0"
              className="w-full pl-10 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50 text-2xl font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-semibold">/day</span>
          </div>
          {/* Validation warning */}
          {pricing.hourlyPrice && pricing.dailyPrice && Number(pricing.dailyPrice) <= Number(pricing.hourlyPrice) * 2 && (
            <div className="flex items-center gap-1.5 mt-2 text-amber-600 text-xs font-semibold">
              <Info size={12} /> Daily price should be greater than hourly × minimum hours (2 hrs)
            </div>
          )}
        </div>
      )}

      {/* ── Hourly price — always shown ── */}
      <div>
        <label className="text-sm font-bold text-gray-700 block mb-2">Price per hour (₹)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-blue-500">₹</span>
          <input type="number" value={pricing.hourlyPrice || ''} onChange={setE('hourlyPrice')} placeholder="0"
            className="w-full pl-10 pr-4 py-4 rounded-2xl border-2 border-gray-200 bg-gray-50 text-2xl font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent" />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-semibold">/hr</span>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">Partial hours are rounded up to the next full hour.</p>
      </div>

      {/* ── Discounts — business + daily price set ── */}
      {isBusiness && pricing.dailyPrice > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { key: 'weeklyDiscount',  label: 'Weekly discount',  default: 10, calc: weeklyDiscount,  period: '7 days' },
            { key: 'monthlyDiscount', label: 'Monthly discount', default: 20, calc: monthlyDiscount, period: '30 days' },
          ].map(d => (
            <div key={d.key} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-gray-700">{d.label}</label>
                <span className="text-sm font-black text-orange-500">{pricing[d.key] || d.default}% off</span>
              </div>
              <input type="range" min={0} max={40} value={pricing[d.key] || d.default}
                onChange={e => set(d.key)(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer" />
              <div className="text-xs text-gray-500 mt-2">
                Renter pays <span className="font-black text-gray-800">₹{d.calc.toLocaleString('en-IN')}</span> for {d.period}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Earnings estimate — business + daily price set ── */}
      {isBusiness && pricing.dailyPrice > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-green-600" />
            <span className="font-black text-green-800 text-sm">Estimated monthly earnings</span>
          </div>
          <div className="text-3xl font-black text-green-700">₹{estimatedMonthly.toLocaleString('en-IN')}</div>
          <div className="text-xs text-green-600 mt-1">Based on ~20 rental days/month in your city</div>
          <div className="mt-3 flex items-start gap-2 text-xs text-green-700">
            <Info size={12} className="flex-shrink-0 mt-0.5" />
            WheelShare takes 12% platform fee. You receive ₹{Math.round(estimatedMonthly * 0.88).toLocaleString('en-IN')}/month net.
          </div>
        </div>
      )}

      {/* ── Security deposit — always shown ── */}
      <div>
        <label className="text-sm font-bold text-gray-700 block mb-2">Security deposit (₹) <span className="text-gray-400 font-normal">— optional</span></label>
        <input type="number" value={pricing.deposit || ''} onChange={setE('deposit')} placeholder="e.g. 2000"
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400" />
        <p className="text-xs text-gray-400 mt-1.5">Refunded to renter after successful return. Held by WheelShare.</p>
      </div>
    </div>
  );
}
