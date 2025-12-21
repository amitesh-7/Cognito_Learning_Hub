import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getSocketUrl, getMeetingWsUrl } from "../lib/apiConfig";
import MediasoupHandler from "../lib/mediasoupClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Users,
  MessageSquare,
  Phone,
  Copy,
  Check,
  X,
  Send,
  LogOut,
  UserX,
  Settings,
  Maximize2,
  Minimize2,
  MoreVertical,
  Hand,
  Smile,
} from "lucide-react";

const MeetingRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Socket and mediasoup
  const [socket, setSocket] = useState(null);
  const [mediasoupHandler, setMediasoupHandler] = useState(null);

  // Media streams
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);

  // Peers - Map of peerId -> {videoTrack, audioTrack, screenTrack, name, userId, isHost}
  const [peers, setPeers] = useState(new Map());

  // Meeting state
  const [participants, setParticipants] = useState([]);
  const [mySocketId, setMySocketId] = useState(null);
  const [hostId, setHostId] = useState(null);
  const [myUserName, setMyUserName] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  // UI state
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [copiedRoomId, setCopiedRoomId] = useState(false);

  // Refs
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const producedVideoRef = useRef(false);
  const producedAudioRef = useRef(false);
  const socketRef = useRef(null);
  const socketInitializedRef = useRef(false);
  const myUserNameRef = useRef("");
  const mediasoupHandlerRef = useRef(null);

  const isHost = hostId && user && (user.id === hostId || user._id === hostId);

  // Initialize socket connection to meeting service
  useEffect(() => {
    if (socketInitializedRef.current) return; // avoid double-init in StrictMode
    socketInitializedRef.current = true;

    const meetingWsUrl = getMeetingWsUrl();
    const meetingUrl = meetingWsUrl
      .replace("ws://", "http://")
      .replace("wss://", "https://");

    console.log("[Meeting SFU] Connecting to:", meetingUrl);

    const meetSocket = io(meetingUrl, {
      transports: ["polling", "websocket"],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(meetSocket);
    socketRef.current = meetSocket;

    meetSocket.on("connect", () => {
      console.log("[Meeting SFU] Connected:", meetSocket.id);
      setMySocketId(meetSocket.id);
      const displayName = user?.name || user?.username || "Guest";
      setMyUserName(displayName);
      myUserNameRef.current = displayName;

      // Join meeting with SFU mode (MediaSoup)
      meetSocket.emit(
        "join-meeting-sfu",
        {
          roomId,
          userId: user?.id || user?._id || null,
          userName: displayName,
          userPicture: user?.picture || user?.profilePicture || null,
          isVideoEnabled: cameraOn,
          isAudioEnabled: micOn,
        },
        async (response) => {
          console.log("[Meeting SFU] Join response:", response);

          if (response?.success) {
            console.log("[Meeting SFU] Joined room:", roomId);
            console.log(
              "[Meeting SFU] Other participants:",
              response.participants
            );

            // Add self to participants list
            const selfParticipant = {
              userId: user?.id || user?._id || null,
              userName: displayName,
              userPicture: user?.picture || user?.profilePicture || null,
              peerId: meetSocket.id,
              socketId: meetSocket.id,
              isAudioEnabled: micOn,
              isVideoEnabled: cameraOn,
              isHost: (user?.id || user?._id) === response.meeting?.hostId,
            };

            // Combine self with other participants
            const allParticipants = [
              selfParticipant,
              ...(response.participants || []),
            ];
            setParticipants(allParticipants);
            setHostId(response.meeting?.hostId);

            // Initialize peers Map with existing participants
            if (response.participants && response.participants.length > 0) {
              console.log(
                "[Meeting SFU] Initializing peers Map with existing participants"
              );
              setPeers((prev) => {
                const updated = new Map(prev);
                response.participants.forEach((participant) => {
                  updated.set(participant.peerId, {
                    name: participant.userName,
                    userId: participant.userId,
                    isHost: participant.isHost,
                  });
                  console.log(
                    `[Meeting SFU] Added peer ${participant.peerId} with name: ${participant.userName}`
                  );
                });
                return updated;
              });
            }

            // Initialize mediasoup
            try {
              const handler = new MediasoupHandler(meetSocket);
              await handler.init(roomId);
              mediasoupHandlerRef.current = handler;
              setMediasoupHandler(handler);
              console.log("[Meeting SFU] mediasoup initialized");

              // Set up event handlers
              handler.onNewConsumer = (peerId, kind, track) => {
                console.log(
                  `[Meeting SFU] Consumer track received [${kind}] from peer ${peerId}, track readyState:`,
                  track.readyState,
                  "enabled:",
                  track.enabled
                );
                setPeers((prev) => {
                  const updated = new Map(prev);
                  const peer = updated.get(peerId) || {};
                  console.log(
                    `[Meeting SFU] Current peer data for ${peerId}:`,
                    peer,
                    "has videoTrack:",
                    !!peer.videoTrack,
                    "has audioTrack:",
                    !!peer.audioTrack
                  );
                  // Preserve existing properties (name, userId, isHost) while adding tracks
                  if (kind === "video") peer.videoTrack = track;
                  else if (kind === "audio") peer.audioTrack = track;
                  else if (kind === "screen") peer.screenTrack = track;
                  updated.set(peerId, peer);
                  console.log(
                    `[Meeting SFU] Updated peer data for ${peerId}:`,
                    "name:",
                    peer.name,
                    "hasVideo:",
                    !!peer.videoTrack,
                    "hasAudio:",
                    !!peer.audioTrack
                  );
                  return updated;
                });
              };

              handler.onConsumerClosed = (peerId, kind) => {
                setPeers((prev) => {
                  const updated = new Map(prev);
                  const peer = updated.get(peerId);
                  if (peer) {
                    if (kind === "video") delete peer.videoTrack;
                    if (kind === "audio") delete peer.audioTrack;
                    if (kind === "screen") delete peer.screenTrack;
                    updated.set(peerId, peer);
                  }
                  return updated;
                });
              };

              handler.onError = (error) => {
                console.error("[Meeting SFU] Handler error:", error);
              };

              // Consume existing producers
              if (response.producers && response.producers.length > 0) {
                console.log(
                  "[Meeting SFU] Consuming existing producers:",
                  response.producers.length
                );
                for (const { producerId, peerId, kind } of response.producers) {
                  try {
                    await handler.consume(producerId, peerId, kind);
                  } catch (err) {
                    console.error(
                      `[Meeting SFU] Failed to consume ${kind} from ${peerId}:`,
                      err
                    );
                  }
                }
              }
            } catch (err) {
              console.error(
                "[Meeting SFU] Failed to initialize mediasoup:",
                err
              );
              alert("Failed to initialize video connection");
            }
          } else {
            console.error("[Meeting SFU] Failed to join:", response?.error);
            alert(response?.error || "Failed to join meeting");
            navigate("/");
          }
        }
      );
    });

    // New participant joined
    meetSocket.on("participant-joined-sfu", (participant) => {
      console.log("[Meeting SFU] Participant joined:", participant);
      const { peerId, userName, userId, isHost } = participant;

      setParticipants((prev) => {
        if (prev.some((p) => p.peerId === peerId)) {
          return prev;
        }
        return [...prev, participant];
      });

      setPeers((prev) => {
        const updated = new Map(prev);
        const existingPeer = updated.get(peerId) || {};
        console.log(
          `[Meeting SFU] Merging participant info for ${peerId}, existing:`,
          existingPeer
        );
        // Merge with existing track data (in case tracks arrived first)
        updated.set(peerId, {
          ...existingPeer,
          name: userName,
          userId,
          isHost,
        });
        console.log(
          `[Meeting SFU] Final peer data for ${peerId}:`,
          updated.get(peerId)
        );
        return updated;
      });
    });

    // New producer available - use ref to get latest handler
    meetSocket.on(
      "newProducer",
      async ({ producerId, peerId, userId, userName, kind }) => {
        console.log(
          `[Meeting SFU] New producer from peer ${peerId}, user: ${userName}, kind: ${kind}`
        );

        // Update peer info with userName if available
        if (userName) {
          setPeers((prev) => {
            const updated = new Map(prev);
            const existingPeer = updated.get(peerId) || {};
            updated.set(peerId, {
              ...existingPeer,
              name: userName,
              userId,
            });
            return updated;
          });
        }

        const handler = mediasoupHandlerRef.current;
        if (handler) {
          try {
            await handler.consume(producerId, peerId, kind);
          } catch (err) {
            console.error(`[Meeting SFU] Failed to consume ${kind}:`, err);
          }
        }
      }
    );

    // Participant left
    meetSocket.on("participant-left", ({ userId, peerId }) => {
      console.log("[Meeting SFU] Participant left:", peerId);

      setParticipants((prev) => prev.filter((p) => p.peerId !== peerId));

      setPeers((prev) => {
        const updated = new Map(prev);
        updated.delete(peerId);
        return updated;
      });

      const handler = mediasoupHandlerRef.current;
      if (handler) {
        handler.removePeer(peerId);
      }
    });

    // Media state changes
    meetSocket.on("participant-audio-changed", ({ peerId, isAudioEnabled }) => {
      setParticipants((prev) =>
        prev.map((p) => (p.peerId === peerId ? { ...p, isAudioEnabled } : p))
      );
    });

    meetSocket.on("participant-video-changed", ({ peerId, isVideoEnabled }) => {
      setParticipants((prev) =>
        prev.map((p) => (p.peerId === peerId ? { ...p, isVideoEnabled } : p))
      );
    });

    meetSocket.on(
      "participant-screen-share-changed",
      ({ peerId, isScreenSharing }) => {
        setParticipants((prev) =>
          prev.map((p) => (p.peerId === peerId ? { ...p, isScreenSharing } : p))
        );
      }
    );

    // Chat
    meetSocket.on("meeting-chat-message", (message) => {
      setChatMessages((prev) => [...prev, message]);
    });

    // Disconnect
    meetSocket.on("disconnect", () => {
      console.log("[Meeting SFU] Disconnected");
    });

    // Connection errors
    meetSocket.on("connect_error", (error) => {
      console.error("[Meeting SFU] Connection error:", error);
    });

    meetSocket.on("error", (error) => {
      console.error("[Meeting SFU] Socket error:", error);
    });

    return () => {
      console.log("[Meeting SFU] Cleaning up socket connection");
      const handler = mediasoupHandlerRef.current;
      if (handler) {
        handler.close();
      }
      meetSocket.disconnect();
      socketInitializedRef.current = false;
      // Clear peers state on cleanup
      setPeers(new Map());
      setParticipants([]);
    };
  }, [roomId, user, navigate]);

  // Get local media stream once
  useEffect(() => {
    if (localStreamRef.current) return; // already initialized

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        setLocalStream(stream);
        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Log video track settings
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const settings = videoTrack.getSettings();
          console.log("[Meeting SFU] Local video track settings:", {
            width: settings.width,
            height: settings.height,
            frameRate: settings.frameRate,
            facingMode: settings.facingMode,
            deviceId: settings.deviceId,
          });
        }

        console.log("[Meeting SFU] Local stream ready");
      } catch (err) {
        console.error("[Meeting SFU] getUserMedia error", err);
        alert("Failed to access camera/microphone");
      }
    })();
  }, []);

  // Produce tracks once mediasoup is ready and local stream exists
  useEffect(() => {
    const produceTracks = async () => {
      if (!mediasoupHandler || !socket || !localStreamRef.current) return;

      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      const audioTrack = localStreamRef.current.getAudioTracks()[0];

      if (videoTrack && cameraOn && !producedVideoRef.current) {
        try {
          await mediasoupHandler.produceVideo(videoTrack);
          producedVideoRef.current = true;
          console.log("[Meeting SFU] Video producer created");
        } catch (err) {
          console.error("[Meeting SFU] Failed to produce video:", err);
        }
      }

      if (audioTrack && micOn && !producedAudioRef.current) {
        try {
          await mediasoupHandler.produceAudio(audioTrack);
          producedAudioRef.current = true;
          console.log("[Meeting SFU] Audio producer created");
        } catch (err) {
          console.error("[Meeting SFU] Failed to produce audio:", err);
        }
      }
    };

    produceTracks();
  }, [mediasoupHandler, socket, cameraOn, micOn]);

  // Cleanup local stream on unmount
  useEffect(() => {
    return () => {
      console.log("[Meeting SFU] Cleaning up local stream");
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
          console.log(`[Meeting SFU] Stopped ${track.kind} track`);
        });
        localStreamRef.current = null;
      }
      setLocalStream(null);
      producedVideoRef.current = false;
      producedAudioRef.current = false;
    };
  }, []);

  // Toggle microphone
  const toggleMic = async () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicOn(audioTrack.enabled);

        // Update server
        socket?.emit("toggle-audio-sfu", {
          roomId,
          isEnabled: audioTrack.enabled,
        });

        // Pause/resume producer
        if (mediasoupHandler) {
          if (audioTrack.enabled) {
            await mediasoupHandler.resumeProducer("audio");
          } else {
            await mediasoupHandler.pauseProducer("audio");
          }
        }
      }
    }
  };

  // Toggle camera
  const toggleCamera = async () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraOn(videoTrack.enabled);

        // Update server
        socket?.emit("toggle-video-sfu", {
          roomId,
          isEnabled: videoTrack.enabled,
        });

        // Pause/resume producer
        if (mediasoupHandler) {
          if (videoTrack.enabled) {
            await mediasoupHandler.resumeProducer("video");
          } else {
            await mediasoupHandler.pauseProducer("video");
          }
        }
      }
    }
  };

  // Copy room ID to clipboard
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopiedRoomId(true);
      setTimeout(() => setCopiedRoomId(false), 2000);
    });
  };

  // Screen sharing
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

        setScreenStream(stream);
        setIsScreenSharing(true);

        const screenTrack = stream.getVideoTracks()[0];

        // Produce screen track
        if (mediasoupHandler) {
          try {
            await mediasoupHandler.produceScreen(screenTrack);
            console.log("[Meeting SFU] Screen producer created");
          } catch (err) {
            console.error("[Meeting SFU] Failed to produce screen:", err);
          }
        }

        // Update server
        socket?.emit("toggle-screen-share-sfu", {
          roomId,
          isSharing: true,
        });

        // Handle screen share stop
        screenTrack.onended = () => {
          toggleScreenShare();
        };
      } catch (err) {
        console.error("[Meeting SFU] Screen share error", err);
      }
    } else {
      // Stop screen share
      if (screenStream) {
        screenStream.getTracks().forEach((t) => t.stop());
      }

      setScreenStream(null);
      setIsScreenSharing(false);

      // Close screen producer
      if (mediasoupHandler) {
        mediasoupHandler.closeProducer("screen");
      }

      // Update server
      socket?.emit("toggle-screen-share-sfu", {
        roomId,
        isSharing: false,
      });
    }
  };

  // Send chat message
  const sendMessage = (e) => {
    e.preventDefault();
    if (chatInput.trim() && socket) {
      socket.emit(
        "meeting-chat-message-sfu",
        {
          roomId,
          message: chatInput,
        },
        (response) => {
          if (response?.success) {
            setChatInput("");
          }
        }
      );
    }
  };

  // Host controls
  const handleMuteParticipant = (socketId) => {
    socket?.emit("control:mute", { roomId, targetSocketId: socketId });
  };

  const handleRemoveParticipant = (socketId) => {
    socket?.emit("control:remove", { roomId, targetSocketId: socketId });
  };

  const endMeeting = () => {
    socket?.emit("meeting:end", { roomId });
    navigate("/");
  };

  // Leave meeting
  const leaveMeeting = () => {
    socket?.emit("leave-meeting-sfu", { roomId });
    navigate("/");
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark 
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" 
        : "bg-gradient-to-br from-gray-100 via-white to-gray-100"
    }`}>
      {/* Top bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`backdrop-blur-xl border-b px-4 sm:px-6 py-3 flex items-center justify-between ${
          isDark 
            ? "bg-slate-900/80 border-white/10" 
            : "bg-white/80 border-gray-200"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              isDark ? "bg-purple-500/20" : "bg-purple-100"
            }`}>
              <Video className={`w-5 h-5 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
            </div>
            <div>
              <h1 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                Meeting Room
              </h1>
              <p className={`text-xs font-mono ${isDark ? "text-white/50" : "text-gray-500"}`}>
                {roomId?.slice(0, 8)}...{roomId?.slice(-4)}
              </p>
            </div>
          </div>
          <button
            onClick={copyRoomId}
            className={`p-2 rounded-lg transition-all duration-300 group relative ${
              isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
            }`}
            title="Copy Room ID"
          >
            {copiedRoomId ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <Copy className={`w-5 h-5 transition-colors ${
                isDark ? "text-white/70 group-hover:text-purple-400" : "text-gray-500 group-hover:text-purple-600"
              }`} />
            )}
            <AnimatePresence>
              {copiedRoomId && (
                <motion.span 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50"
                >
                  Copied!
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Connection indicator */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            isDark ? "bg-green-500/20" : "bg-green-100"
          }`}>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className={`text-sm font-medium hidden sm:inline ${
              isDark ? "text-green-400" : "text-green-600"
            }`}>
              {participants.length} participant{participants.length !== 1 ? "s" : ""}
            </span>
            <span className={`text-sm font-medium sm:hidden ${
              isDark ? "text-green-400" : "text-green-600"
            }`}>
              {participants.length}
            </span>
          </div>
          {isHost && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={endMeeting}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium hidden sm:inline">End</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - participants panel */}
        <AnimatePresence>
          {showParticipants && (
            <motion.div 
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`w-72 sm:w-80 backdrop-blur-xl border-r flex flex-col ${
                isDark 
                  ? "bg-slate-900/60 border-white/10" 
                  : "bg-white/60 border-gray-200"
              }`}
            >
              <div className={`p-4 border-b flex items-center justify-between ${
                isDark ? "border-white/10" : "border-gray-200"
              }`}>
                <h2 className={`font-semibold flex items-center gap-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  <div className={`p-2 rounded-lg ${isDark ? "bg-purple-500/20" : "bg-purple-100"}`}>
                    <Users className={`w-4 h-4 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
                  </div>
                  <span>Participants ({participants.length})</span>
                </h2>
                <button
                  onClick={() => setShowParticipants(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? "hover:bg-white/10 text-white/70" : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {participants.map((p, index) => (
                  <motion.div
                    key={p.socketId || p.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 border ${
                      isDark 
                        ? "bg-white/5 hover:bg-white/10 border-white/5 hover:border-purple-500/20" 
                        : "bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        {(p.userName || p.name || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className={`text-sm font-medium flex items-center gap-2 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}>
                          <span className="truncate max-w-[100px]">
                            {p.userName || p.name || "Participant"}
                          </span>
                          {p.peerId === mySocketId && (
                            <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${
                              isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600"
                            }`}>
                              You
                            </span>
                          )}
                          {p.isHost && (
                            <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${
                              isDark ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-100 text-yellow-700"
                            }`}>
                              Host
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {p.isAudioEnabled ? (
                            <Mic className={`w-3 h-3 ${isDark ? "text-green-400" : "text-green-600"}`} />
                          ) : (
                            <MicOff className={`w-3 h-3 ${isDark ? "text-red-400" : "text-red-500"}`} />
                          )}
                          {p.isVideoEnabled ? (
                            <Video className={`w-3 h-3 ${isDark ? "text-green-400" : "text-green-600"}`} />
                          ) : (
                            <VideoOff className={`w-3 h-3 ${isDark ? "text-red-400" : "text-red-500"}`} />
                          )}
                        </div>
                      </div>
                    </div>
                    {isHost && !p.isHost && p.peerId !== mySocketId && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleMuteParticipant(p.socketId)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark ? "hover:bg-red-500/20" : "hover:bg-red-100"
                          }`}
                          title="Mute participant"
                        >
                          <MicOff className="w-4 h-4 text-red-500" />
                        </button>
                        <button
                          onClick={() => handleRemoveParticipant(p.socketId)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark ? "hover:bg-red-500/20" : "hover:bg-red-100"
                          }`}
                          title="Remove participant"
                        >
                          <UserX className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center - video grid */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Video grid */}
          <div className="flex-1 p-3 sm:p-4 overflow-auto">
            <div
              className={`grid gap-3 sm:gap-4 h-full auto-rows-fr ${
                peers.size === 0
                  ? "grid-cols-1"
                  : peers.size === 1
                  ? "grid-cols-1 lg:grid-cols-2"
                  : peers.size <= 4
                  ? "grid-cols-2"
                  : peers.size <= 9
                  ? "grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-2 lg:grid-cols-4"
              }`}
            >
              {/* Local video */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative rounded-2xl overflow-hidden border aspect-video shadow-xl group transition-all duration-300 ${
                  isDark 
                    ? "bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-white/10 hover:border-purple-500/30" 
                    : "bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 border-gray-200 hover:border-purple-400"
                }`}
              >
                {cameraOn ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg">
                      {myUserName?.charAt(0)?.toUpperCase() || "Y"}
                    </div>
                  </div>
                )}
                {/* Name label */}
                <div className={`absolute bottom-0 left-0 right-0 p-3 z-20 ${
                  isDark 
                    ? "bg-gradient-to-t from-black/80 via-black/40 to-transparent" 
                    : "bg-gradient-to-t from-gray-900/70 via-gray-900/30 to-transparent"
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">
                      You{" "}
                      {isHost && (
                        <span className="bg-yellow-500 text-black px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ml-1">
                          Host
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                {/* Mic off indicator */}
                {!micOn && (
                  <div className="absolute top-3 right-3 bg-red-500/90 p-2 rounded-full shadow-lg z-20">
                    <MicOff className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                )}
                {/* Camera off indicator */}
                {!cameraOn && (
                  <div className="absolute top-3 left-3 bg-red-500/90 p-2 rounded-full shadow-lg z-20">
                    <VideoOff className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                )}
              </motion.div>

              {/* Remote videos */}
              {Array.from(peers.entries()).map(([peerId, peerData]) => {
                const displayName =
                  peerData.name ||
                  peerData.userName ||
                  peerData.displayName ||
                  `Participant ${peerId.slice(-4)}`;

                console.log(
                  `[Meeting SFU] Rendering RemoteVideoSFU for peer ${peerId}:`,
                  {
                    name: displayName,
                    hasVideoTrack: !!peerData.videoTrack,
                    hasAudioTrack: !!peerData.audioTrack,
                    videoTrackState: peerData.videoTrack?.readyState,
                    audioTrackState: peerData.audioTrack?.readyState,
                  }
                );
                return (
                  <RemoteVideoSFU
                    key={peerId}
                    peerId={peerId}
                    videoTrack={peerData.videoTrack}
                    audioTrack={peerData.audioTrack}
                    screenTrack={peerData.screenTrack}
                    name={displayName}
                    isHost={peerData.isHost}
                    isDark={isDark}
                  />
                );
              })}
            </div>
          </div>

          {/* Bottom controls */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`backdrop-blur-xl border-t p-3 sm:p-4 ${
              isDark 
                ? "bg-slate-900/80 border-white/10" 
                : "bg-white/80 border-gray-200"
            }`}
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {/* Toggle Mic */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMic}
                className={`p-3 sm:p-4 rounded-2xl transition-all duration-300 ${
                  micOn
                    ? isDark 
                      ? "bg-white/10 hover:bg-white/20 border border-white/20" 
                      : "bg-gray-100 hover:bg-gray-200 border border-gray-300"
                    : "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30"
                }`}
                title={micOn ? "Mute" : "Unmute"}
              >
                {micOn ? (
                  <Mic className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? "text-white" : "text-gray-700"}`} />
                ) : (
                  <MicOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                )}
              </motion.button>

              {/* Toggle Camera */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleCamera}
                className={`p-3 sm:p-4 rounded-2xl transition-all duration-300 ${
                  cameraOn
                    ? isDark 
                      ? "bg-white/10 hover:bg-white/20 border border-white/20" 
                      : "bg-gray-100 hover:bg-gray-200 border border-gray-300"
                    : "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30"
                }`}
                title={cameraOn ? "Turn off camera" : "Turn on camera"}
              >
                {cameraOn ? (
                  <Video className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? "text-white" : "text-gray-700"}`} />
                ) : (
                  <VideoOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                )}
              </motion.button>

              {/* Toggle Screen Share */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleScreenShare}
                className={`p-3 sm:p-4 rounded-2xl transition-all duration-300 ${
                  isScreenSharing
                    ? "bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/30"
                    : isDark 
                      ? "bg-white/10 hover:bg-white/20 border border-white/20" 
                      : "bg-gray-100 hover:bg-gray-200 border border-gray-300"
                }`}
                title={isScreenSharing ? "Stop sharing" : "Share screen"}
              >
                {isScreenSharing ? (
                  <MonitorOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                ) : (
                  <Monitor className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? "text-white" : "text-gray-700"}`} />
                )}
              </motion.button>

              {/* Toggle Chat */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowChat(!showChat)}
                className={`p-3 sm:p-4 rounded-2xl transition-all duration-300 relative ${
                  showChat
                    ? "bg-purple-500 hover:bg-purple-600 shadow-lg shadow-purple-500/30"
                    : isDark 
                      ? "bg-white/10 hover:bg-white/20 border border-white/20" 
                      : "bg-gray-100 hover:bg-gray-200 border border-gray-300"
                }`}
                title="Chat"
              >
                <MessageSquare className={`w-5 h-5 sm:w-6 sm:h-6 ${
                  showChat ? "text-white" : isDark ? "text-white" : "text-gray-700"
                }`} />
                {chatMessages.length > 0 && !showChat && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                    {chatMessages.length > 9 ? "9+" : chatMessages.length}
                  </span>
                )}
              </motion.button>

              {/* Toggle Participants */}
              {!showParticipants && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowParticipants(true)}
                  className={`p-3 sm:p-4 rounded-2xl transition-all duration-300 ${
                    isDark 
                      ? "bg-white/10 hover:bg-white/20 border border-white/20" 
                      : "bg-gray-100 hover:bg-gray-200 border border-gray-300"
                  }`}
                  title="Show participants"
                >
                  <Users className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? "text-white" : "text-gray-700"}`} />
                </motion.button>
              )}

              {/* Leave Meeting */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={leaveMeeting}
                className="p-3 sm:p-4 px-4 sm:px-6 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg shadow-red-500/30 flex items-center gap-2"
                title="Leave meeting"
              >
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white transform rotate-135" />
                <span className="text-white font-medium hidden sm:inline">
                  Leave
                </span>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Right sidebar - chat panel */}
        <AnimatePresence>
          {showChat && (
            <motion.div 
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`w-72 sm:w-80 backdrop-blur-xl border-l flex flex-col ${
                isDark 
                  ? "bg-slate-900/60 border-white/10" 
                  : "bg-white/60 border-gray-200"
              }`}
            >
              <div className={`p-4 border-b flex items-center justify-between ${
                isDark ? "border-white/10" : "border-gray-200"
              }`}>
                <h2 className={`font-semibold flex items-center gap-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>
                  <div className={`p-2 rounded-lg ${isDark ? "bg-purple-500/20" : "bg-purple-100"}`}>
                    <MessageSquare className={`w-4 h-4 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
                  </div>
                  <span>Chat</span>
                </h2>
                <button
                  onClick={() => setShowChat(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? "hover:bg-white/10 text-white/70" : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 && (
                  <div className={`text-center py-8 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs mt-1">Be the first to say hello!</p>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl p-3 border transition-all duration-300 ${
                      isDark 
                        ? "bg-white/5 border-white/5 hover:border-purple-500/20" 
                        : "bg-gray-50 border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                        {msg.from?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <p className={`text-xs font-semibold ${isDark ? "text-purple-400" : "text-purple-600"}`}>
                        {msg.from}
                      </p>
                      <p className={`text-[10px] ml-auto ${isDark ? "text-white/40" : "text-gray-400"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <p className={`text-sm pl-8 ${isDark ? "text-white" : "text-gray-700"}`}>
                      {msg.message}
                    </p>
                  </motion.div>
                ))}
              </div>
              <div className={`p-4 border-t ${isDark ? "border-white/10" : "border-gray-200"}`}>
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message..."
                    className={`flex-1 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 border transition-all ${
                      isDark 
                        ? "bg-white/10 text-white placeholder-white/40 border-white/10 focus:border-purple-500/50" 
                        : "bg-gray-100 text-gray-900 placeholder-gray-400 border-gray-200 focus:border-purple-400"
                    }`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-purple-500/30"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// RemoteVideoSFU component for SFU mode
const RemoteVideoSFU = ({
  peerId,
  videoTrack,
  audioTrack,
  screenTrack,
  name,
  isHost,
  isDark,
}) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // Handle video track (camera or screen)
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) {
      console.log(`[RemoteVideo SFU] No video element ref for ${name}`);
      return;
    }

    // Prioritize screen track over video track
    const track = screenTrack || videoTrack;

    if (track) {
      console.log(`[RemoteVideo SFU] Setting up video for ${name}:`, {
        trackId: track.id,
        readyState: track.readyState,
        enabled: track.enabled,
        muted: track.muted,
        kind: track.kind,
      });

      // Ensure track is enabled
      if (!track.enabled) {
        console.log(
          `[RemoteVideo SFU] ⚠️ Track was disabled, enabling it for ${name}`
        );
        track.enabled = true;
      }

      const stream = new MediaStream([track]);
      videoElement.srcObject = stream;

      console.log(`[RemoteVideo SFU] Video element state for ${name}:`, {
        srcObject: !!videoElement.srcObject,
        srcObjectTracks: videoElement.srcObject?.getTracks().length,
        readyState: videoElement.readyState,
        videoWidth: videoElement.videoWidth,
        videoHeight: videoElement.videoHeight,
        paused: videoElement.paused,
        autoplay: videoElement.autoplay,
        muted: videoElement.muted,
      });

      // Explicitly try to play the video immediately
      videoElement.play().catch((err) => {
        console.warn(
          `[RemoteVideo SFU] Initial autoplay failed for ${name}:`,
          err.message
        );
      });

      // Since we have autoPlay attribute, the browser should handle playback
      // But let's also monitor when it actually starts playing
      videoElement.onplaying = () => {
        console.log(
          `[RemoteVideo SFU] ✅ 'playing' event fired for ${name}!`,
          videoElement.videoWidth,
          "x",
          videoElement.videoHeight
        );
      };

      videoElement.onloadedmetadata = () => {
        console.log(
          `[RemoteVideo SFU] 📊 Metadata loaded for ${name}:`,
          videoElement.videoWidth,
          "x",
          videoElement.videoHeight,
          "readyState:",
          videoElement.readyState
        );
        // Try to play when metadata is loaded
        if (videoElement.paused) {
          videoElement.play().catch((err) => {
            console.warn(
              `[RemoteVideo SFU] Play on metadata loaded failed for ${name}:`,
              err.message
            );
          });
        }
      };

      videoElement.oncanplay = () => {
        console.log(
          `[RemoteVideo SFU] 📊 Can play for ${name}, readyState:`,
          videoElement.readyState
        );
        // Try to play when can play
        if (videoElement.paused) {
          videoElement.play().catch((err) => {
            console.warn(
              `[RemoteVideo SFU] Play on canplay failed for ${name}:`,
              err.message
            );
          });
        }
      };

      // Multiple retry attempts to ensure video plays
      const retryPlay = (attempt = 1, maxAttempts = 3) => {
        setTimeout(() => {
          if (videoElement.paused && attempt <= maxAttempts) {
            console.log(
              `[RemoteVideo SFU] 🔄 Video still paused (attempt ${attempt}/${maxAttempts}), state:`,
              videoElement.readyState,
              "dimensions:",
              videoElement.videoWidth,
              "x",
              videoElement.videoHeight
            );

            // If no dimensions yet and track is live, the video might need more time
            if (videoElement.videoWidth === 0 && track.readyState === "live") {
              console.log(
                `[RemoteVideo SFU] ⏳ Waiting for video dimensions for ${name}...`
              );
            }

            videoElement.play().catch((err) => {
              console.warn(
                `[RemoteVideo SFU] ⚠️ Play attempt ${attempt} failed:`,
                err.message
              );
            });

            // Retry with exponential backoff
            if (attempt < maxAttempts) {
              retryPlay(attempt + 1, maxAttempts);
            }
          } else if (videoElement.paused) {
            console.error(
              `[RemoteVideo SFU] ❌ Video failed to play after ${maxAttempts} attempts for ${name}`
            );
          } else {
            console.log(`[RemoteVideo SFU] ✅ Video playing for ${name}`);
          }
        }, attempt * 500); // 500ms, 1s, 1.5s
      };

      retryPlay();

      return () => {
        console.log(`[RemoteVideo SFU] 🧹 Cleaning up video for ${name}`);
        if (videoElement) {
          videoElement.srcObject = null;
        }
      };
    } else {
      videoElement.srcObject = null;
    }

    return () => {
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [videoTrack, screenTrack, name]);

  // Handle audio track
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (audioTrack) {
      const stream = new MediaStream([audioTrack]);
      audioElement.srcObject = stream;

      const playAudio = async () => {
        try {
          await audioElement.play();
        } catch (err) {
          console.warn(
            `[RemoteVideo SFU] Audio autoplay failed for ${name}:`,
            err.message
          );
        }
      };

      audioElement.onloadedmetadata = playAudio;
      if (audioElement.readyState >= 1) {
        playAudio();
      }
    } else {
      audioElement.srcObject = null;
    }

    return () => {
      if (audioElement) {
        audioElement.srcObject = null;
      }
    };
  }, [audioTrack, name]);

  const hasVideo = videoTrack || screenTrack;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative aspect-video overflow-hidden rounded-2xl border shadow-xl group transition-all duration-300 ${
        isDark 
          ? "bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border-white/10 hover:border-purple-500/30" 
          : "bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 border-gray-200 hover:border-purple-400"
      }`}
    >
      {/* Video element - always rendered but conditionally visible */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover absolute inset-0 ${
          hasVideo ? "opacity-100 z-10" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Avatar when no video */}
      {!hasVideo && (
        <div className="w-full h-full flex items-center justify-center absolute inset-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg">
            {name?.charAt(0)?.toUpperCase() || "?"}
          </div>
        </div>
      )}

      {/* Hidden audio element */}
      <audio ref={audioRef} autoPlay />

      {/* Name label - always visible at bottom */}
      <div className={`absolute bottom-0 left-0 right-0 p-3 z-20 ${
        isDark 
          ? "bg-gradient-to-t from-black/80 via-black/40 to-transparent" 
          : "bg-gradient-to-t from-gray-900/70 via-gray-900/30 to-transparent"
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-white font-medium text-sm truncate">
            {name || "Participant"}
          </span>
          {isHost && (
            <span className="bg-yellow-500 text-black px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
              Host
            </span>
          )}
          {screenTrack && (
            <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-[10px] font-medium">
              🖥️ Screen
            </span>
          )}
        </div>
      </div>

      {/* Connection indicator */}
      <div className="absolute top-3 right-3 z-20">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
      </div>
    </motion.div>
  );
};

export default MeetingRoom;
