// lib/widgets/avatar/avatar_preview.dart

import 'package:flutter/material.dart';
import '../../models/avatar.dart';

class AvatarPreview extends StatelessWidget {
  final AvatarComponents components;
  final double size;

  const AvatarPreview({
    super.key,
    required this.components,
    this.size = 100,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: _getBackgroundColor(),
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 4),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.2),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ClipOval(
        child: Stack(
          children: [
            // Background
            Container(
              color: _getBackgroundColor(),
            ),

            // Skin (face)
            Center(
              child: Container(
                width: size * 0.8,
                height: size * 0.8,
                decoration: BoxDecoration(
                  color: _getSkinColor(),
                  shape: BoxShape.circle,
                ),
              ),
            ),

            // Hair (back layer)
            if (components.hairStyle != 'bald')
              Positioned(
                top: size * 0.05,
                left: size * 0.1,
                right: size * 0.1,
                child: _buildHair(),
              ),

            // Eyes
            Positioned(
              top: size * 0.35,
              left: size * 0.25,
              child: _buildEye(),
            ),
            Positioned(
              top: size * 0.35,
              right: size * 0.25,
              child: _buildEye(),
            ),

            // Mouth
            Positioned(
              bottom: size * 0.3,
              left: 0,
              right: 0,
              child: _buildMouth(),
            ),

            // Accessory
            if (components.accessory != 'none') _buildAccessory(),

            // Clothing (bottom)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: _buildClothing(),
            ),
          ],
        ),
      ),
    );
  }

  Color _getBackgroundColor() {
    switch (components.background) {
      case 'gradient1':
        return Colors.blue.shade100;
      case 'gradient2':
        return Colors.purple.shade100;
      case 'solid':
        return Colors.grey.shade200;
      case 'pattern1':
        return Colors.teal.shade100;
      case 'pattern2':
        return Colors.pink.shade100;
      default:
        return Colors.blue.shade100;
    }
  }

  Color _getSkinColor() {
    switch (components.skinTone) {
      case 'pale':
        return const Color(0xFFFFF0DC);
      case 'light':
        return const Color(0xFFFFE0BD);
      case 'medium':
        return const Color(0xFFE0AC69);
      case 'tan':
        return const Color(0xFFC68642);
      case 'dark':
        return const Color(0xFF8D5524);
      default:
        return const Color(0xFFFFE0BD);
    }
  }

  Color _getHairColor() {
    switch (components.hairColor) {
      case 'black':
        return Colors.black87;
      case 'brown':
        return Colors.brown;
      case 'blonde':
        return Colors.amber.shade700;
      case 'red':
        return Colors.red.shade700;
      case 'blue':
        return Colors.blue;
      case 'pink':
        return Colors.pink;
      case 'purple':
        return Colors.purple;
      default:
        return Colors.brown;
    }
  }

  Color _getEyeColor() {
    switch (components.eyeColor) {
      case 'brown':
        return Colors.brown;
      case 'blue':
        return Colors.blue;
      case 'green':
        return Colors.green;
      case 'hazel':
        return Colors.brown.shade300;
      case 'gray':
        return Colors.grey;
      default:
        return Colors.brown;
    }
  }

  Color _getClothingColor() {
    switch (components.clothingColor) {
      case 'red':
        return Colors.red;
      case 'blue':
        return Colors.blue;
      case 'green':
        return Colors.green;
      case 'black':
        return Colors.black87;
      case 'white':
        return Colors.white;
      case 'yellow':
        return Colors.yellow.shade700;
      case 'purple':
        return Colors.purple;
      default:
        return Colors.blue;
    }
  }

  Widget _buildHair() {
    return Container(
      height: size * 0.3,
      decoration: BoxDecoration(
        color: _getHairColor(),
        borderRadius: BorderRadius.circular(size * 0.3),
      ),
    );
  }

  Widget _buildEye() {
    return Container(
      width: size * 0.12,
      height: size * 0.12,
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Container(
          width: size * 0.08,
          height: size * 0.08,
          decoration: BoxDecoration(
            color: _getEyeColor(),
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Container(
              width: size * 0.04,
              height: size * 0.04,
              decoration: const BoxDecoration(
                color: Colors.black,
                shape: BoxShape.circle,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMouth() {
    return Center(
      child: Container(
        width: size * 0.3,
        height: size * 0.08,
        decoration: BoxDecoration(
          color: Colors.pink.shade200,
          borderRadius: BorderRadius.circular(size * 0.04),
        ),
      ),
    );
  }

  Widget _buildClothing() {
    return Container(
      height: size * 0.3,
      decoration: BoxDecoration(
        color: _getClothingColor(),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(size),
          bottomRight: Radius.circular(size),
        ),
      ),
    );
  }

  Widget _buildAccessory() {
    switch (components.accessory) {
      case 'glasses':
        return Positioned(
          top: size * 0.35,
          left: size * 0.2,
          right: size * 0.2,
          child: Container(
            height: size * 0.15,
            decoration: BoxDecoration(
              border: Border.all(color: Colors.black87, width: 2),
              borderRadius: BorderRadius.circular(size * 0.1),
            ),
          ),
        );
      case 'hat':
        return Positioned(
          top: 0,
          left: size * 0.1,
          right: size * 0.1,
          child: Container(
            height: size * 0.15,
            decoration: BoxDecoration(
              color: Colors.black87,
              borderRadius: BorderRadius.circular(size * 0.1),
            ),
          ),
        );
      case 'earrings':
        return Stack(
          children: [
            Positioned(
              top: size * 0.4,
              left: size * 0.05,
              child: Container(
                width: size * 0.08,
                height: size * 0.08,
                decoration: const BoxDecoration(
                  color: Colors.amber,
                  shape: BoxShape.circle,
                ),
              ),
            ),
            Positioned(
              top: size * 0.4,
              right: size * 0.05,
              child: Container(
                width: size * 0.08,
                height: size * 0.08,
                decoration: const BoxDecoration(
                  color: Colors.amber,
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ],
        );
      default:
        return const SizedBox.shrink();
    }
  }
}
