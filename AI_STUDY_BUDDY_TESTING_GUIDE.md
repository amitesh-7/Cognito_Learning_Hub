# AI Study Buddy Testing Guide

## Overview

The AI Study Buddy is integrated into the **quiz-service** (port 3002) and provides personalized learning assistance using Google's Gemini 2.5 Flash model.

## Architecture

### Service Location

- **Microservice**: `quiz-service` (port 3002)
- **Base URL**: `http://localhost:3002/api/study-buddy`
- **Authentication**: Required (JWT token)

### Key Features

1. **Interactive Chat** - AI-powered conversational learning assistant
2. **Study Goals** - Set and track learning objectives
3. **Learning Memory** - Remembers user's strengths, weaknesses, and preferences
4. **Contextual Responses** - Uses quiz history and goals for personalized guidance

### Models Used

- **Database Models**:

  - `Conversation` - Chat history
  - `LearningMemory` - User's learning patterns and memories
  - `StudyGoal` - Learning objectives and progress

- **AI Service**: `aiStudyBuddy.js` - Main service using Gemini 2.5 Flash

## API Endpoints

### 1. Chat Endpoints

#### Send Message

```http
POST /api/study-buddy/chat/message
Headers: x-auth-token: <JWT_TOKEN>
Content-Type: application/json

Body:
{
  "message": "Can you help me understand World War 2?",
  "sessionId": "optional-session-uuid",
  "context": {
    "quizId": "optional",
    "topic": "optional"
  }
}

Response:
{
  "success": true,
  "data": {
    "response": "AI's response...",
    "sessionId": "session-uuid",
    "metadata": {
      "memoriesUsed": 3,
      "relatedGoals": ["Master World History"]
    }
  }
}
```

#### Get Conversation History

```http
GET /api/study-buddy/chat/conversations?limit=10&status=active
Headers: x-auth-token: <JWT_TOKEN>

Response:
{
  "success": true,
  "data": {
    "conversations": [
      {
        "_id": "...",
        "sessionId": "...",
        "messages": [...],
        "createdAt": "..."
      }
    ]
  }
}
```

#### Get Specific Conversation

```http
GET /api/study-buddy/chat/conversation/:sessionId
Headers: x-auth-token: <JWT_TOKEN>

Response:
{
  "success": true,
  "data": {
    "conversation": {
      "sessionId": "...",
      "messages": [
        {
          "role": "user",
          "content": "...",
          "timestamp": "..."
        },
        {
          "role": "assistant",
          "content": "...",
          "timestamp": "..."
        }
      ]
    }
  }
}
```

#### Delete Conversation

```http
DELETE /api/study-buddy/chat/conversation/:sessionId
Headers: x-auth-token: <JWT_TOKEN>

Response:
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

### 2. Study Goals Endpoints

#### Create Goal

```http
POST /api/study-buddy/goals
Headers: x-auth-token: <JWT_TOKEN>
Content-Type: application/json

Body:
{
  "title": "Master Machine Learning Basics",
  "description": "Learn supervised and unsupervised learning",
  "category": "Computer Science",
  "targetDate": "2025-12-31",
  "relatedTopics": ["Machine Learning", "AI", "Python"],
  "priority": "high"
}

Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Master Machine Learning Basics",
    "status": "not_started",
    "progress": 0,
    "priority": "high"
  }
}
```

#### Get All Goals

```http
GET /api/study-buddy/goals?status=in_progress
Headers: x-auth-token: <JWT_TOKEN>

Response:
{
  "success": true,
  "data": {
    "goals": [
      {
        "_id": "...",
        "title": "...",
        "status": "in_progress",
        "progress": 45
      }
    ]
  }
}
```

#### Update Goal

```http
PUT /api/study-buddy/goals/:goalId
Headers: x-auth-token: <JWT_TOKEN>
Content-Type: application/json

Body:
{
  "status": "in_progress",
  "progress": 50,
  "notes": "Completed 5 quizzes on ML algorithms"
}
```

#### Delete Goal

```http
DELETE /api/study-buddy/goals/:goalId
Headers: x-auth-token: <JWT_TOKEN>
```

### 3. Learning Memory Endpoints

#### Get Learning Memories

```http
GET /api/study-buddy/chat/memories?category=strengths&limit=10
Headers: x-auth-token: <JWT_TOKEN>

Response:
{
  "success": true,
  "data": {
    "memories": [
      {
        "type": "strength",
        "category": "Machine Learning",
        "content": "Strong understanding of supervised learning",
        "confidence": 0.85
      }
    ]
  }
}
```

#### Get Learning Insights

```http
GET /api/study-buddy/chat/insights
Headers: x-auth-token: <JWT_TOKEN>

Response:
{
  "success": true,
  "data": {
    "insights": {
      "totalConversations": 15,
      "activeGoals": 3,
      "topStrengths": ["Machine Learning", "Web Development"],
      "areasForImprovement": ["Database Design"],
      "studyStreak": 7
    }
  }
}
```

## Testing with Postman/Thunder Client

### Step 1: Get Authentication Token

1. Login to the app or use the auth endpoint
2. Copy the JWT token from localStorage or response

### Step 2: Test Chat Feature

```javascript
// Test 1: Start a conversation
POST http://localhost:3002/api/study-buddy/chat/message
Headers: x-auth-token: YOUR_TOKEN
Body: {
  "message": "I'm struggling with understanding integration in calculus. Can you help?"
}

// Test 2: Continue conversation
POST http://localhost:3002/api/study-buddy/chat/message
Headers: x-auth-token: YOUR_TOKEN
Body: {
  "message": "Can you give me an example?",
  "sessionId": "SESSION_ID_FROM_PREVIOUS_RESPONSE"
}

