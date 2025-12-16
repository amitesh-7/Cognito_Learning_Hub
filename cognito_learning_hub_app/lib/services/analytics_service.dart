// lib/services/analytics_service.dart

import '../models/analytics.dart';
import 'api_service.dart';

class AnalyticsService {
  final _api = ApiService();

  /// Get overall learning analytics
  Future<LearningAnalytics> getLearningAnalytics() async {
    try {
      final response = await _api.get('/analytics/overview');
      return LearningAnalytics.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to fetch analytics: $e');
    }
  }

  /// Get performance trends for a specific period
  Future<List<PerformanceTrend>> getPerformanceTrends({
    required DateTime startDate,
    required DateTime endDate,
    String period = 'day', // 'day', 'week', 'month'
  }) async {
    try {
      final response = await _api.get('/analytics/trends', queryParameters: {
        'startDate': startDate.toIso8601String(),
        'endDate': endDate.toIso8601String(),
        'period': period,
      });

      final List trendsData = response.data['trends'] ?? [];
      return trendsData.map((t) => PerformanceTrend.fromJson(t)).toList();
    } catch (e) {
      throw Exception('Failed to fetch performance trends: $e');
    }
  }

  /// Get category-wise analytics
  Future<List<CategoryAnalysis>> getCategoryAnalytics() async {
    try {
      final response = await _api.get('/analytics/categories');

      final List categoriesData = response.data['categories'] ?? [];
      return categoriesData.map((c) => CategoryAnalysis.fromJson(c)).toList();
    } catch (e) {
      throw Exception('Failed to fetch category analytics: $e');
    }
  }

  /// Get time-based insights for a period
  Future<TimeBasedInsights> getTimeBasedInsights({
    required String period, // 'day', 'week', 'month', 'year'
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      final response = await _api.get('/analytics/insights', queryParameters: {
        'period': period,
        if (startDate != null) 'startDate': startDate.toIso8601String(),
        if (endDate != null) 'endDate': endDate.toIso8601String(),
      });

      return TimeBasedInsights.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to fetch time-based insights: $e');
    }
  }

  /// Get weekly report
  Future<TimeBasedInsights> getWeeklyReport() async {
    final now = DateTime.now();
    final startOfWeek = now.subtract(Duration(days: now.weekday - 1));

    return getTimeBasedInsights(
      period: 'week',
      startDate: startOfWeek,
      endDate: now,
    );
  }

  /// Get monthly report
  Future<TimeBasedInsights> getMonthlyReport() async {
    final now = DateTime.now();
    final startOfMonth = DateTime(now.year, now.month, 1);

    return getTimeBasedInsights(
      period: 'month',
      startDate: startOfMonth,
      endDate: now,
    );
  }

  /// Get comparison with previous period
  Future<Map<String, dynamic>> getComparison({
    required String period, // 'week', 'month'
  }) async {
    try {
      final response =
          await _api.get('/analytics/comparison', queryParameters: {
        'period': period,
      });

      return response.data;
    } catch (e) {
      throw Exception('Failed to fetch comparison data: $e');
    }
  }

  /// Get learning streak information
  Future<Map<String, dynamic>> getStreakInfo() async {
    try {
      final response = await _api.get('/analytics/streak');
      return response.data;
    } catch (e) {
      throw Exception('Failed to fetch streak info: $e');
    }
  }

  /// Get study time distribution
  Future<Map<String, dynamic>> getStudyTimeDistribution() async {
    try {
      final response = await _api.get('/analytics/study-time');
      return response.data;
    } catch (e) {
      throw Exception('Failed to fetch study time distribution: $e');
    }
  }

  /// Get predictive analytics (recommended topics, difficulty adjustments)
  Future<Map<String, dynamic>> getPredictiveAnalytics() async {
    try {
      final response = await _api.get('/analytics/predictions');
      return response.data;
    } catch (e) {
      throw Exception('Failed to fetch predictive analytics: $e');
    }
  }
}
