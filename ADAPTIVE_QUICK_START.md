# 🚀 Adaptive AI Difficulty - Quick Start Testing Guide

## ⚡ 5-Minute Quick Test

### Prerequisites

- ✅ Backend running on port 3001 (DONE)
- ✅ MongoDB connected (DONE)
- ⏳ Frontend running (NEED TO START)

---

## Step 1: Start Frontend (30 seconds)

```powershell
cd frontend
npm run dev
```

**Expected Output**:

```
VITE v5.x.x ready in XXX ms
➜ Local:   http://localhost:5173/
➜ Network: use --host to expose
```

**Action**: Open http://localhost:5173 in browser

---

## Step 2: Create Test Account (1 minute)

1. Click "Sign Up" button
2. Enter credentials:
   - **Email**: `testadaptive@example.com`
   - **Password**: `Test123!`
   - **Name**: `Adaptive Tester`
3. Click "Register"
4. Login with same credentials

---

## Step 3: Test Adaptive Mode Toggle (30 seconds)

1. Navigate to **"Quiz Maker"** → **"Generate from Topic"**
2. Find the **purple "Adaptive AI Difficulty" section**
3. Click the toggle switch (OFF → ON)

**✅ Expected**:

- Toggle turns purple
- Recommendation card slides down
- Shows: "You're just getting started..." (new user)
- Difficulty dropdown becomes disabled (grayed out)

---

## Step 4: Generate Adaptive Quiz (1 minute)

1. Enter topic: **"Photosynthesis"**
2. Number of questions: **5**
3. Difficulty: **Medium** (should be disabled)
4. Click **"Generate Quiz"**

**✅ Expected**:

- Loading spinner appears
- Quiz generates successfully
- Title: **"Photosynthesis (Adaptive)"**
- Difficulty: **Easy** (overrides your "Medium" selection for new user)

---

## Step 5: Take Quiz to Build History (2 minutes)

1. Answer the 5 quiz questions (any answers)
2. Submit quiz
3. Note your score
4. Go back and generate **3-5 more quizzes** on different topics
5. Vary your scores: some high (80%+), some low (40-60%)

**Purpose**: Build quiz history for adaptive algorithm

---

## Step 6: Test Adaptive Recommendation (1 minute)

1. Navigate back to **"Generate from Topic"**
2. Enable adaptive mode toggle
3. Observe the recommendation card

**✅ Expected** (after taking 5+ quizzes):

- Shows average score percentage
- Shows trend: improving/stable/declining
- Recommends appropriate difficulty
- Lists weak areas (if applicable)

---

## 🎯 Visual Confirmation Checklist

| Element             | What to Look For                      | Status |
| ------------------- | ------------------------------------- | ------ |
| Toggle Switch       | Gray → Purple when ON                 | [ ]    |
| Recommendation Card | Slides down smoothly                  | [ ]    |
| Average Score       | Displays percentage (e.g., 72.3%)     | [ ]    |
| Trend Indicator     | Shows color-coded trend (🟢🟡🔴)      | [ ]    |
| Weak Areas          | Lists topics <60% accuracy            | [ ]    |
| Difficulty Dropdown | Disabled with "(AI Override Enabled)" | [ ]    |
| Quiz Title          | Contains "(Adaptive)" suffix          | [ ]    |

---

## 🐛 Common Issues & Quick Fixes

### Issue 1: Toggle doesn't work

**Fix**: Check browser console for errors (F12 → Console)

- If API error: Verify backend is running on port 3001
- If CORS error: Add CORS headers in backend

### Issue 2: Recommendation card empty

**Cause**: New user with no quiz history
**Expected**: Shows message "You're just getting started..."

### Issue 3: Difficulty not overriding

**Check**:

1. `useAdaptive` state is `true`
2. Backend receives `useAdaptive: true` in request body (Network tab)
3. Response contains `adaptiveInfo` object

### Issue 4: Dark mode colors wrong

**Fix**: Toggle dark mode off/on in browser settings

---

## 🧪 Advanced Test Scenarios

### Test A: High Performer Path

```
1. Take 10 quizzes, score 90%+ on each
2. Enable adaptive mode
3. Expected: Recommended "Hard" difficulty
```

### Test B: Improving Learner Path

```
1. Take 5 quizzes scoring 50-60%
2. Take 5 more quizzes scoring 75-85%
3. Enable adaptive mode
4. Expected: Trend shows "improving" 🟢
```

### Test C: Weak Area Detection

```
1. Take 3 quizzes on "Physics" (score 40-50%)
2. Take 3 quizzes on "Math" (score 85-95%)
3. Enable adaptive mode
4. Expected: Weak areas show "Physics"
```

---

## 📊 Backend API Testing (Optional)

### Using Thunder Client / Postman

**1. Get Your Auth Token**:

- Login to app
- Open DevTools (F12) → Application → Local Storage
- Copy value of `quizwise-token`

**2. Test Adaptive Recommendation Endpoint**:

