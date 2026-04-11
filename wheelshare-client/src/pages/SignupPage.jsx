import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Eye, EyeOff, ArrowLeft, User, Phone, Mail, Lock, CheckCircle, AlertCircle, WifiOff } from 'lucide-react';
import RoleModal from '../components/RoleModal';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, backendOnline } = useAuth();

  const [form,      setForm]      = useState({ name: '', phone: '', email: '', password: '' });
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errors,    setErrors]    = useState({});
  const [apiError,  setApiError]  = useState('');

  const update = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    // Clear field error on change
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())                        errs.name     = 'Full name is required';
    if (!/^[6-9]\d{9}$/.test(form.phone))         errs.phone    = 'Enter a valid 10-digit Indian mobile number';
    if (!/\S+@\S+\.\S+/.test(form.email))         errs.email    = 'Enter a valid email address';
    if (form.password.length < 8)                 errs.password = 'Password must be at least 8 characters';
    return errs;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setApiError('');

    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    // Clear any stale local user cache before attempting signup
    localStorage.removeItem('ws_local_users');

    setLoading(true);
    const result = await signup({
      name:     form.name.trim(),
      phone:    form.phone.trim(),
      email:    form.email.trim().toLowerCase(),
      password: form.password,
    });
    setLoading(false);

    if (result.success) {
      setShowModal(true);
    } else {
      const msg = result.message || 'Signup failed.';
      if (msg.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: 'This email is already registered. Try logging in.' }));
      } else if (msg.toLowerCase().includes('phone')) {
        setErrors(prev => ({ ...prev, phone: 'This phone number is already registered.' }));
      } else {
        setApiError(msg);
      }
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6)                              return { label: 'Weak',   color: 'bg-red-400',   pct: 25 };
    if (p.length < 8)                              return { label: 'Fair',   color: 'bg-yellow-400', pct: 50 };
    if (/[A-Z]/.test(p) && /[0-9]/.test(p))       return { label: 'Strong', color: 'bg-green-500',  pct: 100 };
    return                                                { label: 'Good',   color: 'bg-blue-400',   pct: 75 };
  };
  const strength = passwordStrength();

  const inputCls = (field) =>
    `w-full pl-10 pr-4 py-3.5 rounded-2xl border bg-gray-50 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all ${errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-200'}`;

  const FIELDS = [
    { key: 'name',  label: 'Full Name',     placeholder: 'Your full name',       icon: <User  size={16} />, type: 'text',  autoComplete: 'name' },
    { key: 'phone', label: 'Phone Number',  placeholder: '10-digit mobile number',icon: <Phone size={16} />, type: 'tel',   autoComplete: 'tel' },
    { key: 'email', label: 'Email Address', placeholder: 'you@example.com',       icon: <Mail  size={16} />, type: 'email', autoComplete: 'email' },
  ];

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4 py-12">
      {showModal && <RoleModal onClose={() => setShowModal(false)} />}

      <div className="w-full max-w-md">
        <button onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-orange-500 mb-8 font-medium text-sm transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-orange-500">Wheel</span><span className="text-blue-600">Share</span>
            </span>
          </div>

          <h2 className="text-2xl font-black text-gray-900 text-center">Create your account 🚀</h2>
          <p className="text-gray-500 text-sm text-center mt-1 mb-7">Join 50,000+ Indians on WheelShare</p>

          {/* Offline banner */}
          {!backendOnline && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-4 py-3 rounded-xl mb-5">
              <WifiOff size={13} className="flex-shrink-0" />
              Server offline — account saved locally. Sync when server is available.
            </div>
          )}

          {/* API-level error */}
          {apiError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 font-medium mb-5">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              {apiError}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4" noValidate>
            {/* Name, Phone, Email */}
            {FIELDS.map(({ key, label, placeholder, icon, type, autoComplete }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={update(key)}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className={inputCls(key)}
                  />
                  {form[key] && !errors[key] && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                      <CheckCircle size={15} />
                    </div>
                  )}
                </div>
                {errors[key] && (
                  <p className="flex items-center gap-1 text-red-500 text-xs mt-1 font-medium">
                    <AlertCircle size={11} /> {errors[key]}
                  </p>
                )}
              </div>
            ))}

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={16} /></div>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className={`${inputCls('password')} pr-12`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength bar */}
              {strength && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                      style={{ width: `${strength.pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Strength: <span className="font-bold">{strength.label}</span>
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="flex items-center gap-1 text-red-500 text-xs mt-1 font-medium">
                  <AlertCircle size={11} /> {errors.password}
                </p>
              )}
            </div>

            {/* Terms */}
            <p className="text-xs text-gray-500 leading-relaxed">
              By signing up, you agree to our{' '}
              <a href="#" className="text-orange-500 font-semibold hover:underline">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="text-orange-500 font-semibold hover:underline">Privacy Policy</a>.
            </p>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-4 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating account...</>
                : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 font-bold hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
