// lib/screens/profile/profile_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/routes.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/gamification_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);

    return Scaffold(
      body: user == null
          ? const Center(child: CircularProgressIndicator())
          : CustomScrollView(
              slivers: [
                // Profile Header
                SliverAppBar(
                  expandedHeight: 280,
                  pinned: true,
                  flexibleSpace: FlexibleSpaceBar(
                    background: _ProfileHeader(user: user),
                  ),
                  actions: [
                    IconButton(
                      icon: const Icon(Icons.settings),
                      onPressed: () => context.push(AppRoutes.settings),
                    ),
                  ],
                ),

                // Profile Content
                SliverPadding(
                  padding: const EdgeInsets.all(16),
                  sliver: SliverList(
                    delegate: SliverChildListDelegate([
                      // Stats Cards
                      _buildStatsSection(
                        context,
                        user,
                      ).animate().fadeIn().slideY(begin: 0.1),

                      const SizedBox(height: 24),

                      // Achievements Section
                      _buildSectionTitle(
                        context,
                        'Achievements',
                        Icons.emoji_events,
                      ),
                      const SizedBox(height: 12),
                      _buildAchievements(
                        context,
                        user,
                      ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.1),

                      const SizedBox(height: 24),

                      // Recent Activity
                      _buildSectionTitle(
                        context,
                        'Recent Quizzes',
                        Icons.history,
                      ),
                      const SizedBox(height: 12),
                      _buildRecentQuizzes(
                        context,
                      ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.1),

                      const SizedBox(height: 100), // Space for bottom nav
                    ]),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildSectionTitle(BuildContext context, String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, color: AppTheme.primaryColor, size: 20),
        const SizedBox(width: 8),
        Text(
          title,
          style: Theme.of(
            context,
          ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
        ),
        const Spacer(),
        TextButton(onPressed: () {}, child: const Text('View All')),
      ],
    );
  }

  Widget _buildStatsSection(BuildContext context, user) {
    return Consumer(
      builder: (context, ref, child) {
        final statsAsync = ref.watch(userStatsProvider);

        return statsAsync.when(
          data: (stats) => Row(
            children: [
              Expanded(
                child: _StatCard(
                  icon: Icons.quiz,
                  label: 'Quizzes',
                  value: '${stats.quizzesCompleted}',
                  color: AppTheme.primaryColor,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _StatCard(
                  icon: Icons.emoji_events,
                  label: 'Points',
                  value: '${stats.totalPoints}',
                  color: AppTheme.successColor,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _StatCard(
                  icon: Icons.local_fire_department,
                  label: 'Streak',
                  value: '${stats.streak}',
                  color: AppTheme.accentColor,
                ),
              ),
            ],
          ),
          loading: () => Row(
            children: [
              Expanded(
                child: _StatCard(
                  icon: Icons.quiz,
                  label: 'Quizzes',
                  value: '...',
                  color: AppTheme.primaryColor,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _StatCard(
                  icon: Icons.emoji_events,
                  label: 'Points',
                  value: '...',
                  color: AppTheme.successColor,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _StatCard(
                  icon: Icons.local_fire_department,
                  label: 'Streak',
                  value: '...',
                  color: AppTheme.accentColor,
                ),
              ),
            ],
          ),
          error: (error, stack) => Row(
            children: [
              Expanded(
                child: _StatCard(
                  icon: Icons.quiz,
                  label: 'Quizzes',
                  value: '0',
                  color: AppTheme.primaryColor,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _StatCard(
                  icon: Icons.emoji_events,
                  label: 'Points',
                  value: '0',
                  color: AppTheme.successColor,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _StatCard(
                  icon: Icons.local_fire_department,
                  label: 'Streak',
                  value: '0',
                  color: AppTheme.accentColor,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildAchievements(BuildContext context, user) {
    final badges = user.badges ?? [];

    if (badges.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.grey.shade100,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(
              Icons.emoji_events_outlined,
              size: 48,
              color: Colors.grey.shade400,
            ),
            const SizedBox(height: 8),
            Text(
              'No achievements yet',
              style: TextStyle(color: Colors.grey.shade600),
            ),
            const SizedBox(height: 4),
            Text(
              'Complete quizzes to earn badges!',
              style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
            ),
          ],
        ),
      );
    }

    return SizedBox(
      height: 100,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: badges.length,
        itemBuilder: (context, index) {
          return Container(
            width: 80,
            margin: const EdgeInsets.only(right: 12),
            child: Column(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    gradient: AppTheme.accentGradient,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.workspace_premium,
                    color: Colors.white,
                    size: 28,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  badges[index].toString(),
                  style: const TextStyle(fontSize: 12),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildRecentQuizzes(BuildContext context) {
    // TODO: Replace with actual recent quizzes
    return Card(
      child: Column(
        children: List.generate(
          3,
          (index) => ListTile(
            leading: Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppTheme.primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.quiz, color: AppTheme.primaryColor),
            ),
            title: Text('Sample Quiz ${index + 1}'),
            subtitle: Text('Score: ${85 - index * 5}% • ${index + 1} days ago'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {
              // Navigate to quiz detail
            },
          ),
        ),
      ),
    );
  }
}

class _ProfileHeader extends ConsumerWidget {
  final dynamic user;

  const _ProfileHeader({required this.user});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(userStatsProvider);

    return Container(
      decoration: const BoxDecoration(gradient: AppTheme.primaryGradient),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              // Avatar
              Stack(
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundColor: Colors.white.withOpacity(0.2),
                    child: user.picture != null && user.picture!.isNotEmpty
                        ? ClipOval(
                            child: Image.network(
                              user.picture!,
                              width: 100,
                              height: 100,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) {
                                return Text(
                                  (user.name ?? 'U')[0].toUpperCase(),
                                  style: const TextStyle(
                                    fontSize: 36,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                );
                              },
                            ),
                          )
                        : Text(
                            (user.name ?? 'U')[0].toUpperCase(),
                            style: const TextStyle(
                              fontSize: 36,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: AppTheme.successColor,
                        shape: BoxShape.circle,
                      ),
                      child: statsAsync.when(
                        data: (stats) => Text(
                          '${stats.level}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        loading: () => const SizedBox(
                          width: 12,
                          height: 12,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor:
                                AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        ),
                        error: (_, __) => Text(
                          '${user.level ?? 1}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // Customize Avatar Button
              ElevatedButton.icon(
                onPressed: () => context.push(AppRoutes.avatarCustomize),
                icon: const Icon(Icons.edit, size: 16),
                label: const Text('Customize Avatar'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white.withOpacity(0.2),
                  foregroundColor: Colors.white,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                ),
              ),

              const SizedBox(height: 12),

              // Name
              Text(
                user.name ?? 'User',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),

              // Role Badge
              Container(
                margin: const EdgeInsets.only(top: 8),
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  user.role ?? 'Student',
                  style: const TextStyle(color: Colors.white, fontSize: 12),
                ),
              ),

              const SizedBox(height: 12),

              // Points & Rank
              statsAsync.when(
                data: (stats) => Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.emoji_events,
                        color: Colors.amber, size: 20),
                    const SizedBox(width: 4),
                    Text(
                      '${stats.totalPoints} points',
                      style: const TextStyle(color: Colors.white),
                    ),
                    const SizedBox(width: 16),
                    const Icon(
                      Icons.leaderboard,
                      color: Colors.white70,
                      size: 20,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Rank #${user.rank ?? '--'}',
                      style: const TextStyle(color: Colors.white),
                    ),
                  ],
                ),
                loading: () => Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.emoji_events,
                        color: Colors.amber, size: 20),
                    const SizedBox(width: 4),
                    const Text(
                      '... points',
                      style: TextStyle(color: Colors.white),
                    ),
                  ],
                ),
                error: (_, __) => Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.emoji_events,
                        color: Colors.amber, size: 20),
                    const SizedBox(width: 4),
                    Text(
                      '${user.points ?? 0} points',
                      style: const TextStyle(color: Colors.white),
                    ),
                    const SizedBox(width: 16),
                    const Icon(
                      Icons.leaderboard,
                      color: Colors.white70,
                      size: 20,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Rank #${user.rank ?? '--'}',
                      style: const TextStyle(color: Colors.white),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            label,
            style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
          ),
        ],
      ),
    );
  }
}
