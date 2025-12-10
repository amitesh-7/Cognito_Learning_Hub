import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ParticleBackground from "../../components/ParticleBackground";
import {
  Check,
  X,
  Sparkles,
  Trophy,
  Star,
  Zap,
  Crown,
  ArrowRight,
  Shield,
  Users,
  Brain,
  Target,
  Rocket,
  Info,
} from "lucide-react";

const FeatureComparison = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [showDetails, setShowDetails] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Dark mode detection
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const platforms = [
    {
      name: "Cognito Learning Hub",
      logo: "🧠",
      tier: "premium",
      tagline: "AI-Powered Complete Learning Ecosystem",
      color: "from-violet-600 to-fuchsia-600",
      bgColor: "from-violet-50 to-fuchsia-50",
      darkBgColor: "from-violet-950/20 to-fuchsia-950/20",
    },
    {
      name: "Kahoot",
      logo: "🎮",
      tier: "basic",
      tagline: "Interactive Quiz Game Platform",
      color: "from-purple-600 to-pink-600",
      bgColor: "from-purple-50 to-pink-50",
      darkBgColor: "from-purple-950/20 to-pink-950/20",
    },
    {
      name: "Quizlet",
      logo: "📚",
      tier: "basic",
      tagline: "Flashcard & Study Tool",
      color: "from-blue-600 to-indigo-600",
      bgColor: "from-blue-50 to-indigo-50",
      darkBgColor: "from-blue-950/20 to-indigo-950/20",
    },
    {
      name: "Duolingo",
      logo: "🦉",
      tier: "basic",
      tagline: "Language Learning App",
      color: "from-green-600 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50",
      darkBgColor: "from-green-950/20 to-emerald-950/20",
    },
  ];

  const categories = [
    { id: "all", name: "All Features", icon: Sparkles },
    { id: "ai", name: "AI Features", icon: Brain },
    { id: "learning", name: "Learning", icon: Target },
    { id: "social", name: "Social", icon: Users },
    { id: "gamification", name: "Gamification", icon: Trophy },
  ];

  const features = [
    {
      category: "ai",
      name: "AI Quiz Generation Methods",
      description: "Number of ways to create quizzes with AI",
      details: "Topic-based, PDF upload, YouTube transcripts, Manual with AI assist",
      cognito: { value: "4 Methods", icon: Check, highlight: true },
      kahoot: { value: "0", icon: X },
      quizlet: { value: "0", icon: X },
      duolingo: { value: "0", icon: X },
    },
    {
      category: "ai",
      name: "AI Study Buddy with Memory",
      description: "24/7 AI tutor that remembers your learning journey",
      details: "Contextual assistance, Socratic method, personalized explanations",
      cognito: { value: "Google Gemini", icon: Check, highlight: true },
      kahoot: { value: "None", icon: X },
      quizlet: { value: "None", icon: X },
      duolingo: { value: "None", icon: X },
    },
    {
      category: "ai",
      name: "Adaptive Difficulty AI",
      description: "Questions adapt to your skill level automatically",
      details: "Performance-based question selection and difficulty adjustment",
      cognito: { value: "Full AI", icon: Check, highlight: true },
      kahoot: { value: "Basic", icon: Check },
      quizlet: { value: "Limited", icon: Check },
      duolingo: { value: "Yes", icon: Check },
    },
    {
      category: "learning",
      name: "Real-Time 1v1 Battles",
      description: "Competitive quiz battles with live scoring",
      details: "ELO ranking, speed multipliers, power-ups, <100ms latency",
      cognito: { value: "Full Game Mode", icon: Check, highlight: true },
      kahoot: { value: "Limited", icon: Check },
      quizlet: { value: "None", icon: X },
      duolingo: { value: "None", icon: X },
    },
    {
      category: "learning",
      name: "Live Multiplayer Sessions",
      description: "Host quiz sessions with multiple participants",
      details: "6-digit codes, 100+ capacity, real-time leaderboards",
      cognito: { value: "100+ Users", icon: Check, highlight: true },
      kahoot: { value: "Yes", icon: Check, highlight: true },
      quizlet: { value: "Study Groups", icon: Check },
      duolingo: { value: "None", icon: X },
    },
    {
      category: "learning",
      name: "RPG Quest System",
      description: "Narrative-driven learning adventures",
      details: "700+ quests, 5 realms, NPCs, boss battles, branching storylines",
      cognito: { value: "700+ Quests", icon: Check, highlight: true },
      kahoot: { value: "None", icon: X },
      quizlet: { value: "None", icon: X },
      duolingo: { value: "Language Only", icon: Check },
    },
    {
      category: "learning",
      name: "WebRTC Video Meetings",
      description: "HD video conferencing with educational features",
      details: "MediaSoup SFU, 50+ users, screen share, quiz integration",
      cognito: { value: "SFU (50+)", icon: Check, highlight: true },
      kahoot: { value: "Basic", icon: Check },
      quizlet: { value: "None", icon: X },
      duolingo: { value: "None", icon: X },
    },
    {
      category: "gamification",
      name: "Customizable Avatar System",
      description: "Personalize your learning avatar",
      details: "150+ items, achievement-based unlocks, dynamic moods",
      cognito: { value: "150+ Items", icon: Check, highlight: true },
      kahoot: { value: "Basic", icon: Check },
      quizlet: { value: "None", icon: X },
      duolingo: { value: "Limited", icon: Check },
    },
    {
      category: "gamification",
      name: "Achievement System",
      description: "Unlock badges and rewards for milestones",
      details: "100+ achievements, rarity tiers, secret achievements",
      cognito: { value: "100+ (Rarity)", icon: Check, highlight: true },
      kahoot: { value: "Basic", icon: Check },
      quizlet: { value: "Basic", icon: Check },
      duolingo: { value: "Yes", icon: Check, highlight: true },
    },
    {
      category: "gamification",
      name: "Daily Quest System",
      description: "Fresh challenges every day",
      details: "3 daily quests, avatar rewards, streak bonuses, XP multipliers",
      cognito: { value: "3 Daily", icon: Check, highlight: true },
      kahoot: { value: "None", icon: X },
      quizlet: { value: "Daily Goals", icon: Check },
      duolingo: { value: "Yes", icon: Check, highlight: true },
    },
    {
      category: "gamification",
      name: "XP & Leveling System",
      description: "Progressive experience and level advancement",
      details: "Unlimited levels, prestige system, visual badges",
      cognito: { value: "Unlimited", icon: Check, highlight: true },
      kahoot: { value: "Points", icon: Check },
      quizlet: { value: "Basic", icon: Check },
      duolingo: { value: "Yes", icon: Check, highlight: true },
    },
    {
      category: "social",
      name: "Social Learning Network",
      description: "Friends, chat, and study groups",
      details: "Friend system, real-time messaging, group chats, challenges",
      cognito: { value: "Full Network", icon: Check, highlight: true },
      kahoot: { value: "None", icon: X },
      quizlet: { value: "Study Groups", icon: Check },
      duolingo: { value: "Forums", icon: Check },
    },
    {
      category: "social",
      name: "Real-Time Chat System",
      description: "Instant messaging with friends and teachers",
      details: "Online status, typing indicators, rich media sharing",
      cognito: { value: "Full Chat", icon: Check, highlight: true },
      kahoot: { value: "None", icon: X },
      quizlet: { value: "Limited", icon: Check },
      duolingo: { value: "None", icon: X },
    },
    {
      category: "social",
      name: "Friend Challenges",
      description: "Challenge friends to specific quizzes",
      details: "Custom challenges, time limits, performance comparison",
      cognito: { value: "Yes", icon: Check, highlight: true },
      kahoot: { value: "None", icon: X },
      quizlet: { value: "None", icon: X },
      duolingo: { value: "None", icon: X },
    },
  ];

  const filteredFeatures =
    activeCategory === "all"
      ? features
      : features.filter((f) => f.category === activeCategory);

  const counts = {
    cognito: filteredFeatures.filter((f) => f.cognito.icon === Check).length,
    kahoot: filteredFeatures.filter((f) => f.kahoot.icon === Check).length,
    quizlet: filteredFeatures.filter((f) => f.quizlet.icon === Check).length,
    duolingo: filteredFeatures.filter((f) => f.duolingo.icon === Check).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/30 dark:from-slate-950 dark:via-violet-950/20 dark:to-fuchsia-950/20">
      {/* Particle Background */}
      <ParticleBackground isDark={isDarkMode} />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-violet-400/20 dark:bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-400/20 dark:bg-fuchsia-600/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-violet-200/50 dark:border-violet-700/50 shadow-lg mb-8"
          >
            <Crown className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Platform Comparison
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black mb-6"
          >
            <span className="text-slate-900 dark:text-white">See Why</span>
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
              We're Different
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-12"
          >
            Compare Cognito Learning Hub with other popular platforms. See the features that make us
            <span className="text-violet-600 dark:text-violet-400 font-semibold"> unique </span>
            and
            <span className="text-fuchsia-600 dark:text-fuchsia-400 font-semibold"> powerful</span>.
          </motion.p>

          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-xl scale-105"
                    : "bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 shadow-lg hover:shadow-xl hover:scale-105"
                }`}
              >
                <category.icon className="w-5 h-5" />
                <span>{category.name}</span>
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="relative px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Platform Headers */}
          <div className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-xl border-b-2 border-slate-200 dark:border-slate-800 mb-4 rounded-t-3xl shadow-xl">
            <div className="grid grid-cols-5 gap-4 p-6">
              {/* Feature Column Header */}
              <div className="flex items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Feature
                </h3>
              </div>

              {/* Platform Headers */}
              {platforms.map((platform, index) => (
                <motion.div
                  key={platform.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`text-center p-4 rounded-2xl bg-gradient-to-br ${
                    platform.bgColor
                  } dark:${platform.darkBgColor} ${
                    index === 0 ? "ring-2 ring-violet-500 dark:ring-violet-400" : ""
                  }`}
                >
                  <div className="text-4xl mb-2">{platform.logo}</div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                    {platform.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                    {platform.tagline}
                  </p>
                  {index === 0 && (
                    <div className="flex items-center justify-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      <Crown className="w-3 h-3" />
                      <span>Best Choice</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Score Summary */}
            <div className="grid grid-cols-5 gap-4 px-6 pb-6">
              <div className="flex items-center text-sm font-semibold text-slate-600 dark:text-slate-400">
                Total Features
              </div>
              <div className="text-center">
                <span className="text-2xl font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  {counts.cognito}/{filteredFeatures.length}
                </span>
              </div>
              <div className="text-center text-2xl font-black text-slate-700 dark:text-slate-300">
                {counts.kahoot}/{filteredFeatures.length}
              </div>
              <div className="text-center text-2xl font-black text-slate-700 dark:text-slate-300">
                {counts.quizlet}/{filteredFeatures.length}
              </div>
              <div className="text-center text-2xl font-black text-slate-700 dark:text-slate-300">
                {counts.duolingo}/{filteredFeatures.length}
              </div>
            </div>
          </div>

          {/* Feature Rows */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredFeatures.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <div className="grid grid-cols-5 gap-4 p-6 items-center">
                    {/* Feature Name */}
                    <div>
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() =>
                            setShowDetails(showDetails === index ? null : index)
                          }
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Info className="w-5 h-5 text-violet-500" />
                        </button>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                            {feature.name}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Cognito */}
                    <div
                      className={`text-center p-4 rounded-2xl ${
                        feature.cognito.highlight
                          ? "bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/30 ring-2 ring-violet-400 dark:ring-violet-500"
                          : "bg-slate-50 dark:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2 mb-1">
                        {React.createElement(feature.cognito.icon, {
                          className: `w-6 h-6 ${
                            feature.cognito.icon === Check
                              ? "text-emerald-500"
                              : "text-slate-400"
                          }`,
                        })}
                        {feature.cognito.highlight && (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {feature.cognito.value}
                      </span>
                    </div>

                    {/* Kahoot */}
                    <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        {React.createElement(feature.kahoot.icon, {
                          className: `w-6 h-6 ${
                            feature.kahoot.icon === Check
                              ? "text-emerald-500"
                              : "text-slate-400"
                          }`,
                        })}
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {feature.kahoot.value}
                      </span>
                    </div>

                    {/* Quizlet */}
                    <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        {React.createElement(feature.quizlet.icon, {
                          className: `w-6 h-6 ${
                            feature.quizlet.icon === Check
                              ? "text-emerald-500"
                              : "text-slate-400"
                          }`,
                        })}
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {feature.quizlet.value}
                      </span>
                    </div>

                    {/* Duolingo */}
                    <div className="text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        {React.createElement(feature.duolingo.icon, {
                          className: `w-6 h-6 ${
                            feature.duolingo.icon === Check
                              ? "text-emerald-500"
                              : "text-slate-400"
                          }`,
                        })}
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {feature.duolingo.value}
                      </span>
                    </div>
                  </div>

                  {/* Details Expandable */}
                  <AnimatePresence>
                    {showDetails === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-0">
                          <div className="p-4 bg-violet-50 dark:bg-violet-950/30 rounded-2xl border-l-4 border-violet-500">
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              <span className="font-semibold text-violet-600 dark:text-violet-400">
                                Details:{" "}
                              </span>
                              {feature.details}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Winner Announcement */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="inline-block relative">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-[3rem] blur-2xl opacity-30" />

              {/* Card */}
              <div className="relative bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 rounded-[2.5rem] p-12 text-white">
                <div className="flex flex-col items-center gap-4">
                  <Crown className="w-16 h-16 text-amber-300" />
                  <h2 className="text-4xl font-black">
                    Cognito Learning Hub Wins!
                  </h2>
                  <p className="text-xl text-white/80 max-w-2xl">
                    With <span className="font-bold">{counts.cognito}</span> out of{" "}
                    <span className="font-bold">{filteredFeatures.length}</span> features
                    ({Math.round((counts.cognito / filteredFeatures.length) * 100)}%), we offer
                    the most comprehensive learning platform.
                  </p>
                  <Link to="/signup">
                    <button className="mt-4 px-8 py-4 bg-white rounded-2xl text-violet-600 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2">
                      <Rocket className="w-5 h-5" />
                      Start Learning Free
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="relative py-20 px-4 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-12">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Cognito?
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI-First Approach",
                description:
                  "4 AI quiz generation methods, adaptive learning, and 24/7 AI tutor with memory.",
                color: "from-violet-500 to-purple-500",
              },
              {
                icon: Trophy,
                title: "Complete Gamification",
                description:
                  "700+ RPG quests, 150+ avatar items, 100+ achievements, and daily challenges.",
                color: "from-amber-500 to-orange-500",
              },
              {
                icon: Users,
                title: "Social Learning",
                description:
                  "Friends, real-time chat, group study, video meetings, and competitive battles.",
                color: "from-blue-500 to-cyan-500",
              },
            ].map((reason, index) => (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="relative">
                  <div
                    className={`absolute -inset-1 bg-gradient-to-r ${reason.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}
                  />
                  <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${reason.color} flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <reason.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                      {reason.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {reason.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default FeatureComparison;
