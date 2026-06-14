const express = require('express');
const router = express.Router();
const certificateController = require('../controller/certificate');
const {
    auth,
    adminOnly
} = require('../middleware/auth');

router.get(
  '/api/certificate/my-certificates',
  auth,
  certificateController.getMyCertificates
);

router.get(
    '/api/certificate/verify/:verificationCode',
    certificateController.verifyCertificate
);

router.get(
  '/api/certificate/:certificateId',
  auth,
  certificateController.getCertificate
);

router.post(
  '/api/certificate/generate/:enrollmentId',
  auth,
  adminOnly,
  certificateController.generateCertificate
);

router.patch(
  '/api/certificate/revoke/:certificateId',
  auth,
  adminOnly,
  certificateController.revokeCertificate
);

module.exports = router;