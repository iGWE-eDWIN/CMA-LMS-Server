const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instructor',
      required: true,
      index: true,
    },

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

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      default: 'USD',
    },

    // 🔥 REFERENCE FOR IDEMPOTENCY (CRITICAL)
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'paypal', 'stripe'],
      default: 'bank_transfer',
      index: true,
    },

    // ONLY STORE REFERENCE, NOT FULL BANK DATA
    bankAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankAccount',
      index: true,
    },

    status: {
      type: String,
      enum: [
        'pending',
        'approved',
        'processing',
        'completed',
        'rejected',
        'failed',
      ],
      default: 'pending',
      index: true,
    },

    rejectionReason: {
      type: String,
      maxlength: 1000,
    },

    requestedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    approvedAt: Date,

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    processedAt: Date,

    completedAt: Date,

    // LINK TO LEDGER TRANSACTION
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      index: true,
    },

    adminNotes: {
      type: String,
      maxlength: 2000,
    },

    instructorNotes: {
      type: String,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);


withdrawalSchema.index({ reference: 1 }, { unique: true });

withdrawalSchema.index({ instructorId: 1, status: 1 });
withdrawalSchema.index({ userId: 1, requestedAt: -1 });
withdrawalSchema.index({ status: 1, requestedAt: -1 });
withdrawalSchema.index({ walletId: 1 });