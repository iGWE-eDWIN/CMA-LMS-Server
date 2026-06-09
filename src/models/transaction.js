const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    transactionType: {
      type: String,
      enum: [
        'course_purchase',
        'wallet_funding',
        'instructor_earning',
        'withdrawal',
        'refund',
        'admin_credit',
        'admin_debit',
      ],
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: 'USD',
    },

    description: {
      type: String,
      maxlength: 1000,
    },

    // RELATIONS
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

    withdrawalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Withdrawal',
      index: true,
    },

    // STATUS (immutable concept)
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'reversed'],
      default: 'pending',
      index: true,
    },

    // 🔥 CRITICAL: UNIQUE ID FOR IDEMPOTENCY
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // BALANCE SNAPSHOT (for audit only)
    balanceSnapshot: {
      previous: Number,
      new: Number,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },

    processedAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

transactionSchema.pre('findOneAndUpdate', function () {
  throw new Error('Transactions are immutable');
});

transactionSchema.index({ reference: 1 }, { unique: true });

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ walletId: 1, createdAt: -1 });
transactionSchema.index({ userId: 1, transactionType: 1 });
transactionSchema.index({ status: 1, createdAt: -1 });

