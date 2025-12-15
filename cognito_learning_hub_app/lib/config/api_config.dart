// lib/config/api_config.dart

class ApiConfig {
  // ========================================
  // Production URLs - Render deployments from ping.yml
  // ========================================

  // Main API Gateway - Routes all API requests
  static const String prodApiUrl = 'https://api-gateway-kzo9.onrender.com';

  // Individual Microservices (for direct WebSocket connections)
  static const String prodAuthUrl = 'https://auth-service-uds0.onrender.com';
  static const String prodQuizUrl = 'https://quiz-service-6jzt.onrender.com';
  static const String prodResultUrl =
      'https://result-service-vwjh.onrender.com';
  static const String prodLiveUrl = 'https://live-service-ga6w.onrender.com';
  static const String prodMeetingUrl =
      'https://meeting-service-ogfj.onrender.com';
  static const String prodSocialUrl =
      'https://social-service-lwjy.onrender.com';
  static const String prodGamificationUrl =
      'https://gamification-service-ax6n.onrender.com';
  static const String prodModerationUrl =
      'https://moderation-service-3e2e.onrender.com';

  // WebSocket URLs (Live & Meeting services need direct connection)
  static const String prodSocketUrl = 'https://live-service-ga6w.onrender.com';
  static const String prodMeetingWsUrl =
      'https://meeting-service-ogfj.onrender.com';

  // ========================================
  // Development URLs (Local)
  // ========================================
  // For Android emulator: 10.0.2.2 maps to host machine's localhost
  // For physical device: use your computer's local IP (e.g., 192.168.x.x)
  static const String devApiUrl = 'http://10.0.2.2:3000';
  static const String devAuthUrl = 'http://10.0.2.2:3001';
  static const String devQuizUrl = 'http://10.0.2.2:3002';
  static const String devResultUrl = 'http://10.0.2.2:3003';
  static const String devLiveUrl = 'http://10.0.2.2:3004';
  static const String devMeetingUrl = 'http://10.0.2.2:3009';
  static const String devSocialUrl = 'http://10.0.2.2:3005';
  static const String devGamificationUrl = 'http://10.0.2.2:3006';
  static const String devModerationUrl = 'http://10.0.2.2:3007';
  static const String devSocketUrl = 'http://10.0.2.2:3004';
  static const String devMeetingWsUrl = 'http://10.0.2.2:3009';

  // ========================================
  // Environment Switch
  // ========================================
  // Set to false for production, true for local development
  static const bool isDev = false;

  // ========================================
  // Getters - Use these in your code
  // ========================================
  static String get apiUrl => isDev ? devApiUrl : prodApiUrl;
  static String get authUrl => isDev ? devAuthUrl : prodAuthUrl;
  static String get quizUrl => isDev ? devQuizUrl : prodQuizUrl;
  static String get resultUrl => isDev ? devResultUrl : prodResultUrl;
  static String get liveUrl => isDev ? devLiveUrl : prodLiveUrl;
  static String get meetingUrl => isDev ? devMeetingUrl : prodMeetingUrl;
  static String get socialUrl => isDev ? devSocialUrl : prodSocialUrl;
  static String get gamificationUrl =>
      isDev ? devGamificationUrl : prodGamificationUrl;
  static String get moderationUrl =>
      isDev ? devModerationUrl : prodModerationUrl;
  static String get socketUrl => isDev ? devSocketUrl : prodSocketUrl;
  static String get meetingWsUrl => isDev ? devMeetingWsUrl : prodMeetingWsUrl;
}

// API Endpoints
class Endpoints {
  // Auth
  static const String login = '/api/auth/login';
  static const String register = '/api/auth/register';
  static const String googleAuth = '/api/auth/google';
  static const String profile = '/api/auth/me'; // Backend uses /me not /profile
  static const String refreshToken = '/api/auth/refresh';

  // Quiz
  static const String quizzes = '/api/quizzes';
  static String quizById(String id) => '/api/quizzes/$id';
  static const String myQuizzes = '/api/quizzes/my-quizzes';
  static const String publicQuizzes =
      '/api/quizzes'; // Main endpoint returns public quizzes
  static const String popularQuizzes = '/api/quizzes/popular';
  static const String recentQuizzes = '/api/quizzes/recent';
  static const String generateFromTopic = '/api/generate-quiz-topic';
  static const String generateFromFile = '/api/generate-quiz-file';

  // Results
  static const String submitResult = '/api/results/submit';
  static const String myResults = '/api/results/my-results';
  static String resultById(String id) => '/api/results/$id';
  static const String leaderboard = '/api/results/leaderboard';
  static String quizLeaderboard(String quizId) =>
      '/api/results/leaderboard/$quizId';

  // Live Sessions
  static const String liveSessions = '/api/live-sessions';
  static const String createSession = '/api/live-sessions/create';
  static String joinSession(String code) => '/api/live-sessions/join/$code';

  // Meetings
  static const String meetings = '/api/meetings';
  static const String createMeeting = '/api/meetings/create';
  static String joinMeeting(String roomId) => '/api/meetings/join/$roomId';

  // AI Tutor
  static const String doubtSolver = '/api/doubt-solver/ask';

  // Achievements
  static const String achievements = '/api/achievements';
  static const String myAchievements = '/api/achievements/my-achievements';

  // Social
  static const String feed = '/api/social/feed';
  static String userProfile(String userId) => '/api/social/profile/$userId';
  static String follow(String userId) => '/api/social/follow/$userId';
  static String unfollow(String userId) => '/api/social/unfollow/$userId';

  // Duel
  static const String duelQueue = '/api/duel/queue';
  static const String cancelDuel = '/api/duel/cancel';
  static String duelById(String id) => '/api/duel/$id';
}
