# 🚀 Quick Start Guide - All Microservices

## ✅ Environment Configuration Complete!

All your `.env` files have been configured with:
- ✅ Your MongoDB Atlas connection
- ✅ Correct database names for each service
- ✅ Your JWT secret across all services
- ✅ Your Google OAuth credentials
- ✅ Service URLs for integration

---

## 📋 Service Configuration Summary

| Service | Port | Database | Status |
|---------|------|----------|--------|
| Auth Service | 3001 | cognito_auth | ✅ Configured |
| User Service | 3002 | cognito_users | ✅ Configured |
| Result Service | 3003 | cognito_results | ✅ Configured |
| Live Service | 3004 | cognito_live | ✅ Configured |
| Quiz Service | 3005 | cognito_quizzes | ✅ Configured |
| Social Service | 3006 | cognito_social | ✅ Configured |
| Gamification Service | 3007 | cognito_gamification | ✅ Configured |
| Moderation Service | 3008 | cognito_moderation | ✅ Configured |

---

## 🎯 Step-by-Step Startup Guide

### Prerequisites Check

1. **MongoDB Atlas**: ✅ Already configured
   - Connection string: Working
   - User credentials: Set up

2. **Redis** (Gamification Service): ✅ **Using Upstash Cloud Redis**
   - **NO installation needed!** Your Gamification Service is configured to use Upstash Redis (cloud-based)
   - Already configured with your credentials
   - See `REDIS_SETUP_GUIDE.md` for details

---

## 🚀 Starting All Services

### Option 1: Start All Services Manually (Recommended for Development)

Open **8 separate PowerShell terminals** and run:

**Terminal 1 - Auth Service (Port 3001)**
```powershell
cd "C:\Users\priya\OneDrive\Desktop\CODING\IIT Bombay\Cognito_Learning_Hub\microservices\auth-service"
npm run dev
```

**Terminal 2 - User Service (Port 3002)**
```powershell
cd "C:\Users\priya\OneDrive\Desktop\CODING\IIT Bombay\Cognito_Learning_Hub\microservices\user-service"
npm run dev
```

**Terminal 3 - Result Service (Port 3003)**
```powershell
cd "C:\Users\priya\OneDrive\Desktop\CODING\IIT Bombay\Cognito_Learning_Hub\microservices\result-service"
npm run dev
```

**Terminal 4 - Live Service (Port 3004)**
```powershell
cd "C:\Users\priya\OneDrive\Desktop\CODING\IIT Bombay\Cognito_Learning_Hub\microservices\live-service"
npm run dev
```

**Terminal 5 - Quiz Service (Port 3005)**
```powershell
cd "C:\Users\priya\OneDrive\Desktop\CODING\IIT Bombay\Cognito_Learning_Hub\microservices\quiz-service"
npm run dev
```

**Terminal 6 - Social Service (Port 3006)**
```powershell
cd "C:\Users\priya\OneDrive\Desktop\CODING\IIT Bombay\Cognito_Learning_Hub\microservices\social-service"
npm run dev
```

**Terminal 7 - Gamification Service (Port 3007)**
```powershell
# No Redis installation needed! Using Upstash Cloud Redis
cd "C:\Users\priya\OneDrive\Desktop\CODING\IIT Bombay\Cognito_Learning_Hub\microservices\gamification-service"
npm run dev

# You should see: "Connecting to Upstash Redis (cloud)..."
```

**Terminal 8 - Moderation Service (Port 3008)**
```powershell
cd "C:\Users\priya\OneDrive\Desktop\CODING\IIT Bombay\Cognito_Learning_Hub\microservices\moderation-service"
npm run dev
```

**Terminal 9 - Frontend (Port 5173)**
```powershell
cd "C:\Users\priya\OneDrive\Desktop\CODING\IIT Bombay\Cognito_Learning_Hub\frontend"
npm run dev
```

---

### Option 2: Quick Health Check Script

Create this PowerShell script to check all services:

```powershell
# Save as check-services.ps1
Write-Host "Checking all microservices..." -ForegroundColor Cyan

$services = @(
    @{Name="Auth Service"; Port=3001; URL="http://localhost:3001/health"},
    @{Name="User Service"; Port=3002; URL="http://localhost:3002/health"},
    @{Name="Result Service"; Port=3003; URL="http://localhost:3003/health"},
    @{Name="Live Service"; Port=3004; URL="http://localhost:3004/health"},
    @{Name="Quiz Service"; Port=3005; URL="http://localhost:3005/health"},
    @{Name="Social Service"; Port=3006; URL="http://localhost:3006/health"},
    @{Name="Gamification Service"; Port=3007; URL="http://localhost:3007/health"},
    @{Name="Moderation Service"; Port=3008; URL="http://localhost:3008/health"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-RestMethod -Uri $service.URL -TimeoutSec 2
        Write-Host "✅ $($service.Name) (Port $($service.Port)): HEALTHY" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($service.Name) (Port $($service.Port)): DOWN" -ForegroundColor Red
    }
}
```

Run it:
```powershell
.\check-services.ps1
```

---

## 🧪 Testing Your Setup

### 1. Test Auth Service (Login)

