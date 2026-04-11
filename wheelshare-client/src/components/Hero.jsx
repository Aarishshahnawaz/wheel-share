import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Shield, MapPin } from 'lucide-react';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero-gradient min-h-screen pt-16 flex items-center overflow-hidden relative">
      {/* Background blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{animationDelay:'1s'}} />
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay:'2s'}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: Text */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-md border border-orange-100">
              <span className="w-2 h-2 bg-green-500 rounded-full pulse-dot" />
              <span className="text-sm font-medium text-gray-700">🇮🇳 India's #1 Peer-to-Peer Vehicle Rental</span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                Rent bikes & cars<br />
                <span className="gradient-text">or earn from</span><br />
                your vehicle
              </h1>
              <p className="mt-4 text-lg text-gray-600 font-medium">
                Bike ho ya car — jab free ho, <span className="text-orange-500 font-bold">paise kamao 💰</span>
              </p>
              <p className="mt-2 text-gray-500 text-sm">
                Available in Mumbai, Delhi, Bangalore, Pune, Hyderabad, Chennai & 20+ cities
              </p>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6">
              {[
                { val: '50K+', label: 'Happy Renters' },
                { val: '12K+', label: 'Vehicles Listed' },
                { val: '₹2Cr+', label: 'Earned by Owners' },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-2xl font-black text-gray-900">{s.val}</div>
                  <div className="text-xs text-gray-500 font-medium">{s.label}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/login')}
                className="btn-primary flex items-center justify-center gap-2 px-8 py-4 text-white font-bold rounded-2xl text-base shadow-lg"
              >
                🏍️ Rent a Ride
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="btn-secondary flex items-center justify-center gap-2 px-8 py-4 text-white font-bold rounded-2xl text-base shadow-lg"
              >
                🚗 List Your Vehicle
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Trust micro-badges */}
            <div className="flex flex-wrap gap-4 pt-2">
              {[
                { icon: <Shield size={14} className="text-green-600" />, text: 'Aadhaar Verified' },
                { icon: <Star size={14} className="text-yellow-500" fill="currentColor" />, text: '4.8 Avg Rating' },
                { icon: <MapPin size={14} className="text-blue-500" />, text: 'Live GPS Tracking' },
              ].map(b => (
                <div key={b.text} className="flex items-center gap-1.5 bg-white/70 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 shadow-sm border border-gray-100">
                  {b.icon} {b.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Vehicle Cards */}
          <div className="relative flex justify-center items-center h-[480px]">
            {/* Bike Card */}
            <div className="floating absolute left-0 top-8 w-56 bg-white rounded-3xl shadow-2xl p-5 border border-orange-100 z-10">
              <div className="text-5xl mb-3 text-center">🏍️</div>
              <div className="font-bold text-gray-900 text-sm">Royal Enfield Classic 350</div>
              <div className="text-xs text-gray-500 mt-1">Mumbai • Available Now</div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <span className="text-orange-500 font-black text-lg">₹499</span>
                  <span className="text-gray-400 text-xs">/day</span>
                </div>
                <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                  <Star size={10} className="text-yellow-500" fill="currentColor" />
                  <span className="text-xs font-bold text-gray-700">4.9</span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <Shield size={11} className="text-green-500" />
                <span className="text-xs text-green-600 font-medium">Insured Ride</span>
              </div>
            </div>

            {/* Car Card */}
            <div className="floating-delayed absolute right-0 top-16 w-60 bg-white rounded-3xl shadow-2xl p-5 border border-blue-100 z-10">
              <div className="text-5xl mb-3 text-center">🚗</div>
              <div className="font-bold text-gray-900 text-sm">Maruti Swift Dzire</div>
              <div className="text-xs text-gray-500 mt-1">Bangalore • 2 km away</div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <span className="text-blue-600 font-black text-lg">₹1,299</span>
                  <span className="text-gray-400 text-xs">/day</span>
                </div>
                <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                  <Star size={10} className="text-yellow-500" fill="currentColor" />
                  <span className="text-xs font-bold text-gray-700">4.7</span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <Shield size={11} className="text-green-500" />
                <span className="text-xs text-green-600 font-medium">Insured Ride</span>
              </div>
            </div>

            {/* Earnings Card */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 bg-gradient-to-r from-orange-500 to-blue-600 rounded-2xl shadow-2xl p-4 text-white z-20">
              <div className="text-xs font-semibold opacity-80 mb-1">💰 Owner Earnings This Month</div>
              <div className="text-2xl font-black">₹18,450</div>
              <div className="text-xs opacity-80 mt-1">Honda Activa • Pune</div>
              <div className="mt-2 bg-white/20 rounded-full h-1.5">
                <div className="bg-white rounded-full h-1.5 w-3/4" />
              </div>
              <div className="text-xs opacity-70 mt-1">75% of monthly target reached</div>
            </div>

            {/* Center glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 bg-gradient-to-br from-orange-300 to-blue-300 rounded-full opacity-20 blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
