// lib/screens/social/social_feed_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../providers/social_provider.dart';
import '../../providers/auth_provider.dart';
import '../../models/social.dart';
import '../../config/theme.dart';

class SocialFeedScreen extends ConsumerStatefulWidget {
  const SocialFeedScreen({super.key});

  @override
  ConsumerState<SocialFeedScreen> createState() => _SocialFeedScreenState();
}

class _SocialFeedScreenState extends ConsumerState<SocialFeedScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _scrollController = ScrollController();
  final _postController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _scrollController.dispose();
    _postController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent * 0.9) {
      ref.read(socialFeedProvider.notifier).loadFeed();
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentUser = ref.watch(currentUserProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Social'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(icon: Icon(Icons.home), text: 'Feed'),
            Tab(icon: Icon(Icons.people), text: 'Friends'),
            Tab(icon: Icon(Icons.notifications), text: 'Activity'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add),
            onPressed: () => _showAddFriendDialog(),
          ),
        ],
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildFeedTab(currentUser?.id ?? ''),
          _buildFriendsTab(),
          _buildActivityTab(),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCreatePostDialog(),
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildFeedTab(String currentUserId) {
    final feedState = ref.watch(socialFeedProvider);

    return RefreshIndicator(
      onRefresh: () async {
        await ref.read(socialFeedProvider.notifier).loadFeed(refresh: true);
      },
      child: feedState.when(
        data: (posts) {
          if (posts.isEmpty) {
            return _buildEmptyState(
              icon: Icons.feed,
              title: 'No posts yet',
              subtitle: 'Be the first to share something!',
            );
          }

          return ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.all(16),
            itemCount: posts.length,
            itemBuilder: (context, index) {
              return _PostCard(
                post: posts[index],
                currentUserId: currentUserId,
                onLike: () => ref
                    .read(socialFeedProvider.notifier)
                    .toggleLike(posts[index].id, currentUserId),
                onComment: () => _showCommentsDialog(posts[index]),
                onDelete: posts[index].userId == currentUserId
                    ? () => ref
                        .read(socialFeedProvider.notifier)
                        .deletePost(posts[index].id)
                    : null,
              ).animate(delay: (index * 50).ms).fadeIn().slideY(begin: 0.1);
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Text('Error: $error'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.refresh(socialFeedProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFriendsTab() {
    final friendsAsync = ref.watch(friendsListProvider);
    final requestsAsync = ref.watch(friendRequestsProvider);

    return friendsAsync.when(
      data: (friends) {
        return CustomScrollView(
          slivers: [
            // Friend Requests Section
            requestsAsync.when(
              data: (requests) {
                if (requests.isNotEmpty) {
                  return SliverToBoxAdapter(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Text(
                            'Friend Requests (${requests.length})',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        ...requests.map((request) => _FriendRequestCard(
                              friend: request,
                              onAccept: () async {
                                await ref
                                    .read(socialServiceProvider)
                                    .acceptFriendRequest(request.id);
                                ref.invalidate(friendRequestsProvider);
                                ref.invalidate(friendsListProvider);
                              },
                              onReject: () async {
                                await ref
                                    .read(socialServiceProvider)
                                    .rejectFriendRequest(request.id);
                                ref.invalidate(friendRequestsProvider);
                              },
                            )),
                        const Divider(),
                      ],
                    ),
                  );
                }
                return const SliverToBoxAdapter(child: SizedBox.shrink());
              },
              loading: () => const SliverToBoxAdapter(child: SizedBox.shrink()),
              error: (_, __) =>
                  const SliverToBoxAdapter(child: SizedBox.shrink()),
            ),

            // Friends List
            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: friends.isEmpty
                  ? SliverFillRemaining(
                      child: _buildEmptyState(
                        icon: Icons.people_outline,
                        title: 'No friends yet',
                        subtitle: 'Add friends to see their activities!',
                      ),
                    )
                  : SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          return _FriendCard(friend: friends[index])
                              .animate(delay: (index * 50).ms)
                              .fadeIn()
                              .slideX();
                        },
                        childCount: friends.length,
                      ),
                    ),
            ),
          ],
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stack) => Center(child: Text('Error: $error')),
    );
  }

  Widget _buildActivityTab() {
    final activitiesAsync = ref.watch(activityFeedProvider);

    return activitiesAsync.when(
      data: (activities) {
        if (activities.isEmpty) {
          return _buildEmptyState(
            icon: Icons.notifications_none,
            title: 'No activities yet',
            subtitle: 'Your friend activities will appear here',
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: activities.length,
          itemBuilder: (context, index) {
            return _ActivityCard(activity: activities[index])
                .animate(delay: (index * 50).ms)
                .fadeIn()
                .slideY(begin: 0.1);
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stack) => Center(child: Text('Error: $error')),
    );
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 80, color: Colors.grey.shade400),
          const SizedBox(height: 16),
          Text(
            title,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.grey.shade700,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            subtitle,
            style: TextStyle(color: Colors.grey.shade600),
          ),
        ],
      ),
    );
  }

  void _showCreatePostDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          left: 16,
          right: 16,
          top: 16,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: _postController,
              decoration: const InputDecoration(
                hintText: 'What\'s on your mind?',
                border: OutlineInputBorder(),
              ),
              maxLines: 4,
              autofocus: true,
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  if (_postController.text.isNotEmpty) {
                    await ref.read(socialFeedProvider.notifier).createPost(
                          content: _postController.text,
                          type: PostType.general,
                        );
                    _postController.clear();
                    Navigator.pop(context);
                  }
                },
                child: const Text('Post'),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  void _showAddFriendDialog() {
    context.push('/social/add-friend');
  }

  void _showCommentsDialog(SocialPost post) {
    context.push('/social/post/${post.id}/comments');
  }
}

