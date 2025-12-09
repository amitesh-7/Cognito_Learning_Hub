# 🚀 Advanced Features Implementation Guide

## ✅ Newly Implemented Features

This document covers the implementation of 5 advanced features from the roadmap:

1. **Dynamic Difficulty Ecosystem (6.2)** - Gamification Service
2. **Explain-Your-Reasoning Questions (10.1)** - Quiz Service
3. **Code-Based Quiz Evaluation (10.2)** - Quiz Service
4. **Scenario-Based Simulations (10.3)** - Quiz Service
5. **Time-Travel Quiz Mode (10.5)** - Result Service

---

## 1. 🌍 Dynamic Difficulty Ecosystem (Feature 6.2)

### Overview

Living world that adapts to global player performance with events, challenges, and raid bosses.

### Location

`microservices/gamification-service/`

### New Files Created

- `src/models/WorldEvent.js` - World event schema
- `src/routes/worldEvents.js` - API endpoints

### API Endpoints

#### Get Active Events

```http
GET /api/world-events/active
```

Returns all currently active world events.

#### Get Event by Type

```http
GET /api/world-events/type/:type
```

Types: `seasonal`, `community_goal`, `difficulty_wave`, `raid_boss`, `special`

#### Participate in Event

```http
POST /api/world-events/:id/participate
Authorization: Bearer <token>
```

#### Complete Event

```http
POST /api/world-events/:id/complete
Authorization: Bearer <token>

Body:
{
  "score": 85,
  "quizId": "quiz-id-here"
}
```

#### Get Community Progress

```http
GET /api/world-events/community-progress
```

#### Get Raid Bosses

```http
GET /api/world-events/raid-bosses
```

### Event Types

#### 1. **Seasonal Events**

```javascript
{
  "eventType": "seasonal",
  "title": "🎃 Halloween Calculus",
  "rewards": {
    "xpMultiplier": 2,
    "specialBadge": {
      "name": "Pumpkin Scholar",
      "icon": "🎃"
    }
  }
}
```

#### 2. **Community Goals**

```javascript
{
  "eventType": "community_goal",
  "title": "Million Quiz Challenge",
  "communityGoal": {
    "targetQuizCount": 1000000,
    "currentProgress": 675429
  }
}
```

#### 3. **Difficulty Waves**

```javascript
{
  "eventType": "difficulty_wave",
  "difficultyWave": {
    "baseMultiplier": 1.5,
    "affectedCategories": ["Mathematics", "Physics"],
    "waveIntensity": 7
  }
}
```

#### 4. **Raid Bosses**

```javascript
{
  "eventType": "raid_boss",
  "raidBoss": {
    "name": "The Calculus Dragon",
    "difficulty": "Legendary",
    "quizId": "quiz-id",
    "requiredSuccesses": 100,
    "successCount": 45,
    "rewardMultiplier": 3
  }
}
```

### Usage Example

```javascript
// Frontend - Check active events
const response = await fetch("/api/world-events/active");
const { data } = await response.json();

data.forEach((event) => {
  console.log(`${event.title} - ${event.eventType}`);
  console.log(`Rewards: ${event.rewards.xpMultiplier}x XP`);
});

// Participate in event
await fetch(`/api/world-events/${eventId}/participate`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// After completing quiz
await fetch(`/api/world-events/${eventId}/complete`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    score: 85,
    quizId: quizId,
  }),
});
```

---

## 2. 💭 Explain-Your-Reasoning Questions (Feature 10.1)

### Overview

AI evaluates not just correctness but also the quality of student explanations.

### Location

`microservices/quiz-service/`

### New Files Created

- `models/AdvancedQuestion.js` - Extended question model
- `services/reasoningEvaluator.js` - AI evaluation service
- `routes/advancedQuestions.js` - API endpoints

### Creating a Reasoning Question