// Test 3: Get conversation history
GET http://localhost:3002/api/study-buddy/chat/conversations
Headers: x-auth-token: YOUR_TOKEN
```

### Step 3: Test Goals Feature

```javascript
// Test 1: Create a goal
POST http://localhost:3002/api/study-buddy/goals
Headers: x-auth-token: YOUR_TOKEN
Body: {
  "title": "Master Calculus Integration",
  "description": "Learn all integration techniques",
  "category": "Mathematics",
  "priority": "high",
  "targetDate": "2025-12-31"
}

// Test 2: Get all goals
GET http://localhost:3002/api/study-buddy/goals
Headers: x-auth-token: YOUR_TOKEN

// Test 3: Update goal progress
PUT http://localhost:3002/api/study-buddy/goals/GOAL_ID
Headers: x-auth-token: YOUR_TOKEN
Body: {
  "status": "in_progress",
  "progress": 30
}
```

## Testing with Frontend (If Integrated)

### Expected Frontend UI Components:

1. **Chat Interface**

   - Message input box
   - Conversation history display
   - Session management
   - Context awareness (from quiz results)

2. **Goals Dashboard**

   - Create new goal form
   - Goals list with progress bars
   - Goal status filters
   - Edit/Delete actions

3. **Learning Insights**
   - Strengths and weaknesses
   - Study recommendations
   - Progress tracking

### Integration Points:

- **Dashboard**: Link to Study Buddy from main dashboard
- **Quiz Results**: "Ask Study Buddy" button after quiz completion
- **Profile**: Learning goals and progress section

## Testing Checklist

### Chat Functionality

- [ ] Send first message (creates new session)
- [ ] Continue conversation (same session)
- [ ] View conversation history
- [ ] Delete conversation
- [ ] AI responses are contextual and helpful
- [ ] Socratic method is used (asks questions)
- [ ] Remembers previous context

### Goals Functionality

- [ ] Create goal with all fields
- [ ] Create goal with minimal fields
- [ ] View all goals
- [ ] Filter goals by status
- [ ] Update goal progress
- [ ] Mark goal as completed
- [ ] Delete goal
- [ ] Goals persist across sessions

### Memory & Context

- [ ] AI remembers user's strengths
- [ ] AI references previous conversations
- [ ] AI considers active goals in responses
- [ ] Learning patterns are tracked
- [ ] Recommendations improve over time

### Error Handling

- [ ] Missing authentication token
- [ ] Invalid session ID
- [ ] Malformed request body
- [ ] AI service timeout
- [ ] Database connection issues

## Sample Test Scenarios

### Scenario 1: Complete Learning Session

1. User completes a quiz on "Machine Learning"
2. Scores 60% (needs improvement)
3. Opens Study Buddy with quiz context
4. Asks: "Why did I struggle with this quiz?"
5. AI analyzes quiz results and provides guidance
6. User creates goal: "Improve ML fundamentals"
7. AI references this goal in future conversations

### Scenario 2: Goal-Oriented Study

1. User creates goal: "Master React Hooks"
2. Has multiple chat sessions about React
3. AI proactively relates conversations to goal
4. User updates goal progress after each quiz
5. AI celebrates milestones
6. Goal completion triggers achievement

### Scenario 3: Contextual Assistance

1. User fails quiz on "World War 2"
2. Clicks "Ask Study Buddy" from results page
3. AI receives quiz context automatically
4. Provides specific help on missed questions
5. Suggests related topics to study
6. Creates follow-up quiz recommendation

## Debugging

### Check Service Status

```bash
# Verify quiz-service is running
netstat -ano | findstr ":3002"

# Check logs
cd microservices/quiz-service
npm start
```

### Common Issues

1. **401 Unauthorized**: Token missing or expired
2. **500 Internal Server Error**: Check GEMINI_API_KEY in .env
3. **Empty Response**: Verify AI model name is correct
4. **Slow Responses**: AI timeout, increase AI_TIMEOUT in .env

### Environment Variables

```env
# Required in quiz-service/.env
GEMINI_API_KEY=AIzaSyD-xT49yfBFF47BSNstwjjcd2ImzXt8X7Q
AI_MODEL=gemini-2.5-flash
AI_TIMEOUT=30000
MONGO_URI=your_mongodb_connection_string
```

## Current Status

✅ **Implemented**:

- AI Study Buddy service integrated into quiz-service
- Chat endpoints with conversation history
- Study goals CRUD operations
- Learning memory system
- Context-aware responses
- Gemini 2.5 Flash integration

⚠️ **Frontend Integration Needed**:

- Chat UI component
- Goals management interface
- Integration with Dashboard
- "Ask Study Buddy" buttons in quiz results

## Next Steps for Full Implementation

1. **Create Frontend Components**:

   - `StudyBuddyChat.jsx` - Chat interface
   - `StudyGoals.jsx` - Goals management
   - `LearningInsights.jsx` - Progress visualization

2. **Add UI Integration Points**:

   - Dashboard: Add "Study Buddy" tab
   - Quiz Results: Add "Ask AI Study Buddy" button
   - Profile: Show active goals and progress

3. **Enhance Features**:
   - Voice input/output
   - Quiz recommendations based on weaknesses
   - Spaced repetition scheduling
   - Collaborative study sessions

## Support

For issues or questions:

1. Check service logs in `microservices/quiz-service`
2. Verify MongoDB connection
3. Test API endpoints with Postman
4. Review Gemini API quota and limits
