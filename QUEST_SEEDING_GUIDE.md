# Quest Seeding & Feature Integration Guide

## 🎯 Overview

This guide covers seeding 100+ quests per realm and integrating the new World Events and Time Travel features.

---

## 📊 Quest Data Seeding

### Prerequisites

- MongoDB connection established
- Backend server accessible
- Node.js environment configured

### Seed Quests (700+ Total Quests)

```bash
# Navigate to backend directory
cd backend

# Install dependencies if needed
npm install

# Run the quest seeder
node scripts/seed-quests.js
```

### Expected Output

```
Connected to MongoDB
Cleared existing quests
Generating quests for Algorithmic Valley...
  Generated 100 quests
Generating quests for Web Wizardry...
  Generated 100 quests
Generating quests for Data Kingdom...
  Generated 100 quests
Generating quests for AI Sanctuary...
  Generated 100 quests
Generating quests for System Fortress...
  Generated 100 quests
Generating quests for Security Citadel...
  Generated 100 quests
Generating quests for Cloud Highlands...
  Generated 100 quests

✅ Successfully seeded 700 quests!
Total quests per realm: 100

📊 Summary:
  Algorithmic Valley: 100 quests
  Web Wizardry: 100 quests
  Data Kingdom: 100 quests
  AI Sanctuary: 100 quests
  System Fortress: 100 quests
  Security Citadel: 100 quests
  Cloud Highlands: 100 quests
```

### Quest Structure

Each realm contains 5 chapters with 20 quests each:

1. **Fundamentals** (Quest 1-20) - Easy difficulty, 50 XP each
2. **Intermediate Concepts** (Quest 21-40) - Medium difficulty, 100 XP each
3. **Advanced Techniques** (Quest 41-60) - Hard difficulty, 200 XP each
4. **Expert Challenges** (Quest 61-80) - Expert difficulty, 500 XP each
5. **Mastery** (Quest 81-100) - Expert difficulty, 500 XP each

### Quest Realms

1. **Algorithmic Valley** 🟣

   - NPC: Oracle of Algorithms
   - Focus: Algorithms, data structures, problem-solving
   - Topics: Arrays, sorting, recursion, DP, graphs, trees

2. **Web Wizardry** 🔵

   - NPC: Wizard of the Web
   - Focus: Frontend, backend, full-stack development
   - Topics: HTML, CSS, React, APIs, SSR, PWAs

3. **Data Kingdom** 🟢

   - NPC: Data Dragon
   - Focus: Databases, analytics, data science
   - Topics: SQL, NoSQL, ETL, ML prep, visualization

4. **AI Sanctuary** 💗

   - NPC: AI Sage
   - Focus: Machine learning, AI, neural networks
   - Topics: Regression, classification, CNNs, transformers

5. **System Fortress** 🔴

   - NPC: System Guardian
   - Focus: Operating systems, networks, infrastructure
   - Topics: Processes, networking, concurrency, distributed systems

6. **Security Citadel** 🟡

   - NPC: Security Sentinel
   - Focus: Cybersecurity, ethical hacking
   - Topics: Authentication, OWASP, cryptography, penetration testing

7. **Cloud Highlands** 🩵
   - NPC: Cloud Keeper
   - Focus: Cloud computing, DevOps, scalability
   - Topics: AWS, Azure, Kubernetes, CI/CD, monitoring

---

## 🌍 World Events Feature

### Features

- **Global Challenges**: Compete with users worldwide
- **Speed Battles**: Time-based competitions
- **Marathons**: Endurance challenges
- **Tournaments**: Elimination-style events
- **Leaderboards**: Real-time rankings
- **Reward Pools**: XP distribution for top performers

### API Endpoints (Backend Complete)

```
GET  /api/gamification/world-events?status=active
POST /api/gamification/world-events/:eventId/join
GET  /api/gamification/world-events/:eventId/leaderboard
```

### Testing World Events

1. **Start Services**

```bash
cd microservices/gamification-service
npm start
```

2. **Create Sample Event** (via API or backend script)

```javascript
{
  eventId: "techfest-2025-grand-challenge",
  title: "IIT Bombay Techfest 2025 Grand Challenge",
  eventType: "global_challenge",
  description: "Compete in India's biggest tech fest quiz!",
  startDate: "2025-01-20T00:00:00Z",
  endDate: "2025-01-27T23:59:59Z",
  rewardPool: {
    totalXP: 10000,
    distribution: { first: 50, second: 30, third: 20 }
  }
}
```

3. **Access World Events Tab**
   - Navigate to Dashboard
   - Click "World Events" tab
   - View active events
   - Join and compete

---

## ⏰ Time Travel Mode Feature

### Features

- **Past Attempt History**: View all previous quiz attempts
- **Improvement Analysis**: AI-powered analysis of growth
- **Score Trends**: Visualize performance over time
- **Retake Quizzes**: Replay quizzes to prove improvement
- **Weak Topic Detection**: Identify areas needing focus
- **Improvement Potential**: AI calculates growth opportunities

