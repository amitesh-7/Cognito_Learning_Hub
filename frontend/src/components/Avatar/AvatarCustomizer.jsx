import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Palette,
  Shirt,
  Glasses,
  Crown,
  Sparkles,
  Frame,
  Mic,
  Volume2,
  Save,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  Check,
} from "lucide-react";
import { useAvatar } from "../../context/AvatarContext";
import LearningAvatar from "./LearningAvatar";
import Button from "../ui/Button";
import { useToast } from "../ui/Toast";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

/**
 * Avatar Customizer Component
 * Allows users to fully customize their learning avatar
 */
const AvatarCustomizer = ({ onClose, onSave }) => {
  const { avatar, updateAvatar } = useAvatar();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState("appearance");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Local customization state
  const [customization, setCustomization] = useState(
    avatar?.customization || {}
  );
  const [name, setName] = useState(avatar?.name || "My Avatar");
  const [bio, setBio] = useState(avatar?.bio || "");

  // Get unlocked items
  const unlockedItems = new Set(
    avatar?.evolution?.unlockedItems?.map((i) => i.itemId) || []
  );

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Check if item is unlocked
  const isUnlocked = (itemId, defaultUnlocked = false) => {
    return defaultUnlocked || unlockedItems.has(itemId);
  };

  // Customization options
  const options = {
    appearance: {
      skinTone: [
        { id: "light", name: "Light", color: "#FFDFC4" },
        { id: "fair", name: "Fair", color: "#F0D5BE" },
        { id: "medium", name: "Medium", color: "#D4A574" },
        { id: "tan", name: "Tan", color: "#C68642" },
        { id: "brown", name: "Brown", color: "#8D5524" },
        { id: "dark", name: "Dark", color: "#5C3317" },
      ],
      hairStyle: [
        { id: "short", name: "Short", unlocked: true },
        { id: "medium", name: "Medium", unlocked: true },
        { id: "long", name: "Long", unlocked: true },
        { id: "curly", name: "Curly", unlocked: true },
        { id: "wavy", name: "Wavy", unlocked: true },
        { id: "bald", name: "Bald", unlocked: true },
        { id: "ponytail", name: "Ponytail", unlocked: true },
        { id: "bun", name: "Bun", unlocked: true },
        { id: "afro", name: "Afro", unlocked: true },
        { id: "braids", name: "Braids", unlocked: true },
      ],
      hairColor: [
        { id: "black", name: "Black", color: "#1a1a1a" },
        { id: "brown", name: "Brown", color: "#4a3728" },
        { id: "blonde", name: "Blonde", color: "#d4a76a" },
        { id: "red", name: "Red", color: "#922724" },
        { id: "gray", name: "Gray", color: "#808080" },
        { id: "white", name: "White", color: "#f0f0f0" },
        { id: "blue", name: "Blue", color: "#3498db" },
        { id: "purple", name: "Purple", color: "#9b59b6" },
        { id: "green", name: "Green", color: "#27ae60" },
        { id: "pink", name: "Pink", color: "#e91e63" },
      ],
      eyeColor: [
        { id: "brown", name: "Brown", color: "#4a3728" },
        { id: "blue", name: "Blue", color: "#3498db" },
        { id: "green", name: "Green", color: "#27ae60" },
        { id: "hazel", name: "Hazel", color: "#8B7355" },
        { id: "gray", name: "Gray", color: "#708090" },
        { id: "amber", name: "Amber", color: "#FFBF00" },
      ],
    },
    accessories: {
      hat: [
        { id: "none", name: "None", unlocked: true },
        { id: "cap", name: "Cap", unlocked: true },
        { id: "beanie", name: "Beanie", unlocked: true },
        { id: "graduation", name: "Graduation Cap", itemId: "hat_graduation" },
        { id: "crown", name: "Crown", itemId: "hat_crown" },
        { id: "wizard", name: "Wizard Hat", itemId: "hat_wizard" },
        { id: "headphones", name: "Headphones", itemId: "hat_headphones" },
        { id: "halo", name: "Halo", itemId: "hat_halo" },
      ],
      glasses: [
        { id: "none", name: "None", unlocked: true },
        { id: "round", name: "Round", unlocked: true },
        { id: "square", name: "Square", unlocked: true },
        { id: "aviator", name: "Aviator", unlocked: true },
        { id: "cat-eye", name: "Cat Eye", unlocked: true },
        { id: "sports", name: "Sports", unlocked: true },
        { id: "nerd", name: "Nerd", itemId: "glasses_nerd" },
        { id: "futuristic", name: "Futuristic", itemId: "glasses_futuristic" },
      ],
    },
    outfits: {
      outfit: [
        { id: "casual", name: "Casual", unlocked: true },
        { id: "formal", name: "Formal", unlocked: true },
        { id: "sporty", name: "Sporty", unlocked: true },
        { id: "academic", name: "Academic Robes", itemId: "outfit_academic" },
        { id: "superhero", name: "Superhero", itemId: "outfit_superhero" },
        { id: "scientist", name: "Scientist", itemId: "outfit_scientist" },
        { id: "astronaut", name: "Astronaut", itemId: "outfit_astronaut" },
        { id: "royal", name: "Royal", itemId: "outfit_royal" },
      ],
      outfitColor: [
        { id: "blue", name: "Blue", color: "#3498db" },
        { id: "red", name: "Red", color: "#e74c3c" },
        { id: "green", name: "Green", color: "#27ae60" },
        { id: "purple", name: "Purple", color: "#9b59b6" },
        { id: "orange", name: "Orange", color: "#f39c12" },
        { id: "pink", name: "Pink", color: "#e91e63" },
        { id: "black", name: "Black", color: "#2c3e50" },
        { id: "white", name: "White", color: "#ecf0f1" },
        { id: "gold", name: "Gold", color: "#FFD700" },
        { id: "rainbow", name: "Rainbow", gradient: true },
      ],
    },
    effects: {
      aura: [
        { id: "none", name: "None", unlocked: true },
        { id: "glow", name: "Glow", itemId: "aura_glow" },
        { id: "sparkle", name: "Sparkle", itemId: "aura_sparkle" },
        { id: "fire", name: "Fire", itemId: "aura_fire" },
        { id: "ice", name: "Ice", itemId: "aura_ice" },
        { id: "electric", name: "Electric", itemId: "aura_electric" },
        { id: "rainbow", name: "Rainbow", itemId: "aura_rainbow" },
        { id: "cosmic", name: "Cosmic", itemId: "aura_cosmic" },
      ],
      frame: [
        { id: "none", name: "None", unlocked: true },
        { id: "bronze", name: "Bronze", itemId: "frame_bronze", color: "#CD7F32" },
        { id: "silver", name: "Silver", itemId: "frame_silver", color: "#C0C0C0" },
        { id: "gold", name: "Gold", itemId: "frame_gold", color: "#FFD700" },
        { id: "platinum", name: "Platinum", itemId: "frame_platinum", color: "#E5E4E2" },
        { id: "diamond", name: "Diamond", itemId: "frame_diamond", color: "#B9F2FF" },
        { id: "legendary", name: "Legendary", itemId: "frame_legendary", gradient: true },
      ],
    },
  };

  const tabs = [
    { id: "appearance", name: "Appearance", icon: User },
    { id: "accessories", name: "Accessories", icon: Crown },
    { id: "outfits", name: "Outfits", icon: Shirt },
    { id: "effects", name: "Effects", icon: Sparkles },
  ];

  // Update customization
  const handleCustomizationChange = useCallback((key, value) => {
    setCustomization((prev) => {
      const newCustomization = { ...prev };
      
      // Handle accessories that need both boolean flag and style
      if (key === 'hat') {
        if (value === 'none') {
          newCustomization.hat = false;
          newCustomization.hatStyle = 'cap';
        } else {
          newCustomization.hat = true;
          newCustomization.hatStyle = value;
        }
      } else if (key === 'glasses') {
        if (value === 'none') {
          newCustomization.glasses = false;
          newCustomization.glassesStyle = 'round';
        } else {
          newCustomization.glasses = true;
          newCustomization.glassesStyle = value;
        }
      } else if (key === 'outfit') {
        newCustomization.outfit = value;
        // Store outfit for future use
      } else if (key === 'outfitColor') {
        newCustomization.outfitColor = value;
        // Map to shirtColor for compatibility with LearningAvatar
        const colorMap = {
          'blue': '#3498db',
          'red': '#e74c3c',
          'green': '#27ae60',
          'purple': '#9b59b6',
          'orange': '#f39c12',
          'pink': '#e91e63',
          'black': '#2c3e50',
          'white': '#ecf0f1',
          'gold': '#FFD700',
        };
        if (colorMap[value]) {
          newCustomization.shirtColor = colorMap[value];
        }
      } else if (key === 'aura' || key === 'frame') {
        newCustomization[key] = value;
        // Store for effects
      } else {
        newCustomization[key] = value;
      }
      
      return newCustomization;
    });
    setHasChanges(true);
  }, []);

  // Reset to defaults
  const handleReset = useCallback(() => {
    setCustomization(avatar?.customization || {});
    setName(avatar?.name || "My Avatar");
    setBio(avatar?.bio || "");
    setHasChanges(false);
  }, [avatar]);

  // Save customization
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateAvatar({
        name,
        bio,
        customization,
      });
      
      if (result.success) {
        success("Avatar saved successfully!");
        setHasChanges(false);
        onSave?.(result.avatar);
      } else {
        error(result.error || "Failed to save avatar");
      }
    } catch (err) {
      error("Failed to save avatar");
    } finally {
      setIsSaving(false);
    }
  };

  // Render option selector
  const renderOptionSelector = (category, optionKey, optionList) => {
    let currentValue = customization[optionKey];
    
    // Map boolean+style properties back to ID for display
    if (optionKey === 'hat') {
      if (customization.hat === false || !customization.hat) {
        currentValue = 'none';
      } else {
        currentValue = customization.hatStyle || 'cap';
      }
    } else if (optionKey === 'glasses') {
      if (customization.glasses === false || !customization.glasses) {
        currentValue = 'none';
      } else {
        currentValue = customization.glassesStyle || 'round';
      }
    }
    
    return (
      <div className="mb-4 sm:mb-6">
        <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 capitalize">
          {optionKey.replace(/([A-Z])/g, " $1").trim()}
        </h4>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {optionList.map((option) => {
            const itemUnlocked = option.unlocked || isUnlocked(option.itemId);
            const isSelected = currentValue === option.id;
            
            return (
              <motion.button
                key={option.id}
                onClick={() => itemUnlocked && handleCustomizationChange(optionKey, option.id)}
                disabled={!itemUnlocked}
                className={`relative flex items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border-2 transition-all min-h-[36px] ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900"
                    : itemUnlocked
                    ? "border-gray-200 dark:border-gray-700 hover:border-indigo-300"
                    : "border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed"
                }`}
                whileHover={itemUnlocked ? { scale: 1.05 } : {}}
                whileTap={itemUnlocked ? { scale: 0.95 } : {}}
              >
                {option.color && (
                  <div
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full mr-1.5 sm:mr-2 border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: option.color }}
                  />
                )}
                {option.gradient && (
                  <div
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full mr-1.5 sm:mr-2 border border-gray-300 flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #FF6B6B, #4ECDC4, #FFE66D, #9B59B6)",
                    }}
                  />
                )}
                <span className="text-xs sm:text-sm">{option.name}</span>
                
                {!itemUnlocked && (
                  <Lock className="w-3 h-3 ml-0.5 sm:ml-1 text-gray-400 flex-shrink-0" />
                )}
                {isSelected && itemUnlocked && (
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5 sm:ml-1 text-indigo-500 flex-shrink-0" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="hidden xs:inline">Customize Your Avatar</span>
            <span className="xs:hidden">Customize</span>
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl w-8 h-8 flex items-center justify-center"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Panel - Avatar Preview */}
          <div className="w-full md:w-1/3 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-3 sm:p-6 flex md:flex-col items-center justify-center md:justify-start gap-3 md:gap-0 flex-shrink-0">
            {/* Avatar Preview - Real-time with customization */}
            <div className="flex-shrink-0 md:mb-6">
              <LearningAvatar
                size="medium"
                showName={false}
                showLevel={true}
                interactive={false}
                customConfig={customization}
              />
            </div>

            {/* Name Input */}
            <div className="hidden md:block w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Avatar Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setHasChanges(true);
                }}
                maxLength={30}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Bio Input */}
            <div className="hidden md:block w-full mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  setHasChanges(true);
                }}
                maxLength={150}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="A short bio for your avatar..."
              />
            </div>

            {/* Evolution Info */}
            <div className="hidden md:block w-full mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Level</span>
                <span className="font-bold text-indigo-500">
                  {avatar?.evolution?.currentLevel || 1}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600 dark:text-gray-400">Stage</span>
                <span className="font-bold text-purple-500 capitalize">
                  {avatar?.evolution?.evolutionStage || "Novice"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel - Customization Options */}
          <div className="flex-1 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors min-w-0 ${
                    activeTab === tab.id
                      ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">{tab.name}</span>
                </button>
              ))}
            </div>

            {/* Options Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {Object.entries(options[activeTab] || {}).map(([key, optionList]) =>
                    renderOptionSelector(activeTab, key, optionList)
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 flex-shrink-0">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!hasChanges}
                className="w-full sm:w-auto"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              
              <div className="flex gap-2 sm:gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-initial">
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  className="flex-1 sm:flex-initial"
                >
                  <Save className="w-4 h-4 mr-2" />
                  <span className="hidden xs:inline">{isSaving ? "Saving..." : "Save Avatar"}</span>
                  <span className="xs:hidden">{isSaving ? "Saving..." : "Save"}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AvatarCustomizer;
