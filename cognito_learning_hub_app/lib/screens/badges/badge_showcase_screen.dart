// lib/screens/badges/badge_showcase_screen.dart

import 'package:flutter/material.dart' hide Badge;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/badge.dart';
import '../../providers/badges_provider.dart';
import '../../providers/auth_provider.dart';

class BadgeShowcaseScreen extends ConsumerStatefulWidget {
  final String? userId;

  const BadgeShowcaseScreen({super.key, this.userId});

  @override
  ConsumerState<BadgeShowcaseScreen> createState() =>
      _BadgeShowcaseScreenState();
}

class _BadgeShowcaseScreenState extends ConsumerState<BadgeShowcaseScreen>
    with SingleTickerProviderStateMixin {
  BadgeRarity? _selectedRarity;
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

  String get _userId {
    return widget.userId ?? ref.read(authProvider).user?.id ?? '';
  }

  @override
  Widget build(BuildContext context) {
    final badgesAsync = ref.watch(userBadgesProvider(_userId));
    final showcaseAsync = ref.watch(showcaseBadgesProvider(_userId));
    final pendingTradesAsync = ref.watch(pendingTradesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Badge Collection'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterDialog,
          ),
          IconButton(
            icon: const Icon(Icons.info_outline),
            onPressed: _showInfoDialog,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Collection'),
            Tab(text: 'Showcase'),
            Tab(text: 'Trades'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Collection Tab
          badgesAsync.when(
            data: (collection) => _buildCollectionTab(collection),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, stack) => _buildErrorState(error.toString()),
          ),

          // Showcase Tab
          showcaseAsync.when(
            data: (badges) => _buildShowcaseTab(badges),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, stack) => _buildErrorState(error.toString()),
          ),

          // Trades Tab
          pendingTradesAsync.when(
            data: (trades) => _buildTradesTab(trades),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, stack) => _buildErrorState(error.toString()),
          ),
        ],
      ),
    );
  }

  Widget _buildCollectionTab(BadgeCollection collection) {
    final filteredBadges = _selectedRarity != null
        ? collection.badges.where((b) => b.rarity == _selectedRarity).toList()
        : collection.badges;

    return Column(
      children: [
        // Stats Summary
        Container(
          padding: const EdgeInsets.all(16),
          color: Theme.of(context).primaryColor.withOpacity(0.1),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _StatsItem(
                    label: 'Total Badges',
                    value: collection.totalBadges.toString(),
                    icon: Icons.workspace_premium,
                  ),
                  _StatsItem(
                    label: 'Total Points',
                    value: collection.totalPoints.toString(),
                    icon: Icons.stars,
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _RarityBreakdown(collection: collection),
            ],
          ),
        ),

        // Filter Chip
        if (_selectedRarity != null)
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: FilterChip(
              label: Text(_selectedRarity!.name.toUpperCase()),
              selected: true,
              onSelected: (bool value) {},
              onDeleted: () => setState(() => _selectedRarity = null),
            ),
          ),

        // Badges Grid
        Expanded(
          child: filteredBadges.isEmpty
              ? _buildEmptyState('No badges found')
              : GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.8,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                  ),
                  itemCount: filteredBadges.length,
                  itemBuilder: (context, index) => _BadgeCard(
                    badge: filteredBadges[index],
                    onTap: () => _showBadgeDetail(filteredBadges[index]),
                  ),
                ),
        ),
      ],
    );
  }

  Widget _buildShowcaseTab(List<Badge> showcaseBadges) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Your Showcase',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Select up to 6 badges to display on your profile',
                style: TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: _editShowcase,
                icon: const Icon(Icons.edit),
                label: const Text('Edit Showcase'),
              ),
            ],
          ),
        ),

        // Showcase Grid
        Expanded(
          child: showcaseBadges.isEmpty
              ? _buildEmptyState('No badges in showcase')
              : GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 3,
                    childAspectRatio: 0.9,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                  ),
                  itemCount: showcaseBadges.length,
                  itemBuilder: (context, index) => _ShowcaseBadgeCard(
                    badge: showcaseBadges[index],
                    onTap: () => _showBadgeDetail(showcaseBadges[index]),
                  ),
                ),
        ),
      ],
    );
  }

  Widget _buildTradesTab(List<BadgeTrade> trades) {
    if (trades.isEmpty) {
      return _buildEmptyState('No pending trades');
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: trades.length,
      itemBuilder: (context, index) => _TradeCard(
        trade: trades[index],
        onAccept: () => _acceptTrade(trades[index].id),
        onReject: () => _rejectTrade(trades[index].id),
      ),
    );
  }

  Widget _buildEmptyState(String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.workspace_premium, size: 64, color: Colors.grey),
          const SizedBox(height: 16),
          Text(
            message,
            style: TextStyle(color: Colors.grey, fontSize: 16),
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
          Text('Error: $error'),
        ],
      ),
    );
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Filter by Rarity'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ...BadgeRarity.values.map((rarity) => RadioListTile<BadgeRarity>(
                  title: Row(
                    children: [
                      Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: _getRarityColor(rarity),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(rarity.name.toUpperCase()),
                    ],
                  ),
                  value: rarity,
                  groupValue: _selectedRarity,
                  onChanged: (value) {
                    setState(() => _selectedRarity = value);
                    Navigator.pop(context);
                  },
                )),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              setState(() => _selectedRarity = null);
              Navigator.pop(context);
            },
            child: const Text('Clear'),
          ),
        ],
      ),
    );
  }

  void _showInfoDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Badge Rarities'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: BadgeRarity.values.map((rarity) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 8.0),
                child: Row(
                  children: [
                    Container(
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        color: _getRarityColor(rarity),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: _getRarityColor(rarity).withOpacity(0.5),
                            blurRadius: 4,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      rarity.name.toUpperCase(),
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: _getRarityColor(rarity),
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showBadgeDetail(Badge badge) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (context, scrollController) => _BadgeDetailSheet(
          badge: badge,
          scrollController: scrollController,
        ),
      ),
    );
  }

  void _editShowcase() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const ShowcaseEditorScreen(),
      ),
    );
  }

  Future<void> _acceptTrade(String tradeId) async {
    try {
      await ref.read(badgesServiceProvider).acceptTrade(tradeId);
      ref.invalidate(pendingTradesProvider);
      ref.invalidate(userBadgesProvider(_userId));

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Trade accepted!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to accept trade: $e')),
        );
      }
    }
  }

  Future<void> _rejectTrade(String tradeId) async {
    try {
      await ref.read(badgesServiceProvider).rejectTrade(tradeId);
      ref.invalidate(pendingTradesProvider);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Trade rejected')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to reject trade: $e')),
        );
      }
    }
  }

  Color _getRarityColor(BadgeRarity rarity) {
    switch (rarity) {
      case BadgeRarity.common:
        return Colors.grey;
      case BadgeRarity.uncommon:
        return Colors.green;
      case BadgeRarity.rare:
        return Colors.blue;
      case BadgeRarity.epic:
        return Colors.purple;
      case BadgeRarity.legendary:
        return Colors.orange;
      case BadgeRarity.mythic:
        return Colors.red;
    }
  }
}

