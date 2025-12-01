# Environment Configuration Guide

This project uses separate environment files for local development and production deployments to avoid confusion.

## 📁 Environment File Structure

### Microservices

Each microservice has three environment files:

- **`.env`** - Base configuration (tracked in git for reference)
- **`.env.local`** - Local development (gitignored)
- **`.env.production`** - Production deployment (gitignored)

### Frontend

- **`.env`** - Base configuration (tracked in git)
- **`.env.local`** - Local development overrides (gitignored)
- **`.env.production`** - Production build configuration (gitignored)

## 🚀 Quick Start for Local Development

### 1. Copy `.env.local` files (First Time Setup)

**For each microservice:**

```powershell
# API Gateway
cd microservices/api-gateway
copy .env.local .env

# Auth Service
cd ../auth-service
copy .env.local .env

# Quiz Service
cd ../quiz-service
copy .env.local .env

# Result Service
cd ../result-service
copy .env.local .env

# Live Service
cd ../live-service
copy .env.local .env
```

**For frontend:**

```powershell
cd frontend
copy .env.local .env
```

### 2. Verify Port Configuration

**Microservices Ports (Local Development):**

- API Gateway: `3000`
- Auth Service: `3001`
- Quiz Service: `3002`
- Result Service: `3003`
- Live Service: `3004`
- Social Service: `3006`
- Gamification Service: `3007`
- Moderation Service: `3008`
- Meeting Service: `3009`

**Frontend:**

- Vite Dev Server: `5173`
- All API/WebSocket calls go through API Gateway on port `3000`

## 🌐 Production Deployment

### 1. Copy `.env.production` files

```powershell
# For each microservice
cd microservices/api-gateway
copy .env.production .env

# For frontend
cd frontend
copy .env.production .env
```

### 2. Update Production URLs

Edit `.env` in each service and replace placeholder URLs:

- `https://your-auth-service.onrender.com` → Your actual Auth Service URL
- `https://your-quiz-service.onrender.com` → Your actual Quiz Service URL
- And so on...

## 🔄 Switching Between Environments

### Switch to Local Development

```powershell
# In each service directory
copy .env.local .env
```

### Switch to Production

```powershell
# In each service directory
copy .env.production .env
```

## ⚠️ Important Notes

1. **Never commit `.env.local` or `.env.production`** - They contain sensitive credentials
2. **Always use `.env.local` for local development** - Prevents port conflicts
3. **API Gateway must know all service URLs** - Update both local and production configs
4. **Frontend always connects to API Gateway** - Never directly to services
5. **WebSocket connections go through API Gateway** - Port 3000 (local) or HTTPS (production)

## 🛠️ Service Configuration Details

### API Gateway (Port 3000)

Proxies all requests to appropriate microservices:

- `/api/auth/*` → Auth Service (3001)
- `/api/quizzes/*` → Quiz Service (3002)
- `/api/results/*` → Result Service (3003)
- `/api/analytics/*` → Result Service (3003)
- `/api/live/*` → Live Service (3004)
- `/socket.io/*` → Live Service (3004) WebSocket upgrade

### Service-to-Service Communication

Services communicate using `HttpClient` utility (axios-based):

```javascript
const resultClient = new HttpClient("quiz-service", "http://localhost:3003");
const response = await resultClient.get("/api/analytics/teacher/stats");
```

## 🔍 Troubleshooting

### Port Conflict Issues

1. Check which `.env` file you're using: `cat .env`
2. Ensure port matches `.env.local` for development
3. Restart the service after changing `.env`

### Service Not Found (503/ECONNREFUSED)

1. Verify service is running: Check terminal output
2. Check API Gateway has correct service URL in `.env`
3. Verify port in service's `.env` matches URL in API Gateway

### WebSocket Connection Failed

1. Frontend must connect to API Gateway (port 3000)
2. Clear browser cache: `localStorage.clear()` + `sessionStorage.clear()`
3. Restart Vite dev server: `npm run dev`

## 📝 Template Files

All `.env.local` and `.env.production` files are pre-configured with:

- ✅ Correct ports for each environment
- ✅ MongoDB connection strings
- ✅ Redis configuration
- ✅ Service URLs
- ✅ JWT secrets
- ✅ API keys

Just copy and use!
