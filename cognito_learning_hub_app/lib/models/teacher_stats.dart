// lib/models/teacher_stats.dart

class TeacherStats {
  final int totalStudents;
  final int totalQuizzes;
  final int totalAssignments;
  final double averageScore;
  final int activeStudents;
  final int completedQuizzes;
  final List<SubjectPerformance> subjectPerformance;
  final List<RecentActivity> recentActivities;

  TeacherStats({
    required this.totalStudents,
    required this.totalQuizzes,
    required this.totalAssignments,
    required this.averageScore,
    required this.activeStudents,
    required this.completedQuizzes,
    required this.subjectPerformance,
    required this.recentActivities,
  });

  factory TeacherStats.fromJson(Map<String, dynamic> json) {
    return TeacherStats(
      totalStudents: json['totalStudents'] ?? 0,
      totalQuizzes: json['totalQuizzes'] ?? 0,
      totalAssignments: json['totalAssignments'] ?? 0,
      averageScore: (json['averageScore'] ?? 0).toDouble(),
      activeStudents: json['activeStudents'] ?? 0,
      completedQuizzes: json['completedQuizzes'] ?? 0,
      subjectPerformance: (json['subjectPerformance'] as List?)
              ?.map((e) => SubjectPerformance.fromJson(e))
              .toList() ??
          [],
      recentActivities: (json['recentActivities'] as List?)
              ?.map((e) => RecentActivity.fromJson(e))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'totalStudents': totalStudents,
      'totalQuizzes': totalQuizzes,
      'totalAssignments': totalAssignments,
      'averageScore': averageScore,
      'activeStudents': activeStudents,
      'completedQuizzes': completedQuizzes,
      'subjectPerformance': subjectPerformance.map((e) => e.toJson()).toList(),
      'recentActivities': recentActivities.map((e) => e.toJson()).toList(),
    };
  }
}

class SubjectPerformance {
  final String subject;
  final double averageScore;
  final int totalQuizzes;
  final int totalStudents;

  SubjectPerformance({
    required this.subject,
    required this.averageScore,
    required this.totalQuizzes,
    required this.totalStudents,
  });

  factory SubjectPerformance.fromJson(Map<String, dynamic> json) {
    return SubjectPerformance(
      subject: json['subject'] ?? '',
      averageScore: (json['averageScore'] ?? 0).toDouble(),
      totalQuizzes: json['totalQuizzes'] ?? 0,
      totalStudents: json['totalStudents'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'subject': subject,
      'averageScore': averageScore,
      'totalQuizzes': totalQuizzes,
      'totalStudents': totalStudents,
    };
  }
}

class RecentActivity {
  final String id;
  final String type; // 'quiz_created', 'quiz_completed', 'student_joined'
  final String description;
  final String? studentName;
  final String? quizTitle;
  final DateTime timestamp;

  RecentActivity({
    required this.id,
    required this.type,
    required this.description,
    this.studentName,
    this.quizTitle,
    required this.timestamp,
  });

  factory RecentActivity.fromJson(Map<String, dynamic> json) {
    return RecentActivity(
      id: json['id'] ?? '',
      type: json['type'] ?? '',
      description: json['description'] ?? '',
      studentName: json['studentName'],
      quizTitle: json['quizTitle'],
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'description': description,
      'studentName': studentName,
      'quizTitle': quizTitle,
      'timestamp': timestamp.toIso8601String(),
    };
  }
}

class StudentProgress {
  final String id;
  final String name;
  final String email;
  final double overallScore;
  final int quizzesCompleted;
  final int quizzesAssigned;
  final String? profilePicture;
  final DateTime lastActive;
  final List<QuizScore> recentScores;

  StudentProgress({
    required this.id,
    required this.name,
    required this.email,
    required this.overallScore,
    required this.quizzesCompleted,
    required this.quizzesAssigned,
    this.profilePicture,
    required this.lastActive,
    required this.recentScores,
  });

  factory StudentProgress.fromJson(Map<String, dynamic> json) {
    return StudentProgress(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      overallScore: (json['overallScore'] ?? 0).toDouble(),
      quizzesCompleted: json['quizzesCompleted'] ?? 0,
      quizzesAssigned: json['quizzesAssigned'] ?? 0,
      profilePicture: json['profilePicture'],
      lastActive: json['lastActive'] != null
          ? DateTime.parse(json['lastActive'])
          : DateTime.now(),
      recentScores: (json['recentScores'] as List?)
              ?.map((e) => QuizScore.fromJson(e))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'overallScore': overallScore,
      'quizzesCompleted': quizzesCompleted,
      'quizzesAssigned': quizzesAssigned,
      'profilePicture': profilePicture,
      'lastActive': lastActive.toIso8601String(),
      'recentScores': recentScores.map((e) => e.toJson()).toList(),
    };
  }
}

class QuizScore {
  final String quizId;
  final String quizTitle;
  final double score;
  final DateTime completedAt;

  QuizScore({
    required this.quizId,
    required this.quizTitle,
    required this.score,
    required this.completedAt,
  });

  factory QuizScore.fromJson(Map<String, dynamic> json) {
    return QuizScore(
      quizId: json['quizId'] ?? '',
      quizTitle: json['quizTitle'] ?? '',
      score: (json['score'] ?? 0).toDouble(),
      completedAt: json['completedAt'] != null
          ? DateTime.parse(json['completedAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'quizId': quizId,
      'quizTitle': quizTitle,
      'score': score,
      'completedAt': completedAt.toIso8601String(),
    };
  }
}
