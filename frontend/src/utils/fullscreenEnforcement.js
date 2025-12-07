/**
 * Fullscreen Enforcement for Live Quiz Sessions
 *
 * Features:
 * - Forces fullscreen mode when quiz starts
 * - Detects fullscreen exit attempts
 * - Reports violations to teacher
 * - Prevents page unload during quiz
 * - Auto re-enters fullscreen after violations
 */

/**
 * Request fullscreen with cross-browser support
 */
export const requestFullscreen = () => {
  const elem = document.documentElement;

  if (elem.requestFullscreen) {
    return elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    // Safari
    return elem.webkitRequestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    // Firefox
    return elem.mozRequestFullScreen();
  } else if (elem.msRequestFullscreen) {
    // IE/Edge
    return elem.msRequestFullscreen();
  }

  return Promise.reject(new Error("Fullscreen API not supported"));
};

/**
 * Exit fullscreen with cross-browser support
 */
export const exitFullscreen = () => {
  if (document.exitFullscreen) {
    return document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    // Safari
    return document.webkitExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    // Firefox
    return document.mozCancelFullScreen();
  } else if (document.msExitFullscreen) {
    // IE/Edge
    return document.msExitFullscreen();
  }

  return Promise.reject(new Error("Fullscreen API not supported"));
};

/**
 * Check if currently in fullscreen mode
 */
export const isFullscreen = () => {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  );
};

/**
 * Initialize fullscreen enforcement for quiz session
 *
 * @param {object} socket - Socket.IO connection
 * @param {string} sessionCode - Current session code
 * @param {string} userId - Current user ID
 * @param {object} options - Configuration options
 * @returns {function} Cleanup function
 */
