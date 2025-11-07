import React, { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { 
  Send, 
  Bot, 
  Plus, 
  User, 
  Sparkles, 
  BookOpen, 
  Brain, 
  MessageCircle,
  Lightbulb,
  Zap,
  Clock,
  Star,
  ChevronDown,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Heart,
  ThumbsUp,
  Share2,
  Download,
  History,
  Settings,
  Palette,
  Moon,
  Sun,
  Type,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Contrast,
  AccessibilityIcon as Accessibility,
  Focus
} from 'lucide-react';

const suggestedQuestions = [
  {
    category: "Science",
    icon: "⚛️",
    questions: [
      "Explain photosynthesis in simple terms",
      "What is Newton's First Law of Motion?",
      "How does DNA replication work?",
      "What causes earthquakes?"
    ]
  },
  {
    category: "Mathematics",
    icon: "📐",
    questions: [
      "Solve quadratic equations step by step",
      "Explain calculus derivatives",
      "How to find the area of a circle?",
      "What is the Pythagorean theorem?"
    ]
  },
  {
    category: "History",
    icon: "📚",
    questions: [
      "Summarize the main causes of World War II",
      "Explain the Industrial Revolution",
      "What was the Renaissance period?",
      "Timeline of Ancient Egyptian civilization"
    ]
  },
  {
    category: "Literature",
    icon: "📖",
    questions: [
      "Analyze Shakespeare's writing style",
      "Explain symbolism in poetry",
      "What is a metaphor vs simile?",
      "Summary of Pride and Prejudice"
    ]
  }
];

const quickActions = [
  { icon: "🔍", text: "Explain this concept", color: "from-blue-500 to-indigo-600" },
  { icon: "📝", text: "Help with homework", color: "from-green-500 to-yellow-800" },
  { icon: "🧮", text: "Solve this problem", color: "from-purple-800 to-pink-700" },
  { icon: "💡", text: "Give me examples", color: "from-blue-900 to-red-900" }
];

// Enhanced Loading Animation
const TypingIndicator = () => (
  <motion.div 
    className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-2xl max-w-fit"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
  >
    <Brain className="w-4 h-4 text-indigo-500 animate-pulse" />
    <span className="text-sm text-gray-600 dark:text-gray-300">AI is thinking</span>
    <div className="flex gap-1">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{ 
            duration: 0.6, 
            repeat: Infinity, 
            delay: i * 0.2 
          }}
        />
      ))}
    </div>
  </motion.div>
);

