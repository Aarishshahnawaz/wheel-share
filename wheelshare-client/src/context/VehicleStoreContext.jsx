import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  apiCreateVehicle, apiGetMyVehicles,
  apiUpdateVehicle, apiToggleVehicleAvailability, apiDeleteVehicle,
} from '../services/api';

const VehicleStoreContext = createContext(null);

// ── Offline fallback helpers ──────────────────────────────────────────────────
const userKey       = (uid) => uid ? `ws_vehicles_${uid}` : 'ws_vehicles_guest';
const marketKey     = 'ws_marketplace_vehicles';

const loadLocal     = (uid) => { try { return JSON.parse(localStorage.getItem(userKey(uid)) || '[]'); } catch { return []; } };
const saveLocal     = (uid, v) => localStorage.setItem(userKey(uid), JSON.stringify(v));
export const loadMarketplace = () => { try { return JSON.parse(localStorage.getItem(marketKey) || '[]'); } catch { return []; } };
const saveMarketplace = (v) => localStorage.setItem(marketKey, JSON.stringify(v));

const upsertMarketplace = (vehicle) => {
  const all = loadMarketplace();
  const idx = all.findIndex(v => v.id === vehicle.id);
  if (idx >= 0) all[idx] = vehicle; else all.unshift(vehicle);
  saveMarketplace(all);
};

