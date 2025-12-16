// lib/services/study_materials_service.dart

import 'package:dio/dio.dart';
import '../config/api_config.dart';
import '../models/study_material.dart';

class StudyMaterialsService {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: ApiConfig.apiUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));

  /// Get all study materials with filters
  Future<List<StudyMaterial>> getMaterials({
    String? categoryId,
    MaterialType? type,
    MaterialDifficulty? difficulty,
    String? searchQuery,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final response = await _dio.get('/materials', queryParameters: {
        if (categoryId != null) 'categoryId': categoryId,
        if (type != null) 'type': type.name,
        if (difficulty != null) 'difficulty': difficulty.name,
        if (searchQuery != null) 'search': searchQuery,
        'page': page,
        'limit': limit,
      });

      final List materialsData = response.data['materials'] ?? [];
      return materialsData.map((m) => StudyMaterial.fromJson(m)).toList();
    } catch (e) {
      throw Exception('Failed to fetch materials: $e');
    }
  }

  /// Get material by ID
  Future<StudyMaterial> getMaterialById(String materialId) async {
    try {
      final response = await _dio.get('/materials/$materialId');
      return StudyMaterial.fromJson(response.data['material']);
    } catch (e) {
      throw Exception('Failed to fetch material: $e');
    }
  }

  /// Get bookmarked materials
  Future<List<StudyMaterial>> getBookmarkedMaterials() async {
    try {
      final response = await _dio.get('/materials/bookmarks');
      final List materialsData = response.data['materials'] ?? [];
      return materialsData.map((m) => StudyMaterial.fromJson(m)).toList();
    } catch (e) {
      throw Exception('Failed to fetch bookmarks: $e');
    }
  }

  /// Toggle bookmark
  Future<void> toggleBookmark(String materialId) async {
    try {
      await _dio.post('/materials/$materialId/bookmark');
    } catch (e) {
      throw Exception('Failed to toggle bookmark: $e');
    }
  }

  /// Get material progress
  Future<MaterialProgress> getProgress(String materialId) async {
    try {
      final response = await _dio.get('/materials/$materialId/progress');
      return MaterialProgress.fromJson(response.data['progress']);
    } catch (e) {
      throw Exception('Failed to fetch progress: $e');
    }
  }

  /// Update material progress
  Future<void> updateProgress({
    required String materialId,
    required double progressPercentage,
    required int timeSpentSeconds,
  }) async {
    try {
      await _dio.put('/materials/$materialId/progress', data: {
        'progressPercentage': progressPercentage,
        'timeSpentSeconds': timeSpentSeconds,
      });
    } catch (e) {
      throw Exception('Failed to update progress: $e');
    }
  }

  /// Mark material as completed
  Future<void> markCompleted(String materialId) async {
    try {
      await _dio.post('/materials/$materialId/complete');
    } catch (e) {
      throw Exception('Failed to mark as completed: $e');
    }
  }

  /// Rate material
  Future<void> rateMaterial(String materialId, double rating) async {
    try {
      await _dio.post('/materials/$materialId/rate', data: {
        'rating': rating,
      });
    } catch (e) {
      throw Exception('Failed to rate material: $e');
    }
  }

  /// Track material view
  Future<void> trackView(String materialId) async {
    try {
      await _dio.post('/materials/$materialId/view');
    } catch (e) {
      throw Exception('Failed to track view: $e');
    }
  }

  /// Download material
  Future<void> downloadMaterial(String materialId) async {
    try {
      await _dio.post('/materials/$materialId/download');
    } catch (e) {
      throw Exception('Failed to download material: $e');
    }
  }

  /// Get recommended materials
  Future<List<StudyMaterial>> getRecommendedMaterials() async {
    try {
      final response = await _dio.get('/materials/recommended');
      final List materialsData = response.data['materials'] ?? [];
      return materialsData.map((m) => StudyMaterial.fromJson(m)).toList();
    } catch (e) {
      throw Exception('Failed to fetch recommendations: $e');
    }
  }

  /// Get recently viewed materials
  Future<List<StudyMaterial>> getRecentlyViewed() async {
    try {
      final response = await _dio.get('/materials/recent');
      final List materialsData = response.data['materials'] ?? [];
      return materialsData.map((m) => StudyMaterial.fromJson(m)).toList();
    } catch (e) {
      throw Exception('Failed to fetch recent materials: $e');
    }
  }
}
