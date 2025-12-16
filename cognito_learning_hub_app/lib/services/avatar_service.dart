// lib/services/avatar_service.dart

import 'package:dio/dio.dart';
import '../models/avatar.dart';
import 'api_service.dart';

class AvatarService {
  final _api = ApiService();

  /// Get user's current avatar
  Future<Avatar> getAvatar() async {
    try {
      final response = await _api.get('/avatar');
      return Avatar.fromJson(response.data);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        // No avatar yet, return default
        return Avatar(
          id: '',
          userId: '',
          components: AvatarComponents(),
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
      }
      if (e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Failed to load avatar');
      }
      throw Exception('Network error: ${e.message}');
    }
  }

  /// Update avatar components
  Future<Avatar> updateAvatar(AvatarComponents components) async {
    try {
      final response = await _api.put(
        '/avatar',
        data: {'components': components.toJson()},
      );
      return Avatar.fromJson(response.data);
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(
            e.response!.data['message'] ?? 'Failed to update avatar');
      }
      throw Exception('Network error: ${e.message}');
    }
  }

  /// Get available avatar options
  Future<Map<String, List<AvatarOption>>> getAvatarOptions() async {
    try {
      final response = await _api.get('/avatar/options');
      final data = response.data as Map<String, dynamic>;

      return data.map((key, value) => MapEntry(
            key,
            (value as List).map((e) => AvatarOption.fromJson(e)).toList(),
          ));
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(
            e.response!.data['message'] ?? 'Failed to load avatar options');
      }
      throw Exception('Network error: ${e.message}');
    }
  }

  /// Unlock avatar item (using coins or XP)
  Future<void> unlockAvatarItem(String itemId) async {
    try {
      await _api.post('/avatar/unlock', data: {'itemId': itemId});
    } on DioException catch (e) {
      if (e.response != null) {
        throw Exception(e.response!.data['message'] ?? 'Failed to unlock item');
      }
      throw Exception('Network error: ${e.message}');
    }
  }

  /// Get randomized avatar
  Future<AvatarComponents> getRandomAvatar() async {
    try {
      final response = await _api.get('/avatar/random');
      return AvatarComponents.fromJson(response.data);
    } on DioException {
      // If API fails, generate random locally
      return _generateLocalRandomAvatar();
    }
  }

  AvatarComponents _generateLocalRandomAvatar() {
    final skinTones = ['light', 'medium', 'tan', 'dark'];
    final hairStyles = ['short', 'long', 'curly', 'bald', 'ponytail'];
    final hairColors = ['black', 'brown', 'blonde', 'red', 'blue', 'pink'];
    final eyeTypes = ['normal', 'happy', 'surprised', 'sleepy'];
    final eyeColors = ['brown', 'blue', 'green', 'hazel'];
    final mouthTypes = ['smile', 'grin', 'neutral', 'laugh'];
    final clothingTypes = ['casual', 'formal', 'sports', 'hoodie'];
    final clothingColors = ['red', 'blue', 'green', 'black', 'white'];
    final accessories = ['none', 'glasses', 'hat', 'earrings', 'necklace'];
    final backgrounds = [
      'gradient1',
      'gradient2',
      'solid',
      'pattern1',
      'pattern2'
    ];

    return AvatarComponents(
      skinTone: (skinTones..shuffle()).first,
      hairStyle: (hairStyles..shuffle()).first,
      hairColor: (hairColors..shuffle()).first,
      eyeType: (eyeTypes..shuffle()).first,
      eyeColor: (eyeColors..shuffle()).first,
      mouthType: (mouthTypes..shuffle()).first,
      clothingType: (clothingTypes..shuffle()).first,
      clothingColor: (clothingColors..shuffle()).first,
      accessory: (accessories..shuffle()).first,
      background: (backgrounds..shuffle()).first,
    );
  }
}
