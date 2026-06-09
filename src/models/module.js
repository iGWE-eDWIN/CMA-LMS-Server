const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema(
  {
    // =====================
    // RELATION
    // =====================
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },

    // =====================
    // BASIC INFO
    // =====================
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: String,

    // =====================
    // ORDERING SYSTEM (FIXED FOR SCALE)
    // =====================
    orderIndex: {
      type: Number,
      required: true,
      index: true,
    },

    // =====================
    // AGGREGATED METRICS (READ-OPTIMIZED)
    // =====================
    stats: {
      totalLessons: {
        type: Number,
        default: 0,
      },

      totalDuration: {
        type: Number, // minutes
        default: 0,
      },
    },

    // =====================
    // STATUS
    // =====================
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },

    // =====================
    // SOFT DELETE (IMPORTANT FOR LMS)
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

// Fast course module loading (MOST IMPORTANT)
moduleSchema.index({ courseId: 1, orderIndex: 1 });

// Published modules only
moduleSchema.index({ courseId: 1, isPublished: 1 });

// Admin filtering
moduleSchema.index({ isDeleted: 1 });

/* =====================
   METHODS
===================== */

// Update lesson stats safely
moduleSchema.methods.updateStats = function (lessonCount, duration) {
  this.stats.totalLessons = lessonCount;
  this.stats.totalDuration = duration;
};

// Soft delete module
moduleSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
};

module.exports = mongoose.model('Module', moduleSchema);