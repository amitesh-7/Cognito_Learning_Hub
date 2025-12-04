# 🛡️ Anti-Cheating Guide for Live Quiz Battles

## 📋 Overview

This document outlines potential cheating methods in live quiz battles and comprehensive strategies to prevent them. When a teacher hosts a live quiz session, students may attempt various cheating techniques that compromise the integrity of the assessment.

---

## ⚠️ Identified Cheating Vectors

### 1. **Tab Switching / Window Switching**

Students open another browser tab or window to search for answers.

```
Risk Level: 🔴 HIGH
Difficulty to Detect: Medium
Prevalence: Very Common
```

### 2. **Screen Sharing with Friends**

Students share their screen via Discord, Zoom, or other apps to get help.

```
Risk Level: 🔴 HIGH
Difficulty to Detect: Hard
Prevalence: Common
```

### 3. **Multiple Device Usage**

Student uses phone/tablet to search while quiz runs on laptop.

```
Risk Level: 🔴 HIGH
Difficulty to Detect: Very Hard
Prevalence: Very Common
```

### 4. **Copy-Paste Questions**

Students copy question text and paste into search engines.

```
Risk Level: 🟡 MEDIUM
Difficulty to Detect: Medium
Prevalence: Common
```

### 5. **Screenshot Sharing**

Students screenshot questions and share via WhatsApp/Telegram groups.

```
Risk Level: 🟡 MEDIUM
Difficulty to Detect: Hard
Prevalence: Moderate
```

### 6. **Browser Developer Tools**

Tech-savvy students inspect network requests to find correct answers.

```
Risk Level: 🔴 HIGH
Difficulty to Detect: Medium
Prevalence: Rare (requires technical knowledge)
```

### 7. **Answer Sharing in Real-Time**

Students in same room or chat share answers as questions appear.

```
Risk Level: 🔴 HIGH
Difficulty to Detect: Very Hard
Prevalence: Very Common
```

### 8. **Time Manipulation**

Attempting to pause timer or manipulate client-side time.

```
Risk Level: 🟡 MEDIUM
Difficulty to Detect: Easy (if server-validated)
Prevalence: Rare
```

### 9. **Session Hijacking**

Sharing session codes with non-enrolled users to take quiz on behalf.

```
Risk Level: 🟡 MEDIUM
Difficulty to Detect: Medium
Prevalence: Moderate
```

### 10. **AI Assistant Usage**

Using ChatGPT, Claude, or other AI tools to get answers.

```
Risk Level: 🔴 HIGH
Difficulty to Detect: Very Hard
Prevalence: Increasing
```

---

## 🛡️ Anti-Cheating Measures

### Level 1: Immediate Implementation (No Code Changes)

#### A. **Shorter Time Limits**

Reduce time per question to make searching impractical.

| Question Type | Current | Recommended |
| ------------- | ------- | ----------- |
| MCQ (Easy)    | 30s     | 15-20s      |
| MCQ (Medium)  | 30s     | 20-25s      |
| MCQ (Hard)    | 30s     | 25-30s      |
| True/False    | 30s     | 10-15s      |

```javascript
// In session settings
settings: {
  timePerQuestion: 20, // Reduced from 30
  showLeaderboardAfterEach: true,
  allowLateJoin: false,
}
```

#### B. **Question Randomization**

- Randomize question order per student
- Randomize option order within questions
- Different students see different question sequences

#### C. **Teacher Guidelines**

1. Don't share session code publicly
2. Verify participant list before starting
3. Remove unknown participants
4. Monitor unusual answer patterns

---

### Level 2: Frontend Anti-Cheat Measures

#### A. **Tab/Window Focus Detection**

```javascript
// Add to LiveSessionJoin.jsx
const [tabSwitchCount, setTabSwitchCount] = useState(0);
const [isTabActive, setIsTabActive] = useState(true);

useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      setIsTabActive(false);
      setTabSwitchCount((prev) => prev + 1);

      // Report to server
      socket.emit("tab-switched", {
        sessionCode,
        userId,
        timestamp: Date.now(),
        switchCount: tabSwitchCount + 1,
      });
    } else {
      setIsTabActive(true);
    }
  };

  const handleBlur = () => {
    // Window lost focus
    socket.emit("window-blur", {
      sessionCode,
      userId,
      timestamp: Date.now(),
    });
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("blur", handleBlur);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("blur", handleBlur);
  };
}, [socket, sessionCode, userId, tabSwitchCount]);
```

