'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose; // Removed 'model' since we'll use mongoose.model

/**
 * PROFILE PICTURE STORED IN DB (SCALABLE VERSION)
 */
const profilePictureSchema = new Schema(
  {
    data: {
      type: Buffer,
      required: false,
    },
    contentType: String,
    size: Number,
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    /* ---------------- BASIC INFO ---------------- */
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: (v) => validator.isEmail(v),
    },

    phone: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    /* ---------------- PROFILE ---------------- */
    profilePicture: profilePictureSchema,
    avatarUrl: String,
    bio: {
      type: String,
      maxlength: 500,
    },

    dateOfBirth: Date,

    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: null,
    },

    address: {
      country: String,
      state: String,
      city: String,
      zipCode: String,
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },
    
    unreadNotifications: {
      type: Number,
      default: 0,
    },

    lastSeenAt: Date,
    
    /* ---------------- ROLE SYSTEM ---------------- */
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      required: true,
      index: true,
    },

    accountStatus: {
      type: String,
      enum: [
        'active',
        'pending_verification',
        'suspended',
        'deactivated',
      ],
      default: 'active',
      index: true,
    },

    isSuspended: {
      type: Boolean,
      default: false,
      index: true,
    },

    suspensionReason: String,
    suspensionDate: Date,

    /* ---------------- SECURITY ---------------- */
    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: Date,

    tokenVersion: {
      type: Number,
      default: 0,
    },

    /* ---------------- REFRESH TOKEN ---------------- */
    currentRefreshToken: {
      type: String,
      default: null,
    },

    /* ---------------- PASSWORD RESET ---------------- */
    passwordResetTokenHash: String,
    passwordResetExpires: Date,

    /* ---------------- LOGIN TRACKING ---------------- */
    lastLogin: Date,
    lastLoginIP: String,
    lastLoginDevice: String,

    /* ---------------- INSTRUCTOR VERIFICATION ---------------- */
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: function() {
        return this.role === 'instructor' ? 'pending' : 'approved';
      }
    },
    
    verificationRejectionReason: String,
    verifiedAt: Date,
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ---------------- INDEXES ---------------- */
userSchema.index({ role: 1, accountStatus: 1 });
userSchema.index({ lockUntil: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ passwordResetTokenHash: 1 });

/* ---------------- VIRTUALS ---------------- */
userSchema.virtual('fullName').get(function () {
  return `${this.name}`;
});

userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

/* ---------------- PASSWORD HASHING ---------------- */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* ---------------- PASSWORD CHECK ---------------- */
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

/* ---------------- JWT TOKENS ---------------- */
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      tokenVersion: this.tokenVersion,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
      tokenVersion: this.tokenVersion,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '30d' }
  );
};

/* ---------------- REFRESH TOKEN MANAGEMENT ---------------- */
userSchema.methods.setRefreshToken = function (token) {
  this.currentRefreshToken = token;
};

/* ---------------- LOGIN SECURITY ---------------- */
userSchema.methods.incLoginAttempts = async function () {
  const MAX = 5;

  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
    return this.save();
  }

  this.loginAttempts += 1;

  if (this.loginAttempts >= MAX) {
    this.lockUntil = Date.now() + 30 * 60 * 1000;
  }

  return this.save();
};

userSchema.methods.resetLoginAttempts = function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  return this.save();
};

/* ---------------- REMOVE SENSITIVE DATA ---------------- */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();

  delete obj.password;
  delete obj.passwordResetTokenHash;
  delete obj.__v;

  return obj;
};

// ✅ CRITICAL FIX: Safe export to prevent OverwriteModelError
module.exports = mongoose.models.User || mongoose.model('User', userSchema);