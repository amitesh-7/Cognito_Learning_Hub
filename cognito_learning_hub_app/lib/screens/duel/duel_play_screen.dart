// lib/screens/duel/duel_play_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import 'package:confetti/confetti.dart';
import '../../providers/duel_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/duel.dart';

class DuelPlayScreen extends ConsumerStatefulWidget {
  final String duelId;

  const DuelPlayScreen({super.key, required this.duelId});

  @override
  ConsumerState<DuelPlayScreen> createState() => _DuelPlayScreenState();
}

class _DuelPlayScreenState extends ConsumerState<DuelPlayScreen> {
  int? _selectedAnswerIndex;
  bool _hasSubmitted = false;
  late ConfettiController _confettiController;

  @override
  void initState() {
    super.initState();
    _confettiController =
        ConfettiController(duration: const Duration(seconds: 3));
    _loadDuel();
  }

  Future<void> _loadDuel() async {
    await ref.read(currentDuelProvider.notifier).loadDuel(widget.duelId);
  }

  @override
  void dispose() {
    _confettiController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final duel = ref.watch(currentDuelProvider);
    final question = ref.watch(currentDuelQuestionProvider);
    final timeLeft = ref.watch(duelQuestionTimerProvider);
    final currentUser = ref.watch(authProvider).user;

    if (currentUser == null) return const SizedBox();

    // Listen for duel end
    ref.listen(duelResultProvider, (previous, next) {
      if (next != null && mounted) {
        Future.delayed(const Duration(seconds: 1), () {
          if (mounted) {
            context.pushReplacement('/duel/${widget.duelId}/result');
          }
        });
      }
    });

    // Listen for new questions
    ref.listen(currentDuelQuestionProvider, (previous, next) {
      if (next != null && next != previous) {
        setState(() {
          _selectedAnswerIndex = null;
          _hasSubmitted = false;
        });
        ref.read(duelQuestionTimerProvider.notifier).startTimer();
      }
    });

    if (duel == null || question == null) {
      return const Scaffold(
        backgroundColor: Color(0xFF0A0E21),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0A0E21),
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              children: [
                // Score Header
                _buildScoreHeader(duel, currentUser.id),

                // Timer
                _buildTimer(timeLeft),

                const SizedBox(height: 16),

                // Question
                _buildQuestion(question),

                const SizedBox(height: 24),

                // Answer Options
                Expanded(
                  child: _buildAnswerOptions(question),
                ),

                // Submit Button
                _buildSubmitButton(),

                const SizedBox(height: 16),
              ],
            ),

            // Confetti
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

  Widget _buildScoreHeader(DuelMatch duel, String currentUserId) {
    final myScore = duel.getCurrentUserScore(currentUserId);
    final opponentScore = duel.getOpponentScore(currentUserId);
    final opponentName = duel.getOpponentName(currentUserId);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            const Color(0xFF6C63FF).withOpacity(0.2),
            const Color(0xFF5A52D5).withOpacity(0.2),
          ],
        ),
      ),
      child: Row(
        children: [
          // Current User
          Expanded(
            child: _buildPlayerCard(
              name: 'You',
              score: myScore,
              isWinning: myScore > opponentScore,
              isCurrentUser: true,
            ),
          ),

          // VS
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Text(
              'VS',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),

          // Opponent
          Expanded(
            child: _buildPlayerCard(
              name: opponentName,
              score: opponentScore,
              isWinning: opponentScore > myScore,
              isCurrentUser: false,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlayerCard({
    required String name,
    required int score,
    required bool isWinning,
    required bool isCurrentUser,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isWinning
            ? const Color(0xFF6C63FF).withOpacity(0.3)
            : Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: isWinning
              ? const Color(0xFF6C63FF)
              : Colors.white.withOpacity(0.2),
          width: 2,
        ),
      ),
      child: Column(
        children: [
          Text(
            name,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 8),
          Text(
            score.toString(),
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: isWinning ? const Color(0xFF6C63FF) : Colors.white,
            ),
          ),
          if (isWinning)
            const Icon(
              Icons.trending_up,
              color: Color(0xFF6C63FF),
              size: 20,
            ),
        ],
      ),
    );
  }

  Widget _buildTimer(int timeLeft) {
    final percentage = timeLeft / 20;
    Color timerColor;

    if (percentage > 0.5) {
      timerColor = Colors.green;
    } else if (percentage > 0.25) {
      timerColor = Colors.orange;
    } else {
      timerColor = Colors.red;
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          Text(
            timeLeft.toString(),
            style: TextStyle(
              fontSize: 48,
              fontWeight: FontWeight.bold,
              color: timerColor,
            ),
          )
              .animate(
                onPlay: (controller) => controller.repeat(),
              )
              .shake(duration: 500.ms, hz: 2),
          const SizedBox(height: 8),
          LinearProgressIndicator(
            value: percentage,
            backgroundColor: Colors.white.withOpacity(0.1),
            valueColor: AlwaysStoppedAnimation<Color>(timerColor),
            minHeight: 8,
            borderRadius: BorderRadius.circular(4),
          ),
        ],
      ),
    );
  }

  Widget _buildQuestion(DuelQuestionEvent question) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF6C63FF), Color(0xFF5A52D5)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          Text(
            'Question ${question.questionIndex + 1}',
            style: TextStyle(
              fontSize: 14,
              color: Colors.white.withOpacity(0.8),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            question.questionText,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.2, end: 0);
  }

  Widget _buildAnswerOptions(DuelQuestionEvent question) {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      itemCount: question.options.length,
      itemBuilder: (context, index) {
        final isSelected = _selectedAnswerIndex == index;
        final optionLabel = String.fromCharCode(65 + index); // A, B, C, D

        return Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: InkWell(
            onTap: _hasSubmitted
                ? null
                : () {
                    setState(() {
                      _selectedAnswerIndex = index;
                    });
                  },
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isSelected
                    ? const Color(0xFF6C63FF).withOpacity(0.3)
                    : Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(15),
                border: Border.all(
                  color: isSelected
                      ? const Color(0xFF6C63FF)
                      : Colors.white.withOpacity(0.2),
                  width: 2,
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: isSelected
                          ? const Color(0xFF6C63FF)
                          : Colors.white.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        optionLabel,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Text(
                      question.options[index],
                      style: const TextStyle(
                        fontSize: 16,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          )
              .animate()
              .fadeIn(delay: (100 * index).ms, duration: 400.ms)
              .slideX(begin: -0.2, end: 0, delay: (100 * index).ms),
        );
      },
    );
  }

  Widget _buildSubmitButton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: ElevatedButton(
        onPressed: _selectedAnswerIndex != null && !_hasSubmitted
            ? _submitAnswer
            : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF6C63FF),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
          ),
          disabledBackgroundColor: Colors.grey.shade700,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (_hasSubmitted)
              const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  color: Colors.white,
                  strokeWidth: 2,
                ),
              )
            else
              const Icon(Icons.check_circle, size: 24),
            const SizedBox(width: 12),
            Text(
              _hasSubmitted ? 'Submitted' : 'Submit Answer',
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submitAnswer() async {
    if (_selectedAnswerIndex == null || _hasSubmitted) return;

    setState(() {
      _hasSubmitted = true;
    });

    try {
      final question = ref.read(currentDuelQuestionProvider);
      if (question == null) return;

      await ref.read(currentDuelProvider.notifier).submitAnswer(
            questionIndex: question.questionIndex,
            answerIndex: _selectedAnswerIndex!,
          );

      _confettiController.play();
    } catch (e) {
      if (mounted) {
        setState(() {
          _hasSubmitted = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to submit answer: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}
