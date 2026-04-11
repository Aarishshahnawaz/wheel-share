import { useState, useRef } from 'react';
import { Camera, Shield, CheckCircle, Clock, XCircle, Upload, Eye, EyeOff, Save, AlertCircle } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useVehicleStore } from '../context/VehicleStoreContext';

const KYC_STATUS = {
  pending:  { label: 'Pending ⏳',   color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: <Clock size={13} /> },
  verified: { label: 'KYC Verified ✅', color: 'bg-green-100 text-green-700 border-green-300',  icon: <CheckCircle size={13} /> },
  rejected: { label: 'Rejected ❌',  color: 'bg-red-100 text-red-600 border-red-300',          icon: <XCircle size={13} /> },
};

function DocUpload({ label, hint, value, onChange }) {
  const ref = useRef();
  const [preview, setPreview] = useState(value || null);

  const handle = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setPreview(ev.target.result); onChange(ev.target.result); };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="text-sm font-bold text-gray-700 block mb-2">{label}</label>
      <div
        onClick={() => ref.current.click()}
        className={`relative border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-all
          ${preview ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'}`}
      >
        {preview ? (
          <div className="relative h-32">
            <img src={preview} alt={label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full">Change</span>
            </div>
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle size={10} /> Uploaded
            </div>
          </div>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Upload size={24} />
            <span className="text-xs font-semibold">{hint}</span>
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*,.pdf" className="hidden" onChange={handle} />
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateProfile, updateKyc } = useAuth();
  const { showToast } = useVehicleStore();
  const avatarRef = useRef();

  const [profileForm, setProfileForm] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState('');

  const [kyc, setKyc] = useState({
    license: user?.kyc?.license || null,
    aadhaar: user?.kyc?.aadhaar || null,
    pan:     user?.kyc?.pan     || null,
  });
  const [savingKyc, setSavingKyc] = useState(false);

  const kycStatus = KYC_STATUS[user?.kycStatus || 'pending'];

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => updateProfile({ profileImage: ev.target.result });
    reader.readAsDataURL(file);
  };

  const saveProfile = () => {
    if (!profileForm.name.trim()) return;
    setSavingProfile(true);
    setTimeout(() => {
      updateProfile(profileForm);
      setSavingProfile(false);
      showToast('Profile updated successfully ✅');
    }, 800);
  };

  const savePassword = () => {
    setPwError('');
    if (!passwords.current) { setPwError('Enter current password'); return; }
    if (passwords.newPass.length < 8) { setPwError('New password must be 8+ characters'); return; }
    if (passwords.newPass !== passwords.confirm) { setPwError('Passwords do not match'); return; }
    setSavingPw(true);
    setTimeout(() => {
      setSavingPw(false);
      setPasswords({ current: '', newPass: '', confirm: '' });
      showToast('Password changed successfully ✅');
    }, 900);
  };

  const saveKyc = () => {
    if (!kyc.license || !kyc.aadhaar) {
      showToast('Please upload both Driving License and Aadhaar', 'error');
      return;
    }
    setSavingKyc(true);
    setTimeout(() => {
      updateKyc(kyc);
      setSavingKyc(false);
      showToast('KYC documents submitted for review ✅');
    }, 1000);
  };

  const inputCls = 'w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all';

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-5 sticky top-0 z-30">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-xl font-black text-gray-900">My Profile</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage your account, KYC & security</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">

          {/* ── Avatar + name card ── */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-orange-400 via-pink-400 to-blue-500" />
            <div className="px-6 pb-6">
              <div className="flex items-end justify-between -mt-10 mb-4">
                <div className="relative">
                  <div
                    onClick={() => avatarRef.current.click()}
                    className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg bg-gradient-to-br from-orange-100 to-blue-100 flex items-center justify-center overflow-hidden cursor-pointer"
                  >
                    {user?.profileImage
                      ? <img src={user.profileImage} alt="avatar" className="w-full h-full object-cover" />
                      : <span className="text-3xl font-black text-orange-400">{user?.name?.[0]?.toUpperCase() || '?'}</span>
                    }
                  </div>
                  <button
                    onClick={() => avatarRef.current.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center shadow-md hover:bg-orange-600 transition-colors"
                  >
                    <Camera size={13} className="text-white" />
                  </button>
                  <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>

                {/* KYC badge */}
                <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${kycStatus.color}`}>
                  {kycStatus.icon} {kycStatus.label}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-black text-gray-900">{user?.name}</h2>
                <p className="text-sm text-gray-500">{user?.email || user?.phone}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Member since {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* ── Edit Profile ── */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-black text-gray-900 mb-5">Edit Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">Full Name <span className="text-red-400">*</span></label>
                <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name" className={inputCls} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">Email</label>
                  <input value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="email@example.com" type="email" className={inputCls} />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">Phone</label>
                  <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="10-digit mobile" type="tel" className={inputCls} />
                </div>
              </div>
              <button onClick={saveProfile} disabled={savingProfile}
                className="btn-primary flex items-center gap-2 px-6 py-3 text-white font-bold rounded-2xl text-sm disabled:opacity-70">
                {savingProfile ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</> : <><Save size={14} /> Save Profile</>}
              </button>
            </div>
          </div>

          {/* ── KYC Verification ── */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-black text-gray-900">KYC Verification</h3>
              <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${kycStatus.color}`}>
                {kycStatus.icon} {kycStatus.label}
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-5">Required to rent or list vehicles on WheelShare</p>

            {user?.kycStatus === 'verified' ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl">✅</div>
                <div>
                  <div className="font-black text-green-800">KYC Verified</div>
                  <div className="text-sm text-green-600 mt-0.5">Your identity has been verified. You can rent and list vehicles.</div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {user?.kycStatus === 'pending' && (user?.kyc?.license || user?.kyc?.aadhaar) && (
                  <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3">
                    <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-700 font-semibold">Documents submitted — under review (24–48 hrs)</p>
                  </div>
                )}

                {/* ── Rejection notice ── */}
                {user?.kycStatus === 'rejected' && (
                  <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-4">
                    <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-black text-red-700">❌ Your KYC was rejected</p>
                      {user?.kyc?.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1">
                          Reason: <span className="font-semibold">{user.kyc.rejectionReason}</span>
                        </p>
                      )}
                      <p className="text-xs text-red-500 mt-1">Please re-upload your documents and resubmit.</p>
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <DocUpload
                    label="Driving License *"
                    hint="Upload front side (JPG/PNG/PDF)"
                    value={kyc.license}
                    onChange={v => setKyc(k => ({ ...k, license: v }))}
                  />
                  <DocUpload
                    label="Aadhaar Card *"
                    hint="Upload front side (JPG/PNG/PDF)"
                    value={kyc.aadhaar}
                    onChange={v => setKyc(k => ({ ...k, aadhaar: v }))}
                  />
                </div>
                <DocUpload
                  label="PAN Card (optional)"
                  hint="Upload PAN card for faster verification"
                  value={kyc.pan}
                  onChange={v => setKyc(k => ({ ...k, pan: v }))}
                />

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-700 space-y-1">
                  <p className="font-bold">🔒 Your documents are secure</p>
                  <p>Encrypted and stored securely. Only used for identity verification. Never shared with third parties.</p>
                </div>

                <button onClick={saveKyc} disabled={savingKyc}
                  className="btn-primary flex items-center gap-2 px-6 py-3 text-white font-bold rounded-2xl text-sm disabled:opacity-70">
                  {savingKyc
                    ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Submitting...</>
                    : user?.kycStatus === 'rejected'
                      ? <><Shield size={14} /> Re-submit KYC</>
                      : <><Shield size={14} /> Submit for Verification</>}
                </button>
              </div>
            )}
          </div>

          {/* ── Change Password ── */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-black text-gray-900 mb-5">Change Password</h3>
            <div className="space-y-4">
              {[
                { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
                { key: 'newPass', label: 'New Password',     placeholder: 'Min. 8 characters' },
                { key: 'confirm', label: 'Confirm Password', placeholder: 'Repeat new password' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">{f.label}</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={passwords[f.key]}
                      onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className={inputCls}
                    />
                    {f.key === 'current' && (
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {pwError && (
                <div className="flex items-center gap-2 text-red-500 text-sm font-semibold">
                  <AlertCircle size={14} /> {pwError}
                </div>
              )}
              <button onClick={savePassword} disabled={savingPw}
                className="btn-secondary flex items-center gap-2 px-6 py-3 text-white font-bold rounded-2xl text-sm disabled:opacity-70">
                {savingPw ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Updating...</> : <><Save size={14} /> Update Password</>}
              </button>
            </div>
          </div>

          {/* ── Danger zone ── */}
          <div className="bg-white rounded-3xl border border-red-100 shadow-sm p-6">
            <h3 className="font-black text-red-600 mb-2">Danger Zone</h3>
            <p className="text-sm text-gray-500 mb-4">These actions are irreversible. Proceed with caution.</p>
            <button className="flex items-center gap-2 px-5 py-2.5 border-2 border-red-200 text-red-500 font-bold rounded-2xl text-sm hover:bg-red-50 transition-all">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