#### B. **Copy Prevention**

```javascript
// Prevent copying question text
useEffect(() => {
  const preventCopy = (e) => {
    e.preventDefault();

    // Log attempt
    socket.emit("copy-attempt", {
      sessionCode,
      userId,
      timestamp: Date.now(),
    });

    return false;
  };

  const preventContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  const preventKeyShortcuts = (e) => {
    // Prevent Ctrl+C, Ctrl+A, Ctrl+P, F12
    if (
      (e.ctrlKey && (e.key === "c" || e.key === "a" || e.key === "p")) ||
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && e.key === "I")
    ) {
      e.preventDefault();
      return false;
    }
  };

  document.addEventListener("copy", preventCopy);
  document.addEventListener("contextmenu", preventContextMenu);
  document.addEventListener("keydown", preventKeyShortcuts);

  return () => {
    document.removeEventListener("copy", preventCopy);
    document.removeEventListener("contextmenu", preventContextMenu);
    document.removeEventListener("keydown", preventKeyShortcuts);
  };
}, []);
```

#### C. **Fullscreen Mode Enforcement**

```javascript
// Request fullscreen when quiz starts
const enterFullscreen = async () => {
  try {
    await document.documentElement.requestFullscreen();
    setIsFullscreen(true);
  } catch (err) {
    console.error("Fullscreen request denied:", err);
  }
};

// Detect fullscreen exit
useEffect(() => {
  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      setIsFullscreen(false);
      setFullscreenExitCount((prev) => prev + 1);

      socket.emit("fullscreen-exit", {
        sessionCode,
        userId,
        exitCount: fullscreenExitCount + 1,
        timestamp: Date.now(),
      });

      // Show warning
      if (fullscreenExitCount >= 2) {
        alert(
          "⚠️ Warning: Exiting fullscreen may be flagged as suspicious activity"
        );
      }
    }
  };

  document.addEventListener("fullscreenchange", handleFullscreenChange);
  return () =>
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
}, [fullscreenExitCount]);
```

#### D. **DevTools Detection**

```javascript
// Detect DevTools opening
useEffect(() => {
  const detectDevTools = () => {
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;

    if (widthThreshold || heightThreshold) {
      socket.emit("devtools-detected", {
        sessionCode,
        userId,
        timestamp: Date.now(),
      });
    }
  };

  // Check periodically
  const interval = setInterval(detectDevTools, 1000);

  // Also check on resize
  window.addEventListener("resize", detectDevTools);

  return () => {
    clearInterval(interval);
    window.removeEventListener("resize", detectDevTools);
  };
}, []);
```

---

### Level 3: Backend Anti-Cheat Measures

#### A. **Server-Side Time Validation**

```javascript
// In socket handlers - submit-answer
socket.on(
  "submit-answer",
  async ({ sessionCode, userId, questionId, selectedAnswer, timeSpent }) => {
    const session = await sessionManager.getSession(sessionCode);
    const questionStartTime =
      session.questionStartTimes[session.currentQuestionIndex];

    // Calculate actual server-side time
    const actualTimeSpent = Date.now() - questionStartTime;
    const maxAllowedTime = session.settings.timePerQuestion * 1000 + 2000; // 2s buffer

    // Validate time
    if (actualTimeSpent > maxAllowedTime) {
      socket.emit("answer-rejected", {
        reason: "TIME_EXPIRED",
        message: "Answer submitted after time limit",
      });
      return;
    }

    // Flag suspiciously fast answers (less than 1 second)
    if (actualTimeSpent < 1000) {
      await flagSuspiciousActivity(
        userId,
        sessionCode,
        "IMPOSSIBLY_FAST_ANSWER",
        {
          timeSpent: actualTimeSpent,
          questionId,
        }
      );
    }

    // Continue with answer processing...
  }
);
```

#### B. **Answer Pattern Analysis**

