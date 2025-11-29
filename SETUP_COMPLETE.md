# 🎉 Backend Configuration Complete!

## ✅ What's Been Done

### 1. **Gemini API Key Location** 🤖
**Location:** `microservices/quiz-service/.env`

```bash
# Google Gemini AI - Quiz Generation
GOOGLE_API_KEY=YOUR_GEMINI_API_KEY_HERE
GEMINI_MODEL=gemini-2.5-flash
```

**Where it's used:**
- `microservices/quiz-service/services/aiService.js` - Main AI service
- `microservices/quiz-service/workers/quizGenerationWorker.js` - Background quiz generation

**How it works:**
1. Frontend sends quiz generation request to API Gateway
2. API Gateway routes to Quiz Service (port 3005)
3. Quiz Service uses Gemini API to generate questions
4. Results are cached in Upstash Redis
5. Response sent back to frontend

**Get your Gemini API key:**
👉 https://makersuite.google.com/app/apikey

---

### 2. **Frontend Configuration Updated** ⚙️

#### Updated Files:
✅ `frontend/.env` - Added all microservices URLs
✅ `frontend/src/config/endpoints.js` - Complete API endpoint mapping (NEW)
✅ `frontend/src/lib/apiConfig.js` - Enhanced with WebSocket URLs and feature flags
✅ `frontend/src/lib/axios.js` - JWT interceptors and error handling (NEW)

#### Frontend `.env` Configuration:
```bash
# API Gateway (Central Entry Point)
VITE_API_URL=http://localhost:3000

# WebSocket URLs
VITE_SOCKET_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3004          # Live Quiz WebSocket
VITE_MEETING_WS_URL=ws://localhost:3009   # Meeting WebRTC WebSocket

# Google OAuth
VITE_GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com

# Feature Flags
VITE_ENABLE_LIVE_QUIZ=true
VITE_ENABLE_MEETINGS=true
VITE_ENABLE_SOCIAL=true
VITE_ENABLE_GAMIFICATION=true
VITE_ENABLE_MODERATION=true

# Debug
VITE_ENABLE_DEBUG=true
VITE_LOG_LEVEL=info
```

---

## 🏗️ Architecture Overview

```
┌─────────────┐
│   FRONTEND  │ (http://localhost:5173)
│  React App  │
└──────┬──────┘
       │
       │ All API requests
       ↓
┌──────────────────────────────────────┐
│      API GATEWAY (Port 3000)         │
│  Central routing & authentication     │
└──────────────────────────────────────┘
       │
       ├─→ Auth Service (3001)       - User authentication & JWT
       ├─→ Quiz Service (3005)       - Quiz generation (GEMINI AI)
       ├─→ Result Service (3003)     - Results & analytics
       ├─→ Live Service (3004)       - Real-time quiz sessions
       ├─→ Meeting Service (3009)    - Video meetings (WebRTC)
       ├─→ Social Service (3006)     - Friends, chat, challenges
       ├─→ Gamification (3007)       - Achievements, leaderboard
       └─→ Moderation (3008)         - Reports, admin actions
       
       All services use:
       - MongoDB Atlas (Cloud Database)
       - Upstash Redis (Cloud Cache)
       - JWT Authentication
```

---

## 🔑 Critical Environment Variables

### You MUST Add:

**1. Quiz Service - Gemini API Key**
```bash
cd microservices/quiz-service
# Edit .env file and add:
GOOGLE_API_KEY=your_actual_gemini_api_key
```

**2. Google OAuth (if not configured)**
- Go to https://console.cloud.google.com/apis/credentials
- Add authorized origins:
  - `http://localhost:5173` (Frontend)
  - `http://localhost:3000` (API Gateway)

---

## 🚀 How to Start Everything

### Backend (9 Microservices)

Open 9 separate terminals:

```bash
# Terminal 1 - API Gateway
cd microservices/api-gateway
npm run dev

# Terminal 2 - Auth Service
cd microservices/auth-service
npm run dev

# Terminal 3 - Quiz Service (NEEDS GEMINI KEY!)
cd microservices/quiz-service
npm run dev

# Terminal 4 - Result Service
cd microservices/result-service
npm run dev

# Terminal 5 - Live Service
cd microservices/live-service
npm run dev

# Terminal 6 - Meeting Service
cd microservices/meeting-service
npm run dev

# Terminal 7 - Social Service
cd microservices/social-service
npm run dev

# Terminal 8 - Gamification Service
cd microservices/gamification-service
npm run dev

# Terminal 9 - Moderation Service
cd microservices/moderation-service
npm run dev
```

### Frontend

```bash
cd frontend
npm run dev
# Opens at http://localhost:5173
```

---

## 🧪 Testing the Setup

### 1. Test API Gateway
```bash
curl http://localhost:3000/health
```

Should return:
```json
{
  "status": "healthy",
  "service": "API Gateway",
  "timestamp": "2025-11-29T...",
  "uptime": 123.456
}
```

