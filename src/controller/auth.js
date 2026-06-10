const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

// HELPERS
const signAccessToken = (user) => {
  return user.generateAccessToken();
};

const signRefreshToken = (user) => {
  return user.generateRefreshToken();
};

// REGISTER USER
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log(req.body);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.setRefreshToken(refreshToken);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body)

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account locked. Try again later.',
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await user.incLoginAttempts();

      return res.status(400).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    await user.resetLoginAttempts();

    user.lastLogin = new Date();

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.setRefreshToken(refreshToken);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// REFRESH TOKEN (ROTATION) - FIXED
const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    // ✅ FIXED: Use REFRESH_TOKEN_SECRET (not JWT_REFRESH_SECRET)
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({
        success: false,
        message: 'Session expired',
      });
    }

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    user.setRefreshToken(newRefreshToken);
    await user.save();

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
};

// LOGOUT (SINGLE DEVICE)
const logout = async (req, res) => {
  try {
    const user = req.user;

    user.currentRefreshToken = null;
    await user.save();

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// LOGOUT ALL DEVICES
const logoutAll = async (req, res) => {
  try {
    const user = req.user;

    user.tokenVersion += 1;
    user.currentRefreshToken = null;

    await user.save();

    res.json({
      success: true,
      message: 'Logged out from all devices',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET CURRENT USER
const me = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If account exists, reset instructions generated',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetTokenHash = hashedToken;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    res.json({
      success: true,
      message: 'Password reset token generated',
      resetToken, // ⚠️ for dev only
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetTokenHash: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    user.password = newPassword;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    user.tokenVersion += 1;

    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// EXPORTS
module.exports = {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  me,
  forgotPassword,
  resetPassword,
};