// lib/providers/notification_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/notification_service.dart';
import '../models/notification.dart';

// Notification Service Provider
final notificationServiceProvider = Provider<NotificationService>((ref) {
  return NotificationService();
});

// Notifications List Provider
final notificationsProvider =
    FutureProvider.family<List<AppNotification>, NotificationParams>(
  (ref, params) async {
    final service = ref.watch(notificationServiceProvider);
    return await service.getNotifications(
      page: params.page,
      limit: params.limit,
      isRead: params.isRead,
    );
  },
);

class NotificationParams {
  final int page;
  final int limit;
  final bool? isRead;

  NotificationParams({
    this.page = 1,
    this.limit = 20,
    this.isRead,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is NotificationParams &&
          page == other.page &&
          limit == other.limit &&
          isRead == other.isRead;

  @override
  int get hashCode => Object.hash(page, limit, isRead);
}

// Unread Count Provider
final unreadCountProvider = FutureProvider<int>((ref) async {
  final service = ref.watch(notificationServiceProvider);
  return await service.getUnreadCount();
});

// Notification Settings Provider
final notificationSettingsProvider =
    FutureProvider<NotificationSettings>((ref) async {
  final service = ref.watch(notificationServiceProvider);
  return await service.getSettings();
});

// Notifications State Notifier
class NotificationsNotifier extends Notifier<List<AppNotification>> {
  @override
  List<AppNotification> build() {
    loadNotifications();
    return [];
  }

  Future<void> loadNotifications({int page = 1}) async {
    try {
      final service = ref.read(notificationServiceProvider);
      final notifications = await service.getNotifications(page: page);
      if (page == 1) {
        state = notifications;
      } else {
        state = [...state, ...notifications];
      }
    } catch (e) {
      // Handle error
    }
  }

  Future<void> markAsRead(String notificationId) async {
    try {
      final service = ref.read(notificationServiceProvider);
      await service.markAsRead(notificationId);

      // Update local state
      state = state.map((n) {
        if (n.id == notificationId) {
          return n.copyWith(isRead: true, readAt: DateTime.now());
        }
        return n;
      }).toList();

      // Refresh unread count
      ref.invalidate(unreadCountProvider);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> markAllAsRead() async {
    try {
      final service = ref.read(notificationServiceProvider);
      await service.markAllAsRead();

      // Update local state
      state = state
          .map((n) => n.copyWith(isRead: true, readAt: DateTime.now()))
          .toList();

      // Refresh unread count
      ref.invalidate(unreadCountProvider);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteNotification(String notificationId) async {
    try {
      final service = ref.read(notificationServiceProvider);
      await service.deleteNotification(notificationId);

      // Remove from local state
      state = state.where((n) => n.id != notificationId).toList();

      // Refresh unread count
      ref.invalidate(unreadCountProvider);
    } catch (e) {
      rethrow;
    }
  }

  void addNotification(AppNotification notification) {
    state = [notification, ...state];
    ref.invalidate(unreadCountProvider);
  }
}

final notificationsNotifierProvider =
    NotifierProvider<NotificationsNotifier, List<AppNotification>>(
  () => NotificationsNotifier(),
);

// Notification Settings State Notifier
class NotificationSettingsNotifier extends Notifier<NotificationSettings> {
  @override
  NotificationSettings build() {
    loadSettings();
    return NotificationSettings();
  }

  Future<void> loadSettings() async {
    try {
      final service = ref.read(notificationServiceProvider);
      final settings = await service.getSettings();
      state = settings;
    } catch (e) {
      // Handle error
    }
  }

  Future<void> updateSettings(NotificationSettings newSettings) async {
    try {
      final service = ref.read(notificationServiceProvider);
      await service.updateSettings(newSettings);
      state = newSettings;
    } catch (e) {
      rethrow;
    }
  }

  void toggleQuizReminders(bool value) {
    final newSettings = state.copyWith(quizReminders: value);
    updateSettings(newSettings);
  }

  void toggleAchievements(bool value) {
    final newSettings = state.copyWith(achievements: value);
    updateSettings(newSettings);
  }

  void toggleDuelChallenges(bool value) {
    final newSettings = state.copyWith(duelChallenges: value);
    updateSettings(newSettings);
  }

  void toggleFriendRequests(bool value) {
    final newSettings = state.copyWith(friendRequests: value);
    updateSettings(newSettings);
  }

  void toggleComments(bool value) {
    final newSettings = state.copyWith(comments: value);
    updateSettings(newSettings);
  }

  void toggleLikes(bool value) {
    final newSettings = state.copyWith(likes: value);
    updateSettings(newSettings);
  }

  void toggleLiveQuizzes(bool value) {
    final newSettings = state.copyWith(liveQuizzes: value);
    updateSettings(newSettings);
  }

  void toggleMeetings(bool value) {
    final newSettings = state.copyWith(meetings: value);
    updateSettings(newSettings);
  }

  void toggleSystemNotifications(bool value) {
    final newSettings = state.copyWith(systemNotifications: value);
    updateSettings(newSettings);
  }

  void toggleSound(bool value) {
    final newSettings = state.copyWith(soundEnabled: value);
    updateSettings(newSettings);
  }

  void toggleVibration(bool value) {
    final newSettings = state.copyWith(vibrationEnabled: value);
    updateSettings(newSettings);
  }
}

final notificationSettingsNotifierProvider =
    NotifierProvider<NotificationSettingsNotifier, NotificationSettings>(
  () => NotificationSettingsNotifier(),
);
