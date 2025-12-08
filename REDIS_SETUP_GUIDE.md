# 🔴 Redis Setup Guide - Free Alternatives to Upstash

This guide helps you set up a **FREE Redis instance** that won't expire after 2-3 days.

---

## 🎯 Recommended: Redis Cloud (Redis Labs)

### ✅ Why Redis Cloud?

- ✅ **30MB Free Forever** (vs Upstash's limited free tier)
- ✅ **Unlimited connections**
- ✅ **No expiration** - keeps working indefinitely
- ✅ **Better performance** than Upstash free tier
- ✅ **99.99% uptime SLA**

### 📝 Setup Steps:

#### 1. Create Redis Cloud Account

```bash
# Visit: https://redis.com/try-free/
# Sign up with email or GitHub
```

#### 2. Create a Free Database

1. After login, click **"Create database"**
2. Choose **"Fixed"** plan (30MB free)
3. Select **Cloud Provider**: AWS/GCP/Azure (choose closest to your users)
4. Select **Region**: Choose nearest location (e.g., us-east-1, eu-west-1)
5. Database name: `cognito-learning-hub` or any name you prefer
6. Click **"Activate"**

#### 3. Get Connection Details

After database is created:

1. Go to **Databases** → Your database
2. Find **"Public endpoint"** - looks like:
   ```
   redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com:12345
   ```
3. Find **"Default user password"** - click 👁️ to reveal

#### 4. Update Your Environment Variables

Add to your `.env` files:

**For Microservices** (each service's `.env`):

```env
# Redis Cloud Configuration (RECOMMENDED)
REDIS_CLOUD_URL=rediss://default:YOUR_PASSWORD@redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com:12345
REDIS_CLOUD_PASSWORD=your_password_here

# OR use the full format:
# REDIS_CLOUD_URL=rediss://redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com:12345
# REDIS_CLOUD_PASSWORD=your_password_here

# Legacy - Remove or comment out Upstash
# UPSTASH_REDIS_URL=...
# UPSTASH_REDIS_TOKEN=...
```

**Build the URL:**

```
rediss://default:YOUR_PASSWORD@YOUR_HOST:YOUR_PORT
```

**Example:**

```env
REDIS_CLOUD_URL=rediss://default:MySecretPass123@redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com:12345
```

#### 5. Deploy to Production

**Vercel:**

```bash
vercel env add REDIS_CLOUD_URL
# Paste your Redis Cloud URL when prompted

vercel env add REDIS_CLOUD_PASSWORD
# Paste your password when prompted
```

**Render:**

1. Go to your service → **Environment**
2. Add `REDIS_CLOUD_URL` = your Redis Cloud URL
3. Add `REDIS_CLOUD_PASSWORD` = your password
4. Click **"Save"**

---

## 🚂 Alternative: Railway Redis

### Why Railway?

- ✅ **$5/month free credit** (enough for Redis)
- ✅ **Auto-scales** with usage
- ✅ **Simple setup**

### Setup:

1. Visit: https://railway.app/
2. Sign up with GitHub
3. New Project → **Add Redis**
4. Copy connection string from **Variables** tab
5. Add to your `.env`:

```env
REDIS_CLOUD_URL=redis://default:password@hostname:port
```

---

## 🎨 Alternative: Render Redis

### Why Render?

- ✅ **Free tier available**
- ✅ **Easy deployment**

### Setup:

1. Visit: https://render.com/
2. Sign up
3. New → **Redis**
4. Choose **Free** plan
5. Copy **Internal Connection String**
6. Add to your `.env`:

```env
REDIS_CLOUD_URL=redis://red-xxxxx:6379
```

---

## 🧪 Testing Your Connection

Run this test script:

```bash
# In microservices directory
node test-redis.js
```

Create `test-redis.js`:

```javascript
require("dotenv").config();
const Redis = require("ioredis");

const url = process.env.REDIS_CLOUD_URL;
console.log(
  "Testing Redis connection to:",
  url ? url.split("@")[1] : "No URL configured"
);

const redis = new Redis(url);

redis.on("connect", () => {
  console.log("✅ Redis connected successfully!");

  // Test set/get
  redis.set("test-key", "Hello Redis Cloud!");
  redis.get("test-key", (err, result) => {
    console.log("✅ Test data:", result);
    redis.disconnect();
    process.exit(0);
  });
});

redis.on("error", (err) => {
  console.error("❌ Redis connection failed:", err.message);
  process.exit(1);
});
```

Run:

```bash
node test-redis.js
```

Expected output:

```
Testing Redis connection to: redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com:12345
✅ Redis connected successfully!
✅ Test data: Hello Redis Cloud!
```

---

## 🔄 Migration from Upstash

Your app already supports **automatic fallback**! The priority is:

1. **Redis Cloud** (`REDIS_CLOUD_URL`) - Checked first ✅
2. **Upstash** (`UPSTASH_REDIS_URL`) - Fallback
3. **Local Redis** - Development fallback
4. **In-Memory** - Last resort

**To migrate:**

1. Set up Redis Cloud (steps above)
2. Add `REDIS_CLOUD_URL` to your environment
3. Deploy/restart your services
4. Remove `UPSTASH_REDIS_URL` when confirmed working

---

## 📊 Comparison Table

| Provider        | Free Tier        | Limits                | Expiration    | Speed     | Recommended |
| --------------- | ---------------- | --------------------- | ------------- | --------- | ----------- |
| **Redis Cloud** | 30MB             | Unlimited connections | Never         | Fast      | ⭐⭐⭐⭐⭐  |
| **Railway**     | $5 credit/mo     | Based on usage        | Monthly reset | Very Fast | ⭐⭐⭐⭐    |
| **Render**      | Limited          | 25 connections        | Never         | Medium    | ⭐⭐⭐      |
| **Upstash**     | 10K commands/day | Resets after 2-3 days | Limited       | Fast      | ⭐⭐        |

---

## 🐛 Troubleshooting

### Connection Failed

```bash
# Check if URL is correct
echo $REDIS_CLOUD_URL

# Test with redis-cli
redis-cli -u $REDIS_CLOUD_URL ping
# Should return: PONG
```

### SSL/TLS Errors

Make sure your URL starts with `rediss://` (with two 's') for SSL:

```env
# ✅ Correct
REDIS_CLOUD_URL=rediss://...

# ❌ Wrong (no SSL)
REDIS_CLOUD_URL=redis://...
```

### Password Issues

URL format must include password:

```
rediss://default:PASSWORD@host:port
```

Or use separate password variable:

```env
REDIS_CLOUD_URL=rediss://host:port
REDIS_CLOUD_PASSWORD=your_password
```

### Still Using In-Memory?

Check logs:

```bash
# In your service logs, look for:
"Attempting to connect to Redis Cloud"
"Redis connected successfully"

# If you see:
"switching to in-memory"
# Then Redis connection failed
```

---

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies (if needed)
npm install ioredis

# 2. Update .env files
cd microservices/live-service
echo "REDIS_CLOUD_URL=rediss://your-url-here" >> .env

cd ../gamification-service
echo "REDIS_CLOUD_URL=rediss://your-url-here" >> .env

# 3. Restart services
npm run dev

# 4. Check logs for "Redis connected successfully"
```

---

## 💡 Best Practices

1. **Use Redis Cloud for production** - Most reliable free tier
2. **Keep Upstash as backup** - In case Redis Cloud is down
3. **Monitor usage** - Check Redis Cloud dashboard monthly
4. **Set up alerts** - Configure email alerts for 80% memory usage
5. **Use TTL for temporary data** - Automatically expire old session data

---

## 📞 Support

If you encounter issues:

1. **Redis Cloud Support**: support@redis.com
2. **Check status**: https://status.redis.com/
3. **Community**: https://discord.gg/redis

---

## ✅ Verification Checklist

- [ ] Created Redis Cloud account
- [ ] Created free database (30MB)
- [ ] Copied connection URL and password
- [ ] Updated `.env` files with `REDIS_CLOUD_URL`
- [ ] Tested connection with test script
- [ ] Deployed to production (Vercel/Render)
- [ ] Verified logs show "Redis Cloud connected"
- [ ] Removed/commented out Upstash credentials
- [ ] Tested live quiz functionality
- [ ] Set up monitoring alerts (optional)

---

**🎉 You're all set! Your Redis will never expire now!**
