import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY  = 'ws_user';
const USERS_KEY    = 'ws_local_users'; // offline user store
const DARK_KEY     = 'ws_dark';
const API_BASE     = 'http://localhost:5000/api';
const API_TIMEOUT  = 4000; // ms before we consider server offline

// ── Persistence helpers ───────────────────────────────────────────────────────
const load  = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; } catch { return null; } };
const save  = (u) => localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
const clear = ()  => localStorage.removeItem(STORAGE_KEY);

const loadUsers  = () => { try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; } };
const saveUsers  = (arr) => localStorage.setItem(USERS_KEY, JSON.stringify(arr));

export function calcProfileCompletion(user) {
  if (!user) return 0;
  const checks = [!!user.name, !!user.email, !!user.phone, !!user.profileImage, !!user.kyc?.license, !!user.kyc?.aadhaar];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

// ── Fetch with timeout ────────────────────────────────────────────────────────
async function fetchWithTimeout(url, options = {}, ms = API_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function apiPost(path, body) {
  const res = await fetchWithTimeout(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

async function apiPatch(path, body, token) {
  const res = await fetchWithTimeout(`${API_BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

const isNetworkError = (err) =>
  err.name === 'AbortError' ||
  err.message.includes('fetch') ||
  err.message.includes('Failed to fetch') ||
  err.message.includes('NetworkError') ||
  err.message.includes('network');

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user,          setUser]          = useState(load);
  const [darkMode,      setDarkModeState] = useState(() => localStorage.getItem(DARK_KEY) === 'true');
  const [backendOnline, setBackendOnline] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem(DARK_KEY, String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkModeState(d => !d), []);

  // ── REFRESH USER from server on mount ────────────────────────────────────
  useEffect(() => {
    const stored = load();
    if (!stored?.token || stored.token.startsWith('local_')) return;
    // Fetch fresh user data (picks up KYC status changes from admin)
    fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${stored.token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const u = normalise(data.data, stored.token);
          save(u);
          setUser(u);
        }
      })
      .catch(() => {}); // offline — keep localStorage data
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── SIGNUP ────────────────────────────────────────────────────────────────
  const signup = useCallback(async ({ name, email, phone, password }) => {
    // 1. Try real API
    try {
      const data = await apiPost('/auth/signup', { name, email, phone, password });
      const u = normalise(data.user, data.token);
      save(u); setUser(u); setBackendOnline(true);
      return { success: true, user: u };
    } catch (err) {
      if (!isNetworkError(err)) {
        // Server responded with an error (duplicate email etc.)
        setBackendOnline(true);
        return { success: false, message: err.message };
      }
    }

    // 2. Offline fallback — store in localStorage
    setBackendOnline(false);
    const users = loadUsers();

    if (users.find(u => u.email === email)) {
      return { success: false, message: 'This email is already registered.' };
    }
    if (phone && users.find(u => u.phone === phone)) {
      return { success: false, message: 'This phone number is already registered.' };
    }

    const u = makeLocalUser({ name, email, phone, password });
    saveUsers([...users, u]);
    const safe = { ...u }; delete safe._pw;
    save(safe); setUser(safe);
    return { success: true, user: safe, offline: true };
  }, []);

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  const login = useCallback(async ({ identifier, password }) => {
    // 1. Try real API
    try {
      const data = await apiPost('/auth/login', { identifier, password });
      const u = normalise(data.user, data.token);
      save(u); setUser(u); setBackendOnline(true);
      return { success: true, user: u };
    } catch (err) {
      if (!isNetworkError(err)) {
        setBackendOnline(true);
        return { success: false, message: err.message };
      }
    }

    // 2. Offline fallback — SECURITY FIX: Never store passwords client-side
    setBackendOnline(false);
    return { success: false, message: 'Server offline. Please try again when connected.' };
  }, []);

  // ── UPDATE PROFILE ────────────────────────────────────────────────────────
  const updateProfile = useCallback(async (patch) => {
    try {
      if (backendOnline && user?.token && !user?.token?.startsWith('local_')) {
        const data = await apiPatch('/users/profile', patch, user.token);
        const u = { ...user, ...data.data };
        save(u); setUser(u); return;
      }
    } catch { /* fall through */ }
    setUser(prev => { const u = { ...prev, ...patch }; save(u); return u; });
  }, [user, backendOnline]);

  // ── UPDATE KYC ────────────────────────────────────────────────────────────
  const updateKyc = useCallback(async (kycPatch) => {
    try {
      if (backendOnline && user?.token && !user?.token?.startsWith('local_')) {
        await apiPatch('/users/kyc', kycPatch, user.token);
      }
    } catch { /* ignore */ }
    setUser(prev => {
      const u = { ...prev, kyc: { ...prev.kyc, ...kycPatch }, kycStatus: 'pending' };
      save(u); return u;
    });
  }, [user, backendOnline]);

  const logout = useCallback(() => { clear(); setUser(null); }, []);

  return (
    <AuthContext.Provider value={{
      user, login, signup, logout, updateProfile, updateKyc,
      isLoggedIn:        !!user,
      isKycVerified:     user?.kycStatus === 'verified',
      profileCompletion: calcProfileCompletion(user),
      darkMode, toggleDarkMode,
      backendOnline,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// ── Helpers ───────────────────────────────────────────────────────────────────
function normalise(apiUser, token) {
  return {
    id:           apiUser._id || apiUser.id,
    name:         apiUser.name,
    email:        apiUser.email        || '',
    phone:        apiUser.phone        || '',
    profileImage: apiUser.profileImage || null,
    kycStatus:    apiUser.kyc?.status  || 'pending',
    kyc:          apiUser.kyc          || { license: null, aadhaar: null, pan: null },
    role:         apiUser.role         || 'user',
    token,
    joinedAt:     apiUser.createdAt    || new Date().toISOString(),
  };
}

function makeLocalUser({ name, email, phone, password }) {
  return {
    id:           `local_${Date.now()}`,
    name:         name.trim(),
    email:        email.trim().toLowerCase(),
    phone:        phone.trim(),
    profileImage: null,
    kycStatus:    'pending',
    kyc:          { license: null, aadhaar: null, pan: null },
    role:         'user',
    token:        `local_${Math.random().toString(36).slice(2)}`,
    joinedAt:     new Date().toISOString(),
    _pw:          password,   // plain — only used for offline login, never sent to server
  };
}
