// const mongoose = require('mongoose');

// const courseSchema = new mongoose.Schema(
//   {
//     // =====================
//     // BASIC INFO
//     // =====================
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 200,
//       index: true,
//     },

//     slug: {
//       type: String,
//       unique: true,
//       lowercase: true,
//       index: true,
//     },

//     description: {
//       type: String,
//       required: true,
//       maxlength: 500,
//     },

//     detailedDescription: {
//       type: String,
//       maxlength: 5000,
//     },

//     category: {
//       type: String,
//       required: true,
//       enum: [
//         'technology',
//         'business',
//         'design',
//         'entrepreneurship',
//         'soft-skills',
//         'other',
//       ],
//       index: true,
//     },

//     subcategory: String,

//     // =====================
//     // MEDIA
//     // =====================
//     thumbnail: String,
//     coverImage: String,

//     // =====================
//     // COURSE INFO
//     // =====================
//     level: {
//       type: String,
//       enum: ['beginner', 'intermediate', 'advanced'],
//       default: 'beginner',
//     },

//     language: {
//       type: String,
//       default: 'en',
//     },

//     duration: {
//       type: Number,
//       default: 0, // hours
//     },

//     // =====================
//     // INSTRUCTOR
//     // =====================
//     assignedInstructor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Instructor',
//       default: null,
//       index: true,
//     },

//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },

//     deliveryType: {
//       type: String,
//       enum: ['self_paced', 'live', 'hybrid'],
//       default: 'self_paced'
//     },

//     certificateEnabled: {
//       type: Boolean,
//       default: true,
//     },

//     timetable: [
//       {
//         liveClassId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: 'LiveClass',
//         },
//         date: Date,
//         title: String,
//       }
//     ],

//     stats: {
//       totalEnrollments: {
//         type: Number,
//         default: 0,
//       },
//       totalRevenue: {
//         type: Number,
//         default: 0,
//       },
//       totalCertificatesIssued: {
//         type: Number,
//         default: 0,
//       }
//     },

//     assignedAt: Date,

//     assignedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//     },

//     isLiveCourse: {
//       type: Boolean,
//       default: true,
//       index: true,
//     },
    
//     totalLiveClasses: {
//       type: Number,
//       default: 0,
//     },

//     // =====================
//     // PRICING
//     // =====================
//     price: {
//       type: Number,
//       default: 0,
//       min: 0,
//     },

//     currency: {
//       type: String,
//       default: 'NGN',
//     },

//     isFree: {
//       type: Boolean,
//       default: false,
//     },

//     discountPercentage: {
//       type: Number,
//       default: 0,
//       min: 0,
//       max: 100,
//     },

//     discountExpiry: Date,

//     // =====================
//     // ASSESSMENT RULES
//     // =====================
//     passingScore: {
//       type: Number,
//       default: 60,
//     },

//     requiresQuizCompletion: {
//       type: Boolean,
//       default: false,
//     },

//     requiresAssignmentCompletion: {
//       type: Boolean,
//       default: false,
//     },

//     completionPercentageRequired: {
//       type: Number,
//       default: 100,
//     },

//     minimumCompletionPercentage: {
//       type: Number,
//       default: 100,
//     },

//     notifyInstructorOnEnrollment: {
//       type: Boolean,
//       default: true,
//     },

//     notifyStudentOnEnrollment: {
//       type: Boolean,
//       default: true,
//     },

//     visibility: {
//       type: String,
//       enum: ['public', 'private', 'unlisted'],
//       default: 'public',
//     },

//     isDeleted: {
//       type: Boolean,
//       default: false,
//     },

//     deletedAt: Date,

//     publishedAt: Date,

//     // =====================
//     // SEO / METADATA
//     // =====================
//     tags: [String],

//     keywords: [String],

//     prerequisites: String,

//     learningOutcomes: [String],

//     targetAudience: String,

//     // =====================
//     // RATING (LIGHTWEIGHT ONLY)
//     // =====================
//     rating: {
//       average: {
//         type: Number,
//         default: 0,
//         min: 0,
//         max: 5,
//         index: true,
//       },
//       count: {
//         type: Number,
//         default: 0,
//       },
//     },

//     // =====================
//     // BUSINESS STATS
//     // =====================
//     totalRevenueGenerated: {
//       type: Number,
//       default: 0,
//     },

//     completionRate: {
//       type: Number,
//       default: 0,
//     },

//     certificateTemplate: {
//       type: String,
//       default: 'default',
//     },

//     liveClasses: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'LiveClass',
//       },
//     ],

//     courseSchedule: {
//       startDate: Date,
//       endDate: Date,
//       timezone: {
//         type: String,
//         default: 'Africa/Lagos',
//       },
//     },

//     maxStudents: {
//       type: Number,
//       default: 0,
//     },

//     activeStudents: {
//       type: Number,
//       default: 0,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// /* =====================
//    INDEXES (SCALABILITY)
// ===================== */
// courseSchema.index({ category: 1 });
// courseSchema.index({ assignedInstructor: 1 });
// courseSchema.index({ createdAt: -1 });

// /* =====================
//    SLUG GENERATION
// ===================== */
// courseSchema.pre('save', function (next) {
//   if (!this.slug) {
//     const random = Math.random().toString(36).substring(2, 8);
//     this.slug = `${this.title}`
//         .toLowerCase()
//         .replace(/[^\w\s-]/g, '')
//         .replace(/\s+/g, '-') + '-' + random;
//   }
//   next();
// });

