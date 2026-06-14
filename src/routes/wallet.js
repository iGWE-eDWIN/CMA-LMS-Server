const express = require('express');
const router = express.Router();
const walletController = require('../controller/wallet')
const {
    auth,
    studentOnly
} = require('../middleware/auth');


router.get(
  '/api/wallet',
  auth,
  studentOnly,
  walletController.getWallet
);

router.get(
  '/api/wallet/transactions',
  auth,
  studentOnly,
  walletController.getTransactions
);

router.post(
  '/api/wallet/fund',
  auth,
  studentOnly,
  walletController.fundWallet
);

router.get(
  '/api/wallet/verify/:reference',
  walletController.verifyWalletFunding
);

module.exports = router;