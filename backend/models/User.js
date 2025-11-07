const mongoose = require('mongoose');

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
    password: {
      type: String,
      required: function() {
        // Password is required only if googleId is not present
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    picture: {
      type: String, // Google profile picture URL
    },
    role: {
      type: String,
      // Add the new roles to the enum
      enum: ['Student', 'Teacher', 'Moderator', 'Admin'], 
      required: true,
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'away'],
      default: 'offline'
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }, { timestamps: true });

  module.exports = mongoose.model('User', UserSchema);