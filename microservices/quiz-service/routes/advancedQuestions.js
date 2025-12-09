const express = require("express");
const router = express.Router();
const AdvancedQuestion = require("../models/AdvancedQuestion");
const reasoningEvaluator = require("../services/reasoningEvaluator");
const codeExecutor = require("../services/secureCodeExecutor");

/**
 * @route   POST /api/advanced-questions
 * @desc    Create advanced question
 * @access  Private
 */
router.post("/", async (req, res) => {
  try {
    const question = new AdvancedQuestion(req.body);
    await question.save();

    res.status(201).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Error creating advanced question:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create question",
    });
  }
});

/**
 * @route   GET /api/advanced-questions/quiz/:quizId
 * @desc    Get advanced questions for a quiz
 * @access  Public
 */
router.get("/quiz/:quizId", async (req, res) => {
  try {
    const questions = await AdvancedQuestion.find({
      quizId: req.params.quizId,
    }).sort({ questionIndex: 1 });

    res.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error("Error fetching advanced questions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch questions",
    });
  }
});

/**
 * @route   POST /api/advanced-questions/:id/submit
 * @desc    Submit answer to advanced question
 * @access  Private
 */
router.post("/:id/submit", async (req, res) => {
  try {
    const question = await AdvancedQuestion.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: "Question not found",
      });
    }

    const { userAnswer, userExplanation, userCode, decisionPath } = req.body;

    let result = {};

    switch (question.advancedType) {
      case "explain-reasoning":
        result = await handleReasoningQuestion(
          question,
          userAnswer,
          userExplanation
        );
        break;

      case "code-challenge":
        result = await handleCodeChallenge(question, userCode);
        break;

      case "scenario-based":
        result = await handleScenario(question, decisionPath);
        break;

      case "time-travel":
        result = await handleTimeTravelQuestion(
          question,
          userAnswer,
          userExplanation
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          error: "Unknown question type",
        });
    }

    // Update analytics
    question.analytics.attemptsCount += 1;
    question.analytics.averageScore =
      (question.analytics.averageScore *
        (question.analytics.attemptsCount - 1) +
        result.score) /
      question.analytics.attemptsCount;

    if (result.score >= question.points * 0.7) {
      question.analytics.successRate =
        (question.analytics.successRate *
          (question.analytics.attemptsCount - 1) +
          1) /
        question.analytics.attemptsCount;
    }

    await question.save();

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({
      success: false,
      error: "Failed to submit answer",
    });
  }
});

/**
 * @route   POST /api/advanced-questions/code/execute
 * @desc    Execute code without submitting
 * @access  Private
 */
router.post("/code/execute", async (req, res) => {
  try {
    const { code, language, input } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: "Code and language are required",
      });
    }

    // Execute with single test case for testing
    const testCases = [
      {
        input: input || {},
        expectedOutput: null,
        isHidden: false,
      },
    ];

    const result = await codeExecutor.executeCode(
      code,
      language,
      testCases,
      5000
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error executing code:", error);
    res.status(500).json({
      success: false,
      error: "Failed to execute code",
    });
  }
});

/**
 * @route   POST /api/advanced-questions/reasoning/validate
 * @desc    Quick validate explanation (without AI)
 * @access  Private
 */
router.post("/reasoning/validate", async (req, res) => {
  try {
    const { explanation, minWords, maxWords, criteria } = req.body;

    const validation = reasoningEvaluator.quickValidate(
      explanation,
      minWords || 20,
      maxWords || 200,
      criteria
    );

    res.json({
      success: true,
      data: validation,
    });
  } catch (error) {
    console.error("Error validating explanation:", error);
    res.status(500).json({
      success: false,
      error: "Failed to validate explanation",
    });
  }
});

/**
 * Handle reasoning question submission
 */
async function handleReasoningQuestion(question, userAnswer, userExplanation) {
  // Quick validation first
  const validation = reasoningEvaluator.quickValidate(
    userExplanation,
    question.reasoningConfig.minWords,
    question.reasoningConfig.maxWords,
    question.reasoningConfig.evaluationCriteria
  );

  if (!validation.valid) {
    return {
      score: 0,
      maxScore: question.points,
      feedback: validation.errors.join(". "),
      valid: false,
    };
  }

  // AI evaluation
  const evaluation = await reasoningEvaluator.evaluateExplanation(
    question.description,
    question.reasoningConfig.sampleExplanation || "See explanation in question",
    userAnswer,
    userExplanation,
    question.reasoningConfig.evaluationCriteria
  );

  return {
    ...evaluation,
    maxScore: question.points,
    warnings: validation.warnings,
  };
}

