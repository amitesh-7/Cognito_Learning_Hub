# 🚨 CRITICAL: Environment Variables Configuration Error

## ❌ Current Error

**Error Message:**

```
Using API URL: https://cognito-learning-hub-frontend.vercel.app,https://cognito-learning-hub-frontend-8vesysw13.vercel.app
Failed to load resource: net::ERR_NAME_NOT_RESOLVED
```

**Root Cause:**
The `VITE_API_URL` environment variable in **Vercel Frontend Project** is set to **FRONTEND URLs** instead of **BACKEND URL**.

---

## ✅ IMMEDIATE FIX REQUIRED

### Step 1: Go to Vercel Dashboard

1. Open [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **FRONTEND** project: `cognito-learning-hub-frontend`
3. Go to **Settings** → **Environment Variables**

### Step 2: Fix VITE_API_URL

**Find this variable:**

```
VITE_API_URL
```

**Current value (WRONG ❌):**

```
https://cognito-learning-hub-frontend.vercel.app,https://cognito-learning-hub-frontend-8vesysw13.vercel.app
```

**Change to (CORRECT ✅):**

```
https://cognito-learning-hub-backend.vercel.app
```

### Step 3: Set VITE_SOCKET_URL

**Add or update:**

```
VITE_SOCKET_URL=https://cognito-learning-hub-backend.vercel.app
```

### Step 4: Verify VITE_GOOGLE_CLIENT_ID

Make sure this is set:

```
VITE_GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com
```

### Step 5: Apply to All Environments

Make sure these are set for:

- ✅ Production
- ✅ Preview
- ✅ Development

### Step 6: Redeploy

**Option A: Automatic (Recommended)**

- Go to **Deployments** tab
- Click **"..."** on latest deployment
- Click **"Redeploy"**

**Option B: Push a small change**

- Make any small change and push to trigger redeploy

---

## 🎯 Correct Environment Variables Summary

### Frontend (Vercel) - cognito-learning-hub-frontend

| Variable                | Value                                                                      | Purpose              |
| ----------------------- | -------------------------------------------------------------------------- | -------------------- |
| `VITE_API_URL`          | `https://cognito-learning-hub-backend.vercel.app`                          | Backend API endpoint |
| `VITE_SOCKET_URL`       | `https://cognito-learning-hub-backend.vercel.app`                          | Socket.IO server     |
| `VITE_GOOGLE_CLIENT_ID` | `499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com` | Google OAuth         |

### Backend (Vercel) - cognito-learning-hub-backend

| Variable               | Value                                                                      | Purpose              |
| ---------------------- | -------------------------------------------------------------------------- | -------------------- |
| `MONGO_URI`            | `mongodb+srv://...`                                                        | MongoDB connection   |
| `API_KEY`              | `your-gemini-key`                                                          | Google Gemini API    |
| `JWT_SECRET`           | `your-secret`                                                              | JWT signing          |
| `GOOGLE_CLIENT_ID`     | `499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com` | Google OAuth         |
| `GOOGLE_CLIENT_SECRET` | `your-secret`                                                              | Google OAuth         |
| `NODE_ENV`             | `production`                                                               | Environment          |
| `PORT`                 | `3001`                                                                     | Server port          |
| `FRONTEND_URLS`        | `https://cognito-learning-hub-frontend.vercel.app`                         | CORS allowed origins |

---

## 🔍 How to Verify It's Fixed

### After Redeployment:

1. **Open Frontend URL**

   - Visit: `https://cognito-learning-hub-frontend.vercel.app`

2. **Check Browser Console (F12)**

   - Look for: `Using API URL: https://cognito-learning-hub-backend.vercel.app`
   - Should **NOT** see frontend URLs

3. **Test Google Login**

   - Click "Sign Up with Google"
   - Should work without errors
   - No `ERR_NAME_NOT_RESOLVED` errors

4. **Check Network Tab**
   - All API calls should go to: `https://cognito-learning-hub-backend.vercel.app/api/...`
   - Status should be `200 OK` (not 404 or CORS errors)

---

## ⚠️ Common Mistakes to Avoid

### ❌ DON'T DO THIS:

```bash
# WRONG - Frontend URLs in VITE_API_URL
VITE_API_URL=https://cognito-learning-hub-frontend.vercel.app

# WRONG - Multiple URLs (this is for backend's FRONTEND_URLS, not frontend's API_URL)
VITE_API_URL=https://url1.vercel.app,https://url2.vercel.app

# WRONG - Trailing slash
VITE_API_URL=https://cognito-learning-hub-backend.vercel.app/
```

### ✅ DO THIS:

```bash
# CORRECT - Backend URL, no trailing slash
VITE_API_URL=https://cognito-learning-hub-backend.vercel.app

# CORRECT - Same for Socket.IO
VITE_SOCKET_URL=https://cognito-learning-hub-backend.vercel.app
```

---

## 📝 Understanding the Architecture

```
┌─────────────────────────────────────┐
│  FRONTEND (Vite + React)            │
│  cognito-learning-hub-frontend      │
│                                     │
│  Env Vars:                          │
│  - VITE_API_URL ───────────────┐   │
│  - VITE_SOCKET_URL ────────────┤   │
└────────────────────────────────│───┘
                                 │
                                 │  Points to BACKEND ↓
                                 │
┌────────────────────────────────▼───┐
│  BACKEND (Node.js + Express)       │
│  cognito-learning-hub-backend      │
│                                     │
│  Env Vars:                          │
│  - FRONTEND_URLS (for CORS)         │
│  - MONGO_URI, API_KEY, etc.         │
└─────────────────────────────────────┘
```

**Key Point:**

- Frontend's `VITE_API_URL` = Backend's deployment URL
- Backend's `FRONTEND_URLS` = Frontend's deployment URL(s)

---

## 🚀 After Fixing

Once you update the environment variables and redeploy:

- ✅ Google OAuth will work
- ✅ API calls will reach the backend
- ✅ Socket.IO will connect properly
- ✅ No more `ERR_NAME_NOT_RESOLVED` errors
- ✅ No more CORS errors

---

**Made by:** OPTIMISTIC MUTANT CODERS  
**Status:** 🚨 **URGENT - FIX IMMEDIATELY**
