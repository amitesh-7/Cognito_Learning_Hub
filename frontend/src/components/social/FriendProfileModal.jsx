import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Zap, Award, Target, Flame, Star, Calendar, TrendingUp } from "lucide-react";

const FriendProfileModal = ({ isOpen, onClose, friend, stats, achievements, isDark }) => {
  if (!isOpen || !friend) return null;

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className={`p-4 rounded-xl ${isDark ? "bg-slate-700/50" : "bg-gray-50"}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          {label}
        </span>
      </div>
      <p className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl ${
            isDark ? "bg-slate-900 border border-white/10" : "bg-white"
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                {friend.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {friend.name}
                </h2>
                <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {friend.email}
                </p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                  isDark ? "bg-violet-500/20 text-violet-400" : "bg-violet-100 text-violet-700"
                }`}>
                  {friend.role}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors ${
                isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="mb-6">
            <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Statistics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard 
                icon={Zap} 
                label="Total XP" 
                value={stats?.totalXP || stats?.xp || 0} 
                color="text-yellow-500" 
              />
              <StatCard 
                icon={Star} 
                label="Level" 
                value={stats?.level || 1} 
                color="text-purple-500" 
              />
              <StatCard 
                icon={Target} 
                label="Quizzes" 
                value={stats?.quizzesTaken || stats?.totalQuizzesTaken || 0} 
                color="text-blue-500" 
              />
              <StatCard 
                icon={Flame} 
                label="Streak" 
                value={`${stats?.currentStreak || 0} days`} 
                color="text-orange-500" 
              />
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${
              isDark ? "text-white" : "text-gray-900"
            }`}>
              <Trophy className="w-5 h-5 text-yellow-500" />
              Achievements ({achievements?.length || 0})
            </h3>
            
            {achievements && achievements.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {achievements.slice(0, 6).map((ach, idx) => (
                  <motion.div
                    key={ach._id || idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-3 rounded-xl text-center ${
                      isDark ? "bg-slate-700/50" : "bg-gradient-to-br from-yellow-50 to-orange-50"
                    }`}
                  >
                    <div className="text-3xl mb-1">{ach.achievement?.icon || ach.icon || "🏆"}</div>
                    <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                      {ach.achievement?.name || ach.name || "Achievement"}
                    </p>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      {ach.unlockedAt ? new Date(ach.unlockedAt).toLocaleDateString() : "Unlocked"}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-8 rounded-xl border-2 border-dashed ${
                isDark ? "border-gray-700" : "border-gray-200"
              }`}>
                <Award className={`w-10 h-10 mx-auto mb-2 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
                <p className={isDark ? "text-gray-400" : "text-gray-500"}>No achievements yet</p>
              </div>
            )}
          </div>

          {/* Friend Since */}
          {friend.friendSince && (
            <div className={`mt-6 pt-4 border-t ${isDark ? "border-white/10" : "border-gray-200"}`}>
              <p className={`text-sm flex items-center gap-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                <Calendar className="w-4 h-4" />
                Friends since {new Date(friend.friendSince).toLocaleDateString()}
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FriendProfileModal;
