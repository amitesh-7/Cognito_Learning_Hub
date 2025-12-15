// lib/screens/quiz/quiz_result_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:confetti/confetti.dart';
import '../../config/routes.dart';
import '../../config/theme.dart';
import '../../widgets/common/app_button.dart';

class QuizResultScreen extends ConsumerStatefulWidget {
  final int score;
  final int total;

  const QuizResultScreen({super.key, required this.score, required this.total});

  @override
  ConsumerState<QuizResultScreen> createState() => _QuizResultScreenState();
}

class _QuizResultScreenState extends ConsumerState<QuizResultScreen> {
  late ConfettiController _confettiController;

  double get _percentage =>
      widget.total > 0 ? (widget.score / widget.total * 100) : 0;

  bool get _isPassing => _percentage >= 70;

  String get _grade {
    if (_percentage >= 90) return 'A+';
    if (_percentage >= 80) return 'A';
    if (_percentage >= 70) return 'B';
    if (_percentage >= 60) return 'C';
    if (_percentage >= 50) return 'D';
    return 'F';
  }

  Color get _gradeColor {
    if (_percentage >= 80) return AppTheme.successColor;
    if (_percentage >= 60) return AppTheme.warningColor;
    return AppTheme.errorColor;
  }

  @override
  void initState() {
    super.initState();
    _confettiController = ConfettiController(
      duration: const Duration(seconds: 3),
    );

    if (_isPassing) {
      _confettiController.play();
    }
  }

  @override
  void dispose() {
    _confettiController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Confetti
          Align(
            alignment: Alignment.topCenter,
            child: ConfettiWidget(
              confettiController: _confettiController,
              blastDirectionality: BlastDirectionality.explosive,
              shouldLoop: false,
              colors: const [
                AppTheme.primaryColor,
                AppTheme.secondaryColor,
                AppTheme.accentColor,
                AppTheme.successColor,
                AppTheme.warningColor,
              ],
              numberOfParticles: 30,
            ),
          ),

          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  const SizedBox(height: 40),

                  // Result Icon
                  Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: _isPassing
                          ? AppTheme.successGradient
                          : const LinearGradient(
                              colors: [Color(0xFFEF4444), Color(0xFFDC2626)],
                            ),
                      boxShadow: [
                        BoxShadow(
                          color: _gradeColor.withOpacity(0.3),
                          blurRadius: 20,
                          spreadRadius: 5,
                        ),
                      ],
                    ),
                    child: Icon(
                      _isPassing
                          ? Icons.emoji_events
                          : Icons.sentiment_dissatisfied,
                      size: 60,
                      color: Colors.white,
                    ),
                  ).animate().scale(duration: 600.ms, curve: Curves.elasticOut),

                  const SizedBox(height: 32),

                  // Title
                  Text(
                    _isPassing ? 'Congratulations!' : 'Keep Practicing!',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: _gradeColor,
                    ),
                  ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.2),

                  const SizedBox(height: 8),

                  Text(
                    _isPassing
                        ? 'Great job on completing the quiz!'
                        : "Don't worry, practice makes perfect!",
                    style: TextStyle(color: Colors.grey.shade600, fontSize: 16),
                    textAlign: TextAlign.center,
                  ).animate().fadeIn(delay: 400.ms),

                  const SizedBox(height: 40),

                  // Score Card
                  Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              _gradeColor.withOpacity(0.1),
                              _gradeColor.withOpacity(0.05),
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: _gradeColor.withOpacity(0.2),
                          ),
                        ),
                        child: Column(
                          children: [
                            // Grade
                            Text(
                              _grade,
                              style: TextStyle(
                                fontSize: 80,
                                fontWeight: FontWeight.bold,
                                color: _gradeColor,
                              ),
                            ),

                            // Score
                            Text(
                              '${widget.score} / ${widget.total} points',
                              style: Theme.of(context).textTheme.titleLarge
                                  ?.copyWith(fontWeight: FontWeight.w600),
                            ),

                            const SizedBox(height: 8),

                            // Percentage
                            Text(
                              '${_percentage.toStringAsFixed(1)}%',
                              style: TextStyle(
                                fontSize: 18,
                                color: Colors.grey.shade600,
                              ),
                            ),
                          ],
                        ),
                      )
                      .animate()
                      .fadeIn(delay: 500.ms)
                      .scale(begin: const Offset(0.9, 0.9)),

                  const SizedBox(height: 24),

                  // Stats Row
                  Row(
                    children: [
                      Expanded(
                        child: _StatItem(
                          icon: Icons.check_circle,
                          iconColor: AppTheme.successColor,
                          label: 'Correct',
                          value: '${(widget.score / 10).round()}',
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _StatItem(
                          icon: Icons.timer,
                          iconColor: AppTheme.primaryColor,
                          label: 'Time',
                          value: '4:30',
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _StatItem(
                          icon: Icons.trending_up,
                          iconColor: AppTheme.accentColor,
                          label: 'XP Earned',
                          value: '+${widget.score}',
                        ),
                      ),
                    ],
                  ).animate().fadeIn(delay: 600.ms).slideY(begin: 0.2),

                  const SizedBox(height: 32),

                  // Achievement (if passing)
                  if (_isPassing) ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.warningColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: AppTheme.warningColor.withOpacity(0.2),
                        ),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.workspace_premium,
                            color: AppTheme.warningColor,
                            size: 32,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Achievement Unlocked!',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.warningColor,
                                  ),
                                ),
                                Text(
                                  _percentage >= 90
                                      ? 'Perfect Scholar'
                                      : 'Quiz Master',
                                  style: TextStyle(
                                    color: Colors.grey.shade600,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ).animate().fadeIn(delay: 700.ms).shake(delay: 800.ms),

                    const SizedBox(height: 32),
                  ],

                  // Action Buttons
                  GradientButton(
                    text: 'Back to Quizzes',
                    onPressed: () => context.go(AppRoutes.quizList),
                    icon: Icons.list,
                  ),

                  const SizedBox(height: 12),

                  AppButton(
                    text: 'Share Results',
                    onPressed: () {
                      // TODO: Share results
                    },
                    isOutlined: true,
                    icon: Icons.share,
                  ),

                  const SizedBox(height: 12),

                  TextButton(
                    onPressed: () => context.go(AppRoutes.home),
                    child: const Text('Go to Dashboard'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String label;
  final String value;

  const _StatItem({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: iconColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Icon(icon, color: iconColor),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: iconColor,
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
