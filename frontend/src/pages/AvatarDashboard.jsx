import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Sparkles,
  Palette,
  Volume2,
  TrendingUp,
  Settings,
  ChevronRight,
  Award,
  Mic,
  BookOpen,
  Brain,
} from "lucide-react";
import { useAvatar } from "../context/AvatarContext";
import {
  LearningAvatar,
  AvatarCustomizer,
  AvatarEvolution,
  VoiceClone,
} from "../components/Avatar";

/**
 * AvatarDashboard
 * Main page for managing AI Learning Avatar
 */
const AvatarDashboard = () => {
  const {
    avatar,
    loading,
    error,
    fetchAvatar,
    createAvatar,
    isAvatarEnabled,
    setIsAvatarEnabled,
    learningInsights,
  } = useAvatar();

  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAvatarName, setNewAvatarName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchAvatar();
  }, []);

  // Create new avatar
  const handleCreateAvatar = async () => {
    if (!newAvatarName.trim()) return;
    
    setIsCreating(true);
    try {
      await createAvatar({ name: newAvatarName.trim() });
      setShowCreateModal(false);
      setNewAvatarName("");
    } catch (err) {
      console.error("Error creating avatar:", err);
    } finally {
      setIsCreating(false);
    }
  };

  // Tab configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "customize", label: "Customize", icon: Palette },
    { id: "evolution", label: "Evolution", icon: TrendingUp },
    { id: "voice", label: "Voice Clone", icon: Volume2 },
    { id: "insights", label: "Learning Style", icon: Brain },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // No avatar state
  if (!avatar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-900 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mx-auto mb-8 flex items-center justify-center"
          >
            <Sparkles className="w-16 h-16 text-white" />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Create Your Learning Avatar
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Your AI-powered learning companion that evolves with you, celebrates your wins,
            and helps you understand complex topics in your own voice!
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              {
                icon: Sparkles,
                title: "Evolves With You",
                desc: "Unlock accessories, outfits, and animations as you learn",
              },
              {
                icon: Volume2,
                title: "Voice Cloning",
                desc: "Hear explanations in YOUR voice for better retention",
              },
              {
                icon: Award,
                title: "Celebrates Success",
                desc: "Emotional reactions during quizzes to keep you motivated",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
              >
                <feature.icon className="w-10 h-10 text-indigo-500 mb-4" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:from-indigo-600 hover:to-purple-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-5 h-5" />
            Create My Avatar
          </motion.button>
        </div>

        {/* Create Avatar Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Name Your Avatar
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Give your learning companion a unique name!
                </p>

                <input
                  type="text"
                  value={newAvatarName}
                  onChange={(e) => setNewAvatarName(e.target.value)}
                  placeholder="Enter avatar name..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-6"
                  autoFocus
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={handleCreateAvatar}
                    disabled={!newAvatarName.trim() || isCreating}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isCreating ? "Creating..." : "Create Avatar"}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-900">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Learning Avatar
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Customize, evolve, and learn with your AI companion
            </p>
          </div>

          {/* Avatar Toggle */}
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Avatar Active
            </span>
            <motion.button
              onClick={() => setIsAvatarEnabled(!isAvatarEnabled)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                isAvatarEnabled ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <motion.div
                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
                animate={{ left: isAvatarEnabled ? "calc(100% - 24px)" : "4px" }}
              />
            </motion.button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto pb-2 mb-6 gap-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-indigo-500 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Avatar Display */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                  <div className="flex flex-col items-center">
                    <LearningAvatar
                      size="large"
                      showName={true}
                      showLevel={true}
                      interactive={true}
                    />
                    
                    <div className="mt-6 text-center">
                      <p className="text-gray-600 dark:text-gray-400">
                        Level {avatar.evolution?.level || 1} •{" "}
                        <span className="capitalize">
                          {avatar.evolution?.evolutionStage || "Novice"}
                        </span>
                      </p>
                    </div>

                    <motion.button
                      onClick={() => setActiveTab("customize")}
                      className="mt-4 flex items-center gap-2 text-indigo-500 hover:text-indigo-600"
                      whileHover={{ x: 5 }}
                    >
                      Customize Avatar
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        label: "Total XP",
                        value: avatar.evolution?.totalXP || 0,
                        icon: Sparkles,
                        color: "text-yellow-500",
                      },
                      {
                        label: "Level",
                        value: avatar.evolution?.level || 1,
                        icon: TrendingUp,
                        color: "text-green-500",
                      },
                      {
                        label: "Items Unlocked",
                        value: avatar.evolution?.unlockedItems?.length || 0,
                        icon: Award,
                        color: "text-purple-500",
                      },
                      {
                        label: "Voice Profile",
                        value: avatar.voiceProfile?.hasVoiceProfile ? "Active" : "Not Set",
                        icon: Mic,
                        color: "text-blue-500",
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg"
                      >
                        <div className="flex items-center gap-3">
                          <stat.icon className={`w-8 h-8 ${stat.color}`} />
                          <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {stat.value}
                            </p>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Learning Style */}
                  {avatar.learningStyle && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-500" />
                        Your Learning Style
                      </h3>
                      
                      <div className="space-y-3">
                        {Object.entries(avatar.learningStyle.styleWeights || {}).map(
                          ([style, weight]) => (
                            <div key={style}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400 capitalize">
                                  {style}
                                </span>
                                <span className="text-gray-900 dark:text-white">
                                  {Math.round(weight * 100)}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${weight * 100}%` }}
                                />
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recent Activity */}
                  {avatar.emotions?.emotionHistory?.slice(0, 5).length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Recent Reactions
                      </h3>
                      <div className="space-y-2">
                        {avatar.emotions.emotionHistory.slice(0, 5).map((emotion, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-600 dark:text-gray-400 capitalize">
                              {emotion.emotion}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {new Date(emotion.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Customize Tab */}
            {activeTab === "customize" && (
              <AvatarCustomizer
                onClose={() => setActiveTab("overview")}
                onSave={async (avatarData) => {
                  // Avatar data is automatically saved through the context
                  // Just switch back to overview tab
                  setActiveTab("overview");
                }}
              />
            )}

            {/* Evolution Tab */}
            {activeTab === "evolution" && <AvatarEvolution />}

            {/* Voice Clone Tab */}
            {activeTab === "voice" && (
              <VoiceClone onComplete={() => setActiveTab("overview")} />
            )}

            {/* Learning Insights Tab */}
            {activeTab === "insights" && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Learning Style Analysis
                </h2>
                
                {learningInsights ? (
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Dominant Style */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-6 text-white">
                      <h3 className="text-lg font-semibold mb-2">
                        Your Dominant Learning Style
                      </h3>
                      <p className="text-3xl font-bold capitalize mb-4">
                        {learningInsights.dominantStyle || "Discovering..."}
                      </p>
                      <p className="text-indigo-100">
                        {learningInsights.description || 
                          "Complete more quizzes to discover your learning style!"}
                      </p>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Personalized Recommendations
                      </h3>
                      <ul className="space-y-3">
                        {(learningInsights.recommendations || [
                          "Complete more quizzes to get personalized recommendations",
                          "Try different question types to improve adaptability",
                          "Use voice explanations for better retention",
                        ]).map((rec, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-gray-600 dark:text-gray-400"
                          >
                            <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-indigo-500 text-sm font-medium">
                                {i + 1}
                              </span>
                            </div>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Style Breakdown */}
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Learning Style Breakdown
                      </h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { name: "Visual", icon: "👁️", color: "bg-blue-500" },
                          { name: "Auditory", icon: "👂", color: "bg-green-500" },
                          { name: "Reading/Writing", icon: "📖", color: "bg-yellow-500" },
                          { name: "Kinesthetic", icon: "🤲", color: "bg-red-500" },
                        ].map((style) => {
                          const weight =
                            avatar.learningStyle?.styleWeights?.[style.name.toLowerCase()] || 0.25;
                          return (
                            <div
                              key={style.name}
                              className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"
                            >
                              <div className="text-2xl mb-2">{style.icon}</div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {style.name}
                              </p>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {Math.round(weight * 100)}%
                              </p>
                              <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${style.color}`}
                                  style={{ width: `${weight * 100}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Complete some quizzes to discover your learning style!
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AvatarDashboard;
