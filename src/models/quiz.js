const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
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
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      maxlength: 2000,
    },

    totalMarks: {
      type: Number,
      default: 100,
    },

    passingMarks: {
      type: Number,
      default: 50,
    },

    duration: {
      type: Number,
      default: 30,
    },

    quizType: {
      type: String,
      enum: ['practice', 'graded', 'assessment'],
      default: 'practice',
      index: true,
    },

    attemptLimit: {
      type: Number,
      default: -1,
    },

    shuffleQuestions: Boolean,
    shuffleOptions: Boolean,
    showCorrectAnswers: Boolean,
    showResultImmediately: Boolean,

    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ❌ REMOVED:
    // questions
    // attempts array

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

/**
 * 🔥 SCALABLE INDEXES
 */
quizSchema.index({ courseId: 1, isPublished: 1 });
quizSchema.index({ lessonId: 1 });
quizSchema.index({ instructorId: 1, createdAt: -1 });

module.exports = mongoose.model('Quiz', quizSchema);