import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Lightbulb,
  MessageSquare,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

const ReasoningQuestion = ({ question, onSubmit, isSubmitting }) => {
  const [explanation, setExplanation] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [aiFeedback, setAiFeedback] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const wordCount = explanation.trim().split(/\s+/).filter(Boolean).length;
  const minWords = question.reasoningConfig?.minWords || 50;
  const maxWords = question.reasoningConfig?.maxWords || 500;

  const evaluateReasoning = async () => {
    if (!selectedAnswer || !explanation.trim()) {
      return;
    }

    setIsEvaluating(true);
    setAiFeedback(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3002"
        }/api/advanced-questions/evaluate-reasoning`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({
            questionId: question._id,
            answer: selectedAnswer,
            reasoning: explanation,
            correctAnswer: question.correctAnswer,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setAiFeedback(data.data);
      } else {
        setAiFeedback({
          error: data.error || "Failed to evaluate reasoning",
        });
      }
    } catch (error) {
      console.error("Error evaluating reasoning:", error);
      setAiFeedback({
        error: "Failed to get AI feedback. Please try again.",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      answer: selectedAnswer,
      reasoning: explanation,
      aiFeedback: aiFeedback,
    });
  };

  return (
    <div className="space-y-6">
      {/* Question Card */}
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <Brain className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {question.title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {question.question}
            </p>
          </div>
        </div>

        {/* Reasoning Guidelines */}
        <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            How to Approach:
          </h4>
          <ul className="list-disc list-inside space-y-1 text-purple-800 dark:text-purple-200 text-sm">
            <li>Select your answer from the options below</li>
            <li>Explain your thought process and reasoning</li>
            <li>Provide evidence or examples to support your answer</li>
            <li>Consider alternative perspectives</li>
            <li>
              Write at least {minWords} words (maximum {maxWords} words)
            </li>
          </ul>
        </div>
      </Card>

      {/* Answer Options */}
      <Card className="p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Select Your Answer:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {question.options.map((option, idx) => {
            const optionLabel = String.fromCharCode(65 + idx); // A, B, C, D
            return (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedAnswer(optionLabel)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedAnswer === optionLabel
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      selectedAnswer === optionLabel
                        ? "bg-purple-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {optionLabel}
                  </div>
                  <span className="text-gray-900 dark:text-white">
                    {option}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </Card>

      {/* Reasoning Explanation */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Explain Your Reasoning:
          </h4>
          <Badge
            className={
              wordCount < minWords
                ? "bg-red-100 text-red-800"
                : wordCount > maxWords
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }
          >
            {wordCount} / {minWords}-{maxWords} words
          </Badge>
        </div>

        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Explain your reasoning in detail. Why did you choose this answer? What evidence supports your choice?"
          className="w-full h-48 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />

        {wordCount < minWords && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            Please write at least {minWords - wordCount} more words to meet the
            minimum requirement.
          </p>
        )}

        {wordCount > maxWords && (
          <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
            Your explanation exceeds the maximum word limit by{" "}
            {wordCount - maxWords} words.
          </p>
        )}

        {/* Get AI Feedback Button */}
        <div className="mt-4 flex justify-end">
          <Button
            onClick={evaluateReasoning}
            disabled={
              isEvaluating ||
              !selectedAnswer ||
              wordCount < minWords ||
              wordCount > maxWords
            }
            variant="outline"
            className="border-purple-500 text-purple-600 hover:bg-purple-50"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Get AI Feedback
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* AI Feedback */}
      {aiFeedback && !aiFeedback.error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 border-2 border-purple-500">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Feedback on Your Reasoning:
            </h4>

            {/* Correctness */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                {aiFeedback.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span
                  className={`font-semibold ${
                    aiFeedback.isCorrect ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {aiFeedback.isCorrect
                    ? "Your answer is correct!"
                    : "Your answer is incorrect."}
                </span>
              </div>
              {!aiFeedback.isCorrect && (
                <p className="text-gray-700 dark:text-gray-300 ml-7">
                  The correct answer is:{" "}
                  <strong>{question.correctAnswer}</strong>
                </p>
              )}
            </div>

            {/* Reasoning Quality Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  Reasoning Quality:
                </span>
                <Badge className="bg-purple-100 text-purple-800">
                  {aiFeedback.reasoningScore}/10
                </Badge>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(aiFeedback.reasoningScore / 10) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Feedback Text */}
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {aiFeedback.feedback}
              </p>
            </div>

            {/* Strengths */}
            {aiFeedback.strengths && aiFeedback.strengths.length > 0 && (
              <div className="mt-4">
                <h5 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  Strengths:
                </h5>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  {aiFeedback.strengths.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas for Improvement */}
            {aiFeedback.improvements && aiFeedback.improvements.length > 0 && (
              <div className="mt-4">
                <h5 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  Areas for Improvement:
                </h5>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  {aiFeedback.improvements.map((improvement, idx) => (
                    <li key={idx}>{improvement}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Error Feedback */}
      {aiFeedback && aiFeedback.error && (
        <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500">
          <div className="flex items-center gap-2 text-red-900 dark:text-red-100">
            <XCircle className="w-5 h-5" />
            <span className="font-semibold">Failed to get AI feedback</span>
          </div>
          <p className="mt-2 text-red-800 dark:text-red-200">
            {aiFeedback.error}
          </p>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            !selectedAnswer ||
            !explanation.trim() ||
            wordCount < minWords ||
            wordCount > maxWords
          }
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Answer"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ReasoningQuestion;
