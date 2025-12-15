// lib/config/routes.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../screens/splash/splash_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/signup_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/home/dashboard_screen.dart';
import '../screens/quiz/quiz_list_screen.dart';
import '../screens/quiz/quiz_taker_screen.dart';
import '../screens/quiz/quiz_result_screen.dart';
import '../screens/leaderboard/leaderboard_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/settings/settings_screen.dart';
import '../screens/live/live_session_host.dart';
import '../screens/live/live_session_join.dart';
import '../screens/duel/duel_mode_screen.dart';
import '../screens/meeting/meeting_room_screen.dart';
import '../screens/ai_tutor/ai_tutor_screen.dart';

// Route names
class AppRoutes {
  static const splash = '/';
  static const login = '/login';
  static const signup = '/signup';
  static const home = '/home';
  static const quizList = '/quizzes';
  static const quizTaker = '/quiz/:quizId';
  static const quizResult = '/quiz-result';
  static const quizCreate = '/quiz/create';
  static const liveHost = '/live/host/:quizId';
  static const liveJoin = '/live/join';
  static const duelMode = '/duel';
  static const meetingRoom = '/meeting/:roomId';
  static const aiTutor = '/ai-tutor';
  static const settings = '/settings';
  static const profile = '/profile';
  static const leaderboard = '/leaderboard';
  static const achievements = '/achievements';
}

// Auth state notifier for router refresh
class AuthChangeNotifier extends ChangeNotifier {
  AuthChangeNotifier(Ref ref) {
    ref.listen(authProvider, (_, __) {
      notifyListeners();
    });
  }
}

final authChangeNotifierProvider = Provider<AuthChangeNotifier>((ref) {
  return AuthChangeNotifier(ref);
});

// Router provider
final routerProvider = Provider<GoRouter>((ref) {
  final authNotifier = ref.watch(authChangeNotifierProvider);

  return GoRouter(
    initialLocation: AppRoutes.splash,
    debugLogDiagnostics: true,
    refreshListenable: authNotifier,
    redirect: (context, state) {
      final authState = ref.read(authProvider);
      final isLoading = authState.isLoading;
      final isAuthenticated = authState.isAuthenticated;
      final isOnSplash = state.matchedLocation == AppRoutes.splash;
      final isOnAuth = state.matchedLocation == AppRoutes.login ||
          state.matchedLocation == AppRoutes.signup;

      // Still loading, show splash
      if (isLoading) {
        return isOnSplash ? null : AppRoutes.splash;
      }

      // Not authenticated and not on auth pages
      if (!isAuthenticated && !isOnAuth && !isOnSplash) {
        return AppRoutes.login;
      }

      // Authenticated but on auth pages
      if (isAuthenticated && isOnAuth) {
        return AppRoutes.home;
      }

      // Authenticated but on splash
      if (isAuthenticated && isOnSplash) {
        return AppRoutes.home;
      }

      // Not authenticated and on splash
      if (!isAuthenticated && isOnSplash && !isLoading) {
        return AppRoutes.login;
      }

      return null;
    },
    routes: [
      // Splash
      GoRoute(
        path: AppRoutes.splash,
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),

      // Auth Routes
      GoRoute(
        path: AppRoutes.login,
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: AppRoutes.signup,
        name: 'signup',
        builder: (context, state) => const SignupScreen(),
      ),

      // Main App Routes (with bottom navigation shell)
      ShellRoute(
        builder: (context, state, child) => HomeScreen(child: child),
        routes: [
          GoRoute(
            path: AppRoutes.home,
            name: 'home',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: DashboardScreen()),
          ),
          GoRoute(
            path: AppRoutes.quizList,
            name: 'quizList',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: QuizListScreen()),
          ),
          GoRoute(
            path: AppRoutes.leaderboard,
            name: 'leaderboard',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: LeaderboardScreen()),
          ),
          GoRoute(
            path: AppRoutes.profile,
            name: 'profile',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: ProfileScreen()),
          ),
        ],
      ),

      // Quiz Routes
      GoRoute(
        path: AppRoutes.quizTaker,
        name: 'quizTaker',
        builder: (context, state) {
          final quizId = state.pathParameters['quizId']!;
          return QuizTakerScreen(quizId: quizId);
        },
      ),
      GoRoute(
        path: AppRoutes.quizResult,
        name: 'quizResult',
        builder: (context, state) {
          final scoreStr = state.uri.queryParameters['score'] ?? '0';
          final totalStr = state.uri.queryParameters['total'] ?? '0';
          return QuizResultScreen(
            score: int.tryParse(scoreStr) ?? 0,
            total: int.tryParse(totalStr) ?? 0,
          );
        },
      ),
      GoRoute(
        path: AppRoutes.quizCreate,
        name: 'quizCreate',
        builder: (context, state) => const Scaffold(
          body: Center(child: Text('Quiz Creator - Coming Soon')),
        ),
      ),

      // Live Session Routes
      GoRoute(
        path: AppRoutes.liveHost,
        name: 'liveHost',
        builder: (context, state) {
          final quizId = state.pathParameters['quizId']!;
          return LiveSessionHost(quizId: quizId);
        },
      ),
      GoRoute(
        path: AppRoutes.liveJoin,
        name: 'liveJoin',
        builder: (context, state) => const LiveSessionJoin(),
      ),

      // Duel Mode
      GoRoute(
        path: AppRoutes.duelMode,
        name: 'duelMode',
        builder: (context, state) => const DuelModeScreen(),
      ),

      // Meeting Room
      GoRoute(
        path: AppRoutes.meetingRoom,
        name: 'meetingRoom',
        builder: (context, state) {
          final roomId = state.pathParameters['roomId']!;
          return MeetingRoomScreen(roomId: roomId);
        },
      ),

      // AI Tutor
      GoRoute(
        path: AppRoutes.aiTutor,
        name: 'aiTutor',
        builder: (context, state) => const AITutorScreen(),
      ),

      // Settings
      GoRoute(
        path: AppRoutes.settings,
        name: 'settings',
        builder: (context, state) => const SettingsScreen(),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              'Page not found',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(state.error.toString()),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go(AppRoutes.home),
              child: const Text('Go Home'),
            ),
          ],
        ),
      ),
    ),
  );
});
