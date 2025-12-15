// lib/screens/duel/duel_mode_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';
import '../../widgets/common/app_button.dart';

class DuelModeScreen extends ConsumerStatefulWidget {
  const DuelModeScreen({super.key});

  @override
  ConsumerState<DuelModeScreen> createState() => _DuelModeScreenState();
}

class _DuelModeScreenState extends ConsumerState<DuelModeScreen> {
  bool _isSearching = false;
  String? _selectedCategory;
  String? _selectedDifficulty;

  final List<String> _categories = [
    'General Knowledge',
    'Science',
    'Mathematics',
    'History',
    'Geography',
    'Programming',
    'Literature',
  ];

  final List<String> _difficulties = ['Easy', 'Medium', 'Hard', 'Expert'];

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
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          ).animate().fadeIn(delay: 100.ms),

          const SizedBox(height: 8),

          Text(
            'Challenge another player to a real-time quiz duel!',
            style: TextStyle(color: Colors.grey.shade600),
            textAlign: TextAlign.center,
          ).animate().fadeIn(delay: 200.ms),

          const SizedBox(height: 32),

          // Category Selection
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Select Category',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _categories.map((category) {
                      final isSelected = _selectedCategory == category;
                      return FilterChip(
                        label: Text(category),
                        selected: isSelected,
                        onSelected: (selected) {
                          setState(() {
                            _selectedCategory = selected ? category : null;
                          });
                        },
                        selectedColor: AppTheme.primaryColor.withValues(
                          alpha: 0.2,
                        ),
                        checkmarkColor: AppTheme.primaryColor,
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
          ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.2),

          const SizedBox(height: 16),

          // Difficulty Selection
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Select Difficulty',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: _difficulties.map((difficulty) {
                      final isSelected = _selectedDifficulty == difficulty;
                      return Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: ChoiceChip(
                            label: Text(
                              difficulty,
                              style: TextStyle(fontSize: 12),
                            ),
                            selected: isSelected,
                            onSelected: (selected) {
                              setState(() {
                                _selectedDifficulty = selected
                                    ? difficulty
                                    : null;
                              });
                            },
                            selectedColor: _getDifficultyColor(
                              difficulty,
                            ).withValues(alpha: 0.2),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
          ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.2),

          const SizedBox(height: 32),

          // Stats Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildStatItem('Wins', '12', Colors.green),
                  _buildStatItem('Losses', '5', Colors.red),
                  _buildStatItem('Win Rate', '70%', AppTheme.primaryColor),
                ],
              ),
            ),
          ).animate().fadeIn(delay: 500.ms).slideY(begin: 0.2),

          const SizedBox(height: 32),

          // Find Opponent Button
          SizedBox(
            width: double.infinity,
            child: GradientButton(
              text: 'Find Opponent',
              icon: Icons.search,
              onPressed: () => _startSearching(),
            ),
          ).animate().fadeIn(delay: 600.ms).slideY(begin: 0.2),

          const SizedBox(height: 16),

          // Challenge Friend Button
          SizedBox(
            width: double.infinity,
            child: AppButton(
              text: 'Challenge a Friend',
              icon: Icons.person_add,
              isOutlined: true,
              onPressed: () => _challengeFriend(),
            ),
          ).animate().fadeIn(delay: 700.ms).slideY(begin: 0.2),
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
            'Category: ${_selectedCategory ?? "Any"}\nDifficulty: ${_selectedDifficulty ?? "Any"}',
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

  Widget _buildStatItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
        ),
      ],
    );
  }

  Color _getDifficultyColor(String difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return Colors.green;
      case 'medium':
        return Colors.orange;
      case 'hard':
        return Colors.red;
      case 'expert':
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }

  void _startSearching() {
    setState(() => _isSearching = true);

    // Simulate finding opponent after 3 seconds
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted && _isSearching) {
        setState(() => _isSearching = false);
        // TODO: Navigate to duel battle screen
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Opponent found! Starting duel...')),
        );
      }
    });
  }

  void _challengeFriend() {
    // TODO: Show friend list to challenge
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Friend challenge coming soon!')),
    );
  }

  void _showDuelHistory() {
    // TODO: Navigate to duel history
  }
}
