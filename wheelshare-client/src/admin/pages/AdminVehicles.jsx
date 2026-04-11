import { useState } from 'react';
import AdminShell from '../components/AdminShell';
import { AdminPageHeader, AdminBadge, FilterTabs, SearchInput, ActionBtn, SectionCard } from '../components/AdminUI';
import { useAdminStore } from '../context/AdminStore';

export default function AdminVehicles() {
  const { vehicles, approveVehicle, removeVehicle } = useAdminStore();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const counts = {
    pending:  vehicles.filter(v => v.status === 'pending').length,
    approved: vehicles.filter(v => v.status === 'approved').length,
    removed:  vehicles.filter(v => v.status === 'removed').length,
  };

  const filtered = vehicles
    .filter(v => filter === 'all' || v.status === filter)
    .filter(v => typeFilter === 'all' || v.type === typeFilter)
    .filter(v => !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.owner.toLowerCase().includes(search.toLowerCase()) || v.city.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminShell>
      <div className="p-6 space-y-5 max-w-7xl mx-auto">
        <AdminPageHeader title="Vehicle Management" sub={`${vehicles.length} total listings`} />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pending Approval', val: counts.pending,  cls: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
            { label: 'Approved',         val: counts.approved, cls: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
            { label: 'Removed',          val: counts.removed,  cls: 'bg-gray-50 border-gray-200 text-gray-600' },
          ].map(s => (
            <div key={s.label} className={`${s.cls} border rounded-2xl p-4 text-center`}>
              <div className="text-2xl font-black">{s.val}</div>
              <div className="text-xs font-semibold text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name, owner or city..." />
          <FilterTabs value={filter} onChange={setFilter} options={[
            { val: 'all',      label: 'All',      count: vehicles.length },
            { val: 'pending',  label: 'Pending',  count: counts.pending },
            { val: 'approved', label: 'Approved', count: counts.approved },
            { val: 'removed',  label: 'Removed',  count: counts.removed },
          ]} />
          <FilterTabs value={typeFilter} onChange={setTypeFilter} options={[
            { val: 'all',  label: '🚦 All' },
            { val: 'bike', label: '🏍️ Bikes' },
            { val: 'car',  label: '🚗 Cars' },
          ]} />
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <div className="text-4xl mb-3">🚗</div>
            <p className="text-gray-500 font-semibold">No vehicles found</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(v => (
              <div key={v.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
                <div className="relative h-36 overflow-hidden bg-gray-100">
                  <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2">
                    <AdminBadge status={v.status} />
                  </div>
                  <div className="absolute top-2 right-2 bg-gray-900/70 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {v.type === 'bike' ? '🏍️' : '🚗'} {v.type}
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <div className="font-black text-gray-900 text-sm leading-tight">{v.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{v.owner} · {v.city}</div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-violet-700">₹{v.price}/day</span>
                    <span className="text-gray-500">{v.bookings} bookings</span>
                  </div>
                  {v.earnings > 0 && (
                    <div className="text-xs text-emerald-600 font-bold">
                      ₹{v.earnings.toLocaleString('en-IN')} earned
                    </div>
                  )}
                  {/* Actions */}
                  <div className="flex gap-2 pt-1 border-t border-gray-100">
                    {v.status === 'pending' && (
                      <ActionBtn label="Approve" variant="success" size="sm" onClick={() => approveVehicle(v.id)} />
                    )}
                    {v.status !== 'removed' && (
                      <ActionBtn label="Remove" variant="danger" size="sm" onClick={() => removeVehicle(v.id)} />
                    )}
                    {v.status === 'removed' && (
                      <ActionBtn label="Restore" variant="ghost" size="sm" onClick={() => approveVehicle(v.id)} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
