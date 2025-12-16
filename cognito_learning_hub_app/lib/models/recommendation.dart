// lib/models/recommendation.dart

class RecommendedQuiz {
  final String quizId;
  final String title;
  final String category;
  final String difficulty;
  final double confidenceScore;
  final String reason;
  final int estimatedDuration;
  final int totalQuestions;

  RecommendedQuiz({
    required this.quizId,
    required this.title,
    required this.category,
    required this.difficulty,
    required this.confidenceScore,
    required this.reason,
    required this.estimatedDuration,
    required this.totalQuestions,
  });

  factory RecommendedQuiz.fromJson(Map<String, dynamic> json) {
    return RecommendedQuiz(
      quizId: json['quizId'] ?? json['_id'] ?? '',
      title: json['title'] ?? '',
      category: json['category'] ?? '',
      difficulty: json['difficulty'] ?? '',
      confidenceScore: (json['confidenceScore'] ?? 0.0).toDouble(),
      reason: json['reason'] ?? '',
      estimatedDuration: json['estimatedDuration'] ?? 0,
      totalQuestions: json['totalQuestions'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'quizId': quizId,
      'title': title,
      'category': category,
      'difficulty': difficulty,
      'confidenceScore': confidenceScore,
      'reason': reason,
      'estimatedDuration': estimatedDuration,
      'totalQuestions': totalQuestions,
    };
  }
}

class RecommendedMaterial {
  final String materialId;
  final String title;
  final String type;
  final String category;
  final double relevanceScore;
  final String reason;
  final int? duration;
  final String thumbnailUrl;

  RecommendedMaterial({
    required this.materialId,
    required this.title,
    required this.type,
    required this.category,
    required this.relevanceScore,
    required this.reason,
    this.duration,
    required this.thumbnailUrl,
  });

  factory RecommendedMaterial.fromJson(Map<String, dynamic> json) {
    return RecommendedMaterial(
      materialId: json['materialId'] ?? json['_id'] ?? '',
      title: json['title'] ?? '',
      type: json['type'] ?? '',
      category: json['category'] ?? '',
      relevanceScore: (json['relevanceScore'] ?? 0.0).toDouble(),
      reason: json['reason'] ?? '',
      duration: json['duration'],
      thumbnailUrl: json['thumbnailUrl'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'materialId': materialId,
      'title': title,
      'type': type,
      'category': category,
      'relevanceScore': relevanceScore,
      'reason': reason,
      'duration': duration,
      'thumbnailUrl': thumbnailUrl,
    };
  }
}

class DifficultyAdjustment {
  final String category;
  final String currentDifficulty;
  final String suggestedDifficulty;
  final String reason;
  final double accuracy;
  final int quizzesCompleted;

  DifficultyAdjustment({
    required this.category,
    required this.currentDifficulty,
    required this.suggestedDifficulty,
    required this.reason,
    required this.accuracy,
    required this.quizzesCompleted,
  });

  factory DifficultyAdjustment.fromJson(Map<String, dynamic> json) {
    return DifficultyAdjustment(
      category: json['category'] ?? '',
      currentDifficulty: json['currentDifficulty'] ?? '',
      suggestedDifficulty: json['suggestedDifficulty'] ?? '',
      reason: json['reason'] ?? '',
      accuracy: (json['accuracy'] ?? 0.0).toDouble(),
      quizzesCompleted: json['quizzesCompleted'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'category': category,
      'currentDifficulty': currentDifficulty,
      'suggestedDifficulty': suggestedDifficulty,
      'reason': reason,
      'accuracy': accuracy,
      'quizzesCompleted': quizzesCompleted,
    };
  }
}

class LearningPath {
  final String id;
  final String title;
  final String description;
  final List<String> steps;
  final int estimatedDuration;
  final String difficulty;
  final int progress;

  LearningPath({
    required this.id,
    required this.title,
    required this.description,
    required this.steps,
    required this.estimatedDuration,
    required this.difficulty,
    required this.progress,
  });

  factory LearningPath.fromJson(Map<String, dynamic> json) {
    return LearningPath(
      id: json['id'] ?? json['_id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      steps: List<String>.from(json['steps'] ?? []),
      estimatedDuration: json['estimatedDuration'] ?? 0,
      difficulty: json['difficulty'] ?? '',
      progress: json['progress'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'steps': steps,
      'estimatedDuration': estimatedDuration,
      'difficulty': difficulty,
      'progress': progress,
    };
  }
}

class RecommendationInsights {
  final List<String> strengths;
  final List<String> weaknesses;
  final List<String> improvementAreas;
  final Map<String, double> categoryPerformance;
  final int totalQuizzesCompleted;
  final double overallAccuracy;

  RecommendationInsights({
    required this.strengths,
    required this.weaknesses,
    required this.improvementAreas,
    required this.categoryPerformance,
    required this.totalQuizzesCompleted,
    required this.overallAccuracy,
  });

  factory RecommendationInsights.fromJson(Map<String, dynamic> json) {
    return RecommendationInsights(
      strengths: List<String>.from(json['strengths'] ?? []),
      weaknesses: List<String>.from(json['weaknesses'] ?? []),
      improvementAreas: List<String>.from(json['improvementAreas'] ?? []),
      categoryPerformance: Map<String, double>.from(
        (json['categoryPerformance'] ?? {}).map(
          (key, value) => MapEntry(key.toString(), (value ?? 0.0).toDouble()),
        ),
      ),
      totalQuizzesCompleted: json['totalQuizzesCompleted'] ?? 0,
      overallAccuracy: (json['overallAccuracy'] ?? 0.0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'strengths': strengths,
      'weaknesses': weaknesses,
      'improvementAreas': improvementAreas,
      'categoryPerformance': categoryPerformance,
      'totalQuizzesCompleted': totalQuizzesCompleted,
      'overallAccuracy': overallAccuracy,
    };
  }
}
