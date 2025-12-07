/**
 * SuspiciousActivity Model
 * Tracks and logs all suspicious activities detected during live quiz sessions
 */

const mongoose = require("mongoose");

const SuspiciousActivitySchema = new mongoose.Schema(
  {
    sessionCode: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    userName: {
      type: String,
    },
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
      default: "MEDIUM",
    },
    details: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    acknowledged: {
      type: Boolean,
      default: false,
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "suspicious_activities",
  }
);

// Compound index for quick lookups
SuspiciousActivitySchema.index({
  sessionCode: 1,
  userId: 1,
  timestamp: -1,
});

SuspiciousActivitySchema.index({
  sessionCode: 1,
  severity: 1,
});

module.exports = mongoose.model("SuspiciousActivity", SuspiciousActivitySchema);
