import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";
import { Video, LogIn, User, Hash, Sparkles, ArrowRight, Users } from "lucide-react";

const StudentJoinMeeting = () => {
  const { user } = useContext(AuthContext);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState(user?.name || "");
  const [isJoining, setIsJoining] = useState(false);

  const joinMeeting = () => {
    if (!roomId.trim()) {
      alert("Please enter a room ID");
      return;
    }

    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    setIsJoining(true);
    // Navigate to meeting room
    setTimeout(() => {
      navigate(`/meeting/${roomId.trim()}`);
    }, 500);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden py-8 px-4 sm:px-6 flex items-center justify-center transition-colors duration-300 ${
      isDark 
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950" 
        : "bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30"
    }`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-20 w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? "bg-blue-500/10" : "bg-blue-400/15"
        }`} />
        <div
          className={`absolute bottom-20 left-20 w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-3xl animate-pulse ${
            isDark ? "bg-indigo-500/10" : "bg-indigo-400/15"
          }`}
          style={{ animationDelay: "1s" }}
        />
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl ${
          isDark ? "bg-cyan-500/5" : "bg-cyan-400/10"
        }`} />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex p-4 bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-500 rounded-2xl shadow-xl shadow-blue-500/25 mb-6"
            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Video className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </motion.div>
          <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-3 ${
            isDark 
              ? "bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent" 
              : "bg-gradient-to-r from-slate-900 via-blue-700 to-indigo-600 bg-clip-text text-transparent"
          }`}>
            Join Meeting
          </h1>
          <p className={`text-base sm:text-lg ${
            isDark ? "text-gray-400" : "text-slate-600"
          }`}>
            Connect with your class{" "}
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent font-semibold">
              instantly
            </span>{" "}
            🎓
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          className="group relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 ${
            isDark ? "bg-gradient-to-br from-blue-500/20 to-cyan-500/20" : "bg-gradient-to-br from-blue-500/15 to-cyan-500/15"
          }`} />

          <div className={`relative backdrop-blur-xl border rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden ${
            isDark 
              ? "bg-slate-800/70 border-white/10 hover:border-blue-500/30" 
              : "bg-white/80 border-white/60 hover:border-blue-300"
          }`}>
            {/* Animated orbs */}
            <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 ${
              isDark ? "bg-blue-500/20" : "bg-blue-400/20"
            }`} />
            <div className={`absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 ${
              isDark ? "bg-cyan-500/20" : "bg-cyan-400/20"
            }`} />

            <div className="relative z-10 space-y-5">
              {/* Room ID Input */}
              <div>
                <label className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
                  isDark ? "text-gray-300" : "text-slate-700"
                }`}>
                  <Hash className="w-4 h-4 text-blue-500" />
                  Room ID
                </label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className={`w-full px-4 py-3.5 backdrop-blur-md border-2 rounded-xl font-medium outline-none transition-all ${
                    isDark 
                      ? "bg-slate-900/50 border-blue-500/30 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      : "bg-white/60 border-blue-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                  }`}
                  placeholder="Enter the room ID from your teacher"
                />
              </div>

              {/* Name Input */}
              <div>
                <label className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
                  isDark ? "text-gray-300" : "text-slate-700"
                }`}>
                  <User className="w-4 h-4 text-cyan-500" />
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-3.5 backdrop-blur-md border-2 rounded-xl font-medium outline-none transition-all ${
                    isDark 
                      ? "bg-slate-900/50 border-cyan-500/30 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" 
                      : "bg-white/60 border-cyan-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400"
                  }`}
                  placeholder="Enter your display name"
                />
              </div>

              {/* Join Button */}
              <motion.button
                onClick={joinMeeting}
                disabled={isJoining}
                className="group/btn relative w-full overflow-hidden rounded-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />

                <div className="relative px-6 py-4 flex items-center justify-center gap-3 text-white font-bold text-base sm:text-lg">
                  {isJoining ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span>Join Meeting</span>
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                </div>
              </motion.button>

              {/* Info Badge */}
              <div className={`flex items-center justify-center gap-2 px-4 py-3 backdrop-blur-md border rounded-xl ${
                isDark 
                  ? "bg-blue-500/10 border-blue-500/30" 
                  : "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-300/50"
              }`}>
                <Sparkles className={`w-4 h-4 ${
                  isDark ? "text-blue-400" : "text-blue-600"
                }`} />
                <span className={`text-sm font-medium ${
                  isDark ? "text-gray-300" : "text-slate-700"
                }`}>
                  Get the room ID from your teacher
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer tip */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            isDark ? "bg-slate-800/50 text-gray-400" : "bg-white/50 text-slate-500"
          }`}>
            <Users className="w-4 h-4" />
            <span className="text-sm">Ensure your camera & mic are ready!</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentJoinMeeting;
