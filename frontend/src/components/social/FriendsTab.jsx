import React from "react";
import { motion } from "framer-motion";
import { Users, MessageCircle, Send, Star, Trophy, Zap, X, Clock } from "lucide-react";
import FriendCard from "./FriendCard";

const FriendsTab = ({
  friends,
  pendingRequests,
  sentRequests,
  onViewProfile,
  onChat,
  onChallenge,
  onRespondRequest,
  isDark
}) => {
  return (
    <div className="space-y-8">
      {/* Online Friends Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Online Friends ({friends.filter(f => f.isOnline).length})
          </h3>
        </div>
        
        {friends.filter(f => f.isOnline).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.filter(f => f.isOnline).map((friend, index) => (
              <FriendCard
                key={friend._id}
                friend={friend}
                index={index}
                onViewProfile={onViewProfile}
                onChat={onChat}
                onChallenge={onChallenge}
                isDark={isDark}
              />
            ))}
          </div>
        ) : (
          <div className={`text-center py-8 rounded-xl ${isDark ? "bg-slate-800/50" : "bg-gray-50"}`}>
            <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
              No friends online right now
            </p>
          </div>
        )}
      </div>

      {/* Pending Friend Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Pending Requests ({pendingRequests.length})
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((request, index) => {
              const user = request.user || request.requester;
              const id = request.friendshipId || request._id;
              return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border ${
                  isDark ? "bg-amber-500/10 border-amber-500/30" : "bg-amber-50 border-amber-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                      isDark ? "bg-gradient-to-br from-amber-500 to-orange-600" : "bg-gradient-to-br from-amber-400 to-orange-500"
                    }`}>
                      {user?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <p className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {user?.name || "Unknown"}
                    </p>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Wants to be your friend
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onRespondRequest(id, "accept")}
                      className="p-2 bg-emerald-500 text-white rounded-lg"
                    >
                      <Star className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onRespondRequest(id, "decline")}
                      className="p-2 bg-red-500 text-white rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
            })}
          </div>
        </div>
      )}

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Send className="w-5 h-5 text-blue-500" />
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Sent Requests ({sentRequests.length})
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sentRequests.map((request, index) => {
              const user = request.user || request.recipient;
              return (
              <motion.div
                key={request.friendshipId || request._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 rounded-xl ${
                  isDark ? "bg-blue-500/10 border border-blue-500/20" : "bg-blue-50 border border-blue-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    isDark ? "bg-gradient-to-br from-blue-500 to-cyan-600" : "bg-gradient-to-br from-blue-400 to-cyan-500"
                  }`}>
                    {user?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                      {user?.name || "Unknown"}
                    </p>
                    <p className={`text-xs ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                      Pending...
                    </p>
                  </div>
                </div>
              </motion.div>
            );
            })}
          </div>
        </div>
      )}

      {/* All Friends */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-violet-500" />
          <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            All Friends ({friends.length})
          </h3>
        </div>
        
        {friends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((friend, index) => (
              <FriendCard
                key={friend._id}
                friend={friend}
                index={index}
                onViewProfile={onViewProfile}
                onChat={onChat}
                onChallenge={onChallenge}
                isDark={isDark}
              />
            ))}
          </div>
        ) : (
          <div className={`text-center py-12 rounded-2xl border-2 border-dashed ${
            isDark ? "border-gray-700 bg-slate-800/30" : "border-gray-200 bg-gray-50/50"
          }`}>
            <Users className={`w-16 h-16 mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
            <p className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              No friends yet
            </p>
            <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Search for users or check discover section
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsTab;
