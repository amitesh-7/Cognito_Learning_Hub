// lib/models/analytics.dart

/// Performance Trend Model
class PerformanceTrend {
  final DateTime date;
  final double averageScore;
  final int quizzesCompleted;
  final double accuracy;
  final int totalQuestions;
  final int correctAnswers;

  PerformanceTrend({
    required this.date,
    required this.averageScore,
    required this.quizzesCompleted,
    required this.accuracy,
    required this.totalQuestions,
    required this.correctAnswers,
  });

  factory PerformanceTrend.fromJson(Map<String, dynamic> json) {
    return PerformanceTrend(
      date: DateTime.parse(json['date']),
      averageScore: (json['averageScore'] ?? 0).toDouble(),
      quizzesCompleted: json['quizzesCompleted'] ?? 0,
      accuracy: (json['accuracy'] ?? 0).toDouble(),
      totalQuestions: json['totalQuestions'] ?? 0,
      correctAnswers: json['correctAnswers'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date.toIso8601String(),
      'averageScore': averageScore,
      'quizzesCompleted': quizzesCompleted,
      'accuracy': accuracy,
      'totalQuestions': totalQuestions,
      'correctAnswers': correctAnswers,
    };
  }
}

/// Category Analysis Model
class CategoryAnalysis {
  final String categoryId;
  final String categoryName;
  final int quizzesAttempted;
  final double averageScore;
  final double accuracy;
  final int totalQuestions;
  final int correctAnswers;
  final int incorrectAnswers;
  final int totalTimeSpent; // in seconds
  final String difficulty; // 'easy', 'medium', 'hard'
  final double improvementRate; // percentage improvement over time

  CategoryAnalysis({
    required this.categoryId,
    required this.categoryName,
    required this.quizzesAttempted,
    required this.averageScore,
    required this.accuracy,
    required this.totalQuestions,
    required this.correctAnswers,
    required this.incorrectAnswers,
    required this.totalTimeSpent,
    required this.difficulty,
    required this.improvementRate,
  });

  factory CategoryAnalysis.fromJson(Map<String, dynamic> json) {
    return CategoryAnalysis(
      categoryId: json['categoryId'] ?? json['_id'] ?? '',
      categoryName: json['categoryName'] ?? json['category'] ?? 'Unknown',
      quizzesAttempted: json['quizzesAttempted'] ?? 0,
      averageScore: (json['averageScore'] ?? 0).toDouble(),
      accuracy: (json['accuracy'] ?? 0).toDouble(),
      totalQuestions: json['totalQuestions'] ?? 0,
      correctAnswers: json['correctAnswers'] ?? 0,
      incorrectAnswers: json['incorrectAnswers'] ?? 0,
      totalTimeSpent: json['totalTimeSpent'] ?? 0,
      difficulty: json['difficulty'] ?? 'medium',
      improvementRate: (json['improvementRate'] ?? 0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'categoryId': categoryId,
      'categoryName': categoryName,
      'quizzesAttempted': quizzesAttempted,
      'averageScore': averageScore,
      'accuracy': accuracy,
      'totalQuestions': totalQuestions,
      'correctAnswers': correctAnswers,
      'incorrectAnswers': incorrectAnswers,
      'totalTimeSpent': totalTimeSpent,
      'difficulty': difficulty,
      'improvementRate': improvementRate,
    };
  }

  String get averageTimePerQuestion {
    if (totalQuestions == 0) return '0s';
    final seconds = totalTimeSpent ~/ totalQuestions;
    if (seconds < 60) return '${seconds}s';
    final minutes = seconds ~/ 60;
    final remainingSeconds = seconds % 60;
    return '${minutes}m ${remainingSeconds}s';
  }
}

/// Time-Based Insights Model
class TimeBasedInsights {
  final String period; // 'day', 'week', 'month'
  final DateTime startDate;
  final DateTime endDate;
  final int totalQuizzes;
  final double totalScore;
  final double averageScore;
  final int totalQuestions;
  final int totalCorrect;
  final double accuracy;
  final int totalTimeSpent; // in seconds
  final int streakDays;
  final List<String> mostActiveHours; // e.g., ['09:00', '14:00', '20:00']
  final List<String> strongCategories;
  final List<String> weakCategories;

