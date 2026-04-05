// ============================================================
//  COREMATRIX — server.js
//  Phase 3: Node.js Backend — Main Entry Point
//  Modules: Express, CORS, routes wired to separate controllers
// ============================================================

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const mysql      = require('mysql2/promise');
const https      = require('https');
const fs         = require('fs');

// ---- Import our custom modules (Phase 3: Module Architecture) ----
const dbConfig       = require('./dbConfig');
const authController = require('./authController');
const fitnessLogic   = require('./fitnessLogic');

const app  = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(cors());                          // Allow frontend to talk to backend
app.use(express.json());                  // Parse JSON request bodies
app.use(express.static(path.join(__dirname)));  // Serve frontend files

// ============================================================
//  Proxy CDN requests to avoid Tracking Prevention issues
// ============================================================
app.get('/angular.js', (req, res) => {
  const filePath = path.join(__dirname, 'angular.min.js');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    // Fetch from CDN and cache locally
    https.get('https://ajax.googleapis.com/ajax/libs/angularjs/1.8.3/angular.min.js', (response) => {
      const fileStream = fs.createWriteStream(filePath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        res.sendFile(filePath);
      });
    }).on('error', (err) => {
      res.status(500).send('Error downloading AngularJS');
    });
  }
});

app.get('/angular-route.js', (req, res) => {
  const filePath = path.join(__dirname, 'angular-route.min.js');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    // Fetch from CDN and cache locally
    https.get('https://ajax.googleapis.com/ajax/libs/angularjs/1.8.3/angular-route.min.js', (response) => {
      const fileStream = fs.createWriteStream(filePath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        res.sendFile(filePath);
      });
    }).on('error', (err) => {
      res.status(500).send('Error downloading AngularJS Route');
    });
  }
});

// ============================================================
//  DATABASE SETUP - Create database and tables if not exist
// ============================================================
async function setupDatabase() {
  try {
    // First connect without database to create it
    const tempConn = await mysql.createConnection({
      host:     process.env.DB_HOST     || 'localhost',
      user:     process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || 'root',
      port:     process.env.DB_PORT     || 3306
    });
    
    // Create database if not exists
    await tempConn.query('CREATE DATABASE IF NOT EXISTS corematrix_db');
    console.log(' Database "corematrix_db" ready');
    
    await tempConn.end();
    
    // Now initialize tables
    await dbConfig.initializeTables();
    console.log(' All tables initialized');
    
  } catch (err) {
    console.error(' Database setup failed:', err.message);
  }
}

// ============================================================
//  API ROUTES
// ============================================================

// ---- Health check ----
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CoreMatrix backend is running ' });
});

// ---- Auth routes ----
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login',    authController.login);

// ---- Workout CRUD routes ----
app.get   ('/api/workouts',     fitnessLogic.getAllWorkouts);
app.post  ('/api/workouts',     fitnessLogic.createWorkout);
app.put   ('/api/workouts/:id', fitnessLogic.updateWorkout);
app.delete('/api/workouts/:id', fitnessLogic.deleteWorkout);

// ---- Meal CRUD routes ----
app.get   ('/api/meals',     fitnessLogic.getAllMeals);
app.post  ('/api/meals',     fitnessLogic.createMeal);
app.put   ('/api/meals/:id', fitnessLogic.updateMeal);
app.delete('/api/meals/:id', fitnessLogic.deleteMeal);

// ---- Daily tip route ----
app.get('/api/tip', fitnessLogic.getDailyTip);

// ============================================================
//  GLOBAL ERROR HANDLER (catch anything that slips through)
// ============================================================
app.use((err, req, res, next) => {
  console.error(' Unhandled Error:', err.message);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// ============================================================
//  SPA FALLBACK - Serve index.html for client-side routing
// This must come AFTER all other routes (API and static files)
// Using Express 5 compatible path pattern
// ============================================================
app.use(function(req, res, next) {
  const wantsHtml = (req.headers.accept || '').includes('text/html');

  // Only serve index.html for HTML page requests, not for API calls
  if (!req.path.startsWith('/api') && wantsHtml) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else if (!req.path.startsWith('/api')) {
    res.status(404).send('Not found');
  } else {
    // API route not found
    res.status(404).json({ error: 'Route not found', path: req.path });
  }
});

// ============================================================
//  START SERVER
// ============================================================
async function startServer() {
  // Setup database first
  await setupDatabase();
  
  // Test connection
  await dbConfig.testConnection();
  
  // Start listening
  app.listen(PORT, () => {
    console.log(`\n⬡  CoreMatrix Backend running at http://localhost:${PORT}`);
    console.log(`   Open http://localhost:${PORT} in your browser\n`);
  });
}

startServer();

module.exports = app;
