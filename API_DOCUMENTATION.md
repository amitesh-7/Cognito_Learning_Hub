# API Documentation - Cognito Learning Hub

**IIT Bombay Techfest 2025 Competition**

## 📖 Table of Contents

1. [Base URL & Authentication](#base-url--authentication)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Quiz Management](#quiz-management)
4. [AI Quiz Generation](#ai-quiz-generation)
5. [Adaptive Difficulty System](#adaptive-difficulty-system)
6. [Quiz Results & Leaderboards](#quiz-results--leaderboards)
7. [User Management](#user-management)
8. [Social Features](#social-features)
9. [Live Sessions](#live-sessions)
10. [Error Handling](#error-handling)

---

## 🌐 Base URL & Authentication

### Base URL

```
Development: http://localhost:3001
Production:  https://your-backend.vercel.app
```

### Authentication

All protected endpoints require JWT token in Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### 1. Sign Up

Create a new user account.

**Endpoint**: `POST /api/signup`

**Request Body**:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "Student"
}
```

**Response** (200 OK):

```json
{
  "message": "User registered successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "67890abcdef12345",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Student",
    "picture": null
  }
}
```

**Possible Errors**:

- `400`: Missing required fields
- `409`: Email already registered

---

### 2. Login

Authenticate existing user.

**Endpoint**: `POST /api/login`

**Request Body**:

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):

```json
{
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "67890abcdef12345",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Student"
  }
}
```

**Possible Errors**:

- `400`: Missing credentials
- `401`: Invalid credentials

---

### 3. Google OAuth

Authenticate with Google account.

**Endpoint**: `POST /api/google-auth`

**Request Body**:

```json
{
  "credential": "google_id_token_here",
  "role": "Student"
}
```

**Response** (200 OK):

```json
{
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "67890abcdef12345",
    "name": "John Doe",
    "email": "john@gmail.com",
    "role": "Student",
    "googleId": "1234567890",
    "picture": "https://lh3.googleusercontent.com/..."
  }
}
```

---

## 📝 Quiz Management

### 1. Get All Public Quizzes

Retrieve all publicly available quizzes.

**Endpoint**: `GET /api/quizzes`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):

```json
[
  {
    "_id": "quiz123",
    "title": "JavaScript Basics",
    "description": "Test your JavaScript knowledge",
    "difficulty": "Medium",
    "category": "Programming",
    "questions": [
      {
        "_id": "q1",
        "question": "What is a closure?",
        "type": "multiple-choice",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_answer": "Option A",
        "points": 10,
        "difficulty": "Medium"
      }
    ],
    "createdBy": {
      "_id": "user123",
      "name": "Teacher Name"
    },
    "isPublic": true,
    "attempts": 42,
    "averageScore": 78.5,
    "createdAt": "2025-11-01T10:00:00.000Z"
  }
]
```

---

### 2. Get Quiz by ID

Retrieve specific quiz details.

**Endpoint**: `GET /api/quiz/:quizId`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):

```json
{
  "_id": "quiz123",
  "title": "JavaScript Basics",
  "description": "Test your JavaScript knowledge",
  "difficulty": "Medium",
  "questions": [...],
  "timeLimit": 30,
  "passingScore": 60,
  "totalPoints": 100,
  "gameSettings": {
    "enableHints": false,
    "enableTimeBonuses": true,
    "enableStreakBonuses": true,
    "showLeaderboard": true
  }
}
```

---

### 3. Create Manual Quiz

Create a quiz manually (Teacher only).

**Endpoint**: `POST /api/quiz`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "title": "My Custom Quiz",
  "description": "A quiz about React",
  "difficulty": "Hard",
  "category": "Web Development",
  "questions": [
    {
      "question": "What is React?",
      "type": "multiple-choice",
      "options": ["Library", "Framework", "Language", "Tool"],
      "correct_answer": "Library",
      "explanation": "React is a JavaScript library for building UIs",
      "points": 10,
      "timeLimit": 30,
      "difficulty": "Easy"
    }
  ],
  "isPublic": true,
  "timeLimit": 30,
  "passingScore": 60
}
```

**Response** (201 Created):

```json
{
  "message": "Quiz created successfully",
  "quiz": {
    "_id": "newquiz123",
    "title": "My Custom Quiz",
    ...
  }
}
```

---

### 4. Get My Quizzes

Get all quizzes created by authenticated user.

**Endpoint**: `GET /api/quizzes/my-quizzes`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):

```json
[
  {
    "_id": "quiz123",
    "title": "My Quiz",
    "attempts": 15,
    "averageScore": 82.3,
    "createdAt": "2025-11-05T14:30:00.000Z"
  }
]
```

---

## 🤖 AI Quiz Generation

### 1. Generate Quiz from Topic

Generate AI quiz from topic using Google Gemini.

**Endpoint**: `POST /api/generate-quiz-topic`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "topic": "Machine Learning Basics",
  "numberOfQuestions": 10,
  "difficulty": "Medium",
  "useAdaptive": true
}
```

**Response** (200 OK):

```json
{
  "message": "AI-Topic quiz saved successfully!",
  "quiz": {
    "_id": "aiquiz123",
    "title": "AI Quiz: Machine Learning Basics",
    "description": "AI-generated quiz on Machine Learning Basics",
    "difficulty": "Medium",
    "questions": [
      {
        "question": "What is supervised learning?",
        "type": "multiple-choice",
        "options": ["...", "...", "...", "..."],
        "correct_answer": "...",
        "explanation": "...",
        "points": 10,
        "difficulty": "Medium"
      }
    ],
    "createdBy": "user123",
    "createdAt": "2025-11-08T12:00:00.000Z"
  }
}
```

**AI Prompt Enhancement (with Adaptive)**:

```
Generate a quiz on: Machine Learning Basics
Number of questions: 10
Difficulty: Medium

USER PERFORMANCE CONTEXT:
- Average Score: 75%
- Performance Trend: improving
- Weak Areas: neural networks, gradient descent

Adjust difficulty and focus on weak areas.
```

---

### 2. Generate Quiz from File

Generate AI quiz from uploaded PDF/TXT file.

**Endpoint**: `POST /api/generate-quiz-file`

**Headers**:

- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body** (FormData):

```
file: [PDF or TXT file]
numberOfQuestions: 10
difficulty: "Hard"
useAdaptive: true
```

**Response** (200 OK):

```json
{
  "message": "AI-File quiz saved successfully!",
  "quiz": {
    "_id": "filequiz123",
    "title": "AI Quiz: document.pdf",
    "questions": [...]
  }
}
```

---

## 🎯 Adaptive Difficulty System

### Get Adaptive Recommendations

Get personalized difficulty recommendations based on user performance.

**Endpoint**: `GET /api/adaptive-difficulty`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):

```json
{
  "recommendedDifficulty": "Hard",
  "avgScore": 85.5,
  "totalQuizzes": 12,
  "trend": "improving",
  "weakAreas": ["algorithms", "data structures"],
  "recentPerformance": [
    { "percentage": 80 },
    { "percentage": 85 },
    { "percentage": 90 }
  ]
}
```

**Algorithm Logic**:

```javascript
// 1. Calculate average score from last 10 results
avgScore = sum(last10Results) / 10

// 2. Detect trend
if (last3Scores[2] > last3Scores[0]) → "improving"
else if (last3Scores[2] < last3Scores[0]) → "declining"
else → "stable"

// 3. Determine difficulty
if (avgScore >= 85) → "Expert"
else if (avgScore >= 75) → "Hard"
else if (avgScore >= 60) → "Medium"
else → "Easy"

// 4. Identify weak areas from question results
weakAreas = topics where accuracy < 70%
```

---

## 📊 Quiz Results & Leaderboards

### 1. Submit Quiz Result

Submit completed quiz answers.

**Endpoint**: `POST /api/result`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "quizId": "quiz123",
  "score": 8,
  "totalQuestions": 10,
  "pointsEarned": 80,
  "bonusPoints": 15,
  "totalTimeTaken": 180,
  "questionResults": [
    {
      "questionId": "q1",
      "userAnswer": "Option A",
      "correctAnswer": "Option A",
      "isCorrect": true,
      "timeTaken": 12,
      "pointsEarned": 10,
      "bonusPoints": 2
    }
  ]
}
```

**Response** (201 Created):

```json
{
  "message": "Result submitted successfully!",
  "result": {
    "_id": "result123",
    "score": 8,
    "percentage": 80,
    "passed": true,
    "rank": "A",
    "achievementsUnlocked": ["first_perfect_score"],
    "experienceGained": 95
  }
}
```

---

### 2. Get Quiz Leaderboard

Get top scores for a specific quiz.

**Endpoint**: `GET /api/quiz/:quizId/leaderboard`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:

- `limit` (optional): Number of results (default: 10)

**Response** (200 OK):

```json
[
  {
    "_id": "result123",
    "user": {
      "_id": "user123",
      "name": "John Doe",
      "picture": "https://..."
    },
    "score": 10,
    "percentage": 100,
    "pointsEarned": 100,
    "bonusPoints": 25,
    "totalTimeTaken": 120,
    "createdAt": "2025-11-08T10:00:00.000Z",
    "rank": 1
  }
]
```

---

### 3. Get User Quiz History

Get all quiz results for authenticated user.

**Endpoint**: `GET /api/results`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):

```json
[
  {
    "_id": "result123",
    "quiz": {
      "_id": "quiz123",
      "title": "JavaScript Basics"
    },
    "score": 8,
    "percentage": 80,
    "passed": true,
    "rank": "A",
    "createdAt": "2025-11-08T10:00:00.000Z"
  }
]
```

---

## 👤 User Management

### 1. Get User Profile

Get authenticated user's profile.

**Endpoint**: `GET /api/user/profile`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):

