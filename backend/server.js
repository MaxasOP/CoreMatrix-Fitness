const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const authRoutes = require('./routes/auth');
const fitnessRoutes = require('./routes/fitness');
const { authOptional } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// API
// Attach optional auth (reads JWT if present and sets req.user)
app.use(authOptional);

app.use('/api/auth', authRoutes);
app.use('/api', fitnessRoutes);

// Health
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'CoreMatrix MERN backend running' }));

// Serve React client build in production if present
const clientBuildPath = path.join(__dirname, 'client', 'build');
if (process.env.NODE_ENV === 'production' && fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  // Serve a simple message at root in non-production
  app.get('/', (req, res) => res.send('CoreMatrix MERN backend'));
}

async function start() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/corematrix';
  try {
    await mongoose.connect(mongoUri, { autoIndex: true });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`CoreMatrix backend listening on http://localhost:${PORT}`);
  });
}

start();

module.exports = app;
