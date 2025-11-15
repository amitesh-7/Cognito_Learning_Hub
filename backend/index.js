require("dotenv").config();
const express = require("express");
const http = require("http"); // <-- NEW: HTTP server for Socket.IO
const { Server } = require("socket.io"); // <-- NEW: Socket.IO
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // Node.js File System module
const pdf = require("pdf-parse"); // PDF parsing library
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { OAuth2Client } = require("google-auth-library"); // Google OAuth

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const admin = require("./adminMiddleware");
const moderator = require("./moderatorMiddleware");

const Quiz = require("./models/Quiz");
const Report = require("./models/Report");
const auth = require("./authMiddleware");
const Result = require("./models/Result");
const {
  Achievement,
  UserAchievement,
  UserStats,
} = require("./models/Achievement");
const QuizPDFGenerator = require("./utils/pdfGenerator");
const LiveSession = require("./models/LiveSession"); // <-- NEW: Live session model
const DuelMatch = require("./models/DuelMatch"); // <-- NEW: 1v1 Duel model
const {
  Friendship,
  Challenge,
  Message,
  ChatRoom,
  Notification,
  Broadcast,
} = require("./models/SocialFeatures");

// --- SECURITY MIDDLEWARE IMPORTS ---
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const { body, validationResult } = require("express-validator");
const hpp = require("hpp");

// --- CONFIGURATION ---
const app = express();

// Trust proxy - IMPORTANT for Render deployment
// This allows express-rate-limit to correctly identify users behind Render's proxy
app.set("trust proxy", 1);

const server = http.createServer(app); // <-- NEW: Wrap Express with HTTP server
const PORT = process.env.PORT || 3001; // Use environment PORT or default to 3001

const MONGO_URI = process.env.MONGO_URI;
const API_KEY = process.env.API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Google OAuth client
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// --- MULTER SETUP (for file uploads) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // The folder where files will be saved
  },
  filename: function (req, file, cb) {
    // Create a unique filename to avoid overwrites
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

// --- MIDDLEWARE ---
// CORS configuration for production and development
const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(",").map((url) => url.trim())
  : process.env.NODE_ENV === "production"
  ? [
      "https://www.quizwise-ai.live",
      "https://quizwise-ai.live",
      "https://quiz-wise-ai-full-stack.vercel.app",
      "https://quizwise-ai-server.onrender.com",
      "https://cognito-learning-hub-frontend.vercel.app",
    ]
  : [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
    ];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // Check if the origin matches any allowed origin or is a Vercel preview deployment
    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app") ||
      origin.endsWith(".onrender.com") || // Allow Render deployments
      origin.includes("localhost") ||
      origin.includes("127.0.0.1");

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
};

app.use(cors(corsOptions));
app.use(express.json());

// --- SECURITY MIDDLEWARE ---
// 1. Helmet - Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://accounts.google.com",
          "https://fonts.googleapis.com",
        ],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://accounts.google.com",
          "https://apis.google.com",
        ],
        frameSrc: [
          "'self'",
          "https://accounts.google.com",
          "https://www.google.com",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https:",
          "https://*.googleusercontent.com",
        ],
        connectSrc: [
          "'self'",
          "https://generativelanguage.googleapis.com",
          "https://accounts.google.com",
          "https://oauth2.googleapis.com",
          "ws://localhost:3001",
          "ws://127.0.0.1:3001",
          "http://localhost:3001",
          "http://127.0.0.1:3001",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }, // Allow Google OAuth popups
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// 2. Data Sanitization against NoSQL Injection (Express 5 compatible)
// Custom middleware to sanitize user input
const sanitizeInput = (obj) => {
  if (obj && typeof obj === "object") {
    for (const key in obj) {
      if (typeof obj[key] === "string") {
        // Remove $ and . from beginning of keys to prevent NoSQL injection
        obj[key] = obj[key].replace(/^\$/, "").replace(/^\./g, "");
      } else if (typeof obj[key] === "object") {
        sanitizeInput(obj[key]);
      }
    }
    // Remove keys that start with $ or .
    Object.keys(obj).forEach((key) => {
      if (key.startsWith("$") || key.startsWith(".")) {
        delete obj[key];
      }
    });
  }
  return obj;
};

app.use((req, res, next) => {
  if (req.body) req.body = sanitizeInput(req.body);
  if (req.query) req.query = sanitizeInput(req.query);
  if (req.params) req.params = sanitizeInput(req.params);
  next();
});

// 3. Prevent HTTP Parameter Pollution
app.use(hpp());

// 4. Rate Limiting - General API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// 5. Rate Limiting - Authentication endpoints (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login/signup attempts per windowMs
  message:
    "Too many authentication attempts, please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// 6. Rate Limiting - Quiz generation (moderate)
const quizGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit to 20 quiz generations per 15 minutes
  message: "Quiz generation limit reached. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all routes
app.use("/api/", generalLimiter);

// --- END SECURITY MIDDLEWARE ---

// Root route for Vercel health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Cognito Learning Hub Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/test",
      api: "/api/*",
    },
  });
});

// --- SOCKET.IO SETUP ---
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or postman)
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".onrender.com") ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1");

      if (isAllowed) {
        callback(null, true);
      } else {
        console.log("[Socket.IO] CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
  transports: ["websocket", "polling"], // Support both for compatibility
  pingTimeout: 60000, // 60 seconds before considering connection lost
  pingInterval: 25000, // Send ping every 25 seconds
  allowEIO3: true, // Allow Engine.IO v3 clients
  allowUpgrades: true, // Allow transport upgrades
  cookie: false, // Disable cookies for better CORS support
});

