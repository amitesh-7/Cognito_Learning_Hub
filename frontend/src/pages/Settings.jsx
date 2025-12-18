import React, { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { useAccessibility } from "../context/AccessibilityContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import {
  User,
  Mail,
  Lock,
  Bell,
  Eye,
  EyeOff,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Palette,
  Volume2,
  VolumeX,
  Globe,
  Shield,
  Database,
  Trash2,
  Download,
  LogOut,
  Save,
  X,
  Check,
  Info,
  AlertCircle,
} from "lucide-react";
import { useToast } from "../components/ui/Toast";
import { useTheme } from "../hooks/useTheme";

export default function Settings() {
  const { user, logout } = useContext(AuthContext);
  const { settings: accessibilitySettings, updateSettings: updateAccessibilitySettings } = useAccessibility();
  const [theme, toggleTheme] = useTheme();
  const { success, error: showError } = useToast();

  const [activeSection, setActiveSection] = useState("profile");
  const [loading, setLoading] = useState(false);

  // Speech Voice Settings
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(() => {
    return localStorage.getItem('preferredVoice') || '';
  });
  const [speechRate, setSpeechRate] = useState(() => {
    const saved = localStorage.getItem('speechRate');
    return saved ? parseFloat(saved) : 0.9;
  });
  const [speechPitch, setSpeechPitch] = useState(() => {
    const saved = localStorage.getItem('speechPitch');
    return saved ? parseFloat(saved) : 1.0;
  });

  // Profile Settings
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(() => {
    const saved = localStorage.getItem('emailNotifications');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [pushNotifications, setPushNotifications] = useState(() => {
    const saved = localStorage.getItem('pushNotifications');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [quizReminders, setQuizReminders] = useState(() => {
    const saved = localStorage.getItem('quizReminders');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [achievementNotifications, setAchievementNotifications] = useState(() => {
    const saved = localStorage.getItem('achievementNotifications');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Privacy Settings
  const [profileVisibility, setProfileVisibility] = useState(
    localStorage.getItem('profileVisibility') || "public"
  );
  const [showStats, setShowStats] = useState(() => {
    const saved = localStorage.getItem('showStats');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showActivity, setShowActivity] = useState(() => {
    const saved = localStorage.getItem('showActivity');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // App Settings
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('soundEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    const saved = localStorage.getItem('animationsEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [language, setLanguage] = useState(localStorage.getItem('language') || "en");
  
  // Save preferences to localStorage when they change
  // Load available speech voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Save speech settings to localStorage
  useEffect(() => {
    if (selectedVoice) {
      localStorage.setItem('preferredVoice', selectedVoice);
    }
  }, [selectedVoice]);

  useEffect(() => {
    localStorage.setItem('speechRate', speechRate.toString());
  }, [speechRate]);

  useEffect(() => {
    localStorage.setItem('speechPitch', speechPitch.toString());
  }, [speechPitch]);

  useEffect(() => {
    localStorage.setItem('emailNotifications', JSON.stringify(emailNotifications));
  }, [emailNotifications]);
  
  useEffect(() => {
    localStorage.setItem('pushNotifications', JSON.stringify(pushNotifications));
  }, [pushNotifications]);
  
  useEffect(() => {
    localStorage.setItem('quizReminders', JSON.stringify(quizReminders));
  }, [quizReminders]);
  
  useEffect(() => {
    localStorage.setItem('achievementNotifications', JSON.stringify(achievementNotifications));
  }, [achievementNotifications]);
  
  useEffect(() => {
    localStorage.setItem('profileVisibility', profileVisibility);
  }, [profileVisibility]);
  
  useEffect(() => {
    localStorage.setItem('showStats', JSON.stringify(showStats));
  }, [showStats]);
  
  useEffect(() => {
    localStorage.setItem('showActivity', JSON.stringify(showActivity));
  }, [showActivity]);
  
  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);
  
  useEffect(() => {
    localStorage.setItem('animationsEnabled', JSON.stringify(animationsEnabled));
  }, [animationsEnabled]);
  
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const updateProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("quizwise-token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      success("Profile updated successfully!");
    } catch (err) {
      showError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      showError("Passwords don't match!");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("quizwise-token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) throw new Error("Failed to change password");

      success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const token = localStorage.getItem("quizwise-token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/export-data`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quizwise-data-${Date.now()}.json`;
      a.click();
      
      success("Data exported successfully!");
    } catch (err) {
      showError("Failed to export data");
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone!")) {
      return;
    }

    try {
      const token = localStorage.getItem("quizwise-token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/delete-account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete account");

      success("Account deleted successfully");
      setTimeout(() => logout(), 2000);
    } catch (err) {
      showError(err.message || "Failed to delete account");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/30 dark:from-slate-900 dark:via-violet-950/30 dark:to-fuchsia-950/30 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-lg font-semibold text-slate-600 dark:text-slate-400">
            Manage your account and preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="p-4 bg-white/20 dark:bg-slate-800/40 backdrop-blur-xl border-white/30 dark:border-slate-700/50 sticky top-24">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveSection("profile")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    activeSection === "profile"
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg"
                      : "text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <User className="w-5 h-5" />
                  Profile
                </button>
                <button
                  onClick={() => setActiveSection("security")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    activeSection === "security"
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg"
                      : "text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  Security
                </button>
                <button
                  onClick={() => setActiveSection("notifications")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    activeSection === "notifications"
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg"
                      : "text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  Notifications
                </button>
                <button
                  onClick={() => setActiveSection("accessibility")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    activeSection === "accessibility"
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg"
                      : "text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <Eye className="w-5 h-5" />
                  Accessibility
                </button>
                <button
                  onClick={() => setActiveSection("appearance")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    activeSection === "appearance"
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg"
                      : "text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <Palette className="w-5 h-5" />
                  Appearance
                </button>
                <button
                  onClick={() => setActiveSection("privacy")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    activeSection === "privacy"
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg"
                      : "text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  Privacy
                </button>
                <button
                  onClick={() => setActiveSection("data")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    activeSection === "data"
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg"
                      : "text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <Database className="w-5 h-5" />
                  Data & Privacy
                </button>
              </nav>
            </Card>
          </motion.div>

          {/* Content Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* Profile Section */}
            {activeSection === "profile" && (
              <Card className="p-8 bg-white/20 dark:bg-slate-800/40 backdrop-blur-xl border-white/30 dark:border-slate-700/50">
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-6">
                  Profile Information
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Full Name
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full"
                    />
                  </div>
                  <Button
                    onClick={updateProfile}
                    disabled={loading}
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </Card>
            )}

            {/* Security Section */}
            {activeSection === "security" && (
              <Card className="p-8 bg-white/20 dark:bg-slate-800/40 backdrop-blur-xl border-white/30 dark:border-slate-700/50">
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-6">
                  Change Password
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Current Password
                    </label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full"
                    />
                  </div>
                  <Button
                    onClick={updatePassword}
                    disabled={loading}
                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Update Password
                  </Button>
                </div>
              </Card>
            )}

            {/* Notifications Section */}
            {activeSection === "notifications" && (
              <Card className="p-8 bg-white/20 dark:bg-slate-800/40 backdrop-blur-xl border-white/30 dark:border-slate-700/50">
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-6">
                  Notification Preferences
                </h2>
                <div className="space-y-6">
                  <ToggleSetting
                    label="Email Notifications"
                    description="Receive updates via email"
                    checked={emailNotifications}
                    onChange={setEmailNotifications}
                  />
                  <ToggleSetting
                    label="Push Notifications"
                    description="Get browser notifications"
                    checked={pushNotifications}
                    onChange={setPushNotifications}
                  />
                  <ToggleSetting
                    label="Quiz Reminders"
                    description="Reminders for pending quizzes"
                    checked={quizReminders}
                    onChange={setQuizReminders}
                  />
                  <ToggleSetting
                    label="Achievement Alerts"
                    description="Get notified when you earn achievements"
                    checked={achievementNotifications}
                    onChange={setAchievementNotifications}
                  />
                </div>
              </Card>
            )}

            {/* Accessibility Section */}
            {activeSection === "accessibility" && (
              <Card className="p-8 bg-white/20 dark:bg-slate-800/40 backdrop-blur-xl border-white/30 dark:border-slate-700/50">
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-6">
                  Accessibility Settings
                </h2>
                <div className="space-y-6">
                  <ToggleSetting
                    label="Visually Impaired Mode"
                    description="Optimized quiz experience with audio guidance"
                    checked={accessibilitySettings.visuallyImpairedMode}
                    onChange={(val) => updateAccessibilitySettings({ visuallyImpairedMode: val })}
                  />
                  <ToggleSetting
                    label="Text-to-Speech"
                    description="Read questions and options aloud"
                    checked={accessibilitySettings.textToSpeech}
                    onChange={(val) => updateAccessibilitySettings({ textToSpeech: val })}
                  />
                  <ToggleSetting
                    label="High Contrast"
                    description="Enhanced color contrast for better visibility"
                    checked={accessibilitySettings.highContrast}
                    onChange={(val) => updateAccessibilitySettings({ highContrast: val })}
                  />
                  <ToggleSetting
                    label="Reduce Motion"
                    description="Minimize animations and transitions"
                    checked={accessibilitySettings.reduceMotion}
                    onChange={(val) => updateAccessibilitySettings({ reduceMotion: val })}
                  />
                  <ToggleSetting
                    label="Keyboard Navigation"
                    description="Enhanced keyboard shortcuts"
                    checked={accessibilitySettings.keyboardNavigation}
                    onChange={(val) => updateAccessibilitySettings({ keyboardNavigation: val })}
                  />

                  {/* Voice Selection */}
                  <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                      <Volume2 className="w-5 h-5" />
                      Speech Voice Settings
                    </h3>
                    
                    {/* Voice Selection */}
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                        Preferred Voice
                      </label>
                      <select
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:border-violet-500 dark:focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-800 transition-all text-slate-900 dark:text-slate-100"
                      >
                        <option value="">Default Voice</option>
                        {availableVoices.map((voice, index) => (
                          <option key={index} value={voice.name}>
                            {voice.name} ({voice.lang})
                          </option>
                        ))}
                      </select>
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                        Choose the voice for text-to-speech and speech quizzes
                      </p>
                    </div>

                    {/* Speech Rate */}
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                        Speech Rate: {speechRate.toFixed(1)}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={speechRate}
                        onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                      />
                      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mt-2">
                        <span>Slower (0.5x)</span>
                        <span>Normal (1.0x)</span>
                        <span>Faster (2.0x)</span>
                      </div>
                    </div>

                    {/* Speech Pitch */}
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                        Speech Pitch: {speechPitch.toFixed(1)}
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={speechPitch}
                        onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                      />
                      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mt-2">
                        <span>Lower (0.5)</span>
                        <span>Normal (1.0)</span>
                        <span>Higher (2.0)</span>
                      </div>
                    </div>

                    {/* Test Voice Button */}
                    <Button
                      onClick={() => {
                        const utterance = new SpeechSynthesisUtterance(
                          "Hello! This is a test of your selected voice settings."
                        );
                        utterance.rate = speechRate;
                        utterance.pitch = speechPitch;
                        if (selectedVoice) {
                          const voice = availableVoices.find(v => v.name === selectedVoice);
                          if (voice) utterance.voice = voice;
                        }
                        window.speechSynthesis.speak(utterance);
                      }}
                      className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Volume2 className="w-5 h-5" />
                      Test Voice Settings
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Appearance Section */}
            {activeSection === "appearance" && (
              <Card className="p-8 bg-white/20 dark:bg-slate-800/40 backdrop-blur-xl border-white/30 dark:border-slate-700/50">
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-6">
                  Appearance Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                      Theme
                    </label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => theme !== "light" && toggleTheme()}
                        className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                          theme === "light"
                            ? "border-violet-500 bg-violet-50"
                            : "border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50"
                        }`}
                      >
                        <Sun className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                        <p className="font-bold">Light</p>
                      </button>
                      <button
                        onClick={() => theme !== "dark" && toggleTheme()}
                        className={`flex-1 p-6 rounded-xl border-2 transition-all ${
                          theme === "dark"
                            ? "border-violet-500 bg-violet-900/30"
                            : "border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-700/50"
                        }`}
                      >
                        <Moon className="w-8 h-8 mx-auto mb-2 text-violet-500" />
                        <p className="font-bold">Dark</p>
                      </button>
                    </div>
                  </div>
                  <ToggleSetting
                    label="Sound Effects"
                    description="Play sounds for interactions"
                    checked={soundEnabled}
                    onChange={setSoundEnabled}
                  />
                  <ToggleSetting
                    label="Animations"
                    description="Enable UI animations"
                    checked={animationsEnabled}
                    onChange={setAnimationsEnabled}
                  />
                </div>
              </Card>
            )}

            {/* Privacy Section */}
            {activeSection === "privacy" && (
              <Card className="p-8 bg-white/20 dark:bg-slate-800/40 backdrop-blur-xl border-white/30 dark:border-slate-700/50">
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-6">
                  Privacy Settings
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                      Profile Visibility
                    </label>
                    <select
                      value={profileVisibility}
                      onChange={(e) => setProfileVisibility(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-bold"
                    >
                      <option value="public">Public</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                  <ToggleSetting
                    label="Show Statistics"
                    description="Display your stats on profile"
                    checked={showStats}
                    onChange={setShowStats}
                  />
                  <ToggleSetting
                    label="Show Activity"
                    description="Display recent activity"
                    checked={showActivity}
                    onChange={setShowActivity}
                  />
                </div>
              </Card>
            )}

            {/* Data & Privacy Section */}
            {activeSection === "data" && (
              <Card className="p-8 bg-white/20 dark:bg-slate-800/40 backdrop-blur-xl border-white/30 dark:border-slate-700/50">
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-6">
                  Data Management
                </h2>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-1">
                          Export Your Data
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                          Download all your quiz data, stats, and activity history
                        </p>
                        <Button
                          onClick={exportData}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export Data
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-700">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-red-900 dark:text-red-100 mb-1">
                          Delete Account
                        </h3>
                        <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <Button
                          onClick={deleteAccount}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Toggle Setting Component
function ToggleSetting({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/30 dark:bg-slate-700/30 rounded-xl">
      <div className="flex-1">
        <h4 className="font-bold text-slate-800 dark:text-slate-100">{label}</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-14 h-8 rounded-full transition-colors ${
          checked ? "bg-violet-600" : "bg-slate-300 dark:bg-slate-600"
        }`}
      >
        <motion.div
          animate={{ x: checked ? 28 : 4 }}
          className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
        />
      </button>
    </div>
  );
}
