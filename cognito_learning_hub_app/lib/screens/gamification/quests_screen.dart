// lib/screens/gamification/quests_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';
import '../../models/quest.dart';
import '../../providers/gamification_provider.dart';

class QuestsScreen extends ConsumerStatefulWidget {
  const QuestsScreen({super.key});

  @override
  ConsumerState<QuestsScreen> createState() => _QuestsScreenState();
}

class _QuestsScreenState extends ConsumerState<QuestsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final questsAsync = ref.watch(questsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Quests'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Available'),
            Tab(text: 'Active'),
            Tab(text: 'Completed'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildQuestsList(questsAsync, QuestStatus.available),
          _buildQuestsList(questsAsync, QuestStatus.active),
          _buildQuestsList(questsAsync, QuestStatus.completed),
        ],
      ),
    );
  }

  Widget _buildQuestsList(
    AsyncValue<List<Quest>> questsAsync,
    QuestStatus status,
  ) {
    return questsAsync.when(
      data: (quests) {
        final filteredQuests = _filterQuestsByStatus(quests, status);

        if (filteredQuests.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.map_outlined,
                  size: 64,
                  color: Colors.grey.shade400,
                ),
                const SizedBox(height: 16),
                Text(
                  _getEmptyMessage(status),
                  style: TextStyle(color: Colors.grey.shade600),
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(questsProvider);
          },
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: filteredQuests.length,
            itemBuilder: (context, index) {
              final quest = filteredQuests[index];
              return _QuestCard(
                quest: quest,
                onTap: () => _showQuestDetails(quest),
                onStart: () => _startQuest(quest),
                onClaim: () => _claimQuest(quest),
              )
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
            const Icon(Icons.error_outline,
                size: 64, color: AppTheme.errorColor),
            const SizedBox(height: 16),
            Text('Error loading quests',
                style: TextStyle(color: Colors.grey.shade600)),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => ref.invalidate(questsProvider),
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  List<Quest> _filterQuestsByStatus(List<Quest> quests, QuestStatus status) {
    switch (status) {
      case QuestStatus.available:
        return quests
            .where((q) => !q.isActive && !q.isCompleted && !q.isExpired)
            .toList();
      case QuestStatus.active:
        return quests.where((q) => q.isActive && !q.isCompleted).toList();
      case QuestStatus.completed:
        return quests.where((q) => q.isCompleted).toList();
    }
  }

  String _getEmptyMessage(QuestStatus status) {
    switch (status) {
      case QuestStatus.available:
        return 'No quests available';
      case QuestStatus.active:
        return 'No active quests';
      case QuestStatus.completed:
        return 'No completed quests yet';
    }
  }

  void _showQuestDetails(Quest quest) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => _QuestDetailsSheet(quest: quest),
    );
  }

  void _startQuest(Quest quest) async {
    try {
      await ref.read(questsProvider.notifier).startQuest(quest.id);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Quest "${quest.title}" started!'),
            backgroundColor: AppTheme.successColor,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to start quest: $e'),
            backgroundColor: AppTheme.errorColor,
          ),
        );
      }
    }
  }

  void _claimQuest(Quest quest) async {
    try {
      await ref.read(questsProvider.notifier).claimQuestReward(quest.id);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content:
                Text('🎉 Quest reward claimed! +${quest.rewardPoints} points'),
            backgroundColor: AppTheme.successColor,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to claim reward: $e'),
            backgroundColor: AppTheme.errorColor,
          ),
        );
      }
    }
  }
}

enum QuestStatus { available, active, completed }

class _QuestCard extends StatelessWidget {
  final Quest quest;
  final VoidCallback? onTap;
  final VoidCallback? onStart;
  final VoidCallback? onClaim;

  const _QuestCard({
    required this.quest,
    this.onTap,
    this.onStart,
    this.onClaim,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  // Quest icon
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: _getDifficultyColor(quest.difficulty)
                          .withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Icons.flag,
                      color: _getDifficultyColor(quest.difficulty),
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 12),

                  // Title and category
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          quest.title,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          quest.category.toUpperCase(),
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Difficulty badge
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: _getDifficultyColor(quest.difficulty),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      quest.difficultyLabel,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              // Description
              Text(
                quest.description,
                style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),

              const SizedBox(height: 12),

              // Progress
              if (quest.isActive) ...[
                LinearProgressIndicator(
                  value: quest.progressPercentage,
                  backgroundColor: Colors.grey.shade300,
                  valueColor: AlwaysStoppedAnimation(
                      _getDifficultyColor(quest.difficulty)),
                ),
                const SizedBox(height: 8),
                Text(
                  '${quest.completedTasksCount}/${quest.tasks.length} tasks completed',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
              ],

              const SizedBox(height: 12),

              // Rewards and action
              Row(
                children: [
                  // Rewards
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppTheme.warningColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.stars,
                            size: 16, color: AppTheme.warningColor),
                        const SizedBox(width: 4),
                        Text(
                          '${quest.rewardPoints} pts',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.warningColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppTheme.successColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.trending_up,
                            size: 16, color: AppTheme.successColor),
                        const SizedBox(width: 4),
                        Text(
                          '${quest.rewardXp} XP',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.successColor,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const Spacer(),

                  // Action button
                  if (!quest.isActive && !quest.isCompleted)
                    ElevatedButton(
                      onPressed: onStart,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Start'),
                    )
                  else if (quest.isCompleted)
                    ElevatedButton(
                      onPressed: onClaim,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.successColor,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Claim'),
                    )
                  else
                    TextButton(
                      onPressed: onTap,
                      child: const Text('View'),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getDifficultyColor(int difficulty) {
    switch (difficulty) {
      case 1:
        return AppTheme.successColor;
      case 2:
        return AppTheme.warningColor;
      case 3:
        return AppTheme.errorColor;
      case 4:
        return Colors.purple;
      default:
        return Colors.grey;
    }
  }
}

class _QuestDetailsSheet extends StatelessWidget {
  final Quest quest;

  const _QuestDetailsSheet({required this.quest});

  @override
  Widget build(BuildContext context) {
    return Container(
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

          // Title
          Text(
            quest.title,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 8),

          // Description
          Text(
            quest.description,
            style: TextStyle(color: Colors.grey.shade600),
          ),
          const SizedBox(height: 24),

          // Tasks
          Text(
            'Tasks',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 12),

          ...quest.tasks.map((task) => _buildTaskItem(task)),

          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildTaskItem(QuestTask task) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(
            task.isCompleted
                ? Icons.check_circle
                : Icons.radio_button_unchecked,
            color: task.isCompleted ? AppTheme.successColor : Colors.grey,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(task.description),
                const SizedBox(height: 4),
                LinearProgressIndicator(
                  value: task.progressPercentage,
                  backgroundColor: Colors.grey.shade300,
                ),
                const SizedBox(height: 4),
                Text(
                  '${task.currentValue}/${task.targetValue}',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
