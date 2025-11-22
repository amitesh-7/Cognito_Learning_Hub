# Google Meet-like Video Meeting Feature - Complete Implementation Guide

## 📋 Overview

A complete **WebRTC-based video meeting system** has been integrated into Cognito Learning Hub with full Google Meet–like functionality. This system supports teacher-hosted meetings and student participation with peer-to-peer video/audio streaming using Socket.IO for signaling.

---

## 🏗️ Architecture

### Backend Components

#### **Meeting Model** (`backend/models/Meeting.js`)

```javascript
- roomId (unique meeting identifier)
- hostUserId (teacher/host user ID)
- hostSocketId (current socket connection of host)
- title (meeting name)
- participants[] (array of participant objects with userId, name, role, socketId, muted, videoOff, joinedAt)
- locked (prevents new joins when true)
- joinRequests[] (pending join requests for locked meetings)
- timestamps (createdAt, updatedAt)
```

#### **Socket.IO Namespace** (`/meeting` namespace in `backend/index.js`)

The backend creates a **dedicated Socket.IO namespace** (`/meeting`) to handle all meeting-related events separately from other features (live sessions, duels, etc.).

**Meeting Namespace Events:**

- `meeting:create` - Host creates a new meeting room
- `meeting:join` - Participant joins a meeting
- `meeting:leave` - Participant leaves
- `meeting:end` - Host ends the entire meeting
- `meeting:participants` - Broadcast participant list updates
- `meeting:ended` - Notify all when meeting is ended by host

**WebRTC Signaling Events:**

- `media:offer` - Forward SDP offer to target peer
- `media:answer` - Forward SDP answer to target peer
- `media:candidate` - Forward ICE candidates

**Chat Events:**

- `chat:send` - Send message to room
- `chat:message` - Broadcast message to room
- `chat:delete` - Delete/moderate message

**Screen Sharing Events:**

- `screen:start` - Notify room when screen sharing starts
- `screen:stop` - Notify room when screen sharing stops

**Host Control Events:**

- `control:mute` - Host mutes a participant
- `control:remove` - Host removes a participant
- `control:removed` - Notification that user was removed

---

### Frontend Components

#### **Pages:**

1. **TeacherMeetingStart** (`/meeting/create`)

   - Teacher creates a new meeting with optional custom room ID
   - Generates shareable room ID
   - Redirects to MeetingRoom after creation

2. **StudentJoinMeeting** (`/meeting/join`)

   - Student enters room ID and name
   - Navigates to MeetingRoom

3. **MeetingRoom** (`/meeting/:roomId`)
   - Main video conferencing interface
   - Local video preview
   - Remote peer video grid
   - Controls bar (mic, camera, screen share, end call)
   - Chat panel (toggle)
   - Participants panel (toggle)

---

## 🚀 How to Use

### For Teachers (Hosts):

1. **Navigate to:** `/meeting/create`
2. **Enter meeting details:**
   - Meeting title (e.g., "Physics Class")
   - Optional custom room ID (auto-generated if blank)
3. **Click "Create & Start Meeting"**
4. **Share the generated Room ID** with students
5. **In the meeting room:**
   - Toggle mic/camera
   - Share screen
   - View participants list
   - Chat with students
   - End meeting (removes all participants)

### For Students:

1. **Navigate to:** `/meeting/join`
2. **Enter:**
   - Room ID (received from teacher)
   - Your name
3. **Click "Join Meeting"**
4. **In the meeting room:**
   - View teacher and other participants
   - Toggle your mic/camera
   - Send chat messages
   - Leave meeting

---

## 🔧 Technical Implementation Details

### WebRTC Connection Flow

1. **Local Media Acquisition:**

   ```javascript
   const stream = await navigator.mediaDevices.getUserMedia({
     video: true,
     audio: true,
   });
   ```

2. **Peer Connection Creation:**

   ```javascript
   const pc = new RTCPeerConnection({
     iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
   });
   pc.addTrack(track, localStream); // Add local tracks
   ```

3. **Signaling (SDP Offer/Answer Exchange):**

   - **Caller** creates offer → sends via `media:offer` → **Callee** receives, creates answer → sends via `media:answer`
   - **ICE candidates** are exchanged via `media:candidate` events

