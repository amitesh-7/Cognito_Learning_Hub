# 📚 QuizWise-AI - Complete Project Context

## 🎯 Project Overview

**QuizWise-AI** is a full-stack, AI-powered educational quiz platform built for the **UpSkill India Challenge Hackathon** organized by HCL GUVI in association with IIT Bombay Techfest.

### Mission

To revolutionize education through AI-driven quiz generation, real-time multiplayer engagement, and intelligent doubt resolution - making learning interactive, competitive, and accessible.

---

## 🏆 Hackathon Challenge

**Challenge**: AI Quiz Portal (Platform Replication like Kahoot with AI Quiz Generation)

**Requirements Met:**

- ✅ Host live multiplayer quizzes
- ✅ Real-time scoring and leaderboard updates
- ✅ Admin dashboard for quiz management
- ✅ AI feature: Auto-generate quizzes from text, PDFs, or topics
- ✅ Scalable backend (Express + Socket.IO)
- ✅ Responsive frontend (React + Vite)
- ✅ **Bonus**: Analytics dashboard, adaptive difficulty, Google OAuth

---

## 🏗️ Technical Architecture

### Technology Stack

#### Frontend (React 18 + Vite)

```
Location: frontend/
Language: JavaScript (ES6+)
Framework: React 18.3.1
Build Tool: Vite 5.4.19
```

**Key Dependencies:**

- **UI/UX**: Tailwind CSS, Framer Motion, Lucide React
- **State Management**: React Context API (Auth, Socket)
- **Real-time**: Socket.IO Client 4.8.1
- **Routing**: React Router DOM 6.28.0
- **Auth**: Google OAuth (@react-oauth/google)
- **Charts**: Recharts 2.13.0
- **Animations**: Lottie React, React Confetti
- **PDF Export**: jsPDF, html2canvas
- **Utilities**: QRCode generation, JWT decode

#### Backend (Node.js 20 + Express 5)

```
Location: backend/
Language: JavaScript (CommonJS)
Runtime: Node.js 20.19.4
Framework: Express 5.1.0
```

**Key Dependencies:**

- **Database**: MongoDB 6.18.0, Mongoose 8.17.0
- **Real-time**: Socket.IO 4.8.1
- **AI**: Google Generative AI (Gemini) 0.24.1
- **Auth**: JWT, bcryptjs, Google Auth Library
- **File Handling**: Multer, pdf-parse
- **Security**: CORS, dotenv

### Database Schema (MongoDB)

**Collections:**

1. **users** - User accounts (Student/Teacher/Moderator/Admin)
2. **quizzes** - Quiz metadata and questions
3. **results** - Quiz attempt history
4. **livesessions** - Real-time multiplayer sessions
5. **achievements** - Gamification badges
6. **reports** - Content moderation flags

---

## 🎨 Feature Breakdown

### 1. User Roles & Authentication

#### Student

- Browse quiz library
- Take quizzes (solo or live multiplayer)
- View personal dashboard with stats
- Track achievement badges
- Use AI Doubt Solver for help
- Report inappropriate questions

#### Teacher

- All Student features +
- Access Quiz Maker Studio:
  - AI generation from topic
  - AI generation from PDF/TXT files
  - Manual question creation
- Host live multiplayer sessions
- View quiz analytics (attempt count, avg scores)
- Edit/delete own quizzes

#### Moderator

- All Student features +
- View/edit/delete ANY quiz
- Review reported questions
- Dedicated moderation dashboard

#### Admin

- All roles' features +
- Manage users (change roles)
- Site-wide analytics
- Broadcast announcements
- System configuration

### 2. AI-Powered Quiz Generation

**Three Methods:**

**A. Topic-based Generation**

```javascript
Input: "Photosynthesis" + 10 questions + Medium difficulty
AI (Gemini): Analyzes topic → Generates contextual questions
Output: Ready-to-use quiz with multiple-choice questions
```

**B. File-based Generation**

```javascript
Input: Upload PDF/TXT (notes, textbook chapter)
AI: Extracts text → Understands context → Generates questions
Output: Quiz based on uploaded content
```

**C. Manual Creation**

- Step-by-step editor
- Add unlimited questions
- Define correct answers
- Full control over content

### 3. Real-Time Multiplayer (Kahoot-style)

**Architecture:**

- WebSocket communication via Socket.IO
- Hybrid state management (in-memory + MongoDB)
- 6-character session codes
- QR code generation for easy joining

**Teacher Flow:**

1. Select quiz → Click "Host Live"
2. Session code generated (e.g., `ABC123`)
3. QR code displayed
4. Students join → appear in participant list
5. Teacher starts quiz
6. Navigate questions, monitor leaderboard
7. End session → view final rankings

**Student Flow:**

1. Enter session code or scan QR
2. Wait in lobby
3. Answer questions with 30s timer
4. Instant feedback (correct/incorrect)
5. Live leaderboard updates
6. Final score and ranking

**Scoring System:**

