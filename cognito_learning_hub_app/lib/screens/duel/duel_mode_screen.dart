// lib/screens/duel/duel_mode_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';
import '../../widgets/common/app_button.dart';
import '../../services/quiz_service.dart';
import '../../models/quiz.dart';
import 'duel_matchmaking_screen.dart';

class DuelModeScreen extends ConsumerStatefulWidget {
  const DuelModeScreen({super.key});

  @override
  ConsumerState<DuelModeScreen> createState() => _DuelModeScreenState();
}

class _DuelModeScreenState extends ConsumerState<DuelModeScreen> {
  bool _isSearching = false;
  bool _isLoading = true;
  List<Quiz> _quizzes = [];
  String? _error;
  final QuizService _quizService = QuizService();

  @override
  void initState() {
    super.initState();
    _loadQuizzes();
  }

  Future<void> _loadQuizzes() async {
    setState(() => _isLoading = true);
    try {
      final quizzes = await _quizService.getPublicQuizzes(limit: 1000);
      // Filter quizzes that have questions
      final validQuizzes =
          quizzes.where((q) => q.questions.isNotEmpty).toList();
      setState(() {
        _quizzes = validQuizzes;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Duel Mode'),
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () => _showDuelHistory(),
          ),
        ],
      ),
      body: _isSearching ? _buildSearchingUI() : _buildMatchmakingUI(),
    );
  }

  Widget _buildMatchmakingUI() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Error: $_error'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadQuizzes,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_quizzes.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('No quizzes available'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadQuizzes,
              child: const Text('Refresh'),
            ),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Header
          const Icon(
            Icons.sports_martial_arts,
            size: 80,
            color: AppTheme.primaryColor,
          ).animate().fadeIn().scale(),

          const SizedBox(height: 16),

          Text(
            '1v1 Quiz Battle',
            style: Theme.of(context)
                .textTheme
                .headlineSmall
                ?.copyWith(fontWeight: FontWeight.bold),
          ).animate().fadeIn(delay: 100.ms),

          const SizedBox(height: 8),

          Text(
            'Select a quiz and challenge another player!',
            style: TextStyle(color: Colors.grey.shade600),
            textAlign: TextAlign.center,
          ).animate().fadeIn(delay: 200.ms),

          const SizedBox(height: 32),

          // Quiz List
          ..._quizzes.map((quiz) {
            final index = _quizzes.indexOf(quiz);
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: InkWell(
                onTap: () => _startDuel(quiz.id),
                borderRadius: BorderRadius.circular(12),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [
                              AppTheme.primaryColor,
                              AppTheme.accentColor,
                            ],
                          ),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.quiz,
                          color: Colors.white,
                          size: 30,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              quiz.title,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${quiz.questions.length} questions',
                              style: TextStyle(
                                color: Colors.grey.shade600,
                                fontSize: 14,
                              ),
                            ),
                            if (quiz.category != null) ...[
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: AppTheme.primaryColor.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  quiz.category!,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: AppTheme.primaryColor,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                      const Icon(
                        Icons.arrow_forward_ios,
                        size: 20,
                        color: Colors.grey,
                      ),
                    ],
                  ),
                ),
              ),
            )
                .animate()
                .fadeIn(delay: Duration(milliseconds: 300 + index * 50))
                .slideX(begin: 0.2);
          }),
        ],
      ),
    );
  }

  Widget _buildSearchingUI() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Animated searching indicator
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: AppTheme.primaryColor.withValues(alpha: 0.3),
                width: 4,
              ),
            ),
            child: const Center(
              child: Icon(
                Icons.search,
                size: 48,
                color: AppTheme.primaryColor,
              ),
            ),
          )
              .animate(onPlay: (c) => c.repeat())
              .shimmer(duration: 2000.ms)
              .then()
              .shake(duration: 500.ms),

          const SizedBox(height: 32),

          const Text(
            'Searching for opponent...',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ).animate().fadeIn(),

          const SizedBox(height: 8),

          Text(
            'Finding a worthy opponent...',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey.shade600),
          ).animate().fadeIn(delay: 200.ms),

          const SizedBox(height: 32),

          AppButton(
            text: 'Cancel',
            isOutlined: true,
            onPressed: () => setState(() => _isSearching = false),
          ).animate().fadeIn(delay: 400.ms),
        ],
      ),
    );
  }

  void _startDuel(String quizId) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => DuelMatchmakingScreen(quizId: quizId),
      ),
    );
  }

  void _showDuelHistory() {
    // TODO: Navigate to duel history
  }
}
