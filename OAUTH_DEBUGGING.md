# 🔍 Google OAuth Debugging Guide

## Current Issue: Google OAuth button not responding

### ✅ Step-by-Step Debugging:

#### 1. **Check Vercel Environment Variables**
In Vercel Dashboard → Settings → Environment Variables:
```
VITE_API_URL=https://quizwise-ai-server.onrender.com
VITE_GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com
```

#### 2. **Verify Google Cloud Console**
In Google Cloud Console → APIs & Services → Credentials:

**Authorized JavaScript origins:**
```
https://quiz-wise-ai-full-stack.vercel.app
https://www.quizwise-ai.live
https://quizwise-ai.live
```

**Authorized redirect URIs:**
```
https://quiz-wise-ai-full-stack.vercel.app
https://www.quizwise-ai.live
https://quizwise-ai.live
```

#### 3. **Test URLs to Use:**
- ✅ https://quiz-wise-ai-full-stack.vercel.app/login
- ✅ https://www.quizwise-ai.live/login
- ✅ https://quizwise-ai.live/login

**All should work** - the path doesn't matter for OAuth origins.

#### 4. **Browser Console Check:**
1. Open the login page
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Click Google OAuth button
5. Look for error messages

#### 5. **Common Error Messages & Solutions:**

**Error: "Not a valid origin for the client"**
→ Add your domain to Google Cloud Console authorized origins

**Error: "Network request failed"**
→ Check if VITE_API_URL is correct in Vercel environment variables

**Error: "GoogleLogin is not defined"**
→ Check if @react-oauth/google package is installed in production

**Error: "Invalid client ID"**
→ Check if VITE_GOOGLE_CLIENT_ID is set correctly in Vercel

#### 6. **Quick Test Commands:**

**Test if environment variables are loaded:**
```javascript
// In browser console on your live site:
console.log(import.meta.env.VITE_API_URL);
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID);
```

**Test API connectivity:**
```javascript
// In browser console:
fetch('https://quizwise-ai-server.onrender.com/api/health')
  .then(r => r.text())
  .then(console.log);
```

#### 7. **If Still Not Working:**

1. **Redeploy Vercel** after setting environment variables
2. **Check Render logs** for CORS errors
3. **Try incognito mode** to avoid cache issues
4. **Check if custom domain DNS** is properly configured

## 🚨 Most Common Issues:

1. **Missing Vercel Environment Variables** (90% of cases)
2. **Google Console not updated** with production domains
3. **CORS issues** between frontend and backend
4. **Caching issues** - try incognito mode

## ✅ Quick Fix Checklist:

- [ ] Vercel environment variables set
- [ ] Google Console authorized origins updated
- [ ] Custom domain DNS pointing to Vercel
- [ ] Backend deployed with updated CORS
- [ ] Tried in incognito mode
- [ ] Checked browser console for errors