import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Eye,
  Type,
  Volume2,
  Zap,
  Target,
  RotateCcw,
  X,
  EyeOff,
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

/**
 * Compact Horizontal Accessibility Modal for Navbar
 * Clean, small settings panel
 */
export default function AccessibilityModal({ isOpen, onClose }) {
  const { settings, updateSetting, toggleSetting, resetSettings, toggleVisuallyImpairedMode } = useAccessibility();

  if (!isOpen) return null;

  const quickSettings = [
    {
      id: 'visuallyImpairedMode',
      label: 'Visually Impaired Mode',
      icon: settings.visuallyImpairedMode ? Eye : EyeOff,
      description: 'Audio-first quiz experience',
      action: () => toggleVisuallyImpairedMode(),
      isActive: settings.visuallyImpairedMode,
      color: 'emerald',
    },
    {
      id: 'textToSpeech',
      label: 'Text to Speech',
      icon: Volume2,
      description: 'Read content aloud',
      action: () => toggleSetting('textToSpeech'),
      isActive: settings.textToSpeech,
      color: 'blue',
    },
    {
      id: 'highContrast',
      label: 'High Contrast',
      icon: Target,
      description: 'Increase visibility',
      action: () => toggleSetting('highContrast'),
      isActive: settings.highContrast,
      color: 'purple',
    },
    {
      id: 'reducedMotion',
      label: 'Reduce Motion',
      icon: Zap,
      description: 'Minimize animations',
      action: () => toggleSetting('reducedMotion'),
      isActive: settings.reducedMotion,
      color: 'orange',
    },
  ];

  const fontSizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'extra-large', label: 'Extra Large' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-start justify-center pt-20"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl mx-4 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Accessibility Settings</h3>
                <p className="text-xs text-white/80">Quick customization (Alt+A for VI mode)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Quick Toggle Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {quickSettings.map((setting) => {
                const Icon = setting.icon;
                return (
                  <button
                    key={setting.id}
                    onClick={setting.action}
                    className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                      setting.isActive
                        ? `border-${setting.color}-500 bg-${setting.color}-50 dark:bg-${setting.color}-900/20`
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon
                      className={`w-8 h-8 mx-auto mb-2 ${
                        setting.isActive
                          ? `text-${setting.color}-600 dark:text-${setting.color}-400`
                          : 'text-gray-400'
                      }`}
                    />
                    <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1">
                      {setting.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {setting.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Font Size */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Type className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h4 className="font-semibold text-gray-800 dark:text-white">Font Size</h4>
              </div>
              <div className="flex gap-2">
                {fontSizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => updateSetting('fontSize', size.value)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      settings.fontSize === size.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-400'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Settings Row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition">
                <input
                  type="checkbox"
                  checked={settings.enhancedFocus}
                  onChange={() => toggleSetting('enhancedFocus')}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Enhanced Focus</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Better visibility</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition">
                <input
                  type="checkbox"
                  checked={settings.keyboardNavigation}
                  onChange={() => toggleSetting('keyboardNavigation')}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Keyboard Nav</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Enhanced shortcuts</p>
                </div>
              </label>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={resetSettings}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
