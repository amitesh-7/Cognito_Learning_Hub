// lib/widgets/gamification/streak_indicator.dart

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';

class StreakIndicator extends StatelessWidget {
  final int currentStreak;
  final int longestStreak;
  final bool animated;
  final bool compact;

  const StreakIndicator({
    super.key,
    required this.currentStreak,
    this.longestStreak = 0,
    this.animated = true,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    if (compact) {
      return _buildCompactView(context);
    }
    return _buildFullView(context);
  }

  Widget _buildFullView(BuildContext context) {
    Widget streakWidget = Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            _getStreakColor(currentStreak),
            _getStreakColor(currentStreak).withOpacity(0.7),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: _getStreakColor(currentStreak).withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          // Fire Icon
          Icon(
            Icons.local_fire_department,
            size: 48,
            color: Colors.white,
          ),
          const SizedBox(height: 12),

          // Current Streak
          Text(
            '$currentStreak',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 48,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            'Day${currentStreak != 1 ? 's' : ''} Streak',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
            ),
          ),

          if (longestStreak > 0) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.emoji_events,
                    size: 16,
                    color: Colors.white,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Best: $longestStreak days',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],

          // Streak Milestones
          const SizedBox(height: 16),
          _buildStreakMilestones(),
        ],
      ),
    );

    if (animated) {
      return streakWidget
          .animate()
          .fadeIn()
          .scale(delay: 100.ms)
          .shake(hz: 2, curve: Curves.easeInOutCubic);
    }
    return streakWidget;
  }

  Widget _buildCompactView(BuildContext context) {
    Widget streakWidget = Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            _getStreakColor(currentStreak),
            _getStreakColor(currentStreak).withOpacity(0.7),
          ],
        ),
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
            '$currentStreak',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(width: 4),
          const Text(
            'days',
            style: TextStyle(
              color: Colors.white,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );

    if (animated) {
      return streakWidget.animate().fadeIn().scale();
    }
    return streakWidget;
  }

  Widget _buildStreakMilestones() {
    final milestones = [7, 14, 30, 50, 100];

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: milestones.map((milestone) {
        final reached = currentStreak >= milestone;
        return Column(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: reached ? Colors.white : Colors.white.withOpacity(0.3),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  '$milestone',
                  style: TextStyle(
                    color:
                        reached ? _getStreakColor(currentStreak) : Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 4),
            Icon(
              reached ? Icons.check_circle : Icons.circle_outlined,
              color: Colors.white,
              size: 16,
            ),
          ],
        );
      }).toList(),
    );
  }

  Color _getStreakColor(int streak) {
    if (streak >= 30) return Colors.deepPurple;
    if (streak >= 14) return Colors.deepOrange;
    if (streak >= 7) return AppTheme.errorColor;
    return AppTheme.warningColor;
  }
}

// Animated streak celebration
class StreakCelebration extends StatefulWidget {
  final int streak;
  final VoidCallback? onComplete;

  const StreakCelebration({
    super.key,
    required this.streak,
    this.onComplete,
  });

  static Future<void> show(
    BuildContext context, {
    required int streak,
    VoidCallback? onComplete,
  }) {
    return showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => StreakCelebration(
        streak: streak,
        onComplete: () {
          onComplete?.call();
          Navigator.of(context).pop();
        },
      ),
    );
  }

  @override
  State<StreakCelebration> createState() => _StreakCelebrationState();
}

class _StreakCelebrationState extends State<StreakCelebration> {
  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        widget.onComplete?.call();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              _getStreakColor(widget.streak).withOpacity(0.9),
              _getStreakColor(widget.streak).withOpacity(0.7),
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: _getStreakColor(widget.streak).withOpacity(0.5),
              blurRadius: 30,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.local_fire_department,
              size: 100,
              color: Colors.white,
            )
                .animate(onPlay: (controller) => controller.repeat())
                .scale(
                  duration: 1000.ms,
                  begin: const Offset(1, 1),
                  end: const Offset(1.2, 1.2),
                )
                .then()
                .scale(
                  duration: 1000.ms,
                  begin: const Offset(1.2, 1.2),
                  end: const Offset(1, 1),
                ),
            const SizedBox(height: 24),
            Text(
              '${widget.streak} DAYS!',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 48,
                fontWeight: FontWeight.bold,
              ),
            ).animate().fadeIn().slideY(begin: -0.5),
            const SizedBox(height: 8),
            const Text(
              'STREAK MILESTONE!',
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
                letterSpacing: 2,
              ),
            ).animate(delay: 200.ms).fadeIn(),
            const SizedBox(height: 24),
            Text(
              _getStreakMessage(widget.streak),
              style: TextStyle(
                color: Colors.white.withOpacity(0.9),
                fontSize: 16,
              ),
              textAlign: TextAlign.center,
            ).animate(delay: 400.ms).fadeIn(),
          ],
        ),
      ),
    );
  }

  Color _getStreakColor(int streak) {
    if (streak >= 30) return Colors.deepPurple;
    if (streak >= 14) return Colors.deepOrange;
    if (streak >= 7) return AppTheme.errorColor;
    return AppTheme.warningColor;
  }

  String _getStreakMessage(int streak) {
    if (streak >= 100) return 'Legendary dedication! You\'re unstoppable! 🔥';
    if (streak >= 50) return 'Incredible commitment! Keep it burning! 🔥';
    if (streak >= 30) return 'Amazing consistency! You\'re on fire! 🔥';
    if (streak >= 14) return 'Two weeks strong! Keep it up! 🔥';
    if (streak >= 7) return 'One week streak! You\'re doing great! 🔥';
    return 'Great start! Keep the streak alive! 🔥';
  }
}
