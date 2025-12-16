# 🚀 Admin Portal - Quick Reference Card

## ⚡ Start Everything (3 Commands)

```bash
# 1. Start Admin Service Backend
cd microservices/admin-service && npm start

# 2. Start Admin Portal Frontend  
cd admin-portal && npm run dev

# 3. Access Portal
# Open: http://localhost:5174
```

---

## 📦 What's Running

| Service | Port | URL | Status Check |
|---------|------|-----|--------------|
| Admin Portal (Frontend) | 5174 | http://localhost:5174 | Open in browser |
| Admin Service (Backend) | 3007 | http://localhost:3007 | `curl http://localhost:3007/health` |
| API Gateway (Proxy) | 3001 | http://localhost:3001/api/admin/* | Routes to port 3007 |

---

## 🎯 Key Features at a Glance

### 📊 Dashboard
View overall system health, user counts, quiz stats, and service status.

### 🔍 Service Monitor
Real-time monitoring of 8 microservices with CPU/memory metrics. Updates every 5 seconds.

### 🤖 Gemini API Monitor
- View all API keys and their health
- Get warnings at 80% rate limit
- Switch between keys
- Add/remove keys
- Monitor circuit breaker status

### 📧 Email Templates
- 4 pre-seeded templates (Welcome Student/Teacher, Quiz Success, Password Reset)
- HTML editor with preview
- Test send functionality
- Variable substitution ({{userName}}, {{quizTitle}}, etc.)

### 👥 User Management
- Search by name/email
- Filter by role (student, teacher, admin)
- Edit user details
- Delete users
- Pagination support

### 📝 Quiz Management
- Search by title/subject
- View quiz details
- Toggle status (draft/published)
- Delete quizzes

### 📋 Report Management
- Filter by type (bug, content, user, etc.)
- View report details
- Resolve with notes
- Reject with reason

---

## 🔑 Important URLs

```
Frontend:        http://localhost:5174
Backend:         http://localhost:3007
Gateway:         http://localhost:3001/api/admin/*
Health Check:    http://localhost:3007/health
```

---

## 🛠️ Common Commands

### Admin Service (Backend)
```bash
cd microservices/admin-service

# Install dependencies
npm install

# Seed email templates
npm run seed:templates

# Start server
npm start

# Development with auto-reload
npm run dev
```

### Admin Portal (Frontend)
```bash
cd admin-portal

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🔐 Creating Admin User

### Quick Method (MongoDB Shell)
```javascript
use cognito_learning_hub

db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

---

## 📁 File Locations

```
admin-portal/
├── src/pages/Dashboard.jsx           # Main dashboard
├── src/pages/ServiceMonitor.jsx      # Service health
├── src/pages/GeminiMonitor.jsx       # API key management
├── src/pages/EmailTemplates.jsx      # Email templates
├── src/pages/UserManagement.jsx      # User CRUD
├── src/pages/QuizManagement.jsx      # Quiz management
├── src/pages/ReportManagement.jsx    # Reports
└── src/api/client.js                 # API client

microservices/admin-service/
├── index.js                           # Main server
├── models/EmailTemplate.js            # Email template schema
├── models/Report.js                   # Report schema
└── seeders/emailTemplates.js          # Template seeder
```

---

## 🐛 Quick Troubleshooting

### Backend won't start?
```bash
# Check MongoDB is running
mongod

# Check .env file exists
cat microservices/admin-service/.env

# Check port 3007 is free
lsof -i :3007  # Mac/Linux
netstat -ano | findstr :3007  # Windows
```

### Frontend won't start?
```bash
# Check .env file
cat admin-portal/.env

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check port 5174 is free
lsof -i :5174  # Mac/Linux
netstat -ano | findstr :5174  # Windows
```

### Can't login?
1. Verify user has `role: "admin"` in database
2. Check JWT token is not expired
3. Verify auth service is running (port 3002)
4. Check browser console for errors

### Services show unhealthy?
1. Start all microservices (auth, quiz, result, etc.)
2. Verify ports 3002-3009 are available
3. Check MongoDB connection
4. Wait 5 seconds for health refresh

---

## 📊 API Endpoints Quick List

