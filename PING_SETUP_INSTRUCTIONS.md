# Keep Services Alive - GitHub Actions Setup

## 🎯 Purpose

Prevent Render free tier services from sleeping by pinging them every 14 minutes.

## 📝 How to Configure

### Step 1: Get Your Service URLs from Render

Go to your Render dashboard and copy the URLs for each service:

1. **API Gateway**: `https://your-api-gateway.onrender.com`
2. **Auth Service**: `https://your-auth-service.onrender.com`
3. **Quiz Service**: `https://your-quiz-service.onrender.com`
4. **Result Service**: `https://your-result-service.onrender.com`
5. **Live Service**: `https://your-live-service.onrender.com`
6. **Meeting Service**: `https://your-meeting-service.onrender.com`
7. **Social Service**: `https://your-social-service.onrender.com`
8. **Gamification Service**: `https://your-gamification-service.onrender.com`
9. **Moderation Service**: `https://your-moderation-service.onrender.com`

### Step 2: Update `.github/workflows/ping.yml`

Replace the placeholders with your actual service URLs:

**Find and Replace:**

```yaml
<YOUR_API_GATEWAY_URL>        → https://your-api-gateway.onrender.com
<YOUR_AUTH_SERVICE_URL>        → https://your-auth-service.onrender.com
<YOUR_QUIZ_SERVICE_URL>        → https://your-quiz-service.onrender.com
<YOUR_RESULT_SERVICE_URL>      → https://your-result-service.onrender.com
<YOUR_LIVE_SERVICE_URL>        → https://your-live-service.onrender.com
<YOUR_MEETING_SERVICE_URL>     → https://your-meeting-service.onrender.com
<YOUR_SOCIAL_SERVICE_URL>      → https://your-social-service.onrender.com
<YOUR_GAMIFICATION_SERVICE_URL> → https://your-gamification-service.onrender.com
<YOUR_MODERATION_SERVICE_URL>  → https://your-moderation-service.onrender.com
```

### Step 3: Example (After Replacement)

```yaml
- name: Ping API Gateway
  run: |
    echo "Pinging API Gateway..."
    curl -s https://api-gateway-abc123.onrender.com/health || true

- name: Ping Auth Service
  run: |
    echo "Pinging Auth Service..."
    curl -s https://auth-service-xyz789.onrender.com/health || true
```

### Step 4: Commit and Push

```bash
git add .github/workflows/ping.yml
git commit -m "Configure auto-ping for all Render services"
git push origin main
```

## ✅ Verification

1. Go to your GitHub repository
2. Click **Actions** tab
3. Find **Keep Render Services Alive** workflow
4. Click **Run workflow** (manual trigger) to test immediately
5. Check the logs to ensure all services are being pinged

## ⚙️ How It Works

- **Schedule**: Runs every 14 minutes (Render sleeps after 15 min of inactivity)
- **Method**: Sends HTTP GET request to `/health` endpoint of each service
- **Failure Handling**: `|| true` ensures workflow continues even if a service is down
- **Manual Trigger**: You can manually run the workflow anytime from GitHub Actions

## 🚨 Important Notes

1. **Free Tier Limits**: Render allows 750 hours/month free per service
2. **Keep-alive Impact**: Running 24/7 uses ~720 hours/month (within limit)
3. **Multiple Services**: With 9 services, you'll use most of your free hours
4. **Alternative**: Consider upgrading critical services or using a paid tier

## 📊 Monitoring

Check workflow runs:

- GitHub → Repository → Actions → Keep Render Services Alive
- View logs to see which services responded
- Failed pings will show in red but won't stop the workflow

## 🔧 Customization

### Change Ping Frequency

Edit the cron schedule in `ping.yml`:

```yaml
- cron: "*/10 * * * *" # Every 10 minutes
- cron: "*/14 * * * *" # Every 14 minutes (default)
- cron: "0 * * * *" # Every hour
- cron: "*/30 * * * *" # Every 30 minutes
```

### Remove Specific Services

Simply delete or comment out the step for services you don't want to keep alive.

---

**Note**: This workflow only keeps services alive. For true high availability, consider Render's paid tier which doesn't sleep.
