// lib/screens/home/dashboard_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/routes.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/gamification_provider.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final theme = Theme.of(context);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            // Refresh user data
            await ref.read(authProvider.notifier).refreshUser();
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                _buildHeader(
                  context,
                  user?.name ?? 'Student',
                  user?.picture,
                ).animate().fadeIn().slideX(begin: -0.1),

                const SizedBox(height: 20),

                // Gamification Stats Banner
                _buildGamificationBanner(context, ref)
                    .animate()
                    .fadeIn(delay: 100.ms)
                    .slideY(begin: 0.1),

                const SizedBox(height: 24),

                // Stats Cards
                _buildStatsGrid(
                  context,
                  user,
                ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.1),

                const SizedBox(height: 24),

                // Quick Actions
                Text(
                  'Quick Actions',
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ).animate().fadeIn(delay: 300.ms),

                const SizedBox(height: 12),

                _buildQuickActions(
                  context,
                ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.1),

                const SizedBox(height: 24),

                // Recent Activity
                Text(
                  'Recent Activity',
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ).animate().fadeIn(delay: 500.ms),

                const SizedBox(height: 12),

                _buildRecentActivity(
                  context,
                ).animate().fadeIn(delay: 600.ms).slideY(begin: 0.1),

                const SizedBox(height: 80), // Space for FAB
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, String name, String? picture) {
    return Row(
      children: [
        CircleAvatar(
          radius: 28,
          backgroundImage: picture != null ? NetworkImage(picture) : null,
          backgroundColor: AppTheme.primaryColor.withOpacity(0.2),
          child: picture == null
              ? Text(
                  name.isNotEmpty ? name[0].toUpperCase() : 'U',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryColor,
                  ),
                )
              : null,
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _getGreeting(),
                style: Theme.of(
                  context,
                ).textTheme.bodyMedium?.copyWith(color: Colors.grey),
              ),
              Text(
                name,
                style: Theme.of(
                  context,
                ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ),
        IconButton(
          icon: const Icon(Icons.notifications_outlined),
          onPressed: () {
            // TODO: Navigate to notifications
          },
        ),
      ],
    );
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning!';
    if (hour < 17) return 'Good Afternoon!';
    return 'Good Evening!';
  }

  Widget _buildStatsGrid(BuildContext context, user) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: [
        _StatCard(
          icon: Icons.emoji_events,
          iconColor: AppTheme.warningColor,
          title: 'Points',
          value: '${user?.points ?? 0}',
          gradient: AppTheme.accentGradient,
        ),
        _StatCard(
          icon: Icons.trending_up,
          iconColor: AppTheme.successColor,
          title: 'Level',
          value: '${user?.level ?? 1}',
          gradient: AppTheme.successGradient,
        ),
        _StatCard(
          icon: Icons.quiz,
          iconColor: AppTheme.primaryColor,
          title: 'Quizzes Taken',
          value: '${user?.quizzesTaken ?? 0}',
          gradient: AppTheme.primaryGradient,
        ),
        _StatCard(
          icon: Icons.leaderboard,
          iconColor: AppTheme.accentColor,
          title: 'Global Rank',
          value: '#${user?.rank ?? '--'}',
          gradient: AppTheme.secondaryGradient,
        ),
      ],
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return GridView.count(
      crossAxisCount: 3,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 0.9,
      children: [
        _ActionCard(
          icon: Icons.psychology,
          title: 'AI Study Buddy',
          color: AppTheme.primaryColor,
          onTap: () => context.push(AppRoutes.studyBuddy),
        ),
        _ActionCard(
          icon: Icons.emoji_events,
          title: 'Achievements',
          color: AppTheme.warningColor,
          onTap: () => context.push(AppRoutes.achievements),
        ),
        _ActionCard(
          icon: Icons.map,
          title: 'Quests',
          color: Colors.purple,
          onTap: () => context.push(AppRoutes.quests),
        ),
        _ActionCard(
          icon: Icons.flag,
          title: 'Study Goals',
          color: AppTheme.successColor,
          onTap: () => context.push(AppRoutes.studyGoals),
        ),
        _ActionCard(
          icon: Icons.bar_chart,
          title: 'Statistics',
          color: Colors.blue,
          onTap: () => context.push(AppRoutes.stats),
        ),
        _ActionCard(
          icon: Icons.play_arrow,
          title: 'Take Quiz',
          color: AppTheme.primaryColor,
          onTap: () => context.go(AppRoutes.quizList),
        ),
        _ActionCard(
          icon: Icons.live_tv,
          title: 'Join Live',
          color: AppTheme.successColor,
          onTap: () => context.push(AppRoutes.liveJoin),
        ),
        _ActionCard(
          icon: Icons.sports_esports,
          title: 'Duel Mode',
          color: AppTheme.accentColor,
          onTap: () => context.push(AppRoutes.duelMode),
        ),
        _ActionCard(
          icon: Icons.psychology_outlined,
          title: 'AI Tutor',
          color: AppTheme.secondaryColor,
          onTap: () => context.push(AppRoutes.aiTutor),
        ),
      ],
    );
  }

  Widget _buildGamificationBanner(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(userStatsProvider);

    return statsAsync.when(
      data: (stats) => Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              AppTheme.primaryColor,
              AppTheme.primaryColor.withOpacity(0.7),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: AppTheme.primaryColor.withOpacity(0.3),
              blurRadius: 15,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildBannerStat(Icons.stars, 'Points', '${stats.totalPoints}'),
                _buildBannerStat(
                  Icons.trending_up,
                  'Level',
                  '${stats.level}',
                ),
                _buildBannerStat(
                  Icons.emoji_events,
                  'Achievements',
                  '${stats.achievementsUnlocked}',
                ),
              ],
            ),
            if (stats.streak > 0) ...[
              const SizedBox(height: 16),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.local_fire_department,
                      color: Colors.white,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${stats.streak}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Text(
                      'day streak',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
      loading: () => const SizedBox(
        height: 120,
        child: Center(child: CircularProgressIndicator(color: Colors.white)),
      ),
      error: (_, __) => const SizedBox.shrink(),
    );
  }

  Widget _buildBannerStat(IconData icon, String label, String value) {
    return Column(
      children: [
        Icon(icon, color: Colors.white, size: 28),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: const TextStyle(color: Colors.white70, fontSize: 10),
        ),
      ],
    );
  }

  Widget _buildRecentActivity(BuildContext context) {
    // TODO: Replace with actual data
    return Card(
      child: Column(
        children: [
          _ActivityItem(
            icon: Icons.check_circle,
            iconColor: AppTheme.successColor,
            title: 'Completed "Math Basics"',
            subtitle: 'Score: 85% • 2 hours ago',
          ),
          const Divider(height: 1),
          _ActivityItem(
            icon: Icons.star,
            iconColor: AppTheme.warningColor,
            title: 'Earned "Quick Learner" badge',
            subtitle: 'Achievement unlocked • Yesterday',
          ),
          const Divider(height: 1),
          _ActivityItem(
            icon: Icons.leaderboard,
            iconColor: AppTheme.primaryColor,
            title: 'Ranked #5 in Weekly Challenge',
            subtitle: '+200 points • 2 days ago',
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String value;
  final LinearGradient gradient;

  const _StatCard({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.value,
    required this.gradient,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: gradient,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: gradient.colors.first.withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: Colors.white, size: 24),
          const Spacer(),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            title,
            style: TextStyle(
              color: Colors.white.withOpacity(0.8),
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final Color color;
  final VoidCallback onTap;

  const _ActionCard({
    required this.icon,
    required this.title,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: 100,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color),
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                color: color,
                fontWeight: FontWeight.w500,
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _ActivityItem extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;

  const _ActivityItem({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: iconColor.withOpacity(0.1),
        child: Icon(icon, color: iconColor, size: 20),
      ),
      title: Text(title),
      subtitle: Text(
        subtitle,
        style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
      ),
    );
  }
}
