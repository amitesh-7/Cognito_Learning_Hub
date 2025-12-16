// lib/models/quest.dart

class Quest {
  final String id;
  final String title;
  final String description;
  final String category;
  final int difficulty;
  final int rewardPoints;
  final int rewardXp;
  final List<QuestTask> tasks;
  final DateTime? startDate;
  final DateTime? endDate;
  final bool isActive;
  final bool isCompleted;
  final DateTime? completedAt;
  final String? badge;

  Quest({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.difficulty,
    required this.rewardPoints,
    required this.rewardXp,
    required this.tasks,
    this.startDate,
    this.endDate,
    required this.isActive,
    required this.isCompleted,
    this.completedAt,
    this.badge,
  });

  factory Quest.fromJson(Map<String, dynamic> json) {
    return Quest(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? 'general',
      difficulty: json['difficulty'] ?? 1,
      rewardPoints: json['rewardPoints'] ?? json['points'] ?? 0,
      rewardXp: json['rewardXp'] ?? json['xp'] ?? 0,
      tasks: json['tasks'] != null
          ? (json['tasks'] as List).map((t) => QuestTask.fromJson(t)).toList()
          : [],
      startDate:
          json['startDate'] != null ? DateTime.parse(json['startDate']) : null,
      endDate: json['endDate'] != null ? DateTime.parse(json['endDate']) : null,
      isActive: json['isActive'] ?? json['active'] ?? false,
      isCompleted: json['isCompleted'] ?? json['completed'] ?? false,
      completedAt: json['completedAt'] != null
          ? DateTime.parse(json['completedAt'])
          : null,
      badge: json['badge'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'category': category,
      'difficulty': difficulty,
      'rewardPoints': rewardPoints,
      'rewardXp': rewardXp,
      'tasks': tasks.map((t) => t.toJson()).toList(),
      'startDate': startDate?.toIso8601String(),
      'endDate': endDate?.toIso8601String(),
      'isActive': isActive,
      'isCompleted': isCompleted,
      'completedAt': completedAt?.toIso8601String(),
      'badge': badge,
    };
  }

  double get progressPercentage {
    if (tasks.isEmpty) return 0;
    final completedTasks = tasks.where((t) => t.isCompleted).length;
    return completedTasks / tasks.length;
  }

  int get completedTasksCount {
    return tasks.where((t) => t.isCompleted).length;
  }

  String get difficultyLabel {
    switch (difficulty) {
      case 1:
        return 'Easy';
      case 2:
        return 'Medium';
      case 3:
        return 'Hard';
      case 4:
        return 'Expert';
      default:
        return 'Normal';
    }
  }

  bool get isExpired {
    return endDate != null && DateTime.now().isAfter(endDate!);
  }
}

class QuestTask {
  final String id;
  final String description;
  final String type; // quiz, streak, points, achievement
  final int targetValue;
  final int currentValue;
  final bool isCompleted;

  QuestTask({
    required this.id,
    required this.description,
    required this.type,
    required this.targetValue,
    required this.currentValue,
    required this.isCompleted,
  });

  factory QuestTask.fromJson(Map<String, dynamic> json) {
    return QuestTask(
      id: json['_id'] ?? json['id'] ?? '',
      description: json['description'] ?? '',
      type: json['type'] ?? 'general',
      targetValue: json['targetValue'] ?? json['target'] ?? 1,
      currentValue: json['currentValue'] ?? json['current'] ?? 0,
      isCompleted: json['isCompleted'] ?? json['completed'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'description': description,
      'type': type,
      'targetValue': targetValue,
      'currentValue': currentValue,
      'isCompleted': isCompleted,
    };
  }

  double get progressPercentage {
    if (targetValue == 0) return 0;
    return (currentValue / targetValue).clamp(0.0, 1.0);
  }
}
