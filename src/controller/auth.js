const jwt = require('jsonwebtoken');
const { User, Student, Instructor, Wallet } = require('../models');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Register User
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      phone,
      role: role || 'student',
    });

    // // Generate email verification token
    // const verificationToken = crypto.randomBytes(32).toString('hex');
    // user.emailVerificationToken = crypto
    //   .createHash('sha256')
    //   .update(verificationToken)
    //   .digest('hex');
    // user.emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    // await user.save();

    // Create wallet if student or instructor
    if (role === 'student' || role === 'instructor') {
      const wallet = await Wallet.create({
        userId: user._id,
        userType: role,
      });

      if (role === 'student') {
        await Student.create({
          userId: user._id,
          walletId: wallet._id,
        });
      } else if (role === 'instructor') {
        await Instructor.create({
          userId: user._id,
          walletId: wallet._id,
        });
      }
    }

    // Generate JWT
    const token = generateToken(user._id);

    // Send verification email
    // const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    // await emailService.sendVerificationEmail(user.email, user.firstName, verificationUrl);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};
