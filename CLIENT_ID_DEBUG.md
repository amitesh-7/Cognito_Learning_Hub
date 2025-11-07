# 🔍 Google Client ID Debug Guide

## Error: "The given client ID is not found"

### ✅ Immediate Checks:

#### 1. **Verify Vercel Environment Variables**
In Vercel Dashboard → Settings → Environment Variables:

**Check if these exist and are correct:**
```
VITE_GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com
```

**Important**: After adding/updating environment variables in Vercel, you MUST redeploy!

#### 2. **Test Environment Variable Loading**
On your live site, open browser console (F12) and run:
```javascript
console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
```

**Expected**: Should show your client ID  
**If undefined**: Environment variable not set in Vercel  
**If different**: Wrong client ID in Vercel  

#### 3. **Verify Google Cloud Console**
Go to [Google Cloud Console](https://console.cloud.google.com/):
- Navigate to APIs & Services → Credentials
- Find your OAuth 2.0 Client ID
- Copy the exact Client ID (should match: `499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com`)

#### 4. **Check Google Cloud Project Status**
- Ensure OAuth consent screen is configured
- Verify the project is active (not suspended)
- Check if you're in the correct Google Cloud project

### 🚀 Quick Fix Steps:

1. **Double-check Vercel Environment Variables**
2. **Redeploy Vercel** after setting environment variables
3. **Wait 2-3 minutes** for deployment to complete
4. **Test in incognito mode** to avoid cache

### 🔧 Alternative Client ID Format Check:

Sometimes the client ID format matters. Try these variations in Vercel:

**Option 1** (Current):
```
VITE_GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com
```

**Option 2** (Without protocol):
```
VITE_GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com
```

### 🧪 Test Commands:

**Test Google Library Loading:**
```javascript
// In browser console on your live site:
console.log('Google API loaded:', typeof window.google !== 'undefined');
console.log('GoogleOAuthProvider context:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
```

### 🚨 Common Issues:

1. **Environment variable not set in Vercel** (80% of cases)
2. **Forgot to redeploy after setting env vars** (15% of cases)
3. **Wrong Google Cloud project** (5% of cases)

### ✅ Verification Checklist:

- [ ] Environment variable exists in Vercel dashboard
- [ ] Redeployed Vercel after setting environment variable
- [ ] Client ID matches exactly in Google Cloud Console
- [ ] Tested in incognito mode
- [ ] Console shows correct client ID when logged