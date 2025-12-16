import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAnnouncer } from './ScreenReaderAnnouncer';

/**
 * Global Keyboard Navigation Component
 * Implements site-wide keyboard shortcuts
 */
export const KeyboardNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useAccessibility();
  const { announce } = useAnnouncer();

  useEffect(() => {
    if (!settings.keyboardNavigation) return;

    const handleKeyboard = (e) => {
      // Skip if user is typing in an input field
      const activeElement = document.activeElement;
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName) ||
                      activeElement.isContentEditable;

      // Skip if Ctrl/Cmd is pressed (browser shortcuts)
      if (e.ctrlKey || e.metaKey) return;

      // Global shortcuts (work everywhere)
      switch (e.key) {
        case '?':
          if (!isTyping) {
            e.preventDefault();
            showKeyboardShortcuts();
            announce('Keyboard shortcuts menu opened', 'polite');
          }
          break;

        case '/':
          if (!isTyping) {
            e.preventDefault();
            focusSearch();
            announce('Search focused', 'polite');
          }
          break;

        case 'Escape':
          if (isTyping) {
            activeElement.blur();
            announce('Input unfocused', 'polite');
          } else {
            closeModals();
          }
          break;
      }

      // Navigation shortcuts (only work when not typing)
      if (!isTyping && e.altKey) {
        switch (e.key) {
          case 'h':
            e.preventDefault();
            navigate('/');
            announce('Navigated to home', 'polite');
            break;

          case 'd':
            e.preventDefault();
            navigate('/dashboard');
            announce('Navigated to dashboard', 'polite');
            break;

          case 'q':
            e.preventDefault();
            navigate('/quizzes');
            announce('Navigated to quizzes', 'polite');
            break;

          case 'l':
            e.preventDefault();
            navigate('/leaderboard');
            announce('Navigated to leaderboard', 'polite');
            break;

          case 'p':
            e.preventDefault();
            navigate('/profile');
            announce('Navigated to profile', 'polite');
            break;

          case 's':
            e.preventDefault();
            navigate('/settings');
            announce('Navigated to settings', 'polite');
            break;
        }
      }

      // Focus navigation
      if (!isTyping) {
        switch (e.key) {
          case 'Tab':
            // Enhanced tab navigation with visible focus
            document.body.classList.add('keyboard-navigating');
            break;

          case 'j':
            if (!e.shiftKey) {
              e.preventDefault();
              focusNextElement();
            }
            break;

          case 'k':
            if (!e.shiftKey) {
              e.preventDefault();
              focusPreviousElement();
            }
            break;
        }
      }
    };

    const handleMouseDown = () => {
      // Remove keyboard navigation class when mouse is used
      document.body.classList.remove('keyboard-navigating');
    };

    document.addEventListener('keydown', handleKeyboard);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyboard);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [settings.keyboardNavigation, navigate, announce]);

  // Helper functions
  const showKeyboardShortcuts = () => {
    // Dispatch custom event to open shortcuts modal
    const event = new CustomEvent('show-keyboard-shortcuts');
    window.dispatchEvent(event);
  };

  const focusSearch = () => {
    const searchInput = document.querySelector('[type="search"]') ||
                       document.querySelector('[role="search"] input') ||
                       document.querySelector('input[placeholder*="Search" i]');
    if (searchInput) {
      searchInput.focus();
    }
  };

  const closeModals = () => {
    // Close any open modals/dialogs
    const closeButtons = document.querySelectorAll('[aria-label*="close" i], [aria-label*="dismiss" i]');
    if (closeButtons.length > 0) {
      closeButtons[0].click();
    }
  };

  const focusNextElement = () => {
    const focusableElements = getFocusableElements();
    const currentIndex = focusableElements.indexOf(document.activeElement);
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    focusableElements[nextIndex]?.focus();
  };

  const focusPreviousElement = () => {
    const focusableElements = getFocusableElements();
    const currentIndex = focusableElements.indexOf(document.activeElement);
    const prevIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
    focusableElements[prevIndex]?.focus();
  };

  const getFocusableElements = () => {
    const selector = `
      a[href],
      button:not([disabled]),
      textarea:not([disabled]),
      input:not([disabled]):not([type="hidden"]),
      select:not([disabled]),
      [tabindex]:not([tabindex="-1"])
    `;
    return Array.from(document.querySelectorAll(selector));
  };

  return null; // This component doesn't render anything
};

export default KeyboardNavigation;
