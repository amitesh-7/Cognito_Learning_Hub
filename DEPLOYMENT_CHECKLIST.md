# 🚀 QuizWise AI - Google OAuth Production Setup

## Your Deployment URLs:

- **Backend**: https://quizwise-ai-server.onrender.com
- **Frontend**: https://quiz-wise-ai-full-stack.vercel.app
- **Custom Domain**: https://www.quizwise-ai.live

## ✅ Immediate Action Items:

### 1. 🔐 Google Cloud Console Configuration

Go to [Google Cloud Console](https://console.cloud.google.com/) and update your OAuth 2.0 Client ID:

**Authorized JavaScript origins:**

```
https://www.quizwise-ai.live
https://quizwise-ai.live
https://quiz-wise-ai-full-stack.vercel.app
```

**Authorized redirect URIs:**

```
https://www.quizwise-ai.live
https://quizwise-ai.live
https://quiz-wise-ai-full-stack.vercel.app
```

### 2. 🔧 Render Backend Environment Variables

In your Render dashboard for `backend`, add/update these environment variables:

```
GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-console
MONGODB_URI=your-production-mongodb-connection-string
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
PORT=3001
```

### 3. 📱 Vercel Frontend Environment Variables

In your Vercel dashboard for `quiz-wise-ai-full-stack`, add these environment variables:

```
VITE_API_URL=https://quizwise-ai-server.onrender.com
VITE_GOOGLE_CLIENT_ID=499091061377-4k0m8gnios927sua2a9d64nvlh8aorru.apps.googleusercontent.com
```

### 4. 🌐 Custom Domain Setup (www.quizwise-ai.live)

- In Vercel dashboard, go to Settings > Domains
- Add `www.quizwise-ai.live` and `quizwise-ai.live`
- Update your DNS records to point to Vercel

## 🧪 Testing Checklist:

### Test on Vercel URL (https://quiz-wise-ai-full-stack.vercel.app):

- [ ] Navigate to login page
- [ ] Click "Continue with Google"
- [ ] Complete Google authentication
- [ ] Verify successful login and redirect

### Test on Custom Domain (https://www.quizwise-ai.live):

- [ ] Navigate to login page
- [ ] Click "Continue with Google"
- [ ] Complete Google authentication
- [ ] Verify successful login and redirect

### Test SignUp Flow:

- [ ] Navigate to signup page on both URLs
- [ ] Test Google OAuth signup
- [ ] Verify user creation and role assignment

## 🚨 Common Issues & Solutions:

### If Google OAuth fails:

1. **Check Google Console**: Ensure all URLs are in authorized origins
2. **Check CORS**: Verify backend CORS includes frontend URLs
3. **Check Environment Variables**: Ensure all required env vars are set
4. **Check Network**: Open browser dev tools and check for CORS/API errors

### If API calls fail:

1. **Check VITE_API_URL**: Should be `https://quizwise-ai-server.onrender.com`
2. **Check Backend Health**: Visit `https://quizwise-ai-server.onrender.com/api/health`
3. **Check CORS**: Ensure backend allows your frontend domain

## 🔍 Debug Commands:

### Test Backend Health:

```bash
curl https://quizwise-ai-server.onrender.com/api/health
```

### Test Google OAuth Endpoint:

```bash
curl -X POST https://quizwise-ai-server.onrender.com/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token":"test"}'
```

## 📝 Next Steps After Setup:

1. **Deploy Latest Code**: Push your updated CORS configuration to Render
2. **Update Vercel Environment**: Set the VITE_API_URL in Vercel dashboard
3. **Test Authentication**: Try Google OAuth on both domains
4. **Monitor Logs**: Check Render and Vercel logs for any errors

## 🎯 Final Verification:

- [ ] Google OAuth works on Vercel URL
- [ ] Google OAuth works on custom domain
- [ ] User registration creates new accounts
- [ ] User login works for existing accounts
- [ ] Role-based redirects function properly
- [ ] JWT tokens are properly set and persist
