// lib/providers/duel_provider.dart
import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/duel.dart';
import '../services/duel_service.dart';
import '../services/socket_service.dart';

/// Provider for DuelService instance
final duelServiceProvider = Provider<DuelService>((ref) {
  return DuelService();
});

/// Provider for SocketService instance
final socketServiceProvider = Provider<SocketService>((ref) {
  return SocketService();
});

/// Provider for matchmaking status
final matchmakingStatusProvider =
    NotifierProvider<MatchmakingStatusNotifier, MatchmakingStatus>(() {
  return MatchmakingStatusNotifier();
});

class MatchmakingStatusNotifier extends Notifier<MatchmakingStatus> {
  @override
  MatchmakingStatus build() {
    return const MatchmakingStatus(isSearching: false);
  }

  Future<void> startSearch({
    required String category,
    required String difficulty,
  }) async {
    try {
      final service = ref.read(duelServiceProvider);
      await service.findOpponent(
        category: category,
        difficulty: difficulty,
      );

      state = MatchmakingStatus(
        isSearching: true,
        category: category,
        difficulty: difficulty,
        searchStartedAt: DateTime.now(),
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<void> cancelSearch() async {
    try {
      final service = ref.read(duelServiceProvider);
      await service.cancelSearch();

      state = const MatchmakingStatus(isSearching: false);
    } catch (e) {
      rethrow;
    }
  }

  void stopSearch() {
    state = const MatchmakingStatus(isSearching: false);
  }
}

/// Provider for current duel match
final currentDuelProvider =
    NotifierProvider<CurrentDuelNotifier, DuelMatch?>(() {
  return CurrentDuelNotifier();
});

class CurrentDuelNotifier extends Notifier<DuelMatch?> {
  StreamSubscription? _eventSubscription;

  @override
  DuelMatch? build() {
    // Listen to socket events
    final socket = ref.read(socketServiceProvider);
    _eventSubscription = socket.eventStream.listen(_handleSocketEvent);

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
      case 'duel:matched':
        _onDuelMatched(data);
        break;
      case 'duel:question':
        _onDuelQuestion(data);
        break;
      case 'duel:opponent_answered':
        _onOpponentAnswered(data);
        break;
      case 'duel:result':
        _onDuelResult(data);
        break;
    }
  }

  void _onDuelMatched(Map<String, dynamic> data) {
    final duel = DuelMatch.fromJson(data['duel']);
    state = duel;

    // Stop matchmaking
    ref.read(matchmakingStatusProvider.notifier).stopSearch();
  }

  void _onDuelQuestion(Map<String, dynamic> data) {
    final questionEvent = DuelQuestionEvent.fromJson(data);
    ref.read(currentDuelQuestionProvider.notifier).state = questionEvent;

    // Reset timer
    ref.read(duelQuestionTimerProvider.notifier).startTimer();
  }

  void _onOpponentAnswered(Map<String, dynamic> data) {
    final opponentEvent = OpponentAnswerEvent.fromJson(data);
    ref.read(opponentAnswerProvider.notifier).state = opponentEvent;
  }

  void _onDuelResult(Map<String, dynamic> data) {
    final result = DuelResult.fromJson(data);
    ref.read(duelResultProvider.notifier).state = result;
  }

  Future<void> loadDuel(String duelId) async {
    try {
      final service = ref.read(duelServiceProvider);
      final duel = await service.getDuel(duelId);
      state = duel;
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
      final service = ref.read(duelServiceProvider);
      await service.submitDuelAnswer(
        duelId: state!.id,
        questionIndex: questionIndex,
        answerIndex: answerIndex,
      );
    } catch (e) {
      rethrow;
    }
  }

  void clearDuel() {
    state = null;
  }
}

/// Provider for current duel question
final currentDuelQuestionProvider =
    NotifierProvider<CurrentDuelQuestionNotifier, DuelQuestionEvent?>(() {
  return CurrentDuelQuestionNotifier();
});

class CurrentDuelQuestionNotifier extends Notifier<DuelQuestionEvent?> {
  @override
  DuelQuestionEvent? build() => null;

  void set(DuelQuestionEvent event) {
    state = event;
  }
}

/// Provider for opponent answer status
final opponentAnswerProvider =
    NotifierProvider<OpponentAnswerNotifier, OpponentAnswerEvent?>(() {
  return OpponentAnswerNotifier();
});

class OpponentAnswerNotifier extends Notifier<OpponentAnswerEvent?> {
  @override
  OpponentAnswerEvent? build() => null;

  void set(OpponentAnswerEvent event) {
    state = event;
  }
}

/// Provider for duel result
final duelResultProvider =
    NotifierProvider<DuelResultNotifier, DuelResult?>(() {
  return DuelResultNotifier();
});

class DuelResultNotifier extends Notifier<DuelResult?> {
  @override
  DuelResult? build() => null;

  void set(DuelResult result) {
    state = result;
  }

  void clear() {
    state = null;
  }
}

/// Provider for duel question timer
final duelQuestionTimerProvider =
    NotifierProvider<DuelQuestionTimerNotifier, int>(() {
  return DuelQuestionTimerNotifier();
});

class DuelQuestionTimerNotifier extends Notifier<int> {
  @override
  int build() => 20;

  void startTimer() {
    state = 20;
    // Timer logic would be handled by the screen or a separate timer provider
  }

  void decrementTimer() {
    if (state > 0) {
      state = state - 1;
    }
  }

  void resetTimer() {
    state = 20;
  }
}

/// Provider for duel history
final duelHistoryProvider =
    FutureProvider.family<List<DuelMatch>, int>((ref, page) async {
  final service = ref.read(duelServiceProvider);
  return await service.getDuelHistory(page: page, limit: 20);
});

/// Provider for duel statistics
final duelStatsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final service = ref.read(duelServiceProvider);
  return await service.getDuelStats();
});
