import { Shield, CreditCard, MapPin, Star, Clock, Headphones } from 'lucide-react';

export default function TrustSection() {
  const trustItems = [
    {
      icon: <Shield size={32} className="text-green-500" />,
      title: 'Verified Users',
      desc: 'Every renter and owner is verified via Aadhaar + Driving License. Zero fake profiles.',
      bg: 'bg-green-50',
      border: 'border-green-200',
    },
    {
      icon: <CreditCard size={32} className="text-blue-500" />,
      title: 'Secure Payments',
      desc: 'Powered by Razorpay. UPI, cards, net banking — all supported. 100% refund guarantee.',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    {
      icon: <MapPin size={32} className="text-orange-500" />,
      title: 'Live GPS Tracking',
      desc: 'Track your rented vehicle in real-time. Owners can monitor their vehicle 24/7.',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
    },
    {
      icon: <Shield size={32} className="text-purple-500" />,
      title: 'Ride Insurance',
      desc: 'Every ride is covered with basic insurance. Ride with peace of mind, always.',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
    },
    {
      icon: <Clock size={32} className="text-yellow-500" />,
      title: 'Instant Payouts',
      desc: 'Owners receive earnings within 24 hours of ride completion. No delays, no hassle.',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
    },
    {
      icon: <Headphones size={32} className="text-red-500" />,
      title: '24/7 Support',
      desc: 'Hindi + English support via WhatsApp, call & chat. We\'re always here for you.',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
  ];

  const reviews = [
    {
      name: 'Priya Sharma',
      city: 'Mumbai',
      text: 'Rented a Activa for a week. Super smooth experience, owner was very helpful. Will use again!',
      rating: 5,
      avatar: '👩',
      role: 'Renter',
    },
    {
      name: 'Arjun Mehta',
      city: 'Bangalore',
      text: 'Listed my Swift Dzire and earned ₹14,000 last month. Best passive income ever!',
      rating: 5,
      avatar: '👨',
      role: 'Owner',
    },
    {
      name: 'Sneha Reddy',
      city: 'Hyderabad',
      text: 'Took a Royal Enfield for a Coorg trip. Bike was in perfect condition. 10/10 recommend.',
      rating: 5,
      avatar: '👩‍🦱',
      role: 'Renter',
    },
  ];

  return (
    <section id="trust" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-green-100 text-green-600 text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            Why WheelShare
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
            Built on <span className="gradient-text">trust & safety</span>
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            We've built every feature with Indian users in mind — safety, simplicity, and reliability first.
          </p>
        </div>

        {/* Trust Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {trustItems.map((item) => (
            <div key={item.title} className={`card-hover ${item.bg} border ${item.border} rounded-3xl p-7`}>
              <div className="mb-4">{item.icon}</div>
              <h3 className="font-black text-gray-900 text-lg">{item.title}</h3>
              <p className="text-gray-600 text-sm mt-2 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Reviews */}
        <div className="text-center mb-10">
          <h3 className="text-2xl font-black text-gray-900">
            What our users say 💬
          </h3>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.name} className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-3xl p-7 shadow-sm card-hover">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(r.rating)].map((_, i) => (
                  <Star key={i} size={14} className="text-yellow-400" fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed italic">"{r.text}"</p>
              <div className="flex items-center gap-3 mt-5">
                <div className="text-3xl">{r.avatar}</div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.city} · {r.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
