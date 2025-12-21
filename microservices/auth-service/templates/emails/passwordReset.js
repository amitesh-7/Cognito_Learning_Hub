/**
 * Password Reset Email Template - Professional Design
 */

module.exports = ({ name, resetUrl, expiryMinutes, supportEmail }) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Cognito Learning Hub</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; padding: 20px; }
        .email-wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 48px 32px; text-align: center; }
        .logo { color: #ffffff; font-size: 32px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.5px; }
        .tagline { color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 400; }
        .content { padding: 48px 32px; }
        .greeting { font-size: 18px; color: #111827; margin-bottom: 24px; }
        .message { font-size: 15px; color: #4b5563; line-height: 1.8; margin-bottom: 32px; }
        .info-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px 24px; margin: 32px 0; border-radius: 8px; }
        .info-box-title { color: #92400e; font-size: 16px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; }
        .info-box-text { color: #78350f; font-size: 14px; line-height: 1.6; }
        .button-container { text-align: center; margin: 40px 0; }
        .reset-button { display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4); transition: all 0.3s ease; }
        .reset-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(79, 70, 229, 0.5); }
        .requirements-box { background: #f0fdf4; border: 2px solid #86efac; padding: 24px; border-radius: 12px; margin: 32px 0; }
        .requirements-title { color: #166534; font-size: 16px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; }
        .requirements-list { margin: 0; padding-left: 24px; color: #15803d; }
        .requirements-list li { margin-bottom: 8px; font-size: 14px; line-height: 1.6; }
        .security-notice { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px 24px; margin: 32px 0; border-radius: 8px; }
        .security-notice-title { color: #1e40af; font-size: 15px; font-weight: 600; margin-bottom: 12px; }
        .security-notice-list { margin: 0; padding-left: 20px; color: #1e40af; }
        .security-notice-list li { margin-bottom: 6px; font-size: 13px; }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, #e5e7eb, transparent); margin: 32px 0; }
        .footer-note { color: #9ca3af; font-size: 13px; line-height: 1.6; margin-top: 32px; padding: 20px; background: #f9fafb; border-radius: 8px; text-align: center; }
        .footer { background: #1f2937; padding: 32px; text-align: center; color: #9ca3af; }
        .footer-links { margin-bottom: 20px; }
        .footer-link { color: #818cf8; text-decoration: none; margin: 0 12px; font-size: 14px; }
        .footer-link:hover { color: #a5b4fc; }
        .copyright { font-size: 13px; color: #6b7280; margin-top: 16px; }
        .brand { color: #818cf8; font-weight: 600; }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <!-- Header -->
        <div class="header">
            <div class="logo">🧠 Cognito Learning Hub</div>
            <div class="tagline">Intelligence Meets Interaction</div>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <div class="greeting">
                Hello <strong>${name}</strong>,
            </div>
            
            <div class="info-box">
                <div class="info-box-title">⚠️ Password Reset Request</div>
                <div class="info-box-text">
                    We received a request to reset the password for your Cognito Learning Hub account. This link will expire in <strong>${expiryMinutes} minutes</strong> for your security.
                </div>
            </div>
            
            <div class="message">
                To reset your password and regain access to your account, please click the button below:
            </div>
            
            <!-- Reset Button -->
            <div class="button-container">
                <a href="${resetUrl}" class="reset-button">
                    🔐 Reset My Password
                </a>
            </div>
            
            <!-- Password Requirements -->
            <div class="requirements-box">
                <div class="requirements-title">✅ New Password Requirements</div>
                <ul class="requirements-list">
                    <li><strong>Minimum 8 characters</strong> long</li>
                    <li>At least <strong>one uppercase letter</strong> (A-Z)</li>
                    <li>At least <strong>one lowercase letter</strong> (a-z)</li>
                    <li>At least <strong>one number</strong> (0-9)</li>
                </ul>
            </div>
            
            <div class="divider"></div>
            
            <!-- Security Tips -->
            <div class="security-notice">
                <div class="security-notice-title">🛡️ Security Best Practices</div>
                <ul class="security-notice-list">
                    <li>Never share your password with anyone</li>
                    <li>Use a unique password for each platform</li>
                    <li>Consider using a password manager</li>
                    <li>Enable two-factor authentication when available</li>
                </ul>
            </div>
            
            <!-- Footer Note -->
            <div class="footer-note">
                <strong>Didn't request this?</strong><br>
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged and your account is secure.
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-links">
                <a href="mailto:${supportEmail}" class="footer-link">Support</a>
                <span style="color: #4b5563;">•</span>
                <a href="${
                  process.env.FRONTEND_URL ||
                  "https://cognito-learning-hub.vercel.app"
                }" class="footer-link">Visit Platform</a>
            </div>
            <div class="copyright">
                © ${new Date().getFullYear()} <span class="brand">Cognito Learning Hub</span>. All rights reserved.<br>
                Intelligence Meets Interaction
            </div>
        </div>
    </div>
</body>
</html>
`;
