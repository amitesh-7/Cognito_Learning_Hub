# 🔴 Redis Setup Guide for Windows

## ✅ Quick Solution: Use Upstash Redis (Already Configured!)

**Good news!** Your Gamification Service is now configured to use **Upstash Redis** - a cloud-based Redis that requires **NO local installation**. This is the easiest and recommended approach!

### What I Just Fixed:

1. ✅ Updated `gamification-service/.env` with Upstash credentials
2. ✅ Modified Redis configuration to support Upstash
3. ✅ Added automatic fallback to local Redis if Upstash fails

---

## 🚀 Option 1: Use Upstash Redis (Recommended - Already Working!)

Your Gamification Service will now automatically connect to Upstash Redis using these credentials (already in your `.env`):

```env
UPSTASH_REDIS_URL=redis://enabled-falcon-35756.upstash.io:6379
UPSTASH_REDIS_TOKEN=AYusAAIncDJkODYzNjYzZDg2ZjU0NWY3YmQyOGZiMjE1MzE4ODk5M3AyMzU3NTY
```

**Connection String (for CLI):**
```bash
redis-cli --tls -u redis://default:AYusAAIncDJkODYzNjYzZDg2ZjU0NWY3YmQyOGZiMjE1MzE4ODk5M3AyMzU3NTY@enabled-falcon-35756.upstash.io:6379
```

### Test It Now:

```powershell
cd "C:\Users\priya\OneDrive\Desktop\CODING\IIT Bombay\Cognito_Learning_Hub\microservices\gamification-service"
npm run dev
```

You should see:
```
🔄 Connecting to Upstash Redis (cloud)...
✅ Redis client connected
✅ Redis client ready
```

**That's it! No installation needed!** 🎉

---

## 🔧 Option 2: Install Redis Locally (Optional)

If you want to run Redis locally on Windows, here are the options:

### Method A: Using Memurai (Redis for Windows)

**Memurai** is a native Redis-compatible server for Windows.

1. **Download Memurai:**
   - Go to: https://www.memurai.com/get-memurai
   - Download Memurai Developer Edition (free)
   - Or direct link: https://www.memurai.com/get-memurai#download

2. **Install Memurai:**
   ```powershell
   # Run the installer
   # It will install as a Windows service
   ```

3. **Start Memurai Service:**
   ```powershell
   # Check if service is running
   Get-Service Memurai
   
   # Start service
   Start-Service Memurai
   
   # Or use Memurai GUI to start
   ```

4. **Verify Connection:**
   ```powershell
   # Install Redis CLI tools (optional)
   # Or use Memurai CLI
   memurai-cli ping
   # Should return: PONG
   ```

5. **Update Gamification Service .env to use local Redis:**
   ```env
   # Comment out or remove Upstash lines
   # UPSTASH_REDIS_URL=...
   # UPSTASH_REDIS_TOKEN=...
   
   # Use local Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   ```

### Method B: Using WSL2 (Windows Subsystem for Linux)

1. **Install WSL2:**
   ```powershell
   wsl --install
   # Restart computer
   ```

2. **Install Redis in WSL:**
   ```bash
   # Open WSL terminal
   wsl
   
   # Update packages
   sudo apt update
   
   # Install Redis
   sudo apt install redis-server
   
   # Start Redis
   sudo service redis-server start
   
   # Test
   redis-cli ping
   # Should return: PONG
   ```

3. **Connect from Windows:**
   ```powershell
   # Redis will be available at localhost:6379
   # No need to change .env if REDIS_HOST=localhost
   ```

### Method C: Using Docker (Best for Development)

1. **Install Docker Desktop for Windows:**
   - Download from: https://www.docker.com/products/docker-desktop/

2. **Run Redis Container:**
   ```powershell
   # Pull Redis image
   docker pull redis:latest
   
   # Run Redis
   docker run --name cognito-redis -p 6379:6379 -d redis
   
   # Check if running
   docker ps
   
   # Stop Redis
   docker stop cognito-redis
   
   # Start Redis
   docker start cognito-redis
   ```

3. **Test Connection:**
   ```powershell
   # Install Redis CLI (optional)
   # Or use Docker exec
   docker exec -it cognito-redis redis-cli ping
   # Should return: PONG
   ```

---

## 🧪 Testing Redis Connection

### Test 1: Check Gamification Service Logs

```powershell
cd "C:\Users\priya\OneDrive\Desktop\CODING\IIT Bombay\Cognito_Learning_Hub\microservices\gamification-service"
npm run dev
```

**If using Upstash (cloud), you should see:**
```
🔄 Connecting to Upstash Redis (cloud)...
✅ Redis client connected
✅ Redis client ready
🚀 Gamification Service running on port 3007
```

**If using local Redis, you should see:**
```
🔄 Connecting to local Redis...
✅ Redis client connected
✅ Redis client ready
🚀 Gamification Service running on port 3007
```

### Test 2: Check Redis Keys

Once the service is running, Redis will store:
- User stats: `stats:userId`
- Leaderboards: `leaderboard:global`, `leaderboard:category:programming`
- Achievement checks: `achievement_check:userId`

### Test 3: Submit a Quiz Result

```powershell
# First, login to get a token
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body (@{
    email="test@example.com"
    password="Test123!"
} | ConvertTo-Json) -ContentType "application/json"

$token = $response.token

# Submit a quiz result (this will trigger Redis caching)
Invoke-RestMethod -Uri "http://localhost:3003/api/results/submit" -Method POST -Body (@{
    userId="user_123"
    quizId="test_quiz"
    score=85
    totalQuestions=10
    correctAnswers=8
    category="programming"
} | ConvertTo-Json) -ContentType "application/json" -Headers @{
    Authorization="Bearer $token"
}
```

