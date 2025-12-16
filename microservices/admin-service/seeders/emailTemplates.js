/**
 * Email Template Seeder
 * Seeds initial email templates for common scenarios
 */

const mongoose = require('mongoose');
const EmailTemplate = require('../models/EmailTemplate');
require('dotenv').config();

const templates = [
  {
    name: 'Welcome Email - Student',
    type: 'welcome',
    subject: 'Welcome to Cognito Learning Hub! 🎓',
    body: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #667eea; }
          .cta { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Cognito Learning Hub!</h1>
          </div>
          <div class="content">
            <h2>Hi {{userName}}! 👋</h2>
            <p>We're thrilled to have you join our learning community! Your account has been successfully created.</p>
            
            <h3>As a Student, you can:</h3>
            <div class="feature">📝 <strong>Take AI-Generated Quizzes</strong> - Test your knowledge with smart, adaptive quizzes</div>
            <div class="feature">📊 <strong>Track Your Progress</strong> - Monitor your performance with detailed analytics</div>
            <div class="feature">🏆 <strong>Earn Rewards</strong> - Compete on leaderboards and earn achievements</div>
            <div class="feature">👥 <strong>Join Live Sessions</strong> - Participate in real-time quizzes and discussions</div>
            <div class="feature">🤖 <strong>AI Study Buddy</strong> - Get personalized study assistance</div>
            
            <a href="{{loginUrl}}" class="cta">Start Learning Now</a>
            
            <p style="margin-top: 30px; color: #666;">
              Need help? Contact us at support@cognitolearninghub.com
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    variables: [
      { name: 'userName', description: 'User\'s full name', required: true },
      { name: 'loginUrl', description: 'Login page URL', required: true, default: 'http://localhost:5173/login' }
    ],
    isActive: true
  },
  {
    name: 'Welcome Email - Teacher',
    type: 'welcome',
    subject: 'Welcome to Cognito Learning Hub - Teacher Account! 👨‍🏫',
    body: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #f5576c; }
          .cta { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome, Teacher! 👨‍🏫</h1>
          </div>
          <div class="content">
            <h2>Hi {{userName}}! 👋</h2>
            <p>Your teacher account has been successfully created. You now have access to powerful teaching tools!</p>
            
            <h3>As a Teacher, you can:</h3>
            <div class="feature">✨ <strong>Create AI-Powered Quizzes</strong> - Generate quizzes from topics or PDF files</div>
            <div class="feature">📋 <strong>Manage Your Quizzes</strong> - Edit, publish, and organize your quiz library</div>
            <div class="feature">👥 <strong>Host Live Sessions</strong> - Conduct real-time quizzes with students</div>
            <div class="feature">📊 <strong>View Analytics</strong> - Track student performance and progress</div>
            <div class="feature">🎯 <strong>Create Study Rooms</strong> - Organize collaborative learning spaces</div>
            <div class="feature">⚙️ <strong>Customize Settings</strong> - Configure quiz difficulty and time limits</div>
            
            <a href="{{loginUrl}}" class="cta">Access Your Dashboard</a>
            
            <p style="margin-top: 30px; color: #666;">
              Questions? Reach out at support@cognitolearninghub.com
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    variables: [
      { name: 'userName', description: 'Teacher\'s full name', required: true },
      { name: 'loginUrl', description: 'Login page URL', required: true, default: 'http://localhost:5173/login' }
    ],
    isActive: true
  },
  {
    name: 'Quiz Creation Success',
    type: 'quiz_created',
    subject: 'Your Quiz "{{quizTitle}}" is Ready! 🎉',
    body: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .quiz-info { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .cta { display: inline-block; background: #4facfe; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Quiz Created Successfully!</h1>
          </div>
          <div class="content">
            <h2>Hi {{userName}}!</h2>
            <p>Great news! Your quiz has been generated and is ready to use.</p>
            
            <div class="quiz-info">
              <h3>{{quizTitle}}</h3>
              <div class="info-row">
                <span>Subject:</span>
                <strong>{{quizSubject}}</strong>
              </div>
              <div class="info-row">
                <span>Questions:</span>
                <strong>{{questionCount}} questions</strong>
              </div>
              <div class="info-row">
                <span>Difficulty:</span>
                <strong>{{difficulty}}</strong>
              </div>
              <div class="info-row">
                <span>Time Limit:</span>
                <strong>{{timeLimit}} minutes</strong>
              </div>
            </div>
            
            <p>You can now share this quiz with your students or start a live session!</p>
            
            <a href="{{quizUrl}}" class="cta">View Quiz</a>
            
            <p style="margin-top: 30px; color: #666;">
              Need to make changes? Edit your quiz anytime from your dashboard.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    variables: [
      { name: 'userName', description: 'Teacher\'s name', required: true },
      { name: 'quizTitle', description: 'Quiz title', required: true },
      { name: 'quizSubject', description: 'Quiz subject/topic', required: true },
      { name: 'questionCount', description: 'Number of questions', required: true },
      { name: 'difficulty', description: 'Quiz difficulty level', required: true, default: 'Medium' },
      { name: 'timeLimit', description: 'Time limit in minutes', required: true, default: '30' },
      { name: 'quizUrl', description: 'Direct link to quiz', required: true }
    ],
    isActive: true
  },
  {
    name: 'Password Reset',
    type: 'password_reset',
    subject: 'Reset Your Password - Cognito Learning Hub',
    body: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ff6b6b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
          .cta { display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .token { background: #e9ecef; padding: 15px; font-family: monospace; font-size: 18px; text-align: center; letter-spacing: 2px; margin: 15px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi {{userName}},</h2>
            <p>We received a request to reset your password for your Cognito Learning Hub account.</p>
            
            <p>Click the button below to reset your password:</p>
            <a href="{{resetUrl}}" class="cta">Reset Password</a>
            
            <p style="margin-top: 20px;">Or use this reset code:</p>
            <div class="token">{{resetToken}}</div>
            
            <div class="warning">
              ⚠️ <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request this reset, please ignore this email or contact support if you're concerned about your account security.
            </div>
            
            <p style="margin-top: 30px; color: #666;">
              For security questions, contact us at support@cognitolearninghub.com
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    variables: [
      { name: 'userName', description: 'User\'s name', required: true },
      { name: 'resetUrl', description: 'Password reset URL with token', required: true },
      { name: 'resetToken', description: 'Reset token code', required: true }
    ],
    isActive: true
  }
];

async function seedTemplates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cognito_learning_hub', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('📧 Connected to MongoDB');
    
    // Clear existing templates
    await EmailTemplate.deleteMany({});
    console.log('🗑️  Cleared existing templates');
    
    // Insert new templates
    const inserted = await EmailTemplate.insertMany(templates);
    console.log(`✅ Seeded ${inserted.length} email templates`);
    
    inserted.forEach(template => {
      console.log(`   - ${template.name} (${template.type})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeder if called directly
if (require.main === module) {
  seedTemplates();
}

module.exports = { seedTemplates, templates };
