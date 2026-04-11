import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, Eye } from 'lucide-react';
import AdminShell from '../components/AdminShell';
import { AdminPageHeader, AdminBadge, FilterTabs, SearchInput } from '../components/AdminUI';
import { useAdminStore } from '../context/AdminStore';
import KycDetailModal from '../components/KycDetailModal';

// ── Compact KYC card — click to open full modal ───────────────────────────────
function KycCard({ user, onView }) {
  return (
    <div
      onClick={() => onView(user.id)}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group"
    >
      {/* Status stripe */}
      <div className={`h-1 w-full ${user.kycStatus === 'verified' ? 'bg-emerald-500' : user.kycStatus === 'rejected' ? 'bg-red-500' : 'bg-amber-400'}`} />

      <div className="p-5">
        {/* User header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', color: '#6d28d9' }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-black text-gray-900 text-sm">{user.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{user.email}</div>
              {user.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
            </div>
          </div>
          <AdminBadge status={user.kycStatus} />
        </div>

        {/* Doc preview thumbnails */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { src: user.license, label: 'DL' },
            { src: user.aadhaar, label: 'Aadhaar' },
          ].map(doc => (
            <div key={doc.label} className="relative rounded-xl overflow-hidden bg-gray-100"
              style={{ height: '72px' }}>
              {doc.src
                ? <img src={doc.src} alt={doc.label} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-semibold">Not uploaded</div>}
              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                {doc.label}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Submitted {user.submittedAt}</span>
          <button
            onClick={e => { e.stopPropagation(); onView(user.id); }}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
            style={{ background: '#f5f3ff', color: '#6d28d9' }}
          >
            <Eye size={12} /> Review
          </button>
        </div>

        {/* Rejection reason */}
        {user.kycStatus === 'rejected' && user.rejectionReason && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-600 font-semibold">
            ❌ {user.rejectionReason}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminKyc() {
  const { kyc, approveKyc, rejectKyc, loading, fetchKyc } = useAdminStore();
  const [filter,        setFilter]        = useState('pending');
  const [search,        setSearch]        = useState('');
  const [selectedUser,  setSelectedUser]  = useState(null); // userId for modal

  useEffect(() => { fetchKyc(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = {
    pending:  kyc.filter(u => u.kycStatus === 'pending').length,
    verified: kyc.filter(u => u.kycStatus === 'verified').length,
    rejected: kyc.filter(u => u.kycStatus === 'rejected').length,
  };

  const filtered = kyc
    .filter(u => filter === 'all' || u.kycStatus === filter)
    .filter(u => !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
    );

  return (
    <AdminShell>
      <div className="p-6 space-y-5 max-w-7xl mx-auto">
        <AdminPageHeader
          title="KYC Requests"
          sub="Click any card to review full details and take action"
          action={
            <button onClick={fetchKyc} disabled={loading.kyc}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-violet-300 hover:text-violet-600 transition-all disabled:opacity-50">
              <RefreshCw size={14} className={loading.kyc ? 'animate-spin' : ''} /> Refresh
            </button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pending Review', val: counts.pending,  bg: '#fffbeb', border: '#fde68a', color: '#92400e' },
            { label: 'Verified',       val: counts.verified, bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
            { label: 'Rejected',       val: counts.rejected, bg: '#fef2f2', border: '#fecaca', color: '#b91c1c' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4 text-center border"
              style={{ background: s.bg, borderColor: s.border }}>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.val}</div>
              <div className="text-xs font-semibold text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email or phone..." />
          <FilterTabs value={filter} onChange={setFilter} options={[
            { val: 'pending',  label: 'Pending',  count: counts.pending },
            { val: 'verified', label: 'Verified', count: counts.verified },
            { val: 'rejected', label: 'Rejected', count: counts.rejected },
            { val: 'all',      label: 'All' },
          ]} />
        </div>

        {/* Cards */}
        {loading.kyc && kyc.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <RefreshCw size={24} className="animate-spin text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-400">Loading KYC requests from database...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-bold text-gray-700">No {filter === 'all' ? '' : filter} KYC requests</p>
            <p className="text-sm text-gray-400 mt-1">
              {kyc.length === 0
                ? 'Users need to upload their documents first'
                : 'Try a different filter or search term'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 font-semibold">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(u => (
                <KycCard key={u.id} user={u} onView={setSelectedUser} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Detail modal */}
      {selectedUser && (
        <KycDetailModal
          userId={selectedUser}
          onClose={() => setSelectedUser(null)}
          onApprove={approveKyc}
          onReject={rejectKyc}
        />
      )}
    </AdminShell>
  );
}
