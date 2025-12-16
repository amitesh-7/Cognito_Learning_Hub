import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Screen Reader Announcer Component
 * Creates a live region for screen reader announcements
 */
export const ScreenReaderAnnouncer = ({ message, priority = 'polite', clearDelay = 5000 }) => {
  const announcerRef = useRef(null);

  useEffect(() => {
    if (!announcerRef.current) {
      // Create announcer element if it doesn't exist
      announcerRef.current = document.createElement('div');
      announcerRef.current.setAttribute('role', 'status');
      announcerRef.current.setAttribute('aria-live', priority);
      announcerRef.current.setAttribute('aria-atomic', 'true');
      announcerRef.current.className = 'sr-only';
      announcerRef.current.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(announcerRef.current);
    }

    if (message) {
      announcerRef.current.textContent = message;
      
      // Clear message after delay
      const timeout = setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = '';
        }
      }, clearDelay);

      return () => clearTimeout(timeout);
    }
  }, [message, priority, clearDelay]);

  useEffect(() => {
    return () => {
      if (announcerRef.current && document.body.contains(announcerRef.current)) {
        document.body.removeChild(announcerRef.current);
      }
    };
  }, []);

  return null;
};

/**
 * Hook to announce messages to screen readers
 */
export const useAnnouncer = () => {
  const announce = (message, priority = 'polite') => {
    const announcer = document.querySelector('[role="status"]') || 
                      document.querySelector('[role="alert"]');
    
    if (announcer) {
      announcer.setAttribute('aria-live', priority);
      announcer.textContent = message;
      
      setTimeout(() => {
        announcer.textContent = '';
      }, 5000);
    } else {
      // Create temporary announcer
      const temp = document.createElement('div');
      temp.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
      temp.setAttribute('aria-live', priority);
      temp.setAttribute('aria-atomic', 'true');
      temp.className = 'sr-only';
      temp.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      temp.textContent = message;
      document.body.appendChild(temp);
      
      setTimeout(() => {
        if (document.body.contains(temp)) {
          document.body.removeChild(temp);
        }
      }, 5000);
    }
  };

  return { announce };
};

export default ScreenReaderAnnouncer;
