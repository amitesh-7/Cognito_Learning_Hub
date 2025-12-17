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
      print('📤 Sending message to AI Study Buddy:');
      print('Message: $message');
      print('SessionId: $sessionId');

      final requestData = {
        'message': message,
        if (sessionId != null) 'sessionId': sessionId,
        if (quizId != null || quizTitle != null || topic != null)
          'context': {
            if (quizId != null) 'quizId': quizId,
            if (quizTitle != null) 'quizTitle': quizTitle,
            if (topic != null) 'topic': topic,
          },
      };

      print('Request data: $requestData');

      final response = await _apiService.post(
        '/api/study-buddy/chat/message',
        data: requestData,
      );

      print('✅ Response received: ${response.data}');

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
        '/api/study-buddy/chat/conversations',
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
        '/api/study-buddy/chat/conversation/$sessionId',
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
        '/api/study-buddy/chat/conversation/$sessionId',
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
        '/api/study-buddy/goals',
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
      final response = await _apiService.get('/api/study-buddy/goals');

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
        '/api/study-buddy/goals/$goalId/complete',
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
      print('🔴 Study Buddy Error:');
      print('Status Code: ${error.response?.statusCode}');
      print('Request URL: ${error.requestOptions.uri}');
      print('Response: ${error.response?.data}');

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
      if (error.response?.statusCode == 404) {
        return 'Service not found. Please ensure the quiz service is running.';
      }
      if (error.response?.statusCode == 500) {
        return 'Server error. The AI service may be unavailable.';
      }
      return error.message ?? 'An error occurred';
    }
    return error.toString();
  }
}
