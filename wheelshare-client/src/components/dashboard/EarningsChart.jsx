import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const DATA = {
  '7d': [
    { label: 'Mon', earnings: 1200, trips: 2 },
    { label: 'Tue', earnings: 800,  trips: 1 },
    { label: 'Wed', earnings: 2100, trips: 3 },
    { label: 'Thu', earnings: 1500, trips: 2 },
    { label: 'Fri', earnings: 3200, trips: 4 },
    { label: 'Sat', earnings: 4100, trips: 5 },
    { label: 'Sun', earnings: 2800, trips: 3 },
  ],
  '30d': [
    { label: 'W1', earnings: 8400,  trips: 11 },
    { label: 'W2', earnings: 11200, trips: 15 },
    { label: 'W3', earnings: 9800,  trips: 13 },
    { label: 'W4', earnings: 14500, trips: 18 },
  ],
  'monthly': [
    { label: 'Jan', earnings: 18000, trips: 24 },
    { label: 'Feb', earnings: 22000, trips: 29 },
    { label: 'Mar', earnings: 19500, trips: 26 },
    { label: 'Apr', earnings: 28000, trips: 35 },
    { label: 'May', earnings: 24000, trips: 31 },
    { label: 'Jun', earnings: 31000, trips: 40 },
  ],
};

const TOTALS = {
  '7d':      { value: '₹15,700',   change: +22, label: 'vs last week' },
  '30d':     { value: '₹43,900',   change: +18, label: 'vs last month' },
  'monthly': { value: '₹1,42,500', change: +31, label: 'vs last year' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white px-3 py-2.5 rounded-xl text-xs shadow-2xl border border-white/10">
      <div className="font-bold mb-1 text-gray-300">{label}</div>
      <div className="text-orange-400 font-black text-sm">₹{payload[0]?.value?.toLocaleString('en-IN')}</div>
      <div className="text-gray-400 mt-0.5">{payload[1]?.value} trips</div>
    </div>
  );
};

export default function EarningsChart() {
  const [range,     setRange]     = useState('7d');
  const [chartType, setChartType] = useState('area');
  const data   = DATA[range];
  const totals = TOTALS[range];
  const up     = totals.change > 0;

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="font-black text-gray-900 text-base">Earnings Overview</h3>
          <div className="flex items-center gap-2 mt-1.5">
            <motion.span
              key={totals.value}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-black text-gray-900"
            >
              {totals.value}
            </motion.span>
            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
              {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {up ? '+' : ''}{totals.change}%
            </span>
            <span className="text-xs text-gray-400">{totals.label}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chart type */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {[['area', '〰'], ['bar', '▐']].map(([t, icon]) => (
              <button key={t} onClick={() => setChartType(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${chartType === t ? 'bg-white shadow text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
                {icon}
              </button>
            ))}
          </div>
          {/* Range */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {[['7d', '7D'], ['30d', '30D'], ['monthly', 'Monthly']].map(([val, label]) => (
              <button key={val} onClick={() => setRange(val)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${range === val ? 'bg-orange-500 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart — flex-1 so it fills remaining height */}
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="earnings" stroke="#f97316" strokeWidth={2.5}
                fill="url(#earningsGrad)" dot={{ fill: '#f97316', r: 3 }} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="trips" stroke="#3b82f6" strokeWidth={1.5}
                fill="none" strokeDasharray="4 2" dot={false} />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="earnings" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-3 h-0.5 bg-orange-500 rounded inline-block" /> Earnings
        </div>
        {chartType === 'area' && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-3 h-0.5 bg-blue-500 rounded inline-block" /> Trips
          </div>
        )}
      </div>
    </motion.div>
  );
}