// Store active sessions in memory for fast access
// Format: Map<sessionCode, { hostSocketId, participantSockets: Map<userId, socketId> }>
const activeSessions = new Map();

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // ========================================
  // EVENT: create-session
  // Teacher/Admin creates a live quiz session
  // ========================================
  socket.on("create-session", async (data, callback) => {
    try {
      const { quizId, hostId, settings } = data;

      // Validate quiz exists
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        return callback({ success: false, error: "Quiz not found" });
      }

      // Generate unique session code
      const sessionCode = await LiveSession.generateSessionCode();

      // Create session in database
      const session = new LiveSession({
        sessionCode,
        quizId,
        hostId,
        hostSocketId: socket.id,
        settings: settings || {},
      });

      await session.save();

      // Store in memory for fast access
      activeSessions.set(sessionCode, {
        hostSocketId: socket.id,
        participantSockets: new Map(),
      });

      // Host joins their own room
      socket.join(sessionCode);

      console.log(
        `[Socket.IO] 🎓 Host joined room ${sessionCode}. Socket ID: ${socket.id}`
      );
      console.log(
        `[Socket.IO] 🚪 Room members after host join:`,
        io.sockets.adapter.rooms.get(sessionCode)
      );

      console.log(
        `[Socket.IO] Session created: ${sessionCode} by host ${hostId}`
      );

      callback({
        success: true,
        sessionCode,
        sessionId: session._id,
      });
    } catch (error) {
      console.error("[Socket.IO] Error creating session:", error);
      callback({ success: false, error: error.message });
    }
  });

  // ========================================
  // EVENT: join-session
  // Student joins a live quiz session
  // ========================================
  socket.on("join-session", async (data, callback) => {
    try {
      const { sessionCode, userId, username, avatar } = data;

      // Find session in database
      const session = await LiveSession.findOne({ sessionCode }).populate(
        "quizId"
      );

      if (!session) {
        return callback({ success: false, error: "Session not found" });
      }

      // Check session status
      if (session.status === "completed" || session.status === "cancelled") {
        return callback({ success: false, error: "Session has ended" });
      }

      // Check if participant is reconnecting
      const existingParticipant = session.participants.find(
        (p) => p.userId.toString() === userId
      );
      let isReconnection = false;

      console.log(`[Socket.IO] 🔍 Checking for existing participant:`, {
        userId,
        username,
        existingParticipant: existingParticipant
          ? {
              userId: existingParticipant.userId,
              username: existingParticipant.username,
              socketId: existingParticipant.socketId,
            }
          : null,
        totalParticipants: session.participants.length,
      });

      if (existingParticipant) {
        // Reconnection detected
        isReconnection = true;
        existingParticipant.socketId = socket.id;
        existingParticipant.disconnectedAt = null;
        await session.save();
        console.log(
          `[Socket.IO] ♻️ User ${username} reconnected to session ${sessionCode}`
        );
      } else {
        // New participant joining
        // Check if late join is allowed
        if (!session.settings.allowLateJoin && session.status === "active") {
          return callback({
            success: false,
            error: "Late joining is not allowed",
          });
        }

        // Check participant limit
        if (session.participantCount >= session.settings.maxParticipants) {
          return callback({ success: false, error: "Session is full" });
        }

        // Add participant to session
        await session.addParticipant({
          userId,
          username,
          avatar,
          socketId: socket.id,
        });
      }

      // Update in-memory store
      const sessionMemory = activeSessions.get(sessionCode);
      if (sessionMemory) {
        sessionMemory.participantSockets.set(userId, socket.id);
      }

      // Join the room
      socket.join(sessionCode);

      // Notify everyone in the room (only if new join, not reconnection)
      if (!isReconnection) {
        console.log(
          `[Socket.IO] 📢 EMITTING participant-joined to room ${sessionCode}`
        );
        console.log(`[Socket.IO] 👤 Participant: ${username} (${userId})`);
        console.log(
          `[Socket.IO] 📊 Participant count: ${session.participantCount + 1}`
        );
        console.log(
          `[Socket.IO] 🚪 Room members:`,
          io.sockets.adapter.rooms.get(sessionCode)
        );

        io.to(sessionCode).emit("participant-joined", {
          userId,
          username,
          avatar,
          participantCount: session.participantCount + 1,
        });

        console.log(`[Socket.IO] ✅ participant-joined event emitted`);
      }

      console.log(
        `[Socket.IO] User ${username} ${
          isReconnection ? "reconnected to" : "joined"
        } session ${sessionCode}`
      );

      // Calculate current state for reconnecting users
      const leaderboard = isReconnection ? session.getLeaderboard() : null;

      callback({
        success: true,
        isReconnection,
        session: {
          sessionCode: session.sessionCode,
          quizTitle: session.quizId.title,
          status: session.status,
          currentQuestionIndex: session.currentQuestionIndex,
          participantCount: session.participantCount + (isReconnection ? 0 : 1),
          totalQuestions: session.quizId.questions.length,
        },
        // Send current question and leaderboard for reconnections
        ...(isReconnection &&
          session.status === "active" && {
            currentQuestion:
              session.quizId.questions[session.currentQuestionIndex],
            leaderboard,
          }),
      });
    } catch (error) {
      console.error("[Socket.IO] Error joining session:", error);
      callback({ success: false, error: error.message });
    }
  });

  // ========================================
  // EVENT: start-quiz
  // Host starts the quiz
  // ========================================
  socket.on("start-quiz", async (data, callback) => {
    try {
      const { sessionCode } = data;

      const session = await LiveSession.findOne({ sessionCode }).populate(
        "quizId"
      );

      if (!session) {
        return callback({ success: false, error: "Session not found" });
      }

      // Verify host
      if (session.hostSocketId !== socket.id) {
        return callback({
          success: false,
          error: "Only host can start the quiz",
        });
      }

      // Update session status
      session.status = "active";
      session.startedAt = new Date();
      session.currentQuestionIndex = 0;
      session.questionStartTimes.push({
        questionIndex: 0,
        startedAt: new Date(),
      });

      await session.save();

      // Get first question
      const firstQuestion = session.quizId.questions[0];

      // Broadcast to all participants
      io.to(sessionCode).emit("quiz-started", {
        questionIndex: 0,
        question: {
          question: firstQuestion.question,
          type: firstQuestion.type,
          options: firstQuestion.options,
          timeLimit:
            firstQuestion.timeLimit || session.settings.timePerQuestion,
          points: firstQuestion.points,
          difficulty: firstQuestion.difficulty,
        },
        totalQuestions: session.quizId.questions.length,
        timestamp: Date.now(),
      });

      console.log(`[Socket.IO] Quiz started in session ${sessionCode}`);

      callback({ success: true });
    } catch (error) {
      console.error("[Socket.IO] Error starting quiz:", error);
      callback({ success: false, error: error.message });
    }
  });

  // ========================================
  // EVENT: submit-answer
  // Student submits an answer
  // ========================================
  socket.on("submit-answer", async (data, callback) => {
    try {
      const { sessionCode, userId, questionIndex, answer, timeSpent } = data;

      const session = await LiveSession.findOne({ sessionCode }).populate(
        "quizId"
      );

      if (!session) {
        return callback({ success: false, error: "Session not found" });
      }

      // Get correct answer
      const question = session.quizId.questions[questionIndex];
      const isCorrect = answer === question.correct_answer;

      console.log(`[Socket.IO] 📝 Answer check:`, {
        submitted: answer,
        correct: question.correct_answer,
        isCorrect: isCorrect,
      });

      // Calculate points with speed bonus and streak multiplier
      let pointsEarned = 0;
      let streakBonus = 0;

      if (isCorrect) {
        const basePoints = question.points || 10;
        const timeLimit =
          question.timeLimit || session.settings.timePerQuestion;

        // Speed bonus (up to 50% of base points)
        const speedBonus = Math.floor(
          ((timeLimit - timeSpent) / timeLimit) * (basePoints * 0.5)
        );

        // Calculate streak bonus
        const participant = session.participants.find(
          (p) => p.userId.toString() === userId
        );
        if (participant) {
          // Count consecutive correct answers before this one
          let streak = 0;
          for (let i = participant.answers.length - 1; i >= 0; i--) {
            if (participant.answers[i].isCorrect) {
              streak++;
            } else {
              break;
            }
          }

          // Streak multiplier: 2 streak = 10%, 3 = 15%, 4 = 20%, 5+ = 25%
          if (streak >= 2) {
            const streakMultiplier = Math.min(0.25, 0.05 + (streak - 1) * 0.05);
            streakBonus = Math.floor(basePoints * streakMultiplier);
          }
        }

        pointsEarned = basePoints + Math.max(0, speedBonus) + streakBonus;
      }

      // Record answer
      await session.recordAnswer(userId, {
        questionIndex,
        answer,
        isCorrect,
        timeSpent,
        pointsEarned,
      });

      // Reload to get updated scores
      await session.populate("quizId");
      const leaderboard = session.getLeaderboard();

      // Broadcast updated leaderboard
      io.to(sessionCode).emit("leaderboard-updated", {
        leaderboard,
        questionIndex,
      });

      console.log(
        `[Socket.IO] Answer submitted by user ${userId} in session ${sessionCode} - Points: ${pointsEarned} (${
          streakBonus > 0 ? `+${streakBonus} streak bonus` : "no streak"
        })`
      );

      callback({
        success: true,
        isCorrect,
        pointsEarned,
        streakBonus,
        correctAnswer: session.settings.showCorrectAnswers
          ? question.correct_answer
          : undefined,
        explanation: session.settings.showCorrectAnswers
          ? question.explanation
          : undefined,
      });
    } catch (error) {
      console.error("[Socket.IO] Error submitting answer:", error);
      callback({ success: false, error: error.message });
    }
  });

  // ========================================
  // EVENT: next-question
  // Host moves to next question
  // ========================================
  socket.on("next-question", async (data, callback) => {
    try {
      const { sessionCode } = data;

      const session = await LiveSession.findOne({ sessionCode }).populate(
        "quizId"
      );

      if (!session) {
        return callback({ success: false, error: "Session not found" });
      }

      // Verify host
      if (session.hostSocketId !== socket.id) {
        return callback({
          success: false,
          error: "Only host can navigate questions",
        });
      }

      const nextIndex = session.currentQuestionIndex + 1;

      // Check if quiz is complete
      if (nextIndex >= session.quizId.questions.length) {
        return socket.emit("end-session", { sessionCode });
      }

      // Update session
      session.currentQuestionIndex = nextIndex;
      session.questionStartTimes.push({
        questionIndex: nextIndex,
        startedAt: new Date(),
      });

      await session.save();

      const nextQuestion = session.quizId.questions[nextIndex];

      // Broadcast next question
      io.to(sessionCode).emit("question-started", {
        questionIndex: nextIndex,
        question: {
          question: nextQuestion.question,
          type: nextQuestion.type,
          options: nextQuestion.options,
          timeLimit: nextQuestion.timeLimit || session.settings.timePerQuestion,
          points: nextQuestion.points,
          difficulty: nextQuestion.difficulty,
        },
        totalQuestions: session.quizId.questions.length,
        timestamp: Date.now(),
      });

      console.log(
        `[Socket.IO] Next question (${nextIndex}) in session ${sessionCode}`
      );

      callback({ success: true, questionIndex: nextIndex });
    } catch (error) {
      console.error("[Socket.IO] Error moving to next question:", error);
      callback({ success: false, error: error.message });
    }
  });

  // ========================================
  // EVENT: end-session
  // Host ends the quiz session
  // ========================================
  socket.on("end-session", async (data, callback) => {
    try {
      const { sessionCode } = data;

      const session = await LiveSession.findOne({ sessionCode }).populate(
        "quizId"
      );

      if (!session) {
        return callback({ success: false, error: "Session not found" });
      }

      // Verify host
      if (session.hostSocketId !== socket.id) {
        return callback({
          success: false,
          error: "Only host can end the session",
        });
      }

      // Update session status
      session.status = "completed";
      session.endedAt = new Date();

      await session.save();

      // Get final leaderboard
      const leaderboard = session.getLeaderboard();

      // Save results for all participants
      for (const participant of session.participants) {
        if (!participant.isActive) continue;

        const result = new Result({
          user: participant.userId,
          quiz: session.quizId._id,
          score: participant.answers.filter((a) => a.isCorrect).length,
          totalQuestions: session.quizId.questions.length,
          pointsEarned: participant.score,
          totalTimeTaken: participant.answers.reduce(
            (sum, a) => sum + a.timeSpent,
            0
          ),
          percentage:
            (participant.answers.filter((a) => a.isCorrect).length /
              session.quizId.questions.length) *
            100,
          passed:
            (participant.answers.filter((a) => a.isCorrect).length /
              session.quizId.questions.length) *
              100 >=
            session.quizId.passingScore,
          questionResults: participant.answers.map((a) => ({
            questionId: session.quizId.questions[a.questionIndex]._id,
            userAnswer: a.answer,
            correctAnswer:
              session.quizId.questions[a.questionIndex].correct_answer,
            isCorrect: a.isCorrect,
            timeTaken: a.timeSpent,
            pointsEarned: a.pointsEarned,
          })),
        });

        await result.save();
      }

      // Finalize session and save final leaderboard
      try {
        console.log(`[Socket.IO] Before finalize - Status: ${session.status}`);
        await session.finalizeSession();
        console.log(`[Socket.IO] After finalize - Status: ${session.status}`);
        await session.save();
        console.log(`[Socket.IO] After save - Status: ${session.status}`);

        // Verify in database
        const verifySession = await LiveSession.findOne({ sessionCode });
        console.log(
          `[Socket.IO] Database verification - Status: ${verifySession.status}`
        );

        console.log(
          `[Socket.IO] Session ${sessionCode} finalized with results saved and status updated to completed`
        );
      } catch (finalizeError) {
        console.error("[Socket.IO] Error finalizing session:", finalizeError);
        // Continue even if finalization fails
      }

      // Broadcast session end
      io.to(sessionCode).emit("session-ended", {
        leaderboard,
        totalParticipants: session.participantCount,
        totalQuestions: session.quizId.questions.length,
      });

      // Clean up memory
      activeSessions.delete(sessionCode);

      console.log(`[Socket.IO] Session ${sessionCode} ended`);

      callback({ success: true });
    } catch (error) {
      console.error("[Socket.IO] Error ending session:", error);
      callback({ success: false, error: error.message });
    }
  });

  // ========================================
  // 1v1 DUEL EVENTS
  // ========================================

  // EVENT: find-duel-match
  // Student searches for a 1v1 opponent with the same quiz
  socket.on("find-duel-match", async (data, callback) => {
    try {
      const { quizId, userId, username, avatar } = data;

      // Find existing waiting match for this quiz
      let match = await DuelMatch.findOne({
        quizId,
        status: "waiting",
        "player1.userId": { $ne: userId }, // Don't match with yourself
      }).populate("quizId");

      if (match) {
        // Join existing match as player 2
        match.player2 = {
          userId,
          socketId: socket.id,
          score: 0,
          correctAnswers: 0,
          totalTime: 0,
          answers: [],
          isReady: false,
          isActive: true,
        };
        match.status = "ready";
        await match.save();

        // Both players join the match room
        socket.join(match.matchId);
        const player1Socket = io.sockets.sockets.get(match.player1.socketId);
        if (player1Socket) {
          player1Socket.join(match.matchId);
        }

        console.log(
          `[Duel] Match found: ${match.matchId} - ${match.player1.userId} vs ${userId}`
        );

        // Notify both players
        io.to(match.matchId).emit("match-found", {
          matchId: match.matchId,
          quiz: {
            id: match.quizId._id,
            title: match.quizId.title,
            description: match.quizId.description,
            totalQuestions: match.quizId.questions.length,
          },
          opponent: {
            player1: {
              userId: match.player1.userId,
              username: match.player1.username || "Player 1",
              avatar: match.player1.avatar,
            },
            player2: {
              userId: match.player2.userId,
              username: username,
              avatar: avatar,
            },
          },
        });

        callback({ success: true, matchId: match.matchId, role: "player2" });
      } else {
        // Create new waiting match
        const matchId = await DuelMatch.generateMatchId();

        match = new DuelMatch({
          matchId,
          quizId,
          player1: {
            userId,
            socketId: socket.id,
            username,
            avatar,
            score: 0,
            correctAnswers: 0,
            totalTime: 0,
            answers: [],
            isReady: false,
            isActive: true,
          },
          status: "waiting",
        });

        await match.save();
        socket.join(matchId);

        console.log(`[Duel] Waiting for opponent: ${matchId} - ${userId}`);

        callback({ success: true, matchId, role: "player1", waiting: true });
      }
    } catch (error) {
      console.error("[Duel] Error finding match:", error);
      callback({ success: false, error: error.message });
    }
  });

  // EVENT: duel-ready
  // Player is ready to start
  socket.on("duel-ready", async (data, callback) => {
    try {
      const { matchId, userId } = data;

      const match = await DuelMatch.findOne({ matchId }).populate("quizId");
      if (!match) {
        return callback({ success: false, error: "Match not found" });
      }

      // Mark player as ready
      if (match.player1.userId.toString() === userId) {
        match.player1.isReady = true;
      } else if (match.player2.userId.toString() === userId) {
        match.player2.isReady = true;
      }

      await match.save();

      // Notify room
      io.to(matchId).emit("player-ready", { userId });

      // Start if both ready
      if (match.player1.isReady && match.player2.isReady) {
        match.status = "active";
        match.startedAt = new Date();
        match.currentQuestionIndex = 0;
        await match.save();

        // Ensure both players are in the room
        socket.join(matchId);
        const player1Socket = io.sockets.sockets.get(match.player1.socketId);
        const player2Socket = io.sockets.sockets.get(match.player2.socketId);

        if (player1Socket) player1Socket.join(matchId);
        if (player2Socket) player2Socket.join(matchId);

        console.log(
          `[Duel] Both players joined room ${matchId}. Starting duel...`
        );

        const currentQuestion = match.quizId.questions[0];

        io.to(matchId).emit("duel-started", {
          currentQuestion: {
            index: 0,
            question: currentQuestion.question,
            options: currentQuestion.options,
            timeLimit: match.timePerQuestion,
          },
        });

        console.log(`[Duel] Match started: ${matchId}`);
      }

      callback({ success: true });
    } catch (error) {
      console.error("[Duel] Error in ready:", error);
      callback({ success: false, error: error.message });
    }
  });

  // EVENT: duel-answer
  // Player submits answer
  socket.on("duel-answer", async (data, callback) => {
    try {
      const { matchId, userId, questionIndex, answer, timeSpent } = data;

      const match = await DuelMatch.findOne({ matchId }).populate("quizId");
      if (!match) {
        return callback({ success: false, error: "Match not found" });
      }

      const question = match.quizId.questions[questionIndex];
      const isCorrect = answer === question.correct_answer;
      const pointsEarned = isCorrect ? 100 : 0;

      // Record answer
      const answerRecord = {
        questionIndex,
        answer,
        isCorrect,
        timeSpent,
        timestamp: new Date(),
      };

      let player;
      if (match.player1.userId.toString() === userId) {
        player = match.player1;
      } else if (match.player2.userId.toString() === userId) {
        player = match.player2;
      }

      if (player) {
        player.answers.push(answerRecord);
        if (isCorrect) {
          player.correctAnswers += 1;
          player.score += pointsEarned;
        }
        player.totalTime += timeSpent;
      }

      await match.save();

      callback({
        success: true,
        isCorrect,
        correctAnswer: question.correct_answer,
        pointsEarned,
        explanation: question.explanation,
      });

      // Get room members for debugging
      const roomMembers = io.sockets.adapter.rooms.get(matchId);
      console.log(
        `[Duel] Room ${matchId} has ${roomMembers?.size || 0} members:`,
        roomMembers ? Array.from(roomMembers) : []
      );

      // Emit live score update to BOTH players
      io.to(matchId).emit("duel-score-update", {
        player1: {
          userId: match.player1.userId.toString(),
          score: match.player1.score,
          correctAnswers: match.player1.correctAnswers,
          answeredCount: match.player1.answers.length,
        },
        player2: {
          userId: match.player2.userId.toString(),
          score: match.player2.score,
          correctAnswers: match.player2.correctAnswers,
          answeredCount: match.player2.answers.length,
        },
      });

      console.log(
        `[Duel] Score update emitted to room ${matchId} - Player1: ${match.player1.score}, Player2: ${match.player2.score}`
      );

      // Check if THIS player has finished all questions
      const playerFinished =
        player.answers.length === match.quizId.questions.length;

      if (playerFinished) {
        // This player is done - send them a completion signal
        socket.emit("player-completed", {
          message: "Waiting for opponent to finish...",
          yourScore: player.score,
          yourCorrect: player.correctAnswers,
        });

        // Check if BOTH players are finished
        const bothFinished =
          match.player1.answers.length === match.quizId.questions.length &&
          match.player2.answers.length === match.quizId.questions.length;

        if (bothFinished) {
          // Both finished - end the match
          match.status = "completed";
          match.completedAt = new Date();
          match.winner = match.determineWinner();
          await match.save();

          io.to(matchId).emit("duel-ended", {
            winner: match.winner,
            finalScores: {
              player1: {
                userId: match.player1.userId,
                score: match.player1.score,
                correctAnswers: match.player1.correctAnswers,
                totalTime: match.player1.totalTime,
              },
              player2: {
                userId: match.player2.userId,
                score: match.player2.score,
                correctAnswers: match.player2.correctAnswers,
                totalTime: match.player2.totalTime,
              },
            },
          });

          console.log(
            `[Duel] Match ended: ${matchId} - Winner: ${match.winner || "Tie"}`
          );
        }
      } else {
        // Send next question to THIS player only
        const nextQuestionIndex = player.answers.length;
        const nextQuestion = match.quizId.questions[nextQuestionIndex];

        setTimeout(() => {
          socket.emit("next-question", {
            currentQuestion: {
              index: nextQuestionIndex,
              question: nextQuestion.question,
              options: nextQuestion.options,
              timeLimit: match.timePerQuestion,
            },
          });
        }, 1500);
      }
    } catch (error) {
      console.error("[Duel] Error submitting answer:", error);
      callback({ success: false, error: error.message });
    }
  });

  // EVENT: cancel-duel
  // Cancel waiting for match
  socket.on("cancel-duel", async (data, callback) => {
    try {
      const { matchId } = data;

      const match = await DuelMatch.findOne({ matchId });
      if (match && match.status === "waiting") {
        match.status = "cancelled";
        await match.save();

        console.log(`[Duel] Match cancelled: ${matchId}`);
      }

      // Only call callback if it's a function
      if (typeof callback === "function") {
        callback({ success: true });
      }
    } catch (error) {
      console.error("[Duel] Error cancelling:", error);
      // Only call callback if it's a function
      if (typeof callback === "function") {
        callback({ success: false, error: error.message });
      }
    }
  });

  // ========================================
  // EVENT: disconnect
  // Handle client disconnection
  // ========================================
  socket.on("disconnect", async (reason) => {
    console.log(
      `[Socket.IO] Client disconnected: ${socket.id}, reason: ${reason}`
    );

    try {
      // Handle duel matches
      const duelMatches = await DuelMatch.find({
        $or: [
          { "player1.socketId": socket.id },
          { "player2.socketId": socket.id },
        ],
        status: { $in: ["waiting", "ready", "active"] },
      });

      for (const match of duelMatches) {
        if (match.status === "waiting") {
          // Cancel waiting match
          match.status = "cancelled";
          await match.save();
        } else {
          // Player disconnected during active match - opponent wins
          let disconnectedPlayer, opponentId;

          if (match.player1.socketId === socket.id) {
            disconnectedPlayer = "player1";
            opponentId = match.player2.userId;
          } else {
            disconnectedPlayer = "player2";
            opponentId = match.player1.userId;
          }

          match.status = "completed";
          match.winner = opponentId;
          match.completedAt = new Date();
          await match.save();

          io.to(match.matchId).emit("opponent-disconnected", {
            winner: opponentId,
            reason: "Opponent disconnected",
          });

          console.log(
            `[Duel] Player disconnected from match ${match.matchId}, ${disconnectedPlayer} forfeited`
          );
        }
      }

      // Find all sessions where this socket is a participant or host
      const sessions = await LiveSession.find({
        $or: [
          { hostSocketId: socket.id },
          {
            "participants.socketId": socket.id,
            status: { $in: ["waiting", "active", "paused"] },
          },
        ],
      });

      for (const session of sessions) {
        if (session.hostSocketId === socket.id) {
          // Host disconnected - pause session ONLY if not already completed
          if (session.status !== "completed") {
            session.status = "paused";
            await session.save();

            io.to(session.sessionCode).emit("host-disconnected", {
              message: "Host disconnected. Session paused.",
            });

            console.log(
              `[Socket.IO] Host disconnected from session ${session.sessionCode} - status set to paused`
            );
          } else {
            console.log(
              `[Socket.IO] Host disconnected from session ${session.sessionCode} - already completed, not changing status`
            );
          }
        } else {
          // Participant disconnected
          const participant = session.participants.find(
            (p) => p.socketId === socket.id
          );
          if (participant) {
            participant.isActive = false;
            participant.leftAt = new Date();
            await session.save();

            io.to(session.sessionCode).emit("participant-left", {
              userId: participant.userId,
              username: participant.username,
              participantCount: session.participantCount,
            });

            console.log(
              `[Socket.IO] Participant ${participant.username} left session ${session.sessionCode}`
            );
          }
        }
      }
    } catch (error) {
      console.error("[Socket.IO] Error handling disconnect:", error);
    }
  });
});

