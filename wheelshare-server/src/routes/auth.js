const router = require('express').Router();
const { signup, login, adminLogin, createAdmin } = require('../controllers/authController');

router.post('/signup',        signup);
router.post('/login',         login);
router.post('/admin-login',   adminLogin);
router.post('/create-admin',  createAdmin);   // bootstrap only

module.exports = router;
