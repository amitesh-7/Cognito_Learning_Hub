// lib/screens/quiz/quiz_taker_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/routes.dart';
import '../../config/theme.dart';
import '../../models/quiz.dart';
import '../../providers/quiz_provider.dart';
import '../../widgets/common/app_button.dart';

class QuizTakerScreen extends ConsumerStatefulWidget {
  final String quizId;

  const QuizTakerScreen({super.key, required this.quizId});

  @override
  ConsumerState<QuizTakerScreen> createState() => _QuizTakerScreenState();
}

class _QuizTakerScreenState extends ConsumerState<QuizTakerScreen>
    with TickerProviderStateMixin {
  late AnimationController _timerController;
  late AnimationController _progressController;

  @override
  void initState() {
    super.initState();
    _timerController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 30),
    );
    _progressController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );

    // Start the quiz
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadQuizAndStart();
    });
  }

  Future<void> _loadQuizAndStart() async {
    final quizAsync = await ref.read(quizByIdProvider(widget.quizId).future);
    if (quizAsync != null) {
      ref.read(quizTakingProvider.notifier).startQuiz(quizAsync);
      _startTimer();
    }
  }

  void _startTimer() {
    final state = ref.read(quizTakingProvider);
    if (state.quiz != null && state.currentQuestion != null) {
      final currentQuestion = state.currentQuestion!;
      final duration = Duration(seconds: currentQuestion.timeLimit);
      _timerController.duration = duration;
      _timerController.reset();
      _timerController.forward();

      _timerController.addStatusListener((status) {
        if (status == AnimationStatus.completed) {
          _handleTimeout();
        }
      });
    }
  }

  void _handleTimeout() {
    final notifier = ref.read(quizTakingProvider.notifier);
    if (!notifier.isLastQuestion()) {
      notifier.nextQuestion();
      _startTimer();
    } else {
      _submitQuiz();
    }
  }

  void _submitQuiz() {
    ref.read(quizTakingProvider.notifier).finishQuiz();
    final state = ref.read(quizTakingProvider);

    // Navigate to results
    context.pushReplacement(
      '${AppRoutes.quizResult}?score=${state.score}&total=${state.totalQuestions * 10}',
    );
  }

  @override
  void dispose() {
    _timerController.dispose();
    _progressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(quizTakingProvider);

    if (state.quiz == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Loading Quiz'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(
                width: 60,
                height: 60,
                child: CircularProgressIndicator(
                  strokeWidth: 3,
                  valueColor: AlwaysStoppedAnimation(AppTheme.primaryColor),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Loading quiz...',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
              const SizedBox(height: 8),
              Text(
                'Please wait, this may take a moment',
                style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
              ),
              const SizedBox(height: 4),
              Text(
                '(Server may be waking up)',
                style: TextStyle(color: Colors.grey.shade400, fontSize: 12),
              ),
            ],
          ),
        ),
      );
    }

    final quiz = state.quiz!;
    final currentQuestion = quiz.questions[state.currentQuestionIndex];
    final progress = (state.currentQuestionIndex + 1) / state.totalQuestions;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        final shouldExit = await _showExitDialog();
        if (shouldExit == true && context.mounted) {
          Navigator.of(context).pop();
        }
      },
      child: Scaffold(
        body: SafeArea(
          child: Column(
            children: [
              // Header
              _buildHeader(context, state, quiz),

              // Progress Bar
              LinearProgressIndicator(
                value: progress,
                backgroundColor: Colors.grey.shade200,
                valueColor: const AlwaysStoppedAnimation(AppTheme.primaryColor),
              ),

              // Question Content
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Timer
                      _buildTimer(),

                      const SizedBox(height: 24),

                      // Question Number
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          'Question ${state.currentQuestionIndex + 1} of ${state.totalQuestions}',
                          style: const TextStyle(
                            color: AppTheme.primaryColor,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ).animate().fadeIn().slideX(begin: -0.2),

                      const SizedBox(height: 16),

                      // Question Text
                      Text(
                        currentQuestion.question,
                        style: Theme.of(context)
                            .textTheme
                            .headlineSmall
                            ?.copyWith(fontWeight: FontWeight.bold),
                      ).animate().fadeIn().slideY(begin: 0.1),

                      const SizedBox(height: 24),

                      // Options
                      ...currentQuestion.options.asMap().entries.map((entry) {
                        final index = entry.key;
                        final option = entry.value;
                        final isSelected =
                            state.answers[state.currentQuestionIndex] == index;

                        return _OptionCard(
                          option: option,
                          index: index,
                          isSelected: isSelected,
                          onTap: () {
                            ref
                                .read(quizTakingProvider.notifier)
                                .answerQuestion(index);
                          },
                        )
                            .animate()
                            .fadeIn(
                              delay: Duration(
                                  milliseconds: (100 * (index + 1)).toInt()),
                            )
                            .slideX(begin: 0.2);
                      }),
                    ],
                  ),
                ),
              ),

              // Navigation Buttons
              _buildNavigationButtons(state),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, QuizTakingState state, Quiz quiz) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () async {
              final shouldExit = await _showExitDialog();
              if (shouldExit == true && context.mounted) {
                context.pop();
              }
            },
          ),
          Expanded(
            child: Column(
              children: [
                Text(
                  quiz.title,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  '${state.score} points',
                  style: const TextStyle(
                    color: AppTheme.successColor,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppTheme.warningColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.emoji_events,
                  size: 16,
                  color: AppTheme.warningColor,
                ),
                const SizedBox(width: 4),
                Text(
                  '${state.correctAnswers}/${state.answeredCount}',
                  style: const TextStyle(
                    color: AppTheme.warningColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimer() {
    return AnimatedBuilder(
      animation: _timerController,
      builder: (context, child) {
        final remaining = (1 - _timerController.value) *
            (_timerController.duration?.inSeconds ?? 30);
        final isLow = remaining < 10;

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isLow
                ? AppTheme.errorColor.withOpacity(0.1)
                : AppTheme.primaryColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.timer,
                color: isLow ? AppTheme.errorColor : AppTheme.primaryColor,
              ),
              const SizedBox(width: 8),
              Text(
                '${remaining.toInt()}s',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: isLow ? AppTheme.errorColor : AppTheme.primaryColor,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildNavigationButtons(QuizTakingState state) {
    final notifier = ref.read(quizTakingProvider.notifier);
    final hasAnswered = state.answers[state.currentQuestionIndex] != null;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: Row(
        children: [
          if (state.currentQuestionIndex > 0)
            Expanded(
              child: AppButton(
                text: 'Previous',
                onPressed: () {
                  notifier.previousQuestion();
                  _startTimer();
                },
                isOutlined: true,
              ),
            ),
          if (state.currentQuestionIndex > 0) const SizedBox(width: 16),
          Expanded(
            child: GradientButton(
              text: notifier.isLastQuestion() ? 'Submit' : 'Next',
              onPressed: hasAnswered
                  ? () {
                      if (notifier.isLastQuestion()) {
                        _submitQuiz();
                      } else {
                        notifier.nextQuestion();
                        _startTimer();
                      }
                    }
                  : null,
            ),
          ),
        ],
      ),
    );
  }

  Future<bool?> _showExitDialog() {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Exit Quiz?'),
        content: const Text(
          'Are you sure you want to exit? Your progress will be lost.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: AppTheme.errorColor),
            child: const Text('Exit'),
          ),
        ],
      ),
    );
  }
}

class _OptionCard extends StatelessWidget {
  final String option;
  final int index;
  final bool isSelected;
  final VoidCallback onTap;

  const _OptionCard({
    required this.option,
    required this.index,
    required this.isSelected,
    required this.onTap,
  });

  String get _optionLetter {
    return String.fromCharCode(65 + index); // A, B, C, D
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isSelected
                ? AppTheme.primaryColor.withOpacity(0.1)
                : Colors.grey.shade100,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? AppTheme.primaryColor : Colors.transparent,
              width: 2,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color:
                      isSelected ? AppTheme.primaryColor : Colors.grey.shade300,
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    _optionLetter,
                    style: TextStyle(
                      color: isSelected ? Colors.white : Colors.grey.shade700,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  option,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight:
                        isSelected ? FontWeight.w600 : FontWeight.normal,
                    color: isSelected
                        ? AppTheme.primaryColor
                        : Colors.grey.shade800,
                  ),
                ),
              ),
              if (isSelected)
                const Icon(Icons.check_circle, color: AppTheme.primaryColor),
            ],
          ),
        ),
      ),
    );
  }
}
