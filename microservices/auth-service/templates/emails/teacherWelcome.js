/**
 * Teacher Welcome Email Template
 */

module.exports = ({ name, email, verificationUrl, dashboardUrl, supportEmail }) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Teacher - Cognito Learning Hub</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f7fa; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: #ffffff; font-size: 28px; font-weight: 700; margin-bottom: 10px; }
        .header p { color: rgba(255, 255, 255, 0.9); font-size: 16px; }
        .content { padding: 40px 30px; }
        .welcome-box { background: #fff5f7; border-left: 4px solid #f5576c; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .welcome-box h2 { color: #f5576c; font-size: 20px; margin-bottom: 10px; }
        .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; text-align: center; transition: transform 0.2s; }
        .button:hover { transform: translateY(-2px); }
        .button-secondary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin-left: 10px; }
        .features { margin: 30px 0; }
        .feature-item { display: flex; align-items: start; margin: 15px 0; padding: 15px; background: #fff5f7; border-radius: 8px; }
        .feature-icon { background: #f5576c; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-right: 15px; flex-shrink: 0; }
        .feature-text h3 { color: #333; font-size: 16px; margin-bottom: 5px; }
        .feature-text p { color: #666; font-size: 14px; }
        .info-box { background: #e8f5e9; border: 1px solid #4caf50; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .info-box p { color: #2e7d32; font-size: 14px; margin: 5px 0; }
        .tip-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 8px; }
        .tip-box h3 { color: #1976d2; font-size: 16px; margin-bottom: 10px; }
        .tip-box ul { margin-left: 20px; color: #666; }
        .tip-box li { margin: 8px 0; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef; }
        .footer p { color: #6c757d; font-size: 14px; margin: 5px 0; }
        .footer a { color: #f5576c; text-decoration: none; }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, #e0e0e0, transparent); margin: 30px 0; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>👨‍🏫 Welcome, Teacher!</h1>
            <p>Empower minds, shape futures</p>
        </div>

        <!-- Content -->
        <div class="content">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hi <strong>${name}</strong>,
            </p>

            <div class="welcome-box">
                <h2>🎉 Welcome to Our Teaching Community!</h2>
                <p style="color: #666;">
                    Thank you for joining Cognito Learning Hub as an educator! We're thrilled to have you help shape the future of learning.
                </p>
            </div>

            <p style="color: #666; margin: 20px 0;">
                Let's get you started! First, please verify your email address:
            </p>

            <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">
                    Verify Email Address
                </a>
                <a href="${dashboardUrl}" class="button button-secondary">
                    Go to Dashboard
                </a>
            </div>

            <div class="divider"></div>

            <!-- Features Section -->
            <div class="features">
                <h2 style="color: #333; font-size: 20px; margin-bottom: 20px;">Your Teaching Tools:</h2>
                
                <div class="feature-item">
                    <div class="feature-icon">📝</div>
                    <div class="feature-text">
                        <h3>Create Custom Quizzes</h3>
                        <p>Design engaging assessments with multiple question types and difficulty levels</p>
                    </div>
                </div>

                <div class="feature-item">
                    <div class="feature-icon">🤖</div>
                    <div class="feature-text">
                        <h3>AI-Powered Quiz Generation</h3>
                        <p>Let AI help you create quizzes instantly from topics or content</p>
                    </div>
                </div>

                <div class="feature-item">
                    <div class="feature-icon">🎥</div>
                    <div class="feature-text">
                        <h3>Host Live Sessions</h3>
                        <p>Conduct interactive online classes with video, chat, and screen sharing</p>
                    </div>
                </div>

                <div class="feature-item">
                    <div class="feature-icon">📈</div>
                    <div class="feature-text">
                        <h3>Student Analytics</h3>
                        <p>Track student performance, engagement, and progress with detailed insights</p>
                    </div>
                </div>

                <div class="feature-item">
                    <div class="feature-icon">🏆</div>
                    <div class="feature-text">
                        <h3>Gamification Features</h3>
                        <p>Motivate students with XP, achievements, and leaderboards</p>
                    </div>
                </div>

                <div class="feature-item">
                    <div class="feature-icon">👥</div>
                    <div class="feature-text">
                        <h3>Student Management</h3>
                        <p>Organize classes, monitor progress, and provide personalized feedback</p>
                    </div>
                </div>
            </div>

            <div class="divider"></div>

            <!-- Quick Start Tips -->
            <div class="tip-box">
                <h3>🚀 Quick Start Tips:</h3>
                <ul>
                    <li><strong>Complete Your Profile:</strong> Add your photo, bio, and expertise</li>
                    <li><strong>Create Your First Quiz:</strong> Start with a simple topic to get familiar</li>
                    <li><strong>Try AI Generation:</strong> Experiment with AI-powered quiz creation</li>
                    <li><strong>Explore the Dashboard:</strong> Familiarize yourself with analytics and tools</li>
                    <li><strong>Set Up a Live Session:</strong> Schedule your first online class</li>
                </ul>
            </div>

            <!-- Account Details -->
            <div class="info-box">
                <p><strong>📧 Your registered email:</strong> ${email}</p>
                <p><strong>👨‍🏫 Account type:</strong> Teacher</p>
                <p><strong>⏰ Verification link expires in:</strong> 24 hours</p>
                <p><strong>🎓 Status:</strong> Access to all teaching features</p>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; color: #f5576c; font-size: 13px; background: #fff5f7; padding: 10px; border-radius: 6px; margin-top: 10px;">
                ${verificationUrl}
            </p>

            <div class="divider"></div>

            <div style="background: #fff9c4; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
                <h3 style="color: #f57c00; margin-bottom: 10px;">💡 Need Help Getting Started?</h3>
                <p style="color: #666; margin: 10px 0;">
                    Check out our Teacher Guide or reach out to our support team. We're here to help you succeed!
                </p>
                <p style="color: #666; margin-top: 10px;">
                    <strong>Support Email:</strong> <a href="mailto:${supportEmail}" style="color: #f57c00;">${supportEmail}</a>
                </p>
            </div>

            <p style="color: #999; font-size: 13px; margin-top: 30px; font-style: italic;">
                If you didn't create this account, please ignore this email or contact our support team immediately.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p style="font-weight: 600; color: #333; margin-bottom: 10px;">Thank You for Choosing Cognito Learning Hub</p>
            <p>Together, we're building the future of education</p>
            <p style="margin-top: 15px;">Contact: <a href="mailto:${supportEmail}">${supportEmail}</a></p>
            <p style="margin-top: 20px; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} Cognito Learning Hub. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
`;
