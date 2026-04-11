import { createContext, useContext, useState, useCallback } from 'react';
import { apiAdminGetKyc, apiAdminGetKycStats, apiAdminUpdateKyc } from '../services/api';

const AdminContext = createContext(null);

// Mock data used when backend is offline
const MOCK_USERS = [
  { _id: 'm1', name: 'Priya Sharma',  email: 'priya@example.com',  phone: '9876543210', kyc: { status: 'pending',  license: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', aadhaar: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400', pan: null }, createdAt: '2026-03-01' },
  { _id: 'm2', name: 'Arjun Mehta',   email: 'arjun@example.com',  phone: '9123456780', kyc: { status: 'pending',  license: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400', aadhaar: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', pan: null }, createdAt: '2026-03-05' },
  { _id: 'm3', name: 'Sneha Reddy',   email: 'sneha@example.com',  phone: '9988776655', kyc: { status: 'verified', license: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400', aadhaar: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400', pan: null }, createdAt: '2026-02-20' },
  { _id: 'm4', name: 'Vikram Tiwari', email: 'vikram@example.com', phone: '9001122334', kyc: { status: 'rejected', license: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400', aadhaar: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400', pan: null, rejectionReason: 'Blurry document image' }, createdAt: '2026-02-15' },
  { _id: 'm5', name: 'Ananya Bose',   email: 'ananya@example.com', phone: '9876001234', kyc: { status: 'pending',  license: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400', aadhaar: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400', pan: null }, createdAt: '2026-03-10' },
  { _id: 'm6', name: 'Rohit Kulkarni',email: 'rohit@example.com',  phone: '9765432100', kyc: { status: 'pending',  license: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400', aadhaar: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400', pan: null }, createdAt: '2026-03-12' },
];

export function AdminProvider({ children }) {
  const [users, setUsers] = useState(MOCK_USERS);
  const [stats, setStats] = useState({ pending: 4, verified: 1, rejected: 1, total: 6 });
  const [loading, setLoading] = useState(false);
  const [usingMock, setUsingMock] = useState(true);

  const fetchRequests = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await apiAdminGetKyc(params);
      setUsers(res.data);
      setUsingMock(false);
    } catch {
      let list = [...MOCK_USERS];
      if (params.status && params.status !== 'all') list = list.filter(u => u.kyc.status === params.status);
      if (params.search) list = list.filter(u => u.name.toLowerCase().includes(params.search.toLowerCase()) || u.email?.toLowerCase().includes(params.search.toLowerCase()));
      setUsers(list);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiAdminGetKycStats();
      setStats(res.data);
    } catch { /* keep mock stats */ }
  }, []);

  const updateKyc = useCallback(async (userId, status, rejectionReason = '') => {
    try {
      if (!usingMock) await apiAdminUpdateKyc(userId, { status, rejectionReason });
    } catch { /* ignore if offline */ }
    // Always update local state instantly
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, kyc: { ...u.kyc, status, rejectionReason } } : u));
    setStats(prev => {
      const oldUser = users.find(u => u._id === userId);
      const oldStatus = oldUser?.kyc?.status;
      const next = { ...prev };
      if (oldStatus && next[oldStatus] > 0) next[oldStatus]--;
      next[status] = (next[status] || 0) + 1;
      return next;
    });
    return { success: true, message: `KYC ${status === 'verified' ? 'approved' : 'rejected'} successfully` };
  }, [usingMock, users]);

  return (
    <AdminContext.Provider value={{ users, stats, loading, usingMock, fetchRequests, fetchStats, updateKyc }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
