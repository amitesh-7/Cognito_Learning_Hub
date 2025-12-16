// lib/screens/study_materials/material_detail_screen.dart

import 'package:flutter/material.dart' hide MaterialType;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/study_material.dart';
import '../../providers/study_materials_provider.dart';

class MaterialDetailScreen extends ConsumerStatefulWidget {
  final String materialId;

  const MaterialDetailScreen({super.key, required this.materialId});

  @override
  ConsumerState<MaterialDetailScreen> createState() =>
      _MaterialDetailScreenState();
}

class _MaterialDetailScreenState extends ConsumerState<MaterialDetailScreen> {
  double _userRating = 0;
  bool _hasRated = false;

  @override
  Widget build(BuildContext context) {
    final materialAsync = ref.watch(materialProvider(widget.materialId));
    final progressAsync =
        ref.watch(materialProgressProvider(widget.materialId));

    return Scaffold(
      body: materialAsync.when(
        data: (material) => CustomScrollView(
          slivers: [
            // App Bar with Image
            SliverAppBar(
              expandedHeight: 250,
              pinned: true,
              flexibleSpace: FlexibleSpaceBar(
                title: Text(
                  material.title,
                  style: const TextStyle(
                    shadows: [
                      Shadow(
                        offset: Offset(0, 1),
                        blurRadius: 3.0,
                        color: Colors.black54,
                      ),
                    ],
                  ),
                ),
                background: Stack(
                  fit: StackFit.expand,
                  children: [
                    material.thumbnailUrl != null
                        ? Image.network(
                            material.thumbnailUrl!,
                            fit: BoxFit.cover,
                          )
                        : Container(
                            color:
                                _getTypeColor(material.type).withOpacity(0.3),
                            child: Icon(
                              _getTypeIcon(material.type),
                              size: 100,
                              color: _getTypeColor(material.type),
                            ),
                          ),
                    Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            Colors.black.withOpacity(0.7),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                IconButton(
                  icon: Icon(
                    material.isBookmarked
                        ? Icons.bookmark
                        : Icons.bookmark_outline,
                  ),
                  onPressed: () async {
                    await ref
                        .read(materialsNotifierProvider.notifier)
                        .toggleBookmark(material.id);
                    ref.invalidate(materialProvider(widget.materialId));
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.share),
                  onPressed: () {
                    // Implement share functionality
                  },
                ),
              ],
            ),

            // Content
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Meta Information
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: _getTypeColor(material.type),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Text(
                            material.type.name.toUpperCase(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: _getDifficultyColor(material.difficulty),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Text(
                            material.difficulty.name.toUpperCase(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                        if (material.isPremium)
                          Padding(
                            padding: const EdgeInsets.only(left: 12),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.amber,
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: const Row(
                                children: [
                                  Icon(Icons.star,
                                      size: 14, color: Colors.white),
                                  SizedBox(width: 4),
                                  Text(
                                    'PREMIUM',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Stats Row
                    Row(
                      children: [
                        _StatItem(
                          icon: Icons.star,
                          value: material.rating.toStringAsFixed(1),
                          label: '${material.ratingCount} ratings',
                        ),
                        const SizedBox(width: 20),
                        _StatItem(
                          icon: Icons.visibility,
                          value: _formatCount(material.viewCount),
                          label: 'views',
                        ),
                        const SizedBox(width: 20),
                        _StatItem(
                          icon: Icons.download,
                          value: _formatCount(material.downloadCount),
                          label: 'downloads',
                        ),
                        const SizedBox(width: 20),
                        _StatItem(
                          icon: Icons.access_time,
                          value: material.durationFormatted,
                          label: 'duration',
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Progress Bar
                    progressAsync.when(
                      data: (progress) {
                        if (progress.progressPercentage > 0) {
                          return Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text(
                                    'Your Progress',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                  Text(
                                    '${progress.progressPercentage.toInt()}%',
                                    style: TextStyle(
                                      color: Theme.of(context).primaryColor,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              LinearProgressIndicator(
                                value: progress.progressPercentage / 100,
                                minHeight: 8,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              const SizedBox(height: 24),
                            ],
                          );
                        }
                        return const SizedBox.shrink();
                      },
                      loading: () => const SizedBox.shrink(),
                      error: (_, __) => const SizedBox.shrink(),
                    ),

                    // Author Info
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 20,
                          child: Text(
                            (material.authorName ?? 'Unknown')[0].toUpperCase(),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Created by',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey,
                              ),
                            ),
                            Text(
                              material.authorName ?? 'Unknown',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Description
                    const Text(
                      'Description',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      material.description,
                      style: TextStyle(
                        color: Colors.grey[700],
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Tags
                    if (material.tags.isNotEmpty) ...[
                      const Text(
                        'Tags',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: material.tags
                            .map((tag) => Chip(
                                  label: Text(tag),
                                  backgroundColor: Colors.grey[200],
                                ))
                            .toList(),
                      ),
                      const SizedBox(height: 24),
                    ],

                    // Rating Section
                    const Text(
                      'Rate this material',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        ...List.generate(5, (index) {
                          return IconButton(
                            icon: Icon(
                              index < _userRating
                                  ? Icons.star
                                  : Icons.star_outline,
                              color: Colors.amber,
                              size: 32,
                            ),
                            onPressed: () {
                              setState(
                                  () => _userRating = (index + 1).toDouble());
                            },
                          );
                        }),
                        if (_userRating > 0 && !_hasRated)
                          TextButton(
                            onPressed: () async {
                              await ref
                                  .read(studyMaterialsServiceProvider)
                                  .rateMaterial(material.id, _userRating);
                              setState(() => _hasRated = true);
                              ref.invalidate(
                                  materialProvider(widget.materialId));

                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                      content: Text('Rating submitted!')),
                                );
                              }
                            },
                            child: const Text('Submit'),
                          ),
                      ],
                    ),

                    const SizedBox(height: 80), // Space for FAB
                  ],
                ),
              ),
            ),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Text('Error: $error'),
            ],
          ),
        ),
      ),
      floatingActionButton: materialAsync.when(
        data: (material) => _buildActionButton(material),
        loading: () => null,
        error: (_, __) => null,
      ),
    );
  }

  Widget _buildActionButton(StudyMaterial material) {
    return FloatingActionButton.extended(
      onPressed: () => _openMaterial(material),
      icon: Icon(_getActionIcon(material.type)),
      label: Text(_getActionLabel(material.type)),
    );
  }

  IconData _getActionIcon(MaterialType type) {
    switch (type) {
      case MaterialType.document:
        return Icons.picture_as_pdf;
      case MaterialType.video:
        return Icons.play_arrow;
      case MaterialType.practice:
        return Icons.quiz;
      case MaterialType.article:
        return Icons.article;
      case MaterialType.link:
        return Icons.open_in_new;
    }
  }

  String _getActionLabel(MaterialType type) {
    switch (type) {
      case MaterialType.document:
        return 'Open Document';
      case MaterialType.video:
        return 'Watch Video';
      case MaterialType.practice:
        return 'Start Practice';
      case MaterialType.article:
        return 'Read Article';
      case MaterialType.link:
        return 'Open Link';
    }
  }

  void _openMaterial(StudyMaterial material) async {
    // Track view
    await ref.read(studyMaterialsServiceProvider).trackView(material.id);

    // Navigate based on type
    switch (material.type) {
      case MaterialType.document:
        if (material.fileUrl != null) {
          // Open PDF viewer or download
          // context.push('/materials/${material.id}/viewer');
        }
        break;
      case MaterialType.video:
        if (material.videoUrl != null) {
          // Open video player
          // context.push('/materials/${material.id}/player');
        }
        break;
      case MaterialType.link:
        if (material.externalLink != null) {
          // Open external link
        }
        break;
      default:
        break;
    }
  }

  IconData _getTypeIcon(MaterialType type) {
    switch (type) {
      case MaterialType.document:
        return Icons.description;
      case MaterialType.video:
        return Icons.play_circle_outline;
      case MaterialType.practice:
        return Icons.quiz;
      case MaterialType.article:
        return Icons.article;
      case MaterialType.link:
        return Icons.link;
    }
  }

  Color _getTypeColor(MaterialType type) {
    switch (type) {
      case MaterialType.document:
        return Colors.blue;
      case MaterialType.video:
        return Colors.red;
      case MaterialType.practice:
        return Colors.green;
      case MaterialType.article:
        return Colors.orange;
      case MaterialType.link:
        return Colors.purple;
    }
  }

  Color _getDifficultyColor(MaterialDifficulty difficulty) {
    switch (difficulty) {
      case MaterialDifficulty.beginner:
        return Colors.green;
      case MaterialDifficulty.intermediate:
        return Colors.orange;
      case MaterialDifficulty.advanced:
        return Colors.red;
    }
  }

  String _formatCount(int count) {
    if (count >= 1000000) {
      return '${(count / 1000000).toStringAsFixed(1)}M';
    } else if (count >= 1000) {
      return '${(count / 1000).toStringAsFixed(1)}K';
    }
    return count.toString();
  }
}

class _StatItem extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;

  const _StatItem({
    required this.icon,
    required this.value,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Icon(icon, size: 16, color: Colors.grey[600]),
            const SizedBox(width: 4),
            Text(
              value,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }
}
