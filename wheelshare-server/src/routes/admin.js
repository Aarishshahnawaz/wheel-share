const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getKycRequests, getKycStats, getKycDetail, updateKycStatus } = require('../controllers/kycController');
const { getStats, getUsers, toggleBan, getUserDetail, deleteUser, getVehicles } = require('../controllers/adminController');

// All admin routes require JWT + admin role
router.use(protect, adminOnly);

// ── Stats ─────────────────────────────────────────────
router.get('/stats', getStats);

// ── Users ─────────────────────────────────────────────
router.get('/users',            getUsers);
router.get('/users/:id',        getUserDetail);
router.patch('/users/:id/ban',  toggleBan);
router.delete('/users/:id',     deleteUser);

// ── KYC ──────────────────────────────────────────────
router.get('/kyc',        getKycRequests);
router.get('/kyc/stats',  getKycStats);
router.get('/kyc/:id',    getKycDetail);      // full detail for modal
router.patch('/kyc/:id',  updateKycStatus);

// ── Vehicles ──────────────────────────────────────────
router.get('/vehicles', getVehicles);

module.exports = router;
