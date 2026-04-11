import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Car, Wallet, Clock, Star, ArrowRight } from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { useVehicleStore } from '../../context/VehicleStoreContext';

function StatCard({ label, value, sub, color, bg, icon, trend, trendVal, onClick, cta }) {
  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ duration: 0.18 }}
      onClick={onClick}
      className={`${bg} rounded-2xl p-5 border border-white shadow-sm ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${color.replace('text-', 'bg-').replace('600','100').replace('500','100')} flex items-center justify-center`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trendVal}
          </div>
        )}
      </div>
      <p className="text-xs font-semibold text-gray-500 mb-0.5">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
      {cta && (
        <button className="mt-2 flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors">
          {cta} <ArrowRight size={11} />
        </button>
      )}
    </motion.div>
  );
}

export default function StatsBar() {
  const { role } = useRole();
  const { myVehicles } = useVehicleStore();
  const navigate = useNavigate();

  const availableCount = myVehicles.filter(v => v.isAvailable).length;

  const renterStats = [
    { label: 'Active Booking',  value: '1',      sub: 'Royal Enfield · Mumbai',  color: 'text-orange-500', bg: 'bg-orange-50',  icon: <Car size={16} className="text-orange-500" />,    trend: null },
    { label: 'Total Trips',     value: '12',     sub: '+3 this month',            color: 'text-blue-600',   bg: 'bg-blue-50',    icon: <Clock size={16} className="text-blue-500" />,    trend: 'up', trendVal: '+3' },
    { label: 'Amount Spent',    value: '₹8,400', sub: 'Lifetime total',           color: 'text-purple-600', bg: 'bg-purple-50',  icon: <Wallet size={16} className="text-purple-500" />, trend: null },
    { label: 'Avg Rating',      value: '4.6',    sub: 'Across 10 reviews',        color: 'text-yellow-600', bg: 'bg-yellow-50',  icon: <Star size={16} className="text-yellow-500" />,   trend: 'up', trendVal: '+0.2' },
  ];

  const ownerStats = [
    { label: 'This Month',        value: '₹18,450',              sub: 'Earnings',                    color: 'text-green-600',  bg: 'bg-green-50',  icon: <Wallet size={16} className="text-green-600" />,  trend: 'up', trendVal: '+22%', onClick: () => navigate('/earnings') },
    { label: 'Active Listings',   value: String(myVehicles.length), sub: `${availableCount} available`, color: 'text-blue-600',   bg: 'bg-blue-50',   icon: <Car size={16} className="text-blue-500" />,      trend: null, onClick: () => navigate('/my-vehicles') },
    { label: 'Pending Requests',  value: '3',                    sub: 'Needs your action',           color: 'text-orange-500', bg: 'bg-orange-50', icon: <Clock size={16} className="text-orange-500" />,  trend: null, onClick: () => navigate('/owner-bookings'), cta: 'View Requests' },
    { label: 'Avg Rating',        value: '4.8',                  sub: 'From 47 renters',             color: 'text-yellow-600', bg: 'bg-yellow-50', icon: <Star size={16} className="text-yellow-500" />,   trend: 'up', trendVal: '+0.1' },
  ];

  const stats = role === 'owner' ? ownerStats : renterStats;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(s => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
