// lib/providers/avatar_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/avatar.dart';
import '../services/avatar_service.dart';

/// Provider for AvatarService instance
final avatarServiceProvider = Provider<AvatarService>((ref) {
  return AvatarService();
});

/// Provider for user's current avatar
final currentAvatarProvider = NotifierProvider<CurrentAvatarNotifier, Avatar?>(
  CurrentAvatarNotifier.new,
);

class CurrentAvatarNotifier extends Notifier<Avatar?> {
  @override
  Avatar? build() {
    _loadAvatar();
    return null;
  }

  Future<void> _loadAvatar() async {
    try {
      final service = ref.read(avatarServiceProvider);
      final avatar = await service.getAvatar();
      state = avatar;
    } catch (e) {
      // Handle error silently or set default avatar
      state = Avatar(
        id: '',
        userId: '',
        components: AvatarComponents(),
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
    }
  }

  Future<void> updateAvatar(AvatarComponents components) async {
    try {
      final service = ref.read(avatarServiceProvider);
      final updatedAvatar = await service.updateAvatar(components);
      state = updatedAvatar;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> setRandomAvatar() async {
    try {
      final service = ref.read(avatarServiceProvider);
      final randomComponents = await service.getRandomAvatar();
      await updateAvatar(randomComponents);
    } catch (e) {
      rethrow;
    }
  }

  void refresh() {
    _loadAvatar();
  }
}

/// Provider for avatar customization state
final avatarCustomizationProvider =
    NotifierProvider<AvatarCustomizationNotifier, AvatarComponents>(
  AvatarCustomizationNotifier.new,
);

class AvatarCustomizationNotifier extends Notifier<AvatarComponents> {
  @override
  AvatarComponents build() {
    final currentAvatar = ref.watch(currentAvatarProvider);
    return currentAvatar?.components ?? AvatarComponents();
  }

  void updateComponent(String componentType, String value) {
    switch (componentType) {
      case 'skinTone':
        state = state.copyWith(skinTone: value);
        break;
      case 'hairStyle':
        state = state.copyWith(hairStyle: value);
        break;
      case 'hairColor':
        state = state.copyWith(hairColor: value);
        break;
      case 'eyeType':
        state = state.copyWith(eyeType: value);
        break;
      case 'eyeColor':
        state = state.copyWith(eyeColor: value);
        break;
      case 'mouthType':
        state = state.copyWith(mouthType: value);
        break;
      case 'clothingType':
        state = state.copyWith(clothingType: value);
        break;
      case 'clothingColor':
        state = state.copyWith(clothingColor: value);
        break;
      case 'accessory':
        state = state.copyWith(accessory: value);
        break;
      case 'background':
        state = state.copyWith(background: value);
        break;
    }
  }

  void reset() {
    final currentAvatar = ref.read(currentAvatarProvider);
    state = currentAvatar?.components ?? AvatarComponents();
  }

  void randomize() async {
    try {
      final service = ref.read(avatarServiceProvider);
      final randomComponents = await service.getRandomAvatar();
      state = randomComponents;
    } catch (e) {
      // Generate locally if API fails
      final skinTones = ['light', 'medium', 'tan', 'dark']..shuffle();
      final hairStyles = ['short', 'long', 'curly', 'bald']..shuffle();
      final hairColors = ['black', 'brown', 'blonde', 'red']..shuffle();
      final eyeTypes = ['normal', 'happy', 'surprised']..shuffle();
      final eyeColors = ['brown', 'blue', 'green']..shuffle();
      final mouthTypes = ['smile', 'grin', 'neutral']..shuffle();
      final clothingTypes = ['casual', 'formal', 'sports']..shuffle();
      final clothingColors = ['red', 'blue', 'green']..shuffle();
      final accessories = ['none', 'glasses', 'hat']..shuffle();
      final backgrounds = ['gradient1', 'gradient2']..shuffle();

      state = AvatarComponents(
        skinTone: skinTones.first,
        hairStyle: hairStyles.first,
        hairColor: hairColors.first,
        eyeType: eyeTypes.first,
        eyeColor: eyeColors.first,
        mouthType: mouthTypes.first,
        clothingType: clothingTypes.first,
        clothingColor: clothingColors.first,
        accessory: accessories.first,
        background: backgrounds.first,
      );
    }
  }
}

/// Provider for available avatar options
final avatarOptionsProvider =
    FutureProvider<Map<String, List<AvatarOption>>>((ref) async {
  final service = ref.read(avatarServiceProvider);
  return await service.getAvatarOptions();
});
