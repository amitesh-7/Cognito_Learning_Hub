import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, Loader, Clock, UserCheck } from "lucide-react";

const UserSearch = ({ 
  searchQuery, 
  setSearchQuery, 
  searchResults, 
  onSearch, 
  onSendRequest, 
  loading, 
  isDark 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`backdrop-blur-xl rounded-2xl p-6 border shadow-xl ${
        isDark ? "bg-slate-800/60 border-white/10" : "bg-white/80 border-white/60"
      }`}
    >
      <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
        isDark ? "text-white" : "text-gray-900"
      }`}>
        <UserPlus className="w-5 h-5 text-violet-500" />
        Find Friends
      </h3>
      
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
            isDark ? "text-gray-500" : "text-gray-400"
          }`} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && onSearch()}
            className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 font-medium outline-none transition-all ${
              isDark 
                ? "bg-slate-900/50 border-violet-500/30 text-white placeholder-gray-500 focus:border-violet-500" 
                : "bg-white/60 border-violet-200 text-gray-900 placeholder-gray-400 focus:border-violet-400"
            }`}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSearch}
          disabled={loading || searchQuery.trim().length < 2}
          className="px-6 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center gap-2 shadow-lg"
        >
          {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          Search
        </motion.button>
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            {searchResults.map((user, idx) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex items-center justify-between p-4 rounded-xl ${
                  isDark ? "bg-slate-700/50" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {user.name}
                    </p>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {user.email}
                    </p>
                  </div>
                </div>
                
                {user.friendshipStatus === "none" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSendRequest(user._id)}
                    className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-lg text-sm flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add
                  </motion.button>
                )}
                {user.friendshipStatus === "pending" && (
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 ${
                    isDark ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    <Clock className="w-4 h-4" />
                    Pending
                  </span>
                )}
                {user.friendshipStatus === "accepted" && (
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 ${
                    isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    <UserCheck className="w-4 h-4" />
                    Friends
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserSearch;
