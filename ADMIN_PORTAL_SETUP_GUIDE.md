# Admin Portal - Complete Setup & Deployment Guide

## 🎯 Overview

This guide will help you set up and run the complete Admin Portal system, including both the React frontend and Node.js backend service.

**Admin Portal Stack:**
- **Frontend**: React 18 + Vite (Port 5174)
- **Backend**: Express.js (Port 3007)
- **Database**: MongoDB (shared with main app)
- **Gateway**: API Gateway proxies `/api/admin/*` to admin service

---

## 📋 Prerequisites

- Node.js v18+ installed
- MongoDB running (local or cloud)
- Main Cognito Learning Hub microservices running
- Admin user account created

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Backend Dependencies
```bash
cd microservices/admin-service
npm install
```

### Step 2: Configure Backend Environment
Create `.env` file in `microservices/admin-service/`:
```env
PORT=3007
MONGODB_URI=mongodb://localhost:27017/cognito_learning_hub
ADMIN_FRONTEND_URL=http://localhost:5174
NODE_ENV=development
```

### Step 3: Seed Email Templates (Optional but Recommended)
```bash
npm run seed:templates
```

This creates 4 default templates:
- Welcome Email - Student
- Welcome Email - Teacher  
- Quiz Creation Success
- Password Reset

### Step 4: Start Admin Service
```bash
npm start
```

You should see:
```
✅ Admin Service connected to MongoDB
🚀 Admin Service running on port 3007
📊 Admin Portal: http://localhost:5174
```

### Step 5: Install Frontend Dependencies
```bash
cd ../../admin-portal
npm install
```

### Step 6: Configure Frontend Environment
Create `.env` file in `admin-portal/`:
```env
VITE_API_URL=http://localhost:3001/api
```

### Step 7: Start Frontend
```bash
npm run dev
```

You should see:
```
VITE v4.4.9  ready in 500 ms

➜  Local:   http://localhost:5174/
➜  Network: use --host to expose
```

### Step 8: Access Admin Portal
Open browser: **http://localhost:5174**

Login with admin credentials:
- Email: your-admin-email@example.com
- Password: your-admin-password

---

## 🔧 Detailed Configuration

### Backend Service Configuration

**Environment Variables:**
```env
# Server
PORT=3007

# Database
MONGODB_URI=mongodb://localhost:27017/cognito_learning_hub

# Frontend CORS
ADMIN_FRONTEND_URL=http://localhost:5174

# Environment
NODE_ENV=development
```

**Available Scripts:**
```bash
npm start              # Start production server
npm run dev           # Start with nodemon (auto-reload)
npm run seed:templates # Seed email templates
npm test              # Run tests
```

### Frontend Configuration

**Environment Variables:**
```env
# API Gateway URL (not direct admin service URL)
VITE_API_URL=http://localhost:3001/api

# Or for production
VITE_API_URL=https://api.cognitolearninghub.com/api
```

**Available Scripts:**
```bash
npm run dev           # Start dev server (port 5174)
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Run ESLint
```

---

## 🌐 API Gateway Integration

The admin service is automatically integrated with the API Gateway. All requests to `/api/admin/*` are proxied to the admin service.

**Flow:**
```
Admin Portal (5174) → API Gateway (3001) → Admin Service (3007)
                         ↓
                    /api/admin/* → http://localhost:3007/api/admin/*
```

**Verify Gateway Integration:**
```bash
curl http://localhost:3001/api/admin/services/health \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 👤 Creating an Admin User

If you don't have an admin account yet:

### Method 1: Direct Database Update (MongoDB)
```javascript
// Connect to MongoDB
use cognito_learning_hub

// Update existing user to admin
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)

// Or create new admin user
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$HASHED_PASSWORD_HERE", // Use bcrypt
  role: "admin",
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Method 2: Via Auth Service API
```bash
# Register normal user first
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "SecurePassword123!",
    "role": "student"
  }'

# Then manually update to admin in database
```

---

## 🧪 Testing the Setup

### 1. Test Backend Health
```bash
curl http://localhost:3007/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "admin-service",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Test API Gateway Proxy
```bash
curl http://localhost:3001/api/admin/services/health \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test Frontend
1. Open http://localhost:5174
2. Login with admin credentials
3. Navigate to Dashboard - should see stats
4. Check Service Monitor - should see all services
5. Check Gemini Monitor - should see API key stats

---

## 📊 Features Checklist

After successful setup, verify all features work:

### ✅ Dashboard
- [ ] Total users count displayed
- [ ] Total quizzes count displayed
- [ ] Service health overview shown
- [ ] Recent activity timeline visible

### ✅ Service Monitor
- [ ] All 8 microservices listed
- [ ] Health status updating every 5 seconds
- [ ] CPU and memory metrics shown
- [ ] Database connection status visible

### ✅ Gemini API Monitor
- [ ] Total API keys count shown
- [ ] Current key index displayed
- [ ] Rate limit warnings at 80% usage
- [ ] Circuit breaker status visible
- [ ] Can switch between keys
- [ ] Can add new API key

### ✅ Email Templates
- [ ] 4 default templates loaded
- [ ] Can create new template
- [ ] Can edit existing template
- [ ] HTML editor works properly
- [ ] Can test send email
- [ ] Can delete template

