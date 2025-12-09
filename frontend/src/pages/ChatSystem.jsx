import React, { useState, useEffect, useContext, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import {
  MessageCircle,
  Send,
  Users,
  ArrowLeft,
  Smile,
  Search,
  Loader,
  Image as ImageIcon,
  MoreVertical,
  Clock,
  Check,
  CheckCheck,
  Paperclip,
} from "lucide-react";

const ChatSystem = () => {
  const { user } = useContext(AuthContext);
  const [friends, setFriends] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [friendsStatus, setFriendsStatus] = useState(new Map());
  const messageInputRef = useRef(null);
  const chatPollingRef = useRef(null);
  const statusPollingRef = useRef(null);
  const activityUpdateRef = useRef(null);

  useEffect(() => {
    fetchFriends();
    updateUserStatus("online");
    startStatusPolling();
    startActivityUpdates();

    // Set user offline when component unmounts or page closes
    const handleBeforeUnload = () => {
      updateUserStatus("offline");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (chatPollingRef.current) {
        clearInterval(chatPollingRef.current);
      }
      if (statusPollingRef.current) {
        clearInterval(statusPollingRef.current);
      }
      if (activityUpdateRef.current) {
        clearInterval(activityUpdateRef.current);
      }
      updateUserStatus("offline");
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      markMessagesAsRead();
      startMessagePolling();
    } else {
      stopMessagePolling();
    }
    return () => stopMessagePolling();
  }, [selectedChat]);

  const startMessagePolling = () => {
    stopMessagePolling();
    chatPollingRef.current = setInterval(() => {
      if (selectedChat) {
        fetchMessages(true); // Silent fetch
      }
    }, 2000); // Poll every 2 seconds for real-time effect
  };

  const stopMessagePolling = () => {
    if (chatPollingRef.current) {
      clearInterval(chatPollingRef.current);
      chatPollingRef.current = null;
    }
  };

  const updateUserStatus = async (status) => {
    try {
      const token = localStorage.getItem("quizwise-token");
      await fetch(`${import.meta.env.VITE_API_URL}/api/user/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const startStatusPolling = () => {
    statusPollingRef.current = setInterval(() => {
      fetchFriendsStatus();
    }, 10000); // Poll status every 10 seconds
  };

  const startActivityUpdates = () => {
    activityUpdateRef.current = setInterval(() => {
      updateActivity();
    }, 60000); // Update activity every minute
  };

  const updateActivity = async () => {
    try {
      const token = localStorage.getItem("quizwise-token");
      await fetch(`${import.meta.env.VITE_API_URL}/api/user/activity`, {
        method: "PUT",
        headers: { "x-auth-token": token },
      });
    } catch (error) {
      console.error("Error updating activity:", error);
    }
  };

  const fetchFriendsStatus = async () => {
    try {
      const token = localStorage.getItem("quizwise-token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/friends-status`,
        {
          headers: { "x-auth-token": token },
        }
      );
      const data = await response.json();
      if (response.ok) {
        const statusMap = new Map();
        const onlineSet = new Set();

        data.friendsStatus?.forEach((friend) => {
          statusMap.set(friend.friendId, {
            status: friend.status,
            lastSeen: friend.lastSeen,
            lastActivity: friend.lastActivity,
            isOnline: friend.isOnline,
          });

          if (friend.isOnline) {
            onlineSet.add(friend.friendId);
          }
        });

        setFriendsStatus(statusMap);
        setOnlineUsers(onlineSet);
      }
    } catch (error) {
      console.error("Error fetching friends status:", error);
    }
  };

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem("quizwise-token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/friends`,
        {
          headers: { "x-auth-token": token },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setFriends(data.friends || []);
        // Fetch real status after getting friends
        fetchFriendsStatus();
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const fetchMessages = async (silent = false) => {
    if (!selectedChat) return;

    if (!silent) setLoading(true);
    try {
      const token = localStorage.getItem("quizwise-token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat/messages/${
          selectedChat.friend._id
        }`,
        { headers: { "x-auth-token": token } }
      );
      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!selectedChat) return;

    try {
      const token = localStorage.getItem("quizwise-token");
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat/read/${
          selectedChat.friend._id
        }`,
        {
          method: "PUT",
          headers: { "x-auth-token": token },
        }
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sendingMessage) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setSendingMessage(true);

    // Optimistic UI update
    const tempMessage = {
      _id: `temp_${Date.now()}`,
      sender: { _id: user.id, name: user.name },
      content: messageContent,
      timestamp: new Date().toISOString(),
      sending: true,
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const token = localStorage.getItem("quizwise-token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({
            recipientId: selectedChat.friend._id,
            content: messageContent,
          }),
        }
      );

      if (response.ok) {
        // Remove temp message and fetch real messages
        setMessages((prev) =>
          prev.filter((msg) => msg._id !== tempMessage._id)
        );
        fetchMessages(true);
      } else {
        const error = await response.json();
        alert(error.message || "Failed to send message");
        setNewMessage(messageContent);
        setMessages((prev) =>
          prev.filter((msg) => msg._id !== tempMessage._id)
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
      setNewMessage(messageContent);
      setMessages((prev) => prev.filter((msg) => msg._id !== tempMessage._id));
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (messageDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const filteredFriends = friends.filter((friendship) =>
    friendship.friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLastSeen = (friendId) => {
    const status = friendsStatus.get(friendId);

    if (!status) {
      return "Unknown";
    }

    if (status.isOnline) {
      return "Online";
    }

    if (status.status === "away") {
      return "Away";
    }

    // Calculate time difference for last seen
    if (status.lastSeen) {
      const lastSeenTime = new Date(status.lastSeen);
      const now = new Date();
      const diffMs = now - lastSeenTime;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 1) {
        return "Just now";
      } else if (diffMinutes < 60) {
        return `Last seen ${diffMinutes}m ago`;
      } else if (diffHours < 24) {
        return `Last seen ${diffHours}h ago`;
      } else if (diffDays < 7) {
        return `Last seen ${diffDays}d ago`;
      } else {
        return `Last seen ${lastSeenTime.toLocaleDateString()}`;
      }
    }

    return "Offline";
  };

  const getStatusIndicator = (friendId) => {
    const status = friendsStatus.get(friendId);

    if (!status) {
      return null;
    }

    if (status.isOnline) {
      return "bg-green-500"; // Online - Green
    } else if (status.status === "away") {
      return "bg-yellow-500"; // Away - Yellow
    } else if (status.status === "offline") {
      return "bg-gray-400"; // Offline - Gray
    }

    return null;
  };

  if (friends.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/30 dark:from-slate-900 dark:via-violet-950/30 dark:to-fuchsia-950/30 relative overflow-hidden flex items-center justify-center">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-20 right-20 w-96 h-96 bg-violet-400/10 dark:bg-violet-500/5 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-20 left-20 w-96 h-96 bg-fuchsia-400/10 dark:bg-fuchsia-500/5 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5] 
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        <motion.div 
          className="relative text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl border-2 border-white/80 dark:border-slate-700/80 rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md mx-4">
            <motion.div
              className="w-24 h-24 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 dark:from-violet-500/20 dark:to-fuchsia-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-violet-200/50 dark:border-violet-700/50"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1] 
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <MessageCircle className="w-12 h-12 text-violet-400" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-slate-900 via-violet-700 to-fuchsia-600 dark:from-white dark:via-violet-300 dark:to-fuchsia-400 bg-clip-text text-transparent mb-3">
              No Friends to Chat With
            </h2>
            <p className="text-slate-600 dark:text-slate-300 font-semibold mb-6 text-base sm:text-lg">
              Add some friends first to start chatting! Go to the Social Hub to
              find and add friends.
            </p>
            <motion.button
              onClick={() => (window.location.href = "/social")}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Go to Social Hub
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/30 dark:from-slate-900 dark:via-violet-950/30 dark:to-fuchsia-950/30 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 right-20 w-96 h-96 bg-violet-400/10 dark:bg-violet-500/5 rounded-full blur-3xl"
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1] 
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 left-20 w-96 h-96 bg-fuchsia-400/10 dark:bg-fuchsia-500/5 rounded-full blur-3xl"
          animate={{ 
            x: [0, -30, 0],
            y: [0, 20, 0],
            scale: [1.1, 1, 1.1] 
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="flex min-h-screen sm:h-screen flex-col sm:flex-row relative z-10">
        {/* Sidebar - Friends List */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`${
            selectedChat ? "hidden md:block" : "block"
          } w-full md:w-80 bg-white/40 dark:bg-slate-800/40 backdrop-blur-2xl border-r-2 border-white/60 dark:border-slate-700/60 flex flex-col shadow-2xl`}
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-lg">
            <motion.h1 
              className="text-2xl font-black flex items-center gap-3"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <MessageCircle className="w-7 h-7" />
              Messages
            </motion.h1>
            <motion.p 
              className="text-sm text-violet-100 mt-2 font-semibold"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              👥 {friends.length} friends available
            </motion.p>
          </div>

          {/* Search */}
          <div className="p-4 border-b-2 border-white/60 dark:border-slate-700/60">
            <motion.div 
              className="relative"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-violet-600 dark:text-violet-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-violet-200 dark:border-violet-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400 dark:focus:border-violet-600 text-slate-900 dark:text-white font-semibold placeholder-slate-500 dark:placeholder-slate-400 transition-all"
              />
            </motion.div>
          </div>

          {/* Friends List */}
          <div className="flex-1 overflow-y-auto p-2">
            {filteredFriends.length === 0 ? (
              <motion.div 
                className="p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 dark:from-violet-500/20 dark:to-fuchsia-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3 border-2 border-violet-200/50 dark:border-violet-700/50">
                  <Users className="w-8 h-8 text-violet-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-semibold">
                  {searchQuery ? "No friends found" : "No friends available"}
                </p>
              </motion.div>
            ) : (
              filteredFriends.map((friendship, index) => (
                <motion.div
                  key={friendship.friendshipId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  onClick={() => setSelectedChat(friendship)}
                  className={`group p-4 mb-2 rounded-xl cursor-pointer transition-all ${
                    selectedChat?.friendshipId === friendship.friendshipId
                      ? "bg-white/80 backdrop-blur-md shadow-lg border-2 border-violet-300 scale-[1.02]"
                      : "hover:bg-white/50 backdrop-blur-sm border-2 border-transparent hover:border-violet-200"
                  }`}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <motion.div 
                        className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg"
                        whileHover={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.3 }}
                      >
                        {friendship.friend.name.charAt(0).toUpperCase()}
                      </motion.div>
                      {getStatusIndicator(friendship.friend._id) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusIndicator(
                            friendship.friend._id
                          )} border-2 border-white rounded-full shadow-md`}
                        ></motion.div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {friendship.friend.name}
                        </p>
                        {friendsStatus.get(friendship.friend._id)?.isOnline && (
                          <motion.div 
                            className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center font-bold"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <motion.div 
                              className="w-2 h-2 bg-emerald-500 rounded-full mr-1"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                            Online
                          </motion.div>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate font-medium">
                        {getLastSeen(friendship.friend._id)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Chat Area */}
        <div
          className={`${
            selectedChat ? "block" : "hidden md:block"
          } flex-1 flex flex-col`}
        >
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <motion.div 
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl border-b-2 border-white/60 dark:border-slate-700/60 p-5 flex items-center justify-between shadow-lg"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-3">
                  <motion.button
                    onClick={() => setSelectedChat(null)}
                    className="md:hidden text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-xl transition-all"
                    whileHover={{ scale: 1.1, x: -3 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </motion.button>
                  <div className="relative">
                    <motion.div 
                      className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.4 }}
                    >
                      {selectedChat.friend.name.charAt(0).toUpperCase()}
                    </motion.div>
                    {getStatusIndicator(selectedChat.friend._id) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 ${getStatusIndicator(
                          selectedChat.friend._id
                        )} border-2 border-white rounded-full shadow-md`}
                      ></motion.div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-lg">
                      {selectedChat.friend.name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {getLastSeen(selectedChat.friend._id)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button 
                    className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loading ? (
                  <motion.div 
                    className="flex flex-col items-center justify-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div 
                      className="w-16 h-16 border-4 border-violet-200 dark:border-violet-800 border-t-violet-600 dark:border-t-violet-400 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="mt-4 text-slate-600 dark:text-slate-300 font-semibold">Loading messages...</p>
                  </motion.div>
                ) : messages.length === 0 ? (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 dark:from-violet-500/20 dark:to-fuchsia-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-violet-200/50 dark:border-violet-700/50">
                      <MessageCircle className="w-10 h-10 text-violet-400" />
                    </div>
                    <p className="text-slate-700 font-semibold text-lg">
                      No messages yet. Start the conversation! 👋
                    </p>
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {messages.map((message, index) => {
                      const isOwn = message.sender._id === user.id;
                      return (
                        <motion.div
                          key={message._id}
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3, delay: index * 0.02 }}
                          className={`flex ${
                            isOwn ? "justify-end" : "justify-start"
                          }`}
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className={`max-w-xs lg:max-w-md px-5 py-3 rounded-2xl relative shadow-md ${
                              isOwn
                                ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white"
                                : "bg-white/70 backdrop-blur-md text-slate-900 border-2 border-white/80"
                            } ${message.sending ? "opacity-70" : ""}`}
                          >
                            <p className="text-sm font-medium">
                              {message.content}
                            </p>
                            <div className="flex items-center justify-between mt-1 gap-2">
                              <p
                                className={`text-xs ${
                                  isOwn
                                    ? "text-violet-100"
                                    : "text-slate-500"
                                }`}
                              >
                                {formatTime(message.timestamp || message.createdAt)}
                              </p>
                              {isOwn && !message.sending && (
                                <CheckCheck className="w-3.5 h-3.5 text-violet-100" />
                              )}
                            </div>
                            {message.sending && (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="absolute -right-6 top-2"
                              >
                                <Loader className="w-4 h-4 text-violet-400" />
                              </motion.div>
                            )}
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>

              {/* Message Input */}
              <motion.div 
                className="bg-white/60 backdrop-blur-md border-t-2 border-white/60 p-5 shadow-lg"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="flex items-end gap-3">
                  <motion.button 
                    className="p-3 text-violet-600 hover:bg-violet-100 rounded-xl transition-all"
                    whileHover={{ scale: 1.1, rotate: -10 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Paperclip className="w-5 h-5" />
                  </motion.button>
                  <div className="flex-1 relative">
                    <textarea
                      ref={messageInputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      rows="1"
                      className="w-full resize-none border-2 border-violet-200 dark:border-violet-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl px-5 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400 dark:focus:border-violet-600 max-h-32 text-slate-900 dark:text-white font-medium placeholder-slate-500 dark:placeholder-slate-400 transition-all"
                      style={{ minHeight: "48px" }}
                    />
                    <motion.button 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/50 rounded-lg transition-all"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Smile className="w-5 h-5" />
                    </motion.button>
                  </div>
                  <motion.button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-3 rounded-xl hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:hover:shadow-lg"
                    whileHover={!newMessage.trim() || sendingMessage ? {} : { scale: 1.05, rotate: -5 }}
                    whileTap={!newMessage.trim() || sendingMessage ? {} : { scale: 0.95 }}
                  >
                    {sendingMessage ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader className="w-6 h-6" />
                      </motion.div>
                    ) : (
                      <Send className="w-6 h-6" />
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </>
          ) : (
            // No chat selected
            <div className="hidden md:flex flex-1 items-center justify-center">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div 
                  className="w-24 h-24 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 dark:from-violet-500/20 dark:to-fuchsia-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-violet-200/50 dark:border-violet-700/50"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <MessageCircle className="w-12 h-12 text-violet-400" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-slate-900 via-violet-700 to-fuchsia-600 dark:from-white dark:via-violet-300 dark:to-fuchsia-400 bg-clip-text text-transparent mb-3">
                  Select a Friend to Chat
                </h2>
                <p className="text-base sm:text-lg font-semibold text-slate-600 dark:text-slate-300">
                  Choose a friend from the list to start messaging 💬
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ChatSystem;
