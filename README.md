# 🧠 Cognito Learning Hub

<div align="center">

**Intelligence Meets Interaction**

[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/amitesh-7/Cognito_Learning_Hub)
[![IIT Bombay Techfest 2025](https://img.shields.io/badge/IIT%20Bombay-Techfest%202025-blue.svg)](https://techfest.org)
[![Node.js](https://img.shields.io/badge/Node.js-20.19.4-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://mongodb.com)

_An AI-powered educational platform with microservices architecture_

**Made by team OPTIMISTIC MUTANT CODERS** 🚀

[Features](#-key-features) • [Architecture](#-architecture) • [Tech Stack](#️-tech-stack) • [Getting Started](#-getting-started)

</div>

---

## 📖 Overview

Cognito Learning Hub is a scalable, microservices-based AI-powered educational platform that transforms learning through intelligent quiz generation, real-time multiplayer capabilities, gamification, and adaptive learning experiences.

### 🎯 Core Philosophy

- **Microservices Architecture**: Scalable, independent services with API Gateway
- **AI-First**: Google Gemini AI for quiz generation and intelligent tutoring
- **Real-Time**: WebSocket-based live quiz sessions, duels, and video meetings
- **Gamified**: Achievements, leaderboards, streaks, and social features
- **Accessible**: Speech-based questions and inclusive design
- **Modern UI**: Glassmorphism, smooth animations, and responsive design
- **Production-Ready**: Redis caching, Bull queues, comprehensive testing

---

## 🏗️ Architecture

### Microservices Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│                    Port: 5173 (Vite)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway (Express)                      │
│                      Port: 3000                              │
│  • Request routing & proxying                               │
│  • Rate limiting & CORS                                     │
│  • Authentication middleware                                │
└───┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────────────┘
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

| Service                  | Port | Responsibilities                                     |
| ------------------------ | ---- | ---------------------------------------------------- |
| **API Gateway**          | 3000 | Request routing, rate limiting, CORS, authentication |
| **Auth Service**         | 3001 | User authentication, JWT tokens, role management     |
| **Quiz Service**         | 3002 | Quiz CRUD, AI generation, file upload parsing        |
| **Result Service**       | 3003 | Result submission, analytics, leaderboards           |
| **Live Service**         | 3004 | Real-time quiz sessions, Socket.IO, duels            |
| **Social Service**       | 3006 | Friends, chat, notifications, social features        |
| **Gamification Service** | 3007 | XP, levels, achievements, streaks, badges            |
| **Moderation Service**   | 3008 | Content moderation, reports, flagging                |
| **Meeting Service**      | 3009 | WebRTC video meetings, peer connections              |

### Shared Infrastructure

- **MongoDB Atlas**: Shared database with service-specific collections
- **Redis Cloud**: Distributed caching, session management, Bull queues
- **Bull Queues**: Background jobs (achievement checks, stats sync)
- **Socket.IO**: Real-time events across services

---

## 🌟 Key Features

### 👥 User Roles

- **🎓 Student**: Take quizzes, track progress, earn achievements, social features
- **👨‍🏫 Teacher**: Create quizzes, AI generation, analytics, live sessions
- **🛡️ Moderator**: Content moderation, quiz review, safety management
- **⚡ Admin**: Platform management, user administration, system analytics

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
   - WebRTC peer-to-peer video
   - Multi-participant support
   - Screen sharing capability

### 🏆 Gamification

- **XP System**: Earn experience points for activities
- **Levels**: Progress through 50+ levels
- **Achievements**: 15+ unlockable achievements
- **Streaks**: Daily quiz streaks
- **Leaderboards**: Global, weekly, category-based
- **Badges**: Collect rare and milestone badges

### 📊 Analytics & Dashboard

- Personal performance tracking
- Quiz history with detailed results
- Strength/weakness analysis
- Progress visualization
- Time spent analytics

---

## 🛠️ Tech Stack

### Frontend

- **React 18.3.1**: UI framework
- **Vite**: Build tool
- **TailwindCSS**: Utility-first CSS
- **Framer Motion**: Animations
- **Socket.IO Client**: Real-time communication
- **Axios**: HTTP client
- **React Router**: Navigation

### Backend Services

- **Node.js 20.19.4**: Runtime
- **Express.js**: Web framework
- **Socket.IO**: WebSocket server
- **JWT**: Authentication
- **Bull**: Job queues
- **Multer**: File uploads
- **Winston**: Logging

### Databases & Caching

- **MongoDB Atlas**: Primary database
- **Mongoose**: ODM
- **Redis Cloud**: Caching & sessions
- **IORedis**: Redis client

### AI & External Services

- **Google Gemini AI**: Quiz generation & tutoring
- **PDF.js**: PDF parsing
- **Mammoth.js**: DOCX parsing
- **Web Speech API**: Text-to-speech

### DevOps & Testing

- **Vitest**: Testing framework
- **Jest**: Backend testing
- **Nodemon**: Development
- **dotenv**: Environment variables

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19.4+
- MongoDB Atlas account
- Redis Cloud account
- Google Gemini API key

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/amitesh-7/Cognito_Learning_Hub.git
cd Cognito_Learning_Hub
```

2. **Install dependencies**

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install microservices dependencies
cd ../microservices
npm install
cd api-gateway && npm install && cd ..
cd auth-service && npm install && cd ..
cd quiz-service && npm install && cd ..
cd result-service && npm install && cd ..
cd live-service && npm install && cd ..
cd social-service && npm install && cd ..
cd gamification-service && npm install && cd ..
cd moderation-service && npm install && cd ..
cd meeting-service && npm install && cd ..
cd shared && npm install && cd ..
```

3. **Configure environment variables**

Create `.env` files in each service:

**Frontend** (`frontend/.env`):

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
VITE_GEMINI_API_KEY=your_gemini_api_key
```

**API Gateway** (`microservices/api-gateway/.env`):

```env
GATEWAY_PORT=3000
MONGO_URI=your_mongodb_atlas_uri
REDIS_URL=your_redis_cloud_url
JWT_SECRET=your_jwt_secret
FRONTEND_URLS=http://localhost:5173
AUTH_SERVICE_URL=http://localhost:3001
QUIZ_SERVICE_URL=http://localhost:3002
RESULT_SERVICE_URL=http://localhost:3003
LIVE_SERVICE_URL=http://localhost:3004
SOCIAL_SERVICE_URL=http://localhost:3006
GAMIFICATION_SERVICE_URL=http://localhost:3007
MODERATION_SERVICE_URL=http://localhost:3008
MEETING_SERVICE_URL=http://localhost:3009
```

**Each Microservice** (`microservices/[service-name]/.env`):

```env
PORT=[service-port]
MONGO_URI=your_mongodb_atlas_uri
REDIS_URL=your_redis_cloud_url
JWT_SECRET=your_jwt_secret
```

4. **Start the services**

```bash
# Terminal 1: Frontend
cd frontend
npm run dev

# Terminal 2: API Gateway
cd microservices/api-gateway
node index.js

# Terminal 3-10: Individual Services
cd microservices/auth-service && node index.js
cd microservices/quiz-service && node index.js
cd microservices/result-service && node index.js
cd microservices/live-service && node index.js
cd microservices/social-service && node index.js
cd microservices/gamification-service && node src/index.js
cd microservices/moderation-service && node index.js
cd microservices/meeting-service && node index.js
```

5. **Access the application**

- Frontend: http://localhost:5173
- API Gateway: http://localhost:3000
- Individual services: http://localhost:[service-port]

---

## 📁 Project Structure

```
Cognito-Learning-Hub/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context providers
│   │   ├── services/        # API service functions
│   │   ├── utils/           # Utility functions
│   │   └── main.jsx         # Application entry point
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                 # Legacy monolithic backend (deprecated)
│   ├── models/              # Mongoose models
│   ├── utils/               # Utility functions
│   └── index.js
│
├── microservices/           # Microservices architecture
│   ├── api-gateway/         # API Gateway (Port 3000)
│   │   ├── index.js         # Gateway server
│   │   └── .env
│   │
│   ├── auth-service/        # Authentication Service (Port 3001)
│   │   ├── index.js
│   │   ├── models/          # User models
│   │   └── routes/          # Auth routes
│   │
│   ├── quiz-service/        # Quiz Service (Port 3002)
│   │   ├── index.js
│   │   ├── models/          # Quiz models
│   │   ├── routes/          # Quiz routes
│   │   └── utils/           # AI generation, file parsing
│   │
│   ├── result-service/      # Result Service (Port 3003)
│   │   ├── index.js
│   │   ├── models/          # Result models
│   │   ├── routes/          # Result routes
│   │   └── services/        # Analytics, caching
│   │
│   ├── live-service/        # Live Quiz Service (Port 3004)
│   │   ├── index.js
│   │   ├── models/          # Session models
│   │   └── sockets/         # Socket.IO handlers
│   │
│   ├── social-service/      # Social Service (Port 3006)
│   │   ├── index.js
│   │   ├── models/          # Friend, chat models
│   │   └── routes/          # Social routes
│   │
│   ├── gamification-service/ # Gamification Service (Port 3007)
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── models/      # Achievement, stats models
│   │   │   ├── services/    # XP, achievement logic
│   │   │   ├── routes/      # Gamification routes
│   │   │   └── config/      # Redis, Bull queue config
│   │   └── .env
│   │
│   ├── moderation-service/  # Moderation Service (Port 3008)
│   │   ├── index.js
│   │   ├── models/          # Report models
│   │   └── routes/          # Moderation routes
│   │
│   ├── meeting-service/     # Meeting Service (Port 3009)
│   │   ├── index.js
│   │   ├── models/          # Meeting models
│   │   └── sockets/         # WebRTC signaling
│   │
│   └── shared/              # Shared utilities across services
│       ├── middleware/      # Auth, validation, error handling
│       ├── utils/           # Logger, response formatter
│       └── config/          # Common configurations
│
├── cognito_learning_hub_app/ # Flutter mobile app (optional)
│   └── lib/
│
└── README.md                # This file
```

---

## 🔐 Authentication Flow

1. User registers/logs in via Auth Service (3001)
2. Auth Service generates JWT token
3. Frontend stores token in localStorage
4. All requests include `x-auth-token` header
5. API Gateway validates token before routing
6. Services decode token to get user info

---

## 📊 Database Schema

### Collections

- **users**: User accounts and profiles
- **quizzes**: Quiz definitions and questions
- **results**: Quiz submission results
- **livesessions**: Real-time quiz sessions
- **userstats**: Gamification statistics
- **achievements**: Achievement definitions
- **userachievements**: User achievement unlocks
- **friends**: Friend connections
- **messages**: Chat messages
- **reports**: Content moderation reports
- **meetings**: Video meeting sessions

---

## 🎯 API Gateway Routes

| Route                 | Service              | Description                    |
| --------------------- | -------------------- | ------------------------------ |
| `/api/auth/*`         | Auth Service         | Authentication endpoints       |
| `/api/quizzes/*`      | Quiz Service         | Quiz CRUD operations           |
| `/api/results/*`      | Result Service       | Result submission & analytics  |
| `/api/live/*`         | Live Service         | Live quiz sessions             |
| `/api/social/*`       | Social Service       | Friend & chat features         |
| `/api/gamification/*` | Gamification Service | XP, achievements, leaderboards |
| `/api/moderation/*`   | Moderation Service   | Content moderation             |
| `/api/meetings/*`     | Meeting Service      | Video meetings                 |

---

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test

# Microservice tests
cd microservices/[service-name]
npm test
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is built for IIT Bombay Techfest 2025 by **OPTIMISTIC MUTANT CODERS**.

---

## 👥 Team

**OPTIMISTIC MUTANT CODERS**

- Lead Developer & Architect
- Full-Stack Development
- Microservices Design
- AI Integration

---

## 📞 Contact

For questions or support, please reach out through:

- GitHub Issues
- Project Repository: [Cognito Learning Hub](https://github.com/amitesh-7/Cognito_Learning_Hub)

---

<div align="center">

**Made with ❤️ for IIT Bombay Techfest 2025**

_Intelligence Meets Interaction_

</div>