// Post Card Widget
class _PostCard extends StatelessWidget {
  final SocialPost post;
  final String currentUserId;
  final VoidCallback onLike;
  final VoidCallback onComment;
  final VoidCallback? onDelete;

  const _PostCard({
    required this.post,
    required this.currentUserId,
    required this.onLike,
    required this.onComment,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final isLiked = post.isLikedBy(currentUserId);

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // User Header
            Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  child: Text(
                    (post.userName ?? 'U')[0].toUpperCase(),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        post.userName ?? 'User',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      Text(
                        _formatTimestamp(post.createdAt),
                        style: TextStyle(
                          color: Colors.grey.shade600,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                if (onDelete != null)
                  IconButton(
                    icon: const Icon(Icons.more_vert),
                    onPressed: () => _showOptions(context),
                  ),
              ],
            ),
            const SizedBox(height: 12),

            // Post Content
            Text(post.content),
            const SizedBox(height: 16),

            // Actions
            Row(
              children: [
                IconButton(
                  icon: Icon(
                    isLiked ? Icons.favorite : Icons.favorite_border,
                    color: isLiked ? Colors.red : null,
                  ),
                  onPressed: onLike,
                ),
                Text('${post.likes.length}'),
                const SizedBox(width: 16),
                IconButton(
                  icon: const Icon(Icons.comment_outlined),
                  onPressed: onComment,
                ),
                Text('${post.commentsCount}'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: const Icon(Icons.delete, color: Colors.red),
            title: const Text('Delete Post'),
            onTap: () {
              Navigator.pop(context);
              onDelete?.call();
            },
          ),
        ],
      ),
    );
  }

  String _formatTimestamp(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inDays > 7) {
      return '${timestamp.day}/${timestamp.month}/${timestamp.year}';
    } else if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }
}

// Friend Card Widget
class _FriendCard extends StatelessWidget {
  final Friend friend;

  const _FriendCard({required this.friend});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          radius: 25,
          child: Text(
            (friend.friendName ?? 'F')[0].toUpperCase(),
            style: const TextStyle(fontSize: 20),
          ),
        ),
        title: Text(
          friend.friendName ?? 'Friend',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text('Level ${friend.friendLevel ?? 1}'),
        trailing: const Icon(Icons.chevron_right),
        onTap: () {
          // Navigate to friend's profile
        },
      ),
    );
  }
}

// Friend Request Card Widget
class _FriendRequestCard extends StatelessWidget {
  final Friend friend;
  final VoidCallback onAccept;
  final VoidCallback onReject;

  const _FriendRequestCard({
    required this.friend,
    required this.onAccept,
    required this.onReject,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            CircleAvatar(
              radius: 25,
              child: Text((friend.friendName ?? 'F')[0].toUpperCase()),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    friend.friendName ?? 'User',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  Text(
                    friend.friendEmail ?? '',
                    style: TextStyle(
                      color: Colors.grey.shade600,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.check, color: Colors.green),
              onPressed: onAccept,
            ),
            IconButton(
              icon: const Icon(Icons.close, color: Colors.red),
              onPressed: onReject,
            ),
          ],
        ),
      ),
    );
  }
}

// Activity Card Widget
class _ActivityCard extends StatelessWidget {
  final ActivityFeedItem activity;

  const _ActivityCard({required this.activity});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: _getActivityIcon(),
        title: Text(activity.title),
        subtitle: Text(activity.description),
        trailing: Text(
          _formatTimestamp(activity.createdAt),
          style: TextStyle(
            color: Colors.grey.shade600,
            fontSize: 12,
          ),
        ),
      ),
    );
  }

  Widget _getActivityIcon() {
    IconData icon;
    Color color;

    switch (activity.type) {
      case ActivityType.friendRequest:
        icon = Icons.person_add;
        color = Colors.blue;
        break;
      case ActivityType.friendAccepted:
        icon = Icons.people;
        color = Colors.green;
        break;
      case ActivityType.achievement:
        icon = Icons.emoji_events;
        color = Colors.amber;
        break;
      case ActivityType.levelUp:
        icon = Icons.trending_up;
        color = Colors.purple;
        break;
      case ActivityType.quizCompleted:
        icon = Icons.quiz;
        color = AppTheme.primaryColor;
        break;
      case ActivityType.duelWon:
        icon = Icons.military_tech;
        color = Colors.red;
        break;
      default:
        icon = Icons.notifications;
        color = Colors.grey;
    }

    return CircleAvatar(
      backgroundColor: color.withValues(alpha: 0.2),
      child: Icon(icon, color: color),
    );
  }

  String _formatTimestamp(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inDays > 0) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }
}
