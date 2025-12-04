import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  Heart,
  Target,
  Lightbulb,
  Users,
  Rocket,
  Code,
  GraduationCap,
  Brain,
  Sparkles,
  ArrowRight,
  Github,
  Globe,
  BookOpen,
  Trophy,
  Zap,
  Shield,
  Clock,
} from "lucide-react";

// Animated Background
const AnimatedBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    <motion.div
      className="absolute w-[800px] h-[800px] -top-40 -left-40 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 dark:from-indigo-600/10 dark:to-purple-600/10 rounded-full blur-3xl"
      animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
      transition={{ duration: 10, repeat: Infinity }}
    />
    <motion.div
      className="absolute w-[600px] h-[600px] bottom-20 -right-40 bg-gradient-to-br from-pink-400/20 to-rose-400/20 dark:from-pink-600/10 dark:to-rose-600/10 rounded-full blur-3xl"
      animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
      transition={{ duration: 12, repeat: Infinity, delay: 2 }}
    />
  </div>
);

// Core values - these are genuine project values
const coreValues = [
  {
    icon: Heart,
    title: "Free Forever",
    description: "Education should be accessible to everyone. No hidden fees, no premium tiers.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    icon: Brain,
    title: "AI-First Approach",
    description: "Leveraging cutting-edge AI to make learning personalized and efficient.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Zap,
    title: "Gamified Learning",
    description: "Making education fun with XP, levels, achievements, and competitive duels.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Shield,
    title: "Open & Transparent",
    description: "Built with transparency in mind. Open source and community-driven.",
    gradient: "from-emerald-500 to-teal-600",
  },
];

// What we've built - REAL features only
const builtFeatures = [
  {
    title: "AI Quiz Generator",
    description: "Generate quizzes from any topic using AI. Just type a subject and get a complete quiz.",
    icon: Brain,
  },
  {
    title: "PDF/Document Upload",
    description: "Upload any PDF or document and our AI extracts key concepts to create quizzes.",
    icon: BookOpen,
  },
  {
    title: "Live Sessions",
    description: "Host real-time quiz sessions with live leaderboards and instant feedback.",
    icon: Users,
  },
  {
    title: "1v1 Duel Mode",
    description: "Challenge friends to real-time quiz battles. Compete head-to-head with live scoring.",
    icon: Trophy,
  },
  {
    title: "AI Tutor",
    description: "Get instant explanations and help from our AI tutor whenever you're stuck.",
    icon: Sparkles,
  },
  {
    title: "Gamification System",
    description: "Earn XP, level up, unlock achievements, and climb the global leaderboard.",
    icon: Rocket,
  },
];

// Project timeline - actual development milestones
const projectMilestones = [
  {
    phase: "Foundation",
    title: "Core Platform Built",
    description: "User authentication, quiz creation, and basic functionality established.",
    icon: Code,
  },
  {
    phase: "AI Integration",
    title: "AI Features Added",
    description: "Integrated AI for quiz generation, document parsing, and tutoring.",
    icon: Brain,
  },
  {
    phase: "Real-time Features",
    title: "Live & Multiplayer",
    description: "Added live sessions, real-time duels, and WebSocket integration.",
    icon: Zap,
  },
  {
    phase: "Gamification",
    title: "XP & Achievements",
    description: "Full gamification with leveling system, badges, and leaderboards.",
    icon: Trophy,
  },
];

const About = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/20 dark:to-purple-950/20 overflow-hidden">
      <AnimatedBackground />

      {/* Hero Section */}
      <section ref={heroRef} className="relative py-20 px-4">
        <motion.div style={{ opacity }} className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-semibold mb-6"
            >
              <GraduationCap className="w-4 h-4" />
              Built for Students, By Students
            </motion.span>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="text-slate-900 dark:text-white">About</span>
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {" "}Cognito
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              An AI-powered learning platform that makes education accessible, 
              engaging, and completely free.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="relative py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-10 md:p-16 text-white text-center relative overflow-hidden"
          >
            {/* Decorative */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl" />
              <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white blur-3xl" />
            </div>

            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <Target className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-black mb-6">Our Mission</h2>
              <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
                To democratize education by providing a free, AI-powered learning platform 
                that makes studying engaging, effective, and accessible to every student.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              What We{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Stand For
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="relative p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl text-center"
              >
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center shadow-lg`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We've Built */}
      <section className="relative py-20 px-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Real Features, Really Built
            </motion.span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              What We've{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Built
              </span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Every feature listed here is fully functional and ready to use. No vaporware.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {builtFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Development Journey */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              Development{" "}
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Journey
              </span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 hidden md:block" />

            {projectMilestones.map((milestone, index) => (
              <motion.div
                key={milestone.phase}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative flex gap-6 mb-8"
              >
                {/* Icon */}
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  <milestone.icon className="w-8 h-8 text-white" />
                </div>
                
                {/* Content */}
                <div className="flex-1 p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    {milestone.phase}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1 mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {milestone.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="relative py-20 px-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">
              Built With Modern Tech
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-12">
              Powered by cutting-edge technologies for the best experience
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {["React", "Node.js", "MongoDB", "Socket.IO", "Tailwind CSS", "Framer Motion", "OpenAI", "Express"].map((tech, index) => (
                <motion.span
                  key={tech}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.1 }}
                  className="px-6 py-3 bg-white dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300 font-medium shadow-lg border border-slate-200 dark:border-slate-700"
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">
              Ready to Experience Cognito?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-10">
              Start learning smarter today. It's completely free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-bold rounded-2xl shadow-xl"
                >
                  <Rocket className="w-6 h-6" />
                  Get Started Free
                </motion.button>
              </Link>
              <Link to="/features">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-10 py-5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xl font-bold rounded-2xl"
                >
                  Explore Features
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
