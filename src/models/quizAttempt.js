const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true,
  index: true,
},

studentId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Student',
  required: true,
  index: true,
},
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true,
    },

   
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
attemptNumber: {
  type: Number,
  default: 1,
},
timeSpentSeconds: {
  type: Number,
  default: 0,
},

    score: Number,

    totalMarks: Number,

    percentage: Number,

    passed: Boolean,

    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
        },
        answer: String,
        isCorrect: Boolean,
        marksAwarded: Number,
      },
    ],

    startedAt: Date,

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

/**
 * 🔥 IMPORTANT INDEXES
 */
quizAttemptSchema.index(
  {
    quizId: 1,
    studentId: 1,
    attemptNumber: 1,
  },
  { unique: true }
);


quizAttemptSchema.index({
  studentId: 1,
  submittedAt: -1,
});

quizAttemptSchema.index({
  quizId: 1,
  submittedAt: -1,
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);