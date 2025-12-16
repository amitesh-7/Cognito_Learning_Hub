// lib/services/social_service.dart

import 'package:dio/dio.dart';
import '../models/social.dart';
import '../config/api_config.dart';

class SocialService {
  final Dio _dio;

  SocialService()
      : _dio = Dio(BaseOptions(
          baseUrl: ApiConfig.apiUrl,
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
        ));

  // Friends Management

  /// Get user's friends list
  Future<List<Friend>> getFriends() async {
    try {
      final response = await _dio.get('/social/friends');
      final friends = (response.data['friends'] as List)
          .map((json) => Friend.fromJson(json))
          .toList();
      return friends;
    } catch (e) {
      throw Exception('Failed to fetch friends: $e');
    }
  }

  /// Get pending friend requests
  Future<List<Friend>> getPendingRequests() async {
    try {
      final response = await _dio.get('/social/friends/requests');
      final requests = (response.data['requests'] as List)
          .map((json) => Friend.fromJson(json))
          .toList();
      return requests;
    } catch (e) {
      throw Exception('Failed to fetch friend requests: $e');
    }
  }

  /// Send friend request
  Future<void> sendFriendRequest(String userId) async {
    try {
      await _dio.post('/social/friends/request', data: {
        'friendId': userId,
      });
    } catch (e) {
      throw Exception('Failed to send friend request: $e');
    }
  }

  /// Accept friend request
  Future<void> acceptFriendRequest(String requestId) async {
    try {
      await _dio.put('/social/friends/accept/$requestId');
    } catch (e) {
      throw Exception('Failed to accept friend request: $e');
    }
  }

  /// Reject friend request
  Future<void> rejectFriendRequest(String requestId) async {
    try {
      await _dio.delete('/social/friends/reject/$requestId');
    } catch (e) {
      throw Exception('Failed to reject friend request: $e');
    }
  }

  /// Remove friend
  Future<void> removeFriend(String friendId) async {
    try {
      await _dio.delete('/social/friends/$friendId');
    } catch (e) {
      throw Exception('Failed to remove friend: $e');
    }
  }

  /// Search users to add as friends
  Future<List<Map<String, dynamic>>> searchUsers(String query) async {
    try {
      final response = await _dio.get('/social/users/search', queryParameters: {
        'q': query,
      });
      return List<Map<String, dynamic>>.from(response.data['users'] ?? []);
    } catch (e) {
      throw Exception('Failed to search users: $e');
    }
  }

  // Social Feed / Posts

  /// Get activity feed
  Future<List<SocialPost>> getFeed({int page = 1, int limit = 20}) async {
    try {
      final response = await _dio.get('/social/feed', queryParameters: {
        'page': page,
        'limit': limit,
      });
      final posts = (response.data['posts'] as List)
          .map((json) => SocialPost.fromJson(json))
          .toList();
      return posts;
    } catch (e) {
      throw Exception('Failed to fetch feed: $e');
    }
  }

  /// Get user's posts
  Future<List<SocialPost>> getUserPosts(String userId, {int page = 1}) async {
    try {
      final response =
          await _dio.get('/social/posts/user/$userId', queryParameters: {
        'page': page,
        'limit': 20,
      });
      final posts = (response.data['posts'] as List)
          .map((json) => SocialPost.fromJson(json))
          .toList();
      return posts;
    } catch (e) {
      throw Exception('Failed to fetch user posts: $e');
    }
  }

  /// Create new post
  Future<SocialPost> createPost({
    required String content,
    required PostType type,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      final response = await _dio.post('/social/posts', data: {
        'content': content,
        'type': type.toString().split('.').last,
        'metadata': metadata,
      });
      return SocialPost.fromJson(response.data['post']);
    } catch (e) {
      throw Exception('Failed to create post: $e');
    }
  }

  /// Delete post
  Future<void> deletePost(String postId) async {
    try {
      await _dio.delete('/social/posts/$postId');
    } catch (e) {
      throw Exception('Failed to delete post: $e');
    }
  }

  /// Like/Unlike post
  Future<void> toggleLike(String postId) async {
    try {
      await _dio.post('/social/posts/$postId/like');
    } catch (e) {
      throw Exception('Failed to toggle like: $e');
    }
  }

  // Comments

  /// Get post comments
  Future<List<Comment>> getComments(String postId) async {
    try {
      final response = await _dio.get('/social/posts/$postId/comments');
      final comments = (response.data['comments'] as List)
          .map((json) => Comment.fromJson(json))
          .toList();
      return comments;
    } catch (e) {
      throw Exception('Failed to fetch comments: $e');
    }
  }

  /// Add comment to post
  Future<Comment> addComment(String postId, String content) async {
    try {
      final response = await _dio.post('/social/posts/$postId/comments', data: {
        'content': content,
      });
      return Comment.fromJson(response.data['comment']);
    } catch (e) {
      throw Exception('Failed to add comment: $e');
    }
  }

  /// Delete comment
  Future<void> deleteComment(String postId, String commentId) async {
    try {
      await _dio.delete('/social/posts/$postId/comments/$commentId');
    } catch (e) {
      throw Exception('Failed to delete comment: $e');
    }
  }

  // Activity Feed

  /// Get user activity feed
  Future<List<ActivityFeedItem>> getActivities({int page = 1}) async {
    try {
      final response = await _dio.get('/social/activities', queryParameters: {
        'page': page,
        'limit': 50,
      });
      final activities = (response.data['activities'] as List)
          .map((json) => ActivityFeedItem.fromJson(json))
          .toList();
      return activities;
    } catch (e) {
      throw Exception('Failed to fetch activities: $e');
    }
  }
}