```javascript
POST /api/advanced-questions

{
  "quizId": "quiz-id-here",
  "questionIndex": 0,
  "advancedType": "explain-reasoning",
  "title": "Why is the sky blue?",
  "description": "Select the correct answer and explain your reasoning.",
  "points": 15,
  "reasoningConfig": {
    "minWords": 30,
    "maxWords": 150,
    "evaluationCriteria": [
      {
        "criterion": "Mentions light scattering",
        "weight": 0.4,
        "keywords": ["scatter", "scattering", "wavelength"]
      },
      {
        "criterion": "Explains Rayleigh scattering",
        "weight": 0.3,
        "keywords": ["rayleigh", "blue light", "short wavelength"]
      },
      {
        "criterion": "Clear explanation",
        "weight": 0.3,
        "keywords": []
      }
    ],
    "sampleExplanation": "The sky appears blue due to Rayleigh scattering..."
  }
}
```

### Submitting Answer with Explanation

```javascript
POST /api/advanced-questions/:id/submit

{
  "userAnswer": "C) Rayleigh scattering",
  "userExplanation": "The sky is blue because of Rayleigh scattering. When sunlight enters Earth's atmosphere, it collides with gas molecules. Blue light has a shorter wavelength and scatters more easily than other colors, making the sky appear blue to our eyes."
}

Response:
{
  "success": true,
  "data": {
    "correct": true,
    "explanationScore": 8.5,
    "maxExplanationScore": 10,
    "totalScore": 13.5,
    "maxScore": 15,
    "feedback": "Excellent explanation! You correctly identified Rayleigh scattering and explained the wavelength concept clearly. Consider mentioning why other colors don't scatter as much.",
    "criteria": {
      "correctness": 9,
      "depth": 8,
      "clarity": 9,
      "completeness": 8
    },
    "suggestions": [
      "Great understanding of wavelengths",
      "Could elaborate on why red light scatters less"
    ]
  }
}
```

### Quick Validation (Without AI)

```javascript
POST /api/advanced-questions/reasoning/validate

{
  "explanation": "The sky is blue because...",
  "minWords": 20,
  "maxWords": 200
}

Response:
{
  "valid": true,
  "wordCount": 45,
  "warnings": ["Consider mentioning: light scattering"]
}
```

---

## 3. 💻 Code-Based Quiz Evaluation (Feature 10.2)

### Overview

Live coding challenges with automatic test case execution for multiple languages.

### Supported Languages

- JavaScript/Node.js
- Python
- Java
- C++
- C

### Creating a Code Challenge

```javascript
POST /api/advanced-questions

{
  "quizId": "quiz-id",
  "questionIndex": 0,
  "advancedType": "code-challenge",
  "title": "Two Sum Problem",
  "description": "Write a function that finds two numbers in an array that add up to a target sum.",
  "points": 20,
  "codeConfig": {
    "language": "python",
    "starterCode": "def two_sum(nums, target):\n    # Your code here\n    pass",
    "testCases": [
      {
        "input": { "nums": [2, 7, 11, 15], "target": 9 },
        "expectedOutput": [0, 1],
        "isHidden": false,
        "points": 5,
        "description": "Basic test case"
      },
      {
        "input": { "nums": [3, 2, 4], "target": 6 },
        "expectedOutput": [1, 2],
        "isHidden": false,
        "points": 5
      },
      {
        "input": { "nums": [1, 5, 3, 7, 9], "target": 12 },
        "expectedOutput": [2, 4],
        "isHidden": true,
        "points": 10,
        "description": "Hidden edge case"
      }
    ],
    "timeLimit": 5000,
    "memoryLimit": 128,
    "hints": [
      "Try using a hash map",
      "Think about complement numbers"
    ],
    "solution": "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i",
    "codeQualityChecks": {
      "checkComplexity": true,
      "checkStyle": true
    }
  }
}
```

### Submitting Code

