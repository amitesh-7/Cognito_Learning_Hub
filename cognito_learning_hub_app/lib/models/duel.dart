// lib/models/duel.dart

/// Represents a 1v1 duel match between two players
class DuelMatch {
  final String id;
  final String player1Id;
  final String player1Name;
  final String? player1Avatar;
  final String player2Id;
  final String player2Name;
  final String? player2Avatar;
  final String quizCategory;
  final String difficulty;
  final DuelStatus status;
  final int player1Score;
  final int player2Score;
  final int currentQuestionIndex;
  final DateTime createdAt;
  final DateTime? startedAt;
  final DateTime? endedAt;

  const DuelMatch({
    required this.id,
    required this.player1Id,
    required this.player1Name,
    this.player1Avatar,
    required this.player2Id,
    required this.player2Name,
    this.player2Avatar,
    required this.quizCategory,
    required this.difficulty,
    required this.status,
    this.player1Score = 0,
    this.player2Score = 0,
    this.currentQuestionIndex = -1,
    required this.createdAt,
    this.startedAt,
    this.endedAt,
  });

  factory DuelMatch.fromJson(Map<String, dynamic> json) {
    return DuelMatch(
      id: json['id'] ?? json['_id'] ?? '',
      player1Id: json['player1Id'] ?? json['player1']?['userId'] ?? '',
      player1Name:
          json['player1Name'] ?? json['player1']?['username'] ?? 'Player 1',
      player1Avatar: json['player1Avatar'] ?? json['player1']?['avatar'],
      player2Id: json['player2Id'] ?? json['player2']?['userId'] ?? '',
      player2Name:
          json['player2Name'] ?? json['player2']?['username'] ?? 'Player 2',
      player2Avatar: json['player2Avatar'] ?? json['player2']?['avatar'],
      quizCategory: json['quizCategory'] ?? json['category'] ?? 'General',
      difficulty: json['difficulty'] ?? 'medium',
      status: _parseStatus(json['status']),
      player1Score: json['player1Score'] ?? json['player1']?['score'] ?? 0,
      player2Score: json['player2Score'] ?? json['player2']?['score'] ?? 0,
      currentQuestionIndex: json['currentQuestionIndex'] ?? -1,
      createdAt:
          DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      startedAt:
          json['startedAt'] != null ? DateTime.parse(json['startedAt']) : null,
      endedAt: json['endedAt'] != null ? DateTime.parse(json['endedAt']) : null,
    );
  }

  static DuelStatus _parseStatus(dynamic status) {
    if (status is String) {
      switch (status.toLowerCase()) {
        case 'waiting':
          return DuelStatus.waiting;
        case 'active':
          return DuelStatus.active;
        case 'completed':
          return DuelStatus.completed;
        case 'cancelled':
          return DuelStatus.cancelled;
        default:
          return DuelStatus.waiting;
      }
    }
    return DuelStatus.waiting;
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'player1Id': player1Id,
      'player1Name': player1Name,
      'player1Avatar': player1Avatar,
      'player2Id': player2Id,
      'player2Name': player2Name,
      'player2Avatar': player2Avatar,
      'quizCategory': quizCategory,
      'difficulty': difficulty,
      'status': status.toString().split('.').last,
      'player1Score': player1Score,
      'player2Score': player2Score,
      'currentQuestionIndex': currentQuestionIndex,
      'createdAt': createdAt.toIso8601String(),
      'startedAt': startedAt?.toIso8601String(),
      'endedAt': endedAt?.toIso8601String(),
    };
  }

  DuelMatch copyWith({
    String? id,
    String? player1Id,
    String? player1Name,
    String? player1Avatar,
    String? player2Id,
    String? player2Name,
    String? player2Avatar,
    String? quizCategory,
    String? difficulty,
    DuelStatus? status,
    int? player1Score,
    int? player2Score,
    int? currentQuestionIndex,
    DateTime? createdAt,
    DateTime? startedAt,
    DateTime? endedAt,
  }) {
    return DuelMatch(
      id: id ?? this.id,
      player1Id: player1Id ?? this.player1Id,
      player1Name: player1Name ?? this.player1Name,
      player1Avatar: player1Avatar ?? this.player1Avatar,
      player2Id: player2Id ?? this.player2Id,
      player2Name: player2Name ?? this.player2Name,
      player2Avatar: player2Avatar ?? this.player2Avatar,
      quizCategory: quizCategory ?? this.quizCategory,
      difficulty: difficulty ?? this.difficulty,
      status: status ?? this.status,
      player1Score: player1Score ?? this.player1Score,
      player2Score: player2Score ?? this.player2Score,
      currentQuestionIndex: currentQuestionIndex ?? this.currentQuestionIndex,
      createdAt: createdAt ?? this.createdAt,
      startedAt: startedAt ?? this.startedAt,
      endedAt: endedAt ?? this.endedAt,
    );
  }

  /// Returns true if the current user is player 1
  bool isPlayer1(String currentUserId) => player1Id == currentUserId;

  /// Returns true if the current user is player 2
  bool isPlayer2(String currentUserId) => player2Id == currentUserId;

  /// Gets the opponent's name for the current user
  String getOpponentName(String currentUserId) {
    return isPlayer1(currentUserId) ? player2Name : player1Name;
  }

  /// Gets the opponent's avatar for the current user
  String? getOpponentAvatar(String currentUserId) {
    return isPlayer1(currentUserId) ? player2Avatar : player1Avatar;
  }

  /// Gets the current user's score
  int getCurrentUserScore(String currentUserId) {
    return isPlayer1(currentUserId) ? player1Score : player2Score;
  }

  /// Gets the opponent's score
  int getOpponentScore(String currentUserId) {
    return isPlayer1(currentUserId) ? player2Score : player1Score;
  }

  /// Returns true if the current user is winning
  bool isWinning(String currentUserId) {
    return getCurrentUserScore(currentUserId) > getOpponentScore(currentUserId);
  }

  /// Returns true if the match is tied
  bool isTied() => player1Score == player2Score;
}

