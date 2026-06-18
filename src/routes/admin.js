const express = require('express');
const router = express.Router();

const AdminDashboardController = require('../controller/adminDashboard');
const AdminUserController = require('../controller/adminUserController')
const {
  auth,
  adminOnly,
} = require('../middleware/auth');


// Dashboard statistics
router.get(
  '/api/admin-dashboard/',
  auth,
  adminOnly,
  AdminDashboardController.getDashboard
);


// Get all users (with filters)
router.get(
  '/api/admin/users',
  auth,
  adminOnly,
  AdminUserController.getUsers
);

// Get single user details
router.get(
  '/api/admin/users/:userId',
  auth,
  adminOnly,
  AdminUserController.getUserDetails
);

// Suspend (block) a user
router.patch(
  '/api/admin/users/:userId/suspend',
  auth,
  adminOnly,
  AdminUserController.suspendUser
);

// Unsuspend (unblock) a user
router.patch(
  '/api/admin/users/:userId/unsuspend',
  auth,
  adminOnly,
  AdminUserController.unsuspendUser
);

// Deactivate a user
router.patch(
  '/api/admin/users/:userId/deactivate',
  auth,
  adminOnly,
  AdminUserController.deactivateUser
);

// Reactivate a user
router.patch(
  '/api/admin/users/:userId/reactivate',
  auth,
  adminOnly,
  AdminUserController.reactivateUser
);

// Permanently delete a user
router.delete(
  '/api/admin/users/:userId',
  auth,
  adminOnly,
  AdminUserController.deleteUser
);

// Get all suspended users
router.get(
  '/api/admin/users/suspended',
  auth,
  adminOnly,
  AdminUserController.getSuspendedUsers
);

// Get all deactivated users
router.get(
  '/api/admin/users/deactivated',
  auth,
  adminOnly,
  AdminUserController.getDeactivatedUsers
);

module.exports = router;