export const initializeFullscreenEnforcement = (
  socket,
  sessionCode,
  userId,
  options = {}
) => {
  const {
    maxViolations = 3,
    warningDuration = 5000,
    autoReenterDelay = 2000,
    enableBeforeUnload = true,
  } = options;

  let violationCount = 0;
  let isQuizActive = false;
  let warningTimeout = null;
  let reenterTimeout = null;
  let hasLeftFullscreen = false;

  console.log("[Fullscreen] Initializing enforcement...");

  /**
   * Enter fullscreen mode
   */
  const enterFullscreen = async () => {
    try {
      await requestFullscreen();
      console.log("[Fullscreen] ✅ Entered fullscreen mode");
      hasLeftFullscreen = false;
      return true;
    } catch (error) {
      console.error("[Fullscreen] ❌ Failed to enter fullscreen:", error);

      // Notify teacher about fullscreen entry failure
      if (socket && isQuizActive) {
        socket.emit("anti-cheat-violation", {
          sessionCode,
          userId,
          activityType: "FULLSCREEN_DENIED",
          severity: "major",
          details: {
            error: error.message,
            timestamp: Date.now(),
          },
        });
      }

      return false;
    }
  };

  /**
   * Handle fullscreen change events
   */
  const handleFullscreenChange = () => {
    const inFullscreen = isFullscreen();

    console.log(`[Fullscreen] State changed - In fullscreen: ${inFullscreen}`);

    // If quiz is active and user exited fullscreen
    if (isQuizActive && !inFullscreen && !hasLeftFullscreen) {
      hasLeftFullscreen = true;
      violationCount++;

      console.warn(
        `[Fullscreen] ⚠️ Exit detected! Violation ${violationCount}/${maxViolations}`
      );

      // Report violation to teacher
      if (socket) {
        socket.emit("anti-cheat-violation", {
          sessionCode,
          userId,
          activityType: "FULLSCREEN_EXIT",
          severity: violationCount >= maxViolations ? "critical" : "major",
          details: {
            violationCount,
            maxViolations,
            timestamp: Date.now(),
          },
        });
      }

      // Show warning to student
      showWarning(violationCount, maxViolations);

      // Auto re-enter fullscreen after delay
      if (reenterTimeout) clearTimeout(reenterTimeout);
      reenterTimeout = setTimeout(() => {
        if (isQuizActive && !isFullscreen()) {
          console.log("[Fullscreen] Auto re-entering fullscreen...");
          enterFullscreen();
        }
      }, autoReenterDelay);
    }
  };

  /**
   * Show warning message to student
   */
  const showWarning = (current, max) => {
    // Clear existing warning
    if (warningTimeout) clearTimeout(warningTimeout);

    // Create warning overlay
    const existingWarning = document.getElementById("fullscreen-warning");
    if (existingWarning) existingWarning.remove();

    const warning = document.createElement("div");
    warning.id = "fullscreen-warning";
    warning.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      padding: 30px 40px;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 999999;
      text-align: center;
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 500px;
      border: 3px solid rgba(255,255,255,0.2);
    `;

    const remainingViolations = max - current;
    const isLastWarning = remainingViolations === 0;

    warning.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
      <h2 style="font-size: 24px; font-weight: bold; margin: 0 0 15px 0;">
        ${isLastWarning ? "FINAL WARNING!" : "Fullscreen Required!"}
      </h2>
      <p style="font-size: 16px; margin: 0 0 10px 0; line-height: 1.5;">
        You exited fullscreen mode during the quiz.
      </p>
      <p style="font-size: 18px; font-weight: bold; margin: 0 0 15px 0;">
        ${
          isLastWarning
            ? "Teacher has been notified. You may be removed from the quiz."
            : `Violations: ${current}/${max}`
        }
      </p>
      <p style="font-size: 14px; margin: 0; opacity: 0.9;">
        Returning to fullscreen automatically...
      </p>
    `;

    document.body.appendChild(warning);

    // Remove warning after duration
    warningTimeout = setTimeout(() => {
      if (warning && warning.parentNode) {
        warning.remove();
      }
    }, warningDuration);
  };

  /**
   * Prevent page unload during quiz
   */
  const handleBeforeUnload = (e) => {
    if (isQuizActive) {
      e.preventDefault();
      e.returnValue = "Quiz in progress! Are you sure you want to leave?";

      // Report attempt to leave
      if (socket) {
        socket.emit("anti-cheat-violation", {
          sessionCode,
          userId,
          activityType: "PAGE_UNLOAD_ATTEMPT",
          severity: "major",
          details: {
            timestamp: Date.now(),
          },
        });
      }

      return e.returnValue;
    }
  };

  /**
   * Prevent F11 fullscreen toggle
   */
  const handleKeyDown = (e) => {
    if (isQuizActive && e.key === "F11") {
      e.preventDefault();
      console.log("[Fullscreen] F11 blocked");

      // Report violation
      if (socket) {
        socket.emit("anti-cheat-violation", {
          sessionCode,
          userId,
          activityType: "F11_ATTEMPT",
          severity: "minor",
          details: {
            timestamp: Date.now(),
          },
        });
      }
    }
  };

  // Add event listeners
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
  document.addEventListener("mozfullscreenchange", handleFullscreenChange);
  document.addEventListener("MSFullscreenChange", handleFullscreenChange);

  if (enableBeforeUnload) {
    window.addEventListener("beforeunload", handleBeforeUnload);
  }

  window.addEventListener("keydown", handleKeyDown);

  /**
   * Public API
   */
  const api = {
    /**
     * Start quiz - enter fullscreen
     */
    startQuiz: async () => {
      console.log("[Fullscreen] Starting quiz - entering fullscreen");
      isQuizActive = true;
      violationCount = 0;
      hasLeftFullscreen = false;

      const success = await enterFullscreen();

      if (!success) {
        alert(
          "⚠️ Fullscreen mode is required for this quiz.\n\n" +
            "Please allow fullscreen access and try again.\n\n" +
            "If you continue to have issues, try using a different browser."
        );
      }

      return success;
    },

    /**
     * End quiz - exit fullscreen
     */
    endQuiz: async () => {
      console.log("[Fullscreen] Ending quiz - exiting fullscreen");
      isQuizActive = false;

      try {
        if (isFullscreen()) {
          await exitFullscreen();
        }
      } catch (error) {
        console.error("[Fullscreen] Error exiting fullscreen:", error);
      }

      // Clear any pending timeouts
      if (warningTimeout) clearTimeout(warningTimeout);
      if (reenterTimeout) clearTimeout(reenterTimeout);

      // Remove warning if visible
      const warning = document.getElementById("fullscreen-warning");
      if (warning) warning.remove();
    },

    /**
     * Get current violation count
     */
    getViolations: () => violationCount,

    /**
     * Check if quiz is active
     */
    isActive: () => isQuizActive,
  };

  /**
   * Cleanup function
   */
  const cleanup = () => {
    console.log("[Fullscreen] Cleaning up enforcement...");

    // Mark quiz as inactive
    isQuizActive = false;

    // Remove event listeners
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
    document.removeEventListener(
      "webkitfullscreenchange",
      handleFullscreenChange
    );
    document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
    document.removeEventListener("MSFullscreenChange", handleFullscreenChange);

    if (enableBeforeUnload) {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    }

    window.removeEventListener("keydown", handleKeyDown);

    // Clear timeouts
    if (warningTimeout) clearTimeout(warningTimeout);
    if (reenterTimeout) clearTimeout(reenterTimeout);

    // Remove warning overlay
    const warning = document.getElementById("fullscreen-warning");
    if (warning) warning.remove();

    // Exit fullscreen if still active
    if (isFullscreen()) {
      exitFullscreen().catch(console.error);
    }
  };

  return { cleanup, ...api };
};
