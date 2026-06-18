// adminUserController.js

const User = require('../models/user');

class AdminUserController {
  /**
   * Get all users with filters
   * GET /api/admin/users
   */
  async getUsers(req, res) {
    try {
      const { role, accountStatus, isSuspended, search } = req.query;
      
      const filter = {};
      
      if (role) filter.role = role;
      if (accountStatus) filter.accountStatus = accountStatus;
      if (isSuspended !== undefined) filter.isSuspended = isSuspended === 'true';
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ];
      }

      const users = await User.find(filter)
        .select('-password -passwordResetTokenHash -currentRefreshToken')
        .sort({ createdAt: -1 });

      // Statistics
      const stats = {
        total: users.length,
        students: users.filter(u => u.role === 'student').length,
        instructors: users.filter(u => u.role === 'instructor').length,
        admins: users.filter(u => u.role === 'admin').length,
        active: users.filter(u => u.accountStatus === 'active' && !u.isSuspended).length,
        suspended: users.filter(u => u.isSuspended === true).length,
        pendingVerification: users.filter(u => u.accountStatus === 'pending_verification').length,
        deactivated: users.filter(u => u.accountStatus === 'deactivated').length,
      };

      return res.status(200).json({
        success: true,
        stats,
        count: users.length,
        data: users,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get single user details
   * GET /api/admin/users/:userId
   */
  async getUserDetails(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId)
        .select('-password -passwordResetTokenHash -currentRefreshToken');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Suspend (Block) user
   * PATCH /api/admin/users/:userId/suspend
   */
  async suspendUser(req, res) {
    try {
      const { userId } = req.params;
      const { reason } = req.body;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Prevent suspending admin
      if (user.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Cannot suspend an admin user',
        });
      }

      // Prevent suspending already suspended user
      if (user.isSuspended) {
        return res.status(400).json({
          success: false,
          message: 'User is already suspended',
        });
      }

      user.isSuspended = true;
      user.accountStatus = 'suspended';
      user.suspensionReason = reason || 'No reason provided';
      user.suspensionDate = new Date();

      await user.save();

      // Remove sensitive data from response
      const userData = user.toJSON();

      return res.status(200).json({
        success: true,
        message: `User ${user.name} (${user.email}) has been suspended`,
        data: {
          id: userData._id,
          name: userData.name,
          email: userData.email,
          isSuspended: userData.isSuspended,
          accountStatus: userData.accountStatus,
          suspensionReason: userData.suspensionReason,
          suspensionDate: userData.suspensionDate,
        },
      });
    } catch (error) {
      console.error('Error suspending user:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Unsuspend (Unblock) user
   * PATCH /api/admin/users/:userId/unsuspend
   */
  async unsuspendUser(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (!user.isSuspended) {
        return res.status(400).json({
          success: false,
          message: 'User is not suspended',
        });
      }

      user.isSuspended = false;
      user.accountStatus = 'active';
      user.suspensionReason = null;
      user.suspensionDate = null;

      await user.save();

      return res.status(200).json({
        success: true,
        message: `User ${user.name} (${user.email}) has been unsuspended`,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          isSuspended: user.isSuspended,
          accountStatus: user.accountStatus,
        },
      });
    } catch (error) {
      console.error('Error unsuspending user:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Deactivate user account
   * PATCH /api/admin/users/:userId/deactivate
   */
  async deactivateUser(req, res) {
    try {
      const { userId } = req.params;
      const { reason } = req.body;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (user.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Cannot deactivate an admin user',
        });
      }

      if (user.accountStatus === 'deactivated') {
        return res.status(400).json({
          success: false,
          message: 'User account is already deactivated',
        });
      }

      user.accountStatus = 'deactivated';
      user.isSuspended = true; // Deactivated users are also effectively suspended
      user.suspensionReason = reason || 'Account deactivated by admin';
      user.suspensionDate = new Date();

      await user.save();

      return res.status(200).json({
        success: true,
        message: `User ${user.name} (${user.email}) has been deactivated`,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          accountStatus: user.accountStatus,
        },
      });
    } catch (error) {
      console.error('Error deactivating user:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Reactivate user account
   * PATCH /api/admin/users/:userId/reactivate
   */
  async reactivateUser(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (user.accountStatus !== 'deactivated') {
        return res.status(400).json({
          success: false,
          message: 'User account is not deactivated',
        });
      }

      user.accountStatus = 'active';
      user.isSuspended = false;
      user.suspensionReason = null;
      user.suspensionDate = null;

      await user.save();

      return res.status(200).json({
        success: true,
        message: `User ${user.name} (${user.email}) has been reactivated`,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          accountStatus: user.accountStatus,
          isSuspended: user.isSuspended,
        },
      });
    } catch (error) {
      console.error('Error reactivating user:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Delete user (soft delete - set as deactivated)
   * DELETE /api/admin/users/:userId
   */
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (user.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete an admin user',
        });
      }

      // Soft delete - mark as deactivated
      user.accountStatus = 'deactivated';
      user.isSuspended = true;
      user.suspensionReason = 'Account deleted by admin';
      user.suspensionDate = new Date();
      
      // Anonymize email to free it up
      user.email = `deleted_${user._id}_${Date.now()}@deleted.user`;
      
      await user.save();

      return res.status(200).json({
        success: true,
        message: `User account has been deleted`,
        data: {
          id: user._id,
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get all suspended/blocked users
   * GET /api/admin/users/suspended
   */
  async getSuspendedUsers(req, res) {
    try {
      const users = await User.find({ isSuspended: true })
        .select('-password -passwordResetTokenHash -currentRefreshToken')
        .sort({ suspensionDate: -1 });

      return res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      console.error('Error fetching suspended users:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get all deactivated users
   * GET /api/admin/users/deactivated
   */
  async getDeactivatedUsers(req, res) {
    try {
      const users = await User.find({ accountStatus: 'deactivated' })
        .select('-password -passwordResetTokenHash -currentRefreshToken')
        .sort({ updatedAt: -1 });

      return res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      console.error('Error fetching deactivated users:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AdminUserController();