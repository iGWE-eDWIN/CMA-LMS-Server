require('dotenv').config();
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    // Basic Information
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Please provide a valid email');
        }
      },
    },

    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-()]+$/, 'Please provide a valid phone number'],
    },

    password: {
      type: String,
      required: true,
      minlength: [8, 'Password must be at least 8 characters'],
      trim: true,
      validate(value) {
        const strongPasswordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}[\]|;:'",.<>/?]).{8,}$/;

        if (!strongPasswordRegex.test(value)) {
          throw new Error(
            'Password must contain uppercase, lowercase, number, special character and be at least 8 characters'
          );
        }

        if (value.toLowerCase().includes('password')) {
          throw new Error("Password cannot contain the word 'password'");
        }
      },
    },

    // Profile
    profilePicture: {
      data: Buffer,
      contentType: String,
    },

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

    // Roles
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      required: true,
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },

    isSuspended: {
      type: Boolean,
      default: false,
    },

    suspensionReason: String,

    suspensionDate: Date,

    // Login Tracking
    lastLogin: Date,

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: Date,

    // Authentication
    refreshToken: String,

    refreshTokenExpiry: Date,

    // Social Links
    socialLinks: {
      linkedin: String,
      twitter: String,
      facebook: String,
      instagram: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
// userSchema.index({ role: 1 });
// userSchema.index({ isActive: 1 });
userSchema.index({ isSuspended: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ firstName: 1, lastName: 1 });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, isActive: 1 });

// Virtuals
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Password Hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// Get Full Name
userSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

// Public Profile
userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    profilePicture: this.profilePicture,
    role: this.role,
    bio: this.bio,
    socialLinks: this.socialLinks,
  };
};

// Hide Sensitive Fields
userSchema.methods.toJSON = function () {
  const obj = this.toObject();

  delete obj.password;
  delete obj.refreshToken;
  delete obj.__v;

  return obj;
};

const User = model('User', userSchema);

module.exports = User;