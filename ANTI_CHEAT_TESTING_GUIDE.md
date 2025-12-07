# Anti-Cheat System Testing Guide

## Overview

This guide provides comprehensive testing procedures for the anti-cheat system implemented in Cognito Learning Hub's live quiz battles.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client-Side Detection                     │
│  (frontend/src/utils/antiCheatingDetector.js)              │
│                                                              │
│  • Tab/Window Focus Tracking                                │
│  • Copy/Paste Prevention                                    │
│  • DevTools Detection                                       │
│  • Fullscreen Monitoring                                    │
│  • Device Fingerprinting                                    │
└───────────────────┬──────────────────────────────────────────┘
                    │ Socket.IO Events
                    │ (suspicious-activity, device-fingerprint)
                    ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend Processing                        │
│  (microservices/live-service/services/antiCheatService.js) │
│                                                              │
│  • Activity Recording (MongoDB)                             │
│  • Time Validation (server-side)                            │
│  • Answer Pattern Analysis                                  │
│  • Risk Score Calculation                                   │
│  • Integrity Report Generation                              │
└───────────────────┬──────────────────────────────────────────┘
                    │ Socket.IO Events
                    │ (integrity-alert, activity-logged)
                    ↓
┌─────────────────────────────────────────────────────────────┐
│                    Host Monitoring                           │
│  (frontend/src/components/LiveSession/IntegrityMonitor.jsx)│
│                                                              │
│  • Real-time Alert Display                                  │
│  • Activity Statistics                                      │
│  • Severity-Based Notifications                             │
│  • Pattern Match Warnings                                   │
└─────────────────────────────────────────────────────────────┘
```

## Phase 1 Features (Quick Wins)

### 1. Tab/Window Focus Detection

**What it does:**

- Tracks when students switch tabs or minimize the quiz window
- Records total time spent outside the quiz interface
- Severity: LOW (informational tracking)

**How to test:**

1. **Setup:**

   - Start a live quiz session as a host
   - Join as a student from another browser/device
   - Open the IntegrityMonitor on host screen (bottom-right corner)

2. **Test Procedure:**

   ```
   Student Side:
   1. Answer a question normally
   2. Switch to another tab (e.g., open Google)
   3. Wait 5 seconds
   4. Switch back to quiz tab
   5. Repeat 3 times
   ```

3. **Expected Results:**

   - Host sees "TAB_SWITCH" alert in IntegrityMonitor
   - Alert shows: student name, timestamp, duration outside
   - Severity badge: BLUE (LOW)
   - Stats counter increments

4. **Verification:**
   ```bash
   # Check MongoDB for logged activities
   use cognito_live_service
   db.suspiciousactivities.find({ activityType: "TAB_SWITCH" }).pretty()
   ```

---

### 2. Copy/Paste Prevention

**What it does:**

- Blocks copy, cut, and paste operations within quiz interface
- Logs all copy attempts with context (selected text)
- Severity: MEDIUM

**How to test:**

1. **Setup:**

   - Join quiz session as student
   - Navigate to a question

2. **Test Procedure:**

   ```
   Student Side:
   1. Try to select question text with mouse
   2. Press Ctrl+C (Windows) or Cmd+C (Mac)
   3. Try right-click → Copy
   4. Try Ctrl+V to paste
   ```

3. **Expected Results:**

   - Copy operation blocked (no text copied to clipboard)
   - Host receives "COPY_ATTEMPT" alert
   - Alert includes: attempted text, timestamp
   - Severity badge: YELLOW (MEDIUM)

4. **Browser Console Check:**
   ```javascript
   // Student browser console should show:
   // "⚠️ Copy blocked - Anti-cheat active"
   ```

---

### 3. Server-Side Time Validation

**What it does:**

- Validates answer submission time against question display time
- Flags impossibly fast answers (<500ms)
- Rejects late submissions (after time limit expires)
- Severity: HIGH/CRITICAL

**How to test:**

1. **Setup:**

   - Configure quiz with 10-second question timer
   - Start live session

2. **Test Case A: Impossibly Fast Answer**

   ```
   Student Side:
   1. Question appears
   2. IMMEDIATELY click any answer (within 0.3 seconds)
   3. Submit
   ```

   **Expected:**

   - Answer REJECTED by server
   - Host sees "IMPOSSIBLE_TIME" alert (CRITICAL severity, RED badge)
   - Student receives "answer-rejected" socket event

3. **Test Case B: Late Submission**

   ```
   Student Side:
   1. Question appears
   2. Wait for timer to reach 0
   3. Wait additional 2 seconds
   4. Try to submit answer
   ```

   **Expected:**

   - Answer REJECTED
   - Host sees "LATE_SUBMISSION" alert

4. **Verification:**

   ```bash
   # Check server logs
   grep "AntiCheat" logs/live-service.log

   # Should show:
   # [AntiCheat] Answer rejected - Answer submitted too quickly (<500ms) - User: JohnDoe
   ```

---

### 4. DevTools Detection

**What it does:**

- Detects when browser DevTools are opened
- Uses multiple detection methods (window size, debugger statements)
- Severity: HIGH

**How to test:**

1. **Setup:**

   - Join quiz session as student
   - Have IntegrityMonitor open on host screen

2. **Test Procedure:**

   ```
   Student Side:
   1. Press F12 to open DevTools
   2. Wait 2 seconds
   3. Close DevTools
   4. Try Ctrl+Shift+I (alternative shortcut)
   5. Try right-click → Inspect Element
   ```

3. **Expected Results:**

   - Host receives "DEVTOOLS_OPENED" alert (HIGH severity, ORANGE)
   - Alert logged even after DevTools closed
   - Multiple detection events if opened repeatedly

4. **Browser Console:**
   ```javascript
   // Student console should show:
   // "🛡️ DevTools detection triggered"
   ```

---

### 5. Answer Pattern Analysis

**What it does:**

- Compares answer sequences between all participants after session ends
- Flags pairs with >85% identical answer patterns
- Detects potential collusion/answer sharing
- Severity: HIGH

**How to test:**

1. **Setup:**

   - Create quiz with 10 questions
   - Use 2 student accounts (Alice and Bob)

2. **Test Procedure:**

   ```
   Both Students:
   1. Alice and Bob both join session
   2. For questions 1-9: Both submit IDENTICAL answers (same option, same order)
   3. For question 10: Submit different answers

   Pattern Similarity: 9/10 = 90% match (exceeds 85% threshold)
   ```

3. **Expected Results (After Session Ends):**

   - Host receives "ANSWER_PATTERN_MATCH" alert
   - Alert shows:
     ```
     Detected 1 participant pair with similar answer patterns (>85% match)
     Details: Alice & Bob - 90% similarity
     ```
   - Severity: HIGH (ORANGE badge)

4. **Verification:**

   ```bash
   # Check server logs at session end
   grep "Suspicious answer patterns" logs/live-service.log

   # Should show:
   # [AntiCheat] Suspicious answer patterns detected in session ABC123:
   # [ { user1: 'Alice', user2: 'Bob', similarity: 90 } ]
   ```

---

## Host Monitoring Interface

### IntegrityMonitor Component

**Location:** Bottom-right corner of host screen

**Features:**

1. **Collapsed State:**

   - Shows critical/high alert count badges
   - Click to expand full dashboard

2. **Expanded State:**

   - **Stats Overview:** Total activities, breakdown by severity
   - **Alert Feed:** Real-time scrolling list of all activities
   - **Alert Cards:** Show type, severity, message, details, timestamp
   - **Dismiss Buttons:** Clear individual alerts

3. **Browser Notifications:**
   - CRITICAL alerts trigger native browser notifications
   - Requires notification permission (auto-requested)

**Test Procedure:**

```
1. Trigger various anti-cheat events (tab switch, copy attempt, etc.)
2. Verify each appears in IntegrityMonitor within 1 second
3. Check stats counters increment correctly
4. Test dismiss functionality
5. Verify notification permission prompt appears for CRITICAL alerts
```

---

## Database Schema

### SuspiciousActivity Model

```javascript
{
  sessionCode: "ABC123",
  userId: "user_id_here",
  userName: "John Doe",
  activityType: "TAB_SWITCH", // TAB_SWITCH, COPY_ATTEMPT, DEVTOOLS_OPENED, etc.
  severity: "LOW",             // LOW, MEDIUM, HIGH, CRITICAL
  details: {                   // Type-specific details
    duration: 12000,           // For TAB_SWITCH: ms spent outside
    attemptedText: "...",      // For COPY_ATTEMPT: selected text
    timeSpent: 300,            // For IMPOSSIBLE_TIME: ms to answer
    threshold: 500             // For IMPOSSIBLE_TIME: minimum allowed
  },
  timestamp: ISODate("2024-01-15T10:30:45.123Z")
}
```

**Indexes:**

- `(sessionCode, userId, timestamp)` - Participant activity timeline
- `(sessionCode, severity)` - High-priority alert filtering

---

## Socket.IO Events

### Client → Server

1. **suspicious-activity**

   ```javascript
   socket.emit("suspicious-activity", {
     sessionCode: "ABC123",
     userId: "user_123",
     activityType: "TAB_SWITCH",
     severity: "LOW",
     details: { duration: 5000 },
     timestamp: Date.now(),
   });
   ```

2. **device-fingerprint**
   ```javascript
   socket.emit("device-fingerprint", {
     sessionCode: "ABC123",
     userId: "user_123",
     fingerprint: {
       userAgent: "...",
       screenResolution: "1920x1080",
       timezone: "America/New_York",
       language: "en-US",
       platform: "Win32",
     },
   });
   ```

### Server → Client (Host Only)

1. **integrity-alert**

   ```javascript
   socket.on('integrity-alert', (data) => {
     // data structure:
     {
       type: 'TAB_SWITCH',
       severity: 'LOW',
       message: 'John Doe switched tabs (5.2s)',
       details: { duration: 5200, userName: 'John Doe' },
       timestamp: 1705315845123
     }
   });
   ```

2. **activity-logged**
   ```javascript
   socket.on("activity-logged", (data) => {
     // Confirmation that activity was saved to DB
   });
   ```

---

## Risk Scoring Algorithm

### Weights by Activity Type

```javascript
const SEVERITY_WEIGHTS = {
  LOW: 1,
  MEDIUM: 3,
  HIGH: 5,
  CRITICAL: 10,
};

