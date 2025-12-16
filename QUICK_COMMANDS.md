# ⚡ Quick Commands - Production Admin Portal

## Test Production Services

```bash
# Check all production service health
node check-production-health.js
```

## Local Development with Production Services

### Backend (Admin Service)
```bash
cd microservices/admin-service

# Update .env with production URLs (or use .env.production)
# Then start:
npm start
```

### Frontend (Admin Portal)
```bash
cd admin-portal

# Update .env with:
# VITE_API_URL=http://localhost:3007/api  (for local admin service)
# OR
# VITE_API_URL=https://api-gateway-kzo9.onrender.com/api  (for production gateway)

npm run dev
```

## Deploy to Production

### Deploy Admin Service (Render)
1. Push to GitHub
2. Render auto-deploys from main branch
3. Or trigger manual deploy in Render dashboard

### Deploy Admin Portal (Vercel)
```bash
cd admin-portal
vercel --prod
```

Or push to GitHub (auto-deploys)

## Test Individual Services

```bash
# Auth Service
curl https://auth-service-uds0.onrender.com/health

# Quiz Service  
curl https://quiz-service-6jzt.onrender.com/health

# Gamification Service
curl https://gamification-service-ax6n.onrender.com/health

# Social Service
curl https://social-service-lwjy.onrender.com/health

# Result Service
curl https://result-service-vwjh.onrender.com/health

# Live Service
curl https://live-service-ga6w.onrender.com/health

# Meeting Service
curl https://meeting-service-ogfj.onrender.com/health

# Moderation Service
curl https://moderation-service-3e2e.onrender.com/health

# API Gateway
curl https://api-gateway-kzo9.onrender.com/health
```

## Create Admin User (MongoDB)

```javascript
// Connect to MongoDB Compass or Shell
use cognito_learning_hub

// Make existing user an admin
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "Admin" } }
)

// Verify
db.users.findOne({ email: "your-email@example.com" }, { password: 0 })
```

## Seed Email Templates

```javascript
// One-time operation in MongoDB
use cognito_learning_hub

db.emailtemplates.insertMany([
  {
    name: "Welcome Email - Student",
    type: "registration_student",
    subject: "Welcome to Cognito Learning Hub! 🎓",
    body: "...", // Copy from seeders/emailTemplates.js
    variables: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  // Add remaining templates
])
```

## Check Logs

### Render Service Logs
1. Go to https://dashboard.render.com
2. Click your service
3. Click "Logs" tab

### Vercel Deployment Logs
1. Go to https://vercel.com/dashboard
2. Click your project
3. Click deployment
4. View "Building" and "Runtime Logs"

## Environment Variables

### Admin Service (Render)
```env
AUTH_SERVICE_URL=https://auth-service-uds0.onrender.com
QUIZ_SERVICE_URL=https://quiz-service-6jzt.onrender.com
GAMIFICATION_SERVICE_URL=https://gamification-service-ax6n.onrender.com
SOCIAL_SERVICE_URL=https://social-service-lwjy.onrender.com
RESULT_SERVICE_URL=https://result-service-vwjh.onrender.com
LIVE_SERVICE_URL=https://live-service-ga6w.onrender.com
MEETING_SERVICE_URL=https://meeting-service-ogfj.onrender.com
MODERATION_SERVICE_URL=https://moderation-service-3e2e.onrender.com
MONGODB_URI=mongodb+srv://quizwise_user:Rakshita-1006@cluster0.2n6kw7y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### Admin Portal (Vercel)
```env
VITE_API_URL=https://api-gateway-kzo9.onrender.com/api
```

## Troubleshooting

### Service sleeping?
```bash
# Wake up services by visiting them:
for url in https://auth-service-uds0.onrender.com/health \
            https://quiz-service-6jzt.onrender.com/health \
            https://gamification-service-ax6n.onrender.com/health \
            https://social-service-lwjy.onrender.com/health \
            https://result-service-vwjh.onrender.com/health \
            https://live-service-ga6w.onrender.com/health \
            https://meeting-service-ogfj.onrender.com/health \
            https://moderation-service-3e2e.onrender.com/health; do
  curl $url &
done
wait
```

### CORS error?
1. Check `ADMIN_FRONTEND_URL` in admin service
2. Verify it matches your Vercel URL exactly
3. Redeploy admin service after updating

### 401 Unauthorized?
1. Check user role: should be "Admin" (capital A)
2. Verify JWT token in browser localStorage
3. Test `/api/auth/verify` endpoint

---

**Files Updated:**
- `microservices/admin-service/index.js` - Production URL support
- `microservices/admin-service/.env.production` - Production config
- `admin-portal/src/pages/ReportManagement.jsx` - Fixed import
- `admin-portal/.env` - Added API URL config

**New Files:**
- `PRODUCTION_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `FIXES_SUMMARY.md` - All fixes documented
- `check-production-health.js` - Health check script
- `QUICK_COMMANDS.md` - This file

**Ready for deployment! 🚀**
