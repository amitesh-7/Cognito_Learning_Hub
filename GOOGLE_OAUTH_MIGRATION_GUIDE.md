# Google OAuth 2.0 Migration Guide

## Overview

This guide explains how to change your Google OAuth 2.0 credentials (Client ID and Client Secret) and the effects of doing so.

---

## 📋 Prerequisites

Before starting the migration:

1. Access to [Google Cloud Console](https://console.cloud.google.com/)
2. Access to your application's environment configuration files
3. List of all deployed instances (local, staging, production)
4. Backup of current credentials (for rollback if needed)

---

## 🔧 Step 1: Create New OAuth 2.0 Credentials

### 1.1 Navigate to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** > **Credentials**

### 1.2 Create OAuth 2.0 Client ID

1. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
2. Select **Application type**: Web application
3. Enter a name (e.g., "Cognito Learning Hub - Production")

### 1.3 Configure Authorized Origins

Add all origins where your app runs:

**Local Development:**

```
http://localhost:5173
http://localhost:3000
http://127.0.0.1:5173
```

**Production:**

```
https://your-domain.com
https://www.your-domain.com
https://your-frontend.vercel.app
https://your-backend.onrender.com
```

### 1.4 Configure Authorized Redirect URIs

Add all callback URLs:

**Local Development:**

```
http://localhost:5173
http://localhost:5173/login
http://localhost:5173/signup
http://localhost:3000/api/auth/google/callback
```

**Production:**

```
https://your-domain.com
https://your-domain.com/login
https://your-frontend.vercel.app/login
https://your-backend.onrender.com/api/auth/google/callback
```

### 1.5 Save and Copy Credentials

1. Click **CREATE**
2. Copy the **Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)
3. Copy the **Client Secret** (keep this secure!)

---

## 🔄 Step 2: Update Environment Variables

### 2.1 Backend (Auth Service)

**File:** `microservices/auth-service/.env`

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_NEW_CLIENT_SECRET_HERE
```

**Also update:**

- `microservices/auth-service/.env.local` (for local development)
- `microservices/auth-service/.env.production` (for production deployment)

### 2.2 Frontend

**File:** `frontend/.env`

```bash
# Google OAuth Client ID (Frontend only needs Client ID)
VITE_GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID_HERE
```

**Also update:**

- `frontend/.env.local` (for local development)
- `frontend/.env.production` (for production deployment)

### 2.3 Verify All Files Updated

**Checklist:**

- ✅ `microservices/auth-service/.env`
- ✅ `microservices/auth-service/.env.local`
- ✅ `microservices/auth-service/.env.production`
- ✅ `frontend/.env`
- ✅ `frontend/.env.local`
- ✅ `frontend/.env.production`

---

## 🚀 Step 3: Deploy Changes

### 3.1 Local Development

**Restart Backend:**

```powershell
cd "microservices/auth-service"
# Press Ctrl+C to stop
npm run dev
```

**Restart Frontend:**

```powershell
cd frontend
# Press Ctrl+C to stop
npm run dev
```

**Clear Browser Cache:**

```javascript
// In browser console (F12)
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### 3.2 Production Deployment

**For Vercel (Frontend):**

1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Update `VITE_GOOGLE_CLIENT_ID` with new value
3. Redeploy: **Deployments** > **Redeploy** (or push to main branch)

**For Render (Backend):**

1. Go to Render Dashboard > auth-service > Environment
2. Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
3. Service will auto-redeploy

**For Other Platforms:**

- Update environment variables in your deployment platform
- Trigger a new deployment
- Verify the new variables are loaded

---

## ⚠️ Effects of Changing OAuth Credentials

### Immediate Effects

#### 1. **All Existing Google OAuth Sessions Will Be Invalidated**

- **Impact:** Users logged in with Google will be logged out
- **Reason:** OAuth tokens are tied to the Client ID
- **User Action Required:** Users must log in again with Google

#### 2. **Old OAuth Tokens Won't Work**

- **Impact:** Any stored OAuth refresh tokens become invalid
- **Affected:** Mobile apps, integrations, third-party services
- **Solution:** Users need to re-authenticate

#### 3. **Active Login Attempts May Fail**

- **Impact:** Users currently in the middle of Google login will get errors
- **Duration:** Only during the migration window (5-10 minutes)
- **Solution:** Users should refresh and try again

### User Experience Impact

| User State                      | Effect                                    | Action Required             |
| ------------------------------- | ----------------------------------------- | --------------------------- |
| Currently logged in with Google | Session remains valid until token expires | Re-login after token expiry |
| Currently logging in            | Login will fail                           | Refresh page and retry      |
| Logged in with email/password   | No impact                                 | None                        |
| New users                       | No impact                                 | Can log in normally         |