const ACTIVITY_MULTIPLIERS = {
  TAB_SWITCH: 1.0,
  COPY_ATTEMPT: 1.5,
  DEVTOOLS_OPENED: 2.0,
  IMPOSSIBLE_TIME: 3.0,
  ANSWER_PATTERN_MATCH: 2.5,
  LATE_SUBMISSION: 1.2,
};
```

### Risk Score Calculation

```
RiskScore = Σ (SeverityWeight × ActivityMultiplier × Frequency)

Example:
Student has:
- 5 TAB_SWITCH events (LOW severity)
- 2 COPY_ATTEMPT events (MEDIUM severity)
- 1 DEVTOOLS_OPENED event (HIGH severity)

Risk Score = (1×1.0×5) + (3×1.5×2) + (5×2.0×1)
           = 5 + 9 + 10
           = 24

Risk Level: MEDIUM (20-50 range)
```

**Risk Levels:**

- **0-10:** LOW (green) - Normal behavior
- **11-50:** MEDIUM (yellow) - Monitoring required
- **51-100:** HIGH (orange) - Suspicious behavior
- **101+:** CRITICAL (red) - Likely cheating

---

## Integration Testing

### End-to-End Test Scenario

**Scenario:** Full quiz session with multiple anti-cheat triggers

```
Setup:
- Host: Teacher account
- Students: 3 accounts (Alice, Bob, Charlie)
- Quiz: 5 questions, 15s per question

