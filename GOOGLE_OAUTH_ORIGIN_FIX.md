# Google OAuth Origin Error Fix

## Error Message

```
Failed to load resource: the server responded with a status of 403
[GSI_LOGGER]: The given origin is not allowed for the given client ID.
```

## Root Cause

The current domain/origin is not authorized in Google Cloud Console for your OAuth Client ID.

## Solution: Add Authorized JavaScript Origins

### Step 1: Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/apis/credentials
2. Select your project (Cognito Learning Hub)

### Step 2: Find Your OAuth 2.0 Client ID

- Look for Client ID: `499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com`
- Click on it to edit

### Step 3: Add Authorized JavaScript Origins

Add the following URLs to "Authorized JavaScript origins":

**For Development:**

```
http://localhost:5173
http://localhost:3000
http://127.0.0.1:5173
```

**For Production (Vercel):**

```
https://cognito-learning-hub.vercel.app
https://cognito-learning-hub.live
https://www.cognito-learning-hub.live
```

### Step 4: Add Authorized Redirect URIs

Add the following URLs to "Authorized redirect URIs":

**For Development:**

```
http://localhost:5173/login
http://localhost:5173/signup
http://localhost:3000/login
http://localhost:3000/signup
```

**For Production:**

```
https://cognito-learning-hub.vercel.app/login
https://cognito-learning-hub.vercel.app/signup
https://cognito-learning-hub.live/login
https://cognito-learning-hub.live/signup
https://www.cognito-learning-hub.live/login
https://www.cognito-learning-hub.live/signup
```

### Step 5: Save Changes

- Click **"SAVE"** at the bottom
- Wait 5-10 minutes for changes to propagate

### Step 6: Clear Browser Cache

```bash
# Clear browser cache or use incognito mode
# Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
```

### Step 7: Test Again

1. Refresh your application
2. Try Google OAuth login
3. Should work without 403 errors

## Verification Checklist

- [ ] Added localhost:5173 to Authorized JavaScript origins
- [ ] Added production domain to Authorized JavaScript origins
- [ ] Added redirect URIs for both development and production
- [ ] Saved changes in Google Cloud Console
- [ ] Waited 5-10 minutes
- [ ] Cleared browser cache
- [ ] Tested Google login

## Current Environment Variables

Verify these are set correctly:

**Frontend (.env)**

```env
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com
```

**Backend (.env)**

```env
GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com
```

## Production Deployment Notes

### Vercel Frontend Environment Variables

Set in Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_URL=https://your-backend-domain.vercel.app
VITE_SOCKET_URL=https://your-backend-domain.vercel.app
VITE_GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com
```

### Vercel Backend Environment Variables

```
GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com
FRONTEND_URL=https://cognito-learning-hub.vercel.app
```

## Troubleshooting

### Still Getting 403 Error?

1. **Check exact URL** - Make sure the URL in browser matches exactly what you added
2. **Wait longer** - Changes can take up to 15 minutes to propagate
3. **Check protocol** - http vs https must match exactly
4. **Port numbers** - Include port numbers (e.g., :5173) for localhost
5. **Trailing slashes** - Remove any trailing slashes from origins

### Common Mistakes

❌ Adding redirect URIs to JavaScript origins section  
❌ Forgetting port numbers on localhost  
❌ Using http instead of https for production  
❌ Not waiting for changes to propagate  
❌ Not clearing browser cache

### Additional Help

If issues persist:

1. Create a new OAuth Client ID
2. Update both frontend and backend .env files
3. Redeploy to Vercel
4. Add all authorized origins again

## Security Best Practices

- ✅ Never commit Client Secret to Git
- ✅ Use environment variables for all credentials
- ✅ Only add necessary origins (avoid wildcards)
- ✅ Keep production and development credentials separate
- ✅ Rotate credentials if exposed

## References

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)
