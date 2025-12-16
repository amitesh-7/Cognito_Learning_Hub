// lib/services/teacher_service.dart

import 'package:dio/dio.dart';
import '../models/teacher_stats.dart';
import 'api_service.dart';

class TeacherService {
  final _api = ApiService();

  /// Get teacher dashboard statistics
  Future<TeacherStats> getTeacherStats() async {
    try {
      final response = await _api.get('/teacher/stats');
      return TeacherStats.fromJson(response.data);
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Failed to load stats');
      }
      throw Exception('Network error: ${e.message}');
    }
  }

  /// Get list of students
  Future<List<StudentProgress>> getStudents({
    int page = 1,
    int limit = 20,
    String? search,
  }) async {
    try {
      final response = await _api.get(
        '/teacher/students',
        queryParameters: {
          'page': page,
          'limit': limit,
          if (search != null && search.isNotEmpty) 'search': search,
        },
      );

      return (response.data['students'] as List)
          .map((e) => StudentProgress.fromJson(e))
          .toList();
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(
            e.response!.data['message'] ?? 'Failed to load students');
      }
      throw Exception('Network error: ${e.message}');
    }
  }

  /// Get individual student progress
  Future<StudentProgress> getStudentProgress(String studentId) async {
    try {
      final response = await _api.get('/teacher/students/$studentId');
      return StudentProgress.fromJson(response.data);
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(
            e.response!.data['message'] ?? 'Failed to load student progress');
      }
      throw Exception('Network error: ${e.message}');
    }
  }

  /// Get quiz analytics
  Future<Map<String, dynamic>> getQuizAnalytics(String quizId) async {
    try {
      final response = await _api.get('/teacher/quizzes/$quizId/analytics');
      return response.data;
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(
            e.response!.data['message'] ?? 'Failed to load analytics');
      }
      throw Exception('Network error: ${e.message}');
    }
  }

  /// Create a new assignment
  Future<void> createAssignment({
    required String quizId,
    required List<String> studentIds,
    required DateTime dueDate,
  }) async {
    try {
      await _api.post(
        '/teacher/assignments',
        data: {
          'quizId': quizId,
          'studentIds': studentIds,
          'dueDate': dueDate.toIso8601String(),
        },
      );
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(
            e.response!.data['message'] ?? 'Failed to create assignment');
      }
      throw Exception('Network error: ${e.message}');
    }
  }

  /// Get teacher's created quizzes
  Future<List<Map<String, dynamic>>> getTeacherQuizzes({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final response = await _api.get(
        '/teacher/quizzes',
        queryParameters: {
          'page': page,
          'limit': limit,
        },
      );

      return List<Map<String, dynamic>>.from(response.data['quizzes']);
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(
            e.response!.data['message'] ?? 'Failed to load quizzes');
      }
      throw Exception('Network error: ${e.message}');
    }
  }

  /// Delete a quiz
  Future<void> deleteQuiz(String quizId) async {
    try {
      await _api.delete('/teacher/quizzes/$quizId');
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Failed to delete quiz');
      }
      throw Exception('Network error: ${e.message}');
    }
  }

  /// Update quiz visibility
  Future<void> updateQuizVisibility({
    required String quizId,
    required bool isPublic,
  }) async {
    try {
      await _api.patch(
        '/teacher/quizzes/$quizId',
        data: {'isPublic': isPublic},
      );
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Failed to update quiz');
      }
      throw Exception('Network error: ${e.message}');
    }
  }
}
