import { TrendingUp, Download, IndianRupee, Users, Car, BookOpen } from 'lucide-react';
import AdminShell from '../components/AdminShell';
import { AdminPageHeader, StatCard, SectionCard } from '../components/AdminUI';
import { useAdminStore } from '../context/AdminStore';

export default function AdminEarnings() {
  const { stats, monthly, vehicles } = useAdminStore();
  const maxEarning = Math.max(...monthly.map(m => m.amount));
  const totalRevenue = monthly.reduce((s, m) => s + m.amount, 0);
  const avgMonthly = Math.round(totalRevenue / monthly.length);
  const thisMonth = monthly[monthly.length - 1].amount;
  const lastMonth = monthly[monthly.length - 2].amount;
  const growth = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);

  const topVehicles = [...vehicles]
    .filter(v => v.earnings > 0)
    .sort((a, b) => b.earnings - a.earnings)
    .slice(0, 5);

  return (
    <AdminShell>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <AdminPageHeader
          title="Platform Earnings"
          sub="Revenue from 12% commission on all bookings"
          action={
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-violet-300 hover:text-violet-600 transition-all">
              <Download size={14} /> Export CSV
            </button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="This Month"    value={`₹${(thisMonth / 1000).toFixed(0)}K`}       sub={`${growth > 0 ? '+' : ''}${growth}% vs last month`} trend={growth}  accent="violet" icon={<IndianRupee size={18} className="text-violet-600" />} />
          <StatCard label="Total Revenue" value={`₹${(totalRevenue / 100000).toFixed(1)}L`}  sub="Last 6 months"                                        trend={undefined} accent="green"  icon={<TrendingUp size={18} className="text-emerald-600" />} />
          <StatCard label="Avg Monthly"   value={`₹${(avgMonthly / 1000).toFixed(0)}K`}      sub="6-month average"                                      trend={undefined} accent="blue"   icon={<BookOpen size={18} className="text-blue-600" />} />
          <StatCard label="Active Owners" value={String(vehicles.filter(v => v.status === 'approved').length)} sub="Earning vehicles" trend={undefined} accent="orange" icon={<Car size={18} className="text-orange-600" />} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Bar chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-gray-900">Monthly Revenue Trend</h3>
                <p className="text-xs text-gray-500 mt-0.5">Platform commission collected</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                ↑ {growth}% MoM
              </span>
            </div>

            {/* Chart */}
            <div className="flex items-end gap-4 h-48 mb-4">
              {monthly.map((m, i) => {
                const isLast = i === monthly.length - 1;
                const h = Math.round((m.amount / maxEarning) * 170);
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-xs font-black text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{(m.amount / 1000).toFixed(0)}K
                    </div>
                    <div className="w-full rounded-t-2xl transition-all duration-700 relative cursor-pointer"
                      style={{
                        height: `${h}px`,
                        background: isLast
                          ? 'linear-gradient(to top, #4f46e5, #818cf8)'
                          : '#e0e7ff',
                      }}>
                      {isLast && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-black whitespace-nowrap" style={{ color: '#4f46e5' }}>
                          ₹{(m.amount / 1000).toFixed(0)}K
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-semibold" style={{ color: isLast ? '#4f46e5' : '#94a3b8' }}>{m.month}</div>
                  </div>
                );
              })}
            </div>

            {/* Monthly breakdown table */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              {monthly.map((m, i) => (
                <div key={m.month} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">{m.month} 2026</span>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(m.amount / maxEarning) * 100}%`, background: i === monthly.length - 1 ? '#4f46e5' : '#c7d2fe' }} />
                    </div>
                    <span className="font-black w-20 text-right" style={{ color: i === monthly.length - 1 ? '#4f46e5' : '#374151' }}>
                      ₹{m.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top earning vehicles */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-black text-gray-900 mb-4">Top Earning Vehicles</h3>
            <div className="space-y-4">
              {topVehicles.map((v, i) => (
                <div key={v.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background: i === 0 ? '#fef3c7' : '#f3f4f6', color: i === 0 ? '#d97706' : '#6b7280' }}>
                    {i + 1}
                  </div>
                  <img src={v.image} alt={v.name} className="w-10 h-8 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-gray-900 truncate">{v.name}</div>
                    <div className="text-xs text-gray-400">{v.bookings} bookings</div>
                  </div>
                  <div className="text-xs font-black text-emerald-600 whitespace-nowrap">
                    ₹{(v.earnings / 1000).toFixed(1)}K
                  </div>
                </div>
              ))}
            </div>

            {/* Commission info */}
            <div className="mt-5 rounded-xl p-4 space-y-2" style={{ background: '#f5f3ff', border: '1px solid #ddd6fe' }}>
              <div className="text-xs font-black" style={{ color: '#4f46e5' }}>Commission Structure</div>
              {[
                { label: 'Platform fee', val: '12%' },
                { label: 'Owner payout', val: '88%' },
                { label: 'Insurance cut', val: '₹99/day' },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-xs">
                  <span style={{ color: '#6d28d9' }}>{r.label}</span>
                  <span className="font-black" style={{ color: '#4f46e5' }}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