Test Flow:

Question 1:
✓ Alice answers normally (no alerts)
✓ Bob switches tab for 8s → LOW alert
✓ Charlie tries to copy question → MEDIUM alert

Question 2:
✓ Alice answers in 0.2s → CRITICAL alert (impossibly fast)
✓ Bob opens DevTools → HIGH alert
✓ Charlie answers normally

Question 3:
✓ All answer normally

Question 4:
✓ Bob and Charlie submit identical answers
✓ Alice answers differently

Question 5:
✓ All answer normally
✓ Bob tries to paste text → MEDIUM alert

Session End:
✓ Pattern analysis runs
✓ Bob & Charlie flagged for 80% similarity (4/5 identical)
✓ Alice generates integrity report showing all activities

Expected Final State:
- IntegrityMonitor shows 7 total alerts
- Alice: 1 CRITICAL (impossibly fast)
- Bob: 1 LOW (tab switch) + 1 HIGH (DevTools)
- Charlie: 2 MEDIUM (copy + paste attempts)
- Bob & Charlie: 1 HIGH (pattern match)

Host Actions:
✓ Review all alerts in IntegrityMonitor
✓ Generate integrity report (post-session)
✓ Decide on actions (warnings, grade penalties, etc.)
```

---

## Troubleshooting

### Issue: Alerts not appearing on host screen

**Diagnosis:**

```bash
# Check socket connection
# Browser console (host):
console.log(socket.connected); // Should be true

# Check socket room membership
# Server logs:
grep "joined room" logs/live-service.log
```

**Solutions:**

1. Verify host joined correct session room
2. Check firewall/CORS settings
3. Ensure Socket.IO version compatibility (client/server)

---

### Issue: Time validation always rejects answers

**Diagnosis:**

```bash
# Check server time vs client time
# Browser console (student):
console.log(Date.now());

