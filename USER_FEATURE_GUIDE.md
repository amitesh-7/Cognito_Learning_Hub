# 📚 Cognito Learning Hub - User Feature Guide

## 📋 Table of Contents
1. [Getting Started](#getting-started)
2. [Quiz Generation Features](#quiz-generation-features)
3. [Taking Quizzes](#taking-quizzes)
4. [Live Sessions & Multiplayer](#live-sessions--multiplayer)
5. [1v1 Duel Battles](#1v1-duel-battles)
6. [AI Tutor & Doubt Solver](#ai-tutor--doubt-solver)
7. [Gamification System](#gamification-system)
8. [Social Features](#social-features)
9. [Video Meetings](#video-meetings)
10. [Dashboard & Analytics](#dashboard--analytics)

---

## 🚀 Getting Started

### Creating an Account

#### Method 1: Email Registration
1. Visit the homepage: https://quizwise-ai.live
2. Click **"Sign Up"** button
3. Fill in the registration form:
   - Full Name
   - Email Address
   - Password (minimum 8 characters)
   - Role: Select Student or Teacher
4. Click **"Create Account"**
5. You'll be automatically logged in

#### Method 2: Google Sign-In
1. Click **"Continue with Google"**
2. Select your Google account
3. Grant permissions
4. Choose your role (Student/Teacher)
5. Account created instantly!

### User Roles

**👨‍🎓 Student Features:**
- Take unlimited quizzes
- Join live sessions
- Participate in duels
- Track progress & achievements
- Chat with friends
- Join video meetings

**👨‍🏫 Teacher Features:**
- All student features PLUS:
- Create AI-generated quizzes
- Upload PDFs for quiz generation
- Host live quiz sessions
- Create video meetings
- View student analytics
- Moderate content

---

## 🧠 Quiz Generation Features

### Overview
Teachers can generate quizzes using **4 different methods**, all powered by Google Gemini AI.

---

### Method 1: Topic-Based Quiz Generation

**Best for:** Quick quiz creation on any subject

#### Step-by-Step Process:

1. **Access Quiz Studio**
   - Log in as Teacher
   - Click **"Dashboard"** → **"Create Quiz"**
   - Select **"AI Topic Generator"** card

2. **Enter Topic Details**
   ```
   📝 Fields to fill:
   - Topic/Subject: e.g., "Python Programming Basics"
   - Number of Questions: 5-50 (default: 10)
   - Difficulty Level: Easy | Medium | Hard | Expert
   - Quiz Title: Auto-generated or custom
   - Description: Optional context
   ```

3. **Advanced Options** (Optional)
   - ✅ **Use Adaptive Learning**: AI adjusts difficulty based on student performance
   - ✅ **Make Public**: Allow all users to access
   - ✅ **Enable Time Bonuses**: Reward fast answers
   - ✅ **Show Leaderboard**: Competitive mode

4. **Generate Quiz**
   - Click **"Generate Quiz"** button
   - AI processes in background (15-30 seconds)
   - Real-time progress indicator shown

5. **Review & Edit**
   ```
   Generated quiz appears with:
   - All questions and options
   - Correct answers marked
   - Explanations for each answer
   - Edit button for modifications
   ```

6. **Save & Publish**
   - Review all questions
   - Click **"Save Quiz"**
   - Quiz now available in "My Quizzes"

#### Example Flow:
```
Topic Input → AI Processing → Quiz Generated → Review → Publish → Ready to Use
   (5s)          (15-30s)         (10s)        (30s)     (2s)      (✓)
```

#### Tips:
- 💡 Be specific with topics: "JavaScript ES6 Features" > "JavaScript"
- 💡 Use adaptive learning for personalized difficulty
- 💡 Add descriptions to provide context to students

---

### Method 2: PDF Upload Quiz Generation

**Best for:** Converting study materials, textbooks, notes into quizzes

#### Step-by-Step Process:

1. **Navigate to PDF Generator**
   - Dashboard → **"Create Quiz"** → **"PDF Upload"**

2. **Prepare Your PDF**
   ```
   ✅ Supported formats: PDF
   ✅ Maximum size: 10 MB
   ✅ Best results: Text-based PDFs (not scanned images)
   ✅ Recommended pages: 5-50 pages
   ```

3. **Upload File**
   ```
   📤 Upload Options:
   - Drag & drop PDF file
   - Click "Browse" to select file
   - File validation happens instantly
   ```

4. **Configure Quiz Settings**
   ```
   Settings:
   - Number of Questions: 5-30
   - Difficulty: Auto-detect or Manual
   - Focus Areas: Specific sections (optional)
   - Question Types: Multiple choice, True/False, etc.
   ```

5. **AI Processing**
   ```
   Background Process:
   1. PDF text extraction (5-10s)
   2. Content analysis by AI (10-20s)
   3. Question generation (10-15s)
   4. Answer validation (5s)
   
   Total Time: 30-50 seconds
   ```

6. **Review Generated Quiz**
   - AI extracts key concepts from PDF
   - Questions cover main topics
   - Answers include page references
   - Edit any question as needed

7. **Publish**
   - Add final touches
   - Set visibility (Public/Private)
   - Click **"Publish Quiz"**

#### Example Use Cases:
- 📚 Convert textbook chapters into revision quizzes
- 📄 Turn lecture notes into practice tests
- 📊 Generate quizzes from research papers
- 📖 Create assessments from study guides

#### Best Practices:
- ✅ Use clear, well-formatted PDFs
- ✅ Break large documents into smaller sections
- ✅ Review all generated questions for accuracy
- ✅ Add explanations to clarify complex topics

---

### Method 3: YouTube Video Quiz Generation

**Best for:** Educational videos, lectures, tutorials

#### Step-by-Step Process:

1. **Access YouTube Generator**
   - Dashboard → **"Create Quiz"** → **"YouTube Video"**

2. **Find Your Video**
   ```
   Compatible Videos:
   ✅ Educational content
   ✅ Lectures and tutorials
   ✅ Videos with captions/transcripts
   ✅ English language (primary)
   ```

3. **Enter Video URL**
   ```
   📹 Paste YouTube URL:
   Example: https://www.youtube.com/watch?v=dQw4w9WgXcQ
   
   System validates:
   - Video exists
   - Transcript available
   - Duration (recommended: 5-60 minutes)
   ```

4. **Configure Quiz**
   ```
   Settings:
   - Number of Questions: 5-20
   - Focus: Entire video or specific timestamps
   - Question Style: Conceptual | Factual | Mixed
   ```

5. **AI Generation Process**
   ```
   Steps:
   1. Fetch video transcript (10s)
   2. Analyze content and key points (15s)
   3. Generate questions (15s)
   4. Create answer explanations (10s)
   
   Total: ~50 seconds
   ```

6. **Review & Enhance**
   - Questions based on video content
   - Timestamps included for reference
   - Edit questions/answers as needed
   - Add video embed (optional)

7. **Publish Quiz**
   - Set as companion to video
   - Share with students
   - Track completion

#### Example Scenarios:
- 🎓 Create quizzes for online course videos
- 🔬 Test understanding of science experiments
- 💻 Generate coding challenges from programming tutorials
- 📊 Build assessments from educational webinars

#### Pro Tips:
- 💡 Choose videos with clear audio and captions
- 💡 Longer videos = more comprehensive quizzes
- 💡 Add video embed in quiz description for context
- 💡 Use timestamps in questions for specific topics

---

### Method 4: Manual Quiz Creation

**Best for:** Complete control, custom questions, specific assessments

#### Step-by-Step Process:

1. **Start Manual Creator**
   - Dashboard → **"Create Quiz"** → **"Manual Editor"**

2. **Quiz Information**
   ```
   Basic Details:
   - Quiz Title: Required
   - Description: Provide context
   - Category: Subject/Topic
   - Tags: For searchability
   - Difficulty: Easy | Medium | Hard | Expert
   ```

3. **Add Questions** (Repeat for each)
   
   **Question Types:**
   
   **A. Multiple Choice**
   ```
   ✍️ Question text
   ✍️ Option A
   ✍️ Option B
   ✍️ Option C
   ✍️ Option D
   ✅ Mark correct answer
   📝 Explanation (optional)
   ⏱️ Time limit (10-120 seconds)
   ⭐ Points (5-20)
   ```
   
   **B. True/False**
   ```
   ✍️ Statement
   ☑️ True / False
   📝 Explanation
   ⏱️ Time limit
   ⭐ Points
   ```
   
   **C. Fill in the Blank**
   ```
   ✍️ Question with _____ blank
   ✍️ Correct answer
   📝 Explanation
   ⏱️ Time limit
   ⭐ Points
   ```

4. **Configure Game Settings**
   ```
   Options:
   ☑️ Enable hints (deducts points)
   ☑️ Time bonuses for fast answers
   ☑️ Streak bonuses for consecutive correct
   ☑️ Show leaderboard after completion
   ☑️ Allow quiz retakes
   ☑️ Randomize question order
   ☑️ Randomize option order
   ```

5. **Preview Quiz**
   - Take quiz as student
   - Check question flow
   - Test timer functionality
   - Verify scoring

6. **Publish Settings**
   ```
   Visibility:
   🌍 Public: All users can access
   🔒 Private: Only invited users
   👥 Friends: Only your connections
   
   Access Control:
   - Require password
   - Set availability dates
   - Limit attempts per user
   ```

7. **Save & Publish**
   - Click **"Save Draft"** to continue later
   - Click **"Publish"** to make live
   - Share quiz link or code

#### Advanced Features:

**Question Bank:**
- Import questions from previous quizzes
- Create reusable question templates
- Organize by topics/categories

**Multimedia Support:**
- Add images to questions
- Embed videos (YouTube)
- Include code snippets (syntax highlighted)
- Audio questions (future feature)

**Adaptive Options:**
- Difficulty adjustment based on performance
- Personalized question selection
- Smart recommendations

---

## 📝 Taking Quizzes

### Finding Quizzes

#### Browse Public Quizzes
1. Go to **"Explore Quizzes"**
2. Filter by:
   - 🎯 Difficulty: Easy → Expert
   - 📚 Category: Math, Science, History, etc.
   - ⭐ Rating: High to Low
   - 🔥 Popular: Most attempted
   - 🆕 Recent: Newest first

#### Search Quizzes
```
🔍 Search options:
- By title: "Python Quiz"
- By creator: "Teacher Name"
- By tags: #programming #beginner
- By code: 6-digit quiz code
```

#### My Quizzes Dashboard
- ✅ Completed quizzes
- 📋 In Progress
- ⭐ Saved/Bookmarked
- 🎯 Recommended for You

---

### Quiz-Taking Experience

#### Starting a Quiz

1. **Select Quiz**
   - Click on quiz card
   - View details: Questions, Time, Difficulty

2. **Pre-Quiz Screen**
   ```
   Information Shown:
   - Quiz title and description
   - Number of questions
   - Total time (if timed)
   - Passing score
   - Creator name
   - Average score
   - Number of attempts
   ```

3. **Start Quiz**
   - Click **"Start Quiz"** button
   - Quiz loads with first question
   - Timer starts (if enabled)

---

#### During the Quiz

**Question Interface:**
```
┌─────────────────────────────────────┐
│  Question 3 of 10      ⏱️ 0:25      │
├─────────────────────────────────────┤
│                                     │
│  What is the output of:             │
│  print(2 ** 3)                      │
│                                     │
│  ⭕ A) 6                             │
│  ⭕ B) 8                             │
│  ⭕ C) 9                             │
│  ⭕ D) 23                            │
│                                     │
│  💡 Hint Available (-5 points)      │
│                                     │
│  [Previous]  [Submit Answer] [Next] │
└─────────────────────────────────────┘
```

**Features:**
- ⏱️ **Timer**: Countdown per question (if enabled)
- 💡 **Hints**: Click to reveal (point deduction)
- 🎨 **Highlighting**: Click to select answer
- ⏭️ **Navigation**: Jump to any question
- 💾 **Auto-save**: Progress saved automatically
- ⏸️ **Pause**: Save and continue later

**Scoring Elements:**
```
Base Score: Correct answer × Points
+ Time Bonus (fast answers)
+ Streak Bonus (consecutive correct)
- Hint Penalty (if used)
= Final Score
```

---

#### After Each Question

**Immediate Feedback (if enabled):**
```
✅ Correct Answer!
   +10 points
   +2 bonus (answered in 8s)
   
   Explanation:
   2 ** 3 means 2 to the power of 3,
   which equals 2 × 2 × 2 = 8
   
   [Continue to Next Question]
```

**Wrong Answer:**
```
❌ Incorrect
   Correct answer was: B) 8
   
   Explanation:
   The ** operator in Python is used for
   exponentiation, not multiplication.
   
   [Continue]
```

---

#### Quiz Completion

**Results Screen:**
```
🎉 Quiz Completed!

Your Score: 85/100 (85%)
━━━━━━━━━━━━━━━━━━━━

📊 Performance Breakdown:
   ✅ Correct: 8/10 questions
   ❌ Wrong: 2/10 questions
   ⏱️ Time: 4:23 / 5:00
   ⚡ Avg per question: 26s
   
🎯 Accuracy: 80%
⚡ Speed Bonus: +5 points
🔥 Streak Bonus: +10 points
💡 Hints Used: 1 (-5 points)

🏆 Rank: #12 / 156 attempts

📈 XP Earned: +120 XP
🎖️ Achievements Unlocked:
   - "Quick Thinker" (Answer 5 questions under 10s)
   - "Speed Demon" (Complete quiz under 5 minutes)

[View Detailed Results] [Retake Quiz] [Share]
```

---

#### Detailed Results

**Question-by-Question Analysis:**
```
Question 1: ✅ Correct
  Your answer: B
  Time taken: 12s
  Points: 10 + 2 (time bonus)

Question 2: ✅ Correct
  Your answer: C
  Time taken: 8s
  Points: 10 + 3 (time bonus)

Question 3: ❌ Wrong
  Your answer: D
  Correct answer: B
  Time taken: 25s
  Points: 0
  
  💭 What you missed:
  Remember that ** is the exponentiation 
  operator in Python, not multiplication.
```

**Performance Charts:**
```
📊 Category Breakdown:
   Syntax:      4/4  (100%)  ████████████
   Logic:       2/3  (67%)   ████████░░░░
   Functions:   2/3  (67%)   ████████░░░░

📈 Difficulty Analysis:
   Easy:        3/3  (100%)
   Medium:      4/5  (80%)
   Hard:        1/2  (50%)

⏱️ Time Distribution:
   Questions answered under 15s: 6
   Questions over 20s: 2
```

---

#### Post-Quiz Actions

**Options Available:**
1. 🔄 **Retake Quiz**: Try again to improve score
2. 📤 **Share Results**: Social media, friends
3. 📊 **View Leaderboard**: See rankings
4. 💾 **Save for Review**: Bookmark for later
5. ⭐ **Rate Quiz**: Provide feedback
6. 🎯 **Get Recommendations**: Similar quizzes

---

## 🎮 Live Sessions & Multiplayer

### Overview
Host real-time quiz sessions where multiple players compete simultaneously, similar to Kahoot!

---

### Hosting a Live Session (Teacher)

#### Step 1: Create Session

1. **Navigate to Live Sessions**
   - Dashboard → **"Live Sessions"** → **"Host Session"**

2. **Select Quiz**
   ```
   Options:
   - Choose from your quizzes
   - Select public quiz
   - Create new quiz on-the-fly
   ```

3. **Configure Session**
   ```
   Settings:
   ☑️ Allow late join (players can join after start)
   ☑️ Show leaderboard after each question
   ☑️ Randomize question order
   ☑️ Time per question: 10-120 seconds
   ☑️ Auto-advance to next question
   ☑️ Show correct answer after each
   ☑️ Enable chat during session
   ```

4. **Generate Session Code**
   - System creates 6-digit code (e.g., **456789**)
   - Share code with students
   - Display QR code for easy join

---

#### Step 2: Waiting Room

**Host Dashboard:**
```
┌─────────────────────────────────────────┐
│  Session Code: 456789                   │
│  Join at: quizwise-ai.live/join         │
│                                         │
│  📱 [QR Code]                           │
│                                         │
│  👥 Players Waiting: 12                 │
│                                         │
│  Players List:                          │
│  1. Alice Johnson         🟢           │
│  2. Bob Smith            🟢           │
│  3. Carol Davis          🟢           │
│  ...                                    │
│                                         │
│  [Start Session] [Cancel]               │
└─────────────────────────────────────────┘
```

**Features:**
- Real-time player join notifications
- See player names as they join
- Kick unwanted players
- Chat with participants
- Audio/visual cues when players join

---

#### Step 3: Running the Session

**Host Control Panel:**
```
┌─────────────────────────────────────────┐
│  Question 3/10        ⏱️ Time: 25s      │
│  Players: 12          🎯 Answered: 8    │
├─────────────────────────────────────────┤
│                                         │
│  What is 2 + 2?                         │
│                                         │
│  A) 3   [████░░] 2 players             │
│  B) 4   [████████] 8 players ✅        │
│  C) 5   [██░░░░] 1 player              │
│  D) 6   [██░░░░] 1 player              │
│                                         │
│  [⏸️ Pause] [⏭️ Skip] [💬 Chat] [🚪 End]│
└─────────────────────────────────────────┘
```

**Host Actions:**
- ⏸️ **Pause**: Freeze timer
- ⏭️ **Skip**: Move to next question
- 🔄 **Repeat**: Show question again
- 💬 **Announce**: Send message to all
- 🚪 **End Early**: Finish session

**Real-time Stats:**
- How many answered
- Answer distribution (live graph)
- Fastest player
- Current leaderboard

---

#### Step 4: Between Questions

**Leaderboard Display:**
```
🏆 Top 5 Leaderboard

1. 👑 Alice Johnson      850 pts  ⚡⚡⚡
2. 🥈 Bob Smith         820 pts  ⚡⚡
3. 🥉 Carol Davis       800 pts  ⚡⚡
4.    David Lee         750 pts  ⚡
5.    Emma Wilson       720 pts  ⚡

💎 Most Improved: Bob (+150)
⚡ Fastest Answer: Alice (3.2s)

[Continue to Next Question]
```

**Host Options:**
- Show full leaderboard
- Highlight top performers
- Display statistics
- Give shoutouts
- Continue to next question

---

#### Step 5: Session End

**Final Results:**
```
🎉 Session Completed!

📊 Session Stats:
   Total Players: 12
   Questions: 10
   Duration: 8:45
   Avg. score: 73%

🏆 Final Leaderboard:
   1. Alice Johnson - 920 pts
   2. Bob Smith - 880 pts
   3. Carol Davis - 850 pts
   ...

📈 Question Analysis:
   Easiest: Q7 (92% correct)
   Hardest: Q4 (35% correct)
   Fastest avg: Q2 (8.2s)

[Export Results] [View Details] [Close]
```

---

### Joining a Live Session (Student)

#### Step 1: Join with Code

1. **Navigate to Join Page**
   - Homepage → **"Join Live Session"**
   - Or direct: quizwise-ai.live/join

2. **Enter Session Code**
   ```
   ┌─────────────────────────────┐
   │  Enter Session Code         │
   │                             │
   │  [4] [5] [6] [7] [8] [9]   │
   │                             │
   │  [Join Session]             │
   └─────────────────────────────┘
   ```

3. **Enter Display Name**
   - Auto-filled if logged in
   - Or enter nickname

4. **Join Waiting Room**
   ```
   ✅ Connected!
   
   Waiting for host to start...
   
   Players: 12
   
   Tips:
   - Answer quickly for bonus points
   - Streak of 3+ earns extra points
   - First correct answer gets +50 pts
   ```

---

#### Step 2: Playing Live

**Player Screen:**
```
┌─────────────────────────────────────┐
│  Question 3/10      ⏱️ 18s           │
│  Your Score: 250                    │
│  Rank: #4 / 12      🔥 Streak: 2    │
├─────────────────────────────────────┤
│                                     │
│  What is the capital of France?     │
│                                     │
│  ┌──────┐  ┌──────┐                │
│  │  A   │  │  B   │                │
│  │London│  │Paris │                │
│  └──────┘  └──────┘                │
│                                     │
│  ┌──────┐  ┌──────┐                │
│  │  C   │  │  D   │                │
│  │Berlin│  │Madrid│                │
│  └──────┘  └──────┘                │
│                                     │
└─────────────────────────────────────┘
```

**Interaction:**
- Tap/Click answer button
- Immediate visual feedback
- Wait for next question
- See personal score update

---

#### Step 3: After Each Question

**Answer Reveal:**
```
✅ Correct!

The answer was: B) Paris

+10 points (correct answer)
+5 points (answered in 7s)
+3 points (streak bonus x2)
━━━━━━━━━━━━━━━━━━━
Total: +18 points

Your Score: 268
Your Rank: #3 (↑1) 🎉

Leaderboard:
1. Alice - 285
2. Bob - 275
3. YOU - 268 👈
4. Carol - 265
```

---

#### Step 4: Final Results

**Personal Results:**
```
🎊 Great Job!

Final Score: 885 points
Final Rank: #2 / 12 🥈

Your Performance:
✅ Correct: 9/10 (90%)
⚡ Avg time: 9.2s
🔥 Longest streak: 6
🏃 Fastest answer: 3.1s (Q7)

🎖️ Badges Earned:
- "Speed Demon" (5+ under 5s)
- "Consistent Player" (80%+ accuracy)
- "Silver Medal" (Top 3 finish)

📈 +180 XP earned
🏆 Achievement Unlocked: "Podium Finish"

[View Full Results] [Play Again]
```

---

## ⚔️ 1v1 Duel Battles

### Overview
Challenge friends or random players to head-to-head quiz battles in real-time.

---

### Creating a Duel

#### Step 1: Challenge Setup

1. **Navigate to Duels**
   - Dashboard → **"Duel Mode"** → **"New Duel"**

2. **Choose Opponent**
   ```
   Options:
   👥 Challenge Friend (from friend list)
   🎲 Random Opponent (matchmaking)
   🤖 AI Opponent (practice)
   ```

3. **Select Quiz**
   ```
   Options:
   - Random quiz (system selected)
   - Choose from public quizzes
   - Quick match (5-10 questions)
   - Long match (20-30 questions)
   ```

4. **Configure Rules**
   ```
   Settings:
   ⏱️ Time per question: 15s / 30s / 45s
   🎯 Number of questions: 5 / 10 / 15
   💪 Difficulty: Any / Easy / Medium / Hard
   🎮 Mode: Sprint / Marathon / Sudden Death
   ```

---

#### Step 2: Sending Challenge

**Challenge Sent:**
```
⚔️ Duel Challenge Sent!

To: Bob Smith
Quiz: "General Knowledge"
Questions: 10
Time limit: 30s per question

Status: Waiting for acceptance...

Bob has 5 minutes to respond.

[Cancel Challenge]
```

**Opponent Receives:**
```
🔔 New Duel Challenge!

From: Alice Johnson
Quiz: "General Knowledge"

Details:
- 10 questions
- 30s per question
- Medium difficulty

[Accept Challenge] [Decline]
```

---

#### Step 3: Battle Begins

**Countdown Screen:**
```
⚔️ DUEL STARTING!

Alice  vs  Bob

Get ready in...

    3
    
[Same quiz, different order]
[May the best player win!]
```

---

#### Step 4: During Battle

**Split-Screen Interface:**
```
┌───────────────┬───────────────┐
│    ALICE      │      BOB      │
│   Score: 80   │   Score: 70   │
│   Q: 3/10     │   Q: 3/10     │
├───────────────┼───────────────┤
│               │               │
│  [YOUR VIEW]  │  [OPPONENT]   │
│               │               │
│  Question 3:  │   ⏱️ 18s      │
│               │               │
│  [Active quiz]│  💭 Thinking  │
│               │               │
└───────────────┴───────────────┘
```

**Real-Time Updates:**
- See opponent's progress (questions answered)
- Live score comparison
- Visual indicators when opponent answers
- Time pressure display
- Streak animations

---

#### Step 5: Battle Results

**Winner Announcement:**
```
🏆 VICTORY!

┌─────────────────────────────┐
│      ALICE  vs  BOB         │
│                             │
│   Score:                    │
│   920    >    850           │
│                             │
│   Accuracy:                 │
│   90%    >    80%           │
│                             │
│   Avg Time:                 │
│   12.3s  <    15.7s         │
│                             │
│   Winner: ALICE! 👑         │
└─────────────────────────────┘

Rewards:
+200 XP
+50 Duel Rating
Achievement: "Duel Master" (10 wins)

[Rematch] [Challenge Others] [Home]
```

**Detailed Comparison:**
```
Question-by-Question:

Q1:  ✅ Alice (8s)   ✅ Bob (12s)   → Alice +2
Q2:  ✅ Alice (10s)  ❌ Bob (15s)   → Alice +12
Q3:  ✅ Alice (15s)  ✅ Bob (18s)   → Alice +3
Q4:  ❌ Alice (20s)  ✅ Bob (10s)   → Bob +10
Q5:  ✅ Alice (7s)   ✅ Bob (8s)    → Alice +1
...

Final: Alice wins by 70 points!
```

---

### Duel Modes

**Sprint Mode** (5 minutes max)
- Fast-paced
- 5-10 questions
- Quick matches
- Bonus for speed

**Marathon Mode** (20 minutes)
- Endurance test
- 20-30 questions
- Stamina matters
- Consistency rewarded

**Sudden Death**
- First wrong answer loses
- High stakes
- Perfect accuracy required
- Maximum pressure

---

### Duel Rankings

**Rating System:**
```
🏆 Duel Rating: 1850

Rank: Gold III
━━━━━━━━━━━━ 75%

Next Rank: Gold II (1900)

Season Stats:
Wins: 45
Losses: 23
Win Rate: 66.2%
Streak: 3 wins 🔥

Global Rank: #234 / 15,000
```

---

## 🤖 AI Tutor & Doubt Solver

### Overview
24/7 AI-powered assistant using Google Gemini for instant doubt resolution.

---

### Accessing AI Tutor

1. **Open AI Tutor**
   - Dashboard → **"AI Tutor"**
   - Or floating button (bottom-right)
   - Keyboard shortcut: `Ctrl + /`

2. **Interface**
   ```
   ┌─────────────────────────────────────┐
   │  🤖 AI Tutor - Powered by Gemini    │
   ├─────────────────────────────────────┤
   │                                     │
   │  💬 How can I help you learn today? │
   │                                     │
   │  Quick Actions:                     │
   │  🔍 Explain a concept               │
   │  ❓ Solve a problem                 │
   │  📝 Get examples                    │
   │  💡 Study tips                      │
   │                                     │
   │  [Type your question...]            │
   └─────────────────────────────────────┘
   ```

---

### Using AI Tutor

#### Asking Questions

**Question Types:**
```
Conceptual:
"What is photosynthesis?"
"Explain recursion in programming"
"How does gravity work?"

Problem-Solving:
"Solve: 2x + 5 = 15"
"Debug this Python code: [paste code]"
"What's 25% of 80?"

Examples:
"Give me examples of metaphors"
"Show me how to use CSS flexbox"
"What are examples of renewable energy?"

Study Tips:
"How to prepare for math exam?"
"Best way to memorize vocabulary?"
"Tips for time management"
```

---

#### AI Response

**Example Interaction:**
```
You: What is photosynthesis?

AI Tutor 🤖:
Photosynthesis is the process by which plants 
convert sunlight into energy. Here's how it works:

🌱 Simple Explanation:
Plants use sunlight, water (H₂O), and carbon 
dioxide (CO₂) to create glucose (sugar) and 
oxygen (O₂).

📝 The Equation:
6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂

🔍 Key Points:
1. Happens in chloroplasts
2. Uses chlorophyll (green pigment)
3. Two stages: Light reactions & Calvin cycle

💡 Real-World Example:
When you water a plant and place it in sunlight,
it "eats" by making its own food!

❓ Related Questions:
- What is cellular respiration?
- How do plants get water?
- Why are leaves green?

[✅ Helpful] [❌ Not Helpful] [📚 More Info]
```

---

#### Advanced Features

**Code Assistance:**
```
You: Debug this code
```python
def factorial(n):
    if n = 0:
        return 1
    return n * factorial(n-1)
```

AI Tutor 🤖:
Found issues in your code! 🔍

❌ Line 2: Syntax Error
   if n = 0:  ← Should use == for comparison
   
✅ Fixed Code:
```python
def factorial(n):
    if n == 0:  # Comparison operator
        return 1
    return n * factorial(n-1)
```

💡 Explanation:
- `=` is assignment operator
- `==` is comparison operator
- Condition needs `==` to check equality

🧪 Test:
factorial(5) → 120 ✓
factorial(0) → 1 ✓

[Run Code] [Save] [More Examples]
```

---

**Visual Explanations:**
```
You: How does a for loop work?

AI Tutor 🤖:
Let me explain with an animation! 🎨

[Visual representation]:
```
for i in range(5):
    print(i)

Step-by-step execution:
i = 0 → Print 0
i = 1 → Print 1
i = 2 → Print 2
i = 3 → Print 3
i = 4 → Print 4
Loop ends
```

[▶️ Play Animation] [💾 Save Explanation]
```

---

**Study Plans:**
```
You: Help me prepare for Python exam next week

AI Tutor 🤖:
Created a 7-day study plan for you! 📚

Day 1 (Today): Basics Review
- Variables & data types (30 min)
- Quiz: "Python Fundamentals" 
- Practice: 5 coding exercises

Day 2: Control Flow
- If/else statements (25 min)
- Loops: for & while (25 min)
- Quiz: "Control Structures"

Day 3: Functions
- Function definition (20 min)
- Parameters & returns (20 min)
- Practice: 10 function problems

...

📊 Estimated Study Time: 3 hours total
🎯 Success Rate: 85% (based on your level)

[Start Day 1] [Customize Plan] [Set Reminders]
```

---

### AI Tutor Features

**Capabilities:**
- ✅ Explain concepts in simple terms
- ✅ Solve math problems step-by-step
- ✅ Debug code and explain errors
- ✅ Provide examples and analogies
- ✅ Create practice questions
- ✅ Study plan generation
- ✅ Multi-language support
- ✅ Visual aids and diagrams

**Context Awareness:**
- Remembers conversation history
- Adapts to your learning level
- References your quiz history
- Suggests relevant topics
- Progressive difficulty

---

## 🎮 Gamification System

### Overview
Earn XP, level up, unlock achievements, and compete on leaderboards!

---

### XP & Leveling

#### Earning XP

**Quiz Completion:**
```
XP Formula:
Base XP = 50 × (Difficulty Multiplier)
  - Easy: 0.5x (25 XP)
  - Medium: 1.0x (50 XP)
  - Hard: 1.5x (75 XP)
  - Expert: 2.0x (100 XP)

Bonuses:
+ Perfect Score: +100 XP
+ Fast Completion: +20 XP
+ Streak Bonus: +5 XP per question streak
+ First Attempt Pass: +30 XP

Example:
Medium quiz (50 XP) + Perfect score (100 XP) 
+ Fast (20 XP) = 170 XP total
```

**Other XP Sources:**
```
Daily Activities:
- Daily login: +10 XP
- First quiz of day: +20 XP
- Complete 3 quizzes: +50 XP

Social:
- Make a friend: +15 XP
- Join live session: +25 XP
- Win duel: +100 XP

Content Creation (Teachers):
- Create quiz: +50 XP
- Quiz taken by 10 people: +30 XP
- High-rated quiz: +100 XP

Achievements:
- Common: +50 XP
- Rare: +100 XP
- Epic: +250 XP
- Legendary: +500 XP
```

---

#### Level Progression

**Level System:**
```
Level 1:  0 - 100 XP       (Beginner)
Level 2:  100 - 283 XP     (Novice)
Level 3:  283 - 548 XP     (Learner)
Level 5:  918 - 1,118 XP   (Skilled)
Level 10: 2,962 - 3,162 XP (Expert)
Level 20: 8,844 - 8,944 XP (Master)
Level 50: 35,256 - 35,356  (Legend)

Formula: XP = 100 × level^1.5
```

**Level Up Rewards:**
```
🎉 Level 5 Reached!

Unlocked:
✨ New avatar items
🎨 Custom profile themes
💬 Group chat creation
🏆 Ranked duel access

Bonus:
+500 XP bonus
+5 hints
+3 streak freezes

[Claim Rewards]
```

---

### Achievement System

#### Achievement Categories

**1. Quiz Master Series**
```
📚 First Steps (Common)
Complete your first quiz
Reward: 50 XP

📚 Quiz Enthusiast (Rare)
Complete 50 quizzes
Reward: 100 XP

📚 Quiz Legend (Epic)
Complete 500 quizzes
Reward: 500 XP + "Legend" badge
```

**2. Perfect Scholar Series**
```
💯 Perfectionist (Rare)
Get 10 perfect scores
Reward: 100 XP

💯 Flawless (Epic)
Get 50 perfect scores
Reward: 250 XP + "Flawless" title
```

**3. Speed Demon Series**
```
⚡ Quick Thinker (Common)
Answer 5 questions under 10s
Reward: 50 XP

⚡ Lightning Fast (Epic)
Complete quiz in under 2 minutes
Reward: 300 XP + Speed badge
```

**4. Social Butterfly Series**
```
👥 Friend Maker (Common)
Add 5 friends
Reward: 50 XP

👥 Popular (Rare)
Have 50 friends
Reward: 150 XP

👥 Influencer (Epic)
100 friends + 1000 interactions
Reward: 500 XP + Influencer badge
```

**5. Streak King Series**
```
🔥 Hot Streak (Rare)
Maintain 7-day streak
Reward: 100 XP

🔥 Unstoppable (Epic)
Maintain 30-day streak
Reward: 500 XP + Streak badge

🔥 Legendary Streak (Legendary)
Maintain 365-day streak
Reward: 1000 XP + Exclusive avatar
```

---

#### Secret Achievements

**Hidden Until Unlocked:**
```
🤫 Night Owl
Complete 10 quizzes between 12 AM - 5 AM
Reward: 200 XP

🤫 Comeback Kid
Score 100% after getting 50% on same quiz
Reward: 150 XP

🤫 Lucky Seven
Complete 7 quizzes on 7th day of 7th month
Reward: 777 XP

🤫 Underdog Victory
Win duel against player 500+ rating higher
Reward: 500 XP
```

---

### Streaks

**Daily Streak System:**
```
🔥 Current Streak: 15 days

Day 1-6:   +10 XP per day
Day 7-13:  +20 XP per day
Day 14-29: +30 XP per day
Day 30+:   +50 XP per day

Streak Rewards:
Day 7:  "Week Warrior" badge
Day 30: "Monthly Master" badge
Day 100: Special avatar item
Day 365: Legendary status

⏰ Next reset: 8 hours

Streak Freezes: 2 available
[Use Freeze to protect streak]
```

---

### Leaderboards

**Leaderboard Types:**

**1. Global Leaderboard**
```
🌍 Global Rankings (Weekly)

Rank  Player          Level  XP This Week
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1.  👑 AliceTheGreat  25    15,420 XP
2.  🥈 BobMaster      23    14,850 XP
3.  🥉 CarolWiz       24    14,200 XP
...
234.  YOU             12     1,250 XP

Your rank improved by 45 this week! 📈

[View Full Rankings] [View Friends Only]
```

**2. Category Leaderboards**
```
📚 Math Wizards

Top Performers in Math Quizzes:
1. John Doe - Avg: 95%
2. Jane Smith - Avg: 94%
3. YOU - Avg: 92% 🎉
```

**3. Duel Rankings**
```
⚔️ Duel Masters

Rank  Player       Rating  W/L    Streak
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1.    ProPlayer     1950   45/5   🔥12
2.    QuizKing      1920   42/8   🔥8
3.    FastAF        1890   40/10  🔥5
```

**4. Teacher Rankings**
```
🏫 Top Quiz Creators

Rank  Teacher      Quizzes  Avg Rating  Takes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1.    Prof. Smith   150     4.9★        5,420
2.    Ms. Johnson   120     4.8★        4,850
3.    Mr. Williams  100     4.7★        3,200
```

---

### Profile & Badges

**Profile Display:**
```
┌─────────────────────────────────────┐
│  [Avatar]   Alice Johnson           │
│  Level 15   🔥 25-day streak         │
│                                     │
│  📊 Stats:                          │
│  - Total XP: 5,420                  │
│  - Quizzes Taken: 145               │
│  - Average Score: 87%               │
│  - Duels Won: 42 | Lost: 15        │
│                                     │
│  🏆 Achievements: 35/120            │
│  [Show All]                         │
│                                     │
│  🎖️ Featured Badges:                │
│  💯 Perfectionist                   │
│  ⚡ Speed Demon                     │
│  🔥 Hot Streak                      │
│  ⚔️ Duel Master                     │
│                                     │
│  🎨 Current Title:                  │
│  "The Quiz Master"                  │
│                                     │
│  [Edit Profile] [Share]             │
└─────────────────────────────────────┘
```

---

## 💬 Social Features

### Friends System

#### Adding Friends

**Method 1: Search**
```
1. Navigate to Social Dashboard
2. Click "Find Friends"
3. Search by:
   - Name
   - Email
   - Username
   - User ID
4. Send friend request
```

**Method 2: From Quiz**
```
After completing quiz, see other players
Click profile → Send friend request
```

**Method 3: From Live Session**
```
During/after live session
Click player name → Add Friend
```

---

#### Friend Requests

**Receiving Request:**
```
🔔 New Friend Request

From: Bob Smith
Level 12 | Avg Score: 85%
Mutual friends: 3

[Accept] [Decline] [View Profile]
```

**Managing Friends:**
```
👥 Friends List (47)

Online Now: 12 🟢

Alice Johnson 🟢
Bob Smith 🟢
Carol Davis 🟡 Away
David Lee ⚫ Offline

[Message] [Challenge to Duel] [View Profile]
```

---

### Chat System

#### Direct Messages

**Starting Chat:**
```
1. Go to Messages
2. Click "New Message"
3. Select friend
4. Type message
```

**Chat Interface:**
```
┌─────────────────────────────────────┐
│  💬 Chat with Bob Smith      🟢      │
├─────────────────────────────────────┤
│                                     │
│  You: Want to do a quiz duel?       │
│  10:32 AM                           │
│                                     │
│  Bob: Sure! Which topic? 🎯         │
│  10:33 AM                           │
│                                     │
│  You: How about science?            │
│  10:34 AM                           │
│                                     │
│  Bob: Let's do it! 🔥               │
│  10:34 AM                           │
│                                     │
│  [Challenge to Duel]                │
│                                     │
├─────────────────────────────────────┤
│  [Type a message...]          [Send]│
└─────────────────────────────────────┘
```

**Features:**
- ✅ Real-time messaging
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Emoji support
- ✅ Quiz/Duel invitations
- ✅ Image sharing
- ✅ Message history

---

#### Group Chats

**Creating Group:**
```
1. Messages → New Group
2. Name group
3. Add members (2-50)
4. Set group icon
5. Create
```

**Group Features:**
```
Group: Study Buddies (12 members)

Admin Controls:
- Add/remove members
- Change group info
- Pin messages
- Mute notifications
- Delete group

Member Permissions:
- Send messages
- Share media
- Create polls
- Invite friends
```

---

### Social Feed

**Feed Display:**
```
┌─────────────────────────────────────┐
│  📰 Social Feed                      │
├─────────────────────────────────────┤
│                                     │
│  Alice Johnson                      │
│  🏆 Unlocked achievement:           │
│  "Perfect 10" - 10 perfect scores!  │
│  2 hours ago                        │
│  👏 15 reactions | 💬 3 comments    │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Bob Smith                          │
│  📚 Completed quiz: Python Basics   │
│  Score: 95% 🎉                      │
│  1 hour ago                         │
│  👍 8 reactions | 💬 1 comment      │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  [Load More]                        │
└─────────────────────────────────────┘
```

**Post Types:**
- Quiz completions
- Achievement unlocks
- Duel victories
- Level ups
- Custom posts
- Quiz recommendations

---

### Challenge System

**Creating Challenge:**
```
💪 Create Challenge

Challenge Type:
○ Score Challenge (beat my score)
○ Time Challenge (complete faster)
○ Accuracy Challenge (higher %)

Select Quiz: [Choose Quiz ▼]

Challenge Message:
"Can you beat my 95%? 😎"

Send To:
☑️ Bob Smith
☑️ Carol Davis
☐ All Friends

[Send Challenge]
```

**Accepting Challenge:**
```
⚔️ New Challenge!

From: Alice Johnson

"Can you beat my 95%? 😎"

Quiz: Python Basics (10 questions)
Alice's Score: 95% in 4:32

Your Best: 88% in 5:15

[Accept Challenge] [Decline]
```

---

## 📹 Video Meetings

### Overview
WebRTC-powered video conferencing for virtual classrooms and study groups.

---

### Starting a Meeting (Teacher)

#### Step 1: Create Meeting

```
1. Dashboard → "Video Meetings"
2. Click "Start Meeting"
3. Configure settings:
   
   Meeting Settings:
   - Meeting name
   - Maximum participants (2-50)
   - Enable waiting room
   - Require password
   - Record meeting
   - Allow screen share
```

---

#### Step 2: Invite Participants

```
📧 Meeting Created!

Meeting Link:
https://quizwise-ai.live/meeting/abc123

Meeting ID: 456-789-012
Password: quiz2024

Share via:
[📧 Email] [💬 Chat] [📋 Copy Link]

Or invite from friend list:
☑️ Select students
[Send Invitations]
```

---

#### Step 3: Meeting Room

**Host Controls:**
```
┌─────────────────────────────────────┐
│  🎥 Python Study Session            │
│  Participants: 8/20                 │
├─────────────────────────────────────┤
│                                     │
│  [Main Screen - Your Video]         │
│                                     │
├─────────────────────────────────────┤
│  Participant Grid:                  │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │Alice │ │ Bob  │ │Carol │        │
│  └──────┘ └──────┘ └──────┘        │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │David │ │Emma  │ │Frank │        │
│  └──────┘ └──────┘ └──────┘        │
│                                     │
├─────────────────────────────────────┤
│  [🎤] [📹] [🖥️] [💬] [👥] [🚪]     │
│  Mute  Video Share  Chat People End│
└─────────────────────────────────────┘
```

**Host-Only Actions:**
- 🔇 Mute all participants
- 📹 Disable all cameras
- 🚫 Remove participant
- ✋ Manage raise hand requests
- 📊 Start live quiz during meeting
- 📝 Share whiteboard

---

### Joining a Meeting (Student)

#### Step 1: Join

```
Enter Meeting:
[Meeting ID: ___-___-___]
[Password: _______]

or

[Click Meeting Link]
```

---

#### Step 2: Setup

```
Pre-Meeting Check:

Camera Preview: [Your Video]
Microphone: [Test Mic]
Speakers: [Test Audio]

Name: Alice Johnson
☑️ Join with camera off
☑️ Join with mic muted

[Join Meeting]
```

---

#### Step 3: In Meeting

**Participant Controls:**
```
Controls:
[🎤] Mute/Unmute
[📹] Camera On/Off
[✋] Raise Hand
[💬] Chat
[🖥️] Screen Share (if allowed)
[🚪] Leave Meeting
```

---

### Meeting Features

**Screen Sharing:**
```
Share Options:
- Entire screen
- Application window
- Browser tab
- Whiteboard

[Start Sharing]
```

**Chat:**
```
Meeting Chat:

Everyone:
Alice: Can you explain recursion again?

Bob: Sure! Let me share my screen

Host: Let's take a 5-min break

[Type message...]
```

**Reactions:**
```
Quick Reactions:
👍 👏 ❤️ 😊 🤔 ✋

[Send Reaction]
```

---

## 📊 Dashboard & Analytics

### Student Dashboard

**Overview:**
```
┌─────────────────────────────────────┐
│  Welcome back, Alice! 👋            │
│  Level 15 | XP: 5,420 | 🔥 25 days  │
├─────────────────────────────────────┤
│                                     │
│  📈 Your Progress                   │
│                                     │
│  This Week:                         │
│  - 12 quizzes completed             │
│  - 180 XP earned                    │
│  - Average score: 87%               │
│  - 3 achievements unlocked          │
│                                     │
│  🎯 Daily Goals:         [2/3 ✓]    │
│  ✅ Complete 1 quiz                 │
│  ✅ Maintain streak                 │
│  ⬜ Win 1 duel                      │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  🔥 Quick Actions                   │
│  [Take Quiz] [Start Duel]           │
│  [Join Live] [AI Tutor]             │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  📚 Recommended for You             │
│  - Advanced Python Quiz             │
│  - Data Structures Practice         │
│  - Algorithm Challenges             │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  🏆 Recent Achievements             │
│  💯 "Perfect 10"                    │
│  ⚡ "Speed Demon"                   │
│  🔥 "Hot Streak"                    │
│                                     │
└─────────────────────────────────────┘
```

---

### Performance Analytics

**Detailed Stats:**
```
📊 Performance Analytics

Overall Statistics:
━━━━━━━━━━━━━━━━━━━━━━━━
Total Quizzes: 145
Average Score: 87.3%
Total XP: 5,420
Time Spent: 24 hours

Performance Trend:
[Line graph showing improvement]

Category Breakdown:
Math:        92% ████████████░
Science:     88% ██████████░░░
History:     85% █████████░░░░
Programming: 90% ███████████░░

Difficulty Analysis:
Easy:    95% ██████████████
Medium:  87% ████████████░░
Hard:    78% ███████████░░░
Expert:  65% █████████░░░░░

Best Performance:
- Best Category: Math (92%)
- Best Time: 2:15 (Python Basics)
- Longest Streak: 15 correct
- Perfect Scores: 23

Areas to Improve:
- Expert difficulty (65% avg)
- History category (85% avg)
- Speed (avg 18s per question)

📈 Progress Over Time:
[Chart showing weekly progress]

Recommendations:
1. Practice more expert-level quizzes
2. Focus on history topics
3. Work on speed with time challenges

[Export Report] [Set Goals]
```

---

### Teacher Dashboard

**Overview:**
```
┌─────────────────────────────────────┐
│  Teacher Dashboard                   │
│  Prof. Smith | 156 students          │
├─────────────────────────────────────┤
│                                     │
│  📊 This Week                        │
│  - 12 quizzes created               │
│  - 456 quiz attempts                │
│  - 3 live sessions hosted           │
│  - Avg student score: 78%           │
│                                     │
│  🎓 Your Quizzes                     │
│  Total: 45 | Public: 38 | Private: 7│
│                                     │
│  Top Performing:                    │
│  1. Python Basics (4.9★, 234 takes) │
│  2. Data Structures (4.8★, 189)     │
│  3. Algorithms (4.7★, 167)          │
│                                     │
│  📈 Student Analytics                │
│  [View Detailed Reports]            │
│                                     │
│  🔥 Quick Actions                   │
│  [Create Quiz] [Host Live Session]  │
│  [Video Meeting] [View Reports]     │
│                                     │
└─────────────────────────────────────┘
```

---

**Student Performance Reports:**
```
👥 Student Analytics

Class Overview:
Total Students: 156
Active This Week: 142 (91%)
Average Score: 78%
Completion Rate: 85%

Top Performers:
1. Alice Johnson - 95% avg
2. Bob Smith - 93% avg
3. Carol Davis - 91% avg

Students Needing Help:
1. David Lee - 52% avg
2. Emma Wilson - 58% avg
3. Frank Miller - 61% avg

Quiz Performance:
Python Basics:
- Attempts: 234
- Avg Score: 82%
- Completion: 95%
- Hardest Question: Q7 (45% correct)

Time Analysis:
- Avg completion: 8:32
- Fastest: 3:45 (Alice)
- Most improved: Bob (+25%)

[Export CSV] [Email Students] [Schedule Meeting]
```

---

## 🎉 Conclusion

This guide covers all major features of Cognito Learning Hub. For additional help:

- 📧 Email: support@quizwise-ai.live
- 💬 In-app chat support
- 📚 Help Center: /help
- 🎥 Video tutorials: /tutorials
- 📖 FAQ: /faq

**Happy Learning! 🚀📚**

---

**Document Version:** 1.0  
**Last Updated:** December 2025  
**For:** Cognito Learning Hub Users
