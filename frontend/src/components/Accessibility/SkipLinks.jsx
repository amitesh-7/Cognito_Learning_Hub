import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';

/**
 * Skip Links Component
 * Provides keyboard navigation shortcuts to main content areas
 */
export const SkipLinks = () => {
  const { settings } = useAccessibility();

  if (!settings.skipLinks) return null;

  const links = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#navigation', label: 'Skip to navigation' },
    { href: '#search', label: 'Skip to search' },
    { href: '#footer', label: 'Skip to footer' },
  ];

  return (
    <nav 
      className="skip-links" 
      aria-label="Skip navigation links"
      style={{
        position: 'absolute',
        top: '-100vh',
        left: 0,
        zIndex: 9999,
      }}
    >
      {links.map(({ href, label }) => (
        <a
          key={href}
          href={href}
          className="skip-link"
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            padding: '1rem 1.5rem',
            backgroundColor: '#1e40af',
            color: '#ffffff',
            textDecoration: 'none',
            fontWeight: '600',
            borderRadius: '0 0 0.5rem 0',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'top 0.2s ease',
            zIndex: 10000,
          }}
          onFocus={(e) => {
            e.target.style.top = '0';
          }}
          onBlur={(e) => {
            e.target.style.top = '-100vh';
          }}
          onClick={(e) => {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
              target.focus({ preventScroll: false });
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
        >
          {label}
        </a>
      ))}
    </nav>
  );
};

export default SkipLinks;
