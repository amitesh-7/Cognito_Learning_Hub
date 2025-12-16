// lib/services/gamification_service.dart

import 'package:dio/dio.dart';
import '../models/achievement.dart';
import '../models/quest.dart';
import 'api_service.dart';

class GamificationService {
  final _api = ApiService();

  // Get user stats
  Future<GamificationStats> getUserStats() async {
    try {
      print('🎮 Fetching gamification stats from /api/stats/me');
      final response = await _api.get('/api/stats/me');

      print('🎮 Gamification response: ${response.data}');
      print('🎮 Success: ${response.data['success']}');

      if (response.data['success'] == true) {
        // Backend returns: { success, userId, stats }
        final statsData = response.data['stats'];
        print('🎮 Stats data: $statsData');

        if (statsData == null) {
          throw Exception('Stats data is null in response');
        }

        final stats = GamificationStats.fromJson(statsData);
        print(
            '🎮 Parsed stats - Points: ${stats.totalPoints}, Level: ${stats.level}, Quizzes: ${stats.quizzesCompleted}');
        return stats;
      } else {
        throw Exception(response.data['message'] ?? 'Failed to fetch stats');
      }
    } on DioException catch (e) {
      print(
          '🎮 ERROR fetching stats: ${e.response?.statusCode} - ${e.response?.data}');
      print('🎮 ERROR message: ${e.message}');
      throw _handleError(e);
    } catch (e) {
      print('🎮 UNEXPECTED ERROR: $e');
      rethrow;
    }
  }

  // Get achievements
  Future<List<Achievement>> getAchievements(
      {String? category, bool? unlocked}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (category != null) queryParams['category'] = category;
      if (unlocked != null) queryParams['unlocked'] = unlocked;

      final response = await _api.get(
        '/api/gamification/achievements',
        queryParameters: queryParams,
      );

      if (response.data['success'] == true) {
        final List achievementsData = response.data['data'] ?? [];
        return achievementsData
            .map((json) => Achievement.fromJson(json))
            .toList();
      } else {
        throw Exception(
            response.data['message'] ?? 'Failed to fetch achievements');
      }
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Claim achievement reward
  Future<void> claimAchievement(String achievementId) async {
    try {
      final response = await _api.post(
        '/api/gamification/achievements/$achievementId/claim',
      );

      if (response.data['success'] != true) {
        throw Exception(
            response.data['message'] ?? 'Failed to claim achievement');
      }
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Get quests
  Future<List<Quest>> getQuests({String? status}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (status != null) queryParams['status'] = status;

      final response = await _api.get(
        '/api/quests',
        queryParameters: queryParams,
      );

      if (response.data['success'] == true) {
        final List questsData = response.data['data'] ?? [];
        return questsData.map((json) => Quest.fromJson(json)).toList();
      } else {
        throw Exception(response.data['message'] ?? 'Failed to fetch quests');
      }
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Get quest details
  Future<Quest> getQuest(String questId) async {
    try {
      final response = await _api.get('/api/quests/$questId');

      if (response.data['success'] == true) {
        return Quest.fromJson(response.data['data']);
      } else {
        throw Exception(response.data['message'] ?? 'Failed to fetch quest');
      }
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Start quest
  Future<void> startQuest(String questId) async {
    try {
      final response = await _api.post('/api/quests/$questId/start');

      if (response.data['success'] != true) {
        throw Exception(response.data['message'] ?? 'Failed to start quest');
      }
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Claim quest reward
  Future<void> claimQuestReward(String questId) async {
    try {
      final response = await _api.post('/api/quests/$questId/claim');

      if (response.data['success'] != true) {
        throw Exception(
            response.data['message'] ?? 'Failed to claim quest reward');
      }
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Get leaderboard
  Future<List<Map<String, dynamic>>> getLeaderboard({
    String period = 'weekly',
    int limit = 50,
  }) async {
    try {
      final response = await _api.get(
        '/api/gamification/leaderboard',
        queryParameters: {
          'period': period,
          'limit': limit,
        },
      );

      if (response.data['success'] == true) {
        return List<Map<String, dynamic>>.from(response.data['data'] ?? []);
      } else {
        throw Exception(
            response.data['message'] ?? 'Failed to fetch leaderboard');
      }
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(DioException e) {
    if (e.response != null) {
      final data = e.response!.data;
      if (data is Map && data['message'] != null) {
        return data['message'];
      }
      return 'Server error: ${e.response!.statusCode}';
    } else if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      return 'Connection timeout. Please check your internet connection.';
    } else if (e.type == DioExceptionType.connectionError) {
      return 'Unable to connect to server. Please check your internet connection.';
    }
    return 'An unexpected error occurred';
  }
}
