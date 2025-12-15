// lib/utils/sound_manager.dart
import 'package:just_audio/just_audio.dart';

class SoundManager {
  static final SoundManager _instance = SoundManager._internal();
  factory SoundManager() => _instance;

  final AudioPlayer _correctPlayer = AudioPlayer();
  final AudioPlayer _incorrectPlayer = AudioPlayer();
  final AudioPlayer _timerPlayer = AudioPlayer();
  bool _isMuted = false;
  bool _isInitialized = false;

  SoundManager._internal();

  Future<void> init() async {
    if (_isInitialized) return;
    try {
      // These will be loaded when assets are available
      // For now, we'll handle gracefully if files don't exist
      _isInitialized = true;
    } catch (e) {
      // Sounds not available, continue silently
    }
  }

  Future<void> playCorrect() async {
    if (_isMuted) return;
    try {
      await _correctPlayer.setAsset('assets/sounds/correct.mp3');
      await _correctPlayer.seek(Duration.zero);
      await _correctPlayer.play();
    } catch (e) {
      // Sound file not available
    }
  }

  Future<void> playIncorrect() async {
    if (_isMuted) return;
    try {
      await _incorrectPlayer.setAsset('assets/sounds/incorrect.mp3');
      await _incorrectPlayer.seek(Duration.zero);
      await _incorrectPlayer.play();
    } catch (e) {
      // Sound file not available
    }
  }

  Future<void> playTimerWarning() async {
    if (_isMuted) return;
    try {
      await _timerPlayer.setAsset('assets/sounds/timer.mp3');
      await _timerPlayer.seek(Duration.zero);
      await _timerPlayer.play();
    } catch (e) {
      // Sound file not available
    }
  }

  void toggleMute() => _isMuted = !_isMuted;
  bool get isMuted => _isMuted;
  void setMuted(bool muted) => _isMuted = muted;

  void dispose() {
    _correctPlayer.dispose();
    _incorrectPlayer.dispose();
    _timerPlayer.dispose();
  }
}