// /* =====================
//    METHODS
// ===================== */

// // Apply discount
// courseSchema.methods.getDiscountedPrice = function () {
//   if (!this.discountPercentage) return this.price;
//   const discounted = this.price - (this.price * this.discountPercentage) / 100;
//   return Math.max(discounted, 0);
// };

// // Update rating (NO embedded reviews)
// courseSchema.methods.updateRating = function (newRating) {
//   const total = this.rating.average * this.rating.count;
//   this.rating.count += 1;
//   this.rating.average = (total + newRating) / this.rating.count;
// };

// // IMPORTANT: Safe model export to prevent OverwriteModelError
// module.exports = mongoose.models.Course || mongoose.model('Course', courseSchema);

// models/Course.js - FIXED

const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    // =====================
    // BASIC INFO
    // =====================
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      maxlength: 500,
    },

    detailedDescription: {
      type: String,
      maxlength: 5000,
    },

    category: {
      type: String,
      required: true,
      enum: [
        'technology',
        'business',
        'design',
        'entrepreneurship',
        'soft-skills',
        'other',
      ],
      index: true,
    },

    subcategory: String,

    // =====================
    // MEDIA
    // =====================
    thumbnail: {
      type: String,
      default: null,
    },
    coverImage: {
      type: String,
      default: null,
    },

    // =====================
    // COURSE INFO
    // =====================
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },

    language: {
      type: String,
      default: 'en',
    },

    duration: {
      type: Number,
      default: 0, // hours
    },

    // =====================
    // INSTRUCTOR - FIXED: Use User model
    // =====================
    assignedInstructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // ✅ Changed from 'Instructor' to 'User'
      default: null,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // =====================
    // STATUS
    // =====================
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    deliveryType: {
      type: String,
      enum: ['self_paced', 'live', 'hybrid'],
      default: 'self_paced'
    },

    certificateEnabled: {
      type: Boolean,
      default: true,
    },

    timetable: [
      {
        liveClassId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'LiveClass',
        },
        date: Date,
        title: String,
      }
    ],

    stats: {
      totalEnrollments: {
        type: Number,
        default: 0,
      },
      totalRevenue: {
        type: Number,
        default: 0,
      },
      totalCertificatesIssued: {
        type: Number,
        default: 0,
      }
    },

    assignedAt: Date,

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    isLiveCourse: {
      type: Boolean,
      default: true,
      index: true,
    },
    
    totalLiveClasses: {
      type: Number,
      default: 0,
    },

    // =====================
    // PRICING
    // =====================
    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: 'NGN',
    },

    isFree: {
      type: Boolean,
      default: false,
    },

    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    discountExpiry: Date,

    // =====================
    // ASSESSMENT RULES
    // =====================
    passingScore: {
      type: Number,
      default: 60,
    },

    requiresQuizCompletion: {
      type: Boolean,
      default: false,
    },

    requiresAssignmentCompletion: {
      type: Boolean,
      default: false,
    },

    completionPercentageRequired: {
      type: Number,
      default: 100,
    },

    minimumCompletionPercentage: {
      type: Number,
      default: 100,
    },

    notifyInstructorOnEnrollment: {
      type: Boolean,
      default: true,
    },

    notifyStudentOnEnrollment: {
      type: Boolean,
      default: true,
    },

    visibility: {
      type: String,
      enum: ['public', 'private', 'unlisted'],
      default: 'public',
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: Date,

    publishedAt: Date,

    // =====================
    // SEO / METADATA
    // =====================
    tags: [String],

    keywords: [String],

    prerequisites: String,

    learningOutcomes: [String],

    targetAudience: String,

    // =====================
    // RATING (LIGHTWEIGHT ONLY)
    // =====================
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
        index: true,
      },
      count: {
        type: Number,
        default: 0,
      },
    },

    // =====================
    // BUSINESS STATS
    // =====================
    totalRevenueGenerated: {
      type: Number,
      default: 0,
    },

    completionRate: {
      type: Number,
      default: 0,
    },

    certificateTemplate: {
      type: String,
      default: 'default',
    },

    liveClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LiveClass',
      },
    ],

    courseSchedule: {
      startDate: Date,
      endDate: Date,
      timezone: {
        type: String,
        default: 'Africa/Lagos',
      },
    },

    maxStudents: {
      type: Number,
      default: 0,
    },

    activeStudents: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/* =====================
   INDEXES (SCALABILITY)
===================== */
courseSchema.index({ category: 1 });
courseSchema.index({ assignedInstructor: 1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ status: 1, isDeleted: 1 });

/* =====================
   SLUG GENERATION
===================== */
courseSchema.pre('save', function (next) {
  if (!this.slug) {
    const random = Math.random().toString(36).substring(2, 8);
    this.slug = `${this.title}`
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-') + '-' + random;
  }
  next();
});

/* =====================
   METHODS
===================== */

// Apply discount
courseSchema.methods.getDiscountedPrice = function () {
  if (!this.discountPercentage) return this.price;
  const discounted = this.price - (this.price * this.discountPercentage) / 100;
  return Math.max(discounted, 0);
};

// Update rating (NO embedded reviews)
courseSchema.methods.updateRating = function (newRating) {
  const total = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (total + newRating) / this.rating.count;
};

// IMPORTANT: Safe model export to prevent OverwriteModelError
module.exports = mongoose.models.Course || mongoose.model('Course', courseSchema);