const router = require('express').Router();

const liveClassController = require('../controller/liveClass');

const {
  auth,
  instructorOnly,
  studentOnly,
  adminOnly,
} = require('../middleware/auth');


// Insructor
router.post(
  '/api/liveClass',
  auth,
  instructorOnly,
  liveClassController.scheduleLiveClass
);

router.put(
  '/api/liveClass/:liveClassId',
  auth,
  instructorOnly,
    liveClassController.updateLiveClass
);

router.patch(
  '/api/liveClass/:liveClassId/start',
  auth,
  instructorOnly,
    liveClassController.startLiveClass
);

router.patch(
  '/api/liveClass/:liveClassId/end',
  auth,
  instructorOnly,
    liveClassController.endLiveClass
);

router.delete(
  '/api/liveClass/:liveClassId',
  auth,
  instructorOnly,
    liveClassController.cancelLiveClass
);

router.get(
  '/api/liveClass/instructor',
  auth,
  instructorOnly,
    liveClassController.getInstructorClasses
);

// Students
router.get(
  '/api/liveClass/course/:courseId',
  auth,
  studentOnly,
    liveClassController.getCourseLiveClasses
);

router.get(
    '/api/liveClass/:liveClassId',
    auth,
    studentOnly,
    liveClassController.getLiveClass
);


module.exports = router;