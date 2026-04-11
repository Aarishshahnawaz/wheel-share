import { Star, Shield, MessageCircle, Phone } from 'lucide-react';

export default function OwnerCard({ vehicle }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <h3 className="font-black text-gray-900 text-base mb-5">Meet your owner</h3>

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-blue-100 flex items-center justify-center text-3xl shadow-md">
            {vehicle.ownerAvatar}
          </div>
          {vehicle.ownerVerified && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
              <Shield size={12} className="text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-gray-900">{vehicle.owner}</span>
            {vehicle.ownerVerified && (
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                ✓ Verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-sm text-gray-600">
              <Star size={13} className="text-yellow-400" fill="currentColor" />
              <span className="font-bold">{vehicle.ownerRating}</span>
            </span>
            <span className="text-gray-400 text-xs">·</span>
            <span className="text-sm text-gray-600">{vehicle.ownerTrips} trips hosted</span>
            <span className="text-gray-400 text-xs">·</span>
            <span className="text-sm text-gray-500">Since {vehicle.ownerJoined}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mt-5">
        {[
          { label: 'Response rate', value: '98%' },
          { label: 'Response time', value: '< 1 hr' },
          { label: 'Trips hosted', value: vehicle.ownerTrips },
        ].map(s => (
          <div key={s.label} className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100">
            <div className="font-black text-gray-900 text-sm">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Contact buttons */}
      <div className="grid grid-cols-2 gap-3 mt-5">
        <button className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-gray-200 text-sm font-bold text-gray-700 hover:border-orange-300 hover:text-orange-600 transition-all">
          <MessageCircle size={15} /> Message
        </button>
        <button className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-gray-200 text-sm font-bold text-gray-700 hover:border-green-300 hover:text-green-600 transition-all">
          <Phone size={15} /> Call
        </button>
      </div>
    </div>
  );
}
