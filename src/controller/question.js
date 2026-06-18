const Question = require('../models/question');
const Quiz = require('../models/quiz');

class QuestionController {

  async createQuestion(req, res) {
    try {
      const { quizId } = req.params;

      const quiz = await Quiz.findById(quizId);

      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found',
        });
      }

      const question = await Question.create({
        quizId,
        ...req.body,
      });

      await Quiz.findByIdAndUpdate(
        quizId,
        {
          $inc: { questionCount: 1 },
        }
      );

      res.status(201).json({
        success: true,
        data: question,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateQuestion(req, res) {
    try {
      const question = await Question.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      res.json({
        success: true,
        data: question,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteQuestion(req, res) {
    try {
      const question = await Question.findById(req.params.id);

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found',
        });
      }

      await Question.findByIdAndDelete(req.params.id);

      await Quiz.findByIdAndUpdate(
        question.quizId,
        {
          $inc: { questionCount: -1 },
        }
      );

      res.json({
        success: true,
        message: 'Question deleted',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getQuizQuestions(req, res) {
    try {
      const questions = await Question.find({
        quizId: req.params.quizId,
      }).sort({ questionNumber: 1 });

      res.json({
        success: true,
        data: questions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getQuestion(req, res) {
    try {
      const { questionId } = req.params;

      const question =
        await Question.findById(questionId);

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: question,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch question',
      });
    }
  }
}

module.exports = new QuestionController();

