import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Eye,
  Type,
  Zap,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Target,
  BookOpen,
  RotateCcw,
  X,
  ChevronRight,
  Accessibility,
  Check,
} from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';

/**
 * Accessibility Toolbar Component
 * Floating toolbar for quick accessibility settings
 */
export const AccessibilityToolbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState('main'); // main, visual, motion, audio
  const { settings, updateSetting, toggleSetting, resetSettings } = useAccessibility();

  const toggleToolbar = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setActivePanel('main');
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="accessibility-toggle"
        onClick={toggleToolbar}
        aria-label="Accessibility settings"
        aria-expanded={isOpen}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9998,
          transition: 'all 0.3s ease',
        }}
      >
        <Accessibility size={28} />
      </motion.button>

      {/* Toolbar Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleToolbar}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 9997,
              }}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="accessibility-panel"
              role="dialog"
              aria-label="Accessibility settings panel"
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                maxWidth: '400px',
                backgroundColor: 'white',
                boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.2)',
                zIndex: 9999,
                overflowY: 'auto',
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '1.5rem',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                }}
              >
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                  <Accessibility size={24} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Accessibility
                </h2>
                <button
                  onClick={toggleToolbar}
                  aria-label="Close accessibility settings"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    padding: '0.5rem',
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div style={{ padding: '1.5rem' }}>
                {activePanel === 'main' && (
                  <MainPanel
                    settings={settings}
                    toggleSetting={toggleSetting}
                    setActivePanel={setActivePanel}
                  />
                )}

                {activePanel === 'visual' && (
                  <VisualPanel
                    settings={settings}
                    updateSetting={updateSetting}
                    toggleSetting={toggleSetting}
                    setActivePanel={setActivePanel}
                  />
                )}

                {activePanel === 'motion' && (
                  <MotionPanel
                    settings={settings}
                    toggleSetting={toggleSetting}
                    setActivePanel={setActivePanel}
                  />
                )}

                {activePanel === 'audio' && (
                  <AudioPanel
                    settings={settings}
                    toggleSetting={toggleSetting}
                    setActivePanel={setActivePanel}
                  />
                )}

                {/* Reset Button */}
                <button
                  onClick={() => {
                    if (confirm('Reset all accessibility settings to default?')) {
                      resetSettings();
                    }
                  }}
                  style={{
                    marginTop: '2rem',
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <RotateCcw size={20} />
                  Reset All Settings
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// Main Panel Component
const MainPanel = ({ settings, toggleSetting, setActivePanel }) => {
  const quickToggles = [
    {
      key: 'highContrast',
      label: 'High Contrast',
      icon: Eye,
      description: 'Increase color contrast for better visibility',
    },
    {
      key: 'enhancedFocus',
      label: 'Enhanced Focus',
      icon: Target,
      description: 'Show prominent focus indicators',
    },
    {
      key: 'reducedMotion',
      label: 'Reduce Motion',
      icon: Zap,
      description: 'Minimize animations and transitions',
    },
    {
      key: 'soundEffects',
      label: 'Sound Effects',
      icon: settings.soundEffects ? Volume2 : VolumeX,
      description: 'Enable or disable sound effects',
    },
  ];

  const panels = [
    {
      key: 'visual',
      label: 'Visual Settings',
      icon: Eye,
      description: 'Font size, contrast, colors',
    },
    {
      key: 'motion',
      label: 'Motion & Animation',
      icon: Zap,
      description: 'Animation and transition preferences',
    },
    {
      key: 'audio',
      label: 'Audio Settings',
      icon: Volume2,
      description: 'Sound effects and text-to-speech',
    },
  ];

  return (
    <div>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>
        Quick Settings
      </h3>

      {/* Quick Toggles */}
      {quickToggles.map((toggle) => (
        <ToggleItem
          key={toggle.key}
          label={toggle.label}
          description={toggle.description}
          icon={toggle.icon}
          checked={settings[toggle.key]}
          onChange={() => toggleSetting(toggle.key)}
        />
      ))}

      <div style={{ marginTop: '2rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>
          Detailed Settings
        </h3>

        {panels.map((panel) => (
          <button
            key={panel.key}
            onClick={() => setActivePanel(panel.key)}
            style={{
              width: '100%',
              padding: '1rem',
              marginBottom: '0.5rem',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <panel.icon size={24} color="#3b82f6" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '600', color: '#1f2937' }}>{panel.label}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{panel.description}</div>
              </div>
            </div>
            <ChevronRight size={20} color="#9ca3af" />
          </button>
        ))}
      </div>
    </div>
  );
};

// Visual Panel Component
const VisualPanel = ({ settings, updateSetting, toggleSetting, setActivePanel }) => {
  return (
    <div>
      <button
        onClick={() => setActivePanel('main')}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem',
          background: 'none',
          border: 'none',
          color: '#3b82f6',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        ← Back
      </button>

      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>
        Visual Settings
      </h3>

      {/* Font Size */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Font Size
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['small', 'medium', 'large', 'xlarge'].map((size) => (
            <button
              key={size}
              onClick={() => updateSetting('fontSize', size)}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: settings.fontSize === size ? '#3b82f6' : '#f3f4f6',
                color: settings.fontSize === size ? 'white' : '#1f2937',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600',
                textTransform: 'capitalize',
              }}
            >
              {size === 'xlarge' ? 'XL' : size[0].toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Line Height */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Line Height
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['normal', 'relaxed', 'loose'].map((height) => (
            <button
              key={height}
              onClick={() => updateSetting('lineHeight', height)}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: settings.lineHeight === height ? '#3b82f6' : '#f3f4f6',
                color: settings.lineHeight === height ? 'white' : '#1f2937',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600',
                textTransform: 'capitalize',
              }}
            >
              {height}
            </button>
          ))}
        </div>
      </div>

      {/* Letter Spacing */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
          Letter Spacing
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['normal', 'wide'].map((spacing) => (
            <button
              key={spacing}
              onClick={() => updateSetting('letterSpacing', spacing)}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: settings.letterSpacing === spacing ? '#3b82f6' : '#f3f4f6',
                color: settings.letterSpacing === spacing ? 'white' : '#1f2937',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600',
                textTransform: 'capitalize',
              }}
            >
              {spacing}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <ToggleItem
        label="High Contrast"
        description="Increase color contrast"
        icon={Eye}
        checked={settings.highContrast}
        onChange={() => toggleSetting('highContrast')}
      />

      <ToggleItem
        label="Dyslexia-Friendly Font"
        description="Use OpenDyslexic font"
        icon={Type}
        checked={settings.dyslexiaFont}
        onChange={() => toggleSetting('dyslexiaFont')}
      />

      <ToggleItem
        label="Reading Guide"
        description="Highlight current line"
        icon={BookOpen}
        checked={settings.readingGuide}
        onChange={() => toggleSetting('readingGuide')}
      />
    </div>
  );
};

// Motion Panel Component
const MotionPanel = ({ settings, toggleSetting, setActivePanel }) => {
  return (
    <div>
      <button
        onClick={() => setActivePanel('main')}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem',
          background: 'none',
          border: 'none',
          color: '#3b82f6',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        ← Back
      </button>

      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>
        Motion & Animation
      </h3>

      <ToggleItem
        label="Reduce Motion"
        description="Minimize all animations and transitions"
        icon={Zap}
        checked={settings.reducedMotion}
        onChange={() => toggleSetting('reducedMotion')}
      />

      <div
        style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#eff6ff',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          color: '#1e40af',
        }}
      >
        <strong>Note:</strong> Reducing motion improves performance and helps users with
        vestibular disorders.
      </div>
    </div>
  );
};

// Audio Panel Component
const AudioPanel = ({ settings, toggleSetting, setActivePanel }) => {
  return (
    <div>
      <button
        onClick={() => setActivePanel('main')}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem',
          background: 'none',
          border: 'none',
          color: '#3b82f6',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        ← Back
      </button>

      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>
        Audio Settings
      </h3>

      <ToggleItem
        label="Sound Effects"
        description="Play sounds for interactions"
        icon={settings.soundEffects ? Volume2 : VolumeX}
        checked={settings.soundEffects}
        onChange={() => toggleSetting('soundEffects')}
      />

      <ToggleItem
        label="Text-to-Speech"
        description="Read content aloud"
        icon={Volume2}
        checked={settings.textToSpeech}
        onChange={() => toggleSetting('textToSpeech')}
      />
    </div>
  );
};

// Toggle Item Component
const ToggleItem = ({ label, description, icon: Icon, checked, onChange }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem',
        marginBottom: '0.5rem',
        backgroundColor: checked ? '#eff6ff' : '#f9fafb',
        border: `2px solid ${checked ? '#3b82f6' : '#e5e7eb'}`,
        borderRadius: '0.5rem',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        <Icon size={24} color={checked ? '#3b82f6' : '#6b7280'} />
        <div>
          <div style={{ fontWeight: '600', color: '#1f2937' }}>{label}</div>
          {description && (
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{description}</div>
          )}
        </div>
      </div>
      <button
        onClick={onChange}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        style={{
          position: 'relative',
          width: '48px',
          height: '28px',
          backgroundColor: checked ? '#3b82f6' : '#d1d5db',
          borderRadius: '14px',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease',
        }}
      >
        <motion.div
          animate={{ x: checked ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            position: 'absolute',
            top: '2px',
            width: '24px',
            height: '24px',
            backgroundColor: 'white',
            borderRadius: '50%',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        />
      </button>
    </div>
  );
};

export default AccessibilityToolbar;
