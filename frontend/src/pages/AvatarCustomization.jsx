import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAvatar } from "../context/AvatarContext";
import LearningAvatar from "../components/Avatar/LearningAvatar";
import { FaArrowLeft, FaSave, FaRedo } from "react-icons/fa";
import { toast } from "react-toastify";

const AvatarCustomization = () => {
  const navigate = useNavigate();
  const { avatar, updateAvatar, loading } = useAvatar();

  // Default customization values
  const defaultCustomization = {
    skinTone: "#F5D6C6",
    hairColor: "#4A3728",
    hairStyle: "short",
    eyeColor: "#4A3728",
    shirtColor: "#6366F1",
    glasses: false,
    glassesStyle: "round",
    hat: false,
    hatStyle: "cap",
    crown: false,
    necklace: false,
    earrings: false,
  };

  const [customization, setCustomization] = useState(
    avatar?.customization || defaultCustomization
  );
  const [saving, setSaving] = useState(false);

  // Check unlocked features based on achievements
  const achievements = avatar?.achievements || [];
  const totalQuizzes = avatar?.stats?.totalQuizzesTaken || 0;
  const currentLevel = avatar?.evolution?.currentLevel || 1;

  const isGlassesUnlocked = totalQuizzes >= 1;
  const isHatUnlocked = currentLevel >= 5;
  const isCrownUnlocked = currentLevel >= 10;
  const isNecklaceUnlocked = totalQuizzes >= 20;
  const isEarringsUnlocked = totalQuizzes >= 10;

  // Color palettes
  const skinTones = [
    "#FFDFC4",
    "#F5D6C6",
    "#E8B897",
    "#D4A574",
    "#C68642",
    "#8D5524",
    "#5C4033",
  ];
  const hairColors = [
    "#000000",
    "#4A3728",
    "#8B4513",
    "#D2691E",
    "#FFD700",
    "#FF6347",
    "#E91E63",
    "#9C27B0",
  ];
  const eyeColors = [
    "#000000",
    "#4A3728",
    "#0F52BA",
    "#50C878",
    "#808080",
    "#964B00",
  ];
  const shirtColors = [
    "#6366F1",
    "#8B5CF6",
    "#EC4899",
    "#F59E0B",
    "#10B981",
    "#3B82F6",
    "#EF4444",
    "#14B8A6",
  ];
  const hairStyles = [
    { value: "short", label: "Short" },
    { value: "medium", label: "Medium" },
    { value: "long", label: "Long" },
    { value: "curly", label: "Curly" },
    { value: "wavy", label: "Wavy" },
    { value: "bald", label: "Bald" },
    { value: "ponytail", label: "Ponytail" },
    { value: "bun", label: "Bun" },
    { value: "afro", label: "Afro" },
    { value: "braids", label: "Braids" },
  ];

  const handleColorChange = (type, color) => {
    setCustomization((prev) => ({ ...prev, [type]: color }));
  };

  const handleStyleChange = (style) => {
    setCustomization((prev) => ({ ...prev, hairStyle: style }));
  };

  const handleAccessoryToggle = (accessory) => {
    setCustomization((prev) => ({ ...prev, [accessory]: !prev[accessory] }));
  };

  const handleAccessoryStyleChange = (accessory, style) => {
    setCustomization((prev) => ({ ...prev, [accessory]: style }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateAvatar({ customization });
      if (result.success) {
        toast.success("Avatar customization saved! 🎉");
        setTimeout(() => navigate("/profile"), 1500);
      } else {
        toast.error(result.error || "Failed to save customization");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save customization");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setCustomization(defaultCustomization);
    toast.info("Reset to default avatar");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading avatar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white mb-4 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                Customize Your Avatar
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Personalize your learning companion
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Preview Section */}
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-8">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                Preview
              </h2>
              <div className="mb-4">
                <LearningAvatar
                  size="xl"
                  showName={false}
                  showLevel={false}
                  interactive={false}
                  customConfig={customization}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                This is how your avatar will appear
              </p>
            </div>

            {/* Customization Options */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Customize
              </h2>

              {/* Skin Tone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Skin Tone
                </label>
                <div className="flex flex-wrap gap-3">
                  {skinTones.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange("skinTone", color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        customization.skinTone === color
                          ? "border-purple-500 scale-110 shadow-lg"
                          : "border-gray-300 dark:border-gray-600 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Hair Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Hair Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {hairStyles.map((style) => (
                    <button
                      key={style.value}
                      onClick={() => handleStyleChange(style.value)}
                      className={`px-3 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                        customization.hairStyle === style.value
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                          : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-purple-300"
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Hair Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {hairColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange("hairColor", color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        customization.hairColor === color
                          ? "border-purple-500 scale-110 shadow-lg"
                          : "border-gray-300 dark:border-gray-600 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Eye Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Eye Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {eyeColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange("eyeColor", color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        customization.eyeColor === color
                          ? "border-purple-500 scale-110 shadow-lg"
                          : "border-gray-300 dark:border-gray-600 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Shirt Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Shirt Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {shirtColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange("shirtColor", color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        customization.shirtColor === color
                          ? "border-purple-500 scale-110 shadow-lg"
                          : "border-gray-300 dark:border-gray-600 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Accessories Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                  Accessories (Achievement Unlocks)
                </h3>

                {/* Glasses */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Glasses{" "}
                      {isGlassesUnlocked ? "✓" : "🔒 Complete 1 quiz to unlock"}
                    </label>
                    <button
                      onClick={() => handleAccessoryToggle("glasses")}
                      disabled={!isGlassesUnlocked}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        customization.glasses && isGlassesUnlocked
                          ? "bg-purple-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      } ${
                        !isGlassesUnlocked
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:opacity-90"
                      }`}
                    >
                      {customization.glasses ? "ON" : "OFF"}
                    </button>
                  </div>
                  {customization.glasses && isGlassesUnlocked && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() =>
                          handleAccessoryStyleChange("glassesStyle", "round")
                        }
                        className={`px-3 py-1 rounded text-sm ${
                          customization.glassesStyle === "round"
                            ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        Round
                      </button>
                      <button
                        onClick={() =>
                          handleAccessoryStyleChange("glassesStyle", "square")
                        }
                        className={`px-3 py-1 rounded text-sm ${
                          customization.glassesStyle === "square"
                            ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        Square
                      </button>
                    </div>
                  )}
                </div>

                {/* Earrings */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Earrings{" "}
                      {isEarringsUnlocked
                        ? "✓"
                        : "🔒 Complete 10 quizzes to unlock"}
                    </label>
                    <button
                      onClick={() => handleAccessoryToggle("earrings")}
                      disabled={!isEarringsUnlocked}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        customization.earrings && isEarringsUnlocked
                          ? "bg-purple-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      } ${
                        !isEarringsUnlocked
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:opacity-90"
                      }`}
                    >
                      {customization.earrings ? "ON" : "OFF"}
                    </button>
                  </div>
                </div>

                {/* Necklace */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Necklace{" "}
                      {isNecklaceUnlocked
                        ? "✓"
                        : "🔒 Complete 20 quizzes to unlock"}
                    </label>
                    <button
                      onClick={() => handleAccessoryToggle("necklace")}
                      disabled={!isNecklaceUnlocked}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        customization.necklace && isNecklaceUnlocked
                          ? "bg-purple-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      } ${
                        !isNecklaceUnlocked
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:opacity-90"
                      }`}
                    >
                      {customization.necklace ? "ON" : "OFF"}
                    </button>
                  </div>
                </div>

                {/* Hat */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Hat {isHatUnlocked ? "✓" : "🔒 Reach Level 5 to unlock"}
                    </label>
                    <button
                      onClick={() => handleAccessoryToggle("hat")}
                      disabled={!isHatUnlocked || customization.crown}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        customization.hat && isHatUnlocked
                          ? "bg-purple-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      } ${
                        !isHatUnlocked || customization.crown
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:opacity-90"
                      }`}
                    >
                      {customization.hat ? "ON" : "OFF"}
                    </button>
                  </div>
                  {customization.hat &&
                    isHatUnlocked &&
                    !customization.crown && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() =>
                            handleAccessoryStyleChange("hatStyle", "cap")
                          }
                          className={`px-3 py-1 rounded text-sm ${
                            customization.hatStyle === "cap"
                              ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          Cap
                        </button>
                        <button
                          onClick={() =>
                            handleAccessoryStyleChange("hatStyle", "fedora")
                          }
                          className={`px-3 py-1 rounded text-sm ${
                            customization.hatStyle === "fedora"
                              ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          Fedora
                        </button>
                      </div>
                    )}
                </div>

                {/* Crown */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Crown 👑{" "}
                      {isCrownUnlocked ? "✓" : "🔒 Reach Level 10 to unlock"}
                    </label>
                    <button
                      onClick={() => {
                        handleAccessoryToggle("crown");
                        if (!customization.crown) {
                          setCustomization((prev) => ({ ...prev, hat: false }));
                        }
                      }}
                      disabled={!isCrownUnlocked}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        customization.crown && isCrownUnlocked
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      } ${
                        !isCrownUnlocked
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:opacity-90"
                      }`}
                    >
                      {customization.crown ? "ON" : "OFF"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  <FaRedo />
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg disabled:opacity-50"
                >
                  <FaSave />
                  {saving ? "Saving..." : "Save Avatar"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
              Full Customization
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Choose from multiple skin tones, hair styles, and colors!
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
              Real-time Preview
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              See your changes instantly as you customize your avatar.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-4xl mb-3">💾</div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
              Save & Share
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Your unique avatar appears everywhere in your learning journey!
            </p>
          </div>
        </div>
      </div>

      {/* Loading Overlay - removed */}
    </div>
  );
};

export default AvatarCustomization;
