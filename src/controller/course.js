// const Course = require('../models/Course');
// const Instructor = require('../models/Instructor');

// class CourseController {
//   /**
//    * Admin creates course
//    */
//   async createCourse(req, res) {
//     try {
//       const {
//         title,
//         description,
//         detailedDescription,
//         category,
//         subcategory,
//         assignedInstructor,
//         thumbnail,
//         coverImage,
//         level,
//         language,
//         duration,
//         price,
//         isFree,
//         tags,
//         keywords,
//         prerequisites,
//         learningOutcomes,
//         targetAudience,
//       } = req.body;

//       const instructor = await Instructor.findById(
//         assignedInstructor
//       );

//       if (!instructor) {
//         return res.status(404).json({
//           success: false,
//           message: 'Instructor not found',
//         });
//       }

//       const existingCourse = await Course.findOne({
//         title,
//       });

//       if (existingCourse) {
//         return res.status(400).json({
//           success: false,
//           message: 'Course already exists',
//         });
//       }

//       const course = await Course.create({
//         title,
//         description,
//         detailedDescription,
//         category,
//         subcategory,
//         assignedInstructor,
//         thumbnail,
//         coverImage,
//         level,
//         language,
//         duration,
//         price,
//         isFree,
//         tags,
//         keywords,
//         prerequisites,
//         learningOutcomes,
//         targetAudience,
//       });

//       return res.status(201).json({
//         success: true,
//         message: 'Course created successfully',
//         data: course,
//       });
//     } catch (error) {
//       console.error(error);

//       return res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   }

//   /**
//    * Get all published courses
//    */
//   async getCourses(req, res) {
//     try {
//       const courses = await Course.find({
//         status: 'published',
//         isDeleted: false,
//       })
//         .populate(
//           'assignedInstructor',
//           'firstName lastName profileImage'
//         )
//         .sort({ createdAt: -1 });

//       return res.status(200).json({
//         success: true,
//         count: courses.length,
//         data: courses,
//       });
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   }

//   /**
//    * Get single course
//    */
//   async getCourse(req, res) {
//     try {
//       const course = await Course.findById(
//         req.params.courseId
//       ).populate(
//         'assignedInstructor',
//         'firstName lastName profileImage bio'
//       );

//       if (!course) {
//         return res.status(404).json({
//           success: false,
//           message: 'Course not found',
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         data: course,
//       });
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   }

//   /**
//    * Update course
//    */
//   async updateCourse(req, res) {
//     try {
//       const course = await Course.findByIdAndUpdate(
//         req.params.courseId,
//         req.body,
//         {
//           new: true,
//           runValidators: true,
//         }
//       );

//       if (!course) {
//         return res.status(404).json({
//           success: false,
//           message: 'Course not found',
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         message: 'Course updated successfully',
//         data: course,
//       });
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   }

//   /**
//    * Publish course
//    */
//   async publishCourse(req, res) {
//     try {
//       const course = await Course.findById(
//         req.params.courseId
//       );

//       if (!course) {
//         return res.status(404).json({
//           success: false,
//           message: 'Course not found',
//         });
//       }

//       course.status = 'published';
//       course.isApproved = true;
//       course.publishedAt = new Date();

//       await course.save();

//       return res.status(200).json({
//         success: true,
//         message: 'Course published successfully',
//         data: course,
//       });
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   }

//   /**
//    * Assign instructor
//    */
//   async assignInstructor(req, res) {
//     try {
//       const { instructorId } = req.body;

//       const course = await Course.findById(
//         req.params.courseId
//       );

//       if (!course) {
//         return res.status(404).json({
//           success: false,
//           message: 'Course not found',
//         });
//       }

//       const instructor = await Instructor.findById(
//         instructorId
//       );

//       if (!instructor) {
//         return res.status(404).json({
//           success: false,
//           message: 'Instructor not found',
//         });
//       }

//       course.assignedInstructor = instructorId;

//       await course.save();

//       return res.status(200).json({
//         success: true,
//         message: 'Instructor assigned successfully',
//         data: course,
//       });
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   }

//   /**
//    * Archive course
//    */
//   async archiveCourse(req, res) {
//     try {
//       const course = await Course.findById(
//         req.params.courseId
//       );

//       if (!course) {
//         return res.status(404).json({
//           success: false,
//           message: 'Course not found',
//         });
//       }

//       course.status = 'archived';

//       await course.save();

//       return res.status(200).json({
//         success: true,
//         message: 'Course archived successfully',
//       });
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   }

//   /**
//    * Delete course
//    */
//   async deleteCourse(req, res) {
//     try {
//       const course = await Course.findById(
//         req.params.courseId
//       );

//       if (!course) {
//         return res.status(404).json({
//           success: false,
//           message: 'Course not found',
//         });
//       }

//       course.isDeleted = true;
//       course.deletedAt = new Date();

//       await course.save();

//       return res.status(200).json({
//         success: true,
//         message: 'Course deleted successfully',
//       });
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   }
// }

// module.exports = new CourseController();



// course.js - FIXED

