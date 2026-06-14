const Assignment = require('../models/assignment');
const LiveClass = require('../models/liveClass');
const Course = require('../models/course');

class AssignmentController {
  async createAssignment(req, res) {
    try {
      const instructorId = req.user._id;

      const {
        liveClassId,
        courseId,
        title,
        description,
        instructions,
        totalMarks,
        passMark,
        dueDate,
      } = req.body;

      const liveClass = await LiveClass.findById(liveClassId);

      if (!liveClass) {
        return res.status(404).json({
          success: false,
          message: 'Live class not found',
        });
      }

      const assignment = await Assignment.create({
        liveClassId,
        courseId,
        instructorId,
        title,
        description,
        instructions,
        totalMarks,
        passMark,
        dueDate,
      });

      return res.status(201).json({
        success: true,
        message: 'Assignment created successfully',
        data: assignment,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Failed to create assignment',
      });
    }
  }

  async updateAssignment(req, res) {
    try {
      const { assignmentId } = req.params;

      const assignment = await Assignment.findByIdAndUpdate(
        assignmentId,
        req.body,
        { new: true }
      );

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: assignment,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update assignment',
      });
    }
  }

  async publishAssignment(req, res) {
    try {
      const { assignmentId } = req.params;

      const assignment = await Assignment.findById(assignmentId);

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found',
        });
      }

      assignment.publish();
      assignment.visibleToStudents = true;

      await assignment.save();

      return res.status(200).json({
        success: true,
        message: 'Assignment published',
        data: assignment,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to publish assignment',
      });
    }
  }

  async closeAssignment(req, res) {
    try {
      const { assignmentId } = req.params;

      const assignment = await Assignment.findById(assignmentId);

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found',
        });
      }

      assignment.close();

      await assignment.save();

      return res.status(200).json({
        success: true,
        message: 'Assignment closed',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to close assignment',
      });
    }
  }

  async getAssignment(req, res) {
    try {
      const { assignmentId } = req.params;

      const assignment = await Assignment.findById(assignmentId);

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: assignment,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch assignment',
      });
    }
  }

  async getLiveClassAssignments(req, res) {
    try {
      const { liveClassId } = req.params;

      const assignments = await Assignment.find({
        liveClassId,
        visibleToStudents: true,
      }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: assignments.length,
        data: assignments,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch assignments',
      });
    }
  }

  async deleteAssignment(req, res) {
    try {
      const { assignmentId } = req.params;

      await Assignment.findByIdAndDelete(assignmentId);

      return res.status(200).json({
        success: true,
        message: 'Assignment deleted',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete assignment',
      });
    }
  }
}

module.exports = new AssignmentController();