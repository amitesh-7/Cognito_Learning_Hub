/**
 * Anti-Cheating Detection Utilities
 * Implements measures to detect and prevent cheating in live quiz sessions
 */

/**
 * Initialize tab/window focus detection
 * Reports when student switches tabs or windows
 */
export const initializeTabFocusDetection = (socket, sessionCode, userId) => {
  let tabSwitchCount = 0;
  let windowBlurCount = 0;

  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Tab/window lost focus
      tabSwitchCount++;
      console.warn(`[AntiCheat] Tab switched (${tabSwitchCount} times)`);

      socket.emit("suspicious-activity", {
        sessionCode,
        userId,
        activityType: "TAB_SWITCH",
        severity: tabSwitchCount > 3 ? "HIGH" : "MEDIUM",
        details: { switchCount: tabSwitchCount },
        timestamp: Date.now(),
      });
    }
  };

  const handleWindowBlur = () => {
    windowBlurCount++;
    console.warn(`[AntiCheat] Window blurred (${windowBlurCount} times)`);

    socket.emit("suspicious-activity", {
      sessionCode,
      userId,
      activityType: "WINDOW_BLUR",
      severity: "MEDIUM",
      details: { blurCount: windowBlurCount },
      timestamp: Date.now(),
    });
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("blur", handleWindowBlur);

  // Return cleanup function
  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("blur", handleWindowBlur);
  };
};

/**
 * Prevent copying question text
 */
export const initializeCopyPrevention = (socket, sessionCode, userId) => {
  const preventCopy = (e) => {
    e.preventDefault();
    console.warn("[AntiCheat] Copy attempt blocked");

    socket.emit("suspicious-activity", {
      sessionCode,
      userId,
      activityType: "COPY_ATTEMPT",
      severity: "MEDIUM",
      timestamp: Date.now(),
    });

    return false;
  };

  const preventContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  const preventKeyShortcuts = (e) => {
    // Prevent Ctrl+C, Ctrl+A, Ctrl+X
    if (
      (e.ctrlKey && (e.key === "c" || e.key === "a" || e.key === "x")) ||
      (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "C")) ||
      e.key === "F12"
    ) {
      e.preventDefault();
      console.warn("[AntiCheat] Keyboard shortcut blocked:", e.key);
      return false;
    }
  };

  document.addEventListener("copy", preventCopy);
  document.addEventListener("contextmenu", preventContextMenu);
  document.addEventListener("keydown", preventKeyShortcuts);

  // Return cleanup function
  return () => {
    document.removeEventListener("copy", preventCopy);
    document.removeEventListener("contextmenu", preventContextMenu);
    document.removeEventListener("keydown", preventKeyShortcuts);
  };
};

/**
 * Request fullscreen mode
 */
export const requestFullscreenMode = async () => {
  try {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      await elem.requestFullscreen();
      console.log("[AntiCheat] Fullscreen mode enabled");
      return true;
    }
    return false;
  } catch (err) {
    console.error("[AntiCheat] Fullscreen request denied:", err);
    return false;
  }
};

/**
 * Detect fullscreen exits
 */
export const initializeFullscreenDetection = (socket, sessionCode, userId) => {
  let fullscreenExitCount = 0;

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      fullscreenExitCount++;
      console.warn(
        `[AntiCheat] Exited fullscreen (${fullscreenExitCount} times)`
      );

      socket.emit("suspicious-activity", {
        sessionCode,
        userId,
        activityType: "FULLSCREEN_EXIT",
        severity: "MEDIUM",
        details: { exitCount: fullscreenExitCount },
        timestamp: Date.now(),
      });

      // Show warning after 2nd exit
      if (fullscreenExitCount >= 2) {
        console.warn(
          "[AntiCheat] ⚠️ Exiting fullscreen repeatedly may be flagged as suspicious"
        );
      }
    }
  };

  document.addEventListener("fullscreenchange", handleFullscreenChange);

  return () => {
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
  };
};

/**
 * Detect DevTools opening
 */
export const initializeDevToolsDetection = (socket, sessionCode, userId) => {
  let devToolsDetectCount = 0;

  const detectDevTools = () => {
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;

    if (widthThreshold || heightThreshold) {
      devToolsDetectCount++;
      console.warn("[AntiCheat] DevTools detected");

      socket.emit("suspicious-activity", {
        sessionCode,
        userId,
        activityType: "DEVTOOLS_OPENED",
        severity: "HIGH",
        details: { detectCount: devToolsDetectCount },
        timestamp: Date.now(),
      });
    }
  };

  // Check periodically
  const interval = setInterval(detectDevTools, 2000);

  // Also check on resize
  window.addEventListener("resize", detectDevTools);

  // Return cleanup function
  return () => {
    clearInterval(interval);
    window.removeEventListener("resize", detectDevTools);
  };
};

/**
 * Validate answer submission time on client side
 * Server will also validate
 */
export const validateAnswerTime = (timeSpent, maxAllowedTime) => {
  // Flag if answered suspiciously fast (less than 1 second)
  if (timeSpent < 1000) {
    console.warn("[AntiCheat] Suspiciously fast answer:", timeSpent, "ms");
    return {
      valid: true,
      suspicious: true,
      reason: "IMPOSSIBLY_FAST",
    };
  }

  // Flag if time exceeded
  if (timeSpent > maxAllowedTime) {
    console.warn("[AntiCheat] Answer submitted after time limit");
    return {
      valid: false,
      reason: "TIME_EXCEEDED",
    };
  }

  return {
    valid: true,
    suspicious: false,
  };
};

/**
 * Track answer metadata for analysis
 */
export const trackAnswerMetadata = () => {
  return {
    timestamp: Date.now(),
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    userAgent: navigator.userAgent,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
  };
};

/**
 * Get device fingerprint for detecting multiple devices
 */
export const getDeviceFingerprint = () => {
  const fingerprint = {
    userAgent: navigator.userAgent,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory,
    maxTouchPoints: navigator.maxTouchPoints,
  };

  return fingerprint;
};

/**
 * Detect if running in development mode or on suspicious network
 */
export const getNetworkInfo = () => {
  return {
    effectiveType: navigator.connection?.effectiveType || "unknown",
    downlink: navigator.connection?.downlink || null,
    rtt: navigator.connection?.rtt || null,
    saveData: navigator.connection?.saveData || false,
  };
};
