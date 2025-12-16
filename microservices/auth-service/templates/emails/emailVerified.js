/**
 * Email Verified Confirmation Template
 */

module.exports = ({ name, dashboardUrl, role }) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verified Successfully</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7fa; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: #ffffff; font-size: 28px; font-weight: 700; margin-bottom: 10px; }
        .header .icon { font-size: 60px; margin-bottom: 20px; }
        .content { padding: 40px 30px; }
        .success-box { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
        .success-box h2 { color: #2e7d32; font-size: 20px; margin-bottom: 10px; }
        .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; text-align: center; transition: transform 0.2s; }
        .button:hover { transform: translateY(-2px); }
        .next-steps { background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .next-steps h3 { color: #667eea; margin-bottom: 15px; }
        .next-steps ul { margin-left: 20px; color: #666; }
        .next-steps li { margin: 10px 0; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef; }
        .footer p { color: #6c757d; font-size: 14px; margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="icon">🎉</div>
            <h1>Email Verified!</h1>
            <p style="color: rgba(255,255,255,0.9);">Your account is now fully active</p>
        </div>
        <div class="content">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hi <strong>${name}</strong>,
            </p>
            <div class="success-box">
                <h2>✅ Email Verification Complete!</h2>
                <p style="color: #2e7d32; margin-top: 10px;">
                    Congratulations! Your email has been successfully verified. Your account is now fully activated.
                </p>
            </div>
            <p style="color: #666; margin: 20px 0; text-align: center;">
                You now have full access to all features. Ready to get started?
            </p>
            <div style="text-align: center;">
                <a href="${dashboardUrl}" class="button">
                    Go to Dashboard
                </a>
            </div>
            <div class="next-steps">
                <h3>🚀 Next Steps${role === 'Teacher' ? ' for Teachers' : ''}:</h3>
                <ul>
                    ${role === 'Teacher' ? `
                        <li><strong>Complete Your Profile:</strong> Add your expertise and teaching areas</li>
                        <li><strong>Create Your First Quiz:</strong> Start engaging with students</li>
                        <li><strong>Explore AI Tools:</strong> Try AI-powered quiz generation</li>
                        <li><strong>Schedule a Live Session:</strong> Set up your first online class</li>
                    ` : `
                        <li><strong>Complete Your Profile:</strong> Add your photo and interests</li>
                        <li><strong>Take a Quiz:</strong> Test your knowledge on various topics</li>
                        <li><strong>Earn XP & Badges:</strong> Complete challenges and climb the leaderboard</li>
                        <li><strong>Join Live Sessions:</strong> Participate in interactive classes</li>
                    `}
                </ul>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">
                Thank you for being part of the Cognito Learning Hub community!
            </p>
        </div>
        <div class="footer">
            <p style="font-weight: 600; color: #333; margin-bottom: 10px;">Welcome to the Future of Learning</p>
            <p style="margin-top: 20px; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} Cognito Learning Hub. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
`;
