# Cognito Learning Hub - Microservices Deployment Guide

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Services Overview](#services-overview)
3. [Deployment on Render](#deployment-on-render)
4. [Environment Variables](#environment-variables)
5. [Frontend Integration (Vercel)](#frontend-integration-vercel)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Testing & Monitoring](#testing--monitoring)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Vercel)                        │
│              React + Vite + Socket.IO Client                 │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              API Gateway (Render - Web Service)              │
│          Port: 3000 | Auth, Routing, Rate Limiting           │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│Auth Service  │  │Quiz Service  │  │Result Service│
│Port: 3001    │  │Port: 3002    │  │Port: 3003    │
│(Render)      │  │(Render)      │  │(Render)      │
└──────────────┘  └──────────────┘  └──────────────┘
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│Live Service  │  │Meeting Svc   │  │Social Service│
│Port: 3004    │  │Port: 3005    │  │Port: 3006    │
│(Render)      │  │(Render)      │  │(Render)      │
└──────────────┘  └──────────────┘  └──────────────┘
        │                │
        ▼                ▼
┌──────────────┐  ┌──────────────┐
│Gamification  │  │Moderation    │
│Port: 3007    │  │Port: 3008    │
│(Render)      │  │(Render)      │
└──────────────┘  └──────────────┘
```

---

## 📦 Services Overview

### 1. **API Gateway** - Entry Point

**Purpose**: Central routing, authentication, CORS, rate limiting  
**Port**: 3000  
**Dependencies**: None (routes to all other services)  
**Key Features**:

- Routes all `/api/*` requests to appropriate services
- WebSocket proxy for Socket.IO
- JWT validation
- Rate limiting per IP
- CORS configuration

**Package.json dependencies**:

```json
{
  "cors": "^2.8.5",
  "express": "^5.1.0",
  "express-rate-limit": "^8.2.1",
  "helmet": "^8.1.0",
  "http-proxy-middleware": "^2.0.6",
  "ioredis": "^5.3.2",
  "winston": "^3.11.0"
}
```

---

### 2. **Auth Service** - Authentication

**Purpose**: User registration, login, JWT tokens, OAuth  
**Port**: 3001  
**Database**: MongoDB (Users collection)  
**Key Features**:

- User registration with email validation
- Login with JWT generation
- Google OAuth integration
- Password reset
- Role management (Student, Teacher, Admin, Moderator)

**Package.json dependencies**:

```json
{
  "bcryptjs": "^2.4.3",
  "express": "^5.1.0",
  "google-auth-library": "^9.4.1",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.17.0",
  "nodemailer": "^6.9.7"
}
```

**Endpoints**:

- `POST /register` - Register new user
- `POST /login` - Login and get JWT
- `POST /google-auth` - Google OAuth login
- `GET /verify` - Verify JWT token
- `POST /forgot-password` - Request password reset

---

### 3. **Quiz Service** - Quiz Management

**Purpose**: CRUD operations for quizzes, AI generation  
**Port**: 3002  
**Database**: MongoDB (Quizzes collection)  
**Key Features**:

- Create, read, update, delete quizzes
- AI quiz generation using Google Gemini
- PDF/file upload and parsing
- Adaptive difficulty calculation
- Multiple question types (MCQ, True/False, Fill-in-blank)

**Package.json dependencies**:

```json
{
  "express": "^5.1.0",
  "mongoose": "^8.17.0",
  "@google/generative-ai": "^0.2.0",
  "multer": "^1.4.5-lts.1",
  "pdf-parse": "^1.1.1"
}
```

**Endpoints**:

- `GET /api/quizzes` - Get all quizzes
- `POST /api/quizzes` - Create quiz
- `GET /api/quizzes/:id` - Get quiz by ID
- `PUT /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz
- `POST /api/quizzes/generate` - AI quiz generation

---

### 4. **Result Service** - Scores & Analytics

**Purpose**: Store quiz results, leaderboards, analytics  
**Port**: 3003  
**Database**: MongoDB (Results collection)  
**Key Features**:

- Save quiz attempt results
- Calculate scores and percentages
- Generate leaderboards (quiz-specific and global)
- Performance analytics
- User statistics

**Package.json dependencies**:

```json
{
  "express": "^5.1.0",
  "mongoose": "^8.17.0"
}
```

**Endpoints**:

- `POST /api/results` - Submit quiz result
- `GET /api/results/user/:userId` - Get user's results
- `GET /api/quizzes/:quizId/leaderboard` - Quiz leaderboard
- `GET /api/users/leaderboard` - Global leaderboard (top 5)
- `GET /api/results/stats/:userId` - User statistics

---

### 5. **Live Service** - Real-time Quizzes

**Purpose**: Multiplayer live quizzes, 1v1 duels  
**Port**: 3004  
**Database**: MongoDB (LiveSessions, DuelMatches)  
**Real-time**: Socket.IO  
**Key Features**:

- Host-controlled live quiz sessions
- Real-time participant joining
- Live scoring and leaderboards
- 1v1 duel matchmaking
- Session analytics

**Package.json dependencies**:

```json
{
  "express": "^5.1.0",
  "socket.io": "^4.6.1",
  "mongoose": "^8.17.0",
  "ioredis": "^5.3.2"
}
```

**Socket Events**:

- `join-session` - Participant joins live quiz
- `start-quiz` - Host starts quiz
- `submit-answer` - Real-time answer submission
- `find-duel-match` - 1v1 matchmaking
- `duel-ready` - Player ready for duel

---

### 6. **Meeting Service** - Video Calls

**Purpose**: WebRTC signaling for video meetings  
**Port**: 3005  
**Database**: MongoDB (Meetings collection)  
**Real-time**: Socket.IO + WebRTC  
**Key Features**:

- Create/join video meetings
- WebRTC signaling (offer/answer/ICE)
- Screen sharing coordination
- Host controls (mute, kick)
- Recording metadata

**Package.json dependencies**:

```json
{
  "express": "^5.1.0",
  "socket.io": "^4.6.1",
  "mongoose": "^8.17.0"
}
```

**Socket Events**:

- `join-meeting` - Join video room
- `webrtc-offer` - WebRTC offer signal
- `webrtc-answer` - WebRTC answer signal
- `ice-candidate` - ICE candidate exchange
- `toggle-video` - Toggle video on/off

---

### 7. **Social Service** - Social Features

**Purpose**: Friends, challenges, messaging  
**Port**: 3006  
**Database**: MongoDB (SocialFeatures collection)  
**Key Features**:

- Friend requests and management
- Quiz challenges between users
- Direct messaging
- Notifications
- Online status tracking

**Package.json dependencies**:

```json
{
  "express": "^5.1.0",
  "socket.io": "^4.6.1",
  "mongoose": "^8.17.0"
}
```

**Endpoints**:

- `POST /api/social/friends/request` - Send friend request
- `POST /api/social/friends/accept` - Accept request
- `POST /api/social/challenges` - Create quiz challenge
- `GET /api/social/notifications` - Get notifications

---

### 8. **Gamification Service** - Rewards System

**Purpose**: Achievements, XP, badges, streaks  
**Port**: 3007  
**Database**: MongoDB (Achievements collection)  
**Key Features**:

- Achievement tracking and unlocking
- XP and leveling system
- Daily streaks
- Badge collection
- User statistics dashboard

**Package.json dependencies**:

```json
{
  "express": "^5.1.0",
  "mongoose": "^8.17.0"
}
```

**Endpoints**:

- `GET /api/achievements/:userId` - Get user achievements
- `POST /api/achievements/unlock` - Unlock achievement
- `GET /api/gamification/stats/:userId` - User stats
- `POST /api/gamification/streak` - Update streak

---

### 9. **Moderation Service** - Content Moderation

**Purpose**: Reports, admin tools, audit logs  
**Port**: 3008  
**Database**: MongoDB (Reports collection)  
**Key Features**:

- Content reporting system
- Admin dashboard
- Moderator tools
- User bans/warnings
- Audit logs

**Package.json dependencies**:

```json
{
  "express": "^5.1.0",
  "mongoose": "^8.17.0"
}
```

**Endpoints**:

- `POST /api/reports` - Submit report
- `GET /api/reports` - Get all reports (admin)
- `PUT /api/reports/:id/resolve` - Resolve report
- `POST /api/moderation/ban` - Ban user

---

## 🚀 Deployment on Render

### Step 1: Prepare MongoDB Database

**Option 1: MongoDB Atlas (Recommended)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0 tier - 512MB storage)
3. Create **ONE database**: `cognito-learning-hub`
4. Create a database user with read/write access
5. Whitelist all IPs (0.0.0.0/0) for Render access (Network Access tab)
6. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/cognito-learning-hub`
7. **IMPORTANT**: All 9 microservices will use the SAME database connection string

**Option 2: Render-hosted MongoDB**

1. Create a new MongoDB instance on Render
2. Note the connection URL

### Step 2: Deploy Each Service on Render

**⚠️ CRITICAL: Build Command for ALL Services**

All microservices share utilities from the `shared` folder. You MUST install shared dependencies first.

**Build Command Template** (adjust service name):

```bash
cd ../shared && npm install && cd ../SERVICE-NAME && npm install
```

**Examples:**

- Auth Service: `cd ../shared && npm install && cd ../auth-service && npm install`
- Quiz Service: `cd ../shared && npm install && cd ../quiz-service && npm install`
- Gamification Service: `cd ../shared && npm install && cd ../gamification-service && npm install`

**For each service (9 services total):**

#### 2.1 API Gateway (Deploy First)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:

   - **Name**: `cognito-api-gateway`
   - **Root Directory**: `microservices/api-gateway`
   - **Environment**: `Node`
   - **Build Command**: `cd ../shared && npm install && cd ../api-gateway && npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for production)

5. Add Environment Variables:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cognito-learning-hub
FRONTEND_URLS=https://cognito-learning-hub-frontend.vercel.app
JWT_SECRET=your-super-secret-jwt-key-change-this
LOG_LEVEL=info

# Service URLs (will be filled after deploying other services)
AUTH_SERVICE_URL=https://cognito-auth-service.onrender.com
QUIZ_SERVICE_URL=https://cognito-quiz-service.onrender.com
RESULT_SERVICE_URL=https://cognito-result-service.onrender.com
LIVE_SERVICE_URL=https://cognito-live-service.onrender.com
MEETING_SERVICE_URL=https://cognito-meeting-service.onrender.com
SOCIAL_SERVICE_URL=https://cognito-social-service.onrender.com
GAMIFICATION_SERVICE_URL=https://cognito-gamification-service.onrender.com
MODERATION_SERVICE_URL=https://cognito-moderation-service.onrender.com
```

6. Click **Create Web Service**
7. **Note the deployed URL**: e.g., `https://cognito-api-gateway.onrender.com`

#### 2.2 Auth Service (Deploy Second)

Repeat the same process:

- **Name**: `cognito-auth-service`
- **Root Directory**: `microservices/auth-service`
- **Environment Variables**:

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cognito-learning-hub
JWT_SECRET=same-secret-as-gateway
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### 2.3 Quiz Service

- **Name**: `cognito-quiz-service`
- **Root Directory**: `microservices/quiz-service`
- **Environment Variables**:

```env
NODE_ENV=production
PORT=3002
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cognito-learning-hub
JWT_SECRET=same-secret-as-gateway
GEMINI_API_KEY=your-google-gemini-api-key
MAX_FILE_SIZE=10485760
```

#### 2.4 Result Service

- **Name**: `cognito-result-service`
- **Root Directory**: `microservices/result-service`
- **Environment Variables**:

```env
NODE_ENV=production
PORT=3003
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cognito-learning-hub
JWT_SECRET=same-secret-as-gateway
```

#### 2.5 Live Service

- **Name**: `cognito-live-service`
- **Root Directory**: `microservices/live-service`
- **Environment Variables**:

```env
NODE_ENV=production
PORT=3004
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cognito-learning-hub
JWT_SECRET=same-secret-as-gateway
REDIS_URL=redis://default:password@redis-host:6379
CORS_ORIGIN=https://cognito-learning-hub-frontend.vercel.app
```

#### 2.6 Meeting Service

- **Name**: `cognito-meeting-service`
- **Root Directory**: `microservices/meeting-service`
- **Environment Variables**:

```env
NODE_ENV=production
PORT=3005
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cognito-learning-hub
JWT_SECRET=same-secret-as-gateway
CORS_ORIGIN=https://cognito-learning-hub-frontend.vercel.app
```

#### 2.7 Social Service

- **Name**: `cognito-social-service`
- **Root Directory**: `microservices/social-service`
- **Environment Variables**:

```env
NODE_ENV=production
PORT=3006
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cognito-learning-hub
JWT_SECRET=same-secret-as-gateway
```

#### 2.8 Gamification Service

- **Name**: `cognito-gamification-service`
- **Root Directory**: `microservices/gamification-service`
- **Environment Variables**:

```env
NODE_ENV=production
PORT=3007
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cognito-learning-hub
JWT_SECRET=same-secret-as-gateway
```

#### 2.9 Moderation Service

- **Name**: `cognito-moderation-service`
- **Root Directory**: `microservices/moderation-service`
- **Environment Variables**:

```env
NODE_ENV=production
PORT=3008
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cognito-learning-hub
JWT_SECRET=same-secret-as-gateway
```

### Step 3: Update API Gateway Environment Variables

After all services are deployed, go back to API Gateway settings and update the service URLs:

```env
AUTH_SERVICE_URL=https://cognito-auth-service.onrender.com
QUIZ_SERVICE_URL=https://cognito-quiz-service.onrender.com
RESULT_SERVICE_URL=https://cognito-result-service.onrender.com
LIVE_SERVICE_URL=https://cognito-live-service.onrender.com
MEETING_SERVICE_URL=https://cognito-meeting-service.onrender.com
SOCIAL_SERVICE_URL=https://cognito-social-service.onrender.com
GAMIFICATION_SERVICE_URL=https://cognito-gamification-service.onrender.com
MODERATION_SERVICE_URL=https://cognito-moderation-service.onrender.com
```

**Redeploy** API Gateway after updating these URLs.

---

## 🌐 Frontend Integration (Vercel)

### Step 1: Update Frontend Environment Variables on Vercel

Go to your Vercel project → Settings → Environment Variables and update:

```env
# Change from monolithic backend to API Gateway
VITE_API_URL=https://cognito-api-gateway.onrender.com

# Socket.IO connection
VITE_SOCKET_URL=https://cognito-api-gateway.onrender.com
```

### Step 2: Update Frontend Code (if needed)

All API calls should already use `import.meta.env.VITE_API_URL`, so no code changes needed!

Example (already in your code):

```javascript
// This will automatically use the new API Gateway URL
fetch(`${import.meta.env.VITE_API_URL}/api/quizzes`);
```

Socket.IO connections:

```javascript
// Already configured correctly
const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3001");
```

### Step 3: Redeploy Frontend on Vercel

1. Go to Vercel Dashboard
2. Click on your project
3. Click **Deployments**
4. Click **Redeploy** on the latest deployment
5. Or push a new commit to trigger automatic deployment

---

## 🔧 Post-Deployment Configuration

### 1. Test Each Service Individually

**API Gateway Health Check**:

```bash
curl https://cognito-api-gateway.onrender.com/health
# Expected: {"status":"ok","service":"api-gateway"}
```

**Auth Service Test**:

```bash
curl https://cognito-api-gateway.onrender.com/api/auth/health
# Expected: {"status":"ok","service":"auth"}
```

Repeat for all services: `/api/quiz/health`, `/api/results/health`, etc.

### 2. Configure CORS on All Services

Ensure all services allow requests from:

- `https://your-vercel-app.vercel.app` (your production frontend)
- `https://cognito-api-gateway.onrender.com` (API Gateway)

Already configured in code:

```javascript
const cors = require("cors");
app.use(
  cors({
    origin: process.env.FRONTEND_URLS.split(","),
    credentials: true,
  })
);
```

### 3. Set Up Redis (Optional but Recommended)

**Option 1: Upstash Redis (Free)**

1. Go to [Upstash](https://upstash.com/)
2. Create a Redis database
3. Copy the Redis URL: `redis://default:password@endpoint:6379`
4. Add to Live Service and Meeting Service environment variables:

```env
REDIS_URL=redis://default:password@endpoint:6379
```

**Option 2: Skip Redis**
Services will work without Redis (no caching, but fully functional)

### 4. Google OAuth Configuration

Update your Google OAuth console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URIs:
   - `https://your-vercel-app.vercel.app`
   - `https://cognito-api-gateway.onrender.com/api/auth/google/callback`

### 5. WebSocket Configuration

Ensure Socket.IO works through API Gateway:

**Frontend (already configured)**:

```javascript
const socket = io("https://cognito-api-gateway.onrender.com", {
  transports: ["websocket", "polling"],
  path: "/socket.io/",
});
```

**API Gateway should proxy WebSocket** (check `api-gateway/index.js`).

---

## 📊 Service URLs Summary

After deployment, you'll have these URLs:

| Service         | URL                                                 | Purpose                                |
| --------------- | --------------------------------------------------- | -------------------------------------- |
| **API Gateway** | `https://cognito-api-gateway.onrender.com`          | Entry point for all requests           |
| Auth Service    | `https://cognito-auth-service.onrender.com`         | Authentication (internal only)         |
| Quiz Service    | `https://cognito-quiz-service.onrender.com`         | Quiz management (internal only)        |
| Result Service  | `https://cognito-result-service.onrender.com`       | Results & leaderboards (internal only) |
| Live Service    | `https://cognito-live-service.onrender.com`         | Live quizzes (internal only)           |
| Meeting Service | `https://cognito-meeting-service.onrender.com`      | Video meetings (internal only)         |
| Social Service  | `https://cognito-social-service.onrender.com`       | Social features (internal only)        |
| Gamification    | `https://cognito-gamification-service.onrender.com` | Achievements (internal only)           |
| Moderation      | `https://cognito-moderation-service.onrender.com`   | Moderation (internal only)             |

**Frontend only calls API Gateway!** All other services are internal.

---

## 🔐 Environment Variables Checklist

### Required for ALL Services:

- ✅ `NODE_ENV=production`
- ✅ `PORT` (3000-3008)
- ✅ `JWT_SECRET` (same across all services)
- ✅ `MONGO_URI` (unique database per service)

### Service-Specific:

- **API Gateway**: `FRONTEND_URLS`, all service URLs
- **Auth Service**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, email config
- **Quiz Service**: `GEMINI_API_KEY`
- **Live/Meeting Services**: `REDIS_URL` (optional), `CORS_ORIGIN`

---

## ✅ Testing Checklist

After deployment, test these features:

### Authentication

- [ ] User registration works
- [ ] Login returns JWT token
- [ ] Google OAuth login works
- [ ] Protected routes require authentication

### Quizzes

- [ ] Can create quiz
- [ ] Can fetch all quizzes
- [ ] Can take quiz and submit answers
- [ ] AI quiz generation works

### Results & Leaderboards

- [ ] Quiz results are saved
- [ ] Leaderboard shows top 5 users
- [ ] User statistics display correctly

### Live Features

- [ ] Can join live quiz session
- [ ] Real-time scoring updates
- [ ] 1v1 duel matchmaking works
- [ ] WebSocket connection stable

### Video Meetings

- [ ] Can create meeting room
- [ ] Can join meeting
- [ ] WebRTC connection establishes
- [ ] Screen sharing works

### Social Features

- [ ] Can send friend requests
- [ ] Can send quiz challenges
- [ ] Notifications appear
- [ ] Online status updates

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'winston'" or "Cannot find module 'jsonwebtoken'" error

**Cause**: The shared folder dependencies are not installed

**Solution**: Update your Build Command on Render to install shared dependencies first:

```bash
cd ../shared && npm install && cd ../SERVICE-NAME && npm install
```

Replace `SERVICE-NAME` with your actual service folder name (e.g., `auth-service`, `quiz-service`, etc.)

**Why this happens:**

- All services use shared utilities from `microservices/shared/`
- The shared folder has its own `package.json` with dependencies like winston, jsonwebtoken
- Services import from `../shared/*` which need these dependencies
- Render only installs dependencies in the Root Directory by default

**Fixed in**: All service deployment instructions now include the correct build command

### Issue: Services can't reach each other

**Solution**: Check that all service URLs in API Gateway are correct and include `https://`

### Issue: CORS errors

**Solution**: Verify `FRONTEND_URLS` environment variable includes your Vercel domain

### Issue: WebSocket not connecting

**Solution**: Ensure Socket.IO is configured with both `websocket` and `polling` transports

### Issue: MongoDB connection fails

**Solution**: Whitelist `0.0.0.0/0` in MongoDB Atlas network access

### Issue: Render services sleeping (free tier)

**Solution**: Services on free tier sleep after 15 minutes. Consider:

1. Upgrading to paid tier ($7/month per service)
2. Using a ping service to keep them awake
3. Accepting cold starts (first request takes 30-60 seconds)

---

## 📈 Monitoring & Logs

### View Logs on Render

1. Go to each service dashboard
2. Click **Logs** tab
3. Monitor errors and requests in real-time

### Set Up Monitoring (Optional)

- **Sentry**: For error tracking
- **LogRocket**: For session replay
- **Uptime Robot**: For uptime monitoring

---

## 💰 Cost Estimation

### Free Tier (Render)

- **9 services × Free tier** = $0/month
- **Limitations**: 750 hours/month per service, sleeps after 15 min inactivity

### Paid Tier (Production)

- **API Gateway**: $7/month (Starter)
- **Auth Service**: $7/month
- **Quiz Service**: $7/month
- **Result Service**: $7/month
- **Live Service**: $7/month
- **Meeting Service**: $7/month
- **Social Service**: $7/month
- **Gamification**: $7/month
- **Moderation**: $7/month
- **Total**: ~$63/month for always-on services

### MongoDB Atlas

- **Free tier**: 512MB storage
- **Paid**: $9/month (2GB)

### Total Monthly Cost

- **Free tier**: $0 (with cold starts)
- **Paid tier**: ~$72/month (all services + database)

---

## 🚀 Next Steps

1. ✅ Deploy all 9 services on Render
2. ✅ Update API Gateway with service URLs
3. ✅ Update Vercel environment variables
4. ✅ Test all features end-to-end
5. ⏭️ Set up monitoring and alerting
6. ⏭️ Configure CDN for static assets
7. ⏭️ Implement caching strategies
8. ⏭️ Set up CI/CD pipelines

---

## 📞 Support

For issues or questions, contact the development team or create an issue in the repository.

**Made with ❤️ by team OPTIMISTIC MUTANT CODERS**
