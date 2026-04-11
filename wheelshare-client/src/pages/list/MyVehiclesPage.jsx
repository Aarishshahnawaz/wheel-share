import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, MapPin, Edit2, Eye, EyeOff, Trash2 } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useVehicleStore } from '../../context/VehicleStoreContext';

const STATUS_CONFIG = {
  pending:  { label: 'Under Review', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
  approved: { label: 'Live ✓',       color: 'bg-green-100 text-green-700 border-green-200',   dot: 'bg-green-500' },
  rejected: { label: 'Rejected',     color: 'bg-red-100 text-red-600 border-red-200',         dot: 'bg-red-500' },
};

export default function MyVehiclesPage() {
  const navigate = useNavigate();
  const { myVehicles, deleteVehicle } = useVehicleStore();
  const [confirmDelete, setConfirmDelete] = useState(null); // vehicle to delete
  const [deleting,      setDeleting]      = useState(false);

  const available = myVehicles.filter(v => v.isAvailable).length;

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteVehicle(confirmDelete.id);
      setConfirmDelete(null);
    } catch (err) {
      alert(err.message || 'Failed to delete vehicle');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">

        {/* Delete confirm modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <h3 className="text-base font-black text-gray-900 text-center mb-1">Delete Vehicle?</h3>
              <p className="text-sm text-gray-500 text-center mb-1">
                <span className="font-bold text-gray-700">
                  {confirmDelete.brand || confirmDelete.details?.brand} {confirmDelete.model || confirmDelete.details?.model}
                </span>
              </p>
              <p className="text-xs text-gray-400 text-center mb-5">
                This will permanently remove the listing. Active bookings will not be affected.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} disabled={deleting}
                  className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50">
                  Keep it
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 py-2.5 rounded-2xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {deleting
                    ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Deleting...</>
                    : <><Trash2 size={13} /> Yes, Delete</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-5 sticky top-0 z-30">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-gray-900">My Vehicles</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {myVehicles.length} listed · <span className="text-green-600 font-bold">{available} available</span>
              </p>
            </div>
            <button onClick={() => navigate('/list')}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 text-white font-bold rounded-2xl text-sm shadow-md">
              <PlusCircle size={16} /> Add Vehicle
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {myVehicles.length === 0 ? (
            <EmptyState onAdd={() => navigate('/list')} />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myVehicles.map(v => (
                <VehicleCard key={v.id} vehicle={v} onDelete={() => setConfirmDelete(v)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function AvailabilityToggle({ vehicleId, isAvailable }) {
  const { toggleAvailability } = useVehicleStore();
  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
      <div className="flex items-center gap-2">
        {isAvailable ? <Eye size={14} className="text-green-500" /> : <EyeOff size={14} className="text-gray-400" />}
        <span className={`text-xs font-bold ${isAvailable ? 'text-green-700' : 'text-gray-500'}`}>
          {isAvailable ? 'Available for rent' : 'Hidden from renters'}
        </span>
      </div>
      <button onClick={() => toggleAvailability(vehicleId)}
        className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-1 ${isAvailable ? 'bg-green-500 focus:ring-green-400' : 'bg-gray-300 focus:ring-gray-400'}`}
        aria-label="Toggle availability">
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${isAvailable ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}

function VehicleCard({ vehicle, onDelete }) {
  const navigate = useNavigate();
  const status     = STATUS_CONFIG[vehicle.status] || STATUS_CONFIG.pending;
  const coverPhoto = vehicle.photos?.[0]?.url || null;
  const brand    = vehicle.brand    || vehicle.details?.brand    || '';
  const model    = vehicle.model    || vehicle.details?.model    || '';
  const city     = vehicle.city     || vehicle.details?.city     || '';
  const area     = vehicle.area     || vehicle.details?.area     || '';
  const year     = vehicle.year     || vehicle.details?.year     || '';
  const fuel     = vehicle.fuel     || vehicle.details?.fuel     || '';
  const features    = vehicle.features?.length ? vehicle.features : (vehicle.details?.features || []);
  const price       = vehicle.dailyPrice || vehicle.pricing?.dailyPrice || 0;
  const hourlyPrice = vehicle.hourlyPrice || vehicle.pricing?.hourlyPrice || 0;

  return (
    <div className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all group hover:shadow-md ${vehicle.isAvailable ? 'border-gray-100' : 'border-gray-200 opacity-80'}`}>
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-orange-100 to-blue-100 flex items-center justify-center overflow-hidden">
        {coverPhoto
          ? <img src={coverPhoto} alt={`${brand} ${model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <span className="text-6xl">{vehicle.type === 'bike' ? '🏍️' : '🚗'}</span>
        }
        {!vehicle.isAvailable && (
          <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
            <span className="bg-white/90 text-gray-700 text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <EyeOff size={11} /> Hidden from renters
            </span>
          </div>
        )}
        {/* Status badge — only show if rejected */}
        {vehicle.status === 'rejected' && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm bg-white/80 bg-red-100 text-red-600 border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Rejected
          </div>
        )}
        <div className="absolute top-3 right-3 bg-gray-900/70 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
          {vehicle.type === 'bike' ? '🏍️ Bike' : '🚗 Car'}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-black text-gray-900 text-sm leading-tight">{brand} {model}</h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 flex-wrap">
            <span className="flex items-center gap-1"><MapPin size={11} className="text-orange-400" />{area}{area && city ? ', ' : ''}{city}</span>
            {year && <span>· {year}</span>}
            {fuel && <span>· {fuel}</span>}
          </div>
        </div>

        {features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {features.slice(0, 3).map(f => (
              <span key={f} className="text-xs bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">{f}</span>
            ))}
            {features.length > 3 && <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">+{features.length - 3} more</span>}
          </div>
        )}

        <AvailabilityToggle vehicleId={vehicle.id} isAvailable={vehicle.isAvailable} />

        {/* Price + Edit + Delete */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
            {hourlyPrice > 0 && (
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-black text-orange-500">
                  ₹{Number(hourlyPrice).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-gray-400">/hr</span>
              </div>
            )}
            {price > 0 && (
              <div className="flex items-baseline gap-0.5">
                <span className="text-lg font-black text-orange-500">
                  ₹{Number(price).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-gray-400">/day</span>
              </div>
            )}
            {!(hourlyPrice > 0) && !(price > 0) && (
               <span className="text-lg font-black text-orange-500">₹0</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(`/edit-vehicle/${vehicle.id}`)}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-orange-600 bg-gray-100 hover:bg-orange-50 border border-transparent hover:border-orange-200 px-3 py-2 rounded-xl transition-all">
              <Edit2 size={12} /> Edit
            </button>
            <button onClick={onDelete}
              className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 border border-transparent hover:border-red-200 px-3 py-2 rounded-xl transition-all">
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>

        {vehicle.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-600 font-semibold">
            ❌ Rejected — please contact support
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-24 h-24 bg-orange-50 rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-inner">🚗</div>
      <h3 className="text-xl font-black text-gray-900 mb-2">No vehicles listed yet</h3>
      <p className="text-gray-500 text-sm mb-8 max-w-xs leading-relaxed">List your bike or car and start earning money when it's not in use.</p>
      <button onClick={onAdd} className="btn-primary flex items-center gap-2 px-8 py-4 text-white font-black rounded-2xl text-sm shadow-lg">
        <PlusCircle size={18} /> List Your First Vehicle
      </button>
    </div>
  );
}
