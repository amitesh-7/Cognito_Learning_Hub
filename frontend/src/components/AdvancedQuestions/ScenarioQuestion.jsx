import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map,
  ChevronRight,
  RefreshCw,
  History,
  Loader2,
  Flag,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

const ScenarioQuestion = ({ question, onSubmit, isSubmitting }) => {
  const [currentScenario, setCurrentScenario] = useState(
    question.scenarioConfig?.initialScenario || ""
  );
  const [decisionHistory, setDecisionHistory] = useState([]);
  const [currentState, setCurrentState] = useState(
    question.scenarioConfig?.initialState || {}
  );
  const [scenarioPhase, setScenarioPhase] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const getCurrentScenarioData = () => {
    return question.scenarioConfig?.scenarios?.find(
      (s) => s.id === currentScenario
    );
  };

  const handleDecision = (decision) => {
    const currentData = getCurrentScenarioData();
    if (!currentData) return;

    // Record decision
    const newHistory = [
      ...decisionHistory,
      {
        scenario: currentScenario,
        scenarioText: currentData.description,
        decision: decision.text,
        timestamp: new Date().toISOString(),
      },
    ];
    setDecisionHistory(newHistory);

    // Update state based on decision outcomes
    const newState = { ...currentState };
    if (decision.outcomes) {
      Object.keys(decision.outcomes).forEach((key) => {
        newState[key] = (newState[key] || 0) + decision.outcomes[key];
      });
    }
    setCurrentState(newState);

    // Move to next scenario or complete
    if (decision.nextScenario) {
      setCurrentScenario(decision.nextScenario);
      setScenarioPhase(scenarioPhase + 1);
    } else {
      setIsComplete(true);
    }
  };

  const resetScenario = () => {
    setCurrentScenario(question.scenarioConfig?.initialScenario || "");
    setDecisionHistory([]);
    setCurrentState(question.scenarioConfig?.initialState || {});
    setScenarioPhase(0);
    setIsComplete(false);
  };

  const handleSubmit = () => {
    onSubmit({
      decisionHistory,
      finalState: currentState,
      completedPhases: scenarioPhase,
    });
  };

  const currentData = getCurrentScenarioData();

  const getStateIcon = (value) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getStateColor = (value) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <Map className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {question.title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {question.question}
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-4 flex items-center gap-2">
          <Badge className="bg-indigo-100 text-indigo-800">
            Phase {scenarioPhase + 1}
            {question.scenarioConfig?.maxPhases &&
              ` of ${question.scenarioConfig.maxPhases}`}
          </Badge>
          {isComplete && (
            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
              <Flag className="w-3 h-3" />
              Scenario Complete
            </Badge>
          )}
        </div>
      </Card>

      {/* Current State Display */}
      {Object.keys(currentState).length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Current State:
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(currentState).map(([key, value]) => (
              <div
                key={key}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {key}
                  </span>
                  {getStateIcon(value)}
                </div>
                <div className={`text-2xl font-bold ${getStateColor(value)}`}>
                  {value > 0 && "+"}
                  {value}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Current Scenario */}
      <AnimatePresence mode="wait">
        {!isComplete && currentData && (
          <motion.div
            key={currentScenario}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="p-6">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Current Situation:
                </h4>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {currentData.description}
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  What will you do?
                </h4>
                <div className="space-y-3">
                  {currentData.decisions?.map((decision, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleDecision(decision)}
                      className="w-full p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 hover:from-indigo-100 hover:to-blue-100 dark:hover:from-indigo-900/30 dark:hover:to-blue-900/30 border-2 border-indigo-200 dark:border-indigo-700 rounded-lg text-left transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <ChevronRight className="w-5 h-5 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                        <span className="flex-1 text-gray-900 dark:text-white font-medium">
                          {decision.text}
                        </span>
                      </div>

                      {/* Show potential outcomes on hover */}
                      {decision.outcomes && (
                        <div className="mt-2 ml-8 flex flex-wrap gap-2 opacity-70">
                          {Object.entries(decision.outcomes).map(
                            ([key, value]) => (
                              <Badge
                                key={key}
                                className={
                                  value > 0
                                    ? "bg-green-100 text-green-800"
                                    : value < 0
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                                }
                              >
                                {key}: {value > 0 && "+"}
                                {value}
                              </Badge>
                            )
                          )}
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Message */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-6 text-center border-2 border-green-500">
            <Flag className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Scenario Complete!
            </h4>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You've navigated through all decision points. Review your choices
              below.
            </p>
            <Button
              onClick={resetScenario}
              variant="outline"
              className="border-indigo-500 text-indigo-600 hover:bg-indigo-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Different Path
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Decision History */}
      {decisionHistory.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <History className="w-5 h-5" />
            Decision History ({decisionHistory.length})
          </h4>
          <div className="space-y-3">
            {decisionHistory.map((record, idx) => (
              <div
                key={idx}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-indigo-500"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-indigo-100 text-indigo-800">
                    Phase {idx + 1}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(record.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {record.scenarioText}
                </p>
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {record.decision}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button
          onClick={resetScenario}
          variant="outline"
          disabled={decisionHistory.length === 0}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Restart Scenario
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !isComplete}
          size="lg"
          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Scenario"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ScenarioQuestion;
