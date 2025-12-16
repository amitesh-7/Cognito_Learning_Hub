// lib/screens/analytics/analytics_dashboard_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../models/analytics.dart';
import '../../providers/analytics_provider.dart';
import '../../config/theme.dart';

class AnalyticsDashboardScreen extends ConsumerStatefulWidget {
  const AnalyticsDashboardScreen({super.key});

  @override
  ConsumerState<AnalyticsDashboardScreen> createState() =>
      _AnalyticsDashboardScreenState();
}

class _AnalyticsDashboardScreenState
    extends ConsumerState<AnalyticsDashboardScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedPeriod = 'week'; // 'week', 'month'

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Analytics Dashboard'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Overview'),
            Tab(text: 'Performance'),
            Tab(text: 'Categories'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOverviewTab(),
          _buildPerformanceTab(),
          _buildCategoriesTab(),
        ],
      ),
    );
  }

  Widget _buildOverviewTab() {
    final analyticsAsync = ref.watch(learningAnalyticsProvider);

    return analyticsAsync.when(
      data: (analytics) => RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(learningAnalyticsProvider);
        },
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Stats Cards
            _buildStatsGrid(analytics),
            const SizedBox(height: 24),

            // Streak Card
            _buildStreakCard(analytics),
            const SizedBox(height: 24),

            // Weekly vs Monthly Toggle
            _buildPeriodSelector(),
            const SizedBox(height: 16),

            // Time-Based Insights
            _selectedPeriod == 'week'
                ? _buildWeeklyInsights(analytics.weeklyInsights)
                : _buildMonthlyInsights(analytics.monthlyInsights),
          ],
        ),
      ),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stack) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text('Error loading analytics: $error'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => ref.invalidate(learningAnalyticsProvider),
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsGrid(LearningAnalytics analytics) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: [
        _buildStatCard(
          'Total Quizzes',
          analytics.totalQuizzes.toString(),
          Icons.quiz,
          Colors.blue,
        ),
        _buildStatCard(
          'Avg Score',
          '${analytics.averageScore.toStringAsFixed(1)}%',
          Icons.grade,
          Colors.green,
        ),
        _buildStatCard(
          'Accuracy',
          '${analytics.overallAccuracy.toStringAsFixed(1)}%',
          Icons.check_circle,
          Colors.orange,
        ),
        _buildStatCard(
          'Total XP',
          analytics.totalXP.toString(),
          Icons.stars,
          Colors.purple,
        ),
      ],
    ).animate().fadeIn();
  }

  Widget _buildStatCard(
      String label, String value, IconData icon, Color color) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStreakCard(LearningAnalytics analytics) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            Column(
              children: [
                const Icon(Icons.local_fire_department,
                    color: Colors.orange, size: 40),
                const SizedBox(height: 8),
                Text(
                  '${analytics.currentStreak}',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'Current Streak',
                  style: TextStyle(color: Colors.grey.shade600),
                ),
              ],
            ),
            Container(
              height: 60,
              width: 1,
              color: Colors.grey.shade300,
            ),
            Column(
              children: [
                const Icon(Icons.emoji_events, color: Colors.amber, size: 40),
                const SizedBox(height: 8),
                Text(
                  '${analytics.longestStreak}',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'Longest Streak',
                  style: TextStyle(color: Colors.grey.shade600),
                ),
              ],
            ),
          ],
        ),
      ),
    ).animate().fadeIn().slideY(begin: 0.2);
  }

  Widget _buildPeriodSelector() {
    return Row(
      children: [
        Expanded(
          child: _buildPeriodButton('week', 'This Week'),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildPeriodButton('month', 'This Month'),
        ),
      ],
    );
  }

  Widget _buildPeriodButton(String period, String label) {
    final isSelected = _selectedPeriod == period;
    return ElevatedButton(
      onPressed: () => setState(() => _selectedPeriod = period),
      style: ElevatedButton.styleFrom(
        backgroundColor:
            isSelected ? AppTheme.primaryColor : Colors.grey.shade200,
        foregroundColor: isSelected ? Colors.white : Colors.black,
        elevation: isSelected ? 2 : 0,
      ),
      child: Text(label),
    );
  }

  Widget _buildWeeklyInsights(TimeBasedInsights insights) {
    return _buildInsightsCard(insights);
  }

  Widget _buildMonthlyInsights(TimeBasedInsights insights) {
    return _buildInsightsCard(insights);
  }

  Widget _buildInsightsCard(TimeBasedInsights insights) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Insights',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _buildInsightRow(
                'Quizzes Completed', insights.totalQuizzes.toString()),
            _buildInsightRow('Average Score',
                '${insights.averageScore.toStringAsFixed(1)}%'),
            _buildInsightRow(
                'Accuracy', '${insights.accuracy.toStringAsFixed(1)}%'),
            _buildInsightRow('Total Time', insights.totalTimeFormatted),
            _buildInsightRow('Streak Days', insights.streakDays.toString()),
            if (insights.strongCategories.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text('Strong Categories:',
                  style: TextStyle(
                      color: Colors.green, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Wrap(
                spacing: 8,
                children: insights.strongCategories
                    .map((c) => Chip(label: Text(c)))
                    .toList(),
              ),
            ],
            if (insights.weakCategories.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text('Needs Improvement:',
                  style: TextStyle(
                      color: Colors.orange, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Wrap(
                spacing: 8,
                children: insights.weakCategories
                    .map((c) => Chip(label: Text(c)))
                    .toList(),
              ),
            ],
          ],
        ),
      ),
    ).animate().fadeIn().slideY(begin: 0.2);
  }

  Widget _buildInsightRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey.shade700)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildPerformanceTab() {
    final now = DateTime.now();
    final startDate = now.subtract(const Duration(days: 30));
    final params =
        TrendsParams(startDate: startDate, endDate: now, period: 'day');
    final trendsAsync = ref.watch(performanceTrendsProvider(params));

    return trendsAsync.when(
      data: (trends) {
        if (trends.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.insert_chart, size: 64, color: Colors.grey.shade400),
                const SizedBox(height: 16),
                Text('No performance data yet',
                    style: TextStyle(color: Colors.grey.shade600)),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(performanceTrendsProvider(params));
          },
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Score Trend Chart
              Card(
                elevation: 2,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Score Trend (Last 30 Days)',
                        style: TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        height: 250,
                        child: _buildScoreLineChart(trends),
                      ),
                    ],
                  ),
                ),
              ).animate().fadeIn(),

              const SizedBox(height: 16),

              // Accuracy Trend Chart
              Card(
                elevation: 2,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Accuracy Trend',
                        style: TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        height: 250,
                        child: _buildAccuracyLineChart(trends),
                      ),
                    ],
                  ),
                ),
              ).animate().fadeIn().slideY(begin: 0.2),
            ],
          ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stack) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text('Error loading trends: $error'),
          ],
        ),
      ),
    );
  }

  Widget _buildScoreLineChart(List<PerformanceTrend> trends) {
    final spots = trends.asMap().entries.map((entry) {
      return FlSpot(entry.key.toDouble(), entry.value.averageScore);
    }).toList();

    return LineChart(
      LineChartData(
        gridData: FlGridData(show: true, drawVerticalLine: false),
        titlesData: FlTitlesData(
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 40,
              getTitlesWidget: (value, meta) {
                return Text('${value.toInt()}%',
                    style: const TextStyle(fontSize: 10));
              },
            ),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 30,
              getTitlesWidget: (value, meta) {
                if (value.toInt() < trends.length) {
                  final date = trends[value.toInt()].date;
                  return Text('${date.day}/${date.month}',
                      style: const TextStyle(fontSize: 9));
                }
                return const Text('');
              },
            ),
          ),
          rightTitles:
              const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          topTitles:
              const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        borderData: FlBorderData(show: false),
        minY: 0,
        maxY: 100,
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            color: AppTheme.primaryColor,
            barWidth: 3,
            dotData: const FlDotData(show: true),
            belowBarData: BarAreaData(
              show: true,
              color: AppTheme.primaryColor.withOpacity(0.1),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAccuracyLineChart(List<PerformanceTrend> trends) {
    final spots = trends.asMap().entries.map((entry) {
      return FlSpot(entry.key.toDouble(), entry.value.accuracy);
    }).toList();

    return LineChart(
      LineChartData(
        gridData: FlGridData(show: true, drawVerticalLine: false),
        titlesData: FlTitlesData(
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 40,
              getTitlesWidget: (value, meta) {
                return Text('${value.toInt()}%',
                    style: const TextStyle(fontSize: 10));
              },
            ),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 30,
              getTitlesWidget: (value, meta) {
                if (value.toInt() < trends.length) {
                  final date = trends[value.toInt()].date;
                  return Text('${date.day}/${date.month}',
                      style: const TextStyle(fontSize: 9));
                }
                return const Text('');
              },
            ),
          ),
          rightTitles:
              const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          topTitles:
              const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        borderData: FlBorderData(show: false),
        minY: 0,
        maxY: 100,
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            color: Colors.green,
            barWidth: 3,
            dotData: const FlDotData(show: true),
            belowBarData: BarAreaData(
              show: true,
              color: Colors.green.withOpacity(0.1),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoriesTab() {
    final categoriesAsync = ref.watch(categoryAnalyticsProvider);

    return categoriesAsync.when(
      data: (categories) {
        if (categories.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.category, size: 64, color: Colors.grey.shade400),
                const SizedBox(height: 16),
                Text('No category data yet',
                    style: TextStyle(color: Colors.grey.shade600)),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(categoryAnalyticsProvider);
          },
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Category Performance Bars
              Card(
                elevation: 2,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Category Performance',
                        style: TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        height: 300,
                        child: _buildCategoryBarChart(categories),
                      ),
                    ],
                  ),
                ),
              ).animate().fadeIn(),

              const SizedBox(height: 16),

              // Category Details List
              ...categories.map((category) => _buildCategoryCard(category)),
            ],
          ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stack) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text('Error loading categories: $error'),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryBarChart(List<CategoryAnalysis> categories) {
    return BarChart(
      BarChartData(
        alignment: BarChartAlignment.spaceAround,
        maxY: 100,
        barTouchData: BarTouchData(enabled: true),
        titlesData: FlTitlesData(
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 40,
              getTitlesWidget: (value, meta) {
                return Text('${value.toInt()}%',
                    style: const TextStyle(fontSize: 10));
              },
            ),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 60,
              getTitlesWidget: (value, meta) {
                if (value.toInt() < categories.length) {
                  final name = categories[value.toInt()].categoryName;
                  return Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      name.length > 10 ? '${name.substring(0, 10)}...' : name,
                      style: const TextStyle(fontSize: 9),
                    ),
                  );
                }
                return const Text('');
              },
            ),
          ),
          rightTitles:
              const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          topTitles:
              const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        borderData: FlBorderData(show: false),
        gridData: const FlGridData(show: false),
        barGroups: categories.asMap().entries.map((entry) {
          return BarChartGroupData(
            x: entry.key,
            barRods: [
              BarChartRodData(
                toY: entry.value.accuracy,
                color: _getCategoryColor(entry.value.accuracy),
                width: 20,
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(4)),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }

  Color _getCategoryColor(double accuracy) {
    if (accuracy >= 80) return Colors.green;
    if (accuracy >= 60) return Colors.orange;
    return Colors.red;
  }

  Widget _buildCategoryCard(CategoryAnalysis category) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    category.categoryName,
                    style: const TextStyle(
                        fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color:
                        _getCategoryColor(category.accuracy).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${category.accuracy.toStringAsFixed(1)}%',
                    style: TextStyle(
                      color: _getCategoryColor(category.accuracy),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildCategoryMetric(
                    'Quizzes', category.quizzesAttempted.toString()),
                _buildCategoryMetric('Avg Score',
                    '${category.averageScore.toStringAsFixed(1)}%'),
                _buildCategoryMetric(
                    'Questions', category.totalQuestions.toString()),
                _buildCategoryMetric(
                    'Avg Time', category.averageTimePerQuestion),
              ],
            ),
            const SizedBox(height: 8),
            LinearProgressIndicator(
              value: category.accuracy / 100,
              backgroundColor: Colors.grey.shade200,
              color: _getCategoryColor(category.accuracy),
            ),
          ],
        ),
      ),
    ).animate().fadeIn().slideX(begin: 0.2);
  }

  Widget _buildCategoryMetric(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          value,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
        ),
        Text(
          label,
          style: TextStyle(fontSize: 10, color: Colors.grey.shade600),
        ),
      ],
    );
  }
}
