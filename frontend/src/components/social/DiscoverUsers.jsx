import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, UserPlus, Loader, Clock, UserCheck, Sparkles, RefreshCw } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const DiscoverUsers = ({ suggestions: propSuggestions, onSendRequest, onRefresh, isDark }) => {
  const [localSuggestions, setLocalSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState({});

  // Use prop suggestions if provided, otherwise fetch locally
  // Ensure suggestions is always an array
  const suggestions = Array.isArray(propSuggestions) 
    ? propSuggestions 
    : Array.isArray(localSuggestions) 
      ? localSuggestions 
      : [];

  useEffect(() => {
    if (!propSuggestions) {
      fetchSuggestions();
    }
  }, [propSuggestions]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("quizwise-token") || localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/api/friends/suggestions`,
        { headers: { "x-auth-token": token } }
      );
      const data = await response.json();
      if (response.ok) {
        setLocalSuggestions(data.suggestions || data.users || []);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      fetchSuggestions();
    }
  };

  const sendFriendRequest = async (userId) => {
    setSendingRequest(prev => ({ ...prev, [userId]: true }));
    try {
      if (onSendRequest) {
        await onSendRequest(userId);
      } else {
        const token = localStorage.getItem("quizwise-token") || localStorage.getItem("token");
        const response = await fetch(
          `${API_URL}/api/friends/request`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-auth-token": token },
            body: JSON.stringify({ recipientId: userId }),
          }
        );
        if (response.ok) {
          // Mark as pending in UI
          setLocalSuggestions(prev => 
            prev.map(u => u._id === userId ? { ...u, requestSent: true } : u)
          );
        }
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
    } finally {
      setSendingRequest(prev => ({ ...prev, [userId]: false }));
    }
  };

  if (loading) {
    return (
      <div className={`backdrop-blur-xl rounded-2xl p-6 border shadow-xl ${
        isDark ? "bg-slate-800/60 border-white/10" : "bg-white/80 border-white/60"
      }`}>
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin text-violet-500" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`backdrop-blur-xl rounded-2xl p-6 border shadow-xl ${
        isDark ? "bg-slate-800/60 border-white/10" : "bg-white/80 border-white/60"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold flex items-center gap-2 ${
          isDark ? "text-white" : "text-gray-900"
        }`}>
          <Compass className="w-5 h-5 text-cyan-500" />
          Discover People
          <Sparkles className="w-4 h-4 text-yellow-500" />
        </h3>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          className={`p-2 rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
        >
          <RefreshCw className="w-4 h-4" />
        </motion.button>
      </div>

      {suggestions.length === 0 ? (
        <div className={`text-center py-8 rounded-xl border-2 border-dashed ${
          isDark ? "border-gray-700" : "border-gray-200"
        }`}>
          <Compass className={`w-10 h-10 mx-auto mb-2 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
          <p className={isDark ? "text-gray-400" : "text-gray-500"}>
            No suggestions right now
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <AnimatePresence>
            {suggestions.map((user, idx) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-4 rounded-xl text-center border transition-all ${
                  isDark 
                    ? "bg-slate-700/50 border-white/5 hover:border-violet-500/30" 
                    : "bg-gray-50 border-gray-200 hover:border-violet-300"
                }`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold mx-auto mb-2">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <p className={`font-semibold text-sm truncate mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                  {user.name?.split(" ")[0]}
                </p>
                <p className={`text-xs truncate mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  {user.role}
                </p>
                
                {user.requestSent ? (
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${
                    isDark ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    <Clock className="w-3 h-3" />
                    Pending
                  </span>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => sendFriendRequest(user._id)}
                    disabled={sendingRequest[user._id]}
                    className="w-full px-3 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1"
                  >
                    {sendingRequest[user._id] ? (
                      <Loader className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-3 h-3" />
                        Add
                      </>
                    )}
                  </motion.button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default DiscoverUsers;
