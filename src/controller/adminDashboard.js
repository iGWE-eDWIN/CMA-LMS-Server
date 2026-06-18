// const User = require('../models/user');
// const Course = require('../models/course');
// const Enrollment = require('../models/enrollment');
// const LiveClass = require('../models/liveClass');
// const Payment = require('../models/payment');

// class AdminDashboardController {
//   async getDashboard(req, res) {
//     try {
//       const [
//         totalUsers,
//         totalStudents,
//         totalInstructors,
//         totalCourses,
//         totalEnrollments,
//         totalLiveClasses,
//         blockedUsers,
//       ] = await Promise.all([
//         User.countDocuments(),
//         User.countDocuments({ role: 'student' }),
//         User.countDocuments({ role: 'instructor' }),
//         Course.countDocuments(),
//         Enrollment.countDocuments(),
//         LiveClass.countDocuments(),
//         User.countDocuments({ isSuspended: true }),
//       ]);

//       const revenue = await Payment.aggregate([
//         {
//           $match: {
//             status: 'completed',
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             total: {
//               $sum: '$amount',
//             },
//           },
//         },
//       ]);

//       const recentPayments = await Payment.find()
//         .populate('userId', 'firstName lastName email name')
//         .sort({ createdAt: -1 })
//         .limit(10);

//       const recentEnrollments = await Enrollment.find()
//         .populate('userId', 'firstName lastName email name')
//         .populate('courseId', 'title')
//         .sort({ createdAt: -1 })
//         .limit(10);

//       const recentCourses = await Course.find()
//         .sort({ createdAt: -1 })
//         .limit(10);

//       // Return data in format expected by frontend
//       return res.status(200).json({
//         success: true,
//         data: {
//           statistics: {
//             totalUsers,
//             totalStudents,
//             totalInstructors,
//             totalCourses,
//             totalEnrollments,
//             totalLiveClasses,
//             totalRevenue: revenue[0]?.total || 0,
//           },
//           blockedUsers,
//           recentPayments,
//           recentEnrollments,
//           recentCourses,
//         },
//         // Frontend compatibility format
//         metrics: {
//           totalStudents,
//           totalInstructors,
//           totalCourses,
//           totalEnrollments,
//           blockedUsers,
//           revenue: {
//             totalRevenue: revenue[0]?.total || 0,
//             pendingRevenue: 0,
//           },
//           liveClasses: {
//             totalClasses: totalLiveClasses,
//             activeClasses: 0,
//           },
//         },
//       });
//     } catch (error) {
//       console.error('Dashboard error:', error);

//       return res.status(500).json({
//         success: false,
//         message: 'Failed to load dashboard',
//       });
//     }
//   }

//   /**
//    * Get revenue analytics
//    * GET /api/admin-dashboard/revenue
//    */
//   async getRevenueAnalytics(req, res) {
//     try {
//       const revenue = await Payment.aggregate([
//         {
//           $match: {
//             status: 'completed',
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             total: { $sum: '$amount' },
//           },
//         },
//       ]);

//       // Monthly breakdown
//       const monthlyRevenue = await Payment.aggregate([
//         {
//           $match: {
//             status: 'completed',
//           },
//         },
//         {
//           $group: {
//             _id: {
//               year: { $year: '$createdAt' },
//               month: { $month: '$createdAt' },
//             },
//             total: { $sum: '$amount' },
//             count: { $sum: 1 },
//           },
//         },
//         {
//           $sort: { '_id.year': -1, '_id.month': -1 },
//         },
//         {
//           $limit: 12,
//         },
//       ]);

//       return res.status(200).json({
//         success: true,
//         data: {
//           totalRevenue: revenue[0]?.total || 0,
//           monthlyRevenue,
//         },
//       });
//     } catch (error) {
//       console.error('Revenue analytics error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to load revenue analytics',
//       });
//     }
//   }

//   /**
//    * Get live classes analytics
//    * GET /api/admin-dashboard/live-classes
//    */
//   async getLiveClassesAnalytics(req, res) {
//     try {
//       const totalClasses = await LiveClass.countDocuments();
//       const activeClasses = await LiveClass.countDocuments({ status: 'live' });
//       const completedClasses = await LiveClass.countDocuments({ status: 'completed' });
//       const cancelledClasses = await LiveClass.countDocuments({ status: 'cancelled' });

//       return res.status(200).json({
//         success: true,
//         data: {
//           totalClasses,
//           activeClasses,
//           completedClasses,
//           cancelledClasses,
//         },
//       });
//     } catch (error) {
//       console.error('Live classes analytics error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to load live classes analytics',
//       });
//     }
//   }

//   /**
//    * Get user statistics
//    * GET /api/admin-dashboard/users
//    */
//   async getUserStats(req, res) {
//     try {
//       const [totalStudents, totalInstructors, blockedUsers, pendingVerification] = await Promise.all([
//         User.countDocuments({ role: 'student' }),
//         User.countDocuments({ role: 'instructor' }),
//         User.countDocuments({ isSuspended: true }),
//         User.countDocuments({ accountStatus: 'pending_verification' }),
//       ]);

//       return res.status(200).json({
//         success: true,
//         data: {
//           totalStudents,
//           totalInstructors,
//           blockedUsers,
//           pendingVerification,
//         },
//       });
//     } catch (error) {
//       console.error('User stats error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to load user statistics',
//       });
//     }
//   }
// }

// module.exports = new AdminDashboardController();

// adminDashboard.js - COMPLETE FIXED VERSION

const User = require('../models/user');
const Course = require('../models/Course');
const Enrollment = require('../models/enrollment');
const LiveClass = require('../models/liveClass');
const Payment = require('../models/payment');

class AdminDashboardController {
  /**
   * Get complete dashboard data
   * GET /api/admin-dashboard
   */
  async getDashboard(req, res) {
    try {
      console.log('📊 Dashboard request received');

      // Test database connection first
      try {
        await User.findOne().limit(1);
        console.log('✅ Database connection OK');
      } catch (dbError) {
        console.error('❌ Database connection failed:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database connection error',
          error: dbError.message,
        });
      }

      // Get all counts in parallel
      const [
        totalUsers,
        totalStudents,
        totalInstructors,
        totalCourses,
        totalEnrollments,
        totalLiveClasses,
        blockedUsers,
        publishedCourses,
        draftCourses,
        archivedCourses,
        pendingVerificationUsers,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'instructor' }),
        Course.countDocuments({ isDeleted: false }),
        Enrollment.countDocuments(),
        LiveClass.countDocuments(),
        User.countDocuments({ isSuspended: true }),
        Course.countDocuments({ status: 'published', isDeleted: false }),
        Course.countDocuments({ status: 'draft', isDeleted: false }),
        Course.countDocuments({ status: 'archived', isDeleted: false }),
        User.countDocuments({ accountStatus: 'pending_verification' }),
      ]);

      console.log('✅ Counts fetched successfully');

      // Revenue aggregation
      let revenue = [{ total: 0 }];
      try {
        revenue = await Payment.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
      } catch (e) {
        console.error('Revenue aggregation error:', e.message);
      }

      // Monthly revenue
      let monthlyRevenue = [];
      try {
        monthlyRevenue = await Payment.aggregate([
          { $match: { status: 'completed' } },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
              },
              total: { $sum: '$amount' },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 12 },
        ]);
      } catch (e) {
        console.error('Monthly revenue error:', e.message);
      }

      // ✅ FIXED: Recent enrollments - using 'name' instead of 'firstName lastName'
      let recentEnrollments = [];
      try {
        recentEnrollments = await Enrollment.find()
          .populate('userId', 'name email avatarUrl') // ✅ Fixed: User model uses 'name'
          .populate('courseId', 'title thumbnail')
          .sort({ createdAt: -1 })
          .limit(10);
        console.log('✅ recentEnrollments:', recentEnrollments.length);
      } catch (e) {
        console.error('Recent enrollments error:', e.message);
      }

      // ✅ FIXED: Recent payments - using 'name' instead of 'firstName lastName'
      let recentPayments = [];
      try {
        recentPayments = await Payment.find()
          .populate('userId', 'name email avatarUrl') // ✅ Fixed: User model uses 'name'
          .sort({ createdAt: -1 })
          .limit(10);
        console.log('✅ recentPayments:', recentPayments.length);
      } catch (e) {
        console.error('Recent payments error:', e.message);
      }

      // ✅ FIXED: Recent courses - using 'User' instead of 'Instructor'
      let recentCourses = [];
      try {
        recentCourses = await Course.find({ isDeleted: false })
          .populate('assignedInstructor', 'name email profileImage') // ✅ Fixed: Using 'User' model
          .populate('createdBy', 'name email')
          .sort({ createdAt: -1 })
          .limit(10);
        console.log('✅ recentCourses:', recentCourses.length);
      } catch (e) {
        console.error('Recent courses error:', e.message);
        console.error('Error details:', e.stack);
      }

      // Live class stats
      let liveClassStats = [];
      try {
        liveClassStats = await LiveClass.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
      } catch (e) {
        console.error('Live class stats error:', e.message);
      }

      const liveClassStatsObj = {
        scheduled: 0,
        live: 0,
        completed: 0,
        cancelled: 0,
      };
      
      liveClassStats.forEach((stat) => {
        if (stat._id && liveClassStatsObj.hasOwnProperty(stat._id)) {
          liveClassStatsObj[stat._id] = stat.count;
        }
      });

      // Category distribution
      let categoryDistribution = [];
      try {
        categoryDistribution = await Course.aggregate([
          { $match: { isDeleted: false, status: 'published' } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]);
      } catch (e) {
        console.error('Category distribution error:', e.message);
      }

      const totalRevenue = revenue[0]?.total || 0;

      return res.status(200).json({
        success: true,
        data: {
          statistics: {
            totalUsers,
            totalStudents,
            totalInstructors,
            totalCourses,
            totalEnrollments,
            totalLiveClasses,
            totalRevenue,
            blockedUsers,
            publishedCourses,
            draftCourses,
            archivedCourses,
            pendingVerificationUsers,
          },
          revenue: {
            total: totalRevenue,
            monthly: monthlyRevenue,
          },
          liveClasses: liveClassStatsObj,
          categoryDistribution,
          recentEnrollments,
          recentPayments,
          recentCourses,
        },
        // Frontend compatibility format
        metrics: {
          totalStudents,
          totalInstructors,
          totalCourses,
          totalEnrollments,
          blockedUsers,
          publishedCourses,
          draftCourses,
          archivedCourses,
          revenue: {
            totalRevenue: totalRevenue,
            pendingRevenue: 0,
          },
          liveClasses: {
            totalClasses: totalLiveClasses,
            activeClasses: liveClassStatsObj.live || 0,
            scheduled: liveClassStatsObj.scheduled || 0,
            completed: liveClassStatsObj.completed || 0,
            cancelled: liveClassStatsObj.cancelled || 0,
          },
          pendingVerificationUsers,
        },
      });

    } catch (error) {
      console.error('❌ Dashboard FATAL error:', error);
      console.error('❌ Error stack:', error.stack);

      return res.status(500).json({
        success: false,
        message: 'Failed to load dashboard',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }

  /**
   * Get revenue analytics
   * GET /api/admin-dashboard/revenue
   */
  async getRevenueAnalytics(req, res) {
    try {
      const [totalRevenue, monthlyRevenue, revenueByCategory] = await Promise.all([
        Payment.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Payment.aggregate([
          { $match: { status: 'completed' } },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
              },
              total: { $sum: '$amount' },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 12 },
        ]),
        Payment.aggregate([
          { $match: { status: 'completed' } },
          {
            $lookup: {
              from: 'enrollments',
              localField: 'enrollmentId',
              foreignField: '_id',
              as: 'enrollment',
            },
          },
          { $unwind: { path: '$enrollment', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'courses',
              localField: 'enrollment.courseId',
              foreignField: '_id',
              as: 'course',
            },
          },
          { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
          {
            $group: {
              _id: '$course.category' || 'unknown',
              total: { $sum: '$amount' },
              count: { $sum: 1 },
            },
          },
          { $sort: { total: -1 } },
          { $limit: 10 },
        ]),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          totalRevenue: totalRevenue[0]?.total || 0,
          monthlyRevenue,
          revenueByCategory,
        },
      });
    } catch (error) {
      console.error('Revenue analytics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to load revenue analytics',
        error: error.message,
      });
    }
  }

  /**
   * Get live classes analytics
   * GET /api/admin-dashboard/live-classes
   */
  async getLiveClassesAnalytics(req, res) {
    try {
      const [totalClasses, statusBreakdown, upcomingClasses, recentClasses] = await Promise.all([
        LiveClass.countDocuments(),
        LiveClass.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        LiveClass.find({
          status: 'scheduled',
          scheduledStartTime: { $gte: new Date() },
          isDeleted: false,
        })
          .populate('courseId', 'title')
          .populate('instructorId', 'name email')
          .sort({ scheduledStartTime: 1 })
          .limit(5),
        LiveClass.find({
          isDeleted: false,
        })
          .populate('courseId', 'title')
          .populate('instructorId', 'name email')
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

      const stats = {
        scheduled: 0,
        live: 0,
        completed: 0,
        cancelled: 0,
      };
      
      statusBreakdown.forEach((stat) => {
        if (stat._id && stats.hasOwnProperty(stat._id)) {
          stats[stat._id] = stat.count;
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          totalClasses,
          stats,
          upcomingClasses,
          recentClasses,
        },
      });
    } catch (error) {
      console.error('Live classes analytics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to load live classes analytics',
        error: error.message,
      });
    }
  }

  /**
   * Get user statistics
   * GET /api/admin-dashboard/users
   */
  async getUserStats(req, res) {
    try {
      const [
        totalUsers,
        totalStudents,
        totalInstructors,
        blockedUsers,
        pendingVerification,
        activeUsers,
        deactivatedUsers,
        monthlySignups,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'instructor' }),
        User.countDocuments({ isSuspended: true }),
        User.countDocuments({ accountStatus: 'pending_verification' }),
        User.countDocuments({ accountStatus: 'active', isSuspended: false }),
        User.countDocuments({ accountStatus: 'deactivated' }),
        User.aggregate([
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 12 },
        ]),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          totalUsers,
          totalStudents,
          totalInstructors,
          blockedUsers,
          pendingVerification,
          activeUsers,
          deactivatedUsers,
          monthlySignups,
        },
      });
    } catch (error) {
      console.error('User stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to load user statistics',
        error: error.message,
      });
    }
  }

  /**
   * Get course statistics
   * GET /api/admin-dashboard/courses
   */
  async getCourseStats(req, res) {
    try {
      const [
        totalCourses,
        publishedCourses,
        draftCourses,
        archivedCourses,
        categoryDistribution,
        levelDistribution,
      ] = await Promise.all([
        Course.countDocuments({ isDeleted: false }),
        Course.countDocuments({ status: 'published', isDeleted: false }),
        Course.countDocuments({ status: 'draft', isDeleted: false }),
        Course.countDocuments({ status: 'archived', isDeleted: false }),
        Course.aggregate([
          { $match: { isDeleted: false, status: 'published' } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Course.aggregate([
          { $match: { isDeleted: false, status: 'published' } },
          { $group: { _id: '$level', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          totalCourses,
          publishedCourses,
          draftCourses,
          archivedCourses,
          categoryDistribution,
          levelDistribution,
        },
      });
    } catch (error) {
      console.error('Course stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to load course statistics',
        error: error.message,
      });
    }
  }
}

module.exports = new AdminDashboardController();