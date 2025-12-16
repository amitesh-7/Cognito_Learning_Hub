const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3011;

// Middleware
app.use(cors({
  origin: process.env.ADMIN_FRONTEND_URL || 'http://localhost:5174',
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cognito_learning_hub', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Admin Service connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// Admin Authentication Middleware
const requireAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    // Verify token with auth service (use production URL if available)
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    const authResponse = await axios.get(`${authServiceUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000
    });

    if (!authResponse.data.data || !authResponse.data.data.user) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const user = authResponse.data.data.user;
    
    // Check if user is admin (role can be 'admin' or 'Admin')
    const userRole = user.role?.toLowerCase();
    if (userRole !== 'admin' && userRole !== 'moderator') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'admin-service',
    timestamp: new Date().toISOString()
  });
});

// ==================== AUTHENTICATION ====================

// Admin Login (validates admin role after auth service login)
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Forward to auth service for authentication
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    const loginResponse = await axios.post(
      `${authServiceUrl}/api/auth/login`,
      { email, password },
      { timeout: 10000 }
    );

    const userData = loginResponse.data.data;
    
    // Verify user is admin or moderator
    const userRole = userData.user?.role?.toLowerCase();
    if (userRole !== 'admin' && userRole !== 'moderator') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. Admin or Moderator role required.' 
      });
    }

    // Return the auth response (includes token)
    res.json(loginResponse.data);
  } catch (error) {
    console.error('Admin login error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Login failed. Please try again.' 
    });
  }
});

// ==================== SERVICE MONITORING ====================

// Get all services health status
app.get('/api/admin/services/health', requireAdmin, async (req, res) => {
  try {
    // Use production URLs if available, otherwise fallback to localhost
    const services = [
      { 
        name: 'Auth Service', 
        url: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
        port: 3002 
      },
      { 
        name: 'Quiz Service', 
        url: process.env.QUIZ_SERVICE_URL || 'http://localhost:3003',
        port: 3003 
      },
      { 
        name: 'Gamification Service', 
        url: process.env.GAMIFICATION_SERVICE_URL || 'http://localhost:3004',
        port: 3004 
      },
      { 
        name: 'Social Service', 
        url: process.env.SOCIAL_SERVICE_URL || 'http://localhost:3005',
        port: 3005 
      },
      { 
        name: 'Result Service', 
        url: process.env.RESULT_SERVICE_URL || 'http://localhost:3006',
        port: 3006 
      },
      { 
        name: 'Admin Service', 
        url: process.env.ADMIN_SERVICE_URL || 'http://localhost:3011',
        port: 3011 
      },
      { 
        name: 'Live Service', 
        url: process.env.LIVE_SERVICE_URL || 'http://localhost:3008',
        port: 3008 
      },
      { 
        name: 'Meeting Service', 
        url: process.env.MEETING_SERVICE_URL || 'http://localhost:3009',
        port: 3009 
      },
      { 
        name: 'Moderation Service', 
        url: process.env.MODERATION_SERVICE_URL || 'http://localhost:3010',
        port: 3010 
      }
    ].map(service => ({
      ...service,
      url: service.url.endsWith('/health') ? service.url : `${service.url}/health`
    }));

    const healthChecks = await Promise.allSettled(
      services.map(async (service) => {
        try {
          const response = await axios.get(service.url, { 
            timeout: 10000,
            validateStatus: (status) => status < 500 // Accept any non-5xx status
          });
          
          const isHealthy = response.status === 200 && 
            (response.data.status === 'healthy' || 
             response.data.status === 'ok' || 
             response.data.message === 'Service is running');
          
          return {
            name: service.name,
            port: service.port,
            url: service.url.replace('/health', ''),
            status: isHealthy ? 'healthy' : 'degraded',
            uptime: response.data.uptime || response.data.uptimeSeconds || 'N/A',
            memory: response.data.memory || response.data.memoryUsage || null,
            cpu: response.data.cpu || null,
            database: response.data.database || response.data.db || 'N/A',
            version: response.data.version || 'N/A',
            lastCheck: new Date().toISOString(),
            responseTime: response.headers['x-response-time'] || 'N/A'
          };
        } catch (error) {
          return {
            name: service.name,
            port: service.port,
            url: service.url.replace('/health', ''),
            status: 'unhealthy',
            error: error.code === 'ECONNREFUSED' ? 'Service not running' : error.message,
            lastCheck: new Date().toISOString()
          };
        }
      })
    );

    const results = healthChecks.map(result => result.value || result.reason);
    res.json(results);
  } catch (error) {
    console.error('Service health check error:', error);
    res.status(500).json({ error: 'Failed to check service health' });
  }
});

// Restart a specific service
app.post('/api/admin/services/:serviceName/restart', requireAdmin, async (req, res) => {
  try {
    const { serviceName } = req.params;
    // This is a placeholder - actual implementation would require PM2 or similar
    res.json({
      message: `Restart request sent for ${serviceName}`,
      status: 'pending',
      note: 'Manual restart required - PM2 integration needed'
    });
  } catch (error) {
    console.error('Service restart error:', error);
    res.status(500).json({ error: 'Failed to restart service' });
  }
});

// ==================== GEMINI API MONITORING ====================

// Get Gemini API statistics
app.get('/api/admin/gemini/stats', requireAdmin, async (req, res) => {
  try {
    const quizServiceUrl = process.env.QUIZ_SERVICE_URL || 'http://localhost:3003';
    const quizServiceHealth = await axios.get(`${quizServiceUrl}/health`, { timeout: 10000 });
    const apiKeyHealth = quizServiceHealth.data.apiKeyHealth || {};

    // Calculate aggregated stats
    const stats = {
      totalKeys: apiKeyHealth.totalKeys || 3,
      healthyKeys: apiKeyHealth.healthyKeys || 3,
      unhealthyKeys: apiKeyHealth.unhealthyKeys || 0,
      currentKeyIndex: apiKeyHealth.currentKeyIndex || 0,
      circuitBreakerStatus: quizServiceHealth.data.circuitBreaker || 'CLOSED',
      keys: apiKeyHealth.keys || []
    };

    res.json(stats);
  } catch (error) {
    console.error('Gemini stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch Gemini statistics',
      totalKeys: 0,
      healthyKeys: 0,
      keys: []
    });
  }
});

// Get all Gemini API keys
app.get('/api/admin/gemini/keys', requireAdmin, async (req, res) => {
  try {
    const quizServiceUrl = process.env.QUIZ_SERVICE_URL || 'http://localhost:3003';
    const quizServiceHealth = await axios.get(`${quizServiceUrl}/health`, { timeout: 10000 });
    const apiKeyHealth = quizServiceHealth.data.apiKeyHealth || {};
    
    res.json(apiKeyHealth.keys || []);
  } catch (error) {
    console.error('Gemini keys fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

// Switch to a specific API key
app.post('/api/admin/gemini/keys/:keyId/switch', requireAdmin, async (req, res) => {
  try {
    const { keyId } = req.params;
    const quizServiceUrl = process.env.QUIZ_SERVICE_URL || 'http://localhost:3003';
    // Call quiz service to switch key
    const response = await axios.post(`${quizServiceUrl}/api/admin/switch-api-key`, { keyId }, { timeout: 10000 });
    res.json({ message: 'API key switched successfully', currentKey: keyId });
  } catch (error) {
    console.error('Key switch error:', error);
    res.status(500).json({ error: 'Failed to switch API key' });
  }
});

// Add a new API key
app.post('/api/admin/gemini/keys', requireAdmin, async (req, res) => {
  try {
    const { apiKey, label } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const quizServiceUrl = process.env.QUIZ_SERVICE_URL || 'http://localhost:3003';
    // Call quiz service to add new key
    const response = await axios.post(`${quizServiceUrl}/api/admin/add-api-key`, {
      apiKey,
      label: label || 'Additional Key'
    }, { timeout: 10000 });

    res.json({ message: 'API key added successfully', key: response.data });
  } catch (error) {
    console.error('Key addition error:', error);
    res.status(500).json({ error: 'Failed to add API key' });
  }
});

// Remove an API key
app.delete('/api/admin/gemini/keys/:keyId', requireAdmin, async (req, res) => {
  try {
    const { keyId } = req.params;
    const quizServiceUrl = process.env.QUIZ_SERVICE_URL || 'http://localhost:3003';
    
    // Call quiz service to remove key
    await axios.delete(`${quizServiceUrl}/api/admin/remove-api-key/${keyId}`, { timeout: 10000 });
    
    res.json({ message: 'API key removed successfully' });
  } catch (error) {
    console.error('Key removal error:', error);
    res.status(500).json({ error: 'Failed to remove API key' });
  }
});

// ==================== EMAIL TEMPLATES ====================

const EmailTemplate = require('./models/EmailTemplate');

// Get all email templates
app.get('/api/admin/email-templates', requireAdmin, async (req, res) => {
  try {
    const templates = await EmailTemplate.find().sort({ name: 1 });
    res.json(templates);
  } catch (error) {
    console.error('Email templates fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch email templates' });
  }
});

// Get a specific email template
app.get('/api/admin/email-templates/:id', requireAdmin, async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    console.error('Email template fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch email template' });
  }
});

// Create a new email template
app.post('/api/admin/email-templates', requireAdmin, async (req, res) => {
  try {
    const template = new EmailTemplate(req.body);
    await template.save();
    res.status(201).json(template);
  } catch (error) {
    console.error('Email template creation error:', error);
    res.status(500).json({ error: 'Failed to create email template' });
  }
});

// Update an email template
app.put('/api/admin/email-templates/:id', requireAdmin, async (req, res) => {
  try {
    const template = await EmailTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    console.error('Email template update error:', error);
    res.status(500).json({ error: 'Failed to update email template' });
  }
});

// Delete an email template
app.delete('/api/admin/email-templates/:id', requireAdmin, async (req, res) => {
  try {
    const template = await EmailTemplate.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Email template deletion error:', error);
    res.status(500).json({ error: 'Failed to delete email template' });
  }
});

// Test send an email template
app.post('/api/admin/email-templates/:id/test', requireAdmin, async (req, res) => {
  try {
    const { email, variables } = req.body;
    const template = await EmailTemplate.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Render template with variables
    let subject = template.subject;
    let body = template.body;
    
    if (variables) {
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, variables[key]);
        body = body.replace(regex, variables[key]);
      });
    }

    // Send test email via auth service
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3002';
    await axios.post(`${authServiceUrl}/api/email/send`, {
      to: email,
      subject: `[TEST] ${subject}`,
      html: body
    }, { timeout: 10000 });

    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Failed to send test email' });
  }
});

// ==================== USER MANAGEMENT ====================

// Get all users with pagination and filters
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', role = '', status = '' } = req.query;
    
    // Build query filters
    const filters = {};
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) filters.role = role;
    if (status) filters.status = status;

    // Fetch users from auth service database
    const User = mongoose.connection.collection('users');
    const total = await User.countDocuments(filters);
    const users = await User.find(filters)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      users: users.map(user => ({
        ...user,
        password: undefined // Don't send password
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user statistics (MUST be before /:id route)
app.get('/api/admin/users/stats', requireAdmin, async (req, res) => {
  try {
    const User = mongoose.connection.collection('users');
    
    // Debug: Check actual data structure
    const sampleUser = await User.findOne();
    console.log('Sample user for stats:', sampleUser ? { role: sampleUser.role, status: sampleUser.status } : 'No users found');
    
    const [
      totalUsers,
      activeUsers,
      students,
      teachers,
      moderators,
      admins
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'online' }),
      User.countDocuments({ role: 'Student' }),
      User.countDocuments({ role: 'Teacher' }),
      User.countDocuments({ role: 'Moderator' }),
      User.countDocuments({ role: 'Admin' })
    ]);
    
    console.log('User stats:', { totalUsers, activeUsers, students, teachers, moderators, admins });

    res.json({
      success: true,
      data: {
        total: totalUsers,
        active: activeUsers,
        students: students,
        teachers: teachers,
        moderators: moderators,
        admins: admins
      }
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Get a specific user
app.get('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const User = mongoose.connection.collection('users');
    const user = await User.findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    delete user.password;
    res.json(user);
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user
app.put('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    const User = mongoose.connection.collection('users');
    
    const result = await User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      { 
        $set: { 
          name, 
          email, 
          role, 
          status,
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }

    delete result.password;
    res.json(result);
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const User = mongoose.connection.collection('users');
    const result = await User.deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ==================== QUIZ MANAGEMENT ====================

// Get all quizzes with pagination and filters
app.get('/api/admin/quizzes', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 100, search = '', status = '' } = req.query;
    
    const filters = {};
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) filters.status = status;

    const Quiz = mongoose.connection.collection('quizzes');
    const total = await Quiz.countDocuments(filters);
    const quizzes = await Quiz.find(filters)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      quizzes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Quizzes fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// Get quiz statistics (MUST be before /:id route)
app.get('/api/admin/quizzes/stats', requireAdmin, async (req, res) => {
  try {
    const Quiz = mongoose.connection.collection('quizzes');
    
    // Debug: Check actual data structure
    const sampleQuiz = await Quiz.findOne();
    console.log('Sample quiz for stats:', sampleQuiz ? { status: sampleQuiz.status, difficulty: sampleQuiz.difficulty } : 'No quizzes found');
    
    const [
      totalQuizzes,
      publicQuizzes,
      privateQuizzes,
      easyQuizzes,
      mediumQuizzes,
      hardQuizzes
    ] = await Promise.all([
      Quiz.countDocuments(),
      Quiz.countDocuments({ isPublic: true }),
      Quiz.countDocuments({ isPublic: false }),
      Quiz.countDocuments({ difficulty: 'Easy' }),
      Quiz.countDocuments({ difficulty: 'Medium' }),
      Quiz.countDocuments({ difficulty: 'Hard' })
    ]);
    
    console.log('Quiz stats:', { totalQuizzes, publicQuizzes, privateQuizzes, easyQuizzes, mediumQuizzes, hardQuizzes });

    res.json({
      success: true,
      data: {
        total: totalQuizzes,
        public: publicQuizzes,
        private: privateQuizzes,
        aiGenerated: 0, // Not tracked yet
        easy: easyQuizzes,
        medium: mediumQuizzes,
        hard: hardQuizzes
      }
    });
  } catch (error) {
    console.error('Quiz stats error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz statistics' });
  }
});

// Get a specific quiz
app.get('/api/admin/quizzes/:id', requireAdmin, async (req, res) => {
  try {
    const Quiz = mongoose.connection.collection('quizzes');
    const quiz = await Quiz.findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    res.json(quiz);
  } catch (error) {
    console.error('Quiz fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// Update quiz status
app.put('/api/admin/quizzes/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const Quiz = mongoose.connection.collection('quizzes');
    
    const result = await Quiz.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Quiz status update error:', error);
    res.status(500).json({ error: 'Failed to update quiz status' });
  }
});

// Delete quiz
app.delete('/api/admin/quizzes/:id', requireAdmin, async (req, res) => {
  try {
    const Quiz = mongoose.connection.collection('quizzes');
    const result = await Quiz.deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Quiz deletion error:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

// ==================== REPORT MANAGEMENT ====================

const Report = require('./models/Report');

// Get all reports with pagination and filters
app.get('/api/admin/reports', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, type = '', status = '' } = req.query;
    
    const filters = {};
    if (type) filters.type = type;
    if (status) filters.status = status;

    const total = await Report.countDocuments(filters);
    const reports = await Report.find(filters)
      .populate('userId', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      reports,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Reports fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get report statistics (MUST be before /:id route)
app.get('/api/admin/reports/stats', requireAdmin, async (req, res) => {
  try {
    const [
      totalReports,
      pendingReports,
      resolvedReports,
      rejectedReports
    ] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      Report.countDocuments({ status: 'resolved' }),
      Report.countDocuments({ status: 'rejected' })
    ]);

    res.json({
      success: true,
      data: {
        total: totalReports,
        pending: pendingReports,
        resolved: resolvedReports,
        rejected: rejectedReports
      }
    });
  } catch (error) {
    console.error('Report stats error:', error);
    res.status(500).json({ error: 'Failed to fetch report statistics' });
  }
});

// Get a specific report
app.get('/api/admin/reports/:id', requireAdmin, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('resolvedBy', 'name email');
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json(report);
  } catch (error) {
    console.error('Report fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Resolve a report
app.post('/api/admin/reports/:id/resolve', requireAdmin, async (req, res) => {
  try {
    const { resolution } = req.body;
    
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status: 'resolved',
        resolution,
        resolvedBy: req.user._id,
        resolvedAt: new Date()
      },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Report resolution error:', error);
    res.status(500).json({ error: 'Failed to resolve report' });
  }
});

// Reject a report
app.post('/api/admin/reports/:id/reject', requireAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        resolution: reason,
        resolvedBy: req.user._id,
        resolvedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'name email').populate('resolvedBy', 'name email');

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Report rejection error:', error);
    res.status(500).json({ error: 'Failed to reject report' });
  }
});

// ==================== DASHBOARD STATISTICS ====================

app.get('/api/admin/dashboard/stats', requireAdmin, async (req, res) => {
  try {
    const User = mongoose.connection.collection('users');
    const Quiz = mongoose.connection.collection('quizzes');
    
    const [
      totalUsers,
      activeUsers,
      totalQuizzes,
      pendingReports
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'online' }),
      Quiz.countDocuments(),
      Report.countDocuments({ status: 'pending' })
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers
        },
        quizzes: {
          total: totalQuizzes
        },
        reports: {
          pending: pendingReports
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get system metrics
app.get('/api/admin/dashboard/metrics', requireAdmin, async (req, res) => {
  try {
    const User = mongoose.connection.collection('users');
    const Quiz = mongoose.connection.collection('quizzes');
    
    // Get metrics over time (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const [newUsers, newQuizzes] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Quiz.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
    ]);
    
    res.json({
      success: true,
      data: {
        newUsers,
        newQuizzes,
        serverUptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch system metrics' });
  }
});

// ==================== SERVICE MONITORING ====================

// Service Log Schema (with TTL for auto-cleanup)
const ServiceLogSchema = new mongoose.Schema({
  serviceName: { type: String, required: true, index: true },
  level: { type: String, enum: ['error', 'warn', 'info', 'debug'], default: 'info', index: true },
  message: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  stack: String,
  timestamp: { type: Date, default: Date.now, index: true },
  createdAt: { type: Date, default: Date.now, expires: 604800 } // Auto-delete after 7 days
});

const ServiceLog = mongoose.model('ServiceLog', ServiceLogSchema);

// Microservices configuration
const MICROSERVICES = {
  'API Gateway': { url: process.env.API_GATEWAY_URL || 'http://localhost:3000', port: 3000 },
  'Auth Service': { url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001', port: 3001 },
  'Quiz Service': { url: process.env.QUIZ_SERVICE_URL || 'http://localhost:3002', port: 3002 },
  'Result Service': { url: process.env.RESULT_SERVICE_URL || 'http://localhost:3003', port: 3003 },
  'Live Service': { url: process.env.LIVE_SERVICE_URL || 'http://localhost:3004', port: 3004 },
  'Social Service': { url: process.env.SOCIAL_SERVICE_URL || 'http://localhost:3006', port: 3006 },
  'Gamification Service': { url: process.env.GAMIFICATION_SERVICE_URL || 'http://localhost:3007', port: 3007 },
  'Moderation Service': { url: process.env.MODERATION_SERVICE_URL || 'http://localhost:3008', port: 3008 },
  'Meeting Service': { url: process.env.MEETING_SERVICE_URL || 'http://localhost:3009', port: 3009 }
};

// Health check all services
app.get('/api/admin/services/health', requireAdmin, async (req, res) => {
  try {
    const healthChecks = await Promise.allSettled(
      Object.entries(MICROSERVICES).map(async ([name, config]) => {
        const startTime = Date.now();
        try {
          // Try /health endpoint first, fallback to base URL
          const response = await axios.get(`${config.url}/health`, { 
            timeout: 5000,
            validateStatus: (status) => status < 500 // Accept any non-5xx as "up"
          });
          const responseTime = Date.now() - startTime;
          
          return {
            name,
            status: 'healthy',
            responseTime: `${responseTime}ms`,
            port: config.port,
            url: config.url,
            details: response.data
          };
        } catch (error) {
          const responseTime = Date.now() - startTime;
          return {
            name,
            status: 'unhealthy',
            responseTime: `${responseTime}ms`,
            port: config.port,
            url: config.url,
            error: error.message
          };
        }
      })
    );

    const results = healthChecks.map(result => 
      result.status === 'fulfilled' ? result.value : result.reason
    );

    const summary = {
      total: results.length,
      healthy: results.filter(r => r.status === 'healthy').length,
      unhealthy: results.filter(r => r.status === 'unhealthy').length,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: {
        summary,
        services: results
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Failed to check service health' });
  }
});

// Get detailed service statistics
app.get('/api/admin/services/stats', requireAdmin, async (req, res) => {
  try {
    const ServiceLog = mongoose.connection.collection('servicelogs');
    
    // Get log counts per service
    const logStats = await ServiceLog.aggregate([
      {
        $group: {
          _id: '$serviceName',
          totalLogs: { $sum: 1 },
          errors: { $sum: { $cond: [{ $eq: ['$level', 'error'] }, 1, 0] } },
          warnings: { $sum: { $cond: [{ $eq: ['$level', 'warn'] }, 1, 0] } },
          lastLog: { $max: '$timestamp' }
        }
      }
    ]).toArray();

    // Get recent error count (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentErrors = await ServiceLog.countDocuments({
      level: 'error',
      timestamp: { $gte: last24Hours }
    });

    // Get total logs in database
    const totalLogs = await ServiceLog.countDocuments();

    res.json({
      success: true,
      data: {
        totalLogs,
        recentErrors,
        serviceBreakdown: logStats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Service stats error:', error);
    res.status(500).json({ error: 'Failed to fetch service statistics' });
  }
});

// Receive logs from microservices (POST endpoint for services to send logs)
app.post('/api/admin/services/logs', async (req, res) => {
  try {
    const { serviceName, level, message, metadata, stack } = req.body;
    
    if (!serviceName || !message) {
      return res.status(400).json({ error: 'serviceName and message are required' });
    }

    // Create log entry
    const ServiceLog = mongoose.connection.collection('servicelogs');
    await ServiceLog.insertOne({
      serviceName,
      level: level || 'info',
      message,
      metadata: metadata || {},
      stack: stack || null,
      timestamp: new Date(),
      createdAt: new Date()
    });

    res.json({ success: true, message: 'Log received' });
  } catch (error) {
    console.error('Log ingestion error:', error);
    res.status(500).json({ error: 'Failed to store log' });
  }
});

// Get logs with pagination and filtering
app.get('/api/admin/services/logs', requireAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      serviceName = '', 
      level = '', 
      search = '',
      startDate = '',
      endDate = ''
    } = req.query;

    const filters = {};
    
    if (serviceName) filters.serviceName = serviceName;
    if (level) filters.level = level;
    if (search) {
      filters.$or = [
        { message: { $regex: search, $options: 'i' } },
        { 'metadata.error': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Date range filter
    if (startDate || endDate) {
      filters.timestamp = {};
      if (startDate) filters.timestamp.$gte = new Date(startDate);
      if (endDate) filters.timestamp.$lte = new Date(endDate);
    }

    const ServiceLog = mongoose.connection.collection('servicelogs');
    const total = await ServiceLog.countDocuments(filters);
    const logs = await ServiceLog.find(filters)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .toArray();

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Logs fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Clear old logs manually (admin action)
app.delete('/api/admin/services/logs/clear', requireAdmin, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const ServiceLog = mongoose.connection.collection('servicelogs');
    const result = await ServiceLog.deleteMany({ timestamp: { $lt: cutoffDate } });

    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} logs older than ${days} days`
    });
  } catch (error) {
    console.error('Log clearing error:', error);
    res.status(500).json({ error: 'Failed to clear logs' });
  }
});

// Get service uptime and metrics
app.get('/api/admin/services/:serviceName/metrics', requireAdmin, async (req, res) => {
  try {
    const { serviceName } = req.params;
    const ServiceLog = mongoose.connection.collection('servicelogs');
    
    // Get error rate over time (last 7 days, grouped by day)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const errorTrend = await ServiceLog.aggregate([
      {
        $match: {
          serviceName,
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            level: '$level'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]).toArray();

    // Get most common error messages
    const commonErrors = await ServiceLog.aggregate([
      {
        $match: {
          serviceName,
          level: 'error',
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: '$message',
          count: { $sum: 1 },
          lastOccurred: { $max: '$timestamp' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();

    res.json({
      success: true,
      data: {
        serviceName,
        errorTrend,
        commonErrors,
        period: '7 days'
      }
    });
  } catch (error) {
    console.error('Service metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch service metrics' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Admin Service running on port ${PORT}`);
  console.log(`📊 Admin Portal: ${process.env.ADMIN_FRONTEND_URL || 'http://localhost:5174'}`);
});

module.exports = app;
