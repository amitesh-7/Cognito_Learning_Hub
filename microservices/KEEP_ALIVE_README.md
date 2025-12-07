# Keep-Alive Service for Render Backend Services

## Purpose

This service pings all 9 backend microservices every 14 minutes to prevent them from sleeping on Render's free tier (which puts services to sleep after 15 minutes of inactivity).

## Services Monitored

1. **Social Service** - https://social-service-lwjy.onrender.com
2. **Result Service** - https://result-service-vwjh.onrender.com
3. **Meeting Service** - https://meeting-service-ogfj.onrender.com
4. **Auth Service** - https://auth-service-uds0.onrender.com
5. **API Gateway** - https://api-gateway-kzo9.onrender.com
6. **Live Service** - https://live-service-ga6w.onrender.com
7. **Gamification Service** - https://gamification-service-ax6n.onrender.com
8. **Quiz Service** - https://quiz-service-6jzt.onrender.com
9. **Moderation Service** - https://moderation-service-3e2e.onrender.com

## Usage

### Running Locally

```bash
# Navigate to microservices directory
cd microservices

# Run the keep-alive script
node keep-alive.js
```

### Running with PM2 (Recommended for Production)

```bash
# Install PM2 globally (if not already installed)
npm install -g pm2

# Start the keep-alive service
pm2 start keep-alive.js --name cognito-keep-alive

# View logs
pm2 logs cognito-keep-alive

# View status
pm2 status

# Stop the service
pm2 stop cognito-keep-alive

# Restart the service
pm2 restart cognito-keep-alive

# Make it run on system startup
pm2 startup
pm2 save
```

### Running in Background (Windows)

```powershell
# Using PowerShell
Start-Process node -ArgumentList "keep-alive.js" -WindowStyle Hidden
```

### Running in Background (Linux/Mac)

```bash
# Using nohup
nohup node keep-alive.js > keep-alive.log 2>&1 &

# Or using screen
screen -dmS keep-alive node keep-alive.js
```

## Output Example

```
🚀 Keep-Alive Service Started
📍 Monitoring 9 backend services on Render.com
⏱️  Ping interval: 14 minutes

================================================================================
🔄 [12/7/2025, 10:30:00] Pinging all services...
================================================================================
✅ [12/7/2025, 10:30:01] Social Service - Status: 200 - Response time: 1234ms
✅ [12/7/2025, 10:30:02] Result Service - Status: 200 - Response time: 1456ms
✅ [12/7/2025, 10:30:02] Meeting Service - Status: 200 - Response time: 1589ms
✅ [12/7/2025, 10:30:03] Auth Service - Status: 200 - Response time: 1123ms
✅ [12/7/2025, 10:30:03] API Gateway - Status: 200 - Response time: 1345ms
✅ [12/7/2025, 10:30:04] Live Service - Status: 200 - Response time: 1678ms
✅ [12/7/2025, 10:30:04] Gamification Service - Status: 200 - Response time: 1234ms
✅ [12/7/2025, 10:30:05] Quiz Service - Status: 200 - Response time: 1456ms
✅ [12/7/2025, 10:30:05] Moderation Service - Status: 200 - Response time: 1567ms
================================================================================
📊 Summary: 9/9 services responded successfully
   Success: 9 | Failed: 0 | Avg Response Time: 1409ms
⏰ Next ping in 14 minutes...
================================================================================
```

## Configuration

### Changing Ping Interval

Edit `keep-alive.js` and modify the `PING_INTERVAL` constant:

```javascript
// Default: 14 minutes (840,000 milliseconds)
const PING_INTERVAL = 14 * 60 * 1000;

// Examples:
// 10 minutes: const PING_INTERVAL = 10 * 60 * 1000;
// 5 minutes: const PING_INTERVAL = 5 * 60 * 1000;
```

### Adding/Removing Services

Edit the `SERVICES` array in `keep-alive.js`:

```javascript
const SERVICES = [
  { name: "Service Name", url: "https://your-service.onrender.com" },
  // Add more services here
];
```

## Deployment Options

### Option 1: Run on Your Local Machine

- Simple and free
- Requires your computer to be always on
- Stops when computer sleeps/shuts down

### Option 2: Deploy on Render (Recommended)

- Create a new Web Service on Render
- Connect your GitHub repo
- Set build command: `npm install`
- Set start command: `node microservices/keep-alive.js`
- Keep this service on a paid plan (it's cheap and will keep all other services alive)

### Option 3: Deploy on Heroku/Railway/Fly.io

- Similar to Render deployment
- Use free tier for the keep-alive service itself
- Configure start command accordingly

### Option 4: Use GitHub Actions (Free)

- Create a GitHub Action workflow
- Runs every 14 minutes using cron
- Completely free but less reliable than a dedicated service

### Option 5: Use a Cron Job Service

- Use services like cron-job.org, easycron.com
- Configure to hit all URLs every 14 minutes
- Limited to HTTP GET requests only

## Troubleshooting

### Services Still Sleeping

- Verify the ping interval is < 15 minutes
- Check if keep-alive.js is running: `ps aux | grep keep-alive`
- Check logs for errors

### Timeout Errors

- Normal for first ping after service wakes up (cold start)
- Render free tier can take 30-60 seconds to wake up
- Script has 30s timeout to handle this

### High Response Times

- Expected on Render free tier (cold starts)
- First ping after sleep: 10-30 seconds
- Subsequent pings: 1-5 seconds

## Cost Optimization

**Recommended Setup:**

- Deploy keep-alive.js on Render paid tier (~$7/month)
- Keep all 9 services on free tier
- Total cost: $7/month (vs $63/month if all services were paid)

**Alternative (100% Free):**

- Run keep-alive.js on your local machine
- Use PM2 to auto-restart on crashes
- Only works when your computer is on

## Monitoring

### Check if Service is Running

```bash
# Using PM2
pm2 status

# Using ps (Linux/Mac)
ps aux | grep keep-alive

# Using Task Manager (Windows)
# Look for "node keep-alive.js" process
```

### View Logs

```bash
# PM2 logs
pm2 logs cognito-keep-alive

# If running with nohup
tail -f keep-alive.log

# Real-time monitoring
watch -n 60 'curl -s https://api-gateway-kzo9.onrender.com'
```

## Notes

- **Free tier limitations:** Render free services sleep after 15 minutes of inactivity
- **Wake-up time:** Services take 10-60 seconds to wake from sleep
- **Bandwidth:** Each ping uses minimal bandwidth (~1-5KB per service)
- **Request limits:** Render free tier has no request limit, only sleep timer
- **Best practice:** Keep the keep-alive service itself on a paid plan for reliability

## License

MIT License - Part of Cognito Learning Hub project

## Author

Amitesh Kumar (amitesh-7)
