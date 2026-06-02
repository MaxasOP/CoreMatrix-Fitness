const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const http = require('http');
const SocketService = require('./services/socketService');

dotenv.config();

// Route imports
const authRoutes = require('./routes/auth');
const fitnessRoutes = require('./routes/fitness');
const aiRoutes = require('./routes/ai');
const supplementRoutes = require('./routes/supplements');
const leaderboardRoutes = require('./routes/leaderboards');
const challengeRoutes = require('./routes/challenges');
const reelRoutes = require('./routes/reels');
const paymentRoutes = require('./routes/payments');
const videoRoutes = require('./routes/video');
const analyticsRoutes = require('./routes/analytics');

const { authOptional } = require('./middleware/authMiddleware');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// Initialize Socket.io
const socketService = new SocketService(server);

// Security headers
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Localization middleware (Temporarily disabled to fix Render deployment crash)
// const localizationMiddleware = require('./middleware/localizationMiddleware');
// app.use(localizationMiddleware);

// Optional auth middleware
app.use(authOptional);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', fitnessRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/supplements', supplementRoutes);
app.use('/api/leaderboards', leaderboardRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/video', videoRoutes);

app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ 
  status: 'ok', 
  message: 'CoreMatrix MERN backend running',
  version: '0.2.0'
}));

// Serve React client build in production if present
const clientBuildPath = path.join(__dirname, 'client', 'build');
if (process.env.NODE_ENV === 'production' && fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  // Serve a simple message at root in non-production
  app.get('/', (req, res) => res.send('CoreMatrix MERN backend v0.2.0'));
}

async function start() {
  // Require critical env vars in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is required in production');
      process.exit(1);
    }
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change_this_secret') {
      console.error('JWT_SECRET must be set to a secure value in production');
      process.exit(1);
    }
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/corematrix';
  try {
    await mongoose.connect(mongoUri, { autoIndex: true });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }

  server.listen(PORT, () => {
    console.log(`CoreMatrix backend listening on http://localhost:${PORT}`);
    console.log('🚀 WebSocket server active (Socket.io)');
    console.log('Available endpoints:');
    console.log('  - /api/auth (register, login)');
    console.log('  - /api/workouts (workout tracking)');
    console.log('  - /api/meals (meal logging)');
    console.log('  - /api/ai (meal plans, health twin)');
    console.log('  - /api/supplements (supplement recommendations)');
    console.log('  - /api/leaderboards (rankings)');
    console.log('  - /api/challenges (fitness challenges)');
    console.log('  - /api/reels (progress posts)');
    console.log('  - /api/payments (payments & transactions)');
    console.log('  - /api/video (form analysis)');
    console.log('  - /api/analytics (user analytics)');
  });
}

start();

module.exports = app;
