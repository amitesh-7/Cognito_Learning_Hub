# Teacher Dashboard - Creating Advanced Questions

## Quick Start Guide

### Prerequisites

1. Log in with a Teacher account
2. Navigate to Teacher Dashboard
3. Click "Create Quiz" or "Create New Quiz"

---

## How to Create Advanced Question Types

### Step 1: Import the Component

In your quiz creation page (e.g., `CreateQuiz.jsx` or `TeacherDashboard.jsx`), import the component:

```javascript
import AdvancedQuestionCreator from "../components/Teacher/AdvancedQuestionCreator";
```

### Step 2: Add to Your Quiz Form

Add a button to open the advanced question creator:

```jsx
const [showAdvancedCreator, setShowAdvancedCreator] = useState(false);

// In your render:
<Button onClick={() => setShowAdvancedCreator(true)}>
  <Plus className="w-4 h-4 mr-2" />
  Add Advanced Question
</Button>;

{
  showAdvancedCreator && (
    <AdvancedQuestionCreator
      onQuestionCreated={(question) => {
        // Add question to your questions array
        setQuestions([...questions, question]);
        setShowAdvancedCreator(false);
      }}
      onCancel={() => setShowAdvancedCreator(false)}
    />
  );
}
```

---

## Creating Each Question Type

### 1. CODE CHALLENGE QUESTIONS

**When to use:** Programming problems, algorithm challenges, coding exercises

**Configuration:**

1. **Select Question Type:** Click "Code Challenge"

2. **Fill Basic Info:**

   - Title: "Array Sum Challenge"
   - Description: "Write a function that returns the sum of all elements in an array"

3. **Select Languages:**

   - Click language badges to enable (JavaScript, Python, Java, C++, C)
   - Multiple languages can be enabled

4. **Starter Code:**

   ```javascript
   function arraySum(arr) {
     // Your code here
   }
   ```

5. **Requirements:**

   - Click "Add Requirement" for each requirement
   - Example: "Function must handle empty arrays"
   - Example: "Should work with negative numbers"

6. **Test Cases:**
   - Click "Add Test Case" button
   - Input: `[1, 2, 3, 4, 5]`
   - Expected Output: `15`
   - Check "Hidden" for test cases students shouldn't see initially

**Minimum Requirements:**

- At least 1 language selected
- At least 1 test case
- Starter code provided

---

### 2. REASONING QUESTIONS

**When to use:** Critical thinking, essay questions, explanation-based problems

**Configuration:**

1. **Select Question Type:** Click "Reasoning Question"

2. **Fill Basic Info:**

   - Title: "Climate Change Analysis"
   - Description: "Why is climate change considered a global crisis?"

3. **Answer Options:**

   - Option A: "Rising temperatures affect ecosystems worldwide"
   - Option B: "It only affects polar regions"
   - Option C: "It's a natural cycle with no human impact"
   - Option D: "Weather patterns remain unchanged"

4. **Correct Answer:**

   - Select the correct option from dropdown (A, B, C, or D)

5. **Word Limits:**
   - Minimum Words: 50
   - Maximum Words: 500

**How AI Evaluation Works:**

- Students select an answer AND write an explanation
- Gemini AI evaluates:
  - Whether answer is correct
  - Reasoning quality (0-10 score)
  - Logical structure
  - Evidence provided
  - Provides feedback with strengths and improvements

---

### 3. SCENARIO SIMULATIONS

**When to use:** Decision-making exercises, business cases, ethical dilemmas

**Configuration:**

1. **Select Question Type:** Click "Scenario Simulation"

2. **Fill Basic Info:**

   - Title: "Business Strategy Challenge"
   - Description: "Navigate a product launch scenario"

3. **Define State Variables:**

   - Type variable names and press Enter
   - Examples: "budget", "reputation", "marketShare", "teamMorale"
   - These track changes throughout the scenario

4. **Initial Scenario:**

   - Describe the starting situation
   - Example: "Your company is launching a new product. The board has allocated $100,000 budget..."

5. **Decision Options:**

   - Click "Add Decision" for each choice
   - Decision text: "Invest heavily in marketing"
   - State changes:
     - budget: -50 (loses $50k)
     - reputation: +20 (gains reputation)
     - marketShare: +30 (gains market share)

6. **Add More Scenarios (Optional):**
   - Set "Next Scenario" field to create branching paths
   - Create follow-up scenarios based on previous decisions

**How It Works:**

- Students see current state values
- Make decisions that affect state
- Progress through multiple phases
- Can try different paths by restarting

---

## Example: Complete Code Question

```json
{
  "type": "code",
  "title": "Palindrome Checker",
  "question": "Write a function that checks if a string is a palindrome (reads the same forwards and backwards). Ignore spaces and punctuation.",
  "codeConfig": {
    "allowedLanguages": ["javascript", "python"],
    "starterCode": "function isPalindrome(str) {\n  // Your code here\n}",
    "requirements": [
      "Function must ignore spaces",
      "Function must ignore case",
      "Function must handle empty strings"
    ],
    "testCases": [
      {
        "input": "racecar",
        "expectedOutput": true,
        "hidden": false
      },
      {
        "input": "hello",
        "expectedOutput": false,
        "hidden": false
      },
      {
        "input": "A man a plan a canal Panama",
        "expectedOutput": true,
        "hidden": true
      }
    ]
  }
}
```

