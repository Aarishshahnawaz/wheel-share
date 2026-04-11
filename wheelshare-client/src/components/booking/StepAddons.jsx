import { Check } from 'lucide-react';

const ADDONS = [
  {
    id: 'insurance_premium',
    icon: '🛡️',
    title: 'Premium Insurance',
    desc: 'Full coverage — zero liability for damage, theft & accidents',
    price: 199,
    per: 'day',
    recommended: true,
  },
  {
    id: 'helmet',
    icon: '⛑️',
    title: 'Extra Helmet',
    desc: 'ISI-certified helmet for your pillion rider',
    price: 49,
    per: 'day',
    recommended: false,
  },
  {
    id: 'gps',
    icon: '📍',
    title: 'GPS Device',
    desc: 'Standalone GPS tracker — useful for remote areas',
    price: 99,
    per: 'trip',
    recommended: false,
  },
  {
    id: 'roadside',
    icon: '🔧',
    title: 'Roadside Assistance',
    desc: '24/7 emergency support — towing, puncture, breakdown',
    price: 149,
    per: 'trip',
    recommended: true,
  },
  {
    id: 'child_seat',
    icon: '👶',
    title: 'Child Seat',
    desc: 'Safety-certified child seat for kids under 12',
    price: 99,
    per: 'day',
    recommended: false,
    carOnly: true,
  },
  {
    id: 'fuel_prepaid',
    icon: '⛽',
    title: 'Prepaid Fuel',
    desc: 'Return without worrying about refuelling — we handle it',
    price: 299,
    per: 'trip',
    recommended: false,
  },
];

export default function StepAddons({ booking, setBooking, vehicle, days }) {
  const toggle = (id) => {
    setBooking(b => ({
      ...b,
      addons: b.addons.includes(id) ? b.addons.filter(a => a !== id) : [...b.addons, id],
    }));
  };

  const visibleAddons = ADDONS.filter(a => !a.carOnly || vehicle.type === 'car');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-gray-900">Enhance your ride</h2>
        <p className="text-gray-500 text-sm mt-1">Optional add-ons to make your trip safer & smoother</p>
      </div>

      <div className="space-y-3">
        {visibleAddons.map(addon => {
          const selected = booking.addons.includes(addon.id);
          const cost = addon.per === 'day' ? addon.price * days : addon.price;

          return (
            <button
              key={addon.id}
              onClick={() => toggle(addon.id)}
              className={`w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 relative
                ${selected
                  ? 'border-orange-400 bg-orange-50 shadow-md shadow-orange-100'
                  : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                }`}
            >
              {addon.recommended && (
                <span className="absolute top-4 right-12 text-[10px] sm:text-xs font-black bg-orange-500 text-white px-2 rounded-full flex items-center h-6">
                  Recommended
                </span>
              )}

              <div className="flex items-start gap-4 pr-20">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${selected ? 'bg-orange-100' : 'bg-gray-100'}`}>
                  {addon.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-gray-900 text-sm">{addon.title}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{addon.desc}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-sm font-black ${selected ? 'text-orange-600' : 'text-gray-700'}`}>
                      +₹{cost.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-gray-400">
                      {addon.per === 'day' ? `(₹${addon.price}/day × ${days} days)` : '(flat fee)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkbox */}
              <div className={`absolute top-4 right-4 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                ${selected ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}
              >
                {selected && <Check size={13} className="text-white" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>

      {booking.addons.length === 0 && (
        <p className="text-center text-xs text-gray-400 py-2">
          No add-ons selected — you can always add them later
        </p>
      )}
    </div>
  );
}
