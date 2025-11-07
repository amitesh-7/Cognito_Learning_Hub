# 🚀 Production Deployment Guide for Google OAuth

## 📋 Prerequisites Checklist

### 1. Google Cloud Console Setup
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Navigate to APIs & Services > Credentials
- [ ] Edit your OAuth 2.0 Client ID
- [ ] Add authorized JavaScript origins:
  - `https://www.quizwise-ai.live`
  - `https://quizwise-ai.live`
  - `https://your-vercel-app.vercel.app` (replace with actual URL)
- [ ] Add authorized redirect URIs (same as above)

### 2. Backend Deployment (Railway/Heroku/DigitalOcean)
- [ ] Deploy your `quizwise-ai-server` to a hosting platform
- [ ] Set environment variables:
  ```
  GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=your-google-client-secret
  MONGODB_URI=your-production-mongodb-uri
  JWT_SECRET=your-production-jwt-secret
  NODE_ENV=production
  PORT=3001
  ```
- [ ] Note your backend URL (e.g., `https://your-backend.herokuapp.com`)

### 3. Vercel Frontend Deployment
- [ ] Push your code to GitHub
- [ ] Connect Vercel to your repository
- [ ] Add environment variables in Vercel dashboard:
  ```
  VITE_API_URL=https://your-backend-url.com
  VITE_GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com
  ```
- [ ] Deploy to Vercel

### 4. Custom Domain Setup (www.quizwise-ai.live)
- [ ] Add custom domain in Vercel settings
- [ ] Update DNS records to point to Vercel
- [ ] Update Google OAuth authorized domains to include your custom domain

## 🔧 Quick Commands

### Deploy to Vercel (if using Vercel CLI):
```bash
npm install -g vercel
vercel --prod
```

### Environment Variables for Vercel:
Go to Vercel Dashboard > Your Project > Settings > Environment Variables and add:
- `VITE_API_URL`: Your backend URL
- `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth client ID

## 🧪 Testing Production OAuth

1. **Test on Vercel URL**: Visit your Vercel deployment URL
2. **Test on Custom Domain**: Visit www.quizwise-ai.live
3. **Try Google Login**: Click "Continue with Google" on login/signup pages
4. **Verify Redirect**: Ensure successful authentication and proper redirects

## 🔍 Troubleshooting

### Common Issues:
1. **CORS Error**: Ensure backend CORS includes your frontend domain
2. **OAuth Error**: Verify Google Cloud Console has correct authorized domains
3. **API Connection**: Check VITE_API_URL points to correct backend
4. **Environment Variables**: Ensure all required env vars are set in production

### Debugging Steps:
1. Check browser console for errors
2. Verify network requests to backend API
3. Test backend health endpoint: `https://your-backend.com/api/health`
4. Check Vercel deployment logs
5. Verify Google OAuth configuration

## 📝 Notes

- Remember to update CORS origins when you get your actual Vercel URLs
- Test OAuth on both your custom domain and Vercel domain
- Keep your Google Client Secret secure and never commit it to code
- Monitor your OAuth usage in Google Cloud Console

## 🎯 Final Verification

After deployment, test these flows:
- [ ] Google OAuth on Login page
- [ ] Google OAuth on SignUp page  
- [ ] User role-based redirects work
- [ ] JWT tokens are properly set
- [ ] Authentication state persists on page refresh