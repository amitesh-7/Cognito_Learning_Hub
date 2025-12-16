// lib/providers/study_buddy_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/conversation.dart';
import '../services/study_buddy_service.dart';

final studyBuddyServiceProvider = Provider((ref) => StudyBuddyService());

// Conversations list provider
final conversationsProvider =
    AsyncNotifierProvider<ConversationsNotifier, List<Conversation>>(
  ConversationsNotifier.new,
);

class ConversationsNotifier extends AsyncNotifier<List<Conversation>> {
  StudyBuddyService get _service => ref.read(studyBuddyServiceProvider);

  @override
  Future<List<Conversation>> build() async {
    return _loadConversations();
  }

  Future<List<Conversation>> _loadConversations() async {
    try {
      return await _service.getConversations();
    } catch (e) {
      throw e;
    }
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async => await _loadConversations());
  }

  Future<void> deleteConversation(String sessionId) async {
    try {
      await _service.deleteConversation(sessionId);
      await refresh();
    } catch (e) {
      rethrow;
    }
  }
}

// Current conversation provider
final currentConversationProvider =
    NotifierProvider<CurrentConversationNotifier, Conversation?>(
  CurrentConversationNotifier.new,
);

class CurrentConversationNotifier extends Notifier<Conversation?> {
  StudyBuddyService get _service => ref.read(studyBuddyServiceProvider);

  @override
  Conversation? build() => null;

  Future<void> loadConversation(String sessionId) async {
    try {
      final conversation = await _service.getConversation(sessionId);
      state = conversation;
    } catch (e) {
      state = null;
      rethrow;
    }
  }

  void clearConversation() {
    state = null;
  }
}

// Chat messages provider (for active chat session)
final chatMessagesProvider =
    NotifierProvider<ChatMessagesNotifier, List<Message>>(
  ChatMessagesNotifier.new,
);

class ChatMessagesNotifier extends Notifier<List<Message>> {
  @override
  List<Message> build() => [];

  void addMessage(Message message) {
    state = [...state, message];
  }

  void clearMessages() {
    state = [];
  }

  void setMessages(List<Message> messages) {
    state = messages;
  }
}

// Current session ID provider
final currentSessionIdProvider =
    NotifierProvider<CurrentSessionIdNotifier, String?>(
  CurrentSessionIdNotifier.new,
);

class CurrentSessionIdNotifier extends Notifier<String?> {
  @override
  String? build() => null;

  void set(String? id) => state = id;
}

// Loading state provider for sending messages
final isSendingMessageProvider =
    NotifierProvider<IsSendingMessageNotifier, bool>(
  IsSendingMessageNotifier.new,
);

class IsSendingMessageNotifier extends Notifier<bool> {
  @override
  bool build() => false;

  void set(bool value) => state = value;
}

// Goals provider
final goalsProvider = AsyncNotifierProvider<GoalsNotifier, List<StudyGoal>>(
  GoalsNotifier.new,
);

class GoalsNotifier extends AsyncNotifier<List<StudyGoal>> {
  StudyBuddyService get _service => ref.read(studyBuddyServiceProvider);

  @override
  Future<List<StudyGoal>> build() async {
    return await _loadGoals();
  }

  Future<List<StudyGoal>> _loadGoals() async {
    try {
      return await _service.getGoals();
    } catch (e) {
      return [];
    }
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async => await _loadGoals());
  }

  Future<void> addGoal({
    required String goalText,
    required String category,
    required DateTime targetDate,
  }) async {
    try {
      await _service.setGoal(
        goalText: goalText,
        category: category,
        targetDate: targetDate,
      );
      await refresh();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> completeGoal(String goalId) async {
    try {
      await _service.completeGoal(goalId);
      await refresh();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteGoal(String goalId) async {
    try {
      await _service.deleteGoal(goalId);
      await refresh();
    } catch (e) {
      rethrow;
    }
  }
}
