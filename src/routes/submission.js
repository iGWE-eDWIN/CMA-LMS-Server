const express = require('express');
const router = express.Router();
const submissionController = require('../controller/submission');
const {
  auth,
  studentOnly,
  instructorOnly,
} = require('../middleware/auth');


router.post(
'/api/submission/:assignmentId',
  auth,
  studentOnly,
  submissionController.submitAssignment
);

router.get(
'/api/submission/my-submissions',
  auth,
  studentOnly,
  submissionController.getMySubmissions
);

router.get(
  '/api/submission/assignment/:assignmentId',
  auth,
  instructorOnly,
  submissionController.getAssignmentSubmissions
);

router.patch(
  '/api/submission/:submissionId/grade',
  auth,
  instructorOnly,
  submissionController.gradeSubmission
);

router.get(
  '/api/submission/:submissionId',
  auth,
  submissionController.getSubmission
);

module.exports = router;