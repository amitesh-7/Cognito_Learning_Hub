# Complete Environment Variables Guide

This document contains all environment variables needed for deploying the Cognito Learning Hub microservices to Render.

## 🌐 Frontend URL

Your deployed frontend: **https://cognito-learning-hub-frontend.vercel.app**

## 📋 Prerequisites - What You Need to Obtain

Before deploying, you'll need:

### 1. MongoDB Atlas (Required)

- Create a **free MongoDB Atlas account**: https://www.mongodb.com/cloud/atlas/register
- Create **ONE database**: `cognito-learning-hub`
- All microservices will use the **SAME database** with different collections
- Each service manages its own collections within the shared database
- Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/cognito-learning-hub`
- **Network Access**: Add `0.0.0.0/0` to allow connections from Render

### 2. Google OAuth Credentials (Required for Login)

- Go to: https://console.cloud.google.com/
- Create new project or select existing
- Enable **Google+ API**
- Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
- Application type: **Web application**
- Authorized redirect URIs:
  - `https://cognito-learning-hub-frontend.vercel.app/auth/google/callback`
  - `https://your-auth-service.onrender.com/auth/google/callback`
- Copy **Client ID** and **Client Secret**

### 3. Google Gemini AI API Key (Required for Quiz Generation)

- Go to: https://aistudio.google.com/app/apikey
- Create API key
- Copy for `GOOGLE_API_KEY`

### 4. Email SMTP (Required for Notifications)

**Option 1: Gmail**

- Enable 2-Factor Authentication on Gmail
- Generate App Password: https://myaccount.google.com/apppasswords
- Use settings:
  - Host: `smtp.gmail.com`
  - Port: `587`
  - User: Your Gmail address
  - Password: App Password (16 characters)

**Option 2: SendGrid** (Recommended for production)

- Free tier: https://sendgrid.com/
- Get API key
- Host: `smtp.sendgrid.net`
- Port: `587`
- User: `apikey`
- Password: Your API key

### 5. Redis (Optional - Recommended for Performance)

**Option 1: Upstash** (Free tier available)

- Go to: https://upstash.com/
- Create Redis database
- Copy connection URL format: `redis://default:password@endpoint:port`

**Option 2: Redis Labs**

- Go to: https://redis.com/try-free/
- Create database
- Copy connection URL

### 6. JWT Secret (Required - Generate Random String)

Generate a secure random string (minimum 32 characters):

```bash
# PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**IMPORTANT**: Use the SAME JWT_SECRET across ALL services

---

## 🚀 Environment Variables by Service

### 1️⃣ API Gateway (`microservices/api-gateway`)

**Deploy URL Pattern**: `https://cognito-api-gateway.onrender.com`

```env
# Basic Configuration
NODE_ENV=production
GATEWAY_PORT=3000
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_HERE
LOG_LEVEL=info

# Database (SAME for all services)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cognito-learning-hub

# Frontend Configuration
FRONTEND_URLS=https://cognito-learning-hub-frontend.vercel.app
ALLOWED_ORIGINS=https://cognito-learning-hub-frontend.vercel.app

# Redis (Optional - leave empty to disable caching)
REDIS_URL=

# Service URLs - UPDATE AFTER DEPLOYING EACH SERVICE
# Leave empty initially, update as you deploy each service
AUTH_SERVICE_URL=
QUIZ_SERVICE_URL=
RESULT_SERVICE_URL=
LIVE_SERVICE_URL=
MEETING_SERVICE_URL=
SOCIAL_SERVICE_URL=
GAMIFICATION_SERVICE_URL=
MODERATION_SERVICE_URL=
```

**After deploying services, update with actual URLs**:

```env
# ⚠️ IMPORTANT: Use HTTPS and NO port numbers
# Format: https://service-name.onrender.com (NOT http:// and NO :3001, :3002, etc.)

AUTH_SERVICE_URL=https://cognito-auth-service.onrender.com
QUIZ_SERVICE_URL=https://cognito-quiz-service.onrender.com
RESULT_SERVICE_URL=https://cognito-result-service.onrender.com
LIVE_SERVICE_URL=https://cognito-live-service.onrender.com
MEETING_SERVICE_URL=https://cognito-meeting-service.onrender.com
SOCIAL_SERVICE_URL=https://cognito-social-service.onrender.com
GAMIFICATION_SERVICE_URL=https://cognito-gamification-service.onrender.com
MODERATION_SERVICE_URL=https://cognito-moderation-service.onrender.com
```

**Common Mistakes to Avoid:**

- ❌ `http://https://service.onrender.com:3001` (double protocol + port)
- ❌ `http://service.onrender.com:3001` (http instead of https + port)
- ❌ `https://service.onrender.com:3001` (unnecessary port number)
- ✅ `https://service.onrender.com` (CORRECT)

