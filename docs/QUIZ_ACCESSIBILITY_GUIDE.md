# Quiz Accessibility Guide

## Complete Keyboard Control & Speech Support for Quiz Taking

This guide explains how visually impaired and keyboard-only users can take quizzes with complete independence using keyboard shortcuts and text-to-speech features.

---

## 🎯 Overview

The quiz accessibility system enables:
- ✅ **Complete keyboard-only quiz taking** (no mouse required)
- ✅ **Full text-to-speech** for questions and options
- ✅ **Screen reader compatibility** (NVDA, JAWS, VoiceOver)
- ✅ **Real-time announcements** for all quiz events
- ✅ **Audio feedback** for selections and navigation
- ✅ **Time warnings** via speech
- ✅ **Progress tracking** via speech

---

## ⌨️ Keyboard Shortcuts Reference

### Answer Selection
- **1** - Select Option A
- **2** - Select Option B
- **3** - Select Option C
- **4** - Select Option D

### Navigation
- **N** or **→** (Right Arrow) - Go to next question
- **P** or **←** (Left Arrow) - Go to previous question
- **Enter** or **Space** - Proceed to next question (if answered)

### Audio & Reading
- **R** - Read current question aloud
- **O** - Read all options aloud
- **S** - Stop speaking immediately

### Information
- **I** - Hear quiz progress (questions answered, remaining)
- **T** - Hear time remaining
- **H** - Repeat quiz instructions

### Submit Quiz
- **Ctrl + Enter** (Windows/Linux) - Submit quiz
- **Cmd + Enter** (Mac) - Submit quiz

---

## 🎙️ Text-to-Speech Features

### Auto-Read (Default Enabled)
When you navigate to a new question:
1. **Question number announced**: "Question 1 of 10"
2. **Difficulty & points announced**: "Medium difficulty, 5 points"
3. **Question read aloud**: Full question text
4. **Brief pause** for comprehension

### Manual Read Controls
- **Press R**: Read question again at any time
- **Press O**: Read all answer options with letters (A, B, C, D)
- **Press S**: Stop speech immediately

### Selection Feedback
When you select an answer:
1. **Option letter announced**: "Option B"
2. **Full option text read**: Complete selected answer
3. **Visual confirmation**: Option highlighted in blue

### Time Warnings (Auto-Announced)
- **1 minute remaining**: "Warning: 1 minute remaining"
- **30 seconds remaining**: "Warning: 30 seconds remaining"
- **10 seconds remaining**: "Warning: 10 seconds remaining" (urgent tone)

---

## 🔊 Screen Reader Announcements

### Question Navigation
```
"Moving to question 2 of 10"
"Question 2 loaded"
```

### Answer Selection
```
"Option A selected"
"Selected option B: [option text]"
```

### Progress Updates
```
"5 of 10 questions answered"
"5 questions remaining"
```

### Time Warnings
```
"Warning: 30 seconds remaining" (assertive)
"Time's up for this question" (assertive)
```

### Quiz Completion
```
"Quiz completed"
"Submitting quiz"
"Navigating to results"
```

---

## 📋 Complete Quiz-Taking Workflow (Keyboard Only)

### 1. Starting the Quiz
1. Navigate to quiz using **Tab** key
2. Press **Enter** to start quiz
3. Quiz loads with first question
4. Question automatically read aloud (if TTS enabled)

### 2. Answering a Question

#### Option A: Using Number Keys
1. Listen to question (auto-read or press **R**)
2. Press **O** to hear all options
3. Press **1**, **2**, **3**, or **4** to select answer
4. Hear confirmation: "Option A selected"
5. Answer is immediately submitted

#### Option B: Using Tab Navigation
1. Press **Tab** to focus first option
2. Press **Tab** again to move through options
3. Press **Space** or **Enter** to select focused option
4. Answer is immediately submitted

### 3. Navigating Between Questions

#### Forward Navigation
- Press **N** or **→** to go to next question
- Or press **Enter** after answering
- New question auto-read

#### Backward Navigation
- Press **P** or **←** to go to previous question
- Review question and see your previous answer
- Press **N** to return to current position

### 4. Checking Progress
- Press **I** to hear: "5 of 10 questions answered, 5 remaining"
- Press **T** to hear: "3 minutes 45 seconds remaining"

### 5. Submitting the Quiz

#### When All Questions Answered
1. Navigate to last question
2. Answer the question
3. Hear: "Ready to submit quiz. Press Control + Enter to submit"
4. Press **Ctrl + Enter**
5. Hear: "Submitting quiz"
6. Results page loads

#### Partial Submission
1. Press **Ctrl + Enter** at any time
2. If unanswered questions: "Cannot submit. 5 questions remain unanswered"
3. Answer remaining questions before submission

---

## 🎮 Quiz Accessibility Features

