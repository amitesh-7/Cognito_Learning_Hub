/**
 * Authentication Routes
 * Handles user registration, login, OAuth, token management
 */

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

// Email service
const emailService = require("../services/emailService");

// Shared utilities
const ApiResponse = require("../../shared/utils/response");
const createLogger = require("../../shared/utils/logger");
const { authenticateToken } = require("../../shared/middleware/auth");
const { authLimiter } = require("../../shared/middleware/rateLimiter");
const {
  validationRules,
  handleValidationErrors,
} = require("../../shared/middleware/validation");

const router = express.Router();
const logger = createLogger("auth-service");
const User = require("../models/User");

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Generate JWT tokens
 */
function generateTokens(userId, role, name = null, picture = null) {
  // Debug: Check if JWT_SECRET is loaded
  if (!process.env.JWT_SECRET) {
    logger.error("JWT_SECRET is not defined in environment variables!");
    throw new Error("JWT_SECRET is not configured");
  }

  const accessToken = jwt.sign(
    { user: { id: userId, userId, role, name, picture } }, // Add name and picture for frontend
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || "7d" }
  );

  const refreshToken = jwt.sign(
    { user: { id: userId, userId, role, name, picture }, type: "refresh" }, // Add name and picture for frontend
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, // Fallback to JWT_SECRET if refresh secret not set
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || "30d" }
  );

  return { accessToken, refreshToken };
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  "/register",
  authLimiter,
  validationRules.register,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return ApiResponse.badRequest(
          res,
          "User with this email already exists"
        );
      }

      // Hash password
      const salt = await bcrypt.genSalt(
        parseInt(process.env.BCRYPT_ROUNDS) || 10
      );
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role: role || "Student",
        isEmailVerified: false,
      });

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");
      user.emailVerificationToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");
      user.emailVerificationExpires =
        Date.now() +
        parseInt(process.env.EMAIL_VERIFICATION_EXPIRY || 86400000);

      await user.save();

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(
        user._id,
        user.role,
        user.name,
        user.picture
      );

      // Store hashed refresh token
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      user.refreshTokens.push({
        token: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      await user.save();

      logger.info(`User registered: ${email}`);

      // Send verification email
      const emailResult = await emailService.sendVerificationEmail(
        user,
        verificationToken
      );
      if (!emailResult.success) {
        logger.warn(
          `Failed to send verification email to ${email}: ${
            emailResult.error || emailResult.message
          }`
        );
      } else {
        logger.info(`Verification email sent to ${email}`);
      }

      return ApiResponse.created(
        res,
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
          },
          accessToken,
          refreshToken,
        },
        "User registered successfully"
      );
    } catch (error) {
      logger.error("Registration error:", error);
      return ApiResponse.error(res, "Registration failed", 500);
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  "/login",
  authLimiter,
  validationRules.login,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password, role } = req.body;

      // Check if database is connected
      const mongoose = require("mongoose");
      if (mongoose.connection.readyState !== 1) {
        logger.error("Database not connected - login attempt failed");
        return ApiResponse.error(
          res,
          "Service temporarily unavailable - database not connected",
          503
        );
      }

      // Find user
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return ApiResponse.unauthorized(res, "Invalid email or password");
      }

      // Check if user registered with Google
      if (user.googleId && !user.password) {
        return ApiResponse.badRequest(res, "Please login with Google");
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return ApiResponse.unauthorized(res, "Invalid email or password");
      }

      // Validate role if provided
      if (role && user.role !== role) {
        return ApiResponse.unauthorized(
          res,
          `Invalid credentials. Please select the correct role (${user.role}) or contact support.`
        );
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(
        user._id,
        user.role,
        user.name,
        user.picture
      );

      // Store hashed refresh token
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      user.refreshTokens.push({
        token: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      // Update last activity
      user.lastActivity = Date.now();
      user.status = "online";
      await user.save();

      logger.info(`User logged in: ${email} as ${user.role}`);

      return ApiResponse.success(
        res,
        {
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
        },
        "Login successful"
      );
    } catch (error) {
      logger.error("Login error:", error);
      return ApiResponse.error(res, "Login failed: " + error.message, 500);
    }
  }
);

/**
 * @route   POST /api/auth/google
 * @desc    Google OAuth login
 * @access  Public
 */
