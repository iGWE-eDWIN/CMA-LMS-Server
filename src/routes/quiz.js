const express = require('express');
const router = express.Router();

const QuizController = require('../controller/quiz');

const {
  auth,
  adminOnly,
  instructorOnly,
  studentOnly,
} = require('../middleware/auth');

/**
 * =========================
 * INSTRUCTOR / ADMIN
 * =========================
 */

// Create Quiz
router.post(
  '/api/quiz/',
  auth,
  instructorOnly,
  QuizController.createQuiz
);

// Update Quiz
router.put(
  '/api/quiz/:quizId',
  auth,
  instructorOnly,
  QuizController.updateQuiz
);

// Publish Quiz
router.patch(
  '/api/quiz/:quizId/publish',
  auth,
  instructorOnly,
  QuizController.publishQuiz
);

// Delete Quiz
router.delete(
  '/api/quiz/:quizId',
  auth,
  instructorOnly,
  QuizController.deleteQuiz
);

/**
 * =========================
 * STUDENTS
 * =========================
 */

// Get Course Quizzes
router.get(
  '/api/quiz/course/:courseId',
  auth,
  QuizController.getCourseQuizzes
);

// Get Single Quiz
router.get(
  '/api/quiz/:quizId',
  auth,
  QuizController.getQuiz
);

// Submit Quiz
router.post(
  '/api/quiz/:quizId/submit',
  auth,
  studentOnly,
  QuizController.submitQuiz
);

// Quiz Results
router.get(
  '/api/quiz/attempt/:attemptId/result',
  auth,
  QuizController.getQuizResult
);

module.exports = router;