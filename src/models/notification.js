const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // =====================
    // USER
    // =====================
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // =====================
    // FLEXIBLE TYPE SYSTEM (SCALABLE FIX)
    // =====================
    type: {
      type: String,
      required: true,
      index: true,
    },

    category: {
      type: String,
      enum: [
        'academic',
        'payment',
        'system',
        'social',
        'security',
        'announcement',
      ],
      index: true,
    },

    // =====================
    // CONTENT
    // =====================
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
    },

    description: String,

    // =====================
    // RELATIONS
    // =====================
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },

    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
    },

    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // =====================
    // DELIVERY STATUS (SCALABLE FIX)
    // =====================
    delivery: {
      push: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
      },

      email: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
      },

      // sms: {
      //   sent: { type: Boolean, default: false },
      //   sentAt: Date,
      // },
    },

    // =====================
    // READ SYSTEM (FIXED FOR MULTI-DEVICE)
    // =====================
    

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    // =====================
    // PRIORITY SYSTEM
    // =====================
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      index: true,
    },

    // =====================
    // ACTION SYSTEM (SCALABLE FIX)
    // =====================
    action: {
      url: String,
      type: String,
      payload: mongoose.Schema.Types.Mixed,
    },

   

    // =====================
    // EXPIRATION (PREVENT DB GROWTH)
    // =====================
    expiresAt: {
      type: Date,
      index: { expires: 0 }, // TTL index
    },

    // =====================
    // SOFT DELETE
    // =====================
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

/* =====================
   SCALABILITY INDEXES
===================== */

// Fast user notification feed (MOST IMPORTANT)
notificationSchema.index({ userId: 1, createdAt: -1 });

// Unread notifications
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// Type filtering (analytics/admin)
notificationSchema.index({ type: 1, createdAt: -1 });

// Grouped notifications (performance optimization)
notificationSchema.index({ userId: 1, groupId: 1 });

/* =====================
   METHODS
===================== */

// Mark as read
notificationSchema.methods.markAsRead = function (deviceId) {
  this.isRead = true;

  this.readBy.push({
    deviceId,
    readAt: new Date(),
  });
};

// Mark delivery status
notificationSchema.methods.markDelivered = function (channel) {
  if (this.delivery[channel]) {
    this.delivery[channel].sent = true;
    this.delivery[channel].sentAt = new Date();
  }
};

// Soft delete
notificationSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
};

module.exports = mongoose.model('Notification', notificationSchema);