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
import '../screens/live/live_quiz_lobby_screen.dart';
import '../screens/live/live_quiz_join_screen.dart';
import '../screens/live/live_quiz_play_screen.dart';
import '../screens/live/live_quiz_results_screen.dart';
import '../screens/duel/duel_mode_screen.dart';
import '../screens/duel/duel_matchmaking_screen.dart';
import '../screens/duel/duel_play_screen.dart';
import '../screens/duel/duel_result_screen.dart';
import '../screens/meeting/meeting_room_screen.dart';
import '../screens/ai_tutor/ai_tutor_screen.dart';
import '../screens/ai_tutor/study_buddy_chat_screen.dart';
import '../screens/ai_tutor/study_goals_screen.dart';
import '../screens/gamification/achievements_screen.dart';
import '../screens/gamification/quests_screen.dart';
import '../screens/gamification/stats_dashboard_screen.dart';
import '../screens/teacher/teacher_dashboard_screen.dart';
import '../screens/teacher/students_list_screen.dart';
import '../screens/avatar/avatar_customization_screen.dart';
import '../screens/social/social_feed_screen.dart';
import '../screens/social/add_friend_screen.dart';
import '../screens/social/comments_screen.dart';
import '../screens/analytics/analytics_dashboard_screen.dart';
import '../screens/study_materials/materials_list_screen.dart';
import '../screens/study_materials/material_detail_screen.dart';
import '../screens/badges/badge_showcase_screen.dart';

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
  static const liveLobby = '/live/lobby';
  static const livePlay = '/live/play';
  static const liveResults = '/live/results';
  static const duelMode = '/duel';
  static const meetingRoom = '/meeting/:roomId';
  static const aiTutor = '/ai-tutor';
  static const studyBuddy = '/study-buddy';
  static const studyGoals = '/study-goals';
  static const achievements = '/achievements';
  static const quests = '/quests';
  static const stats = '/stats';
  static const settings = '/settings';
  static const profile = '/profile';
  static const leaderboard = '/leaderboard';
  static const teacherDashboard = '/teacher';
  static const teacherStudents = '/teacher/students';
  static const teacherQuizzes = '/teacher/quizzes';
  static const teacherAnalytics = '/teacher/analytics';
  static const avatarCustomize = '/avatar/customize';
  static const socialFeed = '/social';
  static const addFriend = '/social/add-friend';
  static const postComments = '/social/post/:postId/comments';
  static const analytics = '/analytics';
  static const materials = '/materials';
  static const materialDetail = '/materials/:materialId';
  static const badgeShowcase = '/badges';
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
        builder: (context, state) => const LiveQuizJoinScreen(),
      ),
      GoRoute(
        path: AppRoutes.liveLobby,
        name: 'liveLobby',
        builder: (context, state) {
          final isHost = state.uri.queryParameters['isHost'] == 'true';
          final quizId = state.uri.queryParameters['quizId'];
          final quizTitle = state.uri.queryParameters['quizTitle'];
          return LiveQuizLobbyScreen(
            isHost: isHost,
            quizId: quizId,
            quizTitle: quizTitle,
          );
        },
      ),
      GoRoute(
        path: AppRoutes.livePlay,
        name: 'livePlay',
        builder: (context, state) => const LiveQuizPlayScreen(),
      ),
      GoRoute(
        path: AppRoutes.liveResults,
        name: 'liveResults',
        builder: (context, state) => const LiveQuizResultsScreen(),
      ),

      // Duel Mode
      GoRoute(
        path: AppRoutes.duelMode,
        name: 'duelMode',
        builder: (context, state) => const DuelModeScreen(),
      ),
      GoRoute(
        path: '/duel/matchmaking',
        name: 'duelMatchmaking',
        builder: (context, state) => const DuelMatchmakingScreen(),
      ),
      GoRoute(
        path: '/duel/:duelId',
        name: 'duelPlay',
        builder: (context, state) {
          final duelId = state.pathParameters['duelId']!;
          return DuelPlayScreen(duelId: duelId);
        },
      ),
      GoRoute(
        path: '/duel/:duelId/result',
        name: 'duelResult',
        builder: (context, state) {
          final duelId = state.pathParameters['duelId']!;
          return DuelResultScreen(duelId: duelId);
        },
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

      // Study Buddy
      GoRoute(
        path: AppRoutes.studyBuddy,
        name: 'studyBuddy',
        builder: (context, state) {
          final quizId = state.uri.queryParameters['quizId'];
          final quizTitle = state.uri.queryParameters['quizTitle'];
          final topic = state.uri.queryParameters['topic'];
          return StudyBuddyChatScreen(
            quizId: quizId,
            quizTitle: quizTitle,
            topic: topic,
          );
        },
      ),

      // Study Goals
      GoRoute(
        path: AppRoutes.studyGoals,
        name: 'studyGoals',
        builder: (context, state) => const StudyGoalsScreen(),
      ),

      // Achievements
      GoRoute(
        path: AppRoutes.achievements,
        name: 'achievements',
        builder: (context, state) => const AchievementsScreen(),
      ),

      // Quests
      GoRoute(
        path: AppRoutes.quests,
        name: 'quests',
        builder: (context, state) => const QuestsScreen(),
      ),

      // Stats Dashboard
      GoRoute(
        path: AppRoutes.stats,
        name: 'stats',
        builder: (context, state) => const StatsDashboardScreen(),
      ),

      // Settings
      GoRoute(
        path: AppRoutes.settings,
        name: 'settings',
        builder: (context, state) => const SettingsScreen(),
      ),

      // Teacher Dashboard
      GoRoute(
        path: AppRoutes.teacherDashboard,
        name: 'teacherDashboard',
        builder: (context, state) => const TeacherDashboardScreen(),
      ),

      // Teacher Students List
      GoRoute(
        path: AppRoutes.teacherStudents,
        name: 'teacherStudents',
        builder: (context, state) => const StudentsListScreen(),
      ),
      GoRoute(
        path: AppRoutes.avatarCustomize,
        name: 'avatarCustomize',
        builder: (context, state) => const AvatarCustomizationScreen(),
      ),

      // Social Features
      GoRoute(
        path: AppRoutes.socialFeed,
        name: 'socialFeed',
        builder: (context, state) => const SocialFeedScreen(),
      ),
      GoRoute(
        path: AppRoutes.addFriend,
        name: 'addFriend',
        builder: (context, state) => const AddFriendScreen(),
      ),
      GoRoute(
        path: AppRoutes.postComments,
        name: 'postComments',
        builder: (context, state) {
          final postId = state.pathParameters['postId']!;
          return CommentsScreen(postId: postId);
        },
      ),

      // Analytics Dashboard
      GoRoute(
        path: AppRoutes.analytics,
        name: 'analytics',
        builder: (context, state) => const AnalyticsDashboardScreen(),
      ),

      // Study Materials
      GoRoute(
        path: AppRoutes.materials,
        name: 'materials',
        builder: (context, state) {
          final categoryId = state.uri.queryParameters['categoryId'];
          return MaterialsListScreen(categoryId: categoryId);
        },
      ),
      GoRoute(
        path: AppRoutes.materialDetail,
        name: 'materialDetail',
        builder: (context, state) {
          final materialId = state.pathParameters['materialId']!;
          return MaterialDetailScreen(materialId: materialId);
        },
      ),

      // Badge Showcase
      GoRoute(
        path: AppRoutes.badgeShowcase,
        name: 'badgeShowcase',
        builder: (context, state) {
          final userId = state.uri.queryParameters['userId'];
          return BadgeShowcaseScreen(userId: userId);
        },
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
