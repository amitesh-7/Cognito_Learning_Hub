import { useAccessibility } from "../context/AccessibilityContext";
import QuizTaker from "./QuizTaker";
import VisuallyImpairedQuizTaker from "./VisuallyImpairedQuizTaker";

/**
 * Smart Quiz Router
 * Automatically routes to appropriate quiz component based on accessibility settings
 */
export default function SmartQuizRouter() {
  const { settings } = useAccessibility();

  // If visually impaired mode is active, use specialized quiz
  if (settings.visuallyImpairedMode) {
    return <VisuallyImpairedQuizTaker />;
  }

  // Otherwise use regular gamified quiz
  return <QuizTaker />;
}
