import React, { useState } from "react";
import { motion } from "framer-motion";
import { Code2, Brain, Map, Plus, X, AlertCircle } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Input } from "../ui/Input";

const AdvancedQuestionCreator = ({ onQuestionCreated, onCancel }) => {
  const [questionType, setQuestionType] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  });

  // Code question specific
  const [codeConfig, setCodeConfig] = useState({
    allowedLanguages: ["javascript"],
    starterCode: "",
    requirements: [""],
    testCases: [{ input: "", expectedOutput: "", hidden: false }],
  });

  // Reasoning question specific
  const [reasoningConfig, setReasoningConfig] = useState({
    minWords: 50,
    maxWords: 500,
  });

  // Scenario question specific
  const [scenarioConfig, setScenarioConfig] = useState({
    initialScenario: "start",
    initialState: {},
    maxPhases: 3,
    scenarios: [
      {
        id: "start",
        description: "",
        decisions: [{ text: "", outcomes: {}, nextScenario: "" }],
      },
    ],
  });

  const [stateKeys, setStateKeys] = useState(["budget", "reputation"]);

  const questionTypes = [
    {
      id: "code",
      label: "Code Challenge",
      icon: Code2,
      color: "from-indigo-500 to-purple-500",
      description: "Multi-language coding problem with test cases",
    },
    {
      id: "reasoning",
      label: "Reasoning Question",
      icon: Brain,
      color: "from-purple-500 to-pink-500",
      description: "AI-evaluated explanation with quality scoring",
    },
    {
      id: "scenario",
      label: "Scenario Simulation",
      icon: Map,
      color: "from-green-500 to-emerald-500",
      description: "Interactive decision-tree with branching paths",
    },
  ];

  const languages = [
    { id: "javascript", label: "JavaScript" },
    { id: "python", label: "Python" },
    { id: "java", label: "Java" },
    { id: "cpp", label: "C++" },
    { id: "c", label: "C" },
  ];

  const toggleLanguage = (lang) => {
    const current = codeConfig.allowedLanguages;
    if (current.includes(lang)) {
      setCodeConfig({
        ...codeConfig,
        allowedLanguages: current.filter((l) => l !== lang),
      });
    } else {
      setCodeConfig({
        ...codeConfig,
        allowedLanguages: [...current, lang],
      });
    }
  };

  const addTestCase = () => {
    setCodeConfig({
      ...codeConfig,
      testCases: [
        ...codeConfig.testCases,
        { input: "", expectedOutput: "", hidden: false },
      ],
    });
  };

  const updateTestCase = (index, field, value) => {
    const newTestCases = [...codeConfig.testCases];
    newTestCases[index][field] = value;
    setCodeConfig({ ...codeConfig, testCases: newTestCases });
  };

  const removeTestCase = (index) => {
    setCodeConfig({
      ...codeConfig,
      testCases: codeConfig.testCases.filter((_, i) => i !== index),
    });
  };

  const addRequirement = () => {
    setCodeConfig({
      ...codeConfig,
      requirements: [...codeConfig.requirements, ""],
    });
  };

  const updateRequirement = (index, value) => {
    const newReqs = [...codeConfig.requirements];
    newReqs[index] = value;
    setCodeConfig({ ...codeConfig, requirements: newReqs });
  };

  const removeRequirement = (index) => {
    setCodeConfig({
      ...codeConfig,
      requirements: codeConfig.requirements.filter((_, i) => i !== index),
    });
  };

  const addScenarioDecision = (scenarioIndex) => {
    const newScenarios = [...scenarioConfig.scenarios];
    newScenarios[scenarioIndex].decisions.push({
      text: "",
      outcomes: {},
      nextScenario: "",
    });
    setScenarioConfig({ ...scenarioConfig, scenarios: newScenarios });
  };

  const updateScenarioDecision = (
    scenarioIndex,
    decisionIndex,
    field,
    value
  ) => {
    const newScenarios = [...scenarioConfig.scenarios];
    newScenarios[scenarioIndex].decisions[decisionIndex][field] = value;
    setScenarioConfig({ ...scenarioConfig, scenarios: newScenarios });
  };

  const handleSubmit = () => {
    const baseQuestion = {
      ...formData,
      type: questionType,
    };

    if (questionType === "code") {
      baseQuestion.codeConfig = codeConfig;
    } else if (questionType === "reasoning") {
      baseQuestion.reasoningConfig = reasoningConfig;
    } else if (questionType === "scenario") {
      baseQuestion.scenarioConfig = scenarioConfig;
    }

    onQuestionCreated(baseQuestion);
  };

  if (!questionType) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">
          Select Advanced Question Type
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {questionTypes.map((type) => (
            <motion.div
              key={type.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setQuestionType(type.id)}
              className="cursor-pointer"
            >
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${type.color} flex items-center justify-center`}
                >
                  <type.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold mb-2">{type.label}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {type.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">
          Create {questionTypes.find((t) => t.id === questionType)?.label}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setQuestionType(null)}
        >
          Change Type
        </Button>
      </div>

      {/* Common Fields */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Question Title
          </label>
          <Input
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="e.g., Array Sum Challenge"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Question Description
          </label>
          <textarea
            value={formData.question}
            onChange={(e) =>
              setFormData({ ...formData, question: e.target.value })
            }
            className="w-full p-3 border rounded-lg min-h-[100px]"
            placeholder="Enter the full question description..."
          />
        </div>

        {questionType === "reasoning" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">
                Answer Options
              </label>
              {formData.options.map((option, index) => (
                <Input
                  key={index}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...formData.options];
                    newOptions[index] = e.target.value;
                    setFormData({ ...formData, options: newOptions });
                  }}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  className="mb-2"
                />
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Correct Answer
              </label>
              <select
                value={formData.correctAnswer}
                onChange={(e) =>
                  setFormData({ ...formData, correctAnswer: e.target.value })
                }
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select correct answer</option>
                {formData.options.map((_, index) => (
                  <option key={index} value={String.fromCharCode(65 + index)}>
                    Option {String.fromCharCode(65 + index)}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {/* Type-Specific Configuration */}
      {questionType === "code" && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Allowed Languages
            </label>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <Badge
                  key={lang.id}
                  onClick={() => toggleLanguage(lang.id)}
                  className={`cursor-pointer ${
                    codeConfig.allowedLanguages.includes(lang.id)
                      ? "bg-indigo-100 text-indigo-800 border-indigo-500"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {lang.label}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Starter Code
            </label>
            <textarea
              value={codeConfig.starterCode}
              onChange={(e) =>
                setCodeConfig({ ...codeConfig, starterCode: e.target.value })
              }
              className="w-full p-3 border rounded-lg font-mono text-sm min-h-[120px]"
              placeholder="function solution() {&#10;  // Your code here&#10;}"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Requirements
            </label>
            {codeConfig.requirements.map((req, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={req}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  placeholder="e.g., Function must handle empty arrays"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeRequirement(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addRequirement}>
              <Plus className="w-4 h-4 mr-2" />
              Add Requirement
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-4">Test Cases</label>
            {codeConfig.testCases.map((testCase, index) => (
              <Card key={index} className="p-4 mb-3">
                <div className="flex items-center justify-between mb-3">
                  <Badge>Test Case {index + 1}</Badge>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={testCase.hidden}
                        onChange={(e) =>
                          updateTestCase(index, "hidden", e.target.checked)
                        }
                      />
                      Hidden
                    </label>
                    {codeConfig.testCases.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeTestCase(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Input
                    value={testCase.input}
                    onChange={(e) =>
                      updateTestCase(index, "input", e.target.value)
                    }
                    placeholder="Input (e.g., [1, 2, 3])"
                  />
                  <Input
                    value={testCase.expectedOutput}
                    onChange={(e) =>
                      updateTestCase(index, "expectedOutput", e.target.value)
                    }
                    placeholder="Expected Output (e.g., 6)"
                  />
                </div>
              </Card>
            ))}
            <Button variant="outline" size="sm" onClick={addTestCase}>
              <Plus className="w-4 h-4 mr-2" />
              Add Test Case
            </Button>
          </div>
        </div>
      )}

      {questionType === "reasoning" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Minimum Words
            </label>
            <Input
              type="number"
              value={reasoningConfig.minWords}
              onChange={(e) =>
                setReasoningConfig({
                  ...reasoningConfig,
                  minWords: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Maximum Words
            </label>
            <Input
              type="number"
              value={reasoningConfig.maxWords}
              onChange={(e) =>
                setReasoningConfig({
                  ...reasoningConfig,
                  maxWords: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-semibold mb-1">AI Evaluation</p>
                <p>
                  This question will be evaluated by Gemini AI based on
                  reasoning quality, logical structure, and evidence provided.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {questionType === "scenario" && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              State Variables (e.g., budget, reputation)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {stateKeys.map((key, index) => (
                <Badge key={index} className="flex items-center gap-2">
                  {key}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() =>
                      setStateKeys(stateKeys.filter((_, i) => i !== index))
                    }
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add state variable..."
                onKeyPress={(e) => {
                  if (e.key === "Enter" && e.target.value) {
                    setStateKeys([...stateKeys, e.target.value]);
                    e.target.value = "";
                  }
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Initial Scenario Description
            </label>
            <textarea
              value={scenarioConfig.scenarios[0].description}
              onChange={(e) => {
                const newScenarios = [...scenarioConfig.scenarios];
                newScenarios[0].description = e.target.value;
                setScenarioConfig({
                  ...scenarioConfig,
                  scenarios: newScenarios,
                });
              }}
              className="w-full p-3 border rounded-lg min-h-[100px]"
              placeholder="Describe the initial situation..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-4">
              Decision Options
            </label>
            {scenarioConfig.scenarios[0].decisions.map((decision, dIndex) => (
              <Card key={dIndex} className="p-4 mb-3">
                <div className="space-y-3">
                  <Input
                    value={decision.text}
                    onChange={(e) =>
                      updateScenarioDecision(0, dIndex, "text", e.target.value)
                    }
                    placeholder="Decision text..."
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {stateKeys.map((key) => (
                      <Input
                        key={key}
                        type="number"
                        placeholder={`${key} change`}
                        onChange={(e) => {
                          const newScenarios = [...scenarioConfig.scenarios];
                          newScenarios[0].decisions[dIndex].outcomes[key] =
                            parseInt(e.target.value) || 0;
                          setScenarioConfig({
                            ...scenarioConfig,
                            scenarios: newScenarios,
                          });
                        }}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addScenarioDecision(0)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Decision
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!formData.title || !formData.question}
        >
          Add Question
        </Button>
      </div>
    </Card>
  );
};

export default AdvancedQuestionCreator;
