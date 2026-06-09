const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const instructorSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // Professional Info
    qualifications: [String],

    expertise: [String],

    yearsOfExperience: Number,

    professionalBio: {
      type: String,
      maxlength: 1000,
    },

    certifications: [
      {
        name: String,
        issuer: String,
        dateObtained: Date,
        certificateUrl: String,
        expiryDate: Date,
      },
    ],

    // Courses
    coursesCreated: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],

    approvedCourses: {
      type: Number,
      default: 0,
    },

    rejectedCourses: {
      type: Number,
      default: 0,
    },

    // Live Classes
    liveClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LiveClass',
      },
    ],

    totalStudents: {
      type: Number,
      default: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalCourseRatings: {
      type: Number,
      default: 0,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    // Wallet
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
    },

    // Banking
    bankAccount: {
      bankName: String,

      accountNumber: String,

      accountHolderName: String,

      swiftCode: String,

      routingNumber: String,

      accountType: {
        type: String,
        enum: ['checking', 'savings'],
        default: 'checking',
      },
    },

    // Instructor Approval
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    verificationDocument: String,

    submittedForVerification: Date,

    verifiedAt: Date,

    verificationNotes: String,

    // Earnings
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },

    pendingEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalWithdrawn: {
      type: Number,
      default: 0,
      min: 0,
    },

    commissionPercentage: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },

    // Withdrawals
    withdrawalRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Withdrawal',
      },
    ],

    // Preferences
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
    },

    // Teaching Stats
    studentSatisfaction: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    responsiveness: {
      type: String,
      enum: [
        'very_responsive',
        'responsive',
        'somewhat_responsive',
        'not_responsive',
      ],
      default: 'responsive',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
instructorSchema.index({ userId: 1 });
instructorSchema.index({ coursesCreated: 1 });
instructorSchema.index({ verificationStatus: 1 });
instructorSchema.index({ averageRating: -1 });

// Add Created Course
instructorSchema.methods.addCreatedCourse = function (courseId) {
  if (!this.coursesCreated.includes(courseId)) {
    this.coursesCreated.push(courseId);
  }
};

// Update Rating
instructorSchema.methods.updateAverageRating = function (newRating) {
  const currentTotal =
    this.averageRating * this.totalCourseRatings;

  this.totalCourseRatings += 1;

  this.averageRating =
    (currentTotal + newRating) /
    this.totalCourseRatings;
};

// Add Earnings
instructorSchema.methods.addEarnings = function (amount) {
  this.totalEarnings += amount;
  this.pendingEarnings += amount;
};

// Process Withdrawal
instructorSchema.methods.processWithdrawal = function (
  amount
) {
  if (this.pendingEarnings >= amount) {
    this.pendingEarnings -= amount;
    this.totalWithdrawn += amount;
    return true;
  }

  return false;
};

const Instructor = model(
  'Instructor',
  instructorSchema
);

module.exports = Instructor;