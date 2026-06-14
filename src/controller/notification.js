const Notification = require('../models/notification');

class NotificationController {
  async getMyNotifications(req, res) {
    try {
      const notifications = await Notification.find({
        userId: req.user._id,
        isDeleted: false,
      }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: notifications.length,
        data: notifications,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
      });
    }
  }

  async markAsRead(req, res) {
    try {
      const notification = await Notification.findById(
        req.params.notificationId
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }

      notification.isRead = true;

      await notification.save();

      return res.status(200).json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update notification',
      });
    }
  }

  async markAllAsRead(req, res) {
    try {
      await Notification.updateMany(
        {
          userId: req.user._id,
          isRead: false,
        },
        {
          isRead: true,
        }
      );

      return res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update notifications',
      });
    }
  }

  async deleteNotification(req, res) {
    try {
      const notification = await Notification.findById(
        req.params.notificationId
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }

      notification.isDeleted = true;
      notification.deletedAt = new Date();

      await notification.save();

      return res.status(200).json({
        success: true,
        message: 'Notification deleted',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete notification',
      });
    }
  }
}

module.exports = new NotificationController();
