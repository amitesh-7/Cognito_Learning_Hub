# WebRTC Video Troubleshooting Guide

## The Problem: Video Not Visible Despite Signaling Working

When WebRTC signaling works (offers/answers exchanged) but video doesn't show, the issue is almost always **ICE connection failure** due to NAT/firewall traversal problems.

## Root Cause: Missing TURN Servers

### How WebRTC Works

1. **STUN servers** - Help discover your public IP address (NAT discovery)
2. **TURN servers** - Relay media when direct peer-to-peer connection fails

### The Problem

- **STUN-only configuration** works when both peers are on the same network or have open NAT
- **In production**, users are typically behind different NATs/firewalls
- Direct P2P connection fails → No video/audio
- **TURN servers are required** to relay media through the firewall

## Solution Applied

### 1. Added Free TURN Servers (MeetingRoom.jsx)

```javascript
const iceServers = [
  // STUN servers (free)
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun.relay.metered.ca:80" },
  // TURN servers (essential for NAT traversal)
  {
    urls: "turn:openrelay.metered.ca:80",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
  // ... more TURN servers
];
```

### 2. Added ICE Restart on Failure

When ICE connection fails, automatically attempts ICE restart:

- Detects `connectionState === "failed"`
- Calls `pc.restartIce()`
- Sends new offer with `iceRestart: true`

### 3. Added Backend ICE Server Endpoint

`GET /api/meetings/config/ice-servers` returns dynamic ICE server configuration.

## Debugging Steps

### 1. Check Browser Console Logs

Look for these key messages:

```
[Meeting] ICE connection state: checking → connected ✅
[Meeting] ICE connection state: failed ❌ (Problem!)
[RemoteVideo] Stream tracks: video: enabled=true, readyState=live ✅
```

### 2. Check ICE Gathering

```
[Meeting] ICE gathering state: gathering → complete ✅
```

If ICE gathering never completes or fails, TURN servers aren't accessible.

### 3. Test TURN Server Connectivity

Use this online tool: https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/

Enter your TURN server credentials and check if candidates are gathered.

## Production Recommendations

### Free TURN Server Options (Limited)

1. **Metered OpenRelay** (used currently)

   - Free tier: Limited bandwidth
   - Sign up: https://www.metered.ca/tools/openrelay/

2. **Twilio STUN/TURN**
   - Free tier available
   - Sign up: https://www.twilio.com/

### Self-Hosted TURN Server

For production with more users, host your own TURN server:

1. **Coturn** (Open Source)

```bash
# Install coturn
sudo apt-get install coturn

# Configure /etc/turnserver.conf
listening-port=3478
tls-listening-port=5349
realm=yourdomain.com
server-name=yourdomain.com
lt-cred-mech
user=username:password
```

2. **Deploy on Cloud**
   - Azure VM with public IP
   - AWS EC2 with Elastic IP
   - DigitalOcean Droplet

### Environment Variables for Production

Set these in your meeting-service `.env`:

```env
TURN_USERNAME=your-username
TURN_CREDENTIAL=your-credential
TURN_SERVER=turn:your-turn-server.com:3478
TURNS_SERVER=turns:your-turn-server.com:5349
```

## Common Issues

### Issue 1: Video shows placeholder instead of stream

**Cause**: `peer.stream` is undefined
**Fix**: Check that `ontrack` handler properly sets the stream in peers Map

### Issue 2: ICE connection stays in "checking" state

**Cause**: TURN servers not accessible or credentials invalid
**Fix**: Verify TURN server URL and credentials

### Issue 3: Works locally but not in production

**Cause**: Missing TURN servers
**Fix**: Add TURN servers to ICE configuration

### Issue 4: One-way video (only one person sees the other)

**Cause**:

- Only one peer has TURN access
- Asymmetric NAT types
  **Fix**: Ensure TURN servers are configured on both sides

## Browser DevTools Debugging

### Chrome WebRTC Internals

1. Open `chrome://webrtc-internals/`
2. Join a meeting
3. Look for:
   - ICE candidate pairs
   - Connection state changes
   - TURN allocation status

### Network Tab

Check if TURN server requests return 200 OK.

## Quick Test

To verify TURN servers are working:

```javascript
// Run in browser console during a meeting
const pc = new RTCPeerConnection({
  iceServers: [
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
});

pc.createDataChannel("test");
pc.createOffer().then((offer) => pc.setLocalDescription(offer));

pc.onicecandidate = (e) => {
  if (e.candidate) {
    console.log("ICE Candidate:", e.candidate.type, e.candidate.address);
    // Look for "relay" type - that's TURN working
  }
};
```

If you see `relay` type candidates, TURN is working!

## Summary

| Problem                            | Solution                        |
| ---------------------------------- | ------------------------------- |
| No video despite signaling working | Add TURN servers                |
| ICE connection failed              | Check TURN server accessibility |
| Works locally, fails in production | Configure TURN servers          |
| Intermittent video issues          | Add ICE restart logic           |
