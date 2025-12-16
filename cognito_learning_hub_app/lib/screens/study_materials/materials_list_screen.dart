// lib/screens/study_materials/materials_list_screen.dart

import 'package:flutter/material.dart' hide MaterialType;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/study_material.dart';
import '../../providers/study_materials_provider.dart';
import 'package:go_router/go_router.dart';

class MaterialsListScreen extends ConsumerStatefulWidget {
  final String? categoryId;

  const MaterialsListScreen({super.key, this.categoryId});

  @override
  ConsumerState<MaterialsListScreen> createState() =>
      _MaterialsListScreenState();
}

class _MaterialsListScreenState extends ConsumerState<MaterialsListScreen>
    with SingleTickerProviderStateMixin {
  MaterialType? _selectedType;
  MaterialDifficulty? _selectedDifficulty;
  String _searchQuery = '';
  bool _isGridView = true;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final params = MaterialsParams(
      categoryId: widget.categoryId,
      type: _selectedType,
      difficulty: _selectedDifficulty,
      searchQuery: _searchQuery.isEmpty ? null : _searchQuery,
    );

    final materialsAsync = ref.watch(materialsProvider(params));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Study Materials'),
        actions: [
          IconButton(
            icon: Icon(_isGridView ? Icons.view_list : Icons.grid_view),
            onPressed: () => setState(() => _isGridView = !_isGridView),
          ),
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterDialog,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'All Materials'),
            Tab(text: 'Bookmarked'),
            Tab(text: 'Recommended'),
          ],
        ),
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search materials...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
              ),
              onChanged: (value) {
                setState(() => _searchQuery = value);
              },
            ),
          ),

          // Filter Chips
          if (_selectedType != null || _selectedDifficulty != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Wrap(
                spacing: 8,
                children: [
                  if (_selectedType != null)
                    FilterChip(
                      label: Text(_selectedType!.name.toUpperCase()),
                      onSelected: (_) {},
                      onDeleted: () => setState(() => _selectedType = null),
                      selected: true,
                    ),
                  if (_selectedDifficulty != null)
                    FilterChip(
                      label: Text(_selectedDifficulty!.name.toUpperCase()),
                      onSelected: (_) {},
                      onDeleted: () =>
                          setState(() => _selectedDifficulty = null),
                      selected: true,
                    ),
                ],
              ),
            ),

          // Content
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                // All Materials Tab
                materialsAsync.when(
                  data: (materials) {
                    if (materials.isEmpty) {
                      return _buildEmptyState(
                        icon: Icons.library_books_outlined,
                        message: 'No materials found',
                      );
                    }

                    return RefreshIndicator(
                      onRefresh: () async {
                        ref.invalidate(materialsProvider(params));
                      },
                      child: _isGridView
                          ? _buildGridView(materials)
                          : _buildListView(materials),
                    );
                  },
                  loading: () =>
                      const Center(child: CircularProgressIndicator()),
                  error: (error, stack) => _buildErrorState(error.toString()),
                ),

                // Bookmarked Tab
                _buildBookmarkedTab(),

                // Recommended Tab
                _buildRecommendedTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGridView(List<StudyMaterial> materials) {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.75,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
      ),
      itemCount: materials.length,
      itemBuilder: (context, index) => _MaterialCard(
        material: materials[index],
        onTap: () => _openMaterialDetail(materials[index].id),
      ),
    );
  }

  Widget _buildListView(List<StudyMaterial> materials) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: materials.length,
      itemBuilder: (context, index) => _MaterialListTile(
        material: materials[index],
        onTap: () => _openMaterialDetail(materials[index].id),
      ),
    );
  }

  Widget _buildBookmarkedTab() {
    final bookmarkedAsync = ref.watch(bookmarkedMaterialsProvider);

    return bookmarkedAsync.when(
      data: (materials) {
        if (materials.isEmpty) {
          return _buildEmptyState(
            icon: Icons.bookmark_outline,
            message: 'No bookmarked materials',
          );
        }

        return RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(bookmarkedMaterialsProvider);
          },
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: materials.length,
            itemBuilder: (context, index) => _MaterialListTile(
              material: materials[index],
              onTap: () => _openMaterialDetail(materials[index].id),
            ),
          ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stack) => _buildErrorState(error.toString()),
    );
  }

  Widget _buildRecommendedTab() {
    final recommendedAsync = ref.watch(recommendedMaterialsProvider);

    return recommendedAsync.when(
      data: (materials) {
        if (materials.isEmpty) {
          return _buildEmptyState(
            icon: Icons.lightbulb_outline,
            message: 'No recommendations yet',
          );
        }

        return RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(recommendedMaterialsProvider);
          },
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: materials.length,
            itemBuilder: (context, index) => _MaterialListTile(
              material: materials[index],
              onTap: () => _openMaterialDetail(materials[index].id),
              showRecommendedBadge: true,
            ),
          ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stack) => _buildErrorState(error.toString()),
    );
  }

  Widget _buildEmptyState({required IconData icon, required String message}) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 64, color: Colors.grey),
          const SizedBox(height: 16),
          Text(
            message,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: Colors.grey,
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(String error) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 64, color: Colors.red),
          const SizedBox(height: 16),
          Text(
            'Error loading materials',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            error,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.grey,
                ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Filter Materials'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Type', style: TextStyle(fontWeight: FontWeight.bold)),
              ...MaterialType.values.map((type) => RadioListTile<MaterialType>(
                    title: Text(type.name.toUpperCase()),
                    value: type,
                    groupValue: _selectedType,
                    onChanged: (value) =>
                        setDialogState(() => _selectedType = value),
                  )),
              const SizedBox(height: 16),
              const Text('Difficulty',
                  style: TextStyle(fontWeight: FontWeight.bold)),
              ...MaterialDifficulty.values
                  .map((diff) => RadioListTile<MaterialDifficulty>(
                        title: Text(diff.name.toUpperCase()),
                        value: diff,
                        groupValue: _selectedDifficulty,
                        onChanged: (value) =>
                            setDialogState(() => _selectedDifficulty = value),
                      )),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                setState(() {
                  _selectedType = null;
                  _selectedDifficulty = null;
                });
                Navigator.pop(context);
              },
              child: const Text('Clear'),
            ),
            TextButton(
              onPressed: () {
                setState(() {});
                Navigator.pop(context);
              },
              child: const Text('Apply'),
            ),
          ],
        ),
      ),
    );
  }

  void _openMaterialDetail(String materialId) {
    context.push('/materials/$materialId');
  }
}

