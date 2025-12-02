import React, { useEffect, useState, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { AuthContext } from "../context/AuthContext";
import { getSocketUrl, getMeetingWsUrl } from "../lib/apiConfig";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Users,
  MessageSquare,
  PhoneOff,
  Settings,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "../components/ui/Button";

const MeetingRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [socket, setSocket] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [peers, setPeers] = useState(new Map()); // socketId -> {stream, name, userId, role}
  const [participants, setParticipants] = useState([]);
  const [mySocketId, setMySocketId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const calledPeersRef = useRef(new Set()); // Track peers we've already called
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [copiedRoomId, setCopiedRoomId] = useState(false);

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null); // Ref to always access current localStream
  const peerConnectionsRef = useRef(new Map()); // socketId -> RTCPeerConnection
  const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // Initialize socket connection to meeting service
  useEffect(() => {
    // Get meeting WebSocket URL from config (direct connection for WebRTC signaling)
    const meetingWsUrl = getMeetingWsUrl();
    const meetingUrl = meetingWsUrl
      .replace("ws://", "http://")
      .replace("wss://", "https://");
    const meetSocket = io(meetingUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    meetSocket.on("connect", () => {
      console.log("[Meeting] Connected:", meetSocket.id);
      setMySocketId(meetSocket.id);
      // Join the meeting room
      meetSocket.emit(
        "join-meeting",
        {
          roomId,
          userId: user?.id || user?._id || null,
          userName: user?.name || user?.username || "Guest",
          userPicture: user?.picture || user?.profilePicture || null,
          isVideoEnabled: true,
          isAudioEnabled: true,
        },
        (response) => {
          if (response?.success) {
            console.log("[Meeting] Joined room:", roomId);
            setParticipants(response.meeting?.participants || []);
          } else {
            console.error("[Meeting] Failed to join:", response?.error);
            alert(response?.error || "Failed to join meeting");
            navigate("/");
          }
        }
      );
    });

    // Incoming media offer from peer
    meetSocket.on(
      "webrtc-offer",
      async ({ offer, from, socketId: fromSocket }) => {
        console.log("[Meeting] Received offer from", fromSocket, "from:", from);
        console.log(
          "[Meeting] Local stream available:",
          !!localStreamRef.current
        );

        // Store the name of the peer
        setPeers((prev) => {
          const updated = new Map(prev);
          const existing = updated.get(fromSocket) || {};
          updated.set(fromSocket, { ...existing, name: from });
          return updated;
        });

        try {
          const pc = createPeerConnection(fromSocket);
          console.log(
            "[Meeting] Peer connection created, setting remote description"
          );
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          console.log("[Meeting] Remote description set, creating answer");
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          console.log("[Meeting] Sending answer to", fromSocket);
          meetSocket.emit("webrtc-answer", {
            targetSocketId: fromSocket,
            answer,
          });
        } catch (err) {
          console.error("[Meeting] Error handling offer:", err);
        }
      }
    );

    // Incoming answer
    meetSocket.on(
      "webrtc-answer",
      async ({ answer, from, socketId: fromSocket }) => {
        console.log(
          "[Meeting] Received answer from",
          fromSocket,
          "from:",
          from
        );
        // Store the name of the peer
        setPeers((prev) => {
          const updated = new Map(prev);
          const existing = updated.get(fromSocket) || {};
          updated.set(fromSocket, { ...existing, name: from });
          return updated;
        });
        const pc = peerConnectionsRef.current.get(fromSocket);
        if (pc) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            console.log("[Meeting] Answer set successfully for", fromSocket);
          } catch (err) {
            console.error("[Meeting] Error setting answer:", err);
          }
        } else {
          console.warn("[Meeting] No peer connection found for", fromSocket);
        }
      }
    );

    // Incoming ICE candidate
    meetSocket.on(
      "ice-candidate",
      async ({ candidate, from, socketId: fromSocket }) => {
        const pc = peerConnectionsRef.current.get(fromSocket);
        if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    );

    // New participant joined - initiate call to them
    meetSocket.on("participant-joined", (participant) => {
      console.log("[Meeting] New participant joined:", participant);
      const { socketId, userName, name, userId } = participant;

      // Add to participants list
      setParticipants((prev) => {
        // Check if already exists
        if (prev.some((p) => p.socketId === socketId)) return prev;
        return [...prev, { ...participant, name: userName || name }];
      });

      // Store peer info
      setPeers((prev) => {
        const updated = new Map(prev);
        updated.set(socketId, { name: userName || name, userId });
        return updated;
      });
    });

    // Participant left
    meetSocket.on("participant-left", ({ userId, socketId: leftSocketId }) => {
      console.log("[Meeting] Participant left:", userId, leftSocketId);

      // Find and remove participant
      setParticipants((prev) =>
        prev.filter((p) => p.userId !== userId && p.socketId !== leftSocketId)
      );

      // Clean up peer connection
      const socketToRemove =
        leftSocketId ||
        Array.from(peerConnectionsRef.current.keys()).find((sid) => {
          const peer = peerConnectionsRef.current.get(sid);
          return peer?.userId === userId;
        });

      if (socketToRemove) {
        const pc = peerConnectionsRef.current.get(socketToRemove);
        if (pc) {
          pc.close();
          peerConnectionsRef.current.delete(socketToRemove);
        }
        calledPeersRef.current.delete(socketToRemove);
        setPeers((prev) => {
          const updated = new Map(prev);
          updated.delete(socketToRemove);
          return updated;
        });
      }
    });

    // Participant list updates (on initial join)
    meetSocket.on(
      "existing-participants",
      ({ participants: newParticipants }) => {
        console.log("[Meeting] Participants updated", newParticipants);
        console.log("[Meeting] My socket ID:", meetSocket.id);
        setParticipants(newParticipants);

        // Clean up peers that are no longer in the participants list
        setPeers((prev) => {
          const updated = new Map(prev);
          const participantSocketIds = new Set(
            newParticipants.map((p) => p.socketId)
          );

          // Remove peers that left
          for (const [socketId] of updated) {
            if (!participantSocketIds.has(socketId)) {
              console.log(
                `[Meeting] Removing peer ${socketId} - no longer in participants`
              );
              // Close peer connection
              const pc = peerConnectionsRef.current.get(socketId);
              if (pc) {
                pc.close();
                peerConnectionsRef.current.delete(socketId);
              }
              calledPeersRef.current.delete(socketId);
              updated.delete(socketId);
            }
          }

          // Sync participant names to peers Map
          newParticipants.forEach((p) => {
            if (p.socketId && p.socketId !== meetSocket.id) {
              const existing = updated.get(p.socketId) || {};
              console.log(
                `[Meeting] Syncing peer ${p.socketId} with name ${p.name}`
              );
              updated.set(p.socketId, {
                ...existing,
                name: p.name,
                role: p.role,
                userId: p.userId,
              });
            }
          });
          console.log(
            "[Meeting] Updated peers Map:",
            Array.from(updated.entries())
          );
          return updated;
        });
      }
    );

    // Chat messages
    meetSocket.on("meeting-chat-message", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    // Screen share events
    meetSocket.on("screen:started", ({ socketId: sharerSocket }) => {
      console.log("[Meeting] Screen share started by", sharerSocket);
    });

    meetSocket.on("screen:stopped", ({ socketId: sharerSocket }) => {
      console.log("[Meeting] Screen share stopped by", sharerSocket);
      // Remove screen track for that peer if exists
    });

    // Meeting ended by host
    meetSocket.on("meeting:ended", ({ by }) => {
      alert("Meeting has been ended by host");
      navigate("/");
    });

    // Control events (host can mute/remove participant)
    meetSocket.on("control:mute", ({ by }) => {
      alert("You have been muted by the host");
      setMicOn(false);
      if (localStream) {
        localStream.getAudioTracks().forEach((t) => (t.enabled = false));
      }
    });

    meetSocket.on("control:removed", ({ by }) => {
      alert("You have been removed from the meeting by the host");
      navigate("/");
    });

    setSocket(meetSocket);

    return () => {
      meetSocket.disconnect();
      peerConnectionsRef.current.forEach((pc) => pc.close());
      localStream?.getTracks().forEach((t) => t.stop());
      screenStream?.getTracks().forEach((t) => t.stop());
    };
  }, [roomId, user, navigate]);

  // Start local media
  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        localStreamRef.current = stream; // Keep ref in sync
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        console.log("[Meeting] Local stream started");
      } catch (err) {
        console.error("[Meeting] getUserMedia error", err);
        alert("Failed to access camera/microphone");
      }
    })();
  }, []);

  // Create peer connection for a remote socket
  const createPeerConnection = (remoteSocketId) => {
    // Reuse existing peer connection if present
    if (peerConnectionsRef.current.has(remoteSocketId)) {
      return peerConnectionsRef.current.get(remoteSocketId);
    }

    console.log(`[Meeting] Creating new peer connection for ${remoteSocketId}`);
    const pc = new RTCPeerConnection(configuration);

    // Add local tracks to peer connection - Use ref to get current stream
    const currentStream = localStreamRef.current;
    if (currentStream) {
      currentStream.getTracks().forEach((track) => {
        console.log(
          `[Meeting] Adding ${track.kind} track to peer ${remoteSocketId}`
        );
        pc.addTrack(track, currentStream);
      });
    } else {
      console.warn(
        `[Meeting] No localStream available when creating peer connection for ${remoteSocketId}`
      );
    }

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      console.log(
        "[Meeting] Remote track received from",
        remoteSocketId,
        event.track.kind
      );
      const remoteStream = event.streams[0];
      setPeers((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(remoteSocketId) || {};
        updated.set(remoteSocketId, { ...existing, stream: remoteStream });
        console.log(`[Meeting] Updated peer ${remoteSocketId} with stream`);
        return updated;
      });
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("ice-candidate", {
          targetSocketId: remoteSocketId,
          candidate: event.candidate,
        });
      }
    };

    // Monitor connection state
    pc.onconnectionstatechange = () => {
      console.log(
        `[Meeting] Peer ${remoteSocketId} connection state: ${pc.connectionState}`
      );
    };

    pc.oniceconnectionstatechange = () => {
      console.log(
        `[Meeting] Peer ${remoteSocketId} ICE connection state: ${pc.iceConnectionState}`
      );
      if (
        pc.iceConnectionState === "failed" ||
        pc.iceConnectionState === "disconnected"
      ) {
        console.warn(
          `[Meeting] ICE state ${pc.iceConnectionState} for ${remoteSocketId}`
        );
      }
    };

    peerConnectionsRef.current.set(remoteSocketId, pc);
    return pc;
  };

  // Ensure all peer connections have local tracks once stream is ready
  useEffect(() => {
    if (!localStream || !socket) return;
    localStreamRef.current = localStream;

    console.log("[Meeting] Local stream ready, updating all peer connections");

    peerConnectionsRef.current.forEach(async (pc, socketId) => {
      const senders = pc.getSenders();
      console.log(`[Meeting] Peer ${socketId} has ${senders.length} senders`);

      let needsRenegotiation = false;

      for (const track of localStream.getTracks()) {
        const existingSender = senders.find(
          (sender) => sender.track && sender.track.kind === track.kind
        );

        if (existingSender) {
          console.log(
            `[Meeting] Replacing ${track.kind} track for peer ${socketId}`
          );
          existingSender.replaceTrack(track);
        } else {
          console.log(
            `[Meeting] Adding ${track.kind} track to peer ${socketId}`
          );
          pc.addTrack(track, localStream);
          needsRenegotiation = true;
        }
      }

      // After adding tracks, create new offer to renegotiate
      if (needsRenegotiation) {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("webrtc-offer", {
            targetSocketId: socketId,
            offer,
          });
          console.log(`[Meeting] Sent renegotiation offer to ${socketId}`);
        } catch (err) {
          console.error(`[Meeting] Error renegotiating with ${socketId}:`, err);
        }
      }
    });
  }, [localStream, socket, user]);

  // Call a peer: create offer
  const callPeer = async (remoteSocketId, peerName) => {
    try {
      console.log(
        `[Meeting] Creating offer for ${remoteSocketId} (${peerName})`
      );
      const pc = createPeerConnection(remoteSocketId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log(`[Meeting] Offer created and set for ${remoteSocketId}`);

      // Store peer name immediately
      if (peerName) {
        setPeers((prev) => {
          const updated = new Map(prev);
          const existing = updated.get(remoteSocketId) || {};
          updated.set(remoteSocketId, { ...existing, name: peerName });
          return updated;
        });
      }

      socket?.emit("webrtc-offer", {
        targetSocketId: remoteSocketId,
        offer,
        from: user?.name,
      });
      console.log(`[Meeting] Offer sent to ${remoteSocketId}`);
    } catch (err) {
      console.error(`[Meeting] Error calling peer ${remoteSocketId}:`, err);
    }
  };

  // Call all participants when local stream is ready
  useEffect(() => {
    if (localStream && socket && participants.length > 0 && mySocketId) {
      console.log(
        "[Meeting] === CALLING EFFECT TRIGGERED === Participants:",
        participants.length
      );
      console.log(
        "[Meeting] Participants to check:",
        participants.map((p) => ({ id: p.socketId, name: p.name }))
      );
      console.log(
        "[Meeting] Already called:",
        Array.from(calledPeersRef.current)
      );
      console.log(
        "[Meeting] Peer connections:",
        Array.from(peerConnectionsRef.current.keys())
      );
      console.log("[Meeting] My socket ID:", mySocketId);

      // Call all participants (both peers can send offers - backend handles negotiation)
      participants.forEach((p) => {
        // Skip self and already called peers
        if (
          p.socketId &&
          p.socketId !== mySocketId &&
          !calledPeersRef.current.has(p.socketId)
        ) {
          console.log("[Meeting] ✅ Calling peer", p.socketId, p.name);
          calledPeersRef.current.add(p.socketId);
          // Add small delay to avoid simultaneous calls
          setTimeout(() => {
            callPeer(p.socketId, p.name);
          }, 100);
        } else if (p.socketId === mySocketId) {
          console.log(`[Meeting] ⊗ Skipping self: ${p.socketId}`);
        } else if (calledPeersRef.current.has(p.socketId)) {
          console.log(`[Meeting] ✓ Already called: ${p.socketId} (${p.name})`);
        }
      });
      console.log("[Meeting] === CALLING EFFECT COMPLETE ===");
    }
  }, [localStream, socket, participants, mySocketId]);

  // Toggle microphone
  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setMicOn(!micOn);
    }
  };

  // Copy room ID to clipboard
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopiedRoomId(true);
      setTimeout(() => setCopiedRoomId(false), 2000);
    });
  };

  // Toggle camera
  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setCameraOn(!cameraOn);
    }
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

        // Replace video track in all peer connections
        const videoTrack = stream.getVideoTracks()[0];
        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");
          if (sender) sender.replaceTrack(videoTrack);
        });

        socket?.emit("screen:start", { roomId, socketId: socket.id });

        stream.getVideoTracks()[0].onended = () => {
          // Screen share stopped by user clicking stop in browser
          toggleScreenShare();
        };
      } catch (err) {
        console.error("[Meeting] Screen share error", err);
      }
    } else {
      // Stop screen share, revert to camera
      screenStream?.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
      setIsScreenSharing(false);

      // Revert to original camera video track
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");
          if (sender) sender.replaceTrack(videoTrack);
        });
      }

      socket?.emit("screen:stop", { roomId, socketId: socket.id });
    }
  };

  // Send chat message
  const sendMessage = () => {
    if (chatInput.trim() && socket) {
      socket.emit(
        "meeting-chat-message",
        {
          roomId,
          message: chatInput,
          userId: user?.id || user?._id || null,
          name: user?.name || user?.username || "Guest",
        },
        (response) => {
          if (response?.success) {
            setChatInput("");
          }
        }
      );
    }
  };

  // Leave meeting
  const leaveMeeting = () => {
    socket?.emit("meeting:leave", { roomId });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col">
      {/* Top bar */}
      <div className="bg-black/40 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-white text-lg font-semibold flex items-center gap-2">
            <Video className="w-5 h-5" />
            Meeting Room: {roomId}
          </h1>
          <button
            onClick={copyRoomId}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors group relative"
            title="Copy Room ID"
          >
            {copiedRoomId ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-white group-hover:text-blue-400" />
            )}
            {copiedRoomId && (
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Copied!
              </span>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowParticipants(!showParticipants)}
            className="text-white hover:bg-white/10"
          >
            <Users className="w-5 h-5 mr-1" />
            {participants.length}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowChat(!showChat)}
            className="text-white hover:bg-white/10"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main video grid */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-4 overflow-y-auto">
          {/* Local video */}
          <div className="bg-gray-800 rounded-xl relative aspect-video overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
              {user?.name || "You"} {!micOn && "🔇"} {!cameraOn && "📷"}
            </div>
          </div>

          {/* Remote peers */}
          {Array.from(peers.entries()).map(([socketId, peer]) => {
            // Find participant name from participants array as fallback
            const participant = participants.find(
              (p) => p.socketId === socketId
            );
            const displayName = peer.name || participant?.name || socketId;
            console.log(
              `[Meeting Render] Peer ${socketId}:`,
              peer,
              `| Participant:`,
              participant,
              `| Display: ${displayName}`
            );
            return (
              <RemoteVideo
                key={socketId}
                stream={peer.stream}
                name={displayName}
              />
            );
          })}
        </div>

        {/* Chat panel */}
        {showChat && (
          <div className="w-80 bg-black/50 backdrop-blur-md border-l border-white/10 flex flex-col">
            <div className="p-3 border-b border-white/10 text-white font-semibold">
              Chat
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chatMessages.map((msg, i) => (
                <div key={i} className="bg-white/5 rounded-lg p-2 text-white">
                  <div className="text-xs text-gray-400">{msg.name}</div>
                  <div className="text-sm">{msg.message}</div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-white/10 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 bg-white/10 text-white px-3 py-2 rounded-lg outline-none"
                placeholder="Type a message..."
              />
              <Button onClick={sendMessage} size="sm">
                Send
              </Button>
            </div>
          </div>
        )}

        {/* Participants panel */}
        {showParticipants && (
          <div className="w-60 bg-black/50 backdrop-blur-md border-l border-white/10 flex flex-col">
            <div className="p-3 border-b border-white/10 text-white font-semibold">
              Participants ({participants.length})
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {participants.map((p, i) => (
                <div
                  key={i}
                  className="bg-white/5 rounded-lg p-2 text-white text-sm flex items-center justify-between"
                >
                  <div>
                    <div>{p.name}</div>
                    <div className="text-xs text-gray-400">{p.role}</div>
                  </div>
                  {p.muted && <MicOff className="w-4 h-4 text-red-400" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="bg-black/40 backdrop-blur-md border-t border-white/10 px-4 py-4 flex items-center justify-center gap-3">
        <Button
          variant={micOn ? "default" : "destructive"}
          size="lg"
          onClick={toggleMic}
          className="rounded-full w-14 h-14 flex items-center justify-center"
        >
          {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </Button>

        <Button
          variant={cameraOn ? "default" : "destructive"}
          size="lg"
          onClick={toggleCamera}
          className="rounded-full w-14 h-14 flex items-center justify-center"
        >
          {cameraOn ? (
            <Video className="w-6 h-6" />
          ) : (
            <VideoOff className="w-6 h-6" />
          )}
        </Button>

        <Button
          variant={isScreenSharing ? "destructive" : "default"}
          size="lg"
          onClick={toggleScreenShare}
          className="rounded-full w-14 h-14 flex items-center justify-center"
        >
          {isScreenSharing ? (
            <MonitorOff className="w-6 h-6" />
          ) : (
            <Monitor className="w-6 h-6" />
          )}
        </Button>

        <Button
          variant="destructive"
          size="lg"
          onClick={leaveMeeting}
          className="rounded-full w-14 h-14 flex items-center justify-center bg-red-600 hover:bg-red-700"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

const RemoteVideo = ({ stream, name }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="bg-gray-800 rounded-xl relative aspect-video overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
        {name}
      </div>
    </div>
  );
};

export default MeetingRoom;