```javascript
Base Points: 10
Speed Bonus: 5 × (timeRemaining / maxTime)
Total: Base + Speed Bonus

Example:
- Answer in 5s out of 30s
- Time remaining: 25s
- Speed bonus: 5 × (25/30) = 4.17
- Total: 10 + 4.17 = 14.17 points
```

### 4. AI Doubt Solver / Tutor

**Purpose**: Instant academic help

**Features:**

- Chat interface
- AI responds as friendly tutor
- Explains concepts step-by-step
- Encourages critical thinking
- Available 24/7

**Technology**: Gemini AI with custom educational prompting

### 5. Gamification & Analytics

**Achievements:**

- First Quiz Completed
- Speed Demon (fast answers)
- Perfect Score
- Quiz Master (created 10 quizzes)
- Social Butterfly (participated in 5 live sessions)

**Personal Dashboard:**

- Average score
- Total quizzes completed
- Score progression chart (Recharts)
- Achievement badges
- Recent activity

**Teacher Analytics:**

- Quiz attempt count
- Average scores
- Student engagement metrics

**Admin Analytics:**

- Total users by role
- Total quizzes
- Platform engagement
- Trend charts

### 6. Content Moderation

**Report System:**

- Students flag incorrect/inappropriate questions
- Reports sent to Moderator dashboard
- Moderators review and take action (edit/delete)
- Maintains platform quality

---

## 📁 Project Structure

```
QuizWise-AI-Full-Stack/
│
├── frontend/                          # React application
│   ├── public/
│   │   ├── animations/                # Lottie JSON files
│   │   ├── sounds/                    # Audio effects
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   │
│   ├── src/
│   │   ├── assets/                    # Images, icons
│   │   │
│   │   ├── components/                # Reusable components
│   │   │   ├── ui/                    # UI primitives (Card, Button, etc.)
│   │   │   ├── GoogleAuthButton.jsx
│   │   │   ├── LiveLeaderboard.jsx
│   │   │   ├── QuizDisplay.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── [15+ components]
│   │   │
│   │   ├── context/                   # Global state
│   │   │   ├── AuthContext.jsx        # User auth state
│   │   │   └── SocketContext.jsx      # WebSocket connection
│   │   │
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── useSound.js
│   │   │   └── useTheme.js
│   │   │
│   │   ├── lib/                       # Utilities
│   │   │   ├── pdfExporter.js
│   │   │   └── utils.js
│   │   │
│   │   ├── pages/                     # Route components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx          # Student dashboard
│   │   │   ├── TeacherDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ModeratorDashboard.jsx
│   │   │   ├── EnhancedQuizCreator.jsx
│   │   │   ├── FileQuizGenerator.jsx
│   │   │   ├── ManualQuizCreator.jsx
│   │   │   ├── GamifiedQuizTaker.jsx
│   │   │   ├── LiveSessionHost.jsx    # Teacher control panel
│   │   │   ├── LiveSessionJoin.jsx    # Student participation
│   │   │   ├── DoubtSolver.jsx        # AI chat
│   │   │   └── [20+ pages]
│   │   │
│   │   ├── App.jsx                    # Main app with routes
│   │   ├── main.jsx                   # Entry point
│   │   └── [CSS files]
│   │
│   ├── package.json                   # Dependencies
│   ├── vite.config.js                 # Vite configuration
│   ├── tailwind.config.cjs            # Tailwind setup
│   └── vercel.json                    # Deployment config
│
├── backend/                           # Node.js server
│   ├── models/                        # Mongoose schemas
│   │   ├── User.js
│   │   ├── Quiz.js
│   │   ├── Result.js
│   │   ├── LiveSession.js             # Multiplayer sessions
│   │   ├── Achievement.js
│   │   ├── Report.js
│   │   └── SocialFeatures.js
│   │
│   ├── utils/                         # Helper functions
│   │   └── pdfGenerator.js
│   │
│   ├── uploads/                       # Temporary file storage
│   │
│   ├── index.js                       # Main server file
│   ├── middleware.js                  # JWT authentication
│   ├── adminMiddleware.js             # Admin-only routes
│   ├── moderatorMiddleware.js         # Moderator-only routes
│   └── package.json                   # Dependencies
│
├── [Documentation Files]
│   ├── README.md                      # Project overview
│   ├── ARCHITECTURE.md                # System architecture
│   ├── QUICK_START.md                 # Getting started guide
│   ├── TESTING_GUIDE.md               # Testing instructions
│   ├── DEPLOYMENT_CHECKLIST.md        # Production setup
│   ├── PHASE_1_COMPLETE.md            # Backend Socket.IO
│   ├── PHASE_2_COMPLETE.md            # Frontend integration
│   ├── PHASE_3_COMPLETE.md            # Enhanced features
│   └── RENAME_INSTRUCTIONS.md         # Directory rename guide
│
└── [Configuration Files]
    ├── .gitignore
    └── .env.production                # Production env vars
```

---

## 🚀 Development Workflow

### Local Development

**Prerequisites:**

- Node.js 20.x
- MongoDB (local or Atlas)
- Google OAuth credentials
- Gemini API key

**Setup:**

1. **Clone repository**

   ```powershell
   cd "k:\IIT BOMBAY\QuizWise-AI-Full-Stack"
   ```