---

### 2️⃣ Auth Service (`microservices/auth-service`)

**Deploy URL Pattern**: `https://cognito-auth-service.onrender.com`

```env
# Basic Configuration
NODE_ENV=production
PORT=3001
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_HERE
JWT_EXPIRY=7d
BCRYPT_ROUNDS=10

# Database (SAME for all services)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cognito-learning-hub

# Google OAuth (REQUIRED - Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Email Configuration (REQUIRED - Choose Gmail or SendGrid)
# Gmail Option:
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password

# SendGrid Option (Alternative):
# EMAIL_HOST=smtp.sendgrid.net
# EMAIL_PORT=587
# EMAIL_USER=apikey
# EMAIL_PASS=your-sendgrid-api-key

# Frontend Configuration
FRONTEND_URL=https://cognito-learning-hub-frontend.vercel.app
ALLOWED_ORIGINS=https://cognito-learning-hub-frontend.vercel.app

# Redis (Optional)
REDIS_URL=
```

---

### 3️⃣ Quiz Service (`microservices/quiz-service`)

**Deploy URL Pattern**: `https://cognito-quiz-service.onrender.com`

```env
# Basic Configuration
NODE_ENV=production
PORT=3002

# Database (SAME for all services)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cognito-learning-hub

# Redis (CRITICAL for performance - highly recommended)
REDIS_URL=redis://default:password@endpoint:port

# Google Gemini AI (REQUIRED - Get from AI Studio)
GOOGLE_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash-exp

# Cache Configuration (Time-To-Live in seconds)
CACHE_TTL_QUIZ=86400        # 24 hours for quiz data
CACHE_TTL_FILE=604800       # 7 days for uploaded files
CACHE_TTL_ADAPTIVE=300      # 5 minutes for adaptive difficulty

# AI Configuration
AI_REQUEST_TIMEOUT=30000    # 30 seconds
AI_MAX_RETRIES=3
AI_RETRY_DELAY=1000         # 1 second

# File Upload Configuration
MAX_FILE_SIZE=10485760      # 10MB in bytes
ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png

# Rate Limiting (quizzes generated per day by role)
RATE_LIMIT_FREE=5
RATE_LIMIT_TEACHER=20
RATE_LIMIT_PREMIUM=100

# Service URLs
AUTH_SERVICE_URL=https://cognito-auth-service.onrender.com
```

---

### 4️⃣ Result Service (`microservices/result-service`)

**Deploy URL Pattern**: `https://cognito-result-service.onrender.com`

```env
# Basic Configuration
NODE_ENV=production
PORT=3003
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_HERE

# Database (SAME for all services)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cognito-learning-hub

# Redis (Recommended for leaderboard performance)
REDIS_URL=

# Cache Configuration (Time-To-Live in seconds)
CACHE_TTL_LEADERBOARD=300   # 5 minutes
CACHE_TTL_USER_STATS=3600   # 1 hour
CACHE_TTL_QUIZ_ANALYTICS=1800  # 30 minutes
CACHE_TTL_GLOBAL_STATS=600  # 10 minutes

# Leaderboard Configuration
LEADERBOARD_TOP_N=100       # Top users to cache

# Service URLs
GAMIFICATION_SERVICE_URL=https://cognito-gamification-service.onrender.com
```

---

### 5️⃣ Live Service (`microservices/live-service`)

**Deploy URL Pattern**: `https://cognito-live-service.onrender.com`

```env
# Basic Configuration
NODE_ENV=production
PORT=3004
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_HERE

# Database (SAME for all services)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cognito-learning-hub

# Redis (CRITICAL for real-time performance)
REDIS_URL=

# Live Session Configuration
SESSION_TTL=7200            # 2 hours in seconds
MAX_PARTICIPANTS=50
IDLE_TIMEOUT=1800           # 30 minutes
LEADERBOARD_UPDATE_INTERVAL=2000  # 2 seconds

# Socket.IO Configuration
SOCKET_PING_TIMEOUT=30000   # 30 seconds
SOCKET_PING_INTERVAL=25000  # 25 seconds

# Service URLs
GAMIFICATION_SERVICE_URL=https://cognito-gamification-service.onrender.com

# CORS
CORS_ORIGINS=https://cognito-learning-hub-frontend.vercel.app
```

---

### 6️⃣ Meeting Service (`microservices/meeting-service`)

**Deploy URL Pattern**: `https://cognito-meeting-service.onrender.com`

