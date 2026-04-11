const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getMyChats, getChatByBooking, getMessages, sendMessage } = require('../controllers/chatController');

router.use(protect);
router.get('/',                          getMyChats);
router.get('/booking/:bookingId',        getChatByBooking);
router.get('/:chatId/messages',          getMessages);
router.post('/:chatId/messages',         sendMessage);

module.exports = router;
