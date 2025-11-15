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
  const { scrollY } = useScroll();
  const navigate = useNavigate();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // Navigation links
  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/quizzes", label: "Quizzes", icon: BookOpen },
    { to: "/doubt-solver", label: "AI Tutor", icon: Bot },
    { to: "/achievements", label: "Achievements", icon: Trophy },
    { to: "/social", label: "Social Hub", icon: Users },
    { to: "/chat", label: "Chat", icon: MessageSquare },
  ];

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
      {/* Main Navbar with Enhanced Glassmorphism - Always Visible (Sticky) */}
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
            ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl md:backdrop-blur-3xl shadow-lg md:shadow-2xl shadow-indigo-500/20 border-b border-white/40 dark:border-indigo-400/30"
            : "bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg md:backdrop-blur-2xl border-b border-white/30 dark:border-indigo-500/20 shadow-md md:shadow-xl shadow-indigo-500/10"
        }`}
      >
        {/* Multi-layer Gradient overlays for premium depth - simplified on mobile */}
        {!isMobile && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-purple-500/5 dark:via-white/[0.02] dark:to-purple-500/10 pointer-events-none" />
            {/* Subtle noise texture for glassmorphism realism */}
            <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025] pointer-events-none mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />
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
            {/* Logo */}
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
                  className="relative p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 shadow-lg sm:shadow-2xl shadow-blue-500/40 dark:shadow-purple-500/30"
                  whileHover={
                    shouldReduceMotion
                      ? {}
                      : { rotate: [0, -10, 10, -10, 0], scale: 1.05 }
                  }
                  transition={
                    shouldReduceMotion ? { duration: 0 } : { duration: 0.5 }
                  }
                >
                  {/* Enhanced multi-layer glow effect - simplified on mobile */}
                  {!isMobile && (
                    <>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 blur-2xl opacity-60 group-hover:opacity-90 transition-all duration-500 animate-pulse" />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 to-transparent opacity-40" />
                    </>
                  )}
                  <Brain className="h-6 w-6 sm:h-7 sm:w-7 text-white relative z-10 drop-shadow-lg" />

                  {/* Enhanced sparkle effect on hover */}
                  <motion.div
                    className="absolute -top-1 -right-1"
                    initial={{ scale: 0, opacity: 0, rotate: 0 }}
                    whileHover={{
                      scale: [0, 1.2, 1],
                      opacity: [0, 1, 0.8],
                      rotate: [0, 180, 360],
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    <Sparkles className="h-4 w-4 text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]" />
                  </motion.div>
                </motion.div>

                <div>
                  <h1 className="text-base sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:via-indigo-600 group-hover:to-blue-600 transition-all duration-700 tracking-tight drop-shadow-sm">
                    Cognito Learning Hub
                  </h1>
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
                  {/* Welcome Message */}
                  <motion.div
                    variants={staggerItem}
                    className="mr-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-indigo-500/15 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-indigo-500/20 border border-white/50 dark:border-indigo-400/30 shadow-lg shadow-blue-500/10 dark:shadow-purple-500/20 backdrop-blur-xl"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Welcome,{" "}
                      <span className="font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-300 bg-clip-text text-transparent drop-shadow-sm">
                        {user.name}!
                      </span>
                    </span>
                  </motion.div>

                  {/* Nav Links */}
                  {[
                    {
                      to: "/dashboard",
                      label: "Dashboard",
                      icon: LayoutDashboard,
                    },
                    { to: "/quizzes", label: "Quizzes", icon: BookOpen },
                    { to: "/doubt-solver", label: "AI Tutor", icon: Bot },
                    {
                      to: "/achievements",
                      label: "Achievements",
                      icon: Trophy,
                    },
                    { to: "/social", label: "Social Hub", icon: Users },
                    { to: "/chat", label: "Chat", icon: MessageSquare },
                  ].map((link) => (
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
                    <motion.div variants={staggerItem}>
                      <Link
                        to="/teacher-dashboard"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all duration-300"
                      >
                        <GraduationCap className="w-4 h-4" />
                        My Quizzes
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
                  <motion.div variants={staggerItem}>
                    <Link
                      to="/features"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 relative group"
                    >
                      <Sparkles className="w-4 h-4" />
                      Features
                      <span className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 group-hover:w-full transition-all duration-300 rounded-full shadow-lg shadow-blue-500/50"></span>
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
                      <UserCog className="w-5 h-5 relative z-10" />
                      <span className="relative z-10 drop-shadow-md">
                        Sign Up
                      </span>
                      {/* Enhanced shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                        initial={{ x: "-150%" }}
                        whileHover={{ x: "150%" }}
                        transition={{ duration: 0.8 }}
                      />
                      {/* Glow pulse on hover */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 blur-xl"
                        whileHover={{ opacity: 0.3 }}
                        transition={{ duration: 0.3 }}
                      />
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
              className="fixed top-20 right-4 w-[90vw] max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl z-50 lg:hidden shadow-2xl rounded-3xl border border-white/60 dark:border-gray-700/40 overflow-hidden"
            >
              {/* Enhanced gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-indigo-500/10 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-tl from-white/5 via-transparent to-purple-500/5 pointer-events-none" />

              <div className="relative max-h-[85vh] overflow-y-auto p-6">
                {/* Close button */}
                <motion.button
                  variants={mobileItemVariants}
                  onClick={closeMenu}
                  className="absolute top-4 right-4 p-2 rounded-2xl bg-gradient-to-br from-red-500 via-pink-600 to-red-700 text-white shadow-lg shadow-red-500/30 border border-white/20 backdrop-blur-xl"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>

                {/* Menu content */}
                <div className="mt-2 space-y-3">
                  {user ? (
                    <>
                      {/* User info */}
                      <motion.div
                        variants={mobileItemVariants}
                        className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/15 via-purple-500/15 to-indigo-500/15 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-indigo-500/20 border border-white/50 dark:border-indigo-400/30 mb-4 shadow-lg backdrop-blur-xl"
                      >
                        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                          Logged in as
                        </p>
                        <p className="text-base font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-300 bg-clip-text text-transparent">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                          {user.role}
                        </p>
                      </motion.div>

                      {/* Nav links */}
                      {navLinks.map((link, index) => (
                        <motion.div key={index} variants={mobileItemVariants}>
                          <Link
                            onClick={closeMenu}
                            to={link.to}
                            className="flex items-center gap-3 px-4 py-3 text-gray-800 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 font-semibold rounded-2xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:via-purple-500/10 hover:to-indigo-500/10 dark:hover:from-blue-500/15 dark:hover:via-purple-500/15 dark:hover:to-indigo-500/15 transition-all duration-300 border border-transparent hover:border-blue-400/30 dark:hover:border-indigo-400/30 backdrop-blur-xl hover:shadow-md"
                          >
                            <link.icon className="w-5 h-5" />
                            {link.label}
                          </Link>
                        </motion.div>
                      ))}

                      {user.role === "Teacher" && (
                        <>
                          <motion.div variants={mobileItemVariants}>
                            <Link
                              onClick={closeMenu}
                              to="/teacher-dashboard"
                              className="flex items-center gap-3 px-4 py-2.5 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium rounded-2xl hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-purple-500/10 transition-all duration-300"
                            >
                              <GraduationCap className="w-5 h-5" />
                              My Quizzes
                            </Link>
                          </motion.div>
                          <motion.div variants={mobileItemVariants}>
                            <Link
                              onClick={closeMenu}
                              to="/quiz-maker"
                              className="flex items-center gap-3 px-4 py-2.5 text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium rounded-2xl hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-purple-500/10 transition-all duration-300"
                            >
                              <BookOpen className="w-5 h-5" />
                              Quiz Maker
                            </Link>
                          </motion.div>
                        </>
                      )}

                      {(user.role === "Admin" || user.role === "Moderator") && (
                        <motion.div variants={mobileItemVariants}>
                          <Link
                            onClick={closeMenu}
                            to="/moderator"
                            className="flex items-center gap-3 px-4 py-2.5 font-semibold text-green-600 dark:text-green-400 rounded-2xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300"
                          >
                            <Shield className="w-5 h-5" />
                            Moderator
                          </Link>
                        </motion.div>
                      )}

                      {user.role === "Admin" && (
                        <>
                          <motion.div variants={mobileItemVariants}>
                            <Link
                              onClick={closeMenu}
                              to="/admin"
                              className="flex items-center gap-3 px-4 py-2.5 font-semibold text-red-600 dark:text-red-400 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                            >
                              <UserCog className="w-5 h-5" />
                              Admin
                            </Link>
                          </motion.div>
                          <motion.div variants={mobileItemVariants}>
                            <Link
                              onClick={closeMenu}
                              to="/admin-broadcast"
                              className="flex items-center gap-3 px-4 py-2.5 font-semibold text-red-600 dark:text-red-400 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                            >
                              <Radio className="w-5 h-5" />
                              Broadcast
                            </Link>
                          </motion.div>
                        </>
                      )}

                      <motion.div
                        variants={mobileItemVariants}
                        className="pt-3"
                      >
                        <button
                          onClick={handleLogout}
                          className="w-full px-6 py-3 bg-gradient-to-r from-red-600 via-pink-600 to-red-700 hover:from-red-700 hover:via-pink-700 hover:to-red-800 text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 border border-white/20 backdrop-blur-xl"
                        >
                          Logout
                        </button>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <motion.div variants={mobileItemVariants}>
                        <Link
                          onClick={closeMenu}
                          to="/features"
                          className="flex items-center gap-3 px-4 py-3 text-gray-800 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 font-semibold rounded-2xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:via-purple-500/10 hover:to-indigo-500/10 dark:hover:from-blue-500/15 dark:hover:via-purple-500/15 dark:hover:to-indigo-500/15 transition-all duration-300 border border-transparent hover:border-blue-400/30 dark:hover:border-indigo-400/30 backdrop-blur-xl hover:shadow-md"
                        >
                          <Sparkles className="w-5 h-5" />
                          Features
                        </Link>
                      </motion.div>
                      <motion.div variants={mobileItemVariants}>
                        <Link
                          onClick={closeMenu}
                          to="/login"
                          className="flex items-center gap-3 px-4 py-3 text-gray-800 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-300 font-semibold rounded-2xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:via-purple-500/10 hover:to-indigo-500/10 dark:hover:from-blue-500/15 dark:hover:via-purple-500/15 dark:hover:to-indigo-500/15 transition-all duration-300 border border-transparent hover:border-blue-400/30 dark:hover:border-indigo-400/30 backdrop-blur-xl hover:shadow-md"
                        >
                          <Users className="w-5 h-5" />
                          Login
                        </Link>
                      </motion.div>
                      <motion.div
                        variants={mobileItemVariants}
                        className="pt-3"
                      >
                        <Link
                          onClick={closeMenu}
                          to="/signup"
                          className="flex items-center justify-center gap-3 w-full px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 border border-white/20 backdrop-blur-xl"
                        >
                          <UserCog className="w-5 h-5" />
                          Sign Up
                        </Link>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
