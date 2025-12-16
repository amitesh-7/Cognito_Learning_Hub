// lib/screens/quiz/quiz_list_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/routes.dart';
import '../../config/theme.dart';
import '../../providers/quiz_provider.dart';
import '../../widgets/common/app_input.dart';

class QuizListScreen extends ConsumerStatefulWidget {
  const QuizListScreen({super.key});

  @override
  ConsumerState<QuizListScreen> createState() => _QuizListScreenState();
}

class _QuizListScreenState extends ConsumerState<QuizListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final filter = ref.watch(quizFilterProvider);
    final publicQuizzes = ref.watch(publicQuizzesProvider(filter));
    final myQuizzes = ref.watch(myQuizzesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Quizzes'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterDialog,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Explore'),
            Tab(text: 'My Quizzes'),
            Tab(text: 'Saved'),
          ],
        ),
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: SearchInput(
              controller: _searchController,
              hint: 'Search quizzes...',
              onSubmitted: (value) {
                ref.read(quizFilterProvider.notifier).update(
                      QuizFilter(search: value),
                    );
              },
            ),
          ),

          // Quiz Lists
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                // Explore Tab
                _buildQuizList(publicQuizzes),

                // My Quizzes Tab
                _buildQuizList(myQuizzes),

                // Saved Tab (TODO: Implement saved quizzes)
                const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.bookmark_border, size: 64, color: Colors.grey),
                      SizedBox(height: 16),
                      Text(
                        'No saved quizzes yet',
                        style: TextStyle(color: Colors.grey),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        heroTag: 'quiz_list_fab',
        onPressed: () => context.push(AppRoutes.quizCreate),
        icon: const Icon(Icons.add),
        label: const Text('Create Quiz'),
        backgroundColor: AppTheme.primaryColor,
      ),
    );
  }

  Widget _buildQuizList(AsyncValue quizzesValue) {
    return quizzesValue.when(
      data: (quizzes) {
        if (quizzes.isEmpty) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.quiz_outlined, size: 64, color: Colors.grey),
                SizedBox(height: 16),
                Text('No quizzes found', style: TextStyle(color: Colors.grey)),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(publicQuizzesProvider);
            ref.invalidate(myQuizzesProvider);
          },
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: quizzes.length,
            itemBuilder: (context, index) {
              final quiz = quizzes[index];
              return _QuizCard(quiz: quiz)
                  .animate()
                  .fadeIn(delay: Duration(milliseconds: index * 50))
                  .slideX(begin: 0.1);
            },
          ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stack) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: AppTheme.errorColor,
            ),
            const SizedBox(height: 16),
            Text(
              'Error loading quizzes',
              style: TextStyle(color: Colors.grey.shade600),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () {
                ref.invalidate(publicQuizzesProvider);
              },
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  void _showFilterDialog() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Filter Quizzes',
              style: Theme.of(
                context,
              ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            const Text('Category'),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: ['All', 'Math', 'Science', 'History', 'Language'].map((
                category,
              ) {
                return ChoiceChip(
                  label: Text(category),
                  selected: category == 'All',
                  onSelected: (selected) {
                    // TODO: Apply filter
                    Navigator.pop(context);
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
            const Text('Difficulty'),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: ['All', 'Easy', 'Medium', 'Hard'].map((difficulty) {
                return ChoiceChip(
                  label: Text(difficulty),
                  selected: difficulty == 'All',
                  onSelected: (selected) {
                    // TODO: Apply filter
                    Navigator.pop(context);
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _QuizCard extends StatelessWidget {
  final dynamic quiz;

  const _QuizCard({required this.quiz});

  @override
  Widget build(BuildContext context) {
    final questionCount = quiz.questions?.length ?? 0;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          context.push('/quiz/${quiz.id}');
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.quiz, color: AppTheme.primaryColor),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          quiz.title ?? 'Untitled Quiz',
                          style: Theme.of(context)
                              .textTheme
                              .titleMedium
                              ?.copyWith(fontWeight: FontWeight.bold),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          quiz.category ?? 'General',
                          style: TextStyle(
                            color: Colors.grey.shade600,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.bookmark_border),
                    onPressed: () {
                      // TODO: Save quiz
                    },
                  ),
                ],
              ),
              if (quiz.description != null && quiz.description.isNotEmpty) ...[
                const SizedBox(height: 12),
                Text(
                  quiz.description,
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
              const SizedBox(height: 12),
              Row(
                children: [
                  _QuizStat(
                    icon: Icons.help_outline,
                    label: '$questionCount Questions',
                  ),
                  const SizedBox(width: 16),
                  _QuizStat(
                    icon: Icons.timer_outlined,
                    label: '${quiz.timeLimit ?? 30} min',
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: _getDifficultyColor(quiz.difficulty),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      quiz.difficulty ?? 'Medium',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getDifficultyColor(String? difficulty) {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return AppTheme.successColor;
      case 'hard':
        return AppTheme.errorColor;
      default:
        return AppTheme.warningColor;
    }
  }
}

class _QuizStat extends StatelessWidget {
  final IconData icon;
  final String label;

  const _QuizStat({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: Colors.grey),
        const SizedBox(width: 4),
        Text(
          label,
          style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
        ),
      ],
    );
  }
}