```javascript
POST /api/advanced-questions/:id/submit

{
  "userCode": "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []"
}

Response:
{
  "success": true,
  "data": {
    "score": 20,
    "maxScore": 20,
    "execution": {
      "success": true,
      "score": 100,
      "totalTests": 3,
      "passedTests": 3,
      "results": [
        {
          "testCase": 1,
          "passed": true,
          "input": { "nums": [2, 7, 11, 15], "target": 9 },
          "expectedOutput": [0, 1],
          "actualOutput": [0, 1],
          "hidden": false
        },
        // ... more results
      ]
    },
    "codeQuality": {
      "linesOfCode": 8,
      "complexity": "Low",
      "hasComments": false,
      "suggestions": ["Add comments to explain the algorithm"]
    },
    "feedback": "Passed 3/3 test cases"
  }
}
```

### Test Code Without Submitting

```javascript
POST /api/advanced-questions/code/execute

{
  "code": "def main(nums, target):\n    return [0, 1]",
  "language": "python",
  "input": { "nums": [2, 7], "target": 9 }
}
```

---

## 4. 🎮 Scenario-Based Simulations (Feature 10.3)

### Overview

Interactive decision-tree scenarios where choices affect outcomes and scores.

### Creating a Scenario

```javascript
POST /api/advanced-questions

{
  "quizId": "quiz-id",
  "questionIndex": 0,
  "advancedType": "scenario-based",
  "title": "Lemonade Stand Business",
  "description": "Make decisions to maximize profit",
  "points": 30,
  "scenarioConfig": {
    "initialState": {
      "capital": 50,
      "inventory": 0,
      "location": "park",
      "weather": "sunny"
    },
    "decisions": [
      {
        "decisionPoint": "initial-investment",
        "description": "How much lemonade to make?",
        "options": [
          {
            "text": "5 liters ($10)",
            "outcome": {
              "stateChanges": { "capital": 40, "inventory": 5 },
              "feedback": "Conservative start",
              "points": 5
            },
            "nextDecisionIndex": 1
          },
          {
            "text": "10 liters ($18)",
            "outcome": {
              "stateChanges": { "capital": 32, "inventory": 10 },
              "feedback": "Good balance",
              "points": 10
            },
            "nextDecisionIndex": 1
          },
          {
            "text": "20 liters ($30)",
            "outcome": {
              "stateChanges": { "capital": 20, "inventory": 20 },
              "feedback": "High risk, high reward",
              "points": 8
            },
            "nextDecisionIndex": 1
          }
        ]
      },
      {
        "decisionPoint": "weather-change",
        "description": "Weather turns cloudy. What do you do?",
        "options": [
          {
            "text": "Lower price 10%",
            "outcome": {
              "stateChanges": { "capital": 45, "inventory": 0 },
              "feedback": "Smart! Sold all inventory",
              "points": 12
            },
            "nextDecisionIndex": -1
          },
          {
            "text": "Keep same price",
            "outcome": {
              "stateChanges": { "capital": 35, "inventory": 5 },
              "feedback": "Some inventory left",
              "points": 5
            },
            "nextDecisionIndex": -1
          }
        ]
      }
    ],
    "successCriteria": {
      "capital": 70
    }
  }
}
```

### Submitting Decision Path

```javascript
POST /api/advanced-questions/:id/submit

{
  "decisionPath": [
    { "decisionIndex": 0, "optionIndex": 1 },
    { "decisionIndex": 1, "optionIndex": 0 }
  ]
}

Response:
{
  "success": true,
  "data": {
    "score": 22,
    "maxScore": 30,
    "finalState": {
      "capital": 77,
      "inventory": 0,
      "location": "park"
    },
    "feedback": "Good balance Smart! Sold all inventory",
    "success": true
  }
}
```

---

## 5. ⏰ Time-Travel Quiz Mode (Feature 10.5)

### Overview

Generate quizzes based on past mistakes and performance, allowing students to "beat their past self."

### Location

`microservices/result-service/routes/timeTravel.js`

### API Endpoints

#### Analyze Past Performance

```http
GET /api/time-travel/analyze/:userId?days=30&limit=10
```

Returns weak areas, improvement opportunities, and mistake patterns.

Response:

