import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvatar } from '../context/AvatarContext';
import { AvatarDisplay } from '../components/Avatar';
import { 
  CHARACTERS, 
  COLOR_PRESETS, 
  BACKGROUNDS, 
  ACCESSORIES,
  getRarityStyle,
  getUnlockRequirementText,
} from '../config/avatarConfig';
import { useToast } from '../components/ui/Toast';
import { 
  Sparkles, 
  Palette, 
  ShoppingBag, 
  Crown,
  Lock,
  Check,
  RefreshCw,
  Save,
  Trophy,
  Star,
} from 'lucide-react';

const AvatarCustomization = () => {
  const { avatar, items, stats, customizeAvatar, changeCharacter, loading } = useAvatar();
  const { success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState('characters');
  const [customization, setCustomization] = useState(avatar?.customization || {});
  const [selectedCharacter, setSelectedCharacter] = useState(avatar?.baseCharacter || 'robot');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const tabs = [
    { id: 'characters', label: 'Characters', icon: Crown },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'accessories', label: 'Accessories', icon: ShoppingBag },
    { id: 'backgrounds', label: 'Backgrounds', icon: Sparkles },
  ];

  // Handle color change
  const handleColorChange = (type, value) => {
    setCustomization(prev => ({
      ...prev,
      [type]: value,
    }));
    setHasUnsavedChanges(true);
  };

  // Handle accessory toggle
  const handleAccessoryToggle = (accessoryId) => {
    const currentAccessories = customization.accessories || [];
    const isEquipped = currentAccessories.includes(accessoryId);
    
    setCustomization(prev => ({
      ...prev,
      accessories: isEquipped 
        ? currentAccessories.filter(id => id !== accessoryId)
        : [...currentAccessories, accessoryId],
    }));
    setHasUnsavedChanges(true);
  };

  // Handle background change
  const handleBackgroundChange = (backgroundId) => {
    setCustomization(prev => ({
      ...prev,
      background: backgroundId,
    }));
    setHasUnsavedChanges(true);
  };

  // Handle character selection
  const handleCharacterSelect = async (characterId) => {
    const character = items?.baseCharacters?.find(c => c.id === characterId);
    if (!character?.isUnlocked) {
      showError('This character is locked!');
      return;
    }

    const result = await changeCharacter(characterId);
    if (result.success) {
      setSelectedCharacter(characterId);
      success('Character changed successfully!');
    } else {
      showError(result.error);
    }
  };

  // Save customization
  const handleSave = async () => {
    const result = await customizeAvatar(customization);
    if (result.success) {
      setHasUnsavedChanges(false);
      success('Avatar customized successfully! 🎨');
    } else {
      showError(result.error);
    }
  };

  // Reset to default
  const handleReset = () => {
    setCustomization(avatar?.customization || {});
    setHasUnsavedChanges(false);
    success('Reset to saved customization');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Loading your avatar...</p>
        </div>
      </div>
    );
  }

  const previewAvatar = {
    ...avatar,
    baseCharacter: selectedCharacter,
    customization,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Customize Your Avatar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Create your unique learning companion! Unlock new items by completing achievements and leveling up.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800 dark:text-white">Level {stats?.level || 1}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Level</p>
            </div>
            <div className="text-center">
              <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.completionPercentage || 0}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Collection</p>
            </div>
            <div className="text-center">
              <Sparkles className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.unlockedItems?.total || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Items Unlocked</p>
            </div>
            <div className="text-center">
              <Crown className="w-8 h-8 text-pink-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.totalItems || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
                Preview
              </h2>
              
              {/* Avatar Preview */}
              <div className="flex justify-center mb-6">
                <AvatarDisplay
                  avatar={previewAvatar}
                  size="2xl"
                  showMood={true}
                  showAccessories={true}
                  animated={true}
                  className="shadow-2xl"
                />
              </div>

              {/* Character Name */}
              <div className="text-center mb-6">
                <p className="text-xl font-semibold text-gray-800 dark:text-white">
                  {CHARACTERS[selectedCharacter]?.name || 'Robot'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {CHARACTERS[selectedCharacter]?.description || 'Default character'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
                    hasUnsavedChanges
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-5 h-5" />
                  {hasUnsavedChanges ? 'Save Changes' : 'No Changes'}
                </motion.button>

                {hasUnsavedChanges && (
                  <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReset}
                    className="w-full py-3 px-4 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center gap-2 transition-all"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Reset
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Customization Options */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'characters' && (
                    <CharactersTab
                      characters={items?.baseCharacters || []}
                      selectedCharacter={selectedCharacter}
                      onSelect={handleCharacterSelect}
                    />
                  )}
                  {activeTab === 'colors' && (
                    <ColorsTab
                      customization={customization}
                      onChange={handleColorChange}
                    />
                  )}
                  {activeTab === 'accessories' && (
                    <AccessoriesTab
                      items={items}
                      equippedAccessories={customization.accessories || []}
                      onToggle={handleAccessoryToggle}
                    />
                  )}
                  {activeTab === 'backgrounds' && (
                    <BackgroundsTab
                      backgrounds={items?.backgrounds || []}
                      selectedBackground={customization.background}
                      onSelect={handleBackgroundChange}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Characters Tab Component
const CharactersTab = ({ characters, selectedCharacter, onSelect }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
  >
    {characters.map((character) => {
      const charData = CHARACTERS[character.id];
      const isSelected = selectedCharacter === character.id;
      const isLocked = !character.isUnlocked;
      const rarityStyle = getRarityStyle(character.rarity);

      return (
        <motion.div
          key={character.id}
          whileHover={{ scale: isLocked ? 1 : 1.05 }}
          whileTap={{ scale: isLocked ? 1 : 0.95 }}
          onClick={() => !isLocked && onSelect(character.id)}
          className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
            isSelected
              ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
              : isLocked
              ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 opacity-60 cursor-not-allowed'
              : `${rarityStyle.border} ${rarityStyle.bg} hover:shadow-lg`
          }`}
        >
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl z-10">
              <Lock className="w-8 h-8 text-white" />
            </div>
          )}
          
          {isSelected && (
            <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 z-20">
              <Check className="w-4 h-4" />
            </div>
          )}

          <div className="text-center space-y-2">
            <div className="text-5xl mb-2">{charData?.emoji}</div>
            <p className="font-semibold text-gray-800 dark:text-white">{charData?.name}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{charData?.description}</p>
            {!isLocked && character.unlockLevel && (
              <span className="inline-block text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                Lvl {character.unlockLevel}
              </span>
            )}
            {isLocked && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {getUnlockRequirementText(character)}
              </p>
            )}
          </div>
        </motion.div>
      );
    })}
  </motion.div>
);

// Colors Tab Component
const ColorsTab = ({ customization, onChange }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-8"
  >
    {Object.entries(COLOR_PRESETS).map(([type, colors]) => (
      <div key={type}>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 capitalize">
          {type} Color
        </h3>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {colors.map((color) => {
            const isSelected = customization[`${type}Color`] === color.value;
            return (
              <motion.button
                key={color.value}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onChange(`${type}Color`, color.value)}
                className={`relative w-12 h-12 rounded-full transition-all ${
                  isSelected ? 'ring-4 ring-indigo-600 ring-offset-2 dark:ring-offset-gray-800' : ''
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {isSelected && (
                  <Check className="w-6 h-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    ))}
  </motion.div>
);

// Accessories Tab Component  
const AccessoriesTab = ({ items, equippedAccessories, onToggle }) => {
  const accessoryCategories = [
    { key: 'headAccessories', label: 'Head' },
    { key: 'faceAccessories', label: 'Face' },
    { key: 'badges', label: 'Badges' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {accessoryCategories.map(category => {
        const categoryItems = items?.[category.key] || [];
        return (
          <div key={category.key}>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              {category.label} Accessories
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryItems.map((item) => {
                const isEquipped = equippedAccessories.includes(item.id);
                const isLocked = !item.isUnlocked;
                const accessoryData = ACCESSORIES[item.id];
                const rarityStyle = getRarityStyle(item.rarity);

                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: isLocked ? 1 : 1.05 }}
                    whileTap={{ scale: isLocked ? 1 : 0.95 }}
                    onClick={() => !isLocked && onToggle(item.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isEquipped
                        ? 'border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-900/30'
                        : isLocked
                        ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 opacity-60 cursor-not-allowed'
                        : `${rarityStyle.border} ${rarityStyle.bg} hover:shadow-lg`
                    }`}
                  >
                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl z-10">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                    )}
                    
                    {isEquipped && (
                      <div className="absolute top-2 right-2 bg-green-600 text-white rounded-full p-1 z-20">
                        <Check className="w-4 h-4" />
                      </div>
                    )}

                    <div className="text-center space-y-2">
                      <div className="text-4xl mb-2">{accessoryData?.emoji}</div>
                      <p className="font-semibold text-gray-800 dark:text-white text-sm">
                        {accessoryData?.name || item.name}
                      </p>
                      {isLocked && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {getUnlockRequirementText(item)}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
};

// Backgrounds Tab Component
const BackgroundsTab = ({ backgrounds, selectedBackground, onSelect }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="grid grid-cols-2 md:grid-cols-3 gap-4"
  >
    {backgrounds.map((bg) => {
      const bgData = BACKGROUNDS[bg.id];
      const isSelected = selectedBackground === bg.id;
      const isLocked = !bg.isUnlocked;
      const rarityStyle = getRarityStyle(bg.rarity);

      return (
        <motion.div
          key={bg.id}
          whileHover={{ scale: isLocked ? 1 : 1.05 }}
          whileTap={{ scale: isLocked ? 1 : 0.95 }}
          onClick={() => !isLocked && onSelect(bg.id)}
          className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${
            isSelected
              ? 'border-indigo-600 dark:border-indigo-400 ring-4 ring-indigo-200 dark:ring-indigo-800'
              : isLocked
              ? 'border-gray-300 dark:border-gray-600 opacity-60 cursor-not-allowed'
              : `${rarityStyle.border} hover:shadow-xl`
          }`}
        >
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl z-10">
              <Lock className="w-8 h-8 text-white" />
            </div>
          )}
          
          {isSelected && (
            <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 z-20">
              <Check className="w-4 h-4" />
            </div>
          )}

          <div 
            className="w-full h-32 rounded-lg mb-3"
            style={{ background: bgData?.gradient }}
          />
          <p className="font-semibold text-gray-800 dark:text-white text-center">
            {bgData?.name || bg.name}
          </p>
          {isLocked && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              {getUnlockRequirementText(bg)}
            </p>
          )}
        </motion.div>
      );
    })}
  </motion.div>
);

export default AvatarCustomization;
