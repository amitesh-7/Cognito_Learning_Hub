# Custom Video Meeting Service - Architecture Analysis & Scaling Solution

## Current Architecture: Peer-to-Peer (P2P) WebRTC

### What You Have Built ✅

You've built a **fully custom WebRTC video meeting solution** with:

1. **Backend Signaling Server** (Node.js + Socket.IO)

   - Relays WebRTC connection data (offers, answers, ICE candidates)
   - Manages meeting state with Redis
   - Handles participant tracking
   - Chat functionality
   - No video/audio processing on server

2. **Frontend WebRTC Client** (React)

   - Direct peer-to-peer connections between users
   - getUserMedia for camera/microphone access
   - RTCPeerConnection for video/audio streaming
   - Screen sharing capability
   - STUN/TURN server support

3. **Architecture Diagram**:

```
┌─────────┐     Signaling     ┌─────────────┐     Signaling     ┌─────────┐
│ User A  │◄──────Socket──────►│   Backend   │◄──────Socket──────►│ User B  │
└────┬────┘                    │  (Node.js)  │                    └────┬────┘
     │                         └─────────────┘                         │
     │                                                                  │
     └────────────────────────────────────────────────────────────────┘
                     Direct P2P Video/Audio Stream
                         (NOT through server)
```

### How It Works Currently:

1. **User A joins meeting**:

   - Connects to signaling server via Socket.IO
   - Gets camera/microphone access
   - Server stores user in Redis

2. **User B joins meeting**:

   - Server tells User A about User B
   - User A creates RTCPeerConnection
   - User A creates offer → sends to server → server relays to User B
   - User B creates answer → sends to server → server relays to User A
   - They exchange ICE candidates through server
   - **Direct P2P connection established** (video bypasses server)

3. **More users join**:
   - **Each user connects to ALL other users**
   - User C needs connections to A and B
   - User D needs connections to A, B, and C
   - **Growth is exponential**: N users = N(N-1)/2 connections

---

## The Problem with Your Current P2P Architecture

### Scaling Issues:

| Participants | Total Connections | Upload per User | Download per User |
| ------------ | ----------------- | --------------- | ----------------- |
| 2 users      | 1 connection      | 1 stream        | 1 stream          |
| 3 users      | 3 connections     | 2 streams       | 2 streams         |
| 4 users      | 6 connections     | 3 streams       | 3 streams         |
| 5 users      | 10 connections    | 4 streams       | 4 streams         |
| 8 users      | 28 connections    | 7 streams       | 7 streams         |
| 10 users     | 45 connections    | 9 streams       | 9 streams         |

### Bandwidth Calculation Example (4 users):

**Assumptions**:

- Video quality: 720p at 1.5 Mbps per stream
- Each user sends to 3 others, receives from 3 others

**Per User**:

- Upload: 3 × 1.5 Mbps = **4.5 Mbps**
- Download: 3 × 1.5 Mbps = **4.5 Mbps**
- Total: **9 Mbps** per user

**At 8 users**:

