// lib/services/socket_service.dart
import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../config/api_config.dart';

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  io.Socket? _socket;
  bool _isConnected = false;
  String? _authToken;

  final StreamController<bool> _connectionController =
      StreamController<bool>.broadcast();
  Stream<bool> get connectionStream => _connectionController.stream;

  final StreamController<Map<String, dynamic>> _eventController =
      StreamController<Map<String, dynamic>>.broadcast();
  Stream<Map<String, dynamic>> get eventStream => _eventController.stream;

  bool get isConnected => _isConnected;

  void initialize(String authToken) {
    _authToken = authToken;
    _connect();
  }

  void _connect() {
    if (_socket != null) {
      _socket!.dispose();
    }

    _socket = io.io(
      ApiConfig.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': _authToken})
          .enableAutoConnect()
          .enableReconnection()
          .setReconnectionAttempts(5)
          .setReconnectionDelay(1000)
          .build(),
    );

    _setupEventHandlers();
  }

  void _setupEventHandlers() {
    _socket?.onConnect((_) {
      _isConnected = true;
      _connectionController.add(true);
      print('Socket connected');
    });

    _socket?.onDisconnect((_) {
      _isConnected = false;
      _connectionController.add(false);
      print('Socket disconnected');
    });

    _socket?.onConnectError((error) {
      print('Socket connection error: $error');
      _connectionController.add(false);
    });

    _socket?.onError((error) {
      print('Socket error: $error');
    });

    // Live session events - Updated to match backend event names
    _socket?.on('session-joined', (data) {
      print('📥 Socket: session-joined event received');
      _eventController.add({'event': 'session_joined', 'data': data});
    });

    _socket?.on('participant-joined', (data) {
      print('📥 Socket: participant-joined event received: $data');
      _eventController.add({'event': 'participant_joined', 'data': data});
    });

    _socket?.on('participant-left', (data) {
      print('📥 Socket: participant-left event received');
      _eventController.add({'event': 'participant_left', 'data': data});
    });

    _socket?.on('session-started', (data) {
      print('📥 Socket: session-started event received');
      _eventController.add({'event': 'session_started', 'data': data});
    });

    _socket?.on('question-started', (data) {
      print('📥 Socket: question-started event received');
      _eventController.add({'event': 'question_started', 'data': data});
    });

    _socket?.on('answer-submitted', (data) {
      print('📥 Socket: answer-submitted event received');
      _eventController.add({'event': 'answer_submitted', 'data': data});
    });

    _socket?.on('leaderboard-updated', (data) {
      print('📥 Socket: leaderboard-updated event received');
      _eventController.add({'event': 'leaderboard_updated', 'data': data});
    });

    _socket?.on('session-ended', (data) {
      print('📥 Socket: session-ended event received');
      _eventController.add({'event': 'session_ended', 'data': data});
    });

    _socket?.on('error', (data) {
      print('❌ Socket: error event received: $data');
      _eventController.add({'event': 'error', 'data': data});
    });

    // Duel events
    _socket?.on('duel:matched', (data) {
      _eventController.add({'event': 'duel_matched', 'data': data});
    });

    _socket?.on('duel:question', (data) {
      _eventController.add({'event': 'duel_question', 'data': data});
    });

    _socket?.on('duel:opponent_answered', (data) {
      _eventController.add({'event': 'opponent_answered', 'data': data});
    });

    _socket?.on('duel:result', (data) {
      _eventController.add({'event': 'duel_result', 'data': data});
    });

    // Meeting events
    _socket?.on('meeting:user_joined', (data) {
      _eventController.add({'event': 'meeting_user_joined', 'data': data});
    });

    _socket?.on('meeting:user_left', (data) {
      _eventController.add({'event': 'meeting_user_left', 'data': data});
    });

    _socket?.on('meeting:signal', (data) {
      _eventController.add({'event': 'meeting_signal', 'data': data});
    });

    _socket?.on('meeting:chat', (data) {
      _eventController.add({'event': 'meeting_chat', 'data': data});
    });
  }

  // Live Session Methods
  void createSession(String quizId) {
    _socket?.emit('session:create', {'quizId': quizId});
  }

  void joinSession(
    String sessionCode, {
    required String userId,
    required String userName,
    String? userPicture,
  }) {
    print('🔵 Socket: Emitting join-session event');
    print(
        '🔵 Data: sessionCode=$sessionCode, userId=$userId, userName=$userName');
    _socket?.emit('join-session', {
      'sessionCode': sessionCode,
      'userId': userId,
      'userName': userName,
      'userPicture': userPicture,
    });
  }

  void leaveSession(String sessionId) {
    _socket?.emit('session:leave', {'sessionId': sessionId});
  }

  void startSession(String sessionId) {
    _socket?.emit('session:start', {'sessionId': sessionId});
  }

  void endSession(String sessionId) {
    _socket?.emit('session:end', {'sessionId': sessionId});
  }

  void submitAnswer(
    String sessionId,
    String questionId,
    int answerIndex,
    int timeTaken,
  ) {
    _socket?.emit('session:answer', {
      'sessionId': sessionId,
      'questionId': questionId,
      'answer': answerIndex,
      'timeTaken': timeTaken,
    });
  }

  void nextQuestion(String sessionId) {
    _socket?.emit('session:next_question', {'sessionId': sessionId});
  }

  // Duel Methods
  void findDuelMatch(String category, String difficulty) {
    _socket?.emit('duel:find_match', {
      'category': category,
      'difficulty': difficulty,
    });
  }

  void cancelDuelSearch() {
    _socket?.emit('duel:cancel_search');
  }

  void submitDuelAnswer(
    String matchId,
    String questionId,
    int answerIndex,
    int timeTaken,
  ) {
    _socket?.emit('duel:answer', {
      'matchId': matchId,
      'questionId': questionId,
      'answer': answerIndex,
      'timeTaken': timeTaken,
    });
  }

  void leaveDuel(String matchId) {
    _socket?.emit('duel:leave', {'matchId': matchId});
  }

  // Meeting Methods
  void joinMeeting(String roomId) {
    _socket?.emit('meeting:join', {'roomId': roomId});
  }

  void leaveMeeting(String roomId) {
    _socket?.emit('meeting:leave', {'roomId': roomId});
  }

  void sendSignal(String roomId, String targetUserId, dynamic signal) {
    _socket?.emit('meeting:signal', {
      'roomId': roomId,
      'targetUserId': targetUserId,
      'signal': signal,
    });
  }

  void sendMeetingChat(String roomId, String message) {
    _socket?.emit('meeting:chat', {'roomId': roomId, 'message': message});
  }

  // Generic emit method
  void emit(String event, dynamic data) {
    _socket?.emit(event, data);
  }

  // Listen to specific event
  void on(String event, Function(dynamic) callback) {
    _socket?.on(event, callback);
  }

  // Remove listener
  void off(String event) {
    _socket?.off(event);
  }

  void disconnect() {
    _socket?.disconnect();
    _isConnected = false;
  }

  void reconnect() {
    if (!_isConnected && _authToken != null) {
      _connect();
    }
  }

  void dispose() {
    _socket?.dispose();
    _connectionController.close();
    _eventController.close();
  }
}
