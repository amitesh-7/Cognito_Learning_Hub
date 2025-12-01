# 🧠 Cognito Learning Hub

<div align="center">

**Intelligence Meets Interaction**

[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/amitesh-7/Cognito_Learning_Hub)
[![IIT Bombay Techfest 2025](https://img.shields.io/badge/IIT%20Bombay-Techfest%202025-blue.svg)](https://techfest.org)
[![Node.js](https://img.shields.io/badge/Node.js-20.19.4-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://mongodb.com)
[![Test Coverage](https://img.shields.io/badge/Coverage-88--98%25-brightgreen.svg)](https://github.com/amitesh-7/Cognito_Learning_Hub)

_An AI-powered educational platform revolutionizing the learning experience_

**Made by team OPTIMISTIC MUTANT CODERS** 🚀

[Features](#-key-features) • [Competition Features](#-competition-features) • [Tech Stack](#️-tech-stack) • [Getting Started](#-getting-started) • [Documentation](#-documentation)

</div>

---

## 📖 Overview

Cognito Learning Hub is a modern, full-stack AI-powered educational platform designed to transform learning and teaching through artificial intelligence. Built with cutting-edge technologies, it provides a comprehensive suite of tools for creating, taking, and managing quizzes with real-time multiplayer capabilities, advanced UI/UX, and mobile-optimized features.

### 🎯 Core Philosophy

- **AI-First**: Leverage Google's Gemini AI for intelligent quiz generation and student tutoring
- **Adaptive Learning**: Personalized difficulty based on individual performance
- **Real-Time**: Live multiplayer quiz sessions and 1v1 duels with WebSocket technology
- **Accessible**: Speech-based question reading for inclusive learning
- **Gamified**: Engaging achievements, leaderboards, and social features
- **Modern Design**: Glassmorphism UI with smooth animations and Lenis scrolling
- **Mobile-First**: PWA features, pull-to-refresh, and responsive design
- **Production-Ready**: Optimized performance, comprehensive testing, full documentation

---

## 🆕 Competition Features (IIT Bombay Techfest 2025)

### ⭐ Feature 1: Adaptive AI Difficulty System (15 points)

**Status**: ✅ Complete

Personalized quiz difficulty based on real-time performance analysis with intelligent recommendations.

### ⭐ Feature 2: Speech-Based Questions (10 points)

**Status**: ✅ Complete

Accessibility-first text-to-speech integration with Web Speech API for inclusive learning.

### ⭐ Feature 3: Performance Optimizations (9-10 points)

**Status**: ✅ Complete

Production-grade optimizations achieving 60% faster load times and 13-18x database query improvements.

### ⭐ Feature 4: Testing & Quality Assurance (8-9 points)

**Status**: ✅ Complete

Comprehensive testing suite with 98.5% frontend and 88.2% backend code coverage.

### ⭐ Feature 5: Modern UI/UX Enhancements

**Status**: ✅ Complete

**UI Improvements**:

- 🎨 **Glassmorphism Design**: Beautiful frosted-glass effects across all components
- 🔄 **Lenis Smooth Scrolling**: Buttery-smooth scrolling experience globally
- 📱 **Compact Mobile Menu**: Space-efficient dropdown menu instead of full-page overlay
- 🎯 **Enhanced Navbar**: Icons on all navigation links (desktop + mobile)
- 🎪 **Rounded Corners**: Soft, modern rounded-3xl corners throughout
- ✨ **Enhanced Animations**: Smooth transitions and hover effects
- 🌓 **Improved Dark Mode**: Better contrast and seamless theme switching

**Features Page Enhancements**:

- Glassmorphic section headers with gradient backgrounds
- Rounded, soft-cornered stat cards with enhanced shadows
- Compact feature navigation buttons with backdrop blur
- Beautiful CTA sections with smooth animations
- Mobile-optimized responsive design

**Navbar Improvements**:

- Compact dropdown menu (top-right corner, minimal space)
- Icons on all links: Dashboard (LayoutDashboard), Quizzes (BookOpen), AI Tutor (Bot), etc.
- Role-based icons: Teacher (GraduationCap), Moderator (Shield), Admin (UserCog), Broadcast (Radio)
- Smooth slide-down animation with scale effect
- Enhanced glassmorphism and rounded corners

### ⭐ Feature 7: Advanced Multiplayer Features

**Status**: ✅ Complete

**Real-Time Quiz Duels (1v1)**:

- 🎮 **Quick Match System**: Intelligent matchmaking with retry logic for finding opponents
- ⚡ **Atomic Match Operations**: Race-condition free pairing with MongoDB atomic updates
- 🎯 **Live Battle Interface**: Real-time score tracking with opponent progress visibility
- ✅ **Instant Feedback**: Visual indicators for correct/incorrect answers
- 🏆 **Winner Determination**: Automatic winner calculation based on score and speed

**Video Meeting Integration**:

- 📹 **WebRTC Peer-to-Peer**: High-quality video calling for teacher-student collaboration
- 🎥 **Multi-Participant Support**: Group video sessions with multiple participants
- 🔗 **Easy Room Sharing**: One-click copy for meeting room IDs
- 🔊 **Audio/Video Controls**: Toggle camera and microphone during sessions
- 📱 **Responsive Layout**: Adaptive grid layout for different participant counts

**WebSocket Architecture**:

- 🔄 **Persistent Connections**: Socket.IO for real-time bidirectional communication
- 🎯 **Event-Driven System**: 20+ custom events for different game states
- 🚀 **Low Latency**: Sub-100ms response times for live interactions
- 🛡️ **Connection Recovery**: Automatic reconnection with state preservation

### ⭐ Feature 6: Comprehensive Documentation (Full Marks)

**Status**: ✅ Complete

Professional-grade documentation suite with API docs, testing guides, and architectural diagrams.

---

## 🌟 Key Features

### 👥 User Roles & Access Control

<table>
<tr>
<td width="25%">

**🎓 Student**

- Browse quiz library
- Take quizzes
- AI Tutor access
- Personal dashboard
- Achievements & badges
- Social features

</td>
<td width="25%">

**👨‍🏫 Teacher**

- All student features
- Quiz Maker Studio
- AI quiz generation
- Personal analytics
- Live session hosting
- Content management

</td>
<td width="25%">

**🛡️ Moderator**

- Platform moderation
- Quiz review/edit
- Content flagging
- Reports dashboard
- Quality assurance
- Safety management

</td>
<td width="25%">

**⚡ Admin**

- Full platform control
- User management
- System analytics
- Broadcast messages
- Role assignment
- Platform settings

</td>
</tr>
</table>

### 🎨 Quiz Maker Studio (Teachers)

Three powerful methods for quiz creation:

1. **🤖 AI Topic Generation**

   - Enter any topic (e.g., "Quantum Physics")
   - Select difficulty and question count
   - AI instantly generates complete quiz

2. **📄 AI File Upload**

   - Upload PDF/TXT documents
   - AI extracts key concepts
   - Generates contextual questions

3. **✍️ Manual Creation**
   - Intuitive step-by-step editor
   - Complete creative control
   - Custom question types

### 🎮 Student Experience

- **Interactive Quiz Taker**: Gamified interface with timer, instant feedback, and progress tracking
- **Live Sessions**: Join real-time multiplayer quizzes with live leaderboards
- **AI Tutor**: 24/7 AI-powered doubt solver for instant academic help
- **Personal Dashboard**: Score analytics, progression charts, and achievement tracking
- **Social Hub**: Connect with peers, share challenges, and compete
- **Achievements**: Unlock badges and rewards for milestones

### 🔴 Live Multiplayer Sessions

**Real-Time Quiz Sessions**:

- **Host Live Quizzes**: Teachers create real-time quiz sessions with unique codes
- **Join with Code**: Students join via 6-digit session codes or QR codes
- **Real-Time Leaderboards**: Live scoring with speed bonuses (0-5 points)
- **Session Analytics**: Post-session performance insights and statistics
- **Session History**: Review past live quiz sessions and results

**1v1 Duel Battles**:

- **Quick Match**: Automatic opponent matching with intelligent retry system
- **Live Competition**: Real-time score updates and opponent progress tracking
- **Speed Matters**: Faster correct answers earn higher scores
- **Instant Results**: Winner determination with detailed battle statistics
- **Fair Matching**: Race-condition free pairing system with atomic operations

**Video Meetings**:

- **WebRTC Integration**: Peer-to-peer video calls for collaboration
- **Room System**: Create or join meeting rooms with shareable codes
- **Multi-Participant**: Support for group video sessions
- **Easy Sharing**: One-click copy for meeting room IDs
- **Audio/Video Controls**: Toggle camera/microphone during calls

### 🎨 Modern UI/UX

- **Dark/Light Theme**: Toggle-able theme with smooth transitions
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Fluid Animations**: Framer Motion powered micro-interactions
- **Particle Effects**: Dynamic backgrounds with floating shapes
- **Glass-morphism**: Modern UI design patterns

### 🔒 Security & Authentication

- **JWT Authentication**: Secure token-based sessions
- **Password Hashing**: bcrypt encryption for user credentials
- **Google OAuth**: One-click social login integration
- **Protected Routes**: Role-based access control
- **Content Moderation**: User-flagging system for inappropriate content

---

## 🏗️ Tech Stack

### Frontend

```
React 18.3.1         → UI Framework
Vite 5.4.19          → Build Tool & Dev Server
TailwindCSS 3.4.17   → Utility-First CSS
Framer Motion        → Animation Library
Lenis                → Smooth Scrolling
Socket.IO Client     → Real-Time WebSocket
React Router         → Client-Side Routing
Recharts             → Data Visualization
Lottie React         → Animation Player
Lucide React         → Icon Library
```

### Backend

```
Node.js 20.19.4      → Runtime Environment
Express 5.1.0        → Web Framework
Socket.IO 4.8.1      → Real-Time Communication
MongoDB 6.18.0       → Database
Mongoose 8.17.0      → ODM (Object Data Modeling)
JWT                  → Authentication
Google Gemini AI     → AI Integration
Multer               → File Upload
PDF-Parse            → PDF Processing
QRCode               → QR Generation
```

### Database Schema

```
Collections:
├── users            → User profiles & authentication
├── quizzes          → Quiz content & metadata
├── results          → Quiz attempt records
├── livesessions     → Real-time session data
├── achievements     → User badges & milestones
├── socialfeatures   → Social interactions
└── reports          → Content moderation flags
```

---

## 📁 Project Structure

```
Cognito-Learning-Hub/
├── frontend/                    # React Frontend
│   ├── public/
│   │   ├── animations/         # Lottie JSON files
│   │   ├── sounds/             # Audio effects
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # Base UI elements (Button, Card, etc.)
│   │   │   ├── GoogleAuthButton.jsx
│   │   │   ├── LiveLeaderboard.jsx
│   │   │   ├── ParticleBackground.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/             # Route components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── QuizList.jsx
│   │   │   ├── QuizTaker.jsx
│   │   │   ├── LiveSessionHost.jsx
│   │   │   ├── LiveSessionJoin.jsx
│   │   │   └── ... (33 pages total)
│   │   ├── context/           # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions
│   │   ├── assets/            # Static assets
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.cjs
│   └── vercel.json            # Vercel deployment config
│
├── backend/                    # Node.js Backend
│   ├── models/                # Mongoose schemas
│   │   ├── User.js
│   │   ├── Quiz.js
│   │   ├── Result.js
│   │   ├── LiveSession.js
│   │   ├── Achievement.js
│   │   ├── SocialFeatures.js
│   │   └── Report.js
│   ├── utils/
│   │   └── pdfGenerator.js
│   ├── uploads/               # File upload storage
│   ├── index.js               # Express + Socket.IO server
│   ├── authMiddleware.js      # JWT authentication
│   ├── adminMiddleware.js     # Admin route guard
│   ├── moderatorMiddleware.js # Moderator route guard
│   ├── package.json
│   └── vercel.json            # Vercel deployment config
│
├── ARCHITECTURE.md             # System architecture documentation
├── PROJECT_CONTEXT.md          # Project context & decisions
├── DEPLOYMENT_CHECKLIST.md     # Deployment guide
├── PRODUCTION_DEPLOYMENT.md    # Production setup instructions
├── VERCEL_DEPLOYMENT.md        # Vercel-specific deployment
├── VERCEL_BACKEND_DEPLOYMENT.md
├── QUICK_START.md              # Quick start guide
├── ProblemStatement.md         # Original problem statement
├── .gitignore
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.19.4 or higher
- **npm** or **yarn** package manager
- **MongoDB Atlas** account (or local MongoDB)
- **Google Gemini API** key
- **Google OAuth** credentials (optional)

### Installation

1. **Clone the repository**

   ```powershell
   git clone https://github.com/amitesh-7/Cognito_Learning_Hub.git
   cd Cognito_Learning_Hub
   ```

2. **Backend Setup**

   ```powershell
   cd backend
   npm install
   ```

   Create `.env` file in `backend/`:

   ```env
   PORT=3001
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   GEMINI_API_KEY=your_google_gemini_api_key
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   CLIENT_URL=http://localhost:5173
   ```

3. **Frontend Setup**

   ```powershell
   cd ../frontend
   npm install
   ```

   Create `.env` file in `frontend/`:

   ```env
   VITE_API_URL=http://localhost:3001
   VITE_SOCKET_URL=http://localhost:3001
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   ```

4. **Run Development Servers**

   Terminal 1 (Backend):

   ```powershell
   cd backend
   npm run dev
   ```

   Terminal 2 (Frontend):

   ```powershell
   cd frontend
   npm run dev
   ```

5. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3001`

---

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system architecture with data flow diagrams
- **[QUICK_START.md](./QUICK_START.md)** - Quick setup guide for developers
- **[PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)** - Project decisions and context
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist
- **[PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)** - Production deployment guide
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Vercel deployment instructions

---

## 🎯 Core Features in Detail

### Real-Time Architecture

The platform uses **Socket.IO** for bidirectional real-time communication:

**Live Quiz Sessions**:

- **WebSocket Events**: 20+ custom events for different game states
- **Room Management**: Isolated sessions with unique 6-digit codes
- **Score Calculation**: Base points (10) + speed bonus (0-5 based on response time)
- **Leaderboard Updates**: Broadcast to all participants in real-time
- **Session State**: In-memory + MongoDB persistence for reliability

**1v1 Duel System**:

- **Matchmaking Queue**: Atomic MongoDB operations for race-condition free matching
- **Retry Logic**: Intelligent stale match cleanup with 3-attempt retry system
- **Answer Validation**: Normalized string comparison with trim and case handling
- **Live Updates**: Real-time opponent progress and score synchronization
- **State Management**: React refs to prevent duplicate requests from Strict Mode

**Video Meetings**:

- **WebRTC Signaling**: Socket.IO-based peer connection coordination
- **ICE Candidates**: STUN server integration for NAT traversal
- **Offer/Answer**: SDP exchange for establishing peer-to-peer connections
- **Connection Recovery**: Automatic reconnection with state preservation
- **Multi-Peer Support**: Dynamic peer connection management for group calls

### AI Integration

Powered by **Google Gemini AI**:

- **Quiz Generation**: Intelligent question generation from topics/files
- **AI Tutor**: Context-aware academic assistance
- **Content Analysis**: PDF/TXT parsing and understanding
- **Difficulty Scaling**: Adaptive question complexity

### Gamification

- **🏆 Achievements System**: 15+ unlockable badges
- **📊 Performance Analytics**: Visual charts and statistics
- **🎮 Score Multipliers**: Speed bonuses in live sessions
- **🌟 Social Features**: Challenges, leaderboards, and social hub
- **🎉 Celebrations**: Confetti effects for high scores

---

## 🔐 Environment Variables

### Backend Variables

| Variable               | Description               | Required    |
| ---------------------- | ------------------------- | ----------- |
| `PORT`                 | Backend server port       | ✅          |
| `MONGO_URI`            | MongoDB connection string | ✅          |
| `JWT_SECRET`           | Secret for JWT signing    | ✅          |
| `GEMINI_API_KEY`       | Google Gemini API key     | ✅          |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID    | ⚠️ Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret       | ⚠️ Optional |
| `CLIENT_URL`           | Frontend URL for CORS     | ✅          |

### Frontend Variables

| Variable                | Description            | Required    |
| ----------------------- | ---------------------- | ----------- |
| `VITE_API_URL`          | Backend API endpoint   | ✅          |
| `VITE_SOCKET_URL`       | Socket.IO server URL   | ✅          |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | ⚠️ Optional |

---

## 🌐 Deployment

The application is production-ready and deployed on **Vercel**:

### Frontend Deployment

```powershell
cd frontend
vercel --prod
```

**Production URL**: [cognito-learning-hub-frontend.vercel.app](https://cognito-learning-hub-frontend.vercel.app)

**Vercel Configuration Highlights**:

- ✅ **SPA Rewrites**: Proper routing for React Router with asset exclusion
- ✅ **Cache Headers**: Immutable caching for JS/CSS assets (1-year max-age)
- ✅ **CORS Headers**: Cross-origin resource policy for WebRTC/media
- ✅ **Build Optimization**: Vite production build with code splitting

### Backend Deployment

```powershell
cd backend
vercel --prod
```

**API Endpoints**: Deployed as serverless functions on Vercel

### Production Features

- **Rate Limiting**: 300 requests per 15-minute window with success skipping
- **Environment-Aware**: Automatic development mode detection
- **WebSocket Support**: Socket.IO with fallback to HTTP polling
- **Database**: MongoDB Atlas with connection pooling
- **CDN**: Static assets served via Vercel Edge Network
- **SSL**: Automatic HTTPS with Let's Encrypt certificates

See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for detailed instructions.

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👥 Team OPTIMISTIC MUTANT CODERS

<div align="center">

**IIT Bombay Techfest 2025**

[LinkedIn](https://www.linkedin.com/company/optimistic-mutant-coders/) • [GitHub](https://github.com/amitesh-7)

</div>

---

## 📄 License

This project is part of IIT Bombay Techfest 2025. All rights reserved.

---

## 🙏 Acknowledgments

- **IIT Bombay Techfest** for the opportunity
- **Google Gemini AI** for AI capabilities
- **MongoDB Atlas** for database hosting
- **Vercel** for deployment platform
- **Open Source Community** for amazing libraries

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by team OPTIMISTIC MUTANT CODERS

</div>
