/**
 * Learning Style Analyzer Service
 * AI-powered analysis of user learning patterns and style
 */
class LearningStyleAnalyzer {
  constructor() {
    // Category difficulty thresholds
    this.proficiencyThresholds = {
      weak: 50,
      developing: 70,
      strong: 85,
      master: 95,
    };
    
    // Time per question thresholds (seconds)
    this.paceThresholds = {
      fast: 15,
      moderate: 30,
      slow: 60,
    };
  }
  
  /**
   * Analyze quiz performance and return learning insights
   */
  analyzeQuizPerformance(quizData, currentStyle) {
    const analysis = {
      paceUpdate: null,
      averageTimePerQuestion: null,
      categoryPerformance: null,
      difficultyMatch: null,
      suggestions: [],
    };
    
    // Analyze pace
    if (quizData.timePerQuestion) {
      const avgTime = quizData.timePerQuestion.reduce((a, b) => a + b, 0) / quizData.timePerQuestion.length;
      analysis.averageTimePerQuestion = avgTime;
      
      if (avgTime < this.paceThresholds.fast) {
        analysis.paceUpdate = "fast";
      } else if (avgTime < this.paceThresholds.moderate) {
        analysis.paceUpdate = "moderate";
      } else {
        analysis.paceUpdate = "slow";
      }
    }
    
    // Analyze accuracy
    const accuracy = (quizData.correctAnswers / quizData.totalQuestions) * 100;
    
    // Generate suggestions based on performance
    if (accuracy < 50) {
      analysis.suggestions.push({
        type: "review",
        message: "Consider reviewing the material before the next quiz",
        priority: "high",
      });
      analysis.suggestions.push({
        type: "difficulty",
        message: "Try easier quizzes to build confidence",
        priority: "medium",
      });
    } else if (accuracy >= 90) {
      analysis.suggestions.push({
        type: "challenge",
        message: "Great job! Ready for more challenging quizzes",
        priority: "low",
      });
    }
    
    // Check if pace matches performance
    if (analysis.paceUpdate === "fast" && accuracy < 70) {
      analysis.suggestions.push({
        type: "pace",
        message: "Try slowing down to improve accuracy",
        priority: "medium",
      });
    } else if (analysis.paceUpdate === "slow" && accuracy > 90) {
      analysis.suggestions.push({
        type: "pace",
        message: "You've got this! Try picking up the pace",
        priority: "low",
      });
    }
    
    return analysis;
  }
  
  /**
   * Generate personalized recommendations based on learning style
   */
  generateRecommendations(learningStyle) {
    const recommendations = [];
    
    // Pace recommendations
    if (learningStyle.preferredPace === "slow") {
      recommendations.push({
        type: "study_method",
        title: "Deep Learning Approach",
        description: "Take your time with each question. Quality over speed!",
        icon: "📚",
      });
    } else if (learningStyle.preferredPace === "fast") {
      recommendations.push({
        type: "study_method",
        title: "Speed Learning",
        description: "You process quickly! Challenge yourself with timed quizzes.",
        icon: "⚡",
      });
    }
    
    // Category recommendations
    if (learningStyle.weakCategories && learningStyle.weakCategories.length > 0) {
      const weakestCategory = learningStyle.weakCategories[0];
      recommendations.push({
        type: "focus_area",
        title: `Focus on ${weakestCategory.category}`,
        description: `Your proficiency is ${Math.round(weakestCategory.proficiency)}%. Let's improve!`,
        icon: "🎯",
        action: `practice_${weakestCategory.category.toLowerCase()}`,
      });
    }
    
    // Time of day recommendation
    if (learningStyle.peakPerformanceTime !== "any") {
      recommendations.push({
        type: "schedule",
        title: `Best Study Time: ${learningStyle.peakPerformanceTime}`,
        description: `You perform best in the ${learningStyle.peakPerformanceTime}. Schedule important quizzes then!`,
        icon: "⏰",
      });
    }
    
    // Session duration recommendation
    if (learningStyle.averageSessionDuration > 0) {
      const optimalDuration = Math.max(15, Math.min(45, learningStyle.averageSessionDuration));
      recommendations.push({
        type: "duration",
        title: `Optimal Session: ${Math.round(optimalDuration)} minutes`,
        description: "This is your sweet spot for focused learning.",
        icon: "⏱️",
      });
    }
    
    // Encouragement style recommendation
    recommendations.push({
      type: "motivation",
      title: this.getMotivationStyleName(learningStyle.preferredEncouragement),
      description: this.getMotivationStyleDescription(learningStyle.preferredEncouragement),
      icon: this.getMotivationStyleIcon(learningStyle.preferredEncouragement),
    });
    
    return recommendations;
  }
  
