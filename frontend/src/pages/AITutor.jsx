import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Plus,
  Bot,
  User,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Menu,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const AITutor = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const examplePrompts = [
    "Explain photosynthesis in simple terms",
    "Help me solve quadratic equations",
    "What caused World War II?",
    "Explain Newton's laws of motion",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e, promptText = null) => {
    e?.preventDefault();
    const messageText = promptText || input.trim();

    if (!messageText || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      const token =
        localStorage.getItem("quizwise-token") || localStorage.getItem("token");

      const response = await fetch(`${apiUrl}/api/doubt-solver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await response.json();

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.reply || "Sorry, I could not process your request.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (voiceEnabled && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(aiMessage.content);
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startNewChat = () => {
    setMessages([]);
  };

  return (
    <div className="h-screen bg-white dark:bg-gray-900 flex">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="fixed lg:relative z-40 w-70 bg-gray-900 dark:bg-black h-full flex flex-col border-r border-gray-800"
          >
            <div className="p-4 border-b border-gray-800">
              <button
                onClick={startNewChat}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-700 hover:bg-gray-800 transition text-white"
              >
                <Plus className="w-4 h-4" />
                <span>New chat</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-2">
                <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Recent
                </h3>
                {/* Chat history would go here */}
              </div>
            </div>

            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition lg:hidden"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Tutor
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-2 rounded-lg transition ${
                  voiceEnabled
                    ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {voiceEnabled ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-4 pb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-2xl mx-auto"
              >
                <div className="inline-flex p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  How can I help you today?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  Ask me anything about your studies, homework, or any topic
                  you'd like to learn!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
                  {examplePrompts.map((prompt, index) => (
                    <motion.button
                      key={index}
                      onClick={(e) => handleSend(e, prompt)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group p-4 text-left rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                      <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                        {prompt}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`mb-6 ${
                      message.role === "user" ? "flex justify-end" : ""
                    }`}
                  >
                    <div
                      className={`flex gap-4 max-w-full ${
                        message.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {message.role === "user" ? (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                            {user?.name?.charAt(0) || "U"}
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {message.role === "user" ? "You" : "AI Tutor"}
                          </span>
                        </div>

                        <div
                          className={`rounded-2xl p-4 ${
                            message.role === "user"
                              ? "bg-purple-500 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                          }`}
                        >
                          {message.role === "assistant" ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>
                          )}
                        </div>

                        {message.role === "assistant" && (
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() =>
                                copyToClipboard(message.content, message.id)
                              }
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-gray-600 dark:text-gray-400"
                              title="Copy"
                            >
                              {copiedId === message.id ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={(e) => handleSend(e, message.content)}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-gray-600 dark:text-gray-400"
                              title="Regenerate"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4 mb-6"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4">
                      <div className="flex gap-1">
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
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <form onSubmit={handleSend} className="relative">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-2xl p-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message AI Tutor..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl transition-colors"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </form>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
              AI can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
