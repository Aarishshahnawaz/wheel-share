import { useState, useEffect } from 'react';
import {
  X, ZoomIn, CheckCircle, XCircle, Shield, User, Mail, Phone,
  Calendar, MapPin, Clock, AlertCircle, Loader
} from 'lucide-react';
import { apiAdminGetKycDetail } from '../../services/api';
import { AdminBadge } from './AdminUI';

// ── Full-screen image lightbox ────────────────────────────────────────────────
function Lightbox({ src, label, onClose }) {
  return (
    <div className="fixed inset-0 z-[400] bg-black/95 flex items-center justify-center p-4"
      onClick={onClose}>
      <button onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10">
        <X size={18} />
      </button>
      <div className="text-center" onClick={e => e.stopPropagation()}>
        <img src={src} alt={label}
          className="max-h-[80vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl" />
        <p className="text-white/60 text-sm mt-4">{label} · Click outside to close</p>
      </div>
    </div>
  );
}

// ── Document image with zoom ──────────────────────────────────────────────────
function DocImage({ src, label }) {
  const [lightbox, setLightbox] = useState(false);

  return (
    <>
      <div className="space-y-2">
        <div className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
          🪪 {label}
          {src
            ? <span className="text-emerald-600 font-bold">✓ Uploaded</span>
            : <span className="text-gray-400">Not uploaded</span>}
        </div>

        {src ? (
          <div className="relative group cursor-zoom-in rounded-2xl overflow-hidden border border-gray-200 bg-gray-50"
            style={{ height: '160px' }}
            onClick={() => setLightbox(true)}>
            <img src={src} alt={label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-xl px-3 py-2 flex items-center gap-2 text-xs font-bold text-gray-800">
                <ZoomIn size={14} /> Click to zoom
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 text-gray-400"
            style={{ height: '160px' }}>
            <div className="text-3xl">📄</div>
            <span className="text-xs font-semibold">Not uploaded yet</span>
          </div>
        )}
      </div>

      {lightbox && <Lightbox src={src} label={label} onClose={() => setLightbox(false)} />}
    </>
  );
}

// ── Info row ──────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-400 font-semibold">{label}</div>
        <div className="text-sm font-bold text-gray-900 mt-0.5 break-all">{value || '—'}</div>
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function KycDetailModal({ userId, onClose, onApprove, onReject }) {
  const [user,      setUser]      = useState(null);
  const [fetching,  setFetching]  = useState(true);
  const [error,     setError]     = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [reason,    setReason]    = useState('');
  const [acting,    setActing]    = useState(null); // 'approve' | 'reject'

  useEffect(() => {
    let cancelled = false;
    setFetching(true);
    apiAdminGetKycDetail(userId)
      .then(res => { if (!cancelled) setUser(res.data); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setFetching(false); });
    return () => { cancelled = true; };
  }, [userId]);

  const handleApprove = async () => {
    setActing('approve');
    await onApprove(userId);
    setActing(null);
    onClose();
  };

  const handleReject = async () => {
    setActing('reject');
    await onReject(userId, reason);
    setActing(null);
    onClose();
  };

  const kycStatus  = user?.kyc?.status || 'pending';
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col"
        style={{ animation: 'modalIn 0.25s ease' }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
              <Shield size={17} className="text-white" />
            </div>
            <div>
              <h2 className="font-black text-gray-900 text-base">KYC Verification</h2>
              <p className="text-xs text-gray-400">Review identity documents and take action</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">
          {fetching ? (
            <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
              <Loader size={20} className="animate-spin" />
              <span className="text-sm font-semibold">Loading user details...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <AlertCircle size={32} className="text-red-400" />
              <p className="text-red-500 font-semibold text-sm">{error}</p>
              <button onClick={onClose} className="text-xs text-gray-500 hover:underline">Close</button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

              {/* LEFT — User info */}
              <div className="p-6 space-y-5">
                {/* Avatar + status */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0 overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>
                    {user?.profileImage
                      ? <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                      : <span style={{ color: '#6d28d9' }}>{user?.name?.[0]?.toUpperCase()}</span>}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-lg leading-tight">{user?.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <AdminBadge status={kycStatus} />
                      {kycStatus === 'verified' && (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          <CheckCircle size={11} /> Verified User
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* User details */}
                <div className="bg-gray-50 rounded-2xl px-4 py-2">
                  <InfoRow icon={<User size={13} className="text-violet-500" />}    label="Full Name"    value={user?.name} />
                  <InfoRow icon={<Mail size={13} className="text-blue-500" />}      label="Email"        value={user?.email} />
                  <InfoRow icon={<Phone size={13} className="text-green-500" />}    label="Phone"        value={user?.phone} />
                  <InfoRow icon={<Calendar size={13} className="text-orange-500" />} label="Registered"  value={joinedDate} />
                  <InfoRow icon={<Shield size={13} className="text-indigo-500" />}  label="Account Role" value={user?.role === 'admin' ? '👑 Admin' : '👤 User'} />
                  <InfoRow icon={<Clock size={13} className="text-gray-400" />}     label="KYC Status"   value={kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)} />
                </div>

                {/* Rejection reason if rejected */}
                {kycStatus === 'rejected' && user?.kyc?.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                    <div className="text-xs font-black text-red-700 mb-1">Rejection Reason</div>
                    <div className="text-sm text-red-600">{user.kyc.rejectionReason}</div>
                  </div>
                )}

                {/* Review info */}
                {user?.kyc?.reviewedAt && (
                  <div className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Clock size={11} />
                    Reviewed on {new Date(user.kyc.reviewedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                )}
              </div>

              {/* RIGHT — Documents */}
              <div className="p-6 space-y-5">
                <h4 className="font-black text-gray-900 text-sm flex items-center gap-2">
                  <span>📋</span> Identity Documents
                </h4>

                <DocImage src={user?.kyc?.license} label="Driving License" />
                <DocImage src={user?.kyc?.aadhaar} label="Aadhaar Card" />

                {user?.kyc?.pan && (
                  <DocImage src={user.kyc.pan} label="PAN Card" />
                )}

                {!user?.kyc?.license && !user?.kyc?.aadhaar && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                    <div className="text-2xl mb-2">⚠️</div>
                    <p className="text-sm font-bold text-amber-800">No documents uploaded</p>
                    <p className="text-xs text-amber-600 mt-1">User hasn't submitted KYC documents yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer — Actions ── */}
        {!fetching && !error && kycStatus === 'pending' && (
          <div className="border-t border-gray-100 px-6 py-4 flex-shrink-0 bg-gray-50">
            {!rejecting ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 text-xs text-gray-500">
                  Review the documents above before taking action.
                </div>
                <button onClick={() => setRejecting(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-all">
                  <XCircle size={15} /> Reject
                </button>
                <button onClick={handleApprove} disabled={acting === 'approve'}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-all disabled:opacity-60 shadow-md shadow-emerald-200">
                  {acting === 'approve'
                    ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Approving...</>
                    : <><CheckCircle size={15} /> Approve KYC</>}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    Rejection reason <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
                    placeholder="e.g. Blurry image, document expired, name mismatch..."
                    className="w-full px-4 py-2.5 text-sm border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 resize-none bg-red-50 text-gray-800" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setRejecting(false); setReason(''); }}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all">
                    Cancel
                  </button>
                  <button onClick={handleReject} disabled={acting === 'reject'}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all disabled:opacity-60 shadow-md shadow-red-200">
                    {acting === 'reject'
                      ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Rejecting...</>
                      : <><XCircle size={15} /> Confirm Rejection</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Already actioned footer */}
        {!fetching && !error && kycStatus !== 'pending' && (
          <div className={`border-t px-6 py-4 flex-shrink-0 flex items-center justify-between
            ${kycStatus === 'verified' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <div className={`flex items-center gap-2 font-bold text-sm ${kycStatus === 'verified' ? 'text-emerald-700' : 'text-red-600'}`}>
              {kycStatus === 'verified' ? <><CheckCircle size={16} /> KYC Approved — User is verified</> : <><XCircle size={16} /> KYC Rejected</>}
            </div>
            <button onClick={onClose}
              className="px-5 py-2 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
