import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import {
  Send,
  Plus,
  Bot,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Menu,
  X,
  Trash2,
  MessageSquare,
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
  Settings,
  BookOpen,
  ChevronDown,
  Heart,
  ThumbsUp,
  Zap,
  Star,
  Brain,
  Lightbulb,
} from "lucide-react";

const AITutor = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fontSize, setFontSize] = useState("medium");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [favoriteMessages, setFavoriteMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const speechSynthesis = window.speechSynthesis;

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

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ai-tutor-chats");
    if (saved) {
      const parsed = JSON.parse(saved);
      setConversations(parsed);
      if (parsed.length > 0) setCurrentConvId(parsed[0].id);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem("ai-tutor-chats", JSON.stringify(conversations));
    }
  }, [conversations]);

  const currentMessages =
    conversations.find((c) => c.id === currentConvId)?.messages || [];

  // Auto-scroll only when loading completes (new message received)
  useEffect(() => {
    if (!isLoading && currentMessages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isLoading]); // Only scroll when loading state changes

  const handleSend = async (e, promptText = null) => {
    e?.preventDefault();
    const text = promptText || input.trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: text,
      time: new Date().toISOString(),
    };

    let conversationId = currentConvId;

    // Create new conversation if none exists
    if (!currentConvId) {
      const newConv = {
        id: Date.now(),
        title: text.substring(0, 30) + "...",
        messages: [userMsg],
        createdAt: new Date().toISOString(),
      };
      conversationId = newConv.id;
      setConversations([newConv, ...conversations]);
      setCurrentConvId(newConv.id);
    } else {
      // Add to existing conversation
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConvId
            ? { ...conv, messages: [...conv.messages, userMsg] }
            : conv
        )
      );
    }

    setInput("");
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const token =
        localStorage.getItem("quizwise-token") || localStorage.getItem("token");

      console.log("Sending message to:", `${apiUrl}/api/doubt-solver`);

      const res = await fetch(`${apiUrl}/api/doubt-solver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      });

      console.log("Response status:", res.status);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Response data:", data);

      const aiMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.reply || "Sorry, I couldn't help with that.",
        time: new Date().toISOString(),
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
      console.error("Error details:", error);
      const errorMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "Sorry, the backend server is not responding. Please make sure the backend is running.",
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
  };

  const startNewChat = () => {
    setCurrentConvId(null);
  };

  const deleteConversation = (id) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentConvId === id) setCurrentConvId(null);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Voice Recognition
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

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

  // Toggle favorite message
  const toggleFavorite = (messageId) => {
    setFavoriteMessages((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black flex overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed lg:relative z-40 w-72 bg-white dark:bg-gray-900 h-full border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-xl"
          >
            {/* New Chat Button */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={startNewChat}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all text-white font-medium shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span>New Chat</span>
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-3">
              <h3 className="px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Recent Chats
              </h3>
              <div className="space-y-2 mt-2">
                {conversations.length === 0 ? (
                  <div className="px-3 py-8 text-center text-sm text-gray-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`group flex items-center gap-2 px-3 py-3 rounded-lg cursor-pointer transition-all ${
                        currentConvId === conv.id
                          ? "bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => setCurrentConvId(conv.id)}
                    >
                      <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {conv.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(conv.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    AI Study Assistant
                  </h1>
                  <p className="text-sm text-gray-500">
                    Your personal learning companion
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Voice Controls */}
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-2 rounded-lg transition-all ${
                  voiceEnabled
                    ? "bg-green-100 dark:bg-green-900 text-green-600"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                title={voiceEnabled ? "Disable voice" : "Enable voice"}
              >
                {voiceEnabled ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </button>

              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="p-2 rounded-lg bg-red-50 dark:bg-red-900 text-red-600 hover:bg-red-100 dark:hover:bg-red-800 transition-all"
                  title="Stop speaking"
                >
                  <VolumeX className="w-5 h-5" />
                </button>
              )}

              {/* Font Size Controls */}
              <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-800">
                <button
                  onClick={() => setFontSize("small")}
                  className={`p-1 rounded text-xs transition-colors ${
                    fontSize === "small"
                      ? "bg-purple-500 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  title="Small font"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize("medium")}
                  className={`p-1 rounded text-sm transition-colors ${
                    fontSize === "medium"
                      ? "bg-purple-500 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  title="Medium font"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize("large")}
                  className={`p-1 rounded text-base transition-colors ${
                    fontSize === "large"
                      ? "bg-purple-500 text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  title="Large font"
                >
                  A
                </button>
              </div>

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {currentMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-6 pb-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-2xl"
              >
                <div className="inline-flex p-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mb-6 shadow-2xl">
                  <Sparkles className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  Hello, {user?.name?.split(" ")[0] || "there"}!
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
                  How can I help you learn today?
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {examplePrompts.map((prompt, i) => (
                    <motion.button
                      key={i}
                      onClick={(e) => handleSend(e, prompt)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-5 text-left rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all shadow-sm hover:shadow-lg group"
                    >
                      <p className="text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 font-medium">
                        {prompt}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-6 py-8">
              <AnimatePresence>
                {currentMessages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-8"
                  >
                    <div
                      className={`flex gap-4 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                          <Bot className="w-6 h-6 text-white" />
                        </div>
                      )}

                      <div
                        className={`max-w-2xl ${
                          msg.role === "user" ? "order-first" : ""
                        }`}
                      >
                        <div
                          className={`rounded-3xl px-6 py-4 shadow-md ${
                            msg.role === "user"
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                          }`}
                        >
                          {msg.role === "assistant" ? (
                            <div
                              className={`prose max-w-none dark:prose-invert prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:leading-relaxed prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-code:text-purple-600 dark:prose-code:text-purple-400 prose-code:bg-gray-200 dark:prose-code:bg-gray-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-ul:list-disc prose-ol:list-decimal prose-li:my-1 prose-strong:font-bold prose-strong:text-gray-900 dark:prose-strong:text-white ${
                                fontSize === "small"
                                  ? "prose-sm"
                                  : fontSize === "large"
                                  ? "prose-lg"
                                  : "prose-base"
                              }`}
                            >
                              <ReactMarkdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p
                              className={`leading-relaxed whitespace-pre-wrap ${
                                fontSize === "small"
                                  ? "text-sm"
                                  : fontSize === "large"
                                  ? "text-lg"
                                  : "text-base"
                              }`}
                            >
                              {msg.content}
                            </p>
                          )}
                        </div>

                        {msg.role === "assistant" && (
                          <div className="flex items-center gap-2 mt-2 ml-2 flex-wrap">
                            <button
                              onClick={() => toggleFavorite(msg.id)}
                              className={`px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-xs flex items-center gap-1 ${
                                favoriteMessages.includes(msg.id)
                                  ? "text-red-500"
                                  : "text-gray-500"
                              }`}
                              title={
                                favoriteMessages.includes(msg.id)
                                  ? "Remove from favorites"
                                  : "Add to favorites"
                              }
                            >
                              <Heart
                                className={`w-3 h-3 ${
                                  favoriteMessages.includes(msg.id)
                                    ? "fill-red-500"
                                    : ""
                                }`}
                              />
                              {favoriteMessages.includes(msg.id)
                                ? "Saved"
                                : "Save"}
                            </button>
                            <button
                              onClick={() =>
                                copyToClipboard(msg.content, msg.id)
                              }
                              className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs flex items-center gap-1"
                              title="Copy"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-green-500" />{" "}
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" /> Copy
                                </>
                              )}
                            </button>
                            {voiceEnabled && (
                              <button
                                onClick={() => speakMessage(msg.content)}
                                disabled={isSpeaking}
                                className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs flex items-center gap-1 disabled:opacity-50"
                                title="Read aloud"
                              >
                                <Volume2
                                  className={`w-3 h-3 ${
                                    isSpeaking ? "animate-pulse" : ""
                                  }`}
                                />
                                {isSpeaking ? "Speaking..." : "Speak"}
                              </button>
                            )}
                            <button
                              className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs flex items-center gap-1"
                              title="Like this response"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              Like
                            </button>
                          </div>
                        )}
                      </div>

                      {msg.role === "user" && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg">
                          {user?.name?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-3xl px-6 py-4 shadow-md">
                    <div className="flex gap-2">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="sticky bottom-0 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pt-6 pb-6">
          <div className="max-w-4xl mx-auto px-6">
            <form onSubmit={handleSend} className="relative">
              <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-3">
                <button
                  type="button"
                  onClick={startListening}
                  disabled={isListening || isLoading}
                  className={`p-2 rounded-lg transition-colors ${
                    isListening
                      ? "text-red-500 animate-pulse"
                      : "text-gray-400 hover:text-purple-500"
                  } disabled:opacity-50`}
                  title={isListening ? "Listening..." : "Voice input"}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-base"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed rounded-2xl transition-all shadow-lg hover:shadow-xl"
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
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                Listening...
              </motion.p>
            )}
            <p className="text-xs text-center text-gray-400 mt-3">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
