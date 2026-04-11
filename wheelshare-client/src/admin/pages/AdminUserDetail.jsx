import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, RefreshCw, User, Mail, Phone, MapPin, Calendar,
  Car, BookOpen, TrendingUp, Shield, Trash2, Ban, CheckCircle,
  Clock, XCircle, AlertCircle,
} from 'lucide-react';
import AdminShell from '../components/AdminShell';
import { AdminBadge } from '../components/AdminUI';
import {
  apiAdminGetUserDetail, apiAdminToggleBan,
  apiAdminDeleteUser, apiAdminUpdateKyc,
} from '../../services/api';

/* ── helpers ─────────────────────────────────────────────────────────────── */
const fmt    = d  => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtRs  = n  => `₹${(n || 0).toLocaleString('en-IN')}`;

const STATUS_ICON = {
  completed: <CheckCircle size={13} className="text-green-500" />,
  cancelled:  <XCircle    size={13} className="text-red-400"   />,
  pending:    <Clock      size={13} className="text-orange-400"/>,
  accepted:   <CheckCircle size={13} className="text-blue-400" />,
  rejected:   <XCircle    size={13} className="text-red-400"   />,
};

/* ── small reusables ─────────────────────────────────────────────────────── */
function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl p-5 ${className}`}
      style={{ border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, mono }) {
  return (
    <div className="flex items-start gap-3 py-2.5" style={{ borderBottom: '1px solid #f8fafc' }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: '#fff7ed' }}>
        <Icon size={13} className="text-orange-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-gray-400 mb-0.5">{label}</div>
        <div className={`text-sm font-bold text-gray-900 break-all ${mono ? 'font-mono text-xs' : ''}`}>
          {value || '—'}
        </div>
      </div>
    </div>
  );
}

function TabBtn({ label, icon: Icon, active, onClick, badge }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150"
      style={{
        background: active ? 'linear-gradient(135deg,#fff7ed,#ffedd5)' : 'transparent',
        color:      active ? '#ea580c' : '#6b7280',
        border:     active ? '1px solid #fed7aa' : '1px solid transparent',
      }}>
      <Icon size={15} />
      {label}
      {badge > 0 && (
        <span className="ml-1 text-xs font-black px-1.5 py-0.5 rounded-full"
          style={{ background: active ? '#ea580c' : '#e5e7eb', color: active ? '#fff' : '#374151' }}>
          {badge}
        </span>
      )}
    </button>
  );
}

function EarningRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#f8fafc' }}>
      <span className="text-sm font-semibold text-gray-600">{label}</span>
      <span className="text-sm font-black" style={{ color: color || '#0f172a' }}>{value}</span>
    </div>
  );
}

function BookingList({ bookings, emptyMsg }) {
  if (!bookings.length) return (
    <div className="text-center py-8">
      <BookOpen size={28} className="text-gray-200 mx-auto mb-2" />
      <p className="text-sm font-semibold text-gray-400">{emptyMsg}</p>
    </div>
  );
  return (
    <div className="space-y-2">
      {bookings.map(b => {
        const vName = b.vehicleId
          ? `${b.vehicleId.brand || ''} ${b.vehicleId.model || ''}`.trim()
          : 'Vehicle';
        return (
          <div key={b._id}
            className="flex items-center gap-4 p-3 rounded-xl transition-colors duration-100"
            style={{ border: '1px solid #f1f5f9' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fafafa'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-900 truncate">{vName}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {b.startDate}{b.startTime ? ` · ${b.startTime}` : ''}
              </div>
            </div>
            <div className="text-sm font-black text-gray-900 flex-shrink-0">
              {b.total ? fmtRs(b.total) : '—'}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {STATUS_ICON[b.status] || <Clock size={13} className="text-gray-400" />}
              <span className="text-xs font-bold capitalize"
                style={{ color: b.status === 'completed' ? '#15803d' : b.status === 'cancelled' ? '#b91c1c' : '#92400e' }}>
                {b.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function AdminUserDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [tab,     setTab]     = useState('profile');
  const [toast,   setToast]   = useState(null);
  const [confirm, setConfirm] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiAdminGetUserDetail(id);
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to load user');
      }
    } catch (e) {
      setError(e.message || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleBan = async () => {
    try {
      const res = await apiAdminToggleBan(id);
      showToast(res.message);
      load();
    } catch (e) { showToast(e.message || 'Failed', 'error'); }
    setConfirm(null);
  };

  const handleDelete = async () => {
    try {
      await apiAdminDeleteUser(id);
      showToast('User deleted');
      navigate('/admin2/users');
    } catch (e) { showToast(e.message || 'Failed', 'error'); }
    setConfirm(null);
  };

  const handleKyc = async (status) => {
    try {
      await apiAdminUpdateKyc(id, { status });
      showToast(`KYC ${status}`);
      load();
    } catch (e) { showToast(e.message || 'Failed', 'error'); }
  };

  /* ── loading ── */
  if (loading) return (
    <AdminShell>
      <div className="flex items-center justify-center min-h-[60vh] gap-3 text-gray-400">
        <RefreshCw size={20} className="animate-spin" />
        <span className="text-sm font-semibold">Loading user...</span>
      </div>
    </AdminShell>
  );

  /* ── error ── */
  if (error || !data) return (
    <AdminShell>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
        <AlertCircle size={40} className="text-red-300" />
        <p className="text-gray-700 font-bold">{error || 'User not found'}</p>
        <p className="text-xs text-gray-400">User ID: {id}</p>
        <div className="flex gap-3">
          <button onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa' }}>
            <RefreshCw size={13} /> Retry
          </button>
          <button onClick={() => navigate('/admin2/users')}
            className="px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: '#f8fafc', color: '#374151', border: '1px solid #e2e8f0' }}>
            ← Back to Users
          </button>
        </div>
      </div>
    </AdminShell>
  );

  const { user, vehicles, renterBookings, ownerBookings, summary } = data;
  const isBanned = !user.isActive;

  return (
    <AdminShell>
      <div className="p-6 max-w-6xl mx-auto space-y-5">

        {/* ── Back ── */}
        <button onClick={() => navigate('/admin2/users')}
          className="flex items-center gap-1.5 text-sm font-bold transition-colors duration-150"
          style={{ color: '#6b7280' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ea580c'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; }}
        >
          <ArrowLeft size={15} /> Back to Users
        </button>

        {/* ── Hero card ── */}
        <Card>
          <div className="flex items-center gap-5 flex-wrap">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0 shadow-md"
              style={{ background: `hsl(${(user.name.charCodeAt(0) * 37) % 360},55%,50%)` }}>
              {user.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-black text-gray-900">{user.name}</h1>
                <AdminBadge status={isBanned ? 'banned' : 'active'} />
                <AdminBadge status={user.kyc?.status || 'pending'} />
                {user.role === 'admin' && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: '#f5f3ff', color: '#5b21b6', border: '1px solid #ddd6fe' }}>
                    Admin
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 mt-1">{user.email}</div>
            </div>
            {/* Summary pills */}
            <div className="flex gap-3 flex-wrap">
              {[
                { label: 'Vehicles', val: summary.vehicleCount,          color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
                { label: 'Bookings', val: summary.bookingCount,          color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
                { label: 'Earned',   val: fmtRs(summary.totalEarned),   color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
                { label: 'Spent',    val: fmtRs(summary.totalSpent),    color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
              ].map(p => (
                <div key={p.label} className="text-center px-4 py-2.5 rounded-2xl"
                  style={{ background: p.bg, border: `1px solid ${p.border}` }}>
                  <div className="text-base font-black" style={{ color: p.color }}>{p.val}</div>
                  <div className="text-xs font-semibold text-gray-500 mt-0.5">{p.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ── Tabs ── */}
        <div className="flex gap-1 flex-wrap p-1 rounded-2xl" style={{ background: '#f1f5f9' }}>
          <TabBtn label="Profile"  icon={User}      active={tab === 'profile'}  onClick={() => setTab('profile')} />
          <TabBtn label="Vehicles" icon={Car}        active={tab === 'vehicles'} onClick={() => setTab('vehicles')} badge={vehicles.length} />
          <TabBtn label="Bookings" icon={BookOpen}   active={tab === 'bookings'} onClick={() => setTab('bookings')} badge={renterBookings.length + ownerBookings.length} />
          <TabBtn label="Earnings" icon={TrendingUp} active={tab === 'earnings'} onClick={() => setTab('earnings')} />
          <TabBtn label="KYC"      icon={Shield}     active={tab === 'kyc'}      onClick={() => setTab('kyc')} />
        </div>

        {/* ══ PROFILE tab ══ */}
        {tab === 'profile' && (
          <div className="grid sm:grid-cols-2 gap-5">
            <Card>
              <h3 className="text-sm font-black text-gray-900 mb-3">Personal Info</h3>
              <InfoRow icon={User}     label="Full Name" value={user.name} />
              <InfoRow icon={Mail}     label="Email"     value={user.email} />
              <InfoRow icon={Phone}    label="Phone"     value={user.phone} />
              <InfoRow icon={MapPin}   label="City"      value={user.city} />
              <InfoRow icon={Calendar} label="Joined"    value={fmt(user.createdAt)} />
              <InfoRow icon={User}     label="User ID"   value={user._id} mono />
            </Card>

            <div className="space-y-4">
              {/* Status card */}
              <Card>
                <h3 className="text-sm font-black text-gray-900 mb-3">Account Status</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Account',    val: <AdminBadge status={isBanned ? 'banned' : 'active'} /> },
                    { label: 'KYC Status', val: <AdminBadge status={user.kyc?.status || 'pending'} /> },
                    { label: 'Role',       val: <span className="text-sm font-bold text-gray-900 capitalize">{user.role || 'user'}</span> },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: '#f8fafc' }}>
                      <span className="text-sm font-semibold text-gray-600">{r.label}</span>
                      {r.val}
                    </div>
                  ))}
                </div>
              </Card>

              {/* ── Admin actions — inside profile tab ── */}
              <Card>
                <h3 className="text-sm font-black text-gray-900 mb-3">Admin Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setConfirm({ action: 'ban', label: isBanned ? 'Unban this user?' : 'Ban this user?' })}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-150"
                    style={{
                      background: isBanned ? '#f0fdf4' : '#fef2f2',
                      color:      isBanned ? '#15803d' : '#b91c1c',
                      border:     isBanned ? '1px solid #bbf7d0' : '1px solid #fecaca',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                  >
                    <Ban size={15} />
                    {isBanned ? 'Unban User' : 'Ban User'}
                    <span className="ml-auto text-xs opacity-60">
                      {isBanned ? 'Restore access' : 'Block access'}
                    </span>
                  </button>

                  <button
                    onClick={() => setConfirm({ action: 'delete', label: 'Delete this user permanently?' })}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-150"
                    style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                  >
                    <Trash2 size={15} />
                    Delete Account
                    <span className="ml-auto text-xs opacity-60">Permanent</span>
                  </button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ══ VEHICLES tab ══ */}
        {tab === 'vehicles' && (
          <Card>
            <h3 className="text-sm font-black text-gray-900 mb-4">Listed Vehicles ({vehicles.length})</h3>
            {vehicles.length === 0 ? (
              <div className="text-center py-10">
                <Car size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-400">No vehicles listed</p>
              </div>
            ) : (
              <div className="space-y-3">
                {vehicles.map(v => (
                  <div key={v._id}
                    className="flex items-center gap-4 p-3.5 rounded-xl transition-colors duration-100"
                    style={{ border: '1px solid #f1f5f9' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fafafa'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {v.photos?.[0]?.url
                        ? <img src={v.photos[0].url} alt={v.brand} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">
                            {v.type === 'bike' ? '🏍️' : '🚗'}
                          </div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-sm">{v.brand} {v.model}</div>
                      <div className="text-xs text-gray-400 mt-0.5 capitalize">{v.type} · {v.city}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {v.hourlyPrice > 0 && <div className="text-xs font-bold text-orange-600">₹{v.hourlyPrice}/hr</div>}
                      {v.dailyPrice  > 0 && <div className="text-xs font-bold text-blue-600">₹{v.dailyPrice}/day</div>}
                    </div>
                    <AdminBadge status={v.isAvailable ? 'active' : 'inactive'} />
                    <AdminBadge status={v.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* ══ BOOKINGS tab ══ */}
        {tab === 'bookings' && (
          <div className="space-y-5">
            <Card>
              <h3 className="text-sm font-black text-gray-900 mb-4">
                Bookings as Renter ({renterBookings.length})
              </h3>
              <BookingList bookings={renterBookings} emptyMsg="No bookings as renter" />
            </Card>
            <Card>
              <h3 className="text-sm font-black text-gray-900 mb-4">
                Bookings Received as Owner ({ownerBookings.length})
              </h3>
              <BookingList bookings={ownerBookings} emptyMsg="No bookings received" />
            </Card>
          </div>
        )}

        {/* ══ EARNINGS tab ══ */}
        {tab === 'earnings' && (
          <div className="grid sm:grid-cols-2 gap-5">
            <Card>
              <h3 className="text-sm font-black text-gray-900 mb-4">Owner Earnings</h3>
              <div className="space-y-3">
                <EarningRow label="Total Earned"    value={fmtRs(summary.totalEarned)} color="#15803d" />
                <EarningRow label="Completed Trips" value={ownerBookings.filter(b => b.status === 'completed').length} />
                <EarningRow label="Vehicles Listed" value={summary.vehicleCount} />
              </div>
            </Card>
            <Card>
              <h3 className="text-sm font-black text-gray-900 mb-4">Renter Spending</h3>
              <div className="space-y-3">
                <EarningRow label="Total Spent"  value={fmtRs(summary.totalSpent)} color="#7c3aed" />
                <EarningRow label="Trips Taken"  value={renterBookings.filter(b => b.status === 'completed').length} />
                <EarningRow label="Cancelled"    value={renterBookings.filter(b => b.status === 'cancelled').length} />
              </div>
            </Card>
          </div>
        )}

        {/* ══ KYC tab ══ */}
        {tab === 'kyc' && (
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-black text-gray-900">KYC Documents</h3>
              <AdminBadge status={user.kyc?.status || 'pending'} />
            </div>

            {user.kyc?.status === 'pending' && (
              <div className="flex gap-3 mb-5">
                <button onClick={() => handleKyc('verified')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150"
                  style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', border: '1px solid #16a34a', boxShadow: '0 2px 8px rgba(22,163,74,0.25)' }}>
                  <CheckCircle size={14} /> Approve KYC
                </button>
                <button onClick={() => handleKyc('rejected')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150"
                  style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                  <XCircle size={14} /> Reject KYC
                </button>
              </div>
            )}

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: 'Driving License', url: user.kyc?.license },
                { label: 'Aadhaar Card',    url: user.kyc?.aadhaar },
                { label: 'PAN Card',        url: user.kyc?.pan },
              ].map(doc => (
                <div key={doc.label} className="rounded-2xl overflow-hidden"
                  style={{ border: '1px solid #e2e8f0' }}>
                  <div className="h-36 bg-gray-50 flex items-center justify-center overflow-hidden">
                    {doc.url
                      ? <img src={doc.url} alt={doc.label} className="w-full h-full object-cover cursor-pointer"
                          onClick={() => window.open(doc.url, '_blank')} />
                      : <div className="text-center">
                          <Shield size={28} className="text-gray-200 mx-auto mb-2" />
                          <p className="text-xs text-gray-400 font-medium">Not uploaded</p>
                        </div>
                    }
                  </div>
                  <div className="px-3 py-2.5 text-xs font-bold text-gray-700">{doc.label}</div>
                </div>
              ))}
            </div>

            {user.kyc?.rejectionReason && (
              <div className="mt-4 p-3 rounded-xl text-sm font-medium"
                style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                Rejection reason: {user.kyc.rejectionReason}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* ── Confirm dialog ── */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-base font-black text-gray-900 mb-2">{confirm.label}</div>
            <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button
                onClick={confirm.action === 'ban' ? handleBan : handleDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: 'linear-gradient(135deg,#f87171,#dc2626)' }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm text-white min-w-max"
          style={{ background: toast.type === 'error' ? '#dc2626' : '#16a34a' }}>
          {toast.msg}
        </div>
      )}
    </AdminShell>
  );
}
