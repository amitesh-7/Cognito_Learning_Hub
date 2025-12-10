# Meeting Service Implementation Alternatives

## Current Implementation: WebRTC (Peer-to-Peer)

### Overview

The current meeting service uses **WebRTC** with a signaling server architecture:

- **Backend**: Socket.IO signaling server (relays connection data)
- **Media Transfer**: Direct peer-to-peer between clients
- **STUN/TURN**: For NAT traversal and firewall bypass
- **Redis**: For meeting state management

### Architecture

```
Client A ←→ Signaling Server ←→ Client B
    ↓                              ↓
    └──────── Direct P2P ──────────┘
         (Audio/Video)
```

### Current Stack

- **Socket.IO**: Real-time bidirectional communication
- **WebRTC APIs**: RTCPeerConnection, getUserMedia
- **STUN Servers**: Google STUN (free)
- **TURN Servers**: Optional (Coturn/Metered.ca)
- **Redis**: Meeting state cache
- **MongoDB**: Meeting persistence

---

## Alternative Solutions

### 1. **Media Server Architecture (SFU - Selective Forwarding Unit)**

#### Description

Instead of peer-to-peer, all media goes through a central media server that forwards streams to all participants.

#### Recommended Solutions

##### a) **Jitsi Meet (Open Source)**

- **Pros**:
  - Fully open source and free
  - Production-ready with excellent quality
  - Built-in SFU (Jitsi Videobridge)
  - Screen sharing, recording, live streaming
  - Mobile apps available
  - Active community support
  - Easy to self-host
- **Cons**:

  - Requires more server resources
  - Separate infrastructure needed
  - Additional maintenance overhead

- **Implementation**:

  ```javascript
  // Frontend - Jitsi IFrame API
  const domain = "meet.jit.si"; // or your self-hosted domain
  const options = {
    roomName: roomId,
    width: "100%",
    height: "100%",
    parentNode: document.querySelector("#meet-container"),
    userInfo: {
      displayName: user.name,
      email: user.email,
    },
    configOverwrite: {
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      enableWelcomePage: false,
    },
  };
  const api = new JitsiMeetExternalAPI(domain, options);
  ```

- **Backend Changes**:

  - Minimal - only need to generate room URLs and track participants
  - Can use JWT tokens for authentication
  - No WebRTC signaling needed

- **Cost**: Free (self-hosted) or $0.05/participant/month (8x8.vc hosted)

##### b) **mediasoup (Node.js SFU)**

- **Pros**:
  - High performance and scalability
  - Fine-grained control over media routing
  - Works with your existing Node.js backend
  - Supports thousands of participants
  - Low latency
- **Cons**:

  - Complex to implement
  - Requires C++ build tools
  - Steep learning curve
  - Need dedicated media servers

- **Implementation**:

  ```javascript
  // Backend
  const mediasoup = require("mediasoup");

  const worker = await mediasoup.createWorker({
    logLevel: "warn",
    rtcMinPort: 10000,
    rtcMaxPort: 10100,
  });

  const router = await worker.createRouter({
    mediaCodecs: [
      { kind: "audio", mimeType: "audio/opus", clockRate: 48000, channels: 2 },
      { kind: "video", mimeType: "video/VP8", clockRate: 90000 },
    ],
  });
  ```

- **Cost**: Free (open source) + server costs

##### c) **Janus Gateway**

- **Pros**:
  - Lightweight and fast
  - C-based for maximum performance
  - Modular plugin architecture
  - Supports WebRTC, SIP, streaming
- **Cons**:

  - Written in C (harder to customize)
  - Complex configuration
  - Requires understanding of WebRTC internals

- **Cost**: Free (open source)

---

### 2. **MCU (Multipoint Control Unit)**

#### Description

Server mixes all streams into single streams (audio/video) and sends to each participant.

##### **Kurento Media Server**

- **Pros**:
  - Advanced media processing capabilities
  - Recording, transcoding, computer vision
  - Good for broadcasting scenarios
  - WebRTC, RTP/RTSP support
- **Cons**:

  - High CPU usage (video mixing)
  - Complex to set up and maintain
  - Java-based backend required
  - Project less actively maintained

- **Use Case**: Best for scenarios requiring recording, transcoding, or special effects

- **Cost**: Free (open source)

---

### 3. **Cloud Video Platforms (Fully Managed)**

#### a) **Agora.io**