/// Status of a duel match
enum DuelStatus {
  waiting, // Waiting for opponent
  active, // Currently playing
  completed, // Match finished
  cancelled, // Match cancelled
}

/// Represents a duel question event from WebSocket
class DuelQuestionEvent {
  final String duelId;
  final int questionIndex;
  final String questionText;
  final List<String> options;
  final int timeLimit;
  final DateTime startTime;

  const DuelQuestionEvent({
    required this.duelId,
    required this.questionIndex,
    required this.questionText,
    required this.options,
    required this.timeLimit,
    required this.startTime,
  });

  factory DuelQuestionEvent.fromJson(Map<String, dynamic> json) {
    return DuelQuestionEvent(
      duelId: json['duelId'] ?? json['matchId'] ?? '',
      questionIndex: json['questionIndex'] ?? 0,
      questionText: json['questionText'] ?? json['question'] ?? '',
      options: List<String>.from(json['options'] ?? []),
      timeLimit: json['timeLimit'] ?? 20,
      startTime:
          DateTime.parse(json['startTime'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'duelId': duelId,
      'questionIndex': questionIndex,
      'questionText': questionText,
      'options': options,
      'timeLimit': timeLimit,
      'startTime': startTime.toIso8601String(),
    };
  }
}

/// Represents opponent's answer status
class OpponentAnswerEvent {
  final String duelId;
  final String opponentId;
  final int questionIndex;
  final bool isCorrect;
  final int timeTaken;

  const OpponentAnswerEvent({
    required this.duelId,
    required this.opponentId,
    required this.questionIndex,
    required this.isCorrect,
    required this.timeTaken,
  });

  factory OpponentAnswerEvent.fromJson(Map<String, dynamic> json) {
    return OpponentAnswerEvent(
      duelId: json['duelId'] ?? json['matchId'] ?? '',
      opponentId: json['opponentId'] ?? json['userId'] ?? '',
      questionIndex: json['questionIndex'] ?? 0,
      isCorrect: json['isCorrect'] ?? false,
      timeTaken: json['timeTaken'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'duelId': duelId,
      'opponentId': opponentId,
      'questionIndex': questionIndex,
      'isCorrect': isCorrect,
      'timeTaken': timeTaken,
    };
  }
}

/// Represents the final result of a duel
class DuelResult {
  final String duelId;
  final String winnerId;
  final String winnerName;
  final int player1Score;
  final int player2Score;
  final int player1Correct;
  final int player2Correct;
  final DateTime endedAt;

  const DuelResult({
    required this.duelId,
    required this.winnerId,
    required this.winnerName,
    required this.player1Score,
    required this.player2Score,
    required this.player1Correct,
    required this.player2Correct,
    required this.endedAt,
  });

  factory DuelResult.fromJson(Map<String, dynamic> json) {
    return DuelResult(
      duelId: json['duelId'] ?? json['matchId'] ?? '',
      winnerId: json['winnerId'] ?? '',
      winnerName: json['winnerName'] ?? 'Winner',
      player1Score: json['player1Score'] ?? 0,
      player2Score: json['player2Score'] ?? 0,
      player1Correct: json['player1Correct'] ?? 0,
      player2Correct: json['player2Correct'] ?? 0,
      endedAt:
          DateTime.parse(json['endedAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'duelId': duelId,
      'winnerId': winnerId,
      'winnerName': winnerName,
      'player1Score': player1Score,
      'player2Score': player2Score,
      'player1Correct': player1Correct,
      'player2Correct': player2Correct,
      'endedAt': endedAt.toIso8601String(),
    };
  }

  /// Returns true if the result is a tie
  bool isTie() => player1Score == player2Score;

  /// Returns true if the current user won
  bool didUserWin(String currentUserId) => winnerId == currentUserId;
}

/// Matchmaking queue status
class MatchmakingStatus {
  final bool isSearching;
  final String? category;
  final String? difficulty;
  final DateTime? searchStartedAt;

  const MatchmakingStatus({
    required this.isSearching,
    this.category,
    this.difficulty,
    this.searchStartedAt,
  });

  MatchmakingStatus copyWith({
    bool? isSearching,
    String? category,
    String? difficulty,
    DateTime? searchStartedAt,
  }) {
    return MatchmakingStatus(
      isSearching: isSearching ?? this.isSearching,
      category: category ?? this.category,
      difficulty: difficulty ?? this.difficulty,
      searchStartedAt: searchStartedAt ?? this.searchStartedAt,
    );
  }

  /// Gets how long the user has been searching (in seconds)
  int? getSearchDuration() {
    if (searchStartedAt == null) return null;
    return DateTime.now().difference(searchStartedAt!).inSeconds;
  }
}
