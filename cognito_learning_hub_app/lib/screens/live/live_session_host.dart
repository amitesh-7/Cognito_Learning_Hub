// lib/screens/live/live_session_host.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';
import '../../widgets/common/app_button.dart';

class LiveSessionHost extends ConsumerStatefulWidget {
  final String quizId;

  const LiveSessionHost({super.key, required this.quizId});

  @override
  ConsumerState<LiveSessionHost> createState() => _LiveSessionHostState();
}

class _LiveSessionHostState extends ConsumerState<LiveSessionHost> {
  String _sessionCode = '';
  final List<Map<String, dynamic>> _participants = [];
  bool _isSessionActive = false;

  @override
  void initState() {
    super.initState();
    _generateSessionCode();
  }

  void _generateSessionCode() {
    // Generate a 6-character code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    final random = DateTime.now().millisecondsSinceEpoch;
    _sessionCode = List.generate(
      6,
      (index) => chars[(random + index * 7) % chars.length],
    ).join();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Host Live Session'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => _showSettingsSheet(),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Session Code Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    const Text(
                      'Session Code',
                      style: TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _sessionCode,
                      style: const TextStyle(
                        fontSize: 48,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 8,
                        color: AppTheme.primaryColor,
                      ),
                    ).animate().fadeIn().scale(),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        TextButton.icon(
                          onPressed: () => _copyCode(),
                          icon: const Icon(Icons.copy, size: 18),
                          label: const Text('Copy'),
                        ),
                        TextButton.icon(
                          onPressed: () => _shareCode(),
                          icon: const Icon(Icons.share, size: 18),
                          label: const Text('Share'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ).animate().fadeIn().slideY(begin: 0.2),

            const SizedBox(height: 24),

            // QR Code
            Card(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    const Text(
                      'Scan to Join',
                      style: TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                    const SizedBox(height: 16),
                    QrImageView(
                      data: 'cognito://join/$_sessionCode',
                      version: QrVersions.auto,
                      size: 200,
                      backgroundColor: Colors.white,
                    ),
                  ],
                ),
              ),
            ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.2),

            const SizedBox(height: 24),

            // Participants
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Participants',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryColor.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            '${_participants.length} joined',
                            style: const TextStyle(
                              color: AppTheme.primaryColor,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    if (_participants.isEmpty)
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.all(32),
                          child: Column(
                            children: [
                              Icon(
                                Icons.people_outline,
                                size: 48,
                                color: Colors.grey,
                              ),
                              SizedBox(height: 8),
                              Text(
                                'Waiting for participants...',
                                style: TextStyle(color: Colors.grey),
                              ),
                            ],
                          ),
                        ),
                      )
                    else
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _participants.length,
                        itemBuilder: (context, index) {
                          final participant = _participants[index];
                          return ListTile(
                            leading: CircleAvatar(
                              backgroundColor: AppTheme.primaryColor,
                              child: Text(
                                participant['name'][0].toUpperCase(),
                                style: const TextStyle(color: Colors.white),
                              ),
                            ),
                            title: Text(participant['name']),
                            trailing: const Icon(
                              Icons.check_circle,
                              color: Colors.green,
                            ),
                          );
                        },
                      ),
                  ],
                ),
              ),
            ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.2),

            const SizedBox(height: 32),

            // Start Button
            SizedBox(
              width: double.infinity,
              child: GradientButton(
                text: _isSessionActive ? 'End Session' : 'Start Session',
                onPressed: _participants.isEmpty && !_isSessionActive
                    ? null
                    : () => _toggleSession(),
              ),
            ).animate().fadeIn(delay: 600.ms).slideY(begin: 0.2),
          ],
        ),
      ),
    );
  }

  void _copyCode() {
    // Copy to clipboard
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Session code copied!')));
  }

  void _shareCode() {
    // Share code
  }

  void _showSettingsSheet() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Session Settings',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 24),
            SwitchListTile(
              title: const Text('Allow late join'),
              value: true,
              onChanged: (value) {},
            ),
            SwitchListTile(
              title: const Text('Show leaderboard'),
              value: true,
              onChanged: (value) {},
            ),
            SwitchListTile(
              title: const Text('Randomize questions'),
              value: false,
              onChanged: (value) {},
            ),
          ],
        ),
      ),
    );
  }

  void _toggleSession() {
    setState(() {
      _isSessionActive = !_isSessionActive;
    });
  }
}
