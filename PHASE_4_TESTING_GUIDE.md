# 🧪 Phase 4 Mobile Testing Guide

## Quick Testing Checklist for Phase 4 Features

### Prerequisites

```bash
# Install dependencies (if not already done)
cd frontend
npm install

# Start development server
npm run dev
```

---

## 1. Pull-to-Refresh Testing

### Dashboard Page

1. Navigate to `/dashboard`
2. **On Mobile/Touch Device**:

   - Pull down from the top of the page
   - You should see the refresh indicator appear
   - Keep pulling until you see "Release to refresh"
   - Release your finger
   - **Expected**: Haptic vibration, loading spinner, data refreshes

3. **On Desktop (Simulated)**:
   - Open Chrome DevTools (F12)
   - Enable mobile emulation (Ctrl+Shift+M)
   - Select a mobile device (e.g., iPhone 12)
   - Repeat pull gesture with mouse

### What to Check:

- ✅ Indicator appears smoothly
- ✅ Progress percentage increases as you pull
- ✅ Icon rotates based on pull distance
- ✅ Message changes from "Pull" to "Release" at 80px
- ✅ Haptic vibration occurs on release (mobile only)
- ✅ Loading state shows while refreshing
- ✅ Indicator disappears when refresh completes

---

## 2. Haptic Feedback Testing

### Button Clicks

1. Navigate to any page with buttons
2. **On Mobile Device**:

   - Tap any button
   - **Expected**: Light vibration (10ms)
   - Tap a delete/destructive button (red)
   - **Expected**: Medium vibration (20ms)

3. **To Test All Patterns**:

   ```javascript
   // Open browser console on mobile
   import { useHaptic } from "./hooks/useHaptic";
   const { light, medium, heavy, success, error } = useHaptic();

   light(); // Quick tap
   medium(); // Gentle vibration
   heavy(); // Strong vibration
   success(); // Two-pulse pattern
   error(); // Five-pulse pattern
   ```

### Modal Interactions

1. Open any modal (e.g., filters, settings)
2. **Expected**: Light vibration on open
3. Close the modal
4. **Expected**: Light vibration on close

### What to Check:

- ✅ Vibration occurs on button taps (mobile only)
- ✅ Different vibration patterns for different actions
- ✅ No vibration on desktop (graceful degradation)
- ✅ No console errors if vibration not supported

---

## 3. Web Share API Testing

### Share Quiz Results

1. Complete a quiz
2. Look for the "Share" button
3. Click the share button
4. **On Mobile (iOS/Android Chrome)**:
   - Native share sheet should appear
   - Options: WhatsApp, Messages, Email, etc.
5. **On Desktop/Unsupported Browser**:
   - Message copied to clipboard
   - Console shows fallback message

### Share Formats to Test:

```javascript
// Quiz Result Share:
"🎓 I scored 8/10 (80%) on React Basics! 🎯
Try the quiz on Cognito Learning Hub!"

// Achievement Share:
"🏆 Achievement Unlocked: Quiz Master!
Completed 10 quizzes on Cognito Learning Hub!"

// Leaderboard Share:
"🥇 Ranked #3 with 850 points among 50 participants!
Challenge me on Cognito Learning Hub!"
```

### What to Check:

- ✅ Share button only visible on supported devices
- ✅ Native share dialog opens on mobile
- ✅ Clipboard fallback works on desktop
- ✅ Haptic feedback on button click
- ✅ Properly formatted share text
- ✅ Emojis appear correctly

---

## 4. Network Status Testing

### Online/Offline Toggle

1. Open app in Chrome
2. **Test Offline**:

   - Open DevTools (F12)
   - Go to Network tab
   - Set throttling to "Offline"
   - **Expected**: Red "No internet connection" toast appears

3. **Test Back Online**:

   - Set throttling to "Online"
   - **Expected**: Green "Back online" toast (3 seconds)

4. **Test Slow Connection**:
   - Set throttling to "Slow 3G"
   - **Expected**: Yellow "Slow connection" warning

### Advanced Testing

```javascript
// Open browser console
import { useNetworkStatus } from "./hooks/useNetworkStatus";
const status = useNetworkStatus();

console.log(status.isOnline); // true/false
console.log(status.effectiveType); // '4g', '3g', '2g'
console.log(status.downlink); // Speed in Mbps
console.log(status.isSlowConnection()); // true/false
```

### What to Check:

- ✅ Toast appears/disappears correctly
- ✅ Colors match status (red/yellow/green)
- ✅ "Back online" auto-hides after 3 seconds
- ✅ Connection quality detected accurately
- ✅ No duplicate toasts
- ✅ Smooth animations

---

## 5. PWA Install Prompt Testing

### First Visit

1. Open app in Chrome (desktop or mobile)
2. Wait 5 seconds
3. **Expected**: Install prompt appears bottom-right
4. **Prompt Should Show**:
   - App icon
   - "Install Cognito Learning Hub" title
   - Feature list (Instant loading, Works offline, etc.)
   - "Install App" and "Later" buttons

