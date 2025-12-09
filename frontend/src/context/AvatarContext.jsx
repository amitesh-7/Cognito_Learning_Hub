import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

// Create the Avatar Context
export const AvatarContext = createContext(null);

// Custom hook to use the AvatarContext
export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error("useAvatar must be used within an AvatarProvider");
  }
  return context;
};

// Avatar Provider Component
export const AvatarProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentReaction, setCurrentReaction] = useState(null);
  const [emotionalState, setEmotionalState] = useState({
    mood: "neutral",
    intensity: 50,
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Fetch avatar data
  const fetchAvatar = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("quizwise-token");
      const response = await fetch(`${API_URL}/api/avatar`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAvatar(data.avatar);
          setEmotionalState(
            data.avatar.emotionalState || { mood: "neutral", intensity: 50 }
          );
        }
      } else if (response.status === 404) {
        // Create default avatar
        await createAvatar();
      }
    } catch (err) {
      console.error("Error fetching avatar:", err);
      setError("Failed to load avatar");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, API_URL]);

  // Create avatar
  const createAvatar = useCallback(
    async (avatarData = {}) => {
      try {
        const token = localStorage.getItem("quizwise-token");
        const response = await fetch(`${API_URL}/api/avatar`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(avatarData),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAvatar(data.avatar);
            return data.avatar;
          }
        }
        throw new Error("Failed to create avatar");
      } catch (err) {
        console.error("Error creating avatar:", err);
        throw err;
      }
    },
    [API_URL]
  );

  // Update avatar customization
  const updateAvatar = useCallback(
    async (updates) => {
      try {
        const token = localStorage.getItem("quizwise-token");
        const response = await fetch(`${API_URL}/api/avatar`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAvatar(data.avatar);
            return { success: true, avatar: data.avatar };
          }
        }
        return { success: false, error: "Failed to update avatar" };
      } catch (err) {
        console.error("Error updating avatar:", err);
        return { success: false, error: err.message };
      }
    },
    [API_URL]
  );

  // Trigger emotional reaction
  const triggerReaction = useCallback(
    async (event, context = {}) => {
      try {
        const token = localStorage.getItem("quizwise-token");
        const response = await fetch(`${API_URL}/api/emotions/react`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ event, context }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCurrentReaction(data.reaction);
            setEmotionalState(data.emotionalState);

            // Clear reaction after duration
            setTimeout(() => {
              setCurrentReaction(null);
            }, data.reaction.duration || 2000);

            return data.reaction;
          }
        }
      } catch (err) {
        console.error("Error triggering reaction:", err);
      }
      return null;
    },
    [API_URL]
  );

  // Add experience points
  const addExperience = useCallback(
    async (amount, source, quizStats = null) => {
      try {
        const token = localStorage.getItem("quizwise-token");
        const response = await fetch(
          `${API_URL}/api/evolution/add-experience`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ amount, source, quizStats }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Update avatar with new evolution data
            setAvatar((prev) => ({
              ...prev,
              evolution: data.evolution,
            }));
            return data;
          }
        }
      } catch (err) {
        console.error("Error adding experience:", err);
      }
      return null;
    },
    [API_URL]
  );

  // Get avatar reaction for specific event
  const getReaction = useCallback(
    async (event) => {
      try {
        const token = localStorage.getItem("quizwise-token");
        const response = await fetch(
          `${API_URL}/api/avatar/reaction/${event}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            return data.reaction;
          }
        }
      } catch (err) {
        console.error("Error getting reaction:", err);
      }
      return null;
    },
    [API_URL]
  );

  // Update learning style from quiz performance
  const analyzeLearningStyle = useCallback(
    async (quizData) => {
      try {
        const token = localStorage.getItem("quizwise-token");
        const response = await fetch(`${API_URL}/api/learning-style/analyze`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quizData }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAvatar((prev) => ({
              ...prev,
              learningStyle: data.updatedLearningStyle,
            }));
            return data;
          }
        }
      } catch (err) {
        console.error("Error analyzing learning style:", err);
      }
      return null;
    },
    [API_URL]
  );

  // Generate voice explanation
  const generateVoiceExplanation = useCallback(
    async (text, questionContext = {}) => {
      try {
        const token = localStorage.getItem("quizwise-token");
        const response = await fetch(
          `${API_URL}/api/voice/generate-explanation`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text, questionContext }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (err) {
        console.error("Error generating voice explanation:", err);
      }
      return null;
    },
    [API_URL]
  );

  // Fetch avatar on auth change
  useEffect(() => {
    if (isAuthenticated) {
      fetchAvatar();
    } else {
      setAvatar(null);
      setLoading(false);
    }
  }, [isAuthenticated, fetchAvatar]);

  // Update 3D avatar configuration
  const update3DAvatar = useCallback(
    async (config3D) => {
      try {
        const result = await updateAvatar({
          customization: {
            ...avatar?.customization,
            avatar3D: config3D,
            use3D: true,
          },
        });
        return result;
      } catch (err) {
        console.error("Error updating 3D avatar:", err);
        return { success: false, error: err.message };
      }
    },
    [avatar, updateAvatar]
  );

  // Toggle between 2D and 3D avatar
  const toggleAvatarMode = useCallback(
    async (use3D) => {
      try {
        const result = await updateAvatar({
          customization: {
            ...avatar?.customization,
            use3D,
          },
        });
        return result;
      } catch (err) {
        console.error("Error toggling avatar mode:", err);
        return { success: false, error: err.message };
      }
    },
    [avatar, updateAvatar]
  );

  const value = {
    avatar,
    loading,
    error,
    currentReaction,
    emotionalState,
    fetchAvatar,
    createAvatar,
    updateAvatar,
    triggerReaction,
    addExperience,
    getReaction,
    analyzeLearningStyle,
    generateVoiceExplanation,
    update3DAvatar,
    toggleAvatarMode,
    avatar3DConfig: avatar?.customization?.avatar3D || null,
    isUsing3D: avatar?.customization?.use3D ?? false,
    learningInsights: avatar?.learningStyle?.insights || null,
    isAvatarEnabled: avatar?.settings?.showAvatar ?? true,
    isVoiceEnabled: avatar?.settings?.enableVoice ?? false,
    setIsAvatarEnabled: (enabled) => {
      if (avatar) {
        updateAvatar({ settings: { ...avatar.settings, showAvatar: enabled } });
      }
    },
  };

  return (
    <AvatarContext.Provider value={value}>{children}</AvatarContext.Provider>
  );
};

export default AvatarProvider;
