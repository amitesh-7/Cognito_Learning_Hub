// lib/screens/live/live_quiz_lobby_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:share_plus/share_plus.dart';
import '../../config/theme.dart';
import '../../providers/live_session_provider.dart';
import '../../widgets/common/app_button.dart';
import 'live_quiz_play_screen.dart';

class LiveQuizLobbyScreen extends ConsumerStatefulWidget {
  final bool isHost;
  final String? quizId;
  final String? quizTitle;

  const LiveQuizLobbyScreen({
    super.key,
    required this.isHost,
    this.quizId,
    this.quizTitle,
  });

  @override
  ConsumerState<LiveQuizLobbyScreen> createState() => _LiveQuizLobbyScreenState();
}

class _LiveQuizLobbyScreenState extends ConsumerState<LiveQuizLobbyScreen> {
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.isHost && widget.quizId != null) {
      _createSession();
    }
  }

  Future<void> _createSession() async {
    setState(() => _isLoading = true);
    try {
      await ref.read(currentLiveSessionProvider.notifier).createSession(
            quizId: widget.quizId!,
            quizTitle: widget.quizTitle,
          );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error creating session: $e'),
            backgroundColor: Colors.red,
          ),
        );
        Navigator.pop(context);
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _copyCode(String code) {
    Clipboard.setData(ClipboardData(text: code));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Session code copied!'),
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _shareCode(String code, String quizTitle) {
    Share.share(
      'Join my live quiz session!\n\nQuiz: $quizTitle\nCode: $code\n\nOpen Cognito Learning Hub and enter this code to join!',
      subject: 'Join Live Quiz - $quizTitle',
    );
  }

  void _startSession() async {
    try {
      await ref.read(currentLiveSessionProvider.notifier).startSession();
      
      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => const LiveQuizPlayScreen(),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error starting session: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final session = ref.watch(currentLiveSessionProvider);

    if (_isLoading || session == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Preparing Session...'),
        ),
        body: const Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    final participantCount = session.participants.length;

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.isHost ? 'Host Lobby' : 'Waiting Room'),
        actions: [
          if (widget.isHost)
            IconButton(
              icon: const Icon(Icons.settings),
              onPressed: () => _showSettings(),
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Session Code Card
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  gradient: const LinearGradient(
                    colors: [AppTheme.primaryColor, AppTheme.accentColor],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    const Icon(
                      Icons.qr_code_2,
                      size: 48,
                      color: Colors.white,
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Session Code',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.white70,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      session.code,
                      style: const TextStyle(
                        fontSize: 48,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 8,
                        color: Colors.white,
                        fontFamily: 'monospace',
                      ),
                    ).animate().fadeIn().scale(),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        TextButton.icon(
                          onPressed: () => _copyCode(session.code),
                          icon: const Icon(Icons.copy, size: 18, color: Colors.white),
                          label: const Text(
                            'Copy',
                            style: TextStyle(color: Colors.white),
                          ),
                        ),
                        const SizedBox(width: 16),
                        TextButton.icon(
                          onPressed: () => _shareCode(session.code, session.quizTitle),
                          icon: const Icon(Icons.share, size: 18, color: Colors.white),
                          label: const Text(
                            'Share',
                            style: TextStyle(color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ).animate().fadeIn().slideY(begin: 0.2),

            const SizedBox(height: 24),

            // QR Code Card
            if (widget.isHost)
              Card(
                elevation: 2,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      const Text(
                        'Scan to Join',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: QrImageView(
                          data: session.code,
                          version: QrVersions.auto,
                          size: 200,
                        ),
                      ),
                    ],
                  ),
                ),
              ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.2),

            const SizedBox(height: 24),

            // Quiz Info Card
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.quiz, color: AppTheme.primaryColor),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Quiz',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey,
                                ),
                              ),
                              Text(
                                session.quizTitle,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    if (session.quizTopic != null) ...[
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          const Icon(Icons.topic, size: 20, color: Colors.grey),
                          const SizedBox(width: 8),
                          Text(
                            session.quizTopic!,
                            style: const TextStyle(
                              fontSize: 14,
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.2),

            const SizedBox(height: 24),

            // Participants Section
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Padding(
                padding: const EdgeInsets.all(20),
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
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryColor.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            '$participantCount',
                            style: const TextStyle(
                              color: AppTheme.primaryColor,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    if (session.participants.isEmpty)
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.all(20),
                          child: Text(
                            'Waiting for participants to join...',
                            style: TextStyle(color: Colors.grey),
                          ),
                        ),
                      )
                    else
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: session.participants.length,
                        separatorBuilder: (_, __) => const Divider(),
                        itemBuilder: (context, index) {
                          final participant = session.participants[index];
                          return ListTile(
                            contentPadding: EdgeInsets.zero,
                            leading: CircleAvatar(
                              backgroundColor: AppTheme.primaryColor,
                              child: Text(
                                participant.username[0].toUpperCase(),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            title: Text(
                              participant.username,
                              style: const TextStyle(fontWeight: FontWeight.w600),
                            ),
                            trailing: participant.isHost
                                ? Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 8,
                                      vertical: 4,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Colors.amber,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: const Text(
                                      'HOST',
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    ),
                                  )
                                : null,
                          ).animate().fadeIn(delay: (100 * index).ms);
                        },
                      ),
                  ],
                ),
              ),
            ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.2),

            const SizedBox(height: 24),

            // Start/Wait Button
            if (widget.isHost)
              AppButton(
                text: 'Start Quiz',
                onPressed: participantCount >= 1 ? _startSession : null,
                icon: Icons.play_arrow,
              ).animate().fadeIn(delay: 500.ms).scale()
            else
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppTheme.primaryColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: AppTheme.primaryColor.withOpacity(0.3),
                  ),
                ),
                child: Row(
                  children: [
                    const CircularProgressIndicator(strokeWidth: 2),
                    const SizedBox(width: 16),
                    const Expanded(
                      child: Text(
                        'Waiting for host to start the quiz...',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ).animate().fadeIn(delay: 500.ms),
          ],
        ),
      ),
    );
  }

  void _showSettings() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Session Settings',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            ListTile(
              leading: const Icon(Icons.timer),
              title: const Text('Question Timer'),
              subtitle: const Text('30 seconds per question'),
              onTap: () {},
            ),
            ListTile(
              leading: const Icon(Icons.cancel),
              title: const Text('End Session'),
              subtitle: const Text('Close this live session'),
              textColor: Colors.red,
              iconColor: Colors.red,
              onTap: () async {
                Navigator.pop(context);
                await ref.read(currentLiveSessionProvider.notifier).endSession();
                if (mounted) {
                  Navigator.pop(context);
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}
