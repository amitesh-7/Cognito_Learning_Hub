# ✅ Pre-Launch Checklist

## 🔑 Critical: Add API Keys

### 1. Gemini API Key (REQUIRED for Quiz Generation)
```bash
File: microservices/quiz-service/.env
Add: GOOGLE_API_KEY=your_gemini_api_key_here
Get from: https://makersuite.google.com/app/apikey
```

Status: ⚠️ **ACTION REQUIRED**

### 2. Google OAuth (Already Configured)
```bash
Frontend: VITE_GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru
Status: ✅ DONE
```

Make sure to add these URLs in Google Console:
- `http://localhost:5173`
- `http://localhost:3000`

---

## 🚀 Start Services Checklist

### Backend Services (Start in this order):

```bash
# 1. API Gateway (MUST START FIRST)
□ cd microservices/api-gateway && npm run dev
  Expected: "🚀 API Gateway running on http://0.0.0.0:3000"

# 2. Auth Service
□ cd microservices/auth-service && npm run dev
  Expected: "✅ Auth Service running on port 3001"

# 3. Quiz Service (NEEDS GEMINI KEY)
□ cd microservices/quiz-service && npm run dev
  Expected: "✅ Quiz Service running on port 3005"
  Expected: "Connecting to Upstash Redis (cloud)..."

# 4. Result Service
□ cd microservices/result-service && npm run dev
  Expected: "✅ Result Service running on port 3003"

# 5. Live Service
□ cd microservices/live-service && npm run dev
  Expected: "✅ Live Service running on port 3004"

# 6. Meeting Service
□ cd microservices/meeting-service && npm run dev
  Expected: "✅ Meeting Service running on port 3009"

# 7. Social Service
□ cd microservices/social-service && npm run dev
  Expected: "✅ Social Service running on port 3006"

# 8. Gamification Service
□ cd microservices/gamification-service && npm run dev
  Expected: "✅ Gamification Service running on port 3007"

# 9. Moderation Service
□ cd microservices/moderation-service && npm run dev
  Expected: "✅ Moderation Service running on port 3008"
```

### Frontend:

```bash
□ cd frontend && npm run dev
  Expected: "VITE ready in ... ms"
  Expected: "Local: http://localhost:5173/"
```

---

## 🧪 Testing Checklist

### 1. Health Checks

```bash
# Test API Gateway
□ curl http://localhost:3000/health
  Expected: {"status":"healthy","service":"API Gateway"}

# Test individual services
□ curl http://localhost:3001/health  # Auth
□ curl http://localhost:3005/health  # Quiz
□ curl http://localhost:3003/health  # Result
□ curl http://localhost:3004/health  # Live
□ curl http://localhost:3009/health  # Meeting
□ curl http://localhost:3006/health  # Social
□ curl http://localhost:3007/health  # Gamification
□ curl http://localhost:3008/health  # Moderation
```

### 2. Frontend Connection

```bash
□ Open http://localhost:5173 in browser
□ Open browser console (F12)
□ Check for errors in console
□ Verify API config is loaded:
  Run: console.log(import.meta.env)
  Should show VITE_API_URL=http://localhost:3000
```

### 3. Authentication Flow

```bash
□ Register new user
□ Login with credentials
□ Check JWT token saved:
  localStorage.getItem('token') should return a token
□ Logout and token removed
```

### 4. Quiz Generation (GEMINI TEST)

```bash
□ Navigate to Quiz Creator
□ Enter topic: "JavaScript"
□ Click Generate
□ Wait for AI generation (10-15 seconds)
□ Verify questions appear
□ Check quiz saved to database
```

### 5. Live Quiz Session

```bash
□ Create live session
□ Get session code (e.g., ABC12345)
□ Join session from another browser/tab
□ Start session (host)
□ Answer questions
□ Check leaderboard updates in real-time
```

### 6. WebRTC Meeting

```bash
□ Create meeting room
□ Get meeting code
□ Join from another browser/tab
□ Enable camera/microphone permissions
□ Verify video/audio working
□ Test screen sharing
□ Test chat messages
```

