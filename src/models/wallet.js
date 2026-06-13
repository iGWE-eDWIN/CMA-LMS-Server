const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const walletSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

  userType: {
  type: String,
  enum: ['student'],
  default: 'student',
},

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },


    totalSpent: {
      type: Number,
      default: 0,
    },

    totalFunded: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: 'NGN',
    },

    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
      },
    ],

    totalTransactions: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFrozen: {
      type: Boolean,
      default: false,
    },

    freezeReason: String,

    lastTransactionDate: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
walletSchema.index({ userId: 1 });
walletSchema.index({ userType: 1 });

/*
|--------------------------------------------------------------------------
| Wallet Methods
|--------------------------------------------------------------------------
*/

// Credit Wallet
walletSchema.methods.credit = function (amount) {
  this.balance += amount;
  this.totalFunded += amount;
  this.lastTransactionDate = new Date();
};

// Debit Wallet
walletSchema.methods.debit = function (amount) {
  if (this.balance < amount) {
    throw new Error('Insufficient wallet balance');
  }

  this.balance -= amount;
  this.totalSpent += amount;
  this.lastTransactionDate = new Date();
};



// Freeze Wallet
walletSchema.methods.freezeWallet = function (reason) {
  this.isFrozen = true;
  this.freezeReason = reason;
};

// Unfreeze Wallet
walletSchema.methods.unfreezeWallet = function () {
  this.isFrozen = false;
  this.freezeReason = null;
};

const Wallet = model('Wallet', walletSchema);

module.exports = Wallet;