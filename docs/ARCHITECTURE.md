# 🏗️ Cognito Learning Hub - System Architecture

## Overview

Cognito Learning Hub is built on a **microservices architecture** designed for scalability, maintainability, and high availability. The platform leverages modern technologies to deliver an AI-powered educational experience.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  React Frontend (Vite)        │  Flutter Mobile App (Future)                │
│  Port: 5173                   │  iOS/Android                                │
└───────────────────────────────┴─────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY                                        │
│                           Port: 3000                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Request Routing & Load Balancing                                         │
│  • Rate Limiting (100 req/15min)                                            │
│  • CORS Management                                                          │
│  • JWT Authentication Middleware                                            │
│  • Request/Response Logging                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
            ┌───────────────────────────┼───────────────────────────┐
            │                           │                           │
            ▼                           ▼                           ▼
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│   AUTH SERVICE    │     │   QUIZ SERVICE    │     │  RESULT SERVICE   │
│     Port: 3001    │     │     Port: 3002    │     │     Port: 3003    │
├───────────────────┤     ├───────────────────┤     ├───────────────────┤
│ • User Auth       │     │ • Quiz CRUD       │     │ • Result Storage  │
│ • JWT Tokens      │     │ • AI Generation   │     │ • Analytics       │
│ • Role Mgmt       │     │ • File Parsing    │     │ • Leaderboards    │
│ • Google OAuth    │     │ • Categories      │     │ • Performance     │
└───────────────────┘     └───────────────────┘     └───────────────────┘
            │                           │                           │
            ▼                           ▼                           ▼
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│   LIVE SERVICE    │     │  SOCIAL SERVICE   │     │ GAMIFICATION SVC  │
│     Port: 3004    │     │     Port: 3006    │     │     Port: 3007    │
├───────────────────┤     ├───────────────────┤     ├───────────────────┤
│ • Live Sessions   │     │ • Friends System  │     │ • XP & Levels     │
│ • Socket.IO       │     │ • Chat/Messages   │     │ • Achievements    │
│ • 1v1 Duels       │     │ • Notifications   │     │ • Streaks/Quests  │
│ • Real-time Sync  │     │ • Activity Feed   │     │ • Avatar System   │
└───────────────────┘     └───────────────────┘     └───────────────────┘
            │                           │
            ▼                           ▼
┌───────────────────┐     ┌───────────────────┐
│MODERATION SERVICE │     │  MEETING SERVICE  │
│     Port: 3008    │     │     Port: 3009    │
├───────────────────┤     ├───────────────────┤
│ • Content Review  │     │ • Video Meetings  │
│ • Report Handling │     │ • MediaSoup SFU   │
│ • Flagging        │     │ • Screen Share    │
│ • Safety          │     │ • Chat            │
└───────────────────┘     └───────────────────┘
                                        │
            ┌───────────────────────────┴───────────────────────────┐
            │                                                       │
            ▼                                                       ▼