// Suppress Mongoose index warnings in production
mongoose.set("strictQuery", false);
if (process.env.NODE_ENV === "production") {
  mongoose.set("autoIndex", false); // Don't auto-create indexes in production
}

// MongoDB connection
mongoose
  .connect(MONGO_URI, {
    autoIndex: true, // Build indexes
  })
  .then(async () => {
    console.log("MongoDB connected successfully");

    // Sync indexes to remove duplicates (only in development)
    if (process.env.NODE_ENV !== "production") {
      try {
        await User.syncIndexes();
        console.log("✓ User indexes synchronized");
      } catch (err) {
        console.log("Index sync warning (can be ignored):", err.message);
      }
    }
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// --- ROUTES ---
app.get("/test", (req, res) => {
  res.json({ message: "Backend is running!" });
});

// --- HELPER FUNCTION for robust JSON parsing ---
function extractJson(text) {
  // Find the start of the JSON array
  const jsonStart = text.indexOf("[");
  // Find the end of the JSON array
  const jsonEnd = text.lastIndexOf("]");

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error(
      "AI response format error. Could not find a valid JSON array."
    );
  }
  // Extract the JSON string
  const jsonString = text.substring(jsonStart, jsonEnd + 1);
  // Parse and return
  return JSON.parse(jsonString);
}

// ============================
// ADAPTIVE DIFFICULTY HELPERS
// ============================

// Calculate user's adaptive difficulty based on performance
async function calculateAdaptiveDifficulty(userId) {
  try {
    // Get user's last 10 quiz results
    const recentResults = await Result.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("quizId", "difficulty");

    if (recentResults.length === 0) {
      return {
        suggestedDifficulty: "Easy",
        reason: "No quiz history - starting with Easy difficulty",
        avgScore: 0,
        totalAttempts: 0,
        trend: "new_user",
      };
    }

    // Calculate average score percentage
    const scores = recentResults.map((r) => (r.score / r.totalQuestions) * 100);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Analyze recent trend (last 5 vs previous 5)
    let trend = "stable";
    if (recentResults.length >= 6) {
      const recentAvg = scores.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
      const previousAvg = scores.slice(5, 10).reduce((a, b) => a + b, 0) / 5;

      if (recentAvg > previousAvg + 10) trend = "improving";
      else if (recentAvg < previousAvg - 10) trend = "declining";
    }

    // Determine difficulty based on performance
    let suggestedDifficulty;
    let reason;

    if (avgScore >= 85 && trend === "improving") {
      suggestedDifficulty = "Hard";
      reason = `Excellent performance (${avgScore.toFixed(
        0
      )}%) and improving - ready for harder challenges!`;
    } else if (
      avgScore >= 75 &&
      (trend === "improving" || trend === "stable")
    ) {
      suggestedDifficulty = "Hard";
      reason = `Strong performance (${avgScore.toFixed(
        0
      )}%) - challenging yourself with Hard difficulty`;
    } else if (avgScore >= 60 && trend !== "declining") {
      suggestedDifficulty = "Medium";
      reason = `Good progress (${avgScore.toFixed(
        0
      )}%) - Medium difficulty is optimal for growth`;
    } else if (avgScore >= 50 || trend === "improving") {
      suggestedDifficulty = "Medium";
      reason = `Building confidence (${avgScore.toFixed(
        0
      )}%) - stick with Medium to improve`;
    } else {
      suggestedDifficulty = "Easy";
      reason = `Focus on fundamentals (${avgScore.toFixed(
        0
      )}%) - Easy difficulty helps build foundation`;
    }

    // Analyze weak areas by topic
    const topicPerformance = {};
    for (const result of recentResults) {
      const quiz = await Quiz.findById(result.quizId);
      if (quiz && quiz.title) {
        const topic = quiz.title.replace("AI Quiz: ", "").split(" ")[0];
        if (!topicPerformance[topic]) {
          topicPerformance[topic] = { total: 0, count: 0 };
        }
        topicPerformance[topic].total +=
          (result.score / result.totalQuestions) * 100;
        topicPerformance[topic].count += 1;
      }
    }

    const weakAreas = Object.entries(topicPerformance)
      .map(([topic, data]) => ({ topic, avg: data.total / data.count }))
      .filter((t) => t.avg < 60)
      .map((t) => t.topic);

    return {
      suggestedDifficulty,
      reason,
      avgScore: parseFloat(avgScore.toFixed(1)),
      totalAttempts: recentResults.length,
      trend,
      weakAreas: weakAreas.length > 0 ? weakAreas : null,
      recentScores: scores.slice(0, 5).map((s) => parseFloat(s.toFixed(1))),
    };
  } catch (error) {
    console.error("Error calculating adaptive difficulty:", error);
    return {
      suggestedDifficulty: "Medium",
      reason: "Error analyzing performance - defaulting to Medium",
      avgScore: 0,
      totalAttempts: 0,
      trend: "unknown",
    };
  }
}

// GET adaptive difficulty recommendation
app.get("/api/adaptive-difficulty", auth, async (req, res) => {
  try {
    const adaptiveData = await calculateAdaptiveDifficulty(req.user.id);
    res.json(adaptiveData);
  } catch (error) {
    console.error("Error getting adaptive difficulty:", error);
    res
      .status(500)
      .json({ message: "Failed to calculate adaptive difficulty" });
  }
});

// ** UPDATED ** GENERATE QUIZ FROM TOPIC (now with adaptive difficulty support)
app.post(
  "/api/generate-quiz-topic",
  auth,
  quizGenerationLimiter,
  async (req, res) => {
    try {
      const { topic, numQuestions, difficulty, useAdaptive } = req.body;

      // If adaptive mode is enabled, calculate optimal difficulty
      let actualDifficulty = difficulty;
      let adaptiveInfo = null;

      if (useAdaptive) {
        const adaptiveData = await calculateAdaptiveDifficulty(req.user.id);
        actualDifficulty = adaptiveData.suggestedDifficulty;
        adaptiveInfo = {
          originalDifficulty: difficulty,
          adaptedDifficulty: actualDifficulty,
          reason: adaptiveData.reason,
          avgScore: adaptiveData.avgScore,
          trend: adaptiveData.trend,
        };
        console.log(
          `🎯 Adaptive AI: Changed difficulty from ${difficulty} to ${actualDifficulty} for user ${req.user.id}`
        );
      }

      // Enhanced prompt with user context for adaptive mode
      let prompt = `
      You are an expert quiz maker.
      Create a quiz based on the following topic: "${topic}".
      The quiz should have ${numQuestions} questions.
      The difficulty level should be ${actualDifficulty}.
    `;

      // Add adaptive context to AI prompt
      if (useAdaptive && adaptiveInfo) {
        const adaptiveData = await calculateAdaptiveDifficulty(req.user.id);
        if (adaptiveData.weakAreas && adaptiveData.weakAreas.length > 0) {
          prompt += `\n      
      ADAPTIVE MODE: This user has shown weakness in: ${adaptiveData.weakAreas.join(
        ", "
      )}.
      Include questions that reinforce these areas while maintaining ${actualDifficulty} difficulty.
      User's average score: ${
        adaptiveData.avgScore
      }% - tailor complexity accordingly.
      `;
        }
      }

      prompt += `
      IMPORTANT: Your response MUST be a valid JSON object. Do not include any text, explanation, or markdown formatting before or after the JSON object.
      The JSON object should be an array of question objects, where each object has the following structure:
      {
        "question": "Your question here",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_answer": "The correct option text"
      }
    `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const questions = extractJson(text);

      // Save the new quiz to the database
      const newQuiz = new Quiz({
        title: `AI Quiz: ${topic}${useAdaptive ? " (Adaptive)" : ""}`,
        questions: questions,
        difficulty: actualDifficulty,
        createdBy: req.user.id,
      });
      const savedQuiz = await newQuiz.save();

      console.log(
        `AI-Topic quiz "${savedQuiz.title}" saved for user ${req.user.id}`
      );

      res.status(201).json({
        quiz: savedQuiz,
        adaptiveInfo: useAdaptive ? adaptiveInfo : null,
      });
    } catch (error) {
      console.error("Error in AI Topic Generation:", error);
      res.status(500).json({ message: "Failed to generate quiz from topic." });
    }
  }
);
// --- QUIZ ROUTES ---

// ** NEW ** GET ALL QUIZZES
app.get("/api/quizzes", async (req, res) => {
  try {
    // Find all quizzes and populate the 'createdBy' field with the user's name
    const quizzes = await Quiz.find().populate("createdBy", "name");
    res.json(quizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).send("Server Error");
  }
});

// MY QUIZZES - Available for all authenticated users
app.get("/api/quizzes/my-quizzes", auth, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user.id });

    const quizzesWithStats = await Promise.all(
      quizzes.map(async (quiz) => {
        const timesTaken = await Result.countDocuments({ quiz: quiz._id });
        return { ...quiz.toObject(), timesTaken };
      })
    );

    // Sort based on query parameter
    const sortBy = req.query.sortBy || "createdAt"; // Default to newest
    quizzesWithStats.sort((a, b) => {
      if (sortBy === "timesTaken") {
        return b.timesTaken - a.timesTaken;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const quizIds = quizzes.map((q) => q._id);
    const totalTakes = await Result.countDocuments({ quiz: { $in: quizIds } });
    const uniqueStudents = await Result.distinct("user", {
      quiz: { $in: quizIds },
    });

    res.json({
      quizzes: quizzesWithStats,
      stats: {
        totalQuizzes: quizzes.length,
        totalTakes,
        uniqueStudents: uniqueStudents.length,
      },
    });
  } catch (error) {
    console.error("Error fetching teacher's quizzes:", error);
    res.status(500).send("Server Error");
  }
});