### ✅ User Management
- [ ] Users list loads with pagination
- [ ] Search by name/email works
- [ ] Filter by role works
- [ ] Can view user details
- [ ] Can edit user info
- [ ] Can delete user

### ✅ Quiz Management
- [ ] Quizzes list loads with pagination
- [ ] Search by title/subject works
- [ ] Can view quiz details
- [ ] Can toggle quiz status
- [ ] Can delete quiz

### ✅ Report Management
- [ ] Reports list loads
- [ ] Filter by type works
- [ ] Can view report details
- [ ] Can resolve report
- [ ] Can reject report

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution:**
1. Ensure MongoDB is running: `mongod` or check service
2. Verify `MONGODB_URI` in `.env`
3. Check MongoDB connection string format

### Issue: "CORS error in browser console"
**Solution:**
1. Verify `ADMIN_FRONTEND_URL` in backend `.env` matches frontend URL
2. Check API Gateway CORS settings include `localhost:5174`
3. Ensure `credentials: true` in API client

### Issue: "401 Unauthorized" on all admin requests
**Solution:**
1. Verify user has `role: "admin"` in database
2. Check JWT token is valid and not expired
3. Verify Authorization header format: `Bearer <token>`
4. Check auth service is running on port 3002

### Issue: "Service health shows all unhealthy"
**Solution:**
1. Verify all microservices are running
2. Check port conflicts (3002-3009)
3. Ensure services have `/health` endpoint
4. Check firewall/network settings

### Issue: "Gemini stats not loading"
**Solution:**
1. Ensure quiz service is running (port 3003)
2. Verify quiz service has `/health` endpoint with `apiKeyHealth`
3. Check quiz service improvements are applied
4. Verify Gemini API keys are configured

### Issue: "Email test send fails"
**Solution:**
1. Verify auth service email configuration
2. Check SMTP settings in auth service
3. Ensure nodemailer is installed in auth service
4. Check auth service `/api/email/send` endpoint exists

### Issue: "Frontend shows blank page"
**Solution:**
1. Check browser console for errors
2. Verify `VITE_API_URL` in frontend `.env`
3. Clear browser cache and reload
4. Check if Vite dev server is running
5. Try `npm run build` and `npm run preview`

---

## 🚢 Production Deployment

### Backend Deployment (Admin Service)

**1. Environment Setup:**
```env
PORT=3007
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cognito
ADMIN_FRONTEND_URL=https://admin.cognitolearninghub.com
NODE_ENV=production
```

**2. Build & Deploy:**
```bash
# Install production dependencies only
npm install --production

# Start with PM2
pm2 start index.js --name admin-service

# Or with systemd
sudo systemctl start admin-service
```

**3. Configure Nginx:**
```nginx
server {
    listen 80;
    server_name admin-api.cognitolearninghub.com;

    location / {
        proxy_pass http://localhost:3007;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Frontend Deployment

**1. Update Environment:**
```env
VITE_API_URL=https://api.cognitolearninghub.com/api
```

**2. Build:**
```bash
npm run build
# Output: dist/ folder
```

**3. Deploy Options:**

**Option A: Vercel**
```bash
npm install -g vercel
vercel --prod
```

**Option B: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Option C: Nginx Static**
```nginx
server {
    listen 80;
    server_name admin.cognitolearninghub.com;
    root /var/www/admin-portal/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 📈 Monitoring & Maintenance

### Health Checks
```bash
# Check admin service
curl https://admin-api.cognitolearninghub.com/health

# Check via gateway
curl https://api.cognitolearninghub.com/api/admin/services/health \
  -H "Authorization: Bearer TOKEN"
```

### Logs
```bash
# View admin service logs
tail -f logs/admin-service.log

# PM2 logs
pm2 logs admin-service

# Systemd logs
journalctl -u admin-service -f
```

### Database Backups
```bash
# Backup MongoDB
mongodump --uri="mongodb://localhost:27017/cognito_learning_hub" \
  --out=/backups/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://localhost:27017/cognito_learning_hub" \
  /backups/20240115
```

---

## 🔐 Security Best Practices

1. **Use HTTPS in production** - Always use SSL certificates
2. **Secure MongoDB** - Enable authentication and use strong passwords
3. **Rotate Admin Tokens** - Implement token expiration and refresh
4. **Rate Limiting** - Already implemented in API Gateway
5. **Input Validation** - Always validate user input
6. **Audit Logging** - Track all admin actions (future enhancement)
7. **Role-Based Access** - Use granular permissions (future enhancement)

---

## 📚 Additional Resources

- [Admin Service API Documentation](./microservices/admin-service/README.md)
- [Admin Portal Frontend Documentation](./admin-portal/README.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)

---

## 🆘 Getting Help

**Common Issues:** Check troubleshooting section above

**GitHub Issues:** [github.com/your-repo/issues](https://github.com)

**Email Support:** support@cognitolearninghub.com

**Discord Community:** [discord.gg/cognito](https://discord.gg)

---

## ✨ Next Steps

After successful setup:

1. ✅ Customize email templates for your branding
2. ✅ Set up monitoring alerts (PM2, Datadog, etc.)
3. ✅ Configure backup schedules
4. ✅ Review security settings
5. ✅ Train admin team on portal usage
6. ✅ Set up CI/CD pipeline for updates

---

**Happy Administering! 🚀**
