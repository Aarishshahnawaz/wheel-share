const Vehicle = require('../models/Vehicle');

// Strip base64 images — only keep real URLs
function sanitisePhotos(photos) {
  if (!photos) return [];
  const arr = Array.isArray(photos) ? photos : [photos];
  return arr
    .map(p => {
      const url = (typeof p === 'object' ? p.url : p) || '';
      // Skip base64 data URIs — they're too large for MongoDB and don't persist across browsers
      if (url.startsWith('data:')) return null;
      return url ? { url, public_id: p.public_id || '' } : null;
    })
    .filter(Boolean);
}

// ── GET /api/vehicles ─────────────────────────────────────────────────────────
// Public — returns ALL available vehicles for the marketplace
exports.getAllVehicles = async (req, res) => {
  try {
    const { city, type, minPrice, maxPrice, fuel, sort = 'newest' } = req.query;

    const filter = { isAvailable: true };
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (type && ['bike', 'car'].includes(type)) filter.type = type;
    if (fuel) filter.fuel = fuel;
    if (minPrice || maxPrice) {
      filter.dailyPrice = {};
      if (minPrice) filter.dailyPrice.$gte = Number(minPrice);
      if (maxPrice) filter.dailyPrice.$lte = Number(maxPrice);
    }

    const sortMap = {
      newest:     { createdAt: -1 },
      price_asc:  { dailyPrice: 1 },
      price_desc: { dailyPrice: -1 },
    };

    const vehicles = await Vehicle.find(filter)
      .sort(sortMap[sort] || sortMap.newest)
      .populate('ownerId', 'name profileImage')
      .lean();

    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/vehicles/my ──────────────────────────────────────────────────────
// Protected — returns ONLY the logged-in user's vehicles
exports.getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ ownerId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/vehicles/:id ─────────────────────────────────────────────────────
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('ownerId', 'name profileImage phone')
      .lean();
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, data: vehicle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/vehicles ────────────────────────────────────────────────────────
// Protected — create a new vehicle listing
exports.createVehicle = async (req, res) => {
  try {
    const {
      type, brand, model, year, fuel, seats,
      city, area, dailyPrice, hourlyPrice, pricingType, weeklyDiscount, monthlyDiscount, deposit,
      photos, description, features,
      availableDays, startTime, endTime, instantBook,
    } = req.body;

    if (!type || !brand || !model || !year || !fuel || !city) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const pt = pricingType || 'daily';
    if (!dailyPrice && !hourlyPrice) return res.status(400).json({ success: false, message: 'Please provide at least a daily or hourly price' });

    const vehicle = await Vehicle.create({
      ownerId:   req.user._id,
      ownerName: req.user.name,
      type, brand, model,
      year:  Number(year),
      fuel, seats: seats ? Number(seats) : undefined,
      city:  city.trim(),
      area:  area?.trim() || '',
      address:  req.body.address?.trim() || '',
      landmark: req.body.landmark?.trim() || '',
      lat:      req.body.lat  ? Number(req.body.lat)  : null,
      lng:      req.body.lng  ? Number(req.body.lng)  : null,
      dailyPrice:      Number(dailyPrice) || 0,
      hourlyPrice:     Number(hourlyPrice) || 0,
      pricingType:     pt,
      weeklyDiscount:  weeklyDiscount  ?? 10,
      monthlyDiscount: monthlyDiscount ?? 20,
      deposit:         deposit ? Number(deposit) : 0,
      // Sanitise photos — only store URL strings, never base64
      photos: sanitisePhotos(photos),
      description:     description || '',
      features:        Array.isArray(features) ? features : (features ? [features] : []),
      availableDays:   Array.isArray(availableDays) ? availableDays : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      availableDates:  Array.isArray(req.body.availableDates) ? req.body.availableDates : [],
      startTime:       startTime || '08:00',
      endTime:         endTime   || '20:00',
      instantBook:      instantBook ?? true,
      bookingType:      req.body.bookingType || 'both',
      ownerListingType: req.body.ownerListingType || 'business',
      isLive:           req.body.isLive || false,
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/vehicles/:id ───────────────────────────────────────────────────
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found or not yours' });

    const allowed = ['brand','model','year','fuel','seats','city','area','address','landmark','lat','lng',
      'dailyPrice','hourlyPrice','pricingType','isDailyEnabled',
      'weeklyDiscount','monthlyDiscount','deposit','description','features',
      'availableDays','availableDates','startTime','endTime','instantBook','isAvailable','bookingType','ownerListingType'];
    allowed.forEach(k => { if (req.body[k] !== undefined) vehicle[k] = req.body[k]; });

    // Handle photos update — sanitise to strip base64
    if (req.body.photos !== undefined) {
      vehicle.photos = sanitisePhotos(req.body.photos);
    }

    await vehicle.save();
    res.json({ success: true, data: vehicle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/vehicles/:id ──────────────────────────────────────────────────
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found or not yours' });
    await vehicle.deleteOne();
    res.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/vehicles/:id/availability ─────────────────────────────────────
exports.toggleAvailability = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found or not yours' });

    vehicle.isAvailable = !vehicle.isAvailable;
    await vehicle.save();
    res.json({ success: true, data: { id: vehicle._id, isAvailable: vehicle.isAvailable } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/vehicles/:id/live — owner toggles real-time live status ────────
exports.toggleLive = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found or not yours' });

    vehicle.isLive = !vehicle.isLive;
    await vehicle.save();
    res.json({ success: true, data: { id: vehicle._id, isLive: vehicle.isLive } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
