import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, PlusCircle, Wallet, ClipboardList, MapPin, Star, Inbox } from 'lucide-react';
import { useRole } from '../../context/RoleContext';

export default function QuickActions() {
  const navigate = useNavigate();
  const { role } = useRole();

  const renterActions = [
    {
      icon: <Search size={22} />,
      label: 'Search Vehicle',
      desc: 'Find bikes & cars near you',
      gradient: 'from-orange-500 to-amber-500',
      path: '/rent',
    },
    {
      icon: <ClipboardList size={22} />,
      label: 'My Bookings',
      desc: 'View active & past trips',
      gradient: 'from-blue-500 to-indigo-500',
      path: '/bookings',
    },
    {
      icon: <MapPin size={22} />,
      label: 'Track Ride',
      desc: 'Live GPS of your rental',
      gradient: 'from-green-500 to-emerald-500',
      path: '/track',
    },
    {
      icon: <Star size={22} />,
      label: 'My Reviews',
      desc: 'Ratings you\'ve given',
      gradient: 'from-purple-500 to-pink-500',
      path: '/reviews',
    },
  ];

  const ownerActions = [
    { icon: <PlusCircle size={22} />, label: 'List Vehicle',     desc: 'Add a new bike or car',  gradient: 'from-orange-500 to-amber-500', path: '/list' },
    { icon: <Wallet size={22} />,     label: 'Earnings',         desc: 'Track your income',      gradient: 'from-green-500 to-emerald-500', path: '/earnings' },
    { icon: <Inbox size={22} />,      label: 'Booking Requests', desc: 'Approve or decline',     gradient: 'from-blue-500 to-indigo-500',  path: '/owner-bookings' },
    { icon: <Star size={22} />,       label: 'Reviews',          desc: 'What renters say',       gradient: 'from-purple-500 to-pink-500',  path: '/reviews' },
  ];

  const actions = role === 'owner' ? ownerActions : renterActions;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-black text-gray-900 text-base mb-5">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((a) => (
          <motion.button
            key={a.label}
            whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            onClick={() => navigate(a.path)}
            className="group flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 text-left bg-gray-50 hover:bg-white"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-white shadow-md flex-shrink-0 group-hover:scale-110 transition-transform`}>
              {a.icon}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-gray-900 truncate">{a.label}</div>
              <div className="text-xs text-gray-500 truncate">{a.desc}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
