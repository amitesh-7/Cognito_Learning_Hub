import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Trash2,
  MessageSquare,
  Sparkles,
  Target,
  Brain,
  Loader2,
} from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

const StudyBuddyChat = ({ context = {} }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [showHistory, setShowHistory] = useState(false); // mobile drawer toggle
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchConversations();
    // If quiz context is provided, show a helpful message
    if (context?.quizTitle) {
      setInputMessage(
        `I just completed "${context.quizTitle}" and scored ${context.score}/${context.totalQuestions} (${context.percentage}%). Can you help me improve?`
      );
    }
  }, [context]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3002"
        }/api/study-buddy/chat/conversations`,
        {
          headers: { "x-auth-token": token },
        }
      );
      const data = await response.json();
      if (data.success) {
        setConversations(data.data.conversations || []);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3002"
        }/api/study-buddy/chat/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({
            message: inputMessage,
            sessionId,
            context,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        const aiMessage = {
          role: "assistant",
          content: data.data.response,
          timestamp: new Date(),
          metadata: data.data.metadata,
        };
        setMessages((prev) => [...prev, aiMessage]);
        setSessionId(data.data.sessionId);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        role: "assistant",
        content:
          "Sorry, I encountered an error. Please try again or check your connection.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversation = async (convSessionId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3002"
        }/api/study-buddy/chat/conversation/${convSessionId}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      const data = await response.json();
      if (data.success && data.data.conversation) {
        setMessages(data.data.conversation.messages);
        setSessionId(convSessionId);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setSessionId(null);
  };

  const deleteConversation = async (convSessionId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3002"
        }/api/study-buddy/chat/conversation/${convSessionId}`,
        {
          method: "DELETE",
          headers: { "x-auth-token": token },
        }
      );
      fetchConversations();
      if (sessionId === convSessionId) {
        startNewConversation();
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[calc(100vh-140px)]">
      {/* Conversation History Sidebar (desktop) */}
      <Card className="hidden lg:block lg:col-span-1 p-4 overflow-y-auto bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            History
          </h3>
          <Button
            onClick={startNewConversation}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            New Chat
          </Button>
        </div>
        <div className="space-y-2">
          {conversations.map((conv) => (
            <motion.div
              key={conv.sessionId}
              whileHover={{ scale: 1.02 }}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                sessionId === conv.sessionId
                  ? "bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-500"
                  : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <div
                onClick={() => loadConversation(conv.sessionId)}
                className="flex-1"
              >
                <p className="text-sm font-medium truncate">
                  {conv.messages[0]?.content.substring(0, 30)}...
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(conv.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.sessionId);
                }}
                size="sm"
                variant="ghost"
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Mobile History Drawer */}
      {showHistory && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
          <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] rounded-t-2xl bg-white dark:bg-gray-900 p-4 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                History
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={startNewConversation}
                  className="text-xs"
                >
                  New Chat
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowHistory(false)}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {conversations.map((conv) => (
                <motion.div
                  key={conv.sessionId}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    sessionId === conv.sessionId
                      ? "bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-500"
                      : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => {
                    loadConversation(conv.sessionId);
                    setShowHistory(false);
                  }}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">
                      {conv.messages[0]?.content.substring(0, 30)}...
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(conv.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.sessionId);
                    }}
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <Card className="lg:col-span-3 flex flex-col bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="p-4 border-b dark:border-gray-700 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Study Buddy</h2>
              <p className="text-xs text-white/80">
                Your personal learning companion
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Sparkles className="w-16 h-16 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Ask me anything! I can help you understand concepts, review
                topics, set learning goals, and guide you through challenging
                subjects.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-6 max-w-2xl">
                <Button
                  variant="outline"
                  className="text-left justify-start"
                  onClick={() =>
                    setInputMessage(
                      "Can you help me understand integration in calculus?"
                    )
                  }
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Explain a concept
                </Button>
                <Button
                  variant="outline"
                  className="text-left justify-start"
                  onClick={() =>
                    setInputMessage("What should I study to improve my scores?")
                  }
                >
                  <Target className="w-4 h-4 mr-2" />
                  Get study advice
                </Button>
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[90%] md:max-w-[75%] rounded-2xl p-4 ${
                    message.role === "user"
                      ? "bg-indigo-600 text-white"
                      : message.isError
                      ? "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.metadata && (
                    <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600 text-xs opacity-70">
                      {message.metadata.memoriesUsed > 0 && (
                        <span>
                          💡 Used {message.metadata.memoriesUsed} memories
                        </span>
                      )}
                      {message.metadata.relatedGoals?.length > 0 && (
                        <span className="ml-2">
                          🎯 Related goals:{" "}
                          {message.metadata.relatedGoals.join(", ")}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-xs opacity-60 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t dark:border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !isLoading && sendMessage()
              }
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudyBuddyChat;
