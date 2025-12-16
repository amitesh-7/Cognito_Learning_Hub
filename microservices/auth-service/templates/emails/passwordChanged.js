/**
 * Password Changed Confirmation Email Template
 */

module.exports = ({ name, loginUrl, supportEmail }) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Changed Successfully</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7fa; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: #ffffff; font-size: 28px; font-weight: 700; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .success-box { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .success-box h2 { color: #2e7d32; font-size: 18px; margin-bottom: 10px; }
        .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; text-align: center; transition: transform 0.2s; }
        .button:hover { transform: translateY(-2px); }
        .warning-box { background: #fff3cd; border: 1px solid #ffc107; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .warning-box h3 { color: #856404; font-size: 16px; margin-bottom: 10px; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef; }
        .footer p { color: #6c757d; font-size: 14px; margin: 5px 0; }
        .footer a { color: #4caf50; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Password Changed</h1>
        </div>
        <div class="content">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hi <strong>${name}</strong>,
            </p>
            <div class="success-box">
                <h2>🎉 Password Successfully Changed!</h2>
                <p style="color: #2e7d32;">
                    Your password for your Cognito Learning Hub account has been successfully changed.
                </p>
            </div>
            <p style="color: #666; margin: 20px 0;">
                You can now log in with your new password. For security reasons, all your active sessions have been terminated.
            </p>
            <div style="text-align: center;">
                <a href="${loginUrl}" class="button">
                    Login Now
                </a>
            </div>
            <div class="warning-box">
                <h3>⚠️ Didn't Change Your Password?</h3>
                <p style="color: #856404; margin-top: 10px;">
                    If you didn't make this change, your account may have been compromised. Please contact our support team immediately at:
                </p>
                <p style="color: #856404; margin-top: 10px; font-weight: 600;">
                    <a href="mailto:${supportEmail}" style="color: #856404;">${supportEmail}</a>
                </p>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                <strong>Security Reminder:</strong> Always use a strong, unique password and never share it with anyone.
            </p>
        </div>
        <div class="footer">
            <p>Questions? Contact <a href="mailto:${supportEmail}">${supportEmail}</a></p>
            <p style="margin-top: 20px; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} Cognito Learning Hub. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
`;
