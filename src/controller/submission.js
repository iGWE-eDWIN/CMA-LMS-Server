const Submission = require('../models/submission');
const Assignment = require('../models/assignment');
const Enrollment = require('../models/enrollment');


class SubmissionController {
  async submitAssignment(req, res) {
    try {
      const userId = req.user._id;

      const { assignmentId } = req.params;

      const {
        submissionText,
      } = req.body;

      const assignment =
        await Assignment.findById(assignmentId);

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found',
        });
      }

      const enrollment = await Enrollment.findOne({
        userId,
        courseId: assignment.courseId,
        status: 'active',
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message:
            'You are not enrolled in this course',
        });
      }

      const existing =
        await Submission.findOne({
          assignmentId,
          userId,
        });

      if (existing) {
        return res.status(400).json({
          success: false,
          message:
            'Assignment already submitted',
        });
      }

      const submission =
        await Submission.create({
          assignmentId,
          userId,
          studentId: enrollment.studentId,
          courseId: assignment.courseId,
          liveClassId: assignment.liveClassId,
          submissionText,
        });

      assignment.totalSubmissions += 1;

      await assignment.save();

      return res.status(201).json({
        success: true,
        message: 'Assignment submitted',
        data: submission,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Submission failed',
      });
    }
  }

  async getMySubmissions(req, res) {
    try {
      const submissions =
        await Submission.find({
          userId: req.user._id,
        }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: submissions.length,
        data: submissions,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          'Failed to fetch submissions',
      });
    }
  }

  async getSubmission(req, res) {
    try {
      const submission =
        await Submission.findById(
          req.params.submissionId
        );

      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: submission,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          'Failed to fetch submission',
      });
    }
  }

  async getAssignmentSubmissions(req, res) {
    try {
      const submissions =
        await Submission.find({
          assignmentId: req.params.assignmentId,
        })
          .populate('userId', 'name email')
          .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: submissions.length,
        data: submissions,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          'Failed to fetch submissions',
      });
    }
  }

  async gradeSubmission(req, res) {
    try {
      const { submissionId } = req.params;

      const {
        marks,
        feedback,
      } = req.body;

      const submission =
        await Submission.findById(submissionId);

      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found',
        });
      }

      submission.grading = {
        isGraded: true,
        marks,
        maxMarks:
          submission.grading.maxMarks || 100,
        percentage:
          (marks /
            (submission.grading.maxMarks || 100)) *
          100,
        feedback,
        gradedBy: req.user._id,
        gradedAt: new Date(),
      };

      await submission.save();

      return res.status(200).json({
        success: true,
        message:
          'Submission graded successfully',
        data: submission,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          'Failed to grade submission',
      });
    }
  }
}

module.exports = new SubmissionController();