```javascript
// Detect suspicious patterns
async function analyzeAnswerPatterns(sessionCode, userId) {
  const session = await sessionManager.getSession(sessionCode);
  const participant = session.participants.find((p) => p.userId === userId);

  const flags = [];

  // Check 1: All correct answers with consistent fast times
  const avgTime =
    participant.answers.reduce((a, b) => a + b.timeSpent, 0) /
    participant.answers.length;
  const correctRate =
    participant.answers.filter((a) => a.isCorrect).length /
    participant.answers.length;

  if (correctRate > 0.9 && avgTime < 5000) {
    flags.push({
      type: "HIGH_ACCURACY_FAST_RESPONSE",
      severity: "HIGH",
      details: { correctRate, avgTime },
    });
  }

  // Check 2: Identical answer patterns with other participants
  for (const other of session.participants) {
    if (other.userId === userId) continue;

    const similarity = calculateAnswerSimilarity(
      participant.answers,
      other.answers
    );
    if (similarity > 0.8) {
      flags.push({
        type: "SIMILAR_ANSWER_PATTERN",
        severity: "MEDIUM",
        details: { otherUserId: other.userId, similarity },
      });
    }
  }

  // Check 3: Answer timing clusters (multiple students answering at exact same time)
  const answerTimestamps = participant.answers.map((a) => a.timestamp);
  // ... cluster analysis

  return flags;
}

function calculateAnswerSimilarity(answers1, answers2) {
  let matches = 0;
  const minLength = Math.min(answers1.length, answers2.length);

  for (let i = 0; i < minLength; i++) {
    if (answers1[i].selectedAnswer === answers2[i].selectedAnswer) {
      matches++;
    }
  }

  return matches / minLength;
}
```

#### C. **Suspicious Activity Tracking**

```javascript
// Schema for tracking suspicious activity
const SuspiciousActivitySchema = new mongoose.Schema({
  sessionCode: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  activityType: {
    type: String,
    enum: [
      "TAB_SWITCH",
      "WINDOW_BLUR",
      "FULLSCREEN_EXIT",
      "COPY_ATTEMPT",
      "DEVTOOLS_OPENED",
      "IMPOSSIBLY_FAST_ANSWER",
      "SIMILAR_ANSWER_PATTERN",
      "MULTIPLE_SESSIONS",
      "IP_ANOMALY",
    ],
    required: true,
  },
  severity: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
    default: "LOW",
  },
  details: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
  acknowledged: { type: Boolean, default: false },
});

// Socket handler for tracking
socket.on("tab-switched", async (data) => {
  await SuspiciousActivity.create({
    sessionCode: data.sessionCode,
    userId: data.userId,
    activityType: "TAB_SWITCH",
    severity: data.switchCount > 3 ? "HIGH" : "MEDIUM",
    details: { switchCount: data.switchCount },
  });

  // Alert host in real-time
  io.to(data.sessionCode).emit("suspicious-activity", {
    userId: data.userId,
    type: "TAB_SWITCH",
    count: data.switchCount,
  });
});
```

#### D. **Single Session Enforcement**

```javascript
// Prevent multiple active sessions per user
socket.on("join-session", async (data, callback) => {
  const { sessionCode, userId } = data;

  // Check if user already in another active session
  const existingSession = await LiveSession.findOne({
    "participants.userId": userId,
    status: "active",
    sessionCode: { $ne: sessionCode },
  });

  if (existingSession) {
    return callback({
      success: false,
      error: "You are already in another active session",
    });
  }

  // Check if user already connected from another device
  const userSockets = await getUserActiveSockets(userId);
  if (userSockets.length > 0) {
    // Disconnect old connections
    userSockets.forEach((socketId) => {
      io.to(socketId).emit("session-terminated", {
        reason: "Connected from another device",
      });
      io.sockets.sockets.get(socketId)?.disconnect();
    });

    await flagSuspiciousActivity(userId, sessionCode, "MULTIPLE_SESSIONS");
  }

  // Continue with join...
});
```

---

### Level 4: Advanced Anti-Cheat (Future Implementation)

#### A. **Proctoring Features**

