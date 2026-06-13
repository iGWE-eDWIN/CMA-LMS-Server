const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const studentSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // Academic Info
    currentLevel: String,

    fieldOfStudy: String,

    institution: String,

    // Wallet Reference
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
    },

    // Enrolled Courses
   coursesEnrolled: [
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },

    enrolledAt: {
      type: Date,
      default: Date.now,
    },

    progressPercentage: {
      type: Number,
      default: 0,
    },

    completedLessons: [
      {
        type: Schema.Types.ObjectId,
      },
    ],

    completedModules: [
      {
        type: Schema.Types.ObjectId,
      },
    ],

    status: {
      type: String,
      enum: [
        'active',
        'completed',
        'cancelled',
      ],
      default: 'active',
    },

    completionDate: Date,
  }
],

purchasedCourses: [
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },

    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },

    purchasedAt: {
      type: Date,
      default: Date.now,
    },
  },
],

upcomingClasses: [
  {
    type: Schema.Types.ObjectId,
    ref: 'LiveClass',
  },
],

    // Wishlist
    wishlistCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],

    // Certificates
    certificates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Certificate',
      },
    ],

    

    // Preferences
    preferredLearningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'reading', 'kinesthetic'],
      default: 'visual',
    },

    language: {
      type: String,
      default: 'en',
    },

    timezone: String,

    notificationPreferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },

      pushNotifications: {
        type: Boolean,
        default: true,
      },

      smsNotifications: {
        type: Boolean,
        default: false,
      },
    },

    // Learning Stats
    certificatesEarned: {
      type: Number,
      default: 0,
    },

    totalCoursesCompleted: {
      type: Number,
      default: 0,
    },

    totalLearningHours: {
      type: Number,
      default: 0,
    },

    learningStreak: {
      type: Number,
      default: 0,
    },

    lastLearningDate: Date,

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
studentSchema.index({ userId: 1 });
studentSchema.index({ walletId: 1 });
studentSchema.index({ 'coursesEnrolled.courseId': 1 });

// Add Course
studentSchema.methods.addEnrolledCourse = function (courseId) {
  const exists = this.coursesEnrolled.some(
    (e) => e.courseId.toString() === courseId.toString()
  );

  if (!exists) {
    this.coursesEnrolled.push({
      courseId,
      enrollmentDate: new Date(),
      status: 'active',
    });
  }
};

// Active Courses
studentSchema.methods.getActiveCourses = function () {
  return this.coursesEnrolled.filter(
    (e) => e.status === 'active'
  );
};

// Completed Courses
studentSchema.methods.getCompletedCourses = function () {
  return this.coursesEnrolled.filter(
    (e) => e.status === 'completed'
  );
};

// Update Progress
studentSchema.methods.updateCourseProgress =
  async function (courseId, progressPercentage) {
    const enrollment = this.coursesEnrolled.find(
      (e) => e.courseId.toString() === courseId.toString()
    );

    if (!enrollment) return;

    enrollment.progressPercentage = progressPercentage;
    enrollment.lastAccessedAt = new Date();

    if (
      progressPercentage >= 100 &&
      enrollment.status !== 'completed'
    ) {
      enrollment.status = 'completed';
      enrollment.completionDate = new Date();
      this.totalCoursesCompleted += 1;
    }

    await this.save();
  };

const Student = model('Student', studentSchema);

module.exports = Student;