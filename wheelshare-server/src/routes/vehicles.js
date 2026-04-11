const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  getAllVehicles, getMyVehicles, getVehicleById,
  createVehicle, updateVehicle, toggleAvailability, toggleLive, deleteVehicle,
} = require('../controllers/vehicleController');

// ── IMPORTANT: specific routes BEFORE parameterised routes ──────────────────
// Public
router.get('/', getAllVehicles);

// Protected — /my must come before /:id or Express matches "my" as an id
router.get('/my', protect, getMyVehicles);

// Public — parameterised (must be last)
router.get('/:id', getVehicleById);

// Protected mutations
router.post('/',                  protect, createVehicle);
router.patch('/:id',              protect, updateVehicle);
router.patch('/:id/availability', protect, toggleAvailability);
router.patch('/:id/live',         protect, toggleLive);
router.delete('/:id',             protect, deleteVehicle);

module.exports = router;
