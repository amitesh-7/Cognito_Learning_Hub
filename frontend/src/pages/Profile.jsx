import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import {
  User,
  Mail,
  Calendar,
  Trophy,
  Target,
  Zap,
  Clock,
  Award,
  TrendingUp,
  BookOpen,
  Users,
  Radio,
  Sword,
  BarChart3,
  Activity,
  Star,
  Flame,
  Brain,
  Shield,
  Crown,
  Edit,
  Camera,
  MapPin,
  Link as LinkIcon,
  Github,
  Linkedin,
  Twitter,
} from "lucide-react";
import { useToast } from "../components/ui/Toast";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // overview, history, activity

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("quizwise-token");
      
      // Try to fetch existing quiz results to calculate stats
      const resultsRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/results/my-results`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (resultsRes.ok) {
        const results = await resultsRes.json();
        const resultsArray = Array.isArray(results) ? results : (results.data || []);
        
        // Calculate stats from results
        const totalQuizzes = resultsArray.length;
        const totalScore = resultsArray.reduce((sum, r) => sum + (r.score || 0), 0);
        const totalPercentage = resultsArray.reduce((sum, r) => sum + (r.percentage || 0), 0);
        const avgPercentage = totalQuizzes > 0 ? Math.round(totalPercentage / totalQuizzes) : 0;
        const bestScore = totalQuizzes > 0 ? Math.max(...resultsArray.map(r => r.percentage || 0)) : 0;
        
        // Count quiz types (if available in metadata)
        const quizTypeBreakdown = {
          normal: resultsArray.filter(r => !r.isMultiplayer && !r.sessionId).length,
          duel: resultsArray.filter(r => r.isMultiplayer && !r.sessionId).length,
          live: resultsArray.filter(r => r.sessionId).length,
        };
        
        setStats({
          totalQuizzesTaken: totalQuizzes,
          averageScore: avgPercentage,
          totalPoints: totalScore,
          level: Math.floor(totalScore / 100) + 1,
          streak: 0,
          quizTypeBreakdown,
          bestScore: Math.round(bestScore),
          totalQuestionsAnswered: resultsArray.reduce((sum, r) => sum + (r.totalQuestions || 0), 0),
          accuracy: avgPercentage,
        });
        
        setQuizHistory(resultsArray.map(r => ({
          quizTitle: r.quiz?.title || "Quiz",
          mode: r.sessionId ? "live" : (r.isMultiplayer ? "duel" : "normal"),
          score: r.percentage || 0,
          completedAt: r.createdAt,
          points: r.score || 0,
        })));
      } else {
        throw new Error("No results available");
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      // Set empty stats instead of showing error
      setStats({
        totalQuizzesTaken: 0,
        averageScore: 0,
        totalPoints: 0,
        level: 1,
        streak: 0,
        quizTypeBreakdown: { normal: 0, duel: 0, live: 0 },
        bestScore: 0,
        totalQuestionsAnswered: 0,
        accuracy: 0,
      });
      setQuizHistory([]);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/30 dark:from-slate-900 dark:via-violet-950/30 dark:to-fuchsia-950/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-bold text-slate-700 dark:text-slate-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  const totalQuizzes = stats?.totalQuizzesTaken || 0;
  const avgScore = stats?.averageScore || 0;
  const totalPoints = stats?.totalPoints || 0;
  const currentLevel = stats?.level || 1;
  const currentStreak = stats?.streak || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/30 dark:from-slate-900 dark:via-violet-950/30 dark:to-fuchsia-950/30 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/20 dark:bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-slate-700/50 p-8 shadow-2xl mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-1 shadow-2xl">
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-5xl font-black text-violet-600">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              </div>
              <button className="absolute bottom-0 right-0 bg-violet-600 text-white p-2 rounded-full shadow-lg hover:bg-violet-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-4xl font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  {user?.name}
                </h1>
                {user?.role === "admin" && (
                  <Badge className="bg-red-500 text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
                {user?.role === "moderator" && (
                  <Badge className="bg-blue-500 text-white">
                    <Shield className="w-3 h-3 mr-1" />
                    Moderator
                  </Badge>
                )}
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-semibold mb-4 flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-violet-500" />
                  Joined {new Date(user?.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Level {currentLevel}
                </span>
                <span className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  {currentStreak} Day Streak
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="text-center px-6 py-4 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/50 dark:to-fuchsia-900/50 rounded-2xl border-2 border-violet-300/50 dark:border-violet-500/50">
                <div className="text-3xl font-black text-violet-600 dark:text-violet-400">{totalQuizzes}</div>
                <div className="text-xs font-bold text-violet-700 dark:text-violet-300">Quizzes</div>
              </div>
              <div className="text-center px-6 py-4 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 rounded-2xl border-2 border-emerald-300/50 dark:border-emerald-500/50">
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{avgScore}%</div>
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Avg Score</div>
              </div>
              <div className="text-center px-6 py-4 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-2xl border-2 border-amber-300/50 dark:border-amber-500/50">
                <div className="text-3xl font-black text-amber-600 dark:text-amber-400">{totalPoints}</div>
                <div className="text-xs font-bold text-amber-700 dark:text-amber-300">XP</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/20 dark:bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-slate-700/50 p-2 shadow-lg mb-8"
        >
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                activeTab === "overview"
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg"
                  : "text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                activeTab === "history"
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg"
                  : "text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
              }`}
            >
              <Clock className="w-5 h-5" />
              Quiz History
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                activeTab === "activity"
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg"
                  : "text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
              }`}
            >
              <Activity className="w-5 h-5" />
              Activity Log
            </button>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && <OverviewTab stats={stats} />}
          {activeTab === "history" && <HistoryTab quizHistory={quizHistory} />}
          {activeTab === "activity" && <ActivityTab userId={user?._id} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ stats }) {
  const quizTypeBreakdown = stats?.quizTypeBreakdown || {
    normal: 0,
    duel: 0,
    live: 0,
  };

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {/* Quiz Type Breakdown */}
      <Card className="p-6 bg-white/20 dark:bg-slate-800/40 backdrop-blur-xl border-white/30 dark:border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">Normal Quizzes</h3>
        </div>
        <div className="text-4xl font-black text-violet-600 dark:text-violet-400 mb-2">
          {quizTypeBreakdown.normal}
        </div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Solo quiz attempts
        </p>
      </Card>

      <Card className="p-6 bg-white/20 dark:bg-slate-800/40 backdrop-blur-xl border-white/30 dark:border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Sword className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">1v1 Battles</h3>
        </div>
        <div className="text-4xl font-black text-cyan-600 dark:text-cyan-400 mb-2">
          {quizTypeBreakdown.duel}
        </div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Head-to-head duels
        </p>
      </Card>

      <Card className="p-6 bg-white/20 dark:bg-slate-800/40 backdrop-blur-xl border-white/30 dark:border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">Live Sessions</h3>
        </div>
        <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-2">
          {quizTypeBreakdown.live}
        </div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Multiplayer sessions
        </p>
      </Card>

      {/* Performance Stats */}
      <Card className="p-6 bg-white/20 dark:bg-slate-800/40 backdrop-blur-xl border-white/30 dark:border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">Best Score</h3>
        </div>
        <div className="text-4xl font-black text-amber-600 dark:text-amber-400 mb-2">
          {stats?.bestScore || 0}%
        </div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Highest achievement
        </p>
      </Card>

      <Card className="p-6 bg-white/20 dark:bg-slate-800/40 backdrop-blur-xl border-white/30 dark:border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">Total Questions</h3>
        </div>
        <div className="text-4xl font-black text-pink-600 dark:text-pink-400 mb-2">
          {stats?.totalQuestionsAnswered || 0}
        </div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Questions attempted
        </p>
      </Card>

      <Card className="p-6 bg-white/20 dark:bg-slate-800/40 backdrop-blur-xl border-white/30 dark:border-slate-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">Accuracy</h3>
        </div>
        <div className="text-4xl font-black text-green-600 dark:text-green-400 mb-2">
          {stats?.accuracy || 0}%
        </div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Correct answers
        </p>
      </Card>
    </motion.div>
  );
}

// History Tab Component
function HistoryTab({ quizHistory }) {
  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {quizHistory.length === 0 ? (
        <Card className="p-12 text-center bg-white/20 dark:bg-slate-800/40 backdrop-blur-xl">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
            No quiz history yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Start taking quizzes to see your history here!
          </p>
        </Card>
      ) : (
        quizHistory.map((quiz, index) => (
          <motion.div
            key={quiz._id || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-6 bg-white/20 dark:bg-slate-800/40 backdrop-blur-xl border-white/30 dark:border-slate-700/50 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      {quiz.quizTitle || "Quiz"}
                    </h4>
                    <Badge className={`${
                      quiz.mode === "normal" ? "bg-violet-500" :
                      quiz.mode === "duel" ? "bg-cyan-500" :
                      "bg-emerald-500"
                    } text-white`}>
                      {quiz.mode === "normal" && <BookOpen className="w-3 h-3 mr-1" />}
                      {quiz.mode === "duel" && <Sword className="w-3 h-3 mr-1" />}
                      {quiz.mode === "live" && <Radio className="w-3 h-3 mr-1" />}
                      {quiz.mode?.toUpperCase() || "NORMAL"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      Score: {quiz.score || 0}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(quiz.completedAt || quiz.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      +{quiz.points || 0} XP
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-black ${
                    quiz.score >= 80 ? "text-green-500" :
                    quiz.score >= 60 ? "text-amber-500" :
                    "text-red-500"
                  }`}>
                    {quiz.score || 0}%
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))
      )}
    </motion.div>
  );
}

