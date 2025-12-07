/**
 * Anti-Cheat Service
 * Handles detection, logging, and analysis of suspicious activities
 */

const SuspiciousActivity = require("../models/SuspiciousActivity");
const createLogger = require("../../shared/utils/logger");

const logger = createLogger("anti-cheat-service");

class AntiCheatService {
  /**
   * Record a suspicious activity
   */
  static async recordActivity(
    sessionCode,
    userId,
    userName,
    activityType,
    severity,
    details = {}
  ) {
    try {
      const activity = new SuspiciousActivity({
        sessionCode,
        userId,
        userName,
        activityType,
        severity,
        details,
      });

      await activity.save();
      logger.info(
        `[AntiCheat] ${activityType} - User: ${userName}, Severity: ${severity}, Session: ${sessionCode}`
      );

      return activity;
    } catch (error) {
      logger.error("[AntiCheat] Error recording activity:", error);
      throw error;
    }
  }

  /**
   * Validate answer submission time
   * Returns validation result and logs if suspicious
   */
  static async validateAnswerTime(
    sessionCode,
    userId,
    userName,
    questionStartTime,
    timeSpent
  ) {
    const actualTimeSpent = Date.now() - questionStartTime;
    const maxAllowedTime = 35 * 1000; // 35 seconds (30 + 5 second buffer)

    // Check if time exceeded
    if (actualTimeSpent > maxAllowedTime) {
      logger.warn(
        `[AntiCheat] Time exceeded - User: ${userName}, Time: ${actualTimeSpent}ms, Limit: ${maxAllowedTime}ms`
      );
      return {
        valid: false,
        reason: "TIME_EXCEEDED",
      };
    }

    // Flag suspiciously fast answers (less than 500ms)
    if (actualTimeSpent < 500) {
      logger.warn(
        `[AntiCheat] Impossibly fast answer - User: ${userName}, Time: ${actualTimeSpent}ms`
      );

      await this.recordActivity(
        sessionCode,
        userId,
        userName,
        "IMPOSSIBLY_FAST_ANSWER",
        "HIGH",
        {
          timeSpent: actualTimeSpent,
          threshold: 500,
        }
      );

      return {
        valid: true,
        suspicious: true,
        reason: "IMPOSSIBLY_FAST",
      };
    }

    return {
      valid: true,
      suspicious: false,
    };
  }

  /**
   * Analyze answer patterns across participants
   * Detects similar answer patterns that suggest cheating
   */
  static async analyzeAnswerPatterns(sessionCode, participants) {
    try {
      const suspiciousPatterns = [];

      // Check each pair of participants
      for (let i = 0; i < participants.length; i++) {
        for (let j = i + 1; j < participants.length; j++) {
          const participant1 = participants[i];
          const participant2 = participants[j];

          if (
            !participant1.answers ||
            !participant2.answers ||
            participant1.answers.length === 0
          ) {
            continue;
          }

          // Calculate similarity
          const similarity = this._calculateAnswerSimilarity(
            participant1.answers,
            participant2.answers
          );

          // Flag if too similar (>85% match)
          if (similarity > 0.85) {
            suspiciousPatterns.push({
              userId1: participant1.userId,
              userName1: participant1.userName,
              userId2: participant2.userId,
              userName2: participant2.userName,
              similarity: (similarity * 100).toFixed(2) + "%",
              severity: similarity > 0.95 ? "CRITICAL" : "HIGH",
            });

            // Record for both users
            await this.recordActivity(
              sessionCode,
              participant1.userId,
              participant1.userName,
              "SIMILAR_ANSWER_PATTERN",
              similarity > 0.95 ? "CRITICAL" : "HIGH",
              {
                otherUser: participant2.userName,
                similarity: similarity.toFixed(2),
              }
            );

            await this.recordActivity(
              sessionCode,
              participant2.userId,
              participant2.userName,
              "SIMILAR_ANSWER_PATTERN",
              similarity > 0.95 ? "CRITICAL" : "HIGH",
              {
                otherUser: participant1.userName,
                similarity: similarity.toFixed(2),
              }
            );
          }
        }
      }

      return suspiciousPatterns;
    } catch (error) {
      logger.error("[AntiCheat] Error analyzing answer patterns:", error);
      return [];
    }
  }

  /**
   * Calculate similarity between two answer sequences
   * Returns 0-1 (0 = no match, 1 = perfect match)
   */
  static _calculateAnswerSimilarity(answers1, answers2) {
    let matches = 0;
    const minLength = Math.min(answers1.length, answers2.length);

    if (minLength === 0) return 0;

    for (let i = 0; i < minLength; i++) {
      const ans1 = (answers1[i].selectedAnswer || "")
        .toString()
        .toLowerCase()
        .trim();
      const ans2 = (answers2[i].selectedAnswer || "")
        .toString()
        .toLowerCase()
        .trim();

      if (ans1 === ans2) {
        matches++;
      }
    }

    return matches / minLength;
  }

