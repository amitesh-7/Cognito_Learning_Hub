// lib/providers/gamification_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/achievement.dart';
import '../models/quest.dart';
import '../services/gamification_service.dart';

final gamificationServiceProvider = Provider((ref) => GamificationService());

// User stats provider
final userStatsProvider =
    AsyncNotifierProvider<UserStatsNotifier, GamificationStats>(
  UserStatsNotifier.new,
);

class UserStatsNotifier extends AsyncNotifier<GamificationStats> {
  GamificationService get _service => ref.read(gamificationServiceProvider);

  @override
  Future<GamificationStats> build() async {
    return await _loadStats();
  }

  Future<GamificationStats> _loadStats() async {
    try {
      return await _service.getUserStats();
    } catch (e) {
      print('⚠️ Failed to load gamification stats: $e');
      // Return default stats instead of throwing
      return GamificationStats(
        totalPoints: 0,
        level: 1,
        currentLevelPoints: 0,
        nextLevelPoints: 100,
        streak: 0,
        longestStreak: 0,
        quizzesCompleted: 0,
        questsCompleted: 0,
        achievementsUnlocked: 0,
        totalAchievements: 0,
      );
    }
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async => await _loadStats());
  }
}

// Achievements provider
final achievementsProvider =
    AsyncNotifierProvider<AchievementsNotifier, List<Achievement>>(
  AchievementsNotifier.new,
);

class AchievementsNotifier extends AsyncNotifier<List<Achievement>> {
  GamificationService get _service => ref.read(gamificationServiceProvider);

  @override
  Future<List<Achievement>> build() async {
    return await _loadAchievements();
  }

  Future<List<Achievement>> _loadAchievements(
      {String? category, bool? unlocked}) async {
    return await _service.getAchievements(
      category: category,
      unlocked: unlocked,
    );
  }

  Future<void> loadAchievements({String? category, bool? unlocked}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async => await _loadAchievements(
          category: category,
          unlocked: unlocked,
        ));
  }

  Future<void> claimAchievement(String achievementId) async {
    try {
      await _service.claimAchievement(achievementId);
      await refresh();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async => await _loadAchievements());
  }
}

// Quests provider
final questsProvider = AsyncNotifierProvider<QuestsNotifier, List<Quest>>(
  QuestsNotifier.new,
);

class QuestsNotifier extends AsyncNotifier<List<Quest>> {
  GamificationService get _service => ref.read(gamificationServiceProvider);

  @override
  Future<List<Quest>> build() async {
    return await _loadQuests();
  }

  Future<List<Quest>> _loadQuests({String? status}) async {
    return await _service.getQuests(status: status);
  }

  Future<void> loadQuests({String? status}) async {
    state = const AsyncLoading();
    state =
        await AsyncValue.guard(() async => await _loadQuests(status: status));
  }

  Future<void> startQuest(String questId) async {
    try {
      await _service.startQuest(questId);
      await refresh();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> claimQuestReward(String questId) async {
    try {
      await _service.claimQuestReward(questId);
      await refresh();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async => await _loadQuests());
  }
}

// Active quest details provider - Use FutureProvider.family for parameterized async data
final activeQuestProvider =
    FutureProvider.family<Quest?, String>((ref, questId) async {
  final service = ref.read(gamificationServiceProvider);
  return await service.getQuest(questId);
});

// Filter providers
final achievementFilterProvider =
    NotifierProvider<AchievementFilterNotifier, String?>(
  AchievementFilterNotifier.new,
);

class AchievementFilterNotifier extends Notifier<String?> {
  @override
  String? build() => null;

  void set(String? filter) => state = filter;
}

final questFilterProvider = NotifierProvider<QuestFilterNotifier, String?>(
  QuestFilterNotifier.new,
);

class QuestFilterNotifier extends Notifier<String?> {
  @override
  String? build() => null;

  void set(String? filter) => state = filter;
}
