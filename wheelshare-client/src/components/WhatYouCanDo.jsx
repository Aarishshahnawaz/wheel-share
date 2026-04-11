export default function WhatYouCanDo() {
  const options = [
    {
      emoji: '🏍️',
      title: 'Rent a Bike',
      desc: 'Explore the city on two wheels. From scooters to superbikes — pick what fits your vibe.',
      tags: ['Activa', 'RE Classic', 'Pulsar', 'Splendor'],
      color: 'from-orange-50 to-amber-50',
      border: 'border-orange-200',
      badge: 'bg-orange-100 text-orange-700',
      price: 'Starting ₹199/day',
      priceColor: 'text-orange-500',
    },
    {
      emoji: '🚗',
      title: 'Rent a Car',
      desc: 'Road trips, family outings, or daily commute — find the perfect car near you.',
      tags: ['Swift', 'Innova', 'Creta', 'Baleno'],
      color: 'from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-700',
      price: 'Starting ₹799/day',
      priceColor: 'text-blue-600',
    },
    {
      emoji: '💰',
      title: 'Earn from Your Vehicle',
      desc: 'Your parked vehicle is losing money. List it on WheelShare and earn every day it\'s idle.',
      tags: ['Flexible hours', 'You set price', 'Insured', 'Instant payout'],
      color: 'from-green-50 to-emerald-50',
      border: 'border-green-200',
      badge: 'bg-green-100 text-green-700',
      price: 'Earn up to ₹25,000/mo',
      priceColor: 'text-green-600',
    },
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-orange-100 text-orange-600 text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            What You Can Do
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
            One platform, <span className="gradient-text">endless possibilities</span>
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            Whether you need a ride or want to earn — WheelShare has you covered across 25+ Indian cities.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {options.map((opt) => (
            <div
              key={opt.title}
              className={`card-hover bg-gradient-to-br ${opt.color} border ${opt.border} rounded-3xl p-8 flex flex-col gap-5`}
            >
              <div className="text-5xl">{opt.emoji}</div>
              <div>
                <h3 className="text-xl font-black text-gray-900">{opt.title}</h3>
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">{opt.desc}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {opt.tags.map(tag => (
                  <span key={tag} className={`text-xs font-semibold px-3 py-1 rounded-full ${opt.badge}`}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className={`text-sm font-black ${opt.priceColor} mt-auto`}>
                {opt.price}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
