/**
 * Authentication Routes
 * Handles user registration, login, OAuth, token management
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

// Shared utilities
const ApiResponse = require('../../shared/utils/response');
const createLogger = require('../../shared/utils/logger');
const { authenticateToken } = require('../../shared/middleware/auth');
const { authLimiter } = require('../../shared/middleware/rateLimiter');
const { validationRules, handleValidationErrors } = require('../../shared/middleware/validation');

const router = express.Router();
const logger = createLogger('auth-service');
const User = require('../models/User');

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Generate JWT tokens
 */
function generateTokens(userId, role) {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '30d' }
  );

  return { accessToken, refreshToken };
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  validationRules.register,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json(
          ApiResponse.badRequest('User with this email already exists')
        );
      }

      // Hash password
      const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role: role || 'Student',
        isEmailVerified: false,
      });

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
      user.emailVerificationExpires = Date.now() + parseInt(process.env.EMAIL_VERIFICATION_EXPIRY || 86400000);

      await user.save();

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id, user.role);

      // Store refresh token
      user.refreshTokens.push({
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      await user.save();

      logger.info(`User registered: ${email}`);

      // TODO: Send verification email with verificationToken
      // For now, we'll just log it
      logger.info(`Verification token: ${verificationToken}`);

      res.status(201).json(
        ApiResponse.created({
          message: 'User registered successfully',
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
          },
          accessToken,
          refreshToken,
        })
      );
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json(ApiResponse.error('Registration failed', 500));
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  validationRules.login,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json(
          ApiResponse.unauthorized('Invalid email or password')
        );
      }

      // Check if user registered with Google
      if (user.googleId && !user.password) {
        return res.status(400).json(
          ApiResponse.badRequest('Please login with Google')
        );
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json(
          ApiResponse.unauthorized('Invalid email or password')
        );
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id, user.role);

      // Store refresh token
      user.refreshTokens.push({
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      // Update last activity
      user.lastActivity = Date.now();
      user.status = 'online';
      await user.save();

      logger.info(`User logged in: ${email}`);

      res.json(
        ApiResponse.success({
          message: 'Login successful',
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            picture: user.picture,
            isEmailVerified: user.isEmailVerified,
          },
          accessToken,
          refreshToken,
        })
      );
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json(ApiResponse.error('Login failed', 500));
    }
  }
);

/**
 * @route   POST /api/auth/google
 * @desc    Google OAuth login
 * @access  Public
 */
router.post('/google', authLimiter, async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json(
        ApiResponse.badRequest('Google credential is required')
      );
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({
        name,
        email,
        googleId,
        picture,
        role: 'Student',
        isEmailVerified: true, // Google accounts are pre-verified
      });
      await user.save();
      logger.info(`New Google user created: ${email}`);
    } else if (!user.googleId) {
      // Link Google account to existing user
      user.googleId = googleId;
      user.picture = picture;
      user.isEmailVerified = true;
      await user.save();
      logger.info(`Google account linked: ${email}`);
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    // Store refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Update last activity
    user.lastActivity = Date.now();
    user.status = 'online';
    await user.save();

    logger.info(`Google login successful: ${email}`);

    res.json(
      ApiResponse.success({
        message: 'Google login successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          picture: user.picture,
          isEmailVerified: user.isEmailVerified,
        },
        accessToken,
        refreshToken,
      })
    );
  } catch (error) {
    logger.error('Google OAuth error:', error);
    res.status(500).json(ApiResponse.error('Google authentication failed', 500));
  }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json(
        ApiResponse.badRequest('Refresh token is required')
      );
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    if (decoded.type !== 'refresh') {
      return res.status(401).json(
        ApiResponse.unauthorized('Invalid refresh token')
      );
    }

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json(
        ApiResponse.unauthorized('User not found')
      );
    }

    const tokenExists = user.refreshTokens.some(
      (t) => t.token === refreshToken && t.expiresAt > Date.now()
    );

    if (!tokenExists) {
      return res.status(401).json(
        ApiResponse.unauthorized('Invalid or expired refresh token')
      );
    }

    // Generate new access token
    const { accessToken } = generateTokens(user._id, user.role);

    logger.info(`Token refreshed for user: ${user.email}`);

    res.json(
      ApiResponse.success({
        accessToken,
      })
    );
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json(ApiResponse.unauthorized('Invalid refresh token'));
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate refresh token)
 * @access  Private
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(ApiResponse.notFound('User not found'));
    }

    // Remove refresh token
    if (refreshToken) {
      user.refreshTokens = user.refreshTokens.filter(
        (t) => t.token !== refreshToken
      );
    } else {
      // Remove all refresh tokens
      user.refreshTokens = [];
    }

    // Update status
    user.status = 'offline';
    user.lastSeen = Date.now();
    await user.save();

    logger.info(`User logged out: ${user.email}`);

    res.json(
      ApiResponse.success({
        message: 'Logout successful',
      })
    );
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json(ApiResponse.error('Logout failed', 500));
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json(ApiResponse.notFound('User not found'));
    }

    res.json(
      ApiResponse.success({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          picture: user.picture,
          isEmailVerified: user.isEmailVerified,
          status: user.status,
          lastSeen: user.lastSeen,
          createdAt: user.createdAt,
        },
      })
    );
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json(ApiResponse.error('Failed to fetch user', 500));
  }
});

/**
 * @route   POST /api/auth/verify-email/:token
 * @desc    Verify email address
 * @access  Public
 */
router.post('/verify-email/:token', async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json(
        ApiResponse.badRequest('Invalid or expired verification token')
      );
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    logger.info(`Email verified for user: ${user.email}`);

    res.json(
      ApiResponse.success({
        message: 'Email verified successfully',
      })
    );
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json(ApiResponse.error('Email verification failed', 500));
  }
});

module.exports = router;
