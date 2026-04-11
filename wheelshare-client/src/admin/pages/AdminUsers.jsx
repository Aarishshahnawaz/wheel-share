import { useState, useEffect } from 'react';
import { RefreshCw, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminShell from '../components/AdminShell';
import { AdminPageHeader, AdminBadge, AdminTable, FilterTabs, SearchInput, ActionBtn } from '../components/AdminUI';
import { useAdminStore } from '../context/AdminStore';

export default function AdminUsers() {
  const navigate = useNavigate();
  const { users, banUser, loading, fetchUsers } = useAdminStore();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchUsers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(() => fetchUsers({ search, status: filter === 'all' ? '' : filter }), 400);
    return () => clearTimeout(t);
  }, [search, filter, fetchUsers]);

  const counts = {
    active: users.filter(u => u.status === 'active').length,
    banned: users.filter(u => u.status === 'banned').length,
  };

  const filtered = users
    .filter(u => filter === 'all' || u.status === filter)
    .filter(u => !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
    );

  return (
    <AdminShell>
      <div className="p-6 space-y-5 max-w-7xl mx-auto">
        <AdminPageHeader
          title="User Management"
          sub={`${users.length} total users`}
          action={
            <button onClick={() => fetchUsers()} disabled={loading.users}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 disabled:opacity-50"
              style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#374151' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#fed7aa'; e.currentTarget.style.color = '#ea580c'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#374151'; }}
            >
              <RefreshCw size={14} className={loading.users ? 'animate-spin' : ''} /> Refresh
            </button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total',  val: users.length,  grad: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', border: '#ddd6fe', color: '#5b21b6' },
            { label: 'Active', val: counts.active, grad: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '#bbf7d0', color: '#15803d' },
            { label: 'Banned', val: counts.banned, grad: 'linear-gradient(135deg,#fef2f2,#fee2e2)', border: '#fecaca', color: '#b91c1c' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4 text-center"
              style={{ background: s.grad, border: `1px solid ${s.border}` }}>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.val}</div>
              <div className="text-xs font-semibold mt-0.5" style={{ color: '#6b7280' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email or phone..." />
          <FilterTabs value={filter} onChange={setFilter} options={[
            { val: 'all',    label: 'All',    count: users.length },
            { val: 'active', label: 'Active', count: counts.active },
            { val: 'banned', label: 'Banned', count: counts.banned },
          ]} />
        </div>

        {loading.users && users.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <RefreshCw size={20} className="animate-spin text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-400">Loading users...</p>
          </div>
        ) : (
          <AdminTable
            headers={['User', 'Contact', 'KYC', 'Status', 'Joined', 'Actions']}
            empty={filtered.length === 0 ? 'No users found' : undefined}
          >
            {filtered.map(u => (
              <tr key={u.id}
                className="transition-colors duration-100 cursor-pointer"
                style={{ borderBottom: '1px solid #f8fafc' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fafafa'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                onClick={() => navigate(`/admin2/users/${u.id}`)}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 text-white"
                      style={{ background: `hsl(${(u.name.charCodeAt(0) * 37) % 360},55%,50%)` }}>
                      {u.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{u.name}</div>
                      <div className="text-xs text-gray-400 font-mono">{u.id?.slice(-8)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="text-xs font-medium text-gray-700">{u.email || '—'}</div>
                  <div className="text-xs text-gray-400">{u.phone || '—'}</div>
                </td>
                <td className="px-5 py-3.5"><AdminBadge status={u.kycStatus} /></td>
                <td className="px-5 py-3.5"><AdminBadge status={u.status} /></td>
                <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">{u.joinedAt}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <ActionBtn
                      label={u.status === 'banned' ? 'Unban' : 'Ban'}
                      variant={u.status === 'banned' ? 'ghost' : 'danger'}
                      onClick={() => banUser(u.id)}
                    />
                    <button onClick={() => navigate(`/admin2/users/${u.id}`)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
                      style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fff7ed'; e.currentTarget.style.borderColor = '#fed7aa'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                    >
                      <ChevronRight size={13} className="text-gray-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        )}
      </div>
    </AdminShell>
  );
}
