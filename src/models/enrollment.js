const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    // =====================
    // CORE RELATIONS
    // =====================
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },

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
    // ENROLLMENT STATUS
    // =====================
    status: {
      type: String,
      enum: ['active', 'completed', 'dropped', 'suspended'],
      default: 'active',
      index: true,
    },

    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    lastAccessedAt: Date,

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: Date,

    // =====================
    // PAYMENT INFO
    // =====================
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'free'],
      default: 'pending',
      index: true,
    },

    amountPaid: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: 'NGN',
    },

    transactionRef: String,

    // =====================
    // COURSE SNAPSHOT (SAFE HISTORY)
    // =====================
    courseSnapshot: {
      title: String,
      price: Number,
      level: String,
    },

    // =====================
    // CERTIFICATE LINK
    // =====================
    certificateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Certificate',
    },

    certificateIssued: {
      type: Boolean,
      default: false,
    },

    // =====================
    // ANALYTICS
    // =====================
    totalTimeSpent: {
      type: Number, // in minutes
      default: 0,
    },

    lastLessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
    },
  },
  {
    timestamps: true,
  }
);

/* =====================
   SCALABILITY INDEXES
===================== */

// Prevent duplicate enrollment (VERY IMPORTANT 🔥)
enrollmentSchema.index(
  { studentId: 1, courseId: 1 },
  { unique: true }
);

enrollmentSchema.index({ courseId: 1, status: 1 });
enrollmentSchema.index({ studentId: 1, status: 1 });
enrollmentSchema.index({ paymentStatus: 1 });

/* =====================
   METHODS
===================== */

// Update progress safely
enrollmentSchema.methods.updateProgress = function (percentage) {
  this.progressPercentage = Math.min(
    Math.max(percentage, 0),
    100
  );

  this.lastAccessedAt = new Date();

  if (this.progressPercentage === 100) {
    this.status = 'completed';
    this.completedAt = new Date();
  }
};

// Mark payment as completed
enrollmentSchema.methods.markPaid = function (ref, amount) {
  this.paymentStatus = 'paid';
  this.transactionRef = ref;
  this.amountPaid = amount;
};

// Drop course
enrollmentSchema.methods.dropCourse = function () {
  this.status = 'dropped';
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);