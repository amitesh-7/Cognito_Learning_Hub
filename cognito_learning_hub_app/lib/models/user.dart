// lib/models/user.dart

class User {
  final String id;
  final String name;
  final String email;
  final String role; // Student, Teacher, Moderator, Admin
  final String? picture;
  final String? googleId;
  final String status; // online, offline, away
  final DateTime? lastSeen;
  final int points;
  final int level;
  final String rank;
  final List<String> badges;
  final int quizzesTaken;
  final int quizzesCreated;
  final double averageScore;
  final int currentStreak;
  final int longestStreak;
  final DateTime createdAt;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.role = 'Student',
    this.picture,
    this.googleId,
    this.status = 'offline',
    this.lastSeen,
    this.points = 0,
    this.level = 1,
    this.rank = 'Beginner',
    this.badges = const [],
    this.quizzesTaken = 0,
    this.quizzesCreated = 0,
    this.averageScore = 0.0,
    this.currentStreak = 0,
    this.longestStreak = 0,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'Student',
      picture: json['picture'],
      googleId: json['googleId'],
      status: json['status'] ?? 'offline',
      lastSeen: json['lastSeen'] != null
          ? DateTime.parse(json['lastSeen'])
          : null,
      points: json['points'] ?? 0,
      level: json['level'] ?? 1,
      rank: json['rank'] ?? 'Beginner',
      badges: json['badges'] != null ? List<String>.from(json['badges']) : [],
      quizzesTaken: json['quizzesTaken'] ?? 0,
      quizzesCreated: json['quizzesCreated'] ?? 0,
      averageScore: (json['averageScore'] ?? 0).toDouble(),
      currentStreak: json['currentStreak'] ?? 0,
      longestStreak: json['longestStreak'] ?? 0,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'role': role,
    'picture': picture,
    'googleId': googleId,
    'status': status,
    'lastSeen': lastSeen?.toIso8601String(),
    'points': points,
    'level': level,
    'rank': rank,
    'badges': badges,
    'quizzesTaken': quizzesTaken,
    'quizzesCreated': quizzesCreated,
    'averageScore': averageScore,
    'currentStreak': currentStreak,
    'longestStreak': longestStreak,
    'createdAt': createdAt.toIso8601String(),
  };

  User copyWith({
    String? id,
    String? name,
    String? email,
    String? role,
    String? picture,
    String? googleId,
    String? status,
    DateTime? lastSeen,
    int? points,
    int? level,
    String? rank,
    List<String>? badges,
    int? quizzesTaken,
    int? quizzesCreated,
    double? averageScore,
    int? currentStreak,
    int? longestStreak,
    DateTime? createdAt,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      role: role ?? this.role,
      picture: picture ?? this.picture,
      googleId: googleId ?? this.googleId,
      status: status ?? this.status,
      lastSeen: lastSeen ?? this.lastSeen,
      points: points ?? this.points,
      level: level ?? this.level,
      rank: rank ?? this.rank,
      badges: badges ?? this.badges,
      quizzesTaken: quizzesTaken ?? this.quizzesTaken,
      quizzesCreated: quizzesCreated ?? this.quizzesCreated,
      averageScore: averageScore ?? this.averageScore,
      currentStreak: currentStreak ?? this.currentStreak,
      longestStreak: longestStreak ?? this.longestStreak,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  bool get isTeacher =>
      role == 'Teacher' || role == 'Admin' || role == 'Moderator';
  bool get isAdmin => role == 'Admin';
  bool get isModerator => role == 'Moderator' || role == 'Admin';
}
