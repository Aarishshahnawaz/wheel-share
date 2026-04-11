const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  createBooking, getMyBookings, getOwnerBookings,
  getBookingById, cancelBooking,
  acceptBooking, rejectBooking, completeBooking, rateBooking,
} = require('../controllers/bookingController');

router.use(protect);

router.post('/',               createBooking);
router.get('/my',              getMyBookings);
router.get('/owner',           getOwnerBookings);
router.get('/:id',             getBookingById);
router.patch('/:id/cancel',    cancelBooking);
router.patch('/:id/accept',    acceptBooking);
router.patch('/:id/reject',    rejectBooking);
router.patch('/:id/complete',  completeBooking);
router.patch('/:id/rate',      rateBooking);

module.exports = router;
