// lib/screens/avatar/avatar_customization_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../providers/avatar_provider.dart';
import '../../config/theme.dart';
import '../../widgets/avatar/avatar_preview.dart';

class AvatarCustomizationScreen extends ConsumerStatefulWidget {
  const AvatarCustomizationScreen({super.key});

  @override
  ConsumerState<AvatarCustomizationScreen> createState() =>
      _AvatarCustomizationScreenState();
}

class _AvatarCustomizationScreenState
    extends ConsumerState<AvatarCustomizationScreen> {
  String _selectedCategory = 'skinTone';
  bool _isSaving = false;

  final Map<String, Map<String, dynamic>> _categories = {
    'skinTone': {
      'icon': Icons.face,
      'label': 'Skin',
      'options': ['light', 'medium', 'tan', 'dark', 'pale'],
    },
    'hairStyle': {
      'icon': Icons.accessibility_new,
      'label': 'Hair',
      'options': ['short', 'long', 'curly', 'bald', 'ponytail', 'buzz'],
    },
    'hairColor': {
      'icon': Icons.palette,
      'label': 'Hair Color',
      'options': ['black', 'brown', 'blonde', 'red', 'blue', 'pink', 'purple'],
    },
    'eyeType': {
      'icon': Icons.remove_red_eye,
      'label': 'Eyes',
      'options': ['normal', 'happy', 'surprised', 'sleepy', 'wink'],
    },
    'eyeColor': {
      'icon': Icons.colorize,
      'label': 'Eye Color',
      'options': ['brown', 'blue', 'green', 'hazel', 'gray'],
    },
    'mouthType': {
      'icon': Icons.sentiment_satisfied,
      'label': 'Mouth',
      'options': ['smile', 'grin', 'neutral', 'laugh', 'smirk'],
    },
    'clothingType': {
      'icon': Icons.checkroom,
      'label': 'Clothing',
      'options': ['casual', 'formal', 'sports', 'hoodie', 'tshirt'],
    },
    'clothingColor': {
      'icon': Icons.color_lens,
      'label': 'Clothing Color',
      'options': ['red', 'blue', 'green', 'black', 'white', 'yellow', 'purple'],
    },
    'accessory': {
      'icon': Icons.shopping_bag,
      'label': 'Accessory',
      'options': ['none', 'glasses', 'hat', 'earrings', 'necklace', 'watch'],
    },
    'background': {
      'icon': Icons.wallpaper,
      'label': 'Background',
      'options': ['gradient1', 'gradient2', 'solid', 'pattern1', 'pattern2'],
    },
  };

  @override
  Widget build(BuildContext context) {
    final customization = ref.watch(avatarCustomizationProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Customize Avatar'),
        actions: [
          IconButton(
            icon: const Icon(Icons.shuffle),
            onPressed: () {
              ref.read(avatarCustomizationProvider.notifier).randomize();
            },
            tooltip: 'Randomize',
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              ref.read(avatarCustomizationProvider.notifier).reset();
            },
            tooltip: 'Reset',
          ),
        ],
      ),
      body: Column(
        children: [
          // Avatar Preview
          Expanded(
            flex: 2,
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppTheme.primaryColor.withValues(alpha: 0.1),
                    AppTheme.secondaryColor.withValues(alpha: 0.1),
                  ],
                ),
              ),
              child: Center(
                child: AvatarPreview(
                  components: customization,
                  size: 200,
                ).animate().scale(duration: 300.ms),
              ),
            ),
          ),

          // Category Tabs
          Container(
            height: 80,
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final category = _categories.keys.elementAt(index);
                final categoryData = _categories[category]!;
                final isSelected = _selectedCategory == category;

                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: InkWell(
                    onTap: () {
                      setState(() => _selectedCategory = category);
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      width: 64,
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppTheme.primaryColor
                            : Colors.grey.shade200,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            categoryData['icon'] as IconData,
                            color: isSelected
                                ? Colors.white
                                : Colors.grey.shade700,
                            size: 28,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            categoryData['label'] as String,
                            style: TextStyle(
                              fontSize: 10,
                              color: isSelected
                                  ? Colors.white
                                  : Colors.grey.shade700,
                              fontWeight: isSelected
                                  ? FontWeight.bold
                                  : FontWeight.normal,
                            ),
                            textAlign: TextAlign.center,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ).animate(delay: (index * 50).ms).fadeIn().slideX(),
                );
              },
            ),
          ),

          // Options Grid
          Expanded(
            flex: 2,
            child: Container(
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(24),
                  topRight: Radius.circular(24),
                ),
              ),
              child: Column(
                children: [
                  const SizedBox(height: 16),
                  Text(
                    'Select ${_categories[_selectedCategory]!['label']}',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Expanded(
                    child: GridView.builder(
                      padding: const EdgeInsets.all(16),
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 4,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 1,
                      ),
                      itemCount: (_categories[_selectedCategory]!['options']
                              as List<String>)
                          .length,
                      itemBuilder: (context, index) {
                        final option =
                            (_categories[_selectedCategory]!['options']
                                as List<String>)[index];
                        final currentValue = _getCurrentValue(customization);
                        final isSelected = currentValue == option;

                        return InkWell(
                          onTap: () {
                            ref
                                .read(avatarCustomizationProvider.notifier)
                                .updateComponent(_selectedCategory, option);
                          },
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? AppTheme.primaryColor
                                  : Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isSelected
                                    ? AppTheme.primaryColor
                                    : Colors.grey.shade300,
                                width: isSelected ? 3 : 1,
                              ),
                              boxShadow: isSelected
                                  ? [
                                      BoxShadow(
                                        color: AppTheme.primaryColor
                                            .withValues(alpha: 0.3),
                                        blurRadius: 8,
                                        offset: const Offset(0, 4),
                                      ),
                                    ]
                                  : null,
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                _buildOptionIcon(option, isSelected),
                                const SizedBox(height: 4),
                                Text(
                                  option[0].toUpperCase() + option.substring(1),
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: isSelected
                                        ? Colors.white
                                        : Colors.black87,
                                    fontWeight: isSelected
                                        ? FontWeight.bold
                                        : FontWeight.normal,
                                  ),
                                  textAlign: TextAlign.center,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                        )
                            .animate(delay: (index * 30).ms)
                            .fadeIn()
                            .scale(begin: const Offset(0.8, 0.8));
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Save Button
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.shade300,
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              child: SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isSaving ? null : _saveAvatar,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isSaving
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Text(
                          'Save Avatar',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _getCurrentValue(dynamic customization) {
    switch (_selectedCategory) {
      case 'skinTone':
        return customization.skinTone;
      case 'hairStyle':
        return customization.hairStyle;
      case 'hairColor':
        return customization.hairColor;
      case 'eyeType':
        return customization.eyeType;
      case 'eyeColor':
        return customization.eyeColor;
      case 'mouthType':
        return customization.mouthType;
      case 'clothingType':
        return customization.clothingType;
      case 'clothingColor':
        return customization.clothingColor;
      case 'accessory':
        return customization.accessory;
      case 'background':
        return customization.background;
      default:
        return '';
    }
  }

  Widget _buildOptionIcon(String option, bool isSelected) {
    final color = isSelected ? Colors.white : AppTheme.primaryColor;

    // Return color preview for color options
    if (_selectedCategory.contains('Color')) {
      return Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: _getColorFromName(option),
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 2),
        ),
      );
    }

    // Return icon for other options
    return Icon(
      Icons.check_circle,
      color: color,
      size: 32,
    );
  }

  Color _getColorFromName(String colorName) {
    switch (colorName.toLowerCase()) {
      case 'red':
        return Colors.red;
      case 'blue':
        return Colors.blue;
      case 'green':
        return Colors.green;
      case 'yellow':
        return Colors.yellow;
      case 'purple':
        return Colors.purple;
      case 'pink':
        return Colors.pink;
      case 'black':
        return Colors.black;
      case 'white':
        return Colors.white;
      case 'brown':
        return Colors.brown;
      case 'blonde':
        return Colors.amber;
      case 'gray':
        return Colors.grey;
      case 'hazel':
        return Colors.brown.shade300;
      case 'pale':
        return Colors.pink.shade50;
      case 'light':
        return Colors.orange.shade100;
      case 'medium':
        return Colors.orange.shade300;
      case 'tan':
        return Colors.orange.shade400;
      case 'dark':
        return Colors.brown.shade700;
      default:
        return AppTheme.primaryColor;
    }
  }

  Future<void> _saveAvatar() async {
    setState(() => _isSaving = true);

    try {
      final customization = ref.read(avatarCustomizationProvider);
      await ref
          .read(currentAvatarProvider.notifier)
          .updateAvatar(customization);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Avatar saved successfully!'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to save avatar: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }
}
