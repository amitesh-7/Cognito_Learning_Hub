# mediasoup SFU Implementation - Configuration Guide

## 🎯 Overview

The meeting service now supports **both P2P and SFU modes**:

- **P2P Mode** (legacy): 2-6 participants, direct peer connections
- **SFU Mode** (new): 100+ participants, mediasoup server routing

## 📋 Backend Configuration

### Environment Variables

Add these to your `microservices/meeting-service/.env`:

```env
# mediasoup Configuration
MEDIASOUP_ANNOUNCED_IP=your.server.ip.address  # REQUIRED for production
MEDIASOUP_MIN_PORT=10000                        # RTC port range start
MEDIASOUP_MAX_PORT=10100                        # RTC port range end
MEDIASOUP_WORKERS=0                             # 0 = auto (one per CPU core)
```

### Port Configuration

**Development (localhost):**

- No announced IP needed
- Uses loopback address
- Ports 10000-10100 for RTC

**Production (VPS/Cloud):**

- **MUST set MEDIASOUP_ANNOUNCED_IP** to your server's public IP
- Open firewall for ports 10000-10100 (UDP + TCP)
- Example: `MEDIASOUP_ANNOUNCED_IP=203.0.113.45`

### Firewall Rules

Ubuntu/Debian:

```bash
sudo ufw allow 10000:10100/udp
sudo ufw allow 10000:10100/tcp
sudo ufw reload
```

CentOS/RHEL:

```bash
sudo firewall-cmd --permanent --add-port=10000-10100/udp
sudo firewall-cmd --permanent --add-port=10000-10100/tcp
sudo firewall-cmd --reload
```

AWS Security Group:

- Custom UDP Rule: Port range 10000-10100, Source 0.0.0.0/0
- Custom TCP Rule: Port range 10000-10100, Source 0.0.0.0/0

## 🖥️ Server Requirements

### Minimum Specs (10-20 users)

- **CPU:** 2 cores
- **RAM:** 4GB
- **Bandwidth:** 20 Mbps upload

### Recommended (50-100 users)

- **CPU:** 4-8 cores
- **RAM:** 8-16GB
- **Bandwidth:** 100 Mbps upload

### Bandwidth Calculation

Per user in SFU mode:

- **Upload:** 1.5 Mbps (1 video + 1 audio)
- **Download:** 1.5 Mbps × (N-1) participants

Example: 10 users

- Each uploads: 1.5 Mbps
- Each downloads: 13.5 Mbps (9 streams)
- Server bandwidth: 15 Mbps upload + 135 Mbps download

## 🚀 Deployment Guide

### Step 1: Install Dependencies

```bash
cd microservices/meeting-service
npm install
```

### Step 2: Configure Environment

```bash
# Create or update .env
echo "MEDIASOUP_ANNOUNCED_IP=$(curl -s ifconfig.me)" >> .env
echo "MEDIASOUP_MIN_PORT=10000" >> .env
echo "MEDIASOUP_MAX_PORT=10100" >> .env
echo "MEDIASOUP_WORKERS=0" >> .env
```

### Step 3: Open Firewall Ports

```bash
# Ubuntu/Debian
sudo ufw allow 10000:10100/udp
sudo ufw allow 10000:10100/tcp
sudo ufw allow 3005/tcp  # Meeting service HTTP
sudo ufw reload
```

### Step 4: Start Service

```bash
npm start
```

### Step 5: Verify Startup

Check logs for:

```
[meeting-service] mediasoup initialized: 4 workers, 4 CPUs
[meeting-service] mediasoup RTC Ports: 10000-10100
[meeting-service] mediasoup Announced IP: 203.0.113.45
[meeting-service] WebRTC Modes: P2P (legacy) + SFU (mediasoup)
```

## 🔧 Frontend Integration

The frontend automatically uses SFU mode when joining meetings.

### Key Files

- `frontend/src/lib/mediasoupClient.js` - mediasoup wrapper
- `frontend/src/pages/MeetingRoom.jsx` - UI integration (needs update)

### Socket Events (SFU Mode)

**Client → Server:**

- `join-meeting-sfu` - Join meeting
- `getRouterRtpCapabilities` - Get codec support
- `createWebRtcTransport` - Create send/recv transport
- `connectTransport` - Connect DTLS
- `produce` - Upload video/audio/screen
- `consume` - Download peer's stream
- `toggle-audio-sfu` - Mute/unmute
- `toggle-video-sfu` - Camera on/off
- `toggle-screen-share-sfu` - Screen share
- `meeting-chat-message-sfu` - Chat
- `leave-meeting-sfu` - Leave

**Server → Client:**

- `participant-joined-sfu` - New participant
- `newProducer` - New stream available
- `participant-left` - Participant left
- `participant-audio-changed` - Audio state
- `participant-video-changed` - Video state
- `participant-screen-share-changed` - Screen share state

## 📊 Monitoring

### Get Stats

```javascript
// Socket.IO client
socket.emit("getMediasoupStats", (response) => {
  console.log(response.stats);
});
```

### Stats Response

```json
{
  "totalRooms": 3,
  "totalTransports": 24,
  "totalProducers": 18,
  "totalConsumers": 144,
  "totalPeers": 12,
  "roomDetails": {
    "room-123": {
      "transports": 8,
      "producers": 6,
      "consumers": 48,
      "peers": 4
    }
  }
}
```

### Health Check

```bash
curl http://localhost:3005/health
```

## 🐛 Troubleshooting

### "Cannot connect to server"

- ✅ Check `MEDIASOUP_ANNOUNCED_IP` is set correctly
- ✅ Verify firewall ports 10000-10100 are open
- ✅ Check server logs for worker initialization errors

### "No video/audio from peers"

- ✅ Check browser console for consumer creation errors
- ✅ Verify RTP capabilities match
- ✅ Check network connectivity (WebRTC ICE)

### "High CPU usage"

- ✅ Reduce number of workers: `MEDIASOUP_WORKERS=2`
- ✅ Lower video quality in frontend
- ✅ Upgrade server specs

### "Server crashes on startup"

- ✅ Check ports 10000-10100 are available
- ✅ Ensure mediasoup package is installed
- ✅ Verify Node.js version (>= 14)

## 🔄 P2P vs SFU Comparison

| Feature          | P2P (Legacy)        | SFU (mediasoup) |
| ---------------- | ------------------- | --------------- |
| Max Users        | 4-6                 | 100+            |
| Upload per user  | 10.5 Mbps (8 users) | 1.5 Mbps        |
| Server CPU       | Low                 | Medium-High     |
| Server Bandwidth | Low                 | High            |
| Latency          | Lower               | Slightly higher |
| Scalability      | Poor                | Excellent       |
| NAT Traversal    | Harder              | Easier          |

## 🎯 Next Steps

1. ✅ Backend infrastructure complete
2. ✅ Frontend client library created
3. ⏳ **Update MeetingRoom.jsx** to use SFU mode
4. ⏳ Test with 2-10 users
5. ⏳ Deploy to production VPS
6. ⏳ Monitor and optimize

## 📚 Resources

- [mediasoup Documentation](https://mediasoup.org/)
- [mediasoup-client API](https://mediasoup.org/documentation/v3/mediasoup-client/api/)
- [WebRTC Glossary](https://webrtcglossary.com/)

## 💡 Tips

1. **Development:** Use P2P mode for quick testing (no config needed)
2. **Production:** Use SFU mode for scalability (requires server setup)
3. **Hybrid:** Both modes can run simultaneously on same server
4. **Monitoring:** Use `getMediasoupStats` to track resource usage
5. **Optimization:** Adjust video bitrates based on participant count