# Server logs:
grep "questionStartTimes" logs/live-service.log
```

**Solutions:**

1. Ensure `questionStartTimes` array is populated in session
2. Check for clock synchronization issues (use NTP)
3. Verify `timeSpent` calculation in frontend

---

### Issue: DevTools detection not working

**Diagnosis:**

```javascript
// Browser console (student):
// Check if detection initialized
console.log(window.devtoolsDetector); // Should exist
```

**Solutions:**

1. Some browsers (Brave, Firefox strict mode) block detection
2. Detection may fail in incognito/private browsing
3. Use multiple detection methods (size, debugger, console)

---

## Performance Considerations

### MongoDB Indexes

```javascript
// Ensure indexes exist:
db.suspiciousactivities.createIndex({
  sessionCode: 1,
  userId: 1,
  timestamp: -1,
});
db.suspiciousactivities.createIndex({ sessionCode: 1, severity: 1 });

// Query performance:
db.suspiciousactivities
  .find({ sessionCode: "ABC123" })
  .explain("executionStats");
// Should use index, not COLLSCAN
```

### Socket.IO Optimization

```javascript
// Batch alerts if many events occur simultaneously
// Server-side (handlers.js):
const alertQueue = [];
setInterval(() => {
  if (alertQueue.length > 0) {
    io.to(sessionCode).emit("integrity-alert-batch", alertQueue);
    alertQueue.length = 0;
  }
}, 1000); // Send batch every 1 second
```

---

## Security Considerations

### Client-Side Detection Limitations

**IMPORTANT:** All client-side detection can be bypassed by determined users.

**Mitigation Strategies:**

1. **Server-Side Validation:**

   - Time validation (✅ implemented)
   - Answer pattern analysis (✅ implemented)
   - Impossible score detection (⏳ Phase 2)

2. **Multi-Layer Approach:**

   - Combine client + server detection
   - Cross-reference multiple signals
   - Use probabilistic scoring, not binary flags

3. **Statistical Analysis:**
   - Track baseline behavior per user
   - Flag statistical anomalies
   - Compare against historical data

### Data Privacy

- Suspicious activities contain student names/IDs
- Ensure GDPR/FERPA compliance
- Implement data retention policies
- Provide student access to their activity logs

```javascript
// Example: Auto-delete old activities
db.suspiciousactivities.deleteMany({
  timestamp: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }, // 90 days
});
```

---

## Next Steps (Phase 2)

1. **Question Randomization:**

   - Shuffle question order per student
   - Shuffle answer options per student
   - Requires frontend updates to LiveSessionJoin.jsx

2. **Fullscreen Enforcement:**

   - Request fullscreen on quiz start
   - Track fullscreen exits
   - Warning modal on first exit, flag on repeated exits

3. **Single-Session Enforcement:**

   - Track device fingerprints
   - Block same userId from multiple devices
   - Redis-based session locking

4. **Post-Quiz Integrity Report:**
   - PDF generation with all activities
   - Risk score visualization
   - Answer timing distribution charts
   - Export to LMS integration

---

## Testing Checklist

- [ ] Tab switch detection triggers LOW alert
- [ ] Copy attempt blocked and logged as MEDIUM alert
- [ ] DevTools detection triggers HIGH alert
- [ ] Impossibly fast answer (<500ms) rejected with CRITICAL alert
- [ ] Late submission (after timer) rejected
- [ ] Answer pattern analysis runs at session end
- [ ] 85%+ similarity flagged between participant pairs
- [ ] IntegrityMonitor displays all alerts in real-time
- [ ] Stats counters increment correctly
- [ ] Dismiss alert functionality works
- [ ] CRITICAL alerts trigger browser notifications
- [ ] SuspiciousActivity documents saved to MongoDB
- [ ] Indexes exist and used in queries
- [ ] Socket.IO events emit/receive correctly
- [ ] Host can generate integrity report (manual export)
- [ ] No false positives with normal student behavior
- [ ] System handles 50+ concurrent students without lag

---

## Conclusion

This anti-cheat system provides **defense in depth** through:

1. **Preventive Controls:** Copy blocking, DevTools warnings
2. **Detective Controls:** Tab tracking, time validation, pattern analysis
3. **Responsive Controls:** Real-time host alerts, automated rejections
4. **Analytical Controls:** Risk scoring, integrity reporting

**Remember:** No anti-cheat system is perfect. The goal is to:

- **Deter** casual cheating
- **Detect** suspicious patterns
- **Document** evidence for human review
- **Balance** security with user experience

Always combine automated detection with human judgment when making final decisions about academic integrity.
