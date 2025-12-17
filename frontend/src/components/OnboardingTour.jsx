import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  X, ChevronLeft, ChevronRight, Check, Sparkles, 
  Brain, Trophy, Swords, Radio, Bot, Rocket, Star, Gift
} from "lucide-react";

/**
 * Enhanced Interactive Onboarding Tour
 * Modern slide-in design with better UX - Non-blocking floating widget
 */
export default function OnboardingTour({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hasCompletedTour = localStorage.getItem("onboarding-completed");
    const isNewUser = !localStorage.getItem("onboarding-dismissed");
    
    if (!hasCompletedTour && isNewUser) {
      setTimeout(() => setIsVisible(true), 800);
    }
  }, []);

  const steps = [
    {
      title: "Welcome to Cognito! 🎉",
      description: "Your AI-powered learning platform. Let's show you around in 60 seconds!",
      icon: Sparkles,
      gradient: "from-violet-500 to-fuchsia-500",
      tip: "You can skip or minimize this tour anytime",
    },
    {
      title: "AI Quiz Generation 🤖",
      description: "Create quizzes from any topic, PDF, or YouTube video using our advanced AI.",
      icon: Brain,
      gradient: "from-blue-500 to-cyan-500",
      features: ["Topic-based generation", "PDF/Document upload", "YouTube video quizzes"],
      action: { label: "Try it", route: "/quiz-maker" },
    },
    {
      title: "Gamified Learning 🎮",
      description: "Earn XP, unlock achievements, and climb leaderboards as you learn!",
      icon: Trophy,
      gradient: "from-amber-500 to-orange-500",
      features: ["Level up system", "Daily streaks", "Achievement badges"],
      action: { label: "View Progress", route: "/dashboard" },
    },
    {
      title: "1v1 Quiz Battles ⚔️",
      description: "Challenge friends or random opponents to real-time quiz duels!",
      icon: Swords,
      gradient: "from-red-500 to-pink-500",
      features: ["Real-time battles", "Ranked matches", "Friend challenges"],
      action: { label: "Start Duel", route: "/duel" },
    },
    {
      title: "Live Sessions 📡",
      description: "Host or join live quiz sessions. Perfect for classrooms!",
      icon: Radio,
      gradient: "from-green-500 to-emerald-500",
      features: ["Room codes", "Live leaderboard", "Instant results"],
      action: { label: "Go Live", route: "/live" },
    },
    {
      title: "AI Tutor 🧠",
      description: "Get 24/7 help from our AI tutor for any subject or doubt.",
      icon: Bot,
      gradient: "from-indigo-500 to-purple-500",
      features: ["Instant answers", "Step-by-step explanations", "Personalized help"],
      action: { label: "Ask AI", route: "/doubt-solver" },
    },
    {
      title: "You're Ready! 🚀",
      description: "Start your learning journey now. Press Alt+H for help anytime!",
      icon: Rocket,
      gradient: "from-violet-500 to-fuchsia-500",
      shortcuts: [
        { key: "Alt+A", desc: "Accessibility" },
        { key: "Alt+H", desc: "Help Center" },
        { key: "?", desc: "Shortcuts" },
      ],
    },
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

  const handleAction = (route) => {
    completeTour();
    navigate(route);
  };

  if (!isVisible || typeof document === "undefined") return null;

  const step = steps[currentStep];
  const StepIcon = step.icon;

  const tourContent = (
    <AnimatePresence mode="wait">
      {!isMinimized ? (
        <motion.div
          key="expanded"
          initial={{ opacity: 0, x: 100, y: 100 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-[9998] w-[380px] max-w-[calc(100vw-48px)]"
          style={{ pointerEvents: "auto" }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header with gradient */}
            <div className={`bg-gradient-to-r ${step.gradient} p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    key={currentStep}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center"
                  >
                    <StepIcon className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <p className="text-white/80 text-xs font-medium">
                      Step {currentStep + 1} of {steps.length}
                    </p>
                    <h3 className="text-white font-bold text-lg leading-tight">
                      {step.title}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    title="Minimize"
                  >
                    <div className="w-4 h-0.5 bg-white rounded-full" />
                  </button>
                  <button
                    onClick={skipTour}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    title="Skip tour"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              
              {/* Progress dots */}
              <div className="flex items-center gap-1.5 mt-3">
                {steps.map((_, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentStep 
                        ? "bg-white w-6" 
                        : idx < currentStep 
                          ? "bg-white/60 w-1.5" 
                          : "bg-white/30 w-1.5"
                    }`}
                    whileHover={{ scale: 1.2 }}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <motion.p
                key={`desc-${currentStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-slate-600 dark:text-slate-300 text-sm mb-4"
              >
                {step.description}
              </motion.p>

              {/* Features */}
              {step.features && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-2 mb-4"
                >
                  {step.features.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Shortcuts */}
              {step.shortcuts && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 mb-4"
                >
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    ⌨️ Quick Shortcuts
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {step.shortcuts.map((s, idx) => (
                      <div key={idx} className="text-center">
                        <kbd className="px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                          {s.key}
                        </kbd>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Tip */}
              {step.tip && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {step.tip}
                </p>
              )}

              {/* Action Button */}
              {step.action && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleAction(step.action.route)}
                  className={`w-full py-2 px-4 rounded-xl bg-gradient-to-r ${step.gradient} text-white font-semibold text-sm hover:shadow-lg transition-all mb-3`}
                >
                  {step.action.label} →
                </motion.button>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>

                <button
                  onClick={skipTour}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  Skip tour
                </button>

                <button
                  onClick={handleNext}
                  className={`flex items-center gap-1 text-sm font-semibold bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent hover:opacity-80 transition-opacity`}
                >
                  {currentStep === steps.length - 1 ? "Finish" : "Next"}
                  <ChevronRight className="w-4 h-4 text-violet-500" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.button
          key="minimized"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-6 right-24 z-[9998] flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ pointerEvents: "auto" }}
        >
          <Gift className="w-4 h-4" />
          <span className="text-sm font-semibold">Continue Tour</span>
          <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
            {currentStep + 1}/{steps.length}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );

  return createPortal(tourContent, document.body);
}
