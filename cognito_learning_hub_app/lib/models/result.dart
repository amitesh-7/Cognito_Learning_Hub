// lib/models/result.dart

class QuestionResult {
  final String questionId;
  final String userAnswer;
  final String correctAnswer;
  final bool isCorrect;
  final int timeTaken; // in seconds
  final int pointsEarned;
  final int bonusPoints;

  QuestionResult({
    required this.questionId,
    required this.userAnswer,
    required this.correctAnswer,
    required this.isCorrect,
    required this.timeTaken,
    required this.pointsEarned,
    this.bonusPoints = 0,
  });

  factory QuestionResult.fromJson(Map<String, dynamic> json) {
    return QuestionResult(
      questionId: json['questionId'] ?? '',
      userAnswer: json['userAnswer'] ?? '',
      correctAnswer: json['correctAnswer'] ?? '',
      isCorrect: json['isCorrect'] ?? false,
      timeTaken: json['timeTaken'] ?? 0,
      pointsEarned: json['pointsEarned'] ?? 0,
      bonusPoints: json['bonusPoints'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
    'questionId': questionId,
    'userAnswer': userAnswer,
    'correctAnswer': correctAnswer,
    'isCorrect': isCorrect,
    'timeTaken': timeTaken,
    'pointsEarned': pointsEarned,
    'bonusPoints': bonusPoints,
  };

  int get totalPoints => pointsEarned + bonusPoints;
}

class Result {
  final String id;
  final String oderId;
  final String quizId;
  final String? quizTitle;
  final int score;
  final int totalQuestions;
  final int correctAnswers;
  final int pointsEarned;
  final double percentage;
  final bool passed;
  final String rank;
  final int timeTaken; // total time in seconds
  final List<QuestionResult> questionResults;
  final int? position; // leaderboard position
  final DateTime createdAt;

  Result({
    required this.id,
    required this.oderId,
    required this.quizId,
    this.quizTitle,
    required this.score,
    required this.totalQuestions,
    required this.correctAnswers,
    required this.pointsEarned,
    required this.percentage,
    required this.passed,
    this.rank = 'Unranked',
    this.timeTaken = 0,
    required this.questionResults,
    this.position,
    required this.createdAt,
  });

  factory Result.fromJson(Map<String, dynamic> json) {
    return Result(
      id: json['_id'] ?? json['id'] ?? '',
      oderId: json['oderId'] ?? json['userId'] ?? '',
      quizId: json['quizId'] is Map
          ? json['quizId']['_id'] ?? ''
          : json['quizId'] ?? '',
      quizTitle: json['quizId'] is Map
          ? json['quizId']['title']
          : json['quizTitle'],
      score: json['score'] ?? 0,
      totalQuestions: json['totalQuestions'] ?? 0,
      correctAnswers: json['correctAnswers'] ?? 0,
      pointsEarned: json['pointsEarned'] ?? 0,
      percentage: (json['percentage'] ?? 0).toDouble(),
      passed: json['passed'] ?? false,
      rank: json['rank'] ?? 'Unranked',
      timeTaken: json['timeTaken'] ?? 0,
      questionResults: json['questionResults'] != null
          ? (json['questionResults'] as List)
                .map((q) => QuestionResult.fromJson(q))
                .toList()
          : [],
      position: json['position'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'userId': oderId,
    'quizId': quizId,
    'quizTitle': quizTitle,
    'score': score,
    'totalQuestions': totalQuestions,
    'correctAnswers': correctAnswers,
    'pointsEarned': pointsEarned,
    'percentage': percentage,
    'passed': passed,
    'rank': rank,
    'timeTaken': timeTaken,
    'questionResults': questionResults.map((q) => q.toJson()).toList(),
    'position': position,
    'createdAt': createdAt.toIso8601String(),
  };

  String get formattedTime {
    final minutes = timeTaken ~/ 60;
    final seconds = timeTaken % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  String get grade {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  }
}
