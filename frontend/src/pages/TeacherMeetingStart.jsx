import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { io } from "socket.io-client";
import { getSocketUrl } from "../lib/apiConfig";
import { Button } from "../components/ui/Button";
import { Video, Copy } from "lucide-react";

const TeacherMeetingStart = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState("");

  const createMeeting = async () => {
    if (!user) {
      alert("Please login first");
      return;
    }

    setIsCreating(true);

    // Connect to meeting namespace
    const meetSocket = io(getSocketUrl() + "/meeting", {
      transports: ["websocket", "polling"],
    });

    meetSocket.on("connect", () => {
      console.log("[Teacher] Connected to meeting server");

      // Create meeting
      meetSocket.emit(
        "meeting:create",
        {
          roomId: roomId.trim() || undefined,
          hostUserId: user.id,
          title: title || "My Meeting",
        },
        (response) => {
          setIsCreating(false);
          meetSocket.disconnect();

          if (response?.success) {
            const generatedRoomId = response.roomId;
            setCreatedRoomId(generatedRoomId);
            console.log("[Teacher] Meeting created:", generatedRoomId);

            // Navigate to meeting room
            setTimeout(() => {
              navigate(`/meeting/${generatedRoomId}`);
            }, 1000);
          } else {
            alert(response?.error || "Failed to create meeting");
          }
        }
      );
    });

    meetSocket.on("connect_error", (err) => {
      console.error("[Teacher] Connection error:", err);
      setIsCreating(false);
      alert("Failed to connect to meeting server");
    });
  };

  const copyRoomId = () => {
    if (createdRoomId) {
      navigator.clipboard.writeText(createdRoomId);
      alert("Room ID copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <Video className="w-8 h-8 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Start a Meeting</h1>
        </div>

        {!createdRoomId ? (
          <>
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Meeting Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Physics Class"
                />
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Custom Room ID (optional)
                </label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Leave blank for auto-generated"
                />
              </div>

              <Button
                onClick={createMeeting}
                disabled={isCreating}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-all"
              >
                {isCreating ? "Creating Meeting..." : "Create & Start Meeting"}
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Share the room ID with students after creating the meeting.
              </p>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-4">
              <p className="text-green-300 text-sm mb-2">
                Meeting Created Successfully!
              </p>
              <div className="flex items-center justify-between bg-white/10 rounded px-3 py-2">
                <span className="text-white font-mono text-lg">
                  {createdRoomId}
                </span>
                <Button onClick={copyRoomId} size="sm" variant="ghost">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <p className="text-white text-sm text-center">
              Redirecting to meeting room...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherMeetingStart;
