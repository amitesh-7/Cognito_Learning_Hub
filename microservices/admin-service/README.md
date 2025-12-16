# Admin Service Documentation

## Overview
The Admin Service provides backend APIs for the Admin Portal, enabling comprehensive system monitoring, user management, quiz oversight, and operational controls for Cognito Learning Hub.

**Port:** 3007  
**Database:** MongoDB (shared with other microservices)  
**Authentication:** JWT-based admin role verification

---

## Architecture

### Service Dependencies
- **Auth Service** (3002): User authentication and verification
- **Quiz Service** (3003): Quiz data and Gemini API monitoring
- **MongoDB**: Shared database for users, quizzes, email templates, and reports
- **API Gateway** (3000): Routes `/api/admin/*` requests to admin service

### Authentication Flow
```
Client Request → API Gateway → Admin Service → requireAdmin Middleware
                                                ↓
                                    Verify JWT with Auth Service
                                                ↓
                                    Check if user.role === 'admin'
                                                ↓
                                    Allow/Deny Request
```

---

## API Endpoints

### Health Check
```http
GET /health
```
Returns service health status and uptime.

**Response:**
```json
{
  "status": "healthy",
  "service": "admin-service",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Service Monitoring

### Get All Services Health
```http
GET /api/admin/services/health
Authorization: Bearer <admin-token>
```

Checks health status of all microservices in parallel.

**Response:**
```json
[
  {
    "name": "Auth Service",
    "port": 3002,
    "status": "healthy",
    "uptime": 3600,
    "memory": { "heapUsed": "45MB", "heapTotal": "120MB" },
    "cpu": 12.5,
    "database": "connected",
    "lastCheck": "2024-01-15T10:30:00.000Z"
  },
  {
    "name": "Quiz Service",
    "port": 3003,
    "status": "unhealthy",
    "error": "Connection timeout",
    "lastCheck": "2024-01-15T10:30:00.000Z"
  }
]
```

### Restart Service
```http
POST /api/admin/services/:serviceName/restart
Authorization: Bearer <admin-token>
```

**Parameters:**
- `serviceName`: Name of the service to restart (e.g., "quiz-service")

**Response:**
```json
{
  "message": "Restart request sent for quiz-service",
  "status": "pending",
  "note": "Manual restart required - PM2 integration needed"
}
```

---

## Gemini API Monitoring

### Get Gemini Statistics
```http
GET /api/admin/gemini/stats
Authorization: Bearer <admin-token>
```

Returns aggregated statistics about Gemini API keys.

**Response:**
```json
{
  "totalKeys": 3,
  "healthyKeys": 2,
  "unhealthyKeys": 1,
  "currentKeyIndex": 0,
  "circuitBreakerStatus": "CLOSED",
  "keys": [
    {
      "id": "primary",
      "label": "Primary Key",
      "isHealthy": true,
      "requestCount": 1250,
      "errorCount": 5,
      "lastUsed": "2024-01-15T10:25:00.000Z",
      "rateLimit": { "limit": 1500, "remaining": 245, "resetAt": "2024-01-15T11:00:00.000Z" }
    }
  ]
}
```

### Get All API Keys
```http
GET /api/admin/gemini/keys
Authorization: Bearer <admin-token>
```

Returns detailed information about all Gemini API keys.

### Switch API Key
```http
POST /api/admin/gemini/keys/:keyId/switch
Authorization: Bearer <admin-token>
```

Manually switches to a specific API key.

**Response:**
```json
{
  "message": "API key switched successfully",
  "currentKey": "fallback-1"
}
```

### Add New API Key
```http
POST /api/admin/gemini/keys
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Body:**
```json
{
  "apiKey": "AIza...",
  "label": "Backup Key 3"
}
```

**Response:**
```json
{
  "message": "API key added successfully",
  "key": {
    "id": "backup-3",
    "label": "Backup Key 3",
    "isHealthy": true
  }
}
```

