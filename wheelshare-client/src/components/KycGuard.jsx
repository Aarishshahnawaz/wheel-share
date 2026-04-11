import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from './dashboard/DashboardLayout';

/**
 * Wraps a page that requires KYC verification.
 * If not verified, shows a block screen instead of the page.
 * action: 'rent' | 'list' — controls the message shown
 */
export default function KycGuard({ children, action = 'rent' }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.kycStatus === 'verified') return children;

  const isRejected = user?.kycStatus === 'rejected';

  const messages = {
    rent: {
      emoji: '🏍️',
      title: 'KYC Required to Rent',
      body:  'You need to complete KYC verification before you can rent a vehicle.',
    },
    list: {
      emoji: '🚗',
      title: 'KYC Required to List',
      body:  'You need to complete KYC verification before you can list your vehicle.',
    },
    book: {
      emoji: '📋',
      title: 'KYC Required to Book',
      body:  'You need to complete KYC verification before you can book a vehicle.',
    },
  };

  const msg = messages[action] || messages.rent;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5">
            {msg.emoji}
          </div>

          <h2 className="text-xl font-black text-gray-900 mb-2">{msg.title}</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">{msg.body}</p>

          {/* Status pill */}
          <div className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border mb-6 ${
            isRejected
              ? 'bg-red-50 text-red-600 border-red-200'
              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
          }`}>
            {isRejected ? '❌ KYC Rejected' : '⏳ KYC Pending'}
          </div>

          {isRejected && user?.kyc?.rejectionReason && (
            <p className="text-xs text-red-500 mb-5 bg-red-50 border border-red-100 rounded-2xl px-4 py-2">
              Rejection reason: <span className="font-semibold">{user.kyc.rejectionReason}</span>
            </p>
          )}

          <div className="space-y-3">
            <button
              onClick={() => navigate('/profile')}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-white font-bold rounded-2xl text-sm"
            >
              <Shield size={15} />
              {isRejected ? 'Re-submit KYC' : 'Complete KYC Verification'}
              <ArrowRight size={15} />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
