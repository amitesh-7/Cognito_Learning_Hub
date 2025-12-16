// lib/screens/duel/duel_result_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:confetti/confetti.dart';
import '../../providers/duel_provider.dart';
import '../../providers/auth_provider.dart';

class DuelResultScreen extends ConsumerStatefulWidget {
  final String duelId;

  const DuelResultScreen({super.key, required this.duelId});

  @override
  ConsumerState<DuelResultScreen> createState() => _DuelResultScreenState();
}

class _DuelResultScreenState extends ConsumerState<DuelResultScreen> {
  late ConfettiController _confettiController;

  @override
  void initState() {
    super.initState();
    _confettiController =
        ConfettiController(duration: const Duration(seconds: 5));
    Future.delayed(const Duration(milliseconds: 500), () {
      _confettiController.play();
    });
  }

  @override
  void dispose() {
    _confettiController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final duel = ref.watch(currentDuelProvider);
    final duelResult = ref.watch(duelResultProvider);
    final currentUser = ref.watch(authProvider).user;

    if (currentUser == null || duel == null) {
      return const Scaffold(
        backgroundColor: Color(0xFF0A0E21),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final didWin = duelResult?.didUserWin(currentUser.id) ?? false;
    final isTie = duelResult?.isTie() ?? false;
    final myScore = duel.getCurrentUserScore(currentUser.id);
    final opponentScore = duel.getOpponentScore(currentUser.id);
    final opponentName = duel.getOpponentName(currentUser.id);

    return Scaffold(
      backgroundColor: const Color(0xFF0A0E21),
      body: SafeArea(
        child: Stack(
          children: [
            SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 40),

                  // Result Header
                  _buildResultHeader(didWin, isTie),

                  const SizedBox(height: 40),

                  // Score Comparison
                  _buildScoreComparison(myScore, opponentScore, opponentName),

                  const SizedBox(height: 40),

                  // Statistics
                  _buildStatistics(duel, currentUser.id),

                  const SizedBox(height: 40),

                  // Action Buttons
                  _buildActionButtons(),

                  const SizedBox(height: 24),
                ],
              ),
            ),

            // Confetti for winners
            if (didWin)
              Align(
                alignment: Alignment.topCenter,
                child: ConfettiWidget(
                  confettiController: _confettiController,
                  blastDirectionality: BlastDirectionality.explosive,
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
      ),
    );
  }

  Widget _buildResultHeader(bool didWin, bool isTie) {
    String title;
    String subtitle;
    IconData icon;
    Color color;

    if (isTie) {
      title = 'It\'s a Tie!';
      subtitle = 'Well matched!';
      icon = Icons.handshake;
      color = Colors.orange;
    } else if (didWin) {
      title = 'Victory!';
      subtitle = 'You won the duel!';
      icon = Icons.emoji_events;
      color = const Color(0xFFFFD700); // Gold
    } else {
      title = 'Defeat';
      subtitle = 'Better luck next time!';
      icon = Icons.sentiment_dissatisfied;
      color = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            color.withOpacity(0.3),
            color.withOpacity(0.1),
          ],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          Icon(
            icon,
            size: 80,
            color: color,
          )
              .animate()
              .scale(delay: 200.ms, duration: 600.ms)
              .shake(delay: 800.ms, hz: 2),
          const SizedBox(height: 24),
          Text(
            title,
            style: TextStyle(
              fontSize: 36,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ).animate().fadeIn(delay: 400.ms, duration: 600.ms),
          const SizedBox(height: 8),
          Text(
            subtitle,
            style: TextStyle(
              fontSize: 18,
              color: Colors.white.withOpacity(0.8),
            ),
          ).animate().fadeIn(delay: 600.ms, duration: 600.ms),
        ],
      ),
    );
  }

