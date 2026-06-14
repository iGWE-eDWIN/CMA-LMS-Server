const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notification');
const {auth} = require('../middleware/auth');

router.get(
    '/api/notification',
    auth,
    notificationController.getMyNotifications
);

router.patch(
    '/api/notification/:notificationId/read',
    auth,
    notificationController.markAsRead
);

router.patch(
  '/api/notification/read-all',
  auth,
  notificationController.markAllAsRead
);

router.delete(
  '/api/notification/:notificationId',
  auth,
  notificationController.deleteNotification
);

module.exports = router;