### Database Impact

#### ✅ No Database Changes Required

- User accounts remain intact
- `googleId` field in User model stays the same
- Email and user data unchanged
- Only OAuth tokens are affected

#### User Model (`users` collection):

```javascript
{
  _id: ObjectId("..."),
  email: "user@example.com",
  name: "John Doe",
  googleId: "1234567890", // ⚠️ STAYS THE SAME
  picture: "https://...",
  role: "Student",
  // ... other fields unchanged
}
```

---

## 🔍 Verification Steps

### 1. Test Local Development

**Test Google Login:**

1. Open `http://localhost:5173/login`
2. Click "Continue with Google"
3. Verify Google OAuth popup appears
4. Complete login
5. Check browser console for errors
6. Verify user data is saved correctly

**Check Backend Logs:**

```bash
cd microservices/auth-service
npm run dev
# Look for: "Google login successful: user@example.com"
```

### 2. Test Production Deployment

**Verify Environment Variables:**

```bash
# Check if new Client ID is loaded
echo $VITE_GOOGLE_CLIENT_ID  # Frontend
echo $GOOGLE_CLIENT_ID        # Backend
```

**Test Login Flow:**

1. Go to your production URL
2. Open browser DevTools (F12) > Network tab
3. Click "Continue with Google"
4. Watch for `/api/auth/google` request
5. Verify response is 200 OK
6. Check user is redirected correctly

### 3. Monitor Error Logs

**Common Issues to Watch For:**

```bash
# Google OAuth error: Wrong number of segments in token
❌ This means frontend is sending access token instead of ID token
✅ Solution: Use GoogleLogin component from @react-oauth/google

# Google OAuth error: Invalid token
❌ Old Client ID/Secret still being used
✅ Solution: Restart services and clear cache

# CORS error
❌ Authorized origins not configured correctly
✅ Solution: Add all origins to Google Console
```

---

## 🛡️ Security Considerations

### Keep Client Secret Secure

**DO:**

- ✅ Store in `.env` files (gitignored)
- ✅ Use environment variables in production
- ✅ Rotate secrets periodically (every 6-12 months)
- ✅ Use different credentials for dev/staging/prod

**DON'T:**

- ❌ Commit secrets to Git
- ❌ Share secrets in Slack/Email
- ❌ Hardcode in source code
- ❌ Use same credentials across environments

### Client ID vs Client Secret

| Credential        | Visibility | Used In            | Security Level |
| ----------------- | ---------- | ------------------ | -------------- |
| **Client ID**     | Public     | Frontend + Backend | Low (public)   |
| **Client Secret** | Private    | Backend Only       | High (secret)  |

**⚠️ NEVER** expose Client Secret in frontend code!

---

## 🔄 Migration Timeline

### Recommended Migration Plan

**Option 1: Immediate Migration (Downtime)**

```
T+0min:  Update credentials
T+1min:  Restart services
T+5min:  Verify login works
T+10min: Monitor logs
Users:   5-10 minute disruption
```

**Option 2: Gradual Migration (No Downtime)**

```
Day 1:   Create new credentials
Day 2:   Test with new credentials in staging
Day 3:   Notify users of upcoming maintenance
Day 4:   Deploy to production during low-traffic hours
Day 5:   Monitor and support users
Users:   Minimal disruption
```

### Communication Template

**Email to Users:**

```
Subject: Important: Google Login Maintenance

Hi [User],

We're upgrading our Google login integration on [DATE] at [TIME].

What this means for you:
- If you're logged in with Google, you'll need to log in again
- The process takes only a few seconds
- Your account and data are completely safe

When: [DATE] at [TIME] (expected duration: 10 minutes)

Questions? Reply to this email or contact support.

Thanks,
Cognito Learning Hub Team
```

---

## 📊 Monitoring & Analytics

### Metrics to Track

**Before Migration:**

```
- Total active Google OAuth sessions
- Daily Google login count
- Error rate on /api/auth/google
```

**During Migration:**

```
- Failed login attempts
- New Google OAuth sessions created
- Error types and frequency
```

**After Migration:**

```
- Google login success rate (should return to normal)
- User complaints or support tickets
- Any lingering authentication errors
```

### Dashboard Queries

**Check Google Login Success Rate:**

```javascript
// In your analytics dashboard
SELECT
  COUNT(*) as total_attempts,
  SUM(CASE WHEN success = true THEN 1 ELSE 0 END) as successful,
  (SUM(CASE WHEN success = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as success_rate
FROM auth_logs
WHERE auth_method = 'google'
  AND created_at >= NOW() - INTERVAL '1 hour';
```