  /**
   * Calculate risk score for a participant
   */
  static calculateRiskScore(activities) {
    const weights = {
      TAB_SWITCH: 2,
      WINDOW_BLUR: 1,
      FULLSCREEN_EXIT: 3,
      COPY_ATTEMPT: 5,
      DEVTOOLS_OPENED: 8,
      IMPOSSIBLY_FAST_ANSWER: 4,
      SIMILAR_ANSWER_PATTERN: 7,
      MULTIPLE_SESSIONS: 10,
      IP_ANOMALY: 6,
    };

    let score = 0;
    let weightedScore = 0;

    activities.forEach((activity) => {
      score += 1;
      const weight = weights[activity.activityType] || 1;
      const severityMultiplier =
        {
          LOW: 1,
          MEDIUM: 2,
          HIGH: 3,
          CRITICAL: 5,
        }[activity.severity] || 1;

      weightedScore += weight * severityMultiplier;
    });

    return {
      count: score,
      weighted: weightedScore,
      level: this._getRiskLevel(weightedScore),
    };
  }

  /**
   * Get risk level based on score
   */
  static _getRiskLevel(score) {
    if (score === 0) return "CLEAN";
    if (score < 10) return "LOW";
    if (score < 25) return "MEDIUM";
    if (score < 50) return "HIGH";
    return "CRITICAL";
  }

  /**
   * Get activities for a session
   */
  static async getSessionActivities(sessionCode) {
    try {
      const activities = await SuspiciousActivity.find({ sessionCode })
        .sort({ timestamp: -1 })
        .lean();

      return activities;
    } catch (error) {
      logger.error("[AntiCheat] Error fetching activities:", error);
      return [];
    }
  }

  /**
   * Get activities for a user in a session
   */
  static async getUserActivities(sessionCode, userId) {
    try {
      const activities = await SuspiciousActivity.find({
        sessionCode,
        userId,
      })
        .sort({ timestamp: -1 })
        .lean();

      return activities;
    } catch (error) {
      logger.error("[AntiCheat] Error fetching user activities:", error);
      return [];
    }
  }

  /**
   * Generate integrity report for a session
   */
  static async generateIntegrityReport(sessionCode, participants) {
    try {
      const allActivities = await this.getSessionActivities(sessionCode);

      const report = {
        sessionCode,
        generatedAt: new Date(),
        totalParticipants: participants.length,
        summary: {
          cleanParticipants: 0,
          lowRiskParticipants: 0,
          mediumRiskParticipants: 0,
          highRiskParticipants: 0,
          criticalRiskParticipants: 0,
        },
        participants: [],
      };

      for (const participant of participants) {
        const userActivities = allActivities.filter(
          (a) => a.userId.toString() === participant.userId.toString()
        );

        const riskScore = this.calculateRiskScore(userActivities);
        const riskLevel = riskScore.level;

        report.participants.push({
          userId: participant.userId,
          userName: participant.userName,
          score: participant.score,
          correctAnswers: participant.correctAnswers || 0,
          totalAnswers: (participant.answers || []).length,
          accuracy: participant.answers
            ? (
                (participant.correctAnswers / participant.answers.length) *
                100
              ).toFixed(2) + "%"
            : "N/A",
          avgResponseTime: this._calculateAvgTime(participant.answers || []),
          riskScore: riskScore.weighted,
          riskLevel,
          flags: userActivities.map((a) => ({
            type: a.activityType,
            severity: a.severity,
            timestamp: a.timestamp,
          })),
        });

        report.summary[`${riskLevel.toLowerCase()}RiskParticipants`]++;
      }

      return report;
    } catch (error) {
      logger.error("[AntiCheat] Error generating integrity report:", error);
      throw error;
    }
  }

  /**
   * Calculate average response time
   */
  static _calculateAvgTime(answers) {
    if (!answers || answers.length === 0) return 0;

    const total = answers.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
    return Math.round(total / answers.length) + "ms";
  }

  /**
   * Check for multiple active sessions for a user
   */
  static async checkMultipleSessions(userId, excludeSessionCode = null) {
    // This would be implemented with Redis or database queries
    // to check if user is in multiple sessions concurrently
    logger.debug(`[AntiCheat] Checking multiple sessions for user ${userId}`);
    return false;
  }
}

module.exports = AntiCheatService;
