// ============================================================
//  COREMATRIX — backend/dbConfig.js
//  Phase 3 Module #1: Database Configuration
//  Handles MySQL connection pool and exports a query helper
// ============================================================

const mysql = require('mysql2/promise');

// ---- Connection Pool (more efficient than single connection) ----
// In production, replace these with environment variables (.env file)
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME     || 'corematrix_db',
  port:     process.env.DB_PORT     || 3306,
  waitForConnections: true,
  connectionLimit:    10,    // max 10 concurrent connections
  queueLimit:         0
});

// ---- Generic query helper with error handling ----
// Every query goes through this — so errors are always caught
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    console.error(' Database query error:', err.message);
    console.error('   SQL:', sql);
    throw new Error('Database error: ' + err.message);
  }
}

// ---- Test connection on startup ----
async function testConnection() {
  try {
    await pool.query('SELECT 1');
    console.log(' MySQL connected successfully');
  } catch (err) {
    console.warn('  MySQL not available — app running in local fallback mode');
    console.warn('   To connect: update DB credentials in backend/dbConfig.js');
  }
}

// ---- SQL to create tables (run once to set up fresh database) ----
async function initializeTables() {
  try {
    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        name       VARCHAR(100) NOT NULL,
        email      VARCHAR(150) UNIQUE NOT NULL,
        password   VARCHAR(255) NOT NULL,
        goal       VARCHAR(100) DEFAULT 'Build Muscle',
        weight_kg  FLOAT DEFAULT NULL,
        height_cm  FLOAT DEFAULT NULL,
        age_years  INT DEFAULT NULL,
        activity_level VARCHAR(20) DEFAULT 'moderate',
        bmi        FLOAT DEFAULT NULL,
        calorie_goal INT DEFAULT NULL,
        protein_goal  INT DEFAULT NULL,
        target_weight FLOAT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const userColumns = [
      "weight_kg FLOAT DEFAULT NULL",
      "height_cm FLOAT DEFAULT NULL",
      "age_years INT DEFAULT NULL",
      "activity_level VARCHAR(20) DEFAULT 'moderate'",
      "bmi FLOAT DEFAULT NULL",
      "calorie_goal INT DEFAULT NULL",
      "protein_goal INT DEFAULT NULL",
      "target_weight FLOAT DEFAULT NULL"
    ];

    for (const columnDefinition of userColumns) {
      const columnName = columnDefinition.split(' ')[0];
      const existingColumn = await query(`SHOW COLUMNS FROM users LIKE '${columnName}'`);
      if (existingColumn.length === 0) {
        await query(`ALTER TABLE users ADD COLUMN ${columnDefinition}`);
      }
    }

    // Workouts table
    await query(`
      CREATE TABLE IF NOT EXISTS workouts (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        user_id    INT NOT NULL,
        name       VARCHAR(150) NOT NULL,
        category   VARCHAR(50)  NOT NULL,
        sets       INT NOT NULL DEFAULT 3,
        reps       INT NOT NULL DEFAULT 10,
        weight     FLOAT DEFAULT 0,
        intensity  ENUM('low','medium','high') DEFAULT 'medium',
        log_date   DATE DEFAULT (CURRENT_DATE),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Meals table
    await query(`
      CREATE TABLE IF NOT EXISTS meals (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        user_id    INT NOT NULL,
        name       VARCHAR(150) NOT NULL,
        type       VARCHAR(50)  DEFAULT 'Lunch',
        calories   INT DEFAULT 0,
        protein    FLOAT DEFAULT 0,
        carbs      FLOAT DEFAULT 0,
        fat        FLOAT DEFAULT 0,
        log_date   DATE DEFAULT (CURRENT_DATE),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log(' Database tables initialized');
  } catch (err) {
    console.error(' Table initialization failed:', err.message);
  }
}

module.exports = { pool, query, testConnection, initializeTables };
