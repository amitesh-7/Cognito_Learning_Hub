import React, { useState, useEffect, useContext, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import {
  Brain,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  BookOpen,
  Bot,
  Trophy,
  Users,
  MessageSquare,
  GraduationCap,
  Shield,
  UserCog,
  Radio,
  Flame,
  Crown,
  Star,
  Zap,
  Swords,
  Video,
  FileText,
  ChevronDown,
  Play,
  Gamepad2,
  User,
  History,
  Map,
  Eye,
  EyeOff,
  Settings,
  HelpCircle,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useGamification } from "../context/GamificationContext";
import { useAccessibility } from "../context/AccessibilityContext";
import { useFeatureUnlock } from "./FeatureGate";
import { useTheme } from "../context/ThemeContext";
import { useReducedMotion, useIsMobile } from "../hooks/useReducedMotion";
import Button from "./ui/Button";
import AccessibilityModal from "./AccessibilityModal";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const {
    currentLevel,
    totalXP,
    currentStreak: gamificationStreak,
  } = useGamification();
  const { unlocked: isQuizCreationUnlocked } = useFeatureUnlock('studentQuizCreation');
  const { settings, toggleVisuallyImpairedMode } = useAccessibility();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { scrollY } = useScroll();
  const navigate = useNavigate();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMenuOpen(false);
    setIsMegaMenuOpen(false);
  }, [location.pathname]);

  // Memoize product demos for performance (prevents recreation on every render)
  const productDemos = useMemo(() => [
    {
      id: "quiz",
      title: "AI Quiz Generator",
      description: "Create quizzes from PDFs, topics, and custom content",
      icon: Brain,
      color: "from-blue-500 to-cyan-500",
      features: [
        "PDF Upload",
        "Topic Input",
        "Speech Input",
        "MCQ, T/F, Descriptive",
      ],
    },
    {
      id: "battle",
      title: "1v1 Duel Battles",
      description: "Challenge friends in real-time quiz battles",
      icon: Swords,
      color: "from-red-500 to-orange-500",
      features: [
        "Real-time Scoring",
        "Leaderboards",
        "Matchmaking",
        "XP Rewards",
      ],
    },
    {
      id: "multiplayer",
      title: "Live Sessions",
      description: "Teachers host, students join and compete live",
      icon: Users,
      color: "from-purple-500 to-pink-500",
      features: [
        "Live Lobbies",
        "Real-time Progress",
        "Session Controls",
        "Analytics",
      ],
    },
  ], []);

  // Smart navigation structure with dropdowns (memoized for performance)
  const [activeDropdown, setActiveDropdown] = useState(null);

  const navigationGroups = useMemo(() => user
    ? [
        {
          type: "link",
          to: "/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          type: "dropdown",
          label: "Learning",
          icon: Brain,
          items: [
            { to: "/quizzes", label: "My Quizzes", icon: BookOpen },
            { to: "/quests", label: "Quest Realms", icon: Map, badge: true },
            { to: "/doubt-solver", label: "AI Tutor", icon: Bot },
            { to: "/duel", label: "1v1 Duel", icon: Swords },
            ...(user?.role !== "Student" ? [{ to: "/live", label: "Live Sessions", icon: Radio }] : []),
            ...(user?.role === "Student" && isQuizCreationUnlocked ? [{ to: "/student-quiz-creator", label: "Create Quiz", icon: Sparkles, badge: true }] : []),
          ],
        },
        {
          type: "dropdown",
          label: "Compete",
          icon: Trophy,
          items: [
            { to: "/roadmap", label: "Feature Roadmap", icon: Map, badge: true },
            { to: "/achievements", label: "Achievements", icon: Trophy, badge: true },
            { to: "/avatar/customize", label: "My Avatar", icon: User },
            { to: "/social", label: "Social Hub", icon: Users },
            { to: "/leaderboard", label: "Leaderboard", icon: Zap },
          ],
        },
        {
          type: "link",
          to: "/chat",
          label: "Chat",
          icon: MessageSquare,
          badge: true,
        },
      ]
    : [], [user, isQuizCreationUnlocked]);

  // Track scroll position for navbar appearance changes (always visible)
  useMotionValueEvent(scrollY, "change", (latest) => {
    // Navbar is always visible, just change appearance when scrolled
    setIsScrolled(latest > 20);
  });

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => setIsMenuOpen(false);

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const staggerItem = {
    initial: { opacity: 0, y: -10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const mobileItemVariants = {
    closed: {
      x: 50,
      opacity: 0,
    },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <>
      {/* Floating/Detached Navbar Container - Modern Glassmorphism */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-3 sm:py-4"
        initial={shouldReduceMotion ? { opacity: 1 } : { y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : {
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.6,
              }
        }
      >
        <motion.header
          animate={{
            scale: isScrolled ? 0.98 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
          className={`transition-all duration-500 rounded-2xl sm:rounded-3xl lg:rounded-[28px] overflow-visible ${
            isScrolled
              ? "bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl shadow-2xl shadow-indigo-500/20 dark:shadow-indigo-500/30 border-2 border-indigo-200/50 dark:border-indigo-400/40"
              : "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl shadow-indigo-500/10 border border-indigo-100/40 dark:border-indigo-500/30"
          }`}
          style={{
            WebkitBackdropFilter: isScrolled
              ? "blur(24px) saturate(180%)"
              : "blur(16px) saturate(150%)",
            backdropFilter: isScrolled
              ? "blur(24px) saturate(180%)"
              : "blur(16px) saturate(150%)",
          }}
        >
        {/* Ultra-modern multi-layer gradient overlays */}
        {!isMobile && (
          <>
            {/* Primary gradient overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/8 to-pink-500/10 pointer-events-none"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ backgroundSize: "200% 200%" }}
            />
            {/* Prismatic light refraction effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-purple-500/5 dark:via-white/[0.02] dark:to-purple-500/10 pointer-events-none" />
            {/* Subtle animated shimmer */}
            <motion.div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="absolute -inset-full w-[300%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                animate={{ x: ["-100%", "100%"] }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatDelay: 5,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
            {/* Frosted glass texture */}
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />
            {/* Enhanced border glow for floating navbar */}
            <div
              className={`absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-sm transition-opacity duration-700 pointer-events-none ${
                isScrolled ? "opacity-80" : "opacity-40"
              }`}
              style={{ transform: 'scale(1.01)' }}
            />
          </>
        )}

        <motion.nav
          className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 relative z-10"
          animate={{
            paddingTop: isScrolled ? "0.75rem" : "1rem",
            paddingBottom: isScrolled ? "0.75rem" : "1rem",
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
        >
          <div className="flex justify-between items-center h-12 sm:h-14 md:h-16 lg:h-14">
            {/* Logo with Ultra-Modern Effects */}
            <motion.div
              initial={
                shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -20 }
              }
              animate={{ opacity: 1, x: 0 }}
              transition={
                shouldReduceMotion ? { duration: 0 } : { duration: 0.5 }
              }
              whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                to="/"
                className="flex items-center gap-1.5 sm:gap-2 md:gap-3 group flex-shrink-0"
              >
                <motion.div
                  className="relative p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 shadow-md sm:shadow-lg md:shadow-2xl shadow-blue-500/40 dark:shadow-purple-500/30 overflow-hidden"
                  whileHover={
                    shouldReduceMotion
                      ? {}
                      : { rotate: [0, -10, 10, -10, 0], scale: 1.05 }
                  }
                  transition={
                    shouldReduceMotion ? { duration: 0 } : { duration: 0.5 }
                  }
                >
                  {/* Enhanced multi-layer glow effect */}
                  {!isMobile && (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 blur-2xl opacity-60 group-hover:opacity-90 transition-all duration-500"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.6, 0.8, 0.6],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/30 to-transparent opacity-50" />
                      {/* Holographic shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                        animate={{ x: ["-200%", "200%"] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          repeatDelay: 2,
                          ease: "easeInOut",
                        }}
                      />
                    </>
                  )}
                  <Brain className="h-6 w-6 sm:h-7 sm:w-7 text-white relative z-10 drop-shadow-lg" />

                  {/* Enhanced sparkle effect */}
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{
                      scale: [0.8, 1.2, 0.8],
                      rotate: [0, 180, 360],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Sparkles className="h-4 w-4 text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]" />
                  </motion.div>
                </motion.div>

                <div className="overflow-hidden flex flex-col">
                  <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.h1
                      className="text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:via-indigo-600 group-hover:to-blue-600 transition-all duration-700 tracking-tight whitespace-nowrap"
                      style={{
                        backgroundSize: "200% 200%",
                        fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Cognito
                    </motion.h1>
                    <motion.div
                      className="hidden lg:flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2 lg:px-2.5 py-0.5 md:py-1 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-400/20 dark:via-purple-400/20 dark:to-pink-400/20 rounded-full border border-indigo-200/50 dark:border-indigo-400/30"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Zap className="w-2.5 md:w-3 h-2.5 md:h-3 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-[9px] md:text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">AI Powered</span>
                    </motion.div>
                  </motion.div>
                  <motion.p
                    className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-gray-600 dark:text-gray-400 font-semibold hidden md:flex items-center gap-1.5 md:gap-2 mt-0.5"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="flex items-center gap-1">
                      <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent font-bold">Smart Learning Platform</span>
                    </span>
                    <span className="hidden xl:inline text-gray-400">•</span>
                    <span className="hidden xl:inline text-emerald-600 dark:text-emerald-400 font-bold">100% Free</span>
                  </motion.p>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.div
              className="hidden lg:flex items-center gap-0.5 xl:gap-1 flex-shrink-0"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {user ? (
                <>
                  {/* Enhanced Gamification Badges - Real-time data */}
                  <div className="hidden xl:flex items-center gap-1 xl:gap-1.5 mr-1.5 xl:mr-3">
                    {/* Level Badge - Enhanced */}
                    <motion.div
                      variants={staggerItem}
                      whileHover={{ scale: 1.08, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-3 py-1.5 h-9 bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 rounded-xl shadow-lg hover:shadow-xl hover:shadow-violet-500/60 transition-all duration-300 border border-white/40 relative overflow-hidden cursor-pointer group"
                    >
                      <motion.div
                        animate={{ x: [-50, 150] }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          repeatDelay: 2,
                        }}
                        className="absolute inset-0 w-16 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                      />
                      <motion.div 
                        className="w-7 h-7 rounded-lg bg-white/25 backdrop-blur-xl flex items-center justify-center border border-white/50 relative z-10 shadow-inner"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Crown className="w-4 h-4 text-yellow-300 drop-shadow-lg" />
                      </motion.div>
                      <div className="relative z-10">
                        <p className="text-[9px] font-black text-white/95 uppercase leading-none tracking-wider">
                          LEVEL
                        </p>
                        <p className="text-base font-black text-white leading-none mt-0.5 drop-shadow-md">
                          {currentLevel || 1}
                        </p>
                      </div>
                      {/* Level up indicator */}
                      <motion.div
                        className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full border border-white shadow-lg"
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>

                    {/* Enhanced Streak Badge */}
                    {gamificationStreak > 0 && (
                      <motion.div
                        variants={staggerItem}
                        whileHover={{ scale: 1.08, rotate: [0, -5, 5, 0] }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-3 py-1.5 h-9 bg-gradient-to-br from-orange-500/20 via-red-500/20 to-red-600/20 backdrop-blur-xl rounded-xl border border-orange-300/60 dark:border-orange-400/40 shadow-lg hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 cursor-pointer relative overflow-hidden group"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-orange-400/20 to-orange-400/0"
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg relative z-10"
                        >
                          <Flame className="w-4 h-4 text-white drop-shadow-lg" />
                          <motion.div 
                            className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border border-white"
                            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        </motion.div>
                        <div className="relative z-10">
                          <p className="text-[9px] font-black text-orange-700 dark:text-orange-400 uppercase leading-none tracking-wider">
                            STREAK
                          </p>
                          <p className="text-base font-black bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent leading-none mt-0.5">
                            {gamificationStreak} 🔥
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Enhanced XP Badge */}
                    <motion.div
                      variants={staggerItem}
                      whileHover={{ scale: 1.08, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-3 py-1.5 h-9 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 backdrop-blur-xl rounded-xl border border-indigo-200/60 dark:border-indigo-400/40 shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 cursor-pointer relative overflow-hidden group"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-indigo-400/0 via-purple-400/10 to-pink-400/0"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                      />
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="relative z-10"
                      >
                        <Star className="w-4 h-4 text-violet-600 dark:text-violet-400 fill-violet-600 dark:fill-violet-400 drop-shadow-md" />
                      </motion.div>
                      <div className="relative z-10">
                        <p className="text-[9px] font-black text-indigo-700 dark:text-indigo-300 uppercase leading-none tracking-wider">
                          XP
                        </p>
                        <p className="text-base font-black bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-400 dark:via-purple-400 dark:to-fuchsia-400 bg-clip-text text-transparent leading-none mt-0.5">
                          {(totalXP || 0).toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Smart Navigation with Dropdowns */}
                  {navigationGroups.map((group, index) => (
                    <motion.div key={index} variants={staggerItem} className="relative">
                      {group.type === "link" ? (
                        // Direct Link
                        <Link
                          to={group.to}
                          className={`relative px-2 lg:px-3 h-9 text-xs lg:text-sm font-semibold rounded-xl transition-all duration-300 group flex items-center justify-center gap-1.5 lg:gap-2 ${
                            location.pathname === group.to
                              ? "text-blue-700 dark:text-blue-300"
                              : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                          }`}
                        >
                          {location.pathname === group.to && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 dark:from-blue-500/30 dark:via-purple-500/30 dark:to-indigo-500/30 rounded-xl border border-white/70 dark:border-indigo-400/50 shadow-lg shadow-blue-500/30 backdrop-blur-xl"
                              transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                          )}
                          <motion.div
                            className="relative"
                            whileHover={{ scale: 1.1, rotate: location.pathname === group.to ? 0 : 5 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <group.icon className="w-4 h-4 relative z-10" />
                            {group.badge && (
                              <motion.span
                                className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-800"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            )}
                          </motion.div>
                          <span className="relative z-10 drop-shadow-sm hidden lg:inline">{group.label}</span>
                        </Link>
                      ) : (
                        // Dropdown
                        <div
                          className="relative z-20"
                          onMouseEnter={() => setActiveDropdown(index)}
                          onMouseLeave={() => setActiveDropdown(null)}
                        >
                          <button
                            className={`relative px-2 lg:px-3 h-9 text-xs lg:text-sm font-semibold rounded-xl transition-all duration-300 group flex items-center justify-center gap-1 lg:gap-1.5 ${
                              activeDropdown === index
                                ? "text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-900/20"
                                : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                            }`}
                          >
                            <group.icon className="w-4 h-4" />
                            <span className="drop-shadow-sm hidden lg:inline">{group.label}</span>
                            <ChevronDown
                              className={`w-3 h-3 transition-transform duration-300 ${
                                activeDropdown === index ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {/* Dropdown Menu */}
                          <AnimatePresence>
                            {activeDropdown === index && (
                              <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute top-full mt-2 left-0 min-w-[200px] bg-white dark:bg-slate-800 backdrop-blur-xl rounded-xl shadow-2xl border border-indigo-200/50 dark:border-indigo-400/30 overflow-hidden z-[100]"
                              >
                                {group.items.map((item, itemIndex) => (
                                  <Link
                                    key={itemIndex}
                                    to={item.to}
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-200 group/item relative"
                                  >
                                    <motion.div
                                      className="relative"
                                      whileHover={{ scale: 1.2, rotate: 5 }}
                                      transition={{ type: "spring", stiffness: 400 }}
                                    >
                                      <item.icon className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400" />
                                      {item.badge && (
                                        <motion.span
                                          className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
                                          animate={{ scale: [1, 1.2, 1] }}
                                          transition={{ duration: 2, repeat: Infinity }}
                                        />
                                      )}
                                    </motion.div>
                                    <span className="group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400">
                                      {item.label}
                                    </span>
                                    {location.pathname === item.to && (
                                      <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />
                                    )}
                                  </Link>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Role-based links */}
                  {user.role === "Teacher" && (
                    <motion.div
                      variants={staggerItem}
                      className="relative group"
                    >
                      <Link
                        to="/teaching-hub"
                        className="flex items-center justify-center gap-2 px-4 h-10 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-300 border border-indigo-200/60 dark:border-indigo-400/30"
                      >
                        <GraduationCap className="w-4 h-4" />
                        Teaching Hub
                      </Link>
                    </motion.div>
                  )}

                  {(user.role === "Admin" || user.role === "Moderator") && (
                    <motion.div variants={staggerItem}>
                      <Link
                        to="/moderator"
                        className="flex items-center justify-center gap-2 px-4 h-10 text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300"
                      >
                        <Shield className="w-4 h-4" />
                        Moderator
                      </Link>
                    </motion.div>
                  )}

                  {user.role === "Admin" && (
                    <>
                      <motion.div variants={staggerItem}>
                        <Link
                          to="/admin"
                          className="flex items-center justify-center gap-2 px-4 h-10 text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                        >
                          <UserCog className="w-4 h-4" />
                          Admin
                        </Link>
                      </motion.div>
                      <motion.div variants={staggerItem}>
                        <Link
                          to="/admin-broadcast"
                          className="flex items-center justify-center gap-2 px-4 h-10 text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                        >
                          <Radio className="w-4 h-4" />
                          Broadcast
                        </Link>
                      </motion.div>
                    </>
                  )}

                  {/* Enhanced Logout Button */}
                  <motion.div variants={staggerItem}>
                    <motion.button
                      onClick={handleLogout}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="ml-1 lg:ml-2 h-8 lg:h-9 px-2 lg:px-4 flex items-center justify-center gap-1 lg:gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold text-xs lg:text-sm rounded-xl shadow-lg hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 border border-white/20 relative overflow-hidden group"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      />
                      <span className="relative z-10">Logout</span>
                    </motion.button>
                  </motion.div>
                </>
              ) : (
                <>
                  {/* Products Mega Menu */}
                  <motion.div
                    variants={staggerItem}
                    className="relative"
                    onMouseEnter={() => setIsMegaMenuOpen(true)}
                    onMouseLeave={() => setIsMegaMenuOpen(false)}
                  >
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 relative group">
                      <Sparkles className="w-4 h-4" />
                      Products
                      <motion.div
                        animate={{ rotate: isMegaMenuOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                      <span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 group-hover:w-full transition-all duration-300 rounded-full shadow-lg shadow-blue-500/50"></span>
                    </button>

                    {/* Mega Menu Dropdown */}
                    <AnimatePresence>
                      {isMegaMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[700px] p-6 bg-white dark:bg-slate-900 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 dark:border-indigo-500/30 z-[100]"
                          style={{
                            boxShadow:
                              "0 25px 50px -12px rgba(99, 102, 241, 0.25), 0 0 0 1px rgba(255,255,255,0.1)",
                          }}
                        >
                          {/* Mega Menu Glow Effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl pointer-events-none" />

                          <div className="relative z-10">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200/50 dark:border-indigo-500/20">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                  Our Products
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Explore our AI-powered learning tools
                                </p>
                              </div>
                              <Link
                                to="/features"
                                className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                              >
                                View All Features
                                <Play className="w-3 h-3" />
                              </Link>
                            </div>

                            {/* Products Grid */}
                            <div className="grid grid-cols-2 gap-4">
                              {productDemos.map((product, index) => (
                                <motion.div
                                  key={product.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="group p-4 rounded-xl hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100/50 dark:hover:from-slate-800 dark:hover:to-slate-800/50 transition-all duration-300 cursor-pointer border border-transparent hover:border-gray-200/50 dark:hover:border-indigo-500/20"
                                  onClick={() => {
                                    setIsMegaMenuOpen(false);
                                    // Scroll to demo section on homepage
                                    if (location.pathname === "/") {
                                      document
                                        .getElementById("product-demo")
                                        ?.scrollIntoView({
                                          behavior: "smooth",
                                        });
                                    } else {
                                      navigate("/#product-demo");
                                    }
                                  }}
                                >
                                  <div className="flex items-start gap-4">
                                    <div
                                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${product.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                    >
                                      <product.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {product.title}
                                      </h4>
                                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {product.description}
                                      </p>
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {product.features
                                          .slice(0, 3)
                                          .map((feature, i) => (
                                            <span
                                              key={i}
                                              className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-full"
                                            >
                                              {feature}
                                            </span>
                                          ))}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>

                            {/* CTA Footer */}
                            <div className="mt-6 pt-4 border-t border-gray-200/50 dark:border-indigo-500/20 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                  <Zap className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    100% Free Forever
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    No credit card required
                                  </p>
                                </div>
                              </div>
                              <Link
                                to="/signup"
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                                onClick={() => setIsMegaMenuOpen(false)}
                              >
                                Get Started Free
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div variants={staggerItem}>
                    <Link
                      to="/features"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 relative group"
                    >
                      <FileText className="w-4 h-4" />
                      Features
                      <span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 group-hover:w-full transition-all duration-300 rounded-full shadow-lg shadow-blue-500/50"></span>
                    </Link>
                  </motion.div>
                  <motion.div variants={staggerItem}>
                    <Link
                      to="/about"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 relative group"
                    >
                      About
                      <span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 group-hover:w-full transition-all duration-300 rounded-full"></span>
                    </Link>
                  </motion.div>
                  <motion.div variants={staggerItem}>
                    <Link
                      to="/pricing"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 relative group"
                    >
                      Pricing
                      <span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:w-full transition-all duration-300 rounded-full"></span>
                    </Link>
                  </motion.div>
                  <motion.div variants={staggerItem}>
                    <Link
                      to="/contact"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-pink-600 dark:hover:text-pink-400 transition-all duration-300 relative group"
                    >
                      Contact
                      <span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500 group-hover:w-full transition-all duration-300 rounded-full"></span>
                    </Link>
                  </motion.div>
                  <motion.div variants={staggerItem}>
                    <Link
                      to="/login"
                      className="flex items-center gap-1.5 px-3 lg:px-4 xl:px-5 py-2 lg:py-2.5 text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg lg:rounded-xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:via-purple-500/10 hover:to-indigo-500/10 dark:hover:from-blue-500/20 dark:hover:via-purple-500/20 dark:hover:to-indigo-500/20 transition-all duration-300 border border-transparent hover:border-white/40 dark:hover:border-indigo-400/30 backdrop-blur-xl"
                    >
                      <Users className="w-3.5 lg:w-4 h-3.5 lg:h-4" />
                      <span className="hidden xl:inline">Login</span>
                    </Link>
                  </motion.div>
                  <motion.div variants={staggerItem}>
                    <Link
                      to="/signup"
                      className="relative flex items-center gap-1.5 px-3 lg:px-4 xl:px-6 py-2 lg:py-2.5 xl:py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 text-white text-xs lg:text-sm font-bold rounded-lg lg:rounded-xl shadow-lg lg:shadow-xl shadow-blue-500/40 hover:shadow-2xl hover:shadow-purple-500/50 overflow-hidden group transition-all duration-300 border border-white/20"
                    >
                      {/* Animated gradient background */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                        animate={{
                          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        style={{ backgroundSize: "200% 200%" }}
                      />
                      <UserCog className="w-4 lg:w-5 h-4 lg:h-5 relative z-10" />
                      <span className="relative z-10 drop-shadow-md whitespace-nowrap">
                        Sign Up<span className="hidden lg:inline"> Free</span>
                      </span>
                      {/* Premium shine sweep effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                        initial={{ x: "-150%" }}
                        animate={{ x: ["150%", "-150%"] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                          ease: "easeInOut",
                        }}
                      />
                      {/* Glow pulse */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 blur-xl group-hover:opacity-30"
                        transition={{ duration: 0.3 }}
                      />
                      {/* Sparkle badge */}
                      <motion.div
                        className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-[8px] lg:text-[10px] font-bold px-1 lg:px-1.5 py-0.5 rounded-full shadow-lg"
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                      >
                        FREE
                      </motion.div>
                    </Link>
                  </motion.div>
                </>
              )}

              {/* Help Center Button (Alt+H) */}
              <motion.div variants={staggerItem}>
                <motion.button
                  onClick={() => {
                    const event = new CustomEvent('openHelpWidget');
                    window.dispatchEvent(event);
                  }}
                  className="ml-1 lg:ml-2 p-2 lg:p-2.5 rounded-lg lg:rounded-xl bg-gradient-to-br from-violet-100 via-fuchsia-100 to-purple-100 dark:from-slate-800 dark:via-violet-900/50 dark:to-fuchsia-900/50 hover:from-violet-200 hover:via-fuchsia-200 hover:to-purple-200 dark:hover:from-violet-800/60 dark:hover:via-fuchsia-800/60 dark:hover:to-purple-800/60 transition-all duration-500 shadow-md hover:shadow-lg border border-white/60 dark:border-violet-400/30 backdrop-blur-xl relative overflow-hidden group"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Open Help Center (Alt+H)"
                  aria-label="Open Help Center. Keyboard shortcut: Alt + H"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-violet-400/20 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                  />
                  <HelpCircle className="w-4 lg:w-5 h-4 lg:h-5 text-violet-700 dark:text-violet-400 drop-shadow-md relative z-10" />
                  {/* Alt+H Badge */}
                  <span className="absolute -bottom-1 -right-1 px-1 py-0.5 text-[8px] font-bold bg-violet-600 dark:bg-violet-500 text-white rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    Alt+H
                  </span>
                </motion.button>
              </motion.div>

              {/* Accessibility Settings Button */}
              <motion.div variants={staggerItem}>
                <motion.button
                  onClick={() => setIsAccessibilityModalOpen(true)}
                  className="ml-1 lg:ml-2 p-2 lg:p-2.5 rounded-lg lg:rounded-xl bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-900/50 dark:via-purple-900/50 dark:to-pink-900/50 hover:from-indigo-200 hover:via-purple-200 hover:to-pink-200 dark:hover:from-indigo-800/60 dark:hover:via-purple-800/60 dark:hover:to-pink-800/60 transition-all duration-500 shadow-md hover:shadow-lg border border-white/60 dark:border-indigo-400/30 backdrop-blur-xl relative overflow-hidden group"
                  whileHover={{ scale: 1.1, rotate: [0, 5, -5, 5, 0] }}
                  whileTap={{ scale: 0.9 }}
                  title="Accessibility Settings"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-purple-400/20 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                  />
                  <Settings className="w-4 lg:w-5 h-4 lg:h-5 text-indigo-700 dark:text-indigo-300 drop-shadow-md relative z-10" />
                </motion.button>
              </motion.div>

              {/* Enhanced Theme Toggle */}
              <motion.div variants={staggerItem}>
                <motion.button
                  onClick={toggleTheme}
                  className="ml-1 lg:ml-2 p-2 lg:p-2.5 rounded-lg lg:rounded-xl bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 dark:from-slate-800 dark:via-indigo-900/50 dark:to-purple-900/50 hover:from-blue-200 hover:via-purple-200 hover:to-indigo-200 dark:hover:from-indigo-800/60 dark:hover:via-purple-800/60 dark:hover:to-blue-800/60 transition-all duration-500 shadow-md hover:shadow-lg border border-white/60 dark:border-indigo-400/30 backdrop-blur-xl relative overflow-hidden group"
                  whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
                  whileTap={{ scale: 0.9 }}
                  title="Toggle theme (Ctrl+Shift+D)"
                  aria-label="Toggle theme (Ctrl+Shift+D)"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-indigo-400/20 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                  />
                  <motion.div
                    initial={false}
                    animate={{ rotate: theme === "light" ? 0 : 180, scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                    className="relative z-10"
                  >
                    {theme === "light" ? (
                      <Moon className="w-4 lg:w-5 h-4 lg:h-5 text-indigo-700 drop-shadow-md" />
                    ) : (
                      <Sun className="w-4 lg:w-5 h-4 lg:h-5 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                    )}
                  </motion.div>
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Enhanced Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Help Center (Mobile) */}
              <motion.button
                onClick={() => {
                  const event = new CustomEvent('openHelpWidget');
                  window.dispatchEvent(event);
                }}
                className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-100 via-fuchsia-100 to-purple-100 dark:from-slate-800 dark:via-violet-900/50 dark:to-fuchsia-900/50 border border-white/60 dark:border-violet-400/30 shadow-md backdrop-blur-xl relative overflow-hidden flex-shrink-0"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                title="Open Help Center (Alt+H)"
                aria-label="Open Help Center"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
                <HelpCircle className="w-4 sm:w-5 h-4 sm:h-5 text-violet-700 dark:text-violet-400 relative z-10" />
              </motion.button>
              
              <motion.button
                onClick={toggleTheme}
                className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 dark:from-slate-800 dark:via-indigo-900/50 dark:to-purple-900/50 border border-white/60 dark:border-indigo-400/30 shadow-md backdrop-blur-xl relative overflow-hidden flex-shrink-0"
                whileHover={{ scale: 1.08, rotate: [0, -10, 10, 0] }}
                whileTap={{ scale: 0.92 }}
                title="Toggle theme (Ctrl+Shift+D)"
                aria-label="Toggle theme (Ctrl+Shift+D)"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
                <motion.div
                  animate={{ rotate: theme === "light" ? 0 : 180 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="relative z-10"
                >
                  {theme === "light" ? (
                    <Moon className="w-4 sm:w-5 h-4 sm:h-5 text-indigo-700" />
                  ) : (
                    <Sun className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                  )}
                </motion.div>
              </motion.button>

              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white shadow-lg hover:shadow-xl shadow-blue-500/40 border border-white/20 backdrop-blur-xl relative overflow-hidden group flex-shrink-0"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                />

                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 sm:w-6 h-5 sm:h-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-5 sm:w-6 h-5 sm:h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </motion.nav>
      </motion.header>

      {/* Mobile Menu with Glassmorphism */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Mobile Menu */}
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-4 left-4 right-4 mx-auto max-w-sm bg-white dark:bg-gray-800 z-50 lg:hidden shadow-2xl rounded-3xl overflow-hidden"
            >
              {/* Header with User Info and Close Button */}
              <div className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-6 pb-8">
                {/* Close button */}
                <motion.button
                  onClick={closeMenu}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-gray-100 hover:bg-white text-gray-800 shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </motion.button>

                {/* User Info */}
                {user ? (
                  <div className="flex items-center gap-4 pr-12">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border-2 border-white/40">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {user?.name || 'User'}
                      </h3>
                      <p className="text-sm text-purple-200">
                        Level {currentLevel || 1} • {totalXP || 0} XP
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 pr-12">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border-2 border-white/40">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Cognito Learning Hub
                      </h3>
                      <p className="text-sm text-purple-200">
                        Made in India 🇮🇳
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Menu content */}
              <div className="p-4 space-y-1 max-h-[70vh] overflow-y-auto">
                {user ? (
                  <>
                    {/* Nav links from navigationGroups */}
                    {navigationGroups.map((group, index) => (
                      <div key={index}>
                        {group.type === "link" ? (
                          <Link
                            onClick={closeMenu}
                            to={group.to}
                            className="flex items-center gap-4 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-base font-medium"
                          >
                            <group.icon className="w-5 h-5" />
                            <span>{group.label}</span>
                            {group.badge && (
                              <span className="ml-auto w-2 h-2 bg-red-500 rounded-full" />
                            )}
                          </Link>
                        ) : (
                          <>
                            <div className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              {group.label}
                            </div>
                            {group.items.map((item, itemIndex) => (
                              <Link
                                key={itemIndex}
                                onClick={closeMenu}
                                to={item.to}
                                className="flex items-center gap-4 px-4 py-3.5 pl-8 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-base font-medium"
                              >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                                {item.badge && (
                                  <span className="ml-auto w-2 h-2 bg-red-500 rounded-full" />
                                )}
                              </Link>
                            ))}
                          </>
                        )}
                      </div>
                    ))}

                    {user.role === "Teacher" && (
                      <>
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                            Teaching Hub
                          </p>
                        </div>
                        <Link
                          onClick={closeMenu}
                          to="/teacher-dashboard"
                          className="flex items-center gap-4 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all duration-200 text-base font-medium"
                        >
                          <LayoutDashboard className="w-5 h-5" />
                          <span>My Dashboard</span>
                        </Link>
                        <Link
                          onClick={closeMenu}
                          to="/quiz-maker"
                          className="flex items-center gap-4 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all duration-200 text-base font-medium"
                        >
                          <Sparkles className="w-5 h-5" />
                          <span>Quiz Generator</span>
                        </Link>
                        <Link
                          onClick={closeMenu}
                          to="/live/history"
                          className="flex items-center gap-4 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all duration-200 text-base font-medium"
                        >
                          <Radio className="w-5 h-5" />
                          <span>Live Sessions</span>
                        </Link>
                        <Link
                          onClick={closeMenu}
                          to="/meeting/create"
                          className="flex items-center gap-4 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all duration-200 text-base font-medium"
                        >
                          <Users className="w-5 h-5" />
                          <span>Video Meeting</span>
                        </Link>
                      </>
                    )}

                    {(user.role === "Admin" || user.role === "Moderator") && (
                      <Link
                        onClick={closeMenu}
                        to="/moderator"
                        className="flex items-center gap-4 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-base font-medium"
                      >
                        <Shield className="w-5 h-5" />
                        <span>Moderator</span>
                      </Link>
                    )}

                    {user.role === "Admin" && (
                      <>
                        <Link
                          onClick={closeMenu}
                          to="/admin"
                          className="flex items-center gap-4 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-base font-medium"
                        >
                          <UserCog className="w-5 h-5" />
                          <span>Admin</span>
                        </Link>
                        <Link
                          onClick={closeMenu}
                          to="/admin-broadcast"
                          className="flex items-center gap-4 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-base font-medium"
                        >
                          <Radio className="w-5 h-5" />
                          <span>Broadcast</span>
                        </Link>
                      </>
                    )}

                    {/* User Settings & Profile */}
                    <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="px-4 py-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                        Account
                      </p>
                      <Link
                        onClick={closeMenu}
                        to="/profile"
                        className="flex items-center gap-4 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all duration-200 text-base font-medium"
                      >
                        <User className="w-5 h-5" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        onClick={closeMenu}
                        to="/settings"
                        className="flex items-center gap-4 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all duration-200 text-base font-medium"
                      >
                        <Settings className="w-5 h-5" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    {/* Logout Button */}
                    <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
                      >
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      onClick={closeMenu}
                      to="/"
                      className="flex items-center gap-4 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-base font-medium"
                    >
                      <Brain className="w-5 h-5" />
                      <span>Home</span>
                    </Link>
                    <Link
                      onClick={closeMenu}
                      to="/features"
                      className="flex items-center gap-4 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-base font-medium"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>Features</span>
                    </Link>
                    <Link
                      onClick={closeMenu}
                      to="/about"
                      className="flex items-center gap-4 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-base font-medium"
                    >
                      <Users className="w-5 h-5" />
                      <span>About</span>
                    </Link>
                    <Link
                      onClick={closeMenu}
                      to="/pricing"
                      className="flex items-center gap-4 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-base font-medium"
                    >
                      <Crown className="w-5 h-5" />
                      <span>Pricing</span>
                    </Link>
                    <Link
                      onClick={closeMenu}
                      to="/contact"
                      className="flex items-center gap-4 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-base font-medium"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>Contact</span>
                    </Link>

                    {/* Login Button */}
                    <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                      <Link
                        onClick={closeMenu}
                        to="/login"
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200"
                      >
                        <span>Login</span>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Accessibility Modal */}
      <AccessibilityModal 
        isOpen={isAccessibilityModalOpen}
        onClose={() => setIsAccessibilityModalOpen(false)}
      />
    </motion.div>
    </>
  );
};

export default Navbar;
