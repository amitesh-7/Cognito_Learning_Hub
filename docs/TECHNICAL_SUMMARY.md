# 🧠 Cognito Learning Hub - Technical Summary

**Intelligence Meets Interaction — AI-Powered Educational Platform**

**Team: OPTIMISTIC MUTANT CODERS**  
**IIT Bombay Techfest 2025**

---

## 🎯 1. Problem Statement

Traditional educational platforms lack intelligent personalization, real-time engagement, and meaningful gamification. Students face fragmented learning experiences with static quizzes, no social interaction, and minimal feedback on performance. Teachers struggle with manual quiz creation and lack tools for live, interactive sessions.

### Our Solution

An AI-powered microservices platform that transforms learning through intelligent quiz generation, real-time multiplayer sessions, comprehensive gamification, and video collaboration — all unified under one seamless experience.

---

## 🤖 2. Approach & AI Components

### 2.1 AI-Powered Quiz Generation

Leveraging **Google Gemini AI** for intelligent content creation. Teachers input a topic or upload documents (PDF/DOCX/TXT), and our system generates contextually relevant, difficulty-calibrated questions with explanations.

- **Topic-Based Generation:** Natural language topic → structured quiz with multiple difficulty levels
- **Document Parsing:** Extract key concepts from uploaded materials using PDF.js and Mammoth.js
- **Adaptive Difficulty:** AI adjusts question complexity based on user performance history

### 2.2 AI Study Buddy

An intelligent tutoring assistant that provides real-time explanations, study tips, and personalized guidance. Uses conversational AI to answer student queries contextually.

### 2.3 Smart Analytics

- Performance pattern recognition for strength/weakness analysis
- Personalized quiz recommendations based on learning gaps
- Predictive insights for optimal study scheduling

---

## 🏗️ 3. Technical Architecture

### 3.1 Microservices Architecture (9 Services)

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
│                    Port: 5173 (Vite)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway (Express)                     │
│                      Port: 3000                             │
│  • Request routing & proxying                               │
│  • Rate limiting & CORS                                     │
│  • Authentication middleware                                │
└───┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬───────────────┘
    │     │     │     │     │     │     │     │
    ▼     ▼     ▼     ▼     ▼     ▼     ▼     ▼
┌───────┐┌───────┐┌───────┐┌───────┐┌───────┐┌───────┐┌───────┐┌───────┐
│ Auth  ││ Quiz  ││Result ││ Live  ││Meeting││Social ││ Gamif ││ Mod   │
│Service││Service││Service││Service││Service││Service││Service││Service│
│ 3001  ││ 3002  ││ 3003  ││ 3004  ││ 3009  ││ 3006  ││ 3007  ││ 3008  │
└───┬───┘└───┬───┘└───┬───┘└───┬───┘└───┬───┘└───┬───┘└───┬───┘└───┬───┘
    │        │        │        │        │        │        │        │
    └────────┴────────┴────────┴────────┴────────┴────────┴────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                    ┌────▼─────┐         ┌────▼─────┐
                    │ MongoDB  │         │  Redis   │
                    │  Atlas   │         │  Cloud   │
                    └──────────┘         └──────────┘
