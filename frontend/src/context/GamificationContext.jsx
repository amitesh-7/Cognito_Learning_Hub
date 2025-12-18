import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useSocket } from "./SocketContext";
import { AuthContext } from "./AuthContext";
import {
  getUnlockedFeatures,
  checkFeatureUnlock,
  getUpcomingFeatures,
  FEATURE_UNLOCKS,
} from "../config/featureUnlocks";

const GamificationContext = createContext(null);

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error(
      "useGamification must be used within a GamificationProvider"
    );
  }
  return context;
};

export const GamificationProvider = ({ children }) => {
  const { socket, isConnected } = useSocket();
  const { user } = useContext(AuthContext);

  // Check if user is a student (only students should see feature unlocking)
  const isStudent = user?.role === "Student" || !user?.role;

  // Real-time state
  const [userStats, setUserStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [recentUnlocks, setRecentUnlocks] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [xpAnimation, setXpAnimation] = useState(null);
  const [achievementNotification, setAchievementNotification] = useState(null);

  // Feature unlock state - disabled for non-students (teachers, admins, moderators)
  const [featureUnlockNotification, setFeatureUnlockNotification] =
    useState(null);
  const [previousUnlockedFeatures, setPreviousUnlockedFeatures] = useState(
    new Set()
  );

  // Refs to prevent stale closures
  const userStatsRef = useRef(userStats);
  userStatsRef.current = userStats;

  // Fetch initial data
  const fetchGamificationData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("quizwise-token");
      const headers = { "x-auth-token": token };
      const API_URL = import.meta.env.VITE_API_URL;

      // Get user ID from auth context
      const userId = user?.id || user?._id;
      if (!userId) {
        console.warn("No user ID available for gamification data fetch");
        return;
      }

      // Fetch all data in parallel from gamification service
      // Add cache control headers to ensure fresh data (prevents 304 responses)
      const fetchHeaders = {
        ...headers,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      };

      const [statsRes, achievementsRes, userAchievementsRes, leaderboardRes] =
        await Promise.all([
          fetch(`${API_URL}/api/stats/me`, {
            headers: fetchHeaders,
            cache: "no-store",
          }).catch(() => null),
          fetch(`${API_URL}/api/achievements`, {
            headers: fetchHeaders,
            cache: "no-store",
          }).catch(() => null),
          fetch(`${API_URL}/api/achievements/${userId}`, {
            headers: fetchHeaders,
            cache: "no-store",
          }).catch(() => null),
          fetch(`${API_URL}/api/gamification/leaderboard?limit=10`, {
            headers: fetchHeaders,
            cache: "no-store",
          }).catch(() => null),
        ]);

      // Get stats from gamification service - backend returns { success, userId, stats }
      if (statsRes?.ok) {
        const data = await statsRes.json();
        console.log("📊 Gamification stats fetched:", data);
        setUserStats(data.stats || data);
      }

      if (achievementsRes?.ok) {
        const data = await achievementsRes.json();
        setAchievements(data.achievements || data || []);
      }

      if (userAchievementsRes?.ok) {
        const data = await userAchievementsRes.json();
        const achievements = data.achievements || data || [];
        setUserAchievements(achievements);
        const completedCount = achievements.filter(
          (ua) => ua.isCompleted
        ).length;
        console.log(
          `🏆 User Achievements: ${completedCount} completed out of ${achievements.length} total`
        );
      }

      if (leaderboardRes?.ok) {
        const data = await leaderboardRes.json();
        setLeaderboard(data.leaderboard || data || []);
      }
    } catch (error) {
      console.error("Error fetching gamification data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial data fetch
  useEffect(() => {
    fetchGamificationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only depend on user, not fetchGamificationData to avoid infinite loop

  // Socket event handlers for real-time updates
  useEffect(() => {
    if (!socket || !isConnected || !user) return;

    // Subscribe to user-specific gamification events
    socket.emit("gamification:subscribe", { userId: user._id || user.id });

    // Achievement unlocked handler
    const handleAchievementUnlocked = (data) => {
      console.log("🏆 Achievement unlocked:", data);

      const { achievement, userStats: updatedStats } = data;

      // Update user achievements list
      setUserAchievements((prev) => {
        const exists = prev.some(
          (a) =>
            (a.achievement?._id || a._id) ===
            (achievement._id || achievement.id)
        );
        if (exists) return prev;
        return [
          ...prev,
          { achievement, unlockedAt: new Date(), isCompleted: true },
        ];
      });

      // Add to recent unlocks
      setRecentUnlocks((prev) => [
        { ...achievement, unlockedAt: new Date() },
        ...prev.slice(0, 9), // Keep last 10
      ]);

      // Update stats if provided
      if (updatedStats) {
        setUserStats(updatedStats);
      }

      // Trigger notification
      setAchievementNotification(achievement);

      // Auto-clear notification after 5 seconds
      setTimeout(() => {
        setAchievementNotification(null);
      }, 5000);
    };

    // Stats updated handler
    const handleStatsUpdated = (data) => {
      console.log("📊 Stats updated:", data);

      const { stats, xpGained, levelUp } = data;

      // Animate XP gain with enhanced data
      if (xpGained) {
        setXpAnimation({
          amount: xpGained,
          levelUp,
          reason: data.reason || "Activity completed",
          timestamp: Date.now(),
        });
        // Longer timeout for celebration modal
        setTimeout(() => setXpAnimation(null), 4000);
      }

      // Update stats with animation-friendly merge
      setUserStats((prev) => {
        if (!prev) return stats;
        return {
          ...prev,
          ...stats,
          // Preserve previous values for animation comparison
          _previousXP: prev.experience,
          _previousLevel: prev.level,
        };
      });
    };

    // Leaderboard updated handler
    const handleLeaderboardUpdated = (data) => {
      console.log("🏅 Leaderboard updated:", data);
      setLeaderboard(data.leaderboard || data);
    };

    // Progress updated handler (for in-progress achievements)
    const handleProgressUpdated = (data) => {
      console.log("📈 Progress updated:", data);

      const { achievementId, progress } = data;

      setUserAchievements((prev) =>
        prev.map((ua) => {
          if ((ua.achievement?._id || ua._id) === achievementId) {
            return { ...ua, progress };
          }
          return ua;
        })
      );
    };

    // Streak updated handler
    const handleStreakUpdated = (data) => {
      console.log("🔥 Streak updated:", data);

      setUserStats((prev) => ({
        ...prev,
        currentStreak: data.currentStreak,
        longestStreak: Math.max(prev?.longestStreak || 0, data.currentStreak),
      }));
    };

    // Register event listeners
    socket.on("achievement:unlocked", handleAchievementUnlocked);
    socket.on("stats:updated", handleStatsUpdated);
    socket.on("leaderboard:updated", handleLeaderboardUpdated);
    socket.on("progress:updated", handleProgressUpdated);
    socket.on("streak:updated", handleStreakUpdated);

    // Cleanup
    return () => {
      socket.emit("gamification:unsubscribe", { userId: user._id || user.id });
      socket.off("achievement:unlocked", handleAchievementUnlocked);
      socket.off("stats:updated", handleStatsUpdated);
      socket.off("leaderboard:updated", handleLeaderboardUpdated);
      socket.off("progress:updated", handleProgressUpdated);
      socket.off("streak:updated", handleStreakUpdated);
    };
  }, [socket, isConnected, user]);

  // Manually trigger achievement check (after quiz completion, etc.)
  const checkAchievements = useCallback(
    async (eventData) => {
      if (!socket || !isConnected) {
        // Fallback to HTTP if socket not available
        try {
          const token = localStorage.getItem("quizwise-token");
          const API_URL = import.meta.env.VITE_API_URL;

          await fetch(`${API_URL}/api/gamification/check-achievements`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": token,
            },
            body: JSON.stringify(eventData),
          });

          // Refresh data after check to get updated achievement counts
          console.log(
            "✅ Refreshing gamification data after achievement check"
          );
          await fetchGamificationData();
        } catch (error) {
          console.error("Error checking achievements:", error);
        }
        return;
      }

      socket.emit("gamification:check-achievements", eventData);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [socket, isConnected] // fetchGamificationData omitted to prevent infinite loop
  );

  // Award XP (used by components)
  const awardXP = useCallback(
    async (amount, reason) => {
      if (!socket || !isConnected) {
        // Fallback to HTTP
        try {
          const token = localStorage.getItem("quizwise-token");
          const API_URL = import.meta.env.VITE_API_URL;

          const response = await fetch(`${API_URL}/api/gamification/award-xp`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-auth-token": token,
            },
            body: JSON.stringify({ amount, reason }),
          });

          if (response.ok) {
            const data = await response.json();
            setUserStats((prev) => ({
              ...prev,
              ...data.stats,
            }));

            setXpAnimation({ amount, levelUp: data.levelUp });
            setTimeout(() => setXpAnimation(null), 2000);
          }
        } catch (error) {
          console.error("Error awarding XP:", error);
        }
        return;
      }

      socket.emit("gamification:award-xp", { amount, reason });
    },
    [socket, isConnected]
  );

  // Clear achievement notification
  const clearAchievementNotification = useCallback(() => {
    setAchievementNotification(null);
  }, []);

  // Refresh data manually
  const refreshData = useCallback(() => {
    setLoading(true);
    fetchGamificationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - function is stable and uses latest state via closure

  // Calculate level progress
  const getLevelProgress = useCallback(() => {
    if (!userStats) return { current: 0, next: 100, percentage: 0 };

    const currentXP = userStats.experience || 0;
    const level = userStats.level || 1;

    // Progressive XP formula: Level = floor(sqrt(XP / 25)) + 1
    // Reverse formula: XP needed for level N = (N - 1)^2 * 25
    const xpForCurrentLevel = Math.pow(level - 1, 2) * 25;
    const xpForNextLevel = Math.pow(level, 2) * 25;
    const xpInCurrentLevel = currentXP - xpForCurrentLevel;
    const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;

    return {
      current: xpInCurrentLevel,
      next: xpNeededForLevel,
      percentage: Math.min((xpInCurrentLevel / xpNeededForLevel) * 100, 100),
    };
  }, [userStats]);

  // Compute unlocked features based on user stats
  const unlockedFeatures = useMemo(() => {
    if (!userStats) return [];

    return getUnlockedFeatures({
      ...userStats,
      level: userStats.level || 1,
      experience: userStats.experience || 0,
    });
  }, [userStats]);

  // Compute upcoming features (close to unlocking)
  const upcomingFeatures = useMemo(() => {
    if (!userStats) return [];

    return getUpcomingFeatures(
      {
        ...userStats,
        level: userStats.level || 1,
        experience: userStats.experience || 0,
      },
      5
    );
  }, [userStats]);

  // Check for newly unlocked features when stats change
  // Skip feature unlocking for non-students (teachers, admins, moderators)
  useEffect(() => {
    if (!userStats || !isStudent) return;

    const currentUnlockedIds = getUnlockedFeatures({
      ...userStats,
      level: userStats.level || 1,
      experience: userStats.experience || 0,
    }).map((f) => f.id);

    if (currentUnlockedIds.length === 0) return;

    const currentUnlockedSet = new Set(currentUnlockedIds);

    // Convert to sorted string for comparison
    const currentIds = currentUnlockedIds.sort().join(",");
    const previousIds = Array.from(previousUnlockedFeatures).sort().join(",");

    // Only proceed if the set of unlocked features actually changed
    if (currentIds === previousIds) return;

    // Find newly unlocked features (not in previous set)
    const newlyUnlocked = currentUnlockedIds.filter(
      (id) => !previousUnlockedFeatures.has(id)
    );

    // If we have newly unlocked features and this isn't the initial load
    if (newlyUnlocked.length > 0 && previousUnlockedFeatures.size > 0) {
      // Get full feature objects for notifications
      const features = getUnlockedFeatures({
        ...userStats,
        level: userStats.level || 1,
        experience: userStats.experience || 0,
      });

      const newFeatures = features.filter((f) => newlyUnlocked.includes(f.id));

      if (newFeatures.length > 0) {
        // Show notification for the first newly unlocked feature
        setFeatureUnlockNotification(newFeatures[0].id);

        // If multiple features unlocked, queue them
        if (newFeatures.length > 1) {
          newFeatures.slice(1).forEach((feature, index) => {
            setTimeout(() => {
              setFeatureUnlockNotification(feature.id);
            }, (index + 1) * 3000);
          });
        }
      }
    }

    // Update the previous set
    setPreviousUnlockedFeatures(currentUnlockedSet);
  }, [userStats, isStudent]); // Include isStudent in dependencies

  // Check if a specific feature is unlocked
  const isFeatureUnlocked = useCallback(
    (featureId) => {
      if (!userStats) return false;

      const status = checkFeatureUnlock(featureId, {
        ...userStats,
        level: userStats.level || 1,
        experience: userStats.experience || 0,
      });

      return status.unlocked;
    },
    [userStats]
  );

  // Get feature unlock status with progress
  const getFeatureUnlockStatus = useCallback(
    (featureId) => {
      if (!userStats) {
        return { unlocked: false, progress: 0, remaining: "Loading..." };
      }

      return checkFeatureUnlock(featureId, {
        ...userStats,
        level: userStats.level || 1,
        experience: userStats.experience || 0,
      });
    },
    [userStats]
  );

  // Clear feature unlock notification
  const clearFeatureUnlockNotification = useCallback(() => {
    setFeatureUnlockNotification(null);
  }, []);

  const value = {
    // State
    userStats,
    achievements,
    userAchievements,
    recentUnlocks,
    leaderboard,
    loading,
    xpAnimation,
    achievementNotification,
    featureUnlockNotification,

    // Actions
    checkAchievements,
    awardXP,
    refreshData,
    clearAchievementNotification,
    clearFeatureUnlockNotification,

    // Feature unlock functions
    isFeatureUnlocked,
    getFeatureUnlockStatus,
    unlockedFeatures,
    upcomingFeatures,

    // Computed
    getLevelProgress,

    // Derived state
    unlockedCount: userAchievements.filter((ua) => ua.isCompleted).length,
    totalAchievements: achievements.length,
    currentLevel: userStats?.level || 1,
    totalXP: userStats?.experience || userStats?.totalPoints || 0,
    currentStreak: userStats?.currentStreak || 0,
    quizzesCompleted: userStats?.quizzesCompleted || 0,
    duelsWon: userStats?.duelsWon || 0,
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

export default GamificationProvider;
