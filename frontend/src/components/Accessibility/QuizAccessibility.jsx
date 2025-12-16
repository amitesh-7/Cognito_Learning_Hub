import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Keyboard,
  Volume2,
  Info,
  X,
  Check,
  Clock,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
} from 'lucide-react';

/**
 * Quiz Keyboard Shortcuts Help
 * Shows all available keyboard shortcuts for quiz navigation
 */
export const QuizKeyboardHelp = ({ onClose }) => {
  const shortcuts = [
    {
      category: 'Answer Selection',
      items: [
        { keys: ['1', '2', '3', '4'], description: 'Select option A, B, C, or D' },
      ],
    },
    {
      category: 'Navigation',
      items: [
        { keys: ['N'], description: 'Next question' },
        { keys: ['P'], description: 'Previous question' },
        { keys: ['→'], description: 'Next question (Arrow key)' },
        { keys: ['←'], description: 'Previous question (Arrow key)' },
        { keys: ['Enter'], description: 'Go to next question (if answered)' },
        { keys: ['Space'], description: 'Go to next question (if answered)' },
      ],
    },
    {
      category: 'Audio & Reading',
      items: [
        { keys: ['R'], description: 'Read current question' },
        { keys: ['O'], description: 'Read all options' },
        { keys: ['S'], description: 'Stop speaking' },
      ],
    },
    {
      category: 'Information',
      items: [
        { keys: ['I'], description: 'Hear quiz progress' },
        { keys: ['T'], description: 'Hear time remaining' },
        { keys: ['H'], description: 'Repeat instructions' },
      ],
    },
    {
      category: 'Submit',
      items: [
        { keys: ['Ctrl', 'Enter'], description: 'Submit quiz' },
      ],
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="quiz-shortcuts-title"
          aria-modal="true"
          style={{
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
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
              id="quiz-shortcuts-title"
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
              Quiz Keyboard Shortcuts
            </h2>
            <button
              onClick={onClose}
              aria-label="Close shortcuts help"
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

          {/* Footer Tips */}
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
            <strong>💡 Tips:</strong>
            <ul style={{ margin: '0.5rem 0 0 1rem', paddingLeft: '0.5rem' }}>
              <li>All shortcuts work when not typing in an input field</li>
              <li>Audio features require Text-to-Speech to be enabled</li>
              <li>Use headphones for better audio experience</li>
              <li>Press H at any time to hear instructions</li>
            </ul>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              marginTop: '1.5rem',
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
            }}
          >
            Got it!
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Quiz Accessibility Status Bar
 * Shows current accessibility features status
 */
export const QuizAccessibilityBar = ({
  isSpeaking,
  currentQuestion,
  totalQuestions,
  timeLeft,
  onShowHelp,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '0.5rem',
        marginBottom: '1rem',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Speaking Indicator */}
        {isSpeaking && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#3b82f6',
              fontWeight: '600',
            }}
          >
            <Volume2 size={16} className="animate-pulse" />
            <span>Speaking...</span>
          </div>
        )}

        {/* Progress */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#6b7280',
          }}
        >
          <Info size={16} />
          <span>
            Question {currentQuestion} of {totalQuestions}
          </span>
        </div>

        {/* Time */}
        {timeLeft !== undefined && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: timeLeft < 60 ? '#ef4444' : '#6b7280',
            }}
          >
            <Clock size={16} />
            <span>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
          </div>
        )}
      </div>

      {/* Help Button */}
      <button
        onClick={onShowHelp}
        aria-label="Show keyboard shortcuts"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '600',
        }}
      >
        <HelpCircle size={16} />
        Keyboard Shortcuts (H)
      </button>
    </div>
  );
};

/**
 * Accessible Option Button
 * Option button with enhanced accessibility
 */
export const AccessibleOptionButton = ({
  option,
  index,
  isSelected,
  isCorrect,
  isIncorrect,
  isDisabled,
  onClick,
  questionId,
}) => {
  const letter = String.fromCharCode(65 + index); // A, B, C, D
  const number = index + 1;

  let backgroundColor = '#f9fafb';
  let borderColor = '#e5e7eb';
  let textColor = '#1f2937';

  if (isSelected) {
    backgroundColor = '#dbeafe';
    borderColor = '#3b82f6';
    textColor = '#1e40af';
  }

  if (isCorrect) {
    backgroundColor = '#d1fae5';
    borderColor = '#10b981';
    textColor = '#065f46';
  }

  if (isIncorrect) {
    backgroundColor = '#fee2e2';
    borderColor = '#ef4444';
    textColor = '#991b1b';
  }

  return (
    <button
      onClick={() => !isDisabled && onClick(questionId, option)}
      disabled={isDisabled}
      role="radio"
      aria-checked={isSelected}
      aria-label={`Option ${letter}: ${option}`}
      data-option-key={number}
      style={{
        width: '100%',
        padding: '1rem',
        backgroundColor,
        border: `2px solid ${borderColor}`,
        borderRadius: '0.5rem',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s ease',
        opacity: isDisabled ? 0.6 : 1,
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        {/* Letter Badge */}
        <div
          style={{
            minWidth: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isSelected ? '#3b82f6' : '#e5e7eb',
            color: isSelected ? 'white' : '#6b7280',
            borderRadius: '0.375rem',
            fontWeight: '700',
            fontSize: '0.875rem',
          }}
        >
          {letter}
        </div>

        {/* Number Key Badge */}
        <div
          style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            padding: '0.25rem 0.5rem',
            backgroundColor: isSelected ? '#3b82f6' : '#f3f4f6',
            color: isSelected ? 'white' : '#9ca3af',
            borderRadius: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            fontFamily: 'monospace',
          }}
        >
          {number}
        </div>

        {/* Option Text */}
        <div
          style={{
            flex: 1,
            color: textColor,
            fontSize: '1rem',
            lineHeight: '1.5',
          }}
        >
          {option}
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <Check
            size={20}
            color={isCorrect ? '#10b981' : isIncorrect ? '#ef4444' : '#3b82f6'}
          />
        )}
      </div>
    </button>
  );
};

export default QuizKeyboardHelp;
