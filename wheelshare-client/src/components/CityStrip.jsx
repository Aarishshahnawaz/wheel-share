const cities = [
  { name: 'Mumbai', emoji: '🌊', count: '2,400+ vehicles' },
  { name: 'Delhi', emoji: '🏛️', count: '3,100+ vehicles' },
  { name: 'Bangalore', emoji: '🌿', count: '2,800+ vehicles' },
  { name: 'Pune', emoji: '🎓', count: '1,600+ vehicles' },
  { name: 'Hyderabad', emoji: '💎', count: '1,900+ vehicles' },
  { name: 'Chennai', emoji: '🌴', count: '1,200+ vehicles' },
  { name: 'Jaipur', emoji: '🏰', count: '800+ vehicles' },
  { name: 'Ahmedabad', emoji: '🪁', count: '700+ vehicles' },
];

export default function CityStrip() {
  return (
    <section className="py-16 bg-gradient-to-r from-orange-500 to-blue-600 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Available across India 🇮🇳
          </h2>
          <p className="text-white/80 mt-2 text-sm">25+ cities and growing every week</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {cities.map((city) => (
            <div key={city.name} className="bg-white/15 backdrop-blur rounded-2xl p-4 text-center border border-white/20 hover:bg-white/25 transition-all cursor-pointer">
              <div className="text-3xl mb-1">{city.emoji}</div>
              <div className="text-white font-bold text-sm">{city.name}</div>
              <div className="text-white/70 text-xs mt-0.5">{city.count}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
