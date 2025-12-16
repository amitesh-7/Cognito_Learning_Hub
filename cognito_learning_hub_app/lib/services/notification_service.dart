// lib/services/notification_service.dart

import 'package:dio/dio.dart';
import '../config/api_config.dart';
import '../models/notification.dart';
import 'local_notification_service.dart';

class NotificationService {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: ApiConfig.apiUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));

  /// Get user notifications
  Future<List<AppNotification>> getNotifications({
    int page = 1,
    int limit = 20,
    bool? isRead,
  }) async {
    try {
      final response = await _dio.get('/notifications', queryParameters: {
        'page': page,
        'limit': limit,
        if (isRead != null) 'isRead': isRead,
      });

      final List notificationsData = response.data['notifications'] ?? [];
      final notifications =
          notificationsData.map((n) => AppNotification.fromJson(n)).toList();

      // Trigger local notifications for new unread notifications
      for (var notification in notifications) {
        if (!notification.isRead) {
          await _showLocalNotification(notification);
        }
      }

      return notifications;
    } catch (e) {
      throw Exception('Failed to fetch notifications: $e');
    }
  }

  /// Show local notification based on backend notification
  Future<void> _showLocalNotification(AppNotification notification) async {
    try {
      final referenceId = notification.data?['referenceId'] ?? notification.id;
      final notificationId = notification.id.hashCode.abs() % 100000;

      switch (notification.type) {
        case NotificationType.quizReminder:
          await LocalNotificationService.showQuizReminder(
            quizId: int.tryParse(referenceId) ?? notificationId,
            quizTitle: notification.title,
            scheduledTime: DateTime.now().add(const Duration(hours: 1)),
          );
          break;
        case NotificationType.achievement:
          await LocalNotificationService.showAchievementUnlocked(
            badgeName: notification.title,
            description: notification.body,
          );
          break;
        case NotificationType.friendRequest:
          await LocalNotificationService.showFriendRequest(
            userName: notification.title,
            userId: referenceId,
          );
          break;
        case NotificationType.duelChallenge:
          await LocalNotificationService.showDuelChallenge(
            opponentName: notification.title,
            duelId: referenceId,
          );
          break;
        default:
          // Generic notification
          await LocalNotificationService.showNotification(
            id: notificationId,
            title: notification.title,
            body: notification.body,
            payload: referenceId,
            channelId: 'general_notifications',
            channelName: 'General Notifications',
          );
      }
    } catch (e) {
      // Silently fail if local notification fails
      print('Failed to show local notification: $e');
    }
  }

  /// Get unread notification count
  Future<int> getUnreadCount() async {
    try {
      final response = await _dio.get('/notifications/unread/count');
      return response.data['count'] ?? 0;
    } catch (e) {
      throw Exception('Failed to fetch unread count: $e');
    }
  }

  /// Mark notification as read
  Future<void> markAsRead(String notificationId) async {
    try {
      await _dio.put('/notifications/$notificationId/read');
    } catch (e) {
      throw Exception('Failed to mark notification as read: $e');
    }
  }

  /// Mark all notifications as read
  Future<void> markAllAsRead() async {
    try {
      await _dio.put('/notifications/read-all');
    } catch (e) {
      throw Exception('Failed to mark all as read: $e');
    }
  }

  /// Delete notification
  Future<void> deleteNotification(String notificationId) async {
    try {
      await _dio.delete('/notifications/$notificationId');
    } catch (e) {
      throw Exception('Failed to delete notification: $e');
    }
  }

  /// Delete all notifications
  Future<void> deleteAllNotifications() async {
    try {
      await _dio.delete('/notifications/all');
    } catch (e) {
      throw Exception('Failed to delete all notifications: $e');
    }
  }

  /// Get notification settings
  Future<NotificationSettings> getSettings() async {
    try {
      final response = await _dio.get('/notifications/settings');
      return NotificationSettings.fromJson(response.data['settings'] ?? {});
    } catch (e) {
      throw Exception('Failed to fetch notification settings: $e');
    }
  }

  /// Update notification settings
  Future<void> updateSettings(NotificationSettings settings) async {
    try {
      await _dio.put('/notifications/settings', data: settings.toJson());
    } catch (e) {
      throw Exception('Failed to update notification settings: $e');
    }
  }

  /// Request notification permissions (for local notifications)
  Future<bool> requestPermissions() async {
    try {
      return await LocalNotificationService.requestPermissions();
    } catch (e) {
      print('Failed to request notification permissions: $e');
      return false;
    }
  }

  /// Send test notification (for debugging)
  Future<void> sendTestNotification() async {
    try {
      await _dio.post('/notifications/test');
    } catch (e) {
      throw Exception('Failed to send test notification: $e');
    }
  }

  /// Schedule a quiz reminder
  Future<void> scheduleQuizReminder({
    required String quizId,
    required String quizTitle,
    required DateTime reminderTime,
  }) async {
    try {
      // Notify backend to track the reminder
      await _dio.post('/notifications/schedule/quiz-reminder', data: {
        'quizId': quizId,
        'reminderTime': reminderTime.toIso8601String(),
      });

      // Schedule local notification
      await LocalNotificationService.showQuizReminder(
        quizId: int.tryParse(quizId) ??
            DateTime.now().millisecondsSinceEpoch % 100000,
        quizTitle: quizTitle,
        scheduledTime: reminderTime,
      );
    } catch (e) {
      throw Exception('Failed to schedule quiz reminder: $e');
    }
  }

  /// Cancel a scheduled reminder
  Future<void> cancelScheduledNotification(String notificationId) async {
    try {
      await _dio.delete('/notifications/schedule/$notificationId');
    } catch (e) {
      throw Exception('Failed to cancel notification: $e');
    }
  }
}