- **Pros**:
  - Enterprise-grade quality and reliability
  - Global CDN with low latency
  - Easy SDK integration
  - Recording, streaming, analytics
  - Excellent mobile support
  - AI features (noise cancellation, virtual backgrounds)
- **Cons**:

  - Cost can be high at scale
  - Vendor lock-in
  - Less control over infrastructure

- **Pricing**:

  - First 10,000 minutes/month: Free
  - Video: $0.99 - $3.99 per 1000 minutes
  - Recording: $1.49 per 1000 minutes

- **Implementation**:

  ```javascript
  // Frontend
  import AgoraRTC from "agora-rtc-sdk-ng";

  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  await client.join(APP_ID, roomId, token, userId);

  const localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();
  await client.publish(localTracks);
  ```

- **Backend**:

  ```javascript
  const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    roomId,
    userId,
    role,
    expireTime
  );
  ```

#### b) **Twilio Video**

- **Pros**:
  - Reliable and scalable infrastructure
  - Excellent documentation
  - Multiple SDKs (Web, iOS, Android, React Native)
  - Network quality insights
  - HIPAA compliant option
- **Cons**:

  - Expensive compared to alternatives
  - Vendor lock-in

- **Pricing**:

  - Group Rooms: $0.004/participant/minute
  - 1-to-1: $0.0015/participant/minute
  - Recording: $0.0008/minute

- **Implementation**:

  ```javascript
  // Frontend
  import { connect } from "twilio-video";

  const room = await connect(token, {
    name: roomId,
    audio: true,
    video: { width: 640 },
  });
  ```

#### c) **Amazon Chime SDK**

- **Pros**:
  - AWS integration
  - Pay-as-you-go pricing
  - High quality audio/video
  - Built-in features (background blur, noise suppression)
- **Cons**:

  - AWS ecosystem lock-in
  - More complex setup than Twilio/Agora

- **Pricing**:
  - $0.0017/attendee/minute (up to 25 attendees)
  - $0.00067/attendee/minute (26-100 attendees)
  - Recording: $0.0015/minute

#### d) **Daily.co**

- **Pros**:
  - Simple API and great DX
  - Generous free tier (10,000 minutes/month)
  - Pre-built UI components
  - Recording and live streaming
  - Great for quick implementation
- **Cons**:

  - Less established than Twilio/Agora
  - Fewer customization options

- **Pricing**:

  - Free: 10,000 minutes/month
  - Starter: $0.015/participant/minute

