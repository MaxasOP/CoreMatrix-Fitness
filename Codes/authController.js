// ============================================================
//  COREMATRIX — backend/authController.js
//  Phase 3 Module #2: Authentication Controller
//  Handles user register + login with graceful error handling
// ============================================================

const db     = require('./dbConfig');
const crypto = require('crypto');  // Node.js built-in module for hashing

// Simple password hash using Node's built-in crypto (no bcrypt dependency needed)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'corematrix_salt').digest('hex');
}

function toNumber(value) {
  var parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toInteger(value) {
  var parsed = parseInt(value, 10);
  return Number.isInteger(parsed) ? parsed : null;
}

function calculateProfileMetrics(input) {
  var weightKg = toNumber(input.weightKg);
  var heightCm = toNumber(input.heightCm);
  var ageYears = toInteger(input.ageYears);
  var activityLevel = (input.activityLevel || 'moderate').toLowerCase();
  var goal = (input.goal || 'Build Muscle').toLowerCase();

  var activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    high: 1.725,
    athlete: 1.9
  };

  var goalMultipliers = {
    'build muscle': 1.12,
    'cut fat': 0.88,
    'improve endurance': 1.0,
    'general fitness': 1.0
  };

  var proteinPerKg = {
    'build muscle': 2.0,
    'cut fat': 2.2,
    'improve endurance': 1.6,
    'general fitness': 1.8
  };

  var targetWeightFactor = {
    'build muscle': 1.05,
    'cut fat': 0.95,
    'improve endurance': 1.0,
    'general fitness': 1.0
  };

  var bmi = weightKg && heightCm ? weightKg / Math.pow(heightCm / 100, 2) : null;
  var calorieGoal = weightKg
    ? Math.round(weightKg * 24 * (activityMultipliers[activityLevel] || 1.55) * (goalMultipliers[goal] || 1.0))
    : null;
  var proteinGoal = weightKg
    ? Math.round(weightKg * (proteinPerKg[goal] || 1.8))
    : null;
  var targetWeight = weightKg
    ? Math.round((weightKg * (targetWeightFactor[goal] || 1.0)) * 10) / 10
    : null;

  return {
    weightKg: weightKg,
    heightCm: heightCm,
    ageYears: ageYears,
    activityLevel: activityLevel,
    bmi: bmi ? Math.round(bmi * 10) / 10 : null,
    calorieGoal: calorieGoal,
    proteinGoal: proteinGoal,
    targetWeight: targetWeight
  };
}

// ============================================================
//  REGISTER — Create a new user
//  POST /api/auth/register
//  Body: { name, email, password, goal }
// ============================================================
async function register(req, res) {
  try {
    const { name, email, password, goal, weightKg, heightCm, ageYears, activityLevel } = req.body;

    // Validate required fields
    if (!name || !email || !password || !weightKg || !heightCm || !ageYears || !activityLevel) {
      return res.status(400).json({
        error: 'Missing required fields: name, email, password, weightKg, heightCm, ageYears, activityLevel'
      });
    }

    var emailValue = email.toLowerCase().trim();
    if (!/^\S+@\S+\.\S+$/.test(emailValue)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    if ((password || '').length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check if user already exists
    const existing = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [emailValue]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password before storing
    const hashed = hashPassword(password);
    const profile = calculateProfileMetrics({ weightKg, heightCm, ageYears, activityLevel, goal });

    // INSERT new user
    const result = await db.query(
      `INSERT INTO users (
        name, email, password, goal,
        weight_kg, height_cm, age_years, activity_level,
        bmi, calorie_goal, protein_goal, target_weight
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        emailValue,
        hashed,
        goal || 'Build Muscle',
        profile.weightKg,
        profile.heightCm,
        profile.ageYears,
        profile.activityLevel,
        profile.bmi,
        profile.calorieGoal,
        profile.proteinGoal,
        profile.targetWeight
      ]
    );

    // Return success (never send password back)
    res.status(201).json({
      message: 'Account created successfully! 🎉',
      userId:  result.insertId,
      name:    name.trim(),
      goal:    goal || 'Build Muscle',
      weight:  profile.weightKg,
      height:  profile.heightCm,
      age:     profile.ageYears,
      activityLevel: profile.activityLevel,
      bmi:     profile.bmi,
      calorieGoal: profile.calorieGoal,
      proteinGoal: profile.proteinGoal,
      targetWeight: profile.targetWeight
    });

  } catch (err) {
    // Ironclad error handling — never crash, always respond
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
}

// ============================================================
//  LOGIN — Verify credentials
//  POST /api/auth/login
//  Body: { email, password }
// ============================================================
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const users = await db.query(
      `SELECT id, name, email, goal,
              weight_kg, height_cm, age_years, activity_level,
              bmi, calorie_goal, protein_goal, target_weight
       FROM users WHERE email = ? AND password = ?`,
      [email.toLowerCase().trim(), hashPassword(password)]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // In production: generate a JWT token here
    // For now: return user info (simple session)
    res.json({
      message:  'Login successful 💪',
      userId:   user.id,
      name:     user.name,
      email:    user.email,
      goal:     user.goal,
      weight:   user.weight_kg,
      height:   user.height_cm,
      age:      user.age_years,
      activityLevel: user.activity_level,
      bmi:      user.bmi,
      calorieGoal: user.calorie_goal,
      proteinGoal:  user.protein_goal,
      targetWeight: user.target_weight,
      token:    `cm_${user.id}_${Date.now()}` // Simplified token; use JWT in production
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
}

module.exports = { register, login };
