// lib/screens/ai_tutor/study_buddy_chat_screen.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:intl/intl.dart';
import '../../models/conversation.dart';
import '../../providers/study_buddy_provider.dart';
import '../../services/study_buddy_service.dart';

class StudyBuddyChatScreen extends ConsumerStatefulWidget {
  final String? quizId;
  final String? quizTitle;
  final String? topic;

  const StudyBuddyChatScreen({
    super.key,
    this.quizId,
    this.quizTitle,
    this.topic,
  });

  @override
  ConsumerState<StudyBuddyChatScreen> createState() =>
      _StudyBuddyChatScreenState();
}

class _StudyBuddyChatScreenState extends ConsumerState<StudyBuddyChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final StudyBuddyService _service = StudyBuddyService();
  bool _isTyping = false;

  @override
  void initState() {
    super.initState();
    // Load conversations on init
    Future.microtask(() {
      ref.read(conversationsProvider.notifier).refresh();
    });
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      Future.delayed(const Duration(milliseconds: 100), () {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      });
    }
  }

  Future<void> _sendMessage() async {
    final message = _messageController.text.trim();
    if (message.isEmpty) return;

    final sessionId = ref.read(currentSessionIdProvider);

    // Add user message to UI
    ref.read(chatMessagesProvider.notifier).addMessage(
          Message(
            role: 'user',
            content: message,
            timestamp: DateTime.now(),
          ),
        );

    _messageController.clear();
    _scrollToBottom();

    setState(() => _isTyping = true);

    try {
      // Send message to backend
      final response = await _service.sendMessage(
        message: message,
        sessionId: sessionId,
        quizId: widget.quizId,
        quizTitle: widget.quizTitle,
        topic: widget.topic,
      );

      // Update session ID if new
      if (sessionId == null) {
        ref
            .read(currentSessionIdProvider.notifier)
            .set(response['sessionId'] as String);
      }

      // Add AI response to UI
      ref.read(chatMessagesProvider.notifier).addMessage(
            Message(
              role: 'assistant',
              content: response['response'] as String,
              timestamp: DateTime.now(),
              metadata: response['metadata'] != null
                  ? MessageMetadata.fromJson(
                      response['metadata'] as Map<String, dynamic>)
                  : null,
            ),
          );

      _scrollToBottom();

      // Refresh conversations list
      ref.read(conversationsProvider.notifier).refresh();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() => _isTyping = false);
    }
  }

  void _loadConversation(String sessionId) {
    ref.read(currentConversationProvider.notifier).loadConversation(sessionId);
    ref.read(currentSessionIdProvider.notifier).set(sessionId);
  }

  void _startNewChat() {
    ref.read(chatMessagesProvider.notifier).clearMessages();
    ref.read(currentSessionIdProvider.notifier).set(null);
    ref.read(currentConversationProvider.notifier).clearConversation();
  }

  @override
  Widget build(BuildContext context) {
    final conversations = ref.watch(conversationsProvider);
    final currentConversation = ref.watch(currentConversationProvider);
    final messages = ref.watch(chatMessagesProvider);

    // Load messages from conversation if available
    if (currentConversation != null &&
        currentConversation.messages != null &&
        messages.isEmpty) {
      Future.microtask(() {
        ref
            .read(chatMessagesProvider.notifier)
            .setMessages(currentConversation.messages!);
        _scrollToBottom();
      });
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Study Buddy'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline),
            onPressed: () {
              _showInfoDialog();
            },
          ),
          Builder(
            builder: (context) => IconButton(
              icon: const Icon(Icons.menu),
              onPressed: () {
                Scaffold.of(context).openEndDrawer();
              },
            ),
          ),
        ],
      ),
      endDrawer: _buildConversationsDrawer(conversations),
      body: Column(
        children: [
          // Context banner (if quiz context provided)
          if (widget.quizTitle != null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              color: Theme.of(context).colorScheme.primaryContainer,
              child: Row(
                children: [
                  const Icon(Icons.quiz, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Chatting about: ${widget.quizTitle}',
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.onPrimaryContainer,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20),
                    onPressed: () {
                      // Clear context
                      Navigator.of(context).pushReplacement(
                        MaterialPageRoute(
                          builder: (_) => const StudyBuddyChatScreen(),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),

          // Messages list
          Expanded(
            child: messages.isEmpty
                ? _buildEmptyState()
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(16),
                    itemCount: messages.length + (_isTyping ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == messages.length && _isTyping) {
                        return _buildTypingIndicator();
                      }
                      return _buildMessageBubble(messages[index]);
                    },
                  ),
          ),

          // Input area
          _buildInputArea(),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.psychology_outlined,
            size: 80,
            color: Theme.of(context).colorScheme.primary.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          Text(
            'AI Study Buddy',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.primary,
                ),
          ),
          const SizedBox(height: 8),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 32),
            child: Text(
              'Ask me anything about your studies!\nI can help with explanations, study tips, and motivation.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
          ),
          const SizedBox(height: 24),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            alignment: WrapAlignment.center,
            children: [
              _buildSuggestionChip('Explain a concept'),
              _buildSuggestionChip('Study tips'),
              _buildSuggestionChip('Quiz help'),
              _buildSuggestionChip('Motivate me'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSuggestionChip(String text) {
    return ActionChip(
      label: Text(text),
      onPressed: () {
        _messageController.text = text;
        _sendMessage();
      },
      avatar: const Icon(Icons.lightbulb_outline, size: 18),
    );
  }

  Widget _buildMessageBubble(Message message) {
    final isUser = message.role == 'user';

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        decoration: BoxDecoration(
          color: isUser
              ? Theme.of(context).colorScheme.primary
              : Theme.of(context).colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (!isUser)
              MarkdownBody(
                data: message.content,
                styleSheet: MarkdownStyleSheet(
                  p: TextStyle(
                    color: Theme.of(context).colorScheme.onSurface,
                  ),
                  code: TextStyle(
                    backgroundColor: Colors.grey[200],
                    color: Colors.black87,
                  ),
                ),
              )
            else
              Text(
                message.content,
                style: TextStyle(
                  color: isUser ? Colors.white : Colors.black87,
                ),
              ),
            const SizedBox(height: 4),
            Text(
              DateFormat('HH:mm').format(message.timestamp),
              style: TextStyle(
                fontSize: 10,
                color: isUser ? Colors.white70 : Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildTypingDot(0),
            const SizedBox(width: 4),
            _buildTypingDot(1),
            const SizedBox(width: 4),
            _buildTypingDot(2),
          ],
        ),
      ),
    );
  }

  Widget _buildTypingDot(int index) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: const Duration(milliseconds: 600),
      builder: (context, value, child) {
        return Opacity(
          opacity: (value + index * 0.3) % 1.0,
          child: Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: Colors.grey[600],
              shape: BoxShape.circle,
            ),
          ),
        );
      },
    );
  }

  Widget _buildInputArea() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _messageController,
              decoration: InputDecoration(
                hintText: 'Ask me anything...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 12,
                ),
              ),
              maxLines: null,
              textInputAction: TextInputAction.send,
              onSubmitted: (_) => _sendMessage(),
            ),
          ),
          const SizedBox(width: 8),
          FloatingActionButton(
            onPressed: _isTyping ? null : _sendMessage,
            child: _isTyping
                ? const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Icon(Icons.send),
          ),
        ],
      ),
    );
  }

  Widget _buildConversationsDrawer(
      AsyncValue<List<Conversation>> conversations) {
    return Drawer(
      child: Column(
        children: [
          DrawerHeader(
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                const Text(
                  'Conversations',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    _startNewChat();
                  },
                  icon: const Icon(Icons.add),
                  label: const Text('New Chat'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: Theme.of(context).colorScheme.primary,
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: conversations.when(
              data: (convList) {
                if (convList.isEmpty) {
                  return const Center(
                    child: Text('No conversations yet'),
                  );
                }
                return ListView.builder(
                  itemCount: convList.length,
                  itemBuilder: (context, index) {
                    final conv = convList[index];
                    return ListTile(
                      leading: const Icon(Icons.chat_bubble_outline),
                      title: Text(
                        conv.summary,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      subtitle: Text(
                        DateFormat('MMM dd, yyyy').format(conv.createdAt),
                        style: const TextStyle(fontSize: 12),
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete_outline),
                        onPressed: () {
                          _showDeleteDialog(conv.sessionId);
                        },
                      ),
                      onTap: () {
                        Navigator.pop(context);
                        _loadConversation(conv.sessionId);
                      },
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, _) => Center(child: Text('Error: $error')),
            ),
          ),
        ],
      ),
    );
  }

  void _showDeleteDialog(String sessionId) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Conversation'),
        content:
            const Text('Are you sure you want to delete this conversation?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await ref
                    .read(conversationsProvider.notifier)
                    .deleteConversation(sessionId);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Conversation deleted')),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: $e')),
                  );
                }
              }
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _showInfoDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('About AI Study Buddy'),
        content: const SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Your Personal Learning Assistant',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 12),
              Text('I can help you with:'),
              SizedBox(height: 8),
              Text('• Explaining difficult concepts'),
              Text('• Providing study tips and strategies'),
              Text('• Quiz preparation and practice'),
              Text('• Motivation and learning support'),
              Text('• Answering questions about topics'),
              SizedBox(height: 12),
              Text(
                'Powered by Google Gemini AI',
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Got it'),
          ),
        ],
      ),
    );
  }
}