```
# Service Monitoring
GET    /api/admin/services/health
POST   /api/admin/services/:name/restart

# Gemini API
GET    /api/admin/gemini/stats
GET    /api/admin/gemini/keys
POST   /api/admin/gemini/keys/:id/switch
POST   /api/admin/gemini/keys
DELETE /api/admin/gemini/keys/:id

# Email Templates
GET    /api/admin/email-templates
GET    /api/admin/email-templates/:id
POST   /api/admin/email-templates
PUT    /api/admin/email-templates/:id
DELETE /api/admin/email-templates/:id
POST   /api/admin/email-templates/:id/test

# Users
GET    /api/admin/users
GET    /api/admin/users/:id
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id

# Quizzes
GET    /api/admin/quizzes
GET    /api/admin/quizzes/:id
PUT    /api/admin/quizzes/:id/status
DELETE /api/admin/quizzes/:id

# Reports
GET    /api/admin/reports
GET    /api/admin/reports/:id
POST   /api/admin/reports/:id/resolve
POST   /api/admin/reports/:id/reject

# Dashboard
GET    /api/admin/dashboard/stats
```

All endpoints require: `Authorization: Bearer <admin-token>`

---

## 🎨 Default Email Templates

1. **Welcome Email - Student**
   - Variables: `{{userName}}`, `{{loginUrl}}`
   - Purpose: New student onboarding

2. **Welcome Email - Teacher**
   - Variables: `{{userName}}`, `{{loginUrl}}`
   - Purpose: New teacher onboarding

3. **Quiz Creation Success**
   - Variables: `{{userName}}`, `{{quizTitle}}`, `{{quizSubject}}`, `{{questionCount}}`, `{{difficulty}}`, `{{timeLimit}}`, `{{quizUrl}}`
   - Purpose: Confirm quiz generation

4. **Password Reset**
   - Variables: `{{userName}}`, `{{resetUrl}}`, `{{resetToken}}`
   - Purpose: Password recovery

---

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=3007
MONGODB_URI=mongodb://localhost:27017/cognito_learning_hub
ADMIN_FRONTEND_URL=http://localhost:5174
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

---

## 📚 Documentation Files

| File | Description |
|------|-------------|
| `ADMIN_PORTAL_COMPLETE_SUMMARY.md` | Full implementation summary |
| `ADMIN_PORTAL_SETUP_GUIDE.md` | Detailed setup instructions |
| `admin-portal/README.md` | Frontend documentation |
| `microservices/admin-service/README.md` | Backend API reference |
| `ADMIN_PORTAL_QUICK_REFERENCE.md` | This file |

---

## 💡 Tips & Tricks

1. **Use browser DevTools** - Network tab to debug API calls
2. **Check MongoDB** - Use Compass or Studio 3T to verify data
3. **Monitor logs** - Check terminal for backend errors
4. **Clear cache** - If seeing old data, clear browser cache
5. **Use test endpoints** - Health checks before debugging features

---

## 🎯 Testing Checklist

Quick verification after starting:

- [ ] Backend health check returns 200
- [ ] Frontend loads at localhost:5174
- [ ] Can login with admin credentials
- [ ] Dashboard shows stats
- [ ] Service monitor displays 8 services
- [ ] Gemini monitor shows API keys
- [ ] Email templates list loads (4 default)
- [ ] Can search users
- [ ] Can view quizzes
- [ ] Reports page loads

---

## 📞 Getting Help

**Setup Guide**: `ADMIN_PORTAL_SETUP_GUIDE.md`  
**API Docs**: `microservices/admin-service/README.md`  
**Frontend Docs**: `admin-portal/README.md`

**In case of issues:**
1. Check troubleshooting section in setup guide
2. Verify all environment variables
3. Ensure all services are running
4. Check MongoDB connection
5. Review browser console errors

---

## 🚀 Production Deployment

### Quick Deploy Commands
```bash
# Backend
cd microservices/admin-service
npm install --production
pm2 start index.js --name admin-service

# Frontend
cd admin-portal
npm run build
# Deploy dist/ folder to Vercel/Netlify
```

**Remember:**
- Update environment variables for production
- Use HTTPS for all endpoints
- Enable MongoDB authentication
- Configure proper CORS origins

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

---

**Need more details?** See full documentation in `ADMIN_PORTAL_COMPLETE_SUMMARY.md`