```javascript
{
  "success": true,
  "data": {
    "totalQuizzesTaken": 45,
    "weakAreas": [
      {
        "category": "Calculus",
        "averageScore": 55,
        "attemptsCount": 12,
        "trend": "declining"
      },
      {
        "category": "Physics",
        "averageScore": 62,
        "attemptsCount": 8,
        "trend": "stable"
      }
    ],
    "improvementTopics": [
      {
        "quiz": "Derivatives Basics",
        "category": "Calculus",
        "score": 45,
        "message": "Needs review. Consider revisiting the basics."
      }
    ],
    "mistakePatterns": {
      "timeManagement": 5,
      "conceptual": 12,
      "calculation": 3
    }
  }
}
```

#### Generate Time-Travel Quiz

```http
POST /api/time-travel/generate

Body:
{
  "userId": "user-id",
  "category": "Mathematics",
  "difficulty": "Medium",
  "questionCount": 10
}
```

Returns a quiz with questions you got wrong before:

```javascript
{
  "success": true,
  "data": {
    "title": "🕰️ Time-Travel Challenge: Mathematics",
    "description": "Can you beat your past self?",
    "questions": [
      {
        "question": "What is the derivative of x²?",
        "options": ["x", "2x", "x²", "2"],
        "correct_answer": "2x",
        "timeTravelMetadata": {
          "previousAttemptDate": "2025-11-15",
          "previousAnswer": "x",
          "previousScore": 0,
          "attemptsCount": 3,
          "improvementHint": "You answered 'x' before. Remember the power rule!"
        }
      }
    ]
  }
}
```

#### Compare Attempts

```http
GET /api/time-travel/comparison/:userId/:quizId
```

Shows improvement over time:

```javascript
{
  "success": true,
  "data": {
    "totalAttempts": 3,
    "firstAttempt": {
      "date": "2025-10-01",
      "score": 45,
      "percentage": 45
    },
    "latestAttempt": {
      "date": "2025-12-01",
      "score": 85,
      "percentage": 85
    },
    "improvement": {
      "scoreChange": +40,
      "percentageChange": +40
    },
    "progressGraph": [...]
  }
}
```

#### Get Progress Visualization

```http
GET /api/time-travel/progress/:userId?period=30
```

Weekly and category-wise progress:

```javascript
{
  "success": true,
  "data": {
    "weeklyProgress": [
      { "week": "2025-W48", "averageScore": 65, "quizCount": 5 },
      { "week": "2025-W49", "averageScore": 72, "quizCount": 7 }
    ],
    "categoryProgress": [
      { "category": "Math", "averageScore": 75, "trend": "improving" },
      { "category": "Physics", "averageScore": 68, "trend": "stable" }
    ],
    "difficultyProgress": [
      { "difficulty": "Easy", "averageScore": 90 },
      { "difficulty": "Medium", "averageScore": 70 },
      { "difficulty": "Hard", "averageScore": 55 }
    ],
    "averageImprovement": +12
  }
}
```

---

## 🔧 Installation & Setup

### 1. Install Dependencies

```bash
# Quiz Service (for code execution)
cd microservices/quiz-service
npm install vm2

# AI Study Buddy Service (already has Gemini)
# No additional dependencies needed

# All services
cd microservices/gamification-service
npm install

cd microservices/result-service
npm install
```

### 2. Environment Variables

Add to `.env` files:

**quiz-service/.env**:

```env
# Already exists - just ensure GEMINI_API_KEY is set
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start Services

```bash
# Start all services (update start script if needed)
# Or start individually:

# Gamification Service
cd microservices/gamification-service
npm run dev

# Quiz Service
cd microservices/quiz-service
npm run dev

# Result Service
cd microservices/result-service
npm run dev
```

---

## 🎯 Integration Examples

### Frontend Integration

#### 1. Display Active Events

```javascript
// components/EventsBanner.jsx
import { useEffect, useState } from "react";

