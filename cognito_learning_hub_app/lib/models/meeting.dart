// lib/models/meeting.dart

class MeetingParticipant {
  final String id;
  final String userId;
  final String name;
  final String? email;
  final String? avatar;
  final bool isMuted;
  final bool isVideoOff;
  final bool isHandRaised;
  final bool isScreenSharing;
  final String role; // 'host', 'participant'
  final DateTime joinedAt;

  MeetingParticipant({
    required this.id,
    required this.userId,
    required this.name,
    this.email,
    this.avatar,
    this.isMuted = false,
    this.isVideoOff = false,
    this.isHandRaised = false,
    this.isScreenSharing = false,
    this.role = 'participant',
    required this.joinedAt,
  });

  factory MeetingParticipant.fromJson(Map<String, dynamic> json) {
    return MeetingParticipant(
      id: json['_id'] ?? json['id'] ?? '',
      userId: json['userId'] ?? '',
      name: json['name'] ?? 'User',
      email: json['email'],
      avatar: json['avatar'],
      isMuted: json['isMuted'] ?? false,
      isVideoOff: json['isVideoOff'] ?? false,
      isHandRaised: json['isHandRaised'] ?? false,
      isScreenSharing: json['isScreenSharing'] ?? false,
      role: json['role'] ?? 'participant',
      joinedAt: json['joinedAt'] != null
          ? DateTime.parse(json['joinedAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'name': name,
      'email': email,
      'avatar': avatar,
      'isMuted': isMuted,
      'isVideoOff': isVideoOff,
      'isHandRaised': isHandRaised,
      'isScreenSharing': isScreenSharing,
      'role': role,
      'joinedAt': joinedAt.toIso8601String(),
    };
  }

  MeetingParticipant copyWith({
    String? id,
    String? userId,
    String? name,
    String? email,
    String? avatar,
    bool? isMuted,
    bool? isVideoOff,
    bool? isHandRaised,
    bool? isScreenSharing,
    String? role,
    DateTime? joinedAt,
  }) {
    return MeetingParticipant(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      name: name ?? this.name,
      email: email ?? this.email,
      avatar: avatar ?? this.avatar,
      isMuted: isMuted ?? this.isMuted,
      isVideoOff: isVideoOff ?? this.isVideoOff,
      isHandRaised: isHandRaised ?? this.isHandRaised,
      isScreenSharing: isScreenSharing ?? this.isScreenSharing,
      role: role ?? this.role,
      joinedAt: joinedAt ?? this.joinedAt,
    );
  }
}

class MeetingChatMessage {
  final String id;
  final String userId;
  final String userName;
  final String? userAvatar;
  final String message;
  final DateTime timestamp;
  final MessageType type; // 'text', 'system'

  MeetingChatMessage({
    required this.id,
    required this.userId,
    required this.userName,
    this.userAvatar,
    required this.message,
    required this.timestamp,
    this.type = MessageType.text,
  });

  factory MeetingChatMessage.fromJson(Map<String, dynamic> json) {
    return MeetingChatMessage(
      id: json['_id'] ?? json['id'] ?? '',
      userId: json['userId'] ?? '',
      userName: json['userName'] ?? 'User',
      userAvatar: json['userAvatar'],
      message: json['message'] ?? '',
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'])
          : DateTime.now(),
      type: MessageType.values.firstWhere(
        (e) => e.name == json['type'],
        orElse: () => MessageType.text,
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'userName': userName,
      'userAvatar': userAvatar,
      'message': message,
      'timestamp': timestamp.toIso8601String(),
      'type': type.name,
    };
  }
}

enum MessageType {
  text,
  system,
}

class MeetingRoom {
  final String id;
  final String hostId;
  final String title;
  final String? description;
  final List<MeetingParticipant> participants;
  final int maxParticipants;
  final bool isLocked;
  final bool isRecording;
  final DateTime createdAt;
  final DateTime? endedAt;

  MeetingRoom({
    required this.id,
    required this.hostId,
    required this.title,
    this.description,
    this.participants = const [],
    this.maxParticipants = 50,
    this.isLocked = false,
    this.isRecording = false,
    required this.createdAt,
    this.endedAt,
  });

  factory MeetingRoom.fromJson(Map<String, dynamic> json) {
    return MeetingRoom(
      id: json['_id'] ?? json['id'] ?? '',
      hostId: json['hostId'] ?? '',
      title: json['title'] ?? 'Meeting Room',
      description: json['description'],
      participants: (json['participants'] as List?)
              ?.map((p) => MeetingParticipant.fromJson(p))
              .toList() ??
          [],
      maxParticipants: json['maxParticipants'] ?? 50,
      isLocked: json['isLocked'] ?? false,
      isRecording: json['isRecording'] ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      endedAt: json['endedAt'] != null ? DateTime.parse(json['endedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'hostId': hostId,
      'title': title,
      'description': description,
      'participants': participants.map((p) => p.toJson()).toList(),
      'maxParticipants': maxParticipants,
      'isLocked': isLocked,
      'isRecording': isRecording,
      'createdAt': createdAt.toIso8601String(),
      'endedAt': endedAt?.toIso8601String(),
    };
  }
}
