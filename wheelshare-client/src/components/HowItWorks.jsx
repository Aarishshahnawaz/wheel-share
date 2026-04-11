import { UserCheck, Search, Key } from 'lucide-react';

export default function HowItWorks() {
  const renterSteps = [
    {
      icon: <UserCheck size={28} className="text-orange-500" />,
      step: '01',
      title: 'Create & Verify',
      desc: 'Sign up with your phone number. Verify with Aadhaar + Driving License in under 2 minutes.',
      color: 'bg-orange-50 border-orange-200',
      num: 'text-orange-200',
    },
    {
      icon: <Search size={28} className="text-blue-500" />,
      step: '02',
      title: 'Find & Book',
      desc: 'Browse bikes & cars near you. Filter by city, price, type. Pay securely via Razorpay.',
      color: 'bg-blue-50 border-blue-200',
      num: 'text-blue-200',
    },
    {
      icon: <Key size={28} className="text-green-500" />,
      step: '03',
      title: 'Ride & Return',
      desc: 'Pick up the vehicle, ride freely with live GPS tracking. Return and rate your experience.',
      color: 'bg-green-50 border-green-200',
      num: 'text-green-200',
    },
  ];

  const ownerSteps = [
    {
      icon: '📸',
      step: '01',
      title: 'List Your Vehicle',
      desc: 'Upload photos, set your price & availability. Takes less than 5 minutes.',
    },
    {
      icon: '✅',
      step: '02',
      title: 'Get Verified',
      desc: 'Our team verifies your vehicle documents. You get a "Verified Owner" badge.',
    },
    {
      icon: '💸',
      step: '03',
      title: 'Earn Every Day',
      desc: 'Renters book your vehicle. Money hits your bank account within 24 hours.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-blue-100 text-blue-600 text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
            Simple as <span className="gradient-text">1 — 2 — 3</span>
          </h2>
        </div>

        {/* Renter Flow */}
        <div className="mb-16">
          <h3 className="text-center text-lg font-bold text-gray-700 mb-8">
            🏍️ For Renters
          </h3>
          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-orange-300 via-blue-300 to-green-300 z-0" />

            {renterSteps.map((s, i) => (
              <div key={i} className={`card-hover relative z-10 border ${s.color} rounded-3xl p-7 bg-white shadow-sm`}>
                <div className={`absolute top-4 right-4 text-6xl font-black ${s.num} select-none`}>{s.step}</div>
                <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center mb-4">
                  {s.icon}
                </div>
                <h4 className="font-black text-gray-900 text-lg">{s.title}</h4>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Owner Flow */}
        <div>
          <h3 className="text-center text-lg font-bold text-gray-700 mb-8">
            💰 For Vehicle Owners
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {ownerSteps.map((s, i) => (
              <div key={i} className="card-hover bg-gradient-to-br from-orange-500 to-blue-600 rounded-3xl p-7 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-4 right-4 text-6xl font-black text-white/10 select-none">{s.step}</div>
                <div className="text-4xl mb-4">{s.icon}</div>
                <h4 className="font-black text-lg">{s.title}</h4>
                <p className="text-white/80 text-sm mt-2 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
