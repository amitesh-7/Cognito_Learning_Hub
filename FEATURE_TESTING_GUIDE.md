# 🧪 Feature Testing Guide - Cognito Learning Hub

**Last Updated:** December 9, 2025  
**Version:** 1.0  
**Testing Duration:** ~45-60 minutes for complete walkthrough

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Feature 10.2: Code-Based Quiz Questions](#feature-102-code-based-quiz-questions)
3. [Feature 10.1: Reasoning Questions](#feature-101-reasoning-questions)
4. [Feature 10.3: Scenario Simulations](#feature-103-scenario-simulations)
5. [Feature 6.1: Quest System](#feature-61-quest-system)
6. [Integration Testing](#integration-testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1. Environment Setup

```bash
# Ensure all services are running
cd K:\IIT BOMBAY\Cognito-Learning-Hub

# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend
cd frontend
npm run dev

# Terminal 3: Start Microservices
cd microservices
npm start

# Or use the convenience script:
.\start-microservices.ps1
```

### 2. Required Services

Verify these services are running:

- ✅ API Gateway: `http://localhost:3000`
- ✅ Quiz Service: `http://localhost:3002`
- ✅ Result Service: `http://localhost:3003`
- ✅ Gamification Service: `http://localhost:3007`
- ✅ Frontend: `http://localhost:5173`

### 3. Test User Account

```
Email: test@example.com
Password: test123
```

Or create a new account at `/register`

---

## Feature 10.2: Code-Based Quiz Questions

### Overview

Multi-language code editor with test case execution and real-time feedback.

### Testing Steps

#### Step 1: Create a Code Question (Teacher/Admin)

1. Navigate to **Admin Panel** or **Create Quiz** page
2. Create a new quiz with question type: `code`
3. Configure the question:
   ```json
   {
     "type": "code",
     "title": "Array Sum Challenge",
     "question": "Write a function that returns the sum of all elements in an array.",
     "codeConfig": {
       "allowedLanguages": ["javascript", "python", "java"],
       "starterCode": "function arraySum(arr) {\n  // Your code here\n}",
       "testCases": [
         {
           "input": [1, 2, 3, 4, 5],
           "expectedOutput": 15,
           "hidden": false
         },
         {
           "input": [10, 20, 30],
           "expectedOutput": 60,
           "hidden": true
         }
       ],
       "requirements": [
         "Function must handle empty arrays",
         "Should work with negative numbers",
         "Time complexity: O(n)"
       ]
     }
   }
   ```

#### Step 2: Take the Quiz

1. Go to **Dashboard** → **Quizzes**
2. Select the quiz containing code questions
3. **Verify UI Components:**
   - ✅ Monaco Editor loads correctly
   - ✅ Language selector shows (JS, Python, Java, C++, C)
   - ✅ Starter code appears in editor
   - ✅ Sample test cases display
   - ✅ Requirements section visible

#### Step 3: Test Code Execution

1. **Write JavaScript Solution:**
   ```javascript
   function arraySum(arr) {
     return arr.reduce((sum, num) => sum + num, 0);
   }
   ```
2. Click **"Run Tests"** button
3. **Verify Results:**
   - ✅ Loading spinner appears during execution
   - ✅ Test results show pass/fail status
   - ✅ Green checkmarks for passing tests
   - ✅ Red X for failing tests
   - ✅ Expected vs Actual output shown
   - ✅ Hidden test cases execute (but don't show input/output)

#### Step 4: Test Language Switching

1. Switch to **Python**
2. Write Python solution:
   ```python
   def arraySum(arr):
       return sum(arr)
   ```
3. Run tests and verify results

#### Step 5: Submit and Check Results

1. Click **"Submit Solution"**
2. Navigate to next question or finish quiz
3. Check **Dashboard** → **Details** tab
4. **Verify:**
   - ✅ Code question marked correct/incorrect
   - ✅ Points awarded based on test results
   - ✅ Time taken recorded

---

## Feature 10.1: Reasoning Questions

### Overview

AI-powered evaluation of written explanations with quality scoring and feedback.

### Testing Steps

#### Step 1: Create Reasoning Question

Configure question with:

```json
{
  "type": "reasoning",
  "title": "Climate Change Analysis",
  "question": "Why is climate change considered a global crisis?",
  "options": [
    "Rising temperatures affect ecosystems worldwide",
    "It only affects polar regions",
    "It's a natural cycle with no human impact",
    "Weather patterns remain unchanged"
  ],
  "correctAnswer": "A",
  "reasoningConfig": {
    "minWords": 50,
    "maxWords": 500
  }
}
```

#### Step 2: Take the Quiz

1. Navigate to the reasoning question
2. **Verify UI:**
   - ✅ Question displays with purple brain icon
   - ✅ Four answer options show (A, B, C, D buttons)
   - ✅ Guidelines section explains requirements
   - ✅ Textarea for reasoning explanation
   - ✅ Word counter updates in real-time

#### Step 3: Test Word Counter Validation

1. Type explanation with **less than 50 words**

   - ✅ Word count badge shows RED
   - ✅ Error message: "Please write at least X more words"
   - ✅ Submit button DISABLED

2. Type explanation with **50-500 words**

   - ✅ Word count badge shows GREEN
   - ✅ Submit button ENABLED

3. Type explanation with **more than 500 words**
   - ✅ Word count badge shows YELLOW
   - ✅ Warning message: "Exceeds maximum by X words"
   - ✅ Submit button DISABLED

#### Step 4: Test AI Feedback

1. Select answer **A** (correct)
2. Write quality explanation (100+ words):
   ```
   Climate change is a global crisis because it affects every ecosystem on Earth.
   Rising temperatures cause polar ice to melt, leading to sea level rise that
   threatens coastal communities. Extreme weather events like hurricanes,
   droughts, and floods become more frequent and severe. Agricultural systems
   are disrupted, affecting food security. Biodiversity loss accelerates as
   species cannot adapt quickly enough to changing conditions. Human activities,
   particularly fossil fuel combustion, are the primary drivers of this crisis.
   ```
3. Click **"Get AI Feedback"**
4. **Verify AI Response:**
   - ✅ Loading spinner shows "Analyzing..."
   - ✅ Feedback card appears with purple border
   - ✅ Correctness indicator (green checkmark or red X)
   - ✅ Reasoning Quality Score (0-10) with progress bar
   - ✅ Detailed feedback text from Gemini AI
   - ✅ Strengths list (if applicable)
   - ✅ Areas for improvement (if applicable)

#### Step 5: Test Wrong Answer Feedback

1. Select answer **B** (incorrect)
2. Write explanation and get AI feedback
3. **Verify:**
   - ✅ Red X with "Your answer is incorrect"
   - ✅ Correct answer shown
   - ✅ AI still evaluates reasoning quality
   - ✅ Constructive feedback provided

---

## Feature 10.3: Scenario Simulations

### Overview

Interactive decision-tree scenarios with state tracking and branching paths.

### Testing Steps

#### Step 1: Create Scenario Question

Configure with branching structure:

```json
{
  "type": "scenario",
  "title": "Business Strategy Challenge",
  "question": "Navigate a product launch scenario making strategic decisions.",
  "scenarioConfig": {
    "initialScenario": "product_launch",
    "initialState": {
      "budget": 0,
      "reputation": 0,
      "marketShare": 0
    },
    "maxPhases": 3,
    "scenarios": [
      {
        "id": "product_launch",
        "description": "Your company is launching a new product...",
        "decisions": [
          {
            "text": "Invest heavily in marketing",
            "outcomes": { "budget": -50, "reputation": 20, "marketShare": 30 },
            "nextScenario": "market_response"
          },
          {
            "text": "Focus on product quality",
            "outcomes": { "budget": -30, "reputation": 30, "marketShare": 10 },
            "nextScenario": "market_response"
          }
        ]
      }
    ]
  }
}
```

#### Step 2: Experience the Scenario

1. Start quiz with scenario question
2. **Verify Initial Display:**
   - ✅ Map icon with scenario title
   - ✅ Phase indicator: "Phase 1 of X"
   - ✅ Current State cards (Budget, Reputation, Market Share)
   - ✅ Scenario description text
   - ✅ Decision buttons with hover effects

#### Step 3: Test Decision Making

1. **Hover over decision buttons:**

   - ✅ Potential outcomes show as badges (green for +, red for -)
   - ✅ ChevronRight icon animates on hover

2. **Click a decision:**
   - ✅ Smooth transition animation
   - ✅ Decision recorded in history
   - ✅ State values update (with + or - icons)
   - ✅ Next scenario loads
   - ✅ Phase counter increments

#### Step 4: Test Decision History

1. **Verify history panel:**
   - ✅ Shows all decisions made
   - ✅ Timestamp for each decision
   - ✅ Phase badges (Phase 1, 2, 3...)
   - ✅ Scenario text context
   - ✅ Decision text with arrow icon

#### Step 5: Test Completion

1. Complete all scenario phases
2. **Verify completion screen:**
   - ✅ Flag icon with "Scenario Complete!"
   - ✅ Green border on card
   - ✅ Final state summary
   - ✅ "Try Different Path" button (resets scenario)
   - ✅ Submit button ENABLED

#### Step 6: Test Reset Feature

1. Click **"Restart Scenario"**
2. **Verify:**
   - ✅ Scenario resets to beginning
   - ✅ State values reset to initial
   - ✅ History clears
   - ✅ Phase counter resets to 1
   - ✅ Can explore different decision paths

---

## Feature 6.1: Quest System

### Overview

RPG-style quest system with realms, chapters, NPCs, and narrative storylines.

### Testing Steps

#### Step 1: Access Quest System

1. Go to **Dashboard**
2. Look for navigation tabs at top
3. **If "Quests" tab is missing:**
   - Add it to Dashboard.jsx tabs section:
   ```jsx
   <motion.button
     onClick={() => setViewMode("quests")}
     className="px-4 py-2.5 rounded-lg..."
   >
     <Map className="w-4 h-4" />
     <span>Quests</span>
   </motion.button>
   ```

#### Step 2: Explore Realm Selection

1. Click **"Quests"** tab
2. **Verify Realm Grid:**
   - ✅ 7 realm cards display:
     - 🔢 Mathematics Kingdom (blue gradient)
     - ⚛️ Physics Universe (purple gradient)
     - 🧪 Chemistry Lab (green gradient)
     - 🌿 Biology Forest (green gradient)
     - 💻 Computer Science Hub (indigo gradient)
     - 📜 History Archives (amber gradient)
     - 📚 Language Realm (rose gradient)
   - ✅ Cards have hover animation (scale up)
   - ✅ "Enter Realm" button on each card

#### Step 3: Enter a Realm

1. Click **"Mathematics Kingdom"**
2. **Verify Realm View:**
   - ✅ Purple-pink gradient header with realm icon
   - ✅ "Back to Realms" button (top-left)
   - ✅ Realm name and quest count
   - ✅ Quests grouped by chapters
   - ✅ Chapter titles with book icon

#### Step 4: Browse Quests

1. **Verify Quest Cards show:**
   - ✅ Quest type icon (Crown=boss, Sword=battle, Star=side quest)
   - ✅ Difficulty badge (Easy/Medium/Hard/Legendary)
   - ✅ Lock icon (if locked)
   - ✅ Checkmark (if completed)
   - ✅ Quest title and description
   - ✅ Estimated time (e.g., "15m")
   - ✅ XP reward (e.g., "100 XP")
   - ✅ Status badge (Available/In Progress/Completed)

#### Step 5: Test Quest Details (NPC Dialog)

1. Click an **available quest**
2. **Verify Modal Opens:**
   - ✅ Purple-pink gradient header
   - ✅ NPC avatar and name
   - ✅ NPC role (Guide/Merchant/Wizard/Warrior)
   - ✅ NPC dialogue with speech bubble icon
   - ✅ Quest title with type icon
   - ✅ Full description text
   - ✅ Storyline section with scroll icon
   - ✅ Rewards section:
     - XP amount (yellow card)
     - Gold amount (amber card)
   - ✅ "Start Quest" button (purple-pink gradient)
   - ✅ "Cancel" button

#### Step 6: Start a Quest

1. Click **"Start Quest"**
2. **Verify:**
   - ✅ Success toast: "Quest started: [Quest Title]"
   - ✅ Modal closes
   - ✅ Redirects to quiz page (`/quiz/{quizId}`)
   - ✅ Quiz loads with quest-linked questions

#### Step 7: Complete Quest

1. Finish the quiz
2. Return to **Dashboard** → **Quests**
3. **Verify:**
   - ✅ Quest card now shows green border
   - ✅ Green checkmark icon
   - ✅ "Completed" badge
   - ✅ Card has green background tint
   - ✅ XP and rewards credited to user account

#### Step 8: Test Locked Quests

1. Find a quest with prerequisites
2. **Verify:**
   - ✅ Lock icon displayed
   - ✅ Card opacity reduced (60%)
   - ✅ Cursor: not-allowed
   - ✅ Click does nothing
   - ✅ Tooltip (if implemented): "Complete prerequisites first"

---

## Integration Testing

### Cross-Feature Tests

#### Test 1: Advanced Quiz Workflow

1. Create quiz with **mixed question types:**

   - 2 MCQ questions
   - 1 Code question
   - 1 Reasoning question
   - 1 Scenario question

2. **Take the quiz and verify:**
   - ✅ Timer works for MCQ (30 seconds)
   - ✅ No timer for advanced questions
   - ✅ Smooth transitions between question types
   - ✅ Each component renders correctly
   - ✅ "Next Question" button appears after submission
   - ✅ Final results include all question types
   - ✅ Points calculated correctly

#### Test 2: Quest to Study Buddy Flow

1. Complete a quest (finish quiz)
2. From **Quiz Results** page, click **"Ask Study Buddy"**
3. **Verify:**
   - ✅ Redirects to Dashboard
   - ✅ Study Buddy tab auto-opens
   - ✅ Quiz context pre-loaded in chat
   - ✅ Can ask questions about quiz topics

#### Test 3: Dashboard Navigation

1. Test all tabs:
   - ✅ **Overview** → Shows stats, graphs, AI insights
   - ✅ **Details** → Shows quiz history table
   - ✅ **Insights** → Shows AI recommendations
   - ✅ **Study Buddy** → Opens chat interface
   - ✅ **Goals** → Shows learning goals
   - ✅ **Quests** → Shows realm selection
2. **Verify:**
   - ✅ Smooth transitions with fade animations
   - ✅ Active tab highlighted with gradient
   - ✅ State persists when switching tabs
   - ✅ No console errors

#### Test 4: Responsive Design

1. Open DevTools (F12)
2. Test different screen sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)
3. **Verify all components:**
   - ✅ Monaco Editor adjusts height
   - ✅ Quest cards stack properly
   - ✅ Decision buttons remain readable
   - ✅ Navigation tabs responsive
   - ✅ No horizontal scroll

---

## Troubleshooting

### Common Issues

#### Issue 1: Monaco Editor Not Loading

**Symptoms:** Blank editor, console error about @monaco-editor/react

**Solution:**

```bash
cd frontend
npm install @monaco-editor/react
npm run dev
```

#### Issue 2: Advanced Questions Don't Appear

**Symptoms:** Only MCQ questions show, even with type='code'

**Checklist:**

1. ✅ Question has `type` field set ('code', 'reasoning', 'scenario')
2. ✅ QuizTaker.jsx imports all three components
3. ✅ Conditional rendering logic correct
4. ✅ Backend returns question with correct structure

#### Issue 3: Code Execution Fails

**Symptoms:** "Execution failed" error when running tests

**Solutions:**

1. Check quiz-service is running on port 3002
2. Verify `/api/advanced-questions/execute-code` endpoint exists
3. Check backend logs for errors
4. Ensure codeExecutor.js is properly configured

#### Issue 4: AI Feedback Not Working

**Symptoms:** "Failed to get AI feedback" error

**Solutions:**

1. Verify Gemini API key in quiz-service .env:
   ```
   GEMINI_API_KEY=AIzaSyD-xT49yfBFF47BSNstwjjcd2ImzXt8X7Q
   GEMINI_MODEL=gemini-2.5-flash
   ```
2. Check reasoningEvaluator.js imports Gemini correctly
3. Test API key with curl:
   ```bash
   curl -H "x-goog-api-key: YOUR_KEY" \
     https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
   ```

#### Issue 5: Quests Not Loading

**Symptoms:** Empty realm or "Failed to load quests" error

**Solutions:**

1. Verify gamification-service running on port 3007
2. Check if quests exist in database:
   ```bash
   # Connect to MongoDB
   use cognito_learning_hub
   db.quests.find().count()
   ```
3. Seed quest data if needed (check for seed script)
4. Verify authentication token is valid

#### Issue 6: Scenario Decisions Not Working

**Symptoms:** Clicking decisions doesn't progress scenario

**Solutions:**

1. Check scenarioConfig structure has `nextScenario` field
2. Verify scenario IDs match between `scenarios` array
3. Check console for JavaScript errors
4. Ensure state updates are not mutating directly

---

## API Endpoint Testing

### Manual API Tests

#### Test Code Execution Endpoint

```bash
# POST to execute code
curl -X POST http://localhost:3002/api/advanced-questions/execute-code \
  -H "Content-Type: application/json" \
  -H "x-auth-token: YOUR_TOKEN" \
  -d '{
    "code": "function arraySum(arr) { return arr.reduce((a,b)=>a+b,0); }",
    "language": "javascript",
    "testCases": [
      {"input": [1,2,3], "expectedOutput": 6}
    ]
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "passed": true,
        "expected": 6,
        "actual": 6
      }
    ]
  }
}
```

#### Test Reasoning Evaluation Endpoint

```bash
curl -X POST http://localhost:3002/api/advanced-questions/evaluate-reasoning \
  -H "Content-Type: application/json" \
  -H "x-auth-token: YOUR_TOKEN" \
  -d '{
    "questionId": "QUESTION_ID",
    "answer": "A",
    "reasoning": "Climate change affects all ecosystems...",
    "correctAnswer": "A"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "isCorrect": true,
    "reasoningScore": 8,
    "feedback": "Strong explanation...",
    "strengths": ["Clear evidence", "Logical flow"],
    "improvements": ["Add more specific examples"]
  }
}
```

#### Test Quest Endpoints

```bash
# Get quests for a realm
curl http://localhost:3007/api/gamification/quests/realm/Mathematics%20Kingdom \
  -H "x-auth-token: YOUR_TOKEN"

# Start a quest
curl -X POST http://localhost:3007/api/gamification/quests/start/QUEST_ID \
  -H "x-auth-token: YOUR_TOKEN"

# Get my active quests
curl http://localhost:3007/api/gamification/quests/my-quests \
  -H "x-auth-token: YOUR_TOKEN"
```

---

## Performance Testing

### Load Testing Checklist

1. **Code Execution:**

   - ✅ Run 10 code tests simultaneously
   - ✅ Check response time < 5 seconds
   - ✅ Verify no memory leaks

2. **AI Reasoning:**

   - ✅ Submit 5 reasoning explanations
   - ✅ Check Gemini API rate limits
   - ✅ Verify response time < 10 seconds

3. **Quest Loading:**
   - ✅ Load realm with 50+ quests
   - ✅ Check rendering performance
   - ✅ Verify pagination (if implemented)

---

## Browser Compatibility

Test on:

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Chrome (Android)
- ✅ Mobile Safari (iOS)

---

## Checklist Summary

### Before Testing

- [ ] All services running
- [ ] Database seeded with test data
- [ ] Test user account created
- [ ] Monaco Editor installed
- [ ] API keys configured

### Feature Tests

- [ ] Code questions work in all languages
- [ ] Test execution shows correct results
- [ ] Reasoning AI feedback appears
- [ ] Word counter validates correctly
- [ ] Scenario decisions progress
- [ ] State tracking works
- [ ] Quest realms load
- [ ] NPC dialogs display
- [ ] Quest start/complete flow works

### Integration Tests

- [ ] Mixed quiz types work
- [ ] Navigation between features smooth
- [ ] Dashboard tabs all functional
- [ ] Mobile responsive

### Bug Reporting

If you find issues, report with:

1. **Feature:** Which feature (Code/Reasoning/Scenario/Quest)
2. **Steps:** How to reproduce
3. **Expected:** What should happen
4. **Actual:** What actually happened
5. **Browser:** Chrome/Firefox/etc
6. **Console Errors:** Any JavaScript errors
7. **Screenshots:** If UI issue

---

## Next Steps

After testing current features:

1. **Task 6:** Test World Events Dashboard (when implemented)
2. **Task 7:** Test Time-Travel Quiz Mode (when implemented)
3. **Task 8:** Test navigation enhancements
4. **Tasks 9-10:** Verify security fixes

---

## Support

For issues or questions:

- Check console logs (F12 → Console)
- Check network requests (F12 → Network)
- Review backend logs in terminals
- Verify MongoDB data structure

**Happy Testing! 🚀**
