import { useEffect } from 'react';
import { Users, Car, BookOpen, TrendingUp, Clock, ArrowRight, RefreshCw, ShieldCheck, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminShell from '../components/AdminShell';
import { StatCard, AdminBadge, AdminPageHeader, SectionCard } from '../components/AdminUI';
import { useAdminStore } from '../context/AdminStore';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { stats, monthly, users, vehicles, kyc, loading, fetchStats, fetchUsers, fetchKyc } = useAdminStore();

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchKyc();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pendingKyc      = stats.kyc?.pending || kyc.filter(u => u.kycStatus === 'pending').length;
  const pendingVehicles = vehicles.filter(v => v.status === 'pending').length;
  const maxEarning      = Math.max(...monthly.map(m => m.amount), 1);
  const recentUsers     = [...users].slice(0, 5);
  const recentVehicles  = vehicles.slice(0, 4);
  const isLoading       = loading.stats || loading.users;

  const refresh = () => { fetchStats(); fetchUsers(); fetchKyc(); };

  return (
    <AdminShell>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">

        {/* Header */}
        <AdminPageHeader
          title="Dashboard"
          sub={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          action={
            <button onClick={refresh} disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 disabled:opacity-50"
              style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#374151', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#fed7aa'; e.currentTarget.style.color = '#ea580c'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#374151'; }}
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          }
        />

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Users" value={isLoading ? '…' : stats.totalUsers.toLocaleString('en-IN')}
            sub={`${stats.activeUsers || 0} active`} accent="violet"
            icon={<Users size={18} />}
          />
          <StatCard
            label="KYC Pending" value={isLoading ? '…' : String(stats.kyc?.pending || 0)}
            sub="Awaiting review" accent="orange"
            icon={<Clock size={18} />}
            onClick={pendingKyc > 0 ? () => navigate('/admin2/kyc') : undefined}
          />
          <StatCard
            label="KYC Verified" value={isLoading ? '…' : String(stats.kyc?.verified || 0)}
            sub="Approved users" accent="green"
            icon={<ShieldCheck size={18} />}
          />
          <StatCard
            label="Banned Users" value={isLoading ? '…' : String(stats.bannedUsers || 0)}
            sub="Inactive accounts" accent="red"
            icon={<Ban size={18} />}
          />
        </div>

        {/* Alert banners */}
        {(pendingKyc > 0 || pendingVehicles > 0) && (
          <div className="grid sm:grid-cols-2 gap-3">
            {pendingKyc > 0 && (
              <button onClick={() => navigate('/admin2/kyc')}
                className="flex items-center gap-4 p-4 rounded-2xl text-left group transition-all duration-200"
                style={{ background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', border: '1px solid #fde68a', boxShadow: '0 2px 8px rgba(245,158,11,0.12)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(245,158,11,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(245,158,11,0.12)'; }}
              >
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                  <Clock size={17} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-black" style={{ color: '#78350f' }}>
                    {pendingKyc} KYC request{pendingKyc > 1 ? 's' : ''} pending
                  </div>
                  <div className="text-xs mt-0.5 font-medium" style={{ color: '#92400e' }}>Tap to review now</div>
                </div>
                <ArrowRight size={16} style={{ color: '#d97706' }} className="group-hover:translate-x-1 transition-transform duration-150 flex-shrink-0" />
              </button>
            )}
            {pendingVehicles > 0 && (
              <button onClick={() => navigate('/admin2/vehicles')}
                className="flex items-center gap-4 p-4 rounded-2xl text-left group transition-all duration-200"
                style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '1px solid #bfdbfe', boxShadow: '0 2px 8px rgba(59,130,246,0.1)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(59,130,246,0.18)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.1)'; }}
              >
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}>
                  <Car size={17} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-black" style={{ color: '#1e3a8a' }}>
                    {pendingVehicles} vehicle{pendingVehicles > 1 ? 's' : ''} awaiting approval
                  </div>
                  <div className="text-xs mt-0.5 font-medium" style={{ color: '#1d4ed8' }}>Review new listings</div>
                </div>
                <ArrowRight size={16} style={{ color: '#3b82f6' }} className="group-hover:translate-x-1 transition-transform duration-150 flex-shrink-0" />
              </button>
            )}
          </div>
        )}

        {/* Chart + recent users */}
        <div className="grid lg:grid-cols-5 gap-5">

          {/* Revenue chart — 3 cols */}
          <div className="lg:col-span-3">
            <SectionCard
              title="Monthly Revenue"
              action={
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                  ↑ {stats.monthlyGrowth?.earnings ?? 0}% MoM
                </span>
              }
              noPad
            >
              <div className="px-6 pb-6 pt-4">
                <p className="text-xs font-medium mb-6" style={{ color: '#94a3b8' }}>Platform commission (12%)</p>
                <div className="flex items-end gap-2 h-40">
                  {monthly.map((m, i) => {
                    const isLast = i === monthly.length - 1;
                    const h = Math.max(10, Math.round((m.amount / maxEarning) * 140));
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="relative w-full rounded-t-xl transition-all duration-500 cursor-default overflow-visible"
                          style={{
                            height: `${h}px`,
                            background: isLast
                              ? 'linear-gradient(to top,#ea580c,#f97316,#fb923c)'
                              : 'linear-gradient(to top,#e2e8f0,#f1f5f9)',
                            boxShadow: isLast ? '0 4px 16px rgba(249,115,22,0.35)' : 'none',
                          }}>
                          {/* Tooltip */}
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs font-bold px-2.5 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-150 whitespace-nowrap pointer-events-none z-10 shadow-lg"
                            style={{ background: '#0f172a', color: '#fff' }}>
                            ₹{m.amount.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="text-xs font-bold" style={{ color: isLast ? '#ea580c' : '#94a3b8' }}>{m.month}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Recent users — 2 cols */}
          <div className="lg:col-span-2">
            <SectionCard
              title="Recent Users"
              action={
                <button onClick={() => navigate('/admin2/users')}
                  className="text-xs font-bold transition-colors duration-150"
                  style={{ color: '#f97316' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#ea580c'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#f97316'; }}
                >
                  View all →
                </button>
              }
            >
              <div className="space-y-1">
                {recentUsers.map(u => (
                  <div key={u.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-default"
                    onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Avatar with initials */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 text-white"
                      style={{ background: `hsl(${(u.name.charCodeAt(0) * 37) % 360},60%,50%)` }}>
                      {u.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate" style={{ color: '#0f172a' }}>{u.name}</div>
                      <div className="text-xs truncate font-medium" style={{ color: '#94a3b8' }}>{u.city || '—'}</div>
                    </div>
                    <AdminBadge status={u.kycStatus} />
                  </div>
                ))}
                {recentUsers.length === 0 && (
                  <div className="text-center py-8 text-sm font-medium" style={{ color: '#94a3b8' }}>No users yet</div>
                )}
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Recent vehicle listings */}
        <SectionCard
          title="Recent Vehicle Listings"
          action={
            <button onClick={() => navigate('/admin2/vehicles')}
              className="text-xs font-bold transition-colors duration-150"
              style={{ color: '#f97316' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ea580c'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#f97316'; }}
            >
              View all →
            </button>
          }
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentVehicles.map(v => (
              <div key={v.id}
                className="rounded-2xl overflow-hidden transition-all duration-200 cursor-default"
                style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
              >
                <div className="h-28 overflow-hidden bg-gray-100 relative">
                  <img src={v.image} alt={v.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="p-3.5">
                  <div className="text-xs font-black truncate" style={{ color: '#0f172a' }}>{v.name}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>{v.city}</span>
                    <AdminBadge status={v.status} />
                  </div>
                </div>
              </div>
            ))}
            {recentVehicles.length === 0 && (
              <div className="col-span-4 text-center py-10 text-sm font-medium" style={{ color: '#94a3b8' }}>
                No vehicles listed yet
              </div>
            )}
          </div>
        </SectionCard>

      </div>
    </AdminShell>
  );
}
