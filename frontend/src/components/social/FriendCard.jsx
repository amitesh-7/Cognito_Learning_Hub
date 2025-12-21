import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Swords, Eye, Trophy, Zap } from "lucide-react";

const FriendCard = ({ friend, index, isDark, onChat, onChallenge, onViewProfile }) => {
  // Friend object now contains all the data directly
  const isOnline = friend.isOnline || friend.status === "online";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01, y: -2 }}
      className={`relative backdrop-blur-xl rounded-2xl p-5 border shadow-lg transition-all duration-300 overflow-hidden ${
        isDark 
          ? "bg-slate-800/60 border-white/10 hover:border-purple-500/30" 
          : "bg-white/80 border-white/60 hover:border-purple-300"
      }`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl" />
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar with online status */}
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {friend.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${
              isDark ? "border-slate-800" : "border-white"
            } ${isOnline ? "bg-emerald-500" : "bg-gray-400"}`}>
              {isOnline && (
                <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
              )}
            </div>
          </div>
          
          <div>
            <h3 className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
              {friend.name}
            </h3>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {friend.role || "Student"} • {isOnline ? "Online" : "Offline"}
            </p>
            {/* XP indicator */}
            {friend.xp && (
              <div className="flex items-center gap-1 mt-1">
                <Zap className="w-3 h-3 text-yellow-500" />
                <span className={`text-xs font-medium ${isDark ? "text-yellow-400" : "text-yellow-600"}`}>
                  {friend.xp.toLocaleString()} XP
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewProfile(friend)}
            className={`p-3 rounded-xl transition-all ${
              isDark 
                ? "bg-purple-500/20 hover:bg-purple-500/30 text-purple-400" 
                : "bg-purple-100 hover:bg-purple-200 text-purple-600"
            }`}
            title="View Profile"
          >
            <Eye className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChat(friend)}
            className={`p-3 rounded-xl transition-all ${
              isDark 
                ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400" 
                : "bg-blue-100 hover:bg-blue-200 text-blue-600"
            }`}
            title="Send Message"
          >
            <MessageCircle className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChallenge(friend)}
            className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white shadow-lg hover:shadow-xl transition-all"
            title="Challenge to Duel"
          >
            <Swords className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default FriendCard;
