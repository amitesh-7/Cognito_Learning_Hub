// lib/providers/live_session_provider.dart

import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/live_session.dart';
import '../services/live_session_service.dart';
import '../services/socket_service.dart';
import 'auth_provider.dart';

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

    print('📨 Socket event received in provider: $eventType');
    print('📨 Event data: $data');

    switch (eventType) {
      case 'participant_joined':
        _onParticipantJoined(data);
        break;
      case 'participant_left':
        _onParticipantLeft(data);
        break;
      case 'session_started':
        _onSessionStarted(data);
        break;
      case 'question_started':
        _onQuestionReceived(data);
        break;
      case 'question':
        _onQuestionReceived(data);
        break;
      case 'leaderboard_updated':
        _onLeaderboardUpdate(data);
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

    print(
        '👤 Participant joined: ${participant.userId}'); // Log participant info

    state = state!.copyWith(participants: updatedParticipants);
  }

  void _onParticipantLeft(Map<String, dynamic> data) {
    if (state == null) return;

    final userId = data['userId'];
    final updatedParticipants =
        state!.participants.where((p) => p.userId != userId).toList();

    state = state!.copyWith(participants: updatedParticipants);
  }

  void _onSessionStarted(Map<String, dynamic> data) {
    if (state == null) {
      print('⚠️ Cannot update session started - state is null');
      return;
    }

    print('🎬 Session started! Current status: ${state!.status}');
    print('🎬 Session started data: $data');

    state = state!.copyWith(
      status: LiveSessionStatus.active,
      startedAt: DateTime.now(),
    );

    print('✅ Session state updated to ACTIVE: ${state!.status}');
  }

  void _onQuestionReceived(Map<String, dynamic> data) {
    if (state == null) {
      print('⚠️ Cannot process question - session state is null');
      return;
    }

    print('📝 Question received data: $data');

    final questionIndex = data['questionIndex'] ?? 0;
    print('📝 Question index: $questionIndex');

    state = state!.copyWith(
      currentQuestionIndex: questionIndex,
      status: LiveSessionStatus.active,
    );

    print('✅ Session state updated - status: ${state!.status}');

    // Notify listeners of new question
    try {
      final questionEvent = LiveQuestionEvent.fromJson(data);
      print('📝 Parsed question: ${questionEvent.questionText}');
      print('📝 Options count: ${questionEvent.options.length}');
      ref.read(currentQuestionProvider.notifier).set(questionEvent);
      print('✅ Question provider updated');
    } catch (e) {
      print('❌ Error parsing question: $e');
    }
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
      // Get user data from auth provider
      final authState = ref.read(authProvider);
      final user = authState.user;

      if (user == null) {
        throw Exception('User not authenticated');
      }

      final session = await _service.joinSession(code);

      state = session;

      // Wait for socket to connect before joining (try multiple times)
      print(
          '🔵 Provider: Checking socket connection status: ${_socket.isConnected}');

      int retries = 0;
      while (!_socket.isConnected && retries < 10) {
        print('⏳ Socket not connected, waiting... (attempt ${retries + 1}/10)');
        await Future.delayed(const Duration(milliseconds: 500));
        retries++;
      }

      if (!_socket.isConnected) {
        print(
            '⚠️ Socket still not connected after waiting, attempting anyway...');
      }

      // Connect to socket and join room with user data
      print('🔵 Provider: Calling socket.joinSession with user data');
      print('🔵 User: id=${user.id}, name=${user.name}');
      print('🔵 Socket connected: ${_socket.isConnected}');
      _socket.joinSession(
        code,
        userId: user.id,
        userName: user.name,
        userPicture: user.picture,
      );
    } catch (e) {
      print('❌ Error in joinSession: $e');
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

    final question = ref.read(currentQuestionProvider);
    if (question == null) {
      print('❌ Cannot submit answer - no current question');
      return;
    }

    final authState = ref.read(authProvider);
    final user = authState.user;
    if (user == null) {
      print('❌ Cannot submit answer - user not authenticated');
      return;
    }

    try {
      final timeSpent = DateTime.now().difference(question.startTime).inSeconds;

      print(
          '📝 Submitting answer: questionIndex=$questionIndex, answerIndex=$answerIndex');
      print('📝 Question ID: ${question.questionId}, User ID: ${user.id}');

      // Use socket only (no HTTP endpoint exists for this)
      _socket.submitAnswer(
        sessionCode: state!.code,
        userId: user.id,
        questionId: question.questionId,
        selectedAnswer: question.options[answerIndex],
        timeSpent: timeSpent,
      );

      print('✅ Answer submitted via socket');
    } catch (e) {
      print('❌ Error submitting answer: $e');
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
