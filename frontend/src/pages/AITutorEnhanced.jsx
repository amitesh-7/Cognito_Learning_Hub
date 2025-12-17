import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import "katex/dist/katex.min.css";
import {
  Send, Plus, Bot, Sparkles, Volume2, VolumeX, Copy, Check, Menu, X, Trash2,
  MessageSquare, Mic, MicOff, Settings, BookOpen, ChevronDown, Heart, ThumbsUp,
  Zap, Star, Brain, Lightbulb, Paperclip, FileText, Image as ImageIcon, File,
  XCircle, ArrowLeft, Play, Download, Share2, Search, Calendar, Clock, Code2,
  Camera, Users, Bookmark, Filter, MoreVertical, Edit3, Save, Layout, Map,
  TrendingUp, BarChart3, PieChart, Workflow, GitBranch, Target, Award, Layers,
  Maximize2, Minimize2, RefreshCw, Upload, Image, Video, FileCode, Terminal
} from "lucide-react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const AITutorEnhanced = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Core States
  const [conversations, setConversations] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Enhanced Features States
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [filterTags, setFilterTags] = useState([]);
  const [selectedMode, setSelectedMode] = useState("chat"); // chat, code, study, image
  const [codeLanguage, setCodeLanguage] = useState("python");
  const [codeOutput, setCodeOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);
  const [showStudyPlan, setShowStudyPlan] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [savedResponses, setSavedResponses] = useState([]);
  const [showWebcam, setShowWebcam] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [shareLink, setShareLink] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [favoriteMessages, setFavoriteMessages] = useState([]);
  const [fontSize, setFontSize] = useState("medium");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [imagePrompt, setImagePrompt] = useState("");
  
  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Prevent body scroll - only chat container should scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl+K: Focus search
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      // Ctrl+N: New conversation
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        startNewChat();
      }
      // Ctrl+S: Save current chat
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        exportAsPDF();
      }
      // Ctrl+/: Show shortcuts
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        setShowSettings(true);
      }
      // Escape: Close modals
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowTemplates(false);
        setShowShareModal(false);
        setShowSettings(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Example prompts & quick actions from original
  const examplePrompts = [
    "Explain photosynthesis",
    "Help with quadratic equations",
    "World War II causes",
    "Newton's laws of motion",
  ];

  const quickActions = [
    {
      icon: "🔍",
      text: "Explain this concept",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: "📝",
      text: "Help with homework",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: "🧮",
      text: "Solve this problem",
      color: "from-purple-500 to-pink-600",
    },
    {
      icon: "💡",
      text: "Give me examples",
      color: "from-orange-500 to-red-600",
    },
  ];

  const suggestedQuestions = [
    {
      category: "Science",
      icon: "⚛️",
      questions: [
        "Explain photosynthesis in simple terms",
        "What is Newton's First Law of Motion?",
        "How does DNA replication work?",
        "What causes earthquakes?",
      ],
    },
    {
      category: "Mathematics",
      icon: "📐",
      questions: [
        "Solve quadratic equations step by step",
        "Explain calculus derivatives",
        "How to find the area of a circle?",
        "What is the Pythagorean theorem?",
      ],
    },
    {
      category: "History",
      icon: "📚",
      questions: [
        "Summarize the main causes of World War II",
        "Explain the Industrial Revolution",
        "What was the Renaissance period?",
        "Timeline of Ancient Egyptian civilization",
      ],
    },
  ];

  // Load data from localStorage (using original key for compatibility)
  useEffect(() => {
    const saved = localStorage.getItem("ai-tutor-chats");
    if (saved) {
      const parsed = JSON.parse(saved);
      setConversations(parsed);
      if (parsed.length > 0) setCurrentConvId(parsed[0].id);
    }
    
    // Load favorites separately
    const savedFavorites = localStorage.getItem("ai-tutor-favorites");
    if (savedFavorites) {
      setFavoriteMessages(JSON.parse(savedFavorites));
    }
    
    // Set default templates
    setTemplates(defaultTemplates);
  }, []);

  // Save to localStorage (using original key for compatibility)
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("ai-tutor-chats", JSON.stringify(conversations));
    }
  }, [conversations]);
  
  useEffect(() => {
    if (favoriteMessages.length > 0) {
      localStorage.setItem("ai-tutor-favorites", JSON.stringify(favoriteMessages));
    }
  }, [favoriteMessages]);

  const currentMessages = useMemo(
    () => conversations.find((c) => c.id === currentConvId)?.messages || [],
    [conversations, currentConvId]
  );

  // Auto-scroll
  useEffect(() => {
    if (!isLoading && currentMessages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isLoading, currentMessages.length]);
  
  // Speaking state management
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Code Execution
  const executeCode = async (code, language) => {
    setIsExecuting(true);
    setCodeOutput("Executing...");
    
    try {
      if (language === "python") {
        // Use Skulpt for Python execution
        const output = await executePython(code);
        setCodeOutput(output);
      } else if (language === "javascript") {
        // Execute JavaScript in sandbox
        const output = executeJavaScript(code);
        setCodeOutput(output);
      }
    } catch (error) {
      setCodeOutput(`Error: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const executePython = (code) => {
    return new Promise((resolve, reject) => {
      let output = "";
      
      // Simple Python interpreter simulation
      try {
        // This is a simplified version - in production, use Pyodide or backend API
        output = "Python execution simulated. Use backend API for real execution.";
        resolve(output);
      } catch (error) {
        reject(error);
      }
    });
  };

  const executeJavaScript = (code) => {
    try {
      // Capture console output
      const logs = [];
      const originalLog = console.log;
      console.log = (...args) => logs.push(args.join(' '));
      
      // Execute code
      eval(code);
      
      // Restore console.log
      console.log = originalLog;
      
      return logs.length > 0 ? logs.join('\n') : "Code executed successfully (no output)";
    } catch (error) {
      return `Error: ${error.message}`;
    }
  };

  // Image Generation
  const generateImage = async (prompt) => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("quizwise-token") || localStorage.getItem("token");
      
      const response = await fetch(`${apiUrl}/api/doubt-solver/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      });
      
      const data = await response.json();
      setGeneratedImage(data.imageUrl);
      
      // Add to conversation
      const imageMsg = {
        id: Date.now(),
        role: "assistant",
        content: `Generated image for: "${prompt}"`,
        imageUrl: data.imageUrl,
        time: new Date().toISOString()
      };
      
      addMessageToConversation(imageMsg);
    } catch (error) {
      console.error("Image generation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Study Plan Generation
  const generateStudyPlan = async (topic, duration, level) => {
    setIsLoading(true);
    try {
      const plan = {
        topic,
        duration,
        level,
        weeks: [],
        milestones: [],
        resources: []
      };
      
      // Generate weekly breakdown
      const weeks = Math.ceil(duration / 7);
      for (let i = 1; i <= weeks; i++) {
        plan.weeks.push({
          week: i,
          topics: [`Week ${i} topics for ${topic}`],
          goals: [`Complete ${topic} module ${i}`],
          assignments: [`Practice problems set ${i}`]
        });
      }
      
      setStudyPlan(plan);
      setShowStudyPlan(true);
    } catch (error) {
      console.error("Study plan error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send Message
  const handleSend = useCallback(async (e, promptText = null) => {
    e?.preventDefault();
    const text = promptText || input.trim();
    if ((!text && attachedFiles.length === 0) || isLoading) return;

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: text || "Uploaded files for analysis",
      files: attachedFiles.map((f) => ({ name: f.name, type: f.type, size: f.size })),
      time: new Date().toISOString(),
      mode: selectedMode
    };

    let conversationId = currentConvId;

    if (!currentConvId) {
      const newConv = {
        id: Date.now(),
        title: text.substring(0, 30) + "..." || "New conversation",
        messages: [userMsg],
        createdAt: new Date().toISOString(),
        tags: [selectedMode],
        shared: false,
        collaborators: []
      };
      conversationId = newConv.id;
      setConversations([newConv, ...conversations]);
      setCurrentConvId(newConv.id);
    } else {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConvId
            ? { ...conv, messages: [...conv.messages, userMsg] }
            : conv
        )
      );
    }

    setInput("");
    const filesToSend = [...attachedFiles];
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("quizwise-token") || localStorage.getItem("token");

      const formData = new FormData();
      formData.append("message", text || "Please analyze these files");
      formData.append("mode", selectedMode);
      filesToSend.forEach((file) => formData.append("files", file));

      const res = await fetch(`${apiUrl}/api/doubt-solver`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      const aiMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.data?.reply || data.reply || "Sorry, I couldn't help with that.",
        time: new Date().toISOString(),
        mode: selectedMode
      };

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? { ...conv, messages: [...conv.messages, aiMsg] }
            : conv
        )
      );

      if (voiceEnabled && "speechSynthesis" in window) {
        setTimeout(() => speakMessage(aiMsg.content), 500);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, the server is not responding. Please try again.",
        time: new Date().toISOString(),
      };
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? { ...conv, messages: [...conv.messages, errorMsg] }
            : conv
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, currentConvId, conversations, voiceEnabled, attachedFiles, selectedMode]);

  // Helper Functions
  const addMessageToConversation = (message) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConvId
          ? { ...conv, messages: [...conv.messages, message] }
          : conv
      )
    );
  };

  const startNewChat = () => {
    setCurrentConvId(null);
    setInput("");
    setAttachedFiles([]);
  };

  const deleteConversation = (id) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentConvId === id) setCurrentConvId(null);
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
    setCopiedId(content);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleFavorite = (messageId) => {
    setFavoriteMessages((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  };

  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };
  
  // Voice recognition
  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };
      
      recognition.start();
    } else {
      alert('Voice recognition is not supported in your browser. Please use Chrome or Edge.');
    }
  };
  const exportAsPDF = async () => {
    const element = chatContainerRef.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`chat-${currentConvId}-${Date.now()}.pdf`);
  };

  const exportAsMarkdown = () => {
    const currentConv = conversations.find(c => c.id === currentConvId);
    if (!currentConv) return;
    
    let markdown = `# ${currentConv.title}\n\n`;
    markdown += `Created: ${new Date(currentConv.createdAt).toLocaleString()}\n\n`;
    markdown += `---\n\n`;
    
    currentConv.messages.forEach(msg => {
      markdown += `## ${msg.role === 'user' ? 'You' : 'AI Assistant'}\n`;
      markdown += `${msg.content}\n\n`;
    });
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${currentConvId}.md`;
    a.click();
  };

  const shareConversation = () => {
    const link = `${window.location.origin}/shared-chat/${currentConvId}`;
    setShareLink(link);
    navigator.clipboard.writeText(link);
    setShowShareModal(true);
  };

  // File Handling
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };
  
  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="w-4 h-4" />;
    if (fileType === "application/pdf") return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  // Voice Input - removed duplicate (defined above)

  // Search Conversations
  const searchConversations = (query) => {
    return conversations.filter(conv =>
      conv.title.toLowerCase().includes(query.toLowerCase()) ||
      conv.messages.some(msg => msg.content.toLowerCase().includes(query.toLowerCase()))
    );
  };

  // Templates
  const defaultTemplates = [
    { id: 1, name: "Explain Concept", prompt: "Explain [concept] in simple terms with examples", category: "Learning" },
    { id: 2, name: "Debug Code", prompt: "Help me debug this code:\n```\n[paste code]\n```", category: "Coding" },
    { id: 3, name: "Create Study Plan", prompt: "Create a study plan for [subject] over [duration]", category: "Planning" },
    { id: 4, name: "Solve Problem", prompt: "Solve this step by step:\n[problem]", category: "Problem Solving" },
    { id: 5, name: "Generate Quiz", prompt: "Create a quiz on [topic] with [number] questions", category: "Assessment" }
  ];

  // Mode configurations
  const modes = [
    { id: "chat", name: "Chat", icon: MessageSquare, color: "violet" },
    { id: "code", name: "Code", icon: Code2, color: "blue" },
    { id: "study", name: "Study Plan", icon: Calendar, color: "green" },
    { id: "image", name: "Image Gen", icon: ImageIcon, color: "pink" }
  ];

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950/30">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed lg:relative z-50 lg:z-0 w-80 max-w-[85vw] h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">AI Tutor Pro</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Enhanced Edition</p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <button
                onClick={startNewChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                New Chat (Ctrl+N)
              </button>
              
              {/* Search */}
              <div className="mt-3 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search chats... (Ctrl+K)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
              {(searchQuery ? searchConversations(searchQuery) : conversations).map((conv) => (
                <motion.button
                  key={conv.id}
                  onClick={() => setCurrentConvId(conv.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    currentConvId === conv.id
                      ? "bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border-2 border-violet-500"
                      : "bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {conv.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {conv.messages.length} messages
                      </div>
                      {conv.tags && (
                        <div className="flex gap-1 mt-2">
                          {conv.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-[10px] rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          e.preventDefault();
                          deleteConversation(conv.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Templates Quick Access */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-violet-600" />
                  <span className="text-sm font-medium">Templates</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            {/* User Profile at Bottom */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <div className="h-16 flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 gap-3 z-10">
          <div className="flex items-center gap-2 lg:gap-4 min-w-0">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex-shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex-shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            
            {/* Mode Selector - Responsive */}
            <div className="flex gap-1 lg:gap-2 overflow-x-auto scrollbar-none flex-1 min-w-0">
              {modes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${
                      selectedMode === mode.id
                        ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">{mode.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-lg transition-all hidden sm:flex ${
                voiceEnabled
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title={voiceEnabled ? "Disable voice" : "Enable voice"}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all hidden sm:flex"
                title="Stop speaking"
              >
                <VolumeX className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg hidden md:flex"
              title="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              title="Settings (Ctrl+/)"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area - Only this scrolls */}
        <div 
          ref={chatContainerRef} 
          className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin"
          style={{ 
            height: 0, // This forces flex to calculate height properly
            minHeight: '0'
          }}
        >
          <div className="px-4 lg:px-6 py-4 lg:py-6 min-h-full">
          {currentMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="max-w-3xl mx-auto text-center px-4 w-full">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="w-16 lg:w-20 h-16 lg:h-20 mx-auto mb-4 lg:mb-6 rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-2xl"
                >
                  <Sparkles className="w-8 lg:w-10 h-8 lg:h-10 text-white" />
                </motion.div>
                <h1 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white mb-2 lg:mb-4">
                  Hello, {user?.name?.split(" ")[0] || "there"}!
                </h1>
                <p className="text-base lg:text-lg text-slate-600 dark:text-slate-400 mb-6 lg:mb-8">
                  How can I help you learn today?
                </p>
                
                {/* Example Prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3 mb-6 lg:mb-8">
                  {examplePrompts.map((prompt, i) => (
                    <motion.button
                      key={i}
                      onClick={(e) => handleSend(e, prompt)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-3 lg:p-4 text-left rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-slate-800/80 border border-white/60 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-500 transition-all shadow-lg hover:shadow-xl"
                    >
                      <p className="text-xs lg:text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-violet-700 dark:group-hover:text-violet-400">
                        {prompt}
                      </p>
                    </motion.button>
                  ))}
                </div>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2 lg:gap-3 mb-6 lg:mb-8">
                  {quickActions.map((action, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setInput(action.text + ": ")}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-3 lg:p-4 bg-gradient-to-r ${action.color} rounded-xl text-white text-left shadow-lg hover:shadow-xl transition-all`}
                    >
                      <div className="text-xl lg:text-2xl mb-1 lg:mb-2">{action.icon}</div>
                      <h3 className="font-bold text-xs lg:text-sm">{action.text}</h3>
                    </motion.button>
                  ))}
                </div>

                {/* Mode Selector Cards */}
                <div className="grid grid-cols-2 gap-3 lg:gap-4 mt-6 lg:mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedMode("code");
                      setInput("Help me write a Python function to...");
                    }}
                    className="p-4 lg:p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white text-left"
                  >
                    <Code2 className="w-6 lg:w-8 h-6 lg:h-8 mb-2 lg:mb-3" />
                    <h3 className="font-bold text-sm lg:text-lg mb-1">Code Assistant</h3>
                    <p className="text-xs lg:text-sm text-white/80 hidden sm:block">Write, debug, and execute code</p>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedMode("image");
                      setInput("Generate an image of...");
                    }}
                    className="p-4 lg:p-6 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl text-white text-left"
                  >
                    <ImageIcon className="w-6 lg:w-8 h-6 lg:h-8 mb-2 lg:mb-3" />
                    <h3 className="font-bold text-sm lg:text-lg mb-1">Image Generator</h3>
                    <p className="text-xs lg:text-sm text-white/80 hidden sm:block">Create diagrams and illustrations</p>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedMode("study");
                      setInput("Create a study plan for...");
                    }}
                    className="p-4 lg:p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl text-white text-left"
                  >
                    <Calendar className="w-6 lg:w-8 h-6 lg:h-8 mb-2 lg:mb-3" />
                    <h3 className="font-bold text-sm lg:text-lg mb-1">Study Planner</h3>
                    <p className="text-xs lg:text-sm text-white/80 hidden sm:block">Personalized learning roadmaps</p>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedMode("chat");
                      setInput("Explain the concept of...");
                    }}
                    className="p-4 lg:p-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl text-white text-left"
                  >
                    <Brain className="w-6 lg:w-8 h-6 lg:h-8 mb-2 lg:mb-3" />
                    <h3 className="font-bold text-sm lg:text-lg mb-1">Smart Chat</h3>
                    <p className="text-xs lg:text-sm text-white/80 hidden sm:block">Ask anything, learn everything</p>
                  </motion.button>
                </div>

                {/* Keyboard Shortcuts Info */}
                <div className="mt-6 lg:mt-8 p-3 lg:p-4 bg-slate-100 dark:bg-slate-800 rounded-xl hidden md:block">
                  <h4 className="font-bold text-sm mb-3 text-slate-900 dark:text-white">Keyboard Shortcuts</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <div><kbd className="px-2 py-1 bg-white dark:bg-slate-900 rounded">Ctrl+K</kbd> Search</div>
                    <div><kbd className="px-2 py-1 bg-white dark:bg-slate-900 rounded">Ctrl+N</kbd> New Chat</div>
                    <div><kbd className="px-2 py-1 bg-white dark:bg-slate-900 rounded">Ctrl+S</kbd> Export PDF</div>
                    <div><kbd className="px-2 py-1 bg-white dark:bg-slate-900 rounded">Ctrl+/</kbd> Settings</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4 lg:space-y-6 pb-4">{currentMessages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex gap-3 lg:gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-violet-600 to-fuchsia-600"
                      : "bg-gradient-to-br from-blue-500 to-indigo-600"
                  }`}>
                    {msg.role === "user" ? (
                      <span className="text-white font-bold text-sm lg:text-lg">{user?.name?.[0] || "U"}</span>
                    ) : (
                      <Bot className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 min-w-0 ${msg.role === "user" ? "text-right" : ""}`}>
                    <div className={`inline-block max-w-full lg:max-w-[85%] ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
                        : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    } rounded-2xl p-3 lg:p-4 shadow-lg break-words`}>
                      {msg.role === "user" ? (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                              code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                  <div className="relative">
                                    <SyntaxHighlighter
                                      style={vscDarkPlus}
                                      language={match[1]}
                                      PreTag="div"
                                      {...props}
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                    {selectedMode === "code" && (
                                      <button
                                        onClick={() => executeCode(String(children), match[1])}
                                        className="absolute top-2 right-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg flex items-center gap-1"
                                      >
                                        <Play className="w-3 h-3" />
                                        Run
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                );
                              }
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                      
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt="Generated"
                          className="mt-3 rounded-lg max-w-full"
                        />
                      )}
                    </div>

                    {/* Message Actions */}
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                      <span>{new Date(msg.time).toLocaleTimeString()}</span>
                      <button
                        onClick={() => toggleFavorite(msg.id)}
                        className={`p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded ${
                          favoriteMessages.includes(msg.id) ? "text-red-500" : ""
                        }`}
                        title={favoriteMessages.includes(msg.id) ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Heart className={`w-3 h-3 ${
                          favoriteMessages.includes(msg.id) ? "fill-red-500" : ""
                        }`} />
                      </button>
                      <button
                        onClick={() => copyMessage(msg.content)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                        title="Copy"
                      >
                        {copiedId === msg.content ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      {msg.role === "assistant" && voiceEnabled && (
                        <button
                          onClick={() => speakMessage(msg.content)}
                          disabled={isSpeaking}
                          className={`p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-50 ${
                            isSpeaking ? "animate-pulse text-violet-600" : ""
                          }`}
                          title={isSpeaking ? "Speaking..." : "Read aloud"}
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                        title="Like this response"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {codeOutput && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-slate-900 text-green-400 rounded-xl font-mono text-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">Output:</span>
                    <Terminal className="w-4 h-4" />
                  </div>
                  <pre className="whitespace-pre-wrap">{codeOutput}</pre>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 p-3 lg:p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-10">
          {/* File Attachments */}
          {attachedFiles.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {attachedFiles.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg"
                >
                  <FileText className="w-4 h-4 text-violet-600" />
                  <span className="text-xs font-medium truncate max-w-[100px] lg:max-w-[150px]">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-0.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                  >
                    <XCircle className="w-4 h-4 text-red-500" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          <form onSubmit={handleSend} className="relative">
            <div className="flex items-center gap-2 lg:gap-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 lg:p-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,.pdf,.txt"
                multiple
                className="hidden"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                title="Attach files"
              >
                <Paperclip className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
              
              <button
                type="button"
                onClick={startListening}
                disabled={isListening || isLoading}
                className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0 ${
                  isListening ? "bg-red-100 dark:bg-red-900/30" : ""
                }`}
                title="Voice input"
              >
                {isListening ? (
                  <MicOff className="w-5 h-5 text-red-600" />
                ) : (
                  <Mic className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setShowWebcam(!showWebcam)}
                disabled={isLoading}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 hidden sm:flex flex-shrink-0"
                title="Webcam"
              >
                <Camera className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask in ${selectedMode} mode...`}
                disabled={isLoading}
                className="flex-1 bg-transparent px-2 lg:px-4 py-2 lg:py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-sm lg:text-base min-w-0"
              />
              
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 lg:p-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg flex-shrink-0"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </form>
          
          {isListening && (
            <motion.p
              className="text-xs text-center text-red-500 mt-2 flex items-center justify-center gap-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Listening...
            </motion.p>
          )}
          
          <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl mx-4 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-4 lg:p-6 max-h-[90vh] overflow-y-auto scrollbar-thin"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Settings & Shortcuts</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-base lg:text-lg mb-3">Keyboard Shortcuts</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { keys: "Ctrl+K", action: "Search conversations" },
                      { keys: "Ctrl+N", action: "New conversation" },
                      { keys: "Ctrl+S", action: "Export as PDF" },
                      { keys: "Ctrl+/", action: "Open settings" },
                      { keys: "Esc", action: "Close modals" },
                      { keys: "Ctrl+Enter", action: "Send message" }
                    ].map((shortcut, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <span className="text-xs lg:text-sm">{shortcut.action}</span>
                        <kbd className="px-2 lg:px-3 py-1 bg-white dark:bg-slate-900 rounded text-xs font-mono">
                          {shortcut.keys}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-base lg:text-lg mb-3">Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <span className="text-sm">Voice responses</span>
                      <button
                        onClick={() => setVoiceEnabled(!voiceEnabled)}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          voiceEnabled ? "bg-violet-600" : "bg-slate-300"
                        }`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          voiceEnabled ? "translate-x-6" : "translate-x-1"
                        }`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <span className="text-sm">Font size</span>
                      <select
                        value={fontSize}
                        onChange={(e) => setFontSize(e.target.value)}
                        className="px-3 py-1 bg-white dark:bg-slate-900 rounded-lg text-sm"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-base lg:text-lg mb-3">Export Options</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={exportAsPDF}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium"
                    >
                      <FileText className="w-5 h-5" />
                      <span className="text-sm lg:text-base">Export PDF</span>
                    </button>
                    <button
                      onClick={exportAsMarkdown}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
                    >
                      <FileCode className="w-5 h-5" />
                      <span className="text-sm lg:text-base">Export Markdown</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md mx-4 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-4 lg:p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Share Conversation</h2>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Share link:</p>
                  <code className="text-xs break-all text-violet-600 dark:text-violet-400">{shareLink}</code>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium"
                  >
                    <Copy className="w-5 h-5" />
                    <span className="text-sm lg:text-base">Copy Link</span>
                  </button>
                  <button
                    onClick={() => {
                      window.open(`https://twitter.com/intent/tweet?text=Check out this AI conversation!&url=${shareLink}`, '_blank');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm lg:text-base">Tweet</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates Modal */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTemplates(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl mx-4 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-4 lg:p-6 max-h-[90vh] overflow-y-auto scrollbar-thin"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Quick Templates</h2>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <motion.button
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setInput(template.prompt);
                      setShowTemplates(false);
                    }}
                    className="text-left p-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-slate-900 dark:text-white">{template.name}</h3>
                      <span className="text-xs px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full">
                        {template.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{template.prompt}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AITutorEnhanced;
