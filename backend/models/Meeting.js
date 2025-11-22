const mongoose = require("mongoose");

const ParticipantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  name: { type: String },
  role: {
    type: String,
    enum: ["Teacher", "Student", "Guest"],
    default: "Student",
  },
  socketId: { type: String },
  muted: { type: Boolean, default: false },
  videoOff: { type: Boolean, default: false },
  joinedAt: { type: Date, default: Date.now },
});

const MeetingSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true },
    hostUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hostSocketId: { type: String },
    title: { type: String, default: "Meeting" },
    participants: [ParticipantSchema],
    locked: { type: Boolean, default: false },
    joinRequests: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: String,
        requestedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meeting", MeetingSchema);
