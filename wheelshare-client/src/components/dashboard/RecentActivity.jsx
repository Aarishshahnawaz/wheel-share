import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, Star, Wallet, AlertCircle, ArrowRight } from 'lucide-react';

const RENTER_ACTIVITY = [
  { icon: CheckCircle, iconColor: 'text-green-500',  bg: 'bg-green-50',  title: 'Booking Confirmed',  desc: 'Royal Enfield Classic 350 · Mumbai',       time: '2 hours ago',  group: 'Today',     tag: 'Active',    tagColor: 'bg-green-100 text-green-700',   amount: null },
  { icon: AlertCircle, iconColor: 'text-orange-500', bg: 'bg-orange-50', title: 'Booking Requested',  desc: 'Honda CB Shine · Hyderabad',               time: '5 hours ago',  group: 'Today',     tag: 'Pending',   tagColor: 'bg-orange-100 text-orange-700', amount: null },
  { icon: Star,        iconColor: 'text-yellow-500', bg: 'bg-yellow-50', title: 'Review Posted',      desc: 'You rated Honda Activa ⭐⭐⭐⭐⭐',           time: '3 days ago',   group: 'Yesterday', tag: null,        tagColor: '',                              amount: null },
  { icon: CheckCircle, iconColor: 'text-blue-500',   bg: 'bg-blue-50',   title: 'Trip Completed',     desc: 'Maruti Swift Dzire · Pune → Lonavala',     time: '1 week ago',   group: 'Earlier',   tag: 'Completed', tagColor: 'bg-blue-100 text-blue-700',     amount: '₹2,400 paid' },
  { icon: XCircle,     iconColor: 'text-red-400',    bg: 'bg-red-50',    title: 'Booking Cancelled',  desc: 'Bajaj Pulsar 150 · Bangalore',             time: '2 weeks ago',  group: 'Earlier',   tag: 'Refunded',  tagColor: 'bg-red-100 text-red-600',       amount: '₹599 refunded' },
];

const OWNER_ACTIVITY = [
  { icon: Wallet,      iconColor: 'text-green-500',  bg: 'bg-green-50',  title: 'Payout Received',    desc: 'Honda Activa rental · 3 days',             time: '1 hour ago',   group: 'Today',     tag: 'Credited',       tagColor: 'bg-green-100 text-green-700',   amount: '₹1,497' },
  { icon: AlertCircle, iconColor: 'text-orange-500', bg: 'bg-orange-50', title: 'New Booking Request',desc: 'Priya S. wants your Swift Dzire',          time: '3 hours ago',  group: 'Today',     tag: 'Action needed',  tagColor: 'bg-orange-100 text-orange-700', amount: null },
  { icon: CheckCircle, iconColor: 'text-blue-500',   bg: 'bg-blue-50',   title: 'Trip Completed',     desc: 'Arjun M. returned Royal Enfield',          time: '2 days ago',   group: 'Yesterday', tag: 'Completed',      tagColor: 'bg-blue-100 text-blue-700',     amount: '₹2,994 earned' },
  { icon: Star,        iconColor: 'text-yellow-500', bg: 'bg-yellow-50', title: 'New Review',         desc: 'Sneha R. gave your Activa 5 stars',        time: '4 days ago',   group: 'Earlier',   tag: null,             tagColor: '',                              amount: null },
  { icon: CheckCircle, iconColor: 'text-green-500',  bg: 'bg-green-50',  title: 'Vehicle Verified',   desc: 'Honda Activa 6G approved by WheelShare',   time: '1 week ago',   group: 'Earlier',   tag: 'Verified',       tagColor: 'bg-green-100 text-green-700',   amount: null },
];

function groupBy(items) {
  return items.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});
}

const GROUP_ORDER = ['Today', 'Yesterday', 'Earlier'];

export default function RecentActivity({ role }) {
  const navigate = useNavigate();
  const items  = role === 'owner' ? OWNER_ACTIVITY : RENTER_ACTIVITY;
  const groups = groupBy(items);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-black text-gray-900 text-base">Recent Activity</h3>
        <button
          onClick={() => navigate('/bookings')}
          className="flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors"
        >
          View all <ArrowRight size={12} />
        </button>
      </div>

      <div className="space-y-5">
        {GROUP_ORDER.filter(g => groups[g]).map(group => (
          <div key={group}>
            <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 px-1">{group}</div>
            <div className="space-y-1">
              {groups[group].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i}
                    className="flex items-start gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-all duration-150 cursor-default group"
                  >
                    <div className={`w-8 h-8 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform`}>
                      <Icon size={15} className={item.iconColor} fill={item.icon === Star ? 'currentColor' : 'none'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-gray-900">{item.title}</span>
                        {item.tag && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.tagColor}`}>{item.tag}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{item.desc}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {item.amount && <div className="text-xs font-black text-gray-800">{item.amount}</div>}
                      <div className="text-xs text-gray-400 mt-0.5">{item.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
