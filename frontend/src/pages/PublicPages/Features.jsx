import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence, useInView, useSpring } from "framer-motion";
import {
  Brain,
  MessageCircle,
  Trophy,
  Users,
  FileText,
  Zap,
  Target,
  BookOpen,
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Sparkles,
  Gamepad2,
  UserCheck,
  BarChart3,
  Bot,
  Award,
  Mic,
  Volume2,
  ChevronDown,
  Rocket,
  Shield,
  Globe,
  Heart,
  Clock,
  TrendingUp,
  Layers,
  MousePointer2,
} from "lucide-react";

// Magnetic Button Component
const MagneticButton = ({ children, className = "", ...props }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current?.getBoundingClientRect() || {};
    const x = (clientX - (left + width / 2)) * 0.3;
    const y = (clientY - (top + height / 2)) * 0.3;
    setPosition({ x, y });
  };

  const reset = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 350, damping: 15 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (isInView) {
      const num = parseInt(value.replace(/[^0-9]/g, ""));
      const step = num / (duration * 60);
      let current = 0;
      const timer = setInterval(() => {
        current += step;
        if (current >= num) {
          setCount(num);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, 1000 / 60);
      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {value.includes("+") && "+"}
      {value.includes("M") && "M"}
      {value.includes("K") && "K"}
    </span>
  );
};

// Floating Orb Component
const FloatingOrb = ({ className, delay = 0 }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl ${className}`}
    animate={{
      y: [0, -30, 0],
      x: [0, 20, 0],
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  />
);

// Feature Card with 3D Tilt Effect
const FeatureCard3D = ({ feature, index, isActive, onClick }) => {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX((y - centerY) / 15);
    setRotateY((centerX - x) / 15);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: "preserve-3d",
      }}
      className={`relative group cursor-pointer transition-all duration-500 ${
        isActive ? "scale-105 z-10" : "hover:scale-102"
      }`}
    >
      {/* Glow Effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 ${isActive ? "opacity-60" : ""}`} />
      
      {/* Card Content */}
      <div className={`relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-8 border-2 transition-all duration-500 ${
        isActive 
          ? "border-transparent shadow-2xl" 
          : "border-white/20 dark:border-slate-700/50 shadow-xl hover:shadow-2xl"
      }`}>
        {/* Icon Container */}
        <motion.div 
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg`}
          style={{ transform: "translateZ(30px)" }}
          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          <feature.icon className="w-8 h-8 text-white" />
        </motion.div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:bg-gradient-to-r group-hover:from-violet-600 group-hover:to-fuchsia-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
          {feature.title}
        </h3>

        {/* Subtitle */}
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          {feature.subtitle}
        </p>

        {/* Highlights Preview */}
        <div className="space-y-2">
          {feature.highlights.slice(0, 3).map((highlight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
            >
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>{highlight}</span>
            </motion.div>
          ))}
        </div>

        {/* Learn More */}
        <motion.div 
          className="mt-6 flex items-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-400"
          whileHover={{ x: 5 }}
        >
          <span>Learn more</span>
          <ArrowRight className="w-4 h-4" />
        </motion.div>

        {/* Active Indicator */}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute inset-0 rounded-3xl border-2 border-violet-500 dark:border-violet-400"
            initial={false}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </div>
    </motion.div>
  );
};

// Parallax Section Component
const ParallaxSection = ({ children, offset = 50 }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  
  return (
    <motion.div ref={ref} style={{ y }}>
      {children}
    </motion.div>
  );
};

const Features = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [hoveredStat, setHoveredStat] = useState(null);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const features = [
    {
      id: "ai-quiz-generator",
      title: "AI Quiz Generation",
      subtitle: "Create quizzes in seconds with AI",
      description: "Transform any topic into comprehensive quizzes instantly. Upload PDFs, paste text, or simply describe what you want to learn.",
      icon: Sparkles,
      gradient: "from-blue-500 via-indigo-500 to-violet-500",
      highlights: [
        "Generate from any topic instantly",
        "Upload PDF/text files for auto-generation",
        "Multiple question types supported",
        "Adaptive difficulty adjustment",
        "Automatic grading and feedback",
        "Export and share capabilities",
      ],
    },
    {
      id: "1v1-duel",
      title: "1v1 Duel Battle",
      subtitle: "Real-time competitive learning",
      description: "Challenge friends in exciting quiz battles. Real-time scoring, live competition, and bragging rights!",
      icon: Gamepad2,
      gradient: "from-red-500 via-orange-500 to-amber-500",
      highlights: [
        "Real-time 1v1 quiz battles",
        "Challenge friends or random opponents",
        "Live scoring and competition",
        "Winner rankings and history",
        "Earn rewards and achievements",
        "Time-based challenges",
      ],
    },
    {
      id: "live-multiplayer",
      title: "Live Multiplayer",
      subtitle: "Host interactive quiz sessions",
      description: "Create live quiz sessions with unique codes. Perfect for classrooms, events, and group learning.",
      icon: Users,
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      highlights: [
        "Host with unique 6-digit codes",
        "Real-time participant tracking",
        "Live leaderboard updates",
        "Support for large groups",
        "Session recording and analytics",
        "Interactive gameplay features",
      ],
    },
    {
      id: "adaptive-difficulty",
      title: "Adaptive AI Difficulty",
      subtitle: "Personalized learning paths",
      description: "AI that learns how you learn. Questions adapt to your skill level for optimal challenge and growth.",
      icon: Target,
      gradient: "from-purple-500 via-violet-500 to-fuchsia-500",
      highlights: [
        "AI-powered difficulty adjustment",
        "Performance-based question selection",
        "Personalized learning paths",
        "Progress tracking and analytics",
        "Optimal challenge maintenance",
        "Smart recommendations",
      ],
    },
    {
      id: "ai-chatbot",
      title: "AI Doubt Solver",
      subtitle: "24/7 intelligent assistant",
      description: "Get instant answers to any question. Our AI tutor is always ready to help you understand complex concepts.",
      icon: Bot,
      gradient: "from-pink-500 via-rose-500 to-red-500",
      highlights: [
        "Instant doubt resolution",
        "Natural language understanding",
        "Subject-specific expertise",
        "24/7 availability",
        "Contextual learning support",
        "Step-by-step explanations",
      ],
    },
    {
      id: "speech-questions",
      title: "Voice-Enabled Learning",
      subtitle: "Hands-free quiz experience",
      description: "Answer questions using your voice. Text-to-speech and speech recognition for accessible learning.",
      icon: Mic,
      gradient: "from-amber-500 via-yellow-500 to-lime-500",
      highlights: [
        "Text-to-speech for all questions",
        "Voice-based answer input",
        "Accessibility-first design",
        "Mobile-optimized experience",
        "Multiple language support",
        "Pronunciation feedback",
      ],
    },
    {
      id: "gamification",
      title: "Gamified Experience",
      subtitle: "Learn through play",
      description: "Earn XP, unlock achievements, climb leaderboards. Transform learning into an engaging game.",
      icon: Trophy,
      gradient: "from-yellow-500 via-orange-500 to-red-500",
      highlights: [
        "XP and leveling system",
        "Achievement badges",
        "Daily streaks and rewards",
        "Global leaderboards",
        "Challenge friends",
        "Seasonal events",
      ],
    },
    {
      id: "analytics",
      title: "Advanced Analytics",
      subtitle: "Data-driven insights",
      description: "Track your progress with detailed analytics. Identify strengths, weaknesses, and optimize your learning.",
      icon: BarChart3,
      gradient: "from-indigo-500 via-blue-500 to-cyan-500",
      highlights: [
        "Performance analytics",
        "Progress tracking",
        "Weak area identification",
        "Study time analysis",
        "Improvement suggestions",
        "Detailed reports",
      ],
    },
  ];

  const stats = [
    { value: "50000+", label: "Active Learners", icon: Users, color: "from-blue-500 to-cyan-500" },
    { value: "100000+", label: "Quizzes Created", icon: FileText, color: "from-violet-500 to-purple-500" },
    { value: "5M+", label: "Questions Answered", icon: CheckCircle, color: "from-emerald-500 to-teal-500" },
    { value: "99.9%", label: "Uptime", icon: Zap, color: "from-amber-500 to-orange-500" },
  ];

  const userRoles = [
    {
      role: "Students",
      icon: BookOpen,
      color: "from-blue-500 to-indigo-500",
      features: ["AI Quiz Generation", "1v1 Battles", "AI Tutor", "Achievements"],
      description: "Comprehensive learning with AI assistance and gamification",
    },
    {
      role: "Teachers",
      icon: UserCheck,
      color: "from-emerald-500 to-teal-500",
      features: ["Session Hosting", "Analytics Dashboard", "Student Tracking", "Custom Quizzes"],
      description: "Powerful tools for engaging and monitoring students",
    },
    {
      role: "Institutions",
      icon: Shield,
      color: "from-purple-500 to-violet-500",
      features: ["Admin Controls", "Bulk Management", "Custom Branding", "API Access"],
      description: "Enterprise-grade solutions for educational organizations",
    },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/30 dark:from-slate-950 dark:via-violet-950/20 dark:to-fuchsia-950/20 overflow-hidden">
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Floating Orbs Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <FloatingOrb className="w-[600px] h-[600px] -top-40 -right-40 bg-violet-400/20 dark:bg-violet-600/10" delay={0} />
        <FloatingOrb className="w-[500px] h-[500px] top-1/3 -left-40 bg-fuchsia-400/20 dark:bg-fuchsia-600/10" delay={2} />
        <FloatingOrb className="w-[400px] h-[400px] bottom-20 right-1/4 bg-blue-400/20 dark:bg-blue-600/10" delay={4} />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-violet-200/50 dark:border-violet-700/50 shadow-lg shadow-violet-500/10 mb-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-violet-500" />
            </motion.div>
            <span className="text-sm font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Powered by Advanced AI Technology
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight"
          >
            <span className="text-slate-900 dark:text-white">Features that</span>
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
              Transform Learning
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Discover our comprehensive suite of AI-powered tools designed to make learning 
            <span className="text-violet-600 dark:text-violet-400 font-semibold"> engaging</span>, 
            <span className="text-fuchsia-600 dark:text-fuchsia-400 font-semibold"> effective</span>, and 
            <span className="text-pink-600 dark:text-pink-400 font-semibold"> fun</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 mb-16"
          >
            <Link to="/signup">
              <MagneticButton className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 rounded-2xl text-white font-bold text-lg shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transition-all duration-300 overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  Get Started Free
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-pink-500 to-violet-600"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </MagneticButton>
            </Link>
            <MagneticButton className="group px-8 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl text-slate-900 dark:text-white font-bold text-lg border-2 border-slate-200 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-400 shadow-xl hover:shadow-2xl transition-all duration-300">
              <span className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Watch Demo
              </span>
            </MagneticButton>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-sm text-slate-500 dark:text-slate-400">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown className="w-6 h-6 text-violet-500" />
            </motion.div>
          </motion.div>
        </div>

        {/* Hero Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <ParallaxSection offset={30}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onHoverStart={() => setHoveredStat(index)}
                  onHoverEnd={() => setHoveredStat(null)}
                  className="relative group"
                >
                  {/* Glow */}
                  <div className={`absolute -inset-1 bg-gradient-to-r ${stat.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
                  
                  {/* Card */}
                  <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-8 border border-white/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 text-center">
                    <motion.div
                      animate={{ 
                        scale: hoveredStat === index ? 1.2 : 1,
                        rotate: hoveredStat === index ? [0, -10, 10, 0] : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} mb-4 shadow-lg`}
                    >
                      <stat.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <div className="text-4xl font-black bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
                      <AnimatedCounter value={stat.value} />
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 font-medium">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ParallaxSection>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span 
              className="inline-block px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-sm font-semibold mb-4"
              whileHover={{ scale: 1.05 }}
            >
              Powerful Features
            </motion.span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6">
              Everything You Need to
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                Excel in Learning
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              From AI-powered quiz generation to real-time multiplayer battles, we've got you covered.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard3D
                key={feature.id}
                feature={feature}
                index={index}
                isActive={activeFeature === index}
                onClick={() => setActiveFeature(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Feature Spotlight Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {/* Background Glow */}
              <div className={`absolute -inset-4 bg-gradient-to-r ${features[activeFeature].gradient} rounded-[3rem] blur-3xl opacity-20`} />
              
              {/* Content Card */}
              <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden border border-white/50 dark:border-slate-700/50 shadow-2xl">
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Text Content */}
                  <div className="p-12 lg:p-16">
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-4 mb-8"
                    >
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${features[activeFeature].gradient} flex items-center justify-center shadow-xl`}>
                        {React.createElement(features[activeFeature].icon, {
                          className: "w-8 h-8 text-white",
                        })}
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                          {features[activeFeature].title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400">
                          {features[activeFeature].subtitle}
                        </p>
                      </div>
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed"
                    >
                      {features[activeFeature].description}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="grid sm:grid-cols-2 gap-4 mb-8"
                    >
                      {features[activeFeature].highlights.map((highlight, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.05 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                        >
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-200 text-sm">
                            {highlight}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Link to="/signup">
                        <MagneticButton className={`inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r ${features[activeFeature].gradient} text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300`}>
                          <span>Try {features[activeFeature].title}</span>
                          <ArrowRight className="w-5 h-5" />
                        </MagneticButton>
                      </Link>
                    </motion.div>
                  </div>

                  {/* Visual Side */}
                  <div className={`relative bg-gradient-to-br ${features[activeFeature].gradient} p-12 lg:p-16 flex items-center justify-center min-h-[400px]`}>
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                        backgroundSize: "40px 40px",
                      }} />
                    </div>
                    
                    {/* Feature Icon Large */}
                    <motion.div
                      animate={{ 
                        y: [0, -20, 0],
                        rotateY: [0, 10, 0],
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl scale-150" />
                      {React.createElement(features[activeFeature].icon, {
                        className: "relative w-40 h-40 text-white/90 drop-shadow-2xl",
                      })}
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-4">
              For Everyone
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6">
              Designed for
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                {" "}Every Role
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {userRoles.map((role, index) => (
              <motion.div
                key={role.role}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group relative"
              >
                {/* Glow */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${role.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
                
                {/* Card */}
                <div className="relative h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-8 border border-white/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-500">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <role.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    {role.role}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    {role.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {role.features.map((feature, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 mb-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-[3rem] blur-3xl opacity-30" />
            
            {/* Card */}
            <div className="relative bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 rounded-[2.5rem] p-12 lg:p-16 overflow-hidden">
              {/* Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: "32px 32px",
                }} />
              </div>
              
              {/* Content */}
              <div className="relative text-center text-white">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="inline-block mb-6"
                >
                  <Sparkles className="w-12 h-12" />
                </motion.div>
                
                <h2 className="text-4xl md:text-5xl font-black mb-6">
                  Ready to Transform Your Learning?
                </h2>
                <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  Join thousands of learners already using Cognito Learning Hub to achieve their goals.
                </p>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/signup">
                    <MagneticButton className="px-8 py-4 bg-white rounded-2xl text-violet-600 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                      <span className="flex items-center gap-2">
                        Start Learning Free
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </MagneticButton>
                  </Link>
                  <Link to="/contact">
                    <MagneticButton className="px-8 py-4 bg-white/10 backdrop-blur-xl rounded-2xl text-white font-bold text-lg border border-white/30 hover:bg-white/20 transition-all duration-300">
                      Contact Us
                    </MagneticButton>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Features;