// *** NEW *** GET A SINGLE QUIZ BY ID
app.get("/api/quizzes/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate(
      "createdBy",
      "name"
    );
    if (!quiz) {
      return res.status(404).json({ msg: "Quiz not found" });
    }
    res.json(quiz);
  } catch (error) {
    console.error("Error fetching single quiz:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Quiz not found" });
    }
    res.status(500).send("Server Error");
  }
});

// ** UPDATED ** SAVE MANUAL QUIZ (now protected and saves to DB)
app.post("/api/save-manual-quiz", auth, async (req, res) => {
  // 'auth' middleware is added
  try {
    const { title, questions } = req.body;

    const newQuiz = new Quiz({
      title,
      questions,
      createdBy: req.user.id, // Get user ID from the middleware
    });

    const savedQuiz = await newQuiz.save();
    console.log(
      `Manual quiz "${savedQuiz.title}" saved by user ${req.user.id}`
    );
    res.status(201).json(savedQuiz);
  } catch (error) {
    console.error("Error saving manual quiz:", error);
    res.status(500).json({ message: "An error occurred on the server." });
  }
});

// ** UPDATED ** GENERATE QUIZ FROM FILE (now protected and saves to DB)
app.post(
  "/api/generate-quiz-file",
  auth,
  quizGenerationLimiter,
  upload.single("quizFile"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const filePath = req.file.path;
    // Get numQuestions and useAdaptive from the form data body
    const { numQuestions, useAdaptive, difficulty } = req.body;
    console.log(`Processing file: ${filePath}`);

    try {
      // 1. Extract text from the file
      let extractedText = "";
      if (req.file.mimetype === "application/pdf") {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        extractedText = data.text;
      } else {
        // Assume text file for other types
        extractedText = fs.readFileSync(filePath, "utf8");
      }

      if (!extractedText.trim()) {
        throw new Error("Could not extract text from the file.");
      }

      console.log(`Extracted ${extractedText.length} characters of text.`);

      // 2. Determine difficulty (adaptive or manual)
      let actualDifficulty = difficulty || "Medium";
      let adaptiveInfo = null;

      if (useAdaptive === "true" || useAdaptive === true) {
        const adaptiveData = await calculateAdaptiveDifficulty(req.user.id);
        actualDifficulty = adaptiveData.suggestedDifficulty;
        adaptiveInfo = {
          originalDifficulty: difficulty || "Medium",
          adaptedDifficulty: actualDifficulty,
          reason: adaptiveData.reason,
          avgScore: adaptiveData.avgScore,
          trend: adaptiveData.trend,
          weakAreas: adaptiveData.weakAreas,
        };
        console.log(
          `Adaptive mode: ${difficulty || "Medium"} → ${actualDifficulty}`
        );
      }

      // 3. Generate quiz from the extracted text using AI
      let prompt = `
            You are an expert quiz maker.
            Create a quiz with ${
              numQuestions || 5
            } questions at ${actualDifficulty} difficulty level based on the following text content:
            ---
            ${extractedText.substring(0, 8000)} 
            ---`;

      // Add adaptive context if available
      if (adaptiveInfo) {
        prompt += `\n\nIMPORTANT CONTEXT: This quiz is being generated for a user with:
        - Average performance: ${adaptiveInfo.avgScore?.toFixed(1)}%
        - Performance trend: ${adaptiveInfo.trend}
        ${
          adaptiveInfo.weakAreas?.length > 0
            ? `- Weak areas: ${adaptiveInfo.weakAreas.join(", ")}`
            : ""
        }
        
        Please adjust the difficulty and focus areas accordingly.`;
      }

      prompt += `\n\nIMPORTANT: Your response MUST be a valid JSON object. Do not include any text, explanation, or markdown formatting before or after the JSON object.
            The JSON object should be an array of question objects, each with "question", "options", and "correct_answer" keys.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const questions = extractJson(text); // Use the helper function

      // 4. Save the new quiz to the database
      const quizTitle = `AI Quiz: ${req.file.originalname}${
        adaptiveInfo ? " (Adaptive)" : ""
      }`;
      const newQuiz = new Quiz({
        title: quizTitle,
        questions: questions,
        difficulty: actualDifficulty,
        createdBy: req.user.id, // From auth middleware
      });
      const savedQuiz = await newQuiz.save();

      console.log(
        `AI-File quiz "${savedQuiz.title}" saved for user ${req.user.id}`
      );

      // 5. Send the saved quiz object back to the client with adaptive info
      res.status(201).json({
        quiz: savedQuiz,
        adaptiveInfo: adaptiveInfo,
      });
    } catch (error) {
      console.error("Error processing file:", error);
      res
        .status(500)
        .json({ message: "An error occurred while processing the file." });
    } finally {
      // 6. Clean up: delete the uploaded file
      fs.unlinkSync(filePath);
      console.log(`Deleted temporary file: ${filePath}`);
    }
  }
);

app.post("/api/generate-pdf-questions", auth, async (req, res) => {
  try {
    const { topic, numQuestions, difficulty, questionTypes } = req.body;

    // Build dynamic prompt based on question types
    let questionTypeInstructions = "";
    const typeMapping = {
      mcq: "Multiple Choice Questions with 4 options",
      truefalse: "True/False Questions",
      descriptive: "Descriptive/Essay Questions",
    };

    const requestedTypes = questionTypes
      .map((type) => typeMapping[type] || type)
      .join(", ");

    const prompt = `
      You are an expert quiz maker and educator.
      Create ${numQuestions} quiz questions about "${topic}".
      Difficulty level: ${difficulty}
      Question types to include: ${requestedTypes}
      
      For each question, provide:
      1. Question text that is clear and educational
      2. Question type (mcq, truefalse, or descriptive)
      3. For MCQ: exactly 4 options with one correct answer
      4. For True/False: the correct answer (True or False)
      5. For Descriptive: key points for the answer
      6. A brief explanation or reasoning
      7. Appropriate marks (1-3 for MCQ/True-False, 3-10 for descriptive)
      
      IMPORTANT: Your response MUST be a valid JSON array. Do not include any text before or after the JSON.
      
      Example format:
      [
        {
          "type": "mcq",
          "question": "What is photosynthesis?",
          "options": ["Process of respiration", "Process of making food using sunlight", "Process of digestion", "Process of excretion"],
          "correctAnswer": "Process of making food using sunlight",
          "explanation": "Photosynthesis is the process by which plants make their own food using sunlight, water, and carbon dioxide.",
          "marks": 2
        },
        {
          "type": "truefalse",
          "question": "Plants release oxygen during photosynthesis.",
          "correctAnswer": "True",
          "explanation": "During photosynthesis, plants release oxygen as a byproduct.",
          "marks": 1
        },
        {
          "type": "descriptive",
          "question": "Explain the process of photosynthesis in detail.",
          "explanation": "Key points: sunlight capture, chlorophyll role, water and CO2 conversion, glucose production, oxygen release",
          "marks": 5
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("AI Response for PDF questions:", text);

    // Try to extract JSON from the response
    let questions;
    try {
      questions = extractJson(text);

      // Validate and format questions
      questions = questions.map((q, index) => ({
        type: q.type || "mcq",
        question: q.question || `Generated question ${index + 1}`,
        options: q.options || [],
        correctAnswer: q.correctAnswer || q.correct_answer || "",
        explanation: q.explanation || "",
        marks: q.marks || (q.type === "descriptive" ? 5 : 2),
      }));
    } catch (parseError) {
      console.error(
        "JSON parsing failed, attempting text parsing:",
        parseError
      );

      // Fallback: Create basic questions from text
      questions = [];
      const lines = text.split("\n").filter((line) => line.trim());

      for (let i = 0; i < Math.min(numQuestions, lines.length); i++) {
        const line = lines[i].trim();
        if (line) {
          questions.push({
            type: questionTypes[0] || "mcq",
            question: line.replace(/^\d+\.?\s*/, ""), // Remove numbering
            options:
              questionTypes[0] === "mcq"
                ? ["Option A", "Option B", "Option C", "Option D"]
                : [],
            correct_answer:
              questionTypes[0] === "truefalse"
                ? "True"
                : questionTypes[0] === "mcq"
                ? "Option A"
                : "",
            explanation: "AI generated question",
            marks: questionTypes[0] === "descriptive" ? 5 : 2,
          });
        }
      }
    }

    if (!questions || questions.length === 0) {
      throw new Error("No valid questions generated");
    }

    console.log(
      `Generated ${questions.length} PDF questions for topic: ${topic}`
    );
    res.json({ questions });
  } catch (error) {
    console.error("Error generating PDF questions:", error);
    res.status(500).json({
      message: "Failed to generate questions for PDF",
      error: error.message,
    });
  }
});

// *** NEW *** SUBMIT QUIZ RESULT
app.post("/api/quizzes/submit", auth, async (req, res) => {
  try {
    const { quizId, score, totalQuestions } = req.body;
    const userId = req.user.id;

    const newResult = new Result({
      user: userId,
      quiz: quizId,
      score,
      totalQuestions,
    });

    await newResult.save();
    console.log(`Result saved for user ${userId} on quiz ${quizId}`);
    res.status(201).json({ message: "Result saved successfully!" });
  } catch (error) {
    console.error("Error saving result:", error);
    res.status(500).send("Server Error");
  }
});

// *** NEW *** GET RESULTS FOR THE LOGGED-IN USER
app.get("/api/results/my-results", auth, async (req, res) => {
  try {
    const results = await Result.find({ user: req.user.id })
      .populate("quiz", "title") // Populate the 'quiz' field, only getting the 'title'
      .sort({ createdAt: -1 }); // Show the most recent results first

    res.json(results);
  } catch (error) {
    console.error("Error fetching user results:", error);
    res.status(500).send("Server Error");
  }
});

// *** NEW AUTHENTICATION ROUTE ***
app.post(
  "/api/auth/register",
  authLimiter, // Apply strict rate limiting
  [
    // Input validation
    body("name")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters")
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage("Name can only contain letters and spaces"),
    body("email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
      .withMessage("Password must contain at least one letter and one number"),
    body("role")
      .optional()
      .isIn(["User", "Student", "Teacher"])
      .withMessage("Invalid role"),
  ],
  async (req, res) => {
    try {
      // Log the incoming request for debugging
      console.log("📝 Registration request received:", {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        hasPassword: !!req.body.password,
      });

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("❌ Validation errors:", errors.array());
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { name, email, password, role } = req.body;

      // Security Check: Prevent users from assigning themselves Admin or Moderator roles.
      if (role === "Admin" || role === "Moderator") {
        return res
          .status(403)
          .json({ message: "Cannot register with this role." });
      }

      // 1. Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User with this email already exists." });
      }

      // 2. Hash the password
      const salt = await bcrypt.genSalt(10); // Generate a salt
      const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the salt

      // 3. Create a new user instance
      const newUser = new User({
        name,
        email,
        password: hashedPassword, // Store the hashed password
        role,
      });

      // 4. Save the user to the database
      const savedUser = await newUser.save();

      console.log("New user registered:", savedUser.email);

      // Send a success response (don't send the password back)
      res.status(201).json({
        message: "User registered successfully!",
        user: {
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          role: savedUser.role,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error during registration." });
    }
  }
);

// *** NEW LOGIN ROUTE ***
app.post(
  "/api/auth/login",
  authLimiter, // Apply strict rate limiting
  [
    // Input validation
    body("email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      // 1. Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid credentials. User not found." });
      }

      // 2. Compare the submitted password with the hashed password in the database
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Invalid credentials. Password incorrect." });
      }

      // 3. If passwords match, create a JWT payload
      const payload = {
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
      };

      // 4. Sign the token with the secret key
      jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: "1h" }, // Token expires in 1 hour
        (err, token) => {
          if (err) throw err;
          // 5. Send the token back to the client
          res.json({ token });
        }
      );
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login." });
    }
  }
);

