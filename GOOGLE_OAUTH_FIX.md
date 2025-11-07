# 🔧 Fix Google OAuth "Error 400: origin_mismatch"

## ❌ Current Error
**Error**: `Access blocked: Authorisation error - Error 400: origin_mismatch`

**Cause**: Your Vercel frontend URL (`cognito-learning-hub-frontend.vercel.app`) is not registered in Google Cloud Console as an authorized origin.

---

## ✅ Solution: Update Google Cloud Console

### Step 1: Go to Google Cloud Console

1. Visit: [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Select your project
3. Find your OAuth 2.0 Client ID: `499091061377-4k0m8gnios927sua2a9d64nvlh8aorru`
4. Click **Edit** (pencil icon)

### Step 2: Add Authorized JavaScript Origins

Add these URLs to **Authorized JavaScript origins**:

```
http://localhost:5173
http://localhost:3000
https://cognito-learning-hub-frontend.vercel.app
https://your-custom-domain.com (if you have one)
```

### Step 3: Add Authorized Redirect URIs

Add these URLs to **Authorized redirect URIs**:

```
http://localhost:5173
http://localhost:5173/
http://localhost:3000
http://localhost:3000/
https://cognito-learning-hub-frontend.vercel.app
https://cognito-learning-hub-frontend.vercel.app/
```

### Step 4: Save Changes

Click **Save** at the bottom of the page.

---

## 📋 Complete Google OAuth Setup Checklist

### Required URLs to Add:

#### For Development (localhost):
- ✅ `http://localhost:5173` (Vite default)
- ✅ `http://localhost:3000` (alternative)

#### For Production (Vercel):
- ✅ `https://cognito-learning-hub-frontend.vercel.app` (your current URL)
- ✅ `https://cognito-learning-hub-backend.vercel.app` (backend URL if needed)

---

## 🔐 Environment Variables Setup

### Frontend (Vercel)

Your current Vercel environment variables look correct:

```bash
VITE_API_URL=https://cognito-learning-hub-backend.vercel.app/
VITE_GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com
```

### Backend (Vercel)

Your backend environment variables:

```bash
MONGO_URI=<your-mongodb-uri>
API_KEY=<your-gemini-api-key>
JWT_SECRET=<your-jwt-secret>
GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
NODE_ENV=production
PORT=3001
FRONTEND_URLS=https://cognito-learning-hub-frontend.vercel.app
```

⚠️ **Important**: Update `FRONTEND_URLS` to match your exact Vercel frontend URL!

---

## 🧪 Local Development Setup

### 1. Frontend `.env.local` (Created ✅)

```bash
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com
```

### 2. Backend `.env`

Make sure your backend has:

```bash
MONGO_URI=mongodb+srv://...
API_KEY=your-gemini-api-key
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NODE_ENV=development
PORT=3001
FRONTEND_URLS=http://localhost:5173,http://localhost:3000
```

### 3. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm install
node index.js

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

---

## 🔍 Verify OAuth Configuration

### Check Your Google OAuth Settings:

1. **Client ID**: `499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com`
2. **Authorized JavaScript origins** should include:
   - `http://localhost:5173`
   - `https://cognito-learning-hub-frontend.vercel.app`

3. **Authorized redirect URIs** should include:
   - `http://localhost:5173`
   - `http://localhost:5173/`
   - `https://cognito-learning-hub-frontend.vercel.app`
   - `https://cognito-learning-hub-frontend.vercel.app/`

---

## ⚠️ Common Issues & Fixes

### Issue 1: Still Getting origin_mismatch After Adding URLs

**Solution**: 
- Wait 5-10 minutes for Google's changes to propagate
- Clear browser cache and cookies
- Try in incognito/private mode

### Issue 2: Works on localhost but not on Vercel

**Solution**:
- Double-check the exact Vercel URL (with/without trailing slash)
- Verify both URLs are in Google Console
- Check browser console for exact error message

### Issue 3: Backend CORS Error

**Solution**:
- Update `FRONTEND_URLS` in backend Vercel environment variables
- Include exact frontend URL: `https://cognito-learning-hub-frontend.vercel.app`
- Redeploy backend after updating env vars

---

## 🎯 Quick Checklist

- [ ] Added Vercel frontend URL to Google Console (Authorized JavaScript origins)
- [ ] Added Vercel frontend URL to Google Console (Authorized redirect URIs)
- [ ] Updated backend `FRONTEND_URLS` environment variable on Vercel
- [ ] Created `.env.local` for local development
- [ ] Verified all environment variables in Vercel dashboard
- [ ] Cleared browser cache
- [ ] Tested OAuth login on Vercel deployment
- [ ] Tested OAuth login on localhost

---

## 📞 Testing OAuth

### Test on Production (Vercel):
1. Visit: `https://cognito-learning-hub-frontend.vercel.app`
2. Click "Login" or "Sign Up"
3. Click "Sign in with Google"
4. Should redirect to Google login (no error)

### Test on Local Development:
1. Start backend: `cd backend && node index.js`
2. Start frontend: `cd frontend && npm run dev`
3. Visit: `http://localhost:5173`
4. Click "Login" → "Sign in with Google"
5. Should work without errors

---

## 🚀 After Fixing

Once you update Google Cloud Console:
1. Wait 5-10 minutes
2. Clear browser cache
3. Test login again
4. Should work perfectly! ✅

**Made by**: OPTIMISTIC MUTANT CODERS
