const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    // =====================
    // CORE RELATIONS
    // =====================
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
      index: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },

    // =====================
    // CONTENT INFO
    // =====================
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: String,

    lessonType: {
      type: String,
      enum: ['video', 'document', 'quiz', 'assignment', 'live_class'],
      default: 'video',
      index: true,
    },

    // =====================
    // VIDEO (OPTIMIZED STRUCTURE)
    // =====================
    video: {
      url: String,
      duration: Number,
      thumbnail: String,
    },

    // =====================
    // DOCUMENT (OPTIMIZED STRUCTURE)
    // =====================
    document: {
      url: String,
      type: {
        type: String,
        enum: ['pdf', 'doc', 'ppt'],
      },
    },

    // =====================
    // TEXT CONTENT (SCALABILITY FIX)
    // =====================
    content: {
      type: String,
      select: false, // prevent heavy loads unless needed
    },

    // =====================
    // RESOURCES (LIMITED & SAFE)
    // =====================
    resources: {
      type: [
        {
          title: String,
          url: String,
          fileType: String,
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },

    // =====================
    // LEARNING STRUCTURE
    // =====================
    learningObjectives: {
      type: [String],
      default: [],
    },

    attachedQuiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
    },

    attachedAssignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
    },

    // =====================
    // LIVE CLASS
    // =====================
    liveClass: {
      link: String,
      scheduledAt: Date,
    },

    // =====================
    // ORDERING SYSTEM (FIXED FOR SCALE)
    // =====================
    orderIndex: {
      type: Number,
      required: true,
      index: true,
    },

    // =====================
    // STATUS
    // =====================
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },

    isFree: {
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

// Fast module lesson loading (MOST IMPORTANT)
lessonSchema.index({ moduleId: 1, orderIndex: 1 });

// Course-wide lesson lookup
lessonSchema.index({ courseId: 1, orderIndex: 1 });

// Filtering published lessons fast
lessonSchema.index({ isPublished: 1, isDeleted: 1 });

// Type-based filtering (video/doc/quiz)
lessonSchema.index({ lessonType: 1 });

/* =====================
   METHODS
===================== */

// Soft delete lesson
lessonSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
};

// Reorder lesson safely
lessonSchema.methods.updateOrder = function (newIndex) {
  this.orderIndex = newIndex;
};

module.exports = mongoose.model('Lesson', lessonSchema);