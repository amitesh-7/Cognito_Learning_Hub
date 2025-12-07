import React, { useState, useEffect, useContext } from "react";
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
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";
import { useReducedMotion, useIsMobile } from "../hooks/useReducedMotion";
import Button from "./ui/Button";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [theme, toggleTheme] = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const navigate = useNavigate();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // Product demos for mega menu
  const productDemos = [
    {
      id: 'quiz',
      title: 'AI Quiz Generator',
      description: 'Create quizzes from PDFs, topics, or YouTube videos',
      icon: Brain,
      color: 'from-blue-500 to-cyan-500',
      features: ['PDF Upload', 'Topic Input', 'YouTube Links', 'MCQ, T/F, Descriptive']
    },
    {
      id: 'battle',
      title: '1v1 Duel Battles',
      description: 'Challenge friends in real-time quiz battles',
      icon: Swords,
      color: 'from-red-500 to-orange-500',
      features: ['Real-time Scoring', 'Leaderboards', 'Matchmaking', 'XP Rewards']
    },
    {
      id: 'multiplayer',
      title: 'Live Sessions',
      description: 'Teachers host, students join and compete live',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      features: ['Live Lobbies', 'Real-time Progress', 'Session Controls', 'Analytics']
    },
    {
      id: 'meeting',
      title: 'Video Meetings',
      description: 'Built-in video conferencing for classes',
      icon: Video,
      color: 'from-green-500 to-teal-500',
      features: ['HD Video', 'Screen Share', 'Chat', 'Scheduling']
    }
  ];

  // Navigation links - Dashboard always goes to student dashboard for everyone
  const navLinks = user
    ? [
        {
          to: "/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        { to: "/quizzes", label: "Quizzes", icon: BookOpen },
        { to: "/doubt-solver", label: "AI Tutor", icon: Bot },
        { to: "/avatar", label: "My Avatar", icon: User },
        { to: "/achievements", label: "Achievements", icon: Trophy },
        { to: "/social", label: "Social Hub", icon: Users },
        { to: "/chat", label: "Chat", icon: MessageSquare },
      ]
    : [];

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
      {/* Main Navbar with Ultra-Modern Glassmorphism - Always Visible (Sticky) */}
      <motion.header
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
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-700 ${
          isScrolled
            ? "bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl md:backdrop-blur-3xl shadow-2xl md:shadow-[0_8px_32px_rgba(99,102,241,0.15)] border-b border-white/50 dark:border-indigo-400/30"
            : "bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl md:backdrop-blur-2xl border-b border-white/40 dark:border-indigo-500/20 shadow-lg md:shadow-xl shadow-indigo-500/10"
        }`}
        style={{
          WebkitBackdropFilter: isScrolled ? "blur(24px) saturate(180%)" : "blur(16px) saturate(150%)",
          backdropFilter: isScrolled ? "blur(24px) saturate(180%)" : "blur(16px) saturate(150%)",
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
            {/* Iridescent border glow */}
            <div className={`absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent transition-opacity duration-700 ${isScrolled ? 'opacity-100' : 'opacity-50'}`} />
          </>
        )}

        <motion.nav
          className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
          animate={{
            paddingTop: isScrolled ? "0.5rem" : "0.75rem",
            paddingBottom: isScrolled ? "0.5rem" : "0.75rem",
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
        >
          <div className="flex justify-between items-center h-16 lg:h-18">
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
                className="flex items-center space-x-2 sm:space-x-3 group"
              >
                <motion.div
                  className="relative p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 shadow-lg sm:shadow-2xl shadow-blue-500/40 dark:shadow-purple-500/30 overflow-hidden"
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

                <div className="overflow-hidden">
                  <motion.h1 
                    className="text-base sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:via-indigo-600 group-hover:to-blue-600 transition-all duration-700 tracking-tight"
                    style={{
                      backgroundSize: "200% 200%",
                    }}
                  >
                    Cognito Learning Hub
                  </motion.h1>
                  <motion.p 
                    className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium hidden sm:block"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    AI-Powered Learning • 100% Free
                  </motion.p>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.div
              className="hidden lg:flex items-center space-x-1"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {user ? (
                <>
                  {/* Gamification Badges */}
                  <div className="flex items-center gap-2 mr-3">
                    {/* Level Badge */}
                    <motion.div
                      variants={staggerItem}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-xl shadow-lg hover:shadow-violet-500/50 transition-all duration-300 border border-white/30 relative overflow-hidden"
                    >
                      <motion.div
                        animate={{ x: [-50, 150] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          repeatDelay: 1,
                        }}
                        className="absolute inset-0 w-16 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                      />
                      <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/40 relative z-10">
                        <Crown className="w-4 h-4 text-yellow-300" />
                      </div>
                      <div className="relative z-10">
                        <p className="text-[10px] font-black text-white/90 uppercase leading-none">
                          Lvl
                        </p>
                        <p className="text-sm font-black text-white leading-none">
                          12
                        </p>
                      </div>
                    </motion.div>

                    {/* Streak Badge */}
                    <motion.div
                      variants={staggerItem}
                      whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
                      className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-orange-50 to-red-50 backdrop-blur-xl rounded-xl border border-orange-200/60 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md relative"
                      >
                        <Flame className="w-4 h-4 text-white" />
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                      </motion.div>
                      <div>
                        <p className="text-[10px] font-black text-orange-600 uppercase leading-none">
                          Streak
                        </p>
                        <p className="text-sm font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent leading-none">
                          7
                        </p>
                      </div>
                    </motion.div>

                    {/* XP Badge */}
                    <motion.div
                      variants={staggerItem}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 px-3 py-2 bg-white/60 backdrop-blur-xl rounded-xl border border-white/80 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Star className="w-4 h-4 text-violet-600 fill-violet-600" />
                      <div>
                        <p className="text-[10px] font-black text-slate-600 uppercase leading-none">
                          XP
                        </p>
                        <p className="text-sm font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent leading-none">
                          2340
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Nav Links */}
                  {navLinks.map((link) => (
                    <motion.div key={link.to} variants={staggerItem}>
                      <Link
                        to={link.to}
                        className={`relative px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 group flex items-center gap-2 ${
                          location.pathname === link.to
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                        }`}
                      >
                        {/* Active indicator with enhanced glassmorphism */}
                        {location.pathname === link.to && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 dark:from-blue-500/25 dark:via-purple-500/25 dark:to-indigo-500/25 rounded-xl border border-white/60 dark:border-indigo-400/40 shadow-lg shadow-blue-500/20 backdrop-blur-xl"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        )}

                        {/* Icon and Label */}
                        <link.icon className="w-4 h-4 relative z-10" />
                        <span className="relative z-10 drop-shadow-sm">
                          {link.label}
                        </span>

                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg shadow-blue-500/50"
                          initial={{ scaleX: 0 }}
                          whileHover={{ scaleX: 1 }}
                        />
                      </Link>
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
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-300 border border-indigo-200/60 dark:border-indigo-400/30"
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
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300"
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
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                        >
                          <UserCog className="w-4 h-4" />
                          Admin
                        </Link>
                      </motion.div>
                      <motion.div variants={staggerItem}>
                        <Link
                          to="/admin-broadcast"
                          className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                        >
                          <Radio className="w-4 h-4" />
                          Broadcast
                        </Link>
                      </motion.div>
                    </>
                  )}

                  {/* Logout Button */}
                  <motion.div variants={staggerItem}>
                    <Button
                      onClick={handleLogout}
                      variant="default"
                      size="sm"
                      className="ml-2"
                    >
                      Logout
                    </Button>
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
                    <button
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 relative group"
                    >
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
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[700px] p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 dark:border-indigo-500/30 z-50"
                          style={{
                            boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.25), 0 0 0 1px rgba(255,255,255,0.1)'
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
                                    if (location.pathname === '/') {
                                      document.getElementById('product-demo')?.scrollIntoView({ behavior: 'smooth' });
                                    } else {
                                      navigate('/#product-demo');
                                    }
                                  }}
                                >
                                  <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${product.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
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
                                        {product.features.slice(0, 3).map((feature, i) => (
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
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">100% Free Forever</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">No credit card required</p>
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
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:via-purple-500/10 hover:to-indigo-500/10 dark:hover:from-blue-500/20 dark:hover:via-purple-500/20 dark:hover:to-indigo-500/20 transition-all duration-300 border border-transparent hover:border-white/40 dark:hover:border-indigo-400/30 backdrop-blur-xl"
                    >
                      <Users className="w-4 h-4" />
                      Login
                    </Link>
                  </motion.div>
                  <motion.div variants={staggerItem}>
                    <Link
                      to="/signup"
                      className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 text-white font-bold rounded-xl shadow-xl shadow-blue-500/40 hover:shadow-2xl hover:shadow-purple-500/50 overflow-hidden group transition-all duration-300 border border-white/20"
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
                      <UserCog className="w-5 h-5 relative z-10" />
                      <span className="relative z-10 drop-shadow-md">
                        Sign Up Free
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
                          ease: "easeInOut"
                        }}
                      />
                      {/* Glow pulse */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 blur-xl group-hover:opacity-30"
                        transition={{ duration: 0.3 }}
                      />
                      {/* Sparkle badge */}
                      <motion.div
                        className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg"
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

              {/* Theme Toggle */}
              <motion.div variants={staggerItem}>
                <motion.button
                  onClick={toggleTheme}
                  className="ml-3 p-3 rounded-xl bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 dark:from-slate-800 dark:via-indigo-900/50 dark:to-purple-900/50 hover:from-blue-200 hover:via-purple-200 hover:to-indigo-200 dark:hover:from-indigo-800/60 dark:hover:via-purple-800/60 dark:hover:to-blue-800/60 transition-all duration-500 shadow-lg hover:shadow-xl border border-white/60 dark:border-indigo-400/30 backdrop-blur-xl"
                  whileHover={{ scale: 1.08, rotate: 5 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: theme === "light" ? 0 : 180 }}
                    transition={{ duration: 0.5, type: "spring" }}
                  >
                    {theme === "light" ? (
                      <Moon className="w-5 h-5 text-indigo-700 drop-shadow-sm" />
                    ) : (
                      <Sun className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                    )}
                  </motion.div>
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              <motion.button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 dark:from-slate-800 dark:via-indigo-900/50 dark:to-purple-900/50 border border-white/60 dark:border-indigo-400/30 shadow-md backdrop-blur-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5 text-indigo-700" />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]" />
                )}
              </motion.button>

              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white shadow-xl shadow-blue-500/40 border border-white/20 backdrop-blur-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-6 h-6" />
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
                      <span className="text-3xl font-bold text-white">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {user.name}
                      </h3>
                      <p className="text-sm text-purple-200 flex items-center gap-1">
                        Made in India 🇮🇳
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
                    {/* Nav links */}
                    {navLinks.map((link, index) => (
                      <Link
                        key={index}
                        onClick={closeMenu}
                        to={link.to}
                        className="flex items-center gap-4 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-base font-medium"
                      >
                        <link.icon className="w-5 h-5" />
                        <span>{link.label}</span>
                      </Link>
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
    </>
  );
};

export default Navbar;