class _MaterialCard extends ConsumerWidget {
  final StudyMaterial material;
  final VoidCallback onTap;

  const _MaterialCard({
    required this.material,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Thumbnail
            Expanded(
              child: Stack(
                children: [
                  Container(
                    width: double.infinity,
                    color: Colors.grey[200],
                    child: material.thumbnailUrl != null
                        ? Image.network(
                            material.thumbnailUrl!,
                            fit: BoxFit.cover,
                          )
                        : Icon(
                            _getTypeIcon(material.type),
                            size: 48,
                            color: Colors.grey,
                          ),
                  ),

                  // Type Badge
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: _getTypeColor(material.type),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        material.type.name.toUpperCase(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),

                  // Bookmark Button
                  Positioned(
                    top: 8,
                    left: 8,
                    child: IconButton(
                      icon: Icon(
                        material.isBookmarked
                            ? Icons.bookmark
                            : Icons.bookmark_outline,
                        color: Colors.white,
                      ),
                      onPressed: () async {
                        await ref
                            .read(materialsNotifierProvider.notifier)
                            .toggleBookmark(material.id);
                      },
                    ),
                  ),
                ],
              ),
            ),

            // Content
            Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    material.title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.star, size: 14, color: Colors.amber),
                      const SizedBox(width: 4),
                      Text(
                        material.rating.toStringAsFixed(1),
                        style: const TextStyle(fontSize: 12),
                      ),
                      const Spacer(),
                      Text(
                        material.durationFormatted,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
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
}

class _MaterialListTile extends ConsumerWidget {
  final StudyMaterial material;
  final VoidCallback onTap;
  final bool showRecommendedBadge;

  const _MaterialListTile({
    required this.material,
    required this.onTap,
    this.showRecommendedBadge = false,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        contentPadding: const EdgeInsets.all(12),
        leading: Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            color: Colors.grey[200],
            borderRadius: BorderRadius.circular(8),
          ),
          child: material.thumbnailUrl != null
              ? ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    material.thumbnailUrl!,
                    fit: BoxFit.cover,
                  ),
                )
              : Icon(
                  _getTypeIcon(material.type),
                  color: _getTypeColor(material.type),
                ),
        ),
        title: Text(
          material.title,
          style: const TextStyle(fontWeight: FontWeight.bold),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              material.description,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: _getTypeColor(material.type).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    material.type.name.toUpperCase(),
                    style: TextStyle(
                      fontSize: 10,
                      color: _getTypeColor(material.type),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Icon(Icons.star, size: 14, color: Colors.amber),
                const SizedBox(width: 2),
                Text(
                  material.rating.toStringAsFixed(1),
                  style: const TextStyle(fontSize: 12),
                ),
                const SizedBox(width: 8),
                Icon(Icons.access_time, size: 14, color: Colors.grey[600]),
                const SizedBox(width: 2),
                Text(
                  material.durationFormatted,
                  style: const TextStyle(fontSize: 12),
                ),
                if (showRecommendedBadge) ...[
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.amber,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      'RECOMMENDED',
                      style: TextStyle(
                        fontSize: 10,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
        trailing: IconButton(
          icon: Icon(
            material.isBookmarked ? Icons.bookmark : Icons.bookmark_outline,
          ),
          onPressed: () async {
            await ref
                .read(materialsNotifierProvider.notifier)
                .toggleBookmark(material.id);
          },
        ),
        onTap: onTap,
      ),
    );
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
}
