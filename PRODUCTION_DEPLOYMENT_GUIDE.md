# 🚀 Admin Portal - Production Deployment Guide

## Overview
This guide will help you deploy the admin portal to work with your production microservices on Render.com.

## Your Production Services

```
Auth Service:          https://auth-service-uds0.onrender.com
Quiz Service:          https://quiz-service-6jzt.onrender.com
Gamification Service:  https://gamification-service-ax6n.onrender.com
Social Service:        https://social-service-lwjy.onrender.com
Result Service:        https://result-service-vwjh.onrender.com
Live Service:          https://live-service-ga6w.onrender.com
Meeting Service:       https://meeting-service-ogfj.onrender.com
Moderation Service:    https://moderation-service-3e2e.onrender.com
API Gateway:           https://api-gateway-kzo9.onrender.com
```

---

## Step 1: Deploy Admin Service to Render

### 1.1 Create New Web Service on Render
1. Go to [render.com/dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select branch: `main` or your deployment branch

### 1.2 Configure Service Settings
```
Name: admin-service
Region: Same as other services (for lower latency)
Branch: main
Root Directory: microservices/admin-service
Runtime: Node
Build Command: npm install
Start Command: npm start
```

### 1.3 Environment Variables
Add these in Render dashboard under "Environment":

```bash
# Server
PORT=10000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://quizwise_user:Rakshita-1006@cluster0.2n6kw7y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# CORS - Update after deploying frontend
ADMIN_FRONTEND_URL=https://your-admin-portal.vercel.app

# Production Microservice URLs
AUTH_SERVICE_URL=https://auth-service-uds0.onrender.com
QUIZ_SERVICE_URL=https://quiz-service-6jzt.onrender.com
GAMIFICATION_SERVICE_URL=https://gamification-service-ax6n.onrender.com
SOCIAL_SERVICE_URL=https://social-service-lwjy.onrender.com
RESULT_SERVICE_URL=https://result-service-vwjh.onrender.com
LIVE_SERVICE_URL=https://live-service-ga6w.onrender.com
MEETING_SERVICE_URL=https://meeting-service-ogfj.onrender.com
MODERATION_SERVICE_URL=https://moderation-service-3e2e.onrender.com
ADMIN_SERVICE_URL=https://admin-service-xxxx.onrender.com
```

**Note:** Update `ADMIN_SERVICE_URL` with your actual Render URL after deployment.

### 1.4 Deploy
Click "Create Web Service" and wait for deployment to complete.

---

## Step 2: Deploy Admin Portal Frontend to Vercel

### 2.1 Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 2.2 Configure Environment
Update `admin-portal/.env`:

```bash
# Use API Gateway or direct admin service URL
VITE_API_URL=https://api-gateway-kzo9.onrender.com/api

# Or if using admin service directly:
# VITE_API_URL=https://admin-service-xxxx.onrender.com/api
```

### 2.3 Deploy via Vercel Dashboard
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure:
   ```
   Framework Preset: Vite
   Root Directory: admin-portal
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```
4. Add Environment Variable:
   - Key: `VITE_API_URL`
   - Value: `https://api-gateway-kzo9.onrender.com/api`
5. Click "Deploy"

### 2.4 Or Deploy via CLI
```bash
cd admin-portal
vercel --prod
```

---

## Step 3: Update API Gateway (If Using)

If you want admin endpoints to go through the API Gateway, update the gateway configuration:

**File:** `microservices/api-gateway/index.js`

The admin routes should already be configured. Just ensure the environment variable is set:

```bash
ADMIN_SERVICE_URL=https://admin-service-xxxx.onrender.com
```

Then redeploy your API Gateway.

---

## Step 4: Update CORS Settings

### 4.1 Update Admin Service
After frontend is deployed, update `ADMIN_FRONTEND_URL` in admin service environment:
```bash
ADMIN_FRONTEND_URL=https://your-admin-portal.vercel.app
```

### 4.2 Redeploy Admin Service
Trigger a redeploy on Render after updating the environment variable.

---

## Step 5: Seed Email Templates (One-time)

Connect to your admin service and seed templates:

### Option A: Via MongoDB Compass/Shell
```javascript
use cognito_learning_hub

db.emailtemplates.insertMany([
  {
    name: "Welcome Email - Student",
    type: "registration_student",
    subject: "Welcome to Cognito Learning Hub! 🎓",
    body: "<html>... (copy from seeders/emailTemplates.js) ...</html>",
    variables: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Add other templates...
])
```

### Option B: Create a one-time script endpoint (temporary)
Add to admin service temporarily:
```javascript
app.post('/api/admin/seed-templates-once', async (req, res) => {
  const { seedTemplates } = require('./seeders/emailTemplates');
  await seedTemplates();
  res.json({ message: 'Templates seeded' });
});
```

Call it once, then remove the endpoint.

---

## Step 6: Create Admin User

### Via MongoDB
```javascript
use cognito_learning_hub

// Update existing user to admin
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "Admin" } }  // Note: Capital 'A' in Admin
)

// Or create new admin
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$HASH_HERE",  // Use bcrypt to hash
  role: "Admin",  // Capital 'A'
  status: "online",
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## Step 7: Test Production Deployment

### 7.1 Access Admin Portal
Open your Vercel URL: `https://your-admin-portal.vercel.app`

### 7.2 Login
Use admin credentials you created.

### 7.3 Verify Features
- [ ] Dashboard loads with stats
- [ ] Service Monitor shows all 9 services
- [ ] Each service shows "healthy" or proper status
- [ ] Gemini Monitor displays API key stats
- [ ] Email Templates load (4 default templates)
- [ ] User Management shows user list
- [ ] Quiz Management shows quizzes
- [ ] All CRUD operations work

---

## Troubleshooting

### Issue: Services show as "unhealthy"
**Solution:** Check if Render services are sleeping. Visit each service URL to wake them up:
```bash
curl https://auth-service-uds0.onrender.com/health
curl https://quiz-service-6jzt.onrender.com/health
# ... check all services
```

### Issue: CORS errors in browser console
**Solution:** 
1. Verify `ADMIN_FRONTEND_URL` matches your Vercel URL exactly
2. Check API Gateway CORS configuration includes your Vercel domain
3. Redeploy services after environment changes

### Issue: 401 Unauthorized on all requests
**Solution:**
1. Verify JWT token is valid
2. Check user role is "Admin" or "Moderator" (case-sensitive)
3. Ensure auth service `/api/auth/verify` endpoint works
4. Check browser console for token expiration

### Issue: Can't fetch users/quizzes
**Solution:**
1. Verify MongoDB connection string is correct
2. Check database name matches across all services
3. Ensure collections exist: `users`, `quizzes`, `emailtemplates`, `reports`

### Issue: Gemini stats not loading
**Solution:**
1. Ensure quiz service has `/health` endpoint with `apiKeyHealth` data
2. Check quiz service environment variables include API keys
3. Verify quiz service improvements were deployed

---

## Environment Variables Summary

### Admin Service (Render)
```env
PORT=10000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
ADMIN_FRONTEND_URL=https://your-admin-portal.vercel.app
AUTH_SERVICE_URL=https://auth-service-uds0.onrender.com
QUIZ_SERVICE_URL=https://quiz-service-6jzt.onrender.com
GAMIFICATION_SERVICE_URL=https://gamification-service-ax6n.onrender.com
SOCIAL_SERVICE_URL=https://social-service-lwjy.onrender.com
RESULT_SERVICE_URL=https://result-service-vwjh.onrender.com
LIVE_SERVICE_URL=https://live-service-ga6w.onrender.com
MEETING_SERVICE_URL=https://meeting-service-ogfj.onrender.com
MODERATION_SERVICE_URL=https://moderation-service-3e2e.onrender.com
```

### Admin Portal (Vercel)
```env
VITE_API_URL=https://api-gateway-kzo9.onrender.com/api
```

---

## Performance Notes

### Render Free Tier Limitations
- Services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Consider upgrading to paid tier for always-on services

### Optimization Tips
1. **Enable caching** in API responses
2. **Implement health check caching** (5-minute cache)
3. **Use loading states** in frontend for better UX
4. **Set up monitoring** alerts for service downtime

---

## Security Checklist

- [ ] All production URLs use HTTPS
- [ ] CORS restricted to admin portal domain only
- [ ] MongoDB uses authentication
- [ ] Admin role verification on all endpoints
- [ ] JWT tokens have expiration
- [ ] Passwords excluded from API responses
- [ ] Rate limiting enabled via API Gateway
- [ ] Environment variables secured in Render/Vercel

---

## Monitoring Setup

### Health Check Endpoints
```bash
# Check all services
curl https://admin-service-xxxx.onrender.com/health
curl https://auth-service-uds0.onrender.com/health
curl https://quiz-service-6jzt.onrender.com/health
curl https://gamification-service-ax6n.onrender.com/health
curl https://social-service-lwjy.onrender.com/health
curl https://result-service-vwjh.onrender.com/health
curl https://live-service-ga6w.onrender.com/health
curl https://meeting-service-ogfj.onrender.com/health
curl https://moderation-service-3e2e.onrender.com/health
```

### Set Up UptimeRobot (Free)
1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add monitors for each service
3. Set check interval: 5 minutes
4. Configure email alerts

---

## Rollback Plan

If deployment fails:

1. **Frontend:** Vercel allows instant rollback to previous deployment
2. **Backend:** Revert Render service to previous commit
3. **Database:** Always backup before schema changes

---

## Success Metrics

After deployment, verify:
- [ ] Admin portal accessible at production URL
- [ ] All 9 services reporting healthy status
- [ ] Service health checks complete in < 10 seconds
- [ ] Dashboard stats accurate
- [ ] Email templates functional
- [ ] User/Quiz CRUD operations work
- [ ] No CORS errors in production
- [ ] Mobile responsive (test on phone)

---

## Post-Deployment Tasks

1. ✅ Bookmark admin portal URL
2. ✅ Save admin credentials securely (password manager)
3. ✅ Set up monitoring/alerts
4. ✅ Test all features thoroughly
5. ✅ Train team on admin portal usage
6. ✅ Document any custom configurations
7. ✅ Set up backup schedules

---

## Support

**Issues?** 
- Check Render logs: Dashboard → Your Service → Logs
- Check Vercel deployment logs
- Review browser console for frontend errors
- Test API endpoints with Postman/cURL

**Questions?**
- Review main documentation: `ADMIN_PORTAL_SETUP_GUIDE.md`
- Check API reference: `microservices/admin-service/README.md`

---

**Deployment Complete! 🎉**

Your admin portal is now live and connected to production services.
