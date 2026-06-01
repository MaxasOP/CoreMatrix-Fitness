// backend/services/socketService.js
// Real-time WebSocket service for leaderboards, notifications, and chat
const io = require('socket.io');
const jwt = require('jsonwebtoken');

class SocketService {
  constructor(server) {
    this.io = io(server, {
      cors: { origin: process.env.FRONTEND_URL, credentials: true }
    });
    this.setupMiddleware();
    this.setupEvents();
  }

  setupMiddleware() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });
  }

  setupEvents() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userId}`);

      // Leaderboard updates
      socket.on('join_leaderboard', (scope) => {
        socket.join(`leaderboard_${scope}`);
        console.log(`User ${socket.userId} joined leaderboard: ${scope}`);
      });

      socket.on('leaderboard_update', (data) => {
        this.io.to(`leaderboard_${data.scope}`).emit('update', data);
      });

      // Chat with trainers
      socket.on('send_message', (data) => {
        const recipientRoom = `chat_${data.recipient_id}`;
        this.io.to(recipientRoom).emit('new_message', {
          from: socket.userId,
          message: data.message,
          timestamp: new Date()
        });
      });

      // Notifications
      socket.on('join_notifications', () => {
        socket.join(`notifications_${socket.userId}`);
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
      });
    });
  }

  emitLeaderboardUpdate(scope, data) {
    this.io.to(`leaderboard_${scope}`).emit('update', data);
  }

  emitNotification(userId, notification) {
    this.io.to(`notifications_${userId}`).emit('notification', notification);
  }

  emitMessage(recipientId, message) {
    this.io.to(`chat_${recipientId}`).emit('message', message);
  }
}

module.exports = SocketService;
