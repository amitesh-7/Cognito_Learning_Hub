import React, { useState } from "react";
import Avatar3D from "./Avatar3D";
import {
  FaPalette,
  FaTshirt,
  FaGlasses,
  FaHatCowboy,
  FaSmile,
} from "react-icons/fa";

const AvatarCustomizer3D = ({ initialConfig, onSave, onCancel }) => {
  const [config, setConfig] = useState(
    initialConfig || {
      skinColor: "#FFD6A5",
      eyeColor: "#2C3E50",
      hairColor: "#8B4513",
      hairStyle: "short",
      shirtColor: "#3498DB",
      pantsColor: "#2C3E50",
      expression: "happy",
      glasses: false,
      hat: null,
    }
  );

  const [activeTab, setActiveTab] = useState("appearance");

  // Color palettes
  const skinColors = [
    "#FFD6A5",
    "#F1C27D",
    "#E0AC69",
    "#C68642",
    "#8D5524",
    "#5C4033",
  ];
  const eyeColors = [
    "#2C3E50",
    "#3498DB",
    "#2ECC71",
    "#9B59B6",
    "#E67E22",
    "#1ABC9C",
  ];
  const hairColors = [
    "#000000",
    "#3B2F2F",
    "#8B4513",
    "#D2691E",
    "#FFD700",
    "#FF6B6B",
    "#9B59B6",
    "#FFFFFF",
  ];
  const shirtColors = [
    "#E74C3C",
    "#3498DB",
    "#2ECC71",
    "#F39C12",
    "#9B59B6",
    "#1ABC9C",
    "#34495E",
    "#ECF0F1",
  ];
  const pantsColors = [
    "#2C3E50",
    "#34495E",
    "#16A085",
    "#27AE60",
    "#2980B9",
    "#8E44AD",
    "#7F8C8D",
  ];

  const hairStyles = [
    { value: "short", label: "Short", emoji: "✂️" },
    { value: "spiky", label: "Spiky", emoji: "⚡" },
    { value: "long", label: "Long", emoji: "💁" },
  ];

  const expressions = [
    { value: "happy", label: "Happy", emoji: "😊" },
    { value: "neutral", label: "Neutral", emoji: "😐" },
    { value: "surprised", label: "Surprised", emoji: "😮" },
  ];

  const hats = [
    { value: null, label: "None", emoji: "❌" },
    { value: "cap", label: "Cap", emoji: "🧢" },
    { value: "beanie", label: "Beanie", emoji: "🎩" },
  ];

  const updateConfig = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(config);
    }
  };

  const handleReset = () => {
    setConfig({
      skinColor: "#FFD6A5",
      eyeColor: "#2C3E50",
      hairColor: "#8B4513",
      hairStyle: "short",
      shirtColor: "#3498DB",
      pantsColor: "#2C3E50",
      expression: "happy",
      glasses: false,
      hat: null,
    });
  };

  const handleRandomize = () => {
    setConfig({
      skinColor: skinColors[Math.floor(Math.random() * skinColors.length)],
      eyeColor: eyeColors[Math.floor(Math.random() * eyeColors.length)],
      hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
      hairStyle:
        hairStyles[Math.floor(Math.random() * hairStyles.length)].value,
      shirtColor: shirtColors[Math.floor(Math.random() * shirtColors.length)],
      pantsColor: pantsColors[Math.floor(Math.random() * pantsColors.length)],
      expression:
        expressions[Math.floor(Math.random() * expressions.length)].value,
      glasses: Math.random() > 0.5,
      hat: hats[Math.floor(Math.random() * hats.length)].value,
    });
  };

  const ColorPicker = ({ colors, value, onChange, label }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`w-10 h-10 rounded-full border-2 transition-all ${
              value === color
                ? "border-blue-500 scale-110 shadow-lg"
                : "border-gray-300 dark:border-gray-600 hover:scale-105"
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );

  const OptionSelector = ({ options, value, onChange, label }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              value === option.value
                ? "bg-blue-500 text-white shadow-lg scale-105"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <span className="mr-1">{option.emoji}</span>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      {/* 3D Preview */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <FaPalette className="mr-2 text-purple-500" />
          Avatar Preview
        </h2>
        <div className="bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-inner">
          <Avatar3D config={config} height="500px" animate={true} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleRandomize}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-md"
          >
            🎲 Randomize
          </button>
          <button
            onClick={handleReset}
            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-all shadow-md"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* Customization Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Customize Avatar
        </h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("appearance")}
            className={`px-4 py-2 font-medium transition-all ${
              activeTab === "appearance"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <FaPalette className="inline mr-2" />
            Appearance
          </button>
          <button
            onClick={() => setActiveTab("clothing")}
            className={`px-4 py-2 font-medium transition-all ${
              activeTab === "clothing"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <FaTshirt className="inline mr-2" />
            Clothing
          </button>
          <button
            onClick={() => setActiveTab("accessories")}
            className={`px-4 py-2 font-medium transition-all ${
              activeTab === "accessories"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <FaGlasses className="inline mr-2" />
            Accessories
          </button>
        </div>

        {/* Customization Options */}
        <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {activeTab === "appearance" && (
            <div>
              <ColorPicker
                colors={skinColors}
                value={config.skinColor}
                onChange={(color) => updateConfig("skinColor", color)}
                label="Skin Tone"
              />
              <ColorPicker
                colors={eyeColors}
                value={config.eyeColor}
                onChange={(color) => updateConfig("eyeColor", color)}
                label="Eye Color"
              />
              <ColorPicker
                colors={hairColors}
                value={config.hairColor}
                onChange={(color) => updateConfig("hairColor", color)}
                label="Hair Color"
              />
              <OptionSelector
                options={hairStyles}
                value={config.hairStyle}
                onChange={(style) => updateConfig("hairStyle", style)}
                label="Hair Style"
              />
              <OptionSelector
                options={expressions}
                value={config.expression}
                onChange={(expr) => updateConfig("expression", expr)}
                label="Expression"
              />
            </div>
          )}

          {activeTab === "clothing" && (
            <div>
              <ColorPicker
                colors={shirtColors}
                value={config.shirtColor}
                onChange={(color) => updateConfig("shirtColor", color)}
                label="Shirt Color"
              />
              <ColorPicker
                colors={pantsColors}
                value={config.pantsColor}
                onChange={(color) => updateConfig("pantsColor", color)}
                label="Pants Color"
              />
            </div>
          )}

          {activeTab === "accessories" && (
            <div>
              <div className="mb-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.glasses}
                    onChange={(e) => updateConfig("glasses", e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    <FaGlasses className="inline mr-2" />
                    Wear Glasses
                  </span>
                </label>
              </div>
              <OptionSelector
                options={hats}
                value={config.hat}
                onChange={(hat) => updateConfig("hat", hat)}
                label="Hat"
              />
            </div>
          )}
        </div>

        {/* Save/Cancel Buttons */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
          >
            💾 Save Avatar
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a5568;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
      `}</style>
    </div>
  );
};

export default AvatarCustomizer3D;
