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
    thumbnail: String,
    coverImage: String,

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
    // INSTRUCTOR
    // =====================
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instructor',
      required: true,
      index: true,
    },

    // =====================
    // CONTENT STRUCTURE
    // =====================
    modules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
      },
    ],

    numberOfModules: {
      type: Number,
      default: 0,
    },

    numberOfLessons: {
      type: Number,
      default: 0,
    },

    numberOfAssignments: {
      type: Number,
      default: 0,
    },

    numberOfQuizzes: {
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
    // ENROLLMENT (SCALABLE)
    // =====================
    totalEnrollments: {
      type: Number,
      default: 0,
      index: true,
    },

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

    requiresFinalAssessment: {
      type: Boolean,
      default: false,
    },

    // =====================
    // LIFECYCLE / STATUS (CLEAN SYSTEM)
    // =====================
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'rejected', 'archived'],
      default: 'draft',
      index: true,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    approvalDate: Date,

    rejectionReason: String,

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
  },
  {
    timestamps: true,
  }
);

/* =====================
   INDEXES (SCALABILITY)
===================== */
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ instructor: 1, status: 1 });
courseSchema.index({ createdAt: -1 });

/* =====================
   SLUG GENERATION
===================== */
courseSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

/* =====================
   METHODS
===================== */

// Publish course
courseSchema.methods.publish = function () {
  this.status = 'published';
  this.isApproved = true;
  this.publishedAt = new Date();
};

// Reject course
courseSchema.methods.reject = function (reason) {
  this.status = 'rejected';
  this.rejectionReason = reason;
};

// Apply discount
courseSchema.methods.getDiscountedPrice = function () {
  if (!this.discountPercentage) return this.price;

  const discounted =
    this.price - (this.price * this.discountPercentage) / 100;

  return Math.max(discounted, 0);
};

// Update rating (NO embedded reviews)
courseSchema.methods.updateRating = function (newRating) {
  const total = this.rating.average * this.rating.count;

  this.rating.count += 1;

  this.rating.average =
    (total + newRating) / this.rating.count;
};

module.exports = mongoose.model('Course', courseSchema);