import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Eye, Keyboard, Zap, Users, MessageCircle, Trophy, BookOpen } from "lucide-react";
import { Button } from "./ui/Button";

/**
 * Accessibility-First Landing Component
 * Screen reader optimized with voice navigation
 * Appears before login for VI users
 */
export default function AccessibleLanding({ onContinue }) {
  const navigate = useNavigate();
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState("");

  useEffect(() => {
    // Auto-announce on load
    const announcement = "Welcome to Cognito Learning Hub. An AI-powered quiz platform designed for everyone, including visually impaired users. Press space bar or tap anywhere to hear more, or press Enter to continue to login.";
    speakText(announcement);
    setCurrentAnnouncement(announcement);
  }, []);

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleFeatureClick = (featureName, description) => {
    const text = `${featureName}. ${description}`;
    speakText(text);
    setCurrentAnnouncement(text);
  };

  const handleContinue = (enableAccessibility = false) => {
    if (enableAccessibility) {
      localStorage.setItem('a11y_visuallyImpairedMode', 'true');
      speakText("Accessibility mode enabled. Continuing to login with full voice guidance.");
    } else {
      speakText("Continuing to login.");
    }
    
    setTimeout(() => {
      onContinue();
    }, 2000);
  };

  const features = [
    {
      icon: Eye,
      name: "Full Accessibility",
      description: "Complete voice-guided navigation. Every feature works with screen readers and keyboard-only control. WCAG 2.1 AAA compliant."
    },
    {
      icon: Keyboard,
      name: "Keyboard Navigation",
      description: "Navigate the entire platform using only your keyboard. Tab to move, Enter to select, Arrow keys for lists."
    },
    {
      icon: Volume2,
      name: "Voice-Guided Quizzes",
      description: "Questions read aloud, voice feedback for answers, audio cues for time and score. Complete quiz experience through audio."
    },
    {
      icon: Users,
      name: "1v1 Battles & Live Sessions",
      description: "Compete in real-time quiz battles with voice announcements. Join live sessions with full audio feedback."
    },
    {
      icon: MessageCircle,
      name: "AI Tutor Chat",
      description: "Ask questions and get spoken responses from our AI tutor. 24/7 learning assistance through voice."
    },
    {
      icon: Trophy,
      name: "Gamification",
      description: "Earn XP, unlock achievements, climb leaderboards - all with voice feedback and audio celebrations."
    }
  ];

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 flex items-center justify-center p-4"
      role="main"
      aria-live="polite"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
            Welcome to<br />Cognito Learning Hub
          </h1>
          <p className="text-xl text-white/90 font-semibold mb-6">
            AI-Powered Quizzes • Fully Accessible • Made for Everyone
          </p>
          
          {/* Voice Indicator */}
          <div className="flex items-center justify-center gap-3 text-white/80 text-sm mb-8">
            <Volume2 className="w-5 h-5" />
            <span>Voice guidance is active. Press Space to repeat announcement.</span>
          </div>
        </div>

        {/* Current Announcement Display */}
        <div 
          className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 mb-8 border-2 border-white/30"
          role="status"
          aria-live="assertive"
        >
          <p className="text-white text-lg text-center font-semibold">
            {currentAnnouncement || "Welcome! Tap any feature card to learn more."}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-8" role="list">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleFeatureClick(feature.name, feature.description)}
                onFocus={() => handleFeatureClick(feature.name, feature.description)}
                className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/30 hover:bg-white/30 hover:border-white/50 transition-all text-left group focus:ring-4 focus:ring-white/50 focus:outline-none"
                role="listitem"
                tabIndex={0}
                aria-label={`${feature.name}. ${feature.description}`}
              >
                <Icon className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-white mb-2">{feature.name}</h3>
                <p className="text-white/80 text-sm">{feature.description}</p>
              </motion.button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Button
            onClick={() => handleContinue(true)}
            className="flex-1 bg-white text-violet-600 hover:bg-white/90 py-6 rounded-2xl text-xl font-black shadow-2xl hover:scale-105 transition-all focus:ring-4 focus:ring-white/50"
            aria-label="Continue with accessibility mode enabled for full voice guidance"
          >
            <Eye className="w-6 h-6 mr-3" />
            Enable Accessibility Mode & Continue
          </Button>
          <Button
            onClick={() => handleContinue(false)}
            variant="outline"
            className="flex-1 bg-white/20 backdrop-blur-xl border-2 border-white/50 text-white hover:bg-white/30 py-6 rounded-2xl text-xl font-black focus:ring-4 focus:ring-white/50"
            aria-label="Continue to login without enabling accessibility mode"
          >
            <BookOpen className="w-6 h-6 mr-3" />
            Continue to Login
          </Button>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h3 className="text-white font-bold mb-4 text-center">⌨️ Keyboard Shortcuts</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <kbd className="px-3 py-2 bg-white/20 rounded-lg font-mono font-bold text-white block mb-2">
                Space
              </kbd>
              <span className="text-white/80">Repeat announcement</span>
            </div>
            <div className="text-center">
              <kbd className="px-3 py-2 bg-white/20 rounded-lg font-mono font-bold text-white block mb-2">
                Tab
              </kbd>
              <span className="text-white/80">Navigate features</span>
            </div>
            <div className="text-center">
              <kbd className="px-3 py-2 bg-white/20 rounded-lg font-mono font-bold text-white block mb-2">
                Enter
              </kbd>
              <span className="text-white/80">Continue/Select</span>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-white/70 text-sm">
          <p>Compatible with NVDA, JAWS, VoiceOver, and all major screen readers</p>
          <p className="mt-2">Press Alt+A anytime to toggle Accessibility Mode</p>
        </div>
      </motion.div>

      {/* Global keyboard listener */}
      <div
        onKeyDown={(e) => {
          if (e.key === ' ') {
            e.preventDefault();
            speakText(currentAnnouncement || "Welcome to Cognito Learning Hub. Press Enter to continue to login, or Tab to explore features.");
          }
          if (e.key === 'Enter' && e.target === document.body) {
            handleContinue(false);
          }
        }}
        tabIndex={-1}
      />
    </div>
  );
}
