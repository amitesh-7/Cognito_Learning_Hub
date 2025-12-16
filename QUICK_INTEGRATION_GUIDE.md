# Quick Integration Guide: Dashboard Setup

## Adding Navigation to Dashboard

### Option 1: Quick Access Cards

Add these to your `dashboard_screen.dart`:

```dart
// In the dashboard body
GridView.count(
  crossAxisCount: 2,
  padding: EdgeInsets.all(16),
  children: [
    // AI Study Buddy
    _buildFeatureCard(
      icon: Icons.psychology,
      title: 'AI Study Buddy',
      description: 'Get personalized help',
      color: AppTheme.primaryColor,
      onTap: () => context.push(AppRoutes.studyBuddy),
    ),

    // Study Goals
    _buildFeatureCard(
      icon: Icons.flag,
      title: 'Study Goals',
      description: 'Track your progress',
      color: AppTheme.successColor,
      onTap: () => context.push(AppRoutes.studyGoals),
    ),

    // Achievements
    _buildFeatureCard(
      icon: Icons.emoji_events,
      title: 'Achievements',
      description: 'Unlock rewards',
      color: AppTheme.warningColor,
      onTap: () => context.push(AppRoutes.achievements),
    ),

    // Quests
    _buildFeatureCard(
      icon: Icons.map,
      title: 'Quests',
      description: 'Complete challenges',
      color: Colors.purple,
      onTap: () => context.push(AppRoutes.quests),
    ),
  ],
)

Widget _buildFeatureCard({
  required IconData icon,
  required String title,
  required String description,
  required Color color,
  required VoidCallback onTap,
}) {
  return Card(
    child: InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, size: 40, color: color),
            ),
            SizedBox(height: 12),
            Text(
              title,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 4),
            Text(
              description,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    ),
  );
}
```

---

## Option 2: Stats Banner

Add gamification stats at the top of dashboard:

```dart
// Import at top
import '../providers/gamification_provider.dart';
import '../widgets/gamification/streak_indicator.dart';

// In dashboard build method
Consumer(
  builder: (context, ref, child) {
    final statsAsync = ref.watch(userStatsProvider);

    return statsAsync.when(
      data: (stats) => Container(
        margin: EdgeInsets.all(16),
        padding: EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              AppTheme.primaryColor,
              AppTheme.primaryColor.withOpacity(0.7),
            ],
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildStatItem(
              icon: Icons.stars,
              label: 'Points',
              value: '${stats.totalPoints}',
            ),
            _buildStatItem(
              icon: Icons.trending_up,
              label: 'Level',
              value: '${stats.level}',
            ),
            GestureDetector(
              onTap: () => context.push(AppRoutes.achievements),
              child: _buildStatItem(
                icon: Icons.emoji_events,
                label: 'Achievements',
                value: '${stats.achievementsUnlocked}',
              ),
            ),
          ],
        ),
      ),
      loading: () => SizedBox(height: 100),
      error: (_, __) => SizedBox.shrink(),
    );
  },
)

Widget _buildStatItem({
  required IconData icon,
  required String label,
  required String value,
}) {
  return Column(
    children: [
      Icon(icon, color: Colors.white, size: 32),
      SizedBox(height: 8),
      Text(
        value,
        style: TextStyle(
          color: Colors.white,
          fontSize: 24,
          fontWeight: FontWeight.bold,
        ),
      ),
      Text(
        label,
        style: TextStyle(color: Colors.white70, fontSize: 12),
      ),
    ],
  );
}
```

---

## Option 3: Floating Action Menu

Add a speed dial FAB for quick access:

```dart
// Add to Scaffold
floatingActionButton: SpeedDial(
  icon: Icons.add,
  activeIcon: Icons.close,
  backgroundColor: AppTheme.primaryColor,
  overlayColor: Colors.black,
  overlayOpacity: 0.5,
  children: [
    SpeedDialChild(
      child: Icon(Icons.psychology),
      label: 'AI Study Buddy',
      onTap: () => context.push(AppRoutes.studyBuddy),
    ),
    SpeedDialChild(
      child: Icon(Icons.emoji_events),
      label: 'Achievements',
      onTap: () => context.push(AppRoutes.achievements),
    ),
    SpeedDialChild(
      child: Icon(Icons.map),
      label: 'Quests',
      onTap: () => context.push(AppRoutes.quests),
    ),
    SpeedDialChild(
      child: Icon(Icons.bar_chart),
      label: 'Statistics',
      onTap: () => context.push(AppRoutes.stats),
    ),
  ],
),
```

---

## Adding to Bottom Navigation

If you want to add to bottom nav bar:

```dart
// In home_screen.dart or wherever bottom nav is
BottomNavigationBar(
  currentIndex: _currentIndex,
  onTap: (index) {
    setState(() => _currentIndex = index);
    switch (index) {
      case 0:
        context.go(AppRoutes.home);
        break;
      case 1:
        context.go(AppRoutes.quizList);
        break;
      case 2:
        context.go(AppRoutes.achievements); // New!
        break;
      case 3:
        context.go(AppRoutes.profile);
        break;
    }
  },
  items: [
    BottomNavigationBarItem(
      icon: Icon(Icons.home),
      label: 'Home',
    ),
    BottomNavigationBarItem(
      icon: Icon(Icons.quiz),
      label: 'Quizzes',
    ),
    BottomNavigationBarItem(
      icon: Icon(Icons.emoji_events), // New!
      label: 'Achievements',
    ),
    BottomNavigationBarItem(
      icon: Icon(Icons.person),
      label: 'Profile',
    ),
  ],
)
```

