// lib/providers/analytics_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/analytics_service.dart';
import '../models/analytics.dart';

// Analytics Service Provider
final analyticsServiceProvider = Provider<AnalyticsService>((ref) {
  return AnalyticsService();
});

// Learning Analytics Provider
final learningAnalyticsProvider =
    FutureProvider<LearningAnalytics>((ref) async {
  final service = ref.watch(analyticsServiceProvider);
  return await service.getLearningAnalytics();
});

// Performance Trends Provider
final performanceTrendsProvider =
    FutureProvider.family<List<PerformanceTrend>, TrendsParams>(
  (ref, params) async {
    final service = ref.watch(analyticsServiceProvider);
    return await service.getPerformanceTrends(
      startDate: params.startDate,
      endDate: params.endDate,
      period: params.period,
    );
  },
);

class TrendsParams {
  final DateTime startDate;
  final DateTime endDate;
  final String period;

  TrendsParams({
    required this.startDate,
    required this.endDate,
    this.period = 'day',
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is TrendsParams &&
          startDate == other.startDate &&
          endDate == other.endDate &&
          period == other.period;

  @override
  int get hashCode => Object.hash(startDate, endDate, period);
}

// Category Analytics Provider
final categoryAnalyticsProvider =
    FutureProvider<List<CategoryAnalysis>>((ref) async {
  final service = ref.watch(analyticsServiceProvider);
  return await service.getCategoryAnalytics();
});

// Weekly Insights Provider
final weeklyInsightsProvider = FutureProvider<TimeBasedInsights>((ref) async {
  final service = ref.watch(analyticsServiceProvider);
  return await service.getWeeklyReport();
});

// Monthly Insights Provider
final monthlyInsightsProvider = FutureProvider<TimeBasedInsights>((ref) async {
  final service = ref.watch(analyticsServiceProvider);
  return await service.getMonthlyReport();
});

// Streak Info Provider
final streakInfoProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final service = ref.watch(analyticsServiceProvider);
  return await service.getStreakInfo();
});

// Study Time Distribution Provider
final studyTimeDistributionProvider =
    FutureProvider<Map<String, dynamic>>((ref) async {
  final service = ref.watch(analyticsServiceProvider);
  return await service.getStudyTimeDistribution();
});

// Predictive Analytics Provider
final predictiveAnalyticsProvider =
    FutureProvider<Map<String, dynamic>>((ref) async {
  final service = ref.watch(analyticsServiceProvider);
  return await service.getPredictiveAnalytics();
});

// Comparison Data Provider
final comparisonProvider = FutureProvider.family<Map<String, dynamic>, String>(
  (ref, period) async {
    final service = ref.watch(analyticsServiceProvider);
    return await service.getComparison(period: period);
  },
);
