import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Book, Keyboard, Zap, HelpCircle, ExternalLink, Volume2 } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

/**
 * Comprehensive Help Center
 * Feature discovery and documentation hub
 */
export default function HelpCenter({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("getting-started");
  const [speak, setSpeak] = useState(false);

  // Text-to-Speech for VI users
  const speakText = (text) => {
    if (!speak || !window.speechSynthesis) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    // Global keyboard shortcut: Alt+H
    const handleKeyboard = (e) => {
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        if (!isOpen) {
          onClose(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [isOpen, onClose]);

  const categories = [
    {
      id: "getting-started",
      name: "Getting Started",
      icon: "🚀",
      articles: [
        {
          title: "Welcome to Cognito Learning Hub",
          content: "Cognito is an AI-powered quiz platform with gamification, 1v1 battles, live sessions, and full accessibility support. Perfect for students and teachers!"
        },
        {
          title: "Creating Your First Quiz",
          content: "Navigate to 'Create Quiz' → Choose AI Generation or Manual Creation → Enter topic or upload document → Generate → Review and Edit → Publish!"
        },
        {
          title: "Taking a Quiz",
          content: "Go to 'Quizzes' → Browse available quizzes → Click on a quiz → Click 'Start Quiz' → Answer questions → Get instant feedback and XP!"
        }
      ]
    },
    {
      id: "accessibility",
      name: "Accessibility Features",
      icon: "♿",
      articles: [
        {
          title: "Enabling Visually Impaired Mode",
          content: "Press Alt+A anywhere on the platform OR go to Settings → Accessibility → Toggle 'Visually Impaired Mode'. This enables full voice guidance for all features."
        },
        {
          title: "Voice-Guided Quiz Taking",
          content: "In VI Mode: Questions are read aloud → Press 1/2/3/4 to select options → Press Enter to submit → Press N for next question. All feedback is spoken."
        },
        {
          title: "Keyboard Navigation",
          content: "Tab: Navigate between elements | Enter/Space: Activate buttons | Arrow Keys: Navigate lists | Escape: Close dialogs | Alt+A: Toggle VI Mode"
        },
        {
          title: "Screen Reader Support",
          content: "Full ARIA labels and semantic HTML. Works with NVDA, JAWS, VoiceOver. Enable 'Verbose Descriptions' in Settings for detailed announcements."
        }
      ]
    },
    {
      id: "features",
      name: "Platform Features",
      icon: "✨",
      articles: [
        {
          title: "AI Quiz Generation",
          content: "Use our AI to generate quizzes from: Text/Topics → PDFs/Documents → YouTube Videos → Wikipedia Articles. Customizable difficulty and question count."
        },
        {
          title: "1v1 Quiz Battles",
          content: "Go to 'Duel Mode' → Challenge Friend (share code) or Quick Match (random opponent) → Both answer same questions → Real-time scoring → Winner declared!"
        },
        {
          title: "Live Quiz Sessions",
          content: "For Teachers: Create Quiz → Host Live Session → Share room code with students → Monitor real-time responses → View live leaderboard → Export results."
        },
        {
          title: "Gamification System",
          content: "Earn XP from quizzes → Level up → Unlock achievements → Maintain streaks → Climb leaderboards → Customize your avatar → Compete with friends!"
        },
        {
          title: "AI Tutor & Chat",
          content: "Click chat icon → Ask any question → Get AI-powered explanations → Request doubt clarifications → Available 24/7 → Personalized learning assistance."
        },
        {
          title: "Time Travel Mode",
          content: "Review past quiz attempts → See your answers vs correct answers → Identify improvement areas → Track progress over time → Retake with insights."
        }
      ]
    },
    {
      id: "shortcuts",
      name: "Keyboard Shortcuts",
      icon: "⌨️",
      articles: [
        {
          title: "Global Shortcuts",
          content: "Alt+A: Toggle Accessibility Mode | Alt+H: Open Help Center | ?: Show all shortcuts | Ctrl+K: Quick search | Escape: Close modal"
        },
        {
          title: "Quiz Taking Shortcuts",
          content: "1/2/3/4: Select option A/B/C/D | Enter: Submit answer | N: Next question | P: Previous question | S: Skip question"
        },
        {
          title: "Navigation Shortcuts",
          content: "G then D: Go to Dashboard | G then Q: Go to Quizzes | G then C: Create Quiz | G then P: Profile | G then S: Settings"
        }
      ]
    },
    {
      id: "troubleshooting",
      name: "Troubleshooting",
      icon: "🔧",
      articles: [
        {
          title: "Voice Not Working",
          content: "Check browser permissions for Speech Synthesis → Enable TTS in Settings → Refresh page → Try different browser (Chrome/Edge recommended)"
        },
        {
          title: "Quiz Not Loading",
          content: "Check internet connection → Clear browser cache → Disable ad blockers → Try incognito mode → Contact support if persists"
        },
        {
          title: "Can't Join Live Session",
          content: "Verify room code is correct → Check if session is still active → Refresh page → Ensure mic/camera permissions (if required)"
        }
      ]
    }
  ];

  const filteredArticles = categories
    .find(cat => cat.id === activeCategory)
    ?.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
        role="dialog"
        aria-labelledby="help-title"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-8 h-8 text-white" />
                <h2 id="help-title" className="text-2xl font-black text-white">
                  Help Center
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSpeak(!speak)}
                  className={`p-2 rounded-lg transition-colors ${
                    speak ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
                  }`}
                  aria-label={speak ? "Disable voice" : "Enable voice"}
                  title="Toggle text-to-speech"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Close help center"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex">
            {/* Sidebar */}
            <div className="w-64 border-r border-slate-200 dark:border-slate-700 p-4 overflow-y-auto">
              <nav className="space-y-2" role="navigation" aria-label="Help categories">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id);
                      speakText(`${category.name} category selected`);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${
                      activeCategory === category.id
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    aria-current={activeCategory === category.id ? "page" : undefined}
                  >
                    <span className="mr-2" role="img" aria-hidden="true">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-6">
                {filteredArticles && filteredArticles.length > 0 ? (
                  filteredArticles.map((article, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                      onClick={() => speakText(`${article.title}. ${article.content}`)}
                      role="article"
                    >
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <Book className="w-5 h-5 text-violet-600" />
                        {article.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {article.content}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">
                      No articles found. Try a different search term.
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Links */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4">
                  📚 Quick Access
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      // Open onboarding tour
                      localStorage.removeItem('onboarding-completed');
                      window.location.reload();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl hover:shadow-md transition-shadow text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    <Zap className="w-4 h-4 text-violet-600" />
                    Restart Tour
                  </a>
                  <a
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl hover:shadow-md transition-shadow text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    <Keyboard className="w-4 h-4 text-violet-600" />
                    Accessibility Settings
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-4 text-center text-sm text-slate-600 dark:text-slate-400">
            Press <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded font-mono">Alt+H</kbd> anytime to open Help Center
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
