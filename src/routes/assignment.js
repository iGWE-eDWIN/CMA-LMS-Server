const express = require('express');
const router = express.Router();
const assignmentController = require('../controller/assignment');
const {
    auth,
    instructorOnly
} = require('../middleware/auth');


router.post(
  '/api/assignment/',
  auth,
  instructorOnly,
  assignmentController.createAssignment
);

router.put(
  '/api/assignment/:assignmentId',
  auth,
  instructorOnly,
  assignmentController.updateAssignment
);

router.patch(
  '/api/assignment/:assignmentId/publish',
  auth,
  instructorOnly,
  assignmentController.publishAssignment
);

router.patch(
  '/api/assignment/:assignmentId/close',
  auth,
  instructorOnly,
  assignmentController.closeAssignment
);

router.delete(
  '/api/assignment/:assignmentId',
  auth,
  instructorOnly,
  assignmentController.deleteAssignment
);

router.get(
  '/api/assignment/live-class/:liveClassId',
  auth,
  assignmentController.getLiveClassAssignments
);

router.get(
  '/api/assignment/:assignmentId',
  auth,
  assignmentController.getAssignment
);

module.exports = router;