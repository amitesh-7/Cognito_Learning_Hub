import { useEffect, useCallback, useRef, useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAnnouncer } from '../components/Accessibility/ScreenReaderAnnouncer';

/**
 * Custom hook for quiz accessibility features
 * Provides keyboard navigation and text-to-speech for quiz taking
 */
export const useQuizAccessibility = ({
  questions = [],
  currentQuestionIndex = 0,
  selectedAnswers = {},
  onSelectAnswer,
  onNextQuestion,
  onPreviousQuestion,
  onSubmitQuiz,
  timeLeft,
}) => {
  const { settings } = useAccessibility();
  const { announce } = useAnnouncer();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  /**
   * Speak text using Web Speech API
   */
  const speak = useCallback((text, priority = 'polite') => {
    if (!synthRef.current || !settings.textToSpeech) {
      // If TTS is disabled, use screen reader announcement
      announce(text, priority === 'assertive' ? 'assertive' : 'polite');
      return;
    }

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      // Fallback to screen reader announcement
      announce(text, 'polite');
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [settings.textToSpeech, announce]);

  /**
   * Stop speaking
   */
  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  /**
   * Read current question
   */
  const readQuestion = useCallback(() => {
    if (!questions[currentQuestionIndex]) return;

    const question = questions[currentQuestionIndex];
    const questionText = `Question ${currentQuestionIndex + 1} of ${questions.length}. 
      ${question.difficulty} difficulty. ${question.points} points. 
      ${question.question}`;

    speak(questionText, 'assertive');
    announce(`Reading question ${currentQuestionIndex + 1}`, 'polite');
  }, [questions, currentQuestionIndex, speak, announce]);

  /**
   * Read all options for current question
   */
  const readOptions = useCallback(() => {
    if (!questions[currentQuestionIndex]) return;

    const question = questions[currentQuestionIndex];
    const optionsText = question.options
      .map((option, index) => {
        const letter = String.fromCharCode(65 + index); // A, B, C, D
        const selected = selectedAnswers[question._id] === option ? 'Currently selected. ' : '';
        return `Option ${letter}. ${selected}${option}`;
      })
      .join('. ');

    const fullText = `Options for question ${currentQuestionIndex + 1}. ${optionsText}`;
    speak(fullText, 'polite');
    announce('Reading options', 'polite');
  }, [questions, currentQuestionIndex, selectedAnswers, speak, announce]);

  /**
   * Read selected option
   */
  const readSelectedOption = useCallback((optionIndex) => {
    if (!questions[currentQuestionIndex]) return;

    const question = questions[currentQuestionIndex];
    const option = question.options[optionIndex];
    const letter = String.fromCharCode(65 + optionIndex);

    speak(`Selected option ${letter}. ${option}`, 'assertive');
  }, [questions, currentQuestionIndex, speak]);

  /**
   * Read quiz progress
   */
  const readProgress = useCallback(() => {
    const answered = Object.keys(selectedAnswers).length;
    const total = questions.length;
    const remaining = total - answered;

    const progressText = `Progress: ${answered} of ${total} questions answered. 
      ${remaining} questions remaining. 
      You are on question ${currentQuestionIndex + 1}.`;

    speak(progressText, 'polite');
  }, [selectedAnswers, questions.length, currentQuestionIndex, speak]);

  /**
   * Read time remaining
   */
  const readTimeRemaining = useCallback(() => {
    if (timeLeft === undefined || timeLeft === null) return;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeText = minutes > 0
      ? `${minutes} minute${minutes !== 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''} remaining`
      : `${seconds} second${seconds !== 1 ? 's' : ''} remaining`;

    speak(timeText, timeLeft < 60 ? 'assertive' : 'polite');
  }, [timeLeft, speak]);

  /**
   * Read quiz instructions
   */
  const readInstructions = useCallback(() => {
    const instructions = `
      Welcome to the quiz. 
      Use number keys 1 through 4 to select options A through D. 
      Press R to read the current question. 
      Press O to read all options. 
      Press N for next question. 
      Press P for previous question. 
      Press I to hear progress. 
      Press T to hear time remaining. 
      Press S to stop speaking. 
      Press H to repeat these instructions.
    `;
    speak(instructions, 'polite');
  }, [speak]);

  /**
   * Announce option selection
   */
  const announceSelection = useCallback((optionIndex) => {
    const letter = String.fromCharCode(65 + optionIndex);
    announce(`Option ${letter} selected`, 'assertive');
  }, [announce]);

  /**
   * Announce navigation
   */
  const announceNavigation = useCallback((direction) => {
    const questionNumber = currentQuestionIndex + 1;
    const total = questions.length;

    if (direction === 'next') {
      if (questionNumber < total) {
        announce(`Moving to question ${questionNumber + 1} of ${total}`, 'polite');
      } else {
        announce('You are at the last question', 'polite');
      }
    } else if (direction === 'previous') {
      if (questionNumber > 1) {
        announce(`Moving to question ${questionNumber - 1} of ${total}`, 'polite');
      } else {
        announce('You are at the first question', 'polite');
      }
    }
  }, [currentQuestionIndex, questions.length, announce]);

  /**
   * Handle keyboard shortcuts for quiz navigation
   */
  const handleQuizKeyboard = useCallback((e) => {
    // Don't interfere if user is typing in an input
    const activeElement = document.activeElement;
    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement?.tagName) ||
                    activeElement?.isContentEditable;

    if (isTyping) return;

    const key = e.key.toLowerCase();
    const question = questions[currentQuestionIndex];

    if (!question) return;

    // Prevent default for quiz shortcuts
    const quizKeys = ['1', '2', '3', '4', 'r', 'o', 'n', 'p', 'i', 't', 's', 'h', 'enter', ' '];
    if (quizKeys.includes(key)) {
      e.preventDefault();
    }

    switch (key) {
      // Select options with number keys 1-4
      case '1':
      case '2':
      case '3':
      case '4':
        const optionIndex = parseInt(key) - 1;
        if (optionIndex < question.options.length) {
          onSelectAnswer(question._id, question.options[optionIndex]);
          announceSelection(optionIndex);
          readSelectedOption(optionIndex);
        }
        break;

      // R - Read question
      case 'r':
        readQuestion();
        break;

      // O - Read options
      case 'o':
        readOptions();
        break;

      // N or ArrowRight - Next question
      case 'n':
      case 'arrowright':
        if (currentQuestionIndex < questions.length - 1) {
          announceNavigation('next');
          onNextQuestion();
        } else {
          announce('Last question reached', 'polite');
        }
        break;

      // P or ArrowLeft - Previous question
      case 'p':
      case 'arrowleft':
        if (currentQuestionIndex > 0) {
          announceNavigation('previous');
          onPreviousQuestion();
        } else {
          announce('First question reached', 'polite');
        }
        break;

      // I - Read progress
      case 'i':
        readProgress();
        break;

      // T - Read time remaining
      case 't':
        readTimeRemaining();
        break;

      // S - Stop speaking
      case 's':
        stopSpeaking();
        announce('Speech stopped', 'polite');
        break;

      // H - Read instructions
      case 'h':
        readInstructions();
        break;

      // Enter or Space - Next question (if answered)
      case 'enter':
      case ' ':
        if (selectedAnswers[question._id]) {
          if (currentQuestionIndex < questions.length - 1) {
            announceNavigation('next');
            onNextQuestion();
          } else {
            announce('Ready to submit quiz. Press Control + Enter to submit.', 'assertive');
          }
        } else {
          announce('Please select an answer before proceeding', 'assertive');
        }
        break;

      default:
        break;
    }

    // Ctrl+Enter - Submit quiz
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && onSubmitQuiz) {
      e.preventDefault();
      const answered = Object.keys(selectedAnswers).length;
      const total = questions.length;
      if (answered === total) {
        announce('Submitting quiz', 'assertive');
        onSubmitQuiz();
      } else {
        announce(`Cannot submit. ${total - answered} questions remain unanswered.`, 'assertive');
      }
    }
  }, [
    questions,
    currentQuestionIndex,
    selectedAnswers,
    onSelectAnswer,
    onNextQuestion,
    onPreviousQuestion,
    onSubmitQuiz,
    readQuestion,
    readOptions,
    readSelectedOption,
    readProgress,
    readTimeRemaining,
    readInstructions,
    stopSpeaking,
    announce,
    announceSelection,
    announceNavigation,
  ]);

  /**
   * Attach keyboard listener
   */
  useEffect(() => {
    if (!settings.keyboardNavigation) return;

    document.addEventListener('keydown', handleQuizKeyboard);
    return () => {
      document.removeEventListener('keydown', handleQuizKeyboard);
    };
  }, [settings.keyboardNavigation, handleQuizKeyboard]);

  /**
   * Auto-read question when it changes
   */
  useEffect(() => {
    if (settings.textToSpeech) {
      // Wait a bit for the UI to update
      const timeout = setTimeout(() => {
        readQuestion();
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [currentQuestionIndex, settings.textToSpeech, readQuestion]);

  /**
   * Announce time warnings
   */
  useEffect(() => {
    if (timeLeft === 60) {
      announce('Warning: 1 minute remaining', 'assertive');
    } else if (timeLeft === 30) {
      announce('Warning: 30 seconds remaining', 'assertive');
    } else if (timeLeft === 10) {
      announce('Warning: 10 seconds remaining', 'assertive');
    }
  }, [timeLeft, announce]);

  return {
    speak,
    stopSpeaking,
    readQuestion,
    readOptions,
    readSelectedOption,
    readProgress,
    readTimeRemaining,
    readInstructions,
    isSpeaking,
    handleQuizKeyboard,
  };
};

export default useQuizAccessibility;
