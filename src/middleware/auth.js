const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authenticate User
 */
const auth = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required',
      });
    }

    const token = authorization.split(' ')[1];

    let decoded;

    try {
      // ✅ Use JWT_SECRET for access token verification
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    /**
     * Token Revocation Check
     */
    if (
      decoded.tokenVersion !== undefined &&
      decoded.tokenVersion !== user.tokenVersion
    ) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.',
      });
    }

    /**
     * Account Status Checks (Based on your actual User model)
     */
    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Account suspended',
      });
    }

    if (user.accountStatus === 'deactivated') {
      return res.status(403).json({
        success: false,
        message: 'Account deactivated',
      });
    }

    if (user.accountStatus === 'pending_verification') {
      return res.status(403).json({
        success: false,
        message: 'Account pending verification',
      });
    }

    /**
     * Additional check for isSuspended field (your model has both)
     */
    if (user.isSuspended === true) {
      return res.status(403).json({
        success: false,
        message: user.suspensionReason || 'Account has been suspended',
      });
    }

    /**
     * REMOVED: verificationStatus check since it doesn't exist in your model
     * Your model uses accountStatus and isSuspended instead
     */

    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);

    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }
};

/**
 * Role Authorization
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Allowed roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Instructor Verification Middleware
 * Modified to work with your actual model fields
 */
const requireInstructorApproval = (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return next();
  }

  /**
   * Check if instructor account is active and not suspended
   * Your model uses accountStatus and isSuspended instead of verificationStatus
   */
  if (req.user.accountStatus !== 'active') {
    return res.status(403).json({
      success: false,
      message: 'Instructor account is not active',
    });
  }

  if (req.user.isSuspended === true) {
    return res.status(403).json({
      success: false,
      message: req.user.suspensionReason || 'Instructor account is suspended',
    });
  }

  next();
};

/**
 * Admin Only
 */
const adminOnly = authorize('admin');

/**
 * Instructor Only
 */
const instructorOnly = authorize('instructor', 'admin');

/**
 * Student Only
 */
const studentOnly = authorize('student', 'admin');

/**
 * Active Account Check
 */
const requireActiveAccount = (req, res, next) => {
  if (req.user.accountStatus !== 'active') {
    return res.status(403).json({
      success: false,
      message: `Account is ${req.user.accountStatus}. Please contact support.`,
    });
  }
  next();
};

/**
 * Not Suspended Check
 */
const requireNotSuspended = (req, res, next) => {
  if (req.user.isSuspended === true) {
    return res.status(403).json({
      success: false,
      message: req.user.suspensionReason || 'Account has been suspended',
    });
  }
  next();
};

module.exports = {
  auth,
  authorize,
  requireInstructorApproval,
  adminOnly,
  instructorOnly,
  studentOnly,
  requireActiveAccount,
  requireNotSuspended,
};