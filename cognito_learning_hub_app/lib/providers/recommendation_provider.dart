// lib/providers/recommendation_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/recommendation.dart';
import '../services/recommendation_service.dart';

final recommendationServiceProvider = Provider<RecommendationService>((ref) {
  return RecommendationService();
});

// Quiz recommendations
final quizRecommendationsProvider = FutureProvider.autoDispose
    .family<List<RecommendedQuiz>, Map<String, dynamic>>((ref, params) async {
  final service = ref.watch(recommendationServiceProvider);
  return await service.getQuizRecommendations(
    limit: params['limit'] ?? 10,
    category: params['category'],
    difficulty: params['difficulty'],
  );
});

// Material recommendations
final materialRecommendationsProvider = FutureProvider.autoDispose
    .family<List<RecommendedMaterial>, Map<String, dynamic>>(
        (ref, params) async {
  final service = ref.watch(recommendationServiceProvider);
  return await service.getMaterialRecommendations(
    limit: params['limit'] ?? 10,
    type: params['type'],
    category: params['category'],
  );
});

// Difficulty adjustments
final difficultyAdjustmentsProvider =
    FutureProvider.autoDispose<List<DifficultyAdjustment>>((ref) async {
  final service = ref.watch(recommendationServiceProvider);
  return await service.getDifficultyAdjustments();
});

// Learning paths
final learningPathsProvider =
    FutureProvider.autoDispose<List<LearningPath>>((ref) async {
  final service = ref.watch(recommendationServiceProvider);
  return await service.getLearningPaths();
});

// Recommendation insights
final recommendationInsightsProvider =
    FutureProvider.autoDispose<RecommendationInsights>((ref) async {
  final service = ref.watch(recommendationServiceProvider);
  return await service.getInsights();
});

// Next quiz
final nextQuizProvider =
    FutureProvider.autoDispose<RecommendedQuiz?>((ref) async {
  final service = ref.watch(recommendationServiceProvider);
  return await service.getNextQuiz();
});

// Similar quizzes
final similarQuizzesProvider = FutureProvider.autoDispose
    .family<List<RecommendedQuiz>, Map<String, dynamic>>((ref, params) async {
  final service = ref.watch(recommendationServiceProvider);
  return await service.getSimilarQuizzes(
    params['quizId'] as String,
    limit: params['limit'] ?? 5,
  );
});

// Topic materials
final topicMaterialsProvider = FutureProvider.autoDispose
    .family<List<RecommendedMaterial>, Map<String, dynamic>>(
        (ref, params) async {
  final service = ref.watch(recommendationServiceProvider);
  return await service.getTopicMaterials(
    params['topic'] as String,
    limit: params['limit'] ?? 10,
  );
});

// Weak areas
final weakAreasProvider = FutureProvider.autoDispose<List<String>>((ref) async {
  final service = ref.watch(recommendationServiceProvider);
  return await service.getWeakAreas();
});

// Strong areas
final strongAreasProvider =
    FutureProvider.autoDispose<List<String>>((ref) async {
  final service = ref.watch(recommendationServiceProvider);
  return await service.getStrongAreas();
});

// Daily study plan
final dailyStudyPlanProvider =
    FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final service = ref.watch(recommendationServiceProvider);
  return await service.getDailyStudyPlan();
});