// Supporting widgets continue...
class _StatsItem extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _StatsItem({
    required this.label,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            Icon(icon, size: 20),
            const SizedBox(width: 4),
            Text(
              value,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        Text(
          label,
          style: TextStyle(
            color: Colors.grey[600],
            fontSize: 12,
          ),
        ),
      ],
    );
  }
}

class _RarityBreakdown extends StatelessWidget {
  final BadgeCollection collection;

  const _RarityBreakdown({required this.collection});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        _RarityCount(
          rarity: BadgeRarity.common,
          count: collection.commonCount,
        ),
        _RarityCount(
          rarity: BadgeRarity.uncommon,
          count: collection.uncommonCount,
        ),
        _RarityCount(
          rarity: BadgeRarity.rare,
          count: collection.rareCount,
        ),
        _RarityCount(
          rarity: BadgeRarity.epic,
          count: collection.epicCount,
        ),
        _RarityCount(
          rarity: BadgeRarity.legendary,
          count: collection.legendaryCount,
        ),
        _RarityCount(
          rarity: BadgeRarity.mythic,
          count: collection.mythicCount,
        ),
      ],
    );
  }
}

class _RarityCount extends StatelessWidget {
  final BadgeRarity rarity;
  final int count;

  const _RarityCount({
    required this.rarity,
    required this.count,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            color: _getRarityColor(rarity),
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              count.toString(),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          rarity.name[0].toUpperCase(),
          style: const TextStyle(fontSize: 10),
        ),
      ],
    );
  }

  Color _getRarityColor(BadgeRarity rarity) {
    switch (rarity) {
      case BadgeRarity.common:
        return Colors.grey;
      case BadgeRarity.uncommon:
        return Colors.green;
      case BadgeRarity.rare:
        return Colors.blue;
      case BadgeRarity.epic:
        return Colors.purple;
      case BadgeRarity.legendary:
        return Colors.orange;
      case BadgeRarity.mythic:
        return Colors.red;
    }
  }
}