```javascript
// Webcam monitoring (requires user consent)
const ProctoringConfig = {
  enabled: false, // Teacher can enable
  features: {
    webcam: true, // Periodic snapshots
    screenShare: false, // Full screen recording
    audioMonitor: false, // Detect voices
    faceDetection: true, // Ensure student is present
    eyeTracking: false, // Track where student looks
  },
  snapshotInterval: 30000, // 30 seconds
  alertOnMultipleFaces: true,
  alertOnNoFace: true,
};

// React component for webcam proctoring
function WebcamProctor({ enabled, onViolation }) {
  const videoRef = useRef(null);
  const [faceCount, setFaceCount] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    // Initialize webcam
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        startFaceDetection();
      })
      .catch((err) => {
        onViolation("WEBCAM_DENIED");
      });
  }, [enabled]);

  const startFaceDetection = async () => {
    // Use face-api.js or similar
    const detections = await faceapi.detectAllFaces(videoRef.current);
    setFaceCount(detections.length);

    if (detections.length === 0) {
      onViolation("NO_FACE_DETECTED");
    } else if (detections.length > 1) {
      onViolation("MULTIPLE_FACES_DETECTED");
    }
  };

  return <video ref={videoRef} style={{ display: "none" }} />;
}
```

#### B. **Browser Lockdown Mode**

```javascript
// Secure browser features (similar to Respondus LockDown Browser)
const LockdownConfig = {
  blockNewTabs: true,
  blockNewWindows: true,
  blockPrinting: true,
  blockScreenshot: true, // Limited effectiveness
  blockClipboard: true,
  requireFullscreen: true,
  blockRightClick: true,
  blockKeyboardShortcuts: true,
  allowedUrls: ["quiz.cognito-hub.com"], // Only allow quiz domain
};

// Implementation would require browser extension or native app
```

#### C. **IP and Device Fingerprinting**

```javascript
// Collect device fingerprint on join
socket.on("join-session", async (data, callback) => {
  const fingerprint = {
    userAgent: socket.handshake.headers["user-agent"],
    ip: socket.handshake.address,
    screenResolution: data.screenResolution,
    timezone: data.timezone,
    language: data.language,
    platform: data.platform,
    // Canvas fingerprint, WebGL fingerprint, etc.
  };

  // Check for multiple users from same device/IP
  const sameDeviceUsers = await checkSameDevice(fingerprint, data.sessionCode);

  if (sameDeviceUsers.length > 0) {
    await flagSuspiciousActivity(data.userId, data.sessionCode, "SAME_DEVICE", {
      otherUsers: sameDeviceUsers,
    });

    // Alert host
    io.to(data.sessionCode).emit("suspicious-activity", {
      type: "SAME_DEVICE_DETECTED",
      users: [data.userId, ...sameDeviceUsers],
    });
  }
});
```

#### D. **Answer Time Distribution Analysis**

```javascript
// Statistical analysis of answer times
function analyzeTimeDistribution(participant, allParticipants) {
  const myTimes = participant.answers.map((a) => a.timeSpent);
  const avgTime = myTimes.reduce((a, b) => a + b, 0) / myTimes.length;
  const stdDev = calculateStdDev(myTimes);

  // Compare with class average
  const classAvgTime = calculateClassAverage(allParticipants);

  // Flag if consistently faster than class average
  if (avgTime < classAvgTime * 0.5) {
    return {
      suspicious: true,
      reason: "SIGNIFICANTLY_FASTER_THAN_AVERAGE",
      details: { avgTime, classAvgTime, ratio: avgTime / classAvgTime },
    };
  }

  // Flag if answer times are too consistent (bot-like behavior)
  if (stdDev < 500) {
    // Less than 0.5 second variation
    return {
      suspicious: true,
      reason: "UNNATURALLY_CONSISTENT_TIMING",
      details: { stdDev, avgTime },
    };
  }

  return { suspicious: false };
}
```

---

### Level 5: Teacher Dashboard for Monitoring

#### A. **Real-Time Integrity Dashboard**

