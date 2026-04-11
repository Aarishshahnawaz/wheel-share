import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  apiAdminGetStats, apiAdminGetUsers, apiAdminToggleBan,
  apiAdminGetKyc, apiAdminUpdateKyc, apiAdminGetVehicles,
} from '../../services/api';
import { MONTHLY_EARNINGS } from '../data/mockData';

const AdminStore = createContext(null);

const EMPTY_STATS = {
  totalUsers: 0, activeUsers: 0, bannedUsers: 0,
  totalVehicles: 0, totalBookings: 0, platformEarnings: 0,
  kyc: { pending: 0, verified: 0, rejected: 0 },
  monthlyGrowth: { users: 0, vehicles: 0, bookings: 0, earnings: 0 },
};

export function AdminStoreProvider({ children }) {
  const [stats,    setStats]    = useState(EMPTY_STATS);
  const [users,    setUsers]    = useState([]);
  const [kyc,      setKyc]      = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [monthly]               = useState(MONTHLY_EARNINGS);
  const [loading,  setLoading]  = useState({ stats: false, users: false, kyc: false, vehicles: false });
  const [toast,    setToast]    = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Fetch stats ──────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setLoading(p => ({ ...p, stats: true }));
    try {
      const res = await apiAdminGetStats();
      if (res.success) setStats(res.data);
    } catch { /* server offline — keep empty stats */ }
    finally { setLoading(p => ({ ...p, stats: false })); }
  }, []);

  // ── Fetch users ──────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(p => ({ ...p, users: true }));
    try {
      const res = await apiAdminGetUsers(params);
      if (res.success) {
        setUsers(res.data.map(u => ({
          id:        u._id,
          name:      u.name      || 'Unknown',
          email:     u.email     || '',
          phone:     u.phone     || '',
          city:      u.city      || '—',
          role:      u.role      || 'user',
          status:    u.isActive  ? 'active' : 'banned',
          kycStatus: u.kyc?.status || 'pending',
          joinedAt:  u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '—',
          bookings:  0,
          vehicles:  0,
        })));
      }
    } catch { setUsers([]); }
    finally { setLoading(p => ({ ...p, users: false })); }
  }, []);

  // ── Fetch KYC ────────────────────────────────────────────────────────────────
  const fetchKyc = useCallback(async () => {
    setLoading(p => ({ ...p, kyc: true }));
    try {
      const [pendingRes, verifiedRes, rejectedRes] = await Promise.all([
        apiAdminGetKyc({ status: 'pending',  limit: 100 }),
        apiAdminGetKyc({ status: 'verified', limit: 100 }),
        apiAdminGetKyc({ status: 'rejected', limit: 100 }),
      ]);
      const all = [
        ...(pendingRes.data  || []),
        ...(verifiedRes.data || []),
        ...(rejectedRes.data || []),
      ].map(u => ({
        id:              u._id,
        name:            u.name            || 'Unknown',
        email:           u.email           || '',
        phone:           u.phone           || '',
        kycStatus:       u.kyc?.status     || 'pending',
        license:         u.kyc?.license    || null,
        aadhaar:         u.kyc?.aadhaar    || null,
        pan:             u.kyc?.pan        || null,
        rejectionReason: u.kyc?.rejectionReason || '',
        submittedAt:     u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '—',
        profileImage:    u.profileImage    || null,
      }));
      setKyc(all);
    } catch { setKyc([]); }
    finally { setLoading(p => ({ ...p, kyc: false })); }
  }, []);

  // ── Fetch vehicles ───────────────────────────────────────────────────────────
  const fetchVehicles = useCallback(async () => {
    setLoading(p => ({ ...p, vehicles: true }));
    try {
      const res = await apiAdminGetVehicles();
      setVehicles(res.data || []);
    } catch { setVehicles([]); }
    finally { setLoading(p => ({ ...p, vehicles: false })); }
  }, []);

  // Load on mount — always try, API calls will fail gracefully if no token
  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchKyc();
    fetchVehicles();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── KYC actions ──────────────────────────────────────────────────────────────
  const approveKyc = useCallback(async (id) => {
    try {
      await apiAdminUpdateKyc(id, { status: 'verified' });
      setKyc(prev => prev.map(u => u.id === id ? { ...u, kycStatus: 'verified' } : u));
      setUsers(prev => prev.map(u => u.id === id ? { ...u, kycStatus: 'verified' } : u));
      setStats(prev => ({
        ...prev,
        kyc: { ...prev.kyc, pending: Math.max(0, prev.kyc.pending - 1), verified: prev.kyc.verified + 1 },
      }));
      showToast('KYC approved successfully ✅');
    } catch (err) {
      showToast(err.message || 'Failed to approve KYC', 'error');
    }
  }, [showToast]);

  const rejectKyc = useCallback(async (id, reason = '') => {
    try {
      await apiAdminUpdateKyc(id, { status: 'rejected', rejectionReason: reason });
      setKyc(prev => prev.map(u => u.id === id ? { ...u, kycStatus: 'rejected', rejectionReason: reason } : u));
      setUsers(prev => prev.map(u => u.id === id ? { ...u, kycStatus: 'rejected' } : u));
      setStats(prev => ({
        ...prev,
        kyc: { ...prev.kyc, pending: Math.max(0, prev.kyc.pending - 1), rejected: prev.kyc.rejected + 1 },
      }));
      showToast('KYC rejected', 'error');
    } catch (err) {
      showToast(err.message || 'Failed to reject KYC', 'error');
    }
  }, [showToast]);

  // ── User actions ─────────────────────────────────────────────────────────────
  const banUser = useCallback(async (id) => {
    try {
      const res = await apiAdminToggleBan(id);
      const newStatus = res.data.isActive ? 'active' : 'banned';
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
      showToast(res.message, newStatus === 'active' ? 'success' : 'error');
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  }, [showToast]);

  // ── Vehicle actions ──────────────────────────────────────────────────────────
  const approveVehicle = useCallback((id) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, status: 'approved' } : v));
    showToast('Vehicle approved ✅');
  }, [showToast]);

  const removeVehicle = useCallback((id) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, status: 'removed' } : v));
    showToast('Vehicle removed', 'error');
  }, [showToast]);

  return (
    <AdminStore.Provider value={{
      stats, monthly, users, vehicles, kyc, loading,
      fetchStats, fetchUsers, fetchKyc, fetchVehicles,
      approveKyc, rejectKyc, banUser, approveVehicle, removeVehicle,
      showToast,
    }}>
      {children}
      {toast && <AdminToast toast={toast} onClose={() => setToast(null)} />}
    </AdminStore.Provider>
  );
}

function AdminToast({ toast, onClose }) {
  const bg = { success: 'bg-emerald-500', error: 'bg-red-500', info: 'bg-violet-500' };
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] ${bg[toast.type] || bg.info} text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm min-w-max`}>
      <span>{toast.message}</span>
      <button onClick={onClose} className="text-white/60 hover:text-white text-lg leading-none ml-2">×</button>
    </div>
  );
}

export const useAdminStore = () => useContext(AdminStore);
