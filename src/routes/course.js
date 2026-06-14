const express = require('express');
const router = express.Router();
const courseController = require('../controller/course');
const {
    auth,
    adminOnly,
} = require('../middleware/auth')


// Admin only
router.post(
  '/api/course',
  auth,
  adminOnly,
  courseController.createCourse        
);

router.put(
  '/api/:courseId',
  auth,
  adminOnly,
  courseController.updateCourse
);

router.patch(
  '/api/:courseId/publish',
  auth,
  adminOnly,
  courseController.publishCourse
);

router.patch(
  '/api/:courseId/assign-instructor',
  auth,
  adminOnly,
  courseController.assignInstructor
);

router.patch(
  '/api/:courseId/archive',
  auth,
  adminOnly,
  courseController.archiveCourse
);

router.delete(
  '/api/:courseId',
  auth,
  adminOnly,
  courseController.deleteCourse
);

// Public
router.get('/api/course', auth, courseController.getCourses);
router.get('/api/:courseId', auth, courseController.getCourse);

module.exports = router;