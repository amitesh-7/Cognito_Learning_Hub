# Security Implementation Guide

## 🔒 Overview

This guide covers the security measures implemented for production deployment, including Docker-based code sandboxing, rate limiting, and input validation.

---

## 🐳 Part 1: Docker Code Execution Sandbox

### What It Solves

- **Problem**: Direct code execution on host machine is dangerous
- **Risks**: File system access, malicious code execution, resource exhaustion
- **Solution**: Isolated Docker containers with strict resource limits

### Setup Instructions

#### 1. Build the Sandbox Image

```bash
cd microservices/quiz-service

# Build the Docker image
docker build -f Dockerfile.sandbox -t quiz-service-sandbox:latest .

# Verify the image
docker images | grep quiz-service-sandbox
```

#### 2. Make Entrypoint Script Executable (Linux/Mac)

```bash
chmod +x docker-entrypoint.sh
```

#### 3. Test the Sandbox

```bash
# Create a test file
echo 'console.log("Hello from sandbox!");' > test.js

# Run in sandbox
docker run --rm \
  --network none \
  --memory=128m \
  --cpus=0.5 \
  --volume "$(pwd)/test.js:/sandbox/code.js:ro" \
  --volume "/dev/null:/sandbox/input.txt:ro" \
  quiz-service-sandbox:latest \
  javascript \
  /sandbox/code.js \
  /sandbox/input.txt
```

Expected output: `Hello from sandbox!`

#### 4. Update Code Execution Service

Replace the old `codeExecutor.js` with `secureCodeExecutor.js`:

```javascript
// In microservices/quiz-service/routes/advancedQuestions.js
const { secureExecutor } = require("../services/secureCodeExecutor");

// Initialize sandbox on service startup
await secureExecutor.initialize();

// Use secure executor
router.post("/execute-code", async (req, res) => {
  const { code, language, testCases } = req.body;

  // Validate code before execution
  secureExecutor.validateCode(code, language);

  // Execute in sandbox
  const result = await secureExecutor.executeCode(code, language, testCases);
  res.json(result);
});
```

### Security Features

1. **Network Isolation**: `--network none` blocks all network access
2. **Resource Limits**:
   - Memory: 128MB max
   - CPU: 0.5 cores max
   - Time: 10-second timeout
3. **Read-Only Mounts**: Code files mounted as read-only
4. **Capability Dropping**: `--cap-drop=ALL` removes all Linux capabilities
5. **Process Limits**: `--pids-limit=50` prevents fork bombs
6. **Code Validation**: Pre-execution checks for forbidden patterns

### Forbidden Code Patterns

The validator blocks:

- `require('child_process')` - Process spawning
- `import subprocess` - Python subprocess
- `eval()` - Code injection
- `import os` - OS access
- File system operations
- Network operations

---

## 🚦 Part 2: Rate Limiting

### Implementation

Rate limiting is now implemented at multiple levels:

#### General API Rate Limit

- **Limit**: 100 requests / 15 minutes
- **Scope**: All API endpoints
- **Storage**: Redis (distributed across instances)

#### Endpoint-Specific Limits

1. **Code Execution**: 30 executions / 15 min per user
2. **Quiz Submission**: 20 submissions / hour per user
3. **AI Insights**: 5 generations / day per user
4. **Login**: 5 attempts / 15 min per IP
5. **Registration**: 3 registrations / hour per IP

### Setup Instructions

#### 1. Install Dependencies

```bash
cd microservices/shared
npm install express-rate-limit rate-limit-redis redis
```

#### 2. Start Redis

```bash
# Docker
docker run -d -p 6379:6379 redis:alpine

# Or Windows WSL
wsl -d Ubuntu
sudo service redis-server start
```

#### 3. Apply Rate Limiters

Update each microservice's main file:

```javascript
// microservices/quiz-service/index.js
const {
  generalLimiter,
  codeExecutionLimiter,
  quizSubmissionLimiter,
} = require("../shared/middleware/rateLimiter");

// Apply general limiter to all routes
app.use(generalLimiter);

// Apply specific limiters
app.post("/api/advanced-questions/execute-code", codeExecutionLimiter, ...);
app.post("/api/quiz/submit", quizSubmissionLimiter, ...);
```

#### 4. Configure Environment Variables

```env
# .env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_password
RATE_LIMIT_WHITELIST=127.0.0.1,::1
```

### Testing Rate Limits

```bash
# Test general rate limit
for i in {1..101}; do
  curl http://localhost:3000/api/quizzes
done

# Should receive 429 Too Many Requests after 100 requests
```

---

## ✅ Part 3: Input Validation

### Implementation

All API endpoints now use Joi validation schemas.

### Setup Instructions

#### 1. Install Joi

```bash
cd microservices/shared
npm install joi
```

#### 2. Apply Validation Middleware

```javascript
// microservices/quiz-service/routes/quiz.js
const {
  validate,
  quizSchema,
  quizSubmissionSchema,
} = require("../../shared/middleware/validator");

// Validate quiz creation
router.post("/create", validate(quizSchema), async (req, res) => {
  // req.body is now validated and sanitized
  const quiz = new Quiz(req.body);
  await quiz.save();
  res.json({ success: true, quiz });
});

// Validate quiz submission
router.post("/submit", validate(quizSubmissionSchema), async (req, res) => {
  // Validated submission data
  const { quizId, answers, totalTime } = req.body;
  // Process submission...
});
```

