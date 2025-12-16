/**
 * Student Welcome Email Template
 */

module.exports = ({ name, email, verificationUrl, supportEmail }) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Cognito Learning Hub</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7fa; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: #ffffff; font-size: 28px; font-weight: 700; margin-bottom: 10px; }
        .header p { color: rgba(255, 255, 255, 0.9); font-size: 16px; }
        .content { padding: 40px 30px; }
        .welcome-box { background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .welcome-box h2 { color: #667eea; font-size: 20px; margin-bottom: 10px; }
        .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; text-align: center; transition: transform 0.2s; }
        .button:hover { transform: translateY(-2px); }
        .features { margin: 30px 0; }
        .feature-item { display: flex; align-items: start; margin: 15px 0; padding: 15px; background: #f8f9ff; border-radius: 8px; }
        .feature-icon { background: #667eea; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-right: 15px; flex-shrink: 0; }
        .feature-text h3 { color: #333; font-size: 16px; margin-bottom: 5px; }
        .feature-text p { color: #666; font-size: 14px; }
        .info-box { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .info-box p { color: #856404; font-size: 14px; margin: 5px 0; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef; }
        .footer p { color: #6c757d; font-size: 14px; margin: 5px 0; }
        .footer a { color: #667eea; text-decoration: none; }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, #e0e0e0, transparent); margin: 30px 0; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🎓 Welcome to Cognito Learning Hub!</h1>
            <p>Your journey to knowledge begins here</p>
        </div>

        <!-- Content -->
        <div class="content">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hi <strong>${name}</strong>,
            </p>

            <div class="welcome-box">
                <h2>🎉 Welcome Aboard!</h2>
                <p style="color: #666;">
                    Thank you for joining Cognito Learning Hub! We're excited to have you as part of our learning community.
                </p>
            </div>

            <p style="color: #666; margin: 20px 0;">
                To get started, please verify your email address by clicking the button below:
            </p>

            <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">
                    Verify Email Address
                </a>
            </div>

            <div class="divider"></div>

            <!-- Features Section -->
            <div class="features">
                <h2 style="color: #333; font-size: 20px; margin-bottom: 20px;">What You Can Do:</h2>
                
                <div class="feature-item">
                    <div class="feature-icon">📚</div>
                    <div class="feature-text">
                        <h3>Access Interactive Quizzes</h3>
                        <p>Test your knowledge with AI-generated and teacher-created quizzes</p>
                    </div>
                </div>

                <div class="feature-item">
                    <div class="feature-icon">🎮</div>
                    <div class="feature-text">
                        <h3>Earn Rewards & XP</h3>
                        <p>Complete quizzes, earn points, and climb the leaderboard</p>
                    </div>
                </div>

                <div class="feature-item">
                    <div class="feature-icon">👥</div>
                    <div class="feature-text">
                        <h3>Join Live Sessions</h3>
                        <p>Participate in real-time classes and interactive meetings</p>
                    </div>
                </div>

                <div class="feature-item">
                    <div class="feature-icon">📊</div>
                    <div class="feature-text">
                        <h3>Track Your Progress</h3>
                        <p>Monitor your performance with detailed analytics</p>
                    </div>
                </div>

                <div class="feature-item">
                    <div class="feature-icon">🌐</div>
                    <div class="feature-text">
                        <h3>Connect with Peers</h3>
                        <p>Collaborate and share knowledge with fellow students</p>
                    </div>
                </div>
            </div>

            <div class="divider"></div>

            <!-- Account Details -->
            <div class="info-box">
                <p><strong>📧 Your registered email:</strong> ${email}</p>
                <p><strong>👤 Account type:</strong> Student</p>
                <p><strong>⏰ Verification link expires in:</strong> 24 hours</p>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; color: #667eea; font-size: 13px; background: #f8f9ff; padding: 10px; border-radius: 6px; margin-top: 10px;">
                ${verificationUrl}
            </p>

            <p style="color: #999; font-size: 13px; margin-top: 30px; font-style: italic;">
                If you didn't create this account, please ignore this email or contact our support team.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p style="font-weight: 600; color: #333; margin-bottom: 10px;">Need Help?</p>
            <p>Contact us at <a href="mailto:${supportEmail}">${supportEmail}</a></p>
            <p style="margin-top: 20px; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} Cognito Learning Hub. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
`;
