// lib/providers/teacher_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/teacher_stats.dart';
import '../services/teacher_service.dart';

/// Provider for TeacherService instance
final teacherServiceProvider = Provider<TeacherService>((ref) {
  return TeacherService();
});

/// Provider for teacher statistics
final teacherStatsProvider = FutureProvider<TeacherStats>((ref) async {
  final service = ref.read(teacherServiceProvider);
  return await service.getTeacherStats();
});

/// Provider for students list
final studentsListProvider =
    FutureProvider.family<List<StudentProgress>, StudentsQuery>(
        (ref, query) async {
  final service = ref.read(teacherServiceProvider);
  return await service.getStudents(
    page: query.page,
    limit: query.limit,
    search: query.search,
  );
});

class StudentsQuery {
  final int page;
  final int limit;
  final String? search;

  StudentsQuery({
    this.page = 1,
    this.limit = 20,
    this.search,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is StudentsQuery &&
          runtimeType == other.runtimeType &&
          page == other.page &&
          limit == other.limit &&
          search == other.search;

  @override
  int get hashCode => page.hashCode ^ limit.hashCode ^ search.hashCode;
}

/// Provider for individual student progress
final studentProgressProvider =
    FutureProvider.family<StudentProgress, String>((ref, studentId) async {
  final service = ref.read(teacherServiceProvider);
  return await service.getStudentProgress(studentId);
});

/// Provider for quiz analytics
final quizAnalyticsProvider =
    FutureProvider.family<Map<String, dynamic>, String>((ref, quizId) async {
  final service = ref.read(teacherServiceProvider);
  return await service.getQuizAnalytics(quizId);
});

/// Provider for teacher's quizzes
final teacherQuizzesProvider =
    FutureProvider.family<List<Map<String, dynamic>>, int>((ref, page) async {
  final service = ref.read(teacherServiceProvider);
  return await service.getTeacherQuizzes(page: page);
});

/// State notifier for managing search
class SearchNotifier extends Notifier<String> {
  @override
  String build() => '';

  void updateSearch(String query) {
    state = query;
  }

  void clearSearch() {
    state = '';
  }
}

final searchProvider = NotifierProvider<SearchNotifier, String>(
  SearchNotifier.new,
);
