// lib/models/study_material.dart

enum MaterialType {
  document,
  video,
  practice,
  article,
  link,
}

enum MaterialDifficulty {
  beginner,
  intermediate,
  advanced,
}

class StudyMaterial {
  final String id;
  final String title;
  final String description;
  final MaterialType type;
  final String? thumbnailUrl;
  final String? fileUrl;
  final String? videoUrl;
  final String? externalLink;
  final String categoryId;
  final String? categoryName;
  final MaterialDifficulty difficulty;
  final int durationMinutes;
  final List<String> tags;
  final String authorId;
  final String? authorName;
  final int viewCount;
  final int downloadCount;
  final double rating;
  final int ratingCount;
  final bool isBookmarked;
  final bool isPremium;
  final DateTime createdAt;
  final DateTime updatedAt;

  StudyMaterial({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    this.thumbnailUrl,
    this.fileUrl,
    this.videoUrl,
    this.externalLink,
    required this.categoryId,
    this.categoryName,
    required this.difficulty,
    required this.durationMinutes,
    required this.tags,
    required this.authorId,
    this.authorName,
    this.viewCount = 0,
    this.downloadCount = 0,
    this.rating = 0.0,
    this.ratingCount = 0,
    this.isBookmarked = false,
    this.isPremium = false,
    required this.createdAt,
    required this.updatedAt,
  });

  factory StudyMaterial.fromJson(Map<String, dynamic> json) {
    return StudyMaterial(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      type: MaterialType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => MaterialType.document,
      ),
      thumbnailUrl: json['thumbnailUrl'],
      fileUrl: json['fileUrl'],
      videoUrl: json['videoUrl'],
      externalLink: json['externalLink'],
      categoryId: json['categoryId'] ?? '',
      categoryName: json['categoryName'] ?? json['category']?['name'],
      difficulty: MaterialDifficulty.values.firstWhere(
        (e) => e.name == json['difficulty'],
        orElse: () => MaterialDifficulty.intermediate,
      ),
      durationMinutes: json['durationMinutes'] ?? 0,
      tags: List<String>.from(json['tags'] ?? []),
      authorId: json['authorId'] ?? json['author']?['_id'] ?? '',
      authorName: json['authorName'] ?? json['author']?['name'],
      viewCount: json['viewCount'] ?? 0,
      downloadCount: json['downloadCount'] ?? 0,
      rating: (json['rating'] ?? 0).toDouble(),
      ratingCount: json['ratingCount'] ?? 0,
      isBookmarked: json['isBookmarked'] ?? false,
      isPremium: json['isPremium'] ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'type': type.name,
      'thumbnailUrl': thumbnailUrl,
      'fileUrl': fileUrl,
      'videoUrl': videoUrl,
      'externalLink': externalLink,
      'categoryId': categoryId,
      'categoryName': categoryName,
      'difficulty': difficulty.name,
      'durationMinutes': durationMinutes,
      'tags': tags,
      'authorId': authorId,
      'authorName': authorName,
      'viewCount': viewCount,
      'downloadCount': downloadCount,
      'rating': rating,
      'ratingCount': ratingCount,
      'isBookmarked': isBookmarked,
      'isPremium': isPremium,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  StudyMaterial copyWith({
    String? id,
    String? title,
    String? description,
    MaterialType? type,
    String? thumbnailUrl,
    String? fileUrl,
    String? videoUrl,
    String? externalLink,
    String? categoryId,
    String? categoryName,
    MaterialDifficulty? difficulty,
    int? durationMinutes,
    List<String>? tags,
    String? authorId,
    String? authorName,
    int? viewCount,
    int? downloadCount,
    double? rating,
    int? ratingCount,
    bool? isBookmarked,
    bool? isPremium,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return StudyMaterial(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      type: type ?? this.type,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
      fileUrl: fileUrl ?? this.fileUrl,
      videoUrl: videoUrl ?? this.videoUrl,
      externalLink: externalLink ?? this.externalLink,
      categoryId: categoryId ?? this.categoryId,
      categoryName: categoryName ?? this.categoryName,
      difficulty: difficulty ?? this.difficulty,
      durationMinutes: durationMinutes ?? this.durationMinutes,
      tags: tags ?? this.tags,
      authorId: authorId ?? this.authorId,
      authorName: authorName ?? this.authorName,
      viewCount: viewCount ?? this.viewCount,
      downloadCount: downloadCount ?? this.downloadCount,
      rating: rating ?? this.rating,
      ratingCount: ratingCount ?? this.ratingCount,
      isBookmarked: isBookmarked ?? this.isBookmarked,
      isPremium: isPremium ?? this.isPremium,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  String get durationFormatted {
    if (durationMinutes < 60) {
      return '$durationMinutes min';
    }
    final hours = durationMinutes ~/ 60;
    final minutes = durationMinutes % 60;
    return minutes > 0 ? '${hours}h ${minutes}m' : '${hours}h';
  }
}

class MaterialProgress {
  final String id;
  final String materialId;
  final String userId;
  final double progressPercentage;
  final int timeSpentSeconds;
  final bool isCompleted;
  final DateTime lastAccessedAt;
  final DateTime? completedAt;

  MaterialProgress({
    required this.id,
    required this.materialId,
    required this.userId,
    required this.progressPercentage,
    required this.timeSpentSeconds,
    required this.isCompleted,
    required this.lastAccessedAt,
    this.completedAt,
  });

  factory MaterialProgress.fromJson(Map<String, dynamic> json) {
    return MaterialProgress(
      id: json['_id'] ?? json['id'] ?? '',
      materialId: json['materialId'] ?? '',
      userId: json['userId'] ?? '',
      progressPercentage: (json['progressPercentage'] ?? 0).toDouble(),
      timeSpentSeconds: json['timeSpentSeconds'] ?? 0,
      isCompleted: json['isCompleted'] ?? false,
      lastAccessedAt: json['lastAccessedAt'] != null
          ? DateTime.parse(json['lastAccessedAt'])
          : DateTime.now(),
      completedAt: json['completedAt'] != null
          ? DateTime.parse(json['completedAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'materialId': materialId,
      'userId': userId,
      'progressPercentage': progressPercentage,
      'timeSpentSeconds': timeSpentSeconds,
      'isCompleted': isCompleted,
      'lastAccessedAt': lastAccessedAt.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
    };
  }
}

class MaterialBookmark {
  final String id;
  final String materialId;
  final String userId;
  final String? note;
  final DateTime createdAt;

  MaterialBookmark({
    required this.id,
    required this.materialId,
    required this.userId,
    this.note,
    required this.createdAt,
  });

  factory MaterialBookmark.fromJson(Map<String, dynamic> json) {
    return MaterialBookmark(
      id: json['_id'] ?? json['id'] ?? '',
      materialId: json['materialId'] ?? '',
      userId: json['userId'] ?? '',
      note: json['note'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'materialId': materialId,
      'userId': userId,
      'note': note,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
