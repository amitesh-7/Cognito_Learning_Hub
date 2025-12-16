// lib/services/duel_service.dart
import 'package:dio/dio.dart';
import '../config/api_config.dart';
import '../models/duel.dart';

class DuelService {
  final Dio _dio;

  DuelService({Dio? dio}) : _dio = dio ?? Dio() {
    _dio.options.baseUrl = ApiConfig.apiUrl;
    _dio.options.connectTimeout = const Duration(seconds: 30);
    _dio.options.receiveTimeout = const Duration(seconds: 30);
  }

  void setAuthToken(String token) {
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }

  /// Start searching for a duel opponent
  Future<void> findOpponent({
    required String category,
    required String difficulty,
  }) async {
    try {
      await _dio.post(
        '/duel/matchmaking/search',
        data: {
          'category': category,
          'difficulty': difficulty,
        },
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Cancel matchmaking search
  Future<void> cancelSearch() async {
    try {
      await _dio.post('/duel/matchmaking/cancel');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Get current duel match details
  Future<DuelMatch> getDuel(String duelId) async {
    try {
      final response = await _dio.get('/duel/$duelId');
      return DuelMatch.fromJson(response.data['data'] ?? response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Submit an answer in a duel
  Future<void> submitDuelAnswer({
    required String duelId,
    required int questionIndex,
    required int answerIndex,
  }) async {
    try {
      await _dio.post(
        '/duel/$duelId/answer',
        data: {
          'questionIndex': questionIndex,
          'answerIndex': answerIndex,
        },
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Get duel history for the current user
  Future<List<DuelMatch>> getDuelHistory({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final response = await _dio.get(
        '/duel/history',
        queryParameters: {
          'page': page,
          'limit': limit,
        },
      );

      final data = response.data['data'] ?? response.data;
      if (data is List) {
        return data.map((match) => DuelMatch.fromJson(match)).toList();
      }

      final duels = data['duels'] ?? [];
      return (duels as List).map((match) => DuelMatch.fromJson(match)).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Get duel statistics for the current user
  Future<Map<String, dynamic>> getDuelStats() async {
    try {
      final response = await _dio.get('/duel/stats');
      return response.data['data'] ?? response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Leave/forfeit a duel match
  Future<void> leaveDuel(String duelId) async {
    try {
      await _dio.post('/duel/$duelId/leave');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(DioException e) {
    if (e.response != null) {
      final message = e.response?.data['message'] ?? e.response?.data['error'];
      return message ?? 'An error occurred while processing your request';
    } else if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      return 'Connection timeout. Please check your internet connection';
    } else if (e.type == DioExceptionType.connectionError) {
      return 'Unable to connect to the server. Please try again';
    }
    return e.message ?? 'An unexpected error occurred';
  }
}
