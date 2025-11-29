/**
 * Socket.IO Duel/Battle Event Handlers
 * Manages 1v1 quiz battles with real-time scoring
 */

const mongoose = require('mongoose');
const createLogger = require('../../shared/utils/logger');
const DuelMatch = require('../models/DuelMatch');

const logger = createLogger('duel-handlers');
const QUIZ_SERVICE_URL = process.env.QUIZ_SERVICE_URL || 'http://localhost:3005';

/**
 * Fetch quiz from quiz service
 */
async function fetchQuiz(quizId) {
  try {
    const response = await fetch(`${QUIZ_SERVICE_URL}/api/quizzes/${quizId}`);
    if (!response.ok) {
      throw new Error('Quiz not found');
    }
    return await response.json();
  } catch (error) {
    logger.error('Error fetching quiz:', error);
    throw error;
  }
}

/**
 * Clean up stale waiting matches on server start
 */
async function cleanupStaleMatches() {
  try {
    const result = await DuelMatch.deleteMany({ 
      status: 'waiting',
      createdAt: { $lt: new Date(Date.now() - 10 * 60 * 1000) } // Older than 10 minutes
    });
    if (result.deletedCount > 0) {
      logger.info(`[Duel] Cleaned up ${result.deletedCount} stale waiting matches`);
    }
  } catch (error) {
    logger.error('[Duel] Error cleaning up stale matches:', error);
  }
}

/**
 * Initialize Duel Socket.IO handlers
 */