```env
# Basic Configuration
NODE_ENV=production
PORT=3005
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_HERE

# Database (SAME for all services)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cognito-learning-hub

# Redis (Recommended for real-time performance)
REDIS_URL=

# WebRTC Configuration (Public STUN servers - free)
WEBRTC_STUN_SERVERS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302,stun:stun2.l.google.com:19302

# TURN Server (Optional - only needed for strict NAT/firewall environments)
# Leave empty unless you have connectivity issues
WEBRTC_TURN_SERVERS=

# Meeting Configuration
MEETING_TTL=14400           # 4 hours in seconds
MAX_PARTICIPANTS=50
IDLE_TIMEOUT=3600           # 1 hour

# Socket.IO Configuration
SOCKET_PING_TIMEOUT=30000
SOCKET_PING_INTERVAL=25000

# CORS
CORS_ORIGINS=https://cognito-learning-hub-frontend.vercel.app
```

---

### 7️⃣ Social Service (`microservices/social-service`)

**Deploy URL Pattern**: `https://cognito-social-service.onrender.com`

```env
# Basic Configuration
NODE_ENV=production
PORT=3006

# Database (SAME for all services)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cognito-learning-hub

# Redis (Recommended for feed caching)
REDIS_URL=

# Feed Configuration
FEED_PAGE_SIZE=20
FEED_CACHE_TTL=300          # 5 minutes
MAX_FEED_ITEMS=1000

# Notification Configuration
NOTIFICATION_PAGE_SIZE=20
NOTIFICATION_RETENTION_DAYS=30

# Post Limits
MAX_POST_LENGTH=5000        # characters
MAX_IMAGES_PER_POST=10
MAX_IMAGE_SIZE=5242880      # 5MB in bytes

# Bull Queue Configuration (for background jobs)
BULL_REDIS_URL=             # Same as REDIS_URL or separate

# Socket.IO
SOCKET_PATH=/socket.io

# Service URLs
GAMIFICATION_SERVICE_URL=https://cognito-gamification-service.onrender.com

# CORS
CORS_ORIGINS=https://cognito-learning-hub-frontend.vercel.app
```

---

### 8️⃣ Gamification Service (`microservices/gamification-service`)

**Deploy URL Pattern**: `https://cognito-gamification-service.onrender.com`

```env
# Basic Configuration
NODE_ENV=production
PORT=3007
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_HERE

# Database (SAME for all services)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cognito-learning-hub

# Redis (CRITICAL for achievement processing)
REDIS_URL=

# Achievement Processing
ACHIEVEMENT_PROCESSING_CONCURRENCY=5
ACHIEVEMENT_SYNC_INTERVAL=60000  # 1 minute

# Leaderboard Configuration
LEADERBOARD_CACHE_TTL=300   # 5 minutes
LEADERBOARD_MAX_SIZE=100

# Service URLs (for event processing)
QUIZ_SERVICE_URL=https://cognito-quiz-service.onrender.com
RESULT_SERVICE_URL=https://cognito-result-service.onrender.com
LIVE_SERVICE_URL=https://cognito-live-service.onrender.com
SOCIAL_SERVICE_URL=https://cognito-social-service.onrender.com
```

---

### 9️⃣ Moderation Service (`microservices/moderation-service`)

**Deploy URL Pattern**: `https://cognito-moderation-service.onrender.com`

```env
# Basic Configuration
NODE_ENV=production
PORT=3008
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_HERE

# Database (SAME for all services)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cognito-learning-hub

# Rate Limiting
RATE_LIMIT_WINDOW=900000    # 15 minutes
RATE_LIMIT_MAX=100          # requests per window

# Service URLs
AUTH_SERVICE_URL=https://cognito-auth-service.onrender.com
USER_SERVICE_URL=https://cognito-auth-service.onrender.com
SOCIAL_SERVICE_URL=https://cognito-social-service.onrender.com
```

---

## 🔄 Deployment Sequence

### ⚠️ CRITICAL: Build Command for Render

All microservices share utilities from the `microservices/shared` folder. You **MUST** install shared dependencies first in every service deployment.

**Build Command Template:**

```bash
cd ../shared && npm install && cd ../SERVICE-NAME && npm install
```

**Example Build Commands:**

- Auth Service: `cd ../shared && npm install && cd ../auth-service && npm install`
- Quiz Service: `cd ../shared && npm install && cd ../quiz-service && npm install`
- Gamification Service: `cd ../shared && npm install && cd ../gamification-service && npm install`
- Result Service: `cd ../shared && npm install && cd ../result-service && npm install`
- Live Service: `cd ../shared && npm install && cd ../live-service && npm install`
- Meeting Service: `cd ../shared && npm install && cd ../meeting-service && npm install`
- Social Service: `cd ../shared && npm install && cd ../social-service && npm install`
- Moderation Service: `cd ../shared && npm install && cd ../moderation-service && npm install`
- API Gateway: `cd ../shared && npm install && cd ../api-gateway && npm install`

**Why this is required:**

