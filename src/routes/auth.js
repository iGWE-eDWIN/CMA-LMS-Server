const express = require('express');
const authController = require('../controller/auth');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/api/register', authController.register);
router.post('/api/login', authController.login);
router.post('/api/refresh', authController.refreshToken);

router.post('/api/logout', auth, authController.logout);
router.post('/api/logout-all', auth, authController.logoutAll);

router.get('/api/me', auth, authController.me);

router.post('/api/forgot-password', authController.forgotPassword);
router.post('/api/reset-password', authController.resetPassword);

module.exports = router;