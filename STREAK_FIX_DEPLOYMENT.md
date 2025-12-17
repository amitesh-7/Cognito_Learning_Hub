# Streak Fix Deployment Guide

## Problem

- Android app shows `currentStreak: 0` but web app shows `2`
- Database has `lastQuizDate: null` indicating the streak fix code isn't deployed
- Achievement counts are working (130 total, 16 unlocked) ✅

## Root Cause

The streak calculation fix in `statsManager.js` (lines 38-100) that checks consecutive days and updates `lastQuizDate` is NOT deployed to production yet.

## Solutions

### Option 1: Quick Fix (Manual Database Update)

**Use this if you need an immediate fix:**

```bash
cd microservices/gamification-service

# Install dependencies if needed
npm install

# Run the fix script for your user
node scripts/fix-user-streak.js 690e1b64fa247bb4ed12c8c1 2
```

This will:

- Set `currentStreak` to 2
- Set `longestStreak` to 2 (if current is less)
- Set `lastQuizDate` to today

**Then clear Redis cache:**

```bash
# Connect to your production Redis
redis-cli -h redis-10173.c330.asia-south1-1.gce.cloud.redislabs.com -p 10173 -a <password>

# Clear the cached stats
DEL user:stats:690e1b64fa247bb4ed12c8c1
```

### Option 2: Deploy the Fix (Permanent Solution)

**This ensures future quizzes calculate streaks correctly:**

1. **Commit and push your changes:**

   ```bash
   cd microservices/gamification-service
   git add src/services/statsManager.js src/config/redis.js src/routes/stats.js
   git commit -m "fix: implement consecutive day streak tracking with lastQuizDate"
   git push origin main
   ```

2. **Redeploy on Render.com:**

   - Go to https://dashboard.render.com
   - Find your `gamification-service`
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait ~5-10 minutes for deployment

3. **Verify deployment:**

   ```bash
   # Get your auth token from browser localStorage or Flutter app
   node scripts/check-streak-code-deployed.js <your-auth-token>
   ```

4. **After deployment, take a new quiz:**
   - The streak will recalculate based on consecutive days
   - `lastQuizDate` will be set automatically

## Files Changed (Need Deployment)

### statsManager.js (Lines 38-100)

- ✅ Calculates day difference between quizzes
- ✅ Same day (0 days): maintain streak
- ✅ Next day (1 day): increment streak
- ✅ 2+ days: reset to 1
- ✅ Failed quiz: reset to 0
- ✅ Sets `lastQuizDate` in updates

### redis.js (Lines 167, 198)

- ✅ Stores `lastQuizDate` in Redis cache
- ✅ Retrieves `lastQuizDate` from cache

### stats.js (Lines 26-52)

- ✅ Converts MongoDB document to plain object
- ✅ Adds detailed logging
- ✅ Error handling for achievement counts

## Verification Steps

After applying either fix:

1. **Check Android App:**

   - Force close and restart the app
   - Daily Streak should show **2 days**

2. **Check Logs:**

   ```
   currentStreak: 2  ✅ (was 0)
   lastQuizDate: 2025-12-17T... ✅ (was null)
   ```

3. **Test New Quiz:**
   - Take a quiz tomorrow
   - Streak should become 3 (if passed)
   - `lastQuizDate` should update automatically

## Why This Happened

The original code (before the fix) simply incremented streak on every passed quiz:

```javascript
// OLD (WRONG)
if (resultData.passed) {
  updates.currentStreak = currentStreak + 1;
}
```

The NEW code checks if it's actually a consecutive day:

```javascript
// NEW (CORRECT)
const daysDiff = Math.floor((today - lastDay) / (1000 * 60 * 60 * 24));
if (daysDiff === 0) updates.currentStreak = currentStreak; // Same day
else if (daysDiff === 1) updates.currentStreak = currentStreak + 1; // Next day
else updates.currentStreak = 1; // Missed days
```

This ensures streaks only increment when quizzes are taken on consecutive days, just like Duolingo, GitHub, etc.