- **Implementation**:
  ```javascript
  // Frontend - Daily Prebuilt UI
  const callFrame = window.DailyIframe.createFrame({
    url: `https://your-domain.daily.co/${roomId}`,
    showLeaveButton: true,
  });
  ```

#### e) **Whereby (Embedded)**

- **Pros**:
  - Simplest implementation - just an iframe
  - No code needed for basic setup
  - White-label option
  - Good for MVPs
- **Cons**:

  - Limited customization
  - Higher cost for advanced features

- **Pricing**:
  - Free: 1 room, 100 participants
  - Starter: $9.99/room/month

---

### 4. **Live Streaming Platforms (One-to-Many)**

For lecture-style meetings (teacher to students):

#### **Mux Video**

- **Pros**:
  - Excellent for live streaming
  - Low latency streaming
  - Recording and VOD
  - Great analytics
- **Cons**:

  - One-way communication
  - Need separate solution for chat

- **Use Case**: Webinars, large classes (100+ students)

- **Pricing**: $0.005/stream/minute

---

## Comparison Matrix

| Solution           | Type  | Complexity | Cost (1000 mins) | Max Participants | Self-Host | Best For                  |
| ------------------ | ----- | ---------- | ---------------- | ---------------- | --------- | ------------------------- |
| **Current WebRTC** | P2P   | Medium     | Free-Low         | 4-8              | No        | Small meetings            |
| **Jitsi**          | SFU   | Low        | Free             | 50+              | Yes       | Cost-conscious, privacy   |
| **mediasoup**      | SFU   | High       | Free             | 1000+            | Yes       | Custom, scalable solution |
| **Agora**          | Cloud | Low        | $1-4             | 1000+            | No        | Enterprise quality        |
| **Twilio**         | Cloud | Low        | $2-4             | 1000+            | No        | Reliability, compliance   |
| **Daily**          | Cloud | Very Low   | $15              | 200+             | No        | Quick integration         |
| **Whereby**        | Cloud | Very Low   | $9.99/room       | 100              | No        | MVP, simple use           |
| **Chime SDK**      | Cloud | Medium     | $1.02-2.55       | 250              | No        | AWS ecosystem             |

---

## Recommendations by Use Case

### 1. **Current Setup (Keep WebRTC P2P) - Best for:**

- ✅ Budget-constrained projects
- ✅ Small meetings (2-4 participants)
- ✅ Direct peer communication desired
- ✅ Minimal infrastructure
- ❌ Large group calls (quality degrades)
- ❌ Users behind strict NATs/firewalls

**Action**: Add paid TURN servers (Twilio TURN, Xirsys) - ~$10-50/month

---

### 2. **Switch to Jitsi - Best for:**

- ✅ Open source requirement
- ✅ Data privacy/GDPR compliance
- ✅ Medium-large meetings (up to 100)
- ✅ Recording needed
- ✅ Self-hosting capability
- ❌ Don't want server maintenance
- ❌ Need guaranteed uptime SLA

**Migration Effort**: 2-4 days
**Cost**: Server costs only (~$20-100/month)

---

### 3. **Switch to Agora - Best for:**

- ✅ Production app with paying users
- ✅ Need reliable, high-quality video
- ✅ Global user base
- ✅ Mobile apps required
- ✅ Advanced features (AI, recording, streaming)
- ❌ Very tight budget
- ❌ Simple MVP only

**Migration Effort**: 1-2 days
**Cost**: ~$1-4 per 1000 minutes (free tier: 10,000 mins/month)

---

### 4. **Switch to Daily.co - Best for:**

- ✅ Quick time-to-market
- ✅ Don't want to manage infrastructure
- ✅ Need pre-built UI components
- ✅ Moderate usage
- ❌ Need full customization
- ❌ Very high usage (expensive at scale)

**Migration Effort**: 4-8 hours
**Cost**: Free up to 10,000 mins, then $15/1000 mins

---

## Migration Guide: WebRTC → Jitsi

### Step 1: Set up Jitsi Server

```bash
# Install on Ubuntu 20.04+
curl https://download.jitsi.org/jitsi-key.gpg.key | sudo sh -c 'gpg --dearmor > /usr/share/keyrings/jitsi-keyring.gpg'
echo 'deb [signed-by=/usr/share/keyrings/jitsi-keyring.gpg] https://download.jitsi.org stable/' | sudo tee /etc/apt/sources.list.d/jitsi-stable.list
sudo apt update
sudo apt install jitsi-meet
```

### Step 2: Backend Changes

```javascript
// routes/meetings.js
router.post("/create", authenticateToken, async (req, res) => {
  const { title, scheduledFor, settings } = req.body;

  const roomName = `${nanoid(10)}-${Date.now()}`;
  const jitsiUrl = `https://meet.jit.si/${roomName}`;

  const meeting = new Meeting({
    roomId: roomName,
    title,
    hostId: req.user.userId,
    jitsiUrl,
    scheduledFor,
    settings,
    status: "waiting",
  });

  await meeting.save();

  res.json({
    success: true,
    meeting: {
      roomId: roomName,
      jitsiUrl,
      ...meeting.toObject(),
    },
  });
});
```

### Step 3: Frontend Changes

```jsx
// MeetingRoom.jsx
import { useParams } from "react-router-dom";

const MeetingRoom = () => {
  const { roomId } = useParams();
  const jitsiContainerRef = useRef(null);
  const jitsiApi = useRef(null);

  useEffect(() => {
    const domain = "meet.jit.si"; // or your domain
    const options = {
      roomName: roomId,
      width: "100%",
      height: "100%",
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: user.name,
        email: user.email,
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        disableDeepLinking: true,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          "microphone",
          "camera",
          "desktop",
          "fullscreen",
          "fodeviceselection",
          "hangup",
          "chat",
          "recording",
          "livestreaming",
          "settings",
          "videoquality",
          "filmstrip",
          "stats",
          "shortcuts",
          "tileview",
        ],
      },
    };

    jitsiApi.current = new JitsiMeetExternalAPI(domain, options);

    // Event listeners
    jitsiApi.current.on("videoConferenceJoined", () => {
      console.log("Joined meeting");
    });

    jitsiApi.current.on("participantJoined", (participant) => {
      console.log("Participant joined:", participant);
    });

    return () => {
      jitsiApi.current?.dispose();
    };
  }, [roomId]);

  return <div ref={jitsiContainerRef} style={{ height: "100vh" }} />;
};
```

### Step 4: Remove Dependencies

```json
// package.json - Remove
{
  "dependencies": {
    "socket.io": "REMOVE",
    "socket.io-client": "REMOVE"
  }
}
```

---

## Migration Guide: WebRTC → Agora

### Step 1: Sign up & Get Credentials

1. Sign up at https://console.agora.io
2. Create a project
3. Get App ID and App Certificate
4. Enable token authentication

### Step 2: Backend Changes

```javascript
// Install
npm install agora-access-token