  TimeBasedInsights({
    required this.period,
    required this.startDate,
    required this.endDate,
    required this.totalQuizzes,
    required this.totalScore,
    required this.averageScore,
    required this.totalQuestions,
    required this.totalCorrect,
    required this.accuracy,
    required this.totalTimeSpent,
    required this.streakDays,
    required this.mostActiveHours,
    required this.strongCategories,
    required this.weakCategories,
  });

  factory TimeBasedInsights.fromJson(Map<String, dynamic> json) {
    return TimeBasedInsights(
      period: json['period'] ?? 'week',
      startDate: DateTime.parse(json['startDate']),
      endDate: DateTime.parse(json['endDate']),
      totalQuizzes: json['totalQuizzes'] ?? 0,
      totalScore: (json['totalScore'] ?? 0).toDouble(),
      averageScore: (json['averageScore'] ?? 0).toDouble(),
      totalQuestions: json['totalQuestions'] ?? 0,
      totalCorrect: json['totalCorrect'] ?? 0,
      accuracy: (json['accuracy'] ?? 0).toDouble(),
      totalTimeSpent: json['totalTimeSpent'] ?? 0,
      streakDays: json['streakDays'] ?? 0,
      mostActiveHours: List<String>.from(json['mostActiveHours'] ?? []),
      strongCategories: List<String>.from(json['strongCategories'] ?? []),
      weakCategories: List<String>.from(json['weakCategories'] ?? []),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'period': period,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
      'totalQuizzes': totalQuizzes,
      'totalScore': totalScore,
      'averageScore': averageScore,
      'totalQuestions': totalQuestions,
      'totalCorrect': totalCorrect,
      'accuracy': accuracy,
      'totalTimeSpent': totalTimeSpent,
      'streakDays': streakDays,
      'mostActiveHours': mostActiveHours,
      'strongCategories': strongCategories,
      'weakCategories': weakCategories,
    };
  }

  String get totalTimeFormatted {
    final hours = totalTimeSpent ~/ 3600;
    final minutes = (totalTimeSpent % 3600) ~/ 60;
    if (hours > 0) return '${hours}h ${minutes}m';
    return '${minutes}m';
  }
}

/// Learning Analytics Model (Overall Statistics)
class LearningAnalytics {
  final int totalQuizzes;
  final double overallAccuracy;
  final double averageScore;
  final int totalXP;
  final int currentLevel;
  final int currentStreak;
  final int longestStreak;
  final List<PerformanceTrend> trends;
  final List<CategoryAnalysis> categories;
  final TimeBasedInsights weeklyInsights;
  final TimeBasedInsights monthlyInsights;

  LearningAnalytics({
    required this.totalQuizzes,
    required this.overallAccuracy,
    required this.averageScore,
    required this.totalXP,
    required this.currentLevel,
    required this.currentStreak,
    required this.longestStreak,
    required this.trends,
    required this.categories,
    required this.weeklyInsights,
    required this.monthlyInsights,
  });

  factory LearningAnalytics.fromJson(Map<String, dynamic> json) {
    return LearningAnalytics(
      totalQuizzes: json['totalQuizzes'] ?? 0,
      overallAccuracy: (json['overallAccuracy'] ?? 0).toDouble(),
      averageScore: (json['averageScore'] ?? 0).toDouble(),
      totalXP: json['totalXP'] ?? 0,
      currentLevel: json['currentLevel'] ?? 1,
      currentStreak: json['currentStreak'] ?? 0,
      longestStreak: json['longestStreak'] ?? 0,
      trends: (json['trends'] as List?)
              ?.map((t) => PerformanceTrend.fromJson(t))
              .toList() ??
          [],
      categories: (json['categories'] as List?)
              ?.map((c) => CategoryAnalysis.fromJson(c))
              .toList() ??
          [],
      weeklyInsights: TimeBasedInsights.fromJson(json['weeklyInsights'] ?? {}),
      monthlyInsights:
          TimeBasedInsights.fromJson(json['monthlyInsights'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'totalQuizzes': totalQuizzes,
      'overallAccuracy': overallAccuracy,
      'averageScore': averageScore,
      'totalXP': totalXP,
      'currentLevel': currentLevel,
      'currentStreak': currentStreak,
      'longestStreak': longestStreak,
      'trends': trends.map((t) => t.toJson()).toList(),
      'categories': categories.map((c) => c.toJson()).toList(),
      'weeklyInsights': weeklyInsights.toJson(),
      'monthlyInsights': monthlyInsights.toJson(),
    };
  }
}
