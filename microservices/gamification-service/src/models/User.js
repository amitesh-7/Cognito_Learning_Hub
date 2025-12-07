const mongoose = require('mongoose');

/**
 * User Model (Minimal version for Gamification Service)
 * Only stores basic info needed for leaderboards
 * Full user data is in Auth Service
 */
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['Student', 'Teacher', 'Admin', 'Moderator'],
    default: 'Student',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', UserSchema);
