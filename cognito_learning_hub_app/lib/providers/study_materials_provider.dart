// lib/providers/study_materials_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/study_materials_service.dart';
import '../models/study_material.dart';

// Study Materials Service Provider
final studyMaterialsServiceProvider = Provider<StudyMaterialsService>((ref) {
  return StudyMaterialsService();
});

// Materials List Provider
final materialsProvider =
    FutureProvider.family<List<StudyMaterial>, MaterialsParams>(
  (ref, params) async {
    final service = ref.watch(studyMaterialsServiceProvider);
    return await service.getMaterials(
      categoryId: params.categoryId,
      type: params.type,
      difficulty: params.difficulty,
      searchQuery: params.searchQuery,
      page: params.page,
      limit: params.limit,
    );
  },
);

class MaterialsParams {
  final String? categoryId;
  final MaterialType? type;
  final MaterialDifficulty? difficulty;
  final String? searchQuery;
  final int page;
  final int limit;

  MaterialsParams({
    this.categoryId,
    this.type,
    this.difficulty,
    this.searchQuery,
    this.page = 1,
    this.limit = 20,
  });

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is MaterialsParams &&
          categoryId == other.categoryId &&
          type == other.type &&
          difficulty == other.difficulty &&
          searchQuery == other.searchQuery &&
          page == other.page &&
          limit == other.limit;

  @override
  int get hashCode =>
      Object.hash(categoryId, type, difficulty, searchQuery, page, limit);
}

// Single Material Provider
final materialProvider = FutureProvider.family<StudyMaterial, String>(
  (ref, materialId) async {
    final service = ref.watch(studyMaterialsServiceProvider);
    return await service.getMaterialById(materialId);
  },
);

// Bookmarked Materials Provider
final bookmarkedMaterialsProvider =
    FutureProvider<List<StudyMaterial>>((ref) async {
  final service = ref.watch(studyMaterialsServiceProvider);
  return await service.getBookmarkedMaterials();
});

// Recommended Materials Provider
final recommendedMaterialsProvider =
    FutureProvider<List<StudyMaterial>>((ref) async {
  final service = ref.watch(studyMaterialsServiceProvider);
  return await service.getRecommendedMaterials();
});

// Recently Viewed Materials Provider
final recentlyViewedMaterialsProvider =
    FutureProvider<List<StudyMaterial>>((ref) async {
  final service = ref.watch(studyMaterialsServiceProvider);
  return await service.getRecentlyViewed();
});

// Material Progress Provider
final materialProgressProvider =
    FutureProvider.family<MaterialProgress, String>(
  (ref, materialId) async {
    final service = ref.watch(studyMaterialsServiceProvider);
    return await service.getProgress(materialId);
  },
);

// Materials State Notifier
class MaterialsNotifier extends Notifier<List<StudyMaterial>> {
  @override
  List<StudyMaterial> build() {
    return [];
  }

  Future<void> loadMaterials({
    String? categoryId,
    MaterialType? type,
    MaterialDifficulty? difficulty,
    String? searchQuery,
    int page = 1,
  }) async {
    try {
      final service = ref.read(studyMaterialsServiceProvider);
      final materials = await service.getMaterials(
        categoryId: categoryId,
        type: type,
        difficulty: difficulty,
        searchQuery: searchQuery,
        page: page,
      );

      if (page == 1) {
        state = materials;
      } else {
        state = [...state, ...materials];
      }
    } catch (e) {
      // Handle error
    }
  }

  Future<void> toggleBookmark(String materialId) async {
    try {
      final service = ref.read(studyMaterialsServiceProvider);
      await service.toggleBookmark(materialId);

      // Update local state
      state = state.map((m) {
        if (m.id == materialId) {
          return m.copyWith(isBookmarked: !m.isBookmarked);
        }
        return m;
      }).toList();

      // Invalidate bookmarks list
      ref.invalidate(bookmarkedMaterialsProvider);
    } catch (e) {
      rethrow;
    }
  }
}

final materialsNotifierProvider =
    NotifierProvider<MaterialsNotifier, List<StudyMaterial>>(
  () => MaterialsNotifier(),
);
