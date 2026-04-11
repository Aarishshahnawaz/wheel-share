import { useState } from 'react';
import { CheckCircle, XCircle, Clock, User, Mail, Phone, Calendar } from 'lucide-react';
import { ZoomableImage } from './ImageZoom';

const STATUS = {
  pending:  { label: 'Pending',  cls: 'bg-yellow-100 text-yellow-700 border-yellow-300', dot: 'bg-yellow-400', icon: <Clock size={12} /> },
  verified: { label: 'Verified', cls: 'bg-green-100 text-green-700 border-green-300',   dot: 'bg-green-500',  icon: <CheckCircle size={12} /> },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-600 border-red-300',         dot: 'bg-red-500',    icon: <XCircle size={12} /> },
};

export default function KycCard({ user, onApprove, onReject }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(null); // 'approve' | 'reject'

  const st = STATUS[user.kyc?.status] || STATUS.pending;

  const handleApprove = async () => {
    setLoading('approve');
    await onApprove(user._id);
    setLoading(null);
  };

  const handleReject = async () => {
    setLoading('reject');
    await onReject(user._id, reason);
    setLoading(null);
    setRejecting(false);
    setReason('');
  };

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between p-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-100 to-blue-100 flex items-center justify-center text-xl font-black text-orange-500 flex-shrink-0">
            {user.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div className="font-black text-gray-900">{user.name}</div>
            <div className="flex flex-wrap gap-2 mt-0.5">
              {user.email && <span className="flex items-center gap-1 text-xs text-gray-500"><Mail size={10} />{user.email}</span>}
              {user.phone && <span className="flex items-center gap-1 text-xs text-gray-500"><Phone size={10} />{user.phone}</span>}
            </div>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${st.cls}`}>
          {st.icon} {st.label}
        </div>
      </div>

      {/* Documents */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1">
              🪪 Driving License
              {user.kyc?.license && <span className="text-green-500 font-bold">✓</span>}
            </div>
            <ZoomableImage src={user.kyc?.license} alt="Driving License" className="h-28 w-full" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1">
              🪪 Aadhaar Card
              {user.kyc?.aadhaar && <span className="text-green-500 font-bold">✓</span>}
            </div>
            <ZoomableImage src={user.kyc?.aadhaar} alt="Aadhaar Card" className="h-28 w-full" />
          </div>
        </div>

        {user.kyc?.pan && (
          <div>
            <div className="text-xs font-bold text-gray-500 mb-1.5">🪪 PAN Card</div>
            <ZoomableImage src={user.kyc.pan} alt="PAN Card" className="h-20 w-full" />
          </div>
        )}

        {/* Rejection reason */}
        {user.kyc?.status === 'rejected' && user.kyc?.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-600 font-semibold">
            Rejection reason: {user.kyc.rejectionReason}
          </div>
        )}

        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Calendar size={11} /> Registered {joinedDate}
        </div>
      </div>

      {/* Actions */}
      {user.kyc?.status === 'pending' && (
        <div className="px-5 pb-5 space-y-3">
          {!rejecting ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleApprove}
                disabled={loading === 'approve'}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-all disabled:opacity-60 shadow-md shadow-green-200"
              >
                {loading === 'approve'
                  ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <><CheckCircle size={15} /> Approve</>}
              </button>
              <button
                onClick={() => setRejecting(true)}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm border border-red-200 transition-all"
              >
                <XCircle size={15} /> Reject
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Reason for rejection (optional)..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 resize-none bg-red-50"
              />
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { setRejecting(false); setReason(''); }}
                  className="py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                  Cancel
                </button>
                <button onClick={handleReject} disabled={loading === 'reject'}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all disabled:opacity-60">
                  {loading === 'reject'
                    ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <><XCircle size={14} /> Confirm Reject</>}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Already actioned */}
      {user.kyc?.status !== 'pending' && (
        <div className={`mx-5 mb-5 px-4 py-2.5 rounded-2xl text-xs font-bold text-center ${user.kyc?.status === 'verified' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {user.kyc?.status === 'verified' ? '✅ KYC Approved' : '❌ KYC Rejected'}
        </div>
      )}
    </div>
  );
}
