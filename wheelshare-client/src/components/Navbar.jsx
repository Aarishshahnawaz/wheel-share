import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Zap, LayoutDashboard, Car } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';
import RoleModal from './RoleModal';

export default function Navbar() {
  const navigate  = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const { role, clearRole }          = useRole();

  const [menuOpen,   setMenuOpen]   = useState(false);
  const [showRole,   setShowRole]   = useState(false);
  // Hydration guard — prevents any auth-dependent UI from rendering
  // until we've confirmed the localStorage state on the client
  const [hydrated,   setHydrated]   = useState(false);

  useEffect(() => {
    // One tick is enough — localStorage is synchronous, so by the time
    // this effect runs the AuthContext has already loaded the user.
    setHydrated(true);
  }, []);

  const handleLogout = () => {
    clearRole();
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const firstName = user?.name?.split(' ')[0] || '';

  // While hydrating, render only the logo + nav links (no auth buttons)
  // This prevents the "Renter" badge from flashing on first paint.
  const renderAuthArea = () => {
    if (!hydrated) {
      return <div className="hidden md:flex items-center gap-3 w-48" />; // placeholder width
    }

    if (!isLoggedIn) {
      return (
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-semibold text-orange-500 border-2 border-orange-500 rounded-xl hover:bg-orange-50 transition-all"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary px-5 py-2 text-sm font-semibold text-white rounded-xl"
          >
            Get Started
          </button>
        </div>
      );
    }

    // Logged in
    const roleLabel = role === 'owner' ? '💰 Owner' : '🏍️ Renter';
    const roleColor = role === 'owner'
      ? 'bg-blue-100 text-blue-700 border-blue-200'
      : 'bg-orange-100 text-orange-700 border-orange-200';

    return (
      <div className="hidden md:flex items-center gap-3">
        {/* Role badge — only when role is set */}
        {role && (
          <button
            onClick={() => setShowRole(true)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all hover:shadow-sm ${roleColor}`}
          >
            {roleLabel}
          </button>
        )}

        {/* Dashboard shortcut */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-orange-500 transition-colors"
        >
          <LayoutDashboard size={15} />
          <span className="hidden lg:block">Dashboard</span>
        </button>

        {/* List vehicle */}
        <button
          onClick={() => navigate('/list')}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-orange-500 transition-colors"
        >
          <Car size={15} />
          <span className="hidden lg:block">List Vehicle</span>
        </button>

        {/* Avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 bg-gray-100 hover:bg-orange-50 border border-transparent hover:border-orange-200 rounded-xl px-3 py-2 transition-all"
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-400 to-blue-500 flex items-center justify-center text-xs text-white font-black overflow-hidden flex-shrink-0">
            {user?.profileImage
              ? <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
              : firstName[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm font-semibold text-gray-700 hidden lg:block max-w-[80px] truncate">
            {firstName}
          </span>
        </button>
      </div>
    );
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => navigate('/')}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center">
                <Zap size={16} className="text-white" fill="white" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-orange-500">Wheel</span>
                <span className="text-blue-600">Share</span>
              </span>
            </div>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-gray-600 hover:text-orange-500 font-medium text-sm transition-colors">How it works</a>
              <a href="#features"     className="text-gray-600 hover:text-orange-500 font-medium text-sm transition-colors">Features</a>
              <a href="#trust"        className="text-gray-600 hover:text-orange-500 font-medium text-sm transition-colors">Why WheelShare</a>
            </div>

            {/* Auth area — conditionally rendered after hydration */}
            {renderAuthArea()}

            {/* Mobile toggle */}
            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
            <a href="#how-it-works" className="text-gray-700 font-medium py-1" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#features"     className="text-gray-700 font-medium py-1" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#trust"        className="text-gray-700 font-medium py-1" onClick={() => setMenuOpen(false)}>Why WheelShare</a>

            <div className="border-t border-gray-100 pt-3 space-y-2">
              {hydrated && isLoggedIn ? (
                <>
                  <button onClick={() => { navigate('/dashboard'); setMenuOpen(false); }}
                    className="w-full py-3 text-sm font-bold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                    Dashboard
                  </button>
                  <button onClick={() => { navigate('/list'); setMenuOpen(false); }}
                    className="btn-primary w-full py-3 text-white font-semibold rounded-xl">
                    List Your Vehicle
                  </button>
                  <button onClick={handleLogout}
                    className="w-full py-3 text-sm font-bold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-all">
                    Logout
                  </button>
                </>
              ) : (
                <button onClick={() => { navigate('/login'); setMenuOpen(false); }}
                  className="btn-primary w-full py-3 text-white font-semibold rounded-xl">
                  Login / Get Started
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Role modal */}
      {showRole && <RoleModal onClose={() => setShowRole(false)} />}
    </>
  );
}
