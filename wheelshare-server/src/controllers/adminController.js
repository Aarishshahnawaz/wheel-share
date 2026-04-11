const User    = require('../models/User');
const mongoose = require('mongoose');

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      bannedUsers,
      pendingKyc,
      verifiedKyc,
      rejectedKyc,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ 'kyc.status': 'pending' }),
      User.countDocuments({ 'kyc.status': 'verified' }),
      User.countDocuments({ 'kyc.status': 'rejected' }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        bannedUsers,
        totalVehicles:    0,   // extend when Vehicle model exists
        totalBookings:    0,
        platformEarnings: 0,
        kyc: { pending: pendingKyc, verified: verifiedKyc, rejected: rejectedKyc },
        monthlyGrowth: { users: 0, vehicles: 0, bookings: 0, earnings: 0 },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/admin/users ──────────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const { search = '', status = 'all', page = 1, limit = 50 } = req.query;

    const filter = {};
    if (status === 'active')   filter.isActive = true;
    if (status === 'banned')   filter.isActive = false;

    if (search.trim()) {
      filter.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('name email phone profileImage role isActive kyc createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/admin/users/:id/ban ────────────────────────────────────────────
exports.toggleBan = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot ban an admin' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: user.isActive ? 'User reactivated' : 'User banned',
      data: { id: user._id, isActive: user.isActive },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/admin/vehicles ───────────────────────────────────────────────────
// Placeholder — returns empty until Vehicle model is added
exports.getVehicles = async (req, res) => {
  res.json({ success: true, data: [], pagination: { total: 0 } });
};

// ── GET /api/admin/users/:id ──────────────────────────────────────────────────
exports.getUserDetail = async (req, res) => {
  try {
    const Vehicle = require('../models/Vehicle');
    const Booking = require('../models/Booking');

    const user = await User.findById(req.params.id)
      .select('name email phone profileImage role isActive kyc createdAt city');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const [vehicles, renterBookings, ownerBookings] = await Promise.all([
      Vehicle.find({ ownerId: user._id })
        .select('brand model type dailyPrice hourlyPrice isAvailable status photos city createdAt')
        .lean(),
      Booking.find({ userId: user._id })
        .populate('vehicleId', 'brand model type')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      Booking.find({ ownerId: user._id })
        .populate('vehicleId', 'brand model type')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
    ]);

    const totalEarned = ownerBookings
      .filter(b => b.status === 'completed')
      .reduce((s, b) => s + (b.total || 0), 0);
    const totalSpent = renterBookings
      .filter(b => b.status === 'completed')
      .reduce((s, b) => s + (b.total || 0), 0);

    res.json({
      success: true,
      data: {
        user,
        vehicles,
        renterBookings,
        ownerBookings,
        summary: {
          totalEarned,
          totalSpent,
          vehicleCount:  vehicles.length,
          bookingCount:  renterBookings.length,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/admin/users/:id ───────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot delete an admin' });
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
