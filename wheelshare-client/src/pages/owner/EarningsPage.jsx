import { useState } from 'react';
import { TrendingUp, TrendingDown, Download, Wallet, Calendar, ArrowUpRight } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
const EARNINGS = [8200, 11400, 9800, 14200, 16800, 18450];
const MAX = Math.max(...EARNINGS);

const TRANSACTIONS = [
  { id: 'WS001', vehicle: 'Honda Activa 6G', renter: 'Priya S.', days: 3, amount: 1497, date: '28 Mar 2026', status: 'credited' },
  { id: 'WS002', vehicle: 'Maruti Swift Dzire', renter: 'Karan M.', days: 5, amount: 2995, date: '24 Mar 2026', status: 'credited' },
  { id: 'WS003', vehicle: 'Honda Activa 6G', renter: 'Sneha R.', days: 2, amount: 998, date: '19 Mar 2026', status: 'credited' },
  { id: 'WS004', vehicle: 'Maruti Swift Dzire', renter: 'Vikram T.', days: 7, amount: 4193, date: '12 Mar 2026', status: 'credited' },
  { id: 'WS005', vehicle: 'Honda Activa 6G', renter: 'Ananya B.', days: 1, amount: 499, date: '08 Mar 2026', status: 'refunded' },
];

export default function EarningsPage() {
  const [period, setPeriod] = useState('month');
  const total = EARNINGS.reduce((a, b) => a + b, 0);
  const thisMonth = EARNINGS[EARNINGS.length - 1];
  const lastMonth = EARNINGS[EARNINGS.length - 2];
  const growth = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-100 px-6 py-5 sticky top-0 z-30">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-gray-900">Earnings Dashboard 💰</h1>
              <p className="text-xs text-gray-500 mt-0.5">Track your vehicle rental income</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-orange-300 hover:text-orange-600 transition-all">
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'This Month', val: `₹${thisMonth.toLocaleString('en-IN')}`, sub: `${growth > 0 ? '+' : ''}${growth}% vs last month`, trend: growth > 0, icon: <Wallet size={18} className="text-green-500" /> },
              { label: 'Total Earned', val: `₹${total.toLocaleString('en-IN')}`, sub: 'All time', trend: true, icon: <TrendingUp size={18} className="text-blue-500" /> },
              { label: 'Trips Hosted', val: '47', sub: '+8 this month', trend: true, icon: <Calendar size={18} className="text-orange-500" /> },
              { label: 'Avg per Trip', val: `₹${Math.round(total / 47).toLocaleString('en-IN')}`, sub: 'Per booking', trend: null, icon: <ArrowUpRight size={18} className="text-purple-500" /> },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center">{s.icon}</div>
                  {s.trend !== null && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${s.trend ? 'text-green-600' : 'text-red-500'}`}>
                      {s.trend ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    </div>
                  )}
                </div>
                <div className="text-xl font-black text-gray-900">{s.val}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                <div className={`text-xs font-semibold mt-1 ${s.trend ? 'text-green-600' : 'text-gray-400'}`}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-gray-900">Monthly Earnings</h3>
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                {['month', 'quarter', 'year'].map(p => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end gap-3 h-40">
              {MONTHS.map((m, i) => (
                <div key={m} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-black text-gray-700">
                    {i === MONTHS.length - 1 ? `₹${(EARNINGS[i] / 1000).toFixed(1)}k` : ''}
                  </div>
                  <div className="w-full rounded-t-xl transition-all duration-500 relative group"
                    style={{
                      height: `${(EARNINGS[i] / MAX) * 120}px`,
                      background: i === MONTHS.length - 1
                        ? 'linear-gradient(to top, #f97316, #fb923c)'
                        : 'linear-gradient(to top, #e5e7eb, #f3f4f6)',
                    }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ₹{EARNINGS[i].toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 font-semibold">{m}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-black text-gray-900 mb-5">Recent Transactions</h3>
            <div className="space-y-3">
              {TRANSACTIONS.map(t => (
                <div key={t.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${t.status === 'credited' ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Wallet size={16} className={t.status === 'credited' ? 'text-green-600' : 'text-red-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate">{t.vehicle}</div>
                    <div className="text-xs text-gray-500">{t.renter} · {t.days} days · {t.date}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`font-black text-sm ${t.status === 'credited' ? 'text-green-600' : 'text-red-500'}`}>
                      {t.status === 'credited' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                    </div>
                    <div className={`text-xs font-bold mt-0.5 ${t.status === 'credited' ? 'text-green-500' : 'text-red-400'}`}>
                      {t.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payout info */}
          <div className="bg-gradient-to-r from-orange-500 to-blue-600 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold opacity-80 mb-1">Next Payout</div>
              <div className="text-2xl font-black">₹6,240</div>
              <div className="text-sm opacity-80 mt-1">Scheduled for 1 Apr 2026 · HDFC ••••4521</div>
            </div>
            <button className="bg-white text-orange-600 font-black px-6 py-3 rounded-2xl text-sm hover:bg-orange-50 transition-all shadow-md whitespace-nowrap">
              Manage Payouts →
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
