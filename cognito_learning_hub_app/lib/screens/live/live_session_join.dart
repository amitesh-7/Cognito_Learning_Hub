// lib/screens/live/live_session_join.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';
import '../../widgets/common/app_button.dart';
import '../../widgets/common/app_input.dart';

class LiveSessionJoin extends ConsumerStatefulWidget {
  const LiveSessionJoin({super.key});

  @override
  ConsumerState<LiveSessionJoin> createState() => _LiveSessionJoinState();
}

class _LiveSessionJoinState extends ConsumerState<LiveSessionJoin> {
  final _codeController = TextEditingController();
  bool _isJoining = false;

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Join Live Session')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Header
            const Icon(
              Icons.live_tv,
              size: 64,
              color: AppTheme.primaryColor,
            ).animate().fadeIn().scale(),

            const SizedBox(height: 16),

            Text(
              'Join a Live Quiz',
              style: Theme.of(
                context,
              ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
            ).animate().fadeIn(delay: 100.ms),

            const SizedBox(height: 8),

            Text(
              'Enter the session code or scan the QR code',
              style: TextStyle(color: Colors.grey.shade600),
              textAlign: TextAlign.center,
            ).animate().fadeIn(delay: 200.ms),

            const SizedBox(height: 32),

            // Code Input
            Card(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    AppInput(
                      controller: _codeController,
                      label: 'Session Code',
                      hint: 'Enter 6-digit code',
                      prefixIcon: Icons.tag,
                      keyboardType: TextInputType.text,
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: GradientButton(
                        text: 'Join Session',
                        isLoading: _isJoining,
                        onPressed: _codeController.text.isEmpty
                            ? null
                            : () => _joinSession(),
                      ),
                    ),
                  ],
                ),
              ),
            ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.2),

            const SizedBox(height: 24),

            // Divider
            Row(
              children: [
                Expanded(child: Divider(color: Colors.grey.shade300)),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Text(
                    'OR',
                    style: TextStyle(color: Colors.grey.shade500),
                  ),
                ),
                Expanded(child: Divider(color: Colors.grey.shade300)),
              ],
            ),

            const SizedBox(height: 24),

            // QR Scanner
            Card(
              child: InkWell(
                onTap: () => _showScanner(),
                borderRadius: BorderRadius.circular(16),
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor.withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.qr_code_scanner,
                          size: 48,
                          color: AppTheme.primaryColor,
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Scan QR Code',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Point your camera at the QR code',
                        style: TextStyle(color: Colors.grey.shade600),
                      ),
                    ],
                  ),
                ),
              ),
            ).animate().fadeIn(delay: 400.ms).slideY(begin: 0.2),

            const SizedBox(height: 32),

            // Recent Sessions
            if (_getRecentSessions().isNotEmpty) ...[
              const Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Recent Sessions',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 16),
              ..._getRecentSessions().map(
                (session) => ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: AppTheme.primaryColor,
                    child: Icon(Icons.history, color: Colors.white),
                  ),
                  title: Text(session['title']),
                  subtitle: Text(session['code']),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () {
                    _codeController.text = session['code'];
                    _joinSession();
                  },
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showScanner() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => SizedBox(
        height: MediaQuery.of(context).size.height * 0.7,
        child: Column(
          children: [
            AppBar(
              title: const Text('Scan QR Code'),
              leading: IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context),
              ),
            ),
            Expanded(
              child: MobileScanner(
                onDetect: (capture) {
                  final barcodes = capture.barcodes;
                  for (final barcode in barcodes) {
                    if (barcode.rawValue != null) {
                      Navigator.pop(context);
                      _handleScannedCode(barcode.rawValue!);
                      break;
                    }
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleScannedCode(String code) {
    // Parse the code from QR (format: cognito://join/CODE)
    final uri = Uri.tryParse(code);
    if (uri != null && uri.pathSegments.isNotEmpty) {
      _codeController.text = uri.pathSegments.last;
    } else {
      _codeController.text = code;
    }
    _joinSession();
  }

  Future<void> _joinSession() async {
    if (_codeController.text.isEmpty) return;

    setState(() => _isJoining = true);

    try {
      // TODO: Implement actual join logic with socket
      await Future.delayed(const Duration(seconds: 2));

      if (mounted) {
        // Navigate to live session screen
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Joined session successfully!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Failed to join: $e')));
      }
    } finally {
      if (mounted) {
        setState(() => _isJoining = false);
      }
    }
  }

  List<Map<String, dynamic>> _getRecentSessions() {
    // TODO: Get from local storage
    return [];
  }
}
