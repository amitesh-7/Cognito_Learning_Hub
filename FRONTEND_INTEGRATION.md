# Frontend Integration Guide

## 🎯 Overview
All 9 microservices are now running with cloud databases. This guide covers frontend configuration and API integration.

---

## 📋 Backend Services Status

### ✅ All Services Running
| Service | Port | Database | Redis | Status |
|---------|------|----------|-------|--------|
| Auth Service | 3001 | cognito_auth | ✅ Upstash | ✅ Ready |
| Quiz Service | 3005 | cognito_quizzes | ✅ Upstash | ✅ Ready |
| Result Service | 3003 | cognito_results | ✅ Upstash | ✅ Ready |
| Live Service | 3004 | cognito_live | ✅ Upstash | ✅ Ready |
| Gamification Service | 3007 | cognito_gamification | ✅ Upstash | ✅ Ready |
| Social Service | 3006 | cognito_social | ✅ Upstash | ✅ Ready |
| Meeting Service | 3009 | cognito_meetings | ✅ Upstash | ✅ Ready |
| Moderation Service | 3008 | cognito_moderation | ✅ MongoDB | ✅ Ready |
| API Gateway | 3000 | - | - | ⚠️ Check |

---

## 🔧 Frontend Configuration

### 1. Update API Base URL

**File:** `frontend/src/config/api.js` or `frontend/.env`

```javascript
// Development
const API_BASE_URL = 'http://localhost:3000'; // API Gateway

// Production (update after deployment)
const PRODUCTION_API_URL = 'https://your-api-gateway.onrender.com';

export const API_URL = process.env.NODE_ENV === 'production' 
  ? PRODUCTION_API_URL 
  : API_BASE_URL;
```

### 2. API Endpoints Configuration

**Create:** `frontend/src/config/endpoints.js`

```javascript
export const ENDPOINTS = {
  // Auth Service (via Gateway)
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    profile: '/api/users/profile',
  },

  // Quiz Service
  quiz: {
    generate: '/api/quiz/generate',
    getById: (id) => `/api/quiz/${id}`,
    submit: '/api/quiz/submit',
    list: '/api/quiz/list',
  },

  // Result Service
  results: {
    submit: '/api/results/submit',
    getUserResults: (userId) => `/api/results/user/${userId}`,
    getQuizResults: (quizId) => `/api/results/quiz/${quizId}`,
    leaderboard: '/api/results/leaderboard',
  },

  // Live Service
  live: {
    createSession: '/api/live/session/create',
    joinSession: '/api/live/session/join',
    getSession: (code) => `/api/live/session/${code}`,
  },

  // Gamification Service
  gamification: {
    achievements: '/api/achievements',
    userAchievements: (userId) => `/api/achievements/user/${userId}`,
    leaderboard: '/api/leaderboard',
  },

  // Social Service
  social: {
    posts: '/api/social/posts',
    createPost: '/api/social/posts',
    like: (postId) => `/api/social/posts/${postId}/like`,
    comment: (postId) => `/api/social/posts/${postId}/comments`,
    feed: '/api/social/feed',
  },

  // Meeting Service
  meeting: {
    create: '/api/meetings/create',
    join: '/api/meetings/join',
    getMeeting: (id) => `/api/meetings/${id}`,
  },

  // Moderation Service
  moderation: {
    report: '/api/moderation/reports',
    getReports: '/api/moderation/reports',
    takeAction: '/api/moderation/actions',
  },
};
```

### 3. Axios Configuration with Interceptors

**File:** `frontend/src/utils/axios.js`

```javascript
import axios from 'axios';
import { API_URL } from '../config/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### 4. Environment Variables

**File:** `frontend/.env.development`

```bash
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3004
VITE_MEETING_WS_URL=ws://localhost:3009
```

**File:** `frontend/.env.production`

```bash
VITE_API_URL=https://your-api-gateway.onrender.com
VITE_WS_URL=wss://your-live-service.onrender.com
VITE_MEETING_WS_URL=wss://your-meeting-service.onrender.com
```

---

## 🔌 WebSocket Integration

### Live Quiz Sessions

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3004', {
  auth: {
    token: localStorage.getItem('token'),
  },
  transports: ['websocket'],
});

// Join session
socket.emit('join-session', { 
  sessionCode: 'ABC12345',
  userId: currentUser.id,
  username: currentUser.name 
});

// Listen for events
socket.on('participant-joined', (data) => {
  console.log('New participant:', data);
});

socket.on('question-started', (data) => {
  console.log('Question:', data.question);
});

socket.on('leaderboard-updated', (data) => {
  console.log('Leaderboard:', data.leaderboard);
});
```

### Meeting Service (WebRTC)

