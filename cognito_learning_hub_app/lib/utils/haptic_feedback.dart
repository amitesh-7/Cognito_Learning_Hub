// lib/utils/haptic_feedback.dart
import 'package:vibration/vibration.dart';

class HapticFeedback {
  static Future<void> light() async {
    final hasVibrator = await Vibration.hasVibrator();
    if (hasVibrator == true) {
      Vibration.vibrate(duration: 10);
    }
  }

  static Future<void> medium() async {
    final hasVibrator = await Vibration.hasVibrator();
    if (hasVibrator == true) {
      Vibration.vibrate(duration: 20);
    }
  }

  static Future<void> heavy() async {
    final hasVibrator = await Vibration.hasVibrator();
    if (hasVibrator == true) {
      Vibration.vibrate(duration: 40);
    }
  }

  static Future<void> success() async {
    final hasVibrator = await Vibration.hasVibrator();
    if (hasVibrator == true) {
      Vibration.vibrate(pattern: [0, 10, 50, 10]);
    }
  }

  static Future<void> error() async {
    final hasVibrator = await Vibration.hasVibrator();
    if (hasVibrator == true) {
      Vibration.vibrate(pattern: [0, 20, 100, 20, 100, 20]);
    }
  }

  static Future<void> warning() async {
    final hasVibrator = await Vibration.hasVibrator();
    if (hasVibrator == true) {
      Vibration.vibrate(pattern: [0, 15, 75, 15]);
    }
  }
}
