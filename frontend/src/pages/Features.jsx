import React, { useState } from "react";
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
  Download,
  Upload,
  Settings,
  Shield,
  Lightbulb,
  Sparkles,
  Gamepad2,
  UserCheck,
  Clock,
  BarChart3,
  PenTool,
  Bot,
  HelpCircle,
  Award,
  Globe,
  Palette,
  Swords,
  Mic,
  Volume2,
} from "lucide-react";

const Features = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      id: "ai-quiz-generator",
      title: "AI Quiz Generation",
      subtitle: "Smart Quiz Creation in Seconds",
      description:
        "Create comprehensive quizzes instantly using AI. Generate from topics, upload PDFs, or create manually. Our AI analyzes content and creates relevant questions automatically.",
      icon: Sparkles,
      color: "from-blue-500 to-indigo-500",
      highlights: [
        "Generate from any topic instantly",
        "Upload PDF/text files for auto-generation",
        "Manual quiz creation with flexible options",
        "Multiple question types (MCQ, True/False, Fill-in-blanks)",
        "Adaptive difficulty adjustment",
        "Automatic grading and feedback",
      ],
      demo: 'Create a quiz on "Quantum Physics" or upload your study material for instant quiz generation',
    },
    {
      id: "1v1-duel",
      title: "1v1 Duel Battle Mode",
      subtitle: "Real-time Competitive Learning",
      description:
        "Challenge your friends or random opponents in exciting 1v1 quiz battles! Real-time competitive gameplay with instant scoring and dynamic leaderboards.",
      icon: Gamepad2,
      color: "from-red-500 to-orange-500",
      highlights: [
        "Real-time 1v1 quiz battles",
        "Challenge friends or find random opponents",
        "Live scoring and competition tracking",
        "Time-based challenges for extra excitement",
        "Winner rankings and battle history",
        "Earn rewards and achievements",
      ],
      demo: "Challenge your friends to a quiz battle and prove your knowledge supremacy!",
    },
    {
      id: "live-multiplayer",
      title: "Live Multiplayer Quizzes",
      subtitle: "Host Interactive Quiz Sessions",
      description:
        "Host live quiz sessions with multiple participants. Use 6-digit codes for instant joining, real-time leaderboards, and interactive gameplay with Socket.IO technology.",
      icon: Users,
      color: "from-green-500 to-emerald-500",
      highlights: [
        "Host live sessions with unique 6-digit codes",
        "Real-time participant tracking",
        "Live leaderboard updates",
        "Interactive gameplay with instant feedback",
        "Support for large groups",
        "Session recording and analytics",
      ],
      demo: "Create a live session, share the code, and watch as participants join in real-time!",
    },
    {
      id: "adaptive-difficulty",
      title: "Adaptive AI Difficulty",
      subtitle: "Personalized Learning Experience",
      description:
        "Our AI adapts quiz difficulty based on your performance. Get questions that match your skill level for optimal learning and continuous improvement.",
      icon: Target,
      color: "from-purple-500 to-violet-500",
      highlights: [
        "AI-powered difficulty adjustment",
        "Performance-based question selection",
        "Personalized learning paths",
        "Smart question distribution",
        "Progress tracking and analytics",
        "Optimal challenge level maintenance",
      ],
      demo: "Experience questions that adapt to your skill level for maximum learning efficiency",
    },
    {
      id: "ai-chatbot",
      title: "AI Doubt Solver",
      subtitle: "Intelligent Learning Assistant",
      description:
        "Get instant answers to your questions with our advanced AI chatbot. Powered by cutting-edge AI technology to help you understand complex concepts.",
      icon: Bot,
      color: "from-purple-500 to-pink-500",
      highlights: [
        "Instant doubt resolution",
        "Natural language processing",
        "Subject-specific expertise",
        "24/7 availability",
        "Contextual learning support",
      ],
      demo: 'Ask questions like "Explain photosynthesis" or "How to solve quadratic equations"',
    },
    {
      id: "speech-questions",
      title: "Speech-Based Questions",
      subtitle: "Voice-Enabled Learning",
      description:
        "Answer quiz questions using your voice. Text-to-speech and speech recognition for hands-free learning.",
      icon: Mic,
      color: "from-yellow-500 to-pink-500",
      highlights: [
        "Text-to-speech for all questions",
        "Speech recognition answers",
        "Accessible learning",
        "Mobile-friendly",
      ],
      demo: "Try answering a quiz question by speaking instead of typing.",
    },
    {
      id: "chat-system",
      title: "Real-time Chat System",
      subtitle: "Connect with Friends & Teachers",
      description:
        "Seamless communication platform with real-time messaging, online status, and smart features for collaborative learning.",
      icon: MessageCircle,
      color: "from-blue-500 to-cyan-500",
      highlights: [
        "Real-time messaging",
        "Online/offline status indicators",
        "Friend management system",
        "Teacher community access",
        "Group study chats",
        "File sharing capabilities",
      ],
      demo: "Chat with friends, share study materials, and discuss topics in real-time",
    },
    {
      id: "leaderboard",
      title: "Global Leaderboard",
      subtitle: "Compete & Excel",
      description:
        "Track your progress and compete with peers on our dynamic leaderboard system. Gamify your learning experience.",
      icon: Trophy,
      color: "from-yellow-500 to-orange-500",
      highlights: [
        "Real-time rankings",
        "Subject-wise leaderboards",
        "Achievement badges",
        "Progress tracking",
        "Monthly challenges",
        "Reward system",
      ],
      demo: "Climb the ranks by completing quizzes and challenges",
    },
    {
      id: "friend-challenges",
      title: "Friend Challenges",
      subtitle: "Social Learning Made Fun",
      description:
        "Challenge your friends to quizzes and compete in a fun, educational environment. Make learning social and engaging.",
      icon: Users,
      color: "from-green-500 to-teal-500",
      highlights: [
        "Custom quiz challenges",
        "Friend vs friend battles",
        "Challenge history tracking",
        "Performance comparisons",
        "Streak counters",
        "Achievement sharing",
      ],
      demo: "Send quiz challenges to friends and see who scores higher!",
    },
    {
      id: "analytics",
      title: "Advanced Analytics",
      subtitle: "Data-Driven Insights",
      description:
        "Comprehensive analytics and reporting system to track learning progress, identify weak areas, and optimize study patterns.",
      icon: BarChart3,
      color: "from-violet-500 to-purple-500",
      highlights: [
        "Performance analytics",
        "Progress tracking",
        "Weak area identification",
        "Study time analysis",
        "Improvement suggestions",
        "Detailed reports",
      ],
      demo: "View detailed insights about your learning journey",
    },
    {
      id: "achievements",
      title: "Achievements & Rewards",
      subtitle: "Gamified Learning Experience",
      description:
        "Earn badges, achievements, and rewards as you progress. Track your accomplishments and unlock special features.",
      icon: Award,
      color: "from-amber-500 to-yellow-500",
      highlights: [
        "Achievement badges system",
        "Streak tracking",
        "Milestone rewards",
        "Performance-based unlocks",
        "Leaderboard rankings",
        "Special recognition badges",
      ],
      demo: "Complete challenges and earn achievements to showcase your learning journey",
    },
  ];

  const userRoles = [
    {
      role: "Students",
      icon: BookOpen,
      features: [
        "AI Quiz Generation",
        "1v1 Duel Battles",
        "Live Multiplayer Quizzes",
        "AI Doubt Solver",
        "Friend Challenges",
        "Leaderboard & Achievements",
        "Chat System",
        "Adaptive Learning",
      ],
      description:
        "Comprehensive learning platform with AI assistance, competitive gaming, and social features",
    },
    {
      role: "Teachers",
      icon: UserCheck,
      features: [
        "AI-Powered Quiz Creation",
        "Live Session Hosting",
        "Student Analytics Dashboard",
        "Performance Tracking",
        "Community Management",
        "PDF Quiz Generator",
        "Custom Question Banks",
      ],
      description:
        "Advanced tools for educators to create, manage, and track student progress with AI assistance",
    },
    {
      role: "Administrators",
      icon: Shield,
      features: [
        "User Management",
        "Content Moderation",
        "System Analytics",
        "Broadcast Messages",
        "Quiz Monitoring",
        "Battle System Control",
        "Platform Statistics",
      ],
      description:
        "Complete platform control with administrative tools, oversight, and advanced analytics",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Active Users", icon: Users },
    { number: "50,000+", label: "Quizzes Created", icon: FileText },
    { number: "1M+", label: "Questions Answered", icon: CheckCircle },
    { number: "25,000+", label: "1v1 Battles Played", icon: Gamepad2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-400/5 dark:to-purple-400/5"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Powered by Advanced AI Technology
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Cognito Learning Hub Features
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
            Discover the comprehensive suite of features that make QuizWise-AI
            the ultimate platform for
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              {" "}
              intelligent learning
            </span>
            ,
            <span className="text-purple-600 dark:text-purple-400 font-semibold">
              {" "}
              social collaboration
            </span>
            , and
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
              {" "}
              academic excellence
            </span>
            .
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2">
              <Play className="w-5 h-5" />
              Explore Features
            </button>
            <button className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white/50 dark:bg-gray-800 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-6">
              Powerful Features for
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Every Learner
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Explore our comprehensive feature set designed to transform your
              learning experience
            </p>
          </div>

          {/* Feature Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {features.map((feature, index) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(index)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeFeature === index
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <feature.icon className="w-5 h-5" />
                {feature.title}
              </button>
            ))}
          </div>

          {/* Active Feature Display */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Content Side */}
              <div className="p-12">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`p-4 rounded-2xl bg-gradient-to-r ${features[activeFeature].color}`}
                  >
                    {React.createElement(features[activeFeature].icon, {
                      className: "w-8 h-8 text-white",
                    })}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-800 dark:text-white">
                      {features[activeFeature].title}
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      {features[activeFeature].subtitle}
                    </p>
                  </div>
                </div>

                <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                  {features[activeFeature].description}
                </p>

                <div className="space-y-4 mb-8">
                  {features[activeFeature].highlights.map(
                    (highlight, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {highlight}
                        </span>
                      </div>
                    )
                  )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold text-gray-800 dark:text-white">
                      Try it out:
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 italic">
                    {features[activeFeature].demo}
                  </p>
                </div>
              </div>

              {/* Visual Side */}
              <div
                className={`bg-gradient-to-br ${features[activeFeature].color} p-12 flex items-center justify-center`}
              >
                <div className="text-center text-white">
                  {React.createElement(features[activeFeature].icon, {
                    className: "w-32 h-32 mx-auto mb-6 opacity-80",
                  })}
                  <h4 className="text-2xl font-bold mb-4">
                    {features[activeFeature].title}
                  </h4>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                    <p className="text-lg opacity-90">
                      Experience the power of{" "}
                      {features[activeFeature].title.toLowerCase()}
                      in QuizWise-AI's comprehensive learning platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-6">
              Designed for
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Everyone
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Whether you're a student, teacher, or administrator, QuizWise-AI
              has features tailored for you
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {userRoles.map((role, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <role.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                    {role.role}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {role.description}
                  </p>
                </div>

                <div className="space-y-3">
                  {role.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2">
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-6">
            Built with
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Cutting-Edge Technology
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12">
            QuizWise-AI leverages the latest technologies to deliver a seamless
            and powerful learning experience
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              { name: "React", color: "from-blue-400 to-blue-600" },
              { name: "Node.js", color: "from-green-400 to-green-600" },
              { name: "MongoDB", color: "from-green-500 to-emerald-600" },
              { name: "AI/ML", color: "from-purple-400 to-purple-600" },
              { name: "Tailwind", color: "from-cyan-400 to-cyan-600" },
              { name: "Express", color: "from-gray-400 to-gray-600" },
            ].map((tech, index) => (
              <div key={index} className="group">
                <div
                  className={`h-24 w-24 mx-auto rounded-2xl bg-gradient-to-r ${tech.color} flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  {tech.name.slice(0, 2)}
                </div>
                <p className="mt-3 font-medium text-gray-700 dark:text-gray-300">
                  {tech.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join thousands of students and educators who are already
            experiencing the power of AI-driven learning
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Start Learning Now
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
