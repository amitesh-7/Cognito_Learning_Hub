import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import {
  Sparkles,
  Mail,
  Lock,
  CheckCircle,
  Eye,
  EyeOff,
  Star,
  Zap,
  Users,
  ArrowRight,
  Shield,
  Brain,
  Trophy,
  Rocket,
  GraduationCap,
  BookOpen,
  Target,
  TrendingUp,
} from "lucide-react";
import Button from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { LoadingSpinner } from "../../components/ui/Loading";
import GoogleAuthButton from "../../components/GoogleAuthButton";
import RoleSelectionModal from "../../components/ui/RoleSelectionModal";
import RoleSelector from "../../components/RoleSelector";

// Animated Gradient Orb
const GradientOrb = ({ className, delay = 0 }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-30 dark:opacity-20 ${className}`}
    animate={{
      scale: [1, 1.2, 1],
      x: [0, 30, 0],
      y: [0, -20, 0],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  />
);

// Floating 3D Icon
const FloatingIcon = ({ Icon, className, delay = 0 }) => (
  <motion.div
    className={`absolute ${className}`}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.1, 1],
      y: [0, -15, 0],
      rotateY: [0, 180, 360],
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  >
    <div className="p-3 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 dark:border-white/10">
      <Icon className="w-6 h-6 text-indigo-400 dark:text-indigo-300" />
    </div>
  </motion.div>
);

// Animated Background Grid
const BackgroundGrid = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div
      className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
      }}
    />
    <motion.div
      className="absolute inset-0"
      animate={{
        backgroundPosition: ["0% 0%", "100% 100%"],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        backgroundImage:
          "radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%)",
        backgroundSize: "100% 100%",
      }}
    />
  </div>
);

// 3D Card with Tilt Effect
const TiltCard = ({ children, className }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
};

// Success Modal with Confetti
const SuccessModal = ({ title, message, onClose }) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative bg-white dark:bg-gray-900 p-10 rounded-3xl shadow-2xl text-center max-w-md mx-4 border border-gray-200 dark:border-gray-800 overflow-hidden"
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.5, opacity: 0, y: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 animate-pulse" />

        <motion.div
          className="relative z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        <motion.h2
          className="relative z-10 text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {title}
        </motion.h2>

        <motion.p
          className="relative z-10 text-gray-600 dark:text-gray-400 mb-8 text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {message}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={onClose}
            className="relative z-10 w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            Continue to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// Feature highlight cards for the left side - REAL features
const featureHighlights = [
  {
    icon: Brain,
    title: "AI Quiz Generation",
    description: "Generate quizzes from any topic or document instantly",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Trophy,
    title: "Gamified Learning",
    description: "Earn XP, unlock achievements, compete in duels",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Rocket,
    title: "Live Sessions",
    description: "Host real-time quiz sessions with instant feedback",
    gradient: "from-cyan-500 to-blue-600",
  },
];

// Platform highlights - no fake numbers
const platformHighlights = [
  { label: "100% Free", icon: Sparkles },
  { label: "AI Powered", icon: Brain },
  { label: "Real-time Duels", icon: Zap },
];

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "", role: "Student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();
  const { login, user, isAuthenticated } = useContext(AuthContext);

  // Google OAuth handlers
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError("");

      const apiUrl =
        import.meta.env.VITE_API_URL ||
        "https://quizwise-ai-server.onrender.com";

      const response = await fetch(`${apiUrl}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await response.json();

      if (response.ok) {
        const user = data.data?.user || data.user;
        const token = data.data?.accessToken || data.accessToken;

        if (!token) {
          setError("Authentication failed - no token received");
          return;
        }

        if (user.role === "Student" && data.isNewUser) {
          setPendingGoogleUser({
            token,
            user,
            userInfo: {
              name: user.name,
              email: user.email,
              picture: user.picture,
            },
          });
          setShowRoleSelection(true);
        } else {
          login(token);
          setTimeout(() => {
            if (user.role === "admin") navigate("/admin");
            else if (user.role === "Teacher") navigate("/teacher-dashboard");
            else navigate("/dashboard");
          }, 1000);
        }
      } else {
        setError(data.message || "Failed to login with Google");
      }
    } catch (error) {
      console.error("Google login error:", error);
      setError("Failed to login with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  const handleRoleSelect = async (selectedRole) => {
    try {
      const apiUrl =
        import.meta.env.VITE_API_URL ||
        "https://quizwise-ai-server.onrender.com";
      const response = await fetch(`${apiUrl}/api/auth/google/update-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pendingGoogleUser.token}`,
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.token || data.data?.accessToken;
        login(token);
        setShowRoleSelection(false);
        setPendingGoogleUser(null);
        setTimeout(() => {
          if (selectedRole === "Teacher") navigate("/teacher-dashboard");
          else navigate("/dashboard");
        }, 1000);
      } else {
        setError(data.message || "Failed to update role");
      }
    } catch (error) {
      setError("Failed to update role");
    }
  };

  const handleRoleModalClose = () => {
    setShowRoleSelection(false);
    setPendingGoogleUser(null);
    setError("");
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const API_URL = `${import.meta.env.VITE_API_URL}/api/auth/login`;
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      const token =
        data.token || data.data?.accessToken || data.message?.accessToken;
      if (!token) throw new Error("No authentication token received");

      login(token);
      setTimeout(() => setShowSuccessModal(true), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
      {/* Background Elements */}
      <BackgroundGrid />

      {/* Animated Gradient Orbs */}
      <GradientOrb
        className="w-[600px] h-[600px] -top-48 -left-48 bg-gradient-to-br from-indigo-400 to-purple-500"
        delay={0}
      />
      <GradientOrb
        className="w-[500px] h-[500px] top-1/2 -right-32 bg-gradient-to-br from-pink-400 to-rose-500"
        delay={2}
      />
      <GradientOrb
        className="w-[400px] h-[400px] -bottom-32 left-1/4 bg-gradient-to-br from-cyan-400 to-blue-500"
        delay={4}
      />

      {/* Floating Icons */}
      <FloatingIcon
        Icon={GraduationCap}
        className="top-20 left-[10%] hidden lg:block"
        delay={0}
      />
      <FloatingIcon
        Icon={BookOpen}
        className="top-40 right-[15%] hidden lg:block"
        delay={1}
      />
      <FloatingIcon
        Icon={Target}
        className="bottom-32 left-[20%] hidden lg:block"
        delay={2}
      />
      <FloatingIcon
        Icon={TrendingUp}
        className="bottom-48 right-[10%] hidden lg:block"
        delay={3}
      />

      {showSuccessModal && (
        <SuccessModal
          title="🎉 Welcome Back!"
          message="Login successful! Get ready to supercharge your learning journey."
          onClose={() => {
            setShowSuccessModal(false);
            navigate("/dashboard", { replace: true });
          }}
        />
      )}

      <RoleSelectionModal
        isOpen={showRoleSelection}
        userInfo={pendingGoogleUser?.userInfo}
        onRoleSelect={handleRoleSelect}
        onClose={handleRoleModalClose}
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 pt-24 lg:pt-20">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
          {/* Left Side - Branding & Features */}
          <motion.div
            className="hidden lg:flex flex-col w-1/2 pr-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Logo & Title */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                    Cognito
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Learning Hub
                  </p>
                </div>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
                Learn Smarter,{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Not Harder
                </span>
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
                Transform your learning experience with AI-powered quizzes,
                gamification, and real-time collaboration.
              </p>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Join thousands of students transforming their learning
                experience with AI-powered quizzes.
              </p>
            </motion.div>

            {/* Feature Highlights */}
            <div className="space-y-4">
              {featureHighlights.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="group flex items-start gap-4 p-4 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ x: 10 }}
                >
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Platform Highlights */}
            <motion.div
              className="mt-12 flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {platformHighlights.map((item, index) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full"
                >
                  <item.icon className="w-4 h-4 text-indigo-300" />
                  <span className="text-sm font-medium text-white">
                    {item.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            className="w-full lg:w-1/2 max-w-md"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <TiltCard className="perspective-1000">
              <div className="relative p-8 lg:p-10 rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl shadow-indigo-500/10 dark:shadow-indigo-500/5">
                {/* Decorative gradient border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Mobile Logo */}
                <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Cognito
                  </span>
                </div>

                {/* Form Header */}
                <div className="text-center mb-8">
                  <motion.h2
                    className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Welcome back 👋
                  </motion.h2>
                  <motion.p
                    className="text-gray-600 dark:text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Sign in to continue your learning journey
                  </motion.p>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm text-center"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Test Credentials Card */}
                <motion.div
                  className="mb-6 p-5 rounded-xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-2 border-blue-300 dark:border-blue-800 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    IIT Bombay Techfest Testing Credentials
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center p-2.5 rounded-lg bg-white/80 dark:bg-gray-800/60 border border-blue-200 dark:border-gray-700">
                      <span className="font-semibold text-gray-800 dark:text-gray-300">Teacher:</span>
                      <span className="font-mono text-gray-900 dark:text-gray-200 font-medium">teacher@cognito.com / Teacher@123</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 rounded-lg bg-white/80 dark:bg-gray-800/60 border border-purple-200 dark:border-gray-700">
                      <span className="font-semibold text-gray-800 dark:text-gray-300">Student:</span>
                      <span className="font-mono text-gray-900 dark:text-gray-200 font-medium">student@cognito.com / Student@123</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 rounded-lg bg-white/80 dark:bg-gray-800/60 border border-pink-200 dark:border-gray-700">
                      <span className="font-semibold text-gray-800 dark:text-gray-300">Admin:</span>
                      <span className="font-mono text-gray-900 dark:text-gray-200 font-medium">admin@cognito.com / Admin@123</span>
                    </div>
                  </div>
                </motion.div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div
                      className={`relative rounded-xl transition-all duration-300 ${
                        focusedField === "email"
                          ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
                          : ""
                      }`}
                    >
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        required
                        autoComplete="email"
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
                      />
                    </div>
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <div
                      className={`relative rounded-xl transition-all duration-300 ${
                        focusedField === "password"
                          ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
                          : ""
                      }`}
                    >
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        required
                        autoComplete="current-password"
                        className="w-full pl-12 pr-12 py-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </motion.div>

                  {/* Role Selection */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                  >
                    <RoleSelector
                      selectedRole={formData.role}
                      onRoleChange={(role) => setFormData({ ...formData, role })}
                    />
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="relative w-full py-4 px-6 rounded-xl font-semibold text-white overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Button gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_100%] group-hover:animate-shimmer" />

                      {/* Glow effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-xl" />
                      </div>

                      <span className="relative flex items-center justify-center gap-2">
                        {isSubmitting ? (
                          <>
                            <LoadingSpinner className="w-5 h-5" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </span>
                    </motion.button>
                  </motion.div>
                </form>

                {/* Divider */}
                <motion.div
                  className="flex items-center gap-4 my-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    or continue with
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
                </motion.div>

                {/* Google OAuth */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <GoogleAuthButton
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    text="Sign in with Google"
                    variant="outline"
                    className="w-full"
                  />
                </motion.div>

                {/* Sign Up Link */}
                <motion.p
                  className="mt-8 text-center text-gray-600 dark:text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    Sign up for free
                    <ArrowRight className="inline-block w-4 h-4 ml-1" />
                  </Link>
                </motion.p>

                {/* Security Badge */}
                <motion.div
                  className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Secured with industry-standard encryption</span>
                </motion.div>
              </div>
            </TiltCard>
          </motion.div>
        </div>
      </div>

      {/* Add shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
