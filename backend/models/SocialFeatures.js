const mongoose = require('mongoose');

// Friend System
const friendshipSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'blocked'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date }
});

// Quiz Challenges
const challengeSchema = new mongoose.Schema({
  challenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  challenged: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'declined', 'completed', 'expired'], 
    default: 'pending' 
  },
  challengerResult: {
    score: Number,
    percentage: Number,
    timeTaken: Number,
    completedAt: Date
  },
  challengedResult: {
    score: Number,
    percentage: Number,
    timeTaken: Number,
    completedAt: Date
  },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
  expiresAt: { type: Date, default: () => new Date(+new Date() + 24*60*60*1000) }, // 24 hours
  createdAt: { type: Date, default: Date.now }
});

// Chat Messages
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  chatRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom' },
  content: { type: String, required: true },
  messageType: { 
    type: String, 
    enum: ['text', 'quiz-challenge', 'quiz-result', 'system'], 
    default: 'text' 
  },
  metadata: {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
    resultId: { type: mongoose.Schema.Types.ObjectId, ref: 'Result' }
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Chat Rooms (for group chats, teacher communities)
const chatRoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  type: { 
    type: String, 
    enum: ['direct', 'teacher-community', 'study-group', 'broadcast'], 
    required: true 
  },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  settings: {
    isPublic: { type: Boolean, default: false },
    allowStudents: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    canStudentsPost: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now }
});

// Notifications
const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { 
    type: String, 
    enum: [
      'friend-request', 
      'friend-accepted', 
      'quiz-challenge', 
      'challenge-completed', 
      'challenge-won', 
      'challenge-lost',
      'new-message',
      'broadcast',
      'community-invite'
    ], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  metadata: {
    friendshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Friendship' },
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
    chatRoomId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom' },
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Broadcast Messages (Admin controlled)
const broadcastSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['announcement', 'maintenance', 'feature-update', 'event'], 
    default: 'announcement' 
  },
  targetAudience: {
    roles: [{ type: String, enum: ['Student', 'Teacher', 'Admin', 'Moderator'] }],
    specific: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  isActive: { type: Boolean, default: true },
  scheduledFor: Date,
  expiresAt: Date,
  readBy: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const Friendship = mongoose.model('Friendship', friendshipSchema);
const Challenge = mongoose.model('Challenge', challengeSchema);
const Message = mongoose.model('Message', messageSchema);
const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const Broadcast = mongoose.model('Broadcast', broadcastSchema);

module.exports = { 
  Friendship, 
  Challenge, 
  Message, 
  ChatRoom, 
  Notification, 
  Broadcast 
};
