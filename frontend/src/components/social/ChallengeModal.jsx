import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Swords, Send, Sparkles, Loader, CheckCircle } from "lucide-react";

const ChallengeModal = ({ 
  isOpen, 
  onClose, 
  selectedFriend, 
  quizzes, 
  selectedQuiz, 
  onSelectQuiz, 
  onSendChallenge, 
  loading, 
  isDark 
}) => {
  if (!isOpen) return null;

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
          className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl ${
            isDark ? "bg-slate-900 border border-white/10" : "bg-white"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
                <Swords className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  Challenge {selectedFriend?.friend?.name?.split(" ")[0]}
                </h2>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Select a quiz for the duel
                </p>
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

          {/* Quiz Selection */}
          <div className="max-h-80 overflow-y-auto space-y-2 mb-6">
            {quizzes.length === 0 ? (
              <div className="text-center py-8">
                <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-violet-500" />
                <p className={isDark ? "text-gray-400" : "text-gray-500"}>Loading quizzes...</p>
              </div>
            ) : (
              quizzes.map((quiz) => (
                <motion.button
                  key={quiz._id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onSelectQuiz(quiz)}
                  className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                    selectedQuiz?._id === quiz._id
                      ? "border-red-500 bg-red-500/10"
                      : isDark 
                        ? "border-white/10 bg-slate-800/50 hover:border-white/20" 
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {quiz.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-700"
                        }`}>
                          {quiz.category}
                        </span>
                        <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                          {quiz.questions?.length} questions
                        </span>
                      </div>
                    </div>
                    {selectedQuiz?._id === quiz._id && (
                      <CheckCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                </motion.button>
              ))
            )}
          </div>

          {/* Send Challenge Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSendChallenge}
            disabled={!selectedQuiz || loading}
            className="w-full py-4 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Challenge
                <Sparkles className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChallengeModal;
