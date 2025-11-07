# 🚀 Vercel Deployment Guide - Backend & Frontend

## ✅ Issue Fixed

**Problem**: Edge Function middleware error with `jsonwebtoken`  
**Solution**: 
1. ✅ Renamed `middleware.js` → `authMiddleware.js` (Vercel auto-detects `middleware.js` as Edge Function)
2. ✅ Added `vercel.json` to force Node.js runtime
3. ✅ Added `.vercelignore` to exclude unnecessary files

---

## 📦 Deploy Backend to Vercel

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `Cognito_Learning_Hub`
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: Leave empty or `npm install`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

5. **Add Environment Variables**:
   ```
   MONGO_URI=your-mongodb-connection-string
   API_KEY=your-gemini-api-key
   JWT_SECRET=your-jwt-secret-key
   GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   NODE_ENV=production
   PORT=3001
   FRONTEND_URLS=https://your-frontend.vercel.app
   ```

6. Click **"Deploy"**
7. **Copy the backend URL** (e.g., `https://cognito-backend.vercel.app`)

### Option 2: Via Vercel CLI

```bash
# Navigate to backend
cd backend

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts
```

---

## 📦 Deploy Frontend to Vercel

1. In Vercel Dashboard, add another project
2. Import same GitHub repo
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps`

4. **Add Environment Variables**:
   ```
   VITE_API_URL=https://your-backend.vercel.app
   VITE_SOCKET_URL=https://your-backend.vercel.app
   VITE_GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com
   ```

5. Deploy

---

## 🔄 Update Backend CORS

After getting your frontend URL, update backend environment variable:

**In Vercel → Backend Project → Settings → Environment Variables:**

Edit `FRONTEND_URLS`:
```
https://your-frontend.vercel.app,https://cognito-learning-hub.vercel.app
```

**Redeploy backend** for changes to take effect.

---

## ⚙️ Important Configuration Details

### Backend vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node",
      "config": {
        "maxLambdaSize": "50mb"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ],
  "functions": {
    "**/*.js": {
      "runtime": "nodejs20.x"
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

This forces all `.js` files to use Node.js runtime (not Edge runtime), which supports `jsonwebtoken`.

---

## 🧪 Testing

### 1. Test Backend
```bash
curl https://your-backend.vercel.app/api/health
```

### 2. Test Frontend
- Visit frontend URL
- Check browser console
- Should see API connection

### 3. Test Full Flow
- [ ] Login with Google OAuth
- [ ] Create quiz
- [ ] Take quiz
- [ ] Live multiplayer session

---

## 🔧 Common Issues

### Issue: CORS Error
**Solution**: Update `FRONTEND_URLS` in backend env variables

### Issue: 504 Timeout
**Solution**: Vercel Serverless Functions have 10s timeout (Hobby) or 60s (Pro). Optimize long-running operations.

### Issue: Cold Starts
**Solution**: First request after inactivity may be slow (Vercel serverless nature)

---

## 📊 Environment Variables Checklist

### Backend
- [x] MONGO_URI
- [x] API_KEY
- [x] JWT_SECRET
- [x] GOOGLE_CLIENT_ID
- [x] GOOGLE_CLIENT_SECRET
- [x] NODE_ENV
- [x] PORT
- [x] FRONTEND_URLS

### Frontend
- [x] VITE_API_URL
- [x] VITE_SOCKET_URL
- [x] VITE_GOOGLE_CLIENT_ID

---

## ✅ Deployment Complete!

Your app is now running on Vercel! 🎉

**Made by**: OPTIMISTIC MUTANT CODERS
