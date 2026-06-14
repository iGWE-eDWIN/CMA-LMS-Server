const Enrollment = require('../models/enrollment');
const Course = require('../models/course');

class EnrollmentController {
  /**
   * Student Enrolled Courses
   */
  async getMyEnrollments(req, res) {
    try {
      const enrollments = await Enrollment.find({
        userId: req.user._id,
        status: 'active',
      })
        .populate('courseId')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: enrollments.length,
        data: enrollments,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch enrollments',
      });
    }
  }

  /**
   * Single Enrollment
   */
  async getEnrollment(req, res) {
    try {
      const enrollment = await Enrollment.findById(
        req.params.enrollmentId
      ).populate('courseId');

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: enrollment,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch enrollment',
      });
    }
  }

  /**
   * Admin Course Enrollments
   */
  async getCourseEnrollments(req, res) {
    try {
      const enrollments = await Enrollment.find({
        courseId: req.params.courseId,
      })
        .populate('userId', 'fullName email')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: enrollments.length,
        data: enrollments,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch course enrollments',
      });
    }
  }

  /**
   * Admin All Enrollments
   */
  async getAllEnrollments(req, res) {
    try {
      const enrollments = await Enrollment.find()
        .populate('courseId')
        .populate('userId', 'fullName email')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: enrollments.length,
        data: enrollments,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch enrollments',
      });
    }
  }


  //Admin complete ernrollment
  async completeEnrollment(req, res) {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }

    enrollment.updateProgress(100);

    await enrollment.save();

    return res.status(200).json({
      success: true,
      message: 'Enrollment completed successfully',
      data: enrollment,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Failed to complete enrollment',
    });
  }
}



}

module.exports = new EnrollmentController();