```json
{
  "_id": "user123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Student",
  "picture": "https://...",
  "status": "online",
  "lastSeen": "2025-11-08T12:00:00.000Z",
  "createdAt": "2025-10-01T08:00:00.000Z"
}
```

---

### 2. Update User Profile

Update user information.

**Endpoint**: `PUT /api/user/profile`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "name": "John Smith",
  "picture": "https://new-picture-url.com/pic.jpg"
}
```

**Response** (200 OK):

```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "user123",
    "name": "John Smith",
    ...
  }
}
```

---

## 🌐 Social Features

### 1. Get User Friends

Get list of user's friends.

**Endpoint**: `GET /api/social/friends`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):

```json
[
  {
    "_id": "user456",
    "name": "Jane Doe",
    "picture": "https://...",
    "status": "online",
    "lastSeen": "2025-11-08T12:00:00.000Z"
  }
]
```

---

### 2. Send Friend Request

Send friend request to another user.

**Endpoint**: `POST /api/social/friend-request`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "recipientId": "user456"
}
```

**Response** (200 OK):

```json
{
  "message": "Friend request sent successfully"
}
```

---

## 🎮 Live Sessions

### 1. Create Live Session

Host a live multiplayer quiz session.

**Endpoint**: `POST /api/live/create`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "quizId": "quiz123",
  "maxParticipants": 50
}
```

**Response** (201 Created):

```json
{
  "sessionCode": "ABC123",
  "sessionId": "session123",
  "quiz": { ... },
  "hostId": "user123"
}
```

---

### 2. Join Live Session

Join existing live session as participant.

**Endpoint**: `POST /api/live/join`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "sessionCode": "ABC123"
}
```

