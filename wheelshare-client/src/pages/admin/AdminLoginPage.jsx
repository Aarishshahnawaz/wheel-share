import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, Zap } from 'lucide-react';
import { apiAdminLogin } from '../../services/api';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiAdminLogin(form);
      localStorage.setItem('ws_admin', JSON.stringify({ ...res.user, token: res.token }));
      navigate('/admin/kyc');
    } catch (err) {
      // Demo mode — allow bypass with admin@wheelshare.com / admin123
      if (form.email === 'admin@wheelshare.com' && form.password === 'admin123') {
        localStorage.setItem('ws_admin', JSON.stringify({
          id: 'admin_demo', name: 'Admin', email: form.email, role: 'admin', token: 'demo_token',
        }));
        navigate('/admin/kyc');
      } else {
        setError(err.message || 'Invalid credentials. Try admin@wheelshare.com / admin123');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-blue-600 mb-4 shadow-2xl">
            <Zap size={28} className="text-white" fill="white" />
          </div>
          <h1 className="text-2xl font-black text-white">WheelShare Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Restricted access — authorized personnel only</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Shield size={18} className="text-orange-400" />
            <span className="text-white font-bold text-sm">Admin Login</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="admin@wheelshare.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Enter admin password"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-400" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg disabled:opacity-60 mt-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Signing in...</> : <><Shield size={15} /> Sign in as Admin</>}
            </button>
          </form>

          <div className="mt-5 bg-white/5 rounded-xl px-4 py-3 text-xs text-gray-400 text-center">
            Demo: <span className="text-orange-400 font-bold">admin@wheelshare.com</span> / <span className="text-orange-400 font-bold">admin123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