// *** GOOGLE OAUTH LOGIN ROUTE ***
app.post("/api/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res
        .status(400)
        .json({ message: "No email found in Google account." });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (user) {
      // User exists, update their Google ID if not already set
      if (!user.googleId) {
        user.googleId = googleId;
        user.picture = picture;
        await user.save();
      }
    } else {
      // Create new user with Google data
      isNewUser = true;
      user = new User({
        name,
        email,
        googleId,
        picture,
        role: "Student", // Default role for Google OAuth users
        // No password needed for Google OAuth users
      });
      await user.save();
      console.log("New Google OAuth user registered:", user.email);
    }

    // Update user status and activity
    user.status = "online";
    user.lastActivity = new Date();
    user.lastSeen = new Date();
    await user.save();

    // Create JWT token
    const jwtPayload = {
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        picture: user.picture,
      },
    };

    jwt.sign(
      jwtPayload,
      JWT_SECRET,
      { expiresIn: "7d" }, // Longer expiry for OAuth users
      (err, token) => {
        if (err) {
          console.error("JWT signing error:", err);
          return res
            .status(500)
            .json({ message: "Error creating authentication token." });
        }

        res.json({
          token,
          isNewUser,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            picture: user.picture,
          },
        });
      }
    );
  } catch (error) {
    console.error("Google OAuth error:", error);
    res.status(500).json({ message: "Google authentication failed." });
  }
});

// *** GOOGLE OAUTH ROLE UPDATE ROUTE ***
app.post("/api/auth/google/update-role", auth, async (req, res) => {
  try {
    const { role } = req.body;

    // Validate role
    if (!["Student", "Teacher"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Invalid role. Must be Student or Teacher." });
    }

    // Update user role
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { role: role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Create new JWT token with updated role
    const jwtPayload = {
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        picture: user.picture,
      },
    };

    jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: "7d" }, (err, token) => {
      if (err) {
        console.error("JWT signing error:", err);
        return res
          .status(500)
          .json({ message: "Error creating authentication token." });
      }

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          picture: user.picture,
        },
      });
    });
  } catch (error) {
    console.error("Role update error:", error);
    res.status(500).json({ message: "Failed to update user role." });
  }
});

// *** NEW *** DELETE A QUIZ
app.delete("/api/quizzes/:id", auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ msg: "Quiz not found" });
    }
    // Ensure the user deleting the quiz is the one who created it
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await quiz.deleteOne(); // <-- THIS IS THE FIX (changed from .remove())

    // Also delete all results associated with this quiz
    await Result.deleteMany({ quiz: req.params.id });

    res.json({ msg: "Quiz and associated results removed" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).send("Server Error");
  }
});

// *** NEW *** UPDATE A QUIZ
app.put("/api/quizzes/:id", auth, async (req, res) => {
  try {
    const { title, questions } = req.body;
    let quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ msg: "Quiz not found" });
    }
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    // Update the quiz fields
    quiz.title = title;
    quiz.questions = questions;

    const updatedQuiz = await quiz.save();
    res.json(updatedQuiz);
  } catch (error) {
    console.error("Error updating quiz:", error);
    res.status(500).send("Server Error");
  }
});

// *** NEW *** GET LEADERBOARD FOR A QUIZ
app.get("/api/quizzes/:quizId/leaderboard", async (req, res) => {
  try {
    const { quizId } = req.params;

    const leaderboard = await Result.aggregate([
      // 1. Match all results for the specific quiz
      { $match: { quiz: new mongoose.Types.ObjectId(quizId) } },
      // 2. Sort by score (highest first) and then by time (quickest first)
      { $sort: { score: -1, createdAt: 1 } },
      // 3. Group by user, taking only their first (and best) score
      {
        $group: {
          _id: "$user",
          highestScore: { $first: "$score" },
          totalQuestions: { $first: "$totalQuestions" },
          date: { $first: "$createdAt" },
        },
      },
      // 4. Sort the unique user scores again
      { $sort: { highestScore: -1, date: 1 } },
      // 5. Limit to the top 10 players
      { $limit: 10 },
      // 6. Join with the Users collection to get the user's name
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      // 7. Reshape the output
      {
        $project: {
          _id: 0,
          score: "$highestScore",
          totalQuestions: "$totalQuestions",
          userName: { $arrayElemAt: ["$userDetails.name", 0] },
        },
      },
    ]);

    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).send("Server Error");
  }
});

// *** ENHANCED QUIZ CREATION AND GAMIFICATION ***

// Create Enhanced Quiz with Multiple Question Types
app.post("/api/quizzes/enhanced", auth, async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res
        .status(403)
        .json({ message: "Access denied. Only teachers can create quizzes." });
    }

    const quizData = req.body;

    // Validate quiz data
    if (
      !quizData.title ||
      !quizData.questions ||
      quizData.questions.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Quiz title and questions are required." });
    }

    // Calculate total points
    const totalPoints = quizData.questions.reduce(
      (sum, q) => sum + (q.points || 1),
      0
    );

    const newQuiz = new Quiz({
      title: quizData.title,
      description: quizData.description,
      questions: quizData.questions,
      createdBy: req.user.id,
      difficulty: quizData.difficulty || "Medium",
      category: quizData.category,
      tags: quizData.tags || [],
      isPublic: quizData.isPublic !== false,
      timeLimit: quizData.timeLimit || 30,
      passingScore: quizData.passingScore || 60,
      totalPoints: totalPoints,
      gameSettings: quizData.gameSettings || {
        enableHints: false,
        enableTimeBonuses: true,
        enableStreakBonuses: true,
        showLeaderboard: true,
      },
    });

    const savedQuiz = await newQuiz.save();
    console.log(
      `Enhanced quiz "${savedQuiz.title}" created by user ${req.user.id}`
    );

    res
      .status(201)
      .json({ quiz: savedQuiz, message: "Quiz created successfully!" });
  } catch (error) {
    console.error("Error creating enhanced quiz:", error);
    res
      .status(500)
      .json({ message: "Failed to create quiz. Please try again." });
  }
});

// Submit Enhanced Quiz Result with Gamification
app.post("/api/quizzes/:id/submit", auth, async (req, res) => {
  try {
    const { id: quizId } = req.params;
    const resultData = req.body;
    const userId = req.user.id;

    // Find the quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    // Create detailed result
    const newResult = new Result({
      user: userId,
      quiz: quizId,
      score: resultData.score,
      totalQuestions: resultData.totalQuestions,
      pointsEarned: resultData.pointsEarned || 0,
      bonusPoints: resultData.bonusPoints || 0,
      totalTimeTaken: resultData.totalTimeTaken || 0,
      averageTimePerQuestion: resultData.totalTimeTaken
        ? Math.round(resultData.totalTimeTaken / resultData.totalQuestions)
        : 0,
      percentage: resultData.percentage,
      passed: resultData.passed,
      rank: getRankFromPercentage(resultData.percentage),
      questionResults: resultData.questionResults || [],
      streakAtCompletion: resultData.streakAtCompletion || 0,
      experienceGained: resultData.experienceGained || 0,
    });

    await newResult.save();

    // Update user stats
    await updateUserStats(userId, resultData);

    // Check for new achievements
    const unlockedAchievements = await checkUserAchievements(
      userId,
      resultData
    );

    if (unlockedAchievements.length > 0) {
      newResult.achievementsUnlocked = unlockedAchievements.map((a) => a._id);
      await newResult.save();
    }

    // Update quiz statistics
    await updateQuizStats(quizId, resultData);

    res.json({
      result: newResult,
      achievementsUnlocked: unlockedAchievements,
      message: "Quiz submitted successfully!",
    });
  } catch (error) {
    console.error("Error submitting quiz result:", error);
    res.status(500).json({ message: "Failed to submit quiz result." });
  }
});

