// lib/services/study_buddy_service.dart

import 'package:dio/dio.dart';
import '../models/conversation.dart';
import 'api_service.dart';

class StudyBuddyService {
  final ApiService _apiService = ApiService();

  /// Send a message to the AI Study Buddy
  Future<Map<String, dynamic>> sendMessage({
    required String message,
    String? sessionId,
    String? quizId,
    String? quizTitle,
    String? topic,
  }) async {
    try {
      final response = await _apiService.post(
        '/study-buddy/chat',
        data: {
          'message': message,
          if (sessionId != null) 'sessionId': sessionId,
          if (quizId != null)
            'context': {
              'quizId': quizId,
              if (quizTitle != null) 'quizTitle': quizTitle,
              if (topic != null) 'topic': topic,
            },
        },
      );

      return {
        'response': response.data['data']['response'] as String,
        'sessionId': response.data['data']['sessionId'] as String,
        'metadata': response.data['data']['metadata'],
      };
    } catch (e) {
      throw _handleError(e);
    }
  }

  /// Fetch all conversations
  Future<List<Conversation>> getConversations({
    int limit = 50,
    String status = 'active',
  }) async {
    try {
      final response = await _apiService.get(
        '/study-buddy/conversations',
        queryParameters: {
          'limit': limit,
          'status': status,
        },
      );

      final conversations = (response.data['data']['conversations'] as List)
          .map((json) => Conversation.fromJson(json as Map<String, dynamic>))
          .toList();

      return conversations;
    } catch (e) {
      throw _handleError(e);
    }
  }

  /// Load a specific conversation with full message history
  Future<Conversation> getConversation(String sessionId) async {
    try {
      final response = await _apiService.get(
        '/study-buddy/conversation/$sessionId',
      );

      return Conversation.fromJson(
        response.data['data']['conversation'] as Map<String, dynamic>,
      );
    } catch (e) {
      throw _handleError(e);
    }
  }

  /// Delete a conversation
  Future<void> deleteConversation(String sessionId) async {
    try {
      await _apiService.delete(
        '/study-buddy/conversation/$sessionId',
      );
    } catch (e) {
      throw _handleError(e);
    }
  }

  /// Set a learning goal
  Future<StudyGoal> setGoal({
    required String goalText,
    required String category,
    required DateTime targetDate,
  }) async {
    try {
      final response = await _apiService.post(
        '/study-buddy/goals',
        data: {
          'goalText': goalText,
          'category': category,
          'targetDate': targetDate.toIso8601String(),
        },
      );

      return StudyGoal.fromJson(
        response.data['data']['goal'] as Map<String, dynamic>,
      );
    } catch (e) {
      throw _handleError(e);
    }
  }

  /// Get all learning goals
  Future<List<StudyGoal>> getGoals() async {
    try {
      final response = await _apiService.get('/study-buddy/goals');

      final goals = (response.data['data']['goals'] as List)
          .map((json) => StudyGoal.fromJson(json as Map<String, dynamic>))
          .toList();

      return goals;
    } catch (e) {
      throw _handleError(e);
    }
  }

  /// Mark a goal as completed
  Future<void> completeGoal(String goalId) async {
    try {
      await _apiService.patch(
        '/study-buddy/goals/$goalId/complete',
      );
    } catch (e) {
      throw _handleError(e);
    }
  }

  /// Delete a goal
  Future<void> deleteGoal(String goalId) async {
    try {
      await _apiService.delete(
        '/study-buddy/goals/$goalId',
      );
    } catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(dynamic error) {
    if (error is DioException) {
      if (error.response?.data != null) {
        final data = error.response!.data;
        if (data is Map && data.containsKey('error')) {
          return data['error'] as String;
        }
        if (data is Map && data.containsKey('message')) {
          return data['message'] as String;
        }
      }
      if (error.type == DioExceptionType.connectionTimeout) {
        return 'Connection timeout. Please check your internet connection.';
      }
      if (error.type == DioExceptionType.receiveTimeout) {
        return 'Server is taking too long to respond.';
      }
      return error.message ?? 'An error occurred';
    }
    return error.toString();
  }
}
