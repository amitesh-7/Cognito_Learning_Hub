// lib/models/quiz.dart
import 'dart:ui';

class Question {
  final String id;
  final String question;
  final String type; // multiple-choice, true-false, descriptive
  final List<String> options;
  final String correctAnswer;
  final String? explanation;
  final int points;
  final int timeLimit; // in seconds
  final String difficulty; // Easy, Medium, Hard, Expert
  final String? imageUrl;

  Question({
    required this.id,
    required this.question,
    this.type = 'multiple-choice',
    required this.options,
    required this.correctAnswer,
    this.explanation,
    this.points = 10,
    this.timeLimit = 30,
    this.difficulty = 'Medium',
    this.imageUrl,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['_id'] ?? json['id'] ?? '',
      question: json['question'] ?? '',
      type: json['type'] ?? 'multiple-choice',
      options: json['options'] != null
          ? List<String>.from(json['options'])
          : [],
      correctAnswer: json['correctAnswer'] ?? '',
      explanation: json['explanation'],
      points: json['points'] ?? 10,
      timeLimit: json['timeLimit'] ?? 30,
      difficulty: json['difficulty'] ?? 'Medium',
      imageUrl: json['imageUrl'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'question': question,
    'type': type,
    'options': options,
    'correctAnswer': correctAnswer,
    'explanation': explanation,
    'points': points,
    'timeLimit': timeLimit,
    'difficulty': difficulty,
    'imageUrl': imageUrl,
  };
}

class Quiz {
  final String id;
  final String title;
  final String? description;
  final List<Question> questions;
  final String createdBy;
  final String? creatorName;
  final String difficulty;
  final String? category;
  final List<String> tags;
  final bool isPublic;
  final int timeLimit; // total quiz time in minutes
  final int passingScore;
  final int attempts;
  final double averageScore;
  final int totalPlays;
  final double rating;
  final String? imageUrl;
  final DateTime createdAt;
  final DateTime? updatedAt;

  Quiz({
    required this.id,
    required this.title,
    this.description,
    required this.questions,
    required this.createdBy,
    this.creatorName,
    this.difficulty = 'Medium',
    this.category,
    this.tags = const [],
    this.isPublic = true,
    this.timeLimit = 30,
    this.passingScore = 60,
    this.attempts = 0,
    this.averageScore = 0.0,
    this.totalPlays = 0,
    this.rating = 0.0,
    this.imageUrl,
    required this.createdAt,
    this.updatedAt,
  });

  factory Quiz.fromJson(Map<String, dynamic> json) {
    return Quiz(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      questions: json['questions'] != null
          ? (json['questions'] as List)
                .map((q) => Question.fromJson(q))
                .toList()
          : [],
      createdBy: json['createdBy'] is Map
          ? json['createdBy']['_id'] ?? ''
          : json['createdBy'] ?? '',
      creatorName: json['createdBy'] is Map ? json['createdBy']['name'] : null,
      difficulty: json['difficulty'] ?? 'Medium',
      category: json['category'],
      tags: json['tags'] != null ? List<String>.from(json['tags']) : [],
      isPublic: json['isPublic'] ?? true,
      timeLimit: json['timeLimit'] ?? 30,
      passingScore: json['passingScore'] ?? 60,
      attempts: json['attempts'] ?? 0,
      averageScore: (json['averageScore'] ?? 0).toDouble(),
      totalPlays: json['totalPlays'] ?? 0,
      rating: (json['rating'] ?? 0).toDouble(),
      imageUrl: json['imageUrl'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'description': description,
    'questions': questions.map((q) => q.toJson()).toList(),
    'createdBy': createdBy,
    'difficulty': difficulty,
    'category': category,
    'tags': tags,
    'isPublic': isPublic,
    'timeLimit': timeLimit,
    'passingScore': passingScore,
    'attempts': attempts,
    'averageScore': averageScore,
    'totalPlays': totalPlays,
    'rating': rating,
    'imageUrl': imageUrl,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt?.toIso8601String(),
  };

  int get questionCount => questions.length;
  int get totalPoints => questions.fold(0, (sum, q) => sum + q.points);

  Color get difficultyColor {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return const Color(0xFF10B981);
      case 'medium':
        return const Color(0xFFF59E0B);
      case 'hard':
        return const Color(0xFFEF4444);
      case 'expert':
        return const Color(0xFF8B5CF6);
      default:
        return const Color(0xFF6B7280);
    }
  }
}
