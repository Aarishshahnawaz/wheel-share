import { useNavigate } from 'react-router-dom';
import { Shield, Users, TrendingUp, ArrowRight } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';

export default function AdminOverviewPage() {
  const navigate = useNavigate();
  const { stats } = useAdmin();

  const cards = [
    { label: 'Pending KYC',  val: stats.pending,  color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', path: '/admin/kyc' },
    { label: 'Verified',     val: stats.verified, color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200',  path: '/admin/kyc' },
    { label: 'Rejected',     val: stats.rejected, color: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-200',    path: '/admin/kyc' },
    { label: 'Total Users',  val: stats.total,    color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   path: '/admin/users' },
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Admin Overview</h1>
            <p className="text-gray-500 text-sm mt-0.5">WheelShare platform management</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map(c => (
              <button key={c.label} onClick={() => navigate(c.path)}
                className={`${c.bg} border ${c.border} rounded-2xl p-5 text-left hover:shadow-md transition-all group`}>
                <div className={`text-3xl font-black ${c.color}`}>{c.val ?? '—'}</div>
                <div className="text-xs text-gray-500 font-semibold mt-1">{c.label}</div>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 mt-2 transition-colors" />
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: <Shield size={22} className="text-orange-500" />, title: 'KYC Requests', desc: `${stats.pending} pending review`, path: '/admin/kyc', btn: 'Review Now' },
              { icon: <Users size={22} className="text-blue-500" />,    title: 'All Users',    desc: `${stats.total} registered users`, path: '/admin/users', btn: 'View Users' },
              { icon: <TrendingUp size={22} className="text-green-500" />, title: 'Platform Stats', desc: 'Revenue & bookings', path: '/admin', btn: 'Coming Soon' },
            ].map(c => (
              <div key={c.title} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">{c.icon}</div>
                <h3 className="font-black text-gray-900">{c.title}</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">{c.desc}</p>
                <button onClick={() => navigate(c.path)}
                  className="text-xs font-bold text-orange-500 hover:underline flex items-center gap-1">
                  {c.btn} <ArrowRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
