// lib/screens/live/live_quiz_results_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:confetti/confetti.dart';
import '../../config/theme.dart';
import '../../providers/live_session_provider.dart';

class LiveQuizResultsScreen extends ConsumerStatefulWidget {
  const LiveQuizResultsScreen({super.key});

  @override
  ConsumerState<LiveQuizResultsScreen> createState() =>
      _LiveQuizResultsScreenState();
}

class _LiveQuizResultsScreenState extends ConsumerState<LiveQuizResultsScreen> {
  late ConfettiController _confettiController;

  @override
  void initState() {
    super.initState();
    _confettiController =
        ConfettiController(duration: const Duration(seconds: 5));
    _confettiController.play();
  }

  @override
  void dispose() {
    _confettiController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final session = ref.watch(currentLiveSessionProvider);
    final leaderboard = ref.watch(liveLeaderboardProvider);

    if (session == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Results')),
        body: const Center(child: Text('No session data available')),
      );
    }

    final userRank = _getUserRank(leaderboard);
    final topThree = leaderboard.take(3).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Quiz Complete!'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () {
            ref.read(currentLiveSessionProvider.notifier).leaveSession();
            Navigator.of(context).popUntil((route) => route.isFirst);
          },
        ),
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Quiz Title
                Text(
                  session.quizTitle,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ).animate().fadeIn().slideY(begin: -0.2),

                const SizedBox(height: 32),

                // Podium - Top 3
                if (topThree.isNotEmpty)
                  _buildPodium(topThree)
                      .animate()
                      .fadeIn(delay: 300.ms)
                      .scale(),

                const SizedBox(height: 32),

                // User's Result Card
                if (userRank != null)
                  Card(
                    elevation: 4,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        gradient: LinearGradient(
                          colors: [
                            AppTheme.primaryColor.withOpacity(0.8),
                            AppTheme.accentColor.withOpacity(0.6),
                          ],
                        ),
                      ),
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        children: [
                          const Text(
                            'Your Result',
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.white70,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: [
                              _buildStatItem(
                                'Rank',
                                '#$userRank',
                                Icons.emoji_events,
                              ),
                              _buildStatItem(
                                'Score',
                                '${leaderboard.firstWhere((e) => e.rank == userRank).score}',
                                Icons.stars,
                              ),
                              _buildStatItem(
                                'Correct',
                                '${leaderboard.firstWhere((e) => e.rank == userRank).correctAnswers}',
                                Icons.check_circle,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ).animate().fadeIn(delay: 500.ms).slideY(begin: 0.2),

                const SizedBox(height: 24),

                // Full Leaderboard
                const Text(
                  'Leaderboard',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ).animate().fadeIn(delay: 700.ms),

                const SizedBox(height: 16),

                ...leaderboard.map((entry) => Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: _getRankColor(entry.rank),
                          child: entry.rank <= 3
                              ? Icon(
                                  _getRankIcon(entry.rank),
                                  color: Colors.white,
                                )
                              : Text(
                                  '${entry.rank}',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ),
                        title: Text(
                          entry.username,
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                        subtitle: Text('${entry.correctAnswers} correct'),
                        trailing: Text(
                          '${entry.score} pts',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.primaryColor,
                          ),
                        ),
                      ),
                    )
                        .animate()
                        .fadeIn(delay: (800 + entry.rank * 50).ms)
                        .slideX(begin: 0.2)),

                const SizedBox(height: 24),

                // Action Buttons
                ElevatedButton.icon(
                  onPressed: () {
                    ref
                        .read(currentLiveSessionProvider.notifier)
                        .leaveSession();
                    Navigator.of(context).popUntil((route) => route.isFirst);
                  },
                  icon: const Icon(Icons.home),
                  label: const Text('Return to Home'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ).animate().fadeIn(delay: 1200.ms).scale(),

                const SizedBox(height: 12),

                OutlinedButton.icon(
                  onPressed: () {
                    // TODO: Share results
                  },
                  icon: const Icon(Icons.share),
                  label: const Text('Share Results'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ).animate().fadeIn(delay: 1300.ms),
              ],
            ),
          ),

          // Confetti
          Align(
            alignment: Alignment.topCenter,
            child: ConfettiWidget(
              confettiController: _confettiController,
              blastDirectionality: BlastDirectionality.explosive,
              particleDrag: 0.05,
              emissionFrequency: 0.05,
              numberOfParticles: 100,
              gravity: 0.1,
              colors: const [
                Colors.green,
                Colors.blue,
                Colors.pink,
                Colors.orange,
                Colors.purple,
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPodium(List<dynamic> topThree) {
    return SizedBox(
      height: 250,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // 2nd Place
          if (topThree.length > 1)
            Expanded(
              child: _buildPodiumPlace(
                rank: 2,
                entry: topThree[1],
                height: 150,
                color: Colors.grey[400]!,
              ),
            ),

          // 1st Place
          if (topThree.isNotEmpty)
            Expanded(
              child: _buildPodiumPlace(
                rank: 1,
                entry: topThree[0],
                height: 200,
                color: Colors.amber,
              ),
            ),

          // 3rd Place
          if (topThree.length > 2)
            Expanded(
              child: _buildPodiumPlace(
                rank: 3,
                entry: topThree[2],
                height: 120,
                color: Colors.brown[400]!,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildPodiumPlace({
    required int rank,
    required dynamic entry,
    required double height,
    required Color color,
  }) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        // Avatar
        CircleAvatar(
          radius: 30,
          backgroundColor: color,
          child: Icon(
            _getRankIcon(rank),
            color: Colors.white,
            size: 30,
          ),
        ),

        const SizedBox(height: 8),

        // Username
        Text(
          entry.username,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),

        // Score
        Text(
          '${entry.score} pts',
          style: TextStyle(
            fontSize: 10,
            color: Colors.grey[600],
          ),
        ),

        const SizedBox(height: 8),

        // Podium Block
        Container(
          height: height,
          decoration: BoxDecoration(
            color: color,
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(12),
            ),
          ),
          child: Center(
            child: Text(
              '$rank',
              style: const TextStyle(
                fontSize: 48,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.white, size: 32),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: Colors.white70,
          ),
        ),
      ],
    );
  }

  Color _getRankColor(int rank) {
    switch (rank) {
      case 1:
        return Colors.amber;
      case 2:
        return Colors.grey;
      case 3:
        return Colors.brown;
      default:
        return AppTheme.primaryColor;
    }
  }

  IconData _getRankIcon(int rank) {
    switch (rank) {
      case 1:
        return Icons.emoji_events;
      case 2:
        return Icons.workspace_premium;
      case 3:
        return Icons.military_tech;
      default:
        return Icons.star;
    }
  }

  int? _getUserRank(List<dynamic> leaderboard) {
    // TODO: Get current user ID and find their rank
    // For now, return mock data
    if (leaderboard.isEmpty) return null;
    return 5; // Mock rank
  }
}
