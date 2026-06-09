const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
      index: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },

    // OPTIONAL: keep for quick user lookup (not required duplication logic)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    submissionText: {
      type: String,
      maxlength: 5000,
    },

    submissionStatus: {
      type: String,
      enum: ['submitted', 'late', 'missing'],
      default: 'submitted',
      index: true,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    submittedLate: {
      type: Boolean,
      default: false,
      index: true,
    },

    hoursLate: Number,

    // GRADING SUMMARY (kept lightweight)
    grading: {
      isGraded: {
        type: Boolean,
        default: false,
        index: true,
      },

      marks: {
        type: Number,
        default: 0,
      },

      maxMarks: Number,

      percentage: {
        type: Number,
        default: 0,
      },

      feedback: {
        type: String,
        maxlength: 5000,
      },

      gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Instructor',
        index: true,
      },

      gradedAt: Date,
    },

    attemptNumber: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

submissionSchema.index(
  { assignmentId: 1, studentId: 1 },
  { unique: true }
);

submissionSchema.index({ courseId: 1, 'grading.isGraded': 1 });
submissionSchema.index({ assignmentId: 1, submittedAt: -1 });
submissionSchema.index({ 'grading.isGraded': 1 });