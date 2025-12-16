// lib/providers/accessibility_provider.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../config/accessibility_config.dart';

// Font Scale Notifier
class FontScaleNotifier extends Notifier<double> {
  @override
  double build() {
    _loadFontScale();
    return 1.0;
  }

  Future<void> _loadFontScale() async {
    final box = await Hive.openBox('accessibility_settings');
    final scale = box.get('font_scale', defaultValue: 1.0) as double;
    state = scale;
  }

  Future<void> setFontScale(double scale) async {
    final box = await Hive.openBox('accessibility_settings');
    await box.put('font_scale', scale);
    state = scale;
  }

  Future<void> setFontScaleByName(String name) async {
    final scale = AccessibilityConfig.getFontScale(name);
    await setFontScale(scale);
  }
}

final fontScaleProvider = NotifierProvider<FontScaleNotifier, double>(() {
  return FontScaleNotifier();
});

// High Contrast Mode Notifier
class HighContrastModeNotifier extends Notifier<bool> {
  @override
  bool build() {
    _loadHighContrastMode();
    return false;
  }

  Future<void> _loadHighContrastMode() async {
    final box = await Hive.openBox('accessibility_settings');
    final enabled = box.get('high_contrast_mode', defaultValue: false) as bool;
    state = enabled;
  }

  Future<void> setHighContrastMode(bool enabled) async {
    final box = await Hive.openBox('accessibility_settings');
    await box.put('high_contrast_mode', enabled);
    state = enabled;
  }

  Future<void> toggle() async {
    await setHighContrastMode(!state);
  }
}

final highContrastModeProvider = NotifierProvider<HighContrastModeNotifier, bool>(() {
  return HighContrastModeNotifier();
});

// Reduce Motion Notifier
class ReduceMotionNotifier extends Notifier<bool> {
  @override
  bool build() {
    _loadReduceMotion();
    return false;
  }

  Future<void> _loadReduceMotion() async {
    final box = await Hive.openBox('accessibility_settings');
    final enabled = box.get('reduce_motion', defaultValue: false) as bool;
    state = enabled;
  }

  Future<void> setReduceMotion(bool enabled) async {
    final box = await Hive.openBox('accessibility_settings');
    await box.put('reduce_motion', enabled);
    state = enabled;
  }

  Future<void> toggle() async {
    await setReduceMotion(!state);
  }
}

final reduceMotionProvider = NotifierProvider<ReduceMotionNotifier, bool>(() {
  return ReduceMotionNotifier();
});

// Screen Reader Mode Notifier
class ScreenReaderModeNotifier extends Notifier<bool> {
  @override
  bool build() {
    _loadScreenReaderMode();
    return false;
  }

  Future<void> _loadScreenReaderMode() async {
    final box = await Hive.openBox('accessibility_settings');
    final enabled = box.get('screen_reader_mode', defaultValue: false) as bool;
    state = enabled;
  }

  Future<void> setScreenReaderMode(bool enabled) async {
    final box = await Hive.openBox('accessibility_settings');
    await box.put('screen_reader_mode', enabled);
    state = enabled;
  }

  Future<void> toggle() async {
    await setScreenReaderMode(!state);
  }
}

final screenReaderModeProvider = NotifierProvider<ScreenReaderModeNotifier, bool>(() {
  return ScreenReaderModeNotifier();
});

// Accessible Theme Mode Notifier (renamed to avoid conflict with existing theme_provider.dart)
class AccessibleThemeModeNotifier extends Notifier<ThemeMode> {
  @override
  ThemeMode build() {
    _loadTheme();
    return ThemeMode.system;
  }

  Future<void> _loadTheme() async {
    final box = await Hive.openBox('accessibility_settings');
    final themeIndex = box.get('theme_mode', defaultValue: 0) as int;
    state = ThemeMode.values[themeIndex];
  }

  Future<void> setTheme(ThemeMode mode) async {
    final box = await Hive.openBox('accessibility_settings');
    await box.put('theme_mode', mode.index);
    state = mode;
  }
}

final accessibleThemeModeProvider = NotifierProvider<AccessibleThemeModeNotifier, ThemeMode>(() {
  return AccessibleThemeModeNotifier();
});

// Locale Notifier
class LocaleNotifier extends Notifier<Locale> {
  @override
  Locale build() {
    _loadLocale();
    return const Locale('en');
  }

  Future<void> _loadLocale() async {
    final box = await Hive.openBox('accessibility_settings');
    final languageCode = box.get('language_code', defaultValue: 'en') as String;
    state = Locale(languageCode);
  }

  Future<void> setLocale(Locale locale) async {
    final box = await Hive.openBox('accessibility_settings');
    await box.put('language_code', locale.languageCode);
    state = locale;
  }
}

final localeProvider = NotifierProvider<LocaleNotifier, Locale>(() {
  return LocaleNotifier();
});

// Accessible Theme Data Provider - Computes theme based on settings
final accessibleThemeProvider = Provider<ThemeData>((ref) {
  final highContrast = ref.watch(highContrastModeProvider);
  final isDarkMode = ref.watch(accessibleThemeModeProvider) == ThemeMode.dark;

  if (highContrast) {
    return isDarkMode
        ? AccessibilityConfig.getHighContrastDarkTheme()
        : AccessibilityConfig.getHighContrastLightTheme();
  }

  return ThemeData.light();
});
