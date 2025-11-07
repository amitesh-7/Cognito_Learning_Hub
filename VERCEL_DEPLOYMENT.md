# 🚀 Vercel Deployment Guide - Cognito Learning Hub

**Project**: Cognito Learning Hub  
**Made with team**: OPTIMISTIC MUTANT CODERS

---

## 📋 Pre-Deployment Checklist

- [x] Project renamed to "Cognito Learning Hub"
- [x] Credits updated to "Made with team OPTIMISTIC MUTANT CODERS"
- [x] `frontend/index.html` updated with new branding
- [x] `README.md` updated
- [ ] Backend deployed (Render/Railway/Heroku)
- [ ] MongoDB Atlas ready with connection string
- [ ] Google OAuth credentials configured

---

## 🔧 Vercel Environment Variables

### Required Environment Variables for Frontend

Add these in **Vercel Dashboard → Your Project → Settings → Environment Variables**:

```bash
# Backend API URL (Update with YOUR backend URL)
VITE_API_URL=https://your-backend-url.onrender.com

# Socket.IO URL (Usually same as API URL)
VITE_SOCKET_URL=https://your-backend-url.onrender.com

# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com
```

### Environment Setup:

- Set **Environment**: `Production`
- Apply to: `Production`, `Preview`, and `Development` (all three)

---

## 📝 Step-by-Step Deployment

### Step 1: Deploy Backend First

**Option A: Render.com (Recommended)**

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect your GitHub repo
4. Select `backend` folder
5. Configure:
   - **Name**: `cognito-learning-hub-api`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Environment Variables**:
     ```
     MONGODB_URI=your-mongodb-atlas-connection-string
     JWT_SECRET=your-random-secret-key
     GEMINI_API_KEY=your-gemini-api-key
     GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=your-google-client-secret
     NODE_ENV=production
     PORT=3001
     ```
6. Deploy
7. **Copy the backend URL** (e.g., `https://cognito-learning-hub-api.onrender.com`)

**Option B: Railway.app**

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select `backend` folder
4. Add same environment variables
5. Deploy and copy URL

---

### Step 2: Deploy Frontend to Vercel

#### A. Via Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:

   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install --legacy-peer-deps`

5. **Add Environment Variables**:

   ```
   VITE_API_URL=https://cognito-learning-hub-api.onrender.com
   VITE_SOCKET_URL=https://cognito-learning-hub-api.onrender.com
   VITE_GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com
   ```

6. Click **"Deploy"**

#### B. Via Vercel CLI (Advanced)

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend folder
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

---

### Step 3: Update Backend CORS

After deploying frontend, update your backend environment variables:

**In Render/Railway Dashboard → Environment Variables:**

```bash
# Add your Vercel URL to allowed origins
FRONTEND_URLS=https://your-vercel-url.vercel.app,https://cognito-learning-hub.vercel.app
```

---

### Step 4: Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services → Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins**:
   ```
   https://your-vercel-url.vercel.app
   ```
5. Add to **Authorized redirect URIs**:
   ```
   https://your-vercel-url.vercel.app
   https://your-vercel-url.vercel.app/login
   ```
6. Save

---

## 🧪 Testing Deployment

### 1. Test Backend Health

```bash
curl https://your-backend-url.onrender.com/api/health
```

Expected: `{"status": "ok"}`

### 2. Test Frontend

- Visit your Vercel URL
- Check browser console for API URL
- Should see: `Using API URL: https://your-backend-url.onrender.com`

### 3. Test Login

- Click "Login" or "Sign Up"
- Try Google OAuth
- Should redirect and login successfully

### 4. Test Core Features

- [ ] Create quiz (AI generation)
- [ ] Take quiz
- [ ] Live multiplayer session
- [ ] AI Doubt Solver

---

## 🔍 Common Issues & Fixes

### Issue 1: "CORS Error"

**Solution**: Make sure `FRONTEND_URLS` in backend includes your Vercel URL

### Issue 2: "Network Error" or "Failed to Fetch"

**Solution**: Check `VITE_API_URL` is correctly set in Vercel environment variables

### Issue 3: Google OAuth Fails

**Solution**:

- Verify OAuth URIs in Google Console
- Check `VITE_GOOGLE_CLIENT_ID` matches backend `GOOGLE_CLIENT_ID`

### Issue 4: Build Fails on Vercel

**Solution**: Use `--legacy-peer-deps` flag in build command

### Issue 5: Socket.IO Connection Error

**Solution**: Ensure `VITE_SOCKET_URL` matches backend URL

---

## 📊 Environment Variables Summary

### Frontend (Vercel)

| Variable                | Value                  | Example                            |
| ----------------------- | ---------------------- | ---------------------------------- |
| `VITE_API_URL`          | Your backend URL       | `https://cognito-api.onrender.com` |
| `VITE_SOCKET_URL`       | Your backend URL       | `https://cognito-api.onrender.com` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `499091061377-...`                 |

### Backend (Render/Railway)

| Variable               | Value                           | Required |
| ---------------------- | ------------------------------- | -------- |
| `MONGODB_URI`          | MongoDB Atlas connection string | ✅ Yes   |
| `JWT_SECRET`           | Random secret (32+ chars)       | ✅ Yes   |
| `GEMINI_API_KEY`       | Google Gemini API key           | ✅ Yes   |
| `GOOGLE_CLIENT_ID`     | Google OAuth Client ID          | ✅ Yes   |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret             | ✅ Yes   |
| `NODE_ENV`             | `production`                    | ✅ Yes   |
| `PORT`                 | `3001`                          | ✅ Yes   |
| `FRONTEND_URLS`        | Your Vercel URL                 | ✅ Yes   |

---

## 🎯 Post-Deployment

### 1. Update Custom Domain (Optional)

In Vercel Dashboard:

- Settings → Domains
- Add custom domain (e.g., `cognito-learning.com`)
- Configure DNS as instructed

### 2. Enable Analytics

- Vercel → Analytics (built-in, free)
- Add Google Analytics (optional)

### 3. Monitor Performance

- Check Vercel deployment logs
- Monitor Render/Railway logs
- Set up error tracking (Sentry optional)

---

## ✅ Final Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed on Vercel
- [ ] Environment variables configured
- [ ] CORS updated in backend
- [ ] Google OAuth URIs updated
- [ ] Test login works
- [ ] Test quiz creation works
- [ ] Test live sessions work
- [ ] No console errors
- [ ] Mobile responsive check

---

## 🚀 Quick Deploy Commands

```bash
# Backend (if using CLI)
cd backend
git add .
git commit -m "Deploy: Cognito Learning Hub"
git push origin main  # Auto-deploys on Render

# Frontend (if using Vercel CLI)
cd frontend
vercel --prod
```

---

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Common Issues**: Check console errors first

---

**Status**: ✅ Ready to deploy  
**Made with team**: OPTIMISTIC MUTANT CODERS  
**For**: IIT Bombay Techfest 2025 🎓
