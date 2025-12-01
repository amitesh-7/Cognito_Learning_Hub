# Local Development Setup Guide

## 🎯 Quick Start (WARP Terminal)

### Prerequisites

- Node.js installed
- MongoDB running on `localhost:27017`
- Redis running on `localhost:6379` (optional, uses in-memory fallback if not available)

### Port Configuration

```
Frontend:         http://localhost:5173 (Vite dev server)
API Gateway:      http://localhost:3000 (Entry point for all services)
Auth Service:     http://localhost:3001
Quiz Service:     http://localhost:3002
Result Service:   http://localhost:3003
Live Service:     http://localhost:3004 (Socket.IO)
Social Service:   http://localhost:3006
Gamification:     http://localhost:3007
Meeting Service:  http://localhost:3009
Moderation:       http://localhost:3008
```

## 🚀 Starting Services

### Option 1: Individual Terminals (WARP Recommended)

Open **9 separate WARP terminal windows/tabs** and run each service:

**Terminal 1 - API Gateway:**

```powershell
cd "k:\IIT BOMBAY\Cognito-Learning-Hub\microservices\api-gateway"
npm install
npm run dev
```

**Terminal 2 - Auth Service:**

```powershell
cd "k:\IIT BOMBAY\Cognito-Learning-Hub\microservices\auth-service"
npm install
npm run dev
```

**Terminal 3 - Quiz Service:**

```powershell
cd "k:\IIT BOMBAY\Cognito-Learning-Hub\microservices\quiz-service"
npm install
npm run dev
```

**Terminal 4 - Result Service:**

```powershell
cd "k:\IIT BOMBAY\Cognito-Learning-Hub\microservices\result-service"
npm install
npm run dev
```

**Terminal 5 - Live Service:**

```powershell
cd "k:\IIT BOMBAY\Cognito-Learning-Hub\microservices\live-service"
npm install
npm run dev
```

**Terminal 6 - Social Service:**

```powershell
cd "k:\IIT BOMBAY\Cognito-Learning-Hub\microservices\social-service"
npm install
npm run dev
```

**Terminal 7 - Gamification Service:**

```powershell
cd "k:\IIT BOMBAY\Cognito-Learning-Hub\microservices\gamification-service"
npm install
npm run dev
```

**Terminal 8 - Meeting Service:**

```powershell
cd "k:\IIT BOMBAY\Cognito-Learning-Hub\microservices\meeting-service"
npm install
npm run dev
```

**Terminal 9 - Frontend:**

```powershell
cd "k:\IIT BOMBAY\Cognito-Learning-Hub\frontend"
npm install
npm run dev
```

### Option 2: PowerShell Script (All at Once)

Run the provided startup script:

```powershell
.\start-dev-all.ps1
```

## 🔧 Environment Configuration

### Critical Settings for Local Development

**Frontend `.env`:**

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

**All Microservices:**

- Must use their assigned ports (see Port Configuration above)
- MongoDB URI: `mongodb://localhost:27017/cognito_<service>`
- Redis URL: `redis://localhost:6379`
- JWT Secret: Must be **identical** across all services

## ✅ Verification Checklist

After starting all services, verify:

1. **API Gateway Health:**

   ```
   http://localhost:3000/health
   ```

   Should return: `{ "status": "healthy", "service": "API Gateway" }`

2. **WebSocket Connection:**
   Open browser console at `http://localhost:5173` and check:

   ```
   ✅ Socket.IO connected! ID: xxx
   ```

3. **Service Health:**
   - Auth: http://localhost:3001/health
   - Quiz: http://localhost:3002/health
   - Result: http://localhost:3003/health
   - Live: http://localhost:3004/health

## 🐛 Troubleshooting

### WebSocket Connection Failed

**Error:** `WebSocket connection to 'ws://localhost:3001/socket.io/?EIO=4&transport=websocket' failed`

**Cause:** Frontend trying to connect directly to Auth Service instead of API Gateway

**Solution:**

