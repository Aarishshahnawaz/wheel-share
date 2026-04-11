const Review  = require('../models/Review');
const Booking = require('../models/Booking');

// ── POST /api/reviews ─────────────────────────────────────────────────────────
// Renter submits a review after a completed booking
exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, text, categories } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ success: false, message: 'bookingId and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Verify booking belongs to this user and is completed
    const booking = await Booking.findOne({ _id: bookingId, userId: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'You can only review completed bookings' });
    }

    // Prevent duplicate review
    const existing = await Review.findOne({ bookingId });
    if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this booking' });

    const review = await Review.create({
      bookingId,
      vehicleId: booking.vehicleId,
      ownerId:   booking.ownerId,
      userId:    req.user._id,
      rating:    Number(rating),
      text:      text?.trim() || '',
      categories: {
        cleanliness:   categories?.cleanliness   ? Number(categories.cleanliness)   : null,
        condition:     categories?.condition     ? Number(categories.condition)     : null,
        communication: categories?.communication ? Number(categories.communication) : null,
        accuracy:      categories?.accuracy      ? Number(categories.accuracy)      : null,
        value:         categories?.value         ? Number(categories.value)         : null,
      },
    });

    // Also save rating on the booking itself (for quick access)
    booking.rating = { stars: Number(rating), review: text?.trim() || '', createdAt: new Date() };
    await booking.save();

    const populated = await review.populate('userId', 'name profileImage');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/reviews/owner ────────────────────────────────────────────────────
// Owner sees all reviews for their vehicles
exports.getOwnerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ ownerId: req.user._id })
      .populate('userId',    'name profileImage')
      .populate('vehicleId', 'brand model type')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate averages
    const total = reviews.length;
    const avg   = total ? (reviews.reduce((s, r) => s + r.rating, 0) / total) : 0;

    const catAvg = (key) => {
      const vals = reviews.map(r => r.categories?.[key]).filter(Boolean);
      return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    };

    res.json({
      success: true,
      data: reviews,
      stats: {
        total,
        average: Math.round(avg * 10) / 10,
        categories: {
          cleanliness:   Math.round(catAvg('cleanliness')   * 10) / 10,
          condition:     Math.round(catAvg('condition')     * 10) / 10,
          communication: Math.round(catAvg('communication') * 10) / 10,
          accuracy:      Math.round(catAvg('accuracy')      * 10) / 10,
          value:         Math.round(catAvg('value')         * 10) / 10,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/reviews/my ───────────────────────────────────────────────────────
// Renter sees reviews they have given
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .populate('vehicleId', 'brand model type photos')
      .populate('ownerId',   'name profileImage')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/reviews/vehicle/:vehicleId ───────────────────────────────────────
// Public — reviews for a specific vehicle
exports.getVehicleReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ vehicleId: req.params.vehicleId })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
