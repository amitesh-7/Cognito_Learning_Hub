# 📡 Cognito Learning Hub - API Documentation

## Overview

This document describes the REST API endpoints exposed by Cognito Learning Hub's microservices. All requests go through the **API Gateway** at the base URL.

---

## Base URLs

| Environment | URL                                    |
| ----------- | -------------------------------------- |
| Development | `http://localhost:3000/api`            |
| Production  | `https://cognito-api.onrender.com/api` |

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Types

- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), used to obtain new access tokens

---

## API Endpoints

### 🔐 Auth Service (`/api/auth`)

#### Register User

```http
POST /api/auth/register
```

| Parameter | Type   | Required | Description                        |
| --------- | ------ | -------- | ---------------------------------- |
| email     | string | Yes      | User email                         |
| password  | string | Yes      | Min 8 characters                   |
| name      | string | Yes      | Display name                       |
| role      | string | No       | student/teacher (default: student) |

**Response:**

```json
{
  "success": true,
  "message": "Registration successful",
  "user": { "id": "...", "email": "...", "name": "...", "role": "student" }
}
```

#### Login

```http
POST /api/auth/login
```

| Parameter | Type   | Required | Description   |
| --------- | ------ | -------- | ------------- |
| email     | string | Yes      | User email    |
| password  | string | Yes      | User password |

**Response:**

```json
{
  "success": true,
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "user": { "id": "...", "email": "...", "name": "...", "role": "..." }
}
```

#### Google OAuth

```http
POST /api/auth/google
```

| Parameter  | Type   | Required | Description                   |
| ---------- | ------ | -------- | ----------------------------- |
| credential | string | Yes      | Google OAuth credential token |

#### Refresh Token

```http
POST /api/auth/refresh
```

| Parameter    | Type   | Required | Description         |
| ------------ | ------ | -------- | ------------------- |
| refreshToken | string | Yes      | Valid refresh token |

#### Get Current User

```http
GET /api/auth/me
```

**Headers:** `Authorization: Bearer <token>`

---

### 📝 Quiz Service (`/api/quizzes`)

#### Get All Quizzes

```http
GET /api/quizzes
```

| Query Param | Type   | Description                  |
| ----------- | ------ | ---------------------------- |
| category    | string | Filter by category           |
| difficulty  | string | easy/medium/hard             |
| page        | number | Page number (default: 1)     |
| limit       | number | Items per page (default: 10) |

#### Get Quiz by ID

```http
GET /api/quizzes/:id
```

#### Create Quiz (Teacher/Admin)

```http
POST /api/quizzes
```

**Headers:** `Authorization: Bearer <token>`

| Parameter   | Type    | Required | Description               |
| ----------- | ------- | -------- | ------------------------- |
| title       | string  | Yes      | Quiz title                |
| description | string  | No       | Quiz description          |
| category    | string  | Yes      | Quiz category             |
| difficulty  | string  | Yes      | easy/medium/hard          |
| questions   | array   | Yes      | Array of question objects |
| timeLimit   | number  | No       | Time limit in seconds     |
| isPublic    | boolean | No       | Public visibility         |

**Question Object:**

```json
{
  "question": "What is 2+2?",
  "options": ["3", "4", "5", "6"],
  "correctAnswer": 1,
  "points": 10,
  "explanation": "Basic addition"
}
```

#### AI Generate Quiz (Teacher/Admin)

```http
POST /api/quizzes/generate
```

**Headers:** `Authorization: Bearer <token>`

| Parameter    | Type   | Required | Description                       |
| ------------ | ------ | -------- | --------------------------------- |
| topic        | string | Yes      | Topic for generation              |
| numQuestions | number | No       | Number of questions (default: 10) |
| difficulty   | string | No       | easy/medium/hard                  |
| category     | string | No       | Quiz category                     |

#### Upload File for Quiz Generation

```http
POST /api/quizzes/upload
```

**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

| Parameter    | Type   | Required | Description            |
| ------------ | ------ | -------- | ---------------------- |
| file         | file   | Yes      | PDF, DOCX, or TXT file |
| numQuestions | number | No       | Questions to generate  |

---

### 📊 Result Service (`/api/results`)

#### Submit Quiz Result

```http
POST /api/results
```

**Headers:** `Authorization: Bearer <token>`

| Parameter | Type   | Required | Description             |
| --------- | ------ | -------- | ----------------------- |
| quizId    | string | Yes      | Quiz ID                 |
| answers   | array  | Yes      | Array of answer indices |
| timeTaken | number | Yes      | Time taken in seconds   |

**Response:**

