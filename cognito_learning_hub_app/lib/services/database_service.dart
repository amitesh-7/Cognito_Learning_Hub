// lib/services/database_service.dart

import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseService {
  static Database? _database;
  static const String _databaseName = 'cognito_learning_hub.db';
  static const int _databaseVersion = 1;

  // Table names
  static const String quizzesTable = 'quizzes';
  static const String questionsTable = 'questions';
  static const String resultsTable = 'results';
  static const String materialsTable = 'materials';
  static const String badgesTable = 'badges';
  static const String socialPostsTable = 'social_posts';
  static const String syncQueueTable = 'sync_queue';

  static Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  static Future<Database> _initDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, _databaseName);

    return await openDatabase(
      path,
      version: _databaseVersion,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  static Future<void> _onCreate(Database db, int version) async {
    // Quizzes table
    await db.execute('''
      CREATE TABLE $quizzesTable (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        difficulty TEXT,
        duration INTEGER,
        totalQuestions INTEGER,
        thumbnailUrl TEXT,
        createdBy TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        isSynced INTEGER DEFAULT 0,
        data TEXT
      )
    ''');

    // Questions table
    await db.execute('''
      CREATE TABLE $questionsTable (
        id TEXT PRIMARY KEY,
        quizId TEXT NOT NULL,
        question TEXT NOT NULL,
        type TEXT,
        options TEXT,
        correctAnswer TEXT,
        explanation TEXT,
        points INTEGER,
        timeLimit INTEGER,
        data TEXT,
        FOREIGN KEY (quizId) REFERENCES $quizzesTable (id) ON DELETE CASCADE
      )
    ''');

    // Results table
    await db.execute('''
      CREATE TABLE $resultsTable (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        quizId TEXT NOT NULL,
        score INTEGER,
        totalQuestions INTEGER,
        correctAnswers INTEGER,
        timeTaken INTEGER,
        completedAt TEXT,
        isSynced INTEGER DEFAULT 0,
        data TEXT
      )
    ''');

    // Materials table
    await db.execute('''
      CREATE TABLE $materialsTable (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT,
        category TEXT,
        fileUrl TEXT,
        thumbnailUrl TEXT,
        duration INTEGER,
        fileSize INTEGER,
        uploadedBy TEXT,
        uploadedAt TEXT,
        isSynced INTEGER DEFAULT 0,
        data TEXT
      )
    ''');

    // Badges table
    await db.execute('''
      CREATE TABLE $badgesTable (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        rarity TEXT,
        iconUrl TEXT,
        requirement TEXT,
        points INTEGER,
        unlockedAt TEXT,
        isSynced INTEGER DEFAULT 0,
        data TEXT
      )
    ''');

    // Social posts table
    await db.execute('''
      CREATE TABLE $socialPostsTable (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT,
        imageUrl TEXT,
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        createdAt TEXT,
        isSynced INTEGER DEFAULT 0,
        data TEXT
      )
    ''');

    // Sync queue table
    await db.execute('''
      CREATE TABLE $syncQueueTable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operation TEXT NOT NULL,
        tableName TEXT NOT NULL,
        recordId TEXT NOT NULL,
        data TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        attempts INTEGER DEFAULT 0,
        lastAttemptAt TEXT
      )
    ''');

    // Create indexes
    await db.execute(
        'CREATE INDEX idx_quizzes_category ON $quizzesTable(category)');
    await db.execute(
        'CREATE INDEX idx_questions_quizId ON $questionsTable(quizId)');
    await db
        .execute('CREATE INDEX idx_results_userId ON $resultsTable(userId)');
    await db.execute(
        'CREATE INDEX idx_materials_category ON $materialsTable(category)');
    await db.execute(
        'CREATE INDEX idx_social_posts_userId ON $socialPostsTable(userId)');
    await db.execute(
        'CREATE INDEX idx_sync_queue_operation ON $syncQueueTable(operation)');
  }

  static Future<void> _onUpgrade(
      Database db, int oldVersion, int newVersion) async {
    // Handle database upgrades here
  }

  // Generic CRUD operations
  static Future<int> insert(String table, Map<String, dynamic> data) async {
    final db = await database;
    return await db.insert(table, data,
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  static Future<List<Map<String, dynamic>>> query(
    String table, {
    String? where,
    List<dynamic>? whereArgs,
    String? orderBy,
    int? limit,
    int? offset,
  }) async {
    final db = await database;
    return await db.query(
      table,
      where: where,
      whereArgs: whereArgs,
      orderBy: orderBy,
      limit: limit,
      offset: offset,
    );
  }

  static Future<int> update(
    String table,
    Map<String, dynamic> data, {
    String? where,
    List<dynamic>? whereArgs,
  }) async {
    final db = await database;
    return await db.update(table, data, where: where, whereArgs: whereArgs);
  }

  static Future<int> delete(
    String table, {
    String? where,
    List<dynamic>? whereArgs,
  }) async {
    final db = await database;
    return await db.delete(table, where: where, whereArgs: whereArgs);
  }

  // Quiz operations
  static Future<void> saveQuiz(Map<String, dynamic> quiz) async {
    await insert(quizzesTable, quiz);
  }

  static Future<List<Map<String, dynamic>>> getQuizzes({
    String? category,
    int? limit,
  }) async {
    return await query(
      quizzesTable,
      where: category != null ? 'category = ?' : null,
      whereArgs: category != null ? [category] : null,
      orderBy: 'createdAt DESC',
      limit: limit,
    );
  }

  static Future<Map<String, dynamic>?> getQuizById(String id) async {
    final results = await query(quizzesTable, where: 'id = ?', whereArgs: [id]);
    return results.isNotEmpty ? results.first : null;
  }

  // Question operations
  static Future<void> saveQuestion(Map<String, dynamic> question) async {
    await insert(questionsTable, question);
  }

  static Future<List<Map<String, dynamic>>> getQuestionsByQuizId(
      String quizId) async {
    return await query(
      questionsTable,
      where: 'quizId = ?',
      whereArgs: [quizId],
    );
  }

  // Result operations
  static Future<void> saveResult(Map<String, dynamic> result) async {
    await insert(resultsTable, result);
  }

  static Future<List<Map<String, dynamic>>> getResults({
    String? userId,
    String? quizId,
  }) async {
    String? where;
    List<dynamic>? whereArgs;

    if (userId != null && quizId != null) {
      where = 'userId = ? AND quizId = ?';
      whereArgs = [userId, quizId];
    } else if (userId != null) {
      where = 'userId = ?';
      whereArgs = [userId];
    } else if (quizId != null) {
      where = 'quizId = ?';
      whereArgs = [quizId];
    }

    return await query(
      resultsTable,
      where: where,
      whereArgs: whereArgs,
      orderBy: 'completedAt DESC',
    );
  }

  // Material operations
  static Future<void> saveMaterial(Map<String, dynamic> material) async {
    await insert(materialsTable, material);
  }

  static Future<List<Map<String, dynamic>>> getMaterials({
    String? category,
    String? type,
    int? limit,
  }) async {
    String? where;
    List<dynamic>? whereArgs;

    if (category != null && type != null) {
      where = 'category = ? AND type = ?';
      whereArgs = [category, type];
    } else if (category != null) {
      where = 'category = ?';
      whereArgs = [category];
    } else if (type != null) {
      where = 'type = ?';
      whereArgs = [type];
    }

    return await query(
      materialsTable,
      where: where,
      whereArgs: whereArgs,
      orderBy: 'uploadedAt DESC',
      limit: limit,
    );
  }

  // Badge operations
  static Future<void> saveBadge(Map<String, dynamic> badge) async {
    await insert(badgesTable, badge);
  }

  static Future<List<Map<String, dynamic>>> getBadges({String? rarity}) async {
    return await query(
      badgesTable,
      where: rarity != null ? 'rarity = ?' : null,
      whereArgs: rarity != null ? [rarity] : null,
      orderBy: 'unlockedAt DESC',
    );
  }

  // Social post operations
  static Future<void> savePost(Map<String, dynamic> post) async {
    await insert(socialPostsTable, post);
  }

  static Future<List<Map<String, dynamic>>> getPosts({
    String? userId,
    int? limit,
  }) async {
    return await query(
      socialPostsTable,
      where: userId != null ? 'userId = ?' : null,
      whereArgs: userId != null ? [userId] : null,
      orderBy: 'createdAt DESC',
      limit: limit,
    );
  }

  // Sync queue operations
  static Future<void> addToSyncQueue({
    required String operation,
    required String tableName,
    required String recordId,
    required String data,
  }) async {
    await insert(syncQueueTable, {
      'operation': operation,
      'tableName': tableName,
      'recordId': recordId,
      'data': data,
      'createdAt': DateTime.now().toIso8601String(),
      'attempts': 0,
    });
  }

  static Future<List<Map<String, dynamic>>> getSyncQueue({int? limit}) async {
    return await query(
      syncQueueTable,
      orderBy: 'createdAt ASC',
      limit: limit,
    );
  }

  static Future<void> removeSyncQueueItem(int id) async {
    await delete(syncQueueTable, where: 'id = ?', whereArgs: [id]);
  }

  static Future<void> updateSyncQueueItem(
    int id, {
    required int attempts,
    required String lastAttemptAt,
  }) async {
    await update(
      syncQueueTable,
      {
        'attempts': attempts,
        'lastAttemptAt': lastAttemptAt,
      },
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // Get unsynced items count
  static Future<int> getUnsyncedCount() async {
    final db = await database;
    final tables = [
      quizzesTable,
      resultsTable,
      materialsTable,
      badgesTable,
      socialPostsTable,
    ];

    int totalCount = 0;
    for (final table in tables) {
      final result = await db.rawQuery(
        'SELECT COUNT(*) as count FROM $table WHERE isSynced = 0',
      );
      totalCount += (result.first['count'] as int?) ?? 0;
    }

    return totalCount;
  }

  // Mark as synced
  static Future<void> markAsSynced(String table, String id) async {
    await update(
      table,
      {'isSynced': 1},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  // Clear all data
  static Future<void> clearAllData() async {
    final db = await database;
    await db.delete(quizzesTable);
    await db.delete(questionsTable);
    await db.delete(resultsTable);
    await db.delete(materialsTable);
    await db.delete(badgesTable);
    await db.delete(socialPostsTable);
    await db.delete(syncQueueTable);
  }

  // Close database
  static Future<void> close() async {
    final db = _database;
    if (db != null) {
      await db.close();
      _database = null;
    }
  }
}