**Response** (200 OK):

```json
{
  "message": "Joined session successfully",
  "session": {
    "sessionCode": "ABC123",
    "quiz": { ... },
    "participants": 12,
    "status": "waiting"
  }
}
```

---

## ⚠️ Error Handling

### Standard Error Response

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### HTTP Status Codes

| Code | Meaning      | Example                     |
| ---- | ------------ | --------------------------- |
| 200  | Success      | Quiz retrieved successfully |
| 201  | Created      | Quiz created successfully   |
| 400  | Bad Request  | Missing required fields     |
| 401  | Unauthorized | Invalid or missing token    |
| 403  | Forbidden    | Insufficient permissions    |
| 404  | Not Found    | Quiz not found              |
| 409  | Conflict     | Email already registered    |
| 500  | Server Error | Database connection failed  |

---

### Common Error Examples

#### 1. Authentication Error

```json
{
  "error": "Invalid or expired token",
  "code": "AUTH_FAILED"
}
```

#### 2. Validation Error

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

#### 3. Not Found Error

```json
{
  "error": "Quiz not found",
  "code": "NOT_FOUND",
  "quizId": "invalid123"
}
```

---

## 🔧 Rate Limiting

**Limits**:

- Authentication: 5 requests per minute
- Quiz Generation (AI): 10 requests per hour
- General API: 100 requests per minute

**Response when rate limited** (429):

```json
{
  "error": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

---

## 📚 Additional Resources

- **Postman Collection**: [Download Collection](#)
- **API Playground**: http://localhost:3001/api-docs (Swagger UI - if implemented)
- **WebSocket Events**: See LIVE_SESSIONS.md
- **Database Schema**: See models/ directory

---

**Last Updated**: November 8, 2025
**API Version**: 1.0
**Status**: ✅ Production Ready