### API Endpoints (Backend Complete)

```
GET  /api/results/time-travel/history
GET  /api/results/time-travel/analyze/:quizId
POST /api/results/time-travel/retake/:quizId
```

### Testing Time Travel Mode

1. **Prerequisites**

   - Complete at least 2-3 quizzes with different scores
   - Wait a few days between attempts for better analysis

2. **Access Time Travel**

   - Navigate to Dashboard
   - Click "Time Travel" tab
   - View past attempts with score trends
   - Click "Analyze" to see AI insights
   - Click "Time Travel" to retake and improve

3. **Expected Behavior**
   - Green ⬆️ arrow: Score improved
   - Red ⬇️ arrow: Score decreased
   - Improvement potential percentage shown
   - Weak topics highlighted
   - AI feedback on strengths and areas to focus

---

## 🎨 Dashboard Navigation

### Updated Tabs (8 Total)

1. **Overview** 📊 - Stats summary, quick actions
2. **AI Insights** 🧠 - Personalized learning recommendations
3. **Details** 📋 - Detailed quiz history
4. **Study Buddy** 💬 - AI chat tutor
5. **Goals** 🎯 - Study goal tracking
6. **Quests** 🎮 - RPG-style learning quests
7. **World Events** 🌍 - Global competitions (NEW!)
8. **Time Travel** ⏰ - Historical performance analysis (NEW!)

### Navigation Features

- Color-coded tabs with icons
- Smooth animations with Framer Motion
- Responsive design (mobile-friendly)
- Keyboard navigation support
- Active state indication

---

## 🚀 Testing Complete Feature Set

### 1. Quest System

```bash
# Start services
npm start

# Navigate to Dashboard → Quests tab
# Expected: 7 realms visible with 100 quests each
# Test: Click realm → View quests → Start quest
```

### 2. World Events

```bash
# Ensure gamification-service is running
# Navigate to Dashboard → World Events tab
# Expected: Active/Upcoming/Completed events
# Test: Join event → View leaderboard
```

### 3. Time Travel

```bash
# Complete some quizzes first
# Navigate to Dashboard → Time Travel tab
# Expected: Past attempts with trends
# Test: Analyze improvement → Retake quiz
```

### 4. Advanced Questions

```bash
# Create advanced question via TeacherDashboard
# Take quiz with code/reasoning/scenario questions
# Expected: Monaco editor, AI feedback, decision trees
```

---

## 🔧 Troubleshooting

### Quest Not Loading

```bash
# Check MongoDB connection
mongosh
use cognito_learning_hub
db.quests.countDocuments()  # Should be 700+

# Re-seed if needed
node backend/scripts/seed-quests.js
```

### World Events 404

```bash
# Verify gamification-service is running
curl http://localhost:3000/api/gamification/world-events

# Check API Gateway routing in microservices/api-gateway
```

### Time Travel Empty

```bash
# Requires completed quiz attempts
# Check results collection
db.results.find({ userId: "YOUR_USER_ID" })

# Complete 2-3 quizzes before testing
```

### UI Components Not Rendering

```bash
# Rebuild frontend
cd frontend
npm run build

# Check console for import errors
# Verify all component files exist:
# - WorldEventsPage.jsx
# - TimeTravelMode.jsx
# - QuestMap.jsx
```

---

## 📈 Performance Optimizations

### Quest Data

- Indexed by realm and chapter for fast queries
- Paginated quest loading (20 per page)
- Cached realm summaries

### World Events

- Leaderboard caching (5-minute TTL)
- Event status filtering at database level
- Real-time updates via WebSocket (optional)

### Time Travel

- Analysis cached per quiz attempt
- Incremental data loading
- Lazy load historical details

---

## 🎯 Next Steps

1. ✅ **Quest Seeding Complete** - 700 quests across 7 realms
2. ✅ **World Events Frontend** - Complete with leaderboards
3. ✅ **Time Travel Mode** - Analysis and retake functionality
4. ✅ **Dashboard Integration** - All 8 tabs functional
5. ⏳ **Security Hardening** - Docker containerization (Task 9)
6. ⏳ **Rate Limiting** - API protection (Task 10)

---

## 📝 Summary

**Total Features Implemented:**

- ✅ 700+ Quests (100 per realm)
- ✅ World Events with leaderboards
- ✅ Time Travel mode with AI analysis
- ✅ 8-tab Dashboard navigation
- ✅ Advanced question types (Code, Reasoning, Scenario)
- ✅ Quest Map with NPC interactions
- ✅ Teacher advanced question creator

**Completion Status:**

- Frontend: **90% Complete** (8/10 tasks done)
- Backend: **100% Complete** (all APIs functional)
- Quest Data: **100% Complete** (700 quests seeded)
- Security: **40% Complete** (Tasks 9-10 remaining)

**Ready for Production After:**

- Task 9: Code executor sandboxing
- Task 10: Rate limiting and validation
- Security audit
- Load testing
