// lib/models/conversation.dart

class Conversation {
  final String sessionId;
  final String summary;
  final List<String> topics;
  final ConversationMetadata metadata;
  final String status;
  final DateTime createdAt;
  final List<Message>?
      messages; // Optional, only loaded when viewing conversation

  Conversation({
    required this.sessionId,
    required this.summary,
    required this.topics,
    required this.metadata,
    required this.status,
    required this.createdAt,
    this.messages,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      sessionId: json['sessionId'] as String,
      summary: json['summary'] as String? ?? 'New conversation',
      topics: (json['topics'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      metadata: ConversationMetadata.fromJson(
          json['metadata'] as Map<String, dynamic>? ?? {}),
      status: json['status'] as String? ?? 'active',
      createdAt: DateTime.parse(json['createdAt'] as String),
      messages: json['messages'] != null
          ? (json['messages'] as List<dynamic>)
              .map((m) => Message.fromJson(m as Map<String, dynamic>))
              .toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'sessionId': sessionId,
      'summary': summary,
      'topics': topics,
      'metadata': metadata.toJson(),
      'status': status,
      'createdAt': createdAt.toIso8601String(),
      if (messages != null)
        'messages': messages!.map((m) => m.toJson()).toList(),
    };
  }
}

class ConversationMetadata {
  final int totalMessages;
  final int duration;
  final DateTime lastActivity;

  ConversationMetadata({
    required this.totalMessages,
    required this.duration,
    required this.lastActivity,
  });

  factory ConversationMetadata.fromJson(Map<String, dynamic> json) {
    return ConversationMetadata(
      totalMessages: json['totalMessages'] as int? ?? 0,
      duration: json['duration'] as int? ?? 0,
      lastActivity: json['lastActivity'] != null
          ? DateTime.parse(json['lastActivity'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'totalMessages': totalMessages,
      'duration': duration,
      'lastActivity': lastActivity.toIso8601String(),
    };
  }
}

class Message {
  final String role; // 'user' or 'assistant'
  final String content;
  final DateTime timestamp;
  final MessageMetadata? metadata;

  Message({
    required this.role,
    required this.content,
    required this.timestamp,
    this.metadata,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      role: json['role'] as String,
      content: json['content'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
      metadata: json['metadata'] != null
          ? MessageMetadata.fromJson(json['metadata'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'role': role,
      'content': content,
      'timestamp': timestamp.toIso8601String(),
      if (metadata != null) 'metadata': metadata!.toJson(),
    };
  }
}

class MessageMetadata {
  final String? topic;
  final String? difficulty;
  final String? emotionalTone;
  final List<String>? relatedQuizzes;
  final double? confidence;

  MessageMetadata({
    this.topic,
    this.difficulty,
    this.emotionalTone,
    this.relatedQuizzes,
    this.confidence,
  });

  factory MessageMetadata.fromJson(Map<String, dynamic> json) {
    return MessageMetadata(
      topic: json['topic'] as String?,
      difficulty: json['difficulty'] as String?,
      emotionalTone: json['emotionalTone'] as String?,
      relatedQuizzes: (json['relatedQuizzes'] as List<dynamic>?)
          ?.map((e) => e.toString())
          .toList(),
      confidence: (json['confidence'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (topic != null) 'topic': topic,
      if (difficulty != null) 'difficulty': difficulty,
      if (emotionalTone != null) 'emotionalTone': emotionalTone,
      if (relatedQuizzes != null) 'relatedQuizzes': relatedQuizzes,
      if (confidence != null) 'confidence': confidence,
    };
  }
}

class StudyGoal {
  final String id;
  final String goalText;
  final String category;
  final DateTime targetDate;
  final bool isCompleted;
  final DateTime createdAt;

  StudyGoal({
    required this.id,
    required this.goalText,
    required this.category,
    required this.targetDate,
    required this.isCompleted,
    required this.createdAt,
  });

  factory StudyGoal.fromJson(Map<String, dynamic> json) {
    return StudyGoal(
      id: json['_id'] as String,
      goalText: json['goalText'] as String,
      category: json['category'] as String,
      targetDate: DateTime.parse(json['targetDate'] as String),
      isCompleted: json['isCompleted'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'goalText': goalText,
      'category': category,
      'targetDate': targetDate.toIso8601String(),
      'isCompleted': isCompleted,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
