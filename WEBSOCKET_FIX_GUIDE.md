# 🔴 WebSocket Connection Failed - Quick Fix

## Problem

```
WebSocket connection to 'wss://meeting-service-sbve.onrender.com/socket.io/?EIO=4&transport=websocket' failed
```

## Root Cause

**CORS blocking**: Your Render deployment doesn't have your Vercel frontend domain in `CORS_ORIGINS`.

---

## ✅ Solution

### Step 1: Update Render Environment Variables

Go to **Render Dashboard** → **meeting-service-sbve** → **Environment** tab:

**Find**: `CORS_ORIGINS`

**Update to**:

```
https://www.cognito-learning-hub.live,https://cognito-learning-hub.live,https://cognito-learning-hub.vercel.app,https://*.vercel.app
```

**Important**: Add **your actual Vercel deployment URL**. Check your browser's URL when you see this error.

### Step 2: Redeploy Meeting Service

1. **Option A - Automatic** (if connected to GitHub):

   ```bash
   git add .
   git commit -m "Fix WebSocket CORS for Vercel"
   git push origin main
   ```

   Render will auto-redeploy.

2. **Option B - Manual**:
   - Render Dashboard → meeting-service-sbve
   - Click "Manual Deploy" → "Deploy latest commit"

### Step 3: Clear Cache & Test

```bash
# Clear browser cache (Ctrl+Shift+Delete)
# Or hard refresh (Ctrl+F5)

# Test in browser console
const socket = io('wss://meeting-service-sbve.onrender.com', {
  transports: ['websocket', 'polling']
});
socket.on('connect', () => console.log('✅ Connected!'));
```

---

## 🔍 How to Find Your Frontend Domain

**Method 1**: Check error console in browser:

```
Failed to load resource: the server responded with a status of 403 (Forbidden)
Origin: https://cognito-learning-hub-xyz123.vercel.app
```

**Method 2**: Check browser address bar when you join a meeting

**Method 3**: Check Vercel dashboard:

- Vercel → Your Project → Domains

---

## 📝 Updated Files

### [index.js](../microservices/meeting-service/index.js)

**Changed**:

- ✅ Socket.IO CORS now accepts Vercel preview deployments (`*.vercel.app`)
- ✅ Added better error logging for blocked origins
- ✅ Changed transport order to `polling` → `websocket` (more reliable on Render)
- ✅ Increased `pingTimeout` to 60s (Render free tier can be slow)

### [.env.production](../microservices/meeting-service/.env.production)

**Added**:

```env
CORS_ORIGINS=https://www.cognito-learning-hub.live,https://cognito-learning-hub.live,https://cognito-learning-hub.vercel.app,https://*.vercel.app
```

---

## 🧪 Test After Deployment

### 1. Check Render Logs

```bash
# In Render Dashboard → Logs, look for:
Socket.IO connection established: abc123xyz
CORS Origins: https://cognito-learning-hub.vercel.app,https://*.vercel.app
```

### 2. Test in Browser Console

```javascript
// Open browser console on your frontend
console.log(import.meta.env.VITE_MEETING_WS_URL);
// Should show: wss://meeting-service-sbve.onrender.com

// Check if socket connects
const socket = io("wss://meeting-service-sbve.onrender.com");
socket.on("connect", () => console.log("✅ Socket connected!"));
socket.on("connect_error", (err) =>
  console.error("❌ Connection error:", err.message)
);
```

### 3. Join a Meeting

1. Create a meeting
2. Click "Join"
3. Check browser console - should see:
   ```
   [Meeting SFU] Connecting to: https://meeting-service-sbve.onrender.com
   [Meeting SFU] Connected: abc123xyz
   ```

---

## 🚨 Common Issues

### Issue 1: Still Failing After Update

**Cause**: Render not updated

**Fix**:

1. Check Render → Environment tab - verify `CORS_ORIGINS` is correct
2. Click "Manual Deploy" → "Clear build cache & deploy"
3. Wait 2-3 minutes for deployment

---

### Issue 2: "Transport unknown" Error

**Cause**: Frontend using wrong transport

