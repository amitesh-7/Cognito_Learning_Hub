# 🧠 Cognito Learning Hub

<div align="center">

**Intelligence Meets Interaction**

[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/amitesh-7/Cognito_Learning_Hub)
[![IIT Bombay Techfest 2025](https://img.shields.io/badge/IIT%20Bombay-Techfest%202025-blue.svg)](https://techfest.org)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://mongodb.com)

_An AI-powered educational platform with microservices architecture_

**Team: OPTIMISTIC MUTANT CODERS** 🚀

[Live Demo](#-deployment) • [Features](#-key-features) • [Architecture](#-architecture) • [Documentation](#-documentation)

</div>

---

## 🌐 Deployment

| Component       | URL                                               |
| --------------- | ------------------------------------------------- |
| **Frontend**    | https://cognito-learning-hub.vercel.app           |
| **API Gateway** | https://cognito-api.onrender.com                  |
| **GitHub**      | https://github.com/amitesh-7/Cognito_Learning_Hub |

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

| Service                  | Port | Responsibilities                                     |
| ------------------------ | ---- | ---------------------------------------------------- |
| **API Gateway**          | 3000 | Request routing, rate limiting, CORS, authentication |
| **Auth Service**         | 3001 | User authentication, JWT tokens, role management     |
| **Quiz Service**         | 3002 | Quiz CRUD, AI generation, file upload parsing        |
| **Result Service**       | 3003 | Result submission, analytics, leaderboards           |
| **Live Service**         | 3004 | Real-time quiz sessions, Socket.IO, duels            |
| **Social Service**       | 3006 | Friends, challenges, chat, notifications, duels      |
| **Gamification Service** | 3007 | XP, levels, achievements, streaks, badges, challenges|
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
   - MediaSoup SFU video conferencing
   - Multi-participant support
   - Screen sharing capability

### 🏆 Gamification

- **XP & Levels**: Progress through 50+ levels
- **Achievements**: 15+ unlockable achievements
- **Streaks & Badges**: Daily engagement rewards
- **Quests**: Daily and weekly challenges

### 👥 Social Hub & Friend System

1. **Friend Management**
   - Search users by name or email
   - Send/accept/decline friend requests
   - Real-time online status indicators
   - Friends list with quick actions

2. **1v1 Friend Duel Challenges**
   - Challenge any friend to a quiz duel
   - Quiz selection modal with categories
   - Real-time duel matchmaking
   - Winner/loser determination

3. **Notifications Center**
   - Friend request notifications with inline actions
   - Challenge received/accepted alerts
   - Achievement unlock notifications
   - Real-time unread count badge

4. **Social Dashboard**
   - Glassmorphism UI with dark/light mode
   - Animated components with Framer Motion
   - Responsive design for all devices
   - Tab-based navigation (Friends/Duels/Alerts)

### 🎨 Modern UI/UX Design

- **Theme System**: Global dark/light mode with ThemeContext
- **Glassmorphism**: Backdrop blur, transparency effects
- **Smooth Animations**: Framer Motion powered transitions
- **Responsive**: Mobile-first adaptive layouts
- **Accessibility**: ARIA labels, keyboard navigation

---

## 🛠️ Tech Stack

| Category     | Technologies                                                    |
| ------------ | --------------------------------------------------------------- |
| **Frontend** | React 18, Vite, TailwindCSS, Framer Motion, Socket.IO, ThemeCtx |
| **Backend**  | Node.js 20, Express.js, Socket.IO, Bull Queues                  |
| **Database** | MongoDB Atlas, Redis Cloud                                      |
| **AI**       | Google Gemini API                                               |
| **Video**    | MediaSoup SFU, WebRTC                                           |
| **Auth**     | JWT, Google OAuth 2.0                                           |
| **UI/UX**    | Glassmorphism, Lucide Icons, CSS Animations                     |

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/amitesh-7/Cognito_Learning_Hub.git
cd Cognito_Learning_Hub

# Install & run frontend
cd frontend && npm install && npm run dev

# Install & run microservices (each in separate terminal)
cd microservices/api-gateway && npm install && npm start
# Repeat for other services...
```

See [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) for detailed instructions.

---

## � Test Credentials (IIT Bombay Techfest)

For testing purposes, use the following pre-configured accounts:

| Role        | Email                  | Password      |
| ----------- | ---------------------- | ------------- |
| **Admin**   | admin@cognito.com      | Admin@123     |
| **Teacher** | teacher@cognito.com    | Teacher@123   |
| **Student** | student@cognito.com    | Student@123   |

> ⚠️ **Note**: These are demo credentials for evaluation purposes only.

---

## �📚 Documentation

| Document                                         | Description                          |
| ------------------------------------------------ | ------------------------------------ |
| [Architecture](docs/ARCHITECTURE.md)             | System design and service details    |
| [API Reference](docs/API_REFERENCE.md)           | REST API endpoints documentation     |
| [Setup Guide](docs/SETUP_GUIDE.md)               | Local development and deployment     |
| [Accessibility Guide](docs/ACCESSIBILITY_GUIDE.md)| Inclusive design implementation     |
| [Quiz Accessibility](docs/QUIZ_ACCESSIBILITY_GUIDE.md)| Speech-based quiz features      |
| [Technical Summary](docs/TECHNICAL_SUMMARY.html) | 2-page PDF summary (open in browser) |

---

## 📁 Project Structure

```
Cognito_Learning_Hub/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React Context (Auth, Theme)
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page components
│   │   └── services/        # API service layers
│   └── public/              # Static assets
├── microservices/
│   ├── api-gateway/         # Central API routing (Port 3000)
│   ├── auth-service/        # Authentication (Port 3001)
│   ├── quiz-service/        # Quiz management (Port 3002)
│   ├── result-service/      # Results & analytics (Port 3003)
│   ├── live-service/        # Real-time features (Port 3004)
│   ├── social-service/      # Social features (Port 3006)
│   │   ├── routes/          # friends, challenges, chat, notifications
│   │   ├── models/          # Friendship, Notification, Post
│   │   └── socket/          # Real-time events
│   ├── gamification-service/# XP & achievements (Port 3007)
│   ├── moderation-service/  # Content moderation (Port 3008)
│   ├── meeting-service/     # Video conferencing (Port 3009)
│   └── shared/              # Shared utilities
├── admin-portal/            # Admin management dashboard
├── docs/                    # Documentation
└── README.md
```

---

## 👥 Team

**OPTIMISTIC MUTANT CODERS**

Building the future of educational technology for IIT Bombay Techfest 2025.

---

## 📄 License

This project is developed for IIT Bombay Techfest 2025.

---

<div align="center">

**Made with ❤️ for IIT Bombay Techfest 2025**

_Intelligence Meets Interaction_

</div>