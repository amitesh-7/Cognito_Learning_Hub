// lib/screens/meeting/meeting_room_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../config/theme.dart';

class MeetingRoomScreen extends ConsumerStatefulWidget {
  final String roomId;

  const MeetingRoomScreen({super.key, required this.roomId});

  @override
  ConsumerState<MeetingRoomScreen> createState() => _MeetingRoomScreenState();
}

class _MeetingRoomScreenState extends ConsumerState<MeetingRoomScreen> {
  bool _isMuted = false;
  bool _isVideoOff = false;
  bool _isScreenSharing = false;
  bool _isChatOpen = false;
  final List<Map<String, dynamic>> _participants = [
    {'id': '1', 'name': 'You', 'isMuted': false, 'isVideoOff': false},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Stack(
          children: [
            // Video Grid
            _buildVideoGrid(),

            // Top Bar
            Positioned(top: 0, left: 0, right: 0, child: _buildTopBar()),

            // Bottom Controls
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: _buildBottomControls(),
            ),

            // Chat Sidebar
            if (_isChatOpen)
              Positioned(
                right: 0,
                top: 60,
                bottom: 100,
                width: 300,
                child: _buildChatSidebar(),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildTopBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Colors.black.withValues(alpha: 0.7), Colors.transparent],
        ),
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => _showLeaveDialog(),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Meeting Room',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  'Room ID: ${widget.roomId}',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.7),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.red,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                const Text(
                  'LIVE',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.people, color: Colors.white),
            onPressed: () => _showParticipants(),
          ),
        ],
      ),
    );
  }

  Widget _buildVideoGrid() {
    final participantCount = _participants.length;

    if (participantCount == 1) {
      return _buildVideoTile(_participants[0], isLarge: true);
    }

    return GridView.builder(
      padding: const EdgeInsets.only(top: 60, bottom: 100),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: participantCount <= 4 ? 2 : 3,
        childAspectRatio: 4 / 3,
        mainAxisSpacing: 4,
        crossAxisSpacing: 4,
      ),
      itemCount: participantCount,
      itemBuilder: (context, index) {
        return _buildVideoTile(_participants[index]);
      },
    );
  }

  Widget _buildVideoTile(
    Map<String, dynamic> participant, {
    bool isLarge = false,
  }) {
    return Container(
      margin: EdgeInsets.all(isLarge ? 0 : 2),
      decoration: BoxDecoration(
        color: Colors.grey.shade900,
        borderRadius: BorderRadius.circular(isLarge ? 0 : 8),
      ),
      child: Stack(
        children: [
          // Video placeholder
          if (participant['isVideoOff'])
            Center(
              child: CircleAvatar(
                radius: isLarge ? 60 : 30,
                backgroundColor: AppTheme.primaryColor,
                child: Text(
                  participant['name'][0].toUpperCase(),
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: isLarge ? 40 : 20,
                  ),
                ),
              ),
            )
          else
            Container(
              color: Colors.grey.shade800,
              child: Center(
                child: Icon(
                  Icons.videocam,
                  color: Colors.grey.shade600,
                  size: isLarge ? 64 : 32,
                ),
              ),
            ),

          // Name tag
          Positioned(
            bottom: 8,
            left: 8,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (participant['isMuted'])
                    const Padding(
                      padding: EdgeInsets.only(right: 4),
                      child: Icon(Icons.mic_off, color: Colors.red, size: 14),
                    ),
                  Text(
                    participant['name'],
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn().scale(begin: const Offset(0.9, 0.9));
  }

  Widget _buildBottomControls() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.bottomCenter,
          end: Alignment.topCenter,
          colors: [Colors.black.withValues(alpha: 0.8), Colors.transparent],
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildControlButton(
            icon: _isMuted ? Icons.mic_off : Icons.mic,
            label: _isMuted ? 'Unmute' : 'Mute',
            isActive: !_isMuted,
            onPressed: () => setState(() => _isMuted = !_isMuted),
          ),
          _buildControlButton(
            icon: _isVideoOff ? Icons.videocam_off : Icons.videocam,
            label: _isVideoOff ? 'Start Video' : 'Stop Video',
            isActive: !_isVideoOff,
            onPressed: () => setState(() => _isVideoOff = !_isVideoOff),
          ),
          _buildControlButton(
            icon: Icons.screen_share,
            label: _isScreenSharing ? 'Stop Share' : 'Share Screen',
            isActive: _isScreenSharing,
            onPressed: () =>
                setState(() => _isScreenSharing = !_isScreenSharing),
          ),
          _buildControlButton(
            icon: Icons.chat,
            label: 'Chat',
            isActive: _isChatOpen,
            onPressed: () => setState(() => _isChatOpen = !_isChatOpen),
          ),
          _buildControlButton(
            icon: Icons.call_end,
            label: 'Leave',
            isActive: false,
            isDestructive: true,
            onPressed: () => _showLeaveDialog(),
          ),
        ],
      ),
    );
  }

  Widget _buildControlButton({
    required IconData icon,
    required String label,
    required bool isActive,
    bool isDestructive = false,
    required VoidCallback onPressed,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isDestructive
                ? Colors.red
                : isActive
                ? Colors.white.withValues(alpha: 0.2)
                : Colors.white.withValues(alpha: 0.1),
          ),
          child: IconButton(
            icon: Icon(
              icon,
              color: isDestructive || !isActive ? Colors.white : Colors.white,
            ),
            onPressed: onPressed,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.8),
            fontSize: 10,
          ),
        ),
      ],
    );
  }

  Widget _buildChatSidebar() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey.shade900,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(16),
          bottomLeft: Radius.circular(16),
        ),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                const Text(
                  'Chat',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white),
                  onPressed: () => setState(() => _isChatOpen = false),
                ),
              ],
            ),
          ),
          Expanded(
            child: Center(
              child: Text(
                'No messages yet',
                style: TextStyle(color: Colors.grey.shade500),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8),
            child: TextField(
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Type a message...',
                hintStyle: TextStyle(color: Colors.grey.shade500),
                filled: true,
                fillColor: Colors.grey.shade800,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: BorderSide.none,
                ),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.send, color: AppTheme.primaryColor),
                  onPressed: () {},
                ),
              ),
            ),
          ),
        ],
      ),
    ).animate().slideX(begin: 1);
  }

  void _showParticipants() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Participants (${_participants.length})',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ...(_participants.map(
              (p) => ListTile(
                leading: CircleAvatar(
                  backgroundColor: AppTheme.primaryColor,
                  child: Text(p['name'][0].toUpperCase()),
                ),
                title: Text(p['name']),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (p['isMuted'])
                      const Icon(Icons.mic_off, size: 20, color: Colors.red),
                    if (p['isVideoOff'])
                      const Icon(
                        Icons.videocam_off,
                        size: 20,
                        color: Colors.red,
                      ),
                  ],
                ),
              ),
            )),
          ],
        ),
      ),
    );
  }

  void _showLeaveDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Leave Meeting?'),
        content: const Text('Are you sure you want to leave this meeting?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Leave'),
          ),
        ],
      ),
    );
  }
}
