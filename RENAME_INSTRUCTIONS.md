# 📝 Directory Rename Instructions

## Overview

This document provides instructions for renaming the project directories from `quizwise-ai` to `frontend` and `quizwise-ai-server` to `backend`.

## ✅ Files Already Updated

All references in the following files have been updated:

- `.gitignore`
- `QUICK_START.md`
- `DEPLOYMENT_CHECKLIST.md`
- `PHASE_1_COMPLETE.md`
- `PHASE_2_COMPLETE.md`
- `PHASE_3_COMPLETE.md`
- `MULTIPLAYER_ANALYSIS.md`
- `TESTING_GUIDE.md`
- `quizwise-ai/package.json` → name changed to "frontend"
- `quizwise-ai-server/package.json` → name changed to "backend"

## 🔧 Manual Steps Required

### Step 1: Close All Applications

Before renaming, close:

- [ ] VS Code
- [ ] Any running terminals (especially `node` or `npm` processes)
- [ ] Any file explorers viewing these directories

### Step 2: Rename Directories

Open PowerShell as Administrator and run:

```powershell
cd "k:\IIT BOMBAY\QuizWise-AI-Full-Stack"

# Rename frontend directory
Rename-Item -Path "quizwise-ai" -NewName "frontend"

# Rename backend directory
Rename-Item -Path "quizwise-ai-server" -NewName "backend"
```

**Alternative**: Use Windows File Explorer:

1. Navigate to `k:\IIT BOMBAY\QuizWise-AI-Full-Stack`
2. Right-click `quizwise-ai` → Rename → `frontend`
3. Right-click `quizwise-ai-server` → Rename → `backend`

### Step 3: Verify Directory Structure

After renaming, your structure should look like:

```
QuizWise-AI-Full-Stack/
├── frontend/              (was: quizwise-ai)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend/               (was: quizwise-ai-server)
│   ├── models/
│   ├── utils/
│   ├── index.js
│   ├── package.json
│   └── ...
└── [documentation files]
```

### Step 4: Update Any Local .env Files

If you have local `.env` files (not tracked by git), update any references:

**In `frontend/.env`** (if it exists):

```bash
# No changes needed - already uses environment variables
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

**In `backend/.env`** (if it exists):

```bash
# No changes needed - configuration is environment-agnostic
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
GEMINI_API_KEY=your-gemini-api-key
```

### Step 5: Test the Application

After renaming, test that everything works:

**Terminal 1 - Backend:**

```powershell
cd "k:\IIT BOMBAY\QuizWise-AI-Full-Stack\backend"
node index.js
```

Expected: `Server with Socket.IO running on port 3001`

**Terminal 2 - Frontend:**

```powershell
cd "k:\IIT BOMBAY\QuizWise-AI-Full-Stack\frontend"
npm run dev
```

Expected: `Local: http://localhost:5173`

**Browser Test:**

- Navigate to http://localhost:5173
- Login/Signup should work
- Quiz creation/taking should work
- Live sessions should work

## 🔍 Potential Issues & Solutions

### Issue: "Module not found" errors

**Solution**: Run `npm install` in both directories:

```powershell
cd frontend
npm install

cd ../backend
npm install
```

### Issue: Port already in use

**Solution**: Kill existing processes:

```powershell
# Find processes on port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue: Git tracking issues

**Solution**: Stage and commit the changes:

```powershell
git add .
git commit -m "refactor: rename directories to frontend and backend"
```

## 📋 Checklist

Before proceeding:

- [ ] All terminals are closed
- [ ] VS Code is closed
- [ ] No node processes running (`tasklist | findstr node`)

After renaming:

- [ ] Directories renamed successfully
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Login/Authentication works
- [ ] Quiz features work
- [ ] Live sessions work

## 🎯 Summary

**Changed:**

- `quizwise-ai/` → `frontend/`
- `quizwise-ai-server/` → `backend/`

**Updated Files:** 13 documentation and configuration files

**No Changes Needed In:**

- Source code files (`.js`, `.jsx`) - they use relative imports
- MongoDB database
- Environment variables (they're directory-agnostic)
- Deployment configurations (Vercel/Render use root-relative paths)

---

**Status**: ✅ Ready to rename after closing applications
**Estimated Time**: 2-3 minutes
