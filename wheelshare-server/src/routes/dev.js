// ⚠️  DEV-ONLY routes — remove before production
const router = require('express').Router();
const User   = require('../models/User');

// DELETE /api/dev/reset-users  →  wipe entire users collection
router.delete('/reset-users', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Not allowed in production' });
  }
  const result = await User.deleteMany({});
  res.json({ success: true, deleted: result.deletedCount, message: 'All users deleted' });
});

// GET /api/dev/users  →  list all users (for debugging)
router.get('/users', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Not allowed in production' });
  }
  const users = await User.find({}).select('-password').lean();
  res.json({ success: true, count: users.length, users });
});

module.exports = router;

// PATCH /api/dev/fix-vehicles — strip base64 photos from all vehicles
router.patch('/fix-vehicles', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'Not allowed in production' });
  }
  const Vehicle = require('../models/Vehicle');
  const vehicles = await Vehicle.find({});
  let fixed = 0;
  for (const v of vehicles) {
    const cleanPhotos = (v.photos || []).filter(p => {
      const url = p.url || '';
      return url && !url.startsWith('data:');
    });
    if (cleanPhotos.length !== v.photos.length) {
      v.photos = cleanPhotos;
      await v.save();
      fixed++;
    }
  }
  res.json({ success: true, message: `Fixed ${fixed} vehicles`, total: vehicles.length });
});
