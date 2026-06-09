const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    // =====================
    // CORE RELATIONS (SINGLE SOURCE OF TRUTH)
    // =====================
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

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
    },

    // =====================
    // UNIQUE IDENTIFIERS
    // =====================
    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    verificationCode: {
      type: String,
      unique: true,
      index: true,
    },

    // =====================
    // IMMUTABLE SNAPSHOT (STRUCTURED)
    // =====================
    studentSnapshot: {
      name: String,
      email: String,
    },

    courseSnapshot: {
      title: String,
      level: String,
      duration: Number,
    },

    // =====================
    // COMPLETION DATA
    // =====================
    completionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },

    finalScore: {
      type: Number,
      min: 0,
      max: 100,
    },

    // =====================
    // MEDIA
    // =====================
    certificateUrl: String,

    qrCodeUrl: String,

    badgeUrl: String,

    // =====================
    // STATUS CONTROL
    // =====================
    status: {
      type: String,
      enum: ['issued', 'revoked'],
      default: 'issued',
      index: true,
    },

    revokeReason: String,

    revokeDate: Date,

    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =====================
   SCALABILITY INDEXES
===================== */

// Prevent duplicate certificate per student per course (VERY IMPORTANT 🔥)
certificateSchema.index(
  { userId: 1, courseId: 1 },
  { unique: true }
);

// Fast lookups
certificateSchema.index({ certificateId: 1 });
certificateSchema.index({ verificationCode: 1 });
certificateSchema.index({ status: 1 });
certificateSchema.index({ completionDate: -1 });

/* =====================
   METHODS
===================== */

// Revoke certificate safely
certificateSchema.methods.revoke = function (reason) {
  this.status = 'revoked';
  this.revokeReason = reason;
  this.revokeDate = new Date();
};

// Public verification payload (for QR / API)
certificateSchema.methods.getVerificationPayload = function () {
  return {
    certificateId: this.certificateId,
    userId: this.userId,
    courseId: this.courseId,
    status: this.status,
  };
};

module.exports = mongoose.model('Certificate', certificateSchema);