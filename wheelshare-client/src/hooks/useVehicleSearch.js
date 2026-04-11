import { useState, useEffect, useMemo } from 'react';
import { VEHICLES } from '../data/vehicles';
import { useVehicleStore, loadMarketplace } from '../context/VehicleStoreContext';
import { useAuth } from '../context/AuthContext';
import { apiGetAllVehicles } from '../services/api';

const FEATURE_LABEL_TO_TAG = {
  'Insured': 'Insured', 'AC': 'AC', 'Helmet included': 'Insured',
  'GPS': 'GPS', 'Full tank': 'Full tank', 'Self start': 'Self start',
  'ABS': 'ABS', 'Sunroof': 'Sunroof', 'Reverse camera': 'Reverse camera',
  'Bluetooth': 'Bluetooth', 'Airbags': 'Airbags', 'EV': 'EV',
};

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
    gallery:      (v.photos || []).map(p => p.url).filter(Boolean),
    price:        Number(v.dailyPrice) || 0,
    hourlyPrice:  Number(v.hourlyPrice) || 0,
    pricingType:  v.pricingType || 'daily',
    ownerListingType: v.ownerListingType || 'business',
    isDailyEnabled: v.isDailyEnabled || false,
    bookingType:  v.bookingType || 'both',
    isLive:       v.isLive || false,
    startTime:    v.startTime || '',
    endTime:      v.endTime   || '',
    rating:       0,
    reviews:      0,
    distance:     0,
    city:         v.city || '',
    area:         v.area || '',
    lat:          null,
    lng:          null,
    owner:        isOwner ? 'You' : (v.ownerId?.name || v.ownerName || 'Owner'),
    ownerAvatar:  '👤',
    ownerRating:  5,
    ownerTrips:   0,
    ownerJoined:  v.createdAt ? new Date(v.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '',
    ownerVerified: false,
    fuel:         v.fuel || 'Petrol',
    seats:        Number(v.seats) || 2,
    year:         Number(v.year)  || new Date().getFullYear(),
    mileage:      '',
    engine:       '',
    tags:         (v.features || []).map(f => FEATURE_LABEL_TO_TAG[f]).filter(Boolean),
    features:     v.features || [],
    available:    v.isAvailable !== false,
    isCurrentlyBooked: v.isCurrentlyBooked === true,
    availableDates: v.availableDates || [],
    status:       v.status || 'pending',
    description:  v.description || '',
    reviewList:   [],
  };
}

function normaliseLocalVehicle(v, currentUserId) {
  const details = v.details || {};
  const pricing = v.pricing || {};
  const features = details.features || [];
  const isOwner = !!(v.ownerId && currentUserId && String(v.ownerId) === String(currentUserId));

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
    ownerListingType: v.availability?.ownerListingType || v.ownerListingType || 'business',
    bookingType:  v.availability?.bookingType || v.bookingType || 'both',
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
    tags:         features.map(f => FEATURE_LABEL_TO_TAG[f]).filter(Boolean),
    features,
    available:    v.isAvailable !== false,
    availableDates: v.availability?.availableDates || v.availableDates || [],
    status:       v.status || 'pending',
    description:  details.description || v.description || '',
    reviewList:   [],
  };
}

function cityMatch(vehicleCity, filterCity) {
  if (!filterCity) return true;
  return vehicleCity.toLowerCase().trim() === filterCity.toLowerCase().trim();
}

