# Admin Portal - Cognito Learning Hub

A comprehensive admin dashboard for monitoring and managing the Cognito Learning Hub platform.

## 🎯 Features

### 1. **Service Monitor** 📊
- Real-time health monitoring of all microservices
- CPU, memory, and database status tracking
- Service restart capabilities
- Alert notifications for service failures

### 2. **Gemini AI Monitor** 🤖
- API key health tracking with fallback management
- Circuit breaker status monitoring
- Rate limit warnings (alerts at 80% usage)
- API key rotation and switching
- Usage analytics and charts
- Add/remove API keys dynamically

### 3. **Email Template Management** ✉️
Manage automated email templates for:
- Student registration welcome emails
- Teacher registration welcome emails
- Admin registration welcome emails
- Quiz created confirmations
- Quiz completed results
- Password reset instructions
- Account verification emails

Features:
- HTML and plain text content
- Variable placeholders ({{name}}, {{email}}, etc.)
- Test email functionality
- Live preview

### 4. **User Management** 👥
- View all users (students, teachers, admins)
- Search and filter users
- Ban/activate user accounts
- Delete users
- User statistics and analytics
- Role-based management

### 5. **Quiz Management** 📝
- View all quizzes on the platform
- Toggle public/private status
- Delete quizzes
- AI-generated quiz tracking
- Quiz statistics and analytics

### 6. **Report Management** 🚨
- Review user reports
- Resolve or reject reports
- Track report status
- Report analytics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Backend microservices running

### Installation

```bash
# Navigate to admin portal directory
cd admin-portal

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure API URL in .env
# VITE_API_URL=http://localhost:3001/api

# Start development server
npm run dev
```

The admin portal will be available at: **http://localhost:5174**

## 🔐 Default Credentials

**Admin Login:**
- Email: `admin@cognito.com`
- Password: `admin123`

> ⚠️ **Important:** Change these credentials in production!

## 📁 Project Structure

```
admin-portal/
├── src/
│   ├── api/
│   │   └── client.js          # API client with interceptors
│   ├── components/
│   │   └── Layout.jsx          # Main layout with sidebar
│   ├── pages/
│   │   ├── Dashboard.jsx       # Overview dashboard
│   │   ├── ServiceMonitor.jsx  # Service health monitoring
│   │   ├── GeminiMonitor.jsx   # AI API management
│   │   ├── EmailTemplates.jsx  # Email template management
│   │   ├── UserManagement.jsx  # User CRUD operations
│   │   ├── QuizManagement.jsx  # Quiz management
│   │   ├── ReportManagement.jsx# Report handling
│   │   └── Login.jsx           # Admin authentication
│   ├── store/
│   │   └── authStore.js        # Zustand auth state
│   ├── App.jsx                 # Main app with routes
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🛠️ Technologies Used

- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **TanStack Query** - Data fetching and caching
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **Axios** - HTTP client
- **date-fns** - Date formatting

## 🔗 API Endpoints Required

The admin portal expects these backend endpoints:

### Authentication
- `POST /api/admin/login`

### Services
- `GET /api/admin/services/health`
- `POST /api/admin/services/restart/:serviceName`

### Gemini Monitor
- `GET /api/admin/gemini/stats`
- `GET /api/admin/gemini/keys`
- `POST /api/admin/gemini/keys`
- `POST /api/admin/gemini/switch-key`

### Email Templates
- `GET /api/admin/email-templates`
- `GET /api/admin/email-templates/:id`
- `POST /api/admin/email-templates`
- `PUT /api/admin/email-templates/:id`
- `DELETE /api/admin/email-templates/:id`
- `POST /api/admin/email-templates/:id/test`

### Users
- `GET /api/admin/users`
- `GET /api/admin/users/:id`
- `PUT /api/admin/users/:id`
- `DELETE /api/admin/users/:id`
- `POST /api/admin/users/:id/toggle-status`
- `GET /api/admin/users/stats`

### Quizzes
- `GET /api/admin/quizzes`
- `GET /api/admin/quizzes/:id`
- `PUT /api/admin/quizzes/:id`
- `DELETE /api/admin/quizzes/:id`
- `POST /api/admin/quizzes/:id/toggle-status`
- `GET /api/admin/quizzes/stats`

### Reports
- `GET /api/admin/reports`
- `GET /api/admin/reports/:id`
- `POST /api/admin/reports/:id/resolve`
- `DELETE /api/admin/reports/:id`
- `GET /api/admin/reports/stats`

### Dashboard
- `GET /api/admin/dashboard/stats`
- `GET /api/admin/dashboard/metrics`

## ⚙️ Configuration

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3001/api
```

### API Gateway Integration

The portal connects to your API Gateway. Ensure the gateway has admin routes configured.

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
colors: {
  primary: {
    // Your primary color shades
  },
  admin: {
    dark: '#1a1d29',
    darker: '#141720',
    sidebar: '#1e2139',
  }
}
```

### Branding

- Replace logo in `public/admin-logo.svg`
- Update title in `index.html`
- Modify color scheme in `tailwind.config.js`

## 🔒 Security Features

- JWT token-based authentication
- Automatic token refresh
- Protected routes
- Role-based access control (RBAC)
- XSS protection
- CSRF protection
- Secure API communication

## 📱 Responsive Design

The portal is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1280px - 1920px)
- Tablet (768px - 1280px)
- Mobile (320px - 768px)

## 🚨 Gemini Monitoring Alerts

### Rate Limit Warnings

The Gemini Monitor automatically detects:
- **80% usage** → Yellow warning
- **90% usage** → Red alert
- **Unhealthy keys** → Automatic fallback suggestions

### Circuit Breaker States

- **CLOSED** (Green) → All systems operational
- **HALF-OPEN** (Yellow) → Testing recovery
- **OPEN** (Red) → Protection activated, using fallbacks

## 📊 Dashboard Metrics

The dashboard displays:
- Total users, quizzes, reports
- Service health overview
- User growth charts
- Quiz statistics
- Recent activity
- System performance metrics

## 🔧 Development

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint Code

```bash
npm run lint
```

## 🐛 Troubleshooting

### API Connection Issues

1. Check API_URL in `.env`
2. Ensure backend services are running
3. Check CORS configuration
4. Verify authentication token

### Authentication Fails

1. Check admin credentials in database
2. Verify JWT secret matches backend
3. Clear browser local storage
4. Check backend logs

### Service Monitor Shows All Offline

1. Verify microservices are running
2. Check health endpoints return 200
3. Review API gateway routing
4. Check firewall/network issues

## 📈 Performance Tips

1. **Caching**: TanStack Query automatically caches data
2. **Lazy Loading**: Routes are code-split
3. **Debouncing**: Search inputs use debouncing
4. **Auto-refresh**: Services refresh every 5-10 seconds
5. **Pagination**: Large lists use pagination

## 🤝 Contributing

1. Follow the existing code style
2. Use functional components with hooks
3. Add proper TypeScript types (if converting)
4. Write meaningful commit messages
5. Test on multiple screen sizes

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Contact: admin@cognito.com

## 📄 License

© 2025 Cognito Learning Hub. All rights reserved.

---

## 🎯 Next Steps

After setting up the admin portal:

1. ✅ Install dependencies: `npm install`
2. ✅ Configure `.env` file
3. ✅ Implement backend admin endpoints (see API section)
4. ✅ Start the portal: `npm run dev`
5. ✅ Login and test all features
6. ✅ Customize branding and colors
7. ✅ Deploy to production

**Portal URL:** http://localhost:5174
**Admin Email:** admin@cognito.com
**Admin Password:** admin123 (change in production!)

---

Happy Administrating! 🚀