  /**
   * Generate AI insights about learning patterns
   */
  generateInsights(learningStyle, evolutionStats) {
    const insights = [];
    
    // Overall progress insight
    insights.push({
      category: "progress",
      title: "Your Learning Journey",
      content: this.generateProgressInsight(evolutionStats),
      icon: "📈",
    });
    
    // Strength analysis
    if (learningStyle.strongCategories && learningStyle.strongCategories.length > 0) {
      insights.push({
        category: "strengths",
        title: "Your Superpowers",
        content: `You excel in ${learningStyle.strongCategories.map(c => c.category).join(", ")}! ` +
                 `Your average proficiency in these areas is ${this.getAverageProficiency(learningStyle.strongCategories)}%.`,
        icon: "💪",
      });
    }
    
    // Improvement areas
    if (learningStyle.weakCategories && learningStyle.weakCategories.length > 0) {
      insights.push({
        category: "growth",
        title: "Growth Opportunities",
        content: `${learningStyle.weakCategories.map(c => c.category).join(", ")} ` +
                 `${learningStyle.weakCategories.length === 1 ? "is" : "are"} areas to focus on. ` +
                 `Targeted practice can help boost your proficiency!`,
        icon: "🌱",
      });
    }
    
    // Learning style insight
    insights.push({
      category: "style",
      title: "Your Learning Style",
      content: this.describeLearningStyle(learningStyle),
      icon: "🧠",
    });
    
    // Pattern insight
    insights.push({
      category: "pattern",
      title: "Study Patterns",
      content: this.describeStudyPatterns(learningStyle, evolutionStats),
      icon: "📊",
    });
    
    // Personalized tip
    insights.push({
      category: "tip",
      title: "Pro Tip",
      content: this.generatePersonalizedTip(learningStyle, evolutionStats),
      icon: "💡",
    });
    
    return insights;
  }
  
