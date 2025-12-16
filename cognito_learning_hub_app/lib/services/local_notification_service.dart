// lib/services/local_notification_service.dart

import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;

class LocalNotificationService {
  static final FlutterLocalNotificationsPlugin _notifications =
      FlutterLocalNotificationsPlugin();

  static bool _initialized = false;

  // Initialize notifications
  static Future<void> initialize() async {
    if (_initialized) return;

    // Initialize timezone
    tz.initializeTimeZones();

    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const DarwinInitializationSettings iosSettings =
        DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const InitializationSettings initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    // Create notification channels for Android
    await _createNotificationChannels();

    _initialized = true;
  }

  // Create notification channels
  static Future<void> _createNotificationChannels() async {
    const List<AndroidNotificationChannel> channels = [
      AndroidNotificationChannel(
        'quiz_notifications',
        'Quiz Notifications',
        description: 'Notifications for quiz reminders and results',
        importance: Importance.high,
        enableVibration: true,
        playSound: true,
      ),
      AndroidNotificationChannel(
        'achievement_notifications',
        'Achievement Notifications',
        description: 'Notifications for achievements and badges',
        importance: Importance.max,
        enableVibration: true,
        playSound: true,
      ),
      AndroidNotificationChannel(
        'social_notifications',
        'Social Notifications',
        description: 'Notifications for friend requests and social activity',
        importance: Importance.high,
        enableVibration: true,
        playSound: true,
      ),
      AndroidNotificationChannel(
        'duel_notifications',
        'Duel Notifications',
        description: 'Notifications for duel challenges',
        importance: Importance.high,
        enableVibration: true,
        playSound: true,
      ),
    ];

    final androidPlugin = _notifications.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();

    if (androidPlugin != null) {
      for (final channel in channels) {
        await androidPlugin.createNotificationChannel(channel);
      }
    }
  }

  // Show instant notification
  static Future<void> showNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
    String channelId = 'quiz_notifications',
    String channelName = 'Quiz Notifications',
  }) async {
    await _notifications.show(
      id,
      title,
      body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          channelId,
          channelName,
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
        ),
        iOS: const DarwinNotificationDetails(),
      ),
      payload: payload,
    );
  }

  // Schedule notification
  static Future<void> scheduleNotification({
    required int id,
    required String title,
    required String body,
    required DateTime scheduledTime,
    String? payload,
    String channelId = 'quiz_notifications',
    String channelName = 'Quiz Notifications',
  }) async {
    await _notifications.zonedSchedule(
      id,
      title,
      body,
      tz.TZDateTime.from(scheduledTime, tz.local),
      NotificationDetails(
        android: AndroidNotificationDetails(
          channelId,
          channelName,
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
        ),
        iOS: const DarwinNotificationDetails(),
      ),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      payload: payload,
    );
  }

  // Show quiz reminder notification
  static Future<void> showQuizReminder({
    required int quizId,
    required String quizTitle,
    required DateTime scheduledTime,
  }) async {
    await scheduleNotification(
      id: quizId,
      title: 'Quiz Reminder',
      body: 'Don\'t forget about "$quizTitle"!',
      scheduledTime: scheduledTime,
      payload: 'quiz:$quizId',
      channelId: 'quiz_notifications',
      channelName: 'Quiz Notifications',
    );
  }

  // Show achievement notification
  static Future<void> showAchievementUnlocked({
    required String badgeName,
    required String description,
  }) async {
    await showNotification(
      id: DateTime.now().millisecondsSinceEpoch % 100000,
      title: '🏆 Achievement Unlocked!',
      body: '$badgeName - $description',
      payload: 'achievement',
      channelId: 'achievement_notifications',
      channelName: 'Achievement Notifications',
    );
  }

  // Show friend request notification
  static Future<void> showFriendRequest({
    required String userName,
    required String userId,
  }) async {
    await showNotification(
      id: DateTime.now().millisecondsSinceEpoch % 100000,
      title: 'Friend Request',
      body: '$userName wants to be your friend!',
      payload: 'friend_request:$userId',
      channelId: 'social_notifications',
      channelName: 'Social Notifications',
    );
  }

  // Show duel challenge notification
  static Future<void> showDuelChallenge({
    required String opponentName,
    required String duelId,
  }) async {
    await showNotification(
      id: DateTime.now().millisecondsSinceEpoch % 100000,
      title: 'Duel Challenge!',
      body: '$opponentName challenges you to a duel!',
      payload: 'duel:$duelId',
      channelId: 'duel_notifications',
      channelName: 'Duel Notifications',
    );
  }

  // Cancel notification
  static Future<void> cancelNotification(int id) async {
    await _notifications.cancel(id);
  }

  // Cancel all notifications
  static Future<void> cancelAllNotifications() async {
    await _notifications.cancelAll();
  }

  // Handle notification tap
  static void _onNotificationTapped(NotificationResponse response) {
    final String? payload = response.payload;
    if (payload == null) return;

    // Parse payload and navigate
    if (payload.startsWith('quiz:')) {
      final quizId = payload.replaceFirst('quiz:', '');
      print('Navigate to quiz: $quizId');
      // TODO: Use go_router to navigate
    } else if (payload == 'achievement') {
      print('Navigate to achievements');
      // TODO: Navigate to achievements screen
    } else if (payload.startsWith('friend_request:')) {
      final userId = payload.replaceFirst('friend_request:', '');
      print('Navigate to friend request: $userId');
      // TODO: Navigate to social screen
    } else if (payload.startsWith('duel:')) {
      final duelId = payload.replaceFirst('duel:', '');
      print('Navigate to duel: $duelId');
      // TODO: Navigate to duel screen
    }
  }

  // Request permissions (iOS)
  static Future<bool> requestPermissions() async {
    final androidPlugin = _notifications.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();

    if (androidPlugin != null) {
      final granted = await androidPlugin.requestNotificationsPermission();
      return granted ?? false;
    }

    final iosPlugin = _notifications.resolvePlatformSpecificImplementation<
        IOSFlutterLocalNotificationsPlugin>();

    if (iosPlugin != null) {
      final granted = await iosPlugin.requestPermissions(
        alert: true,
        badge: true,
        sound: true,
      );
      return granted ?? false;
    }

    return false;
  }
}
