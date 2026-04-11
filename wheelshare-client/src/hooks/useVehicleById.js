import { useState, useEffect } from 'react';
import { VEHICLES } from '../data/vehicles';
import { loadMarketplace } from '../context/VehicleStoreContext';
import { useAuth } from '../context/AuthContext';
import { apiGetVehicleById } from '../services/api';

const FEATURE_LABELS = {
  helmet: 'Helmet included', self_start: 'Self start', abs: 'ABS',
  disc_brake: 'Disc brake', mobile_holder: 'Mobile holder', full_tank: 'Full tank',
  insured: 'Insured', usb_charge: 'USB charging', ac: 'AC', gps: 'GPS',
  bluetooth: 'Bluetooth', sunroof: 'Sunroof', reverse_cam: 'Reverse camera',
  child_seat: 'Child seat', airbags: 'Airbags', cruise_ctrl: 'Cruise control',
};

// Normalise a MongoDB vehicle document into the frontend shape
function normaliseApiVehicle(v, currentUserId) {
  const ownerId = v.ownerId?._id || v.ownerId || null;
  const isOwner = !!(ownerId && currentUserId && String(ownerId) === String(currentUserId));

  return {
    id:           v._id || v.id,
    ownerId,
    isOwner,
    isUserListed: true,
    type:         v.type,
    name:         `${v.brand} ${v.model}`.trim(),
    image:        v.photos?.[0]?.url || null,
    gallery:      (v.photos || []).map(p => p.url || p).filter(Boolean),
    price:        Number(v.dailyPrice) || 0,
    hourlyPrice:  Number(v.hourlyPrice) || 0,
    pricingType:  v.pricingType || 'daily',
    ownerListingType: v.ownerListingType || 'business',
    isDailyEnabled: v.isDailyEnabled || false,
    isLive:       v.isLive || false,
    startTime:    v.startTime || '',
    endTime:      v.endTime   || '',
    address:      v.address   || '',
    landmark:     v.landmark  || '',
    lat:          v.lat       || null,
    lng:          v.lng       || null,
    rating:       0,
    reviews:      0,
    distance:     0,
    city:         v.city  || '',
    area:         v.area  || '',
    lat:          null,
    lng:          null,
    owner:        isOwner ? 'You' : (v.ownerId?.name || v.ownerName || 'Owner'),
    ownerAvatar:  '👤',
    ownerRating:  5,
    ownerTrips:   0,
    ownerJoined:  v.createdAt ? new Date(v.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '',
    ownerVerified: false,
    fuel:         v.fuel  || 'Petrol',
    seats:        Number(v.seats) || 2,
    year:         Number(v.year)  || new Date().getFullYear(),
    mileage:      '',
    engine:       '',
    tags:         (v.features || []).filter(f => ['Insured','AC','GPS','Sunroof','EV','ABS'].includes(f)),
    features:     v.features || [],
    available:    v.isAvailable !== false,
    isCurrentlyBooked: v.isCurrentlyBooked === true,
    status:       v.status || 'pending',
    description:  v.description || '',
    reviewList:   [],
  };
}

// Normalise a localStorage vehicle into the frontend shape
function normaliseLocalVehicle(v, currentUserId) {
  const details  = v.details  || {};
  const pricing  = v.pricing  || {};
  const features = (details.features || []).map(f => FEATURE_LABELS[f] || f);
  const isOwner  = !!(v.ownerId && currentUserId && String(v.ownerId) === String(currentUserId));

  return {
    id:           v.id,
    ownerId:      v.ownerId || null,
    isOwner,
    isUserListed: true,
    type:         details.type || v.type || 'bike',
    name:         `${details.brand || ''} ${details.model || ''}`.trim() || 'Vehicle',
    image:        v.photos?.[0]?.url || null,
    gallery:      (v.photos || []).map(p => p.url || p).filter(Boolean),
    price:        Number(pricing.dailyPrice || v.dailyPrice) || 0,
    hourlyPrice:  Number(pricing.hourlyPrice || v.hourlyPrice) || 0,
    pricingType:  pricing.pricingType || v.pricingType || 'daily',
    isDailyEnabled: pricing.isDailyEnabled || v.isDailyEnabled || false,
    isLive:       v.isLive || false,
    startTime:    v.availability?.startTime || v.startTime || '',
    endTime:      v.availability?.endTime   || v.endTime   || '',
    rating:       0, reviews: 0, distance: 0,
    city:         details.city || v.city || '',
    area:         details.area || v.area || '',
    lat: null, lng: null,
    owner:        isOwner ? 'You' : (v.ownerName || 'Owner'),
    ownerAvatar:  '👤', ownerRating: 5, ownerTrips: 0,
    ownerJoined:  v.createdAt ? new Date(v.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '',
    ownerVerified: false,
    fuel:         details.fuel || v.fuel || 'Petrol',
    seats:        Number(details.seats || v.seats) || 2,
    year:         Number(details.year  || v.year)  || new Date().getFullYear(),
    mileage: '', engine: '',
    tags:         features.filter(f => ['Insured','AC','GPS','Sunroof','EV','ABS'].includes(f)),
    features,
    available:    v.isAvailable !== false,
    isCurrentlyBooked: v.isCurrentlyBooked === true,
    status:       v.status || 'pending',
    description:  details.description || v.description || '',
    reviewList:   [],
  };
}

/**
 * Fetch a vehicle by ID — works for:
 * 1. Static demo vehicles (numeric IDs 1-9)
 * 2. MongoDB vehicles (24-char hex IDs) — fetched from real API
 * 3. Offline/local vehicles (string IDs like "user_xxx" or "local_xxx")
 */
export function useVehicleById(id) {
  const { user } = useAuth();
  const currentUserId = user?.id || user?._id || null;

  const [vehicle,  setVehicle]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); setNotFound(true); return; }

    setLoading(true);
    setNotFound(false);

    // 1. Static demo vehicles (numeric IDs 1-9)
    const numId = Number(id);
    if (!isNaN(numId) && numId > 0 && numId <= 9999) {
      const found = VEHICLES.find(v => v.id === numId);
      if (found) {
        setVehicle({ ...found, ownerId: null, isOwner: false, status: 'approved' });
        setLoading(false);
        return;
      }
    }

    // 2. MongoDB ObjectId (24-char hex) — fetch from real API
    const isMongoId = /^[a-f\d]{24}$/i.test(id);
    if (isMongoId) {
      apiGetVehicleById(id)
        .then(res => {
          if (res.success && res.data) {
            setVehicle(normaliseApiVehicle(res.data, currentUserId));
          } else {
            setNotFound(true);
          }
        })
        .catch(() => {
          // API failed — try localStorage fallback
          const local = loadMarketplace().find(v => v.id === id || v._id === id);
          if (local) setVehicle(normaliseLocalVehicle(local, currentUserId));
          else setNotFound(true);
        })
        .finally(() => setLoading(false));
      return;
    }

    // 3. Local/offline string IDs ("user_xxx", "local_xxx")
    const local = loadMarketplace().find(v => v.id === id);
    if (local) {
      setVehicle(normaliseLocalVehicle(local, currentUserId));
    } else {
      setNotFound(true);
    }
    setLoading(false);

  }, [id, currentUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { vehicle, loading, notFound };
}