```json
{
  "success": true,
  "result": {
    "score": 80,
    "correctAnswers": 8,
    "totalQuestions": 10,
    "xpEarned": 150,
    "achievements": ["first_quiz", "quick_learner"]
  }
}
```

#### Get User Results

```http
GET /api/results/my-results
```

**Headers:** `Authorization: Bearer <token>`

#### Get Leaderboard

```http
GET /api/results/leaderboard
```

| Query Param | Type   | Description                     |
| ----------- | ------ | ------------------------------- |
| type        | string | global/weekly/category          |
| category    | string | Category (if type=category)     |
| limit       | number | Number of entries (default: 10) |

---

### 🎮 Live Service (Socket.IO)

**Connection URL:** `ws://localhost:3004` (dev) | `wss://cognito-live.onrender.com` (prod)

#### Events (Client → Server)

| Event           | Payload                                | Description         |
| --------------- | -------------------------------------- | ------------------- |
| `join-session`  | `{ sessionCode, userId, userName }`    | Join live session   |
| `submit-answer` | `{ questionIndex, answer, timeTaken }` | Submit answer       |
| `leave-session` | `{ sessionCode }`                      | Leave session       |
| `request-duel`  | `{ opponentId, category }`             | Request 1v1 duel    |
| `accept-duel`   | `{ duelId }`                           | Accept duel request |

#### Events (Server → Client)

| Event                | Payload                     | Description           |
| -------------------- | --------------------------- | --------------------- |
| `session-joined`     | `{ session, participants }` | Successfully joined   |
| `question-start`     | `{ question, timeLimit }`   | New question started  |
| `leaderboard-update` | `{ leaderboard }`           | Score update          |
| `session-ended`      | `{ results }`               | Session complete      |
| `duel-request`       | `{ duelId, challenger }`    | Incoming duel request |
| `duel-result`        | `{ winner, scores }`        | Duel completed        |

---

### 🏆 Gamification Service (`/api/gamification`)

#### Get User Stats

```http
GET /api/gamification/stats
```

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "xp": 1500,
  "level": 5,
  "streak": 7,
  "achievements": [...],
  "badges": [...],
  "rank": 42
}
```

#### Get Achievements

```http
GET /api/gamification/achievements
```

#### Get Active Quests

```http
GET /api/gamification/quests
```

#### Claim Quest Reward

```http
POST /api/gamification/quests/:questId/claim
```

---

### 👥 Social Service (`/api/social`)

#### Send Friend Request

```http
POST /api/social/friends/request
```

**Headers:** `Authorization: Bearer <token>`

| Parameter | Type   | Required | Description    |
| --------- | ------ | -------- | -------------- |
| userId    | string | Yes      | Target user ID |

#### Get Friends List

```http
GET /api/social/friends
```

#### Send Message

```http
POST /api/social/messages
```

| Parameter   | Type   | Required | Description       |
| ----------- | ------ | -------- | ----------------- |
| recipientId | string | Yes      | Recipient user ID |
| message     | string | Yes      | Message content   |

#### Get Notifications

```http
GET /api/social/notifications
```

---

### 🎥 Meeting Service (`/api/meetings`)

#### Create Meeting (Teacher/Admin)

```http
POST /api/meetings
```

**Headers:** `Authorization: Bearer <token>`

| Parameter       | Type   | Required | Description                    |
| --------------- | ------ | -------- | ------------------------------ |
| title           | string | Yes      | Meeting title                  |
| scheduledTime   | string | No       | ISO date string                |
| maxParticipants | number | No       | Max participants (default: 50) |

**Response:**

```json
{
  "success": true,
  "meeting": {
    "id": "...",
    "roomCode": "ABC12345",
    "title": "Physics Class"
  }
}
```

#### Join Meeting

```http
POST /api/meetings/join
```

| Parameter | Type   | Required | Description       |
| --------- | ------ | -------- | ----------------- |
| roomCode  | string | Yes      | Meeting room code |

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code               | HTTP Status | Description              |
| ------------------ | ----------- | ------------------------ |
| `UNAUTHORIZED`     | 401         | Invalid or missing token |
| `FORBIDDEN`        | 403         | Insufficient permissions |
| `NOT_FOUND`        | 404         | Resource not found       |
| `VALIDATION_ERROR` | 400         | Invalid request data     |
| `RATE_LIMITED`     | 429         | Too many requests        |
| `SERVER_ERROR`     | 500         | Internal server error    |

---

## Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 20 requests per 15 minutes
- **AI Generation**: 10 requests per hour per user

---

_Last Updated: December 2024_
