// lib/screens/live/live_quiz_play_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:confetti/confetti.dart';
import '../../config/theme.dart';
import '../../models/live_session.dart';
import '../../providers/live_session_provider.dart';
import 'live_quiz_results_screen.dart';

class LiveQuizPlayScreen extends ConsumerStatefulWidget {
  const LiveQuizPlayScreen({super.key});

  @override
  ConsumerState<LiveQuizPlayScreen> createState() => _LiveQuizPlayScreenState();
}

class _LiveQuizPlayScreenState extends ConsumerState<LiveQuizPlayScreen> {
  int? _selectedAnswerIndex;
  bool _hasSubmitted = false;
  late ConfettiController _confettiController;

  @override
  void initState() {
    super.initState();
    _confettiController =
        ConfettiController(duration: const Duration(seconds: 3));
  }

  @override
  void dispose() {
    _confettiController.dispose();
    super.dispose();
  }

  Future<void> _submitAnswer() async {
    if (_selectedAnswerIndex == null || _hasSubmitted) return;

    final session = ref.read(currentLiveSessionProvider);
    final question = ref.read(currentQuestionProvider);

    if (session == null || question == null) return;

    setState(() => _hasSubmitted = true);
    ref.read(isSubmittingAnswerProvider.notifier).set(true);

    try {
      await ref.read(currentLiveSessionProvider.notifier).submitAnswer(
            questionIndex: question.questionIndex,
            answerIndex: _selectedAnswerIndex!,
          );

      // Play confetti if correct (will be determined by server response)
      _confettiController.play();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to submit answer: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      ref.read(isSubmittingAnswerProvider.notifier).set(false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final session = ref.watch(currentLiveSessionProvider);
    final question = ref.watch(currentQuestionProvider);
    final timeLeft = ref.watch(questionTimerProvider);

    // Listen for session end
    ref.listen(currentLiveSessionProvider, (previous, next) {
      if (next?.status == LiveSessionStatus.ended && mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => const LiveQuizResultsScreen(),
          ),
        );
      }
    });

    // Start timer when new question arrives
    ref.listen(currentQuestionProvider, (previous, next) {
      if (next != null && next != previous) {
        setState(() {
          _selectedAnswerIndex = null;
          _hasSubmitted = false;
        });
        ref.read(questionTimerProvider.notifier).start(next.timeLimit);
      }
    });

    if (session == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Live Quiz')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (question == null) {
      return Scaffold(
        appBar: AppBar(
          title: Text(session.quizTitle),
          actions: [
            IconButton(
              icon: const Icon(Icons.exit_to_app),
              onPressed: () => _showLeaveDialog(),
            ),
          ],
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const CircularProgressIndicator(),
              const SizedBox(height: 24),
              const Text(
                'Waiting for next question...',
                style: TextStyle(fontSize: 18),
              ),
              const SizedBox(height: 8),
              Text(
                '${session.participants.length} participants',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
      );
    }

    final progress = (question.questionIndex + 1) / 10; // Assuming 10 questions

    return Scaffold(
      appBar: AppBar(
        title: Text(session.quizTitle),
        actions: [
          IconButton(
            icon: const Icon(Icons.people),
            onPressed: () => _showParticipants(),
          ),
          IconButton(
            icon: const Icon(Icons.leaderboard),
            onPressed: () => _showLeaderboard(),
          ),
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              // Progress Bar
              LinearProgressIndicator(
                value: progress,
                backgroundColor: Colors.grey[200],
                minHeight: 8,
              ),

              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Timer and Question Number
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryColor.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              'Question ${question.questionIndex + 1}',
                              style: const TextStyle(
                                color: AppTheme.primaryColor,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color:
                                  _getTimerColor(timeLeft, question.timeLimit),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.timer,
                                  size: 18,
                                  color: Colors.white,
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  '$timeLeft s',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          )
                              .animate(
                                onPlay: (controller) => controller.repeat(),
                              )
                              .shake(duration: 500.ms, delay: 1000.ms),
                        ],
                      ),

                      const SizedBox(height: 24),

                      // Question Card
                      Card(
                        elevation: 4,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            gradient: LinearGradient(
                              colors: [
                                AppTheme.primaryColor.withOpacity(0.1),
                                AppTheme.accentColor.withOpacity(0.05),
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                          ),
                          child: Text(
                            question.questionText,
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w600,
                              height: 1.4,
                            ),
                          ),
                        ),
                      ).animate().fadeIn().slideY(begin: 0.2),

                      const SizedBox(height: 24),

                      // Answer Options
                      ...List.generate(
                        question.options.length,
                        (index) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _buildAnswerOption(
                            index: index,
                            text: question.options[index],
                            isSelected: _selectedAnswerIndex == index,
                            hasSubmitted: _hasSubmitted,
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Submit Button
                      if (!_hasSubmitted)
                        ElevatedButton(
                          onPressed: _selectedAnswerIndex != null
                              ? _submitAnswer
                              : null,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primaryColor,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            'Submit Answer',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                        ).animate().fadeIn(delay: 500.ms).scale()
                      else
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.green.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.green),
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.check_circle, color: Colors.green),
                              SizedBox(width: 8),
                              Text(
                                'Answer Submitted!',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.green,
                                ),
                              ),
                            ],
                          ),
                        ).animate().fadeIn().scale(),

                      const SizedBox(height: 16),

                      // Participants Status
                      if (_hasSubmitted)
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Waiting for others...',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                LinearProgressIndicator(
                                  value: _getSubmissionProgress(session),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${_getSubmittedCount(session)} of ${session.participants.length} submitted',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ).animate().fadeIn(),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Confetti
          Align(
            alignment: Alignment.topCenter,
            child: ConfettiWidget(
              confettiController: _confettiController,
              blastDirectionality: BlastDirectionality.explosive,
              particleDrag: 0.05,
              emissionFrequency: 0.05,
              numberOfParticles: 50,
              gravity: 0.1,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnswerOption({
    required int index,
    required String text,
    required bool isSelected,
    required bool hasSubmitted,
  }) {
    final optionLabels = ['A', 'B', 'C', 'D'];
    final label =
        index < optionLabels.length ? optionLabels[index] : '${index + 1}';

    Color borderColor = isSelected ? AppTheme.primaryColor : Colors.grey[300]!;

    Color backgroundColor = isSelected
        ? AppTheme.primaryColor.withOpacity(0.1)
        : Colors.transparent;

    return InkWell(
      onTap: hasSubmitted
          ? null
          : () {
              setState(() => _selectedAnswerIndex = index);
            },
      borderRadius: BorderRadius.circular(12),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: borderColor,
            width: 2,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: isSelected ? AppTheme.primaryColor : Colors.grey[200],
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: isSelected ? Colors.white : Colors.grey[700],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                text,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                  color: isSelected ? AppTheme.primaryColor : Colors.black87,
                ),
              ),
            ),
            if (isSelected)
              const Icon(
                Icons.check_circle,
                color: AppTheme.primaryColor,
              ),
          ],
        ),
      ),
    ).animate().fadeIn(delay: (100 * index).ms).slideX(begin: 0.2);
  }

  Color _getTimerColor(int timeLeft, int totalTime) {
    final ratio = timeLeft / totalTime;

    if (ratio > 0.5) {
      return Colors.green;
    } else if (ratio > 0.25) {
      return Colors.orange;
    } else {
      return Colors.red;
    }
  }

  double _getSubmissionProgress(LiveSession session) {
    // Mock: In real app, track from server
    return 0.7;
  }

  int _getSubmittedCount(LiveSession session) {
    // Mock: In real app, get from server
    return (session.participants.length * 0.7).round();
  }

  void _showParticipants() {
    final session = ref.read(currentLiveSessionProvider);
    if (session == null) return;

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Participants (${session.participants.length})',
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ...session.participants.map((p) => ListTile(
                  leading: CircleAvatar(
                    backgroundColor: AppTheme.primaryColor,
                    child: Text(
                      p.username[0].toUpperCase(),
                      style: const TextStyle(color: Colors.white),
                    ),
                  ),
                  title: Text(p.username),
                  trailing: p.isHost
                      ? const Chip(
                          label: Text('HOST', style: TextStyle(fontSize: 10)),
                          backgroundColor: Colors.amber,
                        )
                      : null,
                )),
          ],
        ),
      ),
    );
  }

  void _showLeaderboard() {
    final leaderboard = ref.read(liveLeaderboardProvider);

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Live Leaderboard',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            if (leaderboard.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(20),
                  child: Text('No scores yet'),
                ),
              )
            else
              ...leaderboard.take(10).map((entry) => ListTile(
                    leading: CircleAvatar(
                      backgroundColor: _getRankColor(entry.rank),
                      child: Text(
                        '${entry.rank}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    title: Text(entry.username),
                    trailing: Text(
                      '${entry.score} pts',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  )),
          ],
        ),
      ),
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

  void _showLeaveDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Leave Session?'),
        content: const Text(
            'Are you sure you want to leave this live quiz session?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              await ref
                  .read(currentLiveSessionProvider.notifier)
                  .leaveSession();
              if (mounted) {
                Navigator.of(context).popUntil((route) => route.isFirst);
              }
            },
            child: const Text('Leave', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}
