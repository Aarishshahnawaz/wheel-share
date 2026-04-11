import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Eye, EyeOff, ArrowLeft, Phone, Mail, Lock, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import RoleModal from '../components/RoleModal';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, backendOnline } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [showModal,  setShowModal]  = useState(false);
  const [error,      setError]      = useState('');

  const isPhone = /^[0-9]/.test(identifier);

  // Field-level validation before hitting the API
  const validate = () => {
    if (!identifier.trim()) return 'Email or phone number is required.';
    if (!password)          return 'Password is required.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    const result = await login({ identifier: identifier.trim(), password });
    setLoading(false);

    if (result.success) {
      setShowModal(true);
    } else {
      // Map backend messages to user-friendly text
      const msg = result.message || 'Login failed.';
      if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credentials')) {
        setError('Incorrect email/phone or password. Please try again.');
      } else if (msg.toLowerCase().includes('not found')) {
        setError('No account found. Please sign up first.');
      } else {
        setError(msg);
      }
    }
  };

  const inputCls = (hasError) =>
    `w-full pl-10 pr-4 py-3.5 rounded-2xl border bg-gray-50 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`;

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4 py-12">
      {showModal && <RoleModal onClose={() => setShowModal(false)} />}

      <div className="w-full max-w-md">
        {/* Back */}
        <button onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-orange-500 mb-8 font-medium text-sm transition-colors group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-7 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-orange-500">Wheel</span><span className="text-blue-600">Share</span>
            </span>
          </div>

          <h2 className="text-2xl font-black text-gray-900 text-center">Welcome back 👋</h2>
          <p className="text-gray-500 text-sm text-center mt-1 mb-7">Login to rent or list your vehicle</p>

          {/* Offline banner */}
          {!backendOnline && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-4 py-3 rounded-xl mb-5">
              <WifiOff size={13} className="flex-shrink-0" />
              Server offline — using local accounts. Sign up first if you haven't already.
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            {/* Identifier */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email or Phone
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {isPhone ? <Phone size={16} /> : <Mail size={16} />}
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={e => { setIdentifier(e.target.value); setError(''); }}
                  placeholder="Enter email or 10-digit phone"
                  autoComplete="username"
                  className={inputCls(error && !identifier)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <a href="#" className="text-xs text-orange-500 font-semibold hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`${inputCls(error && !password)} pr-12`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 font-medium">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-4 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Logging in...</>
                : 'Login →'}
            </button>
          </form>

          {/* Divider + Google only */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-2xl py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">
            <span>🔵</span> Continue with Google
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-orange-500 font-bold hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