### Validation Schemas Available

1. **registerSchema**: User registration
2. **loginSchema**: User login
3. **quizSchema**: Quiz creation
4. **codeExecutionSchema**: Code execution
5. **quizSubmissionSchema**: Quiz submission
6. **reasoningEvaluationSchema**: AI reasoning evaluation
7. **worldEventSchema**: World event creation
8. **questSchema**: Quest creation
9. **paginationSchema**: Pagination params
10. **objectIdSchema**: MongoDB ObjectId validation

### Example Validation Error Response

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "username",
      "message": "Username must be at least 3 characters"
    },
    {
      "field": "password",
      "message": "Password must contain uppercase, lowercase, number, and special character"
    }
  ]
}
```

---

## 🛡️ Part 4: Additional Security Headers

### Install Helmet

```bash
npm install helmet
```

### Apply Security Headers

```javascript
// microservices/api-gateway/index.js
const helmet = require("helmet");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);
```

---

## 🔐 Part 5: CORS Configuration

### Secure CORS Setup

```javascript
// microservices/api-gateway/index.js
const cors = require("cors");

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:5173",
    "http://localhost:3000",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  exposedHeaders: ["x-auth-token"],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
```

### Environment Variable

```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

## 📊 Part 6: Security Monitoring

### Log Security Events

```javascript
// microservices/shared/utils/securityLogger.js
const winston = require("winston");

const securityLogger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: "logs/security.log",
      level: "warn",
    }),
  ],
});

// Log suspicious activity
function logSecurityEvent(event, details) {
  securityLogger.warn({
    timestamp: new Date().toISOString(),
    event,
    ...details,
  });
}

module.exports = { logSecurityEvent };
```

### Monitor Rate Limit Violations

```javascript
// In rate limiter handler
handler: (req, res) => {
  logSecurityEvent("RATE_LIMIT_EXCEEDED", {
    ip: req.ip,
    endpoint: req.path,
    userAgent: req.get("user-agent"),
  });

  ApiResponse.tooManyRequests(res, "Too many requests");
};
```

---

## 🧪 Testing Security Measures

### 1. Test Docker Sandbox

```bash
# Try malicious code (should fail)
echo 'const fs = require("fs"); fs.readFileSync("/etc/passwd");' > malicious.js
docker run --rm \
  --network none \
  --memory=128m \
  --volume "$(pwd)/malicious.js:/sandbox/code.js:ro" \
  quiz-service-sandbox:latest \
  javascript /sandbox/code.js /sandbox/input.txt
```

Expected: Execution blocked by validation or fails safely in container

### 2. Test Rate Limiting

```bash
# Automated testing with Apache Bench
ab -n 101 -c 10 http://localhost:3000/api/quizzes

# Should show 429 errors after limit
```

### 3. Test Input Validation

```bash
# Send invalid data
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ab",
    "email": "invalid-email",
    "password": "weak"
  }'
```

Expected: 400 Bad Request with validation errors

---

## 📋 Security Checklist

Before deploying to production:

- [ ] Docker sandbox image built and tested
- [ ] Redis installed and running for rate limiting
- [ ] All rate limiters applied to appropriate endpoints
- [ ] Input validation schemas applied to all routes
- [ ] Helmet security headers configured
- [ ] CORS properly configured with allowed origins
- [ ] Security logging implemented
- [ ] Environment variables secured (not in git)
- [ ] SSL/TLS certificates configured
- [ ] Database credentials rotated
- [ ] API keys stored securely
- [ ] Regular security audits scheduled

---

## 🚀 Deployment Notes

### Production Environment Variables

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/prod
REDIS_HOST=your-redis-host.com
REDIS_PASSWORD=strong_redis_password
ALLOWED_ORIGINS=https://yourdomain.com
JWT_SECRET=very_long_random_secret_key
RATE_LIMIT_WHITELIST=
```

### Docker Compose for Sandbox

```yaml
# docker-compose.yml
version: "3.8"
services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --requirepass ${REDIS_PASSWORD}

  quiz-sandbox:
    build:
      context: ./microservices/quiz-service
      dockerfile: Dockerfile.sandbox
    image: quiz-service-sandbox:latest
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 128M

volumes:
  redis-data:
```

---

## 🆘 Troubleshooting

### Docker Permission Errors

```bash
# Windows: Run Docker as administrator
# Linux: Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Redis Connection Errors

```bash
# Test Redis connection
redis-cli ping

# Should return: PONG
```

### Rate Limit Not Working

```bash
# Check Redis keys
redis-cli KEYS "rl:*"

# Clear rate limit cache
redis-cli FLUSHDB
```

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Express Rate Limit Docs](https://github.com/express-rate-limit/express-rate-limit)
- [Joi Validation Guide](https://joi.dev/api/)
- [Helmet.js Documentation](https://helmetjs.github.io/)

---

## ✅ Summary

**Implemented Security Features:**

- ✅ Docker-based code sandboxing with resource limits
- ✅ Multi-level rate limiting (Redis-backed)
- ✅ Comprehensive input validation (Joi schemas)
- ✅ Security headers (Helmet)
- ✅ CORS configuration
- ✅ Security event logging
- ✅ Code pattern validation

**Security Score:** 🟢 **Production Ready** (after completing checklist)

**Remaining Tasks:**

- Deploy to production environment
- Configure SSL/TLS
- Set up monitoring and alerts
- Schedule security audits
- Implement backup strategy
