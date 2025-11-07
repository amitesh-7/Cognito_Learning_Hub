# 🧪 Socket.IO Testing Guide

## Quick Start

### Option 1: Browser Test (Recommended for Quick Verification)

1. Open `socket-test.html` in your browser
2. Make sure backend is running on port 3001
3. Click "Connect to Server"
4. If you see "✅ Connected! Socket ID: xxx" - **SUCCESS!**

### Option 2: Browser Console Test

1. Open browser console (F12)
2. Run:

```javascript
const socket = io("http://localhost:3001");
socket.on("connect", () => console.log("Connected:", socket.id));
socket.on("connect_error", (e) => console.error("Error:", e));
```

### Option 3: Node.js Client Test

```bash
npm install socket.io-client
```

Create `test-client.js`:

```javascript
const io = require("socket.io-client");
const socket = io("http://localhost:3001");

socket.on("connect", () => {
  console.log("✅ Connected:", socket.id);

  // Test session creation
  socket.emit(
    "create-session",
    {
      quizId: "507f1f77bcf86cd799439011", // Replace with real quiz ID
      hostId: "507f1f77bcf86cd799439012", // Replace with real user ID
      settings: {
        timePerQuestion: 30,
        showLeaderboardAfterEach: true,
      },
    },
    (response) => {
      console.log("Session created:", response);
    }
  );
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection error:", error.message);
});
```

Run: `node test-client.js`

---

## Testing Full Flow

### Step 1: Start Backend

```bash
cd backend
node index.js
```

Expected output:

```
Server with Socket.IO running on port 3001
```

### Step 2: Get Real IDs from MongoDB

**Option A**: Use MongoDB Compass

1. Connect to your MongoDB
2. Go to `quizwise-ai` database
3. Open `quizzes` collection → copy a quiz `_id`
4. Open `users` collection → copy a user `_id` (teacher role)

**Option B**: Use curl

```bash
# Get quizzes
curl http://localhost:3001/api/quizzes

# Get first quiz ID from response
```

### Step 3: Create Session

**Using socket-test.html**:

1. Quiz ID: `paste your quiz _id`
2. Host ID: `paste your user _id`
3. Click "Create Test Session"
4. **Copy the 6-character session code**

**Using browser console**:

```javascript
socket.emit(
  "create-session",
  {
    quizId: "YOUR_QUIZ_ID",
    hostId: "YOUR_USER_ID",
  },
  (res) => console.log(res)
);
```

### Step 4: Join Session (Different Browser/Tab)

**Using socket-test.html**:

1. Open in Incognito/different browser
2. Connect to server
3. Session Code: `paste code from step 3`
4. User ID: `paste another user _id`
5. Username: `Test Student`
6. Click "Join Session"

**Expected Console Output (Host)**:

```
👤 Participant joined: Test Student (Total: 1)
```

### Step 5: Start Quiz (Host Only)

**Using browser console**:

```javascript
socket.emit(
  "start-quiz",
  {
    sessionCode: "ABCD12", // Your session code
  },
  (res) => console.log(res)
);
```

**Expected Output (All Participants)**:

```
🎯 Quiz started! Question 1/5
Question: "What is 2+2?"
```

### Step 6: Submit Answer (Participant)

```javascript
socket.emit(
  "submit-answer",
  {
    sessionCode: "ABCD12",
    userId: "YOUR_USER_ID",
    questionIndex: 0,
    answer: "4",
    timeSpent: 5, // seconds
  },
  (res) => console.log(res)
);
```

**Expected Output**:

```javascript
{
  success: true,
  isCorrect: true,
  pointsEarned: 12.5,
  correctAnswer: "4",
  explanation: "Basic addition"
}
```

### Step 7: Check Leaderboard

**Automatic**: After each answer submission, all clients receive:

```javascript
// Event: leaderboard-updated
{
  leaderboard: [{ rank: 1, username: "Test Student", score: 12.5 }];
}
```

**Manual REST Call**:

```bash
curl http://localhost:3001/api/live-sessions/ABCD12/leaderboard
```