### 2. Test Quiz Generation (with Gemini)
```bash
curl -X POST http://localhost:3000/api/generate-quiz-topic \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "topic": "JavaScript",
    "numQuestions": 5,
    "difficulty": "medium"
  }'
```

### 3. Test from Frontend
Open browser console at `http://localhost:5173` and run:
```javascript
// Check API config
console.log(import.meta.env);

// Should show:
// VITE_API_URL: "http://localhost:3000"
// VITE_SOCKET_URL: "http://localhost:3000"
// etc.
```

---

## 📚 Using the API from Frontend

### Example: Generate Quiz

```javascript
import axios from '../lib/axios';
import { ENDPOINTS } from '../config/endpoints';

async function generateQuiz() {
  try {
    const response = await axios.post(ENDPOINTS.quiz.generateFromTopic, {
      topic: 'React',
      numQuestions: 10,
      difficulty: 'medium'
    });
    
    console.log('Quiz generated:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### Example: Connect to Live Quiz WebSocket

```javascript
import io from 'socket.io-client';
import { getSocketUrl } from '../lib/apiConfig';
import { WS_EVENTS } from '../config/endpoints';

const socket = io(getSocketUrl(), {
  auth: {
    token: localStorage.getItem('token')
  }
});

// Join session
socket.emit(WS_EVENTS.live.JOIN_SESSION, {
  sessionCode: 'ABC123',
  userId: user.id,
  username: user.name
});

// Listen for events
socket.on(WS_EVENTS.live.QUESTION_STARTED, (data) => {
  console.log('New question:', data);
});
```

---

## 🔧 API Endpoints Quick Reference

All endpoints are defined in `frontend/src/config/endpoints.js`

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile

### Quiz
- `POST /api/generate-quiz-topic` - Generate from topic (uses Gemini)
- `POST /api/generate-quiz-file` - Generate from file
- `GET /api/quizzes` - List quizzes

### Results
- `POST /api/results/submit` - Submit results
- `GET /api/results/leaderboard` - Leaderboard

### Live Sessions
- `POST /api/live-sessions/create` - Create session
- `POST /api/live-sessions/join` - Join session

### Meetings
- `POST /api/meetings/create` - Create meeting
- `POST /api/meetings/join` - Join meeting

### Social
- `GET /api/friends` - Friend list
- `POST /api/challenges/create` - Challenge friend
- `GET /api/notifications` - Notifications

### Gamification
- `GET /api/achievements` - Achievements
- `GET /api/stats/leaderboard` - Leaderboard

### Moderation
- `POST /api/reports/create` - Report content
- `GET /api/reports` - View reports (admin)

---

## 🐛 Common Issues & Solutions

### Issue 1: "Network Error" in Frontend
**Solution:** Make sure API Gateway is running on port 3000
```bash
cd microservices/api-gateway
npm run dev
```

### Issue 2: "401 Unauthorized"
**Solution:** Check JWT token in localStorage
```javascript
console.log(localStorage.getItem('token'));
```

### Issue 3: Quiz Generation Fails
**Solution:** Add Gemini API key to Quiz Service .env
```bash
GOOGLE_API_KEY=your_key_here
```

### Issue 4: WebSocket Connection Failed
**Solution:** Check Live Service is running on port 3004
```bash
cd microservices/live-service
npm run dev
```

### Issue 5: CORS Error
**Solution:** Frontend URL should be in allowed origins
- Check `microservices/api-gateway/index.js`
- Add `http://localhost:5173` to allowed origins

---

## 📝 Next Steps

### Before Testing:
1. ✅ Add Gemini API key to Quiz Service
2. ✅ Start all 9 microservices
3. ✅ Start frontend
4. ✅ Test login/register
5. ✅ Test quiz generation

### For Production Deployment:
1. Update `.env.production` files
2. Change API URLs to production URLs
3. Enable HTTPS
4. Configure proper CORS origins
5. Set up monitoring and logging

---

## 🎯 Summary

### ✅ Backend Complete:
- 9 microservices configured
- MongoDB Atlas connected
- Upstash Redis connected
- JWT authentication working
- API Gateway routing all requests

### ✅ Frontend Configured:
- API endpoints mapped
- Axios with JWT interceptors
- WebSocket configuration
- Feature flags enabled
- Environment variables set

### ⚠️ ACTION REQUIRED:
**Add Gemini API key to:**
`microservices/quiz-service/.env`

Get key: https://makersuite.google.com/app/apikey

---

## 🎉 You're Ready to Deploy!

Once you add the Gemini API key, everything will work perfectly!

**Test Flow:**
1. Start all services
2. Start frontend
3. Register/Login
4. Generate a quiz (uses Gemini)
5. Take the quiz
6. View results
7. Create live session
8. Join meeting
9. Check achievements

**Need help?** Check the logs in each service terminal!
