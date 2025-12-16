// lib/config/accessibility_config.dart

import 'package:flutter/material.dart';

class AccessibilityConfig {
  // Font size scales
  static const double fontScaleSmall = 0.85;
  static const double fontScaleNormal = 1.0;
  static const double fontScaleLarge = 1.15;
  static const double fontScaleExtraLarge = 1.3;
  static const double fontScaleHuge = 1.5;
  static const double fontScaleGigantic = 1.8;

  // High contrast themes
  static ThemeData getHighContrastLightTheme() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: Colors.black,
      scaffoldBackgroundColor: Colors.white,
      colorScheme: const ColorScheme.light(
        primary: Colors.black,
        secondary: Colors.black87,
        surface: Colors.white,
        error: Color(0xFFD50000),
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: Colors.black,
        onError: Colors.white,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      cardTheme: CardThemeData(
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: const BorderSide(color: Colors.black, width: 2),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.black,
          foregroundColor: Colors.white,
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        ),
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: Colors.black,
        ),
        displayMedium: TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.bold,
          color: Colors.black,
        ),
        displaySmall: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.bold,
          color: Colors.black,
        ),
        headlineLarge: TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.w600,
          color: Colors.black,
        ),
        headlineMedium: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: Colors.black,
        ),
        headlineSmall: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: Colors.black,
        ),
        bodyLarge: TextStyle(
          fontSize: 16,
          color: Colors.black,
        ),
        bodyMedium: TextStyle(
          fontSize: 14,
          color: Colors.black,
        ),
        bodySmall: TextStyle(
          fontSize: 12,
          color: Colors.black87,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Colors.black, width: 2),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Colors.black, width: 2),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Colors.black, width: 3),
        ),
        labelStyle:
            const TextStyle(color: Colors.black, fontWeight: FontWeight.w600),
      ),
    );
  }

  static ThemeData getHighContrastDarkTheme() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: Colors.white,
      scaffoldBackgroundColor: Colors.black,
      colorScheme: const ColorScheme.dark(
        primary: Colors.white,
        secondary: Colors.white70,
        surface: Colors.black,
        error: Color(0xFFFF5252),
        onPrimary: Colors.black,
        onSecondary: Colors.black,
        onSurface: Colors.white,
        onError: Colors.black,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      cardTheme: CardThemeData(
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: const BorderSide(color: Colors.white, width: 2),
        ),
        color: Colors.black,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        ),
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
        displayMedium: TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
        displaySmall: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
        headlineLarge: TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
        headlineMedium: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
        headlineSmall: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
        bodyLarge: TextStyle(
          fontSize: 16,
          color: Colors.white,
        ),
        bodyMedium: TextStyle(
          fontSize: 14,
          color: Colors.white,
        ),
        bodySmall: TextStyle(
          fontSize: 12,
          color: Colors.white70,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Colors.white, width: 2),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Colors.white, width: 2),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Colors.white, width: 3),
        ),
        labelStyle:
            const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
      ),
    );
  }

  // Semantic labels for screen readers
  static const Map<String, String> semanticLabels = {
    'home_button': 'Navigate to home screen',
    'quizzes_button': 'View available quizzes',
    'materials_button': 'Access study materials',
    'leaderboard_button': 'Check leaderboard rankings',
    'profile_button': 'View your profile',
    'settings_button': 'Open settings',
    'logout_button': 'Log out of your account',
    'start_quiz_button': 'Start quiz',
    'submit_quiz_button': 'Submit quiz answers',
    'next_question_button': 'Go to next question',
    'previous_question_button': 'Go to previous question',
    'skip_question_button': 'Skip this question',
    'play_video_button': 'Play video',
    'pause_video_button': 'Pause video',
    'download_button': 'Download file',
    'share_button': 'Share content',
    'like_button': 'Like post',
    'comment_button': 'Add comment',
    'friend_request_button': 'Send friend request',
    'accept_friend_button': 'Accept friend request',
    'decline_friend_button': 'Decline friend request',
    'search_field': 'Search for quizzes or materials',
    'email_field': 'Enter your email address',
    'password_field': 'Enter your password',
    'loading_indicator': 'Loading content, please wait',
  };

  // Accessibility hints
  static const Map<String, String> accessibilityHints = {
    'quiz_card': 'Double tap to view quiz details and start',
    'material_card': 'Double tap to view material',
    'badge_card': 'Double tap to view badge details',
    'friend_card': 'Double tap to view friend profile',
    'post_card': 'Double tap to view post details',
    'notification_card': 'Double tap to view notification',
    'setting_tile': 'Double tap to change setting',
  };

  // Minimum touch target sizes (accessibility guidelines)
  static const double minTouchTargetSize = 48.0;
  static const double minInteractiveSize = 44.0;

  // Focus colors for keyboard navigation
  static const Color focusColorLight = Color(0xFF2962FF);
  static const Color focusColorDark = Color(0xFF82B1FF);

  // Animation durations (reduced for accessibility)
  static const Duration reducedMotionDuration = Duration(milliseconds: 100);
  static const Duration normalMotionDuration = Duration(milliseconds: 300);

  // Helper method to get font scale from preference
  static double getFontScale(String preference) {
    switch (preference.toLowerCase()) {
      case 'small':
        return fontScaleSmall;
      case 'large':
        return fontScaleLarge;
      case 'extra_large':
        return fontScaleExtraLarge;
      case 'huge':
        return fontScaleHuge;
      case 'gigantic':
        return fontScaleGigantic;
      case 'normal':
      default:
        return fontScaleNormal;
    }
  }

  // Helper method to get animation duration based on reduce motion preference
  static Duration getAnimationDuration(bool reduceMotion) {
    return reduceMotion ? reducedMotionDuration : normalMotionDuration;
  }
}
