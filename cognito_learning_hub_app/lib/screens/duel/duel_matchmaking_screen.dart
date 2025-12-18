// lib/screens/duel/duel_matchmaking_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../models/duel.dart';
import '../../providers/duel_provider.dart';

class DuelMatchmakingScreen extends ConsumerStatefulWidget {
  final String? quizId;

  const DuelMatchmakingScreen({super.key, this.quizId});

  @override
  ConsumerState<DuelMatchmakingScreen> createState() =>
      _DuelMatchmakingScreenState();
}

class _DuelMatchmakingScreenState extends ConsumerState<DuelMatchmakingScreen> {
  String? _selectedCategory;
  String _selectedDifficulty = 'medium';

  final List<String> _categories = [
    'General Knowledge',
    'Science',
    'Technology',
    'History',
    'Geography',
    'Sports',
    'Entertainment',
    'Mathematics',
  ];

  final Map<String, String> _difficulties = {
    'easy': 'Easy',
    'medium': 'Medium',
    'hard': 'Hard',
  };

  @override
  Widget build(BuildContext context) {
    final matchmakingStatus = ref.watch(matchmakingStatusProvider);

    // Listen for match found
    ref.listen(currentDuelProvider, (previous, next) {
      if (next != null && mounted) {
        // Match found - navigate to duel play screen
        context.pushReplacement('/duel/${next.id}');
      }
    });

    return Scaffold(
      backgroundColor: const Color(0xFF0A0E21),
      appBar: AppBar(
        title: const Text('Duel Mode'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: matchmakingStatus.isSearching
          ? _buildSearchingView(matchmakingStatus)
          : _buildSetupView(),
    );
  }

  Widget _buildSetupView() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          Container(
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
                Icon(
                  Icons.sports_kabaddi,
                  size: 60,
                  color: Colors.white.withOpacity(0.9),
                ),
                const SizedBox(height: 16),
                const Text(
                  '1v1 Duel Mode',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Challenge players worldwide in real-time quizzes',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withOpacity(0.8),
                  ),
                ),
              ],
            ),
          ).animate().fadeIn(duration: 400.ms).slideY(begin: -0.2, end: 0),

          const SizedBox(height: 32),

          // Category Selection
          Text(
            'Select Category',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white.withOpacity(0.9),
            ),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: _categories.map((category) {
              final isSelected = _selectedCategory == category;
              return InkWell(
                onTap: () {
                  setState(() {
                    _selectedCategory = category;
                  });
                },
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? const Color(0xFF6C63FF)
                        : Colors.white.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(25),
                    border: Border.all(
                      color: isSelected
                          ? const Color(0xFF6C63FF)
                          : Colors.white.withOpacity(0.3),
                      width: 2,
                    ),
                  ),
                  child: Text(
                    category,
                    style: TextStyle(
                      color: isSelected
                          ? Colors.white
                          : Colors.white.withOpacity(0.7),
                      fontWeight:
                          isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                ),
              );
            }).toList(),
          ).animate().fadeIn(delay: 200.ms, duration: 400.ms),

          const SizedBox(height: 32),

          // Difficulty Selection
          Text(
            'Select Difficulty',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white.withOpacity(0.9),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: _difficulties.entries.map((entry) {
              final isSelected = _selectedDifficulty == entry.key;
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: InkWell(
                    onTap: () {
                      setState(() {
                        _selectedDifficulty = entry.key;
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? _getDifficultyColor(entry.key)
                            : Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(15),
                        border: Border.all(
                          color: isSelected
                              ? _getDifficultyColor(entry.key)
                              : Colors.white.withOpacity(0.3),
                          width: 2,
                        ),
                      ),
                      child: Text(
                        entry.value,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: isSelected
                              ? Colors.white
                              : Colors.white.withOpacity(0.7),
                          fontWeight:
                              isSelected ? FontWeight.bold : FontWeight.normal,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          ).animate().fadeIn(delay: 400.ms, duration: 400.ms),

          const SizedBox(height: 40),

          // Find Match Button
          ElevatedButton(
            onPressed: _selectedCategory != null ? _startMatchmaking : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF6C63FF),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(15),
              ),
              disabledBackgroundColor: Colors.grey.shade700,
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.search, size: 24),
                SizedBox(width: 12),
                Text(
                  'Find Opponent',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          )
              .animate()
              .fadeIn(delay: 600.ms, duration: 400.ms)
              .scale(delay: 600.ms),

          const SizedBox(height: 24),

          // Info Cards
          _buildInfoCard(
            icon: Icons.timer,
            title: '20s per question',
            description: 'Quick-fire questions',
          ),
          const SizedBox(height: 12),
          _buildInfoCard(
            icon: Icons.star,
            title: 'Earn XP & Rewards',
            description: 'Win to climb the ranks',
          ),
          const SizedBox(height: 12),
          _buildInfoCard(
            icon: Icons.leaderboard,
            title: 'Global Rankings',
            description: 'Compete with the best',
          ),
        ],
      ),
    );
  }

  Widget _buildSearchingView(MatchmakingStatus status) {
    final searchDuration = status.getSearchDuration() ?? 0;

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Animated searching indicator
          Container(
            width: 150,
            height: 150,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: [
                  const Color(0xFF6C63FF).withOpacity(0.3),
                  const Color(0xFF5A52D5).withOpacity(0.3),
                ],
              ),
            ),
            child: const Center(
              child: Icon(
                Icons.search,
                size: 60,
                color: Colors.white,
              ),
            ),
          )
              .animate(onPlay: (controller) => controller.repeat())
              .scale(
                  duration: 1500.ms,
                  begin: const Offset(0.8, 0.8),
                  end: const Offset(1.2, 1.2))
              .then()
              .scale(
                  duration: 1500.ms,
                  begin: const Offset(1.2, 1.2),
                  end: const Offset(0.8, 0.8)),

          const SizedBox(height: 40),

          Text(
            'Finding Opponent...',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.white.withOpacity(0.9),
            ),
          )
              .animate(onPlay: (controller) => controller.repeat())
              .fadeIn(duration: 1000.ms)
              .then()
              .fadeOut(duration: 1000.ms),

          const SizedBox(height: 16),

          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              children: [
                Text(
                  status.category ?? 'Any Category',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _difficulties[status.difficulty] ?? 'Medium',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withOpacity(0.7),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          Text(
            'Searching for ${searchDuration}s',
            style: TextStyle(
              fontSize: 14,
              color: Colors.white.withOpacity(0.6),
            ),
          ),

          const SizedBox(height: 40),

          // Cancel Button
          OutlinedButton(
            onPressed: _cancelMatchmaking,
            style: OutlinedButton.styleFrom(
              foregroundColor: Colors.white,
              side: const BorderSide(color: Colors.red, width: 2),
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(15),
              ),
            ),
            child: const Text(
              'Cancel Search',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required String title,
    required String description,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: Colors.white.withOpacity(0.1),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF6C63FF).withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              icon,
              color: const Color(0xFF6C63FF),
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.white.withOpacity(0.6),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(delay: 800.ms, duration: 400.ms)
        .slideX(begin: -0.2, end: 0);
  }

  Color _getDifficultyColor(String difficulty) {
    switch (difficulty) {
      case 'easy':
        return Colors.green;
      case 'medium':
        return Colors.orange;
      case 'hard':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  Future<void> _startMatchmaking() async {
    if (_selectedCategory == null) return;

    try {
      await ref.read(matchmakingStatusProvider.notifier).startSearch(
            category: _selectedCategory!,
            difficulty: _selectedDifficulty,
          );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to start matchmaking: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _cancelMatchmaking() async {
    try {
      await ref.read(matchmakingStatusProvider.notifier).cancelSearch();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to cancel search: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}