/**
 * Handle code challenge submission
 */
async function handleCodeChallenge(question, userCode) {
  if (!userCode) {
    return {
      score: 0,
      maxScore: question.points,
      feedback: "No code provided",
      success: false,
    };
  }

  // Execute code
  const execution = await codeExecutor.executeCode(
    userCode,
    question.codeConfig.language,
    question.codeConfig.testCases,
    question.codeConfig.timeLimit,
    question.codeConfig.memoryLimit
  );

  // Analyze code quality if enabled
  let codeQuality = null;
  if (question.codeConfig.codeQualityChecks?.checkComplexity) {
    codeQuality = codeExecutor.analyzeCodeQuality(
      userCode,
      question.codeConfig.language
    );
  }

  // Calculate score based on test cases passed
  const baseScore =
    (execution.passedTests / execution.totalTests) * question.points;

  // Bonus for code quality
  let qualityBonus = 0;
  if (codeQuality && codeQuality.hasComments) {
    qualityBonus = Math.floor(question.points * 0.1);
  }

  return {
    score: Math.min(baseScore + qualityBonus, question.points),
    maxScore: question.points,
    execution,
    codeQuality,
    feedback: `Passed ${execution.passedTests}/${execution.totalTests} test cases`,
  };
}

/**
 * Handle scenario-based question
 */
async function handleScenario(question, decisionPath) {
  if (!decisionPath || !Array.isArray(decisionPath)) {
    return {
      score: 0,
      maxScore: question.points,
      feedback: "Invalid decision path",
    };
  }

  let totalScore = 0;
  let currentState = { ...question.scenarioConfig.initialState };
  const feedback = [];

  // Process each decision
  for (let i = 0; i < decisionPath.length; i++) {
    const decisionIndex = decisionPath[i].decisionIndex;
    const optionIndex = decisionPath[i].optionIndex;

    const decision = question.scenarioConfig.decisions[decisionIndex];
    if (!decision) break;

    const option = decision.options[optionIndex];
    if (!option) break;

    // Apply outcome
    totalScore += option.outcome.points || 0;
    feedback.push(option.outcome.feedback);

    // Update state
    if (option.outcome.stateChanges) {
      Object.assign(currentState, option.outcome.stateChanges);
    }
  }

  // Check success criteria
  const meetsSuccess = checkSuccessCriteria(
    currentState,
    question.scenarioConfig.successCriteria
  );

  return {
    score: Math.min(Math.max(totalScore, 0), question.points),
    maxScore: question.points,
    finalState: currentState,
    feedback: feedback.join(" "),
    success: meetsSuccess,
  };
}

/**
 * Handle time-travel question
 */
async function handleTimeTravelQuestion(question, userAnswer, userExplanation) {
  const previousScore = question.timeTravelConfig.previousScore || 0;
  const previousAnswer = question.timeTravelConfig.previousAnswer;

  // Evaluate current attempt (simplified - reuse reasoning evaluator if explanation provided)
  let currentScore = userAnswer === question.description ? question.points : 0;

  if (userExplanation && question.reasoningConfig) {
    const evaluation = await reasoningEvaluator.evaluateExplanation(
      question.description,
      "",
      userAnswer,
      userExplanation,
      question.reasoningConfig.evaluationCriteria
    );
    currentScore = evaluation.totalScore;
  }

  const improved = currentScore > previousScore;
  const improvementPercent =
    previousScore > 0
      ? Math.round(((currentScore - previousScore) / previousScore) * 100)
      : 100;

  return {
    score: currentScore,
    maxScore: question.points,
    previousScore,
    improved,
    improvementPercent,
    feedback: improved
      ? `Great! You've improved by ${improvementPercent}% since your last attempt!`
      : `Your previous score was ${previousScore}. Keep practicing!`,
    hints: improved ? [] : question.timeTravelConfig.improvementHints,
  };
}

function checkSuccessCriteria(state, criteria) {
  if (!criteria) return true;

  for (const key in criteria) {
    if (criteria[key] !== state[key]) {
      return false;
    }
  }
  return true;
}

module.exports = router;