### Visual Accessibility
- **Number badges** on each option (1, 2, 3, 4)
- **Letter badges** on each option (A, B, C, D)
- **High contrast colors** for selection states
- **Large click targets** (48px minimum)
- **Enhanced focus indicators** with blue outline
- **Green borders** for correct answers
- **Red borders** for incorrect answers

### Audio Accessibility
- **Web Speech API** for natural text-to-speech
- **Adjustable speech rate** (via accessibility toolbar)
- **Screen reader compatible** (ARIA labels)
- **Live regions** for dynamic announcements
- **Sound effects** for feedback (optional)

### Keyboard Accessibility
- **All features keyboard accessible**
- **No mouse required**
- **Logical tab order**
- **Escape key** closes modals
- **Arrow keys** for navigation
- **Number keys** for quick selection

### Cognitive Accessibility
- **Clear instructions** (press H to hear)
- **Progress tracking** (press I)
- **Time awareness** (press T, auto-warnings)
- **Pause and review** previous questions
- **Repeat options** anytime (press R or O)

---

## 🎯 Use Cases & Examples

### Example 1: Fully Blind User

**Scenario**: User relies entirely on screen reader and keyboard

**Workflow**:
1. Start quiz (Enter on quiz link)
2. Hear question read automatically
3. Press **O** to hear all options
4. Press **2** to select Option B
5. Hear: "Selected option B: [option text]"
6. Press **N** to go to next question
7. Repeat until quiz complete
8. Press **Ctrl + Enter** to submit
9. Hear results summary

**Time**: ~45 seconds per question

---

### Example 2: Low Vision User

**Scenario**: User can see high contrast elements but needs speech support

**Workflow**:
1. Enable high contrast mode (accessibility toolbar)
2. Start quiz
3. See large option buttons with number badges
4. Press **1** to select Option A
5. See blue highlight and checkmark
6. Press **Enter** to proceed
7. Visual + audio confirmation
8. Complete quiz with visual + audio feedback

**Time**: ~30 seconds per question

---

### Example 3: Motor Disability User

**Scenario**: User cannot use mouse, keyboard only

**Workflow**:
1. Tab to quiz start button
2. Press Enter to start
3. Press **1**, **2**, **3**, or **4** to answer (no tabbing needed)
4. Press **N** to go to next question
5. Minimal keystrokes required
6. Ctrl + Enter to submit

**Time**: ~20 seconds per question

---

## 🎚️ Accessibility Settings

### Enabling Text-to-Speech
1. Click blue accessibility button (bottom-right)
2. Open "Audio Settings" panel
3. Toggle "Text-to-Speech" ON
4. Adjust speech rate if needed (slower for clarity)

### Keyboard Shortcuts
- Always enabled by default
- Cannot be disabled
- Work even if TTS is off

### Screen Reader Mode
- Automatically detected
- No manual setup required
- Works with NVDA, JAWS, VoiceOver
- All announcements via ARIA live regions

---

## 🔍 Troubleshooting

### Speech Not Working

**Problem**: Questions not being read aloud

**Solutions**:
1. Check if Text-to-Speech is enabled in accessibility toolbar
2. Verify browser supports Web Speech API (Chrome, Edge, Safari)
3. Check system volume is not muted
4. Try pressing **R** to manually trigger speech
5. If still not working, screen reader announcements will still function

---

### Keyboard Shortcuts Not Responding

**Problem**: Number keys (1, 2, 3, 4) not selecting options

**Solutions**:
1. Ensure you're not typing in a text field
2. Check if modal or overlay is open (press Esc to close)
3. Refresh the page and restart quiz
4. Try using Tab + Space/Enter instead
5. Check browser console for errors

---

### Time Warnings Not Heard

**Problem**: Missing time warning announcements

**Solutions**:
1. Enable screen reader if using one
2. Enable Text-to-Speech in accessibility toolbar
3. Check volume levels
4. Press **T** to manually check time
5. Visual timer still shows on screen

---

### Cannot Navigate Between Questions

**Problem**: N/P keys not working

**Solutions**:
1. Try arrow keys (← →) instead
2. Ensure question is answered first
3. Check if at first/last question
4. Try Tab to navigation buttons + Enter
5. Refresh quiz if issue persists

---

## 🎓 Best Practices

### For Blind Users
1. ✅ Enable Text-to-Speech before starting quiz
2. ✅ Use headphones for better audio clarity
3. ✅ Press **H** to hear instructions when quiz starts
4. ✅ Use number keys (1, 2, 3, 4) for fastest answering
5. ✅ Press **O** to hear options before selecting
6. ✅ Press **I** regularly to track progress
7. ✅ Press **T** when you hear time warnings

