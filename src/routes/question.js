const express = require('express');
const router = express.Router();
const QuestionController = require('../controller/question');
const {
      auth,
  instructorOnly,
} = require('../middleware/auth');



/**
 * =========================
 * INSTRUCTOR
 * =========================
 */

// Add Question
router.post(
  '/api/question/',
  auth,
  instructorOnly,
  QuestionController.createQuestion
);

// Update Question
router.put(
  '/api/question/:questionId',
  auth,
  instructorOnly,
  QuestionController.updateQuestion
);

// Delete Question
router.delete(
  '/api/question/:questionId',
  auth,
  instructorOnly,
  QuestionController.deleteQuestion
);

/**
 * =========================
 * GET QUESTIONS
 * =========================
 */

// Get Quiz Questions
router.get(
  '/api/question/quiz/:quizId',
  auth,
  QuestionController.getQuizQuestions
);

// Get Single Question
router.get(
  '/api/question/:questionId',
  auth,
  QuestionController.getQuestion
);

module.exports = router;


