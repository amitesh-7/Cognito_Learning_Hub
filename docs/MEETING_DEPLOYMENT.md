# 🎥 Meeting Service - Deployment Guide

## Overview

The Meeting Service provides video conferencing capabilities using **MediaSoup SFU** (Selective Forwarding Unit). This document covers deployment considerations and configuration.

---

## Local Development

### Prerequisites

- Node.js 20.x
- Python (for mediasoup native compilation)
- Build tools (Visual Studio Build Tools on Windows)

### Configuration (.env)

```env
NODE_ENV=development
PORT=3009

# Database
MONGO_URI=mongodb+srv://...
REDIS_URL=redis://...

# JWT
JWT_SECRET=your-secret-key

# Meeting Settings
MEETING_TTL=14400
MAX_PARTICIPANTS=50

# WebRTC - STUN Servers
STUN_SERVER_1=stun:stun.l.google.com:19302
STUN_SERVER_2=stun:stun1.l.google.com:19302

# MediaSoup Configuration
MEDIASOUP_MIN_PORT=10000
MEDIASOUP_MAX_PORT=10100
MEDIASOUP_WORKERS=0
MEDIASOUP_ANNOUNCED_IP=<YOUR_LOCAL_IP>
MEDIASOUP_LOG_LEVEL=warn
SFU_MODE_ENABLED=true
```

### Important: MEDIASOUP_ANNOUNCED_IP

**DO NOT use `127.0.0.1`** - this causes WebRTC connection failures.

Find your local IP:

```powershell
# Windows
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike '*Loopback*' } | Select-Object -First 1 -ExpandProperty IPAddress

# Linux/Mac
hostname -I | awk '{print $1}'
```

### Firewall Configuration

Open UDP ports 10000-10100:

```powershell
# Windows
New-NetFirewallRule -DisplayName "MediaSoup RTC" -Direction Inbound -Protocol UDP -LocalPort 10000-10100 -Action Allow
```

---

## Production Deployment

### Challenge: UDP Ports

MediaSoup requires UDP ports (10000-10100) for WebRTC media transport. Most PaaS providers (Render, Heroku, Railway) **do not support** exposing UDP port ranges.

### Solutions

#### Option 1: TURN Server (Recommended for Render)

Use a TURN server to relay all media over TCP/TLS:

```env
# Production .env
TURN_SERVER_URL=turns://turn.example.com:5349
TURN_USERNAME=your-turn-user
TURN_CREDENTIAL=your-turn-password
```

**TURN Server Options:**

- [Twilio TURN](https://www.twilio.com/docs/stun-turn) (Paid, managed)
- [Metered TURN](https://www.metered.ca/turn-server/) (Paid, managed)
- [Coturn](https://github.com/coturn/coturn) (Self-hosted, free)

#### Option 2: VPS/Dedicated Server

Deploy to a provider that allows UDP ports:

- **DigitalOcean Droplet**
- **AWS EC2**
- **Google Cloud Compute**
- **Azure VM**
- **Linode**
- **Fly.io** (supports UDP)

Configuration:

```env
MEDIASOUP_ANNOUNCED_IP=<PUBLIC_IP>
MEDIASOUP_MIN_PORT=10000
MEDIASOUP_MAX_PORT=10100
```

Open firewall:

```bash
sudo ufw allow 10000:10100/udp
```

#### Option 3: Kubernetes with hostNetwork

If using k8s:

```yaml
spec:
  hostNetwork: true
  containers:
    - name: meeting-service
      ports:
        - containerPort: 3009
        - containerPort: 10000
          protocol: UDP
      # ... up to 10100
```

---

## Render Deployment (with TURN)

### 1. Create Web Service

- Root directory: `microservices/meeting-service`
- Build: `npm install`
- Start: `npm start`

### 2. Environment Variables

```env
NODE_ENV=production
PORT=3009
MONGO_URI=<mongodb-atlas-uri>
REDIS_URL=<redis-cloud-uri>
JWT_SECRET=<strong-random-secret>

# Meeting Settings
MEETING_TTL=14400
MAX_PARTICIPANTS=50

# STUN Servers
STUN_SERVER_1=stun:stun.l.google.com:19302
STUN_SERVER_2=stun:stun1.l.google.com:19302

# TURN Server (REQUIRED for Render)
TURN_SERVER_URL=turns://turn.metered.ca:5349
TURN_USERNAME=<your-username>
TURN_CREDENTIAL=<your-credential>

# MediaSoup
MEDIASOUP_WORKERS=0
MEDIASOUP_LOG_LEVEL=warn
SFU_MODE_ENABLED=true
```

### 3. Health Check

Set health check path: `/health`

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Meeting Service                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐     ┌─────────────────┐                │
│  │  Express Server │     │   Socket.IO     │                │
│  │    (HTTP API)   │     │  (Signaling)    │                │
│  └────────┬────────┘     └────────┬────────┘                │
│           │                       │                          │
│           └───────────┬───────────┘                          │
│                       │                                      │
│              ┌────────▼────────┐                            │
│              │  MediaSoup SFU  │                            │
│              │   (16 Workers)  │                            │
│              └────────┬────────┘                            │
│                       │                                      │
│        ┌──────────────┼──────────────┐                      │
│        │              │              │                      │
│        ▼              ▼              ▼                      │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐                  │
│   │ Worker 1│   │ Worker 2│   │ Worker N│                  │
│   │UDP 10000│   │UDP 10001│   │UDP 10099│                  │
│   └─────────┘   └─────────┘   └─────────┘                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### ICE Connection Failed

- Check `MEDIASOUP_ANNOUNCED_IP` is correct public/LAN IP
- Verify UDP ports are open in firewall
- Check TURN server credentials

### Transport State: failed

- Usually NAT/firewall issue
- Enable TURN server for relay
- Check if UDP ports are blocked

### Workers Not Starting

- Ensure mediasoup native dependencies compiled
- Check system has enough memory
- Reduce `MEDIASOUP_WORKERS` if needed

---

_Last Updated: December 2024_