const Course = require('../models/Course');
const User = require('../models/user'); // Change from Instructor to User

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

      // Check if instructor exists (using User model)
      if (assignedInstructor) {
        const instructor = await User.findOne({
          _id: assignedInstructor,
          role: 'instructor',
        });

        if (!instructor) {
          return res.status(404).json({
            success: false,
            message: 'Instructor not found',
          });
        }
      }

      const existingCourse = await Course.findOne({
        title,
        isDeleted: false,
      });

      if (existingCourse) {
        return res.status(400).json({
          success: false,
          message: 'A course with this title already exists',
        });
      }

      // ✅ FIX: Add createdBy from authenticated user
      const course = await Course.create({
        title,
        description,
        detailedDescription,
        category,
        subcategory,
        assignedInstructor: assignedInstructor || null,
        thumbnail,
        coverImage,
        level: level || 'beginner',
        language: language || 'en',
        duration: duration || 0,
        price: price || 0,
        isFree: isFree || !price || price === 0,
        tags: tags || [],
        keywords: keywords || [],
        prerequisites,
        learningOutcomes,
        targetAudience,
        createdBy: req.user._id, // ✅ Add the admin who created the course
        status: 'draft',
      });

      return res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course,
      });
    } catch (error) {
      console.error('Create course error:', error);

      // Handle validation errors
      if (error.name === 'ValidationError') {
        const errors = {};
        for (const field in error.errors) {
          errors[field] = error.errors[field].message;
        }
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }


  /**
   * Get all courses (Admin gets all, Students get published only)
   */
 async getCourses(req, res) {
    try {
      const isAdmin = req.user?.role === 'admin';
      
      let filter = { isDeleted: false };
      
      // If not admin, only show published courses
      if (!isAdmin) {
        filter.status = 'published';
      }

      const courses = await Course.find(filter)
        .populate('assignedInstructor', 'name email profileImage avatarUrl')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });

      // Transform response to match frontend expectations
      const transformedCourses = courses.map(course => {
        const courseObj = course.toObject();
        return {
          ...courseObj,
          instructor: courseObj.assignedInstructor || null,
        };
      });

      return res.status(200).json({
        success: true,
        count: transformedCourses.length,
        data: transformedCourses,
      });
    } catch (error) {
      console.error('Get courses error:', error);
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
      const course = await Course.findById(req.params.courseId)
        .populate('assignedInstructor', 'name email profileImage avatarUrl bio')
        .populate('createdBy', 'name email');

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      // Check if course is published or user is admin/instructor
      if (course.status !== 'published' && req.user?.role !== 'admin') {
        const isInstructor = course.assignedInstructor?._id.toString() === req.user?._id.toString();
        if (!isInstructor) {
          return res.status(403).json({
            success: false,
            message: 'This course is not published yet',
          });
        }
      }

      const courseObj = course.toObject();
      return res.status(200).json({
        success: true,
        data: {
          ...courseObj,
          instructor: courseObj.assignedInstructor || null,
        },
      });
    } catch (error) {
      console.error('Get course error:', error);
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
      const { courseId } = req.params;
      
      const course = await Course.findById(courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      // If updating instructor, verify they exist
      if (req.body.assignedInstructor) {
        const instructor = await User.findOne({
          _id: req.body.assignedInstructor,
          role: 'instructor',
        });
        if (!instructor) {
          return res.status(404).json({
            success: false,
            message: 'Instructor not found',
          });
        }
      }

      const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      ).populate('assignedInstructor', 'name email profileImage')
       .populate('createdBy', 'name email');

      return res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        data: updatedCourse,
      });
    } catch (error) {
      console.error('Update course error:', error);
      
      if (error.name === 'ValidationError') {
        const errors = {};
        for (const field in error.errors) {
          errors[field] = error.errors[field].message;
        }
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }

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
      const course = await Course.findById(req.params.courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      // Check if course has an instructor assigned
      if (!course.assignedInstructor) {
        return res.status(400).json({
          success: false,
          message: 'Cannot publish course without an assigned instructor',
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
      console.error('Publish course error:', error);
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

      const course = await Course.findById(req.params.courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      const instructor = await User.findOne({
        _id: instructorId,
        role: 'instructor',
      });

      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: 'Instructor not found',
        });
      }

      course.assignedInstructor = instructorId;

      // If course was in draft and now has instructor, keep as draft
      // Only auto-publish if desired (we'll let admin manually publish)

      await course.save();

      const updatedCourse = await Course.findById(course._id)
        .populate('assignedInstructor', 'name email');

      return res.status(200).json({
        success: true,
        message: 'Instructor assigned successfully',
        data: updatedCourse,
      });
    } catch (error) {
      console.error('Assign instructor error:', error);
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
      const course = await Course.findById(req.params.courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      if (course.status === 'archived') {
        return res.status(400).json({
          success: false,
          message: 'Course is already archived',
        });
      }

      course.status = 'archived';
      course.archivedAt = new Date();

      await course.save();

      return res.status(200).json({
        success: true,
        message: 'Course archived successfully',
        data: course,
      });
    } catch (error) {
      console.error('Archive course error:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Delete course (soft delete)
   */
  async deleteCourse(req, res) {
    try {
      const course = await Course.findById(req.params.courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      // Soft delete
      course.isDeleted = true;
      course.deletedAt = new Date();
      course.status = 'archived';

      await course.save();

      return res.status(200).json({
        success: true,
        message: 'Course deleted successfully',
      });
    } catch (error) {
      console.error('Delete course error:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get instructor's courses (for dropdown/assignment)
   */
  async getInstructors(req, res) {
    try {
      const instructors = await User.find({
        role: 'instructor',
        isSuspended: false,
        accountStatus: 'active',
      }).select('_id name email profileImage');

      return res.status(200).json({
        success: true,
        count: instructors.length,
        data: instructors,
      });
    } catch (error) {
      console.error('Get instructors error:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Unpublish course (revert to draft)
   */
  async unpublishCourse(req, res) {
    try {
      const course = await Course.findById(req.params.courseId);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      if (course.status !== 'published') {
        return res.status(400).json({
          success: false,
          message: 'Course is not published',
        });
      }

      course.status = 'draft';
      course.isApproved = false;
      course.publishedAt = undefined;

      await course.save();

      return res.status(200).json({
        success: true,
        message: 'Course unpublished successfully',
        data: course,
      });
    } catch (error) {
      console.error('Unpublish course error:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new CourseController();