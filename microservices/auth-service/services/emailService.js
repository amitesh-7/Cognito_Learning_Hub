/**
 * Email Service - Handles all email communications
 * Uses Nodemailer for sending emails
 */

const nodemailer = require("nodemailer");
const createLogger = require("../../shared/utils/logger");
const logger = createLogger("email-service");

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
    this.initTransporter();
  }

  /**
   * Initialize email transporter
   */
  initTransporter() {
    try {
      // Check if email is configured
      if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
        logger.warn("Email service not configured. Emails will not be sent.");
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT) || 465,
        secure: true, // use SSL for port 465 (Render compatible)
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      this.initialized = true;
      logger.info("Email service initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize email service:", error);
    }
  }

  /**
   * Verify email connection
   */
  async verifyConnection() {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      logger.info("Email service connection verified");
      return true;
    } catch (error) {
      logger.error("Email service verification failed:", error);
      return false;
    }
  }

  /**
   * Send email
   */
  async sendEmail(to, subject, html) {
    if (!this.initialized) {
      logger.warn("Email service not initialized. Email not sent.");
      return { success: false, message: "Email service not configured" };
    }

    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || "Cognito Learning Hub"}" <${
          process.env.EMAIL_FROM || process.env.EMAIL_USER
        }>`,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email to student
   */
  async sendStudentWelcomeEmail(user, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const html = require("../templates/emails/studentWelcome")({
      name: user.name,
      email: user.email,
      verificationUrl,
      supportEmail: process.env.SUPPORT_EMAIL || "support@cognitolearning.com",
    });

    return await this.sendEmail(
      user.email,
      "Welcome to Cognito Learning Hub! 🎓",
      html
    );
  }

  /**
   * Send welcome email to teacher
   */
  async sendTeacherWelcomeEmail(user, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const html = require("../templates/emails/teacherWelcome")({
      name: user.name,
      email: user.email,
      verificationUrl,
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
      supportEmail: process.env.SUPPORT_EMAIL || "support@cognitolearning.com",
    });

    return await this.sendEmail(
      user.email,
      "Welcome to Cognito Learning Hub! 👨‍🏫",
      html
    );
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(user, verificationToken) {
    if (user.role === "Teacher") {
      return await this.sendTeacherWelcomeEmail(user, verificationToken);
    } else {
      return await this.sendStudentWelcomeEmail(user, verificationToken);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const expiryMs = parseInt(process.env.PASSWORD_RESET_EXPIRY) || 300000;
    const expiryMinutes = Math.floor(expiryMs / (1000 * 60));

    const html = require("../templates/emails/passwordReset")({
      name: user.name,
      resetUrl,
      expiryMinutes: expiryMinutes,
      supportEmail: process.env.SUPPORT_EMAIL || "support@cognitolearning.com",
    });

    return await this.sendEmail(
      user.email,
      "Reset Your Password - Cognito Learning Hub",
      html
    );
  }

  /**
   * Send password changed confirmation
   */
  async sendPasswordChangedEmail(user) {
    const html = require("../templates/emails/passwordChanged")({
      name: user.name,
      loginUrl: `${process.env.FRONTEND_URL}/login`,
      supportEmail: process.env.SUPPORT_EMAIL || "support@cognitolearning.com",
    });

    return await this.sendEmail(
      user.email,
      "Password Changed Successfully - Cognito Learning Hub",
      html
    );
  }

  /**
   * Send email verification success
   */
  async sendEmailVerifiedEmail(user) {
    const html = require("../templates/emails/emailVerified")({
      name: user.name,
      dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
      role: user.role,
    });

    return await this.sendEmail(
      user.email,
      "Email Verified Successfully! 🎉",
      html
    );
  }
}

// Export singleton instance
module.exports = new EmailService();
