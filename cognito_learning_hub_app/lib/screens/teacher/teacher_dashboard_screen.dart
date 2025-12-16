// lib/screens/teacher/teacher_dashboard_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../providers/teacher_provider.dart';
import '../../config/theme.dart';
import '../../config/routes.dart';

class TeacherDashboardScreen extends ConsumerWidget {
  const TeacherDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(teacherStatsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Teacher Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              // Navigate to quiz list
              context.push(AppRoutes.quizList);
            },
            tooltip: 'View Quizzes',
          ),
        ],
      ),
      body: statsAsync.when(
        data: (stats) => _buildDashboard(context, ref, stats),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text('Error: $error'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.refresh(teacherStatsProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDashboard(BuildContext context, WidgetRef ref, dynamic stats) {
    return RefreshIndicator(
      onRefresh: () async {
        ref.invalidate(teacherStatsProvider);
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Overview Cards
            _buildOverviewCards(context, stats),

            const SizedBox(height: 24),

            // Quick Actions
            _buildQuickActions(context),

            const SizedBox(height: 24),

            // Subject Performance
            Text(
              'Subject Performance',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            _buildSubjectPerformance(context, stats.subjectPerformance),

            const SizedBox(height: 24),

            // Recent Activities
            Text(
              'Recent Activities',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            _buildRecentActivities(context, stats.recentActivities),
          ],
        ),
      ),
    );
  }

  Widget _buildOverviewCards(BuildContext context, dynamic stats) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      childAspectRatio: 1.5,
      children: [
        _buildStatCard(
          context,
          'Total Students',
          stats.totalStudents.toString(),
          Icons.people,
          AppTheme.primaryColor,
        ).animate().fadeIn(delay: 0.ms).scale(),
        _buildStatCard(
          context,
          'Total Quizzes',
          stats.totalQuizzes.toString(),
          Icons.quiz,
          Colors.orange,
        ).animate().fadeIn(delay: 100.ms).scale(),
        _buildStatCard(
          context,
          'Active Students',
          stats.activeStudents.toString(),
          Icons.trending_up,
          Colors.green,
        ).animate().fadeIn(delay: 200.ms).scale(),
        _buildStatCard(
          context,
          'Average Score',
          '${stats.averageScore.toStringAsFixed(1)}%',
          Icons.assessment,
          Colors.purple,
        ).animate().fadeIn(delay: 300.ms).scale(),
      ],
    );
  }

  Widget _buildStatCard(
    BuildContext context,
    String title,
    String value,
    IconData icon,
    Color color,
  ) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey.shade600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Icon(icon, color: color, size: 24),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Quick Actions',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                _buildActionChip(
                  context,
                  'View Students',
                  Icons.people,
                  AppTheme.primaryColor,
                  () => context.push('/teacher/students'),
                ),
                _buildActionChip(
                  context,
                  'My Quizzes',
                  Icons.quiz,
                  Colors.orange,
                  () => context.push('/teacher/quizzes'),
                ),
                _buildActionChip(
                  context,
                  'Analytics',
                  Icons.analytics,
                  Colors.green,
                  () => context.push('/teacher/analytics'),
                ),
                _buildActionChip(
                  context,
                  'Create Quiz',
                  Icons.add_circle,
                  Colors.purple,
                  () => context.push(AppRoutes.quizList),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionChip(
    BuildContext context,
    String label,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 20, color: color),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubjectPerformance(
      BuildContext context, List<dynamic> subjects) {
    if (subjects.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Center(
            child: Text(
              'No subject data available',
              style: TextStyle(color: Colors.grey.shade600),
            ),
          ),
        ),
      );
    }

    return Column(
      children: subjects
          .map((subject) => Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor:
                        AppTheme.primaryColor.withValues(alpha: 0.2),
                    child: Text(
                      subject.subject[0].toUpperCase(),
                      style: const TextStyle(
                        color: AppTheme.primaryColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  title: Text(
                    subject.subject,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle: Text(
                    '${subject.totalQuizzes} quizzes • ${subject.totalStudents} students',
                  ),
                  trailing: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: _getScoreColor(subject.averageScore)
                          .withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${subject.averageScore.toStringAsFixed(1)}%',
                      style: TextStyle(
                        color: _getScoreColor(subject.averageScore),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ).animate().fadeIn().slideX())
          .toList(),
    );
  }

  Widget _buildRecentActivities(
      BuildContext context, List<dynamic> activities) {
    if (activities.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Center(
            child: Text(
              'No recent activities',
              style: TextStyle(color: Colors.grey.shade600),
            ),
          ),
        ),
      );
    }

    return Column(
      children: activities.take(5).map((activity) {
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            leading: _getActivityIcon(activity.type),
            title: Text(activity.description),
            subtitle: Text(_formatTimeAgo(activity.timestamp)),
            dense: true,
          ),
        ).animate().fadeIn().slideX();
      }).toList(),
    );
  }

  Widget _getActivityIcon(String type) {
    IconData icon;
    Color color;

    switch (type) {
      case 'quiz_created':
        icon = Icons.add_circle;
        color = Colors.green;
        break;
      case 'quiz_completed':
        icon = Icons.check_circle;
        color = Colors.blue;
        break;
      case 'student_joined':
        icon = Icons.person_add;
        color = Colors.purple;
        break;
      default:
        icon = Icons.info;
        color = Colors.grey;
    }

    return CircleAvatar(
      backgroundColor: color.withValues(alpha: 0.2),
      child: Icon(icon, color: color, size: 20),
    );
  }

  Color _getScoreColor(double score) {
    if (score >= 80) return Colors.green;
    if (score >= 60) return Colors.orange;
    return Colors.red;
  }

  String _formatTimeAgo(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inMinutes < 1) return 'Just now';
    if (difference.inMinutes < 60) return '${difference.inMinutes}m ago';
    if (difference.inHours < 24) return '${difference.inHours}h ago';
    if (difference.inDays < 7) return '${difference.inDays}d ago';
    return '${(difference.inDays / 7).floor()}w ago';
  }
}
