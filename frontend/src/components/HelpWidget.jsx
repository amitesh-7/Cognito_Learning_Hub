import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HelpCircle, X, Send, Search, Book, Zap, MessageCircle, 
  ChevronRight, Minimize2, Maximize2, Volume2, Sparkles, Bot,
  User, Clock, CheckCircle2, Play, Users, Trophy, Brain, 
  Video, Gamepad2, Target, Shield, Award, TrendingUp, FileText
} from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

/**
 * Advanced Help Widget with Chat Interface
 * Comprehensive knowledge base scraped from entire Cognito platform
 * Renders via Portal to ensure it's always on top
 */
export default function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeView, setActiveView] = useState("home"); // home, chat, docs
  const [searchQuery, setSearchQuery] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Global keyboard shortcut: Alt+H
  useEffect(() => {
    const handleKeyboard = (e) => {
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    // Listen for custom event from navbar
    const handleOpenHelp = () => {
      setIsOpen(true);
    };

    window.addEventListener('keydown', handleKeyboard);
    window.addEventListener('openHelpWidget', handleOpenHelp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyboard);
      window.removeEventListener('openHelpWidget', handleOpenHelp);
    };
  }, [isOpen]);

  // Comprehensive knowledge base - Platform features scraped from entire system
  const knowledgeBase = {
    "getting-started": [
      {
        id: 1,
        question: "How do I create my first quiz?",
        answer: "Navigate to Dashboard → Click 'Create Quiz' button → Choose between 'AI Generate' (smart creation using AI) or 'Manual' (create questions yourself) → For AI: Enter a topic, paste text, upload document (PDF/Word), or paste YouTube URL → Set difficulty and question count → Click 'Generate' → Review and edit questions → Click 'Save & Publish'. Your quiz is now live!",
        category: "Getting Started",
        icon: Play,
        tags: ["quiz", "create", "ai", "manual"]
      },
      {
        id: 2,
        question: "How do I take a quiz?",
        answer: "Go to 'Browse Quizzes' page → Use filters to find quizzes by subject, difficulty, or popularity → Click on any quiz card to view details → Click 'Start Quiz' button → Read and answer questions one by one → Use number keys (1-4) for quick selection → Submit answers → View your score, earn XP, and see detailed explanations!",
        category: "Getting Started",
        icon: Target,
        tags: ["quiz", "take", "practice", "test"]
      },
      {
        id: 3,
        question: "What is the difference between Student and Teacher accounts?",
        answer: "**Students**: Take quizzes, compete in 1v1 battles, join live sessions, earn XP/achievements, track progress, use AI tutor, customize avatar. **Teachers**: All student features PLUS create quizzes, host live quiz sessions, access detailed analytics, view student performance, manage classes, export results, moderate content.",
        category: "Getting Started",
        icon: Users,
        tags: ["account", "role", "student", "teacher"]
      },
      {
        id: 4,
        question: "What are the main features of Cognito Learning Hub?",
        answer: "🎯 **Core Features**: AI Quiz Generation | Manual Quiz Creation | Browse & Take Quizzes | 1v1 Duel Battles | Live Quiz Sessions | Video Meetings | AI Tutor (24/7) | Gamification System (XP, Levels, Achievements) | Leaderboards | Avatar Customization | Social Features | Accessibility Mode | Real-time Analytics | Multi-language Support",
        category: "Getting Started",
        icon: Sparkles,
        tags: ["features", "overview", "capabilities"]
      }
    ],
    
    "quiz-creation": [
      {
        id: 10,
        question: "How does AI quiz generation work?",
        answer: "Cognito uses **Google Gemini AI** to analyze your content. Process: 1) Input text/document/YouTube URL 2) AI processes and identifies key concepts 3) Generates relevant multiple-choice questions 4) Creates plausible distractors 5) Adds explanations for each answer. You can set difficulty (Easy/Medium/Hard) and question count (5-30). The AI understands context and creates meaningful questions.",
        category: "Quiz Creation",
        icon: Brain,
        tags: ["ai", "generate", "gemini", "automatic"]
      },
      {
        id: 11,
        question: "What file formats can I upload for AI quiz generation?",
        answer: "Supported formats: **PDF** (.pdf) | **Word Documents** (.docx, .doc) | **Text Files** (.txt) | **YouTube URLs** (automatically transcribes video) | **Plain Text** (paste directly). Maximum file size: 10MB. For YouTube: Video must have captions enabled. AI extracts text and generates questions automatically.",
        category: "Quiz Creation",
        icon: FileText,
        tags: ["upload", "file", "pdf", "youtube", "document"]
      },
      {
        id: 12,
        question: "How do I manually create quiz questions?",
        answer: "Click 'Manual Quiz Creator' → Enter quiz title and description → Add questions one by one: Type question text → Add 4 answer options → Mark correct answer → Add explanation (optional) → Set points (1-10) → Set time limit per question. Use the preview button to test your quiz before publishing. You can drag to reorder questions.",
        category: "Quiz Creation",
        icon: FileText,
        tags: ["manual", "create", "questions", "custom"]
      },
      {
        id: 13,
        question: "Can I edit a quiz after publishing?",
        answer: "Yes! Go to 'My Quizzes' → Click quiz card → Click 'Edit' button → Modify questions, answers, settings → Click 'Save Changes'. Note: If students have already attempted the quiz, their results remain unchanged. You can also unpublish, duplicate, or delete quizzes from this menu.",
        category: "Quiz Creation",
        icon: FileText,
        tags: ["edit", "modify", "update", "change"]
      }
    ],

    "competitive-modes": [
      {
        id: 20,
        question: "How do 1v1 Duel Battles work?",
        answer: "**Challenge Mode**: Dashboard → 'Duel Battle' → 'Challenge Friend' → Select quiz → Generate room code → Share code with friend → Both join and compete simultaneously on same questions! **Quick Match**: Click 'Quick Match' for random opponent matching. Features: Real-time scoring | Speed bonuses | Live opponent status | Winner gets bonus XP | Both see results at end.",
        category: "Competitive Modes",
        icon: Gamepad2,
        tags: ["duel", "battle", "1v1", "compete", "pvp"]
      },
      {
        id: 21,
        question: "How do I join a live quiz session?",
        answer: "Teacher creates session → Shares room code (6-digit) → You enter code at 'Join Live Session' page → Wait for teacher to start → Answer questions in real-time → See your rank on live leaderboard → Results shown after each question. Perfect for classroom quizzes! Teacher controls when questions appear.",
        category: "Competitive Modes",
        icon: Play,
        tags: ["live", "session", "join", "classroom", "real-time"]
      },
      {
        id: 22,
        question: "How do I host a live quiz session (Teachers)?",
        answer: "Create/select quiz → Click 'Host Live Session' → System generates room code → Share code with students → Monitor join count → Click 'Start Session' → Questions appear one-by-one → View real-time responses → Show leaderboard → End session → Export results as CSV. Control pacing perfectly!",
        category: "Competitive Modes",
        icon: Users,
        tags: ["host", "live", "teacher", "session", "classroom"]
      }
    ],

    "gamification": [
      {
        id: 30,
        question: "How does the XP and leveling system work?",
        answer: "Earn XP from: Quiz completion (50-200 XP) | Correct answers (10 XP each) | Speed bonuses (max 50 XP) | First attempt bonus (25 XP) | Streaks (daily: 10 XP, weekly: 50 XP) | Achievements (varies). Level up every 1000 XP. Higher levels unlock special avatars, badges, and titles. Your level is displayed on your profile!",
        category: "Gamification",
        icon: TrendingUp,
        tags: ["xp", "level", "points", "earn", "progress"]
      },
      {
        id: 31,
        question: "What achievements can I unlock?",
        answer: "**Types**: 🏆 Quiz Master (100 quizzes) | ⚡ Speed Demon (complete in 60 secs) | 🎯 Perfect Score (100% accuracy) | 🔥 Streak Keeper (7/30/100 days) | 🥇 Leaderboard Champion | 🤝 Social Butterfly (10 friends) | 🧠 Subject Expert (master a topic) | 👑 Battle Victor (win 10 duels). Check 'Achievements' page for all 50+ badges!",
        category: "Gamification",
        icon: Award,
        tags: ["achievements", "badges", "unlock", "rewards"]
      },
      {
        id: 32,
        question: "How do I customize my avatar?",
        answer: "Profile → 'Avatar Customization' → Choose base avatar → Customize: Skin tone | Hairstyle | Facial features | Clothing | Accessories | Background. Unlock premium items by leveling up or completing achievements. Your avatar appears on leaderboards, profile, and during battles!",
        category: "Gamification",
        icon: User,
        tags: ["avatar", "customize", "profile", "appearance"]
      },
      {
        id: 33,
        question: "How do leaderboards work?",
        answer: "**Types**: Global (all users) | Friends (your connections) | Quiz-specific | Monthly | All-time. Rankings based on: Total XP | Quiz scores | Win rates | Streak counts. Updated in real-time! Top 10 get special badges. View from Dashboard → 'Leaderboards' tab.",
        category: "Gamification",
        icon: Trophy,
        tags: ["leaderboard", "ranking", "competition", "top"]
      }
    ],

    "ai-features": [
      {
        id: 40,
        question: "What is the AI Tutor and how do I use it?",
        answer: "24/7 AI-powered learning assistant powered by **Google Gemini**. Access: Click chat icon (bottom-right) or Dashboard → 'AI Tutor'. Features: Ask doubts in any subject | Get step-by-step explanations | Request practice problems | Clarify quiz answers | Learn new topics | Voice input support. Just type your question naturally!",
        category: "AI Features",
        icon: Bot,
        tags: ["ai tutor", "chatbot", "help", "doubt", "learn"]
      },
      {
        id: 41,
        question: "Can AI Tutor explain quiz answers?",
        answer: "Yes! After taking a quiz, click on any question → Click 'Ask AI Tutor' → AI provides detailed explanation of correct answer and why other options are wrong. You can also ask follow-up questions. Great for understanding concepts deeply!",
        category: "AI Features",
        icon: Brain,
        tags: ["explain", "answers", "quiz", "understand"]
      },
      {
        id: 42,
        question: "What AI features does the platform have?",
        answer: "🤖 **AI Capabilities**: Smart quiz generation from any content | YouTube video transcription & quiz creation | Intelligent question difficulty adjustment | Personalized learning recommendations | 24/7 AI Tutor chatbot | Automatic answer explanations | Smart search & discovery | Content moderation | Performance analytics with AI insights",
        category: "AI Features",
        icon: Sparkles,
        tags: ["ai", "features", "artificial intelligence", "machine learning"]
      }
    ],

    "social-features": [
      {
        id: 50,
        question: "How do I add friends?",
        answer: "Dashboard → 'Social' tab → Search users by name/username → Click 'Add Friend' → Wait for acceptance. Or share your profile link! View friends' activity, challenge them to duels, compare scores, send messages. Build your learning community!",
        category: "Social Features",
        icon: Users,
        tags: ["friends", "social", "add", "connect"]
      },
      {
        id: 51,
        question: "Can I see my friends' quiz activity?",
        answer: "Yes! Social tab shows: Recent quiz scores | Achievement unlocks | Streak status | Current level. Compare your progress! Click on any friend's activity to view details or try the same quiz.",
        category: "Social Features",
        icon: Users,
        tags: ["activity", "friends", "social", "feed"]
      }
    ],

    "accessibility": [
      {
        id: 60,
        question: "How do I enable voice guidance for visually impaired mode?",
        answer: "**Method 1**: Press **Alt+A** anywhere on the platform (instant toggle). **Method 2**: Settings → Accessibility → Toggle 'Visually Impaired Mode'. Features: Voice announcements for all actions | Screen reader optimization | Keyboard-only navigation | High contrast mode | Enlarged text | Audio feedback. All platform features fully accessible!",
        category: "Accessibility",
        icon: Volume2,
        tags: ["accessibility", "voice", "blind", "screen reader", "vi mode"]
      },
      {
        id: 61,
        question: "What keyboard shortcuts are available?",
        answer: "**Navigation**: Alt+A (VI Mode) | Alt+H (Help Center) | Tab/Shift+Tab (Navigate) | Enter (Confirm) | Escape (Close/Cancel). **During Quiz**: 1/2/3/4 (Select options) | Enter (Submit answer) | N (Next question) | P (Previous). **Global**: Ctrl+K (Quick search) | Ctrl+S (Settings)",
        category: "Accessibility",
        icon: Sparkles,
        tags: ["keyboard", "shortcuts", "keys", "hotkeys"]
      },
      {
        id: 62,
        question: "Is Cognito compatible with screen readers?",
        answer: "✅ Fully compatible! Tested with: **NVDA** (Windows) | **JAWS** (Windows) | **VoiceOver** (Mac/iOS) | **TalkBack** (Android). All interactive elements have proper ARIA labels, semantic HTML, focus management. Enable VI Mode (Alt+A) for enhanced audio feedback beyond screen reader.",
        category: "Accessibility",
        icon: Volume2,
        tags: ["screen reader", "nvda", "jaws", "voiceover", "compatible"]
      }
    ],

    "video-meetings": [
      {
        id: 70,
        question: "How do I start a video meeting?",
        answer: "Dashboard → 'Video Meeting' → Click 'Start Meeting' → System generates room code → Share code with participants → They join via 'Join Meeting' → Uses WebRTC for peer-to-peer connection. Features: Screen sharing | Chat | Whiteboard | Recording. No downloads needed!",
        category: "Video & Collaboration",
        icon: Video,
        tags: ["video", "meeting", "webrtc", "call", "conference"]
      },
      {
        id: 71,
        question: "Can I share my screen during a meeting?",
        answer: "Yes! During meeting → Click screen share icon → Choose: Entire screen | Application window | Browser tab → Click 'Share'. Others see your screen in real-time. Great for teaching! Click 'Stop Sharing' when done.",
        category: "Video & Collaboration",
        icon: Video,
        tags: ["screen share", "meeting", "present", "show"]
      }
    ],

    "settings-account": [
      {
        id: 80,
        question: "How do I change my profile information?",
        answer: "Settings → 'Profile' tab → Edit: Name | Username | Email | Bio | Avatar | Grade/Class. Click 'Save Changes'. Email changes require verification. Username must be unique (check availability in real-time).",
        category: "Settings & Account",
        icon: User,
        tags: ["profile", "edit", "change", "update", "account"]
      },
      {
        id: 81,
        question: "How do I enable dark mode?",
        answer: "Settings → 'Appearance' → Theme → Select 'Dark' | 'Light' | 'Auto' (follows system). Dark mode reduces eye strain and saves battery. Applies instantly across entire platform!",
        category: "Settings & Account",
        icon: Sparkles,
        tags: ["dark mode", "theme", "appearance", "settings"]
      },
      {
        id: 82,
        question: "Can I export my quiz results?",
        answer: "Profile → 'Activity' tab → Click 'Export Data' → Choose format: CSV | JSON | PDF → Select date range → Download. Teachers can export entire class results from 'Teacher Dashboard' → 'Analytics' → 'Export All'.",
        category: "Settings & Account",
        icon: FileText,
        tags: ["export", "results", "data", "download", "csv"]
      }
    ],

    "troubleshooting": [
      {
        id: 90,
        question: "Voice guidance is not working",
        answer: "**Fix Steps**: 1. Check browser supports Speech Synthesis (Chrome/Edge best) 2. Settings → Accessibility → Ensure 'Text-to-Speech' is ON 3. Check system volume 4. Allow browser permissions 5. Refresh page (F5) 6. Try different voice in Settings. If issue persists, use external screen reader (NVDA/JAWS).",
        category: "Troubleshooting",
        icon: Volume2,
        tags: ["voice", "tts", "not working", "fix", "bug"]
      },
      {
        id: 91,
        question: "Quiz is not loading or stuck",
        answer: "**Solutions**: 1. Check internet connection (speed test) 2. Clear browser cache (Ctrl+Shift+Delete → Check 'Cached images' → Clear) 3. Disable browser extensions/ad blockers temporarily 4. Try incognito/private mode 5. Refresh page (Ctrl+F5 for hard refresh) 6. Try different browser 7. Check if quiz exists/is published",
        category: "Troubleshooting",
        icon: Shield,
        tags: ["loading", "stuck", "not working", "error", "fix"]
      },
      {
        id: 92,
        question: "Can't join live session or duel battle",
        answer: "**Checklist**: 1. Verify room code is correct (case-sensitive, 6 digits) 2. Check if session is still active (ask host) 3. Ensure you're logged in 4. Refresh page 5. Check internet stability 6. Disable VPN if active 7. Clear browser cache 8. Try different browser/device. Contact session host to verify status.",
        category: "Troubleshooting",
        icon: Users,
        tags: ["can't join", "live session", "duel", "room code", "error"]
      },
      {
        id: 93,
        question: "Video/audio not working in meeting",
        answer: "**Fix**: 1. Check browser permissions (click lock icon in address bar → allow camera/mic) 2. Check if another app is using camera/mic 3. Test hardware (go to Settings → Test Video/Audio) 4. Restart browser 5. Update browser to latest version 6. Try different browser (Chrome/Edge recommended) 7. Check device drivers",
        category: "Troubleshooting",
        icon: Video,
        tags: ["video", "audio", "camera", "microphone", "not working"]
      },
      {
        id: 94,
        question: "My quiz scores/XP are not updating",
        answer: "Usually updates within 30 seconds. **If delayed**: 1. Refresh page (F5) 2. Log out and log back in 3. Clear browser cache 4. Check 'Activity' tab for pending results 5. Wait 5 minutes (server sync delay) 6. If still missing, contact support with quiz ID and timestamp.",
        category: "Troubleshooting",
        icon: TrendingUp,
        tags: ["score", "xp", "not updating", "missing", "sync"]
      }
    ],

    "advanced-tips": [
      {
        id: 100,
        question: "How can I maximize my quiz score?",
        answer: "**Pro Tips**: ⚡ Answer quickly for speed bonuses | 📖 Read all options carefully | 🎯 First attempt counts (no guessing) | 🔄 Maintain daily streaks (bonus XP) | 🧠 Use process of elimination | 📚 Review explanations after quiz | 🎮 Practice with AI battles | 🏆 Focus on accuracy over speed initially",
        category: "Advanced Tips",
        icon: Target,
        tags: ["tips", "tricks", "maximize", "score", "strategy"]
      },
      {
        id: 101,
        question: "What are the best practices for creating engaging quizzes?",
        answer: "**Teacher Tips**: 📝 Mix question difficulties | 🎨 Add images/media | ⏱️ Set appropriate time limits (45-60s per question) | 💡 Write clear, concise questions | ❌ Create plausible wrong answers | 📖 Add detailed explanations | 🎯 Focus on understanding, not memorization | 📊 Review analytics to improve",
        category: "Advanced Tips",
        icon: FileText,
        tags: ["create", "quiz", "best practices", "teacher", "tips"]
      },
      {
        id: 102,
        question: "How do I prepare for a competitive duel?",
        answer: "**Duel Strategy**: 🏃 Practice similar quizzes first | ⚡ Master keyboard shortcuts (1-4 for answers) | 🧘 Stay calm under pressure | 🎯 Accuracy > Speed (wrong answers have time penalty) | 📊 Check opponent's stats beforehand | 💪 Warm up with practice mode | 🔥 Maintain focus till end (comeback possible!)",
        category: "Advanced Tips",
        icon: Gamepad2,
        tags: ["duel", "strategy", "competitive", "tips", "win"]
      }
    ]
  };

  // Enhanced AI response with comprehensive search
  const getAIResponse = async (userMessage) => {
    setIsTyping(true);
    
    // Search across all knowledge base articles
    const allArticles = Object.values(knowledgeBase).flat();
    
    // Multi-criteria search: question, answer, tags
    const searchLower = userMessage.toLowerCase();
    const matches = allArticles.filter(article => {
      const questionMatch = article.question.toLowerCase().includes(searchLower);
      const answerMatch = article.answer.toLowerCase().includes(searchLower);
      const tagMatch = article.tags?.some(tag => tag.toLowerCase().includes(searchLower));
      const categoryMatch = article.category.toLowerCase().includes(searchLower);
      
      return questionMatch || answerMatch || tagMatch || categoryMatch;
    });

    // Score matches by relevance
    const scoredMatches = matches.map(article => {
      let score = 0;
      const words = searchLower.split(' ');
      
      words.forEach(word => {
        if (article.question.toLowerCase().includes(word)) score += 3;
        if (article.tags?.some(tag => tag.includes(word))) score += 2;
        if (article.answer.toLowerCase().includes(word)) score += 1;
      });
      
      return { ...article, score };
    }).sort((a, b) => b.score - a.score);

    await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate processing
    
    setIsTyping(false);

    if (scoredMatches.length > 0) {
      const bestMatch = scoredMatches[0];
      const relatedArticles = scoredMatches.slice(1, 4).map(a => a.question);
      
      return {
        type: "answer",
        text: bestMatch.answer,
        relatedQuestions: relatedArticles.length > 0 ? relatedArticles : [
          "How do I create my first quiz?",
          "What keyboard shortcuts are available?",
          "How does the AI Tutor work?"
        ]
      };
    }

    // Fallback responses for unmapped queries
    const fallbacks = {
      greeting: ["hi", "hello", "hey", "greetings"],
      thanks: ["thank", "thanks", "appreciate"],
      help: ["help", "support", "assist", "problem"],
    };

    if (fallbacks.greeting.some(word => searchLower.includes(word))) {
      return {
        type: "answer",
        text: "👋 Hello! I'm your Cognito Learning Hub AI assistant. I can help you with anything about the platform - from creating quizzes to troubleshooting issues. What would you like to know?",
        relatedQuestions: [
          "How do I create my first quiz?",
          "What is the difference between Student and Teacher accounts?",
          "How do 1v1 Duel Battles work?"
        ]
      };
    }

    if (fallbacks.thanks.some(word => searchLower.includes(word))) {
      return {
        type: "answer",
        text: "You're welcome! 😊 Feel free to ask if you have any other questions about Cognito Learning Hub. I'm here to help 24/7!",
        relatedQuestions: [
          "How does the XP and leveling system work?",
          "How do I enable dark mode?",
          "Can I export my quiz results?"
        ]
      };
    }

    // Generic helpful response
    // Generic helpful response
    return {
      type: "answer",
      text: "I couldn't find a specific answer for that, but I'm here to help! Could you rephrase your question or ask about:\n\n• **Quiz Creation**: AI generation, manual creation, editing\n• **Competitive Modes**: Duels, live sessions, battles\n• **Gamification**: XP, levels, achievements, leaderboards\n• **AI Features**: AI Tutor, quiz generation, smart features\n• **Accessibility**: Voice guidance, keyboard shortcuts\n• **Troubleshooting**: Common issues and fixes\n\nYou can also browse the 'Docs' tab for all available topics!",
      relatedQuestions: [
        "What are the main features of Cognito Learning Hub?",
        "How do I maximize my quiz score?",
        "What keyboard shortcuts are available?"
      ]
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage("");

    // Get AI response
    const aiResponse = await getAIResponse(inputMessage);
    
    const aiMsg = {
      id: Date.now() + 1,
      type: "ai",
      ...aiResponse,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, aiMsg]);
  };

  const handleQuickAction = (question) => {
    setInputMessage(question);
    handleSendMessage();
  };

  const quickActions = [
    { icon: Zap, label: "Create Quiz", query: "How do I create my first quiz?" },
    { icon: Gamepad2, label: "1v1 Battle", query: "How do 1v1 Duel Battles work?" },
    { icon: Volume2, label: "Accessibility", query: "How do I enable voice guidance for visually impaired mode?" },
    { icon: Bot, label: "AI Tutor", query: "What is the AI Tutor and how do I use it?" },
    { icon: Play, label: "Live Session", query: "How do I join a live quiz session?" },
    { icon: Trophy, label: "Leaderboards", query: "How do leaderboards work?" }
  ];

  const popularTopics = [
    { title: "Quiz Creation", count: `${knowledgeBase["quiz-creation"].length} articles`, icon: FileText },
    { title: "Competitive Modes", count: `${knowledgeBase["competitive-modes"].length} articles`, icon: Gamepad2 },
    { title: "Gamification", count: `${knowledgeBase["gamification"].length} articles`, icon: Trophy },
    { title: "AI Features", count: `${knowledgeBase["ai-features"].length} articles`, icon: Brain },
    { title: "Accessibility", count: `${knowledgeBase["accessibility"].length} articles`, icon: Volume2 },
    { title: "Troubleshooting", count: `${knowledgeBase["troubleshooting"].length} articles`, icon: Shield }
  ];

  // Render directly without portal - simpler approach
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 2147483647,
        pointerEvents: 'auto'
      }}
    >
      {!isOpen ? (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(to right, #7c3aed, #c026d3)',
            borderRadius: '50%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: 'none'
          }}
          onClick={() => setIsOpen(true)}
          aria-label="Open help center"
          className="group hover:scale-110 transition-transform"
        >
          <HelpCircle style={{ width: '32px', height: '32px', color: 'white' }} className="group-hover:rotate-12 transition-transform" />
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '16px',
            height: '16px',
            background: '#ef4444',
            borderRadius: '50%'
          }} className="animate-pulse" />
        </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              height: isMinimized ? 60 : 600
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-[420px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col"
            style={{ 
              maxHeight: 'calc(100vh - 80px)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Help Center</h3>
                  <p className="text-white/80 text-xs">AI-Powered Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label={isMinimized ? "Maximize" : "Minimize"}
                >
                  {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Close help center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

      {!isMinimized && (
        <>
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <button
              onClick={() => setActiveView("home")}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                activeView === "home"
                  ? "text-violet-600 dark:text-violet-400 border-b-2 border-violet-600"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveView("chat")}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors relative ${
                activeView === "chat"
                  ? "text-violet-600 dark:text-violet-400 border-b-2 border-violet-600"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Chat
              <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"></span>
            </button>
            <button
              onClick={() => setActiveView("docs")}
              className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                activeView === "docs"
                  ? "text-violet-600 dark:text-violet-400 border-b-2 border-violet-600"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Docs
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            {/* Home View */}
            {activeView === "home" && (
              <div className="p-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search for help..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-600" />
                    Quick Actions
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, idx) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveView("chat");
                            setInputMessage(action.query);
                            setTimeout(handleSendMessage, 100);
                          }}
                          className="flex items-center gap-2 p-3 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-xl hover:from-violet-100 hover:to-fuchsia-100 dark:hover:from-violet-900/30 dark:hover:to-fuchsia-900/30 transition-all border border-violet-200 dark:border-violet-800 text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {action.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Book className="w-4 h-4 text-violet-600" />
                    Popular Topics
                  </h4>
                  <div className="space-y-2">
                    {popularTopics.map((topic, idx) => {
                      const TopicIcon = topic.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => setActiveView("docs")}
                          className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                              <TopicIcon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {topic.title}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {topic.count}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-xl border-2 border-violet-200 dark:border-violet-800">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-violet-900 dark:text-violet-100 text-sm mb-1">
                        Need More Help?
                      </h4>
                      <p className="text-xs text-violet-700 dark:text-violet-300 mb-2">
                        Start a chat with our AI assistant for personalized guidance!
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setActiveView("chat")}
                        className="bg-violet-600 hover:bg-violet-700 text-white text-xs"
                      >
                        Start Chat
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat View */}
            {activeView === "chat" && (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <Bot className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                      <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Hi! How can I help you today?
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Ask me anything about the platform!
                      </p>
                      <div className="space-y-2">
                        {["How do I create a quiz?", "Enable voice guidance", "Start a 1v1 battle"].map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setInputMessage(q);
                              setTimeout(handleSendMessage, 100);
                            }}
                            className="block w-full text-left px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm text-slate-700 dark:text-slate-300"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${msg.type === "user" ? "flex-row-reverse" : ""}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            msg.type === "user"
                              ? "bg-violet-600"
                              : "bg-gradient-to-br from-violet-500 to-fuchsia-500"
                          }`}>
                            {msg.type === "user" ? (
                              <User className="w-5 h-5 text-white" />
                            ) : (
                              <Bot className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className={`flex-1 ${msg.type === "user" ? "text-right" : ""}`}>
                            <div className={`inline-block max-w-[85%] p-3 rounded-2xl ${
                              msg.type === "user"
                                ? "bg-violet-600 text-white"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}>
                              {msg.type === "user" ? (
                                <p className="text-sm">{msg.content}</p>
                              ) : (
                                <div className="text-sm space-y-2 whitespace-pre-wrap">
                                  {msg.text || msg.content}
                                </div>
                              )}
                            </div>
                            {msg.relatedQuestions && msg.relatedQuestions.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  Related Questions:
                                </p>
                                {msg.relatedQuestions.map((q, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      setInputMessage(q);
                                      setTimeout(handleSendMessage, 100);
                                    }}
                                    className="block w-full text-left px-3 py-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-xs text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800"
                                  >
                                    {q}
                                  </button>
                                ))}
                              </div>
                            )}
                            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                          </div>
                          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></span>
                              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Chat Input */}
                <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Type your question..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className="bg-violet-600 hover:bg-violet-700 text-white px-4"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Docs View - Organized by Category */}
            {activeView === "docs" && (
              <div className="h-full overflow-y-auto">
                {/* Search Bar */}
                <div className="sticky top-0 bg-white dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-700 z-10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search documentation..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="p-4 space-y-6">
                  {Object.entries(knowledgeBase).map(([categoryKey, articles]) => {
                    const filteredArticles = searchQuery
                      ? articles.filter(article =>
                          article.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                        )
                      : articles;

                    if (filteredArticles.length === 0) return null;

                    const categoryTitle = articles[0]?.category || categoryKey;
                    const Icon = articles[0]?.icon || Book;

                    return (
                      <div key={categoryKey} className="space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                              {categoryTitle}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 ml-10">
                          {filteredArticles.map((article) => {
                            const ArticleIcon = article.icon || Book;
                            return (
                              <button
                                key={article.id}
                                onClick={() => {
                                  setActiveView("chat");
                                  setInputMessage(article.question);
                                  setTimeout(handleSendMessage, 100);
                                }}
                                className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group border border-transparent hover:border-violet-200 dark:hover:border-violet-800"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <ArticleIcon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 mb-1">
                                      {article.question}
                                    </h5>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                                      {article.answer.substring(0, 100)}...
                                    </p>
                                    {article.tags && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {article.tags.slice(0, 3).map((tag, idx) => (
                                          <span
                                            key={idx}
                                            className="px-2 py-0.5 bg-violet-100 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 text-[10px] font-medium rounded-full"
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {searchQuery && Object.values(knowledgeBase).flat().filter(article =>
                    article.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    article.answer.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="text-center py-12">
                      <Search className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                      <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">
                        No results found
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Try different keywords or browse all topics below
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setSearchQuery("")}
                        variant="outline"
                      >
                        Clear Search
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800">
            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">Alt+H</kbd> to toggle help center
            </p>
          </div>
        </>
      )}
          </motion.div>
        )}
    </div>
  );
}
  