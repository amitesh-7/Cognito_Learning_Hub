// lib/widgets/gamification/level_up_modal.dart

import 'package:flutter/material.dart';
import 'package:confetti/confetti.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';

class LevelUpModal extends StatefulWidget {
  final int newLevel;
  final int pointsEarned;
  final String? reward;
  final VoidCallback? onClose;

  const LevelUpModal({
    super.key,
    required this.newLevel,
    this.pointsEarned = 0,
    this.reward,
    this.onClose,
  });

  static Future<void> show(
    BuildContext context, {
    required int newLevel,
    int pointsEarned = 0,
    String? reward,
    VoidCallback? onClose,
  }) {
    return showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => LevelUpModal(
        newLevel: newLevel,
        pointsEarned: pointsEarned,
        reward: reward,
        onClose: onClose,
      ),
    );
  }

  @override
  State<LevelUpModal> createState() => _LevelUpModalState();
}

class _LevelUpModalState extends State<LevelUpModal>
    with SingleTickerProviderStateMixin {
  late ConfettiController _confettiController;
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    _confettiController =
        ConfettiController(duration: const Duration(seconds: 3));
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    // Start animations
    Future.delayed(const Duration(milliseconds: 200), () {
      _confettiController.play();
      _animationController.forward();
    });
  }

  @override
  void dispose() {
    _confettiController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Confetti
          Align(
            alignment: Alignment.topCenter,
            child: ConfettiWidget(
              confettiController: _confettiController,
              blastDirectionality: BlastDirectionality.explosive,
              particleDrag: 0.05,
              emissionFrequency: 0.03,
              numberOfParticles: 30,
              gravity: 0.2,
              shouldLoop: false,
              colors: const [
                AppTheme.primaryColor,
                AppTheme.successColor,
                AppTheme.warningColor,
                Colors.purple,
              ],
            ),
          ),

          // Content Card
          Container(
            margin: const EdgeInsets.all(20),
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppTheme.primaryColor.withOpacity(0.9),
                  AppTheme.primaryColor.withOpacity(0.7),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primaryColor.withOpacity(0.5),
                  blurRadius: 30,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Trophy/Star Animation
                SizedBox(
                  width: 120,
                  height: 120,
                  child: const Icon(
                    Icons.emoji_events,
                    size: 80,
                    color: Colors.white,
                  ),
                )
                    .animate(
                      onComplete: (controller) => controller.repeat(),
                    )
                    .scale(
                      duration: 1000.ms,
                      begin: const Offset(0.8, 0.8),
                      end: const Offset(1.2, 1.2),
                    )
                    .then()
                    .scale(
                      duration: 1000.ms,
                      begin: const Offset(1.2, 1.2),
                      end: const Offset(0.8, 0.8),
                    ),

                const SizedBox(height: 24),

                // Level Up Text
                const Text(
                  'LEVEL UP!',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2,
                  ),
                ).animate().fadeIn().slideY(begin: -0.5),

                const SizedBox(height: 8),

                // New Level
                Text(
                  'Level ${widget.newLevel}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 48,
                    fontWeight: FontWeight.bold,
                  ),
                ).animate(delay: 200.ms).fadeIn().scale(),

                const SizedBox(height: 24),

                // Points Earned
                if (widget.pointsEarned > 0)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(30),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.stars,
                          color: Colors.white,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '+${widget.pointsEarned} Points',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ).animate(delay: 400.ms).fadeIn().slideY(begin: 0.3),

                if (widget.reward != null) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      children: [
                        const Text(
                          'Reward Unlocked',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          widget.reward!,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ).animate(delay: 600.ms).fadeIn().scale(),
                ],

                const SizedBox(height: 32),

                // Close Button
                ElevatedButton(
                  onPressed: () {
                    widget.onClose?.call();
                    Navigator.of(context).pop();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: AppTheme.primaryColor,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 48,
                      vertical: 16,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                  ),
                  child: const Text(
                    'Continue',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ).animate(delay: 800.ms).fadeIn().slideY(begin: 0.3),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