```powershell
# Register a new user
Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" -Method POST -Body (@{
    email="test@example.com"
    password="Test123!"
    name="Test User"
} | ConvertTo-Json) -ContentType "application/json"

# Login
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body (@{
    email="test@example.com"
    password="Test123!"
} | ConvertTo-Json) -ContentType "application/json"

# Save token
$token = $response.token
Write-Host "Token: $token"
```

### 2. Test Gamification Service (Seed Achievements)

```powershell
# Seed default achievements
Invoke-RestMethod -Uri "http://localhost:3007/api/achievements/seed" -Method POST -Headers @{
    Authorization="Bearer $token"
}
```

### 3. Test Result Service (Submit Quiz Result)

```powershell
Invoke-RestMethod -Uri "http://localhost:3003/api/results/submit" -Method POST -Body (@{
    userId="your_user_id"
    quizId="test_quiz"
    score=85
    totalQuestions=10
    correctAnswers=8
    incorrectAnswers=2
    category="programming"
} | ConvertTo-Json) -ContentType "application/json" -Headers @{
    Authorization="Bearer $token"
}
```

This will automatically:
- Save result to Result Service
- Send webhook to Gamification Service
- Check for achievements
- Update leaderboard
- If achievement unlocked, post to Social Service

---

## 📊 Verifying Everything Works

### Check Database Collections

```powershell
# Open MongoDB Compass or mongosh
# Connect to: mongodb+srv://quizwise_user:Rakshita-1006@cluster0.2n6kw7y.mongodb.net/

# You should see these databases:
# - cognito_auth (users, tokens)
# - cognito_users (profiles)
# - cognito_results (results, leaderboards)
# - cognito_live (sessions, participants)
# - cognito_quizzes (quizzes, questions)
# - cognito_social (posts, comments, follows)
# - cognito_gamification (achievements, stats, userAchievements)
# - cognito_moderation (reports, actions, appeals)
```

### Check Redis (Gamification Service)

```powershell
# Connect to Upstash Redis
redis-cli --tls -u redis://default:AYusAAIncDJkODYzNjYzZDg2ZjU0NWY3YmQyOGZiMjE1MzE4ODk5M3AyMzU3NTY@enabled-falcon-35756.upstash.io:6379

# Or view in Upstash Dashboard: https://console.upstash.com/

# Check keys (if using redis-cli)
KEYS *

# Should see:
# - stats:*
# - leaderboard:*
# - achievement_check:*
```

---

## 🎯 Next Steps

### 1. Create an Admin User

In Auth Service, manually update a user's role to "admin":

```javascript
// Using MongoDB Compass or mongosh
use cognito_auth
db.users.updateOne(
  { email: "your_email@example.com" },
  { $set: { role: "admin" } }
)
```

### 2. Create a Moderator User

```javascript
use cognito_auth
db.users.updateOne(
  { email: "moderator@example.com" },
  { $set: { role: "moderator" } }
)
```

### 3. Test Full Flow

1. Register/Login (Auth Service)
2. Take a quiz (Quiz Service)
3. Submit result (Result Service → triggers Gamification)
4. Check achievements (Gamification Service)
5. View social feed (Social Service - should show achievement post)
6. Join live session (Live Service)
7. Report content (Moderation Service)

---

## 🚨 Common Issues & Solutions

### Issue 1: "Port already in use"

```powershell
# Find process using port
netstat -ano | findstr :3001

# Kill process
taskkill /PID <process_id> /F
```

### Issue 2: "MongoDB connection failed"

- Check your internet connection
- Verify MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for testing)
- Check if password has special characters (may need URL encoding)

### Issue 3: "Redis connection failed" (Gamification Service)

```powershell
# You're using Upstash Cloud Redis - check:
# 1. Internet connection
# 2. Verify credentials in gamification-service/.env:
#    UPSTASH_REDIS_URL=redis://enabled-falcon-35756.upstash.io:6379
#    UPSTASH_REDIS_TOKEN=AYusAAInc...
# 3. Check Upstash Dashboard: https://console.upstash.com/

# If Upstash is down, the service will still work (just slower without caching)
```

### Issue 4: "JWT token invalid"

- Ensure JWT_SECRET is the same across all services
- Check token expiration
- Verify Authorization header format: `Bearer <token>`

### Issue 5: Gamification webhook fails

- Check Result/Live service logs
- Verify GAMIFICATION_SERVICE_URL in .env
- Ensure Gamification Service is running on port 3007
- Webhooks are non-blocking, so services will work even if Gamification is down

---

## 🎉 Success Indicators

You'll know everything is working when:

✅ All 8 services show "HEALTHY" in health check  
✅ You can register and login  
✅ Quiz submission updates gamification stats  
✅ Achievements unlock and appear in social feed  
✅ Live sessions work in real-time  
✅ Leaderboards update correctly  
✅ Reports can be created and reviewed  

---

## 📚 Additional Resources

- **Architecture Overview**: `MICROSERVICES_COMPLETE.md`
- **Gamification Integration**: `GAMIFICATION_HOOKS_SUMMARY.md`
- **Moderation Service**: `microservices/moderation-service/INTEGRATION_GUIDE.md`
- **Testing Guide**: Each service has a `README.md` with examples

---

## 🎊 You're All Set!

Your complete microservices architecture is now configured and ready to run!

**Start with:**
1. Start Redis (if using Gamification)
2. Start all 8 microservices
3. Start the frontend
4. Test the health endpoints
5. Register a user and start testing!

Happy Coding! 🚀
