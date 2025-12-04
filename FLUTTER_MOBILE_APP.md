# 📱 Cognito Learning Hub - Flutter Mobile App Development Guide

<div align="center">

**Complete Guide to Building Native Mobile Apps with Flutter**

_Migrating from React Web to Flutter Mobile_

</div>

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Prerequisites & Environment Setup](#-prerequisites--environment-setup)
3. [Flutter Project Setup](#-flutter-project-setup)
4. [Required Dependencies](#-required-dependencies)
5. [Project Structure](#-project-structure)
6. [Data Models](#-data-models)
7. [API Services](#-api-services)
8. [State Management](#-state-management)
9. [Navigation & Routing](#-navigation--routing)
10. [Screens to Build](#-screens-to-build)
11. [Reusable Widgets](#-reusable-widgets)
12. [Core Features Implementation](#-core-features-implementation)
13. [WebRTC & Socket.IO](#-webrtc--socketio)
14. [Native Features](#-native-features)
15. [Push Notifications](#-push-notifications)
16. [Offline Mode & Caching](#-offline-mode--caching)
17. [Error Handling](#-error-handling)
18. [Testing](#-testing)
19. [App Icons & Splash Screen](#-app-icons--splash-screen)
20. [Build & Deploy](#-build--deploy)
21. [App Store Guidelines](#-app-store-guidelines)

---

## 🎯 Project Overview

### Current React Web App Features to Migrate

| Feature          | React Implementation | Flutter Equivalent                 |
| ---------------- | -------------------- | ---------------------------------- |
| Authentication   | JWT + Google OAuth   | `firebase_auth` / `google_sign_in` |
| State Management | React Context        | `riverpod` / `bloc`                |
| HTTP Requests    | fetch API            | `dio` / `http`                     |
| WebSocket        | Socket.IO Client     | `socket_io_client`                 |
| WebRTC Video     | Native WebRTC        | `flutter_webrtc`                   |
| Charts           | Recharts             | `fl_chart`                         |
| Animations       | Framer Motion        | `flutter_animate`                  |
| Local Storage    | localStorage         | `shared_preferences` / `hive`      |
| QR Scanner       | html5-qrcode         | `mobile_scanner`                   |
| Text-to-Speech   | Web Speech API       | `flutter_tts`                      |

---

## 🛠️ Prerequisites & Environment Setup

### Required Software

| Software       | Version | Purpose                          |
| -------------- | ------- | -------------------------------- |
| Flutter SDK    | 3.16+   | Framework                        |
| Dart SDK       | 3.2+    | Language (included with Flutter) |
| Android Studio | 2023.1+ | Android development & emulator   |
| Xcode          | 15+     | iOS development (Mac only)       |
| VS Code        | Latest  | IDE with Flutter extension       |
| Git            | 2.40+   | Version control                  |
| Java JDK       | 17      | Android builds                   |
| CocoaPods      | 1.14+   | iOS dependencies (Mac only)      |

### Installation Steps

#### 1. Install Flutter SDK

```bash
# Windows (using Chocolatey)
choco install flutter

# macOS (using Homebrew)
brew install flutter

# Linux
sudo snap install flutter --classic

# Verify installation
flutter doctor
```

#### 2. Configure Android Studio

```bash
# Install Android SDK (via Android Studio)
# Required SDK Components:
# - Android SDK Platform 34
# - Android SDK Build-Tools 34
# - Android SDK Command-line Tools
# - Android Emulator
# - Android SDK Platform-Tools

# Accept licenses
flutter doctor --android-licenses
```

#### 3. Configure Xcode (macOS only)

```bash
# Install Xcode from App Store, then:
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -runFirstLaunch

# Install CocoaPods
sudo gem install cocoapods
```

#### 4. VS Code Extensions

Install these extensions:

- **Flutter** (Dart-Code.flutter)
- **Dart** (Dart-Code.dart-code)
- **Flutter Widget Snippets**
- **Awesome Flutter Snippets**
- **Pubspec Assist**

#### 5. Verify Setup

```bash
flutter doctor -v

# Expected output (all checkmarks):
# [✓] Flutter
# [✓] Android toolchain
# [✓] Xcode (macOS only)
# [✓] Chrome
# [✓] Android Studio
# [✓] VS Code
# [✓] Connected device
```

---

## 🚀 Flutter Project Setup

### 1. Create New Flutter Project

```bash
flutter create cognito_learning_hub
cd cognito_learning_hub
```

### 2. Minimum SDK Requirements

```yaml
# pubspec.yaml
environment:
  sdk: ">=3.0.0 <4.0.0"
  flutter: ">=3.10.0"
```

### 3. Android Configuration

```gradle
// android/app/build.gradle
android {
    compileSdkVersion 34

    defaultConfig {
        minSdkVersion 24  // Required for WebRTC
        targetSdkVersion 34
        multiDexEnabled true
    }
}
```

### 4. iOS Configuration

```ruby
# ios/Podfile
platform :ios, '13.0'
```

### 5. Required Permissions

#### Android Permissions (`android/app/src/main/AndroidManifest.xml`)

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Internet Access -->
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>

    <!-- Camera & Microphone (for WebRTC meetings) -->
    <uses-permission android:name="android.permission.CAMERA"/>
    <uses-permission android:name="android.permission.RECORD_AUDIO"/>
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS"/>

    <!-- Vibration (Haptic Feedback) -->
    <uses-permission android:name="android.permission.VIBRATE"/>

    <!-- Storage (for file uploads) -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES"/>

    <!-- Foreground Service (for background tasks) -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>

    <!-- Wake Lock (keep screen on during quiz) -->
    <uses-permission android:name="android.permission.WAKE_LOCK"/>

    <!-- Notifications -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>

    <application
        android:label="Cognito Learning Hub"
        android:name="${applicationName}"
        android:icon="@mipmap/ic_launcher"
        android:usesCleartextTraffic="true">

        <!-- Required for Google Sign-In -->
        <meta-data
            android:name="com.google.android.gms.version"
            android:value="@integer/google_play_services_version" />

        <!-- ... rest of application config -->
    </application>
</manifest>
```

#### iOS Permissions (`ios/Runner/Info.plist`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Camera Permission -->
    <key>NSCameraUsageDescription</key>
    <string>This app needs camera access for video meetings and QR code scanning</string>

    <!-- Microphone Permission -->
    <key>NSMicrophoneUsageDescription</key>
    <string>This app needs microphone access for video meetings</string>

    <!-- Photo Library Permission -->
    <key>NSPhotoLibraryUsageDescription</key>
    <string>This app needs photo library access to upload images</string>

    <!-- Speech Recognition (for TTS) -->
    <key>NSSpeechRecognitionUsageDescription</key>
    <string>This app uses speech recognition for accessibility features</string>

    <!-- Face ID (optional - for biometric auth) -->
    <key>NSFaceIDUsageDescription</key>
    <string>This app uses Face ID for secure login</string>

    <!-- Background Modes -->
    <key>UIBackgroundModes</key>
    <array>
        <string>audio</string>
        <string>voip</string>
        <string>fetch</string>
        <string>remote-notification</string>
    </array>

    <!-- ... rest of plist -->
</dict>
</plist>
```

---

## 📦 Required Dependencies

```yaml
# pubspec.yaml
dependencies:
  flutter:
    sdk: flutter

  # ----- CORE -----
  cupertino_icons: ^1.0.6

  # ----- STATE MANAGEMENT -----
  flutter_riverpod: ^2.4.9
  # OR
  flutter_bloc: ^8.1.3

  # ----- NETWORKING -----
  dio: ^5.4.0
  socket_io_client: ^2.0.3+1
  connectivity_plus: ^5.0.2

  # ----- AUTHENTICATION -----
  google_sign_in: ^6.2.1
  flutter_secure_storage: ^9.0.0
  jwt_decoder: ^2.0.1

  # ----- UI/UX -----
  flutter_animate: ^4.3.0
  shimmer: ^3.0.0
  cached_network_image: ^3.3.1
  flutter_svg: ^2.0.9
  lottie: ^3.0.0
  confetti_widget: ^0.7.0

  # ----- CHARTS -----
  fl_chart: ^0.66.0

  # ----- VIDEO/WEBRTC -----
  flutter_webrtc: ^0.9.47
  permission_handler: ^11.1.0

  # ----- QR CODE -----
  mobile_scanner: ^4.0.1
  qr_flutter: ^4.1.0

  # ----- AUDIO -----
  flutter_tts: ^3.8.5
  just_audio: ^0.9.36

  # ----- LOCAL STORAGE -----
  shared_preferences: ^2.2.2
  hive: ^2.2.3
  hive_flutter: ^1.1.0

  # ----- UTILITIES -----
  intl: ^0.19.0
  url_launcher: ^6.2.2
  share_plus: ^7.2.1
  image_picker: ^1.0.7
  file_picker: ^6.1.1
  path_provider: ^2.1.2

  # ----- HAPTIC FEEDBACK -----
  vibration: ^1.8.4

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1
  build_runner: ^2.4.8
  hive_generator: ^2.0.1
```

---

## 📁 Project Structure

```
lib/
├── main.dart                      # App entry point
├── app.dart                       # MaterialApp configuration
│
├── config/
│   ├── api_config.dart           # API URLs & endpoints
│   ├── theme.dart                # App theme (light/dark)
│   ├── routes.dart               # Named routes
│   └── constants.dart            # App constants
│
├── models/                        # Data models (from MongoDB schemas)
│   ├── user.dart
│   ├── quiz.dart
│   ├── question.dart
│   ├── result.dart
│   ├── achievement.dart
│   ├── live_session.dart
│   ├── meeting.dart
│   └── duel_match.dart
│
├── services/                      # API & external services
│   ├── api_service.dart          # Dio HTTP client
│   ├── auth_service.dart         # Authentication
│   ├── quiz_service.dart         # Quiz CRUD
│   ├── result_service.dart       # Results & analytics
│   ├── socket_service.dart       # Socket.IO connection
│   ├── webrtc_service.dart       # WebRTC for meetings
│   ├── storage_service.dart      # Local storage
│   └── notification_service.dart # Push notifications
│
├── providers/                     # Riverpod providers
│   ├── auth_provider.dart
│   ├── quiz_provider.dart
│   ├── socket_provider.dart
│   ├── theme_provider.dart
│   └── user_provider.dart
│
├── screens/                       # All app screens
│   ├── splash/
│   ├── auth/
│   │   ├── login_screen.dart
│   │   └── signup_screen.dart
│   ├── home/
│   │   └── home_screen.dart
│   ├── dashboard/
│   │   ├── student_dashboard.dart
│   │   └── teacher_dashboard.dart
│   ├── quiz/
│   │   ├── quiz_list_screen.dart
│   │   ├── quiz_taker_screen.dart
│   │   ├── quiz_creator_screen.dart
│   │   └── quiz_result_screen.dart
│   ├── live/
│   │   ├── live_session_host.dart
│   │   ├── live_session_join.dart
│   │   └── live_leaderboard.dart
│   ├── duel/
│   │   ├── duel_mode_screen.dart
│   │   └── duel_battle_screen.dart
│   ├── meeting/
│   │   ├── create_meeting_screen.dart
│   │   ├── join_meeting_screen.dart
│   │   └── meeting_room_screen.dart
│   ├── ai_tutor/
│   │   └── ai_tutor_screen.dart
│   ├── social/
│   │   └── social_dashboard.dart
│   ├── achievements/
│   │   └── achievements_screen.dart
│   └── settings/
│       └── settings_screen.dart
│
├── widgets/                       # Reusable widgets
│   ├── common/
│   │   ├── app_button.dart
│   │   ├── app_card.dart
│   │   ├── app_input.dart
│   │   ├── loading_spinner.dart
│   │   └── glassmorphic_card.dart
│   ├── quiz/
│   │   ├── question_card.dart
│   │   ├── option_tile.dart
│   │   └── timer_widget.dart
│   ├── charts/
│   │   ├── score_chart.dart
│   │   └── performance_pie.dart
│   └── meeting/
│       ├── video_tile.dart
│       └── participant_list.dart
│
└── utils/
    ├── validators.dart
    ├── helpers.dart
    ├── haptic_feedback.dart
    └── sound_manager.dart
```

---

## 📊 Data Models

### User Model

```dart
// lib/models/user.dart
import 'package:hive/hive.dart';

part 'user.g.dart';

@HiveType(typeId: 0)
class User {
  @HiveField(0)
  final String id;

  @HiveField(1)
  final String name;

  @HiveField(2)
  final String email;

  @HiveField(3)
  final String role; // Student, Teacher, Moderator, Admin

  @HiveField(4)
  final String? picture;

  @HiveField(5)
  final String? googleId;

  @HiveField(6)
  final String status; // online, offline, away

  @HiveField(7)
  final DateTime? lastSeen;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.picture,
    this.googleId,
    this.status = 'offline',
    this.lastSeen,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? json['id'],
      name: json['name'],
      email: json['email'],
      role: json['role'],
      picture: json['picture'],
      googleId: json['googleId'],
      status: json['status'] ?? 'offline',
      lastSeen: json['lastSeen'] != null
          ? DateTime.parse(json['lastSeen'])
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'role': role,
    'picture': picture,
    'googleId': googleId,
    'status': status,
    'lastSeen': lastSeen?.toIso8601String(),
  };
}
```

### Quiz Model

```dart
// lib/models/quiz.dart
class Question {
  final String id;
  final String question;
  final String type; // multiple-choice, true-false, descriptive
  final List<String> options;
  final String correctAnswer;
  final String? explanation;
  final int points;
  final int timeLimit;
  final String difficulty; // Easy, Medium, Hard, Expert

  Question({
    required this.id,
    required this.question,
    required this.type,
    required this.options,
    required this.correctAnswer,
    this.explanation,
    this.points = 1,
    this.timeLimit = 30,
    this.difficulty = 'Medium',
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['_id'] ?? '',
      question: json['question'],
      type: json['type'] ?? 'multiple-choice',
      options: List<String>.from(json['options'] ?? []),
      correctAnswer: json['correctAnswer'] ?? json['correct_answer'],
      explanation: json['explanation'],
      points: json['points'] ?? 1,
      timeLimit: json['timeLimit'] ?? 30,
      difficulty: json['difficulty'] ?? 'Medium',
    );
  }
}

class Quiz {
  final String id;
  final String title;
  final String? description;
  final List<Question> questions;
  final String createdBy;
  final String difficulty;
  final String? category;
  final List<String> tags;
  final bool isPublic;
  final int timeLimit;
  final int passingScore;
  final int attempts;
  final double averageScore;
  final DateTime createdAt;

  Quiz({
    required this.id,
    required this.title,
    this.description,
    required this.questions,
    required this.createdBy,
    this.difficulty = 'Medium',
    this.category,
    this.tags = const [],
    this.isPublic = true,
    this.timeLimit = 30,
    this.passingScore = 60,
    this.attempts = 0,
    this.averageScore = 0,
    required this.createdAt,
  });

  factory Quiz.fromJson(Map<String, dynamic> json) {
    return Quiz(
      id: json['_id'],
      title: json['title'],
      description: json['description'],
      questions: (json['questions'] as List)
          .map((q) => Question.fromJson(q))
          .toList(),
      createdBy: json['createdBy'] is String
          ? json['createdBy']
          : json['createdBy']['_id'],
      difficulty: json['difficulty'] ?? 'Medium',
      category: json['category'],
      tags: List<String>.from(json['tags'] ?? []),
      isPublic: json['isPublic'] ?? true,
      timeLimit: json['timeLimit'] ?? 30,
      passingScore: json['passingScore'] ?? 60,
      attempts: json['attempts'] ?? 0,
      averageScore: (json['averageScore'] ?? 0).toDouble(),
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
```

### Result Model

```dart
// lib/models/result.dart
class QuestionResult {
  final String questionId;
  final String userAnswer;
  final String correctAnswer;
  final bool isCorrect;
  final int timeTaken;
  final int pointsEarned;
  final int bonusPoints;

  QuestionResult({
    required this.questionId,
    required this.userAnswer,
    required this.correctAnswer,
    required this.isCorrect,
    required this.timeTaken,
    this.pointsEarned = 0,
    this.bonusPoints = 0,
  });

  factory QuestionResult.fromJson(Map<String, dynamic> json) {
    return QuestionResult(
      questionId: json['questionId'],
      userAnswer: json['userAnswer'] ?? '',
      correctAnswer: json['correctAnswer'] ?? '',
      isCorrect: json['isCorrect'] ?? false,
      timeTaken: json['timeTaken'] ?? 0,
      pointsEarned: json['pointsEarned'] ?? 0,
      bonusPoints: json['bonusPoints'] ?? 0,
    );
  }
}

class Result {
  final String id;
  final String oderId;
  final String quizId;
  final String? quizTitle;
  final int score;
  final int totalQuestions;
  final int pointsEarned;
  final double percentage;
  final bool passed;
  final String rank;
  final List<QuestionResult> questionResults;
  final DateTime createdAt;

  Result({
    required this.id,
    required this.userId,
    required this.quizId,
    this.quizTitle,
    required this.score,
    required this.totalQuestions,
    this.pointsEarned = 0,
    required this.percentage,
    required this.passed,
    this.rank = 'B',
    this.questionResults = const [],
    required this.createdAt,
  });

  factory Result.fromJson(Map<String, dynamic> json) {
    return Result(
      id: json['_id'],
      userId: json['user'] is String ? json['user'] : json['user']['_id'],
      quizId: json['quiz'] is String ? json['quiz'] : json['quiz']['_id'],
      quizTitle: json['quiz'] is Map ? json['quiz']['title'] : null,
      score: json['score'],
      totalQuestions: json['totalQuestions'],
      pointsEarned: json['pointsEarned'] ?? 0,
      percentage: (json['percentage'] ?? 0).toDouble(),
      passed: json['passed'] ?? false,
      rank: json['rank'] ?? 'B',
      questionResults: (json['questionResults'] as List?)
          ?.map((qr) => QuestionResult.fromJson(qr))
          .toList() ?? [],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
```

---

## 🌐 API Services

### API Configuration

```dart
// lib/config/api_config.dart
class ApiConfig {
  // Production URLs
  static const String prodApiUrl = 'https://your-api-gateway.vercel.app';
  static const String prodSocketUrl = 'https://your-api-gateway.vercel.app';
  static const String prodMeetingWsUrl = 'https://your-meeting-service.vercel.app';

  // Development URLs
  static const String devApiUrl = 'http://localhost:3000';
  static const String devSocketUrl = 'http://localhost:3000';
  static const String devMeetingWsUrl = 'http://localhost:3009';

  // Use dev or prod based on environment
  static bool get isDev => const bool.fromEnvironment('DEV', defaultValue: true);

  static String get apiUrl => isDev ? devApiUrl : prodApiUrl;
  static String get socketUrl => isDev ? devSocketUrl : prodSocketUrl;
  static String get meetingWsUrl => isDev ? devMeetingWsUrl : prodMeetingWsUrl;
}

// API Endpoints
class Endpoints {
  // Auth
  static const String login = '/api/auth/login';
  static const String register = '/api/auth/register';
  static const String profile = '/api/auth/profile';

  // Quiz
  static const String quizzes = '/api/quizzes';
  static String quizById(String id) => '/api/quizzes/$id';
  static const String generateFromTopic = '/api/generate-quiz-topic';
  static const String generateFromFile = '/api/generate-quiz-file';

  // Results
  static const String submitResult = '/api/results/submit';
  static const String myResults = '/api/results/my-results';
  static const String leaderboard = '/api/results/leaderboard';

  // Live Sessions
  static const String createSession = '/api/live-sessions/create';
  static const String joinSession = '/api/live-sessions/join';

  // Meetings
  static const String createMeeting = '/api/meetings/create';
  static const String joinMeeting = '/api/meetings/join';

  // AI Tutor
  static const String doubtSolver = '/api/doubt-solver/ask';

  // Achievements
  static const String achievements = '/api/achievements';
}
```

### Dio HTTP Service

```dart
// lib/services/api_service.dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;

  late Dio _dio;
  final _storage = const FlutterSecureStorage();

  ApiService._internal() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConfig.apiUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
      },
    ));

    // Add interceptors
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Add auth token to requests
        final token = await _storage.read(key: 'auth_token');
        if (token != null) {
          options.headers['x-auth-token'] = token;
        }
        return handler.next(options);
      },
      onError: (error, handler) {
        // Handle 401 - redirect to login
        if (error.response?.statusCode == 401) {
          // Clear token and redirect to login
          _storage.delete(key: 'auth_token');
        }
        return handler.next(error);
      },
    ));
  }

  Dio get dio => _dio;

  // Generic GET request
  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) {
    return _dio.get(path, queryParameters: queryParameters);
  }

  // Generic POST request
  Future<Response> post(String path, {dynamic data}) {
    return _dio.post(path, data: data);
  }

  // Generic PUT request
  Future<Response> put(String path, {dynamic data}) {
    return _dio.put(path, data: data);
  }

  // Generic DELETE request
  Future<Response> delete(String path) {
    return _dio.delete(path);
  }

  // Multipart file upload
  Future<Response> uploadFile(String path, String filePath, String fieldName) async {
    final formData = FormData.fromMap({
      fieldName: await MultipartFile.fromFile(filePath),
    });
    return _dio.post(path, data: formData);
  }
}
```

### Auth Service

```dart
// lib/services/auth_service.dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import '../models/user.dart';
import '../config/api_config.dart';
import 'api_service.dart';

class AuthService {
  final _api = ApiService();
  final _storage = const FlutterSecureStorage();
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
  );

  // Email/Password Login
  Future<User?> login(String email, String password) async {
    try {
      final response = await _api.post(Endpoints.login, data: {
        'email': email,
        'password': password,
      });

      final token = response.data['token'];
      await _storage.write(key: 'auth_token', value: token);

      return User.fromJson(response.data['user']);
    } catch (e) {
      rethrow;
    }
  }

  // Email/Password Register
  Future<User?> register(String name, String email, String password, String role) async {
    try {
      final response = await _api.post(Endpoints.register, data: {
        'name': name,
        'email': email,
        'password': password,
        'role': role,
      });

      final token = response.data['token'];
      await _storage.write(key: 'auth_token', value: token);

      return User.fromJson(response.data['user']);
    } catch (e) {
      rethrow;
    }
  }

  // Google Sign In
  Future<User?> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return null;

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

      final response = await _api.post('/api/auth/google', data: {
        'idToken': googleAuth.idToken,
        'accessToken': googleAuth.accessToken,
      });

      final token = response.data['token'];
      await _storage.write(key: 'auth_token', value: token);

      return User.fromJson(response.data['user']);
    } catch (e) {
      rethrow;
    }
  }

  // Check if user is logged in
  Future<User?> getCurrentUser() async {
    final token = await _storage.read(key: 'auth_token');
    if (token == null) return null;

    // Check if token is expired
    if (JwtDecoder.isExpired(token)) {
      await logout();
      return null;
    }

    // Decode token to get user
    final decodedToken = JwtDecoder.decode(token);
    return User.fromJson(decodedToken['user']);
  }

  // Logout
  Future<void> logout() async {
    await _storage.delete(key: 'auth_token');
    await _googleSignIn.signOut();
  }

  // Get stored token
  Future<String?> getToken() => _storage.read(key: 'auth_token');
}
```

---

## 🔄 State Management (Riverpod)

### Auth Provider

```dart
// lib/providers/auth_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

// Auth state
class AuthState {
  final User? user;
  final bool isLoading;
  final String? error;

  const AuthState({this.user, this.isLoading = false, this.error});

  bool get isAuthenticated => user != null;

  AuthState copyWith({User? user, bool? isLoading, String? error}) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// Auth notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;

  AuthNotifier(this._authService) : super(const AuthState(isLoading: true)) {
    _init();
  }

  Future<void> _init() async {
    final user = await _authService.getCurrentUser();
    state = AuthState(user: user, isLoading: false);
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final user = await _authService.login(email, password);
      state = AuthState(user: user);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> register(String name, String email, String password, String role) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final user = await _authService.register(name, email, password, role);
      state = AuthState(user: user);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> signInWithGoogle() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final user = await _authService.signInWithGoogle();
      state = AuthState(user: user);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    state = const AuthState();
  }
}

// Providers
final authServiceProvider = Provider((ref) => AuthService());

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.watch(authServiceProvider));
});
```

---

## 🧭 Navigation & Routing

### GoRouter Setup

```dart
// lib/config/routes.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../screens/splash/splash_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/signup_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/dashboard/student_dashboard.dart';
import '../screens/dashboard/teacher_dashboard.dart';
import '../screens/quiz/quiz_list_screen.dart';
import '../screens/quiz/quiz_taker_screen.dart';
import '../screens/quiz/quiz_result_screen.dart';
import '../screens/live/live_session_host.dart';
import '../screens/live/live_session_join.dart';
import '../screens/duel/duel_mode_screen.dart';
import '../screens/duel/duel_battle_screen.dart';
import '../screens/meeting/meeting_room_screen.dart';
import '../screens/ai_tutor/ai_tutor_screen.dart';
import '../screens/settings/settings_screen.dart';

// Route names
class AppRoutes {
  static const splash = '/';
  static const login = '/login';
  static const signup = '/signup';
  static const home = '/home';
  static const studentDashboard = '/dashboard/student';
  static const teacherDashboard = '/dashboard/teacher';
  static const quizList = '/quizzes';
  static const quizTaker = '/quiz/:quizId';
  static const quizResult = '/quiz/:quizId/result';
  static const quizCreate = '/quiz/create';
  static const liveHost = '/live/host/:quizId';
  static const liveJoin = '/live/join';
  static const duelMode = '/duel';
  static const duelBattle = '/duel/:quizId';
  static const meetingCreate = '/meeting/create';
  static const meetingJoin = '/meeting/join';
  static const meetingRoom = '/meeting/:roomId';
  static const aiTutor = '/ai-tutor';
  static const achievements = '/achievements';
  static const leaderboard = '/leaderboard';
  static const settings = '/settings';
}

// Router provider
final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: AppRoutes.splash,
    debugLogDiagnostics: true,

    // Redirect logic based on auth state
    redirect: (context, state) {
      final isLoggedIn = authState.isAuthenticated;
      final isLoading = authState.isLoading;
      final isAuthRoute = state.matchedLocation == AppRoutes.login ||
                          state.matchedLocation == AppRoutes.signup;

      // Still loading - stay on splash
      if (isLoading) return null;

      // Not logged in and not on auth route - go to login
      if (!isLoggedIn && !isAuthRoute && state.matchedLocation != AppRoutes.splash) {
        return AppRoutes.login;
      }

      // Logged in and on auth route - go to home
      if (isLoggedIn && isAuthRoute) {
        return AppRoutes.home;
      }

      return null;
    },

    routes: [
      GoRoute(
        path: AppRoutes.splash,
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: AppRoutes.signup,
        builder: (context, state) => const SignupScreen(),
      ),
      GoRoute(
        path: AppRoutes.home,
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: AppRoutes.studentDashboard,
        builder: (context, state) => const StudentDashboard(),
      ),
      GoRoute(
        path: AppRoutes.teacherDashboard,
        builder: (context, state) => const TeacherDashboard(),
      ),
      GoRoute(
        path: AppRoutes.quizList,
        builder: (context, state) => const QuizListScreen(),
      ),
      GoRoute(
        path: AppRoutes.quizTaker,
        builder: (context, state) {
          final quizId = state.pathParameters['quizId']!;
          return QuizTakerScreen(quizId: quizId);
        },
      ),
      GoRoute(
        path: AppRoutes.quizResult,
        builder: (context, state) {
          final quizId = state.pathParameters['quizId']!;
          final resultId = state.uri.queryParameters['resultId'];
          return QuizResultScreen(quizId: quizId, resultId: resultId);
        },
      ),
      GoRoute(
        path: AppRoutes.liveJoin,
        builder: (context, state) => const LiveSessionJoin(),
      ),
      GoRoute(
        path: AppRoutes.liveHost,
        builder: (context, state) {
          final quizId = state.pathParameters['quizId']!;
          return LiveSessionHost(quizId: quizId);
        },
      ),
      GoRoute(
        path: AppRoutes.duelMode,
        builder: (context, state) => const DuelModeScreen(),
      ),
      GoRoute(
        path: AppRoutes.duelBattle,
        builder: (context, state) {
          final quizId = state.pathParameters['quizId']!;
          return DuelBattleScreen(quizId: quizId);
        },
      ),
      GoRoute(
        path: AppRoutes.meetingRoom,
        builder: (context, state) {
          final roomId = state.pathParameters['roomId']!;
          return MeetingRoomScreen(roomId: roomId);
        },
      ),
      GoRoute(
        path: AppRoutes.aiTutor,
        builder: (context, state) => const AITutorScreen(),
      ),
      GoRoute(
        path: AppRoutes.settings,
        builder: (context, state) => const SettingsScreen(),
      ),
    ],

    // Error page
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Text('Page not found: ${state.uri}'),
      ),
    ),
  );
});
```

### Add GoRouter dependency

```yaml
# pubspec.yaml - add to dependencies
dependencies:
  go_router: ^13.0.1
```

### Main App with Router

```dart
// lib/main.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'config/routes.dart';
import 'config/theme.dart';
import 'providers/theme_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Hive for local storage
  await Hive.initFlutter();

  runApp(
    const ProviderScope(
      child: CognitoApp(),
    ),
  );
}

class CognitoApp extends ConsumerWidget {
  const CognitoApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final themeMode = ref.watch(themeProvider);

    return MaterialApp.router(
      title: 'Cognito Learning Hub',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      routerConfig: router,
    );
  }
}
```

---

## 📱 Screens to Build

### 1. Authentication Screens

- `SplashScreen` - App loading & auto-login check
- `LoginScreen` - Email/password + Google Sign-In
- `SignUpScreen` - Registration with role selection

### 2. Dashboard Screens

- `StudentDashboard` - Stats, recent quizzes, achievements
- `TeacherDashboard` - Created quizzes, analytics, students

### 3. Quiz Screens

- `QuizListScreen` - Browse all quizzes
- `QuizTakerScreen` - Take quiz with timer
- `QuizResultScreen` - Show results with explanations
- `QuizCreatorScreen` - Manual quiz creation
- `AIQuizGeneratorScreen` - Generate from topic/file

### 4. Live Session Screens

- `LiveSessionHost` - Host controls, QR code
- `LiveSessionJoin` - Join with code/QR scan
- `LiveLeaderboard` - Real-time rankings

### 5. Duel Screens

- `DuelModeScreen` - Find opponent
- `DuelBattleScreen` - 1v1 quiz battle

### 6. Meeting Screens

- `CreateMeetingScreen` - Start new meeting
- `JoinMeetingScreen` - Join with room ID
- `MeetingRoomScreen` - WebRTC video grid

### 7. Other Screens

- `AITutorScreen` - Chat with AI tutor
- `AchievementsScreen` - Badges & progress
- `LeaderboardScreen` - Global rankings
- `SettingsScreen` - Profile, theme, notifications

---

## 🧩 Reusable Widgets

### Glassmorphic Card (matching web app style)

```dart
// lib/widgets/common/glassmorphic_card.dart
import 'dart:ui';
import 'package:flutter/material.dart';

class GlassmorphicCard extends StatelessWidget {
  final Widget child;
  final double blur;
  final double opacity;
  final BorderRadius? borderRadius;
  final EdgeInsetsGeometry? padding;
  final Color? borderColor;

  const GlassmorphicCard({
    super.key,
    required this.child,
    this.blur = 10,
    this.opacity = 0.1,
    this.borderRadius,
    this.padding,
    this.borderColor,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ClipRRect(
      borderRadius: borderRadius ?? BorderRadius.circular(16),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: Container(
          padding: padding ?? const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark
                ? Colors.white.withOpacity(opacity)
                : Colors.black.withOpacity(opacity),
            borderRadius: borderRadius ?? BorderRadius.circular(16),
            border: Border.all(
              color: borderColor ??
                  (isDark ? Colors.white.withOpacity(0.2) : Colors.black.withOpacity(0.1)),
            ),
          ),
          child: child,
        ),
      ),
    );
  }
}
```

### App Button

```dart
// lib/widgets/common/app_button.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../utils/haptic_feedback.dart';

class AppButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isOutlined;
  final IconData? icon;
  final Color? backgroundColor;
  final Color? textColor;
  final double? width;
  final EdgeInsetsGeometry? padding;

  const AppButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.isOutlined = false,
    this.icon,
    this.backgroundColor,
    this.textColor,
    this.width,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SizedBox(
      width: width,
      child: isOutlined
          ? OutlinedButton(
              onPressed: isLoading ? null : () {
                HapticFeedback.light();
                onPressed?.call();
              },
              style: OutlinedButton.styleFrom(
                padding: padding ?? const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                side: BorderSide(color: backgroundColor ?? theme.colorScheme.primary),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: _buildChild(theme, isOutlined: true),
            )
          : ElevatedButton(
              onPressed: isLoading ? null : () {
                HapticFeedback.light();
                onPressed?.call();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: backgroundColor ?? theme.colorScheme.primary,
                foregroundColor: textColor ?? Colors.white,
                padding: padding ?? const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
              child: _buildChild(theme),
            ),
    ).animate().fadeIn().scale(begin: const Offset(0.95, 0.95));
  }

  Widget _buildChild(ThemeData theme, {bool isOutlined = false}) {
    if (isLoading) {
      return SizedBox(
        height: 20,
        width: 20,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation(
            isOutlined ? theme.colorScheme.primary : Colors.white,
          ),
        ),
      );
    }

    if (icon != null) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 20),
          const SizedBox(width: 8),
          Text(text, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      );
    }

    return Text(text, style: const TextStyle(fontWeight: FontWeight.w600));
  }
}
```

### App Input Field

```dart
// lib/widgets/common/app_input.dart
import 'package:flutter/material.dart';

class AppInput extends StatefulWidget {
  final String? label;
  final String? hint;
  final TextEditingController? controller;
  final bool obscureText;
  final TextInputType? keyboardType;
  final IconData? prefixIcon;
  final Widget? suffix;
  final String? Function(String?)? validator;
  final void Function(String)? onChanged;
  final int maxLines;
  final bool enabled;

  const AppInput({
    super.key,
    this.label,
    this.hint,
    this.controller,
    this.obscureText = false,
    this.keyboardType,
    this.prefixIcon,
    this.suffix,
    this.validator,
    this.onChanged,
    this.maxLines = 1,
    this.enabled = true,
  });

  @override
  State<AppInput> createState() => _AppInputState();
}

class _AppInputState extends State<AppInput> {
  bool _obscured = true;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.label != null) ...[
          Text(
            widget.label!,
            style: const TextStyle(
              fontWeight: FontWeight.w500,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 8),
        ],
        TextFormField(
          controller: widget.controller,
          obscureText: widget.obscureText && _obscured,
          keyboardType: widget.keyboardType,
          validator: widget.validator,
          onChanged: widget.onChanged,
          maxLines: widget.maxLines,
          enabled: widget.enabled,
          decoration: InputDecoration(
            hintText: widget.hint,
            prefixIcon: widget.prefixIcon != null
                ? Icon(widget.prefixIcon, size: 20)
                : null,
            suffixIcon: widget.obscureText
                ? IconButton(
                    icon: Icon(
                      _obscured ? Icons.visibility_off : Icons.visibility,
                      size: 20,
                    ),
                    onPressed: () => setState(() => _obscured = !_obscured),
                  )
                : widget.suffix,
            filled: true,
            fillColor: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.5),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: Theme.of(context).colorScheme.primary,
                width: 2,
              ),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(
                color: Theme.of(context).colorScheme.error,
              ),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          ),
        ),
      ],
    );
  }
}
```

### Quiz Timer Widget

```dart
// lib/widgets/quiz/timer_widget.dart
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../utils/haptic_feedback.dart';

class QuizTimerWidget extends StatefulWidget {
  final int seconds;
  final VoidCallback onTimeUp;
  final bool isRunning;

  const QuizTimerWidget({
    super.key,
    required this.seconds,
    required this.onTimeUp,
    this.isRunning = true,
  });

  @override
  State<QuizTimerWidget> createState() => _QuizTimerWidgetState();
}

class _QuizTimerWidgetState extends State<QuizTimerWidget> {
  late int _remainingSeconds;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _remainingSeconds = widget.seconds;
    if (widget.isRunning) _startTimer();
  }

  @override
  void didUpdateWidget(QuizTimerWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.seconds != oldWidget.seconds) {
      _remainingSeconds = widget.seconds;
      _timer?.cancel();
      if (widget.isRunning) _startTimer();
    }
    if (widget.isRunning != oldWidget.isRunning) {
      if (widget.isRunning) {
        _startTimer();
      } else {
        _timer?.cancel();
      }
    }
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds > 0) {
        setState(() => _remainingSeconds--);

        // Haptic feedback at 10, 5, 3, 2, 1 seconds
        if ([10, 5, 3, 2, 1].contains(_remainingSeconds)) {
          HapticFeedback.warning();
        }
      } else {
        timer.cancel();
        widget.onTimeUp();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Color get _timerColor {
    if (_remainingSeconds <= 5) return Colors.red;
    if (_remainingSeconds <= 10) return Colors.orange;
    return Theme.of(context).colorScheme.primary;
  }

  @override
  Widget build(BuildContext context) {
    final progress = _remainingSeconds / widget.seconds;

    return Stack(
      alignment: Alignment.center,
      children: [
        SizedBox(
          width: 60,
          height: 60,
          child: CircularProgressIndicator(
            value: progress,
            strokeWidth: 4,
            backgroundColor: Colors.grey.withOpacity(0.2),
            valueColor: AlwaysStoppedAnimation(_timerColor),
          ),
        ),
        Text(
          '$_remainingSeconds',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: _timerColor,
          ),
        ).animate(
          target: _remainingSeconds <= 5 ? 1 : 0,
        ).shake(duration: 500.ms),
      ],
    );
  }
}
```

### Question Option Tile

```dart
// lib/widgets/quiz/option_tile.dart
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../utils/haptic_feedback.dart';
import '../../utils/sound_manager.dart';

class OptionTile extends StatelessWidget {
  final String option;
  final String label; // A, B, C, D
  final bool isSelected;
  final bool? isCorrect; // null = not answered yet
  final bool isDisabled;
  final VoidCallback? onTap;

  const OptionTile({
    super.key,
    required this.option,
    required this.label,
    this.isSelected = false,
    this.isCorrect,
    this.isDisabled = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    Color backgroundColor;
    Color borderColor;
    Color textColor;

    if (isCorrect == true) {
      backgroundColor = Colors.green.withOpacity(0.2);
      borderColor = Colors.green;
      textColor = Colors.green;
    } else if (isCorrect == false && isSelected) {
      backgroundColor = Colors.red.withOpacity(0.2);
      borderColor = Colors.red;
      textColor = Colors.red;
    } else if (isSelected) {
      backgroundColor = theme.colorScheme.primary.withOpacity(0.2);
      borderColor = theme.colorScheme.primary;
      textColor = theme.colorScheme.primary;
    } else {
      backgroundColor = theme.colorScheme.surface;
      borderColor = theme.colorScheme.outline.withOpacity(0.3);
      textColor = theme.colorScheme.onSurface;
    }

    return GestureDetector(
      onTap: isDisabled ? null : () {
        HapticFeedback.light();
        if (isCorrect != null) {
          if (isCorrect!) {
            SoundManager().playCorrect();
            HapticFeedback.success();
          } else {
            SoundManager().playIncorrect();
            HapticFeedback.error();
          }
        }
        onTap?.call();
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: backgroundColor,
          border: Border.all(color: borderColor, width: 2),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: isSelected || isCorrect != null
                    ? borderColor
                    : Colors.transparent,
                border: Border.all(color: borderColor, width: 2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: Text(
                  label,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: isSelected || isCorrect != null
                        ? Colors.white
                        : textColor,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                option,
                style: TextStyle(
                  fontSize: 16,
                  color: textColor,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                ),
              ),
            ),
            if (isCorrect == true)
              const Icon(Icons.check_circle, color: Colors.green)
            else if (isCorrect == false && isSelected)
              const Icon(Icons.cancel, color: Colors.red),
          ],
        ),
      ),
    ).animate().fadeIn(delay: (100 * int.parse(label.codeUnitAt(0).toString())).ms).slideX(begin: 0.1);
  }
}
```

### Loading Spinner

```dart
// lib/widgets/common/loading_spinner.dart
import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

class LoadingSpinner extends StatelessWidget {
  final String? message;
  final double size;

  const LoadingSpinner({
    super.key,
    this.message,
    this.size = 100,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Option 1: Lottie animation
          // Lottie.asset(
          //   'assets/animations/loading.json',
          //   width: size,
          //   height: size,
          // ),

          // Option 2: Custom spinner
          SizedBox(
            width: size,
            height: size,
            child: CircularProgressIndicator(
              strokeWidth: 3,
              valueColor: AlwaysStoppedAnimation(
                Theme.of(context).colorScheme.primary,
              ),
            ),
          ),
          if (message != null) ...[
            const SizedBox(height: 16),
            Text(
              message!,
              style: TextStyle(
                color: Theme.of(context).colorScheme.onSurface.withOpacity(0.7),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
```

---

## 🎮 Core Features Implementation

### Socket.IO Service

```dart
// lib/services/socket_service.dart
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../config/api_config.dart';
import '../services/auth_service.dart';

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;

  IO.Socket? _socket;
  final _authService = AuthService();

  SocketService._internal();

  bool get isConnected => _socket?.connected ?? false;

  Future<void> connect() async {
    final token = await _authService.getToken();

    _socket = IO.io(ApiConfig.socketUrl, <String, dynamic>{
      'transports': ['websocket', 'polling'],
      'autoConnect': true,
      'extraHeaders': {'x-auth-token': token},
    });

    _socket!.onConnect((_) {
      print('Socket connected: ${_socket!.id}');
    });

    _socket!.onDisconnect((_) {
      print('Socket disconnected');
    });

    _socket!.onError((error) {
      print('Socket error: $error');
    });
  }

  void emit(String event, dynamic data) {
    _socket?.emit(event, data);
  }

  void on(String event, Function(dynamic) callback) {
    _socket?.on(event, callback);
  }

  void off(String event) {
    _socket?.off(event);
  }

  void disconnect() {
    _socket?.disconnect();
  }
}
```

### Haptic Feedback Utility

```dart
// lib/utils/haptic_feedback.dart
import 'package:vibration/vibration.dart';

class HapticFeedback {
  static Future<void> light() async {
    if (await Vibration.hasVibrator() ?? false) {
      Vibration.vibrate(duration: 10);
    }
  }

  static Future<void> medium() async {
    if (await Vibration.hasVibrator() ?? false) {
      Vibration.vibrate(duration: 20);
    }
  }

  static Future<void> heavy() async {
    if (await Vibration.hasVibrator() ?? false) {
      Vibration.vibrate(duration: 40);
    }
  }

  static Future<void> success() async {
    if (await Vibration.hasVibrator() ?? false) {
      Vibration.vibrate(pattern: [0, 10, 50, 10]);
    }
  }

  static Future<void> error() async {
    if (await Vibration.hasVibrator() ?? false) {
      Vibration.vibrate(pattern: [0, 20, 100, 20, 100, 20]);
    }
  }
}
```

### Sound Manager

```dart
// lib/utils/sound_manager.dart
import 'package:just_audio/just_audio.dart';

class SoundManager {
  static final SoundManager _instance = SoundManager._internal();
  factory SoundManager() => _instance;

  final AudioPlayer _correctPlayer = AudioPlayer();
  final AudioPlayer _incorrectPlayer = AudioPlayer();
  bool _isMuted = false;

  SoundManager._internal() {
    _init();
  }

  Future<void> _init() async {
    await _correctPlayer.setAsset('assets/sounds/correct.mp3');
    await _incorrectPlayer.setAsset('assets/sounds/incorrect.mp3');
  }

  Future<void> playCorrect() async {
    if (!_isMuted) {
      await _correctPlayer.seek(Duration.zero);
      await _correctPlayer.play();
    }
  }

  Future<void> playIncorrect() async {
    if (!_isMuted) {
      await _incorrectPlayer.seek(Duration.zero);
      await _incorrectPlayer.play();
    }
  }

  void toggleMute() => _isMuted = !_isMuted;
  bool get isMuted => _isMuted;

  void dispose() {
    _correctPlayer.dispose();
    _incorrectPlayer.dispose();
  }
}
```

---

## 📹 WebRTC & Socket.IO

### WebRTC Service for Meetings

```dart
// lib/services/webrtc_service.dart
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../config/api_config.dart';

class WebRTCService {
  IO.Socket? _socket;
  RTCPeerConnection? _peerConnection;
  MediaStream? _localStream;
  final Map<String, RTCPeerConnection> _peerConnections = {};
  final Map<String, MediaStream> _remoteStreams = {};

  Function(MediaStream)? onLocalStream;
  Function(String peerId, MediaStream)? onRemoteStream;
  Function(String peerId)? onPeerDisconnected;

  final Map<String, dynamic> _configuration = {
    'iceServers': [
      {'urls': 'stun:stun.l.google.com:19302'},
    ],
  };

  Future<void> initialize() async {
    // Get local media stream
    _localStream = await navigator.mediaDevices.getUserMedia({
      'audio': true,
      'video': {
        'facingMode': 'user',
        'width': 1280,
        'height': 720,
      },
    });

    onLocalStream?.call(_localStream!);
  }

  void connectToMeetingServer(String roomId, String userId, String userName) {
    _socket = IO.io(ApiConfig.meetingWsUrl, <String, dynamic>{
      'transports': ['websocket', 'polling'],
      'autoConnect': true,
    });

    _socket!.onConnect((_) {
      print('Connected to meeting server');
      _socket!.emit('join-meeting', {
        'roomId': roomId,
        'userId': userId,
        'userName': userName,
      });
    });

    _socket!.on('user-joined', (data) => _handleUserJoined(data));
    _socket!.on('offer', (data) => _handleOffer(data));
    _socket!.on('answer', (data) => _handleAnswer(data));
    _socket!.on('ice-candidate', (data) => _handleIceCandidate(data));
    _socket!.on('user-left', (data) => _handleUserLeft(data));
  }

  Future<RTCPeerConnection> _createPeerConnection(String peerId) async {
    final pc = await createPeerConnection(_configuration);

    // Add local tracks
    _localStream?.getTracks().forEach((track) {
      pc.addTrack(track, _localStream!);
    });

    // Handle ICE candidates
    pc.onIceCandidate = (candidate) {
      _socket?.emit('ice-candidate', {
        'targetId': peerId,
        'candidate': candidate.toMap(),
      });
    };

    // Handle remote stream
    pc.onTrack = (event) {
      if (event.streams.isNotEmpty) {
        _remoteStreams[peerId] = event.streams[0];
        onRemoteStream?.call(peerId, event.streams[0]);
      }
    };

    _peerConnections[peerId] = pc;
    return pc;
  }

  Future<void> _handleUserJoined(dynamic data) async {
    final peerId = data['socketId'];
    final pc = await _createPeerConnection(peerId);

    // Create and send offer
    final offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    _socket?.emit('offer', {
      'targetId': peerId,
      'offer': offer.toMap(),
    });
  }

  Future<void> _handleOffer(dynamic data) async {
    final peerId = data['senderId'];
    final pc = await _createPeerConnection(peerId);

    await pc.setRemoteDescription(
      RTCSessionDescription(data['offer']['sdp'], data['offer']['type']),
    );

    final answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    _socket?.emit('answer', {
      'targetId': peerId,
      'answer': answer.toMap(),
    });
  }

  Future<void> _handleAnswer(dynamic data) async {
    final peerId = data['senderId'];
    final pc = _peerConnections[peerId];

    await pc?.setRemoteDescription(
      RTCSessionDescription(data['answer']['sdp'], data['answer']['type']),
    );
  }

  Future<void> _handleIceCandidate(dynamic data) async {
    final peerId = data['senderId'];
    final pc = _peerConnections[peerId];

    await pc?.addCandidate(RTCIceCandidate(
      data['candidate']['candidate'],
      data['candidate']['sdpMid'],
      data['candidate']['sdpMLineIndex'],
    ));
  }

  void _handleUserLeft(dynamic data) {
    final peerId = data['socketId'];
    _peerConnections[peerId]?.close();
    _peerConnections.remove(peerId);
    _remoteStreams.remove(peerId);
    onPeerDisconnected?.call(peerId);
  }

  void toggleAudio(bool enabled) {
    _localStream?.getAudioTracks().forEach((track) {
      track.enabled = enabled;
    });
  }

  void toggleVideo(bool enabled) {
    _localStream?.getVideoTracks().forEach((track) {
      track.enabled = enabled;
    });
  }

  void disconnect() {
    _localStream?.dispose();
    _peerConnections.forEach((_, pc) => pc.close());
    _peerConnections.clear();
    _remoteStreams.clear();
    _socket?.disconnect();
  }
}
```

---

## 📲 Native Features

### Text-to-Speech (Accessibility)

```dart
// lib/utils/tts_service.dart
import 'package:flutter_tts/flutter_tts.dart';

class TTSService {
  static final TTSService _instance = TTSService._internal();
  factory TTSService() => _instance;

  final FlutterTts _flutterTts = FlutterTts();
  bool _isPlaying = false;

  TTSService._internal() {
    _init();
  }

  Future<void> _init() async {
    await _flutterTts.setLanguage('en-US');
    await _flutterTts.setSpeechRate(0.5);
    await _flutterTts.setVolume(1.0);
    await _flutterTts.setPitch(1.0);

    _flutterTts.setCompletionHandler(() {
      _isPlaying = false;
    });
  }

  Future<void> speak(String text) async {
    if (_isPlaying) {
      await stop();
    }
    _isPlaying = true;
    await _flutterTts.speak(text);
  }

  Future<void> stop() async {
    _isPlaying = false;
    await _flutterTts.stop();
  }

  bool get isPlaying => _isPlaying;
}
```

### QR Code Scanner

```dart
// lib/widgets/qr_scanner.dart
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

class QRScannerWidget extends StatefulWidget {
  final Function(String) onScanned;

  const QRScannerWidget({super.key, required this.onScanned});

  @override
  State<QRScannerWidget> createState() => _QRScannerWidgetState();
}

class _QRScannerWidgetState extends State<QRScannerWidget> {
  final MobileScannerController _controller = MobileScannerController();
  bool _hasScanned = false;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        MobileScanner(
          controller: _controller,
          onDetect: (capture) {
            if (_hasScanned) return;

            final List<Barcode> barcodes = capture.barcodes;
            for (final barcode in barcodes) {
              if (barcode.rawValue != null) {
                _hasScanned = true;
                widget.onScanned(barcode.rawValue!);
                break;
              }
            }
          },
        ),
        // Scanning overlay
        Center(
          child: Container(
            width: 250,
            height: 250,
            decoration: BoxDecoration(
              border: Border.all(color: Colors.white, width: 2),
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ],
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}
```

---

## 🎨 UI Theme

```dart
// lib/config/theme.dart
import 'package:flutter/material.dart';

class AppTheme {
  // Colors
  static const Color primaryColor = Color(0xFF6366F1); // Indigo
  static const Color secondaryColor = Color(0xFFA855F7); // Purple
  static const Color accentColor = Color(0xFFEC4899); // Pink

  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primaryColor,
      brightness: Brightness.light,
    ),
    fontFamily: 'Inter',
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
    ),
    cardTheme: CardTheme(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    ),
  );

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primaryColor,
      brightness: Brightness.dark,
    ),
    fontFamily: 'Inter',
    scaffoldBackgroundColor: const Color(0xFF111827),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
    ),
    cardTheme: CardTheme(
      color: const Color(0xFF1F2937),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
    ),
  );
}
```

---

## 🔔 Push Notifications

### Firebase Cloud Messaging Setup

```yaml
# Add to pubspec.yaml
dependencies:
  firebase_core: ^2.24.2
  firebase_messaging: ^14.7.10
  flutter_local_notifications: ^16.3.0
```

### Initialize Firebase

```dart
// lib/services/push_notification_service.dart
import 'dart:convert';
import 'dart:io';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../config/firebase_options.dart';

// Must be top-level function
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  print('Handling a background message: ${message.messageId}');
}

class PushNotificationService {
  static final PushNotificationService _instance = PushNotificationService._internal();
  factory PushNotificationService() => _instance;
  PushNotificationService._internal();

  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  String? _fcmToken;
  String? get fcmToken => _fcmToken;

  Future<void> initialize() async {
    // Set background message handler
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Request permission
    NotificationSettings settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      print('User granted notification permission');
      await _setupFCM();
      await _setupLocalNotifications();
    }
  }

  Future<void> _setupFCM() async {
    // Get FCM token
    _fcmToken = await _fcm.getToken();
    print('FCM Token: $_fcmToken');

    // Listen for token refresh
    _fcm.onTokenRefresh.listen((token) {
      _fcmToken = token;
      // TODO: Send token to your backend
    });

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // Handle notification tap when app was in background
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);

    // Check if app was opened from notification
    RemoteMessage? initialMessage = await _fcm.getInitialMessage();
    if (initialMessage != null) {
      _handleNotificationTap(initialMessage);
    }
  }

  Future<void> _setupLocalNotifications() async {
    // Android setup
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');

    // iOS setup
    final iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    final initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (response) {
        _handleLocalNotificationTap(response);
      },
    );

    // Create notification channel for Android
    if (Platform.isAndroid) {
      await _localNotifications
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(
            const AndroidNotificationChannel(
              'high_importance_channel',
              'High Importance Notifications',
              description: 'Used for important notifications',
              importance: Importance.high,
            ),
          );
    }
  }

  void _handleForegroundMessage(RemoteMessage message) {
    print('Received foreground message: ${message.messageId}');

    // Show local notification
    _showLocalNotification(
      title: message.notification?.title ?? 'New Notification',
      body: message.notification?.body ?? '',
      payload: jsonEncode(message.data),
    );
  }

  void _handleNotificationTap(RemoteMessage message) {
    print('Notification tapped: ${message.data}');
    _navigateBasedOnData(message.data);
  }

  void _handleLocalNotificationTap(NotificationResponse response) {
    if (response.payload != null) {
      final data = jsonDecode(response.payload!) as Map<String, dynamic>;
      _navigateBasedOnData(data);
    }
  }

  void _navigateBasedOnData(Map<String, dynamic> data) {
    // Navigate based on notification type
    final type = data['type'];

    switch (type) {
      case 'live_quiz':
        // Navigate to live quiz
        // router.push('/live-quiz/${data['sessionId']}');
        break;
      case 'duel_challenge':
        // Navigate to duel
        // router.push('/duel/${data['duelId']}');
        break;
      case 'meeting_invite':
        // Navigate to meeting
        // router.push('/meeting/${data['meetingId']}');
        break;
      case 'new_follower':
        // Navigate to profile
        // router.push('/profile/${data['userId']}');
        break;
      default:
        // Navigate to home
        break;
    }
  }

  Future<void> _showLocalNotification({
    required String title,
    required String body,
    String? payload,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'high_importance_channel',
      'High Importance Notifications',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      DateTime.now().millisecond,
      title,
      body,
      details,
      payload: payload,
    );
  }

  // Subscribe to topic (e.g., for broadcast notifications)
  Future<void> subscribeToTopic(String topic) async {
    await _fcm.subscribeToTopic(topic);
  }

  Future<void> unsubscribeFromTopic(String topic) async {
    await _fcm.unsubscribeFromTopic(topic);
  }
}
```

### Backend Integration

```dart
// Send FCM token to backend when user logs in
class AuthProvider extends StateNotifier<AuthState> {
  Future<void> _sendFcmTokenToBackend() async {
    final token = PushNotificationService().fcmToken;
    if (token != null && state.user != null) {
      await _apiService.post('/api/users/fcm-token', data: {
        'token': token,
        'platform': Platform.operatingSystem,
      });
    }
  }
}
```

---

## 📴 Offline Mode & Caching

### Hive Setup for Local Storage

```yaml
# Add to pubspec.yaml
dependencies:
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  connectivity_plus: ^5.0.2

dev_dependencies:
  hive_generator: ^2.0.1
  build_runner: ^2.4.8
```

### Initialize Hive

```dart
// lib/services/local_storage_service.dart
import 'package:hive_flutter/hive_flutter.dart';
import '../models/quiz.dart';
import '../models/user.dart';

class LocalStorageService {
  static final LocalStorageService _instance = LocalStorageService._internal();
  factory LocalStorageService() => _instance;
  LocalStorageService._internal();

  late Box<dynamic> _userBox;
  late Box<dynamic> _quizBox;
  late Box<dynamic> _settingsBox;
  late Box<dynamic> _cacheBox;

  Future<void> initialize() async {
    await Hive.initFlutter();

    // Register adapters for complex objects
    Hive.registerAdapter(UserAdapter());
    Hive.registerAdapter(QuizAdapter());

    // Open boxes
    _userBox = await Hive.openBox('user');
    _quizBox = await Hive.openBox('quizzes');
    _settingsBox = await Hive.openBox('settings');
    _cacheBox = await Hive.openBox('cache');
  }

  // User methods
  Future<void> saveUser(User user) async {
    await _userBox.put('current_user', user.toJson());
  }

  User? getUser() {
    final json = _userBox.get('current_user');
    return json != null ? User.fromJson(json) : null;
  }

  Future<void> clearUser() async {
    await _userBox.delete('current_user');
  }

  // Token methods
  Future<void> saveToken(String token) async {
    await _userBox.put('auth_token', token);
  }

  String? getToken() {
    return _userBox.get('auth_token');
  }

  // Quiz cache methods
  Future<void> cacheQuizzes(List<Quiz> quizzes) async {
    await _quizBox.put('cached_quizzes', quizzes.map((q) => q.toJson()).toList());
    await _quizBox.put('quizzes_cached_at', DateTime.now().toIso8601String());
  }

  List<Quiz>? getCachedQuizzes() {
    final cached = _quizBox.get('cached_quizzes');
    if (cached == null) return null;

    // Check if cache is stale (older than 1 hour)
    final cachedAt = _quizBox.get('quizzes_cached_at');
    if (cachedAt != null) {
      final cacheTime = DateTime.parse(cachedAt);
      if (DateTime.now().difference(cacheTime).inHours > 1) {
        return null; // Cache expired
      }
    }

    return (cached as List).map((q) => Quiz.fromJson(q)).toList();
  }

  // Settings methods
  Future<void> saveSetting(String key, dynamic value) async {
    await _settingsBox.put(key, value);
  }

  T? getSetting<T>(String key) {
    return _settingsBox.get(key) as T?;
  }

  // Generic cache with TTL
  Future<void> cacheData(String key, dynamic data, {Duration ttl = const Duration(hours: 1)}) async {
    await _cacheBox.put(key, {
      'data': data,
      'expires_at': DateTime.now().add(ttl).toIso8601String(),
    });
  }

  T? getCachedData<T>(String key) {
    final cached = _cacheBox.get(key);
    if (cached == null) return null;

    final expiresAt = DateTime.parse(cached['expires_at']);
    if (DateTime.now().isAfter(expiresAt)) {
      _cacheBox.delete(key);
      return null;
    }

    return cached['data'] as T?;
  }

  Future<void> clearAllCache() async {
    await _cacheBox.clear();
  }
}
```

### Connectivity Manager

```dart
// lib/services/connectivity_service.dart
import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum NetworkStatus { online, offline }

class ConnectivityService {
  final Connectivity _connectivity = Connectivity();
  final _controller = StreamController<NetworkStatus>.broadcast();

  Stream<NetworkStatus> get statusStream => _controller.stream;
  NetworkStatus _lastStatus = NetworkStatus.online;
  NetworkStatus get currentStatus => _lastStatus;

  ConnectivityService() {
    _connectivity.onConnectivityChanged.listen(_updateStatus);
    _checkInitialStatus();
  }

  Future<void> _checkInitialStatus() async {
    final result = await _connectivity.checkConnectivity();
    _updateStatus(result);
  }

  void _updateStatus(List<ConnectivityResult> results) {
    final hasConnection = results.any((r) =>
      r == ConnectivityResult.mobile ||
      r == ConnectivityResult.wifi ||
      r == ConnectivityResult.ethernet
    );

    _lastStatus = hasConnection ? NetworkStatus.online : NetworkStatus.offline;
    _controller.add(_lastStatus);
  }

  void dispose() {
    _controller.close();
  }
}

// Provider
final connectivityProvider = StreamProvider<NetworkStatus>((ref) {
  final service = ConnectivityService();
  ref.onDispose(() => service.dispose());
  return service.statusStream;
});

// Current status provider
final isOnlineProvider = Provider<bool>((ref) {
  final connectivity = ref.watch(connectivityProvider);
  return connectivity.maybeWhen(
    data: (status) => status == NetworkStatus.online,
    orElse: () => true,
  );
});
```

### Offline-First API Service

```dart
// lib/services/offline_api_service.dart
import 'package:dio/dio.dart';
import 'connectivity_service.dart';
import 'local_storage_service.dart';

class OfflineApiService {
  final Dio _dio;
  final LocalStorageService _localStorage;
  final ConnectivityService _connectivity;

  OfflineApiService(this._dio, this._localStorage, this._connectivity);

  Future<T?> getWithCache<T>({
    required String path,
    required String cacheKey,
    required T Function(Map<String, dynamic>) fromJson,
    Duration cacheDuration = const Duration(hours: 1),
    bool forceRefresh = false,
  }) async {
    // Try cache first if offline or not forcing refresh
    if (_connectivity.currentStatus == NetworkStatus.offline || !forceRefresh) {
      final cached = _localStorage.getCachedData<Map<String, dynamic>>(cacheKey);
      if (cached != null) {
        return fromJson(cached);
      }
    }

    // If offline and no cache, return null
    if (_connectivity.currentStatus == NetworkStatus.offline) {
      return null;
    }

    // Fetch from network
    try {
      final response = await _dio.get(path);
      final data = response.data as Map<String, dynamic>;

      // Cache the response
      await _localStorage.cacheData(cacheKey, data, ttl: cacheDuration);

      return fromJson(data);
    } on DioException {
      // Fall back to cache on network error
      final cached = _localStorage.getCachedData<Map<String, dynamic>>(cacheKey);
      if (cached != null) {
        return fromJson(cached);
      }
      rethrow;
    }
  }

  // Queue for offline mutations
  Future<void> queueOfflineAction(Map<String, dynamic> action) async {
    final queue = _localStorage.getCachedData<List>('offline_queue') ?? [];
    queue.add(action);
    await _localStorage.cacheData('offline_queue', queue, ttl: const Duration(days: 7));
  }

  Future<void> syncOfflineQueue() async {
    if (_connectivity.currentStatus == NetworkStatus.offline) return;

    final queue = _localStorage.getCachedData<List>('offline_queue') ?? [];
    final failedActions = <Map<String, dynamic>>[];

    for (final action in queue) {
      try {
        switch (action['method']) {
          case 'POST':
            await _dio.post(action['path'], data: action['data']);
            break;
          case 'PUT':
            await _dio.put(action['path'], data: action['data']);
            break;
          case 'DELETE':
            await _dio.delete(action['path']);
            break;
        }
      } catch (e) {
        failedActions.add(action);
      }
    }

    // Update queue with failed actions only
    await _localStorage.cacheData('offline_queue', failedActions, ttl: const Duration(days: 7));
  }
}
```

### Offline Mode UI Widget

```dart
// lib/widgets/common/offline_banner.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../services/connectivity_service.dart';

class OfflineBanner extends ConsumerWidget {
  const OfflineBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isOnline = ref.watch(isOnlineProvider);

    if (isOnline) return const SizedBox.shrink();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 8),
      color: Colors.orange,
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.cloud_off, color: Colors.white, size: 16),
          SizedBox(width: 8),
          Text(
            'You are offline. Some features may be limited.',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}
```

---

## ⚠️ Error Handling

### Global Error Handler

```dart
// lib/utils/error_handler.dart
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';

class AppException implements Exception {
  final String message;
  final String? code;
  final dynamic details;

  AppException(this.message, {this.code, this.details});

  @override
  String toString() => message;
}

class ErrorHandler {
  static String getErrorMessage(dynamic error) {
    if (error is DioException) {
      return _handleDioError(error);
    } else if (error is AppException) {
      return error.message;
    } else if (error is Exception) {
      return error.toString().replaceAll('Exception: ', '');
    }
    return 'An unexpected error occurred';
  }

  static String _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return 'Connection timed out. Please check your internet connection.';

      case DioExceptionType.badResponse:
        return _handleStatusCode(error.response?.statusCode, error.response?.data);

      case DioExceptionType.cancel:
        return 'Request was cancelled';

      case DioExceptionType.connectionError:
        return 'No internet connection. Please check your network settings.';

      default:
        return 'Something went wrong. Please try again.';
    }
  }

  static String _handleStatusCode(int? statusCode, dynamic data) {
    // Try to get error message from response
    String? serverMessage;
    if (data is Map) {
      serverMessage = data['message'] ?? data['error'];
    }

    switch (statusCode) {
      case 400:
        return serverMessage ?? 'Invalid request. Please check your input.';
      case 401:
        return 'Session expired. Please log in again.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return serverMessage ?? 'Resource not found.';
      case 409:
        return serverMessage ?? 'Conflict with existing data.';
      case 422:
        return serverMessage ?? 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please wait a moment.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return serverMessage ?? 'Something went wrong. Please try again.';
    }
  }

  static void showErrorSnackBar(BuildContext context, dynamic error) {
    final message = getErrorMessage(error);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error_outline, color: Colors.white),
            const SizedBox(width: 8),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  static void showSuccessSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_outline, color: Colors.white),
            const SizedBox(width: 8),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }
}
```

### Dio Interceptor for Error Handling

```dart
// lib/config/dio_interceptors.dart
import 'package:dio/dio.dart';
import '../providers/auth_provider.dart';

class ErrorInterceptor extends Interceptor {
  final Ref _ref;

  ErrorInterceptor(this._ref);

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    // Handle 401 - Unauthorized
    if (err.response?.statusCode == 401) {
      // Try to refresh token or logout
      try {
        final authNotifier = _ref.read(authProvider.notifier);
        await authNotifier.refreshToken();

        // Retry the original request
        final response = await _retry(err.requestOptions);
        return handler.resolve(response);
      } catch (e) {
        // Refresh failed, logout
        await _ref.read(authProvider.notifier).logout();
      }
    }

    handler.next(err);
  }

  Future<Response> _retry(RequestOptions requestOptions) async {
    final dio = _ref.read(dioProvider);
    return dio.fetch(requestOptions);
  }
}

class LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    print('🌐 REQUEST[${options.method}] => ${options.path}');
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    print('✅ RESPONSE[${response.statusCode}] => ${response.requestOptions.path}');
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    print('❌ ERROR[${err.response?.statusCode}] => ${err.requestOptions.path}');
    print('   Message: ${err.message}');
    handler.next(err);
  }
}
```

### AsyncValue Extension for Error Display

```dart
// lib/utils/async_value_extension.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'error_handler.dart';
import '../widgets/common/loading_spinner.dart';

extension AsyncValueUI<T> on AsyncValue<T> {
  Widget when2({
    required Widget Function(T data) data,
    Widget Function()? loading,
    Widget Function(Object error, StackTrace stackTrace)? error,
  }) {
    return when(
      data: data,
      loading: () => loading?.call() ?? const LoadingSpinner(),
      error: (err, stack) => error?.call(err, stack) ?? _defaultError(err),
    );
  }

  Widget _defaultError(Object error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              ErrorHandler.getErrorMessage(error),
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 16),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 🧪 Testing

### Unit Tests

```dart
// test/unit/auth_service_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dio/dio.dart';
import 'package:cognito_app/services/api_service.dart';
import 'package:cognito_app/models/user.dart';

class MockDio extends Mock implements Dio {}

void main() {
  late ApiService apiService;
  late MockDio mockDio;

  setUp(() {
    mockDio = MockDio();
    apiService = ApiService(dio: mockDio);
  });

  group('AuthService', () {
    test('login returns user on success', () async {
      // Arrange
      final responseData = {
        'token': 'test_token',
        'user': {
          'id': '123',
          'name': 'Test User',
          'email': 'test@test.com',
        },
      };

      when(() => mockDio.post(
        any(),
        data: any(named: 'data'),
      )).thenAnswer((_) async => Response(
        data: responseData,
        statusCode: 200,
        requestOptions: RequestOptions(),
      ));

      // Act
      final result = await apiService.login(
        email: 'test@test.com',
        password: 'password123',
      );

      // Assert
      expect(result.token, 'test_token');
      expect(result.user.name, 'Test User');
    });

    test('login throws on invalid credentials', () async {
      // Arrange
      when(() => mockDio.post(
        any(),
        data: any(named: 'data'),
      )).thenThrow(DioException(
        type: DioExceptionType.badResponse,
        response: Response(
          data: {'message': 'Invalid credentials'},
          statusCode: 401,
          requestOptions: RequestOptions(),
        ),
        requestOptions: RequestOptions(),
      ));

      // Act & Assert
      expect(
        () => apiService.login(email: 'test@test.com', password: 'wrong'),
        throwsA(isA<DioException>()),
      );
    });
  });
}
```

### Widget Tests

```dart
// test/widget/app_button_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:cognito_app/widgets/common/app_button.dart';

void main() {
  group('AppButton', () {
    testWidgets('renders text correctly', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AppButton(
              text: 'Test Button',
              onPressed: () {},
            ),
          ),
        ),
      );

      expect(find.text('Test Button'), findsOneWidget);
    });

    testWidgets('shows loading indicator when isLoading is true', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: AppButton(
              text: 'Test Button',
              isLoading: true,
            ),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('Test Button'), findsNothing);
    });

    testWidgets('calls onPressed when tapped', (tester) async {
      bool pressed = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AppButton(
              text: 'Test Button',
              onPressed: () => pressed = true,
            ),
          ),
        ),
      );

      await tester.tap(find.byType(AppButton));
      await tester.pump();

      expect(pressed, true);
    });

    testWidgets('does not call onPressed when disabled', (tester) async {
      bool pressed = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AppButton(
              text: 'Test Button',
              isLoading: true,
              onPressed: () => pressed = true,
            ),
          ),
        ),
      );

      await tester.tap(find.byType(AppButton));
      await tester.pump();

      expect(pressed, false);
    });
  });
}
```

### Integration Tests

```dart
// integration_test/app_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:cognito_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Authentication Flow', () {
    testWidgets('complete login flow', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Should start at login screen
      expect(find.text('Welcome Back'), findsOneWidget);

      // Enter email
      await tester.enterText(
        find.byKey(const Key('email_input')),
        'test@test.com',
      );

      // Enter password
      await tester.enterText(
        find.byKey(const Key('password_input')),
        'password123',
      );

      // Tap login button
      await tester.tap(find.byKey(const Key('login_button')));
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Should navigate to dashboard
      expect(find.text('Dashboard'), findsOneWidget);
    });
  });

  group('Quiz Flow', () {
    testWidgets('complete a quiz', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Login first (assuming logged in state)
      // Navigate to quizzes
      await tester.tap(find.byIcon(Icons.quiz));
      await tester.pumpAndSettle();

      // Select first quiz
      await tester.tap(find.byType(Card).first);
      await tester.pumpAndSettle();

      // Start quiz
      await tester.tap(find.text('Start Quiz'));
      await tester.pumpAndSettle();

      // Answer questions
      for (var i = 0; i < 5; i++) {
        await tester.tap(find.byKey(Key('option_0')));
        await tester.pumpAndSettle();

        await tester.tap(find.text('Next'));
        await tester.pumpAndSettle();
      }

      // Should show results
      expect(find.text('Quiz Complete!'), findsOneWidget);
    });
  });
}
```

### Test Configuration

```yaml
# pubspec.yaml - add to dev_dependencies
dev_dependencies:
  flutter_test:
    sdk: flutter
  integration_test:
    sdk: flutter
  mocktail: ^1.0.2
  network_image_mock: ^2.1.1
```

```bash
# Run tests
flutter test                          # Unit & widget tests
flutter test integration_test/        # Integration tests
flutter test --coverage               # Generate coverage report
```

---

## 🎨 App Icons & Splash Screen

### Flutter Launcher Icons

```yaml
# pubspec.yaml
dev_dependencies:
  flutter_launcher_icons: ^0.13.1

flutter_launcher_icons:
  android: true
  ios: true
  image_path: "assets/icons/app_icon.png"
  min_sdk_android: 21

  # Android specific
  adaptive_icon_background: "#FFFFFF"
  adaptive_icon_foreground: "assets/icons/app_icon_foreground.png"

  # iOS specific
  remove_alpha_ios: true
# Generate icons
# flutter pub run flutter_launcher_icons
```

### Flutter Native Splash

```yaml
# pubspec.yaml
dev_dependencies:
  flutter_native_splash: ^2.3.8

flutter_native_splash:
  color: "#6366F1"  # Primary color
  image: "assets/splash/splash_logo.png"

  # Android 12+ specific
  android_12:
    color: "#6366F1"
    icon_background_color: "#FFFFFF"
    image: "assets/splash/splash_logo.png"
    branding: "assets/splash/branding.png"

  # iOS specific
  ios: true

  # Dark mode
  color_dark: "#111827"
  image_dark: "assets/splash/splash_logo_dark.png"
  android_12:
    color_dark: "#111827"

# Generate splash
# dart run flutter_native_splash:create
```

### Required Icon Sizes

```
assets/icons/
├── app_icon.png              # 1024x1024 (master icon)
├── app_icon_foreground.png   # 432x432 (adaptive foreground)
└── app_icon_background.png   # 432x432 (adaptive background)

assets/splash/
├── splash_logo.png           # 288x288
├── splash_logo_dark.png      # 288x288
└── branding.png              # 200x50
```

---

## 📱 App Store Guidelines

### Google Play Store Requirements

```yaml
# android/app/build.gradle
android {
compileSdkVersion 34

defaultConfig {
applicationId "com.cognitolearninghub.app"
minSdkVersion 21
targetSdkVersion 34
versionCode 1
versionName "1.0.0"
}

buildTypes {
release {
signingConfig signingConfigs.release
minifyEnabled true
shrinkResources true
proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
}
}
}
```

**Required Assets:**

- High-res icon: 512x512 PNG
- Feature graphic: 1024x500 PNG
- Screenshots: Phone (1080x1920), Tablet 7" (1200x1920), Tablet 10" (1600x2560)
- Short description: Max 80 characters
- Full description: Max 4000 characters

**Privacy Policy Requirements:**

- Required for apps collecting user data
- Must be accessible from app and store listing
- Include data collection, usage, and sharing practices

### Apple App Store Requirements

```plist
<!-- ios/Runner/Info.plist additions -->
<key>ITSAppUsesNonExemptEncryption</key>
<false/>

<key>LSApplicationQueriesSchemes</key>
<array>
    <string>mailto</string>
    <string>tel</string>
    <string>https</string>
</array>
```

**Required Assets:**

- App icon: 1024x1024 PNG (no alpha channel)
- Screenshots:
  - 6.5" (1284x2778)
  - 5.5" (1242x2208)
  - iPad Pro 12.9" (2048x2732)
- App Preview videos (optional): 15-30 seconds

**Review Guidelines Checklist:**

- [ ] No placeholder content
- [ ] All features must work
- [ ] Login must work with test account
- [ ] No links to external payment systems
- [ ] Privacy policy URL provided
- [ ] Age rating accurate
- [ ] All permissions explained

### Build Commands

```bash
# Generate keystore (Android)
keytool -genkey -v -keystore ~/upload-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias upload

# Build Android App Bundle
flutter build appbundle --release \
  --build-name=1.0.0 \
  --build-number=1

# Build iOS for App Store
flutter build ipa --release \
  --build-name=1.0.0 \
  --build-number=1 \
  --export-options-plist=ios/ExportOptions.plist

# Build for TestFlight
flutter build ipa --release
```

### Release Checklist

```markdown
## Pre-Release Checklist

### Code Quality

- [ ] All tests passing
- [ ] No console.log/print statements
- [ ] Error tracking integrated (Sentry/Crashlytics)
- [ ] Analytics integrated (Firebase Analytics)
- [ ] Performance profiled

### Configuration

- [ ] API endpoints point to production
- [ ] All secrets in secure storage
- [ ] Deep links configured
- [ ] Push notifications tested
- [ ] OAuth redirect URIs updated

### Assets

- [ ] App icons generated
- [ ] Splash screen configured
- [ ] Screenshots captured
- [ ] Store listing complete

### Legal

- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] License compliance verified
- [ ] GDPR compliance (if applicable)

### Testing

- [ ] Tested on multiple devices
- [ ] Tested offline functionality
- [ ] Tested background functionality
- [ ] Memory usage acceptable
- [ ] Battery usage acceptable
```

---

## 🚀 Build & Deploy Commands

### Development

```bash
# Run on device
flutter run

# Run with specific device
flutter devices
flutter run -d <device_id>

# Hot reload
r

# Hot restart
R
```

### Production Build

```bash
# Android APK
flutter build apk --release

# Android App Bundle (Play Store)
flutter build appbundle --release

# iOS (requires Mac)
flutter build ios --release
```

### App Store Submission

```bash
# Android
# 1. Generate keystore
keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload

# 2. Build signed bundle
flutter build appbundle --release

# iOS
# 1. Open Xcode
open ios/Runner.xcworkspace

# 2. Archive and upload via Xcode
```

---

## 📋 Implementation Checklist

### Phase 1: Setup & Foundation (Week 1-2)

- [ ] Project setup with Flutter 3.16+
- [ ] Configure Firebase project
- [ ] Set up development & production environments
- [ ] Install all dependencies
- [ ] Configure app icons & splash screen
- [ ] Set up navigation with GoRouter
- [ ] Implement theme (light/dark)

### Phase 2: Core Features (Week 3-4)

- [ ] Data models (User, Quiz, Result, etc.)
- [ ] API service with Dio
- [ ] Authentication (Email + Google)
- [ ] State management with Riverpod
- [ ] Local storage with Hive
- [ ] Push notifications setup

### Phase 3: Main Screens (Week 5-8)

- [ ] Splash & onboarding screens
- [ ] Auth screens (login, register, forgot password)
- [ ] Dashboard with statistics
- [ ] Quiz browsing & categories
- [ ] Quiz taking interface
- [ ] Results & analytics screens
- [ ] Leaderboard screens

### Phase 4: Advanced Features (Week 9-12)

- [ ] Live quiz session (Socket.IO)
- [ ] Duel mode implementation
- [ ] Meeting room (WebRTC)
- [ ] AI tutor chat interface
- [ ] Profile & settings
- [ ] Achievements & gamification
- [ ] Social features (follow, feed)

### Phase 5: Polish & Optimization (Week 13-14)

- [ ] Offline mode & caching
- [ ] Error handling refinement
- [ ] Animation polish
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Unit & widget tests
- [ ] Integration tests

### Phase 6: Release Preparation (Week 15-16)

- [ ] Security audit
- [ ] Privacy policy & terms
- [ ] Store assets (screenshots, descriptions)
- [ ] Beta testing (TestFlight/Internal Testing)
- [ ] Bug fixes from beta
- [ ] App Store submission
- [ ] Play Store submission

---

<div align="center">

**Estimated Development Time: 3-4 months**

_Built with ❤️ for Cognito Learning Hub_

</div>
