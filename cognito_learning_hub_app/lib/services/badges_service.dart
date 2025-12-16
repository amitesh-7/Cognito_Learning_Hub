// lib/services/badges_service.dart

import '../models/badge.dart';
import 'api_service.dart';

class BadgesService {
  final _api = ApiService();

  // Get all available badges
  Future<List<Badge>> getAllBadges({
    BadgeRarity? rarity,
    BadgeCategory? category,
  }) async {
    try {
      final Map<String, dynamic> queryParams = {};
      if (rarity != null) queryParams['rarity'] = rarity.name;
      if (category != null) queryParams['category'] = category.name;

      final response = await _api.get(
        '/gamification/badges',
        queryParameters: queryParams,
      );
      return (response.data['badges'] as List)
          .map((badge) => Badge.fromJson(badge))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch badges: $e');
    }
  }

  // Get user's badge collection
  Future<BadgeCollection> getUserBadges(String userId) async {
    try {
      final response = await _api.get('/gamification/badges/user/$userId');
      return BadgeCollection.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to fetch user badges: $e');
    }
  }

  // Get badge by ID
  Future<Badge> getBadgeById(String badgeId) async {
    try {
      final response = await _api.get('/gamification/badges/$badgeId');
      return Badge.fromJson(response.data['badge']);
    } catch (e) {
      throw Exception('Failed to fetch badge: $e');
    }
  }

  // Get user's showcased badges
  Future<List<Badge>> getShowcaseBadges(String userId) async {
    try {
      final response = await _api.get('/gamification/badges/showcase/$userId');
      return (response.data['badges'] as List)
          .map((badge) => Badge.fromJson(badge))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch showcase badges: $e');
    }
  }

  // Update showcased badges
  Future<void> updateShowcase(List<String> badgeIds) async {
    try {
      await _api.put(
        '/gamification/badges/showcase',
        data: {'badgeIds': badgeIds},
      );
    } catch (e) {
      throw Exception('Failed to update showcase: $e');
    }
  }

  // Initiate badge trade
  Future<BadgeTrade> initiateTradeRequest({
    required String badgeId,
    required String toUserId,
    String? message,
  }) async {
    try {
      final response = await _api.post(
        '/gamification/badges/trade',
        data: {
          'badgeId': badgeId,
          'toUserId': toUserId,
          'message': message,
        },
      );
      return BadgeTrade.fromJson(response.data['trade']);
    } catch (e) {
      throw Exception('Failed to initiate trade: $e');
    }
  }

  // Accept trade request
  Future<void> acceptTrade(String tradeId) async {
    try {
      await _api.put('/gamification/badges/trade/$tradeId/accept');
    } catch (e) {
      throw Exception('Failed to accept trade: $e');
    }
  }

  // Reject trade request
  Future<void> rejectTrade(String tradeId) async {
    try {
      await _api.put('/gamification/badges/trade/$tradeId/reject');
    } catch (e) {
      throw Exception('Failed to reject trade: $e');
    }
  }

  // Cancel trade request
  Future<void> cancelTrade(String tradeId) async {
    try {
      await _api.delete('/gamification/badges/trade/$tradeId');
    } catch (e) {
      throw Exception('Failed to cancel trade: $e');
    }
  }

  // Get pending trade requests
  Future<List<BadgeTrade>> getPendingTrades() async {
    try {
      final response = await _api.get('/gamification/badges/trades/pending');
      return (response.data['trades'] as List)
          .map((trade) => BadgeTrade.fromJson(trade))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch pending trades: $e');
    }
  }

  // Get trade history
  Future<List<BadgeTrade>> getTradeHistory() async {
    try {
      final response = await _api.get('/gamification/badges/trades/history');
      return (response.data['trades'] as List)
          .map((trade) => BadgeTrade.fromJson(trade))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch trade history: $e');
    }
  }

  // Gift badge to another user
  Future<void> giftBadge({
    required String badgeId,
    required String toUserId,
    String? message,
  }) async {
    try {
      await _api.post(
        '/gamification/badges/gift',
        data: {
          'badgeId': badgeId,
          'toUserId': toUserId,
          'message': message,
        },
      );
    } catch (e) {
      throw Exception('Failed to gift badge: $e');
    }
  }

  // Get badge statistics
  Future<Map<String, dynamic>> getBadgeStats(String userId) async {
    try {
      final response = await _api.get('/gamification/badges/stats/$userId');
      return response.data;
    } catch (e) {
      throw Exception('Failed to fetch badge stats: $e');
    }
  }
}
