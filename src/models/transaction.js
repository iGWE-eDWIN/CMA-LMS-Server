const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    // =====================
    // OWNER
    // =====================
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      index: true,
    },

    // =====================
    // TRANSACTION TYPE
    // =====================
    transactionType: {
      type: String,
      enum: [
        'wallet_funding',
        'course_purchase',
        'refund',
      ],
      required: true,
      index: true,
    },

    direction: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
      index: true,
    },

    // =====================
    // AMOUNT
    // =====================
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: 'NGN',
    },

    description: {
      type: String,
      maxlength: 1000,
    },

    // =====================
    // RELATED RECORDS
    // =====================
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      index: true,
    },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      index: true,
    },

    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      index: true,
    },
relatedType: {
  type: String,
  enum: ["course", "wallet", "refund"],
},

relatedId: mongoose.Schema.Types.ObjectId,
    // =====================
    // STATUS
    // =====================
    status: {
      type: String,
      enum: [
        'pending',
        'completed',
        'failed',
        'reversed',
      ],
      default: 'pending',
      index: true,
    },

    // =====================
    // UNIQUE REFERENCE
    // =====================
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // =====================
    // AUDIT TRAIL
    // =====================
    balanceSnapshot: {
      previous: {
        type: Number,
        default: 0,
      },

      current: {
        type: Number,
        default: 0,
      },
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    processedAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* =====================
   IMMUTABLE RECORDS
===================== */

transactionSchema.pre('findOneAndUpdate', function () {
  throw new Error('Transactions are immutable');
});

transactionSchema.pre('updateOne', function () {
  throw new Error('Transactions are immutable');
});

transactionSchema.pre('updateMany', function () {
  throw new Error('Transactions are immutable');
});

/* =====================
   INDEXES
===================== */

transactionSchema.index(
  { reference: 1 },
  { unique: true }
);

transactionSchema.index({
  userId: 1,
  createdAt: -1,
});

transactionSchema.index({
  walletId: 1,
  createdAt: -1,
});

transactionSchema.index({
  transactionType: 1,
  createdAt: -1,
});

transactionSchema.index({
  status: 1,
  createdAt: -1,
});

transactionSchema.index({
  courseId: 1,
  createdAt: -1,
});

/* =====================
   METHODS
===================== */

transactionSchema.methods.markCompleted =
  function () {
    this.status = 'completed';
    this.processedAt = new Date();
  };

transactionSchema.methods.markFailed =
  function () {
    this.status = 'failed';
    this.processedAt = new Date();
  };

transactionSchema.methods.reverse =
  function () {
    this.status = 'reversed';
    this.processedAt = new Date();
  };

module.exports = mongoose.model(
  'Transaction',
  transactionSchema
);