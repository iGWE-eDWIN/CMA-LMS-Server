const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    // =====================
    // USER (FIXED)
    // =====================
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },

    // =====================
    // AMOUNT (FINANCIAL SAFE)
    // =====================
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: 'USD',
      index: true,
    },

    // =====================
    // PAYMENT CHANNEL
    // =====================
    paymentMethod: {
      type: String,
      enum: ['paystack', 'flutterwave', 'stripe', 'wallet'],
      required: true,
      index: true,
    },

    paymentGateway: {
      type: String,
      enum: ['paystack', 'flutterwave', 'stripe'],
      index: true,
    },

    // =====================
    // IDENTITY / IDEMPOTENCY (CRITICAL FIX 🔥)
    // =====================
    transactionReference: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    gatewayTransactionId: {
      type: String,
      index: true,
    },

    gatewayReference: String,

    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
    },

    // =====================
    // STATUS (SCALABLE STATE MACHINE)
    // =====================
    status: {
      type: String,
      enum: [
        'pending',
        'processing',
        'completed',
        'failed',
        'cancelled',
        'refunded',
      ],
      default: 'pending',
      index: true,
    },

    paidAt: Date,

    // =====================
    // RECEIPT
    // =====================
    receiptUrl: String,

    // =====================
    // REFUND SYSTEM (SCALABLE FIX)
    // =====================
    refund: {
      isRefunded: {
        type: Boolean,
        default: false,
      },

      amount: {
        type: Number,
        default: 0,
      },

      reason: String,

      status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
      },

      refundedAt: Date,
    },

    // =====================
    // VERIFICATION
    // =====================
    verification: {
      isVerified: {
        type: Boolean,
        default: false,
      },
      verifiedAt: Date,
    },

    // =====================
    // AUDIT SAFE METADATA
    // =====================
    metadata: {
      type: Map,
      of: String,
      default: {},
    },

    notes: String,

    // =====================
    // SOFT DELETE (AUDIT SAFETY)
    // =====================
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

/* =====================
   SCALABILITY INDEXES
===================== */

// User payment history (MOST USED)
paymentSchema.index({ userId: 1, createdAt: -1 });

// Course revenue lookup
paymentSchema.index({ courseId: 1, status: 1 });

// Payment verification (webhooks)
paymentSchema.index({ transactionReference: 1 });

// Gateway reconciliation
paymentSchema.index({ gatewayTransactionId: 1 });

// Status analytics
paymentSchema.index({ status: 1, createdAt: -1 });

/* =====================
   METHODS
===================== */

// Mark payment as completed
paymentSchema.methods.markCompleted = function () {
  this.status = 'completed';
  this.paidAt = new Date();
};

// Mark payment as failed
paymentSchema.methods.markFailed = function () {
  this.status = 'failed';
};

// Refund payment
paymentSchema.methods.refundPayment = function (amount, reason) {
  this.status = 'refunded';

  this.refund = {
    isRefunded: true,
    amount,
    reason,
    status: 'completed',
    refundedAt: new Date(),
  };
};

module.exports = mongoose.model('Payment', paymentSchema);