### For Low Vision Users
1. ✅ Enable high contrast mode before starting
2. ✅ Increase font size to Large or Extra Large
3. ✅ Enable text-to-speech as backup
4. ✅ Use keyboard shortcuts for faster navigation
5. ✅ Enable reading guide for question text
6. ✅ Adjust screen brightness for comfort

### For Motor Disability Users
1. ✅ Learn number keys (1-4) for quick selection
2. ✅ Use N/P keys for navigation (faster than Tab)
3. ✅ Memorize Ctrl+Enter for submission
4. ✅ Use sticky keys if needed (system setting)
5. ✅ Take breaks between questions (no time limit per quiz)

### For Cognitive Disabilities
1. ✅ Enable reduced motion
2. ✅ Use dyslexia font if helpful
3. ✅ Press **R** to repeat question as many times as needed
4. ✅ Press **I** to check progress and avoid overwhelm
5. ✅ Review previous questions (press P) if confused
6. ✅ No penalty for taking longer

---

## 📊 Accessibility Standards Compliance

### WCAG 2.1 Level AA
- ✅ **1.1.1 Non-text Content**: All UI has text alternatives
- ✅ **1.3.1 Info and Relationships**: Proper ARIA labels and roles
- ✅ **1.4.3 Contrast**: 4.5:1 minimum contrast ratio
- ✅ **2.1.1 Keyboard**: All functionality via keyboard
- ✅ **2.1.2 No Keyboard Trap**: Can navigate away freely
- ✅ **2.4.3 Focus Order**: Logical tab order
- ✅ **2.4.7 Focus Visible**: Enhanced focus indicators
- ✅ **3.2.1 On Focus**: No unexpected behavior
- ✅ **3.2.2 On Input**: Predictable responses
- ✅ **3.3.1 Error Identification**: Clear error messages
- ✅ **3.3.2 Labels or Instructions**: All controls labeled
- ✅ **4.1.2 Name, Role, Value**: Proper ARIA implementation
- ✅ **4.1.3 Status Messages**: Live regions for announcements

### Section 508
- ✅ Fully compliant with Section 508 standards
- ✅ Compatible with assistive technologies
- ✅ Keyboard accessible throughout
- ✅ Screen reader optimized

---

## 🎬 Quick Start Guide

### 30-Second Setup
1. Open quiz
2. Click blue accessibility button (bottom-right)
3. Enable "Text-to-Speech"
4. Press **H** to hear instructions
5. Start answering with number keys!

### Keyboard Shortcuts Cheat Sheet
```
┌─────────────────────────────────────────┐
│         QUIZ KEYBOARD SHORTCUTS         │
├─────────────────────────────────────────┤
│ 1/2/3/4      Select Options A/B/C/D     │
│ N or →       Next Question              │
│ P or ←       Previous Question          │
│ R            Read Question              │
│ O            Read Options               │
│ I            Progress Info              │
│ T            Time Remaining             │
│ S            Stop Speaking              │
│ H            Help/Instructions          │
│ Ctrl+Enter   Submit Quiz                │
└─────────────────────────────────────────┘
```

---

## 🤝 Support & Feedback

If you experience any accessibility issues while taking quizzes:

1. **Press H** to verify shortcuts are working
2. **Check accessibility toolbar** settings
3. **Try alternative input method** (Tab + Enter instead of number keys)
4. **Refresh and restart quiz** if issues persist
5. **Report issue** to support team with:
   - Browser and version
   - Assistive technology used (if any)
   - Specific keyboard shortcut not working
   - Steps to reproduce

---

## 🎉 Benefits Summary

### For Users
- ✅ **Independence**: Take quizzes without assistance
- ✅ **Speed**: Number keys faster than mouse clicks
- ✅ **Accessibility**: Works with all assistive technologies
- ✅ **Flexibility**: Multiple ways to interact (keys, tab, speech)
- ✅ **Confidence**: Clear audio/visual feedback
- ✅ **Control**: Pause, review, repeat as needed

### For Educators
- ✅ **Inclusivity**: All students can participate equally
- ✅ **Compliance**: Meets accessibility standards
- ✅ **No Special Setup**: Works out of the box
- ✅ **Universal Design**: Benefits all users, not just disabled users
- ✅ **Analytics**: Same tracking for all students

---

## 📚 Related Documentation

- [ACCESSIBILITY_GUIDE.md](./ACCESSIBILITY_GUIDE.md) - General accessibility features
- [ACCESSIBILITY_IMPLEMENTATION.md](./ACCESSIBILITY_IMPLEMENTATION.md) - Technical details
- [ACCESSIBILITY_DEMO_GUIDE.md](./ACCESSIBILITY_DEMO_GUIDE.md) - Interactive demos
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Platform setup

---

**Last Updated**: 2024
**Status**: Production Ready ✅
**WCAG Compliance**: Level AA ✅
**Screen Reader Tested**: NVDA, JAWS, VoiceOver ✅