```

### Service Responsibilities

| Service | Port | Responsibilities |
|---------|------|------------------|
| **API Gateway** | 3000 | Request routing, rate limiting, CORS, authentication |
| **Auth Service** | 3001 | User authentication, JWT tokens, role management |
| **Quiz Service** | 3002 | Quiz CRUD, AI generation, file upload parsing |
| **Result Service** | 3003 | Result submission, analytics, leaderboards |
| **Live Service** | 3004 | Real-time quiz sessions, Socket.IO, duels |
| **Social Service** | 3006 | Friends, chat, notifications, social features |
| **Gamification Service** | 3007 | XP, levels, achievements, streaks, badges, avatars |
| **Moderation Service** | 3008 | Content moderation, reports, flagging |
| **Meeting Service** | 3009 | WebRTC video meetings, peer connections |

### 3.2 Technology Stack

**Core Technologies:**
- React 18
- Node.js 20
- MongoDB Atlas
- Redis Cloud
- Google Gemini AI

**Backend:**
- Express.js
- Socket.IO
- Bull Queues
- JWT Auth
- MediaSoup SFU

**Frontend:**
- TailwindCSS
- Framer Motion
- Vite

---

## ⚠️ 4. Challenges & Mitigations

| Challenge | Impact | Mitigation |
|-----------|--------|------------|
| **Real-time Synchronization** | Live quizzes require sub-100ms latency for fair competition | Socket.IO with Redis pub/sub for cross-instance sync; optimistic UI updates |
| **AI Response Quality** | Generated questions may have errors or poor formatting | Structured prompts with validation; teacher review workflow; feedback loop |
| **Video Scalability** | WebRTC mesh fails beyond 4-5 participants | MediaSoup SFU architecture with multi-worker support; TURN fallback |
| **Database Performance** | Complex analytics queries slow down with scale | Redis caching layer; pre-computed aggregations; indexed queries |
| **Microservices Complexity** | Distributed system debugging and consistency | Centralized logging (Winston); shared error handling; Bull job queues |
| **NAT Traversal (WebRTC)** | Users behind strict NATs can't establish connections | STUN servers (Google); TURN relay configuration; announced IP setup |

---

## 🚀 5. Roadmap to Final Build

### Phase 1 ✓ - Core Platform (Completed)
- Microservices architecture
- Auth, Quiz CRUD, AI generation
- Result analytics
- Basic gamification

### Phase 2 ✓ - Real-time Features (Completed)
- Live quiz sessions
- 1v1 duels
- Socket.IO integration
- Leaderboards
- Social features

### Phase 3 ✓ - Video Conferencing (Completed)
- MediaSoup SFU implementation
- Multi-participant rooms
- Screen sharing
- In-meeting chat

### Phase 4 - Advanced AI (In Progress)
- Adaptive difficulty engine
- Personalized learning paths
- Performance predictions
- Voice-based questions

### Phase 5 - Mobile & Polish (Planned)
- Flutter mobile app
- Push notifications
- Offline mode
- Performance optimization
- Accessibility

---

## 🌐 6. Deployment

| Component | URL |
|-----------|-----|
| **Frontend** | https://cognito-learning-hub.vercel.app |
| **API Gateway** | https://api-gateway-kzo9.onrender.com |
| **GitHub** | https://github.com/amitesh-7/Cognito_Learning_Hub |

---

## 🔑 7. Test Credentials

For testing and evaluation purposes:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@cognito.com | Admin@123 |
| **Teacher** | teacher@cognito.com | Teacher@123 |
| **Student** | student@cognito.com | Student@123 |

---

## ✨ 8. Key Differentiators

- **AI-First Design:** Not an afterthought — AI powers core functionality
- **True Microservices:** 9 independent, scalable services
- **Real Gamification:** 15+ achievements, 50 levels, quests, streaks
- **Production-Ready:** Redis caching, job queues, error handling
- **Video at Scale:** MediaSoup SFU, not peer-to-peer mesh
- **Modern UX:** Glassmorphism, smooth animations, responsive

---

## 🌟 9. Key Features

### 👥 User Roles

- **🎓 Student:** Take quizzes, track progress, earn achievements, social features
- **👨‍🏫 Teacher:** Create quizzes, AI generation, analytics, live sessions
- **🛡️ Moderator:** Content moderation, quiz review, safety management
- **⚡ Admin:** Platform management, user administration, system analytics

### 🤖 AI-Powered Features

1. **Quiz Generation**
   - Topic-based generation with Google Gemini AI
   - File upload parsing (PDF, TXT, DOCX)
   - Customizable difficulty and question count

2. **AI Tutor**
   - Real-time chat-based learning assistant
   - Context-aware explanations
   - Study guidance and tips

3. **Adaptive Difficulty**
   - Performance-based recommendations
   - Dynamic question difficulty
   - Personalized learning paths

### 🎮 Multiplayer & Live Features

1. **Live Quiz Sessions**
   - Real-time multiplayer quizzes
   - Synchronized questions
   - Live leaderboards

2. **1v1 Duels**
   - Quick matchmaking system
   - Real-time score tracking
   - Winner determination

3. **Video Meetings**
   - MediaSoup SFU video conferencing
   - Multi-participant support
   - Screen sharing capability

### 🏆 Gamification

- **XP & Levels:** Progress through 50+ levels
- **Achievements:** 15+ unlockable achievements
- **Streaks & Badges:** Daily engagement rewards
- **Quests:** Daily and weekly challenges (1400+ quests across 14 realms)

---

## 👥 10. Team

**Team OPTIMISTIC MUTANT CODERS** — Passionate developers building the future of education technology. Combining expertise in AI, distributed systems, and user experience to create an impactful learning platform.

- Amitesh Vishwakarma (amitesh-7)
- Rakshita (neely941565-ops)
- Priyanshu Chaurasia (priyanshu-1006)
- Ritesh (riteshydv05)

---

## 📁 11. Project Structure

```
Cognito_Learning_Hub/
├── frontend/                 # React frontend application
├── microservices/
│   ├── api-gateway/         # Central API routing (Port 3000)
│   ├── auth-service/        # Authentication (Port 3001)
│   ├── quiz-service/        # Quiz management (Port 3002)
│   ├── result-service/      # Results & analytics (Port 3003)
│   ├── live-service/        # Real-time features (Port 3004)
│   ├── social-service/      # Social features (Port 3006)
│   ├── gamification-service/# XP & achievements (Port 3007)
│   ├── moderation-service/  # Content moderation (Port 3008)
│   ├── meeting-service/     # Video conferencing (Port 3009)
│   └── shared/              # Shared utilities
├── docs/                    # Documentation
└── README.md
```

---

## 📚 12. Documentation

| Document | Description |
|----------|-------------|
| [Architecture](ARCHITECTURE.md) | System design and service details |
| [API Reference](API_REFERENCE.md) | REST API endpoints documentation |
| [Setup Guide](SETUP_GUIDE.md) | Local development and deployment |
| [Meeting Deployment](MEETING_DEPLOYMENT.md) | Video service configuration |
| [Technical Summary](TECHNICAL_SUMMARY.html) | 2-page PDF summary (open in browser) |

---

## 📄 License

This project is developed for IIT Bombay Techfest 2025.

---

<div align="center">

**Made with ❤️ for IIT Bombay Techfest 2025**

_Intelligence Meets Interaction_

**Contact:** team@cognitolearninghub.com | December 2024

</div>