// Generate AI Quiz with Multiple Question Types
app.post("/api/quizzes/generate-enhanced", auth, async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res.status(403).json({
        message: "Access denied. Only teachers can generate quizzes.",
      });
    }

    const {
      topic,
      numQuestions = 5,
      difficulty = "Medium",
      questionTypes = ["multiple-choice"],
    } = req.body;

    if (!topic.trim()) {
      return res.status(400).json({ message: "Topic is required." });
    }

    const questionTypePrompts = {
      "multiple-choice":
        "Create multiple choice questions with 4 options each.",
      "true-false": "Create true/false questions.",
      descriptive:
        "Create descriptive/essay questions that require detailed answers.",
      "fill-in-blank": "Create fill-in-the-blank questions.",
    };

    const typeInstructions = questionTypes
      .map((type) => questionTypePrompts[type])
      .join(" ");

    const prompt = `
      You are an expert quiz maker. Create a quiz about "${topic}" with ${numQuestions} questions.
      Difficulty level: ${difficulty}
      
      ${typeInstructions}
      
      IMPORTANT: Your response MUST be a valid JSON array. Each question object should have:
      {
        "question": "The question text",
        "type": "multiple-choice|true-false|descriptive|fill-in-blank",
        "options": ["Option A", "Option B", "Option C", "Option D"] (only for multiple-choice),
        "correct_answer": "The correct answer",
        "explanation": "Brief explanation of the answer",
        "points": 1,
        "timeLimit": 30,
        "difficulty": "${difficulty}"
      }
      
      Mix different question types if multiple types are requested. Ensure variety and educational value.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const questions = extractJson(text);

    if (!questions || questions.length === 0) {
      throw new Error("Failed to generate questions");
    }

    // Calculate total points
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);

    const newQuiz = new Quiz({
      title: `AI Enhanced Quiz: ${topic}`,
      description: `Auto-generated quiz about ${topic} with mixed question types`,
      questions: questions,
      difficulty: difficulty,
      category: "AI Generated",
      totalPoints: totalPoints,
      createdBy: req.user.id,
      gameSettings: {
        enableHints: false,
        enableTimeBonuses: true,
        enableStreakBonuses: true,
        showLeaderboard: true,
      },
    });

    const savedQuiz = await newQuiz.save();

    console.log(
      `AI Enhanced quiz "${savedQuiz.title}" generated for user ${req.user.id}`
    );
    res.status(201).json({ quiz: savedQuiz });
  } catch (error) {
    console.error("Error generating enhanced quiz:", error);
    res
      .status(500)
      .json({ message: "Failed to generate enhanced quiz. Please try again." });
  }
});

// Get User Stats and Achievements
app.get("/api/users/stats", auth, async (req, res) => {
  try {
    let userStats = await UserStats.findOne({ user: req.user.id }).populate(
      "achievements"
    );

    if (!userStats) {
      // Create initial stats for new user
      userStats = new UserStats({
        user: req.user.id,
        totalQuizzesTaken: 0,
        totalQuizzesCreated: 0,
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        level: 1,
        experience: 0,
      });
      await userStats.save();
    }

    // Get recent achievements
    const recentAchievements = await UserAchievement.find({ user: req.user.id })
      .populate("achievement")
      .sort({ unlockedAt: -1 })
      .limit(5);

    res.json({
      stats: userStats,
      recentAchievements: recentAchievements,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Failed to fetch user statistics." });
  }
});

// Helper Functions
function getRankFromPercentage(percentage) {
  if (percentage >= 95) return "A+";
  if (percentage >= 90) return "A";
  if (percentage >= 85) return "A-";
  if (percentage >= 80) return "B+";
  if (percentage >= 75) return "B";
  if (percentage >= 70) return "B-";
  if (percentage >= 65) return "C+";
  if (percentage >= 60) return "C";
  if (percentage >= 55) return "C-";
  if (percentage >= 50) return "D+";
  if (percentage >= 45) return "D";
  return "F";
}

async function updateUserStats(userId, resultData) {
  try {
    let userStats = await UserStats.findOne({ user: userId });

    if (!userStats) {
      userStats = new UserStats({ user: userId });
    }

    // Update stats
    userStats.totalQuizzesTaken += 1;
    userStats.totalPoints +=
      (resultData.pointsEarned || 0) + (resultData.bonusPoints || 0);
    userStats.totalTimeSpent += Math.round(
      (resultData.totalTimeTaken || 0) / 60
    ); // Convert to minutes

    // Update average score
    const totalScore =
      userStats.averageScore * (userStats.totalQuizzesTaken - 1) +
      resultData.percentage;
    userStats.averageScore = Math.round(
      totalScore / userStats.totalQuizzesTaken
    );

    // Update streak
    if (resultData.passed) {
      userStats.currentStreak += 1;
      if (userStats.currentStreak > userStats.longestStreak) {
        userStats.longestStreak = userStats.currentStreak;
      }
    } else {
      userStats.currentStreak = 0;
    }

    // Update experience and level
    userStats.experience += resultData.experienceGained || 0;
    userStats.level = Math.floor(userStats.experience / 100) + 1; // Level up every 100 XP

    userStats.lastQuizDate = new Date();

    await userStats.save();
    return userStats;
  } catch (error) {
    console.error("Error updating user stats:", error);
  }
}

async function checkUserAchievements(userId, resultData) {
  try {
    const unlockedAchievements = [];
    const userStats = await UserStats.findOne({ user: userId });

    if (!userStats) return unlockedAchievements;

    // Check for various achievement criteria
    const achievementChecks = [
      {
        criteria: userStats.totalQuizzesTaken >= 1,
        name: "First Quiz",
        type: "quiz_completion",
      },
      {
        criteria: userStats.totalQuizzesTaken >= 10,
        name: "Quiz Enthusiast",
        type: "quiz_completion",
      },
      {
        criteria: userStats.totalQuizzesTaken >= 50,
        name: "Quiz Master",
        type: "quiz_completion",
      },
      {
        criteria: userStats.currentStreak >= 5,
        name: "On Fire!",
        type: "streak",
      },
      {
        criteria: userStats.currentStreak >= 10,
        name: "Unstoppable",
        type: "streak",
      },
      {
        criteria: resultData.percentage >= 100,
        name: "Perfect Score",
        type: "score_achievement",
      },
      {
        criteria: resultData.percentage >= 90,
        name: "Excellence",
        type: "score_achievement",
      },
      {
        criteria: userStats.totalPoints >= 1000,
        name: "Point Collector",
        type: "special",
      },
      { criteria: userStats.level >= 5, name: "Rising Star", type: "special" },
      { criteria: userStats.level >= 10, name: "Champion", type: "special" },
    ];

    for (const check of achievementChecks) {
      if (check.criteria) {
        // Check if user already has this achievement
        const existingAchievement = await UserAchievement.findOne({
          user: userId,
          "achievement.name": check.name,
        });

        if (!existingAchievement) {
          // Create new achievement
          let achievement = await Achievement.findOne({ name: check.name });

          if (!achievement) {
            achievement = new Achievement({
              name: check.name,
              description: `Awarded for ${check.name.toLowerCase()}`,
              icon: getAchievementIcon(check.type),
              type: check.type,
              points: getAchievementPoints(check.type),
            });
            await achievement.save();
          }

          const userAchievement = new UserAchievement({
            user: userId,
            achievement: achievement._id,
            isCompleted: true,
          });

          await userAchievement.save();
          unlockedAchievements.push(achievement);
        }
      }
    }

    return unlockedAchievements;
  } catch (error) {
    console.error("Error checking achievements:", error);
    return [];
  }
}

function getAchievementIcon(type) {
  const icons = {
    quiz_completion: "📚",
    score_achievement: "🏆",
    streak: "🔥",
    speed: "⚡",
    special: "⭐",
  };
  return icons[type] || "🎉";
}

function getAchievementPoints(type) {
  const points = {
    quiz_completion: 10,
    score_achievement: 20,
    streak: 15,
    speed: 25,
    special: 50,
  };
  return points[type] || 10;
}

async function updateQuizStats(quizId, resultData) {
  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return;

    quiz.attempts = (quiz.attempts || 0) + 1;

    // Update average score
    const totalScore =
      quiz.averageScore * (quiz.attempts - 1) + resultData.percentage;
    quiz.averageScore = Math.round(totalScore / quiz.attempts);

    await quiz.save();
  } catch (error) {
    console.error("Error updating quiz stats:", error);
  }
}

// Generate PDF for Quiz
app.post("/api/quizzes/generate-pdf", auth, async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res
        .status(403)
        .json({ message: "Access denied. Only teachers can generate PDFs." });
    }

    const { quizData, questions, format = "teacher" } = req.body;

    if (!quizData || !questions) {
      return res
        .status(400)
        .json({ message: "Quiz data and questions are required." });
    }

    const pdfGenerator = new QuizPDFGenerator();
    const fullQuizData = { ...quizData, questions };

    let htmlContent;

    switch (format) {
      case "student":
        htmlContent = pdfGenerator.generateStudentCopy(fullQuizData);
        break;
      case "answer-key":
        htmlContent = pdfGenerator.generateAnswerKey(fullQuizData);
        break;
      case "teacher":
      default:
        htmlContent = pdfGenerator.generateTeacherCopy(fullQuizData);
        break;
    }

    // Send HTML content that can be converted to PDF on frontend
    res.json({
      html: htmlContent,
      filename: `${quizData.title || "quiz"}_${format}.pdf`,
      message:
        "PDF HTML generated successfully. Use browser print or PDF library to convert.",
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res
      .status(500)
      .json({ message: "Failed to generate PDF. Please try again." });
  }
});

// Generate PDF for Existing Quiz
app.get("/api/quizzes/:id/pdf/:format", auth, async (req, res) => {
  try {
    if (req.user.role !== "Teacher") {
      return res
        .status(403)
        .json({ message: "Access denied. Only teachers can generate PDFs." });
    }

    const { id: quizId, format = "teacher" } = req.params;

    const quiz = await Quiz.findById(quizId).populate("createdBy", "name");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    // Check if user owns the quiz or is admin
    if (
      quiz.createdBy._id.toString() !== req.user.id &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        message:
          "Access denied. You can only generate PDFs for your own quizzes.",
      });
    }

    const pdfGenerator = new QuizPDFGenerator();

    let htmlContent;

    switch (format) {
      case "student":
        htmlContent = pdfGenerator.generateStudentCopy(quiz);
        break;
      case "answer-key":
        htmlContent = pdfGenerator.generateAnswerKey(quiz);
        break;
      case "teacher":
      default:
        htmlContent = pdfGenerator.generateTeacherCopy(quiz);
        break;
    }

    res.json({
      html: htmlContent,
      filename: `${quiz.title}_${format}.pdf`,
      quiz: {
        title: quiz.title,
        createdBy: quiz.createdBy.name,
        createdAt: quiz.createdAt,
      },
      message: "PDF HTML generated successfully.",
    });
  } catch (error) {
    console.error("Error generating quiz PDF:", error);
    res
      .status(500)
      .json({ message: "Failed to generate PDF. Please try again." });
  }
});

// *** NEW DOUBT SOLVER ROUTE ***
app.post("/api/doubt-solver", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "No message provided." });
    }

    const prompt = `
        You are a friendly and encouraging AI tutor for students. 
        Your name is Quizwise-Bot.
        A student has asked the following question: "${message}".
        Provide a clear, helpful, and concise answer suitable for a high school student.
        Do not answer questions that are not academic or educational in nature.
      `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error("Doubt solver error:", error);
    res
      .status(500)
      .json({ message: "An error occurred while getting an answer." });
  }
});

// --- ADMIN ROUTES ---
// All routes in this section are protected by both auth and admin middleware

// UPDATE A USER'S ROLE
app.put("/api/admin/users/:id/role", auth, admin, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// ADMIN DELETE A QUIZ
app.delete("/api/admin/quizzes/:id", auth, admin, async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    await Result.deleteMany({ quiz: req.params.id });
    res.json({ msg: "Quiz removed by admin" });
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// GET ALL USERS (with search and pagination)
app.get("/api/admin/users", auth, admin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const query = search ? { name: { $regex: search, $options: "i" } } : {};
    const users = await User.find(query)
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await User.countDocuments(query);

    // Get total counts for all roles
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "Student" });
    const totalTeachers = await User.countDocuments({ role: "Teacher" });
    const totalModerators = await User.countDocuments({ role: "Moderator" });
    const totalAdmins = await User.countDocuments({ role: "Admin" });

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      stats: {
        totalUsers,
        totalStudents,
        totalTeachers,
        totalModerators,
        totalAdmins,
      },
    });
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// GET ALL QUIZZES (with search and pagination)
app.get("/api/admin/quizzes", auth, admin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const query = search ? { title: { $regex: search, $options: "i" } } : {};
    const quizzes = await Quiz.find(query)
      .populate("createdBy", "name")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await Quiz.countDocuments(query);
    const totalQuizzes = await Quiz.countDocuments();

    res.json({
      quizzes,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalQuizzes,
    });
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// GET SITE ANALYTICS
app.get("/api/admin/analytics", auth, admin, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const userSignups = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json({ userSignups });
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// --- MODERATOR ROUTES ---

// GET MODERATOR STATS
app.get("/api/moderator/stats", auth, moderator, async (req, res) => {
  try {
    const totalQuizzes = await Quiz.countDocuments();
    const pendingReports = await Report.countDocuments({ status: "pending" });
    res.json({ totalQuizzes, pendingReports });
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// GET ALL QUIZZES (for moderation, with search and pagination)
app.get("/api/moderator/quizzes", auth, moderator, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const query = search ? { title: { $regex: search, $options: "i" } } : {};
    const quizzes = await Quiz.find(query)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await Quiz.countDocuments(query);
    res.json({
      quizzes,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// MODERATOR DELETE A QUIZ
app.delete("/api/moderator/quizzes/:id", auth, moderator, async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    await Result.deleteMany({ quiz: req.params.id });
    res.json({ msg: "Quiz removed by moderator" });
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// --- REPORT ROUTE ---
app.post("/api/quizzes/report", auth, async (req, res) => {
  try {
    const { quizId, questionText, reason } = req.body;
    const userId = req.user.id;

    const newReport = new Report({
      quiz: quizId,
      questionText,
      reason,
      reportedBy: userId,
    });

    await newReport.save();
    console.log(`New report submitted by user ${userId} for quiz ${quizId}`);
    res.status(201).json({
      message: "Report submitted successfully. Our moderators will review it.",
    });
  } catch (error) {
    console.error("Error submitting report:", error);
    res.status(500).send("Server Error");
  }
});

// *** NEW *** GET ALL PENDING REPORTS (for moderators/admins)
app.get("/api/reports", auth, moderator, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("quiz", "title") // Get the title of the quiz
      .populate("reportedBy", "name") // Get the name of the user who reported
      .sort({ createdAt: -1 }); // Show newest reports first

    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).send("Server Error");
  }
});

// *** NEW *** RESOLVE A REPORT
app.put("/api/reports/:id/resolve", auth, moderator, async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: "resolved", resolvedBy: req.user.id, resolvedAt: new Date() },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    console.log(`Report ${req.params.id} resolved by ${req.user.name}`);
    res.json({ message: "Report resolved successfully", report });
  } catch (error) {
    console.error("Error resolving report:", error);
    res.status(500).send("Server Error");
  }
});

// *** NEW *** DISMISS A REPORT
app.put("/api/reports/:id/dismiss", auth, moderator, async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: "dismissed", resolvedBy: req.user.id, resolvedAt: new Date() },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    console.log(`Report ${req.params.id} dismissed by ${req.user.name}`);
    res.json({ message: "Report dismissed successfully", report });
  } catch (error) {
    console.error("Error dismissing report:", error);
    res.status(500).send("Server Error");
  }
});

// *** NEW *** GET REPORT STATISTICS
app.get("/api/reports/stats", auth, moderator, async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: "pending" });
    const resolvedReports = await Report.countDocuments({ status: "resolved" });
    const dismissedReports = await Report.countDocuments({
      status: "dismissed",
    });

    // Get report trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentReports = await Report.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    res.json({
      total: totalReports,
      pending: pendingReports,
      resolved: resolvedReports,
      dismissed: dismissedReports,
      recentReports,
    });
  } catch (error) {
    console.error("Error fetching report stats:", error);
    res.status(500).send("Server Error");
  }
});

// === SOCIAL FEATURES API ENDPOINTS ===

// === FRIEND SYSTEM ROUTES ===

// Send Friend Request
app.post("/api/friends/request", auth, async (req, res) => {
  try {
    const { recipientId } = req.body;
    const requesterId = req.user.id;

    if (requesterId === recipientId) {
      return res
        .status(400)
        .json({ message: "Cannot send friend request to yourself" });
    }

    // Check if friendship already exists
    const existingFriendship = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existingFriendship) {
      return res
        .status(400)
        .json({ message: "Friendship request already exists" });
    }

    const friendship = new Friendship({
      requester: requesterId,
      recipient: recipientId,
    });

    await friendship.save();

    // Create notification
    const notification = new Notification({
      recipient: recipientId,
      sender: requesterId,
      type: "friend-request",
      title: "New Friend Request",
      message: `${req.user.name} sent you a friend request`,
      metadata: { friendshipId: friendship._id },
    });

    await notification.save();

    res
      .status(201)
      .json({ message: "Friend request sent successfully", friendship });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ message: "Failed to send friend request" });
  }
});

// Accept/Decline Friend Request
app.put("/api/friends/respond/:friendshipId", auth, async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const { action } = req.body; // 'accept' or 'decline'
    const userId = req.user.id;

    const friendship = await Friendship.findById(friendshipId)
      .populate("requester", "name")
      .populate("recipient", "name");

    if (!friendship) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    if (friendship.recipient._id.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to respond to this request" });
    }

    if (friendship.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Friend request already responded to" });
    }

    if (action === "accept") {
      friendship.status = "accepted";
      friendship.acceptedAt = new Date();
      await friendship.save();

      // Create notification for requester
      const notification = new Notification({
        recipient: friendship.requester._id,
        sender: userId,
        type: "friend-accepted",
        title: "Friend Request Accepted",
        message: `${req.user.name} accepted your friend request`,
        metadata: { friendshipId: friendship._id },
      });

      await notification.save();

      res.json({ message: "Friend request accepted", friendship });
    } else {
      await Friendship.findByIdAndDelete(friendshipId);
      res.json({ message: "Friend request declined" });
    }
  } catch (error) {
    console.error("Error responding to friend request:", error);
    res.status(500).json({ message: "Failed to respond to friend request" });
  }
});

// Get Friends List
app.get("/api/friends", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const friendships = await Friendship.find({
      $or: [
        { requester: userId, status: "accepted" },
        { recipient: userId, status: "accepted" },
      ],
    })
      .populate("requester", "name email role")
      .populate("recipient", "name email role")
      .sort({ acceptedAt: -1 });

    const friends = friendships.map((friendship) => {
      const friend =
        friendship.requester._id.toString() === userId
          ? friendship.recipient
          : friendship.requester;

      return {
        friendshipId: friendship._id,
        friend,
        since: friendship.acceptedAt,
      };
    });

    res.json({ friends });
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ message: "Failed to fetch friends" });
  }
});

// Search Users (for adding friends)
app.get("/api/users/search", auth, async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.id;

    if (!query || query.trim().length < 2) {
      return res
        .status(400)
        .json({ message: "Search query must be at least 2 characters" });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: userId } }, // Exclude current user
        {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        },
      ],
    })
      .select("name email role")
      .limit(20);

    // Check friendship status for each user
    const usersWithFriendshipStatus = await Promise.all(
      users.map(async (user) => {
        const friendship = await Friendship.findOne({
          $or: [
            { requester: userId, recipient: user._id },
            { requester: user._id, recipient: userId },
          ],
        });

        return {
          ...user.toObject(),
          friendshipStatus: friendship ? friendship.status : "none",
          friendshipId: friendship ? friendship._id : null,
        };
      })
    );

    res.json({ users: usersWithFriendshipStatus });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Failed to search users" });
  }
});

// === QUIZ CHALLENGE ROUTES ===

// Create Quiz Challenge
app.post("/api/challenges/create", auth, async (req, res) => {
  try {
    const { challengedUserId, quizId, message } = req.body;
    const challengerId = req.user.id;

    if (challengerId === challengedUserId) {
      return res.status(400).json({ message: "Cannot challenge yourself" });
    }

    // Verify quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Check if users are friends
    const friendship = await Friendship.findOne({
      $or: [
        {
          requester: challengerId,
          recipient: challengedUserId,
          status: "accepted",
        },
        {
          requester: challengedUserId,
          recipient: challengerId,
          status: "accepted",
        },
      ],
    });

    if (!friendship) {
      return res.status(403).json({ message: "Can only challenge friends" });
    }

    const challenge = new Challenge({
      challenger: challengerId,
      challenged: challengedUserId,
      quiz: quizId,
      message: message || `${req.user.name} challenged you to a quiz!`,
    });

    await challenge.save();

    // Create notification
    const notification = new Notification({
      recipient: challengedUserId,
      sender: challengerId,
      type: "quiz-challenge",
      title: "New Quiz Challenge",
      message: `${req.user.name} challenged you to: ${quiz.title}`,
      metadata: { challengeId: challenge._id },
    });

    await notification.save();

    const populatedChallenge = await Challenge.findById(challenge._id)
      .populate("challenger", "name")
      .populate("challenged", "name")
      .populate("quiz", "title");

    res.status(201).json({
      message: "Challenge created successfully",
      challenge: populatedChallenge,
    });
  } catch (error) {
    console.error("Error creating challenge:", error);
    res.status(500).json({ message: "Failed to create challenge" });
  }
});

// Get User Challenges
app.get("/api/challenges", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status = "all" } = req.query;

    let query = {
      $or: [{ challenger: userId }, { challenged: userId }],
    };

    if (status !== "all") {
      query.status = status;
    }

    const challenges = await Challenge.find(query)
      .populate("challenger", "name")
      .populate("challenged", "name")
      .populate("quiz", "title")
      .sort({ createdAt: -1 });

    res.json({ challenges });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    res.status(500).json({ message: "Failed to fetch challenges" });
  }
});

// === NOTIFICATION ROUTES ===

// Get User Notifications
app.get("/api/notifications", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    let query = { recipient: userId };
    if (unreadOnly === "true") {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate("sender", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// Mark Notification as Read
app.put("/api/notifications/:notificationId/read", auth, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
});

// === ADMIN BROADCAST ROUTES ===

// Create Broadcast (Admin only)
app.post("/api/broadcasts/create", auth, admin, async (req, res) => {
  try {
    const {
      title,
      content,
      type = "announcement",
      targetAudience,
      priority = "medium",
      scheduledFor,
      expiresAt,
    } = req.body;

    if (!title.trim() || !content.trim()) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const broadcast = new Broadcast({
      sender: req.user.id,
      title,
      content,
      type,
      targetAudience: targetAudience || { roles: ["Student", "Teacher"] },
      priority,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    await broadcast.save();

    // Create notifications for target audience
    let targetUsers = [];

    if (
      targetAudience &&
      targetAudience.specific &&
      targetAudience.specific.length > 0
    ) {
      targetUsers = targetAudience.specific;
    } else if (
      targetAudience &&
      targetAudience.roles &&
      targetAudience.roles.length > 0
    ) {
      const users = await User.find({ role: { $in: targetAudience.roles } });
      targetUsers = users.map((user) => user._id);
    } else {
      const users = await User.find({});
      targetUsers = users.map((user) => user._id);
    }

    // Create notifications in batches
    const notifications = targetUsers.map((userId) => ({
      recipient: userId,
      sender: req.user.id,
      type: "broadcast",
      title: `📢 ${title}`,
      message: content.substring(0, 100) + (content.length > 100 ? "..." : ""),
      metadata: { broadcastId: broadcast._id },
    }));

    await Notification.insertMany(notifications);

    res
      .status(201)
      .json({ message: "Broadcast created successfully", broadcast });
  } catch (error) {
    console.error("Error creating broadcast:", error);
    res.status(500).json({ message: "Failed to create broadcast" });
  }
});

// Get Broadcasts
app.get("/api/broadcasts", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = {
      isActive: true,
      scheduledFor: { $lte: new Date() },
    };

    // Add expiration check
    query.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gte: new Date() } },
    ];

    // Filter by target audience
    query.$and = [
      {
        $or: [
          { "targetAudience.roles": userRole },
          { "targetAudience.specific": userId },
          { "targetAudience.roles": { $exists: false } },
        ],
      },
    ];

    const broadcasts = await Broadcast.find(query)
      .populate("sender", "name role")
      .sort({ priority: -1, createdAt: -1 })
      .limit(10);

    res.json({ broadcasts });
  } catch (error) {
    console.error("Error fetching broadcasts:", error);
    res.status(500).json({ message: "Failed to fetch broadcasts" });
  }
});

// === CHAT SYSTEM ROUTES ===

// Send Message
app.post("/api/chat/send", auth, async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    if (!recipientId || !content || !content.trim()) {
      return res
        .status(400)
        .json({ message: "Recipient and message content are required" });
    }

    // Check if users are friends
    const friendship = await Friendship.findOne({
      $or: [
        { requester: req.user.id, recipient: recipientId, status: "accepted" },
        { requester: recipientId, recipient: req.user.id, status: "accepted" },
      ],
    });

    if (!friendship) {
      return res.status(403).json({ message: "You can only message friends" });
    }

    // Find or create chat room
    let chatRoom = await ChatRoom.findOne({
      participants: { $all: [req.user.id, recipientId] },
      type: "direct",
    });

    if (!chatRoom) {
      // Get recipient's name for chat room name
      const recipient = await User.findById(recipientId).select("name");
      const sender = await User.findById(req.user.id).select("name");

      chatRoom = new ChatRoom({
        name: `${sender.name} & ${recipient.name}`,
        type: "direct",
        participants: [req.user.id, recipientId],
        creator: req.user.id,
        settings: {
          isPublic: false,
          allowStudents: true,
          requireApproval: false,
          canStudentsPost: true,
        },
      });
      await chatRoom.save();
    }

    // Create message
    const message = new Message({
      chatRoom: chatRoom._id,
      sender: req.user.id,
      content: content.trim(),
      timestamp: new Date(),
    });

    await message.save();

    // Update chat room's last message
    chatRoom.lastMessage = message._id;
    chatRoom.lastActivity = new Date();
    await chatRoom.save();

    // Populate sender info for response
    await message.populate("sender", "name email role");

    res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
});

// Get Messages for a Chat
app.get("/api/chat/messages/:friendId", auth, async (req, res) => {
  try {
    const { friendId } = req.params;

    // Check if users are friends
    const friendship = await Friendship.findOne({
      $or: [
        { requester: req.user.id, recipient: friendId, status: "accepted" },
        { requester: friendId, recipient: req.user.id, status: "accepted" },
      ],
    });

    if (!friendship) {
      return res
        .status(403)
        .json({ message: "You can only view messages with friends" });
    }

    // Find chat room
    const chatRoom = await ChatRoom.findOne({
      participants: { $all: [req.user.id, friendId] },
      type: "direct",
    });

    if (!chatRoom) {
      return res.json({ messages: [] });
    }

    // Get messages
    const messages = await Message.find({ chatRoom: chatRoom._id })
      .populate("sender", "name email role")
      .sort({ timestamp: 1 })
      .limit(100); // Limit to last 100 messages

    res.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// Get Chat Rooms for User
app.get("/api/chat/rooms", auth, async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find({
      participants: req.user.id,
    })
      .populate("participants", "name email role")
      .populate("lastMessage")
      .sort({ lastActivity: -1 });

    res.json({ chatRooms });
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    res.status(500).json({ message: "Failed to fetch chat rooms" });
  }
});

// Mark Messages as Read
app.put("/api/chat/read/:friendId", auth, async (req, res) => {
  try {
    const { friendId } = req.params;

    // Find chat room
    const chatRoom = await ChatRoom.findOne({
      participants: { $all: [req.user.id, friendId] },
      type: "direct",
    });

    if (!chatRoom) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    // Mark messages as read
    await Message.updateMany(
      {
        chatRoom: chatRoom._id,
        sender: { $ne: req.user.id },
        isRead: false,
      },
      { isRead: true, readAt: new Date() }
    );

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Failed to mark messages as read" });
  }
});

// === USER STATUS TRACKING ROUTES ===

// Update User Status
app.put("/api/user/status", auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["online", "offline", "away"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status. Must be online, offline, or away" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        status: status,
        lastActivity: new Date(),
        lastSeen: status === "offline" ? new Date() : undefined,
      },
      { new: true, select: "status lastSeen lastActivity" }
    );

    res.json({
      message: "Status updated successfully",
      user: user,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ message: "Failed to update status" });
  }
});

// Get Friends Status
app.get("/api/user/friends-status", auth, async (req, res) => {
  try {
    // Get user's friends
    const friendships = await Friendship.find({
      $or: [
        { requester: req.user.id, status: "accepted" },
        { recipient: req.user.id, status: "accepted" },
      ],
    }).populate("requester recipient", "name status lastSeen lastActivity");

    // Extract friend info with status
    const friendsStatus = friendships.map((friendship) => {
      const friend =
        friendship.requester._id.toString() === req.user.id
          ? friendship.recipient
          : friendship.requester;

      return {
        friendId: friend._id,
        name: friend.name,
        status: friend.status,
        lastSeen: friend.lastSeen,
        lastActivity: friend.lastActivity,
        isOnline:
          friend.status === "online" &&
          new Date() - new Date(friend.lastActivity) < 5 * 60 * 1000, // 5 minutes threshold
      };
    });

    res.json({ friendsStatus });
  } catch (error) {
    console.error("Error fetching friends status:", error);
    res.status(500).json({ message: "Failed to fetch friends status" });
  }
});

// Update Last Activity (called periodically by frontend)
app.put("/api/user/activity", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      lastActivity: new Date(),
      status: "online",
    });

    res.json({ message: "Activity updated" });
  } catch (error) {
    console.error("Error updating activity:", error);
    res.status(500).json({ message: "Failed to update activity" });
  }
});

// Get Single User Status
app.get("/api/user/status/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if users are friends
    const friendship = await Friendship.findOne({
      $or: [
        { requester: req.user.id, recipient: userId, status: "accepted" },
        { requester: userId, recipient: req.user.id, status: "accepted" },
      ],
    });

    if (!friendship) {
      return res
        .status(403)
        .json({ message: "You can only view status of friends" });
    }

    const user = await User.findById(userId).select(
      "name status lastSeen lastActivity"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isOnline =
      user.status === "online" &&
      new Date() - new Date(user.lastActivity) < 5 * 60 * 1000; // 5 minutes

    res.json({
      userId: user._id,
      name: user.name,
      status: user.status,
      lastSeen: user.lastSeen,
      lastActivity: user.lastActivity,
      isOnline: isOnline,
    });
  } catch (error) {
    console.error("Error fetching user status:", error);
    res.status(500).json({ message: "Failed to fetch user status" });
  }
});

// ========================================
// LIVE SESSION REST ENDPOINTS
// Fallback for fetching session data without WebSocket
// ========================================

// Get session by code
app.get("/api/live-sessions/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const session = await LiveSession.findOne({
      sessionCode: code.toUpperCase(),
    })
      .populate("quizId", "title description questions")
      .populate("hostId", "name picture")
      .populate("participants.userId", "name picture");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json({
      sessionCode: session.sessionCode,
      quiz: {
        id: session.quizId._id,
        title: session.quizId.title,
        description: session.quizId.description,
        totalQuestions: session.quizId.questions.length,
      },
      host: {
        id: session.hostId._id,
        name: session.hostId.name,
        picture: session.hostId.picture,
      },
      status: session.status,
      currentQuestionIndex: session.currentQuestionIndex,
      participantCount: session.participantCount,
      participants: session.participants
        .filter((p) => p.isActive)
        .map((p) => ({
          id: p.userId._id,
          name: p.userId.name,
          picture: p.userId.picture,
          score: p.score,
        })),
      settings: session.settings,
      createdAt: session.createdAt,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
    });
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({ message: "Failed to fetch session" });
  }
});

// Get leaderboard for a session
app.get("/api/live-sessions/:code/leaderboard", async (req, res) => {
  try {
    const { code } = req.params;

    const session = await LiveSession.findOne({
      sessionCode: code.toUpperCase(),
    }).populate("participants.userId", "name picture");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const leaderboard = session.getLeaderboard();

    res.json({ leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});

// Get all sessions for a host (teacher dashboard)
app.get("/api/live-sessions/host/my-sessions", auth, async (req, res) => {
  try {
    const sessions = await LiveSession.find({ hostId: req.user.id })
      .populate("quizId", "title")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      sessions: sessions.map((s) => ({
        sessionCode: s.sessionCode,
        quizTitle: s.quizId.title,
        status: s.status,
        participantCount: s.participantCount,
        createdAt: s.createdAt,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching host sessions:", error);
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
});

// Get session analytics (for host after session ends)
app.get("/api/live-sessions/:code/analytics", auth, async (req, res) => {
  try {
    const { code } = req.params;

    const session = await LiveSession.findOne({
      sessionCode: code.toUpperCase(),
    })
      .populate("quizId")
      .populate("participants.userId", "name");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Verify requester is host
    if (session.hostId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only host can view analytics" });
    }

    // Calculate question accuracy
    const questionAccuracy = [];
    for (let i = 0; i < session.quizId.questions.length; i++) {
      const totalAnswers = session.participants.reduce((count, p) => {
        return count + (p.answers.some((a) => a.questionIndex === i) ? 1 : 0);
      }, 0);

      const correctAnswers = session.participants.reduce((count, p) => {
        const answer = p.answers.find((a) => a.questionIndex === i);
        return count + (answer && answer.isCorrect ? 1 : 0);
      }, 0);

      questionAccuracy.push({
        questionIndex: i,
        question: session.quizId.questions[i].question,
        totalAnswers,
        correctAnswers,
        correctPercentage:
          totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0,
      });
    }

    // Calculate average score
    const totalScore = session.participants.reduce(
      (sum, p) => sum + p.score,
      0
    );
    const avgScore =
      session.participants.length > 0
        ? totalScore / session.participants.length
        : 0;

    res.json({
      sessionCode: session.sessionCode,
      quizTitle: session.quizId.title,
      totalParticipants: session.participants.length,
      activeParticipants: session.participantCount,
      averageScore: avgScore.toFixed(2),
      questionAccuracy,
      topPerformers: session.getLeaderboard().slice(0, 10),
      duration:
        session.endedAt && session.startedAt
          ? Math.floor((session.endedAt - session.startedAt) / 1000)
          : null,
    });
  } catch (error) {
    console.error("Error fetching session analytics:", error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

// Get session history for a specific quiz (teacher view)
app.get("/api/live-sessions/quiz/:quizId/history", auth, async (req, res) => {
  try {
    const { quizId } = req.params;

    // Find all completed sessions for this quiz
    const sessions = await LiveSession.find({
      quizId: quizId,
      status: "completed",
    })
      .populate("quizId", "title description")
      .populate("hostId", "name email")
      .sort({ endedAt: -1 })
      .limit(50); // Last 50 sessions

    const sessionHistory = sessions.map((session) => ({
      sessionId: session._id,
      sessionCode: session.sessionCode,
      quizTitle: session.quizId?.title,
      hostName: session.hostId?.name,
      participantCount: session.participants.filter((p) => p.isActive).length,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      duration: session.endedAt
        ? Math.floor((session.endedAt - session.startedAt) / 1000 / 60)
        : 0,
      finalLeaderboard: session.finalLeaderboard || [],
      averageScore:
        session.finalLeaderboard?.length > 0
          ? Math.round(
              session.finalLeaderboard.reduce((sum, p) => sum + p.score, 0) /
                session.finalLeaderboard.length
            )
          : 0,
    }));

    res.json({
      success: true,
      sessions: sessionHistory,
      total: sessionHistory.length,
    });
  } catch (error) {
    console.error("Error fetching session history:", error);
    res.status(500).json({ message: "Failed to fetch session history" });
  }
});

// Get detailed session results with participant attempts
app.get("/api/live-sessions/:sessionId/results", auth, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await LiveSession.findById(sessionId)
      .populate("quizId", "title description questions")
      .populate("hostId", "name email");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Get detailed participant data
    const participantDetails = session.participants
      .filter((p) => p.isActive)
      .map((p) => ({
        userId: p.userId,
        username: p.username,
        avatar: p.avatar,
        score: p.score,
        correctAnswers: p.answers.filter((a) => a.isCorrect).length,
        totalAnswers: p.answers.length,
        totalTime: p.answers.reduce((sum, a) => sum + a.timeSpent, 0),
        accuracy:
          p.answers.length > 0
            ? (
                (p.answers.filter((a) => a.isCorrect).length /
                  p.answers.length) *
                100
              ).toFixed(1)
            : 0,
        answers: p.answers.map((a) => ({
          questionIndex: a.questionIndex,
          answer: a.answer,
          isCorrect: a.isCorrect,
          timeSpent: a.timeSpent,
          pointsEarned: a.pointsEarned,
          answeredAt: a.answeredAt,
        })),
        joinedAt: p.joinedAt,
      }))
      .sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      session: {
        sessionCode: session.sessionCode,
        quizTitle: session.quizId?.title,
        hostName: session.hostId?.name,
        status: session.status,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        totalQuestions: session.quizId?.questions.length || 0,
      },
      participants: participantDetails,
      leaderboard: session.finalLeaderboard || session.getLeaderboard(),
    });
  } catch (error) {
    console.error("Error fetching session results:", error);
    res.status(500).json({ message: "Failed to fetch session results" });
  }
});

// Get all session history for teacher (all their quizzes)
app.get("/api/live-sessions/teacher/history", auth, async (req, res) => {
  try {
    const Quiz = require("./models/Quiz");

    console.log(`[API] Fetching session history for teacher: ${req.user.id}`);

    // Find all quizzes created by this teacher
    const teacherQuizzes = await Quiz.find({ createdBy: req.user.id }).select(
      "_id title"
    );
    const quizIds = teacherQuizzes.map((q) => q._id);

    console.log(
      `[API] Teacher has ${teacherQuizzes.length} quizzes:`,
      teacherQuizzes.map((q) => ({ id: q._id, title: q.title }))
    );

    // TEMP: Also check sessions hosted by this teacher
    const hostedSessions = await LiveSession.find({
      hostId: req.user.id,
    })
      .populate("quizId", "title description category createdBy")
      .populate("hostId", "name")
      .sort({ createdAt: -1 })
      .limit(100);

    console.log(
      `[API] Found ${hostedSessions.length} sessions hosted by teacher`
    );
    console.log(
      `[API] Hosted session details:`,
      hostedSessions.map((s) => ({
        code: s.sessionCode,
        status: s.status,
        quizTitle: s.quizId?.title,
        quizCreatedBy: s.quizId?.createdBy?.toString(),
        hasEndedAt: !!s.endedAt,
      }))
    );

    // Find all completed sessions for these quizzes
    const sessions = await LiveSession.find({
      quizId: { $in: quizIds },
    })
      .populate("quizId", "title description category")
      .populate("hostId", "name")
      .sort({ createdAt: -1 })
      .limit(100);

    console.log(
      `[API] Found ${sessions.length} total sessions by quiz ownership`
    );
    console.log(
      `[API] Session statuses:`,
      sessions.map((s) => ({
        code: s.sessionCode,
        status: s.status,
        hasEndedAt: !!s.endedAt,
      }))
    );

    // Use hosted sessions instead (teacher can see sessions they hosted)
    const allRelevantSessions = [
      ...new Map(
        [...hostedSessions, ...sessions].map((s) => [s._id.toString(), s])
      ).values(),
    ];
    console.log(`[API] Total unique sessions: ${allRelevantSessions.length}`);

    // Filter completed sessions
    const completedSessions = allRelevantSessions.filter(
      (s) => s.status === "completed"
    );
    console.log(`[API] ${completedSessions.length} completed sessions`);
    console.log(
      `[API] Completed session codes:`,
      completedSessions.map((s) => s.sessionCode)
    );

    // DEBUG: Show why sessions were filtered out
    const notCompleted = allRelevantSessions.filter(
      (s) => s.status !== "completed"
    );
    console.log(
      `[API] ${notCompleted.length} sessions NOT completed:`,
      notCompleted.map((s) => ({ code: s.sessionCode, status: s.status }))
    );

    const sessionHistory = completedSessions.map((session) => ({
      sessionId: session._id,
      sessionCode: session.sessionCode,
      quizId: session.quizId?._id,
      quizTitle: session.quizId?.title,
      category: session.quizId?.category,
      hostName: session.hostId?.name,
      status: session.status, // Add status field
      participantCount: session.participants.filter((p) => p.isActive).length,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      duration: session.endedAt
        ? Math.floor((session.endedAt - session.startedAt) / 1000 / 60)
        : 0,
      topScore: session.finalLeaderboard?.[0]?.score || 0,
      averageScore:
        session.finalLeaderboard?.length > 0
          ? Math.round(
              session.finalLeaderboard.reduce((sum, p) => sum + p.score, 0) /
                session.finalLeaderboard.length
            )
          : 0,
    }));

    console.log(
      `[API] Returning ${sessionHistory.length} sessions with IDs:`,
      sessionHistory.map((s) => ({ code: s.sessionCode, id: s.sessionId }))
    );

    res.json({
      success: true,
      sessions: sessionHistory,
      total: sessionHistory.length,
    });
  } catch (error) {
    console.error("Error fetching teacher session history:", error);
    res.status(500).json({ message: "Failed to fetch session history" });
  }
});

// Get leaderboard for a specific session
app.get("/api/live-sessions/:sessionId/leaderboard", auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log(`[API] Fetching leaderboard for session: ${sessionId}`);

    const session = await LiveSession.findById(sessionId)
      .populate("quizId", "title")
      .populate("hostId", "name");

    console.log(`[API] Session found:`, !!session);

    if (!session) {
      console.log(`[API] Session ${sessionId} not found`);
      return res.status(404).json({ message: "Session not found" });
    }

    // Return final leaderboard if available, otherwise generate from participants
    const leaderboard = session.finalLeaderboard || session.getLeaderboard();
    console.log(`[API] Leaderboard has ${leaderboard.length} participants`);

    res.json({
      success: true,
      leaderboard,
      sessionCode: session.sessionCode,
      quizTitle: session.quizId?.title,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
});

// Delete/Cancel a session (host only)
app.delete("/api/live-sessions/:code", auth, async (req, res) => {
  try {
    const { code } = req.params;

    const session = await LiveSession.findOne({
      sessionCode: code.toUpperCase(),
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Verify requester is host
    if (session.hostId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only host can delete session" });
    }

    session.status = "cancelled";
    session.endedAt = new Date();
    await session.save();

    // Notify via Socket.IO if session is active
    io.to(code.toUpperCase()).emit("session-cancelled", {
      message: "Session has been cancelled by host",
    });

    res.json({ message: "Session cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling session:", error);
    res.status(500).json({ message: "Failed to cancel session" });
  }
});

// --- START THE SERVER ---
// Start server on all network interfaces (0.0.0.0) for Render/Railway deployment
const HOST = process.env.HOST || "0.0.0.0";

server.listen(PORT, HOST, () => {
  console.log(`Server with Socket.IO running on ${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Export for serverless platforms (if needed)
module.exports = app;
