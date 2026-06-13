const express = require('express');
const router = express.Router();
const courseController = require('../controller/course');
const {
    auth,
    adminOnly,
} = require('../middleware/auth')


// Admin only
router.post(
  '/',
  auth,
  adminOnly,
  courseController.createCourse        
);

router.put(
  '/:courseId',
  auth,
  adminOnly,
  courseController.updateCourse
);

router.patch(
  '/:courseId/publish',
  auth,
  adminOnly,
  courseController.publishCourse
);

router.patch(
  '/:courseId/assign-instructor',
  auth,
  adminOnly,
  courseController.assignInstructor
);

router.patch(
  '/:courseId/archive',
  auth,
  adminOnly,
  courseController.archiveCourse
);

router.delete(
  '/:courseId',
  auth,
  adminOnly,
  courseController.deleteCourse
);

// Public
router.get('/', courseController.getCourses);
router.get('/:courseId', courseController.getCourse);

module.exports = router;