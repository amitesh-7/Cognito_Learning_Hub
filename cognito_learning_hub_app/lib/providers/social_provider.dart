// lib/providers/social_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/social.dart';
import '../services/social_service.dart';

// Social Service Provider
final socialServiceProvider = Provider<SocialService>((ref) {
  return SocialService();
});

// Friends List Provider
final friendsListProvider = FutureProvider<List<Friend>>((ref) async {
  final service = ref.read(socialServiceProvider);
  return service.getFriends();
});

// Friend Requests Provider
final friendRequestsProvider = FutureProvider<List<Friend>>((ref) async {
  final service = ref.read(socialServiceProvider);
  return service.getPendingRequests();
});

// Social Feed Provider
class SocialFeedNotifier extends Notifier<AsyncValue<List<SocialPost>>> {
  int _currentPage = 1;
  bool _hasMore = true;
  final List<SocialPost> _posts = [];

  @override
  AsyncValue<List<SocialPost>> build() {
    loadFeed();
    return const AsyncValue.loading();
  }

  Future<void> loadFeed({bool refresh = false}) async {
    if (refresh) {
      _currentPage = 1;
      _hasMore = true;
      _posts.clear();
      state = const AsyncValue.loading();
    }

    if (!_hasMore) return;

    try {
      final service = ref.read(socialServiceProvider);
      final newPosts = await service.getFeed(page: _currentPage);

      if (refresh) {
        _posts.clear();
      }

      _posts.addAll(newPosts);
      _hasMore = newPosts.length >= 20;
      _currentPage++;

      state = AsyncValue.data(List.from(_posts));
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> createPost({
    required String content,
    required PostType type,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      final service = ref.read(socialServiceProvider);
      final newPost = await service.createPost(
        content: content,
        type: type,
        metadata: metadata,
      );

      _posts.insert(0, newPost);
      state = AsyncValue.data(List.from(_posts));
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> deletePost(String postId) async {
    try {
      final service = ref.read(socialServiceProvider);
      await service.deletePost(postId);

      _posts.removeWhere((post) => post.id == postId);
      state = AsyncValue.data(List.from(_posts));
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> toggleLike(String postId, String currentUserId) async {
    try {
      final service = ref.read(socialServiceProvider);
      await service.toggleLike(postId);

      // Update local state optimistically
      final index = _posts.indexWhere((post) => post.id == postId);
      if (index != -1) {
        final post = _posts[index];
        final likes = List<String>.from(post.likes);

        if (likes.contains(currentUserId)) {
          likes.remove(currentUserId);
        } else {
          likes.add(currentUserId);
        }

        _posts[index] = SocialPost(
          id: post.id,
          userId: post.userId,
          content: post.content,
          type: post.type,
          metadata: post.metadata,
          likes: likes,
          commentsCount: post.commentsCount,
          createdAt: post.createdAt,
          userName: post.userName,
          userAvatar: post.userAvatar,
          userLevel: post.userLevel,
        );

        state = AsyncValue.data(List.from(_posts));
      }
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }
}

final socialFeedProvider =
    NotifierProvider<SocialFeedNotifier, AsyncValue<List<SocialPost>>>(() {
  return SocialFeedNotifier();
});

// Comments Provider for a specific post
final commentsProvider =
    FutureProvider.family<List<Comment>, String>((ref, postId) async {
  final service = ref.read(socialServiceProvider);
  return service.getComments(postId);
});

// Activity Feed Provider
final activityFeedProvider =
    FutureProvider<List<ActivityFeedItem>>((ref) async {
  final service = ref.read(socialServiceProvider);
  return service.getActivities();
});

// User Search Provider
final userSearchProvider =
    FutureProvider.family<List<Map<String, dynamic>>, String>(
        (ref, query) async {
  if (query.isEmpty) return [];
  final service = ref.read(socialServiceProvider);
  return service.searchUsers(query);
});
