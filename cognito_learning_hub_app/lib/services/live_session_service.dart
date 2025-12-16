// lib/services/live_session_service.dart

import 'package:dio/dio.dart';
import '../config/api_config.dart';
import '../models/live_session.dart';
import 'api_service.dart';

class LiveSessionService {
  final _api = ApiService();

  // Create a new live session
  Future<LiveSession> createSession({
    required String quizId,
    String? quizTitle,
  }) async {
    try {
      final response = await _api.post(
        Endpoints.createSession,
        data: {
          'quizId': quizId,
          'quizTitle': quizTitle,
        },
      );

      return LiveSession.fromJson(response.data['session'] ?? response.data);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Join an existing session with code
  Future<LiveSession> joinSession(String code) async {
    try {
      final response = await _api.post(
        Endpoints.joinSession(code),
      );

      return LiveSession.fromJson(response.data['session'] ?? response.data);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Get session details
  Future<LiveSession> getSession(String sessionId) async {
    try {
      final response = await _api.get(
        '${Endpoints.liveSessions}/$sessionId',
      );

      return LiveSession.fromJson(response.data['session'] ?? response.data);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Get active sessions
  Future<List<LiveSession>> getActiveSessions() async {
    try {
      final response = await _api.get(
        '${Endpoints.liveSessions}/active',
      );

      final sessions = response.data['sessions'] ?? response.data ?? [];
      return (sessions as List)
          .map((session) => LiveSession.fromJson(session))
          .toList();
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Leave a session
  Future<void> leaveSession(String sessionId) async {
    try {
      await _api.post(
        '${Endpoints.liveSessions}/$sessionId/leave',
      );
    } catch (e) {
      throw _handleError(e);
    }
  }

  // End session (host only)
  Future<void> endSession(String sessionId) async {
    try {
      await _api.post(
        '${Endpoints.liveSessions}/$sessionId/end',
      );
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Submit answer in live session
  Future<Map<String, dynamic>> submitAnswer({
    required String sessionId,
    required int questionIndex,
    required int answerIndex,
  }) async {
    try {
      final response = await _api.post(
        '${Endpoints.liveSessions}/$sessionId/answer',
        data: {
          'questionIndex': questionIndex,
          'answerIndex': answerIndex,
          'timestamp': DateTime.now().toIso8601String(),
        },
      );

      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Get leaderboard for session
  Future<List<LiveLeaderboardEntry>> getLeaderboard(String sessionId) async {
    try {
      final response = await _api.get(
        '${Endpoints.liveSessions}/$sessionId/leaderboard',
      );

      final leaderboard = response.data['leaderboard'] ?? response.data ?? [];
      return (leaderboard as List)
          .map((entry) => LiveLeaderboardEntry.fromJson(entry))
          .toList();
    } catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(dynamic error) {
    if (error is DioException) {
      if (error.response != null) {
        return error.response?.data['message'] ?? 'Server error occurred';
      }
      return 'Network error: ${error.message}';
    }
    return error.toString();
  }
}
