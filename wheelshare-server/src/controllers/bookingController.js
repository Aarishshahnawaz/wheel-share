const Booking  = require('../models/Booking');
const Vehicle  = require('../models/Vehicle');
const { createNotification } = require('./notificationController');
const User = require('../models/User');

// ── POST /api/bookings ────────────────────────────────────────────────────────
exports.createBooking = async (req, res) => {
  try {
    const {
      vehicleId, startDate, endDate, startTime, endTime, days,
      subtotal, addonsTotal, insurance, serviceFee, total, addons,
    } = req.body;

    if (!vehicleId || !startDate || !endDate || !total) {
      return res.status(400).json({ success: false, message: 'Missing required booking fields' });
    }

    // ATOMIC OPERATION: Lock vehicle while checking availability (prevents race condition)
    const vehicle = await Vehicle.findOneAndUpdate(
      { 
        _id: vehicleId, 
        isAvailable: true, 
        isCurrentlyBooked: false 
      },
      { isCurrentlyBooked: true },
      { new: true }
    );

    if (!vehicle) {
      return res.status(400).json({ success: false, message: 'Vehicle not available or already booked' });
    }

    // Prevent owner from booking their own vehicle
    if (vehicle.ownerId.toString() === req.user._id.toString()) {
      // Rollback the lock
      await Vehicle.findByIdAndUpdate(vehicleId, { isCurrentlyBooked: false });
      return res.status(403).json({ success: false, message: 'You cannot book your own vehicle' });
    }

    // Build snapshot — only store URL (never base64), always plain strings
    const rawImage = vehicle.photos?.[0]?.url || '';
    const snapshotImage = rawImage.startsWith('data:') ? '' : rawImage; // strip base64

    const booking = await Booking.create({
      userId:    req.user._id,
      vehicleId: vehicle._id,
      ownerId:   vehicle.ownerId,
      startDate, endDate,
      startTime: startTime || '10:00',
      endTime:   endTime   || '10:00',
      days:      Number(days) || 1,
      subtotal:    Number(subtotal)    || 0,
      addonsTotal: Number(addonsTotal) || 0,
      insurance:   Number(insurance)   || 0,
      serviceFee:  Number(serviceFee)  || 0,
      total:       Number(total),
      addons:      Array.isArray(addons) ? addons : [],
      status:      'pending',
      vehicleSnapshot: {
        name:  `${vehicle.brand || ''} ${vehicle.model || ''}`.trim(),
        image: snapshotImage,
        city:  vehicle.city  || '',
        area:  vehicle.area  || '',
        type:  vehicle.type  || 'bike',
        price: Number(vehicle.dailyPrice) || 0,
      },
    });

    res.status(201).json({ success: true, data: booking });

    // Notify owner (fire-and-forget — don't block response)
    const renter = await User.findById(req.user._id).select('name').lean();
    createNotification({
      recipientId: vehicle.ownerId,
      senderId:    req.user._id,
      type:        'booking_request',
      title:       '🚗 New Booking Request',
      body:        `${renter?.name || 'Someone'} wants to book your ${vehicle.brand} ${vehicle.model} from ${startDate} to ${endDate}`,
      bookingId:   booking._id,
      io:          req.io,
    }).catch(() => {});

  } catch (err) {
    console.error('[createBooking]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/bookings/my ──────────────────────────────────────────────────────
// Returns only the logged-in user's bookings
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('vehicleId', 'brand model photos city area address landmark lat lng state type dailyPrice hourlyPrice ownerId')
      .populate({ path: 'vehicleId', populate: { path: 'ownerId', select: 'name phone profileImage' } })
      .lean();

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/bookings/:id ─────────────────────────────────────────────────────
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('vehicleId', 'brand model photos city area address landmark lat lng state type dailyPrice hourlyPrice ownerId')
      .populate({ path: 'vehicleId', populate: { path: 'ownerId', select: 'name phone profileImage' } })
      .populate('userId', 'name email phone')
      .lean();

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Only the renter or vehicle owner can view
    const isRenter = booking.userId._id.toString() === req.user._id.toString();
    const isOwner  = booking.ownerId.toString()    === req.user._id.toString();
    if (!isRenter && !isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/bookings/:id/cancel ────────────────────────────────────────────
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: booking.status === 'confirmed' || booking.status === 'active'
          ? 'Booking has already been confirmed by the owner and cannot be cancelled'
          : `Cannot cancel a ${booking.status} booking`,
      });
    }
    booking.status = 'cancelled';
    await booking.save();
    await Vehicle.updateOne({ _id: booking.vehicleId }, { isCurrentlyBooked: false });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/bookings/owner — bookings for owner's vehicles ───────────────────
exports.getOwnerBookings = async (req, res) => {
  try {
    const Review = require('../models/Review');

    const bookings = await Booking.find({ ownerId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('vehicleId', 'brand model photos city area type dailyPrice')
      .populate('userId', 'name email phone profileImage')
      .lean();

    // Attach review to each completed booking
    const bookingIds = bookings.map(b => b._id);
    const reviews    = await Review.find({ bookingId: { $in: bookingIds } }).lean();
    const reviewMap  = Object.fromEntries(reviews.map(r => [r.bookingId.toString(), r]));

    const data = bookings.map(b => ({
      ...b,
      review: reviewMap[b._id.toString()] || null,
    }));

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/bookings/:id/accept — owner accepts ───────────────────────────
exports.acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'pending') return res.status(400).json({ success: false, message: 'Only pending bookings can be accepted' });

    booking.status = 'confirmed';
    await booking.save();

    const owner = await User.findById(req.user._id).select('name').lean();
    createNotification({
      recipientId: booking.userId,
      senderId:    req.user._id,
      type:        'booking_accepted',
      title:       '✅ Booking Accepted!',
      body:        `${owner?.name || 'The owner'} accepted your booking. Get ready for your ride!`,
      bookingId:   booking._id,
      io:          req.io,
    }).catch(() => {});

    res.json({ success: true, message: 'Booking accepted', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/bookings/:id/reject — owner rejects ───────────────────────────
exports.rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot reject this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();
    await Vehicle.updateOne({ _id: booking.vehicleId }, { isCurrentlyBooked: false });

    const owner = await User.findById(req.user._id).select('name').lean();
    createNotification({
      recipientId: booking.userId,
      senderId:    req.user._id,
      type:        'booking_rejected',
      title:       '❌ Booking Rejected',
      body:        `${owner?.name || 'The owner'} rejected your booking. ${req.body.reason || ''}`,
      bookingId:   booking._id,
      io:          req.io,
    }).catch(() => {});

    res.json({ success: true, message: 'Booking rejected', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/bookings/:id/rate — renter rates completed booking ─────────────
exports.rateBooking = async (req, res) => {
  try {
    const { stars, review } = req.body;
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ success: false, message: 'Stars must be between 1 and 5' });
    }

    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Only completed bookings can be rated' });
    }
    if (booking.rating?.stars) {
      return res.status(400).json({ success: false, message: 'You have already rated this booking' });
    }

    booking.rating = { stars: Number(stars), review: review?.trim() || '', createdAt: new Date() };
    await booking.save();

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'confirmed' && booking.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Only active bookings can be completed' });
    }

    booking.status = 'completed';
    await booking.save();
    await Vehicle.updateOne({ _id: booking.vehicleId }, { isCurrentlyBooked: false });

    createNotification({
      recipientId: booking.userId,
      senderId:    req.user._id,
      type:        'booking_completed',
      title:       '🎉 Trip Completed!',
      body:        'Your rental has been marked as completed. Please rate your experience.',
      bookingId:   booking._id,
      io:          req.io,
    }).catch(() => {});

    res.json({ success: true, message: 'Booking completed', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
