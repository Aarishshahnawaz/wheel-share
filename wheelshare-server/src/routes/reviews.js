const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  createReview, getOwnerReviews, getMyReviews, getVehicleReviews,
} = require('../controllers/reviewController');

router.use(protect);
router.post('/',                          createReview);
router.get('/owner',                      getOwnerReviews);
router.get('/my',                         getMyReviews);
router.get('/vehicle/:vehicleId',         getVehicleReviews);

module.exports = router;
