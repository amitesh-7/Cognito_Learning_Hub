import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, UserPlus, Bell, Gamepad2, MessageCircle, Search, 
  Sparkles, Trophy, Zap, TrendingUp, Crown, Target 
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

// Import modular components
import FriendCard from "./FriendCard";
import FriendProfileModal from "./FriendProfileModal";
import ChallengeModal from "./ChallengeModal";
import DiscoverUsers from "./DiscoverUsers";
import UserSearch from "./UserSearch";
import DuelsTab from "./DuelsTab";
import FriendsTab from "./FriendsTab";
import NotificationsTab from "./NotificationsTab";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const SocialDashboard = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // State management
  const [activeTab, setActiveTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [friendProfile, setFriendProfile] = useState(null);

  // Stats
  const [socialStats, setSocialStats] = useState({
    totalFriends: 0,
    onlineFriends: 0,
    pendingChallenges: 0,
    unreadNotifications: 0
  });

  const token = localStorage.getItem("quizwise-token") || localStorage.getItem("token");

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      const [friendsRes, pendingRes, sentRes, suggestionsRes, notificationsRes, challengesRes] = 
        await Promise.all([
          fetch(`${API_URL}/api/friends`, { headers: { "x-auth-token": token } }),
          fetch(`${API_URL}/api/friends/requests/pending`, { headers: { "x-auth-token": token } }),
          fetch(`${API_URL}/api/friends/requests/sent`, { headers: { "x-auth-token": token } }),
          fetch(`${API_URL}/api/friends/suggestions`, { headers: { "x-auth-token": token } }),
          fetch(`${API_URL}/api/notifications`, { headers: { "x-auth-token": token } }),
          fetch(`${API_URL}/api/challenges`, { headers: { "x-auth-token": token } })
        ]);

      if (friendsRes.ok) {
        const data = await friendsRes.json();
        // Transform friends data - extract friend object and add friendship metadata
        const friendsList = (data.friends || data || []).map(f => ({
          ...f.friend,
          friendshipId: f.friendshipId,
          friendSince: f.since,
          isOnline: f.friend?.status === 'online' || f.friend?.isOnline
        }));
        setFriends(friendsList);
      } else {
        console.warn('Failed to fetch friends:', friendsRes.status);
        setFriends([]);
      }
      if (pendingRes.ok) {
        const data = await pendingRes.json();
        setPendingRequests(Array.isArray(data.requests) ? data.requests : []);
      } else {
        console.warn('Failed to fetch pending requests:', pendingRes.status);
        setPendingRequests([]);
      }
      if (sentRes.ok) {
        const data = await sentRes.json();
        setSentRequests(Array.isArray(data.requests) ? data.requests : []);
      } else {
        console.warn('Failed to fetch sent requests:', sentRes.status);
        setSentRequests([]);
      }
      if (suggestionsRes.ok) {
        const data = await suggestionsRes.json();
        const suggestionsList = data.suggestions || data.users || data || [];
        setSuggestions(Array.isArray(suggestionsList) ? suggestionsList : []);
      } else {
        console.warn('Failed to fetch suggestions:', suggestionsRes.status);
        setSuggestions([]);
      }
      if (notificationsRes.ok) {
        const data = await notificationsRes.json();
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      } else {
        console.warn('Failed to fetch notifications:', notificationsRes.status);
        setNotifications([]);
      }
      if (challengesRes.ok) {
        const data = await challengesRes.json();
        setChallenges(Array.isArray(data.challenges) ? data.challenges : []);
      } else {
        console.warn('Failed to fetch challenges:', challengesRes.status);
        setChallenges([]);
      }
    } catch (error) {
      console.error("Error fetching social data:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch quizzes for challenges
  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/quizzes`, {
        headers: { "x-auth-token": token }
      });
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.quizzes || data || []);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
    fetchQuizzes();
  }, [fetchData, fetchQuizzes]);

  // Update stats
  useEffect(() => {
    setSocialStats({
      totalFriends: Array.isArray(friends) ? friends.length : 0,
      onlineFriends: Array.isArray(friends) ? friends.filter(f => f.isOnline).length : 0,
      pendingChallenges: Array.isArray(challenges) ? challenges.filter(c => c.status === "pending").length : 0,
      unreadNotifications: Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0
    });
  }, [friends, challenges, notifications]);

  // Search users
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`${API_URL}/api/users/search?q=${encodeURIComponent(query)}`, {
        headers: { "x-auth-token": token }
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.users || data || []);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Send friend request
  const handleSendFriendRequest = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/friends/request`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-auth-token": token 
        },
        body: JSON.stringify({ recipientId: userId })
      });
      
      if (res.ok) {
        setSuggestions(prev => prev.filter(u => u._id !== userId));
        setSearchResults(prev => prev.map(u => 
          u._id === userId ? { ...u, friendshipStatus: "pending-sent" } : u
        ));
        fetchData();
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  // Respond to friend request
  const handleRespondRequest = async (friendshipId, action) => {
    try {
      const res = await fetch(`${API_URL}/api/friends/respond`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-auth-token": token 
        },
        body: JSON.stringify({ friendshipId, action })
      });
      
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error responding to request:", error);
    }
  };

  // View friend profile
  const handleViewProfile = async (friend) => {
    setSelectedFriend(friend);
    setShowProfileModal(true);
    
    try {
      const res = await fetch(`${API_URL}/api/friends/profile/${friend._id}`, {
        headers: { "x-auth-token": token }
      });
      if (res.ok) {
        const data = await res.json();
        setFriendProfile(data);
      }
    } catch (error) {
      console.error("Error fetching friend profile:", error);
    }
  };

  // Challenge friend
  const handleChallenge = (friend) => {
    setSelectedFriend(friend);
    setShowChallengeModal(true);
  };

  // Send challenge
  const handleSendChallenge = async (quizId) => {
    if (!selectedFriend) return;
    
    try {
      const res = await fetch(`${API_URL}/api/challenges`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-auth-token": token 
        },
        body: JSON.stringify({
          challengedUserId: selectedFriend._id,
          quizId
        })
      });
      
      if (res.ok) {
        setShowChallengeModal(false);
        setSelectedFriend(null);
        fetchData();
      }
    } catch (error) {
      console.error("Error sending challenge:", error);
    }
  };

  // Chat with friend
  const handleChat = (friend) => {
    // Navigate to chat or open chat modal
    console.log("Open chat with:", friend.name);
    // You can integrate with your chat system here
  };

  // Mark notification as read
  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: "PUT",
        headers: { "x-auth-token": token }
      });
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
  };

  // Respond to challenge
  const handleRespondChallenge = async (challengeId, action) => {
    try {
      const res = await fetch(`${API_URL}/api/challenges/${challengeId}/respond`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-auth-token": token 
        },
        body: JSON.stringify({ action })
      });
      
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error responding to challenge:", error);
    }
  };

  // Tabs configuration
  const tabs = [
    { id: "friends", label: "Friends", icon: Users, count: friends.length },
    { id: "discover", label: "Discover", icon: UserPlus },
    { id: "duels", label: "Duels", icon: Gamepad2, count: socialStats.pendingChallenges },
    { id: "notifications", label: "Alerts", icon: Bell, count: socialStats.unreadNotifications }
  ];

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? "bg-slate-900" : "bg-gray-50"
      }`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className={`text-lg ${isDark ? "text-white" : "text-gray-900"}`}>Loading social hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? "bg-slate-900" : "bg-gray-50"
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 backdrop-blur-xl ${
        isDark ? "bg-slate-900/80 border-white/10" : "bg-white/80 border-gray-200"
      } border-b`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  Social Hub
                </h1>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Connect, compete & conquer together
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                isDark ? "bg-emerald-500/20" : "bg-emerald-50"
              }`}>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className={`text-sm font-semibold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                  {socialStats.onlineFriends} Online
                </span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                isDark ? "bg-violet-500/20" : "bg-violet-50"
              }`}>
                <Trophy className="w-4 h-4 text-violet-500" />
                <span className={`text-sm font-semibold ${isDark ? "text-violet-400" : "text-violet-600"}`}>
                  {socialStats.pendingChallenges} Challenges
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg"
                    : isDark
                      ? "bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-800"
                      : "bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-violet-500 text-white"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Friends Tab */}
          {activeTab === "friends" && (
            <motion.div
              key="friends"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Search */}
              <UserSearch
                searchQuery={searchQuery}
                onSearch={handleSearch}
                searchResults={searchResults}
                isSearching={isSearching}
                onSendRequest={handleSendFriendRequest}
                isDark={isDark}
              />

              {/* Friends List */}
              <FriendsTab
                friends={friends}
                pendingRequests={pendingRequests}
                sentRequests={sentRequests}
                onViewProfile={handleViewProfile}
                onChat={handleChat}
                onChallenge={handleChallenge}
                onRespondRequest={handleRespondRequest}
                isDark={isDark}
              />
            </motion.div>
          )}

          {/* Discover Tab */}
          {activeTab === "discover" && (
            <motion.div
              key="discover"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DiscoverUsers
                suggestions={suggestions}
                onSendRequest={handleSendFriendRequest}
                onRefresh={fetchData}
                isDark={isDark}
              />
            </motion.div>
          )}

          {/* Duels Tab */}
          {activeTab === "duels" && (
            <motion.div
              key="duels"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DuelsTab
                challenges={challenges}
                friends={friends}
                onRespond={handleRespondChallenge}
                onChallengeFriend={handleChallenge}
                isDark={isDark}
              />
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <NotificationsTab
                notifications={notifications}
                onMarkRead={handleMarkNotificationRead}
                onRespondFriendRequest={handleRespondRequest}
                isDark={isDark}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Friend Profile Modal */}
      <AnimatePresence>
        {showProfileModal && selectedFriend && (
          <FriendProfileModal
            friend={selectedFriend}
            profile={friendProfile}
            onClose={() => {
              setShowProfileModal(false);
              setSelectedFriend(null);
              setFriendProfile(null);
            }}
            onChallenge={handleChallenge}
            onChat={handleChat}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      {/* Challenge Modal */}
      <AnimatePresence>
        {showChallengeModal && selectedFriend && (
          <ChallengeModal
            friend={selectedFriend}
            quizzes={quizzes}
            onSend={handleSendChallenge}
            onClose={() => {
              setShowChallengeModal(false);
              setSelectedFriend(null);
            }}
            isDark={isDark}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialDashboard;
