import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { Zap, Clock, XCircle } from 'lucide-react';

const metrics = [
  {
    label: 'Acceptance Rate',
    value: 87,
    color: '#22c55e',
    bg: 'bg-green-50',
    textColor: 'text-green-700',
    icon: <Zap size={14} className="text-green-600" />,
    desc: '87 of 100 requests accepted',
  },
  {
    label: 'Response Time',
    value: 72,
    color: '#3b82f6',
    bg: 'bg-blue-50',
    textColor: 'text-blue-700',
    icon: <Clock size={14} className="text-blue-600" />,
    desc: 'Avg 18 min response',
  },
  {
    label: 'Cancellation Rate',
    value: 8,
    color: '#ef4444',
    bg: 'bg-red-50',
    textColor: 'text-red-600',
    icon: <XCircle size={14} className="text-red-500" />,
    desc: '8% — below 10% target ✓',
  },
];

function MiniRadial({ value, color }) {
  const data = [{ value, fill: color }, { value: 100 - value, fill: '#f3f4f6' }];
  return (
    <div className="w-14 h-14 relative flex-shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="100%" startAngle={90} endAngle={-270} data={data} barSize={6}>
          <RadialBar dataKey="value" cornerRadius={4} />
        </RadialBarChart>
      </ResponsiveContainer>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-gray-800">{value}%</span>
    </div>
  );
}

export default function PerformanceCard() {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-black text-gray-900 text-base">Performance</h3>
        <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-semibold">Last 30 days</span>
      </div>

      <div className="space-y-4">
        {metrics.map(m => (
          <div key={m.label} className={`flex items-center gap-4 p-3 rounded-2xl ${m.bg}`}>
            <MiniRadial value={m.value} color={m.color} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                {m.icon}
                <span className={`text-xs font-black ${m.textColor}`}>{m.label}</span>
              </div>
              <div className="w-full bg-white/60 rounded-full h-1.5 mb-1">
                <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${m.value}%`, backgroundColor: m.color }} />
              </div>
              <p className="text-xs text-gray-500">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