4. **Remote Stream Handling:**
   ```javascript
   pc.ontrack = (event) => {
     const remoteStream = event.streams[0];
     // Attach to video element
   };
   ```

### Socket.IO Connection

Frontend connects to **dedicated `/meeting` namespace:**

```javascript
const meetSocket = io(getSocketUrl() + "/meeting", {
  transports: ["websocket", "polling"],
  reconnection: true,
});
```

Backend handles connections in the `/meeting` namespace (separate from main Socket.IO instance).

---

## 🎨 UI/UX Features

### Layout:

- **Top bar:** Meeting info, participant count, chat toggle
- **Main area:** Video grid (responsive: 1-col mobile, 2-col tablet, 3-col desktop)
- **Side panels:** Chat (right), Participants (right)
- **Bottom controls:** Circular buttons for mic, camera, screen share, end call

### Styling:

- **Glassmorphism** effect on panels (`bg-black/50 backdrop-blur-md`)
- **Gradient backgrounds** (`from-gray-900 via-purple-900`)
- **Framer Motion** for smooth animations (if needed)
- **TailwindCSS** for responsive design

---

## 📡 Server Events Reference

### Backend Emits:

| Event                  | Payload                                | Description                        |
| ---------------------- | -------------------------------------- | ---------------------------------- |
| `meeting:participants` | `{ participants: [...] }`              | Broadcast updated participant list |
| `chat:message`         | `{ message, userId, name, timestamp }` | Broadcast chat message             |
| `screen:started`       | `{ socketId }`                         | Notify screen share started        |
| `screen:stopped`       | `{ socketId }`                         | Notify screen share stopped        |
| `meeting:ended`        | `{ by }`                               | Meeting ended by host              |
| `control:mute`         | `{ by }`                               | Host muted you                     |
| `control:removed`      | `{ by }`                               | You were removed                   |
| `media:offer`          | `{ offer, from, socketId }`            | Incoming WebRTC offer              |
| `media:answer`         | `{ answer, from, socketId }`           | Incoming WebRTC answer             |
| `media:candidate`      | `{ candidate, from, socketId }`        | Incoming ICE candidate             |

### Frontend Emits:

| Event             | Payload                             | Callback                       |
| ----------------- | ----------------------------------- | ------------------------------ |
| `meeting:create`  | `{ roomId?, hostUserId, title }`    | `{ success, roomId, error? }`  |
| `meeting:join`    | `{ roomId, userId, name, role }`    | `{ success, meeting, error? }` |
| `meeting:leave`   | `{ roomId }`                        | -                              |
| `meeting:end`     | `{ roomId, by }`                    | -                              |
| `media:offer`     | `{ to, offer, from }`               | -                              |
| `media:answer`    | `{ to, answer, from }`              | -                              |
| `media:candidate` | `{ to, candidate, from }`           | -                              |
| `chat:send`       | `{ roomId, message, userId, name }` | `{ success, error? }`          |
| `screen:start`    | `{ roomId, socketId }`              | -                              |
| `screen:stop`     | `{ roomId, socketId }`              | -                              |

---

## 🛡️ Security & Best Practices

### Implemented:

✅ **Namespace isolation:** Meeting signaling is separate from other Socket.IO events  
✅ **Authentication required:** Routes protected with `<ProtectedRoute>`  
✅ **Host verification:** Only host can end meeting, control participants  
✅ **STUN server:** Using Google's public STUN (`stun:stun.l.google.com:19302`)

### Recommended for Production:

⚠️ **TURN server:** Add a TURN server for NAT traversal (needed if STUN fails)  
⚠️ **JWT validation:** Validate user identity on socket events  
⚠️ **Rate limiting:** Prevent spam in chat/signaling  
⚠️ **Encryption:** Enable DTLS-SRTP (automatic in WebRTC, but verify)  
⚠️ **Meeting passwords:** Optional password protection for rooms

---

## 🐛 Troubleshooting

### Common Issues:

**1. "Failed to access camera/microphone"**