---

## Adding to Profile Screen

Add gamification section to profile:

```dart
// In profile_screen.dart
Column(
  children: [
    // Existing profile content...

    Divider(),

    // Gamification Section
    ListTile(
      leading: Icon(Icons.emoji_events, color: AppTheme.primaryColor),
      title: Text('Achievements'),
      subtitle: Text('View your unlocked achievements'),
      trailing: Icon(Icons.chevron_right),
      onTap: () => context.push(AppRoutes.achievements),
    ),

    ListTile(
      leading: Icon(Icons.map, color: Colors.purple),
      title: Text('Quests'),
      subtitle: Text('Complete challenges and earn rewards'),
      trailing: Icon(Icons.chevron_right),
      onTap: () => context.push(AppRoutes.quests),
    ),

    ListTile(
      leading: Icon(Icons.bar_chart, color: AppTheme.successColor),
      title: Text('Statistics'),
      subtitle: Text('View your learning stats'),
      trailing: Icon(Icons.chevron_right),
      onTap: () => context.push(AppRoutes.stats),
    ),

    ListTile(
      leading: Icon(Icons.psychology, color: AppTheme.primaryColor),
      title: Text('AI Study Buddy'),
      subtitle: Text('Get personalized help'),
      trailing: Icon(Icons.chevron_right),
      onTap: () => context.push(AppRoutes.studyBuddy),
    ),
  ],
)
```

---

## Showing Modals After Events

### After Quiz Completion

```dart
// In quiz_result_screen.dart
void _checkLevelUp() async {
  // Get updated user stats
  final stats = await ref.read(userStatsProvider.notifier).refresh();

  // Check if leveled up
  if (userLeveledUp) {
    LevelUpModal.show(
      context,
      newLevel: stats.level,
      pointsEarned: pointsEarned,
      reward: 'New Badge Unlocked!',
    );
  }
}
```

### On Streak Milestone

```dart
// After daily quiz completion
void _checkStreakMilestone(int currentStreak) {
  if (currentStreak > 0 && currentStreak % 7 == 0) {
    StreakCelebration.show(
      context,
      streak: currentStreak,
    );
  }
}
```

### On Achievement Unlock

```dart
// After earning achievement
void _showAchievementUnlock(Achievement achievement) {
  AchievementUnlockAnimation.show(
    context,
    achievement: achievement,
    onComplete: () {
      // Refresh achievements list
      ref.read(achievementsProvider.notifier).refresh();
    },
  );
}
```

---

## Example: Complete Dashboard Integration

Here's a complete example dashboard implementation:

```dart
// lib/screens/home/dashboard_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/routes.dart';
import '../../config/theme.dart';
import '../../providers/gamification_provider.dart';
import '../../widgets/gamification/streak_indicator.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(userStatsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.bar_chart),
            onPressed: () => context.push(AppRoutes.stats),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Stats Banner
            statsAsync.when(
              data: (stats) => _buildStatsBanner(context, stats),
              loading: () => const SizedBox(height: 100),
              error: (_, __) => const SizedBox.shrink(),
            ),

            const SizedBox(height: 24),

            // Features Grid
            Text(
              'Features',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),

            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              children: [
                _buildFeatureCard(
                  context,
                  icon: Icons.psychology,
                  title: 'AI Study Buddy',
                  color: AppTheme.primaryColor,
                  onTap: () => context.push(AppRoutes.studyBuddy),
                ),
                _buildFeatureCard(
                  context,
                  icon: Icons.emoji_events,
                  title: 'Achievements',
                  color: AppTheme.warningColor,
                  onTap: () => context.push(AppRoutes.achievements),
                ),
                _buildFeatureCard(
                  context,
                  icon: Icons.map,
                  title: 'Quests',
                  color: Colors.purple,
                  onTap: () => context.push(AppRoutes.quests),
                ),
                _buildFeatureCard(
                  context,
                  icon: Icons.flag,
                  title: 'Goals',
                  color: AppTheme.successColor,
                  onTap: () => context.push(AppRoutes.studyGoals),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsBanner(BuildContext context, dynamic stats) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppTheme.primaryColor,
            AppTheme.primaryColor.withOpacity(0.7),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStatItem(Icons.stars, 'Points', '${stats.totalPoints}'),
              _buildStatItem(Icons.trending_up, 'Level', '${stats.level}'),
              _buildStatItem(Icons.emoji_events, 'Achievements', '${stats.achievementsUnlocked}'),
            ],
          ),
          const SizedBox(height: 16),
          StreakIndicator(
            currentStreak: stats.streak ?? 0,
            longestStreak: stats.longestStreak ?? 0,
            compact: true,
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(IconData icon, String label, String value) {
    return Column(
      children: [
        Icon(icon, color: Colors.white, size: 28),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: const TextStyle(color: Colors.white70, fontSize: 10),
        ),
      ],
    );
  }

  Widget _buildFeatureCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, size: 40, color: color),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

## Testing the Integration

1. **Hot reload** the app after adding navigation
2. **Tap each card** to verify navigation works
3. **Check back button** functionality
4. **Test stats banner** with real data from backend
5. **Verify modals** appear correctly

---

## Ready to Use! 🚀

All features are now accessible. Choose the integration style that best fits your app's design!