router.post("/google", authLimiter, async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return ApiResponse.badRequest(res, "Google credential is required");
    }

    // Check if Google Client ID is configured
    if (!process.env.GOOGLE_CLIENT_ID) {
      logger.error("GOOGLE_CLIENT_ID not configured in environment");
      return ApiResponse.error(
        res,
        "Google authentication not configured on server",
        500
      );
    }

    // Verify Google token
    logger.info("Verifying Google OAuth token", {
      expectedAudience: process.env.GOOGLE_CLIENT_ID,
    });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    logger.info("Google OAuth token verified successfully", {
      email: payload.email,
      tokenAudience: payload.aud,
    });
    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      // Create new user with valid role (default to Student)
      const validRoles = ["Student", "Teacher", "Moderator", "Admin"];
      const userRole =
        req.body.role && validRoles.includes(req.body.role)
          ? req.body.role
          : "Student";

      user = new User({
        name,
        email,
        googleId,
        picture,
        role: userRole,
        isEmailVerified: true, // Google accounts are pre-verified
      });
      await user.save();
      isNewUser = true;
      logger.info(`New Google user created: ${email} with role: ${userRole}`);
    } else {
      // Validate and fix role for existing users (migrate from old schema)
      const validRoles = ["Student", "Teacher", "Moderator", "Admin"];
      if (!validRoles.includes(user.role)) {
        logger.warn(
          `Invalid role "${user.role}" found for user ${email}, correcting to Student`
        );
        user.role = "Student";
      }

      // Link Google account if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        user.picture = picture;
        user.isEmailVerified = true;
        logger.info(`Google account linked: ${email}`);
      }
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user._id,
      user.role,
      user.name,
      user.picture
    );

    // Store hashed refresh token
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    user.refreshTokens.push({
      token: hashedRefreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Update last activity
    user.lastActivity = Date.now();
    user.status = "online";
    await user.save();

    logger.info(`Google login successful: ${email}`);

    return ApiResponse.success(
      res,
      {
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
        isNewUser, // Flag to determine if role selection is needed
      },
      "Google login successful"
    );
  } catch (error) {
    logger.error("Google OAuth error:", error);

    // Provide more specific error messages
    if (error.message && error.message.includes("Token used too early")) {
      return ApiResponse.error(
        res,
        "Google token not yet valid. Please try again.",
        400
      );
    }
    if (error.message && error.message.includes("Token used too late")) {
      return ApiResponse.error(
        res,
        "Google token expired. Please try again.",
        400
      );
    }
    if (error.message && error.message.includes("Invalid token signature")) {
      return ApiResponse.error(
        res,
        "Invalid Google token. Please try again.",
        400
      );
    }

    return ApiResponse.error(
      res,
      `Google authentication failed: ${error.message || "Unknown error"}`,
      500
    );
  }
});

/**
 * @route   POST /api/auth/google/update-role
 * @desc    Update role for Google OAuth users
 * @access  Private (requires valid token)
 */
router.post("/google/update-role", authenticateToken, async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.user.userId || req.user.id;

    // Validate role
    const validRoles = ["Student", "Teacher", "Moderator", "Admin"];
    if (!role || !validRoles.includes(role)) {
      return ApiResponse.badRequest(
        res,
        "Invalid role. Must be Student, Teacher, Moderator, or Admin"
      );
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return ApiResponse.notFound(res, "User not found");
    }

    // Check if user has Google OAuth
    if (!user.googleId) {
      return ApiResponse.badRequest(
        res,
        "This endpoint is only for Google OAuth users"
      );
    }

    // Update role
    user.role = role;
    await user.save();

    // Generate new tokens with updated role
    const { accessToken, refreshToken } = generateTokens(
      user._id,
      user.role,
      user.name,
      user.picture
    );

    // Store hashed refresh token
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    user.refreshTokens.push({
      token: hashedRefreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    await user.save();

    logger.info(`Role updated for Google user: ${user.email} to ${role}`);

    return ApiResponse.success(
      res,
      {
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
      },
      "Role updated successfully"
    );
  } catch (error) {
    logger.error("Update role error:", error);
    return ApiResponse.error(res, "Failed to update role", 500);
  }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return ApiResponse.badRequest(res, "Refresh token is required");
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    if (decoded.type !== "refresh") {
      return ApiResponse.unauthorized(res, "Invalid refresh token");
    }

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.user.userId);
    if (!user) {
      return ApiResponse.unauthorized(res, "User not found");
    }

    // Check if any hashed token matches
    let tokenValid = false;
    for (const storedToken of user.refreshTokens) {
      if (storedToken.expiresAt > Date.now()) {
        const isMatch = await bcrypt.compare(refreshToken, storedToken.token);
        if (isMatch) {
          tokenValid = true;
          break;
        }
      }
    }

    if (!tokenValid) {
      return ApiResponse.unauthorized(res, "Invalid or expired refresh token");
    }

    // Generate new access token
    const { accessToken } = generateTokens(
      user._id,
      user.role,
      user.name,
      user.picture
    );

    logger.info(`Token refreshed for user: ${user.email}`);

    res.json(
      ApiResponse.success({
        accessToken,
      })
    );
  } catch (error) {
    logger.error("Token refresh error:", error);
    return ApiResponse.unauthorized(res, "Invalid refresh token");
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate refresh token)
 * @access  Private
 */
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return ApiResponse.notFound(res, "User not found");
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
    user.status = "offline";
    user.lastSeen = Date.now();
    await user.save();

    logger.info(`User logged out: ${user.email}`);

    res.json(
      ApiResponse.success({
        message: "Logout successful",
      })
    );
  } catch (error) {
    logger.error("Logout error:", error);
    return ApiResponse.error(res, "Logout failed", 500);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return ApiResponse.notFound(res, "User not found");
    }

    return ApiResponse.success(res, {
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
    });
  } catch (error) {
    logger.error("Get current user error:", error);
    return ApiResponse.error(res, "Failed to fetch user", 500);
  }
});

