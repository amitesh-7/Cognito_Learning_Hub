// lib/services/meeting_service.dart

import '../models/meeting.dart';
import 'api_service.dart';

class MeetingService {
  final _api = ApiService();

  // Meeting Room APIs
  Future<MeetingRoom> createMeeting({
    required String title,
    String? description,
    int maxParticipants = 50,
  }) async {
    try {
      final response = await _api.post(
        '/meeting/create',
        data: {
          'title': title,
          'description': description,
          'maxParticipants': maxParticipants,
        },
      );
      return MeetingRoom.fromJson(response.data['meeting']);
    } catch (e) {
      throw Exception('Failed to create meeting: $e');
    }
  }

  Future<MeetingRoom> joinMeeting(String roomId) async {
    try {
      final response = await _api.post('/meeting/$roomId/join');
      return MeetingRoom.fromJson(response.data['meeting']);
    } catch (e) {
      throw Exception('Failed to join meeting: $e');
    }
  }

  Future<void> leaveMeeting(String roomId) async {
    try {
      await _api.post('/meeting/$roomId/leave');
    } catch (e) {
      throw Exception('Failed to leave meeting: $e');
    }
  }

  Future<MeetingRoom> getMeetingDetails(String roomId) async {
    try {
      final response = await _api.get('/meeting/$roomId');
      return MeetingRoom.fromJson(response.data['meeting']);
    } catch (e) {
      throw Exception('Failed to get meeting details: $e');
    }
  }

  // Participant APIs
  Future<List<MeetingParticipant>> getParticipants(String roomId) async {
    try {
      final response = await _api.get('/meeting/$roomId/participants');
      final List participantsData = response.data['participants'] ?? [];
      return participantsData
          .map((p) => MeetingParticipant.fromJson(p))
          .toList();
    } catch (e) {
      throw Exception('Failed to get participants: $e');
    }
  }

  Future<void> updateParticipantStatus({
    required String roomId,
    bool? isMuted,
    bool? isVideoOff,
    bool? isHandRaised,
    bool? isScreenSharing,
  }) async {
    try {
      await _api.put('/meeting/$roomId/participant/status', data: {
        if (isMuted != null) 'isMuted': isMuted,
        if (isVideoOff != null) 'isVideoOff': isVideoOff,
        if (isHandRaised != null) 'isHandRaised': isHandRaised,
        if (isScreenSharing != null) 'isScreenSharing': isScreenSharing,
      });
    } catch (e) {
      throw Exception('Failed to update participant status: $e');
    }
  }

  Future<void> removeParticipant(String roomId, String participantId) async {
    try {
      await _api.delete('/meeting/$roomId/participant/$participantId');
    } catch (e) {
      throw Exception('Failed to remove participant: $e');
    }
  }

  // Chat APIs
  Future<List<MeetingChatMessage>> getChatMessages(String roomId) async {
    try {
      final response = await _api.get('/meeting/$roomId/chat');
      final List messagesData = response.data['messages'] ?? [];
      return messagesData.map((m) => MeetingChatMessage.fromJson(m)).toList();
    } catch (e) {
      throw Exception('Failed to get chat messages: $e');
    }
  }

  Future<MeetingChatMessage> sendChatMessage({
    required String roomId,
    required String message,
  }) async {
    try {
      final response = await _api.post(
        '/meeting/$roomId/chat',
        data: {'message': message},
      );
      return MeetingChatMessage.fromJson(response.data['message']);
    } catch (e) {
      throw Exception('Failed to send chat message: $e');
    }
  }

  // Screen Sharing APIs
  Future<void> startScreenShare(String roomId) async {
    try {
      await _api.post('/meeting/$roomId/screen-share/start');
    } catch (e) {
      throw Exception('Failed to start screen sharing: $e');
    }
  }

  Future<void> stopScreenShare(String roomId) async {
    try {
      await _api.post('/meeting/$roomId/screen-share/stop');
    } catch (e) {
      throw Exception('Failed to stop screen sharing: $e');
    }
  }

  // Hand Raise APIs
  Future<void> raiseHand(String roomId) async {
    try {
      await _api.post('/meeting/$roomId/hand-raise');
    } catch (e) {
      throw Exception('Failed to raise hand: $e');
    }
  }

  Future<void> lowerHand(String roomId) async {
    try {
      await _api.delete('/meeting/$roomId/hand-raise');
    } catch (e) {
      throw Exception('Failed to lower hand: $e');
    }
  }

  // Recording APIs
  Future<void> startRecording(String roomId) async {
    try {
      await _api.post('/meeting/$roomId/recording/start');
    } catch (e) {
      throw Exception('Failed to start recording: $e');
    }
  }

  Future<void> stopRecording(String roomId) async {
    try {
      await _api.post('/meeting/$roomId/recording/stop');
    } catch (e) {
      throw Exception('Failed to stop recording: $e');
    }
  }

  // Meeting Controls
  Future<void> lockMeeting(String roomId) async {
    try {
      await _api.post('/meeting/$roomId/lock');
    } catch (e) {
      throw Exception('Failed to lock meeting: $e');
    }
  }

  Future<void> unlockMeeting(String roomId) async {
    try {
      await _api.post('/meeting/$roomId/unlock');
    } catch (e) {
      throw Exception('Failed to unlock meeting: $e');
    }
  }

  Future<void> endMeeting(String roomId) async {
    try {
      await _api.post('/meeting/$roomId/end');
    } catch (e) {
      throw Exception('Failed to end meeting: $e');
    }
  }
}