**Fix**: Check [MeetingRoom.jsx](../frontend/src/pages/MeetingRoom.jsx#L75-L85):

```javascript
const meetSocket = io(meetingUrl, {
  transports: ["websocket", "polling"], // Should try websocket first
  reconnection: true,
  reconnectionAttempts: 5,
});
```

Change to:

```javascript
const meetSocket = io(meetingUrl, {
  transports: ["polling", "websocket"], // Try polling first (more reliable on Render)
  reconnection: true,
  reconnectionAttempts: 10, // More attempts
  reconnectionDelay: 2000, // Wait longer between attempts
});
```

---

### Issue 3: Render Sleeping (Free Tier)

**Symptom**: First connection takes 30+ seconds

**Cause**: Render free tier spins down after 15 minutes of inactivity

**Fix**:

1. **Option A**: Upgrade to paid plan ($7/month)
2. **Option B**: Add to [ping.yml](../.github/workflows/ping.yml):
   ```yaml
   - name: Ping Meeting Service
     run: curl -f https://meeting-service-sbve.onrender.com/health
   ```

---

### Issue 4: CORS Still Blocked

**Verify CORS is configured**:

```powershell
# Test CORS from command line
curl -H "Origin: https://cognito-learning-hub.vercel.app" `
  -H "Access-Control-Request-Method: GET" `
  -H "Access-Control-Request-Headers: Authorization" `
  -X OPTIONS `
  https://meeting-service-sbve.onrender.com/health
```

**Expected response headers**:

```
Access-Control-Allow-Origin: https://cognito-learning-hub.vercel.app
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Credentials: true
```

---

## 📊 Environment Variables Checklist

Copy these to **Render → meeting-service-sbve → Environment**:

```env
NODE_ENV=production
PORT=3009

# ⭐ ADD YOUR VERCEL DOMAIN HERE ⭐
CORS_ORIGINS=https://cognito-learning-hub.vercel.app,https://*.vercel.app,https://www.cognito-learning-hub.live

MONGO_URI=mongodb+srv://quizwise_user:Rakshita-1006@cluster0.2n6kw7y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
REDIS_URL=redis://default:CECYJIPYq1y38tpPAHxXfKGvnhaBtKz7@redis-12364.c238.us-central1-2.gce.cloud.redislabs.com:12364
JWT_SECRET=your-super-secret-key-that-is-long-and-random

# Azure TURN Server
AZURE_TURN_IP=20.196.128.58
AZURE_TURN_USERNAME=turnuser
AZURE_TURN_CREDENTIAL=turnpassword

# Metered.ca (backup)
METERED_API_KEY=b63ff83892406cb740c6bc7fff98f09a9713
TURN_USERNAME=5ed29053a8052a1de614fc6b
TURN_CREDENTIAL=H6s8TMlICsyTg9Cf

# Socket.IO Settings
SOCKET_PING_TIMEOUT=60000
SOCKET_PING_INTERVAL=25000
SOCKET_MAX_HTTP_BUFFER_SIZE=1000000

ICE_TRANSPORT_POLICY=all
```

---

## ✅ Success Checklist

After fixing:

- [ ] Updated `CORS_ORIGINS` in Render dashboard
- [ ] Redeployed meeting service
- [ ] Waited 2-3 minutes for deployment
- [ ] Hard refreshed browser (Ctrl+F5)
- [ ] Checked Render logs for "Socket.IO connection established"
- [ ] Tested joining a meeting
- [ ] Verified WebSocket connection in browser console

---

## 🎯 Quick Verification

Run this in browser console:

```javascript
fetch("https://meeting-service-sbve.onrender.com/health")
  .then((r) => r.json())
  .then((d) => console.log("✅ Meeting service healthy:", d))
  .catch((e) => console.error("❌ Service down:", e));
```

Expected:

```json
{
  "success": true,
  "service": "meeting-service",
  "status": "healthy",
  "redis": "connected"
}
```

---

## 🆘 Still Not Working?

1. **Share exact error**: Screenshot from browser console
2. **Share Render logs**: Last 50 lines from Render dashboard
3. **Share your domain**: What URL is your frontend deployed to?

Most likely cause: Wrong domain in `CORS_ORIGINS` on Render!
