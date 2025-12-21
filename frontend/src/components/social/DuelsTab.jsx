import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Swords, Zap, ArrowRight, Trophy, Gamepad2, Crown, Target } from "lucide-react";

const DuelsTab = ({ challenges, friends, onChallengeFriend, isDark, userId }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Quick Duel CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-6 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-2xl">
              <Swords className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">1v1 Duel Arena</h3>
              <p className="text-white/80">Challenge random players or friends!</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/duel")}
            className="px-6 py-3 bg-white text-red-600 font-bold rounded-xl flex items-center gap-2 shadow-lg"
          >
            <Zap className="w-5 h-5" />
            Quick Match
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Active Challenges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`backdrop-blur-xl rounded-2xl p-6 border shadow-xl ${
          isDark ? "bg-slate-800/60 border-white/10" : "bg-white/80 border-white/60"
        }`}
      >
        <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
          isDark ? "text-white" : "text-gray-900"
        }`}>
          <Trophy className="w-5 h-5 text-yellow-500" />
          Your Challenges
        </h3>

        {challenges.length === 0 ? (
          <div className={`text-center py-12 rounded-xl border-2 border-dashed ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}>
            <Trophy className={`w-12 h-12 mx-auto mb-3 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
            <p className={isDark ? "text-gray-400" : "text-gray-500"}>
              No active challenges. Challenge a friend to start!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {challenges.map((challenge, idx) => (
              <motion.div
                key={challenge._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-5 rounded-xl border transition-all ${
                  isDark 
                    ? "bg-slate-700/50 border-white/5 hover:border-purple-500/30" 
                    : "bg-gray-50 border-gray-200 hover:border-purple-300"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                      <Gamepad2 className="w-5 h-5 text-white" />
                    </div>
                    <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {challenge.quiz?.title || "Quiz Challenge"}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    challenge.status === "pending"
                      ? "bg-yellow-500/20 text-yellow-500"
                      : challenge.status === "accepted"
                      ? "bg-blue-500/20 text-blue-500"
                      : challenge.status === "completed"
                      ? "bg-emerald-500/20 text-emerald-500"
                      : "bg-gray-500/20 text-gray-500"
                  }`}>
                    {challenge.status?.toUpperCase()}
                  </span>
                </div>
                
                {challenge.status === "completed" && challenge.winner && (
                  <div className={`mt-3 p-3 rounded-xl flex items-center gap-2 ${
                    isDark ? "bg-yellow-500/10" : "bg-yellow-50"
                  }`}>
                    <Crown className="w-5 h-5 text-yellow-500" />
                    <span className={`font-semibold ${isDark ? "text-yellow-400" : "text-yellow-700"}`}>
                      Winner: {challenge.winner === userId ? "You! 🎉" : challenge.winner}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Challenge Friends Grid */}
      {friends.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`backdrop-blur-xl rounded-2xl p-6 border shadow-xl ${
            isDark ? "bg-slate-800/60 border-white/10" : "bg-white/80 border-white/60"
          }`}
        >
          <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            <Target className="w-5 h-5 text-red-500" />
            Challenge a Friend
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {friends.slice(0, 8).map((friend) => (
              <motion.button
                key={friend._id || friend.friendshipId}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onChallengeFriend(friend)}
                className={`p-4 rounded-xl text-center transition-all border ${
                  isDark 
                    ? "bg-slate-700/50 border-white/5 hover:border-red-500/30 hover:bg-slate-700" 
                    : "bg-gray-50 border-gray-200 hover:border-red-300 hover:bg-gray-100"
                }`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold mx-auto mb-2">
                  {friend.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <p className={`font-semibold text-sm truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                  {friend.name?.split(" ")[0] || "Unknown"}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DuelsTab;
