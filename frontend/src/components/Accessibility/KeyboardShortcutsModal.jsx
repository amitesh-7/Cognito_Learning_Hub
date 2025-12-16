import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Command, Keyboard } from 'lucide-react';

/**
 * Keyboard Shortcuts Help Modal
 * Shows all available keyboard shortcuts
 */
export const KeyboardShortcutsModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleShowShortcuts = () => setIsOpen(true);
    window.addEventListener('show-keyboard-shortcuts', handleShowShortcuts);
    
    return () => {
      window.removeEventListener('show-keyboard-shortcuts', handleShowShortcuts);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const shortcuts = [
    {
      category: 'Navigation',
      items: [
        { keys: ['Alt', 'H'], description: 'Go to Home' },
        { keys: ['Alt', 'D'], description: 'Go to Dashboard' },
        { keys: ['Alt', 'Q'], description: 'Go to Quizzes' },
        { keys: ['Alt', 'L'], description: 'Go to Leaderboard' },
        { keys: ['Alt', 'P'], description: 'Go to Profile' },
        { keys: ['Alt', 'S'], description: 'Go to Settings' },
      ],
    },
    {
      category: 'General',
      items: [
        { keys: ['?'], description: 'Show this help' },
        { keys: ['/'], description: 'Focus search' },
        { keys: ['Esc'], description: 'Close modal/dialog' },
        { keys: ['Tab'], description: 'Navigate forward' },
        { keys: ['Shift', 'Tab'], description: 'Navigate backward' },
      ],
    },
    {
      category: 'Focus Navigation',
      items: [
        { keys: ['J'], description: 'Focus next element' },
        { keys: ['K'], description: 'Focus previous element' },
      ],
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 10000,
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            role="dialog"
            aria-labelledby="shortcuts-title"
            aria-modal="true"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              backgroundColor: 'white',
              borderRadius: '1rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
              zIndex: 10001,
              padding: '2rem',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
              }}
            >
              <h2
                id="shortcuts-title"
                style={{
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Keyboard size={28} color="#3b82f6" />
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close shortcuts modal"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  color: '#6b7280',
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            {shortcuts.map((section, index) => (
              <div key={index} style={{ marginBottom: '2rem' }}>
                <h3
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '1rem',
                  }}
                >
                  {section.category}
                </h3>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  {section.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '0.5rem',
                      }}
                    >
                      <span style={{ color: '#374151' }}>{item.description}</span>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        {item.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <kbd
                              style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#e5e7eb',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.25rem',
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#1f2937',
                                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                              }}
                            >
                              {key}
                            </kbd>
                            {keyIndex < item.keys.length - 1 && (
                              <span
                                style={{
                                  margin: '0 0.25rem',
                                  color: '#9ca3af',
                                }}
                              >
                                +
                              </span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Footer Tip */}
            <div
              style={{
                marginTop: '2rem',
                padding: '1rem',
                backgroundColor: '#eff6ff',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: '#1e40af',
              }}
            >
              <strong>Tip:</strong> Press <kbd style={{ 
                padding: '0.125rem 0.375rem',
                backgroundColor: '#dbeafe',
                borderRadius: '0.25rem',
                fontFamily: 'monospace',
              }}>?</kbd> anytime to show this help dialog
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default KeyboardShortcutsModal;
