/**
 * Example: How to integrate Service Monitoring Logger in your microservice
 * 
 * This file demonstrates best practices for logging to the Admin Service
 */

const express = require('express');
const { createLogger } = require('../shared/utils/serviceLogger');

// Initialize your service
const app = express();
const SERVICE_NAME = 'Example Service'; // Change to your service name
const PORT = 3005; // Change to your service port

// Create logger instance
const logger = createLogger(SERVICE_NAME, process.env.ADMIN_SERVICE_URL);

// ==================== BASIC LOGGING EXAMPLES ====================

// Example 1: Log info messages (general operations)
app.get('/api/example', async (req, res) => {
  logger.info('Example endpoint accessed', {
    userId: req.user?.id,
    ip: req.ip
  });
  
  res.json({ message: 'Success' });
});

// Example 2: Log errors with full context
app.post('/api/example', async (req, res) => {
  try {
    // Your business logic
    const result = await someOperation();
    
    logger.info('Operation completed successfully', {
      userId: req.user?.id,
      resultId: result._id
    });
    
    res.json(result);
  } catch (error) {
    // Log error with metadata and stack trace
    logger.error('Operation failed', {
      userId: req.user?.id,
      operation: 'someOperation',
      input: req.body
    }, error.stack);
    
    res.status(500).json({ error: 'Operation failed' });
  }
});

// Example 3: Log warnings (non-critical issues)
app.post('/api/example/bulk', async (req, res) => {
  const items = req.body.items;
  
  if (items.length > 100) {
    logger.warn('Large batch operation detected', {
      userId: req.user?.id,
      itemCount: items.length,
      threshold: 100
    });
  }
  
  // Process items...
  res.json({ processed: items.length });
});

// Example 4: Debug logging (development only)
app.get('/api/example/:id', async (req, res) => {
  logger.debug('Fetching item by ID', {
    itemId: req.params.id,
    query: req.query
  });
  
  const item = await findItem(req.params.id);
  res.json(item);
});

// ==================== MIDDLEWARE INTEGRATION ====================

// Example 5: Using error middleware wrapper
app.use(logger.errorMiddleware());

// Example 6: Async handler wrapper (catches async errors automatically)
app.post('/api/example/async', logger.asyncHandler(async (req, res) => {
  // This will automatically catch and log any errors
  const result = await someAsyncOperation();
  res.json(result);
}));

// ==================== COMMON PATTERNS ====================

// Example 7: Database operation errors
app.post('/api/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    
    logger.info('User created', {
      userId: user._id,
      email: user.email,
      role: user.role
    });
    
    res.json(user);
  } catch (error) {
    if (error.code === 11000) {
      logger.warn('Duplicate user creation attempt', {
        email: req.body.email,
        error: error.message
      });
      res.status(409).json({ error: 'User already exists' });
    } else {
      logger.error('User creation failed', {
        email: req.body.email,
        error: error.message
      }, error.stack);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
});

// Example 8: External API call failures
app.get('/api/external-data', async (req, res) => {
  try {
    const response = await axios.get('https://external-api.com/data');
    
    logger.info('External API call successful', {
      endpoint: 'https://external-api.com/data',
      statusCode: response.status
    });
    
    res.json(response.data);
  } catch (error) {
    logger.error('External API call failed', {
      endpoint: 'https://external-api.com/data',
      statusCode: error.response?.status,
      error: error.message
    }, error.stack);
    
    res.status(503).json({ error: 'External service unavailable' });
  }
});

// Example 9: Authentication failures
app.post('/api/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    
    if (!user) {
      logger.warn('Login attempt with non-existent email', {
        email: req.body.email,
        ip: req.ip
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    
    if (!validPassword) {
      logger.warn('Failed login attempt', {
        userId: user._id,
        email: user.email,
        ip: req.ip
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    logger.info('User logged in', {
      userId: user._id,
      email: user.email,
      ip: req.ip
    });
    
    // Generate token and respond...
    res.json({ token: '...' });
  } catch (error) {
    logger.error('Login error', {
      email: req.body.email,
      error: error.message
    }, error.stack);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Example 10: Rate limiting warnings
const requestCounts = new Map();

app.use((req, res, next) => {
  const userId = req.user?.id || req.ip;
  const count = requestCounts.get(userId) || 0;
  requestCounts.set(userId, count + 1);
  
  if (count > 100) {
    logger.warn('High request rate detected', {
      userId,
      requestCount: count,
      path: req.path
    });
  }
  
  next();
});

// ==================== STARTUP AND SHUTDOWN ====================

// Log service startup
app.listen(PORT, () => {
  logger.info(`${SERVICE_NAME} started`, {
    port: PORT,
    env: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
  console.log(`🚀 ${SERVICE_NAME} running on port ${PORT}`);
});

// Log graceful shutdown
process.on('SIGTERM', () => {
  logger.warn('SIGTERM received, shutting down gracefully', {
    uptime: process.uptime()
  });
  
  // Close connections, cleanup, etc.
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.warn('SIGINT received, shutting down', {
    uptime: process.uptime()
  });
  process.exit(0);
});

// Log unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason: reason?.message || reason,
    promise: promise.toString()
  }, reason?.stack);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message
  }, error.stack);
  
  // Exit process after logging
  process.exit(1);
});

// ==================== HELPER FUNCTIONS (for examples) ====================

async function someOperation() {
  // Simulate operation
  return { _id: '123', status: 'completed' };
}

async function someAsyncOperation() {
  return { result: 'success' };
}

async function findItem(id) {
  return { _id: id, name: 'Example Item' };
}

// ==================== BEST PRACTICES SUMMARY ====================

/**
 * 1. LOG LEVELS:
 *    - error: Critical failures that need immediate attention
 *    - warn: Issues that should be monitored but don't break functionality
 *    - info: Important business events (user actions, successful operations)
 *    - debug: Detailed information for troubleshooting (development only)
 * 
 * 2. METADATA:
 *    - Always include userId when available
 *    - Include relevant context (IDs, input data, operation type)
 *    - Don't log sensitive data (passwords, tokens, credit cards)
 * 
 * 3. ERROR LOGGING:
 *    - Always include error.stack for debugging
 *    - Include operation context (what were you trying to do?)
 *    - Log before and after critical operations
 * 
 * 4. PERFORMANCE:
 *    - Logger batches logs automatically (no performance impact)
 *    - Errors are sent immediately for faster alerting
 *    - Failed log sends don't block your service
 * 
 * 5. MEMORY MANAGEMENT:
 *    - Logs auto-delete after 7 days (MongoDB TTL)
 *    - Queue limited to 100 logs max
 *    - Batch size of 10 logs prevents excessive memory use
 */

module.exports = app;
