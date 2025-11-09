const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: false, // Don't auto-create index (we create it manually below)
    },
    password: {
      type: String,
      required: function () {
        // Password is required only if googleId is not present
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
      index: false, // Don't auto-create index (we create it manually below)
    },
    picture: {
      type: String, // Google profile picture URL
    },
    role: {
      type: String,
      // Add the new roles to the enum
      enum: ["Student", "Teacher", "Moderator", "Admin"],
      required: true,
    },
    status: {
      type: String,
      enum: ["online", "offline", "away"],
      default: "offline",
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Performance Indexes
UserSchema.index({ email: 1 }, { unique: true }); // Fast email lookups (login)
UserSchema.index({ googleId: 1 }, { unique: true, sparse: true }); // Fast Google OAuth lookups
UserSchema.index({ role: 1 }); // Filter by role (Teacher, Admin, etc.)
UserSchema.index({ status: 1, lastSeen: -1 }); // Online user queries
UserSchema.index({ createdAt: -1 }); // Recent user queries

module.exports = mongoose.model("User", UserSchema);
