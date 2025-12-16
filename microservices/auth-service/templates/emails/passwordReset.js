/**
 * Password Reset Email Template
 */

module.exports = ({ name, resetUrl, expiryHours, supportEmail }) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7fa; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: #ffffff; font-size: 28px; font-weight: 700; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .alert-box h2 { color: #856404; font-size: 18px; margin-bottom: 10px; }
        .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; text-align: center; transition: transform 0.2s; }
        .button:hover { transform: translateY(-2px); }
        .security-box { background: #e8f5e9; border: 1px solid #4caf50; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .security-box h3 { color: #2e7d32; font-size: 16px; margin-bottom: 10px; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef; }
        .footer p { color: #6c757d; font-size: 14px; margin: 5px 0; }
        .footer a { color: #ff6b6b; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Password Reset Request</h1>
        </div>
        <div class="content">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hi <strong>${name}</strong>,
            </p>
            <div class="alert-box">
                <h2>⚠️ Password Reset Requested</h2>
                <p style="color: #856404;">
                    We received a request to reset your password for your Cognito Learning Hub account.
                </p>
            </div>
            <p style="color: #666; margin: 20px 0;">
                Click the button below to reset your password. This link will expire in <strong>${expiryHours} hours</strong>.
            </p>
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">
                    Reset Password
                </a>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Or copy and paste this link:
            </p>
            <p style="word-break: break-all; color: #ff6b6b; font-size: 13px; background: #fff5f7; padding: 10px; border-radius: 6px; margin-top: 10px;">
                ${resetUrl}
            </p>
            <div class="security-box">
                <h3>🛡️ Security Tips:</h3>
                <ul style="margin-left: 20px; color: #2e7d32;">
                    <li>Never share your password with anyone</li>
                    <li>Use a strong, unique password</li>
                    <li>If you didn't request this, please ignore this email</li>
                    <li>Contact support if you have concerns</li>
                </ul>
            </div>
            <p style="color: #999; font-size: 13px; margin-top: 30px; font-style: italic;">
                If you didn't request a password reset, no action is needed. Your password will remain unchanged.
            </p>
        </div>
        <div class="footer">
            <p>Need help? Contact <a href="mailto:${supportEmail}">${supportEmail}</a></p>
            <p style="margin-top: 20px; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} Cognito Learning Hub. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
`;
