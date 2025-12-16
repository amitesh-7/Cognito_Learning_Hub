// lib/providers/badges_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/badges_service.dart';
import '../models/badge.dart';

// Badges Service Provider
final badgesServiceProvider = Provider<BadgesService>((ref) {
  return BadgesService();
});

// All Badges Provider
final allBadgesProvider = FutureProvider.family<List<Badge>, BadgeFilters>(
  (ref, filters) async {
    final service = ref.watch(badgesServiceProvider);
    return await service.getAllBadges(
      rarity: filters.rarity,
      category: filters.category,
    );
  },
);

class BadgeFilters {
  final BadgeRarity? rarity;
  final BadgeCategory? category;

  BadgeFilters({this.rarity, this.category});

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is BadgeFilters &&
          rarity == other.rarity &&
          category == other.category;

  @override
  int get hashCode => Object.hash(rarity, category);
}

// User Badges Provider
final userBadgesProvider = FutureProvider.family<BadgeCollection, String>(
  (ref, userId) async {
    final service = ref.watch(badgesServiceProvider);
    return await service.getUserBadges(userId);
  },
);

// Showcase Badges Provider
final showcaseBadgesProvider = FutureProvider.family<List<Badge>, String>(
  (ref, userId) async {
    final service = ref.watch(badgesServiceProvider);
    return await service.getShowcaseBadges(userId);
  },
);

// Pending Trades Provider
final pendingTradesProvider = FutureProvider<List<BadgeTrade>>((ref) async {
  final service = ref.watch(badgesServiceProvider);
  return await service.getPendingTrades();
});

// Trade History Provider
final tradeHistoryProvider = FutureProvider<List<BadgeTrade>>((ref) async {
  final service = ref.watch(badgesServiceProvider);
  return await service.getTradeHistory();
});

// Badge Stats Provider
final badgeStatsProvider = FutureProvider.family<Map<String, dynamic>, String>(
  (ref, userId) async {
    final service = ref.watch(badgesServiceProvider);
    return await service.getBadgeStats(userId);
  },
);

// Showcase Notifier
class ShowcaseNotifier extends Notifier<List<String>> {
  @override
  List<String> build() {
    return [];
  }

  void toggleBadge(String badgeId) {
    if (state.contains(badgeId)) {
      state = state.where((id) => id != badgeId).toList();
    } else {
      if (state.length < 6) {
        state = [...state, badgeId];
      }
    }
  }

  Future<void> saveShowcase() async {
    try {
      final service = ref.read(badgesServiceProvider);
      await service.updateShowcase(state);
      // Invalidate showcase provider to refresh
      ref.invalidate(showcaseBadgesProvider);
    } catch (e) {
      rethrow;
    }
  }

  void loadShowcase(List<Badge> badges) {
    state = badges.map((b) => b.id).toList();
  }
}

final showcaseNotifierProvider =
    NotifierProvider<ShowcaseNotifier, List<String>>(
  () => ShowcaseNotifier(),
);