### Test Install Flow

1. Click "Install App"
2. **Expected**: Native browser install prompt appears
3. Click "Install" in native prompt
4. **Expected**: App installs, prompt disappears

### Test Dismissal Logic

1. Click "Later" button
2. **Expected**: Prompt disappears
3. Refresh page
4. **Expected**: Prompt does NOT appear (7-day cooldown)

### Test Already Installed

1. Install app via browser prompt
2. Open installed app
3. **Expected**: No install prompt (already installed)

### What to Check:

- ✅ Prompt appears after 5 seconds
- ✅ Beautiful gradient card design
- ✅ Responsive on mobile/desktop
- ✅ Close button works
- ✅ Install button triggers native prompt
- ✅ 7-day dismissal cooldown works
- ✅ No prompt when already installed

---

## 🔍 Browser-Specific Testing

### Chrome/Edge (Full Support)

- ✅ All features work
- ✅ Pull-to-refresh: Perfect
- ✅ Haptics: Vibration API supported
- ✅ Share: Native share sheet
- ✅ Network: Full API support
- ✅ PWA: Install prompt supported

### Safari iOS (Partial Support)

- ✅ Pull-to-refresh: Works
- ✅ Haptics: Vibration API supported
- ✅ Share: Native share sheet
- ⚠️ Network: Limited API (basic online/offline)
- ⚠️ PWA: Manual "Add to Home Screen"

### Firefox (Mixed Support)

- ✅ Pull-to-refresh: Works
- ✅ Haptics: Vibration API supported
- ❌ Share: Clipboard fallback only
- ⚠️ Network: Limited API
- ⚠️ PWA: Limited support

---

## 📱 Device Testing Matrix

### Must Test On:

1. **iPhone (Safari)**

   - Pull-to-refresh
   - Haptic feedback
   - Share functionality
   - Network status

2. **Android (Chrome)**

   - Pull-to-refresh
   - Haptic feedback
   - Share functionality
   - PWA install prompt

3. **Desktop (Chrome)**
   - PWA install prompt
   - Network status
   - Share fallback (clipboard)

### Screen Sizes:

- ✅ 320px (iPhone SE)
- ✅ 375px (iPhone 12)
- ✅ 414px (iPhone 14 Pro Max)
- ✅ 768px (iPad)
- ✅ 1024px+ (Desktop)

---

## 🐛 Common Issues & Solutions

### Issue: Pull-to-refresh not working

**Solution**:

- Ensure you're on a touch device or using DevTools mobile emulation
- Check console for errors
- Verify `enabled` prop is `true`

### Issue: No haptic feedback

**Solution**:

- Haptics only work on mobile devices
- Check browser supports Vibration API
- Some browsers require user interaction first

### Issue: Share button not appearing

**Solution**:

- Web Share API only available on HTTPS
- Not supported in all browsers (fallback to clipboard)
- Check `canShare` property

### Issue: Network status not updating

**Solution**:

- Network Information API limited in some browsers
- Check browser console for errors
- Test with Chrome DevTools throttling

### Issue: PWA prompt not showing

**Solution**:

- Only works on first visit (or after 7 days)
- Requires HTTPS
- Check localStorage for dismissal date
- Clear site data and try again

---

## ✅ Final Validation

### Before Marking Complete:

- [ ] Pull-to-refresh works on Dashboard
- [ ] Haptic feedback on button clicks (mobile)
- [ ] Share button functional (or hidden if unsupported)
- [ ] Network status indicator appears correctly
- [ ] PWA install prompt shows after 5 seconds
- [ ] No console errors
- [ ] Smooth animations (60fps)
- [ ] Works on iOS Safari
- [ ] Works on Android Chrome
- [ ] Works on Desktop Chrome

---

## 🚀 Performance Testing

### Chrome Lighthouse Audit

```bash
# Run Lighthouse audit
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Mobile" device
4. Check "Performance" and "PWA"
5. Click "Generate report"
```

### Expected Scores:

- **Performance**: 90+ (with optimizations)
- **PWA**: 100 (with service worker + manifest)
- **Accessibility**: 95+
- **Best Practices**: 95+

### Key Metrics:

- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Total Blocking Time: < 200ms
- Cumulative Layout Shift: < 0.1

---

## 📊 Manual Performance Tests

### Animation Smoothness

1. Open Chrome DevTools
2. Enable "Show FPS meter" (Ctrl+Shift+P → "Show frames")
3. Test pull-to-refresh
4. **Expected**: Consistent 60fps

### Memory Leaks

1. Open Chrome DevTools → Memory tab
2. Take heap snapshot
3. Use app for 5 minutes
4. Take another snapshot
5. **Expected**: No significant memory growth

### Network Efficiency

1. Open DevTools → Network tab
2. Filter by size
3. Check bundle sizes
4. **Expected**: Main bundle < 500KB (gzipped)

---

**Happy Testing! 🎉**

All Phase 4 features are ready for thorough testing on real devices!