/**
 * @route   POST /api/auth/verify-email/:token
 * @desc    Verify email address
 * @access  Public
 */
router.post("/verify-email/:token", async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return ApiResponse.badRequest(
        res,
        "Invalid or expired verification token"
      );
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    logger.info(`Email verified for user: ${user.email}`);

    // Send email verification success confirmation
    await emailService.sendEmailVerifiedEmail(user);

    return ApiResponse.success(res, "Email verified successfully");
  } catch (error) {
    logger.error("Email verification error:", error);
    return ApiResponse.error(res, "Email verification failed", 500);
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post("/forgot-password", authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return ApiResponse.badRequest(res, "Email is required");
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success message (security best practice - don't reveal if email exists)
    const successMessage =
      "If your email is registered with us, you will receive password reset instructions shortly. Please check your inbox.";

    if (!user) {
      logger.info(`Password reset requested for non-existent email: ${email}`);
      return ApiResponse.success(res, successMessage);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpires =
      Date.now() + (parseInt(process.env.PASSWORD_RESET_EXPIRY) || 300000); // 5 minutes default

    await user.save();

    // Send reset email
    await emailService.sendPasswordResetEmail(user, resetToken);

    logger.info(`Password reset email sent to: ${email}`);

    return ApiResponse.success(res, successMessage);
  } catch (error) {
    logger.error("Forgot password error:", error);
    return ApiResponse.error(
      res,
      "Failed to process password reset request",
      500
    );
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post("/reset-password", authLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return ApiResponse.badRequest(res, "Token and new password are required");
    }

    // Validate password strength
    if (password.length < 8) {
      return ApiResponse.badRequest(
        res,
        "Password must be at least 8 characters long"
      );
    }
    if (!/[A-Z]/.test(password)) {
      return ApiResponse.badRequest(
        res,
        "Password must contain at least one uppercase letter"
      );
    }
    if (!/[a-z]/.test(password)) {
      return ApiResponse.badRequest(
        res,
        "Password must contain at least one lowercase letter"
      );
    }
    if (!/[0-9]/.test(password)) {
      return ApiResponse.badRequest(
        res,
        "Password must contain at least one number"
      );
    }

    // Hash the token to match stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return ApiResponse.badRequest(
        res,
        "Invalid or expired password reset token"
      );
    }

    // Hash new password
    const salt = await bcrypt.genSalt(
      parseInt(process.env.BCRYPT_ROUNDS) || 10
    );
    user.password = await bcrypt.hash(password, salt);

    // Clear reset token fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // Invalidate all existing refresh tokens for security
    user.refreshTokens = [];

    await user.save();

    logger.info(`Password reset successful for user: ${user.email}`);

    // Send confirmation email
    await emailService.sendPasswordChangedEmail(user);

    return ApiResponse.success(
      res,
      "Password reset successful. You can now login with your new password."
    );
  } catch (error) {
    logger.error("Reset password error:", error);
    return ApiResponse.error(res, "Failed to reset password", 500);
  }
});

module.exports = router;