- The shared folder contains utilities like logger, auth middleware, validators
- It has dependencies like `winston`, `jsonwebtoken`, `ioredis`, etc.
- Services import from `../shared/*` and need these dependencies installed
- Without this, you'll get "Cannot find module 'winston'" or "Cannot find module 'jsonwebtoken'" errors

### Deployment Order

Deploy in this order to avoid service URL dependency issues:

1. ✅ **Auth Service** (no dependencies)
2. ✅ **Quiz Service** (depends on Auth)
3. ✅ **Result Service** (depends on Gamification - deploy together)
4. ✅ **Gamification Service** (depends on Quiz, Result, Live, Social - deploy early)
5. ✅ **Live Service** (depends on Gamification)
6. ✅ **Meeting Service** (standalone)
7. ✅ **Social Service** (depends on Gamification)
8. ✅ **Moderation Service** (depends on Auth, Social)
9. ✅ **API Gateway** (depends on ALL services - deploy LAST)

After each deployment:

1. Copy the deployed URL from Render
2. Update dependent services' environment variables
3. Redeploy services that need the new URL

---

## ✅ Environment Variables Checklist

Before deploying each service, ensure you have:

- [ ] MongoDB Atlas connection string (SAME database for all services: `cognito-learning-hub`)
- [ ] Same JWT_SECRET across all services
- [ ] Google OAuth credentials (Auth Service only)
- [ ] Google Gemini API key (Quiz Service only)
- [ ] Email SMTP configuration (Auth Service only)
- [ ] Redis URL (optional but recommended)
- [ ] Frontend URL: `https://cognito-learning-hub-frontend.vercel.app`
- [ ] Service URLs (update after deploying each service)

---

## 🧪 Testing Environment Variables

After deployment, test each service:

```bash
# Test Auth Service
curl https://cognito-auth-service.onrender.com/health

# Test Quiz Service
curl https://cognito-quiz-service.onrender.com/health

# Test API Gateway
curl https://cognito-api-gateway.onrender.com/health
```

Check logs in Render dashboard for any missing environment variable errors.

---

## 🚨 Common Issues

### Issue: "Cannot find module 'winston'" or "Cannot find module 'jsonwebtoken'"

**Cause**: Shared folder dependencies not installed during build

**Solution**: Update Build Command on Render:

```bash
cd ../shared && npm install && cd ../SERVICE-NAME && npm install
```

**Example**: For auth-service:

```bash
cd ../shared && npm install && cd ../auth-service && npm install
```

This is **REQUIRED** for all 9 microservices because they all use shared utilities.

### Issue: Malformed service URLs (http://https://service.onrender.com:3001)

**Cause**: Incorrect service URL format in environment variables

**Solution**: Service URLs must be in this exact format:

```env
AUTH_SERVICE_URL=https://your-service-name.onrender.com
```

**What NOT to do:**

- ❌ Don't add port numbers (`:3001`, `:3002`, etc.)
- ❌ Don't use `http://` (Render uses HTTPS)
- ❌ Don't mix protocols (`http://https://`)

**Why**: In production, Render handles HTTPS and routing automatically. The code uses these URLs directly, so they must be complete and correct.

### Issue: Service can't connect to MongoDB

**Solution**: Check connection string format and network access settings in MongoDB Atlas (allow access from anywhere: 0.0.0.0/0)

### Issue: JWT authentication failing across services

**Solution**: Ensure ALL services use the exact same JWT_SECRET

### Issue: Redis connection errors

**Solution**: Either provide valid Redis URL or leave empty to disable caching (performance impact)

### Issue: Google OAuth not working

**Solution**: Add Render service URL to Google OAuth authorized redirect URIs

### Issue: Quiz generation failing

**Solution**: Verify GOOGLE_API_KEY is valid and Gemini API is enabled

---

## 📝 Notes

- **Free Tier Limitations**: Render free tier services sleep after 15 minutes of inactivity (first request may be slow)
- **Redis**: Optional but significantly improves performance (Upstash free tier: 10,000 commands/day)
- **MongoDB**: Free tier (M0) allows 512MB storage (sufficient for testing)
- **Service URLs**: Must use HTTPS (Render provides SSL automatically)
- **Environment Updates**: Changing env vars requires service restart in Render

---

## 🎯 Production Recommendations

For production deployment:

1. ✅ Use paid Render plan (always-on, no sleep)
2. ✅ Enable Redis for all services (critical for performance)
3. ✅ Use SendGrid instead of Gmail for email
4. ✅ Enable MongoDB Atlas backups
5. ✅ Add custom domain to frontend
6. ✅ Set up monitoring (Render provides basic metrics)
7. ✅ Configure TURN server for WebRTC if needed
8. ✅ Enable rate limiting in production
9. ✅ Enable MongoDB Atlas automatic backups
10. ✅ Regularly rotate JWT_SECRET and API keys