---

## Example: Complete Reasoning Question

```json
{
  "type": "reasoning",
  "title": "Renewable Energy Analysis",
  "question": "Should governments prioritize investment in renewable energy over fossil fuels?",
  "options": [
    "Yes, to combat climate change and ensure long-term sustainability",
    "No, fossil fuels are more cost-effective in the short term",
    "It depends on each country's economic situation",
    "Both should receive equal investment"
  ],
  "correctAnswer": "A",
  "reasoningConfig": {
    "minWords": 100,
    "maxWords": 500
  }
}
```

---

## Example: Complete Scenario Question

```json
{
  "type": "scenario",
  "title": "Emergency Response",
  "question": "You are a hospital administrator during a health crisis. Make critical decisions.",
  "scenarioConfig": {
    "initialScenario": "crisis_start",
    "initialState": {
      "resources": 100,
      "staff": 50,
      "patients": 20,
      "publicTrust": 80
    },
    "maxPhases": 4,
    "scenarios": [
      {
        "id": "crisis_start",
        "description": "A sudden influx of 50 new patients arrives. Your hospital is at 80% capacity.",
        "decisions": [
          {
            "text": "Accept all patients, work overtime",
            "outcomes": {
              "resources": -30,
              "staff": -10,
              "patients": 50,
              "publicTrust": 20
            },
            "nextScenario": "resource_crisis"
          },
          {
            "text": "Accept only critical cases, redirect others",
            "outcomes": {
              "resources": -10,
              "staff": -5,
              "patients": 20,
              "publicTrust": -10
            },
            "nextScenario": "triage_situation"
          }
        ]
      }
    ]
  }
}
```

---

## Troubleshooting

### Issue: Questions don't save

**Solution:** Ensure all required fields are filled:

- Title
- Question description
- For code: At least 1 language and 1 test case
- For reasoning: All 4 options and correct answer
- For scenario: Initial description and at least 1 decision

### Issue: Code execution fails

**Solution:**

- Check test case format (use JSON-compatible values)
- Ensure expected output matches actual function output type
- Test locally before adding

### Issue: AI feedback doesn't work

**Solution:**

- Verify Gemini API key is configured in backend
- Check that reasoning questions have correct answer set
- Ensure minimum word count is reasonable (50-100 words)

---

## Integration with Existing Quiz System

### In TeacherDashboard.jsx or CreateQuiz.jsx:

```jsx
const [questions, setQuestions] = useState([]);
const [showAdvancedCreator, setShowAdvancedCreator] = useState(false);

const handleQuestionCreated = (newQuestion) => {
  // Add points field if needed
  const questionWithPoints = {
    ...newQuestion,
    points: newQuestion.type === "code" ? 10 : 5,
    difficulty: "medium",
  };

  setQuestions([...questions, questionWithPoints]);
  setShowAdvancedCreator(false);
};

// In your quiz form submission:
const handleSubmitQuiz = async () => {
  const quizData = {
    title,
    category,
    difficulty,
    questions: questions, // Includes both MCQ and advanced questions
    timeLimit,
  };

  // Submit to backend...
};
```

---

## API Endpoints Used

### Code Questions:

- `POST /api/advanced-questions/execute-code` - Run code with test cases
- Body: `{ code, language, testCases }`

### Reasoning Questions:

- `POST /api/advanced-questions/evaluate-reasoning` - Get AI feedback
- Body: `{ questionId, answer, reasoning, correctAnswer }`

### Scenario Questions:

- No special backend endpoint needed
- State management handled client-side

---

## Best Practices

### For Code Questions:

1. Provide clear, unambiguous problem statements
2. Include at least 2-3 test cases (1-2 visible, 1+ hidden)
3. Test starter code yourself before publishing
4. Set realistic time limits (5-15 minutes)

### For Reasoning Questions:

5. Use open-ended "why" or "how" questions
6. Ensure options are clearly distinct
7. Set appropriate word limits (50-100 for short, 200-500 for essays)
8. Questions that require evidence work best

### For Scenario Questions:

9. Keep state variables simple (3-5 max)
10. Make outcomes realistic and balanced
11. Provide 2-4 decision options per phase
12. Test the full scenario flow before publishing

---

## Next Steps

1. **Test Your Questions:**

   - Create a test quiz
   - Take the quiz yourself as a student
   - Verify all features work correctly

2. **Get Feedback:**

   - Share with colleagues
   - Collect student feedback
   - Iterate on question design

3. **Build Question Library:**
   - Create templates for common patterns
   - Document best practices
   - Share with other teachers

---

## Support

For technical issues:

1. Check browser console (F12) for errors
2. Verify all microservices are running
3. Check backend logs for API errors
4. Refer to FEATURE_TESTING_GUIDE.md

For question design help:

1. Review examples in this guide
2. Start with simple questions
3. Gradually add complexity
4. Test with real students

**Happy Teaching! 🎓**