### Step 8: End Session (Host)

```javascript
socket.emit(
  "end-session",
  {
    sessionCode: "ABCD12",
  },
  (res) => console.log(res)
);
```

---

## Event Reference

### Client → Server Events

| Event            | Data                                                        | Callback Response                                                  |
| ---------------- | ----------------------------------------------------------- | ------------------------------------------------------------------ |
| `create-session` | `{ quizId, hostId, settings }`                              | `{ success, sessionCode, sessionId }`                              |
| `join-session`   | `{ sessionCode, userId, username, avatar }`                 | `{ success, session }`                                             |
| `start-quiz`     | `{ sessionCode }`                                           | `{ success }`                                                      |
| `submit-answer`  | `{ sessionCode, userId, questionIndex, answer, timeSpent }` | `{ success, isCorrect, pointsEarned, correctAnswer, explanation }` |
| `next-question`  | `{ sessionCode }`                                           | `{ success, questionIndex }`                                       |
| `end-session`    | `{ sessionCode }`                                           | `{ success }`                                                      |

### Server → Client Events

| Event                 | Data                                                     | Triggered By       |
| --------------------- | -------------------------------------------------------- | ------------------ |
| `participant-joined`  | `{ userId, username, avatar, participantCount }`         | User joins         |
| `quiz-started`        | `{ questionIndex, question, totalQuestions, timestamp }` | Host starts quiz   |
| `question-started`    | `{ questionIndex, question, totalQuestions, timestamp }` | Host moves to next |
| `leaderboard-updated` | `{ leaderboard, questionIndex }`                         | Answer submitted   |
| `session-ended`       | `{ leaderboard, totalParticipants, totalQuestions }`     | Host ends quiz     |
| `host-disconnected`   | `{ message }`                                            | Host disconnect    |
| `participant-left`    | `{ userId, username, participantCount }`                 | Student disconnect |

---

## Common Issues & Solutions

### ❌ "Connection error: transport error"

**Cause**: Backend not running or wrong port
**Fix**: Ensure `node index.js` is running and shows "Server with Socket.IO running on port 3001"

### ❌ "Session not found"

**Cause**: Session code expired or doesn't exist
**Fix**: Create a new session and use the code within 24 hours

### ❌ "Quiz not found"

**Cause**: Invalid quiz ObjectId
**Fix**: Use a real quiz ID from your database

### ❌ "Only host can start the quiz"

**Cause**: Trying to start quiz from participant socket
**Fix**: Use the host's socket (same one that created session)

### ❌ "MongoDB connection error"

**Cause**: Network/firewall blocking MongoDB Atlas
**Fix**: Check `.env` file has correct `MONGO_URI`, try VPN, or test offline

---

## REST API Testing (No WebSocket)

### Get Session Info

```bash
curl http://localhost:3001/api/live-sessions/ABCD12
```

### Get Leaderboard

```bash
curl http://localhost:3001/api/live-sessions/ABCD12/leaderboard
```

### Get Host's Sessions

```bash
curl -H "x-auth-token: YOUR_JWT_TOKEN" \
  http://localhost:3001/api/live-sessions/host/my-sessions
```

### Get Session Analytics (Host Only)

```bash
curl -H "x-auth-token: YOUR_JWT_TOKEN" \
  http://localhost:3001/api/live-sessions/ABCD12/analytics
```

---

## Success Criteria ✅

- [ ] Server starts with "Server with Socket.IO running on port 3001"
- [ ] Browser can connect and shows Socket ID
- [ ] Session creation returns 6-character code
- [ ] Joining session broadcasts to host
- [ ] Starting quiz sends question to all participants
- [ ] Answer submission updates leaderboard
- [ ] Ending session saves results to database
- [ ] Disconnection is handled gracefully

---

## Next Steps

Once all tests pass:

1. ✅ Phase 1 Complete
2. → Proceed to Phase 2: Frontend Integration
3. Build React components (SocketContext, LiveSessionHost, LiveSessionJoin)

---

_Happy Testing! 🧪_