```jsx
// Component for host to monitor suspicious activity
function IntegrityMonitor({ sessionCode, participants }) {
  const [alerts, setAlerts] = useState([]);
  const [flaggedUsers, setFlaggedUsers] = useState(new Set());

  useEffect(() => {
    socket.on("suspicious-activity", (data) => {
      setAlerts((prev) => [...prev, data]);

      if (data.severity === "HIGH" || data.severity === "CRITICAL") {
        setFlaggedUsers((prev) => new Set([...prev, data.userId]));
      }
    });

    return () => socket.off("suspicious-activity");
  }, []);

  return (
    <div className="integrity-monitor">
      <h3>🛡️ Integrity Monitor</h3>

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat">
          <span className="label">Flagged Students</span>
          <span className="value text-red-500">{flaggedUsers.size}</span>
        </div>
        <div className="stat">
          <span className="label">Total Alerts</span>
          <span className="value">{alerts.length}</span>
        </div>
      </div>

      {/* Alert List */}
      <div className="alerts-list">
        {alerts
          .slice(-10)
          .reverse()
          .map((alert, i) => (
            <AlertItem key={i} alert={alert} />
          ))}
      </div>

      {/* Participant Risk Scores */}
      <div className="participant-risks">
        {participants.map((p) => (
          <ParticipantRiskCard
            key={p.userId}
            participant={p}
            isFlagged={flaggedUsers.has(p.userId)}
            alerts={alerts.filter((a) => a.userId === p.userId)}
          />
        ))}
      </div>
    </div>
  );
}

function AlertItem({ alert }) {
  const severityColors = {
    LOW: "bg-yellow-100 text-yellow-800",
    MEDIUM: "bg-orange-100 text-orange-800",
    HIGH: "bg-red-100 text-red-800",
    CRITICAL: "bg-red-500 text-white",
  };

  return (
    <div className={`alert-item ${severityColors[alert.severity]}`}>
      <span className="user">{alert.userName}</span>
      <span className="type">{alert.type}</span>
      <span className="time">{formatTime(alert.timestamp)}</span>
    </div>
  );
}
```

#### B. **Post-Quiz Integrity Report**

```javascript
// Generate integrity report after quiz ends
async function generateIntegrityReport(sessionCode) {
  const session = await LiveSession.findOne({ sessionCode }).populate(
    "participants.userId"
  );

  const suspiciousActivities = await SuspiciousActivity.find({ sessionCode });

  const report = {
    sessionCode,
    generatedAt: new Date(),
    totalParticipants: session.participants.length,
    summary: {
      cleanParticipants: 0,
      lowRiskParticipants: 0,
      mediumRiskParticipants: 0,
      highRiskParticipants: 0,
    },
    participants: [],
  };

  for (const participant of session.participants) {
    const userActivities = suspiciousActivities.filter(
      (a) => a.userId.toString() === participant.userId.toString()
    );

    const riskScore = calculateRiskScore(userActivities);
    const riskLevel = getRiskLevel(riskScore);

    report.participants.push({
      userId: participant.userId,
      userName: participant.userName,
      score: participant.score,
      correctAnswers: participant.answers.filter((a) => a.isCorrect).length,
      riskScore,
      riskLevel,
      flags: userActivities.map((a) => ({
        type: a.activityType,
        severity: a.severity,
        timestamp: a.timestamp,
      })),
      avgResponseTime: calculateAvgTime(participant.answers),
      answerPattern: analyzePattern(participant.answers),
    });

    // Update summary
    report.summary[`${riskLevel.toLowerCase()}RiskParticipants`]++;
  }

  return report;
}

function calculateRiskScore(activities) {
  const weights = {
    TAB_SWITCH: 5,
    WINDOW_BLUR: 3,
    FULLSCREEN_EXIT: 4,
    COPY_ATTEMPT: 8,
    DEVTOOLS_OPENED: 10,
    IMPOSSIBLY_FAST_ANSWER: 7,
    SIMILAR_ANSWER_PATTERN: 9,
    MULTIPLE_SESSIONS: 10,
  };

  return activities.reduce((score, activity) => {
    return score + (weights[activity.activityType] || 1);
  }, 0);
}

function getRiskLevel(score) {
  if (score === 0) return "CLEAN";
  if (score < 10) return "LOW";
  if (score < 25) return "MEDIUM";
  return "HIGH";
}
```

---

## 📊 Implementation Priority Matrix

