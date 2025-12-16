// lib/models/avatar.dart

class Avatar {
  final String id;
  final String userId;
  final AvatarComponents components;
  final DateTime createdAt;
  final DateTime updatedAt;

  Avatar({
    required this.id,
    required this.userId,
    required this.components,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Avatar.fromJson(Map<String, dynamic> json) {
    return Avatar(
      id: json['_id'] ?? json['id'] ?? '',
      userId: json['userId'] ?? '',
      components: AvatarComponents.fromJson(json['components'] ?? {}),
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'components': components.toJson(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Avatar copyWith({
    String? id,
    String? userId,
    AvatarComponents? components,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Avatar(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      components: components ?? this.components,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

class AvatarComponents {
  final String skinTone;
  final String hairStyle;
  final String hairColor;
  final String eyeType;
  final String eyeColor;
  final String mouthType;
  final String clothingType;
  final String clothingColor;
  final String accessory;
  final String background;

  AvatarComponents({
    this.skinTone = 'default',
    this.hairStyle = 'short',
    this.hairColor = 'brown',
    this.eyeType = 'normal',
    this.eyeColor = 'brown',
    this.mouthType = 'smile',
    this.clothingType = 'casual',
    this.clothingColor = 'blue',
    this.accessory = 'none',
    this.background = 'gradient1',
  });

  factory AvatarComponents.fromJson(Map<String, dynamic> json) {
    return AvatarComponents(
      skinTone: json['skinTone'] ?? 'default',
      hairStyle: json['hairStyle'] ?? 'short',
      hairColor: json['hairColor'] ?? 'brown',
      eyeType: json['eyeType'] ?? 'normal',
      eyeColor: json['eyeColor'] ?? 'brown',
      mouthType: json['mouthType'] ?? 'smile',
      clothingType: json['clothingType'] ?? 'casual',
      clothingColor: json['clothingColor'] ?? 'blue',
      accessory: json['accessory'] ?? 'none',
      background: json['background'] ?? 'gradient1',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'skinTone': skinTone,
      'hairStyle': hairStyle,
      'hairColor': hairColor,
      'eyeType': eyeType,
      'eyeColor': eyeColor,
      'mouthType': mouthType,
      'clothingType': clothingType,
      'clothingColor': clothingColor,
      'accessory': accessory,
      'background': background,
    };
  }

  AvatarComponents copyWith({
    String? skinTone,
    String? hairStyle,
    String? hairColor,
    String? eyeType,
    String? eyeColor,
    String? mouthType,
    String? clothingType,
    String? clothingColor,
    String? accessory,
    String? background,
  }) {
    return AvatarComponents(
      skinTone: skinTone ?? this.skinTone,
      hairStyle: hairStyle ?? this.hairStyle,
      hairColor: hairColor ?? this.hairColor,
      eyeType: eyeType ?? this.eyeType,
      eyeColor: eyeColor ?? this.eyeColor,
      mouthType: mouthType ?? this.mouthType,
      clothingType: clothingType ?? this.clothingType,
      clothingColor: clothingColor ?? this.clothingColor,
      accessory: accessory ?? this.accessory,
      background: background ?? this.background,
    );
  }
}

class AvatarOption {
  final String id;
  final String name;
  final String type;
  final String? iconUrl;
  final bool isUnlocked;
  final int? requiredLevel;
  final int? requiredXP;

  AvatarOption({
    required this.id,
    required this.name,
    required this.type,
    this.iconUrl,
    this.isUnlocked = true,
    this.requiredLevel,
    this.requiredXP,
  });

  factory AvatarOption.fromJson(Map<String, dynamic> json) {
    return AvatarOption(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      type: json['type'] ?? '',
      iconUrl: json['iconUrl'],
      isUnlocked: json['isUnlocked'] ?? true,
      requiredLevel: json['requiredLevel'],
      requiredXP: json['requiredXP'],
    );
  }
}
