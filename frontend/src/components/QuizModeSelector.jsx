import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, MousePointer, Headphones, Keyboard, X } from "lucide-react";
import Button from "./ui/Button";

const QuizModeSelector = ({ isOpen, onClose, onSelect, quizTitle }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border-4 border-purple-200 dark:border-purple-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <h2 className="text-3xl font-bold text-white mb-2">
              Choose Quiz Mode
            </h2>
            <p className="text-purple-100">
              Select how you want to take "{quizTitle}"
            </p>
          </div>

          {/* Mode Options */}
          <div className="p-6 space-y-4">
            {/* Normal Mode */}
            <motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect("normal")}
              className="w-full p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
            >
              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                  <MousePointer className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Normal Mode
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    Traditional quiz experience with click/tap interactions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full font-medium flex items-center gap-1">
                      <MousePointer className="w-3 h-3" />
                      Click to answer
                    </span>
                    <span className="text-xs px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full font-medium flex items-center gap-1">
                      <Keyboard className="w-3 h-3" />
                      Keyboard shortcuts
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>

            {/* Speech Mode */}
            <motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect("speech")}
              className="w-full p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 transition-all group bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 relative overflow-hidden"
            >
              {/* "Recommended" badge */}
              <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                🎤 NEW!
              </div>

              <div className="flex items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                  <Volume2 className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Speech Mode
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    Interactive voice-enabled quiz with audio questions and voice responses
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full font-medium flex items-center gap-1">
                      <Headphones className="w-3 h-3" />
                      Audio questions
                    </span>
                    <span className="text-xs px-3 py-1 bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 rounded-full font-medium flex items-center gap-1">
                      <Volume2 className="w-3 h-3" />
                      Voice responses
                    </span>
                    <span className="text-xs px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full font-medium">
                      ♿ Accessible
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong className="text-blue-600 dark:text-blue-400">💡 Tip:</strong> Speech mode is
                perfect for accessibility, hands-free learning, or when you prefer audio interaction!
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuizModeSelector;