- Upload: 7 × 1.5 Mbps = **10.5 Mbps**
- Download: 7 × 1.5 Mbps = **10.5 Mbps**
- Total: **21 Mbps** per user (most home connections can't handle this!)

### Issues:

- ❌ **Bandwidth**: Each user's upload bandwidth limits the meeting
- ❌ **CPU**: Each peer connection uses CPU for encoding
- ❌ **Quality**: Weakest connection affects everyone
- ❌ **Scale**: Realistically limited to 4-6 participants
- ❌ **Mobile**: Poor performance on phones (limited CPU/bandwidth)

---

## Solution: Upgrade to SFU Architecture (Recommended)

### What is SFU (Selective Forwarding Unit)?

An SFU is a **media router** - not a mixer. It:

- Receives video/audio from each participant (1 upload per user)
- Forwards streams to other participants (N-1 downloads per user)
- **Does NOT process/decode/encode** video (very efficient)
- Each user still encodes their own video once

### New Architecture Diagram:

```
┌─────────┐                                                    ┌─────────┐
│ User A  │─────1 upload────┐                    ┌──1 download─│ User B  │
└─────────┘                 │                    │             └─────────┘
                            ▼                    │
                    ┌───────────────┐           │
                    │   SFU Server  │───────────┤
                    │ (Media Router)│           │
                    └───────────────┘           │
                            ▲                    │
┌─────────┐                 │                    └──1 download─┌─────────┐
│ User C  │─────1 upload────┘                                  │ User D  │
└─────────┘                                                    └─────────┘

Each user: 1 upload + (N-1) downloads
Much more efficient than P2P!
```

### Bandwidth Comparison (8 users, 720p at 1.5 Mbps):

| Architecture       | Upload per User | Download per User | Total per User |
| ------------------ | --------------- | ----------------- | -------------- |
| **P2P (current)**  | 10.5 Mbps       | 10.5 Mbps         | **21 Mbps**    |
| **SFU (proposed)** | 1.5 Mbps        | 10.5 Mbps         | **12 Mbps**    |

**Upload reduced by 7x!** This is the game-changer.

### SFU Benefits:

- ✅ **Scalable**: 50-100+ participants easily
- ✅ **Lower CPU**: Each user encodes video only once
- ✅ **Better quality**: Server bandwidth > home upload
- ✅ **Adaptive**: Can send different qualities to different users
- ✅ **Mobile-friendly**: Lower CPU and bandwidth requirements
- ✅ **Still custom**: You control everything

---

## Implementation Options for SFU

### Option 1: mediasoup (Recommended for Your Case)

**Why mediasoup?**

- Open source and free
- Built for Node.js (matches your stack)
- Production-ready (used by Discord, Google Meet clones)
- Excellent performance (handles 1000+ participants)
- Active community and good documentation
- You keep full control

**Architecture**:

```
Your Existing Backend
├── index.js (signaling server) ✅ Keep this
├── socket/signalingHandlers.js ⚠️ Modify for mediasoup
├── services/meetingManager.js ✅ Keep this
└── NEW: mediasoup/
    ├── worker.js (media processing)
    ├── router.js (routing streams)
    └── transport.js (WebRTC transport)
```

**How It Works**:

1. User joins → create mediasoup transport (WebRTC connection to server)
2. User produces video → send to mediasoup router
3. Router forwards to all other transports (consumers)
4. No media goes through Socket.IO anymore

**Pros**:

- ✅ Integrates with your existing code
- ✅ Node.js based (same as your backend)
- ✅ Very high performance
- ✅ Open source, no vendor lock-in
- ✅ Can start with 1 server, add more later

**Cons**:

- Requires mediasoup server (separate from signaling)
- Needs ports 10000-20000 open (for media)
- Moderate complexity (but well documented)

### Option 2: Janus Gateway

**Why Janus?**

- Extremely lightweight and fast
- Written in C (maximum performance)
- Lower server requirements than mediasoup

**Pros**:

- ✅ Very efficient
- ✅ Battle-tested in production
- ✅ Multiple protocol support

**Cons**:

- ❌ Written in C (harder to customize)
- ❌ More complex configuration
- ❌ Steeper learning curve

### Option 3: Jitsi Videobridge

**Why Jitsi?**

- Complete meeting solution
- Built-in SFU (videobridge)
- Recording, streaming, etc.

**Pros**:

- ✅ Feature-complete
- ✅ Easy to deploy

**Cons**:

- ❌ Would replace most of your code
- ❌ Less flexibility
- ❌ Not just an SFU

---

## Recommended Implementation: mediasoup

### Step-by-Step Migration Plan

#### Phase 1: Add mediasoup Server (Parallel to Existing)

1. **Install mediasoup**:

```bash
cd microservices/meeting-service
npm install mediasoup@3
```

2. **Create mediasoup worker** (`services/mediaServer.js`):

```javascript
const mediasoup = require("mediasoup");

class MediaServer {
  constructor() {
    this.workers = [];
    this.nextWorkerIdx = 0;
  }

  async init() {
    // Create mediasoup workers (one per CPU core)
    const numWorkers = require("os").cpus().length;

    for (let i = 0; i < numWorkers; i++) {
      const worker = await mediasoup.createWorker({
        logLevel: "warn",
        rtcMinPort: 10000,
        rtcMaxPort: 20000,
      });

      worker.on("died", () => {
        console.error("mediasoup worker died, exiting...");
        process.exit(1);
      });

      this.workers.push(worker);
    }

    console.log(`Created ${this.workers.length} mediasoup workers`);
  }

  getWorker() {
    const worker = this.workers[this.nextWorkerIdx];
    this.nextWorkerIdx = (this.nextWorkerIdx + 1) % this.workers.length;
    return worker;
  }
}

module.exports = new MediaServer();
```

3. **Create router per meeting** (`services/mediasoupManager.js`):

```javascript
const mediaServer = require("./mediaServer");

class MediasoupManager {
  constructor() {
    this.routers = new Map(); // roomId -> router
    this.transports = new Map(); // transportId -> transport
    this.producers = new Map(); // producerId -> producer
    this.consumers = new Map(); // consumerId -> consumer
  }

  async createRouter(roomId) {
    const worker = mediaServer.getWorker();

    const router = await worker.createRouter({
      mediaCodecs: [
        {
          kind: "audio",
          mimeType: "audio/opus",
          clockRate: 48000,
          channels: 2,
        },
        {
          kind: "video",
          mimeType: "video/VP8",
          clockRate: 90000,
          parameters: {
            "x-google-start-bitrate": 1000,
          },
        },
        {
          kind: "video",
          mimeType: "video/h264",
          clockRate: 90000,
          parameters: {
            "packetization-mode": 1,
            "profile-level-id": "42e01f",
          },
        },
      ],
    });

    this.routers.set(roomId, router);
    return router;
  }

  getRouter(roomId) {
    return this.routers.get(roomId);
  }

  async createWebRtcTransport(router, roomId) {
    const transport = await router.createWebRtcTransport({
      listenIps: [
        {
          ip: "0.0.0.0",
          announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP || "127.0.0.1",
        },
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    this.transports.set(transport.id, transport);
    return transport;
  }
}

module.exports = new MediasoupManager();
```

4. **Update signaling handlers** (`socket/mediasoupHandlers.js`):

```javascript
const mediasoupManager = require("../services/mediasoupManager");

module.exports = (io) => {
  io.on("connection", (socket) => {
    // Get router RTP capabilities
    socket.on("getRouterRtpCapabilities", async ({ roomId }, callback) => {
      try {
        let router = mediasoupManager.getRouter(roomId);

        if (!router) {
          router = await mediasoupManager.createRouter(roomId);
        }

        callback({ rtpCapabilities: router.rtpCapabilities });
      } catch (error) {
        callback({ error: error.message });
      }
    });

    // Create WebRTC transport (send or receive)
    socket.on(
      "createWebRtcTransport",
      async ({ roomId, direction }, callback) => {
        try {
          const router = mediasoupManager.getRouter(roomId);
          const transport = await mediasoupManager.createWebRtcTransport(
            router,
            roomId
          );

          callback({
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
          });
        } catch (error) {
          callback({ error: error.message });
        }
      }
    );

    // Connect transport
    socket.on(
      "connectTransport",
      async ({ transportId, dtlsParameters }, callback) => {
        try {
          const transport = mediasoupManager.transports.get(transportId);
          await transport.connect({ dtlsParameters });
          callback({ connected: true });
        } catch (error) {
          callback({ error: error.message });
        }
      }
    );

    // Produce (send video/audio to server)
    socket.on(
      "produce",
      async ({ transportId, kind, rtpParameters }, callback) => {
        try {
          const transport = mediasoupManager.transports.get(transportId);
          const producer = await transport.produce({ kind, rtpParameters });

          mediasoupManager.producers.set(producer.id, producer);

          // Notify other participants
          socket.to(currentRoomId).emit("newProducer", {
            producerId: producer.id,
            userId: currentUserId,
            kind,
          });

          callback({ id: producer.id });
        } catch (error) {
          callback({ error: error.message });
        }
      }
    );

    // Consume (receive video/audio from server)
    socket.on(
      "consume",
      async ({ transportId, producerId, rtpCapabilities }, callback) => {
        try {
          const router = mediasoupManager.getRouter(currentRoomId);
          const transport = mediasoupManager.transports.get(transportId);

          if (!router.canConsume({ producerId, rtpCapabilities })) {
            callback({ error: "Cannot consume" });
            return;
          }

          const consumer = await transport.consume({
            producerId,
            rtpCapabilities,
            paused: false,
          });

          mediasoupManager.consumers.set(consumer.id, consumer);

          callback({
            id: consumer.id,
            producerId: producerId,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
          });
        } catch (error) {
          callback({ error: error.message });
        }
      }
    );
  });
};
```

5. **Update index.js to initialize mediasoup**:

```javascript
const mediaServer = require("./services/mediaServer");

const startServer = async () => {
  try {
    // Initialize mediasoup
    await mediaServer.init();
    logger.info("mediasoup initialized");

    // Connect to MongoDB
    await connectDB();
    logger.info("MongoDB connected");

    // ... rest of your code
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};
```

#### Phase 2: Update Frontend to Use mediasoup-client

1. **Install mediasoup-client**:

```bash
cd frontend
npm install mediasoup-client@3
```

2. **Create mediasoup client wrapper** (`lib/mediasoupClient.js`):

```javascript
import * as mediasoupClient from "mediasoup-client";

export class MediasoupHandler {
  constructor(socket) {
    this.socket = socket;
    this.device = null;
    this.sendTransport = null;
    this.recvTransport = null;
    this.producers = new Map(); // kind -> producer
    this.consumers = new Map(); // consumerId -> consumer
  }

  async init(roomId) {
    // Get router RTP capabilities
    const { rtpCapabilities } = await this.socketRequest(
      "getRouterRtpCapabilities",
      { roomId }
    );

    // Create device
    this.device = new mediasoupClient.Device();
    await this.device.load({ routerRtpCapabilities: rtpCapabilities });

    console.log("mediasoup device loaded");
  }

  async createSendTransport(roomId) {
    const transportInfo = await this.socketRequest("createWebRtcTransport", {
      roomId,
      direction: "send",
    });

    this.sendTransport = this.device.createSendTransport(transportInfo);

    this.sendTransport.on(
      "connect",
      async ({ dtlsParameters }, callback, errback) => {
        try {
          await this.socketRequest("connectTransport", {
            transportId: this.sendTransport.id,
            dtlsParameters,
          });
          callback();
        } catch (error) {
          errback(error);
        }
      }
    );

    this.sendTransport.on(
      "produce",
      async ({ kind, rtpParameters }, callback, errback) => {
        try {
          const { id } = await this.socketRequest("produce", {
            transportId: this.sendTransport.id,
            kind,
            rtpParameters,
          });
          callback({ id });
        } catch (error) {
          errback(error);
        }
      }
    );

    return this.sendTransport;
  }

  async createRecvTransport(roomId) {
    const transportInfo = await this.socketRequest("createWebRtcTransport", {
      roomId,
      direction: "recv",
    });

    this.recvTransport = this.device.createRecvTransport(transportInfo);

    this.recvTransport.on(
      "connect",
      async ({ dtlsParameters }, callback, errback) => {
        try {
          await this.socketRequest("connectTransport", {
            transportId: this.recvTransport.id,
            dtlsParameters,
          });
          callback();
        } catch (error) {
          errback(error);
        }
      }
    );

    return this.recvTransport;
  }

  async produce(track) {
    const producer = await this.sendTransport.produce({ track });
    this.producers.set(track.kind, producer);
    return producer;
  }

  async consume(producerId) {
    const { id, kind, rtpParameters } = await this.socketRequest("consume", {
      transportId: this.recvTransport.id,
      producerId,
      rtpCapabilities: this.device.rtpCapabilities,
    });

    const consumer = await this.recvTransport.consume({
      id,
      producerId,
      kind,
      rtpParameters,
    });

    this.consumers.set(consumer.id, consumer);
    return consumer;
  }

  socketRequest(event, data) {
    return new Promise((resolve, reject) => {
      this.socket.emit(event, data, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }
}
```

3. **Update MeetingRoom.jsx to use mediasoup**:

```jsx
import { MediasoupHandler } from "../lib/mediasoupClient";

const MeetingRoom = () => {
  const [mediasoupHandler, setMediasoupHandler] = useState(null);

  useEffect(() => {
    const init = async () => {
      // Get local stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);

      // Connect socket
      const socket = io(getMeetingWsUrl());
      setSocket(socket);

      // Initialize mediasoup
      const handler = new MediasoupHandler(socket);
      await handler.init(roomId);
      await handler.createSendTransport(roomId);
      await handler.createRecvTransport(roomId);
      setMediasoupHandler(handler);

      // Produce local tracks
      for (const track of stream.getTracks()) {
        await handler.produce(track);
      }

      // Listen for new producers (other users)
      socket.on("newProducer", async ({ producerId, userId, kind }) => {
        const consumer = await handler.consume(producerId);

        // Add remote stream
        setPeers((prev) => {
          const newPeers = new Map(prev);
          let peer = newPeers.get(userId) || { streams: [] };

          const stream = new MediaStream([consumer.track]);
          peer.streams.push(stream);

          newPeers.set(userId, peer);
          return newPeers;
        });
      });
    };

    init();
  }, [roomId]);

  // ... rest of your component
};
```

#### Phase 3: Deploy & Test

1. **Server Requirements**:

   - CPU: 2-4 cores minimum (more for higher scale)
   - RAM: 4GB minimum
   - Ports: 10000-20000 open (UDP/TCP)
   - OS: Linux (Ubuntu 20.04+ recommended)

2. **Environment Variables**:

```env
# .env
MEDIASOUP_ANNOUNCED_IP=your.server.ip
MEDIASOUP_MIN_PORT=10000
MEDIASOUP_MAX_PORT=20000
```

3. **Nginx Configuration** (for load balancing):

```nginx
stream {
    upstream mediasoup_backend {
        server localhost:10000;
        # Add more ports as needed
    }

    server {
        listen 10000 udp;
        proxy_pass mediasoup_backend;
    }
}
```

---

## Performance Comparison

### Current P2P vs SFU (8 participants)

| Metric                | P2P (Current)     | SFU (mediasoup) | Improvement     |
| --------------------- | ----------------- | --------------- | --------------- |
| **Upload per user**   | 10.5 Mbps         | 1.5 Mbps        | **7x better**   |
| **Download per user** | 10.5 Mbps         | 10.5 Mbps       | Same            |
| **Total connections** | 28                | 8               | 3.5x fewer      |
| **CPU per user**      | High (7 encoders) | Low (1 encoder) | **7x better**   |
| **Max participants**  | 4-6               | 50-100+         | **10x+ better** |
| **Server CPU**        | None              | Medium          | (trade-off)     |
| **Server bandwidth**  | None              | High            | (trade-off)     |

---

## Scaling Considerations

### Small Scale (1-20 concurrent meetings)

- **1 server**: Can handle it all
- **Cost**: ~$40-80/month (VPS)

### Medium Scale (20-100 concurrent meetings)

- **Multiple servers**: Load balance mediasoup workers
- **Redis**: Already have it for state
- **Cost**: ~$200-500/month

### Large Scale (100+ concurrent meetings)

- **Dedicated media servers**: Separate signaling from media
- **Multiple regions**: Reduce latency
- **CDN**: For recorded content
- **Cost**: ~$1000+/month

---

## Migration Timeline

### Week 1: Setup & Testing

- Install mediasoup on development
- Create basic worker and router
- Test with 2 users

### Week 2: Integration

- Integrate with existing signaling
- Update frontend client
- Test with 4-8 users

### Week 3: Feature Parity

- Add screen sharing
- Add chat (already have it)
- Recording (optional)

### Week 4: Production Deploy

- Deploy to server
- Load testing
- Monitor and optimize

---

## Hybrid Approach (Gradual Migration)

You can run **both P2P and SFU** in parallel:

```javascript
// Backend - support both modes
socket.on("join-meeting", async (data) => {
  const { roomId, mode } = data; // mode: 'p2p' or 'sfu'

  if (mode === "sfu") {
    // Use mediasoup
    await setupMediasoupConnection(socket, roomId);
  } else {
    // Use existing P2P
    await setupP2PConnection(socket, roomId);
  }
});
```

**Benefits**:

- Zero downtime migration
- A/B testing
- Fallback if issues occur
- Gradual user migration

---

## Cost Analysis

### Current P2P

- Server: $5-20/month (signaling only)
- Bandwidth: Minimal (only signaling)
- **Total**: ~$10-30/month

### With SFU (mediasoup)

- Server: $40-80/month (4-8 core, 8GB RAM)
- Bandwidth: $0.01-0.05/GB
- **Example**: 100 hours of meetings/month
  - 100 hours × 8 users × 1.5 Mbps × 3600 sec/hr × 0.000125 GB/Mbit
  - ≈ 540 GB/month
  - Cost: ~$5-30 bandwidth
- **Total**: ~$50-110/month

### ROI Calculation:

- **P2P**: Limited to 4-6 users → small classes only
- **SFU**: Support 50+ users → large webinars, lectures
- **Value**: Can charge premium for larger meetings

---

## Recommended Action Plan

### Immediate (This Week):

1. ✅ **Keep your current P2P code** (it works for small meetings)
2. ✅ Add better TURN server (Twilio TURN $10/month)
3. ✅ Document current limitations (4-6 users max)

### Short Term (Next Month):

1. 🚀 **Test mediasoup** on development server
2. 🚀 Create proof-of-concept with 8-10 users
3. 🚀 Benchmark: measure bandwidth, CPU, quality

### Medium Term (2-3 Months):

1. 📈 **Production deploy** mediasoup SFU
2. 📈 Migrate high-user meetings to SFU
3. 📈 Keep P2P for 1-on-1 sessions (lower latency)

### Long Term (6+ Months):

1. 🌟 Add advanced features (recording, transcription)
2. 🌟 Multi-region deployment
3. 🌟 Mobile app optimization

---

## Conclusion

**You already have a custom video meeting service!** It's well-architected for small meetings but needs SFU upgrade to scale.

**Key Decision**:

- Keep P2P for 1-on-1 tutoring (excellent latency)
- Add SFU for group classes (8+ students)
- Both use your custom backend

**Best Path Forward**:
→ **Implement mediasoup SFU** (2-4 weeks work)
→ Keeps everything in-house
→ Scales to 100+ users per meeting
→ Professional quality
→ Full control

**Do NOT** switch to Agora/Twilio if you want to keep it custom. The mediasoup solution is the right balance of custom + scalable + maintainable.
