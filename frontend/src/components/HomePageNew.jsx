import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView, useMotionValue, useTransform } from "framer-motion";
import Lottie from "lottie-react";
import Lenis from "lenis";
import {
  Sparkles,
  Gamepad2,
  MessageCircle,
  Brain,
  Zap,
  Users,
  Award,
  ArrowRight,
  CheckCircle,
  BookOpen,
  ListChecks,
  Trophy,
  Play,
  Clock,
  Shield,
  Star,
  TrendingUp,
  Target,
  Rocket,
  HeartHandshake,
  Check,
  X,
  FileText,
  Youtube,
  Swords,
  Crown,
  Radio,
  Video,
  Hand,
  Mic,
  Camera,
  ScreenShare,
  Send,
  Pause,
  ChevronRight,
  ToggleLeft,
  AlignLeft,
  Medal,
  GraduationCap,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/Card";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import FloatingIconsBackground from "./FloatingIconsBackground";
import ProductDemo from "./ProductDemo";
import materialWaveAnimation from "../assets/Material wave loading.json";
import { staggerContainer, staggerItem, fadeInUp } from "../lib/utils";
import "../animations.css";

export default function HomePageNew() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeDemo, setActiveDemo] = useState(0);
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 10000,
    totalQuizzes: 50000,
    successRate: 95,
    avgScore: 85,
  });
  const [isPlaying, setIsPlaying] = useState(true);
  const [battleScore1, setBattleScore1] = useState(0);
  const [battleScore2, setBattleScore2] = useState(0);
  const lenisRef = useRef(null);
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: false, amount: 0.3 });

  // Auto-rotate demos
  useEffect(() => {
    if (!isPlaying || !isHeroInView) return;
    const interval = setInterval(() => {
      setActiveDemo((prev) => {
        const next = (prev + 1) % 7;
        // Reset battle scores when cycling
        if (next === 5) {
          setBattleScore1(0);
          setBattleScore2(0);
        }
        // Increment scores during battle demo
        if (prev === 5) {
          setBattleScore1((s) => s + (Math.random() > 0.4 ? 100 : 50));
          setBattleScore2((s) => s + (Math.random() > 0.5 ? 100 : 50));
        }
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlaying, isHeroInView]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Initialize Lenis smooth scrolling
  useEffect(() => {
    if (!isLoading) {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
      });

      lenisRef.current = lenis;

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      return () => {
        lenis.destroy();
      };
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-48 h-48 mx-auto mb-4">
            <Lottie 
              animationData={materialWaveAnimation} 
              loop={true}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <p className="text-indigo-600 dark:text-indigo-400 font-semibold">
            Loading Cognito...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 overflow-hidden">
      {/* 3D Animated Background */}
      <div className="fixed inset-0 w-full h-full -z-10">
        <FloatingIconsBackground />
        
        {/* 3D Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating Orbs */}
          <motion.div
            className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", type: "tween" }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", type: "tween" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, -120, 0],
              y: [0, 100, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", type: "tween" }}
          />
          
          {/* 3D Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)]" />
        </div>
      </div>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center px-6 lg:px-8 pt-20 pb-16">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge
                    variant="gradient"
                    size="lg"
                    className="mb-6 inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    #1 AI-Powered Learning Platform
                  </Badge>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.3,
                    type: "spring",
                    stiffness: 100,
                    damping: 10
                  }}
                  className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight"
                >
                  {"Learn Smarter with ".split("").map((char, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.3 + index * 0.03,
                        type: "spring",
                        stiffness: 200,
                        damping: 10,
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                  <motion.span 
                    className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent inline-block"
                    initial={{ opacity: 0, scale: 0.5, rotateX: -90 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    transition={{
                      delay: 0.9,
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                    }}
                  >
                    AI Power
                  </motion.span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed"
                >
                  Create AI quizzes from PDFs, battle friends in 1v1 duels, join live
                  sessions, and get instant AI tutoring—all in one revolutionary platform.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      asChild
                      size="lg"
                      className="relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl overflow-hidden group"
                    >
                      <Link to="/signup" className="relative z-10">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                        <span className="relative z-10 flex items-center">
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          >
                            <Rocket className="w-5 h-5 mr-2" />
                          </motion.div>
                          Start Free Today
                        </span>
                        <motion.div
                          className="absolute inset-0 bg-white/20"
                          initial={{ x: "-100%", skewX: -15 }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.6 }}
                        />
                      </Link>
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="relative border-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 px-8 py-6 text-lg font-bold rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 overflow-hidden group"
                    >
                      <Link to="#demo" className="relative z-10">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                        <span className="relative z-10 flex items-center">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Play className="w-5 h-5 mr-2" />
                          </motion.div>
                          Watch Demo
                        </span>
                      </Link>
                    </Button>
                  </motion.div>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200 dark:border-gray-700"
                >
                  <div>
                    <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {platformStats.totalUsers.toLocaleString()}+
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Active Users
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {platformStats.totalQuizzes.toLocaleString()}+
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Quizzes Created
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                      {platformStats.successRate}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Success Rate
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right - Product Demo Laptop */}
              <motion.div
                ref={heroRef}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative"
              >
                {/* MacBook Frame */}
                <div className="relative">
                  <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl p-4 shadow-2xl">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-3xl z-20"></div>

                    {/* Browser Chrome */}
                    <div className="absolute top-4 left-4 right-4 bg-gray-900/50 backdrop-blur-sm rounded-t-xl px-4 py-2 flex items-center gap-3 z-10 border-b border-gray-700/50">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      </div>
                      <div className="flex-1 bg-gray-800/50 rounded px-3 py-1 text-xs text-gray-400">
                        cognito-learning-hub.com
                      </div>
                      <motion.button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-1 rounded hover:bg-gray-700/50 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isPlaying ? (
                          <Pause className="w-3 h-3 text-gray-400" />
                        ) : (
                          <Play className="w-3 h-3 text-gray-400" />
                        )}
                      </motion.button>
                    </div>

                    {/* Screen */}
                    <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 rounded-2xl aspect-video relative overflow-hidden mt-10">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeDemo}
                          initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                          exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
                          transition={{ duration: 0.5 }}
                          className="absolute inset-0 p-6"
                        >
                          {activeDemo === 0 && (
                            <div className="h-full flex flex-col">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                                  <BookOpen className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-white font-bold">PDF to Quiz</h4>
                                  <p className="text-xs text-gray-400">Upload & Generate</p>
                                </div>
                              </div>
                              <motion.div
                                className="border-2 border-dashed border-blue-400 rounded-2xl p-10 bg-blue-500/10 flex-1 flex items-center justify-center relative overflow-hidden"
                                animate={{ borderColor: ["#60a5fa", "#3b82f6", "#60a5fa"] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                {/* Animated particles */}
                                {[...Array(6)].map((_, i) => (
                                  <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 bg-blue-400 rounded-full"
                                    animate={{
                                      x: [
                                        Math.random() * 100 - 50,
                                        Math.random() * 100 - 50,
                                      ],
                                      y: [
                                        Math.random() * 100 - 50,
                                        Math.random() * 100 - 50,
                                      ],
                                      opacity: [0, 1, 0],
                                    }}
                                    transition={{
                                      duration: 3,
                                      repeat: Infinity,
                                      delay: i * 0.5,
                                    }}
                                  />
                                ))}
                                <div className="text-center relative z-10">
                                  <motion.div
                                    className="text-6xl mb-4"
                                    animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    📄
                                  </motion.div>
                                  <p className="text-white font-medium">Drop PDF here</p>
                                  <p className="text-gray-400 text-sm mt-2">
                                    AI generates quiz in seconds
                                  </p>
                                  <motion.div
                                    className="mt-4 flex items-center justify-center gap-2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                  >
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-green-400 text-xs">
                                      Supports multiple formats
                                    </span>
                                  </motion.div>
                                </div>
                              </motion.div>
                            </div>
                          )}

                          {activeDemo === 1 && (
                            <div className="h-full flex flex-col">
                              <div className="flex items-center gap-3 mb-4">
                                <motion.div
                                  className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg"
                                  animate={{
                                    boxShadow: [
                                      "0 0 20px rgba(168, 85, 247, 0.4)",
                                      "0 0 40px rgba(168, 85, 247, 0.6)",
                                      "0 0 20px rgba(168, 85, 247, 0.4)",
                                    ],
                                  }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <Brain className="w-7 h-7 text-white" />
                                </motion.div>
                                <div>
                                  <h4 className="text-white font-bold">Topic to Quiz</h4>
                                  <p className="text-xs text-gray-400">AI-Powered</p>
                                </div>
                              </div>
                              <div className="bg-white/10 rounded-xl p-4 border border-purple-400 mb-4 relative overflow-hidden">
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"
                                  animate={{ x: ["-100%", "100%"] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: "100%" }}
                                  transition={{ duration: 2 }}
                                  className="text-white relative z-10"
                                >
                                  Photosynthesis in plants and its importance...
                                </motion.div>
                              </div>
                              <div className="space-y-3 flex-1">
                                {[1, 2, 3].map((i) => (
                                  <motion.div
                                    key={i}
                                    className="bg-indigo-500/20 rounded-lg p-3 border border-indigo-400 relative overflow-hidden"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.2 }}
                                  >
                                    <motion.div
                                      className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400"
                                      initial={{ height: 0 }}
                                      animate={{ height: "100%" }}
                                      transition={{ delay: 0.5 + i * 0.2, duration: 0.5 }}
                                    />
                                    <div className="flex items-center gap-3">
                                      <motion.div
                                        className="w-3 h-3 bg-indigo-400 rounded-full"
                                        animate={{ scale: [1, 1.3, 1] }}
                                        transition={{
                                          duration: 1,
                                          repeat: Infinity,
                                          delay: i * 0.3,
                                        }}
                                      />
                                      <div className="h-2 bg-indigo-400/40 rounded flex-1" />
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}

                          {activeDemo === 2 && (
                            <div className="h-full flex flex-col">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                                  <Play className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-white font-bold">YouTube to Quiz</h4>
                                  <p className="text-xs text-gray-400">Video Learning</p>
                                </div>
                              </div>
                              <div className="bg-red-500/10 rounded-2xl overflow-hidden border border-red-400 flex-1">
                                <div className="bg-black aspect-video flex items-center justify-center">
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                  >
                                    <Play className="w-20 h-20 text-red-500" />
                                  </motion.div>
                                </div>
                                <div className="p-3 bg-red-500/20">
                                  <motion.div
                                    className="h-2 bg-red-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: "65%" }}
                                    transition={{ duration: 2 }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {activeDemo === 3 && (
                            <div className="h-full flex flex-col">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                                  <ListChecks className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-white font-bold">Manual Creator</h4>
                                  <p className="text-xs text-gray-400">Full Control</p>
                                </div>
                              </div>
                              <div className="space-y-3 flex-1">
                                <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-400">
                                  <div className="flex justify-between mb-3">
                                    <span className="text-emerald-300 font-bold">Q1</span>
                                    <span className="text-emerald-400 text-xs bg-emerald-500/20 px-2 py-1 rounded">
                                      MCQ
                                    </span>
                                  </div>
                                  <div className="space-y-2">
                                    {[1, 2, 3, 4].map((i) => (
                                      <motion.div
                                        key={i}
                                        className="flex items-center gap-3"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 + i * 0.1 }}
                                      >
                                        <div
                                          className={`w-4 h-4 rounded-full border-2 ${
                                            i === 2
                                              ? "border-emerald-400 bg-emerald-400/30"
                                              : "border-emerald-400"
                                          }`}
                                        />
                                        <div className="h-2 bg-emerald-400/30 rounded flex-1" />
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>
                                <Button className="w-full bg-emerald-500 hover:bg-emerald-600">
                                  + Add Question
                                </Button>
                              </div>
                            </div>
                          )}

                          {activeDemo === 4 && (
                            <div className="h-full flex flex-col">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                                  <MessageCircle className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-white font-bold">AI Tutor 24/7</h4>
                                  <p className="text-xs text-gray-400">Instant Help</p>
                                </div>
                              </div>
                              <div className="space-y-4 flex-1">
                                <motion.div
                                  className="bg-blue-500/20 rounded-xl p-4 ml-auto max-w-[85%] border border-blue-400"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                >
                                  <p className="text-white">What is Newton's second law?</p>
                                </motion.div>
                                <motion.div
                                  className="bg-purple-500/20 rounded-xl p-4 mr-auto max-w-[85%] border border-purple-400"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.5 }}
                                >
                                  <div className="flex gap-3">
                                    <Brain className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                                    <div>
                                      <p className="text-white font-semibold">F = ma</p>
                                      <p className="text-gray-300 text-sm mt-1">
                                        Force equals mass times acceleration
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>
                              </div>
                            </div>
                          )}

                          {activeDemo === 5 && (
                            <div className="h-full flex flex-col">
                              <div className="flex items-center gap-3 mb-3">
                                <motion.div
                                  className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg relative"
                                  animate={{ rotate: [0, 10, -10, 0] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <Swords className="w-7 h-7 text-white" />
                                  <motion.div
                                    className="absolute -inset-1 rounded-xl border-2 border-orange-400"
                                    animate={{
                                      scale: [1, 1.2, 1],
                                      opacity: [0.5, 1, 0.5],
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                  />
                                </motion.div>
                                <div>
                                  <h4 className="text-white font-bold">1v1 Quiz Battle</h4>
                                  <p className="text-xs text-gray-400">Real-time Duel</p>
                                </div>
                              </div>
                              
                              {/* VS Badge */}
                              <div className="flex justify-center mb-3">
                                <motion.div
                                  className="px-4 py-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-full"
                                  animate={{
                                    boxShadow: [
                                      "0 0 10px rgba(239, 68, 68, 0.5)",
                                      "0 0 20px rgba(239, 68, 68, 0.8)",
                                      "0 0 10px rgba(239, 68, 68, 0.5)",
                                    ],
                                  }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >
                                  <span className="text-white font-bold text-sm">LIVE BATTLE</span>
                                </motion.div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <motion.div
                                  className="bg-blue-500/20 rounded-xl p-3 border-2 border-blue-400 relative overflow-hidden"
                                  animate={{
                                    borderColor:
                                      battleScore1 > battleScore2
                                        ? ["#60a5fa", "#3b82f6"]
                                        : "#60a5fa",
                                  }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >
                                  {battleScore1 > battleScore2 && (
                                    <motion.div
                                      className="absolute inset-0 bg-blue-400/10"
                                      animate={{ opacity: [0.1, 0.3, 0.1] }}
                                      transition={{ duration: 0.5, repeat: Infinity }}
                                    />
                                  )}
                                  <div className="flex items-center gap-2 mb-2 relative z-10">
                                    <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                      Y
                                    </div>
                                    <span className="text-white text-sm font-medium">You</span>
                                  </div>
                                  <motion.div
                                    className="text-white text-2xl font-black relative z-10"
                                    key={battleScore1}
                                    initial={{ scale: 1.3, color: "#fbbf24" }}
                                    animate={{ scale: 1, color: "#ffffff" }}
                                  >
                                    {battleScore1}
                                  </motion.div>
                                  <motion.div
                                    className="h-1.5 bg-blue-500 rounded-full mt-2"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((battleScore1 / 1000) * 100, 100)}%` }}
                                  />
                                </motion.div>
                                
                                <motion.div
                                  className="bg-red-500/20 rounded-xl p-3 border-2 border-red-400 relative overflow-hidden"
                                  animate={{
                                    borderColor:
                                      battleScore2 > battleScore1
                                        ? ["#ef4444", "#dc2626"]
                                        : "#ef4444",
                                  }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >
                                  {battleScore2 > battleScore1 && (
                                    <motion.div
                                      className="absolute inset-0 bg-red-400/10"
                                      animate={{ opacity: [0.1, 0.3, 0.1] }}
                                      transition={{ duration: 0.5, repeat: Infinity }}
                                    />
                                  )}
                                  <div className="flex items-center gap-2 mb-2 relative z-10">
                                    <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                      O
                                    </div>
                                    <span className="text-white text-sm font-medium">Rival</span>
                                  </div>
                                  <motion.div
                                    className="text-white text-2xl font-black relative z-10"
                                    key={battleScore2}
                                    initial={{ scale: 1.3, color: "#fbbf24" }}
                                    animate={{ scale: 1, color: "#ffffff" }}
                                  >
                                    {battleScore2}
                                  </motion.div>
                                  <motion.div
                                    className="h-1.5 bg-red-500 rounded-full mt-2"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((battleScore2 / 1000) * 100, 100)}%` }}
                                  />
                                </motion.div>
                              </div>
                              
                              <motion.div
                                className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-3 border border-yellow-400 relative overflow-hidden"
                                animate={{ scale: [1, 1.03, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              >
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent"
                                  animate={{ x: ["-100%", "100%"] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                />
                                <div className="flex items-center justify-center gap-2 relative z-10">
                                  <motion.span
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                  >
                                    ⚡
                                  </motion.span>
                                  <p className="text-yellow-300 font-bold text-sm">
                                    Lightning Round Active!
                                  </p>
                                </div>
                              </motion.div>
                            </div>
                          )}

                          {activeDemo === 6 && (
                            <div className="h-full flex flex-col">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <motion.div
                                    className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg"
                                    animate={{
                                      boxShadow: [
                                        "0 0 20px rgba(34, 197, 94, 0.4)",
                                        "0 0 40px rgba(34, 197, 94, 0.6)",
                                        "0 0 20px rgba(34, 197, 94, 0.4)",
                                      ],
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    <Video className="w-6 h-6 text-white" />
                                  </motion.div>
                                  <div>
                                    <h4 className="text-white font-bold text-sm">Video Meeting</h4>
                                    <p className="text-xs text-gray-400">Live Session</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <motion.div
                                    className="w-2 h-2 bg-red-500 rounded-full"
                                    animate={{ scale: [1, 1.4, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                  />
                                  <span className="text-red-400 text-xs font-bold">LIVE</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 flex-1 mb-3">
                                {[
                                  { emoji: "👨‍🏫", name: "Host", gradient: "from-purple-600 to-pink-600" },
                                  { emoji: "👨‍🎓", name: "Alex", gradient: "from-blue-600 to-cyan-600" },
                                  { emoji: "👩‍🎓", name: "Sam", gradient: "from-green-600 to-emerald-600" },
                                  { emoji: "🧑‍🎓", name: "Jordan", gradient: "from-orange-600 to-red-600" },
                                ].map((user, i) => (
                                  <motion.div
                                    key={i}
                                    className={`aspect-video bg-gradient-to-br ${user.gradient} rounded-lg relative overflow-hidden border-2 ${
                                      i === 0 ? "border-yellow-400" : "border-green-400/50"
                                    }`}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                  >
                                    <div className="absolute inset-0 flex items-center justify-center text-2xl">
                                      {user.emoji}
                                    </div>
                                    
                                    {/* Host badge */}
                                    {i === 0 && (
                                      <div className="absolute top-1 left-1">
                                        <div className="bg-yellow-500 px-2 py-0.5 rounded flex items-center gap-1">
                                          <Crown className="w-2.5 h-2.5 text-white" />
                                          <span className="text-white text-[10px] font-bold">
                                            HOST
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Live indicator */}
                                    {i === 0 && (
                                      <div className="absolute top-1 right-1">
                                        <motion.div
                                          className="w-2 h-2 bg-red-500 rounded-full"
                                          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                                          transition={{ duration: 1, repeat: Infinity }}
                                        />
                                      </div>
                                    )}
                                    
                                    {/* Name tag */}
                                    <div className="absolute bottom-1 left-1 right-1">
                                      <div className="bg-black/50 backdrop-blur-sm rounded px-1.5 py-0.5">
                                        <p className="text-white text-[10px] font-medium truncate">
                                          {user.name}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {/* Speaking animation */}
                                    {i === 0 && (
                                      <motion.div
                                        className="absolute inset-0 border-2 border-green-400 rounded-lg"
                                        animate={{
                                          opacity: [0, 1, 0],
                                          scale: [0.95, 1, 0.95],
                                        }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                      />
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                              
                              {/* Controls */}
                              <div className="flex items-center justify-center gap-2">
                                {[
                                  { icon: Mic, color: "bg-gray-600" },
                                  { icon: Camera, color: "bg-gray-600" },
                                  { icon: ScreenShare, color: "bg-blue-600" },
                                ].map((control, idx) => (
                                  <motion.button
                                    key={idx}
                                    className={`${control.color} p-2 rounded-lg`}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <control.icon className="w-3 h-3 text-white" />
                                  </motion.button>
                                ))}
                                <motion.button
                                  className="bg-red-600 px-3 py-2 rounded-lg flex items-center gap-1"
                                  whileHover={{ scale: 1.05 }}
                                >
                                  <span className="text-white text-[10px] font-bold">End</span>
                                </motion.button>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>

                      {/* Ambient Glow */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none" />
                    </div>
                  </div>

                  {/* Laptop Base */}
                  <div className="mt-2 bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-3xl h-4 mx-8 shadow-xl" />

                  {/* Glow Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl -z-10"
                    animate={{
                      scale: [1, 1.15, 1],
                      opacity: [0.4, 0.7, 0.4],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center gap-2 mt-8">
                  {[
                    { label: "PDF", color: "bg-blue-500" },
                    { label: "Topic", color: "bg-purple-500" },
                    { label: "YouTube", color: "bg-red-500" },
                    { label: "Manual", color: "bg-emerald-500" },
                    { label: "AI Tutor", color: "bg-cyan-500" },
                    { label: "Battle", color: "bg-orange-500" },
                    { label: "Meet", color: "bg-green-500" },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <motion.div
                        className={`w-2 h-2 rounded-full ${item.color}`}
                        animate={{
                          scale: activeDemo === i ? 1.5 : 1,
                          opacity: activeDemo === i ? 1 : 0.3,
                        }}
                        transition={{ duration: 0.3 }}
                      />
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Product Demo Section */}
        <ProductDemo />

        {/* Features Grid */}
        <section className="py-24 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <Badge variant="gradient" size="lg" className="mb-4">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                  </motion.div>
                  Powerful Features
                </Badge>
              </motion.div>
              <motion.h2 
                className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  type: "spring",
                  stiffness: 100,
                  damping: 10,
                  delay: 0.2
                }}
              >
                {"Everything You Need to Excel".split(" ").map((word, index) => (
                  <motion.span
                    key={index}
                    className="inline-block mr-3"
                    initial={{ opacity: 0, y: 50, rotateX: -90 }}
                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.2 + index * 0.1,
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.h2>
              <motion.p 
                className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                AI-powered tools designed to make learning engaging, effective, and fun
              </motion.p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Brain,
                  title: "AI Quiz Generation",
                  description:
                    "Upload PDFs, YouTube links, or topics and watch AI create perfect quizzes in seconds",
                  color: "from-blue-500 to-cyan-500",
                  bgColor: "bg-blue-100 dark:bg-blue-900/30",
                },
                {
                  icon: Swords,
                  title: "1v1 Duel Battles",
                  description:
                    "Challenge friends in real-time quiz battles and climb the leaderboard",
                  color: "from-orange-500 to-red-500",
                  bgColor: "bg-orange-100 dark:bg-orange-900/30",
                },
                {
                  icon: Video,
                  title: "Live Group Sessions",
                  description:
                    "Join interactive sessions with video, chat, and real-time collaboration",
                  color: "from-green-500 to-emerald-500",
                  bgColor: "bg-green-100 dark:bg-green-900/30",
                },
                {
                  icon: Sparkles,
                  title: "24/7 AI Tutor",
                  description:
                    "Get instant answers to any question from your personal AI assistant",
                  color: "from-purple-500 to-pink-500",
                  bgColor: "bg-purple-100 dark:bg-purple-900/30",
                },
                {
                  icon: Award,
                  title: "Gamification & Rewards",
                  description:
                    "Earn XP, unlock achievements, and level up as you learn",
                  color: "from-yellow-500 to-orange-500",
                  bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
                },
                {
                  icon: BarChart3,
                  title: "Progress Analytics",
                  description:
                    "Track your performance with detailed insights and recommendations",
                  color: "from-indigo-500 to-purple-500",
                  bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50, rotateX: -30 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  whileHover={{ 
                    y: -10,
                    rotateY: 5,
                    transition: { duration: 0.3 }
                  }}
                >
                  <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
                    {/* Animated border gradient */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${feature.color.split(' ')[1]}, ${feature.color.split(' ')[3]})`,
                        padding: '2px',
                        borderRadius: '1rem',
                      }}
                    >
                      <div className="h-full w-full bg-white dark:bg-gray-800 rounded-[14px]" />
                    </motion.div>
                    
                    <CardContent className="p-8 relative z-10">
                      <motion.div
                        className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 relative`}
                        whileHover={{ 
                          rotate: [0, -10, 10, -10, 0],
                          scale: 1.1
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.div
                          animate={{
                            boxShadow: [
                              `0 0 20px ${feature.color.includes('blue') ? '#3b82f6' : feature.color.includes('orange') ? '#f97316' : feature.color.includes('green') ? '#10b981' : feature.color.includes('purple') ? '#a855f7' : feature.color.includes('yellow') ? '#eab308' : '#6366f1'}40`,
                              `0 0 40px ${feature.color.includes('blue') ? '#3b82f6' : feature.color.includes('orange') ? '#f97316' : feature.color.includes('green') ? '#10b981' : feature.color.includes('purple') ? '#a855f7' : feature.color.includes('yellow') ? '#eab308' : '#6366f1'}60`,
                              `0 0 20px ${feature.color.includes('blue') ? '#3b82f6' : feature.color.includes('orange') ? '#f97316' : feature.color.includes('green') ? '#10b981' : feature.color.includes('purple') ? '#a855f7' : feature.color.includes('yellow') ? '#eab308' : '#6366f1'}40`,
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 rounded-2xl"
                        />
                        <feature.icon className={`w-8 h-8 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent relative z-10`} />
                      </motion.div>
                      
                      <motion.h3 
                        className="text-2xl font-bold text-gray-900 dark:text-white mb-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                      >
                        {feature.title}
                      </motion.h3>
                      
                      <motion.p 
                        className="text-gray-600 dark:text-gray-300 leading-relaxed"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                      >
                        {feature.description}
                      </motion.p>
                    </CardContent>
                    
                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
                      initial={{ x: '-100%', skewX: -15 }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.8 }}
                    />
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison with Kahoot */}
        <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <Badge variant="gradient" size="lg" className="mb-4">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Target className="w-4 h-4 mr-2" />
                  </motion.div>
                  Why Choose Us
                </Badge>
              </motion.div>
              
              <motion.h2 
                className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                {"Cognito vs Kahoot".split(" ").map((word, index) => (
                  <motion.span
                    key={index}
                    className="inline-block mr-3"
                    initial={{ opacity: 0, y: 50, rotateX: -90 }}
                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.2 + index * 0.1,
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.h2>
              
              <motion.p 
                className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                See how we stack up against the competition
              </motion.p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Feature comparison */}
              <motion.div
                initial={{ opacity: 0, x: -50, rotateY: -30 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              >
                <Card className="border-0 shadow-xl backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
                  <CardContent className="p-0">
                    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-t-xl">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Features
                      </h3>
                    </div>
                  <div className="p-6 space-y-4">
                    {[
                      "AI Quiz Generation",
                      "1v1 Duel Mode",
                      "24/7 AI Tutor",
                      "Video Meetings",
                      "Progress Analytics",
                      "Custom Avatars",
                      "Social Features",
                      "Achievement System",
                    ].map((feature, i) => (
                      <div key={i} className="text-gray-700 dark:text-gray-300 font-medium">
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1.05 }}
                viewport={{ once: true }}
                transition={{ 
                  type: "spring", 
                  stiffness: 100, 
                  damping: 15,
                  delay: 0.2 
                }}
                whileHover={{ 
                  scale: 1.08,
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
              >
                <Card className="border-2 border-indigo-500 shadow-2xl relative overflow-hidden backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  <motion.div 
                    className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
                    initial={{ opacity: 0, y: -20, scale: 0 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      type: "spring",
                      stiffness: 200,
                      damping: 10,
                      delay: 0.4
                    }}
                    animate={{ 
                      y: [-5, 5]
                    }}
                    whileHover={{
                      scale: 1.1,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <Badge variant="gradient" className="px-6 py-2 shadow-xl">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      >
                        <Star className="w-4 h-4 mr-1" />
                      </motion.div>
                      Best Choice
                    </Badge>
                  </motion.div>
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-xl">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      Cognito
                      <Rocket className="w-5 h-5" />
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {[true, true, true, true, true, true, true, true].map((has, i) => (
                      <div key={i} className="flex items-center justify-center">
                        <Check className="w-6 h-6 text-green-500" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50, rotateY: 30 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  type: "spring", 
                  stiffness: 100, 
                  damping: 15,
                  delay: 0.4
                }}
              >
                <Card className="border-0 shadow-xl backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
                  <CardContent className="p-0">
                    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-t-xl">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Kahoot
                      </h3>
                    </div>
                  <div className="p-6 space-y-4">
                    {[false, false, false, false, true, false, false, false].map(
                      (has, i) => (
                        <div key={i} className="flex items-center justify-center">
                          {has ? (
                            <Check className="w-6 h-6 text-green-500" />
                          ) : (
                            <X className="w-6 h-6 text-red-500" />
                          )}
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 shadow-2xl overflow-hidden"
            >
              {/* Animated background elements */}
              <motion.div
                className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                animate={{
                  x: [0, 100, 0],
                  y: [0, -50, 0],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", type: "tween" }}
              />
              <motion.div
                className="absolute bottom-0 right-0 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl"
                animate={{
                  x: [0, -80, 0],
                  y: [0, 60, 0],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", type: "tween" }}
              />
              
              <div className="relative z-10">
                <motion.h2 
                  className="text-4xl md:text-5xl font-bold text-white mb-6"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  {"Ready to Transform Your Learning?".split(" ").map((word, index) => (
                    <motion.span
                      key={index}
                      className="inline-block mr-3"
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 10,
                        delay: 0.2 + index * 0.05,
                      }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.h2>
                
                <motion.p 
                  className="text-xl text-white/90 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                >
                  Join thousands of students and educators already using Cognito
                </motion.p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      asChild
                      size="lg"
                      className="relative bg-white text-indigo-600 hover:bg-gray-100 px-10 py-6 text-lg font-bold rounded-2xl shadow-xl overflow-hidden group"
                    >
                      <Link to="/signup">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                        <span className="relative z-10 flex items-center">
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          >
                            <Rocket className="w-5 h-5 mr-2" />
                          </motion.div>
                          Get Started Free
                        </span>
                      </Link>
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="relative border-2 border-white text-white hover:bg-white/10 px-10 py-6 text-lg font-bold rounded-2xl overflow-hidden group"
                    >
                      <Link to="/demo">
                        <motion.div
                          className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                        <span className="relative z-10 flex items-center">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Play className="w-5 h-5 mr-2" />
                          </motion.div>
                          Watch Demo
                        </span>
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
