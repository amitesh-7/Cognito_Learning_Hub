# 🏗️ Cognito Learning Hub - System Architecture Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture Design](#architecture-design)
3. [Microservices Details](#microservices-details)
4. [Data Models](#data-models)
5. [Communication Patterns](#communication-patterns)
6. [Technology Stack](#technology-stack)
7. [Security Architecture](#security-architecture)
8. [Scalability & Performance](#scalability--performance)
9. [Deployment Architecture](#deployment-architecture)

---

## 🎯 Overview

### System Purpose
Cognito Learning Hub is an **AI-powered educational platform** built with a **microservices architecture** that provides:
- 🧠 **AI Quiz Generation** - Generate quizzes from PDFs, topics, YouTube videos
- ⚔️ **Real-Time Duels** - 1v1 quiz battles with live scoring
- 👥 **Live Sessions** - Multiplayer quiz sessions with host controls
- 🎮 **Gamification** - XP, levels, achievements, streaks, leaderboards
- 🤖 **AI Tutor** - 24/7 doubt solving with Google Gemini
- 📹 **Video Meetings** - WebRTC-based video conferencing
- 💬 **Social Features** - Friends, chat, posts, challenges

### Design Principles
- **Microservices Architecture** - Independent, scalable services
- **Event-Driven** - Redis Pub/Sub and Socket.IO for real-time
- **API Gateway Pattern** - Single entry point with routing
- **Async Processing** - Bull queues for heavy operations
- **Caching Strategy** - Redis for performance optimization
- **Responsive Design** - Mobile-first, PWA-ready frontend

---

## 🏛️ Architecture Design

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  React Frontend (Port 5173)                                 │ │
│  │  • Vite Build Tool                                          │ │
│  │  • React Router v6                                          │ │
│  │  • Framer Motion                                            │ │
│  │  • Socket.IO Client                                         │ │
│  │  • Context API (Auth, Socket, Gamification, Avatar)        │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/WSS
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Port 3000)                      │
│  • Request Routing & Proxying                                     │
│  • CORS & Security Headers                                        │
│  • Rate Limiting (express-rate-limit)                             │
│  • Authentication Middleware                                      │
│  • Request/Response Logging                                       │
└──────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│ Auth Service │      │ Quiz Service │     │Result Service│
│   Port 3001  │      │   Port 3002  │     │   Port 3003  │
└──────────────┘      └──────────────┘     └──────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│ Live Service │      │Social Service│     │ Gamification │
│   Port 3004  │      │   Port 3006  │     │   Port 3007  │
└──────────────┘      └──────────────┘     └──────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐     ┌──────────────┐
│  Moderation  │      │    Meeting   │     │    Avatar    │
│   Port 3008  │      │   Port 3009  │     │   Port 3010  │
└──────────────┘      └──────────────┘     └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │         SHARED INFRASTRUCTURE            │
        │                                          │
        │  ┌──────────────┐   ┌────────────────┐ │
        │  │  MongoDB     │   │  Redis Cloud   │ │
        │  │  Atlas       │   │  • Caching     │ │
        │  │  • Users     │   │  • Sessions    │ │
        │  │  • Quizzes   │   │  • Pub/Sub     │ │
        │  │  • Results   │   │  • Bull Queues │ │
        │  │  • Social    │   └────────────────┘ │
        │  │  • Live      │                       │
        │  └──────────────┘                       │
        │                                          │
        │  ┌────────────────────────────────────┐ │
        │  │  External Services                  │ │
        │  │  • Google Gemini AI (Quiz Gen)     │ │
        │  │  • YouTube Data API                │ │
        │  │  • PDF Parsing (pdf-parse)         │ │
        │  └────────────────────────────────────┘ │
        └─────────────────────────────────────────┘
```

### Request Flow Diagram

```
User Action → Frontend → API Gateway → Microservice → Database/Cache
                                    ↓
                              Authentication
                                    ↓
                              Rate Limiting
                                    ↓
                              Service Routing
                                    ↓
                        Response ← Microservice
```

---

## 🔧 Microservices Details

### 1. API Gateway Service (Port 3000)

**Responsibilities:**
- Single entry point for all client requests
- Request routing to appropriate microservices
- CORS management with whitelist
- Rate limiting per IP
- Authentication token validation
- Request/response transformation
- Error handling and logging

**Key Features:**
```javascript
// CORS Configuration
allowedOrigins: [
  "http://localhost:5173",  // Development
  "https://quizwise-ai.live",  // Production
  "*.vercel.app",  // Deployment platforms
]

// Rate Limits
- General: 100 req/15min
- Auth: 5 req/15min
- Heavy: 10 req/15min
```

**Proxying Rules:**
```javascript
/api/auth/*        → Auth Service (3001)
/api/quizzes/*     → Quiz Service (3002)
/api/results/*     → Result Service (3003)
/api/sessions/*    → Live Service (3004)
/api/social/*      → Social Service (3006)
/api/achievements/*→ Gamification Service (3007)
/api/reports/*     → Moderation Service (3008)
/api/meetings/*    → Meeting Service (3009)
/api/avatar/*      → Avatar Service (3010)
```

**Technology:**
- Express.js
- http-proxy-middleware
- helmet (security)
- compression
- express-rate-limit

---

### 2. Auth Service (Port 3001)

**Responsibilities:**
- User registration and login
- JWT token generation and validation
- Password hashing (bcrypt)
- Google OAuth integration
- Role-based access control (RBAC)
- Profile management
- Session management

**User Roles:**
- 👨‍🎓 **Student** - Take quizzes, join sessions, chat
- 👨‍🏫 **Teacher** - Create quizzes, host sessions, view analytics
- 🛡️ **Moderator** - Review reports, moderate content
- 👑 **Admin** - Full system access, user management

**Endpoints:**
```
POST   /api/auth/register        - Register new user
POST   /api/auth/login           - Login with credentials
POST   /api/auth/google          - Google OAuth login
GET    /api/auth/me              - Get current user
PUT    /api/auth/profile         - Update profile
POST   /api/auth/change-password - Change password
GET    /api/auth/users           - List users (Admin)
```

**Security Features:**
- Passwords hashed with bcrypt (10 rounds)
- JWT with 7-day expiration
- HTTP-only cookies (optional)
- XSS protection via input sanitization
- SQL injection prevention

**Data Model:**
```javascript
User {
  _id: ObjectId
  name: String
  email: String (unique, indexed)
  password: String (hashed)
  googleId: String (optional, indexed)
  picture: String
  role: Enum['Student', 'Teacher', 'Moderator', 'Admin']
  status: Enum['online', 'offline', 'away']
  lastSeen: Date
  createdAt: Date
  updatedAt: Date
}
```

---

### 3. Quiz Service (Port 3002)

**Responsibilities:**
- AI-powered quiz generation (Gemini)
- CRUD operations for quizzes
- File upload (PDF) parsing
- YouTube transcript extraction
- Manual quiz creation
- Quiz search and filtering
- Adaptive difficulty adjustment

**Quiz Generation Methods:**

#### A. Topic-Based Generation
```javascript
POST /api/generate/topic
Body: {
  topic: "Python Programming",
  numQuestions: 10,
  difficulty: "Medium",
  useAdaptive: true
}
```

#### B. PDF Upload Generation
```javascript
POST /api/generate/file
Content-Type: multipart/form-data
File: document.pdf (max 10MB)
```

#### C. YouTube Video Generation
```javascript
POST /api/generate/youtube
Body: {
  videoUrl: "https://youtube.com/watch?v=...",
  numQuestions: 5
}
```

#### D. Manual Creation
```javascript
POST /api/quizzes
Body: {
  title: "Quiz Title",
  questions: [
    {
      question: "What is 2+2?",
      type: "multiple-choice",
      options: ["3", "4", "5", "6"],
      correct_answer: "4",
      points: 10,
      difficulty: "Easy"
    }
  ]
}
```

**AI Service Integration:**
- **Provider:** Google Gemini 1.5 Flash
- **Context:** Uses adaptive learning data
- **Temperature:** 0.7 (balanced creativity)
- **Max Tokens:** 8000
- **Fallback:** Error handling with user notification

**Job Queue System:**
- **Queue:** Bull (Redis-backed)
- **Workers:** 2 concurrent
- **Timeout:** 60 seconds
- **Retry:** 3 attempts with exponential backoff
- **Priority:** Teacher > Student

**Caching Strategy:**
```javascript
Cache Keys:
- quiz:{quizId}           → TTL: 1 hour
- user_quizzes:{userId}   → TTL: 5 minutes
- public_quizzes          → TTL: 10 minutes
- adaptive_data:{userId}  → TTL: 24 hours
```

**Data Model:**
```javascript
Quiz {
  _id: ObjectId
  title: String (required)
  description: String
  createdBy: ObjectId → User (indexed)
  difficulty: Enum['Easy', 'Medium', 'Hard', 'Expert']
  category: String
  tags: [String]
  isPublic: Boolean (default: true, indexed)
  timeLimit: Number (seconds, default: 30)
  passingScore: Number (percentage, default: 60)
  totalPoints: Number
  attempts: Number (indexed)
  averageScore: Number (indexed)
  questions: [{
    question: String
    type: Enum['multiple-choice', 'true-false', 'descriptive', 'fill-in-blank']
    options: [String]
    correct_answer: String
    explanation: String
    points: Number (default: 10)
    timeLimit: Number
    difficulty: Enum
  }]
  gameSettings: {
    enableHints: Boolean
    enableTimeBonuses: Boolean
    enableStreakBonuses: Boolean
    showLeaderboard: Boolean
  }
  ratings: [{
    user: ObjectId → User
    rating: Number (1-5)
    comment: String
  }]
  createdAt: Date (indexed)
  updatedAt: Date
}

Indexes:
- { createdBy: 1, createdAt: -1 }
- { isPublic: 1, difficulty: 1 }
- { category: 1, tags: 1 }
- { averageScore: -1, attempts: -1 }
```

---

### 4. Result Service (Port 3003)

**Responsibilities:**
- Quiz result submission and validation
- Score calculation and analytics
- Leaderboard generation (global, quiz-specific)
- Performance tracking and history
- Category-wise analytics
- Time-based metrics

**Endpoints:**
```
POST   /api/results             - Submit quiz result
GET    /api/results/user/:id    - Get user's results
GET    /api/results/quiz/:id    - Get quiz results
GET    /api/leaderboards/global - Global leaderboard
GET    /api/leaderboards/:quizId- Quiz leaderboard
GET    /api/analytics/user      - User analytics
GET    /api/analytics/category  - Category performance
```

**Score Calculation Algorithm:**
```javascript
Base Score = Correct Answers × Points per Question

Bonuses:
+ Time Bonus (if answered quickly)
  - Under 50% time: +20%
  - Under 75% time: +10%
+ Streak Bonus (consecutive correct)
  - 3+ streak: +5%
  - 5+ streak: +10%
  - 10+ streak: +20%
+ Perfect Score Bonus: +50 points

Final Score = Base Score × (1 + Bonuses)
Percentage = (Score / Total Points) × 100
```

**Leaderboard Caching:**
```javascript
Cache Strategy:
- Global: Update every 5 minutes
- Quiz-specific: Update on new submission
- TTL: 5 minutes (global), 2 minutes (quiz)
- Top 100 users cached
- Real-time updates via Redis Pub/Sub
```

**Data Model:**
```javascript
Result {
  _id: ObjectId
  user: ObjectId → User (indexed)
  quiz: ObjectId → Quiz (indexed)
  answers: [{
    question: ObjectId
    userAnswer: String
    isCorrect: Boolean
    timeTaken: Number
    pointsEarned: Number
  }]
  score: Number
  totalQuestions: Number
  correctAnswers: Number (indexed)
  percentage: Number (indexed)
  timeTaken: Number (seconds)
  completedAt: Date (indexed)
  streakBonus: Number
  timeBonus: Number
  isPerfectScore: Boolean
  rank: Number
  xpEarned: Number
  achievementsUnlocked: [String]
}

Indexes:
- { user: 1, completedAt: -1 }
- { quiz: 1, percentage: -1 }
- { percentage: -1, completedAt: -1 }
```

---

### 5. Live Service (Port 3004)

**Responsibilities:**
- Real-time multiplayer quiz sessions
- Socket.IO connection management
- Session state management (Redis)
- Live leaderboards
- 1v1 Duel battles
- Host controls (start, pause, skip)
- Participant synchronization

**Session Types:**

#### A. Group Sessions (Kahoot-style)
```javascript
Host creates → Players join → Questions synchronized
→ Live scoring → Real-time leaderboard → Results
```

#### B. 1v1 Duels
```javascript
Player 1 creates → Player 2 accepts → Same questions
→ Real-time scoring → Winner declared
```

**Socket.IO Events:**

**Host Events:**
```javascript
'create_session'  → Create new session
'start_session'   → Begin quiz
'next_question'   → Move to next question
'pause_session'   → Pause timer
'end_session'     → Finish and show results
```

**Player Events:**
```javascript
'join_session'    → Join with code
'submit_answer'   → Submit answer for current question
'leave_session'   → Exit session
```

**Broadcast Events:**
```javascript
'player_joined'   → New player notification
'question_start'  → Question display + timer
'answer_reveal'   → Show correct answer
'leaderboard'     → Updated scores
'session_ended'   → Final results
```

**Session State (Redis):**
```javascript
session:{code} = {
  hostId: String
  quizId: String
  status: Enum['waiting', 'active', 'paused', 'ended']
  currentQuestion: Number
  players: [{
    userId: String
    name: String
    score: Number
    answers: [Boolean]
  }]
  startedAt: Date
  settings: {
    allowLateJoin: Boolean
    showLeaderboardAfterEach: Boolean
    timePerQuestion: Number
  }
}

TTL: 24 hours
```

**Performance Optimizations:**
- Redis sessions (in-memory)
- Periodic DB sync (30 seconds)
- Batch leaderboard updates
- Connection pooling
- Compression enabled

**Data Model:**
```javascript
LiveSession {
  _id: ObjectId
  sessionCode: String (unique, 6-digit)
  host: ObjectId → User (indexed)
  quiz: ObjectId → Quiz
  status: Enum['waiting', 'active', 'paused', 'ended']
  participants: [{
    user: ObjectId → User
    joinedAt: Date
    score: Number
    answers: [Mixed]
    rank: Number
  }]
  currentQuestionIndex: Number
  startedAt: Date
  endedAt: Date
  settings: Object
}

DuelMatch {
  _id: ObjectId
  player1: ObjectId → User (indexed)
  player2: ObjectId → User (indexed)
  quiz: ObjectId → Quiz
  status: Enum['pending', 'active', 'completed']
  scores: {
    player1: Number
    player2: Number
  }
  winner: ObjectId → User
  completedAt: Date
}
```

---

### 6. Gamification Service (Port 3007)

**Responsibilities:**
- XP and leveling system
- Achievement tracking
- Streak management
- Leaderboard generation
- Badge unlocking
- Progress analytics

**XP System:**
```javascript
XP Sources:
- Quiz completion: 50-200 XP (based on difficulty)
- Perfect score: +100 XP bonus
- Daily streak: +10 XP per day
- Achievement unlock: 50-500 XP
- Social interactions: 5-20 XP
- Duel victory: +150 XP

Level Formula:
XP Required = 100 × level^1.5
Level 1: 100 XP
Level 2: 283 XP
Level 5: 1118 XP
Level 10: 3162 XP
```

**Achievement Categories:**
1. **Quiz Master** - Complete quizzes
2. **Perfect Scholar** - Perfect scores
3. **Speed Demon** - Fast completions
4. **Social Butterfly** - Social interactions
5. **Streak King** - Maintain streaks
6. **Duel Champion** - Win duels

**Achievement Examples:**
```javascript
{
  id: "first_quiz",
  name: "First Steps",
  description: "Complete your first quiz",
  icon: "🎯",
  rarity: "Common",
  xp: 50,
  condition: { quizzesTaken: 1 }
}

{
  id: "perfect_10",
  name: "Perfectionist",
  description: "Achieve 10 perfect scores",
  icon: "💯",
  rarity: "Epic",
  xp: 500,
  condition: { perfectScores: 10 }
}
```

**Streak System:**
- Daily login streak
- Quiz completion streak
- Cron job at midnight (UTC) checks streaks
- Missed day resets streak to 0
- Streak freeze items (future feature)

**Background Jobs:**
- Achievement checks (Bull queue)
- Stats synchronization (every 5 minutes)
- Streak verification (daily at 00:00 UTC)
- Leaderboard refresh (every 10 minutes)

**Data Model:**
```javascript
UserStats {
  _id: ObjectId
  userId: ObjectId → User (unique, indexed)
  level: Number (default: 1)
  xp: Number (default: 0)
  xpToNextLevel: Number
  totalXP: Number
  quizzesTaken: Number
  quizzesCreated: Number
  correctAnswers: Number
  averageScore: Number
  perfectScores: Number
  currentStreak: Number
  longestStreak: Number
  lastActivityDate: Date
  achievements: [String]
  badges: [String]
  rank: Number
  stats: {
    totalTimeSpent: Number
    fastestCompletion: Number
    duelsWon: Number
    duelsLost: Number
    socialScore: Number
  }
}

Achievement {
  _id: ObjectId
  achievementId: String (unique)
  name: String
  description: String
  icon: String
  rarity: Enum['Common', 'Rare', 'Epic', 'Legendary']
  xp: Number
  category: String
  condition: Object
  isSecret: Boolean
}
```

---

### 7. Social Service (Port 3006)

**Responsibilities:**
- Friend management
- Chat system (1-on-1 and groups)
- Posts and comments
- Notifications
- Activity feed
- Challenge system
- Follow/Following

**Chat Features:**
- Real-time messaging (Socket.IO)
- Message history (MongoDB)
- Typing indicators
- Read receipts
- File sharing (images)
- Emoji reactions

**Social Feed:**
```javascript
Feed Types:
- User posts (text, images)
- Quiz completions
- Achievement unlocks
- Friend activity
- Challenge invitations

Feed Algorithm:
- Chronological + Engagement score
- Friends' activity prioritized
- Personalized based on interests
```

**Notification Types:**
```javascript
- friend_request
- message_received
- post_liked
- post_commented
- challenge_received
- achievement_unlock
- quiz_invitation
- duel_challenge
```

**Data Models:**
```javascript
Post {
  _id: ObjectId
  user: ObjectId → User
  content: String
  images: [String]
  likes: [ObjectId → User]
  comments: [{
    user: ObjectId → User
    text: String
    createdAt: Date
  }]
  visibility: Enum['public', 'friends', 'private']
  createdAt: Date (indexed)
}

Friendship {
  _id: ObjectId
  user1: ObjectId → User (indexed)
  user2: ObjectId → User (indexed)
  status: Enum['pending', 'accepted', 'blocked']
  createdAt: Date
}

ChatMessage {
  _id: ObjectId
  sender: ObjectId → User (indexed)
  receiver: ObjectId → User (indexed)
  content: String
  type: Enum['text', 'image', 'quiz_invite']
  isRead: Boolean
  createdAt: Date (indexed)
}
```

---

### 8. Meeting Service (Port 3009)

**Responsibilities:**
- WebRTC video conferencing
- Peer connection management
- Screen sharing
- Audio/video controls
- Meeting rooms
- Recording (future)

**WebRTC Architecture:**
```
Teacher (Host) ←→ Signaling Server (Socket.IO) ←→ Students
       ↓                                              ↓
   WebRTC Peer Connections (Direct P2P)
```

**Signaling Events:**
```javascript
'create_meeting' → Host creates room
'join_meeting'   → Student joins
'offer'          → WebRTC offer
'answer'         → WebRTC answer
'ice_candidate'  → ICE candidate exchange
'leave_meeting'  → Exit room
```

**Meeting Controls:**
- Mute/Unmute microphone
- Enable/Disable camera
- Screen share toggle
- Kick participant (host only)
- End meeting (host only)

---

### 9. Moderation Service (Port 3008)

**Responsibilities:**
- Content moderation
- Report handling
- User flagging
- Quiz review
- Moderator dashboard

**Report Types:**
- Inappropriate content
- Spam
- Harassment
- Cheating
- Copyright violation

**Moderation Actions:**
- Warn user
- Hide content
- Delete content
- Suspend user
- Ban user

---

### 10. Avatar Service (Port 3010)

**Responsibilities:**
- Avatar customization
- Virtual pet system
- Avatar expressions
- Cosmetic items
- Avatar marketplace (future)

**Avatar Features:**
- Facial features
- Hair styles
- Clothing
- Accessories
- Emotions
- Animations

---

## 💾 Data Models

### Database: MongoDB Atlas

**Collections:**

1. **users** - User accounts
2. **quizzes** - Quiz data
3. **results** - Quiz results
4. **livesessions** - Live quiz sessions
5. **duelmatches** - 1v1 battles
6. **userstats** - Gamification stats
7. **achievements** - Achievement definitions
8. **posts** - Social posts
9. **friendships** - Friend connections
10. **chatmessages** - Chat history
11. **notifications** - User notifications
12. **meetings** - Video meeting sessions
13. **reports** - Moderation reports

**Indexing Strategy:**
- User email, googleId (unique)
- Quiz: createdBy, isPublic, createdAt
- Result: user, quiz, percentage
- LiveSession: sessionCode (unique)
- All: createdAt (TTL indexes where applicable)

---

## 🔄 Communication Patterns

### 1. Synchronous (HTTP/REST)
```
Frontend → API Gateway → Microservice → Response
```
Used for: CRUD operations, authentication, data retrieval

### 2. Asynchronous (Message Queue)
```
Service → Bull Queue (Redis) → Worker → Processing
```
Used for: AI quiz generation, achievement checks, notifications

### 3. Real-Time (WebSocket)
```
Client ←→ Socket.IO Server ←→ Redis Pub/Sub ←→ Other Instances
```
Used for: Live sessions, chat, notifications, duels

### 4. Event-Driven (Pub/Sub)
```
Service → Redis Pub → Subscribers → Action
```
Used for: Cross-service events, cache invalidation

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18.3.1
- **Build Tool:** Vite 5.x
- **Routing:** React Router v6
- **State:** Context API
- **Animations:** Framer Motion
- **Real-Time:** Socket.IO Client
- **HTTP:** Axios
- **UI:** Custom components + Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **Forms:** React Hook Form

### Backend - Shared
- **Runtime:** Node.js 20.19.4
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Cache:** Redis (ioredis)
- **Queue:** Bull
- **WebSocket:** Socket.IO
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** express-validator
- **Security:** helmet, cors, bcrypt
- **Logging:** winston

### AI & External Services
- **AI:** Google Gemini 1.5 Flash
- **PDF:** pdf-parse
- **YouTube:** @distube/ytdl-core
- **Video:** WebRTC (simple-peer)

### DevOps
- **Version Control:** Git/GitHub
- **Package Manager:** npm
- **Process Manager:** PM2
- **Environment:** dotenv

---

## 🔒 Security Architecture

### Authentication & Authorization
```javascript
JWT Token Flow:
1. User logs in → Auth Service validates
2. JWT generated (7-day expiry)
3. Token sent to client
4. Client includes in Authorization header
5. API Gateway validates token
6. Request forwarded to service
```

**Role-Based Access Control (RBAC):**
```javascript
Permissions Matrix:
                  Student  Teacher  Moderator  Admin
Create Quiz         ❌       ✅        ✅        ✅
Take Quiz           ✅       ✅        ✅        ✅
View Reports        ❌       ❌        ✅        ✅
Manage Users        ❌       ❌        ❌        ✅
Moderate Content    ❌       ❌        ✅        ✅
```

### Input Sanitization
- XSS prevention (sanitize-html)
- SQL injection prevention (parameterized queries)
- NoSQL injection prevention (input validation)
- File upload validation (mime type, size)

### Rate Limiting
```javascript
Tiers:
- General API: 100 req/15min
- Auth endpoints: 5 req/15min
- Heavy operations: 10 req/15min
- WebSocket: 1000 events/min
```

### Data Protection
- Passwords: bcrypt (10 rounds)
- Sensitive data: Environment variables
- HTTPS only in production
- Helmet.js security headers
- CORS whitelist

---

## ⚡ Scalability & Performance

### Horizontal Scaling
```
Load Balancer
    │
    ├─── API Gateway Instance 1
    ├─── API Gateway Instance 2
    └─── API Gateway Instance 3
              │
              ├─── Quiz Service (2 instances)
              ├─── Live Service (3 instances)
              └─── Other Services (scaled as needed)
```

### Caching Strategy
```javascript
Cache Layers:
1. Browser Cache (static assets)
2. CDN (images, videos)
3. Redis (API responses, sessions)
4. MongoDB (with proper indexing)

Cache Invalidation:
- Time-based (TTL)
- Event-based (on update/delete)
- Manual (admin action)
```

### Database Optimization
- Compound indexes for common queries
- Aggregation pipelines for analytics
- Read replicas for scaling reads
- Connection pooling (min: 2, max: 10)

### Performance Metrics
- API Response Time: < 200ms (avg)
- WebSocket Latency: < 50ms
- Quiz Generation: < 30s (async)
- Cache Hit Rate: > 80%

---

## 🚀 Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────┐
│           CDN (Vercel Edge)             │
│         (Static Assets, Images)         │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      Frontend (Vercel/Netlify)          │
│        React + Vite Build                │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    API Gateway (Render/Railway)          │
│           Load Balanced                  │
└─────────────────────────────────────────┘
                  │
    ┌─────────────┴─────────────┐
    ▼                           ▼
┌─────────────┐         ┌─────────────┐
│ Microservice│         │ Microservice│
│  Instance 1 │         │  Instance 2 │
│ (Render)    │         │ (Render)    │
└─────────────┘         └─────────────┘
    │                           │
    └─────────────┬─────────────┘
                  ▼
┌─────────────────────────────────────────┐
│      MongoDB Atlas (Cloud)               │
│   Multi-Region, Auto-Scaling             │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│      Redis Cloud (Upstash)               │
│   Managed, Global Replication            │
└─────────────────────────────────────────┘
```

### Environment Variables
```bash
# Database
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://...

# Authentication
JWT_SECRET=...
JWT_EXPIRE=7d

# AI Services
GOOGLE_API_KEY=...
GEMINI_MODEL=gemini-1.5-flash

# Services
AUTH_SERVICE_URL=https://auth.render.com
QUIZ_SERVICE_URL=https://quiz.render.com
...

# Frontend
VITE_API_URL=https://api.quizwise-ai.live
VITE_SOCKET_URL=wss://live.quizwise-ai.live
```

### Monitoring & Logging
- **APM:** Application Performance Monitoring
- **Logging:** Winston (centralized)
- **Errors:** Error tracking service
- **Uptime:** Health check endpoints
- **Metrics:** Response times, throughput

---

## 📊 System Metrics

### Performance Benchmarks
- **Concurrent Users:** 10,000+
- **Database Size:** 100GB+
- **API Requests:** 1M+ per day
- **WebSocket Connections:** 5,000+ concurrent
- **Quiz Generation:** 10,000+ per day

### Reliability
- **Uptime:** 99.9% SLA
- **Data Backup:** Daily automated
- **Disaster Recovery:** 4-hour RTO
- **Failover:** Automatic

---

## 🎯 Future Enhancements

1. **Kubernetes Deployment** - Container orchestration
2. **Service Mesh** - Istio for service-to-service communication
3. **GraphQL Gateway** - Unified data fetching
4. **Machine Learning** - Adaptive difficulty engine
5. **Mobile Apps** - React Native iOS/Android
6. **Analytics Dashboard** - Advanced insights
7. **Payment Integration** - Stripe for premium features
8. **White-label Solution** - Multi-tenant architecture

---

## 📝 Maintenance & Operations

### Backup Strategy
- **Database:** Daily snapshots (30-day retention)
- **Redis:** Persistence (RDB + AOF)
- **Files:** S3/Cloud storage backup

### Update Procedures
1. Staging environment testing
2. Canary deployment (10% traffic)
3. Gradual rollout (monitoring)
4. Rollback plan ready

### Health Monitoring
```javascript
GET /health endpoints:
- Status: 200 = healthy
- Database connection
- Redis connection
- Memory usage
- Uptime
```

---

## 📚 API Documentation

Full API documentation available via Swagger/OpenAPI at:
- Development: http://localhost:3000/api-docs
- Production: https://api.quizwise-ai.live/docs

---

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Maintained By:** Optimistic Mutant Coders Team
