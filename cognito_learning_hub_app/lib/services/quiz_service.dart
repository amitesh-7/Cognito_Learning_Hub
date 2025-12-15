// lib/services/quiz_service.dart
import '../models/quiz.dart';
import '../config/api_config.dart';
import 'api_service.dart';

class QuizService {
  final _api = ApiService();

  // Get all public quizzes
  Future<List<Quiz>> getPublicQuizzes({
    String? category,
    String? difficulty,
    String? search,
    int page = 1,
    int limit = 100,
  }) async {
    try {
      final queryParams = <String, dynamic>{'page': page, 'limit': limit};

      if (category != null) queryParams['category'] = category;
      if (difficulty != null) queryParams['difficulty'] = difficulty;
      if (search != null) queryParams['search'] = search;

      final response = await _api.get(
        Endpoints.publicQuizzes,
        queryParameters: queryParams,
      );

      // Handle both response formats: {quizzes: [...]} or {data: {quizzes: [...]}}
      final data = response.data['data'] ?? response.data;
      final quizzesList = data['quizzes'] ?? data;
      if (quizzesList is List) {
        return quizzesList.map((q) => Quiz.fromJson(q)).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching quizzes: $e');
      return [];
    }
  }

  // Get user's created quizzes
  Future<List<Quiz>> getMyQuizzes() async {
    try {
      final response = await _api.get(Endpoints.myQuizzes);
      // Handle both response formats
      final data = response.data['data'] ?? response.data;
      final quizzesList = data['quizzes'] ?? data;
      if (quizzesList is List) {
        return quizzesList.map((q) => Quiz.fromJson(q)).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching my quizzes: $e');
      return [];
    }
  }

  // Get quiz by ID
  Future<Quiz?> getQuizById(String id) async {
    try {
      final response = await _api.get(Endpoints.quizById(id));

      // Handle both formats: {quiz: {...}} or direct quiz object
      final quizData =
          response.data['quiz'] ?? response.data['data'] ?? response.data;
      if (quizData != null && quizData is Map<String, dynamic>) {
        return Quiz.fromJson(quizData);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // Create quiz
  Future<Quiz?> createQuiz(Map<String, dynamic> quizData) async {
    try {
      final response = await _api.post(Endpoints.quizzes, data: quizData);
      return Quiz.fromJson(response.data['quiz']);
    } catch (e) {
      print('Error creating quiz: $e');
      return null;
    }
  }

  // Update quiz
  Future<Quiz?> updateQuiz(String id, Map<String, dynamic> quizData) async {
    try {
      final response = await _api.put(Endpoints.quizById(id), data: quizData);
      return Quiz.fromJson(response.data['quiz']);
    } catch (e) {
      print('Error updating quiz: $e');
      return null;
    }
  }

  // Delete quiz
  Future<bool> deleteQuiz(String id) async {
    try {
      await _api.delete(Endpoints.quizById(id));
      return true;
    } catch (e) {
      print('Error deleting quiz: $e');
      return false;
    }
  }

  // Generate quiz from topic (AI)
  Future<Quiz?> generateFromTopic({
    required String topic,
    int questionCount = 10,
    String difficulty = 'Medium',
  }) async {
    try {
      final response = await _api.post(
        Endpoints.generateFromTopic,
        data: {
          'topic': topic,
          'questionCount': questionCount,
          'difficulty': difficulty,
        },
      );
      return Quiz.fromJson(response.data['quiz']);
    } catch (e) {
      print('Error generating quiz: $e');
      return null;
    }
  }

  // Generate quiz from file
  Future<Quiz?> generateFromFile(String filePath) async {
    try {
      final response = await _api.uploadFile(
        Endpoints.generateFromFile,
        filePath,
        'file',
      );
      return Quiz.fromJson(response.data['quiz']);
    } catch (e) {
      print('Error generating quiz from file: $e');
      return null;
    }
  }

  // Get categories
  Future<List<String>> getCategories() async {
    try {
      final response = await _api.get('${Endpoints.quizzes}/categories');
      return List<String>.from(response.data['categories']);
    } catch (e) {
      print('Error fetching categories: $e');
      return [
        'Programming',
        'Mathematics',
        'Science',
        'History',
        'Geography',
        'Language',
        'General Knowledge',
        'Other',
      ];
    }
  }
}