// Enhanced Message Component with Accessibility
const MessageBubble = ({ message, index, user, onCopy, onToggleFavorite, onSpeak, isFavorite, fontSize, isSpeaking, voiceEnabled, accessibilityMode, screenReaderMode, reducedMotion }) => {
  const isUser = message.sender === 'user';
  
  return (
    <motion.div 
      className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'} group`}
      initial={reducedMotion ? {} : { opacity: 0, y: 20, scale: 0.95 }}
      animate={reducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
      transition={reducedMotion ? {} : { duration: 0.4, delay: index * 0.1 }}
      role="article"
      aria-label={`${isUser ? 'Your' : 'AI Tutor'} message: ${message.text.substring(0, 100)}...`}
    >
      {!isUser && (
        <motion.div 
          className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg flex-shrink-0"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Brain className="w-5 h-5" />
        </motion.div>
      )}
      
      <motion.div 
        className={`max-w-xs md:max-w-md p-4 rounded-2xl shadow-lg border ${
          isUser 
            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-transparent rounded-br-lg' 
            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 rounded-bl-lg'
        } ${accessibilityMode === 'high-contrast' ? 'border-4 border-black dark:border-white' : ''}`}
        whileHover={reducedMotion ? {} : { scale: 1.02 }}
        transition={reducedMotion ? {} : { duration: 0.2 }}
        role="region"
        aria-label={`Message from ${isUser ? 'user' : 'AI tutor'}`}
        tabIndex={0}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className={`text-xs font-medium ${
            isUser ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {isUser ? 'You' : 'AI Tutor'}
          </span>
          <div className={`flex items-center gap-1 ${
            isUser ? 'text-indigo-100' : 'text-gray-400'
          }`}>
            <Clock className="w-3 h-3" />
            <span className="text-xs">
              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'now'}
            </span>
          </div>
        </div>
        
        <p className={`${fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-sm'} leading-relaxed whitespace-pre-wrap ${
          isUser ? 'font-medium' : ''
        } ${accessibilityMode === 'dyslexia' ? 'font-mono tracking-wider leading-loose text-left' : ''} ${
          accessibilityMode === 'high-contrast' ? 'font-bold' : ''
        }`}
          role="text"
          aria-live={screenReaderMode ? 'polite' : 'off'}
        >
          {message.text}
        </p>
        
        {!isUser && (
          <motion.div 
            className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700 flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-6 px-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => onToggleFavorite(message.id)}
            >
              <Heart className={`w-3 h-3 mr-1 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              {isFavorite ? 'Saved' : 'Save'}
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-6 px-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => onCopy(message.text)}
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
            
            {voiceEnabled && (
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs h-6 px-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => onSpeak(message.text)}
                disabled={isSpeaking}
              >
                <Volume2 className={`w-3 h-3 mr-1 ${isSpeaking ? 'animate-pulse' : ''}`} />
                {isSpeaking ? 'Speaking...' : 'Speak'}
              </Button>
            )}
            
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-6 px-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ThumbsUp className="w-3 h-3 mr-1" />
              Like
            </Button>
          </motion.div>
        )}
      </motion.div>
      
      {isUser && (
        <motion.div 
          className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-600 to-gray-800 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-sm">{user?.name?.[0] || 'U'}</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default function DoubtSolver() {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    { 
      sender: 'ai', 
      text: `Hello ${user?.name || 'there'}! 👋 I'm your AI Tutor, ready to help you with any academic questions. What would you like to learn today?`,
      timestamp: new Date(),
      id: 1
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fontSize, setFontSize] = useState('medium');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [favoriteMessages, setFavoriteMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  // Accessibility Enhancement States
  const [accessibilityMode, setAccessibilityMode] = useState('normal'); // normal, dyslexia, high-contrast
  const [colorBlindMode, setColorBlindMode] = useState('normal'); // normal, deuteranopia, protanopia, tritanopia
  const [reducedMotion, setReducedMotion] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [showAccessibilityHelp, setShowAccessibilityHelp] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  
  const messagesEndRef = useRef(null);
  const speechSynthesis = window.speechSynthesis;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Accessibility: Load saved preferences
  useEffect(() => {
    const savedAccessibility = localStorage.getItem('ai-tutor-accessibility');
    if (savedAccessibility) {
      const prefs = JSON.parse(savedAccessibility);
      setAccessibilityMode(prefs.accessibilityMode || 'normal');
      setColorBlindMode(prefs.colorBlindMode || 'normal');
      setReducedMotion(prefs.reducedMotion || false);
      setScreenReaderMode(prefs.screenReaderMode || false);
      setFocusMode(prefs.focusMode || false);
      setAutoSpeak(prefs.autoSpeak || false);
    }
  }, []);

  // Save accessibility preferences
  useEffect(() => {
    const prefs = {
      accessibilityMode,
      colorBlindMode,
      reducedMotion,
      screenReaderMode,
      focusMode,
      autoSpeak
    };
    localStorage.setItem('ai-tutor-accessibility', JSON.stringify(prefs));
  }, [accessibilityMode, colorBlindMode, reducedMotion, screenReaderMode, focusMode, autoSpeak]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Alt + A for accessibility panel focus
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        document.querySelector('[aria-label="Accessibility Settings"]')?.focus();
      }
      // Alt + C for chat input focus
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        document.querySelector('[aria-label="Type your question here"]')?.focus();
      }
      // Alt + M for toggle reduced motion
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        setReducedMotion(!reducedMotion);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [reducedMotion]);

  // Save chat history to localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('ai-tutor-history');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ai-tutor-history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Voice Recognition
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  // Text-to-Speech
  const speakMessage = (text) => {
    if (!voiceEnabled) return;
    
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Copy message to clipboard
  const copyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Add to favorites
  const toggleFavorite = (messageId) => {
    setFavoriteMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleSendMessage = async (e, messageText = input) => {
    if (e) e.preventDefault();
    if (!messageText.trim()) return;

    const messageId = Date.now();
    const userMessage = { 
      sender: 'user', 
      text: messageText, 
      timestamp: new Date(),
      id: messageId
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/doubt-solver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to get a response.');
      
      const aiResponse = { 
        sender: 'ai', 
        text: data.reply, 
        timestamp: new Date(),
        id: Date.now() + 1
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Auto-speak AI response if voice and auto-speak are enabled
      if (voiceEnabled && autoSpeak) {
        setTimeout(() => speakMessage(data.reply), 500);
      }
      
    } catch (error) {
      console.error("Doubt solver fetch error:", error);
      const errorResponse = { 
        sender: 'ai', 
        text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or rephrase your question. I'm here to help! 🤖",
        timestamp: new Date(),
        id: Date.now() + 2
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const startNewChat = () => {
    // Save current chat to history
    if (messages.length > 1) {
      const chatSession = {
        id: Date.now(),
        messages: messages,
        timestamp: new Date(),
        title: messages[1]?.text.substring(0, 50) + '...' || 'New Chat'
      };
      setChatHistory(prev => [chatSession, ...prev.slice(0, 9)]); // Keep last 10 chats
    }
    
    setMessages([{ 
      sender: 'ai', 
      text: `Starting fresh! 🌟 I'm ready to help you tackle any academic challenge. What's on your mind today?`,
      timestamp: new Date(),
      id: Date.now()
    }]);
    setShowSuggestions(true);
    setSelectedCategory(null);
  };

  const loadChatHistory = (chatSession) => {
    setMessages(chatSession.messages);
    setShowSuggestions(false);
  };

  // Accessibility Enhancement Functions
  const getAccessibilityClasses = () => {
    let classes = '';
    
    // Dyslexia-friendly font
    if (accessibilityMode === 'dyslexia') {
      classes += ' font-mono tracking-wider leading-relaxed ';
    }
    
    // High contrast mode
    if (accessibilityMode === 'high-contrast') {
      classes += ' contrast-125 saturate-150 ';
    }
    
    // Color blind adjustments
    if (colorBlindMode !== 'normal') {
      classes += ' hue-rotate-15 ';
    }
    
    // Reduced motion
    if (reducedMotion) {
      classes += ' motion-reduce:transition-none motion-reduce:animate-none ';
    }
    
    // Focus mode (simplified interface)
    if (focusMode) {
      classes += ' bg-gray-50 dark:bg-gray-900 ';
    }
    
    return classes;
  };

  const toggleAccessibilityMode = () => {
    const modes = ['normal', 'dyslexia', 'high-contrast'];
    const currentIndex = modes.indexOf(accessibilityMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setAccessibilityMode(modes[nextIndex]);
  };

  const toggleColorBlindMode = () => {
    const modes = ['normal', 'deuteranopia', 'protanopia', 'tritanopia'];
    const currentIndex = modes.indexOf(colorBlindMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setColorBlindMode(modes[nextIndex]);
  };

  const handleQuickAction = (action) => {
    setInput(`${action.text}: `);
  };

  const fontSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  // Accessibility Help Modal Component
  const AccessibilityHelpModal = () => (
    <AnimatePresence>
      {showAccessibilityHelp && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowAccessibilityHelp(false)}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Accessibility className="w-6 h-6 text-blue-500" />
                Accessibility Help
              </h2>
              <Button
                onClick={() => setShowAccessibilityHelp(false)}
                variant="outline"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Keyboard Shortcuts</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm">Alt + A</kbd>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Focus Accessibility Panel</span>
                  </div>
                  <div className="flex justify-between">
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm">Alt + C</kbd>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Focus Chat Input</span>
                  </div>
                  <div className="flex justify-between">
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm">Alt + M</kbd>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Toggle Reduced Motion</span>
                  </div>
                  <div className="flex justify-between">
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm">Tab</kbd>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Navigate Through Elements</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Accessibility Features</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Visual Modes</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Switch between Normal, Dyslexia-friendly (monospace font with wider spacing), 
                        and High Contrast modes for better readability.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Palette className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Color Blind Support</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Adjust colors for Deuteranopia, Protanopia, and Tritanopia color vision deficiencies.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Focus className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Motion Controls</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Reduce or disable animations and transitions for users sensitive to motion.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Volume2 className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Voice Features</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Screen reader announcements, text-to-speech, and voice input capabilities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Tips for Better Experience</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Use larger font sizes if you have difficulty reading small text</li>
                  <li>Enable voice features for hands-free interaction</li>
                  <li>Turn on Focus Mode to minimize distractions</li>
                  <li>All settings are automatically saved for your next visit</li>
                </ul>
              </div>

              {/* Advanced Accessibility Controls */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Advanced Settings</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Color Blind Support */}
                  <Button
                    onClick={toggleColorBlindMode}
                    variant="outline"
                    size="sm"
                    className={`flex items-center gap-2 ${
                      colorBlindMode !== 'normal' ? 'bg-orange-50 dark:bg-orange-900 border-orange-300 dark:border-orange-600' : ''
                    }`}
                  >
                    <Palette className="w-4 h-4" />
                    <span className="text-xs">
                      {colorBlindMode === 'deuteranopia' ? 'Deuteranopia' :
                       colorBlindMode === 'protanopia' ? 'Protanopia' :
                       colorBlindMode === 'tritanopia' ? 'Tritanopia' : 'Normal Colors'}
                    </span>
                  </Button>

                  {/* Screen Reader Mode */}
                  <Button
                    onClick={() => setScreenReaderMode(!screenReaderMode)}
                    variant="outline"
                    size="sm"
                    className={`flex items-center gap-2 ${
                      screenReaderMode ? 'bg-purple-50 dark:bg-purple-900 border-purple-300 dark:border-purple-600' : ''
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span className="text-xs">
                      {screenReaderMode ? 'Screen Reader On' : 'Screen Reader Off'}
                    </span>
                  </Button>

                  {/* Focus Mode */}
                  <Button
                    onClick={() => setFocusMode(!focusMode)}
                    variant="outline"
                    size="sm"
                    className={`flex items-center gap-2 ${
                      focusMode ? 'bg-indigo-50 dark:bg-indigo-900 border-indigo-300 dark:border-indigo-600' : ''
                    }`}
                  >
                    <Contrast className="w-4 h-4" />
                    <span className="text-xs">
                      {focusMode ? 'Focus Mode' : 'Normal Mode'}
                    </span>
                  </Button>

                  {/* Text Size Presets */}
                  <Button
                    onClick={() => {
                      const sizes = ['small', 'medium', 'large'];
                      const currentIndex = sizes.indexOf(fontSize);
                      const nextIndex = (currentIndex + 1) % sizes.length;
                      setFontSize(sizes[nextIndex]);
                    }}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Type className="w-4 h-4" />
                    <span className="text-xs">Font: {fontSize}</span>
                  </Button>

                  {/* Skip to Content */}
                  <Button
                    onClick={() => {
                      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                      setShowAccessibilityHelp(false);
                    }}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <ChevronDown className="w-4 h-4" />
                    <span className="text-xs">Skip to Chat</span>
                  </Button>
                </div>

                {/* Complete Status */}
                <div className="mt-4 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${
                      accessibilityMode !== 'normal' || colorBlindMode !== 'normal' || reducedMotion || screenReaderMode || focusMode || autoSpeak
                        ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="font-medium">Complete Accessibility Status</span>
                  </div>
                  <p>
                    Mode: {accessibilityMode} • Colors: {colorBlindMode} • 
                    Motion: {reducedMotion ? 'Reduced' : 'Normal'} • 
                    Voice: {voiceEnabled ? 'Enabled' : 'Disabled'} • 
                    Auto-Speak: {autoSpeak ? 'On' : 'Off'} • 
                    Screen Reader: {screenReaderMode ? 'On' : 'Off'} • 
                    Focus: {focusMode ? 'On' : 'Off'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-800 p-4 ${getAccessibilityClasses()}`}>
      {/* Accessibility Help Modal */}
      <AccessibilityHelpModal />
      
      {/* Floating Accessibility Button */}
      <motion.button
        onClick={() => setShowAccessibilityHelp(true)}
        className={`fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-lg transition-all duration-300 ${
          accessibilityMode !== 'normal' || colorBlindMode !== 'normal' || reducedMotion || screenReaderMode || focusMode || autoSpeak
            ? 'bg-blue-500 text-white shadow-blue-500/25' 
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 shadow-gray-500'
        } hover:scale-110 hover:shadow-xl`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Accessibility Settings"
        aria-label="Open accessibility settings"
      >
        <Accessibility className="w-5 h-5" />
      </motion.button>
      
      <motion.div 
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div 
              className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Brain className="w-8 h-8" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Tutor
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Your 24/7 Academic Assistant
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 mb-6">
            <Badge variant="success" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              <Zap className="w-3 h-3 mr-1" />
              Instant Responses
            </Badge>
            <Badge variant="outline" className="border-indigo-200 text-indigo-700 dark:border-indigo-600 dark:text-indigo-300">
              <Star className="w-3 h-3 mr-1" />
              All Subjects
            </Badge>
            <Badge variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-600 dark:text-purple-300">
              <BookOpen className="w-3 h-3 mr-1" />
              Detailed Explanations
            </Badge>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Quick Actions & Categories */}
          <motion.div 
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className={`w-full p-3 rounded-xl bg-gradient-to-r ${action.color} text-white text-sm font-medium hover:shadow-lg transition-all duration-200`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="mr-2">{action.icon}</span>
                    {action.text}
                  </motion.button>
                ))}
              </CardContent>
            </Card>

            {/* Subject Categories */}
            {showSuggestions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-500" />
                    Popular Topics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {suggestedQuestions.map((category, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => setSelectedCategory(selectedCategory === index ? null : index)}
                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{category.icon}</span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {category.category}
                            </span>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${
                            selectedCategory === index ? 'rotate-180' : ''
                          }`} />
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {selectedCategory === index && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-2 space-y-2"
                          >
                            {category.questions.map((question, qIndex) => (
                              <motion.button
                                key={qIndex}
                                onClick={() => handleSendMessage(null, question)}
                                className="w-full p-2 text-xs text-left text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900 rounded-lg transition-colors bg-gray-50 dark:bg-gray-800"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: qIndex * 0.05 }}
                              >
                                {question}
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Chat History */}
            {chatHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="w-5 h-5 text-gray-500" />
                    Recent Chats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-60 overflow-y-auto">
                  {chatHistory.map((chat) => (
                    <motion.button
                      key={chat.id}
                      onClick={() => loadChatHistory(chat)}
                      className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {chat.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(chat.timestamp).toLocaleDateString()}
                      </div>
                    </motion.button>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Accessibility Settings Toggle */}
            <Card>
              <CardHeader>
                <button
                  onClick={() => setShowAccessibilityPanel(!showAccessibilityPanel)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Accessibility className="w-5 h-5 text-blue-500" />
                    Accessibility
                  </CardTitle>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                    showAccessibilityPanel ? 'rotate-180' : ''
                  }`} />
                </button>
              </CardHeader>
              
              <AnimatePresence>
                {showAccessibilityPanel && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        {/* Quick Accessibility Toggles */}
                        <Button
                          onClick={toggleAccessibilityMode}
                          variant="outline"
                          size="sm"
                          className={`flex items-center gap-2 ${
                            accessibilityMode !== 'normal' ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600' : ''
                          }`}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-xs">
                            {accessibilityMode === 'dyslexia' ? 'Dyslexia Mode' : 
                             accessibilityMode === 'high-contrast' ? 'High Contrast' : 'Normal View'}
                          </span>
                        </Button>

                        <Button
                          onClick={() => setReducedMotion(!reducedMotion)}
                          variant="outline"
                          size="sm"
                          className={`flex items-center gap-2 ${
                            reducedMotion ? 'bg-green-50 dark:bg-green-900 border-green-300 dark:border-green-600' : ''
                          }`}
                        >
                          <Focus className="w-4 h-4" />
                          <span className="text-xs">
                            {reducedMotion ? 'Motion Reduced' : 'Reduce Motion'}
                          </span>
                        </Button>

                        <Button
                          onClick={() => setAutoSpeak(!autoSpeak)}
                          variant="outline"
                          size="sm"
                          className={`flex items-center gap-2 ${
                            autoSpeak ? 'bg-yellow-50 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-600' : ''
                          }`}
                        >
                          <Volume2 className="w-4 h-4" />
                          <span className="text-xs">
                            {autoSpeak ? 'Auto-Speak On' : 'Auto-Speak Off'}
                          </span>
                        </Button>

                        {/* More Settings Button */}
                        <Button
                          onClick={() => setShowAccessibilityHelp(true)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="text-xs">More Options</span>
                        </Button>
                      </div>
                      
                      {/* Quick Status */}
                      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                        <div className="flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            accessibilityMode !== 'normal' || reducedMotion || autoSpeak
                              ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                          <span className="font-medium">
                            {accessibilityMode !== 'normal' || reducedMotion || autoSpeak 
                              ? 'Active' : 'Standard'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          {/* Main Chat Area */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="h-[600px] flex flex-col">
              {/* Chat Header */}
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <CardTitle className="text-lg">AI Tutor Chat</CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Online and ready to help</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Voice Controls */}
                    <Button 
                      onClick={() => setVoiceEnabled(!voiceEnabled)} 
                      variant="outline" 
                      size="sm"
                      className={`p-2 border-gray-300 dark:border-gray-600 ${
                        voiceEnabled 
                          ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-400' 
                          : 'text-gray-700 dark:text-gray-300'
                      } hover:bg-gray-100 dark:hover:bg-gray-700`}
                    >
                      {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </Button>
                    
                    {isSpeaking && (
                      <Button 
                        onClick={stopSpeaking} 
                        variant="outline" 
                        size="sm"
                        className="p-2 text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                      >
                        <VolumeX className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {/* Font Size */}
                    <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-800">
                      <button
                        onClick={() => setFontSize('small')}
                        className={`p-1 rounded text-xs transition-colors ${fontSize === 'small' ? 'bg-indigo-500 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                        A
                      </button>
                      <button
                        onClick={() => setFontSize('medium')}
                        className={`p-1 rounded text-sm transition-colors ${fontSize === 'medium' ? 'bg-indigo-500 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                        A
                      </button>
                      <button
                        onClick={() => setFontSize('large')}
                        className={`p-1 rounded text-base transition-colors ${fontSize === 'large' ? 'bg-indigo-500 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      >
                        A
                      </button>
                    </div>
                    
                    {/* Fullscreen Toggle */}
                    <Button 
                      onClick={() => setIsFullscreen(!isFullscreen)} 
                      variant="outline" 
                      size="sm"
                      className="p-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                    
                    <Button onClick={startNewChat} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      New Chat
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {/* Messages Area */}
              <CardContent className={`flex-1 overflow-y-auto p-6 space-y-6 ${isFullscreen ? 'h-[calc(100vh-200px)]' : ''}`}>
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <MessageBubble 
                      key={msg.id} 
                      message={msg} 
                      index={index} 
                      user={user}
                      onCopy={copyMessage}
                      onToggleFavorite={toggleFavorite}
                      onSpeak={speakMessage}
                      isFavorite={favoriteMessages.includes(msg.id)}
                      fontSize={fontSize}
                      isSpeaking={isSpeaking}
                      voiceEnabled={voiceEnabled}
                      accessibilityMode={accessibilityMode}
                      screenReaderMode={screenReaderMode}
                      reducedMotion={reducedMotion}
                    />
                  ))}
                </AnimatePresence>
                
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input Area */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3" role="search" aria-label="Chat input form">
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything about your studies..."
                      className={`pr-20 ${accessibilityMode === 'dyslexia' ? 'font-mono tracking-wider' : ''} ${
                        accessibilityMode === 'high-contrast' ? 'border-4 border-black dark:border-white' : ''
                      }`}
                      disabled={isLoading}
                      aria-label="Type your question here"
                      aria-describedby="input-help"
                    />
                    <div id="input-help" className="sr-only">
                      Type your academic question and press Enter to send, or use the microphone button for voice input
                    </div>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={startListening}
                        disabled={isListening || isLoading}
                        className={`p-1 rounded-lg transition-colors ${
                          isListening 
                            ? 'text-red-500 animate-pulse' 
                            : 'text-gray-400 hover:text-indigo-500'
                        }`}
                        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                        title={isListening ? 'Stop recording' : 'Click to speak your question'}
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    glow={true}
                    aria-label="Send message"
                    title="Send your question to the AI tutor"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Zap className="w-3 h-3" />
                    <span>Powered by Advanced AI • Always Learning</span>
                  </div>
                  
                  {isListening && (
                    <motion.div
                      className="flex items-center gap-2 text-xs text-red-500"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span>Listening...</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
