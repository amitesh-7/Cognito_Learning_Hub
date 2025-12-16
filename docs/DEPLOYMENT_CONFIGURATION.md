# Service Monitoring - Deployment Configuration

## Production URLs

All microservices are deployed on Render.com with the following URLs:

| Service | Production URL | Local URL | Port |
|---------|----------------|-----------|------|
| API Gateway | https://api-gateway-kzo9.onrender.com | http://localhost:3000 | 3000 |
| Auth Service | https://auth-service-uds0.onrender.com | http://localhost:3001 | 3001 |
| Quiz Service | https://quiz-service-6jzt.onrender.com | http://localhost:3002 | 3002 |
| Result Service | https://result-service-vwjh.onrender.com | http://localhost:3003 | 3003 |
| Live Service | https://live-service-ga6w.onrender.com | http://localhost:3004 | 3004 |
| Social Service | https://social-service-lwjy.onrender.com | http://localhost:3006 | 3006 |
| Gamification Service | https://gamification-service-ax6n.onrender.com | http://localhost:3007 | 3007 |
| Moderation Service | https://moderation-service-3e2e.onrender.com | http://localhost:3008 | 3008 |
| Meeting Service | https://meeting-service-ogfj.onrender.com | http://localhost:3009 | 3009 |
| Admin Service | (To be deployed) | http://localhost:3011 | 3011 |

## Environment Configuration

### For Local Development

Each microservice's `.env` file should contain:

```env
NODE_ENV=development
ADMIN_SERVICE_URL=http://localhost:3011

# Other local service URLs
API_GATEWAY_URL=http://localhost:3000
AUTH_SERVICE_URL=http://localhost:3001
# ... etc
```

### For Production Deployment

Update each microservice's environment variables on Render.com:

```env
NODE_ENV=production
ADMIN_SERVICE_URL=https://your-admin-service.onrender.com

# Production service URLs
API_GATEWAY_URL=https://api-gateway-kzo9.onrender.com
AUTH_SERVICE_URL=https://auth-service-uds0.onrender.com
QUIZ_SERVICE_URL=https://quiz-service-6jzt.onrender.com
RESULT_SERVICE_URL=https://result-service-vwjh.onrender.com
LIVE_SERVICE_URL=https://live-service-ga6w.onrender.com
SOCIAL_SERVICE_URL=https://social-service-lwjy.onrender.com
GAMIFICATION_SERVICE_URL=https://gamification-service-ax6n.onrender.com
MODERATION_SERVICE_URL=https://moderation-service-3e2e.onrender.com
MEETING_SERVICE_URL=https://meeting-service-ogfj.onrender.com
```

## Admin Service Configuration

The admin service's `.env` needs ALL service URLs:

```env
PORT=3011
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-connection-string
ADMIN_FRONTEND_URL=https://your-admin-portal.vercel.app
JWT_SECRET=your-production-secret

# Production URLs
API_GATEWAY_URL=https://api-gateway-kzo9.onrender.com
AUTH_SERVICE_URL=https://auth-service-uds0.onrender.com
QUIZ_SERVICE_URL=https://quiz-service-6jzt.onrender.com
RESULT_SERVICE_URL=https://result-service-vwjh.onrender.com
LIVE_SERVICE_URL=https://live-service-ga6w.onrender.com
SOCIAL_SERVICE_URL=https://social-service-lwjy.onrender.com
GAMIFICATION_SERVICE_URL=https://gamification-service-ax6n.onrender.com
MODERATION_SERVICE_URL=https://moderation-service-3e2e.onrender.com
MEETING_SERVICE_URL=https://meeting-service-ogfj.onrender.com
```

## Logger Integration Status

✅ **Integrated Services:**
- Auth Service
- Quiz Service
- Result Service
- Live Service
- Social Service
- Gamification Service
- Moderation Service
- Meeting Service
- API Gateway

### Code Added to Each Service:

```javascript
// Import
const { createLogger: createServiceLogger } = require("../shared/utils/serviceLogger");

// Initialize
const serviceLogger = createServiceLogger("Service Name", process.env.ADMIN_SERVICE_URL);

// Usage in error handlers
try {
  // ... your code
} catch (error) {
  serviceLogger.error("Operation failed", { userId, details }, error.stack);
}
```

## Deployment Steps

### 1. Deploy Admin Service

```bash
# Deploy to Render.com
1. Create new Web Service on Render
2. Connect GitHub repository
3. Set build command: cd microservices/admin-service && npm install
4. Set start command: cd microservices/admin-service && npm start
5. Add all environment variables
6. Deploy
```

### 2. Update Existing Services

For each microservice on Render:

```bash
1. Go to Service Settings → Environment
2. Add: ADMIN_SERVICE_URL = https://your-admin-service.onrender.com
3. Save Changes
4. Services will auto-redeploy
```

### 3. Test Monitoring

```bash
1. Visit admin portal: https://your-admin-portal.vercel.app/services
2. Check health status of all 10 services
3. Generate test errors in any service
4. Verify logs appear in admin panel
```

## Health Check Endpoints

Each service should have a `/health` endpoint that returns:

```json
{
  "status": "healthy",
  "service": "Service Name",
  "timestamp": "2025-12-16T...",
  "uptime": 12345,
  "memory": {...}
}
```

## Monitoring Features Active

✅ Health checks every 30 seconds (frontend auto-refresh)
✅ Error logs sent to admin service immediately
✅ Info/warn/debug logs batched (10 logs or 5 seconds)
✅ Auto-cleanup of logs older than 7 days (MongoDB TTL)
✅ Queue limit of 100 logs max (memory protection)
✅ Failed sends re-queued with limits

## Testing Locally

### Start Services in Order:

```bash
# Terminal 1: Admin Service
cd microservices/admin-service
npm start

# Terminal 2: Any microservice
cd microservices/auth-service
npm start

# Terminal 3: Admin Portal
cd admin-portal
npm run dev

# Visit: http://localhost:5174/services
```

### Generate Test Logs:

```bash
# Make API calls that produce errors
curl http://localhost:3001/api/auth/invalid-endpoint

# Check admin panel for logs
```

## Production Monitoring Access

- **Admin Portal**: https://your-admin-portal.vercel.app/services
- **Login**: Use admin credentials
- **Auto-refresh**: Enabled by default (30s intervals)
- **Log Retention**: 7 days automatic
- **Manual Cleanup**: Available via "Clear Logs" button

## Security Notes

1. **Admin Service URL** is public (receives logs from all services)
2. **Health Check** endpoints should be public for monitoring
3. **Log Retrieval** requires admin authentication
4. **Service URLs** in `.env` should match deployment environment
5. Never commit `.env` files - use Render's environment variables

## Troubleshooting

### Services showing "unhealthy"
- Check if service is running
- Verify ADMIN_SERVICE_URL in service's environment
- Check /health endpoint responds
- Look for firewall/CORS issues

### Logs not appearing
- Verify ADMIN_SERVICE_URL is correct
- Check service logger is initialized
- Look for network errors in service logs
- Ensure MongoDB is connected in admin service

### High memory usage
- Logs auto-delete after 7 days
- Queue limited to 100 logs
- Use manual cleanup if needed
- Check for excessive error logging

## Next Steps

1. ✅ Deploy admin service to Render
2. ✅ Add ADMIN_SERVICE_URL to all services
3. ✅ Test health checks work
4. ✅ Generate test errors and verify logs
5. ✅ Set up production monitoring dashboard
6. 🔜 Add alerting for critical errors (future)
7. 🔜 Add performance metrics (future)
