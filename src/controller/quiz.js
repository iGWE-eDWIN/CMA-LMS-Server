const Quiz = require('../models/quiz');
const Couse = require('../models/course')
const QuizAttempt = require('../models/quizAttempt');
const Enrollment = require('../models/enrollment');


class QuizController {

  async createQuiz(req, res) {
    try {
      const {
        courseId,
        title,
        description,
        totalMarks,
        passingMarks,
        duration,
        quizType,
        attemptLimit,
      } = req.body;

      const course = await Course.findById(courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      const quiz = await Quiz.create({
        courseId,
        instructorId: req.user._id,
        title,
        description,
        totalMarks,
        passingMarks,
        duration,
        quizType,
        attemptLimit,
      });

      res.status(201).json({
        success: true,
        data: quiz,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateQuiz(req, res) {
    try {
      const quiz = await Quiz.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found',
        });
      }

      res.json({
        success: true,
        data: quiz,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async publishQuiz(req, res) {
    try {
      const quiz = await Quiz.findById(req.params.id);

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found',
        });
      }

      quiz.isPublished = true;

      await quiz.save();

      res.json({
        success: true,
        message: 'Quiz published',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteQuiz(req, res) {
    try {
      await Quiz.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: 'Quiz deleted',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getQuiz(req, res) {
    try {
      const quiz = await Quiz.findById(req.params.id);

      res.json({
        success: true,
        data: quiz,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCourseQuizzes(req, res) {
    try {
      const quizzes = await Quiz.find({
        courseId: req.params.courseId,
        isPublished: true,
      });

      res.json({
        success: true,
        count: quizzes.length,
        data: quizzes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async submitQuiz(req, res) {
    try {
      const { quizId } = req.params;
      const { answers } = req.body;

      const userId = req.user._id;

      const quiz = await Quiz.findById(quizId);

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found',
        });
      }

      const enrollment = await Enrollment.findOne({
        userId,
        courseId: quiz.courseId,
        status: 'active',
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You are not enrolled in this course',
        });
      }

      const questions = await Question.find({
        quizId,
      });

      let score = 0;

      const gradedAnswers = [];

      for (const question of questions) {
        const submittedAnswer = answers.find(
          a =>
            a.questionId.toString() ===
            question._id.toString()
        );

        const isCorrect =
          submittedAnswer?.answer ===
          question.correctAnswer;

        const marksAwarded = isCorrect
          ? question.marks
          : 0;

        score += marksAwarded;

        gradedAnswers.push({
          questionId: question._id,
          answer: submittedAnswer?.answer || '',
          isCorrect,
          marksAwarded,
        });
      }

      const totalMarks = questions.reduce(
        (sum, q) => sum + q.marks,
        0
      );

      const percentage =
        totalMarks > 0
          ? (score / totalMarks) * 100
          : 0;

      const passed =
        percentage >= quiz.passingMarks;

      const previousAttempts =
        await QuizAttempt.countDocuments({
          quizId,
          userId,
        });

      const attempt =
        await QuizAttempt.create({
          quizId,
          courseId: quiz.courseId,
          userId,
          attemptNumber:
            previousAttempts + 1,
          score,
          totalMarks,
          percentage,
          passed,
          answers: gradedAnswers,
          startedAt: new Date(),
          submittedAt: new Date(),
        });

      return res.status(201).json({
        success: true,
        message: 'Quiz submitted successfully',
        data: attempt,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Failed to submit quiz',
      });
    }
  }

  async getQuizResult(req, res) {
    try {
      const { attemptId } = req.params;

      const attempt =
        await QuizAttempt.findById(attemptId)
          .populate('quizId')
          .populate('answers.questionId');

      if (!attempt) {
        return res.status(404).json({
          success: false,
          message: 'Attempt not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: attempt,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch result',
      });
    }
  }
}

module.exports = new QuizController();