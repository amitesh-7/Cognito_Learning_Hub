import React, { useState, useRef, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Avatar3D from "./Avatar3D";
import { useAvatar } from "../../context/AvatarContext";
import { AuthContext } from "../../context/AuthContext";
import {
  FaComments,
  FaTimes,
  FaMicrophone,
  FaPaperPlane,
  FaExpand,
  FaCompress,
} from "react-icons/fa";

/**
 * AI Companion - Floating avatar assistant that can answer questions
 * Appears on every page, draggable, minimizable
 */
const AICompanion = () => {
  const { avatar3DConfig, isUsing3D } = useAvatar();
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "assistant",
      text: "Hi! I'm your AI learning companion. Ask me anything about your studies! 🎓",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [position, setPosition] = useState({
    x: 20,
    y: window.innerHeight - 420,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const messagesEndRef = useRef(null);

  const defaultConfig = {
    skinColor: "#FFD6A5",
    eyeColor: "#2C3E50",
    hairColor: "#8B4513",
    hairStyle: "short",
    shirtColor: "#3498DB",
    pantsColor: "#2C3E50",
    expression: "happy",
    glasses: false,
    hat: null,
  };

  const avatarConfig = avatar3DConfig || defaultConfig;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle dragging
  const handleMouseDown = (e) => {
    if (e.target.closest(".drag-handle")) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: Math.max(
          0,
          Math.min(window.innerWidth - 400, position.x + e.movementX)
        ),
        y: Math.max(
          0,
          Math.min(window.innerHeight - 600, position.y + e.movementY)
        ),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, position]);

  // Send message to AI
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      type: "user",
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const token = localStorage.getItem("quizwise-token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ai-tutor/ask`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({
            question: input,
            context: "general_question",
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          type: "assistant",
          text:
            data.answer ||
            data.explanation ||
            "I can help you with that! Could you provide more details?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage = {
        type: "assistant",
        text: "Sorry, I'm having trouble connecting right now. Please try again! 😊",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle companion visibility
  const toggleCompanion = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const minimizeCompanion = () => {
    setIsMinimized(true);
  };

  const expandCompanion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* Floating 3D Avatar - Always Visible */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={toggleCompanion}
            className="fixed bottom-6 right-6 z-50 cursor-pointer"
            whileHover={{ scale: 1.1 }}
            title="Chat with AI Companion"
          >
            {/* 3D Avatar Container */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden shadow-2xl border-4 border-purple-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
                <Avatar3D
                  config={avatarConfig}
                  width="100%"
                  height="100%"
                  animate={true}
                />
              </div>
              {/* Online Indicator */}
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-900 animate-pulse"></div>
              {/* Notification Badge */}
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold"
              >
                AI
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Companion Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dragRef}
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              width: isExpanded ? "450px" : isMinimized ? "80px" : "320px",
              height: isExpanded ? "550px" : isMinimized ? "80px" : "450px",
            }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            style={{
              position: "fixed",
              bottom: "24px",
              right: "24px",
              zIndex: 9999,
            }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-500/50"
            onMouseDown={handleMouseDown}
          >
            {/* Compact Header */}
            <div className="drag-handle cursor-move bg-gradient-to-r from-blue-500 to-purple-500 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <div>
                  <h3 className="text-white font-semibold text-sm">
                    AI Assistant
                  </h3>
                  <p className="text-white/80 text-xs">
                    {user?.name || "Student"}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={minimizeCompanion}
                  className="text-white hover:bg-white/20 w-6 h-6 rounded-md transition-colors text-xs"
                >
                  _
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 w-6 h-6 rounded-md transition-colors"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <div
                className="flex flex-col h-full"
                onMouseDown={(e) => e.stopPropagation()}
              >
                {/* Compact Avatar */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-3 flex items-center justify-center">
                  <div style={{ width: "100px", height: "100px" }}>
                    <Avatar3D
                      config={avatarConfig}
                      width="100%"
                      height="100%"
                      animate={true}
                    />
                  </div>
                </div>

                {/* Chat Messages - Compact */}
                <div
                  className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50 dark:bg-gray-900"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.type === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-2xl ${
                          message.type === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm"
                        }`}
                      >
                        <p className="text-xs whitespace-pre-wrap leading-relaxed">
                          {message.text}
                        </p>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-2xl shadow-sm">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                          <div
                            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.4s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Compact Input */}
                <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <div
                    className="flex gap-2"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Ask me..."
                      className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
                    />
                    <button
                      onClick={handleSendMessage}
                      onMouseDown={(e) => e.stopPropagation()}
                      disabled={!input.trim()}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaPaperPlane className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AICompanion;