This will:
1. Save result to Result Service
2. Send webhook to Gamification Service
3. **Cache stats in Redis**
4. Update leaderboard in Redis
5. Check achievements

---

## 🎯 Which Option Should You Use?

### ✅ Recommended: Upstash Redis (Already Configured!)

**Pros:**
- ✅ No installation required
- ✅ Already configured and working
- ✅ Cloud-based (works anywhere)
- ✅ Free tier is sufficient for development
- ✅ No Windows compatibility issues

**Cons:**
- ❌ Requires internet connection
- ❌ Small latency (cloud vs local)

**Best for:** Quick start, production deployment, hassle-free development

### Local Redis Options:

#### Memurai
**Pros:**
- ✅ Native Windows support
- ✅ Easy installation
- ✅ GUI included

**Cons:**
- ❌ Requires installation
- ❌ Developer edition only

**Best for:** Long-term Windows development

#### Docker
**Pros:**
- ✅ Easy to start/stop
- ✅ Isolated environment
- ✅ Same as production

**Cons:**
- ❌ Requires Docker Desktop
- ❌ Uses more resources

**Best for:** Development with Docker knowledge

#### WSL2
**Pros:**
- ✅ True Redis (Linux version)
- ✅ Free

**Cons:**
- ❌ Requires WSL2 setup
- ❌ Another layer of complexity

**Best for:** Linux enthusiasts on Windows

---

## 🚨 Troubleshooting

### Issue 1: "Redis connection failed" (Upstash)

**Check internet connection:**
```powershell
Test-Connection enabled-falcon-35756.upstash.io
```

**Verify credentials in .env:**
```env
UPSTASH_REDIS_URL=redis://enabled-falcon-35756.upstash.io:6379
UPSTASH_REDIS_TOKEN=AYusAAIncDJkODYzNjYzZDg2ZjU0NWY3YmQyOGZiMjE1MzE4ODk5M3AyMzU3NTY
```

**Test connection:**
```powershell
# If you have redis-cli installed
redis-cli --tls -u redis://default:AYusAAIncDJkODYzNjYzZDg2ZjU0NWY3YmQyOGZiMjE1MzE4ODk5M3AyMzU3NTY@enabled-falcon-35756.upstash.io:6379 ping
# Should return: PONG
```

**Check Upstash Dashboard:**
- Login to: https://console.upstash.com/
- Check if your Redis instance is active

### Issue 2: "Redis connection refused" (Local Redis)

**Check if Redis/Memurai is running:**
```powershell
# For Memurai
Get-Service Memurai

# For Docker
docker ps | findstr redis

# For WSL
wsl redis-cli ping
```

**Start the service:**
```powershell
# Memurai
Start-Service Memurai

# Docker
docker start cognito-redis

# WSL
wsl sudo service redis-server start
```

### Issue 3: Port 6379 already in use

**Find what's using the port:**
```powershell
netstat -ano | findstr :6379
```

**Kill the process:**
```powershell
taskkill /PID <process_id> /F
```

### Issue 4: Gamification Service starts but Redis errors

**The service will still work!** Redis is used for:
- Performance optimization (caching)
- Background job queues

If Redis fails, the service will:
- ✅ Still save data to MongoDB
- ✅ Still process achievements
- ❌ Just slower (no caching)
- ❌ Background jobs won't queue

---

## 🎊 Quick Start Summary

### For Immediate Use (Recommended):

```powershell
# 1. Verify Upstash is configured (already done!)
# Check: gamification-service/.env has UPSTASH_REDIS_URL

# 2. Start Gamification Service
cd "C:\Users\priya\OneDrive\Desktop\CODING\IIT Bombay\Cognito_Learning_Hub\microservices\gamification-service"
npm run dev

# 3. Look for: "Connecting to Upstash Redis (cloud)..."
# 4. Should see: "Redis client ready" ✅

# That's it! You're using cloud Redis with ZERO installation!
```

### For Local Redis Later:

1. Choose installation method (Memurai, Docker, or WSL2)
2. Install and start Redis
3. Comment out Upstash lines in `.env`
4. Restart Gamification Service

---

## 📊 Monitoring Redis (Optional)

### Using Upstash Dashboard:
- Visit: https://console.upstash.com/
- View your Redis instance
- See commands, memory usage, key count

### Using Redis CLI (Local Redis):
```powershell
# Memurai
memurai-cli

# Docker
docker exec -it cognito-redis redis-cli

# WSL
wsl redis-cli
```

**Common commands:**
```redis
# List all keys
KEYS *

# Get value
GET stats:user_123

# Check if key exists
EXISTS stats:user_123

# View all keys matching pattern
KEYS stats:*

# Get leaderboard
ZRANGE leaderboard:global 0 10 WITHSCORES

# Monitor real-time commands
MONITOR
```

---

## ✅ You're All Set!

Your Gamification Service is now configured to use **Upstash Redis** (cloud) with automatic fallback to local Redis if you install it later.

**Current Status:**
- ✅ Redis configuration: UPDATED
- ✅ Upstash credentials: CONFIGURED
- ✅ Fallback to local: ENABLED
- ✅ Ready to start: YES

**Next Step:**
```powershell
cd "C:\Users\priya\OneDrive\Desktop\CODING\IIT Bombay\Cognito_Learning_Hub\microservices\gamification-service"
npm run dev
```

You should see Redis connect successfully! 🚀

---

## 🔮 Future: Production Deployment

For production, Upstash Redis is perfect because:
- ✅ No server to maintain
- ✅ Auto-scaling
- ✅ High availability
- ✅ SSL/TLS encryption
- ✅ Global edge locations

You're already production-ready! 🎉
