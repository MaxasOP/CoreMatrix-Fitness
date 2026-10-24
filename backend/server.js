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
let databaseStatus = 'connecting';

// Initialize Socket.io
const socketService = new SocketService(server);

// Security headers
app.use(helmet());
const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true,
  credentials: process.env.CORS_CREDENTIALS === 'true',
}));
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
  version: '0.2.0',
  database: databaseStatus,
}));

app.get('/api/ready', (req, res) => {
  const ready = databaseStatus === 'connected';
  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not_ready', database: databaseStatus });
});

// Serve React client build in production if index.html is present
const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
const clientIndexPath = path.join(clientBuildPath, 'index.html');

if (process.env.NODE_ENV === 'production' && fs.existsSync(clientIndexPath)) {
  console.log('Client build found. Serving static files from:', clientBuildPath);
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(clientIndexPath);
  });
} else {
  // Backend running in API-only mode
  app.get('/', (req, res) => res.json({
    status: 'ok',
    message: 'CoreMatrix MERN Backend API running',
    version: '0.2.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      workouts: '/api/workouts',
      meals: '/api/meals'
    }
  }));
}

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err); // Log the error for debugging
  // Check if headers have already been sent to prevent errors
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.statusCode || 500).json({
    message: err.message || 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack // Send stack trace in development
  });
});

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
    if (!process.env.PYTHON_SERVICE_URL) {
      console.error('PYTHON_SERVICE_URL is required in production (python video analysis service endpoint)');
      process.exit(1);
    }
  }

  server.listen(PORT, () => {
    console.log(`CoreMatrix backend listening on http://localhost:${PORT}`);
    console.log('🚀 WebSocket server active (Socket.io)');
  });

  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/corematrix';
  try {
    await mongoose.connect(mongoUri, { autoIndex: true, serverSelectionTimeoutMS: 10000 });
    databaseStatus = 'connected';
    console.log('MongoDB connected');
  } catch (err) {
    databaseStatus = 'disconnected';
    console.error('MongoDB connection error:', err.message);
  }
}

if (require.main === module) start();

module.exports = { app, server, start };
