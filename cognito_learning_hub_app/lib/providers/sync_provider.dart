// lib/providers/sync_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/sync_service.dart';

// Sync Service Provider
final syncServiceProvider = Provider<SyncService>((ref) {
  return SyncService();
});

// Sync Status Notifier
class SyncStatusNotifier extends Notifier<SyncStatus> {
  @override
  SyncStatus build() => SyncStatus.idle;

  void update(SyncStatus status) => state = status;
}

final syncStatusProvider = NotifierProvider<SyncStatusNotifier, SyncStatus>(() {
  return SyncStatusNotifier();
});

// Last Sync Time Notifier
class LastSyncTimeNotifier extends Notifier<DateTime?> {
  @override
  DateTime? build() => null;

  void update(DateTime? time) => state = time;
}

final lastSyncTimeProvider =
    NotifierProvider<LastSyncTimeNotifier, DateTime?>(() {
  return LastSyncTimeNotifier();
});

// Unsynced Count Notifier
class UnsyncedCountNotifier extends Notifier<int> {
  @override
  int build() => 0;

  void update(int count) => state = count;
}

final unsyncedCountProvider = NotifierProvider<UnsyncedCountNotifier, int>(() {
  return UnsyncedCountNotifier();
});

// Check Online Status
final isOnlineProvider = FutureProvider<bool>((ref) async {
  final syncService = ref.watch(syncServiceProvider);
  return await syncService.isOnline();
});

// Trigger Sync Operation
final syncProvider = FutureProvider.autoDispose<void>((ref) async {
  final syncService = ref.watch(syncServiceProvider);
  await syncService.sync();

  ref.read(syncStatusProvider.notifier).update(syncService.status);
  ref.read(lastSyncTimeProvider.notifier).update(syncService.lastSyncTime);
  ref.read(unsyncedCountProvider.notifier).update(syncService.unsyncedCount);
});

// Download Data for Offline Use
final downloadOfflineDataProvider = FutureProvider.autoDispose
    .family<void, Map<String, bool>>((ref, options) async {
  final syncService = ref.watch(syncServiceProvider);
  await syncService.downloadForOffline(
    includeQuizzes: options['quizzes'] ?? true,
    includeMaterials: options['materials'] ?? true,
    includeBadges: options['badges'] ?? true,
  );
});
