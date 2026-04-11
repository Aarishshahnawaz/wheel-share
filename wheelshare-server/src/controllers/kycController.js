const User = require('../models/User');

// GET /admin/kyc/:id  — full user detail for modal
exports.getKycDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name email phone profileImage kyc createdAt isActive role');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /admin/kyc?status=pending&search=rahul&page=1&limit=20
exports.getKycRequests = async (req, res) => {
  try {
    const { status = 'pending', search = '', page = 1, limit = 20 } = req.query;

    const filter = {};

    // Status filter
    if (['pending', 'verified', 'rejected'].includes(status)) {
      filter['kyc.status'] = status;
    }

    // Search by name, email, or phone
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
        .select('name email phone profileImage kyc createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /admin/kyc/stats
exports.getKycStats = async (req, res) => {
  try {
    const [pending, verified, rejected] = await Promise.all([
      User.countDocuments({ 'kyc.status': 'pending', $or: [{ 'kyc.license': { $ne: null } }, { 'kyc.aadhaar': { $ne: null } }] }),
      User.countDocuments({ 'kyc.status': 'verified' }),
      User.countDocuments({ 'kyc.status': 'rejected' }),
    ]);
    res.json({ success: true, data: { pending, verified, rejected, total: pending + verified + rejected } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /admin/kyc/:id
exports.updateKycStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be verified or rejected' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.kyc.status = status;
    user.kyc.reviewedAt = new Date();
    user.kyc.reviewedBy = req.user._id;
    if (status === 'rejected' && rejectionReason) {
      user.kyc.rejectionReason = rejectionReason;
    }
    await user.save();

    res.json({
      success: true,
      message: `KYC ${status === 'verified' ? 'approved' : 'rejected'} successfully`,
      data: { id: user._id, kycStatus: user.kyc.status },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /users/kyc  (user uploads their own docs)
exports.submitKyc = async (req, res) => {
  try {
    const { license, aadhaar, pan } = req.body;
    const user = await User.findById(req.user._id);
    if (license) user.kyc.license = license;
    if (aadhaar) user.kyc.aadhaar = aadhaar;
    if (pan)     user.kyc.pan = pan;
    user.kyc.status = 'pending';
    await user.save();
    res.json({ success: true, message: 'KYC submitted for review', data: user.kyc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
