import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  // Load saved preferences from localStorage
  const loadPreference = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(`a11y_${key}`);
      return saved !== null ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [settings, setSettings] = useState({
    // Motion & Animation
    reducedMotion: loadPreference('reducedMotion', false),
    
    // Visual
    highContrast: loadPreference('highContrast', false),
    fontSize: loadPreference('fontSize', 'medium'), // small, medium, large, xlarge
    lineHeight: loadPreference('lineHeight', 'normal'), // normal, relaxed, loose
    letterSpacing: loadPreference('letterSpacing', 'normal'), // normal, wide
    
    // Focus & Navigation
    enhancedFocus: loadPreference('enhancedFocus', true),
    keyboardNavigation: loadPreference('keyboardNavigation', true),
    skipLinks: loadPreference('skipLinks', true),
    
    // Content
    dyslexiaFont: loadPreference('dyslexiaFont', false),
    readingGuide: loadPreference('readingGuide', false),
    
    // Audio
    soundEffects: loadPreference('soundEffects', true),
    textToSpeech: loadPreference('textToSpeech', false),
    
    // Screen Reader
    verboseDescriptions: loadPreference('verboseDescriptions', true),
    
    // Visually Impaired Mode (Quick Toggle)
    visuallyImpairedMode: loadPreference('visuallyImpairedMode', false),
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    Object.entries(settings).forEach(([key, value]) => {
      localStorage.setItem(`a11y_${key}`, JSON.stringify(value));
    });
  }, [settings]);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;

    // Reduced Motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
      root.style.setProperty('--animation-duration', '0.01ms');
      root.style.setProperty('--transition-duration', '0.01ms');
    } else {
      root.classList.remove('reduce-motion');
      root.style.setProperty('--animation-duration', '300ms');
      root.style.setProperty('--transition-duration', '200ms');
    }

    // High Contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Font Size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px',
    };
    root.style.setProperty('--base-font-size', fontSizeMap[settings.fontSize]);

    // Line Height
    const lineHeightMap = {
      normal: '1.5',
      relaxed: '1.75',
      loose: '2',
    };
    root.style.setProperty('--base-line-height', lineHeightMap[settings.lineHeight]);

    // Letter Spacing
    const letterSpacingMap = {
      normal: 'normal',
      wide: '0.05em',
    };
    root.style.setProperty('--letter-spacing', letterSpacingMap[settings.letterSpacing]);

    // Enhanced Focus
    if (settings.enhancedFocus) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }

    // Dyslexia Font
    if (settings.dyslexiaFont) {
      root.classList.add('dyslexia-font');
    } else {
      root.classList.remove('dyslexia-font');
    }

    // Reading Guide
    if (settings.readingGuide) {
      root.classList.add('reading-guide');
    } else {
      root.classList.remove('reading-guide');
    }
  }, [settings]);

  // Detect system preferences
  useEffect(() => {
    // Check for prefers-reduced-motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches && !localStorage.getItem('a11y_reducedMotion')) {
      updateSetting('reducedMotion', true);
    }

    const motionHandler = (e) => {
      if (!localStorage.getItem('a11y_reducedMotion')) {
        updateSetting('reducedMotion', e.matches);
      }
    };
    motionQuery.addEventListener('change', motionHandler);

    // Check for prefers-contrast
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    if (contrastQuery.matches && !localStorage.getItem('a11y_highContrast')) {
      updateSetting('highContrast', true);
    }

    return () => {
      motionQuery.removeEventListener('change', motionHandler);
    };
  }, []);

  // Global keyboard shortcut for Visually Impaired Mode (Alt+A)
  useEffect(() => {
    const handleGlobalShortcut = (e) => {
      // Alt+A to toggle Visually Impaired Mode
      if (e.altKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        toggleVisuallyImpairedMode();
      }
    };

    document.addEventListener('keydown', handleGlobalShortcut);
    return () => {
      document.removeEventListener('keydown', handleGlobalShortcut);
    };
  }, [settings.visuallyImpairedMode]);

  // Toggle Visually Impaired Mode (enables multiple accessibility features at once)
  const toggleVisuallyImpairedMode = () => {
    const newMode = !settings.visuallyImpairedMode;
    
    if (newMode) {
      // Enable all helpful features for visually impaired users
      setSettings(prev => ({
        ...prev,
        visuallyImpairedMode: true,
        textToSpeech: true,
        enhancedFocus: true,
        highContrast: true,
        fontSize: 'large',
        verboseDescriptions: true,
        soundEffects: true,
      }));
    } else {
      // Only disable visually impaired mode flag, keep user's custom settings
      setSettings(prev => ({
        ...prev,
        visuallyImpairedMode: false,
      }));
    }
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetSettings = () => {
    const defaults = {
      reducedMotion: false,
      highContrast: false,
      fontSize: 'medium',
      lineHeight: 'normal',
      letterSpacing: 'normal',
      enhancedFocus: true,
      keyboardNavigation: true,
      skipLinks: true,
      dyslexiaFont: false,
      readingGuide: false,
      soundEffects: true,
      textToSpeech: false,
      verboseDescriptions: true,
      visuallyImpairedMode: false,
    };
    setSettings(defaults);
    
    // Clear localStorage
    Object.keys(defaults).forEach((key) => {
      localStorage.removeItem(`a11y_${key}`);
    });
  };

  const value = {
    settings,
    updateSetting,
    toggleSetting,
    toggleVisuallyImpairedMode,
    resetSettings,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};
