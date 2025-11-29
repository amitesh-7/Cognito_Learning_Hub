# Frontend-Backend Connection Guide

## 🎯 Quick Setup to Connect Frontend to Deployed Backend

Your backend microservices are now deployed on Render. Follow these steps to connect your frontend.

---

## Step 1: Update Frontend Environment Variables

Create or update `frontend/.env` file with your deployed API Gateway URL:

```env
# Production Backend API Gateway URL
VITE_API_URL=https://your-api-gateway.onrender.com

# Socket.IO URL (same as API Gateway - it proxies to services)
VITE_SOCKET_URL=https://your-api-gateway.onrender.com

# Google OAuth Client ID (keep your existing one)
VITE_GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com

# Optional: Enable features
VITE_ENABLE_LIVE_QUIZ=true
VITE_ENABLE_MEETINGS=true
VITE_ENABLE_SOCIAL=true
VITE_ENABLE_GAMIFICATION=true
VITE_ENABLE_MODERATION=true
```

**Replace `https://your-api-gateway.onrender.com` with your actual API Gateway URL from Render.**

---

## Step 2: Verify API Gateway is Running

Test your API Gateway:

```bash
# Should return service info and list of connected services
curl https://your-api-gateway.onrender.com/

# Should return health status
curl https://your-api-gateway.onrender.com/health
```

Expected response from `/`:

```json
{
  "message": "Cognito Learning Hub API Gateway",
  "version": "1.0.0",
  "status": "online",
  "services": {
    "auth": "https://auth-service.onrender.com",
    "quiz": "https://quiz-service.onrender.com",
    ...
  }
}
```

---

## Step 3: Test Frontend Locally with Production Backend

```bash
cd frontend
npm install
npm run dev
```

The frontend will now connect to your production backend on Render.

Open: `http://localhost:5173`

---

## Step 4: Deploy Frontend to Vercel (if not already deployed)

### Option A: Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Select the `frontend` folder as root directory
4. Add environment variables:
   - `VITE_API_URL` = `https://your-api-gateway.onrender.com`
   - `VITE_SOCKET_URL` = `https://your-api-gateway.onrender.com`
   - `VITE_GOOGLE_CLIENT_ID` = `your-google-client-id`
5. Deploy

### Option B: Via Vercel CLI

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

When prompted, add environment variables.

---

## Step 5: Update CORS Settings in API Gateway

After deploying frontend, update API Gateway environment variables on Render:

```env
FRONTEND_URLS=https://your-frontend.vercel.app,https://cognito-learning-hub-frontend.vercel.app
```

Or if you have multiple frontend URLs (staging, production):

```env
FRONTEND_URLS=https://your-frontend.vercel.app,https://your-staging.vercel.app,http://localhost:5173
```

**Important:** Restart the API Gateway service on Render after updating environment variables.

---

## Step 6: Test All Features

### ✅ Authentication

1. Register new user
2. Login with email/password
3. Login with Google OAuth
4. Test logout

### ✅ Quiz Features

1. **Create Quiz**
   - Generate from topic (AI)
   - Generate from file upload
   - Create manual quiz
2. **Take Quiz**
   - Solo mode
   - Check adaptive difficulty
3. **View Results**
   - Check scores
   - View leaderboard
   - Check analytics

### ✅ Live Quiz (Real-time)

1. Create live session (as teacher)
2. Get session code
3. Join session (as student) using code
4. Start quiz and answer questions
5. Check real-time leaderboard updates

**Note:** Make sure Socket.IO is working - check browser console for WebSocket connection logs.

### ✅ Social Features

1. Search and add friends
2. Send/accept friend requests
3. Challenge friend to quiz duel
4. Check notifications
5. Test chat (if implemented)

### ✅ Gamification

1. Complete quizzes to unlock achievements
2. Check user stats and streaks
3. View global leaderboard
4. Track progress

### ✅ Meetings (Video)

1. Create meeting room
2. Share meeting code
3. Join meeting
4. Test audio/video/screen share

### ✅ Moderation (Admin/Moderator only)

1. Create report
2. Review reports (moderator)
3. Take action (ban/warn users)
4. View moderation logs

---

## 🔍 Troubleshooting

