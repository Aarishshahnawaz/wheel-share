import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Heart, MapPin, Star, Fuel, Users, Calendar, Shield, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ImageGallery from '../components/vehicle/ImageGallery';
import BookingPanel from '../components/vehicle/BookingPanel';
import OwnerCard from '../components/vehicle/OwnerCard';
import ReviewsSection from '../components/vehicle/ReviewsSection';
import MapSection from '../components/vehicle/MapSection';
import { VEHICLES } from '../data/vehicles';
import { useVehicleById } from '../hooks/useVehicleById';

const TAG_COLORS = {
  'Top Rated':   'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Insured':     'bg-green-100 text-green-700 border-green-200',
  'AC':          'bg-blue-100 text-blue-700 border-blue-200',
  'Premium':     'bg-purple-100 text-purple-700 border-purple-200',
  'Budget Pick': 'bg-orange-100 text-orange-700 border-orange-200',
  'EV':          'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Sports':      'bg-red-100 text-red-700 border-red-200',
  '7 Seater':    'bg-indigo-100 text-indigo-700 border-indigo-200',
};

export default function VehicleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [showMobileBooking, setShowMobileBooking] = useState(false);

  const { vehicle, loading, notFound } = useVehicleById(id);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen gap-3 text-gray-400">
          <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Loading vehicle...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (notFound || !vehicle) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="text-6xl">🔍</div>
          <h2 className="text-xl font-black text-gray-900">Vehicle not found</h2>
          <button onClick={() => navigate('/rent')} className="btn-primary px-6 py-3 text-white font-bold rounded-2xl text-sm">
            Browse Vehicles
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const specs = [
    { icon: <Fuel size={16} className="text-blue-500" />, label: 'Fuel', value: vehicle.fuel },
    { icon: <Users size={16} className="text-green-500" />, label: 'Seats', value: `${vehicle.seats} seats` },
    { icon: <Calendar size={16} className="text-purple-500" />, label: 'Year', value: vehicle.year },
    { icon: <span className="text-base">⚡</span>, label: vehicle.type === 'bike' ? 'Engine' : 'Engine', value: vehicle.engine },
    { icon: <span className="text-base">🛣️</span>, label: vehicle.fuel === 'Electric' ? 'Range' : 'Mileage', value: vehicle.mileage },
    { icon: <MapPin size={16} className="text-orange-500" />, label: 'Location', value: vehicle.area },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate('/rent')}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-500 font-semibold text-sm transition-colors group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:block">Back to results</span>
            </button>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300 transition-all">
                <Share2 size={14} /> Share
              </button>
              <button
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${liked ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-gray-600 hover:border-red-200'}`}
              >
                <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
                {liked ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* LEFT: Main content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Gallery */}
              <ImageGallery images={vehicle.gallery} name={vehicle.name} />

              {/* Title & meta */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs font-bold bg-gray-900 text-white px-3 py-1 rounded-full">
                    {vehicle.type === 'bike' ? '🏍️ Bike' : '🚗 Car'}
                  </span>
                  {vehicle.tags.map(tag => (
                    <span key={tag} className={`text-xs font-bold px-3 py-1 rounded-full border ${TAG_COLORS[tag] || 'bg-gray-100 text-gray-700'}`}>
                      {tag}
                    </span>
                  ))}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">{vehicle.name}</h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-5">
                  <span className="flex items-center gap-1.5">
                    <Star size={15} className="text-yellow-400" fill="currentColor" />
                    <span className="font-black text-gray-900">{vehicle.rating}</span>
                    <span className="text-gray-400">({vehicle.reviews} reviews)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={15} className="text-orange-500" />
                    {vehicle.area}, {vehicle.city}
                    <span className="text-gray-400">· {vehicle.distance} km away</span>
                  </span>
                  {vehicle.isCurrentlyBooked
                    ? <span className="text-red-500 font-bold">🔴 Not Available</span>
                    : vehicle.available
                      ? <span className="flex items-center gap-1 text-green-600 font-bold"><CheckCircle size={14} /> 🟢 Available Now</span>
                      : <span className="text-red-500 font-bold">Currently unavailable</span>
                  }
                </div>

                <p className="text-gray-600 leading-relaxed text-sm">{vehicle.description}</p>
              </div>

              {/* Specs */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-black text-gray-900 text-base mb-5">Vehicle Specs</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {specs.map(s => (
                    <div key={s.label} className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                        {s.icon}
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 font-medium">{s.label}</div>
                        <div className="text-sm font-black text-gray-900">{s.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pickup Location */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-black text-gray-900 text-base mb-4">📍 Pickup Location</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-bold text-gray-900">
                        {vehicle.area || vehicle.city}{vehicle.city ? `, ${vehicle.city}` : ''}
                      </div>
                      {/* Full address — shown only after booking (privacy) */}
                      {vehicle.isCurrentlyBooked ? (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {vehicle.address || 'Address shared after booking confirmation'}
                          {vehicle.landmark && <span className="block text-gray-400">Near: {vehicle.landmark}</span>}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          🔒 Full address shared after booking confirmation
                        </div>
                      )}
                    </div>
                  </div>

                  {/* View on Map button */}
                  {vehicle.lat && vehicle.lng && (
                    <a
                      href={`https://www.google.com/maps?q=${vehicle.lat},${vehicle.lng}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-2xl hover:bg-blue-100 transition-all w-fit"
                    >
                      🗺️ View on Map
                    </a>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-black text-gray-900 text-base mb-5">What's included</h3>
                <div className="grid grid-cols-2 gap-3">
                  {vehicle.features.map(f => (
                    <div key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle size={12} className="text-green-600" />
                      </div>
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Owner */}
              <OwnerCard vehicle={vehicle} />

              {/* Reviews */}
              <ReviewsSection vehicle={vehicle} />

              {/* Map */}
              <MapSection vehicle={vehicle} />

              {/* Policies */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-black text-gray-900 text-base mb-5">Rental Policies</h3>
                <div className="space-y-3">
                  {[
                    { icon: '📋', title: 'Documents required', desc: 'Valid Driving License + Aadhaar card mandatory at pickup' },
                    { icon: '⛽', title: 'Fuel policy', desc: 'Full tank provided. Return with full tank or pay ₹120/litre' },
                    { icon: '↩️', title: 'Cancellation', desc: 'Free cancellation up to 24 hours before pickup. 50% refund after.' },
                    { icon: '🛡️', title: 'Insurance', desc: 'Basic insurance included. Optional premium cover available at ₹199/day' },
                    { icon: '🕐', title: 'Late return', desc: '₹200/hour charged for late returns beyond 1 hour grace period' },
                  ].map(p => (
                    <div key={p.title} className="flex gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                      <span className="text-xl flex-shrink-0">{p.icon}</span>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{p.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{p.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Sticky booking panel */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24">
                <BookingPanel vehicle={vehicle} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky Book Now bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-xl font-black text-orange-500">₹{vehicle.pricingType === 'hourly' ? (vehicle.hourlyPrice || 0) : vehicle.price.toLocaleString('en-IN')}</span>
              <span className="text-gray-400 text-sm">{vehicle.pricingType === 'hourly' ? '/hr' : '/day'}</span>
              <div className="flex items-center gap-1 mt-0.5">
                <Star size={11} className="text-yellow-400" fill="currentColor" />
                <span className="text-xs font-bold text-gray-700">{vehicle.rating}</span>
                <span className="text-xs text-gray-400">({vehicle.reviews})</span>
              </div>
            </div>
            <button
              onClick={() => setShowMobileBooking(true)}
              disabled={!vehicle.available || vehicle.isCurrentlyBooked}
              className={`flex-1 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 ${(vehicle.available && !vehicle.isCurrentlyBooked) ? 'btn-primary text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}
            >
              <Shield size={15} />
              {vehicle.isCurrentlyBooked ? '🔴 Booked' : (vehicle.available ? '⚡ Book Now' : 'Unavailable')}
            </button>
          </div>
        </div>

        {/* Mobile booking modal */}
        {showMobileBooking && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileBooking(false)} />
            <div className="relative bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto p-5 animate-modal">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
              <BookingPanel vehicle={vehicle} />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