// ── Provider ──────────────────────────────────────────────────────────────────
export function VehicleStoreProvider({ children }) {
  const { user } = useAuth();
  const userId   = user?.id || user?._id || null;

  const [myVehicles,   setMyVehicles]   = useState(() => loadLocal(userId));
  const [backendOnline, setBackendOnline] = useState(true);
  const [toast,        setToast]        = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Reload when user changes
  useEffect(() => { setMyVehicles(loadLocal(userId)); }, [userId]);

  // Sync from backend on mount
  useEffect(() => {
    if (!userId) return;
    apiGetMyVehicles()
      .then(res => {
        if (res.success) {
          const normalised = res.data.map(normaliseFromApi);
          setMyVehicles(normalised);
          saveLocal(userId, normalised);
          setBackendOnline(true);
        }
      })
      .catch(() => setBackendOnline(false));
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Create vehicle ──────────────────────────────────────────────────────────
  const addVehicle = useCallback(async (vehicle) => {
    const details  = vehicle.details  || {};
    const pricing  = vehicle.pricing  || {};
    const avail    = vehicle.availability || {};

    const payload = {
      type:            details.type,
      brand:           details.brand,
      model:           details.model,
      year:            details.year,
      fuel:            details.fuel,
      seats:           details.seats || undefined,
      city:            details.city,
      area:            details.area,
      address:         details.address || '',
      landmark:        details.landmark || '',
      lat:             details.lat  || null,
      lng:             details.lng  || null,
      pricingType:      details.ownerListingType === 'personal' ? 'hourly' : (pricing.pricingType || 'daily'),
      ownerListingType: details.ownerListingType || 'business',
      dailyPrice:       details.ownerListingType === 'personal' ? (pricing.isDailyEnabled ? Number(pricing.dailyPrice) || 0 : 0) : (Number(pricing.dailyPrice) || 0),
      hourlyPrice:      Number(pricing.hourlyPrice) || 0,
      isDailyEnabled:   pricing.isDailyEnabled || false,
      weeklyDiscount:  pricing.weeklyDiscount,
      monthlyDiscount: pricing.monthlyDiscount,
      deposit:         pricing.deposit,
      photos:          (vehicle.photos || []).map(p => ({ url: p.url || p, public_id: '' })),
      description:     details.description,
      features:        details.features || [],
      availableDays:   avail.days,
      availableDates:  avail.availableDates || [],
      startTime:       avail.startTime,
      endTime:         avail.endTime,
      instantBook:     avail.instantBook,
      bookingType:     avail.bookingType || 'both',
      isLive:          avail.isLive || false,
    };

    try {
      const res = await apiCreateVehicle(payload);
      if (res.success) {
        const newV = normaliseFromApi(res.data);
        setMyVehicles(prev => { const u = [newV, ...prev]; saveLocal(userId, u); return u; });
        upsertMarketplace(newV);
        setBackendOnline(true);
        showToast('Vehicle listed successfully 🚀');
        return newV;
      }
      // API returned success:false
      throw new Error(res.message || 'Failed to save vehicle');
    } catch (err) {
      // Only fall back to offline if it's a network error
      const isNetwork = err.message?.includes('fetch') || err.message?.includes('Failed to fetch') || err.name === 'TypeError';
      if (!isNetwork) {
        setBackendOnline(true);
        throw err; // re-throw API errors so the UI can show them
      }
      setBackendOnline(false);
    }

    // Offline fallback
    const offlineV = {
      id:          `local_${Date.now()}`,
      ownerId:     userId,
      ownerName:   user?.name || 'Owner',
      ...payload,
      isAvailable: true,
      status:      'pending',
      createdAt:   new Date().toISOString(),
      _offline:    true,
      // keep original shape for normalisation
      details, pricing, availability: avail,
      photos:      vehicle.photos || [],
    };
    setMyVehicles(prev => { const u = [offlineV, ...prev]; saveLocal(userId, u); return u; });
    upsertMarketplace(offlineV);
    showToast('Vehicle saved locally (server offline) 🚀');
    return offlineV;
  }, [userId, user, showToast]);

  // ── Update vehicle ──────────────────────────────────────────────────────────
  const updateVehicle = useCallback(async (id, patch) => {
    try {
      if (backendOnline) await apiUpdateVehicle(id, patch);
    } catch { /* offline — update locally */ }

    setMyVehicles(prev => {
      const u = prev.map(v => v.id === id ? { ...v, ...patch } : v);
      saveLocal(userId, u);
      const updated = u.find(v => v.id === id);
      if (updated) upsertMarketplace(updated);
      return u;
    });
    showToast('Vehicle updated ✅');
  }, [backendOnline, userId, showToast]);

  // ── Toggle availability ─────────────────────────────────────────────────────
  const toggleAvailability = useCallback(async (id) => {
    try {
      if (backendOnline) await apiToggleVehicleAvailability(id);
    } catch { /* offline */ }

    setMyVehicles(prev => {
      const u = prev.map(v => v.id === id ? { ...v, isAvailable: !v.isAvailable } : v);
      saveLocal(userId, u);
      const updated = u.find(v => v.id === id);
      if (updated) upsertMarketplace(updated);
      return u;
    });
  }, [backendOnline, userId]);

  // ── Delete vehicle ──────────────────────────────────────────────────────────
  const deleteVehicle = useCallback(async (id) => {
    await apiDeleteVehicle(id);
    setMyVehicles(prev => {
      const updated = prev.filter(v => v.id !== id);
      saveLocal(userId, updated);
      // Remove from marketplace too
      const market = loadMarketplace().filter(v => v.id !== id);
      saveMarketplace(market);
      return updated;
    });
    showToast('Vehicle deleted ✅');
  }, [userId, showToast]);

  const getVehicle = useCallback((id) => myVehicles.find(v => v.id === id) || null, [myVehicles]);

  return (
    <VehicleStoreContext.Provider value={{
      myVehicles, addVehicle, updateVehicle, deleteVehicle, toggleAvailability, getVehicle, showToast, backendOnline,
    }}>
      {children}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </VehicleStoreContext.Provider>
  );
}

function Toast({ toast, onClose }) {
  const bg   = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500' };
  const icon = { success: '✅', error: '❌', info: 'ℹ️' };
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] ${bg[toast.type]} text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm animate-modal min-w-max`}>
      <span>{icon[toast.type]}</span>
      <span>{toast.msg}</span>
      <button onClick={onClose} className="text-white/60 hover:text-white ml-2 text-xl leading-none">×</button>
    </div>
  );
}

export const useVehicleStore = () => useContext(VehicleStoreContext);

// ── Normalise MongoDB vehicle → frontend shape ────────────────────────────────
function normaliseFromApi(v) {
  return {
    id:          v._id || v.id,
    ownerId:     v.ownerId?._id || v.ownerId || null,
    ownerName:   v.ownerId?.name || v.ownerName || 'Owner',
    type:        v.type,
    isAvailable: v.isAvailable !== false,
    isCurrentlyBooked: v.isCurrentlyBooked === true,
    status:      v.status || 'pending',
    createdAt:   v.createdAt,
    // Keep original API fields for normaliseMarketplaceVehicle
    brand:       v.brand,
    model:       v.model,
    year:        v.year,
    fuel:        v.fuel,
    seats:       v.seats,
    city:        v.city,
    area:        v.area,
    dailyPrice:  v.dailyPrice,
    hourlyPrice: v.hourlyPrice || 0,
    pricingType: v.pricingType || 'daily',
    ownerListingType: v.ownerListingType || 'business',
    isDailyEnabled: v.isDailyEnabled || false,
    photos:      (v.photos || []).map(p => ({ url: p.url || p })),
    description: v.description,
    features:    Array.isArray(v.features) ? v.features : (v.features ? [v.features] : []),
    // Wrap in details/pricing shape so existing normalise functions work
    details: {
      type: v.type, brand: v.brand, model: v.model, year: v.year,
      fuel: v.fuel, seats: v.seats, city: v.city, area: v.area,
      description: v.description,
      features: Array.isArray(v.features) ? v.features : (v.features ? [v.features] : []),
    },
    pricing: {
      dailyPrice:      v.dailyPrice,
      weeklyDiscount:  v.weeklyDiscount,
      monthlyDiscount: v.monthlyDiscount,
      deposit:         v.deposit,
    },
    availability: {
      days:           v.availableDays,
      availableDates: v.availableDates || [],
      startTime:      v.startTime,
      endTime:        v.endTime,
      instantBook:    v.instantBook,
      blocked:        v.blockedDates || [],
      bookingType:    v.bookingType || 'both',
    },
  };
}