export function useVehicleSearch(filters) {
  const { myVehicles } = useVehicleStore();
  const { user }       = useAuth();
  const currentUserId  = user?.id || user?._id || null;

  const [apiVehicles,  setApiVehicles]  = useState([]);
  const [apiLoading,   setApiLoading]   = useState(true);
  const [usingApi,     setUsingApi]     = useState(false);

  // Fetch from real backend on mount
  useEffect(() => {
    setApiLoading(true);
    apiGetAllVehicles()
      .then(res => {
        if (res.success && res.data.length >= 0) {
          setApiVehicles(res.data);
          setUsingApi(true);
        }
      })
      .catch(() => setUsingApi(false))
      .finally(() => setApiLoading(false));
  }, []);

  const allVehicles = useMemo(() => {
    // Static demo vehicles — always shown, never owned by any user
    const staticList = VEHICLES.map(v => ({ ...v, ownerId: null, isOwner: false, status: 'approved' }));

    let userListed;
    if (usingApi) {
      // Use real backend data — includes ALL users' vehicles
      userListed = apiVehicles
        .filter(v => v.isAvailable !== false && v.city)
        .map(v => normaliseApiVehicle(v, currentUserId));
    } else {
      // Offline fallback — read from global marketplace localStorage
      userListed = loadMarketplace()
        .filter(v => v.isAvailable !== false && (v.details?.city || v.city))
        .map(v => normaliseLocalVehicle(v, currentUserId));
    }

    return [...staticList, ...userListed];
  }, [apiVehicles, myVehicles, currentUserId, usingApi]);

  const results = useMemo(() => {
    let list = allVehicles.filter(v => v.available !== false);

    if (filters.type !== 'all')  list = list.filter(v => v.type === filters.type);
    if (filters.city)            list = list.filter(v => cityMatch(v.city, filters.city));
    list = list.filter(v => v.price >= filters.priceMin && v.price <= filters.priceMax);
    if (filters.minRating)       list = list.filter(v => v.isUserListed || v.rating >= filters.minRating);
    if (filters.fuel?.length)    list = list.filter(v => filters.fuel.includes(v.fuel));
    if (filters.tags?.length)    list = list.filter(v => filters.tags.some(t => v.tags.includes(t)));

    // ── Personal listing time-range filter ───────────────────────────────────
    // Personal vehicles only visible if the selected search time is within their available window
    const [searchH, searchM] = (filters.time || '00:00').split(':').map(Number);
    const searchMins = searchH * 60 + searchM;
    list = list.filter(v => {
      if (v.ownerListingType !== 'personal') return true; // business always visible
      if (!v.startTime || !v.endTime) return true;
      const [sh, sm] = v.startTime.split(':').map(Number);
      const [eh, em] = v.endTime.split(':').map(Number);
      const startMins = sh * 60 + sm;
      const endMins   = eh * 60 + em;
      return searchMins >= startMins && searchMins <= endMins;
    });

    // ── Personal listing date filter ──────────────────────────────────────────
    // Personal vehicles only visible if the selected search date is in their availableDates list
    if (filters.date) {
      const selectedDateStr = filters.date; // already "YYYY-MM-DD" string
      list = list.filter(v => {
        if (v.ownerListingType !== 'personal') return true; // business always visible
        if (!v.availableDates || v.availableDates.length === 0) return true;
        return v.availableDates.includes(selectedDateStr);
      });
    }

    // ── Booking type filter ───────────────────────────────────────────────────
    if (filters.bookingType === 'instant') {
      list = list.filter(v => !v.bookingType || v.bookingType === 'instant' || v.bookingType === 'both');
    } else if (filters.bookingType === 'advance') {
      list = list.filter(v => !v.bookingType || v.bookingType === 'advance' || v.bookingType === 'both');
    }

    // ── Available Now filter (isLive = true) ──────────────────────────────────
    if (filters.availableNow) {
      list = list.filter(v => v.isLive === true);
    }

    if (filters.sort === 'price_asc')       list.sort((a, b) => a.price - b.price);
    else if (filters.sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (filters.sort === 'rating')     list.sort((a, b) => b.rating - a.rating);
    else if (filters.sort === 'distance')   list.sort((a, b) => a.distance - b.distance);
    else list.sort((a, b) => (b.isUserListed ? 1 : 0) - (a.isUserListed ? 1 : 0));

    return list;
  }, [allVehicles, filters]);

  return { results, total: results.length, loading: apiLoading, usingApi };
}
