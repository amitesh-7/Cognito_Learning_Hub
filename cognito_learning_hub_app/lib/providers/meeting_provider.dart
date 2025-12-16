// lib/providers/meeting_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/meeting_service.dart';
import '../models/meeting.dart';

// Meeting Service Provider
final meetingServiceProvider = Provider<MeetingService>((ref) {
  return MeetingService();
});

// Meeting Room Provider
final meetingRoomProvider =
    FutureProvider.family<MeetingRoom, String>((ref, roomId) async {
  final service = ref.watch(meetingServiceProvider);
  return await service.getMeetingDetails(roomId);
});

// Participants Provider
final participantsProvider =
    FutureProvider.family<List<MeetingParticipant>, String>(
        (ref, roomId) async {
  final service = ref.watch(meetingServiceProvider);
  return await service.getParticipants(roomId);
});

// Chat Messages Provider
final chatMessagesProvider =
    FutureProvider.family<List<MeetingChatMessage>, String>(
        (ref, roomId) async {
  final service = ref.watch(meetingServiceProvider);
  return await service.getChatMessages(roomId);
});

// Chat State Notifier
class ChatNotifier extends Notifier<List<MeetingChatMessage>> {
  String? _currentRoomId;

  @override
  List<MeetingChatMessage> build() {
    return [];
  }

  void setRoomId(String roomId) {
    _currentRoomId = roomId;
    loadMessages();
  }

  Future<void> loadMessages() async {
    if (_currentRoomId == null) return;

    try {
      final service = ref.read(meetingServiceProvider);
      final messages = await service.getChatMessages(_currentRoomId!);
      state = messages;
    } catch (e) {
      // Handle error
    }
  }

  Future<void> sendMessage(String message) async {
    if (_currentRoomId == null) return;

    try {
      final service = ref.read(meetingServiceProvider);
      final newMessage = await service.sendChatMessage(
        roomId: _currentRoomId!,
        message: message,
      );

      // Add to local state optimistically
      state = [...state, newMessage];
    } catch (e) {
      // Handle error
      rethrow;
    }
  }

  void addMessage(MeetingChatMessage message) {
    state = [...state, message];
  }
}

final chatNotifierProvider =
    NotifierProvider<ChatNotifier, List<MeetingChatMessage>>(
  () => ChatNotifier(),
);

// Participants State Notifier
class ParticipantsNotifier extends Notifier<List<MeetingParticipant>> {
  String? _currentRoomId;

  @override
  List<MeetingParticipant> build() {
    return [];
  }

  void setRoomId(String roomId) {
    _currentRoomId = roomId;
    loadParticipants();
  }

  Future<void> loadParticipants() async {
    if (_currentRoomId == null) return;

    try {
      final service = ref.read(meetingServiceProvider);
      final participants = await service.getParticipants(_currentRoomId!);
      state = participants;
    } catch (e) {
      // Handle error
    }
  }

  void addParticipant(MeetingParticipant participant) {
    state = [...state, participant];
  }

  void removeParticipant(String participantId) {
    state = state.where((p) => p.id != participantId).toList();
  }

  void updateParticipant(
      String participantId, MeetingParticipant updatedParticipant) {
    state = state.map((p) {
      return p.id == participantId ? updatedParticipant : p;
    }).toList();
  }

  Future<void> updateStatus({
    bool? isMuted,
    bool? isVideoOff,
    bool? isHandRaised,
    bool? isScreenSharing,
  }) async {
    if (_currentRoomId == null) return;

    try {
      final service = ref.read(meetingServiceProvider);
      await service.updateParticipantStatus(
        roomId: _currentRoomId!,
        isMuted: isMuted,
        isVideoOff: isVideoOff,
        isHandRaised: isHandRaised,
        isScreenSharing: isScreenSharing,
      );
    } catch (e) {
      rethrow;
    }
  }
}

final participantsNotifierProvider =
    NotifierProvider<ParticipantsNotifier, List<MeetingParticipant>>(
  () => ParticipantsNotifier(),
);

// Meeting Controls State
class MeetingControlsState {
  final bool isMuted;
  final bool isVideoOff;
  final bool isScreenSharing;
  final bool isHandRaised;
  final bool isRecording;

  MeetingControlsState({
    this.isMuted = false,
    this.isVideoOff = false,
    this.isScreenSharing = false,
    this.isHandRaised = false,
    this.isRecording = false,
  });

  MeetingControlsState copyWith({
    bool? isMuted,
    bool? isVideoOff,
    bool? isScreenSharing,
    bool? isHandRaised,
    bool? isRecording,
  }) {
    return MeetingControlsState(
      isMuted: isMuted ?? this.isMuted,
      isVideoOff: isVideoOff ?? this.isVideoOff,
      isScreenSharing: isScreenSharing ?? this.isScreenSharing,
      isHandRaised: isHandRaised ?? this.isHandRaised,
      isRecording: isRecording ?? this.isRecording,
    );
  }
}

class MeetingControlsNotifier extends Notifier<MeetingControlsState> {
  String? _currentRoomId;

  @override
  MeetingControlsState build() {
    return MeetingControlsState();
  }

  void setRoomId(String roomId) {
    _currentRoomId = roomId;
  }

  Future<void> toggleMute() async {
    final newMuteState = !state.isMuted;
    state = state.copyWith(isMuted: newMuteState);

    if (_currentRoomId != null) {
      await ref
          .read(participantsNotifierProvider.notifier)
          .updateStatus(isMuted: newMuteState);
    }
  }

  Future<void> toggleVideo() async {
    final newVideoState = !state.isVideoOff;
    state = state.copyWith(isVideoOff: newVideoState);

    if (_currentRoomId != null) {
      await ref
          .read(participantsNotifierProvider.notifier)
          .updateStatus(isVideoOff: newVideoState);
    }
  }

  Future<void> toggleScreenShare() async {
    final service = ref.read(meetingServiceProvider);
    final newShareState = !state.isScreenSharing;

    if (_currentRoomId != null) {
      try {
        if (newShareState) {
          await service.startScreenShare(_currentRoomId!);
        } else {
          await service.stopScreenShare(_currentRoomId!);
        }
        state = state.copyWith(isScreenSharing: newShareState);

        await ref
            .read(participantsNotifierProvider.notifier)
            .updateStatus(isScreenSharing: newShareState);
      } catch (e) {
        rethrow;
      }
    }
  }

  Future<void> toggleHandRaise() async {
    final service = ref.read(meetingServiceProvider);
    final newHandState = !state.isHandRaised;

    if (_currentRoomId != null) {
      try {
        if (newHandState) {
          await service.raiseHand(_currentRoomId!);
        } else {
          await service.lowerHand(_currentRoomId!);
        }
        state = state.copyWith(isHandRaised: newHandState);

        await ref
            .read(participantsNotifierProvider.notifier)
            .updateStatus(isHandRaised: newHandState);
      } catch (e) {
        rethrow;
      }
    }
  }

  Future<void> toggleRecording() async {
    final service = ref.read(meetingServiceProvider);
    final newRecordingState = !state.isRecording;

    if (_currentRoomId != null) {
      try {
        if (newRecordingState) {
          await service.startRecording(_currentRoomId!);
        } else {
          await service.stopRecording(_currentRoomId!);
        }
        state = state.copyWith(isRecording: newRecordingState);
      } catch (e) {
        rethrow;
      }
    }
  }
}

final meetingControlsProvider =
    NotifierProvider<MeetingControlsNotifier, MeetingControlsState>(
  () => MeetingControlsNotifier(),
);
