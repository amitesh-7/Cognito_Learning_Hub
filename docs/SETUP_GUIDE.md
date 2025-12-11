# 🚀 Cognito Learning Hub - Setup & Deployment Guide

## Quick Start (Local Development)

### Prerequisites

- Node.js 20.x or higher
- npm 9.x or higher
- MongoDB Atlas account
- Redis Cloud account
- Google Gemini API key

### 1. Clone Repository

```bash
git clone https://github.com/amitesh-7/Cognito_Learning_Hub.git
cd Cognito_Learning_Hub
```

### 2. Install Dependencies

**Frontend:**

```bash
cd frontend
npm install
```

**Backend Microservices:**

```bash
# Install shared dependencies first
cd microservices/shared && npm install

# Install each microservice
cd ../api-gateway && npm install
cd ../auth-service && npm install
cd ../quiz-service && npm install
cd ../result-service && npm install
cd ../live-service && npm install
cd ../social-service && npm install
cd ../gamification-service && npm install
cd ../moderation-service && npm install
cd ../meeting-service && npm install
```

Or use the PowerShell script:

```powershell
.\start-microservices.ps1
```

### 3. Environment Configuration

Each microservice requires a `.env` file. Copy from `.env.example`:

```bash
cp microservices/api-gateway/.env.example microservices/api-gateway/.env
# Repeat for each service
```

**Required Environment Variables:**

| Variable               | Description                     |
| ---------------------- | ------------------------------- |
| `MONGO_URI`            | MongoDB Atlas connection string |
| `REDIS_URL`            | Redis Cloud connection URL      |
| `JWT_SECRET`           | Secret key for JWT tokens       |
| `GEMINI_API_KEY`       | Google Gemini API key           |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID          |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret      |

### 4. Start Services

**Development Mode:**

```bash
# Terminal 1 - Frontend
cd frontend && npm run dev

# Terminal 2 - API Gateway
cd microservices/api-gateway && npm run dev

# Terminal 3-10 - Other services
cd microservices/<service-name> && npm run dev
```

**Production Mode:**

```bash
npm start
```

### 5. Access Application

- Frontend: http://localhost:5173
- API Gateway: http://localhost:3000

---

## Deployment Guide (Render)

### Frontend (Vercel)

1. Connect GitHub repository to Vercel
2. Set root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables:
   - `VITE_API_URL=https://your-api-gateway.onrender.com`

### Backend (Render)

For each microservice:

1. Create new Web Service on Render
2. Connect GitHub repository
3. Root directory: `microservices/<service-name>`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables (see table above)

### Service Ports

| Service              | Default Port |
| -------------------- | ------------ |
| API Gateway          | 3000         |
| Auth Service         | 3001         |
| Quiz Service         | 3002         |
| Result Service       | 3003         |
| Live Service         | 3004         |
| Social Service       | 3006         |
| Gamification Service | 3007         |
| Moderation Service   | 3008         |
| Meeting Service      | 3009         |

---

## Meeting Service Special Configuration

The Meeting Service uses MediaSoup for video conferencing and requires additional setup:

### Local Development

```env
MEDIASOUP_ANNOUNCED_IP=<your-local-ip>
MEDIASOUP_MIN_PORT=10000
MEDIASOUP_MAX_PORT=10100
SFU_MODE_ENABLED=true
```

### Production (Render)

Render doesn't support UDP port ranges. You must use a TURN server:

```env
TURN_SERVER_URL=turns://your-turn-server:5349
TURN_USERNAME=<username>
TURN_CREDENTIAL=<password>
```

See `docs/MEETING_DEPLOYMENT.md` for detailed instructions.

---

## Verification

After deployment, verify all services are running:

1. **Health Check:** `GET /health` on each service
2. **API Gateway:** `GET /api/health` returns all service statuses
3. **Frontend:** Login and navigate through features

---

_Last Updated: December 2024_
