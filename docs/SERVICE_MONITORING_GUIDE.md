# Service Monitoring Integration Guide

## Overview
The Admin Portal now includes comprehensive service monitoring with:
- **Health checks** for all 10 microservices
- **Centralized log aggregation** from all services
- **Real-time error tracking** and alerts
- **Automatic log cleanup** (7-day TTL for memory management)
- **Service performance metrics** and trends

## Backend API Endpoints

### Health Check
- **GET** `/api/admin/services/health` - Check health of all microservices
- Returns status, response time, and details for each service

### Service Statistics
- **GET** `/api/admin/services/stats` - Get aggregated log statistics
- Returns total logs, recent errors, breakdown by service

### Log Management
- **GET** `/api/admin/services/logs` - Retrieve logs with pagination and filtering
  - Query params: `page`, `limit`, `serviceName`, `level`, `search`, `startDate`, `endDate`
- **POST** `/api/admin/services/logs` - Receive logs from microservices (public endpoint)
- **DELETE** `/api/admin/services/logs/clear?days=7` - Manually clear old logs

### Service Metrics
- **GET** `/api/admin/services/:serviceName/metrics` - Get detailed metrics for a service
  - Returns error trends, common errors, and patterns

## Integrating Logger in Microservices

### 1. Install the Logger Utility

```javascript
const { createLogger } = require('../shared/utils/serviceLogger');

// Create logger instance for your service
const logger = createLogger('Quiz Service', process.env.ADMIN_SERVICE_URL);
```

### 2. Use Logger in Your Code

```javascript
// Log errors
try {
  // Your code here
} catch (error) {
  logger.error('Failed to create quiz', {
    userId: req.user?.id,
    quizData: req.body
  }, error.stack);
  res.status(500).json({ error: 'Failed to create quiz' });
}

// Log warnings
logger.warn('High API usage detected', {
  userId: req.user?.id,
  requestCount: userRequestCount
});

// Log info
logger.info('Quiz created successfully', {
  quizId: newQuiz._id,
  userId: req.user?.id
});

// Log debug (only in development)
logger.debug('Processing quiz questions', {
  questionCount: questions.length
});
```

### 3. Use Error Middleware

```javascript
// Add at the end of your Express app
app.use(logger.errorMiddleware());
```

### 4. Wrap Async Handlers (Optional)

```javascript
app.post('/api/quizzes', logger.asyncHandler(async (req, res) => {
  const quiz = await Quiz.create(req.body);
  res.json(quiz);
}));
```

## Memory Management Features

### Automatic Log Cleanup
- **TTL Index**: Logs automatically deleted after 7 days
- **MongoDB Native**: Uses MongoDB TTL index (`expires: 604800` seconds)
- **Zero maintenance**: No manual cleanup needed

### Batch Processing
- **Queue System**: Logs batched before sending (default: 10 logs)
- **Periodic Flush**: Automatic flush every 5 seconds
- **Immediate Errors**: Error logs sent immediately

### Memory Limits
- **Queue Limit**: Max 100 logs in queue to prevent memory overflow
- **Failed Log Handling**: Failed logs re-queued with limit
- **Non-blocking**: Async sending doesn't block service operations

## Frontend Features

### Service Monitoring Page (`/services`)
- **Health Status Dashboard**: Real-time status of all 10 microservices
- **Auto-refresh**: Optional 30-second auto-refresh
- **Service Details**: Port, URL, response time, error messages
- **Log Filtering**: Filter by service, log level, search text, date range
- **Pagination**: 50 logs per page with navigation
- **Statistics Cards**: Total services, healthy/unhealthy count, recent errors
- **Log Breakdown**: Per-service statistics with error/warning counts

### Log Display Features
- **Color-coded levels**: Error (red), Warning (yellow), Info (blue), Debug (gray)
- **Stack traces**: Expandable stack trace details for errors
- **Timestamps**: Human-readable timestamps with seconds
- **Real-time updates**: Auto-refresh keeps data current
- **Manual refresh**: Refresh all data with one button

## Environment Variables

Add to each microservice `.env`:

```env
ADMIN_SERVICE_URL=http://localhost:3011
# Or for production:
ADMIN_SERVICE_URL=https://your-admin-service.onrender.com
```

## Example: Quiz Service Integration

```javascript
const express = require('express');
const { createLogger } = require('../shared/utils/serviceLogger');

const app = express();
const logger = createLogger('Quiz Service');

// Use in routes
app.post('/api/quizzes', async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    logger.info('Quiz created', { quizId: quiz._id, userId: req.user?.id });
    res.json(quiz);
  } catch (error) {
    logger.error('Quiz creation failed', {
      userId: req.user?.id,
      error: error.message
    }, error.stack);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// Add error middleware
app.use(logger.errorMiddleware());

app.listen(3002, () => {
  logger.info('Quiz Service started', { port: 3002 });
});
```

## Benefits

✅ **Centralized Monitoring**: All service logs in one place
✅ **Memory Efficient**: Automatic cleanup, batching, and limits
✅ **Real-time Visibility**: See errors as they happen
✅ **Easy Integration**: Simple API, minimal code changes
✅ **Production Ready**: Handles failures gracefully
✅ **No External Tools**: Uses existing MongoDB infrastructure
✅ **Scalable**: Handles high log volume with batching
✅ **Secure**: Admin-only access to logs and health checks

## Production Deployment

1. **Deploy Admin Service** with MongoDB connection
2. **Set environment variables** in all microservices
3. **Integrate logger** in each service's error handlers
4. **Monitor the dashboard** at `/services` route
5. **Set up alerts** based on error counts (future enhancement)

## Performance Impact

- **Minimal overhead**: Async logging doesn't block requests
- **Batch processing**: Reduces network calls
- **TTL cleanup**: No manual maintenance needed
- **Failed sends**: Silently handled, won't crash service
- **Development mode**: Debug logs only in dev environment
