const express = require('express');
const router = express.Router();

const paymentController = require('../controller/payment');
const { auth, studentOnly } = require('../middleware/auth');

// =====================
// INITIATE PAYMENT
// Student starts payment (wallet or Paystack)
// =====================
router.post(
  '/api/payment/initialize',
  auth,
  studentOnly,
  paymentController.purchaseCourse
);

// =====================
// VERIFY PAYMENT (Paystack redirect hits here)
// IMPORTANT: redirects back to mobile app via redirectUrl
// =====================
router.get(
  '/payment/verify/:reference',
  paymentController.verifyPayment
);

// =====================
// GET PAYMENT HISTORY (optional but useful)
// =====================
router.get(
  '/api/payment/history',
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