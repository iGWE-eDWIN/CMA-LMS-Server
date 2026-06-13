const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true,
    },

    questionNumber: Number,

    questionType: {
      type: String,
      enum: ['multiple_choice', 'true_false', 'short_answer', 'essay'],
      required: true,
    },

    question: {
      type: String,
      required: true,
    },

    options: {
      type: [String],
      default: undefined,
    },

    correctAnswer: String,

    explanation: {
      type: String,
      maxlength: 2000,
    },

    marks: {
      type: Number,
      default: 1,
    },

    orderIndex: {
   type: Number,
   default: 0
},

questionNumber: {
  type: Number,
  required: true,
},

marks: {
  type: Number,
  default: 1,
},

    imageUrl: String,
  },
  { timestamps: true }
);

/**
 * INDEX FOR FAST QUIZ LOAD
 */

questionSchema.index(
  {
    quizId: 1,
    questionNumber: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model('Question', questionSchema);