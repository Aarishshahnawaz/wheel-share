import { useEffect, useState, useCallback } from 'react';
import { Search, RefreshCw, CheckCircle, Clock, XCircle, Users, Wifi, WifiOff } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import KycCard from '../../components/admin/KycCard';
import { useAdmin } from '../../context/AdminContext';

const FILTERS = [
  { val: 'pending',  label: 'Pending',  icon: <Clock size={13} />,       cls: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { val: 'verified', label: 'Verified', icon: <CheckCircle size={13} />, cls: 'text-green-600 bg-green-50 border-green-200' },
  { val: 'rejected', label: 'Rejected', icon: <XCircle size={13} />,     cls: 'text-red-500 bg-red-50 border-red-200' },
  { val: 'all',      label: 'All',      icon: <Users size={13} />,        cls: 'text-blue-600 bg-blue-50 border-blue-200' },
];

export default function AdminKycPage() {
  const { users, stats, loading, usingMock, fetchRequests, fetchStats, updateKyc } = useAdmin();
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const load = useCallback(() => {
    fetchRequests({ status: filter === 'all' ? undefined : filter, search });
    fetchStats();
  }, [filter, search, fetchRequests, fetchStats]);

  useEffect(() => { load(); }, [filter]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => load(), 400);
    return () => clearTimeout(t);
  }, [search]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (id) => {
    const res = await updateKyc(id, 'verified');
    showToast(res.message, 'success');
  };

  const handleReject = async (id, reason) => {
    const res = await updateKyc(id, 'rejected', reason);
    showToast(res.message, 'error');
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-5 sticky top-0 z-30">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-black text-gray-900">KYC Requests</h1>
              <p className="text-xs text-gray-500 mt-0.5">Review and verify user identity documents</p>
            </div>
            <div className="flex items-center gap-2">
              {usingMock && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                  <WifiOff size={12} /> Demo mode
                </div>
              )}
              {!usingMock && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                  <Wifi size={12} /> Live API
                </div>
              )}
              <button onClick={load} disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-orange-300 hover:text-orange-600 transition-all disabled:opacity-50">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6 max-w-7xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Pending Review', val: stats.pending,  color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
              { label: 'Verified',       val: stats.verified, color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200' },
              { label: 'Rejected',       val: stats.rejected, color: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-200' },
              { label: 'Total Users',    val: stats.total,    color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-5`}>
                <div className={`text-3xl font-black ${s.color}`}>{s.val ?? '—'}</div>
                <div className="text-xs text-gray-500 font-semibold mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email or phone..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {FILTERS.map(f => (
                <button key={f.val} onClick={() => setFilter(f.val)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all
                    ${filter === f.val ? `${f.cls} shadow-sm` : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {f.icon} {f.label}
                  {f.val !== 'all' && stats[f.val] > 0 && (
                    <span className="ml-0.5 bg-current/20 px-1.5 py-0.5 rounded-full text-xs">{stats[f.val]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl border border-gray-100 h-80 animate-pulse" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center text-4xl mb-5">🔍</div>
              <h3 className="text-lg font-black text-gray-900 mb-1">No {filter} requests</h3>
              <p className="text-gray-500 text-sm">
                {search ? `No results for "${search}"` : `No KYC requests with status "${filter}"`}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 font-semibold">{users.length} result{users.length !== 1 ? 's' : ''}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {users.map(u => (
                  <KycCard key={u._id} user={u} onApprove={handleApprove} onReject={handleReject} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm text-white animate-modal min-w-max
          ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}
    </AdminLayout>
  );
}
