import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  Check,
  X,
  Sparkles,
  Heart,
  Gift,
  Brain,
  Trophy,
  Zap,
  Users,
  Video,
  FileText,
  MessageCircle,
  Target,
  TrendingUp,
  Gamepad2,
  BookOpen,
  ArrowRight,
  Crown,
  Rocket,
  Star,
  Shield,
  Clock,
  Infinity,
} from "lucide-react";

// Animated Background
const AnimatedBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    <motion.div
      className="absolute w-[800px] h-[800px] -top-40 -right-40 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 dark:from-emerald-600/10 dark:to-cyan-600/10 rounded-full blur-3xl"
      animate={{ y: [0, -30, 0], x: [0, 20, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 10, repeat: Infinity }}
    />
    <motion.div
      className="absolute w-[600px] h-[600px] bottom-20 -left-40 bg-gradient-to-br from-violet-400/20 to-purple-400/20 dark:from-violet-600/10 dark:to-purple-600/10 rounded-full blur-3xl"
      animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
      transition={{ duration: 12, repeat: Infinity, delay: 2 }}
    />
  </div>
);

// All REAL features that are built
const cognitoFeatures = [
  { text: "AI-Powered Quiz Generation from any topic", included: true, icon: Brain },
  { text: "Upload PDF/Documents to create quizzes", included: true, icon: FileText },
  { text: "Manual Quiz Creation with full control", included: true, icon: BookOpen },
  { text: "Live Interactive Sessions with real-time sync", included: true, icon: Video },
  { text: "1v1 Real-time Duel Battles", included: true, icon: Gamepad2 },
  { text: "AI Tutor for doubt solving", included: true, icon: MessageCircle },
  { text: "XP & Leveling System", included: true, icon: TrendingUp },
  { text: "Achievements & Badges", included: true, icon: Trophy },
  { text: "Global Leaderboards", included: true, icon: Target },
  { text: "Teacher Dashboard & Analytics", included: true, icon: Users },
  { text: "Dark/Light Mode", included: true, icon: Sparkles },
  { text: "Mobile Responsive Design", included: true, icon: Zap },
];

// Comparison with Kahoot
const comparisonData = [
  { 
    feature: "Price", 
    cognito: "100% Free Forever", 
    kahoot: "Paid plans start at ₹1,500/month",
    cognitoWins: true 
  },
  { 
    feature: "AI Quiz Generation", 
    cognito: "✓ Unlimited AI generation", 
    kahoot: "✗ No AI generation",
    cognitoWins: true 
  },
  { 
    feature: "PDF/Document to Quiz", 
    cognito: "✓ Upload any document", 
    kahoot: "✗ Not available",
    cognitoWins: true 
  },
  { 
    feature: "AI Tutor/Doubt Solver", 
    cognito: "✓ 24/7 AI assistance", 
    kahoot: "✗ Not available",
    cognitoWins: true 
  },
  { 
    feature: "1v1 Duel Mode", 
    cognito: "✓ Real-time battles", 
    kahoot: "✗ Not available",
    cognitoWins: true 
  },
  { 
    feature: "XP & Leveling System", 
    cognito: "✓ Full gamification", 
    kahoot: "Limited in free tier",
    cognitoWins: true 
  },
  { 
    feature: "Live Sessions", 
    cognito: "✓ Unlimited free", 
    kahoot: "Limited to 10 players (free)",
    cognitoWins: true 
  },
  { 
    feature: "Question Types", 
    cognito: "MCQ, True/False, Multiple Answer", 
    kahoot: "Similar options",
    cognitoWins: false 
  },
  { 
    feature: "Teacher Analytics", 
    cognito: "✓ Full analytics free", 
    kahoot: "Paid feature",
    cognitoWins: true 
  },
  { 
    feature: "Open Source", 
    cognito: "✓ Fully transparent", 
    kahoot: "✗ Proprietary",
    cognitoWins: true 
  },
];

const Pricing = () => {
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-cyan-50/30 dark:from-slate-950 dark:via-emerald-950/20 dark:to-cyan-950/20 overflow-hidden">
      <AnimatedBackground />

      {/* Hero Section */}
      <section ref={heroRef} className="relative py-20 px-4">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            {/* Free Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-lg font-bold mb-8 shadow-xl shadow-emerald-500/30"
            >
              <Gift className="w-6 h-6" />
              100% FREE FOREVER
              <Heart className="w-5 h-5 fill-white" />
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              <span className="text-slate-900 dark:text-white">No Hidden Costs.</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-600 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
                No Paywalls. Ever.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-12">
              Unlike other platforms, Cognito Learning Hub is completely free. 
              All features. All users. No credit card required.
            </p>

            {/* CTA */}
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 text-white text-xl font-bold rounded-2xl shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-shadow"
              >
                <Rocket className="w-6 h-6" />
                Start Learning for Free
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="relative py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              Everything You Get{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                for Free
              </span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              All these features are built and ready to use. No premium tier. No upgrades.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cognitoFeatures.map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-emerald-200/50 dark:border-emerald-800/30 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {feature.text}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      <Check className="w-4 h-4" />
                      Included Free
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison with Kahoot */}
      <section className="relative py-20 px-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.span
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-sm font-semibold mb-6"
            >
              <Trophy className="w-4 h-4" />
              Feature Comparison
            </motion.span>

            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
              Cognito vs{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Kahoot
              </span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              See why students and teachers are switching to Cognito
            </p>
          </motion.div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
          >
            {/* Table Header */}
            <div className="grid grid-cols-3 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 p-6 border-b border-slate-200 dark:border-slate-600">
              <div className="font-bold text-slate-900 dark:text-white text-lg">Features</div>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full shadow-lg">
                  <Brain className="w-5 h-5 text-white" />
                  <span className="font-bold text-white text-base">Cognito 🚀</span>
                </div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-300 dark:bg-slate-700 rounded-full shadow-md">
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-base">Competitor</span>
                </div>
              </div>
            </div>

            {/* Table Body */}
            {comparisonData.map((row, index) => (
              <motion.div
                key={row.feature}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={`grid grid-cols-3 p-5 border-b border-slate-100 dark:border-slate-700 ${
                  row.cognitoWins ? "bg-emerald-50/80 dark:bg-emerald-900/30" : "bg-white dark:bg-slate-800/50"
                }`}
              >
                <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center text-base">
                  {row.feature}
                </div>
                <div className="text-center">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm ${
                    row.cognitoWins 
                      ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-200" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                  }`}>
                    {row.cognitoWins && <Crown className="w-4 h-4" />}
                    {row.cognito}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {row.kahoot}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">9 out of 10</span> features where Cognito wins 🏆
            </p>
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-shadow"
              >
                Try Cognito Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Why Free Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 rounded-3xl p-10 md:p-16 text-white text-center relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white blur-2xl" />
              <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-white blur-3xl" />
            </div>

            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <Heart className="w-16 h-16 mx-auto mb-6 fill-white" />
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Why Is It Free?
              </h2>
              <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-2xl mx-auto">
                We believe quality education should be accessible to everyone. 
                Cognito is built by students, for students. Our mission is to democratize 
                learning, not monetize it.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">No Ads</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">No Time Limits</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Infinity className="w-5 h-5" />
                  <span className="font-medium">No Usage Caps</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">
              Ready to Start Learning?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-10">
              Join students and teachers using Cognito every day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white text-xl font-bold rounded-2xl shadow-xl"
                >
                  <Sparkles className="w-6 h-6" />
                  Create Free Account
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

export default Pricing;
