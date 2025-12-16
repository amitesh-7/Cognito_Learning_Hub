const axios = require('axios');

/**
 * Logger utility for microservices to send logs to Admin Service
 * Includes automatic memory management through TTL (logs auto-delete after 7 days)
 */
class ServiceLogger {
  constructor(serviceName, adminServiceUrl) {
    this.serviceName = serviceName;
    this.adminServiceUrl = adminServiceUrl || process.env.ADMIN_SERVICE_URL || 'http://localhost:3011';
    this.logEndpoint = `${this.adminServiceUrl}/api/admin/services/logs`;
    this.queue = [];
    this.batchSize = 10;
    this.flushInterval = 5000; // 5 seconds
    
    // Start periodic flush
    this.startPeriodicFlush();
  }

  /**
   * Log an error message
   */
  error(message, metadata = {}, stack = null) {
    this.log('error', message, metadata, stack);
    // Also log to console for immediate visibility
    console.error(`[${this.serviceName}] ERROR:`, message, metadata);
  }

  /**
   * Log a warning message
   */
  warn(message, metadata = {}) {
    this.log('warn', message, metadata);
    console.warn(`[${this.serviceName}] WARN:`, message, metadata);
  }

  /**
   * Log an info message
   */
  info(message, metadata = {}) {
    this.log('info', message, metadata);
    console.log(`[${this.serviceName}] INFO:`, message, metadata);
  }

  /**
   * Log a debug message
   */
  debug(message, metadata = {}) {
    this.log('debug', message, metadata);
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${this.serviceName}] DEBUG:`, message, metadata);
    }
  }

  /**
   * Internal log method - adds to queue for batch sending
   */
  log(level, message, metadata = {}, stack = null) {
    const logEntry = {
      serviceName: this.serviceName,
      level,
      message,
      metadata,
      stack,
      timestamp: new Date().toISOString()
    };

    this.queue.push(logEntry);

    // Flush immediately for errors
    if (level === 'error') {
      this.flush();
    }
    // Flush if batch size reached
    else if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Send queued logs to admin service
   */
  async flush() {
    if (this.queue.length === 0) return;

    const logsToSend = [...this.queue];
    this.queue = [];

    try {
      // Send logs in parallel to avoid blocking
      await Promise.all(
        logsToSend.map(log => 
          axios.post(this.logEndpoint, log, {
            timeout: 3000,
            headers: { 'Content-Type': 'application/json' }
          }).catch(err => {
            // Silently fail to avoid recursive errors
            console.error(`Failed to send log to admin service:`, err.message);
          })
        )
      );
    } catch (error) {
      // Re-queue failed logs (up to a limit to prevent memory issues)
      if (this.queue.length < 100) {
        this.queue.unshift(...logsToSend);
      }
    }
  }

  /**
   * Start periodic flushing of logs
   */
  startPeriodicFlush() {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Wrap Express error handler to auto-log errors
   */
  errorMiddleware() {
    return (err, req, res, next) => {
      this.error(
        err.message || 'Internal server error',
        {
          path: req.path,
          method: req.method,
          statusCode: err.statusCode || 500,
          userId: req.user?.id
        },
        err.stack
      );
      next(err);
    };
  }

  /**
   * Wrap async route handlers to catch errors
   */
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(err => {
        this.error(
          err.message || 'Async handler error',
          {
            path: req.path,
            method: req.method
          },
          err.stack
        );
        next(err);
      });
    };
  }
}

/**
 * Create and export a singleton logger instance
 */
function createLogger(serviceName, adminServiceUrl) {
  return new ServiceLogger(serviceName, adminServiceUrl);
}

module.exports = { ServiceLogger, createLogger };
