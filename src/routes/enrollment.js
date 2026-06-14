const express = require('express');
const router = express.Router();
const enrollmentController = require('../controller/enrollment')
const {
  auth,
  adminOnly,
  studentOnly,
} = require('../middleware/auth');


// Student
router.get(
    '/api/enrollments/my-courses',
    auth,
    studentOnly,
    enrollmentController.getMyEnrollments
);

router.get(
    '/api/enrollments/:enrollmentId',
    auth,
    enrollmentController.getEnrollment
);

router.get(
    '/api/enrollments/course/:courseId',
    auth,
    adminOnly,
    enrollmentController.getCourseEnrollments
);

router.get(
    '/api/enrollments/',
    auth,
    adminOnly,
    enrollmentController.getAllEnrollments
)

router.patch(
  '/api/enrollments/:id/complete',
  auth,
  adminOnly,
  enrollmentController.completeEnrollment
);
module.exports = router;