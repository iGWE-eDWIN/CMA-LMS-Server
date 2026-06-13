const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/payment');
const { auth, studentOnly } = require('../middlewares/auth');

// =====================
// INITIATE PAYMENT
// Student starts payment (wallet or Paystack)
// =====================
router.post(
  '/initialize',
  auth,
  studentOnly,
  paymentController.initializePayment
);

// =====================
// VERIFY PAYMENT (Paystack redirect hits here)
// IMPORTANT: redirects back to mobile app via redirectUrl
// =====================
router.get(
  '/verify/:reference',
  paymentController.verifyPayment
);

// =====================
// GET PAYMENT HISTORY (optional but useful)
// =====================
router.get(
  '/history',
  auth,
  paymentController.getUserPayments
);

// =====================
// WEBHOOK (VERY IMPORTANT FOR RELIABILITY)
// =====================
router.post(
  '/webhook',
  express.json({ type: 'application/json' }),
  paymentController.paystackWebhook
);

module.exports = router;