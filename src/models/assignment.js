const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },

    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instructor',
      required: true,
    },

    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    instructions: {
      type: String,
    },

    // Assignment Type (VERY IMPORTANT for LMS scaling)
    type: {
      type: String,
      enum: ['file', 'text', 'quiz', 'project', 'coding'],
      default: 'file',
    },

    attachments: [
      {
        filename: String,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    totalMarks: {
      type: Number,
      required: true,
      default: 100,
    },

    passMark: {
      type: Number,
      default: 50,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    allowLateSubmission: {
      type: Boolean,
      default: false,
    },

    submissionType: {
      type: String,
      enum: ['file', 'text', 'both'],
      default: 'file',
    },

    maxFileSize: {
      type: Number,
      default: 10, // MB
    },

    allowedFileTypes: [String],

    // Submissions
    totalSubmissions: {
  type: Number,
  default: 0,
},

    totalSubmissions: {
      type: Number,
      default: 0,
    },

    gradedSubmissions: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'draft',
    },

    publishedAt: Date,

    closedAt: Date,

    // Analytics (VERY useful for admin dashboard)
    averageScore: {
      type: Number,
      default: 0,
    },

    highestScore: {
      type: Number,
      default: 0,
    },

    lowestScore: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
assignmentSchema.index({ courseId: 1 });
assignmentSchema.index({ lessonId: 1 });
assignmentSchema.index({ instructorId: 1 });
assignmentSchema.index({ status: 1 });
assignmentSchema.index({ dueDate: 1 });

// Methods

assignmentSchema.methods.publish = function () {
  this.status = 'published';
  this.publishedAt = new Date();
};

assignmentSchema.methods.close = function () {
  this.status = 'closed';
  this.closedAt = new Date();
};

assignmentSchema.methods.updateStats = function (scores = []) {
  if (!scores.length) return;

  this.averageScore =
    scores.reduce((a, b) => a + b, 0) / scores.length;

  this.highestScore = Math.max(...scores);
  this.lowestScore = Math.min(...scores);
};

module.exports = mongoose.model('Assignment', assignmentSchema);