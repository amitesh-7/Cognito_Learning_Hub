import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map,
  Scroll,
  Sword,
  Crown,
  Lock,
  CheckCircle,
  Star,
  Clock,
  Award,
  Zap,
  Users,
  Trophy,
  Gift,
  Book,
  MessageSquare,
  Play,
  Loader2,
} from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { useToast } from "../ui/Toast";
import { useNavigate } from "react-router-dom";

const QuestMap = () => {
  const [selectedRealm, setSelectedRealm] = useState(null);
  const [quests, setQuests] = useState([]);
  const [userQuests, setUserQuests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [showNPCDialog, setShowNPCDialog] = useState(false);
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  // All 14 realms - Academic + Tech
  const realms = [
    // Academic Realms (7)
    {
      id: "Mathematics Kingdom",
      name: "Mathematics Kingdom",
      icon: "🔢",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      category: "academic",
    },
    {
      id: "Physics Universe",
      name: "Physics Universe",
      icon: "⚛️",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      category: "academic",
    },
    {
      id: "Chemistry Lab",
      name: "Chemistry Lab",
      icon: "🧪",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      category: "academic",
    },
    {
      id: "Biology Forest",
      name: "Biology Forest",
      icon: "🌿",
      color: "from-green-600 to-lime-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      category: "academic",
    },
    {
      id: "Computer Science Hub",
      name: "Computer Science Hub",
      icon: "💻",
      color: "from-indigo-500 to-violet-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      category: "academic",
    },
    {
      id: "History Archives",
      name: "History Archives",
      icon: "📜",
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      category: "academic",
    },
    {
      id: "Language Realm",
      name: "Language Realm",
      icon: "📚",
      color: "from-rose-500 to-red-500",
      bgColor: "bg-rose-50 dark:bg-rose-900/20",
      category: "academic",
    },
    // Tech/CS Realms (7)
    {
      id: "Algorithmic Valley",
      name: "Algorithmic Valley",
      icon: "🟣",
      color: "from-purple-600 to-indigo-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      category: "tech",
    },
    {
      id: "Web Wizardry",
      name: "Web Wizardry",
      icon: "🔵",
      color: "from-blue-600 to-cyan-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      category: "tech",
    },
    {
      id: "Data Kingdom",
      name: "Data Kingdom",
      icon: "🟢",
      color: "from-green-600 to-teal-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      category: "tech",
    },
    {
      id: "AI Sanctuary",
      name: "AI Sanctuary",
      icon: "💗",
      color: "from-pink-600 to-rose-600",
      bgColor: "bg-pink-50 dark:bg-pink-900/20",
      category: "tech",
    },
    {
      id: "System Fortress",
      name: "System Fortress",
      icon: "🔴",
      color: "from-red-600 to-orange-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      category: "tech",
    },
    {
      id: "Security Citadel",
      name: "Security Citadel",
      icon: "🟡",
      color: "from-yellow-600 to-amber-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      category: "tech",
    },
    {
      id: "Cloud Highlands",
      name: "Cloud Highlands",
      icon: "🩵",
      color: "from-cyan-600 to-sky-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
      category: "tech",
    },
  ];

  useEffect(() => {
    if (selectedRealm) {
      fetchRealmQuests();
    }
  }, [selectedRealm]);

  const fetchRealmQuests = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("quizwise-token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

      const response = await fetch(
        `${API_URL}/api/gamification/quests/realm/${encodeURIComponent(
          selectedRealm
        )}`,
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const questsArray = Array.isArray(data.data) ? data.data : [];
        setQuests(questsArray);
      } else {
        console.error("Failed to load quests, status:", response.status);
        setQuests([]);
        showError("Failed to load quests");
      }
    } catch (error) {
      console.error("Error fetching quests:", error);
      setQuests([]);
      showError("Failed to load quests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserQuests();
  }, []);

  const fetchUserQuests = async () => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("quizwise-token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

      const response = await fetch(
        `${API_URL}/api/gamification/quests/my-quests`,
        {
          headers: { "x-auth-token": token },
        }
      );

      console.log("My quests response:", response.status, response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("My quests data:", data);
        const questsArray = Array.isArray(data.data) ? data.data : [];
        console.log("User quests array:", questsArray.length, "quests");
        setUserQuests(questsArray);
      } else {
        console.log("User quests not available yet, status:", response.status);
        setUserQuests([]);
      }
    } catch (error) {
      console.error("Error fetching user quests:", error);
      setUserQuests([]);
    }
  };

  const getQuestStatus = (questId) => {
    const userQuest = userQuests.find((uq) => uq.questId === questId);
    return userQuest?.status || "not_started";
  };

  const getQuestIcon = (questType) => {
    switch (questType) {
      case "boss":
        return <Crown className="w-5 h-5" />;
      case "battle":
        return <Sword className="w-5 h-5" />;
      case "challenge":
        return <Zap className="w-5 h-5" />;
      case "side_quest":
        return <Star className="w-5 h-5" />;
      default:
        return <Scroll className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Hard":
        return "bg-orange-100 text-orange-800";
      case "Legendary":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const startQuest = async (quest) => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("quizwise-token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

      const response = await fetch(
        `${API_URL}/api/gamification/quests/start/${quest.questId}`,
        {
          method: "POST",
          headers: {
            "x-auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        success(`Quest started: ${quest.title}`);
        setShowNPCDialog(false);
        // Navigate to quiz
        navigate(`/quiz/${quest.quizId}`);
      } else {
        const data = await response.json();
        showError(data.error || "Failed to start quest");
      }
    } catch (error) {
      console.error("Error starting quest:", error);
      showError("Failed to start quest");
    }
  };

  const openQuestDetails = (quest) => {
    setSelectedQuest(quest);
    setShowNPCDialog(true);
  };

  // Group quests by chapter - safely handle if quests is not an array
  const questsByChapter = Array.isArray(quests)
    ? quests.reduce((acc, quest) => {
        if (!acc[quest.chapter]) {
          acc[quest.chapter] = [];
        }
        acc[quest.chapter].push(quest);
        return acc;
      }, {})
    : {};

  if (!selectedRealm) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Choose Your Realm
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Embark on epic quests and unlock legendary rewards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {realms.map((realm) => (
            <motion.div
              key={realm.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card
                onClick={() => setSelectedRealm(realm.id)}
                className="cursor-pointer hover:shadow-xl transition-all p-6 border-2 hover:border-purple-500"
              >
                <div className={`text-6xl mb-4 text-center`}>{realm.icon}</div>
                <h3 className="text-xl font-bold text-center mb-2">
                  {realm.name}
                </h3>
                <div
                  className={`mt-4 py-2 px-4 rounded-lg ${realm.bgColor} text-center`}
                >
                  <span className="text-sm font-semibold">Enter Realm</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  const currentRealm = realms.find((r) => r.id === selectedRealm);

  return (
    <div className="space-y-6">
      {/* Realm Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setSelectedRealm(null)}
              className="text-white hover:bg-white/20"
            >
              ← Back to Realms
            </Button>
            <div className="text-5xl">{currentRealm?.icon}</div>
            <div>
              <h2 className="text-3xl font-bold">{currentRealm?.name}</h2>
              <p className="opacity-90">
                {quests.length} quests available in this realm
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Quest List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(questsByChapter)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([chapter, chapterQuests]) => (
              <div key={chapter}>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Book className="w-6 h-6 text-purple-600" />
                  Chapter {chapter}: {chapterQuests[0]?.chapterTitle}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chapterQuests.map((quest) => {
                    const status = getQuestStatus(quest.questId);
                    const isLocked = quest.isLocked || !quest.isActive;
                    const isCompleted = status === "completed";
                    const isInProgress = status === "in_progress";

                    return (
                      <motion.div
                        key={quest.questId}
                        whileHover={!isLocked ? { scale: 1.02 } : {}}
                      >
                        <Card
                          className={`p-4 cursor-pointer border-2 transition-all ${
                            isCompleted
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : isInProgress
                              ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                              : isLocked
                              ? "opacity-60 cursor-not-allowed"
                              : "hover:border-purple-500"
                          }`}
                          onClick={() => !isLocked && openQuestDetails(quest)}
                        >
                          {/* Quest Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {getQuestIcon(quest.questType)}
                              <Badge
                                className={getDifficultyColor(quest.difficulty)}
                              >
                                {quest.difficulty}
                              </Badge>
                            </div>
                            {isLocked && (
                              <Lock className="w-5 h-5 text-gray-400" />
                            )}
                            {isCompleted && (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                          </div>

                          {/* Quest Title */}
                          <h4 className="font-bold text-lg mb-2">
                            {quest.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                            {quest.description}
                          </p>

                          {/* Quest Info */}
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {quest.estimatedTime}m
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              {quest.rewards?.xp} XP
                            </div>
                          </div>

                          {/* Status Badge */}
                          {isCompleted && (
                            <Badge className="w-full justify-center bg-green-100 text-green-800">
                              ✓ Completed
                            </Badge>
                          )}
                          {isInProgress && (
                            <Badge className="w-full justify-center bg-yellow-100 text-yellow-800">
                              In Progress
                            </Badge>
                          )}
                          {!isCompleted && !isInProgress && !isLocked && (
                            <Badge className="w-full justify-center bg-purple-100 text-purple-800">
                              Available
                            </Badge>
                          )}
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* NPC Dialog Modal */}
      <AnimatePresence>
        {showNPCDialog && selectedQuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNPCDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <Card className="border-0">
                {/* NPC Section */}
                {selectedQuest.npc && (
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
                        {selectedQuest.npc.avatarUrl || "👤"}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">
                          {selectedQuest.npc.name}
                        </h3>
                        <p className="opacity-90">{selectedQuest.npc.role}</p>
                      </div>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg">
                      <MessageSquare className="w-5 h-5 mb-2" />
                      <p className="italic">
                        {selectedQuest.npc.dialogue?.introduction}
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-6 space-y-6">
                  {/* Quest Details */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {getQuestIcon(selectedQuest.questType)}
                      <h3 className="text-2xl font-bold">
                        {selectedQuest.title}
                      </h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {selectedQuest.description}
                    </p>
                  </div>

                  {/* Storyline */}
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <Scroll className="w-4 h-4" />
                      Storyline
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedQuest.storyline}
                    </p>
                  </div>

                  {/* Rewards */}
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-3">
                      <Gift className="w-4 h-4" />
                      Rewards
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                        <Star className="w-5 h-5 text-yellow-500 mb-1" />
                        <div className="font-bold">
                          {selectedQuest.rewards?.xp} XP
                        </div>
                      </div>
                      {selectedQuest.rewards?.gold > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                          <Trophy className="w-5 h-5 text-amber-500 mb-1" />
                          <div className="font-bold">
                            {selectedQuest.rewards?.gold} Gold
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => startQuest(selectedQuest)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Quest
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowNPCDialog(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestMap;
