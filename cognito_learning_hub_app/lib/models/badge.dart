// lib/models/badge.dart

class Badge {
  final String id;
  final String title;
  final String description;
  final String imageUrl;
  final BadgeRarity rarity;
  final int tier;
  final List<String> effects;
  final int pointsValue;
  final BadgeCategory category;
  final Map<String, dynamic> requirements;
  final bool isCollected;
  final DateTime? collectedAt;
  final int totalOwners;
  final bool isTradeable;
  final bool isShowcased;
  final DateTime createdAt;

  Badge({
    required this.id,
    required this.title,
    required this.description,
    required this.imageUrl,
    required this.rarity,
    required this.tier,
    required this.effects,
    required this.pointsValue,
    required this.category,
    required this.requirements,
    this.isCollected = false,
    this.collectedAt,
    this.totalOwners = 0,
    this.isTradeable = true,
    this.isShowcased = false,
    required this.createdAt,
  });

  factory Badge.fromJson(Map<String, dynamic> json) {
    return Badge(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      imageUrl: json['imageUrl'] ?? '',
      rarity: BadgeRarity.values.firstWhere(
        (e) => e.name == json['rarity'],
        orElse: () => BadgeRarity.common,
      ),
      tier: json['tier'] ?? 1,
      effects: List<String>.from(json['effects'] ?? []),
      pointsValue: json['pointsValue'] ?? 0,
      category: BadgeCategory.values.firstWhere(
        (e) => e.name == json['category'],
        orElse: () => BadgeCategory.general,
      ),
      requirements: json['requirements'] ?? {},
      isCollected: json['isCollected'] ?? false,
      collectedAt: json['collectedAt'] != null
          ? DateTime.parse(json['collectedAt'])
          : null,
      totalOwners: json['totalOwners'] ?? 0,
      isTradeable: json['isTradeable'] ?? true,
      isShowcased: json['isShowcased'] ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'imageUrl': imageUrl,
      'rarity': rarity.name,
      'tier': tier,
      'effects': effects,
      'pointsValue': pointsValue,
      'category': category.name,
      'requirements': requirements,
      'isCollected': isCollected,
      'collectedAt': collectedAt?.toIso8601String(),
      'totalOwners': totalOwners,
      'isTradeable': isTradeable,
      'isShowcased': isShowcased,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  Badge copyWith({
    String? id,
    String? title,
    String? description,
    String? imageUrl,
    BadgeRarity? rarity,
    int? tier,
    List<String>? effects,
    int? pointsValue,
    BadgeCategory? category,
    Map<String, dynamic>? requirements,
    bool? isCollected,
    DateTime? collectedAt,
    int? totalOwners,
    bool? isTradeable,
    bool? isShowcased,
    DateTime? createdAt,
  }) {
    return Badge(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      rarity: rarity ?? this.rarity,
      tier: tier ?? this.tier,
      effects: effects ?? this.effects,
      pointsValue: pointsValue ?? this.pointsValue,
      category: category ?? this.category,
      requirements: requirements ?? this.requirements,
      isCollected: isCollected ?? this.isCollected,
      collectedAt: collectedAt ?? this.collectedAt,
      totalOwners: totalOwners ?? this.totalOwners,
      isTradeable: isTradeable ?? this.isTradeable,
      isShowcased: isShowcased ?? this.isShowcased,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  String get rarityLabel {
    return rarity.name.toUpperCase();
  }

  String get tierLabel {
    return 'Tier $tier';
  }
}

enum BadgeRarity {
  common,
  uncommon,
  rare,
  epic,
  legendary,
  mythic,
}

enum BadgeCategory {
  general,
  quiz,
  achievement,
  social,
  learning,
  special,
}

class BadgeCollection {
  final String userId;
  final List<Badge> badges;
  final List<Badge> showcaseBadges;
  final int totalBadges;
  final int commonCount;
  final int uncommonCount;
  final int rareCount;
  final int epicCount;
  final int legendaryCount;
  final int mythicCount;
  final int totalPoints;

  BadgeCollection({
    required this.userId,
    required this.badges,
    required this.showcaseBadges,
    required this.totalBadges,
    this.commonCount = 0,
    this.uncommonCount = 0,
    this.rareCount = 0,
    this.epicCount = 0,
    this.legendaryCount = 0,
    this.mythicCount = 0,
    this.totalPoints = 0,
  });

  factory BadgeCollection.fromJson(Map<String, dynamic> json) {
    return BadgeCollection(
      userId: json['userId'] ?? '',
      badges:
          (json['badges'] as List?)?.map((b) => Badge.fromJson(b)).toList() ??
              [],
      showcaseBadges: (json['showcaseBadges'] as List?)
              ?.map((b) => Badge.fromJson(b))
              .toList() ??
          [],
      totalBadges: json['totalBadges'] ?? 0,
      commonCount: json['commonCount'] ?? 0,
      uncommonCount: json['uncommonCount'] ?? 0,
      rareCount: json['rareCount'] ?? 0,
      epicCount: json['epicCount'] ?? 0,
      legendaryCount: json['legendaryCount'] ?? 0,
      mythicCount: json['mythicCount'] ?? 0,
      totalPoints: json['totalPoints'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'badges': badges.map((b) => b.toJson()).toList(),
      'showcaseBadges': showcaseBadges.map((b) => b.toJson()).toList(),
      'totalBadges': totalBadges,
      'commonCount': commonCount,
      'uncommonCount': uncommonCount,
      'rareCount': rareCount,
      'epicCount': epicCount,
      'legendaryCount': legendaryCount,
      'mythicCount': mythicCount,
      'totalPoints': totalPoints,
    };
  }
}

class BadgeTrade {
  final String id;
  final String fromUserId;
  final String fromUserName;
  final String toUserId;
  final String toUserName;
  final Badge badge;
  final TradeStatus status;
  final String? message;
  final DateTime createdAt;
  final DateTime? completedAt;

  BadgeTrade({
    required this.id,
    required this.fromUserId,
    required this.fromUserName,
    required this.toUserId,
    required this.toUserName,
    required this.badge,
    required this.status,
    this.message,
    required this.createdAt,
    this.completedAt,
  });

  factory BadgeTrade.fromJson(Map<String, dynamic> json) {
    return BadgeTrade(
      id: json['_id'] ?? json['id'] ?? '',
      fromUserId: json['fromUserId'] ?? '',
      fromUserName: json['fromUserName'] ?? '',
      toUserId: json['toUserId'] ?? '',
      toUserName: json['toUserName'] ?? '',
      badge: Badge.fromJson(json['badge'] ?? {}),
      status: TradeStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => TradeStatus.pending,
      ),
      message: json['message'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      completedAt: json['completedAt'] != null
          ? DateTime.parse(json['completedAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'fromUserId': fromUserId,
      'fromUserName': fromUserName,
      'toUserId': toUserId,
      'toUserName': toUserName,
      'badge': badge.toJson(),
      'status': status.name,
      'message': message,
      'createdAt': createdAt.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
    };
  }
}

enum TradeStatus {
  pending,
  accepted,
  rejected,
  cancelled,
}