### Issue: "Network Error" or "Failed to fetch"

**Check:**

1. API Gateway URL is correct in frontend `.env`
2. API Gateway is running on Render (check health endpoint)
3. CORS is configured correctly (FRONTEND_URLS includes your frontend domain)

**Fix:**

```bash
# Test API Gateway
curl https://your-api-gateway.onrender.com/health

# Check browser console for CORS errors
# Update FRONTEND_URLS on Render and restart API Gateway
```

### Issue: WebSocket connection failed

**Check:**

1. `VITE_SOCKET_URL` is set correctly
2. API Gateway is proxying Socket.IO to Live Service
3. Live Service is running and healthy

**Fix:**

```bash
# Test live service health
curl https://live-service.onrender.com/health

# Check browser console for Socket.IO connection logs
```

### Issue: Google OAuth not working

**Check:**

1. `VITE_GOOGLE_CLIENT_ID` is set correctly
2. Authorized JavaScript origins in Google Console include:
   - `http://localhost:5173` (for local dev)
   - `https://your-frontend.vercel.app` (for production)
3. Authorized redirect URIs include:
   - `http://localhost:5173` (for local dev)
   - `https://your-frontend.vercel.app` (for production)

**Fix:**
Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth 2.0 Client IDs → Add authorized origins and redirect URIs

### Issue: Some features not working

**Check:**

1. All 9 microservices are running on Render
2. API Gateway has correct service URLs in environment variables
3. MongoDB database is accessible from all services
4. Redis/Upstash is connected (optional but improves performance)

**Services checklist:**

- [ ] API Gateway (`https://api-gateway.onrender.com`)
- [ ] Auth Service
- [ ] Quiz Service
- [ ] Result Service
- [ ] Live Service
- [ ] Meeting Service
- [ ] Social Service
- [ ] Gamification Service
- [ ] Moderation Service

---

## 📊 Monitoring & Logs

### Check Service Health

Create a simple health check script:

```bash
# health-check.sh
services=(
  "api-gateway"
  "auth-service"
  "quiz-service"
  "result-service"
  "live-service"
  "meeting-service"
  "social-service"
  "gamification-service"
  "moderation-service"
)

for service in "${services[@]}"; do
  echo "Checking $service..."
  curl -s https://$service.onrender.com/health | jq .
done
```

### View Logs on Render

1. Go to Render Dashboard
2. Select each service
3. Click "Logs" tab
4. Check for errors

### Browser DevTools

1. Open Developer Console (F12)
2. **Console Tab:** Check for errors
3. **Network Tab:**
   - Filter by XHR/Fetch to see API calls
   - Check response status codes
   - View request/response payloads
4. **Application Tab:**
   - Check LocalStorage for JWT tokens
   - Verify cookies are set

---

## 🚀 Performance Tips

1. **Enable Redis/Upstash** on all services for caching
2. **Use CDN** for static assets (Vercel handles this automatically)
3. **Monitor Render Free Tier limits** (750 hours/month per service)
4. **Set up GitHub Actions** to keep services alive (already configured in `.github/workflows/ping.yml`)

---

## 📝 Final Checklist

Before going live:

- [ ] Frontend deployed to Vercel
- [ ] All 9 backend services running on Render
- [ ] Environment variables set correctly on both frontend and backend
- [ ] CORS configured to allow frontend domain
- [ ] Google OAuth configured with correct origins
- [ ] Database connected and accessible
- [ ] Health checks passing for all services
- [ ] Test all major features (auth, quiz, live, social, gamification)
- [ ] Monitor logs for errors
- [ ] Set up auto-ping workflow to keep services alive

---

## 🎉 You're Ready!

Once all steps are complete, your Cognito Learning Hub should be fully functional with:

- ✅ User authentication & profiles
- ✅ AI-powered quiz generation
- ✅ Real-time live quiz sessions
- ✅ Video meetings with WebRTC
- ✅ Social features (friends, chat, challenges)
- ✅ Gamification (achievements, leaderboards)
- ✅ Content moderation

**Frontend URL:** `https://your-frontend.vercel.app`
**Backend API:** `https://your-api-gateway.onrender.com`

Enjoy your fully deployed microservices platform! 🚀