// Activity Tab Component
function ActivityTab({ userId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      // For now, generate activity from quiz history since activity API doesn't exist yet
      const token = localStorage.getItem("quizwise-token");
      const resultsRes = await fetch(
        `${import.meta.env.VITE_API_URL}/api/results/my-results`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (resultsRes.ok) {
        const results = await resultsRes.json();
        const resultsArray = Array.isArray(results) ? results : (results.data || []);
        
        // Convert results to activity log
        const activityLog = resultsArray.map(result => ({
          _id: result._id,
          type: "quiz_completed",
          description: `Completed ${result.quiz?.title || "Quiz"} with ${result.percentage || 0}% score`,
          timestamp: result.createdAt,
        }));
        
        // Add a login activity for today
        activityLog.unshift({
          _id: "login-" + new Date().toISOString(),
          type: "login",
          description: "Logged in",
          timestamp: new Date().toISOString(),
        });
        
        setActivities(activityLog.slice(0, 20)); // Show last 20 activities
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching activity:", err);
      setActivities([]);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <motion.div
      key="activity"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {activities.length === 0 ? (
        <Card className="p-12 text-center bg-white/20 dark:bg-slate-800/40 backdrop-blur-xl">
          <Activity className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
            No recent activity
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Your activity log will appear here
          </p>
        </Card>
      ) : (
        activities.map((activity, index) => (
          <motion.div
            key={activity._id || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-4 bg-white/20 dark:bg-slate-800/40 backdrop-blur-xl border-white/30 dark:border-slate-700/50">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === "quiz_completed" ? "bg-green-500" :
                  activity.type === "login" ? "bg-blue-500" :
                  "bg-purple-500"
                }`}>
                  {activity.type === "quiz_completed" && <Trophy className="w-5 h-5 text-white" />}
                  {activity.type === "login" && <User className="w-5 h-5 text-white" />}
                  {activity.type === "achievement" && <Award className="w-5 h-5 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 dark:text-slate-100">
                    {activity.description || activity.action}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {new Date(activity.timestamp || activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))
      )}
    </motion.div>
  );
}
