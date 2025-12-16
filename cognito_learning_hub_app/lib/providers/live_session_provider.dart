// lib/providers/live_session_provider.dart

import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/live_session.dart';
import '../services/live_session_service.dart';
import '../services/socket_service.dart';

// Service providers
final liveSessionServiceProvider = Provider((ref) => LiveSessionService());
final socketServiceProvider = Provider((ref) => SocketService());

// Current session provider
final currentLiveSessionProvider =
    NotifierProvider<CurrentLiveSessionNotifier, LiveSession?>(
  CurrentLiveSessionNotifier.new,
);

class CurrentLiveSessionNotifier extends Notifier<LiveSession?> {
  LiveSessionService get _service => ref.read(liveSessionServiceProvider);
  SocketService get _socket => ref.read(socketServiceProvider);
  StreamSubscription? _eventSubscription;

  @override
  LiveSession? build() {
    // Listen to socket events
    _eventSubscription = _socket.eventStream.listen(_handleSocketEvent);

    // Clean up on dispose
    ref.onDispose(() {
      _eventSubscription?.cancel();
    });

    return null;
  }

  void _handleSocketEvent(Map<String, dynamic> event) {
    final eventType = event['event'];
    final data = event['data'];

    switch (eventType) {
      case 'participant_joined':
        _onParticipantJoined(data);
        break;
      case 'participant_left':
        _onParticipantLeft(data);
        break;
      case 'question':
        _onQuestionReceived(data);
        break;
      case 'leaderboard':
        _onLeaderboardUpdate(data);
        break;
      case 'session_ended':
        _onSessionEnded(data);
        break;
    }
  }

  void _onParticipantJoined(Map<String, dynamic> data) {
    if (state == null) return;

    final participant = LiveParticipant.fromJson(data['participant']);
    final updatedParticipants = [...state!.participants, participant];

    state = state!.copyWith(participants: updatedParticipants);
  }

  void _onParticipantLeft(Map<String, dynamic> data) {
    if (state == null) return;

    final userId = data['userId'];
    final updatedParticipants =
        state!.participants.where((p) => p.userId != userId).toList();

    state = state!.copyWith(participants: updatedParticipants);
  }

  void _onQuestionReceived(Map<String, dynamic> data) {
    if (state == null) return;

    final questionIndex = data['questionIndex'] ?? 0;
    state = state!.copyWith(
      currentQuestionIndex: questionIndex,
      status: LiveSessionStatus.active,
    );

    // Notify listeners of new question
    ref.read(currentQuestionProvider.notifier).set(
          LiveQuestionEvent.fromJson(data),
        );
  }

  void _onLeaderboardUpdate(Map<String, dynamic> data) {
    // Update leaderboard provider
    final entries = (data['leaderboard'] as List)
        .map((e) => LiveLeaderboardEntry.fromJson(e))
        .toList();

    ref.read(liveLeaderboardProvider.notifier).set(entries);
  }

  void _onSessionEnded(Map<String, dynamic> data) {
    if (state == null) return;

    state = state!.copyWith(
      status: LiveSessionStatus.ended,
      endedAt: DateTime.now(),
    );
  }

  Future<void> createSession({
    required String quizId,
    String? quizTitle,
  }) async {
    try {
      final session = await _service.createSession(
        quizId: quizId,
        quizTitle: quizTitle,
      );

      state = session;

      // Connect to socket and join room
      _socket.createSession(quizId);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> joinSession(String code) async {
    try {
      final session = await _service.joinSession(code);

      state = session;

      // Connect to socket and join room
      _socket.joinSession(code);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> leaveSession() async {
    if (state == null) return;

    try {
      await _service.leaveSession(state!.id);
      _socket.leaveSession(state!.id);

      state = null;
      ref.read(currentQuestionProvider.notifier).clear();
      ref.read(liveLeaderboardProvider.notifier).clear();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> startSession() async {
    if (state == null) return;

    try {
      _socket.startSession(state!.id);

      state = state!.copyWith(
        status: LiveSessionStatus.active,
        startedAt: DateTime.now(),
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<void> endSession() async {
    if (state == null) return;

    try {
      await _service.endSession(state!.id);
      _socket.endSession(state!.id);

      state = state!.copyWith(
        status: LiveSessionStatus.ended,
        endedAt: DateTime.now(),
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<void> submitAnswer({
    required int questionIndex,
    required int answerIndex,
  }) async {
    if (state == null) return;

    try {
      final startTime = ref.read(currentQuestionProvider)?.startTime;
      final timeTaken = startTime != null
          ? DateTime.now().difference(startTime).inSeconds
          : 0;

      await _service.submitAnswer(
        sessionId: state!.id,
        questionIndex: questionIndex,
        answerIndex: answerIndex,
      );

      // Socket will handle the response
      _socket.submitAnswer(
        state!.id,
        questionIndex.toString(), // Convert to String for questionId
        answerIndex,
        timeTaken,
      );
      _service.getSession(state!.id).then((session) {
        state = session;
      }).catchError((e) {
        // Handle error silently
      });
    } catch (e) {
      rethrow;
    }
  }
}

// Current question provider
final currentQuestionProvider =
    NotifierProvider<CurrentQuestionNotifier, LiveQuestionEvent?>(
  CurrentQuestionNotifier.new,
);

class CurrentQuestionNotifier extends Notifier<LiveQuestionEvent?> {
  @override
  LiveQuestionEvent? build() => null;

  void set(LiveQuestionEvent question) {
    state = question;
  }

  void clear() {
    state = null;
  }
}

// Leaderboard provider
final liveLeaderboardProvider =
    NotifierProvider<LiveLeaderboardNotifier, List<LiveLeaderboardEntry>>(
  LiveLeaderboardNotifier.new,
);

class LiveLeaderboardNotifier extends Notifier<List<LiveLeaderboardEntry>> {
  @override
  List<LiveLeaderboardEntry> build() => [];

  void set(List<LiveLeaderboardEntry> entries) {
    state = entries;
  }

  void clear() {
    state = [];
  }
}

// Active sessions provider (for browsing)
final activeSessionsProvider =
    AsyncNotifierProvider<ActiveSessionsNotifier, List<LiveSession>>(
  ActiveSessionsNotifier.new,
);

class ActiveSessionsNotifier extends AsyncNotifier<List<LiveSession>> {
  LiveSessionService get _service => ref.read(liveSessionServiceProvider);

  @override
  Future<List<LiveSession>> build() async {
    return await _loadSessions();
  }

  Future<List<LiveSession>> _loadSessions() async {
    return await _service.getActiveSessions();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async => await _loadSessions());
  }
}

// Answer submission state
final isSubmittingAnswerProvider =
    NotifierProvider<IsSubmittingAnswerNotifier, bool>(
  IsSubmittingAnswerNotifier.new,
);

class IsSubmittingAnswerNotifier extends Notifier<bool> {
  @override
  bool build() => false;

  void set(bool value) => state = value;
}

// Timer provider for question countdown
final questionTimerProvider = NotifierProvider<QuestionTimerNotifier, int>(
  QuestionTimerNotifier.new,
);

class QuestionTimerNotifier extends Notifier<int> {
  Timer? _timer;

  @override
  int build() {
    ref.onDispose(() {
      _timer?.cancel();
    });
    return 0;
  }

  void start(int seconds) {
    _timer?.cancel();
    state = seconds;

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (state > 0) {
        state = state - 1;
      } else {
        timer.cancel();
      }
    });
  }

  void stop() {
    _timer?.cancel();
    state = 0;
  }
}
