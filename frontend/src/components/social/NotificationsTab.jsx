import React from "react";
import { motion } from "framer-motion";
import { Bell, UserPlus, Heart, Gamepad2, Trophy, Radio, UserCheck, UserX } from "lucide-react";

const NotificationsTab = ({ notifications, onMarkRead, onRespondFriendRequest, isDark }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case "friend-request": return <UserPlus className="w-5 h-5 text-blue-500" />;
      case "friend-accepted": return <Heart className="w-5 h-5 text-emerald-500" />;
      case "quiz-challenge": return <Gamepad2 className="w-5 h-5 text-purple-500" />;
      case "challenge-won": return <Trophy className="w-5 h-5 text-yellow-500" />;
      case "broadcast": return <Radio className="w-5 h-5 text-red-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationBg = (type) => {
    switch (type) {
      case "friend-request": return "bg-blue-500/20";
      case "friend-accepted": return "bg-emerald-500/20";
      case "quiz-challenge": return "bg-purple-500/20";
      case "challenge-won": return "bg-yellow-500/20";
      default: return "bg-gray-500/20";
    }
  };

  if (notifications.length === 0) {
    return (
      <div className={`text-center py-16 rounded-2xl border-2 border-dashed ${
        isDark ? "border-gray-700 bg-slate-800/30" : "border-gray-200 bg-gray-50/50"
      }`}>
        <Bell className={`w-16 h-16 mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
        <p className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          All caught up!
        </p>
        <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          No new notifications
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification, index) => (
        <motion.div
          key={notification._id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => !notification.isRead && onMarkRead(notification._id)}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            notification.isRead
              ? isDark ? "bg-slate-800/40 border-white/5" : "bg-white/60 border-gray-200"
              : isDark ? "bg-violet-500/10 border-violet-500/30" : "bg-violet-50 border-violet-200"
          } hover:shadow-lg`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${getNotificationBg(notification.type)}`}>
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {notification.title}
                  </p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {notification.message}
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-3 h-3 bg-violet-500 rounded-full animate-pulse" />
                )}
              </div>

              {/* Friend Request Actions */}
              {notification.type === "friend-request" && !notification.isRead && notification.metadata?.friendshipId && (
                <div className="mt-4 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRespondFriendRequest(notification.metadata.friendshipId, "accept");
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg text-sm flex items-center gap-1"
                  >
                    <UserCheck className="w-4 h-4" />
                    Accept
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRespondFriendRequest(notification.metadata.friendshipId, "decline");
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-lg text-sm flex items-center gap-1"
                  >
                    <UserX className="w-4 h-4" />
                    Decline
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default NotificationsTab;
