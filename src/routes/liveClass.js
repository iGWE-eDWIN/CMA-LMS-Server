const router = require('express').Router();

const liveClassController = require('../models/liveClass');

const {
  auth,
  instructorOnly,
  studentOnly,
  adminOnly,
} = require('../middleware/auth');


// Insructor
router.post(
  '/',
  auth,
  instructorOnly,
  liveClassController.scheduleLiveClass
);

router.put(
  '/:liveClassId',
  auth,
  instructorOnly,
    liveClassController.updateLiveClass
);

router.patch(
  '/:liveClassId/start',
  auth,
  instructorOnly,
    liveClassController.startLiveClass
);

router.patch(
  '/:liveClassId/end',
  auth,
  instructorOnly,
    liveClassController.endLiveClass
);

router.delete(
  '/:liveClassId',
  auth,
  instructorOnly,
    liveClassController.cancelLiveClass
);

router.get(
  '/instructor',
  auth,
  instructorOnly,
    liveClassController.getInstructorClasses
);

// Students
router.get(
  '/course/:courseId',
  auth,
  studentOnly,
    liveClassController.getCourseLiveClasses
);

router.get(
    '/live-class/:liveClassId',
    auth,
    studentOnly,
    liveClassController.getLiveClass
);