### 7. Social Features

```bash
□ Search for users
□ Send friend request
□ Accept friend request
□ Challenge friend to duel
□ Accept challenge
□ Complete quiz duel
□ View results
```

### 8. Gamification

```bash
□ Complete a quiz
□ Check achievements unlocked
□ View leaderboard
□ Check streak counter
□ Verify XP/points awarded
```

### 9. Moderation

```bash
□ Report a user/content
□ Login as moderator/admin
□ View pending reports
□ Take moderation action
□ Verify user notified
```

---

## 🔍 Monitoring Checklist

### Terminal Logs to Watch:

```bash
□ API Gateway: Check for incoming requests
  Look for: "Proxying GET/POST ... to ..."

□ Quiz Service: Check for AI generation
  Look for: "AI generation completed in ...ms"
  Look for: "Connecting to Upstash Redis (cloud)..."

□ Live Service: Check WebSocket connections
  Look for: "Client connected: ..."
  Look for: "Participant joined session: ..."

□ Meeting Service: Check WebRTC signaling
  Look for: "User joined meeting: ..."
  Look for: "WebRTC offer/answer exchanged"

□ All Services: Check for errors
  No "ERROR" or "ECONNREFUSED" messages
  No "Unauthorized" or "401" errors
```

### Browser Console to Watch:

```bash
□ No CORS errors
□ No 401/403 errors
□ API requests successful (200 status)
□ WebSocket connections established
□ No "Network Error" messages
```

---

## 🐛 Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| API Gateway won't start | Check port 3000 is free: `netstat -ano \| findstr :3000` |
| Quiz generation fails | Add Gemini API key to quiz-service/.env |
| Redis connection failed | Check Upstash credentials in .env files |
| MongoDB connection failed | Verify MongoDB Atlas credentials |
| CORS error | Add frontend URL to API Gateway CORS whitelist |
| WebSocket won't connect | Check Live Service running on port 3004 |
| 401 Unauthorized | Check JWT token in localStorage |
| Can't login | Check Auth Service running on port 3001 |

---

## 📊 Expected Performance

### Service Response Times:
- Health checks: < 100ms
- Authentication: < 500ms
- Quiz generation (AI): 10-15 seconds
- Quiz retrieval: < 200ms
- Result submission: < 300ms
- Live session join: < 500ms
- WebSocket latency: < 100ms

### Database Connections:
- MongoDB Atlas: Connected ✅
- Upstash Redis: Connected ✅

### Memory Usage:
- Each microservice: ~100-200 MB
- Frontend: ~50-100 MB
- Total: ~1.5-2 GB RAM

---

## 🎯 Final Verification

Before calling it complete, verify:

```bash
□ All 9 microservices running (no crashes)
□ Frontend accessible at http://localhost:5173
□ Can register and login
□ Can generate quiz with Gemini AI
□ Can create and join live sessions
□ Can create and join meetings
□ Can send friend requests
□ Achievements unlock correctly
□ No errors in any terminal
□ No errors in browser console
```

---

## 🎉 You're Ready!

If all checkboxes are ✅, your app is ready to use!

### Quick Start Command (PowerShell):

```powershell
# Create a start-all script
# Save as: start-all-services.ps1

# Start API Gateway
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd microservices/api-gateway; npm run dev"

# Wait 5 seconds for gateway to start
Start-Sleep -Seconds 5

# Start all other services
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd microservices/auth-service; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd microservices/quiz-service; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd microservices/result-service; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd microservices/live-service; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd microservices/meeting-service; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd microservices/social-service; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd microservices/gamification-service; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd microservices/moderation-service; npm run dev"

# Wait 5 seconds for services to start
Start-Sleep -Seconds 5

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
```

Run: `.\start-all-services.ps1`

---

**Last Updated:** 2025-11-29
**Status:** ✅ Ready for Testing
**Action Required:** Add Gemini API Key
