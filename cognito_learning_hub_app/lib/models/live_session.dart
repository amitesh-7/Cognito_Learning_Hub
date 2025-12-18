// lib/models/live_session.dart

class LiveSession {
  final String id;
  final String code;
  final String quizId;
  final String hostId;
  final String hostName;
  final String quizTitle;
  final String? quizTopic;
  final LiveSessionStatus status;
  final List<LiveParticipant> participants;
  final int currentQuestionIndex;
  final DateTime createdAt;
  final DateTime? startedAt;
  final DateTime? endedAt;

  LiveSession({
    required this.id,
    required this.code,
    required this.quizId,
    required this.hostId,
    required this.hostName,
    required this.quizTitle,
    this.quizTopic,
    required this.status,
    required this.participants,
    this.currentQuestionIndex = -1,
    required this.createdAt,
    this.startedAt,
    this.endedAt,
  });

  factory LiveSession.fromJson(Map<String, dynamic> json) {
    // Handle quizMetadata if present
    final quizMetadata = json['quizMetadata'] as Map<String, dynamic>?;

    return LiveSession(
      id: json['_id'] ?? json['id'] ?? json['sessionCode'] ?? '',
      code: json['code'] ?? json['sessionCode'] ?? '',
      quizId: json['quizId'] ?? json['quiz'] ?? '',
      hostId: json['hostId'] ?? json['host'] ?? '',
      hostName: json['hostName'] ?? 'Unknown Host',
      quizTitle: quizMetadata?['title'] ?? json['quizTitle'] ?? 'Untitled Quiz',
      quizTopic: quizMetadata?['topic'] ?? json['quizTopic'],
      status: _parseStatus(json['status']),
      participants: (json['participants'] as List<dynamic>?)
              ?.map((p) => LiveParticipant.fromJson(p))
              .toList() ??
          [],
      currentQuestionIndex: json['currentQuestionIndex'] ?? -1,
      createdAt:
          DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      startedAt:
          json['startedAt'] != null ? DateTime.parse(json['startedAt']) : null,
      endedAt: json['endedAt'] != null ? DateTime.parse(json['endedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'quizId': quizId,
      'hostId': hostId,
      'hostName': hostName,
      'quizTitle': quizTitle,
      'quizTopic': quizTopic,
      'status': status.toString().split('.').last,
      'participants': participants.map((p) => p.toJson()).toList(),
      'currentQuestionIndex': currentQuestionIndex,
      'createdAt': createdAt.toIso8601String(),
      'startedAt': startedAt?.toIso8601String(),
      'endedAt': endedAt?.toIso8601String(),
    };
  }

  static LiveSessionStatus _parseStatus(dynamic status) {
    if (status == null) return LiveSessionStatus.waiting;
    final statusStr = status.toString().toLowerCase();
    switch (statusStr) {
      case 'active':
      case 'in_progress':
        return LiveSessionStatus.active;
      case 'ended':
      case 'completed':
        return LiveSessionStatus.ended;
      default:
        return LiveSessionStatus.waiting;
    }
  }

  LiveSession copyWith({
    String? id,
    String? code,
    String? quizId,
    String? hostId,
    String? hostName,
    String? quizTitle,
    String? quizTopic,
    LiveSessionStatus? status,
    List<LiveParticipant>? participants,
    int? currentQuestionIndex,
    DateTime? createdAt,
    DateTime? startedAt,
    DateTime? endedAt,
  }) {
    return LiveSession(
      id: id ?? this.id,
      code: code ?? this.code,
      quizId: quizId ?? this.quizId,
      hostId: hostId ?? this.hostId,
      hostName: hostName ?? this.hostName,
      quizTitle: quizTitle ?? this.quizTitle,
      quizTopic: quizTopic ?? this.quizTopic,
      status: status ?? this.status,
      participants: participants ?? this.participants,
      currentQuestionIndex: currentQuestionIndex ?? this.currentQuestionIndex,
      createdAt: createdAt ?? this.createdAt,
      startedAt: startedAt ?? this.startedAt,
      endedAt: endedAt ?? this.endedAt,
    );
  }
}

enum LiveSessionStatus {
  waiting,
  active,
  ended,
}

class LiveParticipant {
  final String userId;
  final String username;
  final String? avatar;
  final int score;
  final int correctAnswers;
  final bool isHost;
  final DateTime joinedAt;

  LiveParticipant({
    required this.userId,
    required this.username,
    this.avatar,
    this.score = 0,
    this.correctAnswers = 0,
    this.isHost = false,
    required this.joinedAt,
  });

  factory LiveParticipant.fromJson(Map<String, dynamic> json) {
    return LiveParticipant(
      userId: json['userId'] ?? json['_id'] ?? '',
      username:
          json['userName'] ?? json['username'] ?? json['name'] ?? 'Anonymous',
      avatar: json['userPicture'] ?? json['avatar'],
      score: json['score'] ?? 0,
      correctAnswers: json['correctAnswers'] ?? 0,
      isHost: json['isHost'] ?? false,
      joinedAt:
          DateTime.parse(json['joinedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'username': username,
      'avatar': avatar,
      'score': score,
      'correctAnswers': correctAnswers,
      'isHost': isHost,
      'joinedAt': joinedAt.toIso8601String(),
    };
  }

  LiveParticipant copyWith({
    String? userId,
    String? username,
    String? avatar,
    int? score,
    int? correctAnswers,
    bool? isHost,
    DateTime? joinedAt,
  }) {
    return LiveParticipant(
      userId: userId ?? this.userId,
      username: username ?? this.username,
      avatar: avatar ?? this.avatar,
      score: score ?? this.score,
      correctAnswers: correctAnswers ?? this.correctAnswers,
      isHost: isHost ?? this.isHost,
      joinedAt: joinedAt ?? this.joinedAt,
    );
  }
}

class LiveQuestionEvent {
  final String questionId;
  final int questionIndex;
  final String questionText;
  final List<String> options;
  final int timeLimit; // seconds
  final DateTime startTime;

  LiveQuestionEvent({
    required this.questionId,
    required this.questionIndex,
    required this.questionText,
    required this.options,
    required this.timeLimit,
    required this.startTime,
  });

  factory LiveQuestionEvent.fromJson(Map<String, dynamic> json) {
    // Handle nested question object from backend
    final questionData = json['question'];
    String questionId;
    String questionText;
    List<String> options;

    if (questionData is Map<String, dynamic>) {
      // Backend sends: { question: { _id, question: "text", options: [...] }, timeLimit, questionIndex }
      questionId = questionData['_id'] ?? '';
      questionText = questionData['question'] ?? '';
      options = List<String>.from(questionData['options'] ?? []);
    } else {
      // Fallback for direct format
      questionId = json['questionId'] ?? json['_id'] ?? '';
      questionText = json['questionText'] ?? json['question'] ?? '';
      options = List<String>.from(json['options'] ?? []);
    }

    return LiveQuestionEvent(
      questionId: questionId,
      questionIndex: json['questionIndex'] ?? 0,
      questionText: questionText,
      options: options,
      timeLimit: json['timeLimit'] ?? 30,
      startTime: DateTime.tryParse(json['startTime'] ?? '') ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'questionId': questionId,
      'questionIndex': questionIndex,
      'questionText': questionText,
      'options': options,
      'timeLimit': timeLimit,
      'startTime': startTime.toIso8601String(),
    };
  }
}

class LiveLeaderboardEntry {
  final String userId;
  final String username;
  final String? avatar;
  final int score;
  final int correctAnswers;
  final int rank;

  LiveLeaderboardEntry({
    required this.userId,
    required this.username,
    this.avatar,
    required this.score,
    required this.correctAnswers,
    required this.rank,
  });

  factory LiveLeaderboardEntry.fromJson(Map<String, dynamic> json) {
    return LiveLeaderboardEntry(
      userId: json['userId'] ?? '',
      username: json['username'] ?? 'Anonymous',
      avatar: json['avatar'],
      score: json['score'] ?? 0,
      correctAnswers: json['correctAnswers'] ?? 0,
      rank: json['rank'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'username': username,
      'avatar': avatar,
      'score': score,
      'correctAnswers': correctAnswers,
      'rank': rank,
    };
  }
}
