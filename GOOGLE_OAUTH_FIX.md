# 🔧 Google OAuth Error Fix

## Error
`[LOGGER]: The given origin is not allowed for the given client ID`

## Root Cause
Your Google Cloud Console OAuth 2.0 Client doesn't have `localhost:5173` or `127.0.0.1:5173` in the authorized origins.

## Step-by-Step Fix

### 1. Go to Google Cloud Console
🔗 https://console.cloud.google.com/

### 2. Select Your Project
- Look for the project dropdown at the top
- Select the project containing your OAuth credentials

### 3. Navigate to Credentials
- Click **APIs & Services** (left sidebar)
- Click **Credentials**

### 4. Find Your OAuth 2.0 Client ID
- Look for "OAuth 2.0 Client IDs" section
- Click on your client (usually named "Web client" or similar)

### 5. Add Authorized JavaScript Origins
In the **Authorized JavaScript origins** section, add these URLs:
```
http://localhost:5173
http://127.0.0.1:5173
http://localhost:3000
http://127.0.0.1:3000
```

### 6. Add Authorized Redirect URIs (Optional)
In the **Authorized redirect URIs** section, add:
```
http://localhost:5173/auth/google/callback
http://127.0.0.1:5173/auth/google/callback
http://localhost:3000/auth/google/callback
```

### 7. Save Changes
- Click **SAVE** at the bottom
- Wait 5 minutes for changes to propagate

### 8. Restart Your Development Servers
```bash
# Stop both servers (Ctrl+C in both terminals)
# Then restart backend:
cd backend
npm run dev

# In new terminal, restart frontend:
cd frontend
npm run dev
```

## ✅ Test
1. Navigate to http://localhost:5173/login
2. Click "Sign in with Google"
3. Should work without CORS errors

## Still Having Issues?

### Check Environment Variables
Make sure your `.env` file has:
```env
GOOGLE_CLIENT_ID=your_actual_client_id
GOOGLE_CLIENT_SECRET=your_actual_secret
```

### Check Frontend Environment
`frontend/.env`:
```env
VITE_GOOGLE_CLIENT_ID=your_actual_client_id
```

### Verify Google Console Settings
- Make sure you're editing the CORRECT project
- Make sure you're editing the CORRECT OAuth 2.0 Client ID
- URLs must match EXACTLY (http vs https, trailing slashes, etc.)

## Production Deployment
For production, add your deployed URLs:
```
https://yourdomain.com
https://www.yourdomain.com
```

---
**Note:** Changes in Google Cloud Console can take 5-10 minutes to take effect.