### Remove API Key
```http
DELETE /api/admin/gemini/keys/:keyId
Authorization: Bearer <admin-token>
```

---

## Email Template Management

### Get All Templates
```http
GET /api/admin/email-templates
Authorization: Bearer <admin-token>
```

Returns all email templates sorted by name.

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Welcome Email - Student",
    "type": "welcome",
    "subject": "Welcome to Cognito Learning Hub! 🎓",
    "body": "<!DOCTYPE html>...",
    "variables": [
      { "name": "userName", "description": "User's full name", "required": true }
    ],
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
]
```

### Get Specific Template
```http
GET /api/admin/email-templates/:id
Authorization: Bearer <admin-token>
```

### Create Template
```http
POST /api/admin/email-templates
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Custom Template",
  "type": "custom",
  "subject": "Important Update",
  "body": "<html>...</html>",
  "variables": [
    { "name": "userName", "description": "User name", "required": true }
  ],
  "isActive": true
}
```

### Update Template
```http
PUT /api/admin/email-templates/:id
Authorization: Bearer <admin-token>
Content-Type: application/json
```

### Delete Template
```http
DELETE /api/admin/email-templates/:id
Authorization: Bearer <admin-token>
```

### Test Send Email
```http
POST /api/admin/email-templates/:id/test
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Body:**
```json
{
  "email": "test@example.com",
  "variables": {
    "userName": "John Doe",
    "loginUrl": "http://localhost:5173/login"
  }
}
```

---

## User Management

### Get All Users
```http
GET /api/admin/users?page=1&limit=20&search=&role=&status=
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search by name or email
- `role`: Filter by role (student, teacher, admin)
- `status`: Filter by status (active, inactive)

**Response:**
```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "status": "active",
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

### Get Specific User
```http
GET /api/admin/users/:id
Authorization: Bearer <admin-token>
```

### Update User
```http
PUT /api/admin/users/:id
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "role": "teacher",
  "status": "active"
}
```

### Delete User
```http
DELETE /api/admin/users/:id
Authorization: Bearer <admin-token>
```

---

## Quiz Management

### Get All Quizzes
```http
GET /api/admin/quizzes?page=1&limit=20&search=&status=
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `search`: Search by title or subject
- `status`: Filter by status (draft, published, archived)

### Get Specific Quiz
```http
GET /api/admin/quizzes/:id
Authorization: Bearer <admin-token>
```

### Update Quiz Status
```http
PUT /api/admin/quizzes/:id/status
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "published"
}
```

### Delete Quiz
```http
DELETE /api/admin/quizzes/:id
Authorization: Bearer <admin-token>
```

---

## Report Management

### Get All Reports
```http
GET /api/admin/reports?page=1&limit=20&type=&status=
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `type`: Filter by type (bug, content, user, quiz, abuse, other)
- `status`: Filter by status (pending, in_progress, resolved, rejected)

**Response:**
```json
{
  "reports": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": { "_id": "...", "name": "John Doe", "email": "john@example.com" },
      "type": "bug",
      "title": "Quiz submission error",
      "description": "Unable to submit quiz answers",
      "priority": "high",
      "status": "pending",
      "createdAt": "2024-01-15T09:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

### Get Specific Report
```http
GET /api/admin/reports/:id
Authorization: Bearer <admin-token>
```

### Resolve Report
```http
POST /api/admin/reports/:id/resolve
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Body:**
```json
{
  "resolution": "Fixed in version 1.2.3 - database connection issue resolved"
}
```

