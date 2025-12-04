import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  Mail,
  Lock,
  CheckCircle,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  Shield,
  Brain,
  Trophy,
  Rocket,
  GraduationCap,
  BookOpen,
  Target,
  TrendingUp,
  Sparkles,
  Check,
  X,
  Users,
  Star,
  Zap,
} from "lucide-react";
import { LoadingSpinner } from "../../components/ui/Loading";
import GoogleAuthButton from "../../components/GoogleAuthButton";
import RoleSelectionModal from "../../components/ui/RoleSelectionModal";

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
      <Icon className="w-6 h-6 text-purple-400 dark:text-purple-300" />
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
          linear-gradient(rgba(168, 85, 247, 0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(168, 85, 247, 0.3) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
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

// Success Modal with Celebration
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
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-indigo-500/10 animate-pulse" />
        
        {/* Confetti particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'][i % 5],
              left: `${Math.random() * 100}%`,
              top: `-10%`,
            }}
            animate={{
              y: ['0%', '1200%'],
              x: [0, (Math.random() - 0.5) * 200],
              rotate: [0, 720],
              opacity: [1, 0],
            }}
            transition={{
              duration: 2 + Math.random(),
              delay: Math.random() * 0.5,
              ease: "easeOut",
            }}
          />
        ))}
        
        <motion.div
          className="relative z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </motion.div>
        
        <motion.h2
          className="relative z-10 text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-3"
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
          <button 
            onClick={onClose} 
            className="relative z-10 w-full py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Start Learning
            <Rocket className="w-5 h-5" />
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// Password strength indicator
const PasswordStrength = ({ password }) => {
  const checks = [
    { label: "8+ characters", valid: password.length >= 8 },
    { label: "Uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "Lowercase letter", valid: /[a-z]/.test(password) },
    { label: "Number", valid: /[0-9]/.test(password) },
  ];
  
  const strength = checks.filter(c => c.valid).length;
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  
  return (
    <motion.div
      className="mt-3 space-y-3"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      {/* Strength bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i < strength ? strengthColors[strength - 1] : 'bg-gray-200 dark:bg-gray-700'
            }`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.1 }}
          />
        ))}
      </div>
      
      {/* Strength label */}
      {password.length > 0 && (
        <p className={`text-xs font-medium ${
          strength === 4 ? 'text-green-500' : 
          strength === 3 ? 'text-yellow-500' : 
          strength === 2 ? 'text-orange-500' : 'text-red-500'
        }`}>
          Password strength: {strengthLabels[strength - 1] || 'Very weak'}
        </p>
      )}
      
      {/* Checklist */}
      <div className="grid grid-cols-2 gap-2">
        {checks.map((check, i) => (
          <motion.div
            key={check.label}
            className="flex items-center gap-2 text-xs"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            {check.valid ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <X className="w-4 h-4 text-gray-300 dark:text-gray-600" />
            )}
            <span className={check.valid ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}>
              {check.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Role selection cards
const roleOptions = [
  {
    value: "Student",
    icon: GraduationCap,
    title: "Student",
    description: "Take quizzes, learn with AI, track progress",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    value: "Teacher",
    icon: BookOpen,
    title: "Teacher",
    description: "Create quizzes, manage classes, view analytics",
    gradient: "from-purple-500 to-pink-500",
  },
];

// Benefits for the left side
const benefits = [
  { icon: Brain, text: "AI-powered personalized learning" },
  { icon: Trophy, text: "Gamified quizzes with rewards" },
  { icon: TrendingUp, text: "Track your progress in real-time" },
  { icon: Users, text: "Join a community of 50K+ learners" },
];

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Student",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const navigate = useNavigate();
  const { login, user, isAuthenticated } = useContext(AuthContext);

  // Google OAuth handlers
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError("");

      const apiUrl = import.meta.env.VITE_API_URL || "https://quizwise-ai-server.onrender.com";

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

        if (data.isNewUser) {
          setPendingGoogleUser({
            token,
            user,
            userInfo: { name: user.name, email: user.email, picture: user.picture },
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
        setError(data.message || "Failed to sign up with Google");
      }
    } catch (error) {
      console.error("Google signup error:", error);
      setError("Failed to sign up with Google");
    }
  };

  const handleGoogleError = () => {
    setError("Google sign up failed. Please try again.");
  };

  const handleRoleSelect = async (selectedRole) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://quizwise-ai-server.onrender.com";
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
        setShowSuccessModal(true);
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
      const API_URL = `${import.meta.env.VITE_API_URL}/api/auth/register`;
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      const token = data.token || data.data?.accessToken || data.accessToken;
      if (!token) throw new Error("No authentication token received");
      
      login(token);
      setTimeout(() => setShowSuccessModal(true), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPasswordValid = formData.password.length >= 8 && 
    /[A-Z]/.test(formData.password) && 
    /[a-z]/.test(formData.password) && 
    /[0-9]/.test(formData.password);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950">
      {/* Background Elements */}
      <BackgroundGrid />
      
      {/* Animated Gradient Orbs */}
      <GradientOrb className="w-[600px] h-[600px] -top-48 -right-48 bg-gradient-to-br from-purple-400 to-pink-500" delay={0} />
      <GradientOrb className="w-[500px] h-[500px] top-1/2 -left-32 bg-gradient-to-br from-indigo-400 to-violet-500" delay={2} />
      <GradientOrb className="w-[400px] h-[400px] -bottom-32 right-1/4 bg-gradient-to-br from-rose-400 to-orange-500" delay={4} />
      
      {/* Floating Icons */}
      <FloatingIcon Icon={Sparkles} className="top-20 right-[10%] hidden lg:block" delay={0} />
      <FloatingIcon Icon={Zap} className="top-40 left-[15%] hidden lg:block" delay={1} />
      <FloatingIcon Icon={Star} className="bottom-32 right-[20%] hidden lg:block" delay={2} />
      <FloatingIcon Icon={Trophy} className="bottom-48 left-[10%] hidden lg:block" delay={3} />

      {showSuccessModal && (
        <SuccessModal
          title="🚀 Welcome to Cognito!"
          message="Your account has been created. Let's start your learning journey!"
          onClose={() => {
            setShowSuccessModal(false);
            if (formData.role === "Teacher") navigate("/teacher-dashboard", { replace: true });
            else navigate("/dashboard", { replace: true });
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
          
          {/* Left Side - Branding & Benefits */}
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
                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 dark:from-purple-400 dark:via-pink-400 dark:to-rose-400 bg-clip-text text-transparent">
                    Cognito
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Learning Hub</p>
                </div>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                Start Your{" "}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  Learning Journey
                </span>
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                Join thousands of students and teachers on the smartest learning platform.
              </p>
            </motion.div>

            {/* Benefits */}
            <div className="space-y-4 mb-12">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.text}
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-200 dark:border-purple-800">
                    <benefit.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{benefit.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Why Choose Cognito */}
            <motion.div
              className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-200/50 dark:border-purple-800/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">100% Free Forever</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No credit card required. No hidden fees. All features included.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - SignUp Form */}
          <motion.div
            className="w-full lg:w-1/2 max-w-md"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <TiltCard className="perspective-1000">
              <div className="relative p-8 lg:p-10 rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl shadow-purple-500/10 dark:shadow-purple-500/5">
                
                {/* Mobile Logo */}
                <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
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
                    Create an account ✨
                  </motion.h2>
                  <motion.p
                    className="text-gray-600 dark:text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Start your learning journey today
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

                {/* SignUp Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <div className={`relative rounded-xl transition-all duration-300 ${
                      focusedField === 'name' 
                        ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' 
                        : ''
                    }`}>
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        placeholder="Priyanshu Chaurasia"
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </motion.div>

                  {/* Email Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className={`relative rounded-xl transition-all duration-300 ${
                      focusedField === 'email' 
                        ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' 
                        : ''
                    }`}>
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </motion.div>

                  {/* Password Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <div className={`relative rounded-xl transition-all duration-300 ${
                      focusedField === 'password' 
                        ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900' 
                        : ''
                    }`}>
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className="w-full pl-12 pr-12 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    {/* Password Strength */}
                    <AnimatePresence>
                      {formData.password.length > 0 && (
                        <PasswordStrength password={formData.password} />
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Role Selection */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      I am a...
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {roleOptions.map((role) => (
                        <motion.button
                          key={role.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, role: role.value })}
                          className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                            formData.role === role.value
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${role.gradient} w-fit mb-2`}>
                            <role.icon className="w-5 h-5 text-white" />
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">{role.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{role.description}</p>
                          
                          {formData.role === role.value && (
                            <motion.div
                              className="absolute top-3 right-3"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <CheckCircle className="w-5 h-5 text-purple-500" />
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <motion.button
                      type="submit"
                      disabled={isSubmitting || !isPasswordValid}
                      className="relative w-full py-4 px-6 rounded-xl font-semibold text-white overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                      whileHover={{ scale: isSubmitting || !isPasswordValid ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting || !isPasswordValid ? 1 : 0.98 }}
                    >
                      {/* Button gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_100%] group-hover:animate-shimmer" />
                      
                      {/* Glow effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-xl" />
                      </div>
                      
                      <span className="relative flex items-center justify-center gap-2">
                        {isSubmitting ? (
                          <>
                            <LoadingSpinner className="w-5 h-5" />
                            Creating account...
                          </>
                        ) : (
                          <>
                            Create Account
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
                  <span className="text-sm text-gray-500 dark:text-gray-400">or continue with</span>
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
                    text="Sign up with Google"
                    variant="outline"
                    className="w-full"
                  />
                </motion.div>

                {/* Login Link */}
                <motion.p
                  className="mt-8 text-center text-gray-600 dark:text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                  >
                    Sign in
                    <ArrowRight className="inline-block w-4 h-4 ml-1" />
                  </Link>
                </motion.p>

                {/* Terms */}
                <motion.p
                  className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  By signing up, you agree to our{" "}
                  <Link to="/terms" className="underline hover:text-purple-500">Terms of Service</Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="underline hover:text-purple-500">Privacy Policy</Link>
                </motion.p>
              </div>
            </TiltCard>
          </motion.div>
        </div>
      </div>

      {/* Add shimmer animation */}
      <style jsx>{`
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