---

## 🆘 Rollback Plan

### If Migration Fails

**Step 1: Immediate Rollback**

```bash
# Revert to old credentials
cd microservices/auth-service
cp .env.backup .env  # Restore from backup

cd ../../frontend
cp .env.backup .env  # Restore from backup
```

**Step 2: Restart Services**

```bash
# Restart all services with old credentials
npm run dev  # For each service
```

**Step 3: Verify**

- Test Google login works with old credentials
- Check error logs
- Monitor user login success rate

**Step 4: Investigate**

- Review error logs
- Check Google Console configuration
- Verify authorized origins/redirects
- Test in isolation

---

## 📝 Checklist

### Pre-Migration

- [ ] Create new OAuth credentials in Google Console
- [ ] Configure authorized origins and redirect URIs
- [ ] Backup current `.env` files
- [ ] Test new credentials in local environment
- [ ] Notify users of maintenance window
- [ ] Prepare rollback plan

### During Migration

- [ ] Update all `.env` files with new credentials
- [ ] Deploy to production
- [ ] Restart all services
- [ ] Clear application caches
- [ ] Test login flow end-to-end
- [ ] Monitor error logs

### Post-Migration

- [ ] Verify Google login works in production
- [ ] Check error rates have normalized
- [ ] Monitor user support tickets
- [ ] Document any issues encountered
- [ ] Update documentation with new Client ID (public)
- [ ] Archive old credentials (but don't delete immediately)

---

## 🔗 Quick Reference

### File Locations

**Backend OAuth Configuration:**

```
microservices/auth-service/.env
microservices/auth-service/.env.local
microservices/auth-service/.env.production
microservices/auth-service/routes/auth.js  (OAuth logic)
```

**Frontend OAuth Configuration:**

```
frontend/.env
frontend/.env.local
frontend/.env.production
frontend/src/components/GoogleAuthButton.jsx
frontend/src/pages/Login.jsx
frontend/src/pages/SignUp.jsx
```

### Important URLs

- **Google Cloud Console:** https://console.cloud.google.com/
- **OAuth Credentials:** https://console.cloud.google.com/apis/credentials
- **OAuth Consent Screen:** https://console.cloud.google.com/apis/credentials/consent
- **API Library:** https://console.cloud.google.com/apis/library

### Support Contacts

- **Google OAuth Documentation:** https://developers.google.com/identity/protocols/oauth2
- **React OAuth Library:** https://www.npmjs.com/package/@react-oauth/google
- **Google Auth Library (Node.js):** https://www.npmjs.com/package/google-auth-library

---

## 💡 Best Practices

1. **Use Different Credentials for Each Environment**

   - Dev Client ID/Secret
   - Staging Client ID/Secret
   - Production Client ID/Secret

2. **Rotate Credentials Periodically**

   - Every 6-12 months
   - Immediately if compromised
   - After team member departures

3. **Monitor OAuth Events**

   - Log all login attempts
   - Track error rates
   - Alert on unusual patterns

4. **Keep Documentation Updated**

   - Current Client IDs (public info)
   - Authorized domains list
   - Migration history

5. **Test Before Production**
   - Always test in staging first
   - Use test Google accounts
   - Verify all redirect URIs work

---

## ❓ FAQ

**Q: Will changing OAuth credentials delete user accounts?**  
A: No, user accounts remain intact. Only OAuth sessions are invalidated.

**Q: Do I need to update the database?**  
A: No, the `googleId` stays the same. Only OAuth tokens change.

**Q: How long does migration take?**  
A: 5-10 minutes for the actual update. Plan 30-60 minutes for full testing.

**Q: Can I have both old and new credentials active?**  
A: No, only one set of credentials can be active at a time per application.

**Q: What happens to users logged in with email/password?**  
A: No impact. Only Google OAuth users are affected.

**Q: Can I test new credentials before switching?**  
A: Yes! Use a separate Google Cloud project for testing, or test in local environment first.

**Q: Is there a way to migrate without user disruption?**  
A: For Google OAuth, no. Users must re-authenticate when credentials change.

---

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OAuth Best Practices](https://developers.google.com/identity/protocols/oauth2/best-practices)
- [Security Best Practices](https://developers.google.com/identity/protocols/oauth2/security-best-practices)
- [React OAuth Library Docs](https://www.npmjs.com/package/@react-oauth/google)

---

**Last Updated:** December 1, 2025  
**Version:** 1.0  
**Maintained By:** Cognito Learning Hub Team