### Reject Report
```http
POST /api/admin/reports/:id/reject
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Body:**
```json
{
  "reason": "Unable to reproduce - needs more information"
}
```

---

## Dashboard Statistics

### Get Dashboard Stats
```http
GET /api/admin/dashboard/stats
Authorization: Bearer <admin-token>
```

Returns aggregated statistics for the admin dashboard.

**Response:**
```json
{
  "users": {
    "total": 1250,
    "active": 980,
    "inactive": 270
  },
  "quizzes": {
    "total": 450
  },
  "reports": {
    "pending": 12
  },
  "services": {
    "total": 8,
    "healthy": 7,
    "unhealthy": 1
  },
  "recentActivity": []
}
```

---

## Database Models

### EmailTemplate Schema
```javascript
{
  name: String,          // Unique template name
  subject: String,       // Email subject line
  body: String,          // HTML email body
  type: String,          // welcome, registration, quiz_created, etc.
  variables: [{          // Template variables
    name: String,
    description: String,
    required: Boolean,
    default: String
  }],
  isActive: Boolean,     // Whether template is enabled
  createdAt: Date,
  updatedAt: Date
}
```

### Report Schema
```javascript
{
  userId: ObjectId,           // User who reported
  type: String,               // bug, content, user, quiz, abuse, other
  title: String,
  description: String,
  relatedEntityType: String,  // user, quiz, question, comment, etc.
  relatedEntityId: ObjectId,
  priority: String,           // low, medium, high, critical
  status: String,             // pending, in_progress, resolved, rejected
  resolution: String,
  resolvedBy: ObjectId,       // Admin who resolved
  resolvedAt: Date,
  attachments: [{
    url: String,
    filename: String,
    mimeType: String
  }],
  metadata: {                 // Technical details
    userAgent: String,
    ipAddress: String,
    browser: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## Setup Instructions

### 1. Environment Variables
Create `.env` file in `microservices/admin-service/`:
```env
PORT=3007
MONGODB_URI=mongodb://localhost:27017/cognito_learning_hub
ADMIN_FRONTEND_URL=http://localhost:5174
NODE_ENV=development
```

### 2. Install Dependencies
```bash
cd microservices/admin-service
npm install
```

### 3. Seed Email Templates
```bash
npm run seed:templates
```

### 4. Start Service
```bash
npm start
```

---

## Testing

### Using cURL

**Test Health Check:**
```bash
curl http://localhost:3007/health
```

**Get Service Health (with admin token):**
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:3007/api/admin/services/health
```

**Get Gemini Stats:**
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:3007/api/admin/gemini/stats
```

### Using Postman

1. Import collection from `admin-service/postman/`
2. Set environment variable `admin_token`
3. Run requests

---

## Error Handling

### Standard Error Response
```json
{
  "error": "Error message here",
  "statusCode": 400
}
```

### Common HTTP Status Codes
- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User is not an admin
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side error

---

## Security Considerations

1. **Admin Authentication**: All endpoints require valid JWT with `role: 'admin'`
2. **CORS**: Restricted to admin portal URL (localhost:5174 in dev)
3. **Rate Limiting**: Applied via API Gateway
4. **Password Exclusion**: User passwords are never sent in responses
5. **Sensitive Data**: API keys are masked in logs

---

## Monitoring & Logging

### Log Format
```
[timestamp] [level] [service] message
```

### Log Levels
- **INFO**: Normal operations (service started, request proxied)
- **WARN**: Warning conditions (service health check failed)
- **ERROR**: Error conditions (database connection failed, proxy error)

### Health Monitoring
- Service health checks run every 5 seconds
- Circuit breaker status tracked in real-time
- Database connection monitored continuously

---

## Future Enhancements

- [ ] PM2 integration for automatic service restarts
- [ ] WebSocket support for real-time admin notifications
- [ ] Advanced analytics and reporting
- [ ] Audit log tracking for all admin actions
- [ ] Role-based access control (super-admin, moderator)
- [ ] Email scheduling and campaign management
- [ ] System configuration management
- [ ] Backup and restore functionality

---

## Support

For issues or questions:
- GitHub Issues: [github.com/your-repo/issues](https://github.com)
- Email: support@cognitolearninghub.com
- Docs: [Full Documentation](../docs)
