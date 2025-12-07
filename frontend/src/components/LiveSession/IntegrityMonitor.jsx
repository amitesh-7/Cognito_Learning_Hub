import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Eye,
  Clock,
  Copy,
  Users,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
  UserX,
} from "lucide-react";

/**
 * IntegrityMonitor Component
 *
 * Real-time monitoring dashboard for hosts to track participant integrity
 * during live quiz sessions. Displays suspicious activities, risk scores,
 * and provides alerts for potential cheating.
 *
 * @param {Object} socket - Socket.IO instance for receiving integrity events
 * @param {string} sessionCode - Current session code
 * @param {boolean} isHost - Whether current user is the host
 */
const IntegrityMonitor = ({ socket, sessionCode, isHost }) => {
  const [alerts, setAlerts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState({
    totalActivities: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
  });

  // Don't render for non-hosts
  if (!isHost) return null;

  useEffect(() => {
    if (!socket) return;

    // Listen for integrity alerts from backend
    const handleIntegrityAlert = (data) => {
      const newAlert = {
        id: Date.now(),
        timestamp: new Date(),
        ...data,
      };

      setAlerts((prev) => [newAlert, ...prev].slice(0, 50)); // Keep last 50 alerts

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalActivities: prev.totalActivities + 1,
        [`${data.severity.toLowerCase()}Count`]:
          prev[`${data.severity.toLowerCase()}Count`] + 1,
      }));

      // Show browser notification for critical alerts
      if (data.severity === "CRITICAL" && "Notification" in window) {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("⚠️ Critical Integrity Alert", {
              body: data.message,
              icon: "/icons/warning.png",
            });
          }
        });
      }
    };

    // Listen for suspicious activity logs
    const handleActivityLog = (data) => {
      setActivities((prev) => [data, ...prev].slice(0, 100)); // Keep last 100 activities
    };

    socket.on("integrity-alert", handleIntegrityAlert);
    socket.on("activity-logged", handleActivityLog);

    return () => {
      socket.off("integrity-alert", handleIntegrityAlert);
      socket.off("activity-logged", handleActivityLog);
    };
  }, [socket]);

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-500";
      case "HIGH":
        return "bg-orange-500";
      case "MEDIUM":
        return "bg-yellow-500";
      case "LOW":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get activity icon
  const getActivityIcon = (type) => {
    switch (type) {
      case "TAB_SWITCH":
        return <Eye className="w-4 h-4" />;
      case "COPY_ATTEMPT":
        return <Copy className="w-4 h-4" />;
      case "DEVTOOLS_OPENED":
        return <AlertTriangle className="w-4 h-4" />;
      case "IMPOSSIBLE_TIME":
        return <Clock className="w-4 h-4" />;
      case "ANSWER_PATTERN_MATCH":
        return <Users className="w-4 h-4" />;
      default:
        return <ShieldAlert className="w-4 h-4" />;
    }
  };

  // Format activity details for display
  const formatDetails = (details) => {
    if (!details) return null;
    if (typeof details === "string") return details;

    // Format common detail types
    const parts = [];
    if (details.switchCount) parts.push(`Switch count: ${details.switchCount}`);
    if (details.blurCount)
      parts.push(`Left window: ${details.blurCount} times`);
    if (details.duration)
      parts.push(`Duration: ${(details.duration / 1000).toFixed(1)}s`);
    if (details.attemptedText)
      parts.push(
        `Attempted to copy: "${details.attemptedText.substring(0, 50)}..."`
      );
    if (details.timeSpent !== undefined)
      parts.push(`Answer time: ${details.timeSpent}ms`);
    if (details.threshold !== undefined)
      parts.push(`Minimum allowed: ${details.threshold}ms`);

    return parts.length > 0 ? parts.join(" • ") : JSON.stringify(details);
  };

  // Get friendly activity name
  const getActivityName = (type) => {
    const names = {
      TAB_SWITCH: "Tab Switch",
      COPY_ATTEMPT: "Copy Attempt",
      DEVTOOLS_OPENED: "DevTools Detected",
      IMPOSSIBLE_TIME: "Impossibly Fast Answer",
      ANSWER_PATTERN_MATCH: "Similar Answer Pattern",
      LATE_SUBMISSION: "Late Submission",
      FULLSCREEN_EXIT: "Exited Fullscreen",
    };
    return names[type] || type?.replace(/_/g, " ") || "Unknown Activity";
  };

  // Kick student from session
  const kickStudent = (userId, userName) => {
    if (!socket || !sessionCode) return;

    const confirmed = window.confirm(
      `⚠️ Remove ${userName} from the quiz?\n\nThis action will:\n• Immediately disconnect the student\n• Their answers will NOT be saved\n• They cannot rejoin this session\n\nAre you sure?`
    );

    if (confirmed) {
      socket.emit("kick-participant", { sessionCode, userId, userName });
      
      // Show feedback
      alert(`✅ ${userName} has been removed from the quiz.`);
      
      // Remove alerts from this user
      setAlerts((prev) => prev.filter((alert) => alert.userId !== userId));
    }
  };

  // Clear alert
  const dismissAlert = (alertId) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  };

  // Format timestamp
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      {/* Collapsed Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-lg shadow-lg"
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between text-white hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            <span className="font-semibold">Integrity Monitor</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Stats badges */}
            {stats.criticalCount > 0 && (
              <span className="bg-red-500 px-2 py-0.5 rounded-full text-xs font-bold">
                {stats.criticalCount}
              </span>
            )}
            {stats.highCount > 0 && (
              <span className="bg-orange-500 px-2 py-0.5 rounded-full text-xs font-bold">
                {stats.highCount}
              </span>
            )}
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronUp className="w-5 h-5" />
            )}
          </div>
        </button>
      </motion.div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-b-lg shadow-lg overflow-hidden"
          >
            {/* Stats Overview */}
            <div className="px-4 py-3 bg-gray-50 border-b grid grid-cols-4 gap-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {stats.totalActivities}
                </div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {stats.criticalCount}
                </div>
                <div className="text-xs text-gray-500">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {stats.highCount}
                </div>
                <div className="text-xs text-gray-500">High</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {stats.mediumCount}
                </div>
                <div className="text-xs text-gray-500">Medium</div>
              </div>
            </div>

            {/* Alert List */}
            <div className="max-h-96 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <ShieldAlert className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No integrity issues detected</p>
                  <p className="text-xs mt-1">
                    All participants are monitored in real-time
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {alerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          {/* Alert Header */}
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className={`p-1 rounded ${getSeverityColor(
                                alert.severity
                              )} text-white`}
                            >
                              {getActivityIcon(alert.type)}
                            </div>
                            <span className="font-semibold text-sm text-gray-800">
                              {getActivityName(alert.type)}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                                alert.severity
                              )} text-white`}
                            >
                              {alert.severity || "MEDIUM"}
                            </span>
                          </div>

                          {/* Alert Message */}
                          <p className="text-sm text-gray-600 mb-1">
                            {alert.message ||
                              `${
                                alert.userName || "Student"
                              } triggered ${getActivityName(
                                alert.type
                              ).toLowerCase()}`}
                          </p>

                          {/* Alert Details */}
                          {alert.details && (
                            <div className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-1 mt-2">
                              {formatDetails(alert.details)}
                            </div>
                          )}

                          {/* Timestamp */}
                          <div className="text-xs text-gray-400 mt-1">
                            {formatTime(alert.timestamp)}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-1">
                          {/* Kick Student Button */}
                          {alert.userId && alert.userName && (
                            <button
                              onClick={() => kickStudent(alert.userId, alert.userName)}
                              className="p-1.5 rounded bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                              title={`Remove ${alert.userName} from quiz`}
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                          
                          {/* Dismiss Button */}
                          <button
                            onClick={() => dismissAlert(alert.id)}
                            className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                            title="Dismiss alert"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-gray-50 border-t text-center">
              <p className="text-xs text-gray-500">
                🔒 Anti-cheat system active • Monitoring {stats.totalActivities}{" "}
                events
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntegrityMonitor;
