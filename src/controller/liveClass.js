const LiveClass = require('../models/liveClass');
const Course = require('../models/course');
const Enrollment = require('../models/enrollment')

class LiveClassController {
  /**
   * Schedule Live Class
   * Instructor Only
   */
  async scheduleLiveClass(req, res) {
    try {
      const {
        courseId,
        title,
        description,
        scheduledStartTime,
        scheduledEndTime,
        topics,
        announcement,
      } = req.body;

      const course = await Course.findById(courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      if (
        !course.instructor ||
        course.instructor.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'You are not assigned to this course',
        });
      }

      const liveClass = await LiveClass.create({
        courseId,
        instructorId: req.user._id,
        title,
        description,
        scheduledStartTime,
        scheduledEndTime,
        topics,
        announcement,
      });

      return res.status(201).json({
        success: true,
        message: 'Live class scheduled successfully',
        data: liveClass,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Update Live Class
   * Instructor Only
   */
  async updateLiveClass(req, res) {
    try {
      const { liveClassId } = req.params;

      const liveClass = await LiveClass.findById(liveClassId);

      if (!liveClass) {
        return res.status(404).json({
          success: false,
          message: 'Live class not found',
        });
      }

      if (
        liveClass.instructorId.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      Object.assign(liveClass, req.body);

      await liveClass.save();

      return res.status(200).json({
        success: true,
        message: 'Live class updated successfully',
        data: liveClass,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Cancel Live Class
   */
  async cancelLiveClass(req, res) {
    try {
      const { liveClassId } = req.params;
      const { reason } = req.body;

      const liveClass = await LiveClass.findById(liveClassId);

      if (!liveClass) {
        return res.status(404).json({
          success: false,
          message: 'Live class not found',
        });
      }

      if (
        liveClass.instructorId.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      liveClass.status = 'cancelled';
      liveClass.cancelledAt = new Date();
      liveClass.cancellationReason = reason;

      await liveClass.save();

      return res.status(200).json({
        success: true,
        message: 'Live class cancelled successfully',
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Start Live Class
   */
  async startLiveClass(req, res) {
    try {
      const { liveClassId } = req.params;

      const liveClass = await LiveClass.findById(liveClassId);

      if (!liveClass) {
        return res.status(404).json({
          success: false,
          message: 'Live class not found',
        });
      }

      if (
        liveClass.instructorId.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      liveClass.startClass();

      await liveClass.save();

      return res.status(200).json({
        success: true,
        message: 'Live class started',
        data: liveClass,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * End Live Class
   */
  async endLiveClass(req, res) {
    try {
      const { liveClassId } = req.params;

      const liveClass = await LiveClass.findById(liveClassId);

      if (!liveClass) {
        return res.status(404).json({
          success: false,
          message: 'Live class not found',
        });
      }

      if (
        liveClass.instructorId.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      liveClass.endClass();

      await liveClass.save();

      return res.status(200).json({
        success: true,
        message: 'Live class ended',
        data: liveClass,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Instructor Classes
   */
  async getInstructorClasses(req, res) {
    try {
      const classes = await LiveClass.find({
        instructorId: req.user._id,
        isDeleted: false,
      })
        .populate('courseId', 'title thumbnail')
        .sort({ scheduledStartTime: -1 });

      return res.status(200).json({
        success: true,
        count: classes.length,
        data: classes,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Student Purchased Course Live Classes
   */
  async getCourseLiveClasses(req, res) {
    try {
      const { courseId } = req.params;

      const enrollment =
        await Enrollment.findOne({
          userId: req.user._id,
          courseId,
          status: 'active',
        });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message:
            'You are not enrolled in this course',
        });
      }

      const classes = await LiveClass.find({
        courseId,
        isDeleted: false,
      }).sort({
        scheduledStartTime: 1,
      });

      return res.status(200).json({
        success: true,
        count: classes.length,
        data: classes,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Single Live Class
   */
  async getLiveClass(req, res) {
    try {
      const { liveClassId } = req.params;

      const liveClass =
        await LiveClass.findById(liveClassId)
          .populate('courseId', 'title')
          .populate(
            'instructorId',
            'firstName lastName email'
          );

      if (!liveClass) {
        return res.status(404).json({
          success: false,
          message: 'Live class not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: liveClass,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Admin Dashboard
   */
  async getAllLiveClasses(req, res) {
    try {
      const classes = await LiveClass.find({
        isDeleted: false,
      })
        .populate('courseId', 'title')
        .populate(
          'instructorId',
          'firstName lastName email'
        )
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: classes.length,
        data: classes,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new LiveClassController();