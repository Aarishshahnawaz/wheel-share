import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Lock, Mail, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { apiAdminLogin } from '../../services/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form,     setForm]     = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }

    setLoading(true);
    try {
      // Call real backend — POST /api/auth/admin-login
      const res = await apiAdminLogin({ email: form.email, password: form.password });

      // Store real JWT token + user info
      localStorage.setItem('ws_admin', JSON.stringify({
        id:    res.user._id || res.user.id,
        name:  res.user.name,
        email: res.user.email,
        role:  res.user.role,
        token: res.token,          // ← real JWT
      }));

      navigate('/admin2');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all';

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #f0f0ff 0%, #f8fafc 50%, #eff6ff 100%)' }}>

      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #c7d2fe, transparent)' }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ddd6fe, transparent)' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            <Zap size={24} className="text-white" fill="white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Admin Console</h1>
          <p className="text-sm text-gray-500 mt-1">WheelShare Platform Management</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center gap-2 mb-6 pb-5 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Shield size={15} className="text-indigo-600" />
            </div>
            <div>
              <div className="text-sm font-black text-gray-900">Restricted Access</div>
              <div className="text-xs text-gray-400">Authorized personnel only</div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="admin@wheelshare.com"
                  autoComplete="email"
                  className={inputCls} />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  className={`${inputCls} pr-10`} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-4 py-3 rounded-xl">
                <AlertCircle size={13} className="flex-shrink-0" /> {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-md mt-1"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }}>
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in...</>
                : <><Shield size={14} /> Sign in to Admin Console</>}
            </button>
          </form>

          <div className="mt-5 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-gray-500">
              Credentials: <span className="font-bold text-indigo-600">admin@wheelshare.com</span> / <span className="font-bold text-indigo-600">admin123</span>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">WheelShare Admin Console · v1.0.0</p>
      </div>
    </div>
  );
}
