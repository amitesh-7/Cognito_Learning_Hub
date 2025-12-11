# Quick Video Conferencing Test Checklist

## ✅ Current Status

- **Meeting Service:** Running on port 3009 with MediaSoup SFU enabled
- **16 MediaSoup Workers:** Active and ready
- **Frontend:** Running on http://localhost:5173
- **Configuration:** Fixed and optimized

## 🧪 Testing Steps

### 1. Open Two Browser Windows

**Browser 1 (Chrome):**

```
http://localhost:5173
```

**Browser 2 (Chrome Incognito or Firefox):**

```
http://localhost:5173
```

### 2. Create and Join Meeting

1. **In Browser 1:**

   - Login as a user
   - Click "Create Meeting" or go to Meeting Room
   - Copy the meeting Room ID

2. **In Browser 2:**
   - Login as a different user
   - Enter the Room ID from Browser 1
   - Click "Join Meeting"

### 3. Check Video Transfer

**You should see:**

- ✅ Your own video in local preview
- ✅ Other participant's video in the grid
- ✅ Audio working between participants
- ✅ Participant count updating

### 4. Check Browser Console (F12)

**Look for these success messages:**

```javascript
[Meeting SFU] Connecting to: http://localhost:3009
[Meeting SFU] mediasoup initialized
[mediasoup] Device loaded, RTP capabilities: ...
[mediasoup] Send transport created: xxx
[mediasoup] Recv transport created: yyy
[mediasoup] ✅ Send transport CONNECTED - ready to send media
[mediasoup] ✅ Recv transport CONNECTED - ready to receive media
[Meeting SFU] Consumer track received [video] from peer xxx
[Meeting SFU] Consumer track received [audio] from peer xxx
```

**Red flags (should NOT see):**

- ❌ "Failed to initialize mediasoup"
- ❌ "Transport connection failed"
- ❌ "Send transport failed"
- ❌ "Consumer failed"

## 🎥 Features to Test

### Basic Features

- [ ] Camera on/off toggle
- [ ] Microphone on/off toggle
- [ ] Video quality (should be smooth)
- [ ] Audio quality (should be clear)

### Advanced Features

- [ ] Screen sharing (click screen share button)
- [ ] Text chat (send messages)
- [ ] Participant list (view all users)
- [ ] Leave meeting (should cleanup properly)

## 🔍 Troubleshooting

### If Video Doesn't Show

1. **Check Browser Permissions:**

   ```
   Chrome: Settings → Privacy and Security → Site Settings → Camera/Microphone
   Allow localhost:5173 to access camera and microphone
   ```

2. **Check Console for Errors:**

   - Open DevTools (F12)
   - Go to Console tab
   - Look for red error messages
   - Share error messages if you see any

3. **Check Network Tab:**

   - Open DevTools (F12)
   - Go to Network tab
   - Filter by "WS" (WebSocket)
   - Verify connection to `ws://localhost:3009` is established

4. **Verify Meeting Service:**
   ```powershell
   # Check if meeting service is running
   Invoke-RestMethod -Uri "http://localhost:3009/health" | ConvertTo-Json
   ```
   Should return: `"status": "healthy"`

### If Audio Doesn't Work

1. Check microphone permissions in browser
2. Verify audio track in console: `[Meeting SFU] Consumer track received [audio]`
3. Check system audio settings (not muted)
4. Try refreshing both browsers

### If Screen Share Fails

1. Grant screen share permission in browser popup
2. Select the window/tab to share
3. Check console for screen producer creation

## 📊 Expected Performance

**With 2 Users:**

- Video Latency: < 200ms
- Audio Latency: < 100ms
- CPU Usage: ~5-10% per user
- Bandwidth: ~1.5 Mbps upload/download per user

**With 5+ Users:**

- Should still work smoothly
- May see slight increase in latency
- Server CPU usage will increase

## ✅ Success Criteria

Video conferencing is working if:

1. ✅ Both users see each other's video
2. ✅ Both users hear each other's audio
3. ✅ Video is smooth (not frozen)
4. ✅ Audio is clear (no robot voice)
5. ✅ Participant count updates correctly

## 🐛 Still Having Issues?

If video is still not working after following this checklist:

### Collect Diagnostic Info

1. **Browser Console Log:**

   - Right-click in console → "Save as..." → save as `console.log`

2. **Server Logs:**

   - Copy the terminal output from meeting-service

3. **Network Info:**

   - DevTools → Network → WS tab → Click socket connection → view frames

4. **Run Test Script:**
   ```powershell
   cd "k:\IIT BOMBAY\Cognito-Learning-Hub\microservices\meeting-service"
   node test-mediasoup.js
   ```

### Common Solutions

| Problem           | Solution                             |
| ----------------- | ------------------------------------ |
| Black screen      | Check camera permissions             |
| No audio          | Check microphone permissions         |
| Connection failed | Restart meeting service              |
| Peer not visible  | Check console for consumer errors    |
| Firewall blocking | Temporarily disable firewall to test |

## 📝 Notes

- **MediaSoup SFU** is now properly configured
- **16 workers** are running (one per CPU core)
- **Ports 10000-10100** are open for RTC
- **Local IP** (127.0.0.1) is announced for development

**You don't need alternative video conferencing solutions - MediaSoup is production-ready and should work!**

---

## Next Steps After Testing

Once video works:

1. Test with more users (3-5)
2. Try screen sharing
3. Test on different networks
4. Consider production deployment (see VIDEO_CONFERENCING_FIX.md)