```http
GET http://localhost:3001/api/adaptive-difficulty
Headers:
  x-auth-token: <paste-your-token-here>
```

**Expected Response**:

```json
{
  "suggestedDifficulty": "Medium",
  "reason": "Based on your recent performance...",
  "avgScore": 72.5,
  "trend": "improving",
  "weakAreas": ["Topic1", "Topic2"],
  "recentScores": [65, 70, 75, 80, 85]
}
```

**3. Test Adaptive Quiz Generation**:

```http
POST http://localhost:3001/api/generate-quiz-topic
Headers:
  x-auth-token: <your-token>
  Content-Type: application/json
Body:
{
  "topic": "World War II",
  "numQuestions": 5,
  "difficulty": "Hard",
  "useAdaptive": true
}
```

**Expected Response**:

```json
{
  "quiz": {
    "title": "World War II (Adaptive)",
    "questions": [...],
    "difficulty": "Medium"
  },
  "adaptiveInfo": {
    "originalDifficulty": "Hard",
    "adaptedDifficulty": "Medium",
    "reason": "...",
    "avgScore": 72.5,
    "trend": "improving"
  }
}
```

---

## 📸 Screenshot Checklist (For Documentation)

Capture these screenshots for README/presentation:

1. **Adaptive Toggle OFF** - Purple section with gray toggle
2. **Adaptive Toggle ON** - Purple toggle + expanded recommendation card
3. **Recommendation Card** - Showing avg score, trend, weak areas
4. **Disabled Difficulty** - Grayed out dropdown with label
5. **Generated Quiz Title** - Showing "(Adaptive)" suffix
6. **Mobile View** - Adaptive UI on 375px screen
7. **Dark Mode** - All adaptive components in dark mode

---

## 🎬 Demo Script for Judges (3 minutes)

**Minute 1**: Introduction

> "Our adaptive AI difficulty system personalizes quiz challenges based on individual performance. Let me demonstrate..."

**Minute 2**: Live Demo

1. Enable adaptive toggle
2. Show recommendation card: "Based on my 72% average and improving trend, the system recommends Medium difficulty"
3. Generate quiz → Show title "(Adaptive)"
4. Explain: "The AI overrode my manual selection because it analyzed my last 10 quizzes"

**Minute 3**: Technical Explanation

> "The algorithm uses multi-factor analysis:
>
> - Average score percentage
> - Performance trend (improving/stable/declining)
> - Weak topic identification
> - Enhanced AI prompt with user context
>
> This goes beyond basic generation by creating personalized learning paths."

---

## ✅ Success Criteria

Your adaptive feature is working correctly if:

1. ✅ Toggle switch changes state (OFF ↔ ON)
2. ✅ Recommendation card appears when enabled
3. ✅ Performance insights display (avg score, trend)
4. ✅ Difficulty dropdown becomes disabled
5. ✅ Quiz generates with adaptive difficulty
6. ✅ Quiz title includes "(Adaptive)" suffix
7. ✅ No console errors
8. ✅ Mobile responsive
9. ✅ Dark mode compatible
10. ✅ Smooth animations

---

## 🚨 Emergency Troubleshooting

### Backend Not Responding?

```powershell
# Stop current server (Ctrl+C)
cd backend
node index.js
```

### Frontend Not Loading?

```powershell
# Stop dev server (Ctrl+C)
cd frontend
npm run dev
```

### MongoDB Connection Failed?

1. Check internet connection
2. Verify MONGODB_URI in `.env` file
3. Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0)

### Adaptive Toggle Not Appearing?

1. Hard refresh browser (Ctrl+Shift+R)
2. Clear cache
3. Check if file changes saved

---

## 📝 Quick Notes

**File Locations**:

- Backend: `backend/index.js` (lines ~630-1150)
- Frontend Topic: `frontend/src/pages/TopicQuizGenerator.jsx`
- Frontend File: `frontend/src/pages/FileQuizGenerator.jsx`

**Key Functions**:

- `calculateAdaptiveDifficulty(userId)` - Backend algorithm
- `fetchAdaptiveRecommendation()` - Frontend API call
- `handleSubmit()` - Sends `useAdaptive` parameter

**API Endpoints**:

- GET `/api/adaptive-difficulty` - Get recommendation
- POST `/api/generate-quiz-topic` - Generate adaptive quiz
- POST `/api/generate-quiz-file` - Generate from file (adaptive)

---

## 🎯 Next Steps After Testing

1. ✅ **Test Complete** → Document any bugs found
2. 📸 **Screenshots** → Capture all UI states
3. 📝 **Update README** → Add adaptive feature section
4. 🎥 **Record Demo** → Screen record the feature in action
5. 🚀 **Deploy** → Push to production (Vercel/Netlify)
6. 🏆 **Prepare Presentation** → Practice live demo for judges

---

**Testing Time**: ~10-15 minutes  
**Difficulty**: Easy (just follow steps)  
**Prerequisites**: Backend running ✅, MongoDB connected ✅

🚀 **Ready to test! Start with Step 1 above.**
