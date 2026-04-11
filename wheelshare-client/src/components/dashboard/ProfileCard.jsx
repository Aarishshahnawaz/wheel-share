import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, CheckCircle, Clock, AlertCircle, Edit2 } from 'lucide-react';
import { useAuth, calcProfileCompletion } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { useVehicleStore } from '../../context/VehicleStoreContext';

const KYC_BADGE = {
  verified: { label: 'KYC Verified', cls: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle size={10} /> },
  pending:  { label: 'KYC Pending',  cls: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Clock size={10} /> },
  rejected: { label: 'KYC Rejected', cls: 'bg-red-100 text-red-600 border-red-200', icon: <AlertCircle size={10} /> },
};

export default function ProfileCard() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { role }  = useRole();
  const { myVehicles } = useVehicleStore();
  const fileRef   = useRef();

  const completion = calcProfileCompletion(user);
  const kyc        = KYC_BADGE[user?.kycStatus || 'pending'];

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => updateProfile({ profileImage: ev.target.result });
    reader.readAsDataURL(file);
  };

  const joinedDate = user?.joinedAt
    ? new Date(user.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : '—';

  const stats = role === 'owner'
    ? [{ label: 'Vehicles', value: myVehicles.length || '0' }, { label: 'Trips Hosted', value: '47' }, { label: 'Earned', value: '₹32K' }]
    : [{ label: 'Trips', value: '12' }, { label: 'Cities', value: '5' }, { label: 'Saved', value: '₹4.2K' }];

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full"
    >
      {/* Cover gradient */}
      <div className="h-16 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-500 relative flex-shrink-0">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      <div className="px-5 pb-5 flex flex-col flex-1">
        {/* Avatar row */}
        <div className="flex items-end justify-between -mt-8 mb-3">
          <motion.div
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            className="relative cursor-pointer"
            onClick={() => fileRef.current.click()}
          >
            <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-lg bg-gradient-to-br from-orange-100 to-blue-100 flex items-center justify-center overflow-hidden">
              {user?.profileImage
                ? <img src={user.profileImage} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-xl font-black text-orange-400">{user?.name?.[0]?.toUpperCase() || '?'}</span>
              }
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
              <Camera size={9} className="text-white" />
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </motion.div>

          <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${kyc.cls}`}>
            {kyc.icon} {kyc.label}
          </div>
        </div>

        {/* Name + meta */}
        <div className="mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-black text-gray-900 text-sm">{user?.name || 'Your Name'}</h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${role === 'owner' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
              {role === 'owner' ? '💰 Owner' : '🏍️ Renter'}
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-1 space-y-0.5">
            {user?.email && <div className="truncate">{user.email}</div>}
            {user?.phone && <div>{user.phone}</div>}
            <div>Joined {joinedDate}</div>
          </div>
        </div>

        {/* Completion bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-gray-500">Profile completion</span>
            <span className={`text-xs font-black ${completion === 100 ? 'text-green-600' : 'text-orange-500'}`}>{completion}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              className={`h-full rounded-full ${completion === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-orange-400 to-orange-500'}`}
            />
          </div>
          {completion < 100 && (
            <button onClick={() => navigate('/profile')} className="text-xs text-orange-500 font-bold mt-1 hover:underline">
              Complete your profile →
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {stats.map(s => (
            <motion.div
              key={s.label}
              whileHover={{ scale: 1.04, backgroundColor: '#fff7ed' }}
              transition={{ duration: 0.15 }}
              className="bg-gray-50 rounded-2xl p-2.5 text-center border border-gray-100 cursor-default"
            >
              <div className="text-sm font-black text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400 font-medium mt-0.5 leading-tight">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Edit button — pushed to bottom */}
        <div className="mt-auto">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/profile')}
            className="w-full py-2.5 rounded-2xl border border-gray-200 text-xs font-bold text-gray-600 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center justify-center gap-1.5"
          >
            <Edit2 size={12} /> Edit Profile
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