function initializeDuelHandlers(io) {
  
  // Clean up old matches on initialization
  cleanupStaleMatches();
  
  io.on('connection', (socket) => {
    
    // ============================================
    // FIND DUEL MATCH
    // ============================================
    socket.on('find-duel-match', async (data, callback) => {
      try {
        const { quizId, userId, username, avatar } = data;
        
        logger.info(`[Duel] ${userId} searching for match on quiz ${quizId}`);

        // Find existing waiting match for this quiz (don't match with self)
        let match = await DuelMatch.findOne({
          quizId: new mongoose.Types.ObjectId(quizId),
          status: 'waiting',
          'player1.userId': { $ne: new mongoose.Types.ObjectId(userId) }
        });

        if (match) {
          // Validate that player1 is still connected
          const player1Socket = io.sockets.sockets.get(match.player1.socketId);
          
          if (!player1Socket) {
            // Player1 disconnected, delete stale match and create new one
            logger.warn(`[Duel] Stale match found (player1 disconnected): ${match.matchId}`);
            await DuelMatch.deleteOne({ matchId: match.matchId });
            match = null; // Fall through to create new match
          }
        }

        if (match) {
          // Fetch quiz from quiz service
          const quiz = await fetchQuiz(match.quizId.toString());

          // Join existing match as player 2
          match.player2 = {
            userId: new mongoose.Types.ObjectId(userId),
            socketId: socket.id,
            username,
            avatar,
            score: 0,
            correctAnswers: 0,
            totalTime: 0,
            answers: [],
            isReady: false,
            isActive: true
          };
          match.status = 'ready';
          await match.save();

          // Both players join the match room
          socket.join(match.matchId);
          const player1Socket = io.sockets.sockets.get(match.player1.socketId);
          if (player1Socket) {
            player1Socket.join(match.matchId);
          }

          logger.info(`[Duel] Match found: ${match.matchId} - ${match.player1.userId} vs ${userId}`);

          // Notify both players
          io.to(match.matchId).emit('match-found', {
            matchId: match.matchId,
            quiz: {
              id: quiz._id,
              title: quiz.title,
              description: quiz.description,
              totalQuestions: quiz.questions.length
            },
            opponent: {
              player1: {
                userId: match.player1.userId,
                username: match.player1.username || 'Player 1',
                avatar: match.player1.avatar
              },
              player2: {
                userId: match.player2.userId,
                username: username,
                avatar: avatar
              }
            }
          });

          callback({ success: true, matchId: match.matchId, role: 'player2' });
        } else {
          // Create new waiting match
          const matchId = `duel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          match = new DuelMatch({
            matchId,
            quizId: new mongoose.Types.ObjectId(quizId),
            player1: {
              userId: new mongoose.Types.ObjectId(userId),
              socketId: socket.id,
              username,
              avatar,
              score: 0,
              correctAnswers: 0,
              totalTime: 0,
              answers: [],
              isReady: false,
              isActive: true
            },
            status: 'waiting'
          });

          await match.save();
          socket.join(matchId);

          logger.info(`[Duel] Waiting for opponent: ${matchId} - ${userId}`);

          callback({ success: true, matchId, role: 'player1', waiting: true });
        }
      } catch (error) {
        logger.error('[Duel] Error finding match:', error);
        callback({ success: false, error: error.message });
      }
    });

    // ============================================
    // DUEL READY
    // ============================================
    socket.on('duel-ready', async (data, callback) => {
      try {
        const { matchId, userId } = data;

        logger.info(`[Duel] Player ready: ${userId} in ${matchId}`);

        const match = await DuelMatch.findOne({ matchId });
        if (!match) {
          return callback({ success: false, error: 'Match not found' });
        }

        // Mark player as ready (convert to strings for comparison)
        const userIdStr = String(userId);
        const player1IdStr = match.player1?.userId ? String(match.player1.userId) : null;
        const player2IdStr = match.player2?.userId ? String(match.player2.userId) : null;

        if (player1IdStr === userIdStr) {
          match.player1.isReady = true;
        } else if (player2IdStr && player2IdStr === userIdStr) {
          match.player2.isReady = true;
        } else {
          return callback({ success: false, error: 'User not in this match' });
        }

        await match.save();

        // Notify room that player is ready
        io.to(matchId).emit('player-ready', { userId });
        
        logger.info(`[Duel] Player ${userId} marked ready. Player2 exists: ${!!match.player2}, Player1 ready: ${match.player1.isReady}, Player2 ready: ${match.player2?.isReady}`);

        // If still waiting for opponent (player2 is null), tell player to wait
        if (!match.player2) {
          callback({ success: true, status: 'waiting', message: 'Marked as ready - waiting for opponent' });
          return;
        }

        // Acknowledge ready
        callback({ success: true, status: 'ready', message: 'Ready! Waiting for other player...' });

        // Re-fetch to handle race condition
        const latestMatch = await DuelMatch.findOne({ matchId });

        // Start if both ready
        if (latestMatch.player1.isReady && latestMatch.player2 && latestMatch.player2.isReady) {
          logger.info(`[Duel] Both players ready! Starting ${matchId}`);

          latestMatch.status = 'active';
          latestMatch.startedAt = new Date();
          latestMatch.currentQuestionIndex = 0;
          await latestMatch.save();

          // Ensure both players in room
          socket.join(matchId);
          const player1Socket = io.sockets.sockets.get(latestMatch.player1.socketId);
          const player2Socket = io.sockets.sockets.get(latestMatch.player2.socketId);

          if (player1Socket) player1Socket.join(matchId);
          if (player2Socket) player2Socket.join(matchId);

          // Fetch quiz from service
          if (!latestMatch.quizId) {
            logger.error(`[Duel] No quizId in match ${matchId}`);
            return callback({ success: false, error: 'Quiz not found in match' });
          }
          
          const quiz = await fetchQuiz(String(latestMatch.quizId));
          if (!quiz || !quiz.questions || quiz.questions.length === 0) {
            logger.error(`[Duel] Quiz has no questions: ${latestMatch.quizId}`);
            return callback({ success: false, error: 'Quiz has no questions' });
          }
          
          const currentQuestion = quiz.questions[0];

          io.to(matchId).emit('duel-started', {
            currentQuestion: {
              index: 0,
              question: currentQuestion.question,
              options: currentQuestion.options,
              timeLimit: latestMatch.timePerQuestion
            }
          });

          logger.info(`[Duel] Match started: ${matchId}`);
        }

        callback({ success: true });
      } catch (error) {
        logger.error('[Duel] Error in ready:', error);
        callback({ success: false, error: error.message });
      }
    });

    // ============================================
    // DUEL ANSWER
    // ============================================
    socket.on('duel-answer', async (data, callback) => {
      try {
        const { matchId, userId, questionIndex, answer, timeSpent } = data;

        const match = await DuelMatch.findOne({ matchId });
        if (!match) {
          return callback({ success: false, error: 'Match not found' });
        }

        // Fetch quiz from service
        if (!match.quizId) {
          return callback({ success: false, error: 'Quiz not found in match' });
        }

        const quiz = await fetchQuiz(String(match.quizId));
        if (!quiz || !quiz.questions || !quiz.questions[questionIndex]) {
          return callback({ success: false, error: 'Question not found' });
        }

        const question = quiz.questions[questionIndex];
        const isCorrect = answer === question.correct_answer;
        const pointsEarned = isCorrect ? 100 : 0;

        // Record answer
        const answerRecord = {
          questionIndex,
          answer,
          isCorrect,
          timeSpent,
          timestamp: new Date()
        };

        // Safe player identification
        const userIdStr = String(userId);
        const player1IdStr = match.player1?.userId ? String(match.player1.userId) : null;
        const player2IdStr = match.player2?.userId ? String(match.player2.userId) : null;

        let player;
        if (player1IdStr === userIdStr) {
          player = match.player1;
        } else if (player2IdStr === userIdStr) {
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
          explanation: question.explanation
        });

        // Emit live score update
        io.to(matchId).emit('duel-score-update', {
          player1: {
            userId: match.player1.userId.toString(),
            score: match.player1.score,
            correctAnswers: match.player1.correctAnswers,
            answeredCount: match.player1.answers.length
          },
          player2: {
            userId: match.player2.userId.toString(),
            score: match.player2.score,
            correctAnswers: match.player2.correctAnswers,
            answeredCount: match.player2.answers.length
          }
        });

        // Check if player finished (use quiz data fetched earlier)
        const playerFinished = player.answers.length === quiz.questions.length;

        if (playerFinished) {
          socket.emit('player-completed', {
            message: 'Waiting for opponent to finish...',
            yourScore: player.score,
            yourCorrect: player.correctAnswers
          });

          logger.info(`[Duel] Player ${userId} completed all questions`);
        }

        // Check if BOTH finished
        const bothFinished =
          match.player1.answers.length === quiz.questions.length &&
          match.player2.answers.length === quiz.questions.length;

        if (bothFinished) {
          // Determine winner
          let winner = null;
          if (match.player1.score > match.player2.score) {
            winner = match.player1.userId.toString();
          } else if (match.player2.score > match.player1.score) {
            winner = match.player2.userId.toString();
          } else if (match.player1.totalTime < match.player2.totalTime) {
            winner = match.player1.userId.toString();
          } else if (match.player2.totalTime < match.player1.totalTime) {
            winner = match.player2.userId.toString();
          }

          match.status = 'completed';
          match.completedAt = new Date();
          match.winner = winner ? new mongoose.Types.ObjectId(winner) : null;
          await match.save();

          io.to(matchId).emit('duel-ended', {
            winner,
            finalScores: {
              player1: {
                userId: match.player1.userId.toString(),
                score: match.player1.score,
                correctAnswers: match.player1.correctAnswers,
                totalTime: match.player1.totalTime
              },
              player2: {
                userId: match.player2.userId.toString(),
                score: match.player2.score,
                correctAnswers: match.player2.correctAnswers,
                totalTime: match.player2.totalTime
              }
            }
          });

          logger.info(`[Duel] Match completed: ${matchId}, Winner: ${winner || 'TIE'}`);
        } else {
          // Move to next question for THIS player only
          const nextIndex = player.answers.length;
          if (nextIndex < quiz.questions.length) {
            const nextQuestion = quiz.questions[nextIndex];
            
            socket.emit('next-question', {
              currentQuestion: {
                index: nextIndex,
                question: nextQuestion.question,
                options: nextQuestion.options,
                timeLimit: match.timePerQuestion
              }
            });
          }
        }
      } catch (error) {
        logger.error('[Duel] Error in answer:', error);
        callback({ success: false, error: error.message });
      }
    });

    // ============================================
    // DISCONNECT HANDLING
    // ============================================
    socket.on('disconnect', async () => {
      try {
        // Find any active match with this socket
        const match = await DuelMatch.findOne({
          status: { $in: ['waiting', 'ready', 'active'] },
          $or: [
            { 'player1.socketId': socket.id },
            { 'player2.socketId': socket.id }
          ]
        });

        if (match) {
          const isPlayer1 = match.player1.socketId === socket.id;
          const disconnectedUserId = isPlayer1 ? match.player1.userId : match.player2?.userId;

          if (match.status === 'waiting') {
            // Remove waiting match
            await DuelMatch.deleteOne({ _id: match._id });
            logger.info(`[Duel] Removed waiting match ${match.matchId}`);
          } else {
            // Declare opponent as winner
            const winnerId = isPlayer1 ? match.player2?.userId : match.player1.userId;

            match.status = 'completed';
            match.completedAt = new Date();
            match.winner = winnerId;
            await match.save();

            io.to(match.matchId).emit('opponent-disconnected', {
              winner: winnerId?.toString(),
              message: 'Opponent disconnected'
            });

            logger.info(`[Duel] Player disconnected from ${match.matchId}, opponent wins`);
          }
        }
      } catch (error) {
        logger.error('[Duel] Error handling disconnect:', error);
      }
    });

  });
}

module.exports = { initializeDuelHandlers };