// routes/meetings.js
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERT = process.env.AGORA_APP_CERTIFICATE;

router.post("/create", authenticateToken, async (req, res) => {
  const { title, scheduledFor } = req.body;

  const roomId = nanoid(10);
  const uid = parseInt(req.user.userId.slice(-8), 16); // Convert to number

  // Generate token (valid for 24 hours)
  const expirationTimeInSeconds = 3600 * 24;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    AGORA_APP_ID,
    AGORA_APP_CERT,
    roomId,
    uid,
    RtcRole.PUBLISHER,
    privilegeExpiredTs
  );

  const meeting = new Meeting({
    roomId,
    title,
    hostId: req.user.userId,
    scheduledFor,
    status: "waiting",
  });

  await meeting.save();

  res.json({
    success: true,
    meeting,
    agora: {
      appId: AGORA_APP_ID,
      token,
      channel: roomId,
      uid
    }
  });
});
```

### Step 3: Frontend Changes

```jsx
// Install
npm install agora-rtc-sdk-ng

// MeetingRoom.jsx
import AgoraRTC from 'agora-rtc-sdk-ng';
import { useState, useEffect } from 'react';

const MeetingRoom = () => {
  const [client] = useState(AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));
  const [localTracks, setLocalTracks] = useState({ audio: null, video: null });
  const [remoteUsers, setRemoteUsers] = useState({});

  useEffect(() => {
    const init = async () => {
      // Fetch token from backend
      const response = await fetch(`/api/meetings/${roomId}/token`);
      const { agora } = await response.json();

      // Join channel
      await client.join(agora.appId, agora.channel, agora.token, agora.uid);

      // Create local tracks
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalTracks({ audio: audioTrack, video: videoTrack });

      // Publish local tracks
      await client.publish([audioTrack, videoTrack]);

      // Play local video
      videoTrack.play('local-video');

      // Subscribe to remote users
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);

        if (mediaType === 'video') {
          setRemoteUsers(prev => ({ ...prev, [user.uid]: user }));
          user.videoTrack.play(`remote-${user.uid}`);
        }
        if (mediaType === 'audio') {
          user.audioTrack.play();
        }
      });

      client.on('user-unpublished', (user) => {
        setRemoteUsers(prev => {
          const newUsers = { ...prev };
          delete newUsers[user.uid];
          return newUsers;
        });
      });
    };

    init();

    return () => {
      localTracks.audio?.close();
      localTracks.video?.close();
      client.leave();
    };
  }, [roomId]);

  return (
    <div className="meeting-room">
      <div id="local-video" style={{ width: 320, height: 240 }} />
      {Object.keys(remoteUsers).map(uid => (
        <div key={uid} id={`remote-${uid}`} style={{ width: 320, height: 240 }} />
      ))}
    </div>
  );
};
```

---

## Performance Considerations

### Current WebRTC P2P

- **Bandwidth per user**: O(n) - each user sends to all others
- **CPU**: Low (no server processing)
- **Latency**: Lowest (direct peer connection)
- **Max participants**: ~8 (before quality degrades)

### SFU (Jitsi/mediasoup)

- **Bandwidth per user**: O(1) - send once to server
- **CPU**: Medium (server forwards)
- **Latency**: Low (~50-150ms added)
- **Max participants**: 50-100+ (hardware dependent)

### MCU (Kurento)

- **Bandwidth per user**: O(1)
- **CPU**: High (server mixes video)
- **Latency**: Medium (~200-500ms)
- **Max participants**: 20-50 (very hardware intensive)

### Cloud (Agora/Twilio)

- **Bandwidth per user**: O(1)
- **CPU**: Offloaded to provider
- **Latency**: Low (global CDN)
- **Max participants**: 1000+ (provider limit)

---

## Cost Analysis (1000 meeting minutes)

| Solution                  | Cost    | Notes                            |
| ------------------------- | ------- | -------------------------------- |
| **Current WebRTC**        | $0-5    | TURN server costs only           |
| **Jitsi (self-host)**     | $5-20   | Server costs (2-4GB VPS)         |
| **mediasoup (self-host)** | $20-50  | More powerful server needed      |
| **Agora**                 | $1-4    | Pay per use, free tier available |
| **Twilio**                | $2-4    | Slightly more expensive          |
| **Daily**                 | $15     | After free 10k minutes           |
| **Amazon Chime**          | $1-2.55 | AWS pricing                      |
| **Whereby**               | $9.99   | Per room per month               |

---

## Final Recommendation

### For Cognito Learning Hub:

**Short-term (Current Phase)**:

- ✅ **Keep WebRTC P2P** with improved TURN servers
- Add Twilio TURN or Xirsys (~$10-20/month)
- Adequate for 1-on-1 teacher-student sessions
- Cost-effective for MVP

**Medium-term (Growth Phase)**:

- 🚀 **Migrate to Agora.io**
- Reason: Best balance of cost, quality, and ease of use
- 10,000 free minutes/month covers initial users
- Scales easily as you grow
- Professional quality expected in Ed-Tech
- Mobile SDK for future native apps

**Long-term (Scale Phase)**:

- 🏢 **Consider Jitsi (self-hosted)** or **mediasoup**
- When: 10,000+ monthly meeting minutes
- Reason: Cost savings at scale
- Full control over infrastructure
- Can customize for specific educational features

---

## Implementation Priority

### Priority 1: Quick Fixes (Current WebRTC)

**Time**: 1-2 hours
**Cost**: $10-20/month

1. Add paid TURN servers (Twilio/Xirsys)
2. Update TURN configuration in frontend
3. Test from different networks

### Priority 2: Upgrade to Agora (Recommended)

**Time**: 2-3 days
**Cost**: Free (10k mins) → $1-4/1000 mins

1. Sign up for Agora account
2. Implement token generation backend
3. Replace WebRTC code with Agora SDK
4. Add recording feature
5. Test and deploy

### Priority 3: Self-host Jitsi (Optional)

**Time**: 1 week
**Cost**: $20-50/month

1. Set up dedicated server
2. Install and configure Jitsi
3. Set up SSL/domain
4. Integrate with frontend
5. Monitor and maintain

---

## Support & Resources

### WebRTC

- Docs: https://webrtc.org/
- TURN Servers: Twilio TURN, Xirsys, Coturn

### Jitsi

- Website: https://jitsi.org/
- Docs: https://jitsi.github.io/handbook/
- Docker: https://github.com/jitsi/docker-jitsi-meet

### Agora

- Website: https://www.agora.io/
- Docs: https://docs.agora.io/
- Free Tier: 10,000 minutes/month

### mediasoup

- Website: https://mediasoup.org/
- Docs: https://mediasoup.org/documentation/
- Demo: https://github.com/versatica/mediasoup-demo

### Daily.co

- Website: https://www.daily.co/
- Docs: https://docs.daily.co/
- Free Tier: 10,000 minutes/month

---

## Questions to Consider

1. **What's the expected concurrent meeting usage?**

   - <10 concurrent: Keep WebRTC
   - 10-50: Agora or Jitsi
   - > 50: Agora or self-hosted SFU

2. **What's the budget?**

   - Minimal: WebRTC or Jitsi
   - Moderate: Agora/Daily
   - High: Twilio

3. **Do you need mobile apps?**

   - Yes: Agora/Twilio (native SDKs)
   - No: Any solution works

4. **Data privacy requirements?**

   - High: Self-hosted (Jitsi/mediasoup)
   - Standard: Cloud providers (Agora/Twilio)

5. **Development resources?**
   - Limited: Daily/Whereby (easiest)
   - Moderate: Agora/Twilio
   - Strong: mediasoup/Jitsi

---

## Conclusion

The current WebRTC P2P implementation is a good starting point, but has limitations for group meetings. For Cognito Learning Hub's growth, **Agora.io** offers the best balance of:

- ✅ Easy implementation
- ✅ Professional quality
- ✅ Generous free tier
- ✅ Scales with your growth
- ✅ Mobile support for future
- ✅ Advanced features (recording, AI)

**Next Step**: Test Agora with free tier while keeping current WebRTC as fallback.
