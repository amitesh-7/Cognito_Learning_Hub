import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "./ui/Button";

/**
 * Interactive Onboarding Tour
 * Guides new users through all platform features
 */
export default function OnboardingTour({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedTour = localStorage.getItem("onboarding-completed");
    const isNewUser = !localStorage.getItem("onboarding-dismissed");
    
    if (!hasCompletedTour && isNewUser) {
      // Show tour after 1 second
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const steps = [
    {
      title: "🎉 Welcome to Cognito Learning Hub!",
      description: "Let's take a quick tour to help you discover all the amazing features. This will only take 2 minutes!",
      image: "🎓",
      action: "Start Tour",
    },
    {
      title: "📝 Create Quizzes Instantly",
      description: "Use AI to generate quizzes from any topic, document, or YouTube video in seconds. Perfect for teachers and students!",
      image: "🤖",
      features: [
        "AI-powered quiz generation",
        "Upload PDFs, Word docs, or paste text",
        "Generate from YouTube videos",
        "Manual quiz creation option"
      ],
    },
    {
      title: "🎮 Interactive Quiz Taking",
      description: "Take quizzes with our gamified, modern interface. Earn XP, unlock achievements, and climb leaderboards!",
      image: "🏆",
      features: [
        "Gamified experience with power-ups",
        "Real-time scoring and feedback",
        "Streaks and achievements",
        "Time-travel mode to review past attempts"
      ],
    },
    {
      title: "⚔️ 1v1 Quiz Battles",
      description: "Challenge friends or random opponents to exciting quiz duels. Real-time multiplayer action!",
      image: "⚔️",
      features: [
        "Real-time multiplayer battles",
        "Challenge friends or random match",
        "Live leaderboards",
        "Competitive rankings"
      ],
    },
    {
      title: "📡 Live Quiz Sessions",
      description: "Host live quiz sessions for classrooms or groups. Perfect for teachers and event hosts!",
      image: "📡",
      features: [
        "Host live sessions with room codes",
        "Real-time participant tracking",
        "Live leaderboards and results",
        "Session recordings and analytics"
      ],
    },
    {
      title: "🤖 AI Tutor & Chat",
      description: "Get instant help from our AI tutor. Ask questions, get explanations, and receive doubt clarifications 24/7!",
      image: "💬",
      features: [
        "24/7 AI assistance",
        "Personalized explanations",
        "Doubt clarification",
        "Learning recommendations"
      ],
    },
    {
      title: "♿ Accessibility Features",
      description: "We're proud to be fully accessible! Enable Visually Impaired Mode for complete voice-guided navigation.",
      image: "♿",
      features: [
        "Full screen reader support",
        "Voice-guided quiz taking",
        "Keyboard-only navigation",
        "High contrast mode",
        "Adjustable text sizes"
      ],
      highlight: "Press Alt+A anytime to toggle Accessibility Mode"
    },
    {
      title: "🎨 Customize Your Experience",
      description: "Personalize your avatar, choose themes, and adjust settings to match your learning style!",
      image: "🎨",
      features: [
        "Custom avatar creation",
        "Dark/Light themes",
        "Sound and animation controls",
        "Notification preferences"
      ],
    },
    {
      title: "🚀 Ready to Start Learning!",
      description: "You're all set! Explore the platform and discover more features as you go. Need help? Press '?' or visit the Help Center anytime.",
      image: "✨",
      shortcuts: [
        { key: "Alt + A", action: "Toggle Accessibility Mode" },
        { key: "Alt + H", action: "Open Help Center" },
        { key: "?", action: "Show Keyboard Shortcuts" },
      ]
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    localStorage.setItem("onboarding-completed", "true");
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  const skipTour = () => {
    localStorage.setItem("onboarding-dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
        role="dialog"
        aria-labelledby="tour-title"
        aria-describedby="tour-description"
        onClick={(e) => e.target === e.currentTarget && skipTour()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 rounded-t-3xl">
            <div className="flex items-center justify-between mb-4">
              <div className="text-white/80 font-semibold">
                Step {currentStep + 1} of {steps.length}
              </div>
              <button
                onClick={skipTour}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Skip tour"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-white h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto flex-1">
            {/* Large Emoji/Icon */}
            <div className="text-8xl text-center mb-6" role="img" aria-label={step.title}>
              {step.image}
            </div>

            {/* Title */}
            <h2
              id="tour-title"
              className="text-3xl font-black text-slate-900 dark:text-white text-center mb-4"
            >
              {step.title}
            </h2>

            {/* Description */}
            <p
              id="tour-description"
              className="text-lg text-slate-600 dark:text-slate-300 text-center mb-6"
            >
              {step.description}
            </p>

            {/* Features List */}
            {step.features && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 mb-6">
                <ul className="space-y-3">
                  {step.features.map((feature, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {feature}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {/* Highlight Box */}
            {step.highlight && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 dark:border-amber-600 rounded-xl p-4 mb-6">
                <p className="text-amber-900 dark:text-amber-300 font-bold text-center">
                  💡 {step.highlight}
                </p>
              </div>
            )}

            {/* Keyboard Shortcuts */}
            {step.shortcuts && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">
                  ⌨️ Useful Keyboard Shortcuts
                </h3>
                <div className="space-y-3">
                  {step.shortcuts.map((shortcut, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <kbd className="px-3 py-1.5 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg font-mono text-sm font-bold">
                        {shortcut.key}
                      </kbd>
                      <span className="text-slate-600 dark:text-slate-400 text-sm">
                        {shortcut.action}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-6 rounded-b-3xl flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white flex items-center gap-2 px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <Check className="w-5 h-5" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
