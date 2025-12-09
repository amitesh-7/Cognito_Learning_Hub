const { GoogleGenerativeAI } = require("@google/generative-ai");

class ReasoningEvaluator {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: process.env.AI_MODEL || "gemini-2.5-flash",
    });
  }

  /**
   * Evaluate explanation quality using AI
   */
  async evaluateExplanation(
    question,
    correctAnswer,
    userAnswer,
    userExplanation,
    criteria
  ) {
    try {
      const prompt = this.buildEvaluationPrompt(
        question,
        correctAnswer,
        userAnswer,
        userExplanation,
        criteria
      );

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Parse AI response
      const evaluation = this.parseAIResponse(response);

      return {
        correct: userAnswer === correctAnswer,
        explanationScore: evaluation.score,
        maxExplanationScore: 10,
        feedback: evaluation.feedback,
        criteria: evaluation.criteriaScores,
        suggestions: evaluation.suggestions,
        totalScore: (userAnswer === correctAnswer ? 5 : 0) + evaluation.score,
        maxScore: 15,
      };
    } catch (error) {
      console.error("Error evaluating explanation:", error);
      throw new Error("Failed to evaluate explanation");
    }
  }

  buildEvaluationPrompt(
    question,
    correctAnswer,
    userAnswer,
    userExplanation,
    criteria
  ) {
    let prompt = `You are an expert educator evaluating a student's explanation.

Question: ${question}
Correct Answer: ${correctAnswer}
Student's Selected Answer: ${userAnswer}
Student's Explanation: ${userExplanation}

Evaluate the student's explanation based on these criteria:
`;

    if (criteria && criteria.length > 0) {
      criteria.forEach((c, i) => {
        prompt += `${i + 1}. ${c.criterion} (${Math.round(
          c.weight * 100
        )}% weight)\n`;
        if (c.keywords && c.keywords.length > 0) {
          prompt += `   Keywords to look for: ${c.keywords.join(", ")}\n`;
        }
      });
    } else {
      prompt += `1. Correctness (40%): Does the explanation accurately describe why this is the correct answer?
2. Depth (30%): Does it show understanding of underlying concepts?
3. Clarity (20%): Is it well-structured and easy to understand?
4. Completeness (10%): Does it address all aspects of the question?
`;
    }

    prompt += `
Please provide your evaluation in this EXACT JSON format (no markdown, just JSON):
{
  "score": <number 0-10>,
  "feedback": "<2-3 sentences of constructive feedback>",
  "criteriaScores": {
    "correctness": <0-10>,
    "depth": <0-10>,
    "clarity": <0-10>,
    "completeness": <0-10>
  },
  "suggestions": ["<suggestion 1>", "<suggestion 2>"]
}

Be constructive and encouraging, even if the explanation needs improvement.`;

    return prompt;
  }

  parseAIResponse(response) {
    try {
      // Remove markdown code blocks if present
      let cleaned = response
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);

      return {
        score: Math.min(Math.max(parsed.score || 0, 0), 10),
        feedback: parsed.feedback || "Good attempt!",
        criteriaScores: parsed.criteriaScores || {},
        suggestions: parsed.suggestions || [],
      };
    } catch (error) {
      console.error("Error parsing AI response:", error);
      // Fallback scoring
      return {
        score: 5,
        feedback:
          "Your explanation has been recorded. Keep practicing to improve your reasoning skills!",
        criteriaScores: {},
        suggestions: [
          "Try to explain the concept in your own words",
          "Include specific examples",
        ],
      };
    }
  }

  /**
   * Quick validation without AI (for offline/fast mode)
   */
  quickValidate(userExplanation, minWords, maxWords, criteria) {
    const wordCount = userExplanation.trim().split(/\s+/).length;
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      wordCount,
    };

    if (wordCount < minWords) {
      result.valid = false;
      result.errors.push(
        `Explanation too short. Minimum ${minWords} words required (you wrote ${wordCount})`
      );
    }

    if (wordCount > maxWords) {
      result.valid = false;
      result.errors.push(
        `Explanation too long. Maximum ${maxWords} words allowed (you wrote ${wordCount})`
      );
    }

    // Check for keywords
    if (criteria && criteria.length > 0) {
      const explanationLower = userExplanation.toLowerCase();

      criteria.forEach((c) => {
        if (c.keywords && c.keywords.length > 0) {
          const foundKeywords = c.keywords.filter((kw) =>
            explanationLower.includes(kw.toLowerCase())
          );

          if (foundKeywords.length === 0) {
            result.warnings.push(`Consider mentioning: ${c.criterion}`);
          }
        }
      });
    }

    return result;
  }
}

module.exports = new ReasoningEvaluator();