- **Cause:** Browser permissions denied or HTTPS required for `getUserMedia`
- **Fix:** Ensure HTTPS in production; on localhost, HTTP is allowed

**2. No video/audio from remote peers**

- **Cause:** ICE candidate exchange failed (firewall/NAT)
- **Fix:** Add a TURN server to configuration
  ```javascript
  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      {
        urls: "turn:your-turn-server.com",
        username: "user",
        credential: "pass",
      },
    ],
  };
  ```

**3. Socket connection fails**

- **Cause:** Backend URL mismatch or CORS
- **Fix:** Check `getSocketUrl()` returns correct backend URL; verify backend CORS allows origin

**4. Participants not appearing**

- **Cause:** Peer connections not initiated
- **Fix:** Ensure `callPeer()` is invoked for all participants when local stream is ready

**5. Screen sharing doesn't work**

- **Cause:** Browser doesn't support `getDisplayMedia` (very old browsers)
- **Fix:** Use modern browser (Chrome, Edge, Firefox, Safari 13+)

---

## 📦 Dependencies

### Backend:

- `socket.io` (already installed)
- `mongoose` (already installed)
- Meeting model file created

### Frontend:

- `socket.io-client` (already installed)
- `react-router-dom` (already installed)
- `lucide-react` (already installed for icons)
- WebRTC (native browser API, no package needed)

---

## 🔮 Future Enhancements

### Potential additions (not yet implemented):

- **Recording:** Record meeting using MediaRecorder API
- **Breakout rooms:** Split participants into smaller groups
- **Reactions:** Emoji reactions overlay
- **Virtual backgrounds:** Replace background with image/blur
- **Polls/Q&A:** Integrated polls during meeting
- **Whiteboard:** Collaborative drawing canvas
- **Raise hand:** Queue for speaking
- **Waiting room:** Host approves join requests

---

## 🧪 Testing Checklist

- [ ] Teacher can create meeting and receives room ID
- [ ] Student can join with room ID
- [ ] Video/audio streams between teacher and student
- [ ] Multiple students can join (3+ participants)
- [ ] Mic toggle mutes local audio
- [ ] Camera toggle disables local video
- [ ] Screen sharing works and replaces camera feed
- [ ] Chat messages appear for all participants
- [ ] Participant list updates when users join/leave
- [ ] Host can end meeting (all disconnected)
- [ ] Host can mute a participant
- [ ] Host can remove a participant
- [ ] Leaving meeting stops local tracks
- [ ] Reconnection after network drop (socket auto-reconnect)

---

## 📁 File Summary

### Created/Modified Files:

**Backend:**

- `backend/models/Meeting.js` ✅ Created
- `backend/index.js` ✅ Modified (added `/meeting` namespace handlers)

**Frontend:**

- `frontend/src/pages/TeacherMeetingStart.jsx` ✅ Created
- `frontend/src/pages/StudentJoinMeeting.jsx` ✅ Created
- `frontend/src/pages/MeetingRoom.jsx` ✅ Created
- `frontend/src/App.jsx` ✅ Modified (added meeting routes)

---

## 🚦 Quick Start Commands

### Start Backend:

```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:3001` (or `PORT` from `.env`)

### Start Frontend:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### Access Meeting:

- **Teacher:** Navigate to `http://localhost:5173/meeting/create`
- **Student:** Navigate to `http://localhost:5173/meeting/join` and enter room ID

---

## ✅ Summary

The **Google Meet–like video meeting system** is now fully integrated with:

- ✅ WebRTC peer-to-peer video/audio
- ✅ Socket.IO signaling (dedicated `/meeting` namespace)
- ✅ Teacher (host) and student roles
- ✅ Mic/camera/screen share controls
- ✅ Real-time chat
- ✅ Participant list
- ✅ Host controls (mute, remove, end meeting)
- ✅ Responsive UI with Tailwind/glassmorphism
- ✅ Graceful disconnect handling
- ✅ MongoDB persistence (meeting metadata)

**No external services required** — all signaling is handled by your existing Socket.IO backend. Ready for testing and production deployment!

---

**Need help?** Check the troubleshooting section or review the code comments in the created files.