| Feature                        | Impact    | Effort    | Priority |
| ------------------------------ | --------- | --------- | -------- |
| Tab Switch Detection           | High      | Low       | 🔴 P0    |
| Shorter Time Limits            | High      | None      | 🔴 P0    |
| Copy Prevention                | Medium    | Low       | 🔴 P0    |
| Server-Side Time Validation    | High      | Medium    | 🔴 P0    |
| Question Randomization         | High      | Medium    | 🟡 P1    |
| Fullscreen Enforcement         | Medium    | Low       | 🟡 P1    |
| Real-Time Monitoring Dashboard | High      | Medium    | 🟡 P1    |
| Answer Pattern Analysis        | High      | High      | 🟡 P1    |
| DevTools Detection             | Medium    | Low       | 🟢 P2    |
| Device Fingerprinting          | Medium    | High      | 🟢 P2    |
| Webcam Proctoring              | High      | Very High | 🔵 P3    |
| Browser Lockdown               | Very High | Very High | 🔵 P3    |

---

## 🚀 Implementation Roadmap

### Phase 1: Quick Wins (Week 1)

- [ ] Add tab/window focus detection
- [ ] Implement copy prevention
- [ ] Add server-side time validation
- [ ] Reduce default time limits
- [ ] Add basic alerting to host

### Phase 2: Core Anti-Cheat (Week 2-3)

- [ ] Implement question randomization
- [ ] Add fullscreen mode option
- [ ] Create suspicious activity tracking
- [ ] Build real-time monitoring component
- [ ] Add single-session enforcement

### Phase 3: Analytics & Detection (Week 4-5)

- [ ] Implement answer pattern analysis
- [ ] Add device fingerprinting
- [ ] Build post-quiz integrity report
- [ ] Add DevTools detection
- [ ] Create risk scoring system

### Phase 4: Advanced Features (Month 2+)

- [ ] Webcam proctoring (optional)
- [ ] AI-powered cheating detection
- [ ] Browser extension for lockdown
- [ ] Integration with plagiarism detection

---

## 📝 Configuration Options for Teachers

```javascript
// Quiz session settings
const AntiCheatSettings = {
  // Basic Protection
  enforceFullscreen: true,
  preventCopy: true,
  preventRightClick: true,
  detectTabSwitch: true,

  // Time Settings
  reducedTimeMode: true, // 30% shorter times
  serverValidatedTime: true, // No client-side timer manipulation

  // Question Security
  randomizeQuestions: true,
  randomizeOptions: true,
  oneQuestionAtATime: true,
  noBackNavigation: true,

  // Monitoring
  showIntegrityMonitor: true,
  autoFlagThreshold: 3, // Auto-flag after 3 suspicious events
  alertHostOnFlag: true,

  // Advanced (Premium)
  requireWebcam: false,
  requireIdVerification: false,
  browserLockdown: false,

  // Post-Quiz
  generateIntegrityReport: true,
  includeTimingAnalysis: true,
};
```

---

## ⚖️ Balance: Security vs User Experience

### Don't Over-Engineer

- Too aggressive anti-cheat can frustrate honest students
- False positives damage trust
- Consider accessibility needs
- Some measures may not work on all devices

### Recommended Approach

1. **Low-Stakes Quizzes**: Basic protection (tab detection, time limits)
2. **Medium-Stakes**: Add fullscreen, pattern analysis
3. **High-Stakes**: Full monitoring, consider proctoring

### Transparency

- Inform students about monitoring
- Explain what behaviors are flagged
- Provide appeal process for false flags

---

## 📚 Additional Resources

### External Tools for Proctoring

- [Proctorio](https://proctorio.com/) - Browser extension
- [ProctorU](https://www.proctoru.com/) - Live proctoring
- [Honorlock](https://honorlock.com/) - AI proctoring

### Libraries Used

- `face-api.js` - Face detection
- `fingerprintjs` - Browser fingerprinting
- `socket.io` - Real-time communication

---

## 📝 Version History

| Version | Date     | Changes               |
| ------- | -------- | --------------------- |
| 1.0     | Dec 2025 | Initial documentation |

---

_Last Updated: December 2025_
_For: Cognito Learning Hub Live Quiz System_
