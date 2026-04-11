const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { submitKyc } = require('../controllers/kycController');
const User = require('../models/User');

// GET /users/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, data: req.user });
});

// PATCH /users/profile
router.patch('/profile', protect, async (req, res) => {
  try {
    const allowed = ['name', 'email', 'phone', 'profileImage'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /users/kyc
router.patch('/kyc', protect, submitKyc);

module.exports = router;