  Widget _buildScoreComparison(
      int myScore, int opponentScore, String opponentName) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          // User Score
          Expanded(
            child: Column(
              children: [
                Text(
                  'You',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.white.withOpacity(0.7),
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: myScore > opponentScore
                        ? const Color(0xFF6C63FF).withOpacity(0.3)
                        : Colors.white.withOpacity(0.05),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: myScore > opponentScore
                          ? const Color(0xFF6C63FF)
                          : Colors.white.withOpacity(0.2),
                      width: 2,
                    ),
                  ),
                  child: Text(
                    myScore.toString(),
                    style: TextStyle(
                      fontSize: 36,
                      fontWeight: FontWeight.bold,
                      color: myScore > opponentScore
                          ? const Color(0xFF6C63FF)
                          : Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // VS Separator
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              'VS',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white.withOpacity(0.5),
              ),
            ),
          ),

          // Opponent Score
          Expanded(
            child: Column(
              children: [
                Text(
                  opponentName,
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.white.withOpacity(0.7),
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: opponentScore > myScore
                        ? Colors.red.withOpacity(0.3)
                        : Colors.white.withOpacity(0.05),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: opponentScore > myScore
                          ? Colors.red
                          : Colors.white.withOpacity(0.2),
                      width: 2,
                    ),
                  ),
                  child: Text(
                    opponentScore.toString(),
                    style: TextStyle(
                      fontSize: 36,
                      fontWeight: FontWeight.bold,
                      color:
                          opponentScore > myScore ? Colors.red : Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: 800.ms, duration: 600.ms);
  }

  Widget _buildStatistics(duel, String currentUserId) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Match Statistics',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white.withOpacity(0.9),
          ),
        ),
        const SizedBox(height: 16),
        _buildStatRow(
          icon: Icons.category,
          label: 'Category',
          value: duel.quizCategory,
        ),
        const SizedBox(height: 12),
        _buildStatRow(
          icon: Icons.signal_cellular_alt,
          label: 'Difficulty',
          value: duel.difficulty.toUpperCase(),
        ),
        const SizedBox(height: 12),
        _buildStatRow(
          icon: Icons.timer,
          label: 'Duration',
          value: _calculateDuration(duel),
        ),
      ],
    ).animate().fadeIn(delay: 1000.ms, duration: 600.ms);
  }

  Widget _buildStatRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(
            icon,
            color: const Color(0xFF6C63FF),
            size: 24,
          ),
          const SizedBox(width: 16),
          Text(
            label,
            style: TextStyle(
              fontSize: 16,
              color: Colors.white.withOpacity(0.7),
            ),
          ),
          const Spacer(),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons() {
    return Column(
      children: [
        ElevatedButton(
          onPressed: () {
            ref.read(currentDuelProvider.notifier).clearDuel();
            ref.read(duelResultProvider.notifier).clear();
            context.go('/duel/matchmaking');
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF6C63FF),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(15),
            ),
          ),
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.replay),
              SizedBox(width: 12),
              Text(
                'Play Again',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ).animate().fadeIn(delay: 1200.ms, duration: 600.ms),
        const SizedBox(height: 12),
        OutlinedButton(
          onPressed: () {
            ref.read(currentDuelProvider.notifier).clearDuel();
            ref.read(duelResultProvider.notifier).clear();
            context.go('/home');
          },
          style: OutlinedButton.styleFrom(
            foregroundColor: Colors.white,
            side: BorderSide(color: Colors.white.withOpacity(0.5), width: 2),
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(15),
            ),
          ),
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.home),
              SizedBox(width: 12),
              Text(
                'Return Home',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ).animate().fadeIn(delay: 1400.ms, duration: 600.ms),
      ],
    );
  }

  String _calculateDuration(duel) {
    if (duel.startedAt == null || duel.endedAt == null) {
      return 'N/A';
    }
    final duration = duel.endedAt!.difference(duel.startedAt!);
    return '${duration.inMinutes}m ${duration.inSeconds % 60}s';
  }
}
