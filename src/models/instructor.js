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

    assignedCourses: [
  {
    type: Schema.Types.ObjectId,
    ref: 'Course',
  },
],

scheduledClasses: [
  {
    type: Schema.Types.ObjectId,
    ref: 'LiveClass',
  },
],

    // Courses
    // coursesCreated: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Course',
    //   },
    // ],

    // approvedCourses: {
    //   type: Number,
    //   default: 0,
    // },

    // rejectedCourses: {
    //   type: Number,
    //   default: 0,
    // },

    // Live Classes
    // liveClasses: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'LiveClass',
    //   },
    // ],
totalCourses: {
  type: Number,
  default: 0,
},

totalActiveStudents: {
  type: Number,
  default: 0,
},

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

    // Instructor Approval
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },

    verificationDocument: String,

    submittedForVerification: Date,

    verifiedAt: Date,

    verificationNotes: String,

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




// Update Rating
instructorSchema.methods.updateAverageRating = function (newRating) {
  const currentTotal =
    this.averageRating * this.totalCourseRatings;

  this.totalCourseRatings += 1;

  this.averageRating =
    (currentTotal + newRating) /
    this.totalCourseRatings;
};





const Instructor = model(
  'Instructor',
  instructorSchema
);

module.exports = Instructor;