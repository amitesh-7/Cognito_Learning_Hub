// lib/services/sync_service.dart

import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import '../config/api_config.dart';
import 'database_service.dart';

enum SyncStatus {
  idle,
  syncing,
  success,
  error,
}

class SyncService {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: ApiConfig.apiUrl,
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 30),
  ));

  SyncStatus _status = SyncStatus.idle;
  DateTime? _lastSyncTime;
  int _unsyncedCount = 0;

  SyncStatus get status => _status;
  DateTime? get lastSyncTime => _lastSyncTime;
  int get unsyncedCount => _unsyncedCount;

  // Check connectivity
  Future<bool> isOnline() async {
    final connectivityResult = await Connectivity().checkConnectivity();
    return connectivityResult != ConnectivityResult.none;
  }

  // Start sync process
  Future<void> sync({bool force = false}) async {
    if (_status == SyncStatus.syncing && !force) {
      return; // Already syncing
    }

    if (!await isOnline()) {
      throw Exception('No internet connection');
    }

    _status = SyncStatus.syncing;
    _unsyncedCount = await DatabaseService.getUnsyncedCount();

    try {
      // Sync in order: results -> posts -> other data
      await _syncResults();
      await _syncPosts();
      await _syncQuizzes();
      await _syncMaterials();
      await _syncBadges();

      // Process sync queue
      await _processSyncQueue();

      _lastSyncTime = DateTime.now();
      _status = SyncStatus.success;
      _unsyncedCount = 0;
    } catch (e) {
      _status = SyncStatus.error;
      rethrow;
    }
  }

  // Sync results
  Future<void> _syncResults() async {
    final results = await DatabaseService.query(
      DatabaseService.resultsTable,
      where: 'isSynced = ?',
      whereArgs: [0],
    );

    for (final result in results) {
      try {
        final data = json.decode(result['data'] as String? ?? '{}');
        await _dio.post('/results', data: data);
        await DatabaseService.markAsSynced(
          DatabaseService.resultsTable,
          result['id'] as String,
        );
      } catch (e) {
        print('Failed to sync result ${result['id']}: $e');
      }
    }
  }

  // Sync posts
  Future<void> _syncPosts() async {
    final posts = await DatabaseService.query(
      DatabaseService.socialPostsTable,
      where: 'isSynced = ?',
      whereArgs: [0],
    );

    for (final post in posts) {
      try {
        final data = json.decode(post['data'] as String? ?? '{}');
        await _dio.post('/social/posts', data: data);
        await DatabaseService.markAsSynced(
          DatabaseService.socialPostsTable,
          post['id'] as String,
        );
      } catch (e) {
        print('Failed to sync post ${post['id']}: $e');
      }
    }
  }

  // Sync quizzes
  Future<void> _syncQuizzes() async {
    final quizzes = await DatabaseService.query(
      DatabaseService.quizzesTable,
      where: 'isSynced = ?',
      whereArgs: [0],
    );

    for (final quiz in quizzes) {
      try {
        final data = json.decode(quiz['data'] as String? ?? '{}');
        await _dio.post('/quizzes', data: data);
        await DatabaseService.markAsSynced(
          DatabaseService.quizzesTable,
          quiz['id'] as String,
        );
      } catch (e) {
        print('Failed to sync quiz ${quiz['id']}: $e');
      }
    }
  }

  // Sync materials
  Future<void> _syncMaterials() async {
    final materials = await DatabaseService.query(
      DatabaseService.materialsTable,
      where: 'isSynced = ?',
      whereArgs: [0],
    );

    for (final material in materials) {
      try {
        final data = json.decode(material['data'] as String? ?? '{}');
        await _dio.post('/materials', data: data);
        await DatabaseService.markAsSynced(
          DatabaseService.materialsTable,
          material['id'] as String,
        );
      } catch (e) {
        print('Failed to sync material ${material['id']}: $e');
      }
    }
  }

  // Sync badges
  Future<void> _syncBadges() async {
    final badges = await DatabaseService.query(
      DatabaseService.badgesTable,
      where: 'isSynced = ?',
      whereArgs: [0],
    );

    for (final badge in badges) {
      try {
        final data = json.decode(badge['data'] as String? ?? '{}');
        await _dio.post('/badges', data: data);
        await DatabaseService.markAsSynced(
          DatabaseService.badgesTable,
          badge['id'] as String,
        );
      } catch (e) {
        print('Failed to sync badge ${badge['id']}: $e');
      }
    }
  }

  // Process sync queue
  Future<void> _processSyncQueue() async {
    final queueItems = await DatabaseService.getSyncQueue(limit: 50);

    for (final item in queueItems) {
      try {
        final operation = item['operation'] as String;
        final tableName = item['tableName'] as String;
        final data = json.decode(item['data'] as String);

        switch (operation) {
          case 'CREATE':
            await _dio.post('/$tableName', data: data);
            break;
          case 'UPDATE':
            await _dio.put('/$tableName/${data['id']}', data: data);
            break;
          case 'DELETE':
            await _dio.delete('/$tableName/${data['id']}');
            break;
        }

        await DatabaseService.removeSyncQueueItem(item['id'] as int);
      } catch (e) {
        print('Failed to process sync queue item ${item['id']}: $e');

        // Update attempts
        final attempts = (item['attempts'] as int? ?? 0) + 1;
        await DatabaseService.updateSyncQueueItem(
          item['id'] as int,
          attempts: attempts,
          lastAttemptAt: DateTime.now().toIso8601String(),
        );

        // Remove if too many attempts
        if (attempts >= 5) {
          await DatabaseService.removeSyncQueueItem(item['id'] as int);
        }
      }
    }
  }

  // Download data for offline use
  Future<void> downloadForOffline({
    bool includeQuizzes = true,
    bool includeMaterials = true,
    bool includeBadges = true,
  }) async {
    if (!await isOnline()) {
      throw Exception('No internet connection');
    }

    try {
      if (includeQuizzes) {
        await _downloadQuizzes();
      }
      if (includeMaterials) {
        await _downloadMaterials();
      }
      if (includeBadges) {
        await _downloadBadges();
      }
    } catch (e) {
      throw Exception('Failed to download offline data: $e');
    }
  }

  Future<void> _downloadQuizzes() async {
    try {
      final response = await _dio.get('/quizzes', queryParameters: {
        'limit': 50,
        'includeQuestions': true,
      });

      final quizzes = response.data['quizzes'] as List? ?? [];
      for (final quiz in quizzes) {
        await DatabaseService.saveQuiz({
          'id': quiz['id'] ?? quiz['_id'],
          'title': quiz['title'],
          'description': quiz['description'],
          'category': quiz['category'],
          'difficulty': quiz['difficulty'],
          'duration': quiz['duration'],
          'totalQuestions': quiz['totalQuestions'],
          'thumbnailUrl': quiz['thumbnailUrl'],
          'createdBy': quiz['createdBy'],
          'createdAt': quiz['createdAt'],
          'updatedAt': quiz['updatedAt'],
          'isSynced': 1,
          'data': json.encode(quiz),
        });

        // Save questions
        final questions = quiz['questions'] as List? ?? [];
        for (final question in questions) {
          await DatabaseService.saveQuestion({
            'id': question['id'] ?? question['_id'],
            'quizId': quiz['id'] ?? quiz['_id'],
            'question': question['question'],
            'type': question['type'],
            'options': json.encode(question['options']),
            'correctAnswer': question['correctAnswer'],
            'explanation': question['explanation'],
            'points': question['points'],
            'timeLimit': question['timeLimit'],
            'data': json.encode(question),
          });
        }
      }
    } catch (e) {
      throw Exception('Failed to download quizzes: $e');
    }
  }

  Future<void> _downloadMaterials() async {
    try {
      final response = await _dio.get('/materials', queryParameters: {
        'limit': 50,
      });

      final materials = response.data['materials'] as List? ?? [];
      for (final material in materials) {
        await DatabaseService.saveMaterial({
          'id': material['id'] ?? material['_id'],
          'title': material['title'],
          'description': material['description'],
          'type': material['type'],
          'category': material['category'],
          'fileUrl': material['fileUrl'],
          'thumbnailUrl': material['thumbnailUrl'],
          'duration': material['duration'],
          'fileSize': material['fileSize'],
          'uploadedBy': material['uploadedBy'],
          'uploadedAt': material['uploadedAt'],
          'isSynced': 1,
          'data': json.encode(material),
        });
      }
    } catch (e) {
      throw Exception('Failed to download materials: $e');
    }
  }

  Future<void> _downloadBadges() async {
    try {
      final response = await _dio.get('/badges/user');

      final badges = response.data['badges'] as List? ?? [];
      for (final badge in badges) {
        await DatabaseService.saveBadge({
          'id': badge['id'] ?? badge['_id'],
          'name': badge['name'],
          'description': badge['description'],
          'category': badge['category'],
          'rarity': badge['rarity'],
          'iconUrl': badge['iconUrl'],
          'requirement': badge['requirement'],
          'points': badge['points'],
          'unlockedAt': badge['unlockedAt'],
          'isSynced': 1,
          'data': json.encode(badge),
        });
      }
    } catch (e) {
      throw Exception('Failed to download badges: $e');
    }
  }

  // Auto-sync when coming online
  Future<void> setupAutoSync() async {
    Connectivity().onConnectivityChanged.listen((result) {
      if (result != ConnectivityResult.none) {
        sync();
      }
    });
  }
}