class _BadgeCard extends StatelessWidget {
  final Badge badge;
  final VoidCallback onTap;

  const _BadgeCard({
    required this.badge,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      elevation: 4,
      child: InkWell(
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                _getRarityColor(badge.rarity).withOpacity(0.2),
                _getRarityColor(badge.rarity).withOpacity(0.05),
              ],
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Badge Image with Glow
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: _getRarityColor(badge.rarity).withOpacity(0.5),
                      blurRadius: 20,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: ClipOval(
                  child: Image.network(
                    badge.imageUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Icon(
                      Icons.workspace_premium,
                      size: 40,
                      color: _getRarityColor(badge.rarity),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Title
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8.0),
                child: Text(
                  badge.title,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(height: 4),

              // Rarity Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: _getRarityColor(badge.rarity),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  badge.rarityLabel,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),

              // Points
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.stars, size: 14, color: Colors.amber),
                  const SizedBox(width: 4),
                  Text(
                    '${badge.pointsValue} pts',
                    style: const TextStyle(fontSize: 12),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getRarityColor(BadgeRarity rarity) {
    switch (rarity) {
      case BadgeRarity.common:
        return Colors.grey;
      case BadgeRarity.uncommon:
        return Colors.green;
      case BadgeRarity.rare:
        return Colors.blue;
      case BadgeRarity.epic:
        return Colors.purple;
      case BadgeRarity.legendary:
        return Colors.orange;
      case BadgeRarity.mythic:
        return Colors.red;
    }
  }
}

class _ShowcaseBadgeCard extends StatelessWidget {
  final Badge badge;
  final VoidCallback onTap;

  const _ShowcaseBadgeCard({
    required this.badge,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              _getRarityColor(badge.rarity).withOpacity(0.3),
              _getRarityColor(badge.rarity).withOpacity(0.1),
            ],
          ),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: _getRarityColor(badge.rarity),
            width: 2,
          ),
          boxShadow: [
            BoxShadow(
              color: _getRarityColor(badge.rarity).withOpacity(0.3),
              blurRadius: 10,
              spreadRadius: 1,
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.network(
              badge.imageUrl,
              width: 60,
              height: 60,
              errorBuilder: (_, __, ___) => Icon(
                Icons.workspace_premium,
                size: 60,
                color: _getRarityColor(badge.rarity),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              badge.title,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Color _getRarityColor(BadgeRarity rarity) {
    switch (rarity) {
      case BadgeRarity.common:
        return Colors.grey;
      case BadgeRarity.uncommon:
        return Colors.green;
      case BadgeRarity.rare:
        return Colors.blue;
      case BadgeRarity.epic:
        return Colors.purple;
      case BadgeRarity.legendary:
        return Colors.orange;
      case BadgeRarity.mythic:
        return Colors.red;
    }
  }
}

class _TradeCard extends StatelessWidget {
  final BadgeTrade trade;
  final VoidCallback onAccept;
  final VoidCallback onReject;

  const _TradeCard({
    required this.trade,
    required this.onAccept,
    required this.onReject,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  child: Text(trade.fromUserName[0].toUpperCase()),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        trade.fromUserName,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const Text(
                        'wants to trade',
                        style: TextStyle(color: Colors.grey, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Badge Info
            Row(
              children: [
                Image.network(
                  trade.badge.imageUrl,
                  width: 50,
                  height: 50,
                  errorBuilder: (_, __, ___) => const Icon(
                    Icons.workspace_premium,
                    size: 50,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        trade.badge.title,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: _getRarityColor(trade.badge.rarity),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          trade.badge.rarityLabel,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            if (trade.message != null) ...[
              const SizedBox(height: 12),
              Text(
                trade.message!,
                style: TextStyle(
                  color: Colors.grey[700],
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],

            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: onAccept,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                    ),
                    child: const Text('Accept'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton(
                    onPressed: onReject,
                    child: const Text('Reject'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Color _getRarityColor(BadgeRarity rarity) {
    switch (rarity) {
      case BadgeRarity.common:
        return Colors.grey;
      case BadgeRarity.uncommon:
        return Colors.green;
      case BadgeRarity.rare:
        return Colors.blue;
      case BadgeRarity.epic:
        return Colors.purple;
      case BadgeRarity.legendary:
        return Colors.orange;
      case BadgeRarity.mythic:
        return Colors.red;
    }
  }
}

class _BadgeDetailSheet extends StatelessWidget {
  final Badge badge;
  final ScrollController scrollController;

  const _BadgeDetailSheet({
    required this.badge,
    required this.scrollController,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: ListView(
        controller: scrollController,
        padding: const EdgeInsets.all(24),
        children: [
          Center(
            child: Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: _getRarityColor(badge.rarity).withOpacity(0.5),
                    blurRadius: 30,
                    spreadRadius: 5,
                  ),
                ],
              ),
              child: ClipOval(
                child: Image.network(
                  badge.imageUrl,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Icon(
                    Icons.workspace_premium,
                    size: 60,
                    color: _getRarityColor(badge.rarity),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Title
          Text(
            badge.title,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),

          // Description
          Text(
            badge.description,
            style: TextStyle(color: Colors.grey[700]),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),

          // Stats
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: _getRarityColor(badge.rarity),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(
                      badge.rarityLabel,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text('Rarity', style: TextStyle(fontSize: 12)),
                ],
              ),
              Column(
                children: [
                  Row(
                    children: [
                      const Icon(Icons.stars, color: Colors.amber),
                      const SizedBox(width: 4),
                      Text(
                        '${badge.pointsValue}',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const Text('Points', style: TextStyle(fontSize: 12)),
                ],
              ),
              Column(
                children: [
                  Text(
                    '${badge.totalOwners}',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Text('Owners', style: TextStyle(fontSize: 12)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Effects
          if (badge.effects.isNotEmpty) ...[
            const Text(
              'Effects',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            ...badge.effects.map((effect) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4.0),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle,
                          size: 16, color: Colors.green),
                      const SizedBox(width: 8),
                      Expanded(child: Text(effect)),
                    ],
                  ),
                )),
            const SizedBox(height: 24),
          ],

          // Collection Date
          if (badge.isCollected && badge.collectedAt != null) ...[
            const Text(
              'Collected',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '${badge.collectedAt!.day}/${badge.collectedAt!.month}/${badge.collectedAt!.year}',
              style: TextStyle(color: Colors.grey[700]),
            ),
          ],
        ],
      ),
    );
  }

  Color _getRarityColor(BadgeRarity rarity) {
    switch (rarity) {
      case BadgeRarity.common:
        return Colors.grey;
      case BadgeRarity.uncommon:
        return Colors.green;
      case BadgeRarity.rare:
        return Colors.blue;
      case BadgeRarity.epic:
        return Colors.purple;
      case BadgeRarity.legendary:
        return Colors.orange;
      case BadgeRarity.mythic:
        return Colors.red;
    }
  }
}

// Showcase Editor Screen (simplified placeholder)
class ShowcaseEditorScreen extends StatelessWidget {
  const ShowcaseEditorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Showcase'),
        actions: [
          IconButton(
            icon: const Icon(Icons.save),
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
      body: const Center(
        child: Text('Showcase Editor Coming Soon'),
      ),
    );
  }
}
