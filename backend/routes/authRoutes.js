// routes/auth.js
const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/voucher-login',  authController.voucherLogin);
router.post('/set-password', authController.setPassword);
router.post('/login', authController.login);
router.get('/has-admins', authController.hasAdmin);
  

module.exports = router;
