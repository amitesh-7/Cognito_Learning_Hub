// lib/screens/leaderboard/leaderboard_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';

class LeaderboardScreen extends ConsumerStatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  ConsumerState<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends ConsumerState<LeaderboardScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

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
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) {
          return [
            SliverAppBar(
              expandedHeight: 200,
              pinned: true,
              flexibleSpace: FlexibleSpaceBar(
                background: _buildTopThree(context),
              ),
              bottom: TabBar(
                controller: _tabController,
                tabs: const [
                  Tab(text: 'Weekly'),
                  Tab(text: 'Monthly'),
                  Tab(text: 'All Time'),
                ],
              ),
            ),
          ];
        },
        body: TabBarView(
          controller: _tabController,
          children: [
            _buildLeaderboardList('weekly'),
            _buildLeaderboardList('monthly'),
            _buildLeaderboardList('allTime'),
          ],
        ),
      ),
    );
  }

  Widget _buildTopThree(BuildContext context) {
    // TODO: Replace with actual top 3 users
    return Container(
      decoration: const BoxDecoration(gradient: AppTheme.primaryGradient),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              // 2nd Place
              _TopRankItem(
                rank: 2,
                name: 'Jane Doe',
                points: 2500,
                height: 100,
              ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.3),

              // 1st Place
              _TopRankItem(
                rank: 1,
                name: 'John Smith',
                points: 3200,
                height: 130,
                isFirst: true,
              ).animate().fadeIn(delay: 100.ms).slideY(begin: 0.3),

              // 3rd Place
              _TopRankItem(
                rank: 3,
                name: 'Bob Wilson',
                points: 2100,
                height: 80,
              ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.3),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLeaderboardList(String period) {
    // TODO: Replace with actual leaderboard data from API
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: 20,
      itemBuilder: (context, index) {
        final rank = index + 4; // Start from 4th place
        return _LeaderboardItem(
          rank: rank,
          name: 'User $rank',
          points: 2000 - (index * 80),
          isCurrentUser: index == 5,
        )
            .animate()
            .fadeIn(delay: Duration(milliseconds: index * 50))
            .slideX(begin: 0.1);
      },
    );
  }
}

class _TopRankItem extends StatelessWidget {
  final int rank;
  final String name;
  final int points;
  final double height;
  final bool isFirst;

  const _TopRankItem({
    required this.rank,
    required this.name,
    required this.points,
    required this.height,
    this.isFirst = false,
  });

  Color get _rankColor {
    switch (rank) {
      case 1:
        return const Color(0xFFFFD700); // Gold
      case 2:
        return const Color(0xFFC0C0C0); // Silver
      case 3:
        return const Color(0xFFCD7F32); // Bronze
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (isFirst) ...[
          const Icon(Icons.workspace_premium, color: Colors.amber, size: 24),
          const SizedBox(height: 4),
        ],
        Stack(
          alignment: Alignment.bottomCenter,
          children: [
            CircleAvatar(
              radius: isFirst ? 40 : 32,
              backgroundColor: _rankColor.withOpacity(0.3),
              child: CircleAvatar(
                radius: isFirst ? 36 : 28,
                backgroundColor: Colors.white.withOpacity(0.2),
                child: Text(
                  name[0].toUpperCase(),
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: isFirst ? 24 : 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            Transform.translate(
              offset: const Offset(0, 12),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: _rankColor,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '#$rank',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Text(
          name,
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
            fontSize: isFirst ? 14 : 12,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        Text(
          '$points pts',
          style: TextStyle(
            color: Colors.white.withOpacity(0.8),
            fontSize: isFirst ? 12 : 10,
          ),
        ),
      ],
    );
  }
}

class _LeaderboardItem extends StatelessWidget {
  final int rank;
  final String name;
  final int points;
  final bool isCurrentUser;

  const _LeaderboardItem({
    required this.rank,
    required this.name,
    required this.points,
    this.isCurrentUser = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: isCurrentUser
            ? AppTheme.primaryColor.withOpacity(0.1)
            : Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        border: isCurrentUser
            ? Border.all(color: AppTheme.primaryColor, width: 2)
            : null,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Rank
          SizedBox(
            width: 40,
            child: Text(
              '#$rank',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: isCurrentUser ? AppTheme.primaryColor : Colors.grey,
              ),
            ),
          ),

          // Avatar
          CircleAvatar(
            radius: 20,
            backgroundColor: AppTheme.primaryColor.withOpacity(0.2),
            child: Text(
              name[0].toUpperCase(),
              style: TextStyle(
                color: isCurrentUser
                    ? AppTheme.primaryColor
                    : Colors.grey.shade700,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 12),

          // Name
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      name,
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: isCurrentUser ? AppTheme.primaryColor : null,
                      ),
                    ),
                    if (isCurrentUser) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Text(
                          'You',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                Text(
                  'Level ${(points / 500).floor() + 1}',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
              ],
            ),
          ),

          // Points
          Row(
            children: [
              const Icon(
                Icons.emoji_events,
                size: 16,
                color: AppTheme.warningColor,
              ),
              const SizedBox(width: 4),
              Text(
                '$points',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: isCurrentUser
                      ? AppTheme.primaryColor
                      : AppTheme.warningColor,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