2. **Backend setup**

   ```powershell
   cd backend
   npm install

   # Create .env file
   echo "MONGODB_URI=your-mongodb-uri" > .env
   echo "JWT_SECRET=your-secret" >> .env
   echo "GEMINI_API_KEY=your-key" >> .env
   echo "GOOGLE_CLIENT_ID=your-google-client-id" >> .env
   echo "GOOGLE_CLIENT_SECRET=your-google-secret" >> .env

   # Start server
   node index.js
   ```

3. **Frontend setup**

   ```powershell
   cd ../frontend
   npm install

   # Create .env file
   echo "VITE_API_URL=http://localhost:3001" > .env
   echo "VITE_SOCKET_URL=http://localhost:3001" >> .env
   echo "VITE_GOOGLE_CLIENT_ID=your-google-client-id" >> .env

   # Start dev server
   npm run dev
   ```

4. **Access application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

### Testing Scenarios

**1. User Authentication**

- Sign up → Verify email → Login
- Google OAuth login
- Role-based dashboard access

**2. Quiz Creation (Teacher)**

- AI topic generation: "Quantum Physics" → 10 questions
- AI file generation: Upload PDF → Generate quiz
- Manual creation: Add questions step-by-step

**3. Quiz Taking (Student)**

- Browse library → Select quiz → Take quiz
- View results → Check leaderboard
- Track achievement progress

**4. Live Multiplayer**

- Teacher: Host session → Share code
- Students: Join with code → Answer questions
- Real-time leaderboard updates
- Final rankings

**5. AI Doubt Solver**

- Ask: "Explain photosynthesis"
- Receive detailed explanation
- Follow-up questions

---

## 🌐 Deployment Architecture

### Production URLs

- **Frontend**: https://quiz-wise-ai-full-stack.vercel.app
- **Backend**: https://quizwise-ai-server.onrender.com
- **Custom Domain**: https://www.quizwise-ai.live

### Hosting Stack

**Frontend (Vercel)**

- Auto-deploys from `main` branch
- Environment variables:
  - `VITE_API_URL`
  - `VITE_GOOGLE_CLIENT_ID`
- Build command: `npm install --legacy-peer-deps && npm run build`

**Backend (Render)**

- Manual deploy or GitHub integration
- Environment variables:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `GEMINI_API_KEY`
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `NODE_ENV=production`
- Start command: `node index.js`

**Database (MongoDB Atlas)**

- Cloud-hosted MongoDB
- Auto-scaling
- Daily backups

---

## 🔒 Security Considerations

**Implemented:**

- ✅ Password hashing (bcryptjs)
- ✅ JWT token authentication
- ✅ CORS configuration
- ✅ Input validation
- ✅ MongoDB injection prevention (Mongoose)
- ✅ Google OAuth secure flow

**Recommendations for Scale:**

- Rate limiting (express-rate-limit)
- CAPTCHA on registration
- Session expiration policies
- HTTPS enforcement
- API request throttling

---

## 📊 Performance Metrics

**Current Capacity:**

- Tested: 5 concurrent live sessions
- Target: 100+ concurrent users
- Database: Indexed queries (<50ms)
- WebSocket latency: <100ms

**Optimization:**

- In-memory session state (fast lookups)
- Socket.IO rooms (targeted broadcasts)
- MongoDB indexes (sessionCode, userId)
- Vite build optimization (tree-shaking, minification)

---

## 🎓 Educational Impact

**Benefits:**

- **Students**: Engaging, gamified learning experience
- **Teachers**: Time-saving AI quiz generation
- **Institutions**: Scalable assessment platform
- **Everyone**: 24/7 AI tutoring support

**Use Cases:**

- Classroom assessments
- Remote learning
- Corporate training
- Hackathon/event quizzes
- Study group competitions

---

## 🛠️ Future Enhancements (Roadmap)

### Phase 4 (Planned)

- [ ] Voice-based questions (speech recognition)
- [ ] Image-based questions
- [ ] Adaptive difficulty (ML-based)
- [ ] In-session chat
- [ ] Co-host support
- [ ] Session recordings/replays

### Long-term

- [ ] Mobile app (React Native)
- [ ] Blockchain certificates
- [ ] Integration with LMS (Moodle, Canvas)
- [ ] Multi-language support
- [ ] Offline mode
- [ ] Advanced analytics (Tableau integration)

---

## 🤝 Development Team

**Built by**: [Your Name/Team Name]  
**For**: UpSkill India Challenge (HCL GUVI x IIT Bombay)  
**Timeline**: [Start Date] - [End Date]  
**Status**: ✅ Production Ready

---

## 📞 Support & Resources

**Documentation:**

- Quick Start: `QUICK_START.md`
- Testing Guide: `TESTING_GUIDE.md`
- Deployment: `DEPLOYMENT_CHECKLIST.md`
- Architecture: `ARCHITECTURE.md`

**Contact:**

- GitHub Issues: [Repository URL]
- Email: [Support Email]

---

**Last Updated**: November 7, 2025  
**Version**: 1.0.0  
**License**: [Your License]
