// const express = require('express');
// const router = express.Router();
// const courseController = require('../controller/course');
// const {
//     auth,
//     adminOnly,
// } = require('../middleware/auth')


// // Admin only
// router.post(
//   '/api/course',
//   auth,
//   adminOnly,
//   courseController.createCourse        
// );

// router.put(
//   '/api/course/:courseId',
//   auth,
//   adminOnly,
//   courseController.updateCourse
// );

// router.patch(
//   '/api/course/:courseId/publish',
//   auth,
//   adminOnly,
//   courseController.publishCourse
// );

// router.patch(
//   '/api/course/:courseId/assign-instructor',
//   auth,
//   adminOnly,
//   courseController.assignInstructor
// );

// router.patch(
//   '/api/course/:courseId/archive',
//   auth,
//   adminOnly,
//   courseController.archiveCourse
// );

// router.delete(
//   '/api/course/:courseId',
//   auth,
//   adminOnly,
//   courseController.deleteCourse
// );

// // Public
// router.get('/api/course', auth, courseController.getCourses);
// router.get('/api/course/:courseId', auth, courseController.getCourse);

// module.exports = router;



// courseRoutes.js

const express = require('express');
const router = express.Router();
const courseController = require('../controller/course');
const { auth, adminOnly } = require('../middleware/auth');

// ============ ADMIN ONLY ============
// Create course
router.post('/api/course', auth, adminOnly, courseController.createCourse);

// Update course
router.put('/api/course/:courseId', auth, adminOnly, courseController.updateCourse);

// Publish course
router.patch('/api/course/:courseId/publish', auth, adminOnly, courseController.publishCourse);

// Unpublish course (NEW)
router.patch('/api/course/:courseId/unpublish', auth, adminOnly, courseController.unpublishCourse);

// Assign instructor
router.patch('/api/course/:courseId/assign-instructor', auth, adminOnly, courseController.assignInstructor);

// Archive course
router.patch('/api/course/:courseId/archive', auth, adminOnly, courseController.archiveCourse);

// Delete course
router.delete('/api/course/:courseId', auth, adminOnly, courseController.deleteCourse);

// Get all instructors (for assignment dropdown) - NEW
router.get('/api/course/instructors', auth, adminOnly, courseController.getInstructors);

// ============ AUTHENTICATED USERS ============
// Get courses (admin gets all, students get published)
router.get('/api/course', auth, courseController.getCourses);

// Get single course
router.get('/api/course/:courseId', auth, courseController.getCourse);

module.exports = router;