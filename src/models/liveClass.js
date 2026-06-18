// liveClass.js - FIXED EXPORT

const mongoose = require('mongoose');

const liveClassSchema = new mongoose.Schema(
  {
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
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
    durationMinutes: {
      type: Number,
      default: 0,
    },
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    cancellationReason: String,
    cancelledAt: Date,
    recording: {
      isRecorded: { type: Boolean, default: false },
      recordingUrl: String,
      recordingDuration: Number,
    },
    resources: [
      {
        title: String,
        url: String,
      },
    ],
    topics: [String],
    announcement: String,
    reminders: {
      oneDaySent: { type: Boolean, default: false },
      oneHourSent: { type: Boolean, default: false },
      tenMinutesSent: { type: Boolean, default: false },
    },
    accessType: {
      type: String,
      enum: ['paid_students'],
      default: 'paid_students',
    },
    requiresEnrollment: {
      type: Boolean,
      default: true,
    },
    isPublicPreview: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,
  },
  { timestamps: true }
);

// Indexes
liveClassSchema.index({ instructorId: 1, scheduledStartTime: -1 });
liveClassSchema.index({ courseId: 1, scheduledStartTime: -1 });
liveClassSchema.index({ status: 1, scheduledStartTime: 1 });
liveClassSchema.index({ roomId: 1 });
liveClassSchema.index({ isDeleted: 1 });

// Methods
liveClassSchema.methods.startClass = function () {
  this.status = 'live';
  this.actualStartTime = new Date();
};

liveClassSchema.methods.endClass = function () {
  this.status = 'completed';
  this.actualEndTime = new Date();
  if (this.actualStartTime) {
    this.durationMinutes = Math.floor(
      (this.actualEndTime - this.actualStartTime) / 60000
    );
  }
};

liveClassSchema.methods.cancelClass = function (reason) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
};

// ✅ EXPORT THE MODEL (not the controller)
const LiveClass = mongoose.model('LiveClass', liveClassSchema);
module.exports = LiveClass;