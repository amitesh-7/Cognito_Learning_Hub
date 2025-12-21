import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Button } from "../components/ui/Button";
import { Video, Copy, Star, Sparkles, Users, Rocket, ArrowRight, Check, Link as LinkIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getApiUrl } from "../lib/apiConfig";

const TeacherMeetingStart = () => {
  const { user } = useContext(AuthContext);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState("");
  const [copied, setCopied] = useState(false);

  const createMeeting = async () => {
    if (!user) {
      alert("Please login first");
      return;
    }

    setIsCreating(true);

    try {
      const token = localStorage.getItem("quizwise-token");

      if (!token) {
        alert("Session expired. Please login again.");
        setIsCreating(false);
        return;
      }

      const apiUrl = getApiUrl(); // Use API Gateway for REST calls

      const response = await fetch(`${apiUrl}/api/meetings/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token, // Use x-auth-token header (preferred by backend)
        },
        body: JSON.stringify({
          title: title || "My Meeting",
          description: "",
          hostId: user?.id || user?._id,
          hostName: user?.name || user?.username || "Teacher",
        }),
      });

      const data = await response.json();

      if (data.success && data.meeting) {
        const generatedRoomId = data.meeting.roomId;
        setCreatedRoomId(generatedRoomId);
        console.log("[Teacher] Meeting created:", generatedRoomId);

        // Navigate to meeting room
        setTimeout(() => {
          navigate(`/meeting/${generatedRoomId}`);
        }, 1000);
      } else {
        alert(data.error || "Failed to create meeting");
      }
    } catch (err) {
      console.error("[Teacher] Error creating meeting:", err);
      alert("Failed to create meeting. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const copyRoomId = () => {
    if (createdRoomId) {
      navigator.clipboard.writeText(createdRoomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden py-8 px-4 sm:px-6 transition-colors duration-300 ${
      isDark 
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950" 
        : "bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/30"
    }`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-20 w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-3xl animate-pulse ${
          isDark ? "bg-violet-500/10" : "bg-violet-400/15"
        }`} />
        <div
          className={`absolute bottom-20 left-20 w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-3xl animate-pulse ${
            isDark ? "bg-fuchsia-500/10" : "bg-fuchsia-400/15"
          }`}
          style={{ animationDelay: "1s" }}
        />
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl ${
          isDark ? "bg-purple-500/5" : "bg-purple-400/10"
        }`} />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          className="text-center mb-10 sm:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex p-4 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl shadow-xl shadow-purple-500/25 mb-6"
            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Video className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </motion.div>
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-4 ${
            isDark 
              ? "bg-gradient-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent" 
              : "bg-gradient-to-r from-slate-900 via-violet-700 to-fuchsia-600 bg-clip-text text-transparent"
          }`}>
            Start Meeting
          </h1>
          <p className={`text-lg sm:text-xl ${
            isDark ? "text-gray-400" : "text-slate-600"
          }`}>
            Connect with your students in{" "}
            <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent font-semibold">
              real-time
            </span>{" "}
            🎥
          </p>
        </motion.div>

        {/* Main Meeting Card */}
        <motion.div
          className="group relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 ${
            isDark ? "bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20" : "bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15"
          }`} />

          <div className={`relative backdrop-blur-xl border rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden ${
            isDark 
              ? "bg-slate-800/70 border-white/10 hover:border-purple-500/30" 
              : "bg-white/80 border-white/60 hover:border-purple-300"
          }`}>
            {/* Animated orbs */}
            <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 ${
              isDark ? "bg-violet-500/20" : "bg-violet-400/20"
            }`} />
            <div className={`absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 ${
              isDark ? "bg-fuchsia-500/20" : "bg-fuchsia-400/20"
            }`} />

            <div className="relative z-10">
              <AnimatePresence mode="wait">
              {!createdRoomId ? (
                <motion.div
                  key="create-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h2 className={`text-2xl sm:text-3xl font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}>
                      Create New Meeting
                    </h2>
                    <p className={`text-sm mt-2 ${
                      isDark ? "text-gray-400" : "text-slate-500"
                    }`}>
                      Set up your video conference in seconds
                    </p>
                  </div>

                  <div className="space-y-5">
                    {/* Title Input */}
                    <div>
                      <label className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
                        isDark ? "text-gray-300" : "text-slate-700"
                      }`}>
                        <Sparkles className="w-4 h-4 text-violet-500" />
                        Meeting Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`w-full px-4 py-3.5 backdrop-blur-md border-2 rounded-xl font-medium outline-none transition-all ${
                          isDark 
                            ? "bg-slate-900/50 border-violet-500/30 text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-violet-500" 
                            : "bg-white/60 border-violet-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-violet-400"
                        }`}
                        placeholder="e.g., Physics Class Session"
                      />
                    </div>

                    {/* Room ID Input */}
                    <div>
                      <label className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
                        isDark ? "text-gray-300" : "text-slate-700"
                      }`}>
                        <LinkIcon className="w-4 h-4 text-fuchsia-500" />
                        Custom Room ID{" "}
                        <span className={isDark ? "text-gray-500" : "text-slate-400"}>
                          (optional)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        className={`w-full px-4 py-3.5 backdrop-blur-md border-2 rounded-xl font-medium outline-none transition-all ${
                          isDark 
                            ? "bg-slate-900/50 border-fuchsia-500/30 text-white placeholder-gray-500 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500" 
                            : "bg-white/60 border-fuchsia-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-400"
                        }`}
                        placeholder="Leave blank for auto-generated ID"
                      />
                    </div>

                    {/* Create Button */}
                    <motion.button
                      onClick={createMeeting}
                      disabled={isCreating}
                      className="group/btn relative w-full overflow-hidden rounded-xl"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-purple-600" />
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />

                      <div className="relative px-6 py-4 flex items-center justify-center gap-3 text-white font-bold text-base sm:text-lg">
                        {isCreating ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Creating Meeting...</span>
                          </>
                        ) : (
                          <>
                            <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span>Create & Start Meeting</span>
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
                        ? "bg-violet-500/10 border-violet-500/30" 
                        : "bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border-violet-300/50"
                    }`}>
                      <Star className={`w-4 h-4 ${
                        isDark ? "text-violet-400 fill-violet-400" : "text-violet-600 fill-violet-600"
                      }`} />
                      <span className={`text-sm font-medium ${
                        isDark ? "text-gray-300" : "text-slate-700"
                      }`}>
                        Share the room ID with students to join
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="success-state"
                  className="space-y-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Success Header */}
                  <div className="text-center mb-6">
                    <motion.div
                      className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-xl shadow-emerald-500/25"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.6 }}
                    >
                      <Check className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className={`text-2xl sm:text-3xl font-bold ${
                      isDark 
                        ? "bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent" 
                        : "bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
                    }`}>
                      Meeting Created! 🎉
                    </h3>
                  </div>

                  {/* Room ID Display */}
                  <div className={`backdrop-blur-md border-2 rounded-2xl p-5 sm:p-6 ${
                    isDark 
                      ? "bg-emerald-500/10 border-emerald-500/30" 
                      : "bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border-emerald-300/50"
                  }`}>
                    <p className={`font-semibold text-sm mb-3 text-center ${
                      isDark ? "text-emerald-400" : "text-emerald-700"
                    }`}>
                      Your Meeting Room ID
                    </p>
                    <div className={`flex items-center justify-between backdrop-blur-md rounded-xl px-4 py-3 ${
                      isDark ? "bg-slate-900/50" : "bg-white/60"
                    }`}>
                      <span className={`font-bold font-mono text-lg sm:text-2xl tracking-wider truncate ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}>
                        {createdRoomId}
                      </span>
                      <motion.button
                        onClick={copyRoomId}
                        className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg hover:shadow-lg transition-all ml-3 flex-shrink-0"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-white" />
                        ) : (
                          <Copy className="w-5 h-5 text-white" />
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* Redirecting Message */}
                  <div className="text-center">
                    <div className={`inline-flex items-center gap-2 px-5 py-3 backdrop-blur-md border rounded-full ${
                      isDark 
                        ? "bg-violet-500/10 border-violet-500/30" 
                        : "bg-gradient-to-r from-violet-500/15 to-fuchsia-500/15 border-violet-300/50"
                    }`}>
                      <div className={`w-4 h-4 border-2 rounded-full animate-spin ${
                        isDark ? "border-violet-400/30 border-t-violet-400" : "border-violet-600/30 border-t-violet-600"
                      }`} />
                      <span className={`text-sm font-medium ${
                        isDark ? "text-gray-300" : "text-slate-700"
                      }`}>
                        Redirecting to meeting room...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherMeetingStart;
