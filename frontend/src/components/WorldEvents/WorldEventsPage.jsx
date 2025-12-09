import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Trophy,
  Users,
  Clock,
  Zap,
  Star,
  TrendingUp,
  Calendar,
  Award,
  Target,
  Flame,
  Crown,
  Loader2,
  Play,
  CheckCircle,
} from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { useToast } from "../ui/Toast";
import { useNavigate } from "react-router-dom";

const WorldEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("active"); // active, upcoming, completed
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, [activeTab]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("quizwise-token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

      const response = await fetch(
        `${API_URL}/api/gamification/world-events?status=${activeTab}`,
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEvents(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error("Failed to load events");
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (eventId) => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("quizwise-token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

      const response = await fetch(
        `${API_URL}/api/gamification/world-events/${eventId}/leaderboard`,
        {
          headers: { "x-auth-token": token },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLeaderboard(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setLeaderboard([]);
    }
  };

  const joinEvent = async (event) => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("quizwise-token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

      const response = await fetch(
        `${API_URL}/api/gamification/world-events/${event.eventId}/join`,
        {
          method: "POST",
          headers: {
            "x-auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        success(`Joined event: ${event.title}`);
        // Navigate to associated quiz
        if (event.quizIds && event.quizIds.length > 0) {
          navigate(`/quiz/${event.quizIds[0]}`);
        }
      } else {
        const data = await response.json();
        showError(data.error || "Failed to join event");
      }
    } catch (error) {
      console.error("Error joining event:", error);
      showError("Failed to join event");
    }
  };

  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case "global_challenge":
        return <Globe className="w-5 h-5" />;
      case "speed_battle":
        return <Zap className="w-5 h-5" />;
      case "marathon":
        return <TrendingUp className="w-5 h-5" />;
      case "tournament":
        return <Trophy className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const EventCard = ({ event }) => {
    const timeRemaining = getTimeRemaining(event.endDate);
    const isActive = activeTab === "active";
    const hasJoined = event.participants?.includes("currentUserId"); // TODO: Check actual user ID

    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Card className="p-6 hover:shadow-xl transition-all border-2 hover:border-purple-500">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                {getEventTypeIcon(event.eventType)}
              </div>
              <div>
                <h3 className="text-xl font-bold">{event.title}</h3>
                <Badge className="bg-purple-100 text-purple-800">
                  {event.eventType.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
            </div>
            {event.rewardPool && (
              <div className="text-right">
                <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-yellow-600">
                  {event.rewardPool.totalXP}
                </p>
                <p className="text-xs text-gray-600">XP Pool</p>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {event.description}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Users className="w-5 h-5 mx-auto mb-1 text-blue-600" />
              <p className="text-lg font-bold">{event.participantCount || 0}</p>
              <p className="text-xs text-gray-600">Participants</p>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Clock className="w-5 h-5 mx-auto mb-1 text-green-600" />
              <p className="text-sm font-bold">{timeRemaining}</p>
              <p className="text-xs text-gray-600">Time Left</p>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Target className="w-5 h-5 mx-auto mb-1 text-purple-600" />
              <p className="text-lg font-bold">
                {event.requirements?.targetScore || "N/A"}
              </p>
              <p className="text-xs text-gray-600">Target</p>
            </div>
          </div>

          {/* Rewards */}
          {event.rewardPool?.distribution && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm font-semibold mb-2">🏆 Rewards:</p>
              <div className="flex gap-2 flex-wrap">
                <Badge className="bg-yellow-100 text-yellow-800">
                  🥇 {event.rewardPool.distribution.first}%
                </Badge>
                <Badge className="bg-gray-100 text-gray-800">
                  🥈 {event.rewardPool.distribution.second}%
                </Badge>
                <Badge className="bg-orange-100 text-orange-800">
                  🥉 {event.rewardPool.distribution.third}%
                </Badge>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {isActive && !hasJoined && (
              <Button
                onClick={() => joinEvent(event)}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Join Event
              </Button>
            )}
            {hasJoined && (
              <Badge className="flex-1 justify-center bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-2" />
                Joined
              </Badge>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setSelectedEvent(event);
                fetchLeaderboard(event.eventId);
              }}
            >
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="flex items-center gap-4">
          <Globe className="w-12 h-12" />
          <div>
            <h2 className="text-3xl font-bold">World Events</h2>
            <p className="opacity-90">
              Compete globally, earn legendary rewards, and climb the ranks!
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2">
        {["active", "upcoming", "completed"].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? "bg-purple-600" : ""}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : events.length === 0 ? (
        <Card className="p-12 text-center">
          <Globe className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold mb-2">No Events Available</h3>
          <p className="text-gray-600">
            Check back soon for exciting global challenges!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.eventId} event={event} />
          ))}
        </div>
      )}

      {/* Leaderboard Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <Card className="border-0">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="w-8 h-8" />
                    <h3 className="text-2xl font-bold">
                      {selectedEvent.title}
                    </h3>
                  </div>
                  <p className="opacity-90">Top Performers</p>
                </div>

                <div className="p-6">
                  {leaderboard.length === 0 ? (
                    <p className="text-center text-gray-600 py-8">
                      No participants yet. Be the first!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {leaderboard.map((entry, index) => (
                        <div
                          key={entry.userId}
                          className={`flex items-center gap-4 p-4 rounded-lg ${
                            index === 0
                              ? "bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500"
                              : index === 1
                              ? "bg-gray-50 dark:bg-gray-700 border-2 border-gray-400"
                              : index === 2
                              ? "bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500"
                              : "bg-gray-50 dark:bg-gray-700"
                          }`}
                        >
                          <div className="text-2xl font-bold w-8">
                            {index === 0
                              ? "🥇"
                              : index === 1
                              ? "🥈"
                              : index === 2
                              ? "🥉"
                              : `#${index + 1}`}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold">
                              {entry.username || "Anonymous"}
                            </p>
                            <p className="text-sm text-gray-600">
                              Score: {entry.score} | XP: +{entry.xpEarned}
                            </p>
                          </div>
                          {index < 3 && (
                            <Crown className="w-6 h-6 text-yellow-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setSelectedEvent(null)}
                    className="w-full mt-6"
                  >
                    Close
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorldEventsPage;
