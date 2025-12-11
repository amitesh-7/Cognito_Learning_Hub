import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Map, 
  Book, 
  Trophy, 
  Star, 
  Target,
  Crown,
  Zap,
  Award,
  CheckCircle
} from "lucide-react";
import QuestMap from "../components/Quests/QuestMap";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Progress } from "../components/ui/Progress";

const QuestPage = () => {
  const [stats, setStats] = useState({
    totalQuests: 1400,
    completedQuests: 0,
    totalXP: 0,
    totalRealms: 14,
    completedRealms: 0,
    badges: 0,
  });

  useEffect(() => {
    fetchQuestStats();
  }, []);

  const fetchQuestStats = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("quizwise-token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

      const response = await fetch(`${API_URL}/api/gamification/quests/user/progress`, {
        headers: { "x-auth-token": token },
      });

      console.log("Quest stats response:", response.status, response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("Quest stats data:", data);
        
        if (data.success && data.data) {
          const progress = data.data;
          console.log("Progress array:", progress);
          
          const completed = progress.reduce((sum, realm) => sum + (realm.completed || 0), 0);
          const total = progress.reduce((sum, realm) => sum + (realm.total || 0), 0);
          
          console.log("Calculated stats - Completed:", completed, "Total:", total);
          console.log("Sample realm data:", progress[0]);
          
          setStats({
            totalQuests: total || 1400,
            completedQuests: completed,
            totalXP: completed * 100, // Approximate XP
            totalRealms: progress.length,
            completedRealms: progress.filter(r => r.percentage === 100).length,
            badges: Math.floor(completed / 20),
          });
        }
      }
    } catch (error) {
      console.error("Error fetching quest stats:", error);
    }
  };

  const overallProgress = stats.totalQuests > 0 
    ? Math.round((stats.completedQuests / stats.totalQuests) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Map className="w-12 h-12 text-purple-600 dark:text-purple-400" />
            </motion.div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              Quest Realms
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Embark on epic learning journeys across 14 themed realms. Complete quests, earn rewards, and master new skills!
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border-2 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Your Quest Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Overall Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Overall Progress
                    </span>
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {stats.completedQuests} / {stats.totalQuests} Quests
                    </span>
                  </div>
                  <Progress value={overallProgress} className="h-3" />
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                    {overallProgress}% Complete
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center space-y-1">
                    <div className="flex justify-center">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.completedQuests}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Completed
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="flex justify-center">
                      <Zap className="w-8 h-8 text-yellow-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalXP.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Total XP
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="flex justify-center">
                      <Map className="w-8 h-8 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.completedRealms}/{stats.totalRealms}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Realms Done
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="flex justify-center">
                      <Award className="w-8 h-8 text-indigo-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.badges}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Badges
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="flex justify-center">
                      <Crown className="w-8 h-8 text-amber-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.floor(overallProgress / 10)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Rank Level
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Realm Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5 text-blue-600" />
                Academic Realms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Master core subjects from mathematics to language arts
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">🔢 Mathematics</Badge>
                <Badge variant="outline">⚛️ Physics</Badge>
                <Badge variant="outline">🧪 Chemistry</Badge>
                <Badge variant="outline">🌿 Biology</Badge>
                <Badge variant="outline">💻 Computer Science</Badge>
                <Badge variant="outline">📜 History</Badge>
                <Badge variant="outline">📚 Language</Badge>
              </div>
              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                700 quests • Educational Focus
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Tech Realms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Dive deep into software development and cutting-edge tech
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">🟣 Algorithmic Valley</Badge>
                <Badge variant="outline">🔵 Web Wizardry</Badge>
                <Badge variant="outline">🟢 Data Kingdom</Badge>
                <Badge variant="outline">💗 AI Sanctuary</Badge>
                <Badge variant="outline">🔴 System Fortress</Badge>
                <Badge variant="outline">🟡 Security Citadel</Badge>
                <Badge variant="outline">🩵 Cloud Highlands</Badge>
              </div>
              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                700 quests • Coding Bootcamp
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quest Map Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
            <CardContent className="p-6">
              <QuestMap />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default QuestPage;