1. Clear browser cache and localStorage:

   ```javascript
   // In browser console:
   localStorage.clear();
   location.reload();
   ```

2. Verify frontend `.env`:

   ```env
   VITE_SOCKET_URL=http://localhost:3000  # NOT 3001!
   ```

3. Restart Vite dev server:
   ```powershell
   # In frontend terminal, press Ctrl+C then:
   npm run dev
   ```

### 404 on `/api/results/my-results`

**Cause:** Result Service not running or API Gateway can't reach it

**Solution:**

1. Check Result Service is running on port 3003
2. Check API Gateway logs for proxy errors
3. Verify Result Service health: http://localhost:3003/health

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solution:**

```powershell
# Find process using the port:
netstat -ano | findstr :3000

# Kill the process:
taskkill /F /PID <PID_NUMBER>
```

### MongoDB Connection Failed

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**

1. Start MongoDB:

   ```powershell
   # If installed as service:
   net start MongoDB

   # Or run mongod directly:
   mongod --dbpath "C:\data\db"
   ```

## 🔄 Development Workflow

### Making Changes

1. **Frontend changes:** Vite hot-reloads automatically
2. **Backend changes:** Nodemon restarts the service automatically
3. **Schema changes:** May require database reset

### Testing Live Quiz Flow

1. Start all services
2. Navigate to http://localhost:5173
3. Login as teacher
4. Create a quiz
5. Start live session
6. Open new incognito window
7. Login as student
8. Join session with code

### Debugging Tips

- **API Gateway logs:** Shows all proxy requests
- **Live Service logs:** Shows Socket.IO events
- **Browser console:** Shows frontend Socket.IO connection status
- **Network tab:** Shows API requests/responses

## 📝 Common Development Tasks

### Reset Database

```powershell
# Connect to MongoDB:
mongosh

# Drop all databases:
use cognito_auth
db.dropDatabase()
use cognito_quiz
db.dropDatabase()
use cognito_result
db.dropDatabase()
use cognito_live
db.dropDatabase()
```

### Clear Redis Cache

```powershell
# Connect to Redis:
redis-cli

# Clear all keys:
FLUSHALL
```

### Install Dependencies (All Services)

```powershell
cd "k:\IIT BOMBAY\Cognito-Learning-Hub"

# Install shared dependencies:
cd microservices\shared
npm install

# Install each service:
foreach ($service in @("api-gateway", "auth-service", "quiz-service", "result-service", "live-service", "social-service", "gamification-service", "meeting-service", "moderation-service")) {
    cd "..\$service"
    npm install
}

# Install frontend:
cd ..\..\frontend
npm install
```

## 🔐 Environment Variables Checklist

Create `.env` files in each service directory (use `.env.example` as template):

- ✅ `frontend/.env`
- ✅ `microservices/api-gateway/.env`
- ✅ `microservices/auth-service/.env`
- ✅ `microservices/quiz-service/.env`
- ✅ `microservices/result-service/.env`
- ✅ `microservices/live-service/.env`
- ✅ `microservices/social-service/.env`
- ✅ `microservices/gamification-service/.env`
- ✅ `microservices/meeting-service/.env`
- ✅ `microservices/moderation-service/.env`

**Critical:** All services must have the **same JWT_SECRET** value!

## 🚢 Production vs Development

| Aspect     | Development           | Production                           |
| ---------- | --------------------- | ------------------------------------ |
| API URL    | http://localhost:3000 | https://api-gateway-xxx.onrender.com |
| Socket URL | http://localhost:3000 | https://api-gateway-xxx.onrender.com |
| MongoDB    | localhost:27017       | MongoDB Atlas                        |
| Redis      | localhost:6379        | Upstash Redis                        |
| CORS       | Allow localhost       | Specific domains only                |
| Logs       | Verbose (debug)       | Error/Warn only                      |

## 📚 Additional Resources

- [API Documentation](./API_DOCUMENTATION.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Deployment Guide](./MICROSERVICES_DEPLOYMENT_GUIDE.md)
- [Quick Start](./QUICK_START_GUIDE.md)
