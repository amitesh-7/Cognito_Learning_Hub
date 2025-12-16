// lib/models/social.dart

/// Friend Model
class Friend {
  final String id;
  final String userId;
  final String friendId;
  final FriendStatus status;
  final DateTime createdAt;
  final DateTime? acceptedAt;

  // Friend details (populated)
  final String? friendName;
  final String? friendEmail;
  final int? friendLevel;
  final int? friendXP;
  final String? friendAvatar;

  Friend({
    required this.id,
    required this.userId,
    required this.friendId,
    required this.status,
    required this.createdAt,
    this.acceptedAt,
    this.friendName,
    this.friendEmail,
    this.friendLevel,
    this.friendXP,
    this.friendAvatar,
  });

  factory Friend.fromJson(Map<String, dynamic> json) {
    return Friend(
      id: json['_id'] ?? json['id'] ?? '',
      userId: json['userId'] ?? '',
      friendId: json['friendId'] ?? '',
      status: FriendStatus.values.firstWhere(
        (e) => e.toString().split('.').last == (json['status'] ?? 'pending'),
        orElse: () => FriendStatus.pending,
      ),
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      acceptedAt: json['acceptedAt'] != null
          ? DateTime.parse(json['acceptedAt'])
          : null,
      friendName: json['friend']?['name'] ?? json['friendName'],
      friendEmail: json['friend']?['email'] ?? json['friendEmail'],
      friendLevel: json['friend']?['level'] ?? json['friendLevel'],
      friendXP: json['friend']?['xp'] ?? json['friendXP'],
      friendAvatar: json['friend']?['avatar'] ?? json['friendAvatar'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'friendId': friendId,
      'status': status.toString().split('.').last,
      'createdAt': createdAt.toIso8601String(),
      'acceptedAt': acceptedAt?.toIso8601String(),
    };
  }
}

enum FriendStatus {
  pending,
  accepted,
  blocked,
}

/// Social Post Model
class SocialPost {
  final String id;
  final String userId;
  final String content;
  final PostType type;
  final Map<String, dynamic>? metadata;
  final List<String> likes;
  final int commentsCount;
  final DateTime createdAt;

  // User details (populated)
  final String? userName;
  final String? userAvatar;
  final int? userLevel;

  SocialPost({
    required this.id,
    required this.userId,
    required this.content,
    required this.type,
    this.metadata,
    required this.likes,
    required this.commentsCount,
    required this.createdAt,
    this.userName,
    this.userAvatar,
    this.userLevel,
  });

  factory SocialPost.fromJson(Map<String, dynamic> json) {
    return SocialPost(
      id: json['_id'] ?? json['id'] ?? '',
      userId: json['userId'] ?? '',
      content: json['content'] ?? '',
      type: PostType.values.firstWhere(
        (e) => e.toString().split('.').last == (json['type'] ?? 'general'),
        orElse: () => PostType.general,
      ),
      metadata: json['metadata'] as Map<String, dynamic>?,
      likes: List<String>.from(json['likes'] ?? []),
      commentsCount: json['commentsCount'] ?? 0,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      userName: json['user']?['name'] ?? json['userName'],
      userAvatar: json['user']?['avatar'] ?? json['userAvatar'],
      userLevel: json['user']?['level'] ?? json['userLevel'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'content': content,
      'type': type.toString().split('.').last,
      'metadata': metadata,
      'likes': likes,
      'commentsCount': commentsCount,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  bool isLikedBy(String userId) => likes.contains(userId);
}

enum PostType {
  general,
  achievement,
  quiz,
  level,
  duel,
}

/// Comment Model
class Comment {
  final String id;
  final String postId;
  final String userId;
  final String content;
  final DateTime createdAt;

  // User details (populated)
  final String? userName;
  final String? userAvatar;

  Comment({
    required this.id,
    required this.postId,
    required this.userId,
    required this.content,
    required this.createdAt,
    this.userName,
    this.userAvatar,
  });

  factory Comment.fromJson(Map<String, dynamic> json) {
    return Comment(
      id: json['_id'] ?? json['id'] ?? '',
      postId: json['postId'] ?? '',
      userId: json['userId'] ?? '',
      content: json['content'] ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      userName: json['user']?['name'] ?? json['userName'],
      userAvatar: json['user']?['avatar'] ?? json['userAvatar'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'postId': postId,
      'userId': userId,
      'content': content,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

/// Activity Feed Item Model
class ActivityFeedItem {
  final String id;
  final String userId;
  final ActivityType type;
  final String title;
  final String description;
  final Map<String, dynamic>? data;
  final DateTime createdAt;

  // User details
  final String? userName;
  final String? userAvatar;

  ActivityFeedItem({
    required this.id,
    required this.userId,
    required this.type,
    required this.title,
    required this.description,
    this.data,
    required this.createdAt,
    this.userName,
    this.userAvatar,
  });

  factory ActivityFeedItem.fromJson(Map<String, dynamic> json) {
    return ActivityFeedItem(
      id: json['_id'] ?? json['id'] ?? '',
      userId: json['userId'] ?? '',
      type: ActivityType.values.firstWhere(
        (e) => e.toString().split('.').last == (json['type'] ?? 'general'),
        orElse: () => ActivityType.general,
      ),
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      data: json['data'] as Map<String, dynamic>?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      userName: json['user']?['name'] ?? json['userName'],
      userAvatar: json['user']?['avatar'] ?? json['userAvatar'],
    );
  }
}

enum ActivityType {
  general,
  friendRequest,
  friendAccepted,
  achievement,
  levelUp,
  quizCompleted,
  duelWon,
  questCompleted,
}
