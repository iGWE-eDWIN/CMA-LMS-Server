const mongoose = require('mongoose');

const liveClassSchema = new mongoose.Schema(
  {
    // =====================
    // RELATIONS
    // =====================
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },

    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instructor',
      required: true,
      index: true,
    },

    // =====================
    // CLASS INFO
    // =====================
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: String,

    // =====================
    // SCHEDULING
    // =====================
    scheduledStartTime: {
      type: Date,
      required: true,
      index: true,
    },

    scheduledEndTime: {
      type: Date,
      required: true,
    },

    actualStartTime: Date,
    actualEndTime: Date,

    duration: Number,

    // =====================
    // MEETING DATA (SCALABLE STRUCTURE)
    // =====================
    meeting: {
      link: {
        type: String,
        required: true,
      },
      meetingId: String,
      password: String,
    },

    // =====================
    // STATUS
    // =====================
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },

    cancellationReason: String,
    cancelledAt: Date,

    // =====================
    // ATTENDANCE (SCALABILITY FIX 🔥 REMOVED ARRAY EXPLOSION)
    // =====================
    totalAttendees: {
      type: Number,
      default: 0,
    },

    uniqueAttendees: {
      type: Number,
      default: 0,
    },

    // =====================
    // RECORDING
    // =====================
    recording: {
      isRecorded: {
        type: Boolean,
        default: false,
      },
      url: String,
      duration: Number,
    },

    // =====================
    // SESSION CONTENT
    // =====================
    topics: {
      type: [String],
      default: [],
    },

    resources: {
      type: [
        {
          title: String,
          url: String,
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },

    announcement: String,

    // =====================
    // CAPACITY
    // =====================
    maxCapacity: {
      type: Number,
      default: null,
    },

    // =====================
    // NOTIFICATIONS (FIXED)
    // =====================
    notifications: {
      sent: {
        type: Boolean,
        default: false,
      },
      sentAt: Date,
      retryCount: {
        type: Number,
        default: 0,
      },
    },

    // =====================
    // SOFT DELETE (IMPORTANT FOR SCALE)
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

// Instructor schedule view (MOST USED QUERY)
liveClassSchema.index({ instructorId: 1, scheduledStartTime: -1 });

// Course live sessions
liveClassSchema.index({ courseId: 1, scheduledStartTime: -1 });

// Dashboard filtering
liveClassSchema.index({ status: 1, scheduledStartTime: 1 });

// Upcoming sessions query (VERY IMPORTANT)
liveClassSchema.index({ scheduledStartTime: 1, status: 1 });

/* =====================
   METHODS
===================== */

// Start class
liveClassSchema.methods.startClass = function () {
  this.status = 'live';
  this.actualStartTime = new Date();
};

// End class
liveClassSchema.methods.endClass = function () {
  this.status = 'completed';
  this.actualEndTime = new Date();

  if (this.actualStartTime) {
    this.duration = Math.floor(
      (this.actualEndTime - this.actualStartTime) / 60000
    );
  }
};

// Mark notification sent
liveClassSchema.methods.markNotificationSent = function () {
  this.notifications.sent = true;
  this.notifications.sentAt = new Date();
};

// Retry notification tracking
liveClassSchema.methods.incrementNotificationRetry = function () {
  this.notifications.retryCount += 1;
};

module.exports = mongoose.model('LiveClass', liveClassSchema);