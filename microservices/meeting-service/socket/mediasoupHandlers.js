/**
 * mediasoup Socket.IO Handlers
 * Handles WebRTC signaling for SFU architecture
 */

const mediasoupManager = require("../services/mediasoupManager");
const meetingManager = require("../services/meetingManager");
const Meeting = require("../models/Meeting");
const createLogger = require("../../shared/utils/logger");

const logger = createLogger("mediasoup-handlers");

module.exports = (io) => {
  io.on("connection", (socket) => {
    logger.debug(`Socket connected: ${socket.id}`);

    let currentRoomId = null;
    let currentUserId = null;
    let currentPeerId = socket.id;

    // ============================================
    // JOIN MEETING (mediasoup mode)
    // ============================================
    socket.on("join-meeting-sfu", async (data, callback) => {
      try {
        const {
          roomId,
          userId,
          userName,
          userPicture,
          isVideoEnabled,
          isAudioEnabled,
        } = data;

        logger.info(`User ${userId} joining SFU meeting ${roomId}`);

        // Get meeting from Redis or DB
        let meeting = await meetingManager.getMeeting(roomId);

        if (!meeting) {
          const dbMeeting = await Meeting.findOne({
            roomId,
            status: { $in: ["waiting", "active"] },
          });

          if (!dbMeeting) {
            callback({ success: false, error: "Meeting not found" });
            return;
          }

          meeting = await meetingManager.createMeeting({
            roomId: dbMeeting.roomId,
            title: dbMeeting.title,
            hostId: dbMeeting.hostId,
            maxParticipants: dbMeeting.settings.maxParticipants,
            settings: dbMeeting.settings,
          });
        }

        // Check participant limit
        const participantCount = await meetingManager.getParticipantCount(
          roomId
        );
        if (participantCount >= meeting.maxParticipants) {
          callback({ success: false, error: "Meeting is full" });
          return;
        }

        // Join socket room
        socket.join(roomId);
        currentRoomId = roomId;
        currentUserId = userId;
        currentPeerId = socket.id;

        // Add participant to Redis
        await meetingManager.addParticipant(roomId, {
          userId,
          userName,
          userPicture,
          socketId: socket.id,
          peerId: socket.id,
          isVideoEnabled,
          isAudioEnabled,
          mode: "sfu",
        });

        // Update meeting status
        if (meeting.status === "waiting") {
          await meetingManager.updateMeeting(roomId, {
            status: "active",
            startedAt: new Date().toISOString(),
          });

          await Meeting.findOneAndUpdate(
            { roomId },
            { status: "active", startedAt: new Date() }
          );
        }

        // Get existing participants
        const allParticipants = await meetingManager.getAllParticipants(roomId);
        const otherParticipants = allParticipants.filter(
          (p) => p.userId !== userId
        );

        // Get existing producers in room
        const existingProducers = mediasoupManager.getProducersInRoom(
          roomId,
          currentPeerId
        );

        // Notify others about new participant
        socket.to(roomId).emit("participant-joined-sfu", {
          userId,
          userName,
          userPicture,
          peerId: socket.id,
          isAudioEnabled,
          isVideoEnabled,
          isHost: userId === meeting.hostId?.toString(),
        });

        // Confirm join
        callback({
          success: true,
          meeting: {
            roomId,
            title: meeting.title,
            hostId: meeting.hostId,
            settings: meeting.settings,
          },
          participants: otherParticipants.map((p) => ({
            userId: p.userId,
            userName: p.userName,
            userPicture: p.userPicture,
            peerId: p.peerId,
            isAudioEnabled: p.isAudioEnabled,
            isVideoEnabled: p.isVideoEnabled,
            isHost: p.userId === meeting.hostId?.toString(),
          })),
          producers: existingProducers,
        });

        await meetingManager.extendMeetingTTL(roomId);

        logger.info(
          `User ${userId} joined SFU meeting ${roomId} (${otherParticipants.length} existing, ${existingProducers.length} producers)`
        );
      } catch (error) {
        logger.error("Error joining SFU meeting:", error);
        callback({ success: false, error: "Failed to join meeting" });
      }
    });

    // ============================================
    // GET ROUTER RTP CAPABILITIES
    // ============================================
    socket.on("getRouterRtpCapabilities", async ({ roomId }, callback) => {
      try {
        const router = await mediasoupManager.getOrCreateRouter(roomId);

        callback({
          success: true,
          rtpCapabilities: router.rtpCapabilities,
        });

        logger.debug(`RTP capabilities sent for room ${roomId}`);
      } catch (error) {
        logger.error("Error getting RTP capabilities:", error);
        callback({ success: false, error: error.message });
      }
    });

    // ============================================
    // CREATE WEBRTC TRANSPORT
    // ============================================
    socket.on(
      "createWebRtcTransport",
      async ({ roomId, direction }, callback) => {
        try {
          const transportInfo = await mediasoupManager.createWebRtcTransport(
            roomId,
            currentPeerId,
            direction
          );

          callback({
            success: true,
            ...transportInfo,
          });

          logger.debug(
            `WebRTC ${direction} transport created for peer ${currentPeerId} in room ${roomId}`
          );
        } catch (error) {
          logger.error("Error creating WebRTC transport:", error);
          callback({ success: false, error: error.message });
        }
      }
    );

    // ============================================
    // CONNECT TRANSPORT
    // ============================================
    socket.on(
      "connectTransport",
      async ({ transportId, dtlsParameters }, callback) => {
        try {
          await mediasoupManager.connectTransport(transportId, dtlsParameters);

          callback({ success: true });

          logger.debug(`Transport ${transportId} connected`);
        } catch (error) {
          logger.error("Error connecting transport:", error);
          callback({ success: false, error: error.message });
        }
      }
    );

    // ============================================
    // PRODUCE (Send media to server)
    // ============================================
    socket.on(
      "produce",
      async ({ transportId, kind, rtpParameters, appData }, callback) => {
        try {
          const producerId = await mediasoupManager.produce(
            transportId,
            currentPeerId,
            kind,
            rtpParameters,
            appData
          );

          callback({
            success: true,
            id: producerId,
          });

          // Notify all other participants about new producer
          socket.to(currentRoomId).emit("newProducer", {
            producerId,
            peerId: currentPeerId,
            userId: currentUserId,
            kind,
          });

          logger.info(
            `Producer created [${kind}] [peer:${currentPeerId}] [producer:${producerId}]`
          );
        } catch (error) {
          logger.error("Error producing:", error);
          callback({ success: false, error: error.message });
        }
      }
    );

    // ============================================
    // CONSUME (Receive media from server)
    // ============================================
    socket.on(
      "consume",
      async (
        { transportId, producerId, rtpCapabilities, appData },
        callback
      ) => {
        try {
          const consumerInfo = await mediasoupManager.consume(
            transportId,
            producerId,
            currentPeerId,
            rtpCapabilities,
            appData
          );

          callback({
            success: true,
            ...consumerInfo,
          });

          logger.debug(
            `Consumer created [${consumerInfo.kind}] [peer:${currentPeerId}] [consumer:${consumerInfo.id}] [producer:${producerId}]`
          );
        } catch (error) {
          logger.error("Error consuming:", error);
          callback({ success: false, error: error.message });
        }
      }
    );

    // ============================================
    // PAUSE/RESUME CONSUMER
    // ============================================
    socket.on("pauseConsumer", async ({ consumerId }, callback) => {
      try {
        await mediasoupManager.pauseConsumer(consumerId);
        callback({ success: true });
      } catch (error) {
        logger.error("Error pausing consumer:", error);
        callback({ success: false, error: error.message });
      }
    });

    socket.on("resumeConsumer", async ({ consumerId }, callback) => {
      try {
        await mediasoupManager.resumeConsumer(consumerId);
        callback({ success: true });
      } catch (error) {
        logger.error("Error resuming consumer:", error);
        callback({ success: false, error: error.message });
      }
    });

    // ============================================
    // MEDIA CONTROLS (Audio/Video/Screen)
    // ============================================
    socket.on("toggle-audio-sfu", async ({ roomId, isEnabled }, callback) => {
      try {
        await meetingManager.updateParticipant(roomId, currentUserId, {
          isAudioEnabled: isEnabled,
        });

        socket.to(roomId).emit("participant-audio-changed", {
          userId: currentUserId,
          peerId: currentPeerId,
          isAudioEnabled: isEnabled,
        });

        if (callback) callback({ success: true });
      } catch (error) {
        logger.error("Error toggling audio:", error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    socket.on("toggle-video-sfu", async ({ roomId, isEnabled }, callback) => {
      try {
        await meetingManager.updateParticipant(roomId, currentUserId, {
          isVideoEnabled: isEnabled,
        });

        socket.to(roomId).emit("participant-video-changed", {
          userId: currentUserId,
          peerId: currentPeerId,
          isVideoEnabled: isEnabled,
        });

        if (callback) callback({ success: true });
      } catch (error) {
        logger.error("Error toggling video:", error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    socket.on(
      "toggle-screen-share-sfu",
      async ({ roomId, isSharing }, callback) => {
        try {
          await meetingManager.updateParticipant(roomId, currentUserId, {
            isScreenSharing: isSharing,
          });

          socket.to(roomId).emit("participant-screen-share-changed", {
            userId: currentUserId,
            peerId: currentPeerId,
            isScreenSharing: isSharing,
          });

          if (callback) callback({ success: true });
        } catch (error) {
          logger.error("Error toggling screen share:", error);
          if (callback) callback({ success: false, error: error.message });
        }
      }
    );

    // ============================================
    // CHAT
    // ============================================
    socket.on(
      "meeting-chat-message-sfu",
      async ({ roomId, message }, callback) => {
        try {
          const participant = await meetingManager.getParticipant(
            roomId,
            currentUserId
          );

          io.to(roomId).emit("meeting-chat-message", {
            userId: currentUserId,
            userName: participant?.userName || "Unknown",
            message,
            timestamp: new Date().toISOString(),
          });

          if (callback) callback({ success: true });
        } catch (error) {
          logger.error("Error sending chat message:", error);
          if (callback) callback({ success: false, error: error.message });
        }
      }
    );

    // ============================================
    // LEAVE MEETING
    // ============================================
    socket.on("leave-meeting-sfu", async ({ roomId }, callback) => {
      try {
        const roomToLeave = roomId || currentRoomId;
        const userToRemove = currentUserId;
        const peerToRemove = currentPeerId;

        if (!roomToLeave || !userToRemove) {
          if (callback) callback({ success: true });
          return;
        }

        logger.info(`User ${userToRemove} leaving SFU meeting ${roomToLeave}`);

        // Close all mediasoup resources for this peer
        mediasoupManager.closePeer(peerToRemove);

        // Remove participant from Redis
        await meetingManager.removeParticipant(roomToLeave, userToRemove);

        // Leave socket room
        socket.leave(roomToLeave);

        // Notify others
        socket.to(roomToLeave).emit("participant-left", {
          userId: userToRemove,
          peerId: peerToRemove,
        });

        // Check if meeting is empty
        const participantCount = await meetingManager.getParticipantCount(
          roomToLeave
        );

        if (participantCount === 0) {
          await Meeting.findOneAndUpdate(
            { roomId: roomToLeave },
            { status: "completed", endedAt: new Date() }
          );

          await meetingManager.deleteMeeting(roomToLeave);
          await mediasoupManager.closeRoom(roomToLeave);

          logger.info(`SFU meeting ${roomToLeave} ended (no participants)`);
        }

        currentRoomId = null;
        currentUserId = null;

        if (callback) callback({ success: true });
      } catch (error) {
        logger.error("Error leaving SFU meeting:", error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    // ============================================
    // DISCONNECT
    // ============================================
    socket.on("disconnect", async () => {
      try {
        logger.debug(`Socket disconnected: ${socket.id}`);

        if (currentRoomId && currentUserId) {
          logger.info(
            `User ${currentUserId} disconnected from SFU meeting ${currentRoomId}`
          );

          // Close mediasoup resources
          mediasoupManager.closePeer(currentPeerId);

          // Remove participant
          await meetingManager.removeParticipant(currentRoomId, currentUserId);

          // Notify others
          socket.to(currentRoomId).emit("participant-left", {
            userId: currentUserId,
            peerId: currentPeerId,
          });

          // Check if meeting is empty
          const participantCount = await meetingManager.getParticipantCount(
            currentRoomId
          );

          if (participantCount === 0) {
            await Meeting.findOneAndUpdate(
              { roomId: currentRoomId },
              { status: "completed", endedAt: new Date() }
            );

            await meetingManager.deleteMeeting(currentRoomId);
            await mediasoupManager.closeRoom(currentRoomId);

            logger.info(
              `SFU meeting ${currentRoomId} ended (disconnect, no participants)`
            );
          }
        }
      } catch (error) {
        logger.error("Error handling disconnect:", error);
      }
    });

    // ============================================
    // GET STATS (for monitoring)
    // ============================================
    socket.on("getMediasoupStats", async (callback) => {
      try {
        const stats = mediasoupManager.getAllStats();
        callback({ success: true, stats });
      } catch (error) {
        logger.error("Error getting stats:", error);
        callback({ success: false, error: error.message });
      }
    });
  });
};
