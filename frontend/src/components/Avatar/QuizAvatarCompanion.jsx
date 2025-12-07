import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, MessageCircle, X } from "lucide-react";
import { useAvatar } from "../../context/AvatarContext";
import LearningAvatar from "./LearningAvatar";

/**
 * QuizAvatarCompanion
 * A floating avatar companion that provides reactions and encouragement during quizzes
 */
const QuizAvatarCompanion = ({
  position = "bottom-right",
  minimized = false,
  onMinimize,
}) => {
  const {
    avatar,
    currentReaction,
    triggerReaction,
    isAvatarEnabled,
    isVoiceEnabled,
    generateVoiceExplanation,
  } = useAvatar();
  
  const [isExpanded, setIsExpanded] = useState(!minimized);
  const [showMessage, setShowMessage] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Position styles
  const positionStyles = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  };

  // Handle reaction message display
  useEffect(() => {
    if (currentReaction?.message) {
      setShowMessage(currentReaction.message);
      
      // Speak the message if voice is enabled
      if (isVoiceEnabled && audioEnabled) {
        speakMessage(currentReaction.message);
      }
      
      // Clear message after duration
      const timer = setTimeout(() => {
        setShowMessage(null);
      }, currentReaction.duration || 3000);
      
      return () => clearTimeout(timer);
    }
  }, [currentReaction, isVoiceEnabled, audioEnabled]);

  // Text-to-speech for reactions
  const speakMessage = useCallback(async (text) => {
    if (!audioEnabled) return;
    
    setIsSpeaking(true);
    
    try {
      // Check if voice profile exists
      if (isVoiceEnabled && avatar?.voiceProfile?.hasVoiceProfile) {
        // Use cloned voice
        const result = await generateVoiceExplanation(text);
        if (result?.audioUrl) {
          const audio = new Audio(result.audioUrl);
          audio.onended = () => setIsSpeaking(false);
          await audio.play();
          return;
        }
      }
      
      // Fallback to browser TTS
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;
        utterance.pitch = 1;
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error("Error speaking message:", error);
      setIsSpeaking(false);
    }
  }, [audioEnabled, isVoiceEnabled, avatar, generateVoiceExplanation]);

  // Provide encouragement at intervals
  useEffect(() => {
    if (!isExpanded || !isAvatarEnabled) return;
    
    const encouragementInterval = setInterval(() => {
      // Random chance to show encouragement
      if (Math.random() > 0.7) {
        triggerReaction("encouragement", {});
      }
    }, 60000); // Every minute
    
    return () => clearInterval(encouragementInterval);
  }, [isExpanded, isAvatarEnabled, triggerReaction]);

  if (!isAvatarEnabled || !avatar) {
    return null;
  }

  return (
    <div className={`fixed ${positionStyles[position]} z-40`}>
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="relative"
          >
            {/* Message Bubble */}
            <AnimatePresence>
              {showMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 min-w-[200px] max-w-[280px]"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 relative">
                    <p className="text-sm text-gray-800 dark:text-gray-200 text-center">
                      {showMessage}
                    </p>
                    {isSpeaking && (
                      <div className="absolute -right-1 -top-1">
                        <motion.div
                          className="w-3 h-3 bg-green-500 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 0.5 }}
                        />
                      </div>
                    )}
                    {/* Speech bubble tail */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                      <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Avatar Container */}
            <div className="relative bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-2xl p-3 backdrop-blur-sm border border-white/20">
              {/* Controls */}
              <div className="absolute -top-2 -right-2 flex gap-1">
                {/* Audio Toggle */}
                <motion.button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={`p-1.5 rounded-full shadow-lg ${
                    audioEnabled
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title={audioEnabled ? "Mute avatar" : "Unmute avatar"}
                >
                  {audioEnabled ? (
                    <Volume2 className="w-3 h-3" />
                  ) : (
                    <VolumeX className="w-3 h-3" />
                  )}
                </motion.button>

                {/* Minimize Button */}
                <motion.button
                  onClick={() => {
                    setIsExpanded(false);
                    onMinimize?.();
                  }}
                  className="p-1.5 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Minimize"
                >
                  <X className="w-3 h-3" />
                </motion.button>
              </div>

              {/* Avatar */}
              <LearningAvatar
                size="medium"
                showName={false}
                showLevel={true}
                interactive={true}
              />

              {/* Avatar Name */}
              <div className="text-center mt-2">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {avatar.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {avatar.evolution?.evolutionStage || "Novice"}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="minimized"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => setIsExpanded(true)}
            className="relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {/* Minimized Avatar */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-0.5 shadow-lg">
              <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 p-1">
                <LearningAvatar
                  size="small"
                  showName={false}
                  showLevel={false}
                  interactive={false}
                />
              </div>
            </div>

            {/* Notification Badge */}
            {showMessage && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
              >
                <MessageCircle className="w-2.5 h-2.5 text-white" />
              </motion.div>
            )}

            {/* Pulse Effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-indigo-500"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizAvatarCompanion;
