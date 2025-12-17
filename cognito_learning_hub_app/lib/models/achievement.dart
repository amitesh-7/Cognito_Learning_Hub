// lib/models/achievement.dart

class Achievement {
  final String id;
  final String title;
  final String description;
  final String icon;
  final String category;
  final int pointsRequired;
  final int currentProgress;
  final bool unlocked;
  final DateTime? unlockedAt;
  final String rarity; // common, rare, epic, legendary

  Achievement({
    required this.id,
    required this.title,
    required this.description,
    required this.icon,
    required this.category,
    required this.pointsRequired,
    required this.currentProgress,
    required this.unlocked,
    this.unlockedAt,
    this.rarity = 'common',
  });

  factory Achievement.fromJson(Map<String, dynamic> json) {
    return Achievement(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['name'] ?? json['title'] ?? '',
      description: json['description'] ?? '',
      icon: json['icon'] ?? '🏆',
      category: json['type'] ?? json['category'] ?? 'general',
      pointsRequired: json['points'] ??
          json['pointsRequired'] ??
          json['criteria']?['target'] ??
          0,
      currentProgress: json['currentProgress'] ?? json['currentValue'] ?? 0,
      unlocked:
          json['unlocked'] ?? json['isCompleted'] ?? json['earned'] ?? false,
      unlockedAt: json['unlockedAt'] != null
          ? DateTime.parse(json['unlockedAt'])
          : json['earnedAt'] != null
              ? DateTime.parse(json['earnedAt'])
              : null,
      rarity: json['rarity'] ?? 'common',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'icon': icon,
      'category': category,
      'pointsRequired': pointsRequired,
      'currentProgress': currentProgress,
      'unlocked': unlocked,
      'unlockedAt': unlockedAt?.toIso8601String(),
      'rarity': rarity,
    };
  }

  double get progressPercentage {
    if (pointsRequired == 0) return 0;
    return (currentProgress / pointsRequired).clamp(0.0, 1.0);
  }

  Achievement copyWith({
    String? id,
    String? title,
    String? description,
    String? icon,
    String? category,
    int? pointsRequired,
    int? currentProgress,
    bool? unlocked,
    DateTime? unlockedAt,
    String? rarity,
  }) {
    return Achievement(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      icon: icon ?? this.icon,
      category: category ?? this.category,
      pointsRequired: pointsRequired ?? this.pointsRequired,
      currentProgress: currentProgress ?? this.currentProgress,
      unlocked: unlocked ?? this.unlocked,
      unlockedAt: unlockedAt ?? this.unlockedAt,
      rarity: rarity ?? this.rarity,
    );
  }
}

class GamificationStats {
  final int totalPoints;
  final int level;
  final int currentLevelPoints;
  final int nextLevelPoints;
  final int streak;
  final int longestStreak;
  final int quizzesCompleted;
  final int questsCompleted;
  final int achievementsUnlocked;
  final int totalAchievements;
  final Map<String, int> categoryStats;

  GamificationStats({
    required this.totalPoints,
    required this.level,
    required this.currentLevelPoints,
    required this.nextLevelPoints,
    required this.streak,
    required this.longestStreak,
    required this.quizzesCompleted,
    required this.questsCompleted,
    required this.achievementsUnlocked,
    required this.totalAchievements,
    this.categoryStats = const {},
  });

  factory GamificationStats.fromJson(Map<String, dynamic> json) {
    print('🔍 Parsing GamificationStats:');
    print(
        '  currentStreak: ${json['currentStreak']}, streak: ${json['streak']}');
    print(
        '  achievementsUnlocked: ${json['achievementsUnlocked']}, unlockedAchievements: ${json['unlockedAchievements']}');

    return GamificationStats(
      totalPoints: json['totalPoints'] ?? json['points'] ?? 0,
      level: json['level'] ?? 1,
      currentLevelPoints:
          json['currentLevelPoints'] ?? json['pointsToNextLevel'] ?? 0,
      nextLevelPoints: json['nextLevelPoints'] ?? 100,
      streak: json['currentStreak'] ?? json['streak'] ?? 0,
      longestStreak: json['longestStreak'] ?? json['bestStreak'] ?? 0,
      quizzesCompleted:
          json['quizzesCompleted'] ?? json['totalQuizzesTaken'] ?? 0,
      questsCompleted: json['questsCompleted'] ?? 0,
      achievementsUnlocked:
          json['achievementsUnlocked'] ?? json['unlockedAchievements'] ?? 0,
      totalAchievements: json['totalAchievements'] ?? 0,
      categoryStats: json['categoryStats'] != null
          ? Map<String, int>.from(json['categoryStats'])
          : {},
    );
  }

  double get levelProgress {
    if (nextLevelPoints == 0) return 0;
    return (currentLevelPoints / nextLevelPoints).clamp(0.0, 1.0);
  }
}