┌───────────────────────────────────┐     ┌───────────────────────────────────┐
│           MongoDB Atlas           │     │           Redis Cloud             │
├───────────────────────────────────┤     ├───────────────────────────────────┤
│ • User Data                       │     │ • Session Management              │
│ • Quiz Collections                │     │ • Response Caching                │
│ • Results & Analytics             │     │ • Bull Job Queues                 │
│ • Social Data                     │     │ • Real-time State                 │
│ • Gamification Records            │     │ • Rate Limiting                   │
└───────────────────────────────────┘     └───────────────────────────────────┘
```

---

## Service Details

### 1. API Gateway (Port 3000)

**Responsibility**: Central entry point for all client requests

- **Routing**: Proxies requests to appropriate microservices
- **Authentication**: Validates JWT tokens before forwarding
- **Rate Limiting**: Prevents abuse (100 requests per 15 minutes)
- **CORS**: Manages cross-origin requests
- **Logging**: Centralized request logging

### 2. Auth Service (Port 3001)

**Responsibility**: User authentication and authorization

- User registration with email verification
- JWT-based authentication (access + refresh tokens)
- Google OAuth 2.0 integration
- Role-based access control (Student, Teacher, Moderator, Admin)
- Password reset functionality

### 3. Quiz Service (Port 3002)

**Responsibility**: Quiz creation and management

- CRUD operations for quizzes
- **AI Quiz Generation** via Google Gemini API
- File parsing (PDF, DOCX, TXT) for content extraction
- Category and difficulty management
- Question bank with multimedia support

### 4. Result Service (Port 3003)

**Responsibility**: Quiz results and analytics

- Result storage and retrieval
- Performance analytics calculation
- Leaderboard management (global, weekly, category)
- Progress tracking over time
- Strength/weakness analysis

### 5. Live Service (Port 3004)

**Responsibility**: Real-time multiplayer features

- Live quiz session management
- Socket.IO for real-time communication
- 1v1 duel matchmaking system
- Synchronized question delivery
- Live score tracking

### 6. Social Service (Port 3006)

**Responsibility**: Social features and communication

- Friend request system
- Real-time chat messaging
- Notification delivery
- Activity feed
- User search and discovery

### 7. Gamification Service (Port 3007)

**Responsibility**: Engagement, rewards, and avatars

- XP calculation and level progression
- Achievement unlock system (15+ achievements)
- Daily streak tracking
- Badge collection
- Quest system
- **Avatar System**: Customization, unlockables, and accessories

### 8. Moderation Service (Port 3008)

**Responsibility**: Content safety

- Quiz content review workflow
- User report handling
- Content flagging system
- Automated moderation rules

### 9. Meeting Service (Port 3009)

**Responsibility**: Video conferencing

- **MediaSoup SFU** for scalable video
- WebRTC transport management
- Multi-participant video rooms
- Screen sharing
- In-meeting chat

---

## Data Flow Examples

### Quiz Taking Flow

```
1. Student → API Gateway → Quiz Service (fetch quiz)
2. Student submits → API Gateway → Result Service (save result)
3. Result Service → Gamification Service (award XP via Bull queue)
4. Gamification Service → checks achievements → updates user level
5. Real-time notification via Socket.IO to frontend
```

### Live Quiz Session Flow

```
1. Teacher creates session → Live Service
2. Students join via room code → Socket.IO connection
3. Questions synchronized via WebSocket broadcast
4. Answers collected in real-time
5. Leaderboard updates pushed to all participants
6. Session ends → Results saved to Result Service
```

---

## Technology Stack

| Layer         | Technology                  | Purpose                 |
| ------------- | --------------------------- | ----------------------- |
| Frontend      | React 18 + Vite             | UI Framework            |
| Styling       | TailwindCSS + Framer Motion | Design & Animations     |
| API Gateway   | Express.js                  | Request Routing         |
| Microservices | Node.js + Express           | Business Logic          |
| Real-time     | Socket.IO                   | WebSocket Communication |
| Video         | MediaSoup                   | SFU Video Conferencing  |
| Database      | MongoDB Atlas               | Data Persistence        |
| Cache         | Redis Cloud                 | Caching & Sessions      |
| AI            | Google Gemini API           | Quiz Generation         |
| Auth          | JWT + Google OAuth          | Authentication          |
| Queue         | Bull                        | Background Jobs         |

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Production Setup                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend (Vercel)          Backend Services (Render)       │
│  ┌─────────────────┐        ┌─────────────────────────┐     │
│  │  React App      │───────▶│  API Gateway            │    │
│  │  CDN Cached     │        │  ↓                      │    │
│  └─────────────────┘        │  Microservices (x9)     │    │
│                             └───────────┬─────────────┘    │
│                                         │                   │
│                    ┌────────────────────┴────────────┐     │
│                    │                                 │     │
│                    ▼                                 ▼     │
│            MongoDB Atlas                      Redis Cloud  │
│            (Managed DB)                    (Managed Cache) │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Measures

1. **Authentication**: JWT with short-lived access tokens + refresh tokens
2. **Authorization**: Role-based access control (RBAC)
3. **Rate Limiting**: 100 requests per 15 minutes per IP
4. **Input Validation**: Joi/Zod schema validation
5. **CORS**: Strict origin whitelist
6. **Environment Variables**: Secrets never in code
7. **HTTPS**: TLS encryption in production

---

## Scalability Considerations

- **Horizontal Scaling**: Each microservice can scale independently
- **Database Sharding**: MongoDB Atlas supports auto-sharding
- **Redis Cluster**: Distributed caching for high availability
- **Load Balancing**: API Gateway distributes load
- **CDN**: Static assets cached at edge locations
- **MediaSoup Workers**: Multiple workers for video scaling

---

_Last Updated: December 2024_
