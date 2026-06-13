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

   estimatedCompletionTime: {
  type: Number,
  default: 0,
},

unlockAfterPreviousModule: {
  type: Boolean,
  default: true,
},

    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: String,

    
    orderIndex: {
      type: Number,
      required: true,
      index: true,
    },

  
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

   
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },

    
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