const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Get cookie options compatible with both HTTP (default AWS EC2/ALB without SSL)
 * and HTTPS deployments.
 */
const getCookieOptions = (req) => {
  const isSecure = process.env.COOKIE_SECURE === 'true' || (req && req.secure);
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
};

/**
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'Email already registered', 409);
    }

    // Create user (password hashed in model pre-save hook)
    const user = await User.create({ name, email, password, role: role || 'user' });

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshTokens.push({ token: refreshToken });
    await user.save({ validateBeforeSave: false });

    // Set refresh token as HttpOnly cookie
    res.cookie('refreshToken', refreshToken, getCookieOptions(req));

    logger.info(`New user registered: ${email}`);

    return sendSuccess(
      res,
      { user, accessToken },
      'Registration successful',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Account is deactivated', 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Limit stored refresh tokens to 5 (security: remove oldest)
    const userWithTokens = await User.findById(user._id).select('+refreshTokens');
    if (userWithTokens.refreshTokens.length >= 5) {
      userWithTokens.refreshTokens.shift();
    }
    userWithTokens.refreshTokens.push({ token: refreshToken });
    userWithTokens.lastSeen = new Date();
    await userWithTokens.save({ validateBeforeSave: false });

    res.cookie('refreshToken', refreshToken, getCookieOptions(req));

    // Remove password from response
    user.password = undefined;

    logger.info(`User logged in: ${email}`);

    return sendSuccess(res, { user, accessToken }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      return sendError(res, 'Refresh token not found', 401);
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      return sendError(res, 'Invalid or expired refresh token', 401);
    }

    // Find user and check if refresh token is in the list
    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user) {
      return sendError(res, 'User not found', 401);
    }

    const tokenExists = user.refreshTokens.some((t) => t.token === token);
    if (!tokenExists) {
      return sendError(res, 'Refresh token revoked', 401);
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== token);
    user.refreshTokens.push({ token: newRefreshToken });
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', newRefreshToken, getCookieOptions(req));

    return sendSuccess(res, { accessToken: newAccessToken }, 'Token refreshed');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @access  Protected
 */
const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (token) {
      // Remove refresh token from user
      const user = await User.findById(req.user._id).select('+refreshTokens');
      user.refreshTokens = user.refreshTokens.filter((t) => t.token !== token);
      await user.save({ validateBeforeSave: false });
    }

    res.clearCookie('refreshToken', getCookieOptions(req));
    return sendSuccess(res, {}, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @access  Protected
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/auth/update-profile
 * @access  Protected
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, preferences } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (preferences) updates.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    return sendSuccess(res, { user }, 'Profile updated');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/auth/change-password
 * @access  Protected
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user.password) {
      return sendError(res, 'No password set (OAuth account)', 400);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect', 400);
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, {}, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refresh, logout, getMe, updateProfile, changePassword };
