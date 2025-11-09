# 🚀 Backend Deployment Guide for Render.com

## Prerequisites
- GitHub account with your repository
- Render.com account (free tier available)
- MongoDB Atlas database URL
- All environment variables ready

---

## Step-by-Step Deployment

### Step 1: Sign Up / Login to Render
1. Go to [Render.com](https://render.com)
2. Click **"Get Started for Free"** or **"Sign In"**
3. Sign in with your **GitHub account**

---

### Step 2: Create a New Web Service
1. Click **"New +"** button in the top right
2. Select **"Web Service"**
3. Connect your GitHub repository:
   - Click **"Connect account"** if not connected
   - Search for `Cognito_Learning_Hub`
   - Click **"Connect"** next to your repository

---

### Step 3: Configure Your Web Service

Fill in the following settings:

#### Basic Settings:
- **Name:** `cognito-learning-hub-backend` (or any name you prefer)
- **Region:** Choose closest to your users (e.g., `Oregon (US West)` or `Frankfurt (EU Central)`)
- **Branch:** `main`
- **Root Directory:** `backend` (important!)
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

#### Instance Type:
- Select **"Free"** (or upgrade to paid if needed)

---

### Step 4: Add Environment Variables

Click **"Advanced"** and add these environment variables:

```
MONGO_URI=mongodb+srv://quizwise_user:Rakshita-1006@cluster0.2n6kw7y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

API_KEY=AIzaSyDp5BuGHfGJtSCE48xK0Ga6hr_psNB8wCA

JWT_SECRET=your-super-secret-key-that-is-long-and-random

GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com

GOOGLE_CLIENT_SECRET=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

CLIENT_URL=https://your-frontend-url.vercel.app

NODE_ENV=production

PORT=3001
```

**Note:** Replace `CLIENT_URL` with your actual frontend Vercel URL once deployed.

---

### Step 5: Deploy!
1. Click **"Create Web Service"** button
2. Wait for the deployment (usually 2-5 minutes)
3. You'll see the build logs in real-time
4. Once deployed, you'll get a URL like: `https://cognito-learning-hub-backend.onrender.com`

---

### Step 6: Copy Your Backend URL
Once deployment is complete:
1. Copy the URL (e.g., `https://cognito-learning-hub-backend.onrender.com`)
2. Keep it handy for frontend configuration

---

### Step 7: Update Frontend Environment Variables

Go to your Vercel frontend project:

1. Go to Vercel Dashboard
2. Select your frontend project
3. Go to **Settings** → **Environment Variables**
4. Update these variables:

```
VITE_API_URL=https://cognito-learning-hub-backend.onrender.com
VITE_SOCKET_URL=https://cognito-learning-hub-backend.onrender.com
```

5. Click **"Save"**
6. Redeploy your frontend (Deployments → ⋯ → Redeploy)

---

### Step 8: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Add to **Authorized JavaScript origins**:
   - `https://cognito-learning-hub-backend.onrender.com`
   - `https://your-frontend.vercel.app`
6. Add to **Authorized redirect URIs**:
   - `https://your-frontend.vercel.app`
   - `https://cognito-learning-hub-backend.onrender.com/api/auth/google/callback`
7. Click **"Save"**

---

### Step 9: Test Your Deployment

1. Open your frontend URL
2. Check the Socket Warning banner - it should **disappear** if connected
3. Test these features:
   - ✅ User registration/login
   - ✅ Quiz creation
   - ✅ Live sessions (create and join)
   - ✅ 1v1 Duel Mode
   - ✅ Real-time features

---

## Important Notes

### Free Tier Limitations:
- ⚠️ **Spins down after 15 minutes of inactivity**
- ⚠️ **First request after spin-down takes 30-60 seconds** (cold start)
- ✅ **750 hours/month free** (enough for one always-on service)
- ✅ **Full WebSocket support** ✅
- ✅ **No request timeouts** for Socket.IO

### To Keep Service Always Active (Optional):
- Upgrade to **Starter plan** ($7/month) - no spin-down
- Or use a service like [UptimeRobot](https://uptimerobot.com/) to ping your backend every 10 minutes

---

## Monitoring Your Deployment

### View Logs:
1. Go to Render Dashboard
2. Click on your web service
3. Click **"Logs"** tab
4. See real-time logs

### Check Health:
1. Visit: `https://your-backend.onrender.com/`
2. Should see: Server running message

### Test Socket.IO:
1. Open browser console on your frontend
2. Should see: `✅ Socket.IO connected!`
3. Should NOT see WebSocket errors

---

## Troubleshooting

### Issue: "Application failed to respond"
**Solution:** Check logs in Render dashboard, verify environment variables

### Issue: CORS errors
**Solution:** Verify `CLIENT_URL` in environment variables matches frontend URL exactly

### Issue: Socket.IO not connecting
**Solution:** 
- Check backend logs
- Verify `VITE_SOCKET_URL` in frontend matches backend URL
- Check that port is not specified in URL (Render uses 443 for HTTPS)

### Issue: Cold starts (slow first request)
**Solution:** 
- This is normal on free tier
- Upgrade to paid plan to avoid spin-down
- Or use UptimeRobot to keep it active

---

## Post-Deployment Checklist

- [ ] Backend deployed successfully on Render
- [ ] Backend URL copied
- [ ] Frontend environment variables updated with backend URL
- [ ] Frontend redeployed on Vercel
- [ ] Google OAuth redirect URIs updated
- [ ] Socket Warning banner disappears on frontend
- [ ] User registration works
- [ ] Login works
- [ ] Quiz creation works
- [ ] Live sessions work (real-time)
- [ ] 1v1 Duels work (real-time)
- [ ] No WebSocket errors in console

---

## Environment Variables Quick Reference

### Backend (Render):
```env
MONGO_URI=<your-mongodb-connection-string>
API_KEY=<your-google-gemini-api-key>
JWT_SECRET=<your-jwt-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
CLIENT_URL=<your-frontend-vercel-url>
NODE_ENV=production
PORT=3001
```

### Frontend (Vercel):
```env
VITE_API_URL=https://cognito-learning-hub-backend.onrender.com
VITE_SOCKET_URL=https://cognito-learning-hub-backend.onrender.com
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
```

---

## Need Help?

1. Check Render logs first
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Ensure MongoDB connection string is correct
5. Check CORS settings in backend

---

## Alternative: Upgrade to Paid Plan

**Render Starter Plan ($7/month):**
- ✅ No cold starts
- ✅ Always online
- ✅ Better performance
- ✅ 100% uptime
- ✅ Worth it for production apps

---

**Your backend is now live with full WebSocket support! 🎉**

Backend URL: `https://cognito-learning-hub-backend.onrender.com`
