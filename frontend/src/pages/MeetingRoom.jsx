import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { AuthContext } from "../context/AuthContext";
import { getSocketUrl, getMeetingWsUrl } from "../lib/apiConfig";
import MediasoupHandler from "../lib/mediasoupClient";
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
} from "lucide-react";

const MeetingRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

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
      transports: ["websocket", "polling"],
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

      // Join meeting with SFU mode
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex flex-col">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-black/60 via-black/40 to-black/60 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <Video className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-white text-lg font-bold">Meeting Room</h1>
              <p className="text-white/50 text-xs font-mono">{roomId}</p>
            </div>
          </div>
          <button
            onClick={copyRoomId}
            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 group relative"
            title="Copy Room ID"
          >
            {copiedRoomId ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <Copy className="w-5 h-5 text-white/70 group-hover:text-purple-400" />
            )}
            {copiedRoomId && (
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                Copied!
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Connection indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">
              {participants.length} participant
              {participants.length !== 1 ? "s" : ""}
            </span>
          </div>
          {isHost && (
            <button
              onClick={endMeeting}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-red-500/30"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">End Meeting</span>
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - participants panel (collapsible) */}
        {showParticipants && (
          <div className="w-80 bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <span>Participants ({participants.length})</span>
              </h2>
              <button
                onClick={() => setShowParticipants(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {participants.map((p) => (
                <div
                  key={p.socketId || p.userId}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-purple-500/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                      {(p.userName || p.name || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium flex items-center gap-2">
                        {p.userName || p.name || "Participant"}
                        {p.peerId === mySocketId && (
                          <span className="px-2 py-0.5 text-[10px] bg-green-500/20 text-green-400 rounded-full font-medium">
                            You
                          </span>
                        )}
                        {p.isHost && (
                          <span className="px-2 py-0.5 text-[10px] bg-yellow-500/20 text-yellow-400 rounded-full font-medium">
                            Host
                          </span>
                        )}
                      </p>
                      {p.role && (
                        <p className="text-white/50 text-xs capitalize">
                          {p.role}
                        </p>
                      )}
                    </div>
                  </div>
                  {isHost && !p.isHost && p.peerId !== mySocketId && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleMuteParticipant(p.socketId)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Mute participant"
                      >
                        <MicOff className="w-4 h-4 text-red-400" />
                      </button>
                      <button
                        onClick={() => handleRemoveParticipant(p.socketId)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Remove participant"
                      >
                        <UserX className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Center - video grid */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Video grid */}
          <div className="flex-1 p-4 overflow-auto">
            <div
              className={`grid gap-4 h-full ${
                peers.size === 0
                  ? "grid-cols-1"
                  : peers.size === 1
                  ? "grid-cols-1"
                  : peers.size <= 4
                  ? "grid-cols-2"
                  : peers.size <= 9
                  ? "grid-cols-3"
                  : "grid-cols-4"
              }`}
            >
              {/* Local video */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 shadow-xl group hover:border-purple-500/30 transition-all duration-300">
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
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                      {myUserName?.charAt(0)?.toUpperCase() || "Y"}
                    </div>
                  </div>
                )}
                {/* Name label */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 z-20">
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
                    <MicOff className="w-4 h-4 text-white" />
                  </div>
                )}
                {/* Camera off indicator */}
                {!cameraOn && (
                  <div className="absolute top-3 left-3 bg-red-500/90 p-2 rounded-full shadow-lg z-20">
                    <VideoOff className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

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
                  />
                );
              })}
            </div>
          </div>

          {/* Bottom controls */}
          <div className="bg-gradient-to-r from-black/60 via-black/40 to-black/60 backdrop-blur-xl border-t border-white/10 p-4">
            <div className="flex items-center justify-center gap-4">
              {/* Toggle Mic */}
              <button
                onClick={toggleMic}
                className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  micOn
                    ? "bg-white/10 hover:bg-white/20 border border-white/20"
                    : "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30"
                }`}
                title={micOn ? "Mute" : "Unmute"}
              >
                {micOn ? (
                  <Mic className="w-6 h-6 text-white" />
                ) : (
                  <MicOff className="w-6 h-6 text-white" />
                )}
              </button>

              {/* Toggle Camera */}
              <button
                onClick={toggleCamera}
                className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  cameraOn
                    ? "bg-white/10 hover:bg-white/20 border border-white/20"
                    : "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30"
                }`}
                title={cameraOn ? "Turn off camera" : "Turn on camera"}
              >
                {cameraOn ? (
                  <Video className="w-6 h-6 text-white" />
                ) : (
                  <VideoOff className="w-6 h-6 text-white" />
                )}
              </button>

              {/* Toggle Screen Share */}
              <button
                onClick={toggleScreenShare}
                className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  isScreenSharing
                    ? "bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/30"
                    : "bg-white/10 hover:bg-white/20 border border-white/20"
                }`}
                title={isScreenSharing ? "Stop sharing" : "Share screen"}
              >
                {isScreenSharing ? (
                  <MonitorOff className="w-6 h-6 text-white" />
                ) : (
                  <Monitor className="w-6 h-6 text-white" />
                )}
              </button>

              {/* Toggle Chat */}
              <button
                onClick={() => setShowChat(!showChat)}
                className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 relative ${
                  showChat
                    ? "bg-purple-500 hover:bg-purple-600 shadow-lg shadow-purple-500/30"
                    : "bg-white/10 hover:bg-white/20 border border-white/20"
                }`}
                title="Chat"
              >
                <MessageSquare className="w-6 h-6 text-white" />
                {chatMessages.length > 0 && !showChat && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                    {chatMessages.length > 9 ? "9+" : chatMessages.length}
                  </span>
                )}
              </button>

              {/* Toggle Participants */}
              {!showParticipants && (
                <button
                  onClick={() => setShowParticipants(true)}
                  className="p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300 transform hover:scale-105"
                  title="Show participants"
                >
                  <Users className="w-6 h-6 text-white" />
                </button>
              )}

              {/* Leave Meeting */}
              <button
                onClick={leaveMeeting}
                className="p-4 px-6 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/30 flex items-center gap-2"
                title="Leave meeting"
              >
                <Phone className="w-6 h-6 text-white transform rotate-135" />
                <span className="text-white font-medium hidden sm:inline">
                  Leave
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right sidebar - chat panel (collapsible) */}
        {showChat && (
          <div className="w-80 bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-xl border-l border-white/10 flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                </div>
                <span>Chat</span>
              </h2>
              <button
                onClick={() => setShowChat(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 && (
                <div className="text-center text-white/40 py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs mt-1">Be the first to say hello!</p>
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 rounded-xl p-3 border border-white/5 hover:border-purple-500/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                      {msg.from?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <p className="text-purple-400 text-xs font-semibold">
                      {msg.from}
                    </p>
                    <p className="text-white/40 text-[10px] ml-auto">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <p className="text-white text-sm pl-8">{msg.message}</p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/10">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/10 text-white placeholder-white/40 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 border border-white/10 focus:border-purple-500/50 transition-all"
                />
                <button
                  type="submit"
                  className="px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        )}
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
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 border border-white/10 shadow-xl group hover:border-purple-500/30 transition-all duration-300">
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
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {name?.charAt(0)?.toUpperCase() || "?"}
          </div>
        </div>
      )}

      {/* Hidden audio element */}
      <audio ref={audioRef} autoPlay />

      {/* Name label - always visible at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 z-20">
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
    </div>
  );
};

export default MeetingRoom;
