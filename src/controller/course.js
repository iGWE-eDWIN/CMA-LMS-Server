const Course = require('../models/Course');
const Instructor = require('../models/Instructor');

class CourseController {
  /**
   * Admin creates course
   */
  async createCourse(req, res) {
    try {
      const {
        title,
        description,
        detailedDescription,
        category,
        subcategory,
        assignedInstructor,
        thumbnail,
        coverImage,
        level,
        language,
        duration,
        price,
        isFree,
        tags,
        keywords,
        prerequisites,
        learningOutcomes,
        targetAudience,
      } = req.body;

      const instructor = await Instructor.findById(
        assignedInstructor
      );

      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: 'Instructor not found',
        });
      }

      const existingCourse = await Course.findOne({
        title,
      });

      if (existingCourse) {
        return res.status(400).json({
          success: false,
          message: 'Course already exists',
        });
      }

      const course = await Course.create({
        title,
        description,
        detailedDescription,
        category,
        subcategory,
        assignedInstructor,
        thumbnail,
        coverImage,
        level,
        language,
        duration,
        price,
        isFree,
        tags,
        keywords,
        prerequisites,
        learningOutcomes,
        targetAudience,
      });

      return res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course,
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
   * Get all published courses
   */
  async getCourses(req, res) {
    try {
      const courses = await Course.find({
        status: 'published',
        isDeleted: false,
      })
        .populate(
          'assignedInstructor',
          'firstName lastName profileImage'
        )
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: courses.length,
        data: courses,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get single course
   */
  async getCourse(req, res) {
    try {
      const course = await Course.findById(
        req.params.courseId
      ).populate(
        'assignedInstructor',
        'firstName lastName profileImage bio'
      );

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: course,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Update course
   */
  async updateCourse(req, res) {
    try {
      const course = await Course.findByIdAndUpdate(
        req.params.courseId,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        data: course,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Publish course
   */
  async publishCourse(req, res) {
    try {
      const course = await Course.findById(
        req.params.courseId
      );

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      course.status = 'published';
      course.isApproved = true;
      course.publishedAt = new Date();

      await course.save();

      return res.status(200).json({
        success: true,
        message: 'Course published successfully',
        data: course,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Assign instructor
   */
  async assignInstructor(req, res) {
    try {
      const { instructorId } = req.body;

      const course = await Course.findById(
        req.params.courseId
      );

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      const instructor = await Instructor.findById(
        instructorId
      );

      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: 'Instructor not found',
        });
      }

      course.assignedInstructor = instructorId;

      await course.save();

      return res.status(200).json({
        success: true,
        message: 'Instructor assigned successfully',
        data: course,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Archive course
   */
  async archiveCourse(req, res) {
    try {
      const course = await Course.findById(
        req.params.courseId
      );

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      course.status = 'archived';

      await course.save();

      return res.status(200).json({
        success: true,
        message: 'Course archived successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Delete course
   */
  async deleteCourse(req, res) {
    try {
      const course = await Course.findById(
        req.params.courseId
      );

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      course.isDeleted = true;
      course.deletedAt = new Date();

      await course.save();

      return res.status(200).json({
        success: true,
        message: 'Course deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new CourseController();