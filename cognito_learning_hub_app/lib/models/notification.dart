// lib/models/notification.dart

enum NotificationType {
  quizReminder,
  achievement,
  duelChallenge,
  friendRequest,
  friendAccepted,
  comment,
  like,
  mention,
  liveQuiz,
  meeting,
  system,
}

class AppNotification {
  final String id;
  final String userId;
  final NotificationType type;
  final String title;
  final String body;
  final Map<String, dynamic>? data;
  final bool isRead;
  final DateTime createdAt;
  final DateTime? readAt;

  AppNotification({
    required this.id,
    required this.userId,
    required this.type,
    required this.title,
    required this.body,
    this.data,
    this.isRead = false,
    required this.createdAt,
    this.readAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['_id'] ?? json['id'] ?? '',
      userId: json['userId'] ?? '',
      type: NotificationType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => NotificationType.system,
      ),
      title: json['title'] ?? '',
      body: json['body'] ?? '',
      data: json['data'],
      isRead: json['isRead'] ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      readAt: json['readAt'] != null ? DateTime.parse(json['readAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'type': type.name,
      'title': title,
      'body': body,
      'data': data,
      'isRead': isRead,
      'createdAt': createdAt.toIso8601String(),
      'readAt': readAt?.toIso8601String(),
    };
  }

  AppNotification copyWith({
    String? id,
    String? userId,
    NotificationType? type,
    String? title,
    String? body,
    Map<String, dynamic>? data,
    bool? isRead,
    DateTime? createdAt,
    DateTime? readAt,
  }) {
    return AppNotification(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      type: type ?? this.type,
      title: title ?? this.title,
      body: body ?? this.body,
      data: data ?? this.data,
      isRead: isRead ?? this.isRead,
      createdAt: createdAt ?? this.createdAt,
      readAt: readAt ?? this.readAt,
    );
  }

  String get timeAgo {
    final now = DateTime.now();
    final difference = now.difference(createdAt);

    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inHours < 1) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inDays < 1) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return '${createdAt.day}/${createdAt.month}/${createdAt.year}';
    }
  }
}

class NotificationSettings {
  final bool quizReminders;
  final bool achievements;
  final bool duelChallenges;
  final bool friendRequests;
  final bool comments;
  final bool likes;
  final bool liveQuizzes;
  final bool meetings;
  final bool systemNotifications;
  final bool soundEnabled;
  final bool vibrationEnabled;

  NotificationSettings({
    this.quizReminders = true,
    this.achievements = true,
    this.duelChallenges = true,
    this.friendRequests = true,
    this.comments = true,
    this.likes = true,
    this.liveQuizzes = true,
    this.meetings = true,
    this.systemNotifications = true,
    this.soundEnabled = true,
    this.vibrationEnabled = true,
  });

  factory NotificationSettings.fromJson(Map<String, dynamic> json) {
    return NotificationSettings(
      quizReminders: json['quizReminders'] ?? true,
      achievements: json['achievements'] ?? true,
      duelChallenges: json['duelChallenges'] ?? true,
      friendRequests: json['friendRequests'] ?? true,
      comments: json['comments'] ?? true,
      likes: json['likes'] ?? true,
      liveQuizzes: json['liveQuizzes'] ?? true,
      meetings: json['meetings'] ?? true,
      systemNotifications: json['systemNotifications'] ?? true,
      soundEnabled: json['soundEnabled'] ?? true,
      vibrationEnabled: json['vibrationEnabled'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'quizReminders': quizReminders,
      'achievements': achievements,
      'duelChallenges': duelChallenges,
      'friendRequests': friendRequests,
      'comments': comments,
      'likes': likes,
      'liveQuizzes': liveQuizzes,
      'meetings': meetings,
      'systemNotifications': systemNotifications,
      'soundEnabled': soundEnabled,
      'vibrationEnabled': vibrationEnabled,
    };
  }

  NotificationSettings copyWith({
    bool? quizReminders,
    bool? achievements,
    bool? duelChallenges,
    bool? friendRequests,
    bool? comments,
    bool? likes,
    bool? liveQuizzes,
    bool? meetings,
    bool? systemNotifications,
    bool? soundEnabled,
    bool? vibrationEnabled,
  }) {
    return NotificationSettings(
      quizReminders: quizReminders ?? this.quizReminders,
      achievements: achievements ?? this.achievements,
      duelChallenges: duelChallenges ?? this.duelChallenges,
      friendRequests: friendRequests ?? this.friendRequests,
      comments: comments ?? this.comments,
      likes: likes ?? this.likes,
      liveQuizzes: liveQuizzes ?? this.liveQuizzes,
      meetings: meetings ?? this.meetings,
      systemNotifications: systemNotifications ?? this.systemNotifications,
      soundEnabled: soundEnabled ?? this.soundEnabled,
      vibrationEnabled: vibrationEnabled ?? this.vibrationEnabled,
    );
  }
}