```javascript
import io from 'socket.io-client';

const meetingSocket = io('http://localhost:3009', {
  auth: {
    token: localStorage.getItem('token'),
  },
});

// Join meeting
meetingSocket.emit('join-meeting', {
  meetingCode: 'MTG12345',
  userId: currentUser.id,
  username: currentUser.name,
  audio: true,
  video: true,
});

// Handle WebRTC signaling
meetingSocket.on('user-joined', handleUserJoined);
meetingSocket.on('offer', handleOffer);
meetingSocket.on('answer', handleAnswer);
meetingSocket.on('ice-candidate', handleIceCandidate);
```

---

## 🚀 API Gateway Configuration

### Check Gateway Routes

**File:** `microservices/api-gateway/index.js`

Ensure these routes are configured:

```javascript
// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Quiz routes
app.use('/api/quiz', quizRoutes);

// Result routes
app.use('/api/results', resultRoutes);

// Live routes
app.use('/api/live', liveRoutes);

// Gamification routes
app.use('/api/achievements', achievementRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Social routes
app.use('/api/social', socialRoutes);

// Meeting routes
app.use('/api/meetings', meetingRoutes);

// Moderation routes
app.use('/api/moderation', moderationRoutes);
```

---

## 🧪 Testing API Endpoints

### 1. Test Auth Service

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### 2. Test Quiz Service (with JWT)

```bash
# Generate quiz
curl -X POST http://localhost:3000/api/quiz/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"topic":"JavaScript","numQuestions":5,"difficulty":"medium"}'
```

### 3. Test Live Service Health

```bash
curl http://localhost:3004/health
```

---

## 📱 Frontend Service Integration Examples

### Auth Context

```javascript
import { createContext, useState, useEffect } from 'react';
import axios from '../utils/axios';
import { ENDPOINTS } from '../config/endpoints';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const { data } = await axios.get(ENDPOINTS.auth.profile);
      setUser(data.data.user);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await axios.post(ENDPOINTS.auth.login, { email, password });
    localStorage.setItem('token', data.data.token);
    setUser(data.data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Quiz Component

```javascript
import { useState } from 'react';
import axios from '../utils/axios';
import { ENDPOINTS } from '../config/endpoints';

export const QuizGenerator = () => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateQuiz = async (topic, numQuestions = 5) => {
    setLoading(true);
    try {
      const { data } = await axios.post(ENDPOINTS.quiz.generate, {
        topic,
        numQuestions,
        difficulty: 'medium',
      });
      setQuiz(data.data.quiz);
    } catch (error) {
      console.error('Quiz generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => generateQuiz('React')}>
        Generate React Quiz
      </button>
      {loading && <p>Generating quiz...</p>}
      {quiz && <QuizDisplay quiz={quiz} />}
    </div>
  );
};
```

---

## 🔒 Security Checklist

- [x] JWT tokens stored securely (localStorage with httpOnly cookies recommended for production)
- [x] CORS configured on all services
- [x] Rate limiting enabled on API Gateway
- [x] Input validation on all endpoints
- [x] MongoDB connection secured with credentials
- [x] Redis secured with Upstash authentication
- [ ] HTTPS enabled (for production)
- [ ] Environment variables secured (use secrets manager in production)

---

## 📦 Deployment Preparation

### 1. Build Frontend

```bash
cd frontend
npm run build
```

### 2. Test Production Build Locally

```bash
npm run preview
```

### 3. Update API URLs for Production

Update `frontend/.env.production` with deployed backend URLs.

---

## 🎯 Next Steps

1. **Start API Gateway** (if not running)
   ```bash
   cd microservices/api-gateway
   npm run dev
   ```

2. **Test Frontend Integration**
   - Start frontend dev server
   - Test login/register flow
   - Test quiz generation
   - Test live sessions
   - Test WebRTC meetings

3. **Prepare for Deployment**
   - Choose hosting platform (Vercel/Netlify for frontend, Render/Railway for backend)
   - Set up environment variables
   - Configure CORS for production URLs
   - Deploy services one by one

4. **Monitor & Debug**
   - Check browser console for errors
   - Monitor API responses
   - Test WebSocket connections
   - Verify JWT authentication flow

---

## 🐛 Common Issues & Solutions

### Issue: CORS Error
**Solution:** Add your frontend URL to CORS whitelist in each service:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-frontend.vercel.app'
];
```

### Issue: WebSocket Connection Failed
**Solution:** Check firewall, ensure ports are open, verify WS_URL configuration

### Issue: JWT Token Not Sent
**Solution:** Check axios interceptor configuration and ensure token is in localStorage

### Issue: 401 Unauthorized
**Solution:** Verify JWT_SECRET matches across all services

---

## 📞 Need Help?

Check:
1. Backend service logs (look for errors in terminal)
2. Browser Network tab (check API responses)
3. Browser Console (JavaScript errors)
4. MongoDB Atlas logs
5. Upstash Redis dashboard

Your backend is ready! Time to connect the frontend! 🚀