  /**
   * Generate progress insight text
   */
  generateProgressInsight(stats) {
    const quizzes = stats.totalQuizzesTaken || 0;
    const accuracy = stats.totalQuestionsAnswered > 0
      ? Math.round((stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100)
      : 0;
    
    if (quizzes === 0) {
      return "You're just getting started! Complete your first quiz to see your progress.";
    }
    
    if (quizzes < 5) {
      return `You've completed ${quizzes} quiz${quizzes === 1 ? "" : "es"} with ${accuracy}% accuracy. Keep going to unlock more insights!`;
    }
    
    if (accuracy >= 90) {
      return `Outstanding! ${quizzes} quizzes completed with an impressive ${accuracy}% accuracy. You're a learning champion! 🏆`;
    }
    
    if (accuracy >= 75) {
      return `Great progress! ${quizzes} quizzes completed with ${accuracy}% accuracy. You're on the right track!`;
    }
    
    return `You've completed ${quizzes} quizzes with ${accuracy}% accuracy. Every quiz is a step toward mastery!`;
  }
  
  /**
   * Describe the user's learning style
   */
  describeLearningStyle(style) {
    const traits = [];
    
    if (style.preferredPace === "fast") {
      traits.push("quick thinker");
    } else if (style.preferredPace === "slow") {
      traits.push("thoughtful and methodical");
    }
    
    if (style.usesHints) {
      traits.push("strategic learner who uses available resources");
    }
    
    if (style.reviewsExplanations) {
      traits.push("curious about understanding concepts deeply");
    }
    
    if (style.challengeAcceptance > 70) {
      traits.push("loves a challenge");
    }
    
    if (traits.length === 0) {
      return "Keep taking quizzes to reveal your unique learning style!";
    }
    
    return `You're a ${traits.join(", ")}. This means you learn best when given ${
      style.preferredPace === "fast" ? "quick challenges" : "time to think"
    } and ${style.preferredEncouragement} feedback.`;
  }
  
  /**
   * Describe study patterns
   */
  describeStudyPatterns(style, stats) {
    const parts = [];
    
    if (style.averageSessionDuration > 0) {
      parts.push(`Your average study session is ${Math.round(style.averageSessionDuration)} minutes`);
    }
    
    if (style.peakPerformanceTime !== "any") {
      parts.push(`you perform best in the ${style.peakPerformanceTime}`);
    }
    
    if (stats.longestStreak > 0) {
      parts.push(`your best streak was ${stats.longestStreak} days`);
    }
    
    if (parts.length === 0) {
      return "Take more quizzes to reveal your study patterns!";
    }
    
    return parts.join(", and ") + ".";
  }
  
  /**
   * Generate a personalized tip
   */
  generatePersonalizedTip(style, stats) {
    const tips = [];
    
    if (stats.currentStreak === 0 && stats.longestStreak > 0) {
      tips.push("Start a new streak today! Consistency is key to learning.");
    }
    
    if (style.averageTimePerQuestion > 45) {
      tips.push("Try to trust your first instinct more - it's often correct!");
    }
    
    if (style.weakCategories && style.weakCategories.length > 0) {
      tips.push(`Spend 10 minutes reviewing ${style.weakCategories[0].category} today.`);
    }
    
    if (style.challengeAcceptance < 30) {
      tips.push("Challenge yourself with a harder quiz - you might surprise yourself!");
    }
    
    if (tips.length === 0) {
      tips.push("Keep up the great work! Consistency beats intensity.");
    }
    
    return tips[Math.floor(Math.random() * tips.length)];
  }
  
  /**
   * Get average proficiency for categories
   */
  getAverageProficiency(categories) {
    if (!categories || categories.length === 0) return 0;
    const sum = categories.reduce((acc, c) => acc + c.proficiency, 0);
    return Math.round(sum / categories.length);
  }
  
  /**
   * Get motivation style name
   */
  getMotivationStyleName(style) {
    const names = {
      motivational: "Cheerleader Mode",
      factual: "Data-Driven",
      humorous: "Fun & Playful",
      gentle: "Supportive & Calm",
      competitive: "Champion Mode",
    };
    return names[style] || "Balanced";
  }
  
  /**
   * Get motivation style description
   */
  getMotivationStyleDescription(style) {
    const descriptions = {
      motivational: "Your avatar cheers you on with enthusiasm and energy!",
      factual: "Your avatar gives you the facts - clear, concise, and informative.",
      humorous: "Your avatar keeps things light with jokes and fun reactions!",
      gentle: "Your avatar provides calm, supportive encouragement.",
      competitive: "Your avatar challenges you to be the best!",
    };
    return descriptions[style] || "Your avatar adapts to your needs.";
  }
  
  /**
   * Get motivation style icon
   */
  getMotivationStyleIcon(style) {
    const icons = {
      motivational: "🎉",
      factual: "📊",
      humorous: "😄",
      gentle: "🤗",
      competitive: "🏆",
    };
    return icons[style] || "✨";
  }
}

module.exports = { LearningStyleAnalyzer };
