// lib/services/recommendation_service.dart

import '../models/recommendation.dart';
import 'api_service.dart';

class RecommendationService {
  final _api = ApiService();

  /// Get personalized quiz recommendations
  Future<List<RecommendedQuiz>> getQuizRecommendations({
    int limit = 10,
    String? category,
    String? difficulty,
  }) async {
    try {
      final response =
          await _api.get('/recommendations/quizzes', queryParameters: {
        'limit': limit,
        if (category != null) 'category': category,
        if (difficulty != null) 'difficulty': difficulty,
      });

      final List recommendations = response.data['recommendations'] ?? [];
      return recommendations.map((r) => RecommendedQuiz.fromJson(r)).toList();
    } catch (e) {
      throw Exception('Failed to fetch quiz recommendations: $e');
    }
  }

  /// Get personalized material recommendations
  Future<List<RecommendedMaterial>> getMaterialRecommendations({
    int limit = 10,
    String? type,
    String? category,
  }) async {
    try {
      final response =
          await _api.get('/recommendations/materials', queryParameters: {
        'limit': limit,
        if (type != null) 'type': type,
        if (category != null) 'category': category,
      });

      final List recommendations = response.data['recommendations'] ?? [];
      return recommendations
          .map((r) => RecommendedMaterial.fromJson(r))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch material recommendations: $e');
    }
  }

  /// Get difficulty adjustment suggestions
  Future<List<DifficultyAdjustment>> getDifficultyAdjustments() async {
    try {
      final response =
          await _api.get('/recommendations/difficulty-adjustments');

      final List adjustments = response.data['adjustments'] ?? [];
      return adjustments.map((a) => DifficultyAdjustment.fromJson(a)).toList();
    } catch (e) {
      throw Exception('Failed to fetch difficulty adjustments: $e');
    }
  }

  /// Get personalized learning paths
  Future<List<LearningPath>> getLearningPaths() async {
    try {
      final response = await _api.get('/recommendations/learning-paths');

      final List paths = response.data['paths'] ?? [];
      return paths.map((p) => LearningPath.fromJson(p)).toList();
    } catch (e) {
      throw Exception('Failed to fetch learning paths: $e');
    }
  }

  /// Get recommendation insights
  Future<RecommendationInsights> getInsights() async {
    try {
      final response = await _api.get('/recommendations/insights');

      return RecommendationInsights.fromJson(response.data['insights'] ?? {});
    } catch (e) {
      throw Exception('Failed to fetch recommendation insights: $e');
    }
  }

  /// Get next recommended quiz based on current performance
  Future<RecommendedQuiz?> getNextQuiz() async {
    try {
      final response = await _api.get('/recommendations/next-quiz');

      if (response.data['quiz'] != null) {
        return RecommendedQuiz.fromJson(response.data['quiz']);
      }
      return null;
    } catch (e) {
      throw Exception('Failed to fetch next quiz: $e');
    }
  }

  /// Get similar quizzes based on a quiz ID
  Future<List<RecommendedQuiz>> getSimilarQuizzes(String quizId,
      {int limit = 5}) async {
    try {
      final response = await _api.get(
        '/recommendations/similar-quizzes/$quizId',
        queryParameters: {'limit': limit},
      );

      final List recommendations = response.data['recommendations'] ?? [];
      return recommendations.map((r) => RecommendedQuiz.fromJson(r)).toList();
    } catch (e) {
      throw Exception('Failed to fetch similar quizzes: $e');
    }
  }

  /// Get recommended study materials for a specific topic
  Future<List<RecommendedMaterial>> getTopicMaterials(String topic,
      {int limit = 10}) async {
    try {
      final response = await _api.get(
        '/recommendations/topic-materials',
        queryParameters: {
          'topic': topic,
          'limit': limit,
        },
      );

      final List recommendations = response.data['recommendations'] ?? [];
      return recommendations
          .map((r) => RecommendedMaterial.fromJson(r))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch topic materials: $e');
    }
  }

  /// Get weak areas that need improvement
  Future<List<String>> getWeakAreas() async {
    try {
      final response = await _api.get('/recommendations/weak-areas');

      return List<String>.from(response.data['weakAreas'] ?? []);
    } catch (e) {
      throw Exception('Failed to fetch weak areas: $e');
    }
  }

  /// Get strong areas where user excels
  Future<List<String>> getStrongAreas() async {
    try {
      final response = await _api.get('/recommendations/strong-areas');

      return List<String>.from(response.data['strongAreas'] ?? []);
    } catch (e) {
      throw Exception('Failed to fetch strong areas: $e');
    }
  }

  /// Get recommended daily study plan
  Future<Map<String, dynamic>> getDailyStudyPlan() async {
    try {
      final response = await _api.get('/recommendations/daily-study-plan');

      return response.data['plan'] ?? {};
    } catch (e) {
      throw Exception('Failed to fetch daily study plan: $e');
    }
  }

  /// Provide feedback on recommendation
  Future<void> provideFeedback({
    required String recommendationId,
    required String type,
    required bool helpful,
    String? comment,
  }) async {
    try {
      await _api.post('/recommendations/feedback', data: {
        'recommendationId': recommendationId,
        'type': type,
        'helpful': helpful,
        if (comment != null) 'comment': comment,
      });
    } catch (e) {
      throw Exception('Failed to provide feedback: $e');
    }
  }

  /// Accept a recommendation
  Future<void> acceptRecommendation(String recommendationId) async {
    try {
      await _api.post('/recommendations/$recommendationId/accept');
    } catch (e) {
      throw Exception('Failed to accept recommendation: $e');
    }
  }

  /// Dismiss a recommendation
  Future<void> dismissRecommendation(String recommendationId) async {
    try {
      await _api.post('/recommendations/$recommendationId/dismiss');
    } catch (e) {
      throw Exception('Failed to dismiss recommendation: $e');
    }
  }
}