function EventsBanner() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch("/api/world-events/active")
      .then((res) => res.json())
      .then((data) => setEvents(data.data));
  }, []);

  return (
    <div className="events-banner">
      {events.map((event) => (
        <div key={event._id} className="event-card">
          <h3>{event.title}</h3>
          <p>{event.description}</p>
          <div className="rewards">{event.rewards.xpMultiplier}x XP</div>
          {event.eventType === "community_goal" && (
            <div className="progress">
              {event.communityGoal.currentProgress} /
              {event.communityGoal.targetQuizCount}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

#### 2. Code Challenge Interface

```javascript
// components/CodeChallenge.jsx
import { useState } from "react";
import Editor from "@monaco-editor/react";

function CodeChallenge({ question }) {
  const [code, setCode] = useState(question.codeConfig.starterCode);
  const [results, setResults] = useState(null);

  const runCode = async () => {
    const response = await fetch("/api/advanced-questions/code/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        language: question.codeConfig.language,
        input: {},
      }),
    });

    const data = await response.json();
    setResults(data.data);
  };

  const submitCode = async () => {
    const response = await fetch(
      `/api/advanced-questions/${question._id}/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userCode: code }),
      }
    );

    const data = await response.json();
    alert(`Score: ${data.data.score}/${data.data.maxScore}`);
  };

  return (
    <div className="code-challenge">
      <h2>{question.title}</h2>
      <p>{question.description}</p>

      <Editor
        height="400px"
        language={question.codeConfig.language}
        value={code}
        onChange={setCode}
      />

      <div className="test-cases">
        {question.codeConfig.testCases
          .filter((tc) => !tc.isHidden)
          .map((tc, i) => (
            <div key={i}>Input: {JSON.stringify(tc.input)}</div>
          ))}
      </div>

      <button onClick={runCode}>Run Code</button>
      <button onClick={submitCode}>Submit</button>

      {results && (
        <div className="results">
          Passed: {results.passedTests}/{results.totalTests}
        </div>
      )}
    </div>
  );
}
```

#### 3. Time-Travel Quiz Generator

```javascript
// components/TimeTravelQuiz.jsx
function TimeTravelQuiz({ userId }) {
  const generateQuiz = async () => {
    const response = await fetch("/api/time-travel/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        category: "Mathematics",
        questionCount: 10,
      }),
    });

    const { data } = await response.json();

    // Navigate to quiz with time-travel questions
    window.location.href = `/quiz/time-travel`;
  };

  return <button onClick={generateQuiz}>🕰️ Challenge Your Past Self</button>;
}
```

---

## 📊 Testing

### Test World Events

```bash
# Create a seasonal event
curl -X POST http://localhost:3007/api/world-events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Winter Learning Festival",
    "description": "Bonus XP all December!",
    "eventType": "seasonal",
    "startDate": "2025-12-01",
    "endDate": "2025-12-31",
    "rewards": { "xpMultiplier": 1.5 }
  }'

# Get active events
curl http://localhost:3007/api/world-events/active
```

### Test Code Execution

```bash
curl -X POST http://localhost:3002/api/advanced-questions/code/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def main(a, b):\n    return a + b",
    "language": "python",
    "input": { "a": 5, "b": 3 }
  }'
```

### Test Time-Travel Analysis

```bash
curl http://localhost:3003/api/time-travel/analyze/user-id-here?days=30
```

---

## 🎓 Key Benefits

### For Students:

- **Engaging Events**: Keep learning fresh with seasonal challenges
- **Deeper Learning**: Explain reasoning, not just select answers
- **Practical Skills**: Real coding practice with instant feedback
- **Decision Making**: Learn through scenario simulations
- **Personalized Practice**: Focus on weak areas with time-travel quizzes

### For Teachers:

- **Automated Grading**: AI evaluates explanations and code
- **Detailed Analytics**: See exactly where students struggle
- **Flexible Content**: Mix traditional and advanced question types
- **Engagement Tracking**: Monitor participation in events

---

## 🚀 Next Steps

1. **Test all features** individually
2. **Integrate with frontend** using provided examples
3. **Create sample content** for each feature type
4. **Monitor performance** and optimize as needed
5. **Gather user feedback** for improvements

---

**Document Version**: 1.0  
**Date**: December 9, 2025  
**Implementation Status**: ✅ Complete  
**Ready for**: Testing & Frontend Integration

---

🎉 **All 5 features successfully implemented and integrated!**
