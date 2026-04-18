// ============================================================
//  COREMATRIX — backend/fitnessLogic.js
//  Phase 3 Module #3: Fitness Business Logic
//  All workout + meal CRUD with ORDER BY (the "+" factor)
//  Every function wrapped in try/catch — Ironclad Error Handling
// ============================================================

const db = require('./dbConfig');

// ---- Default user_id for single-user mode (kept as a fallback) ----
const DEFAULT_USER = 1;

function resolveUserId(req) {
  var userId = req.body && req.body.userId != null ? req.body.userId : req.query && req.query.userId;
  var parsed = parseInt(userId, 10);
  return Number.isInteger(parsed) ? parsed : DEFAULT_USER;
}

// ============================================================
//  WORKOUTS
// ============================================================

// READ: Get all workouts — ORDER BY log_date DESC, then name ASC
// The "+" Factor: ORDER BY ensures latest workouts appear first
async function getAllWorkouts(req, res) {
  try {
    const userId = resolveUserId(req);

    const workouts = await db.query(
      `SELECT id, name, category, sets, reps, weight, intensity,
              DATE_FORMAT(log_date, '%Y-%m-%d') AS date
       FROM   workouts
       WHERE  user_id = ?
       ORDER  BY log_date DESC, created_at DESC`,  // ORDER BY = "+" factor
      [userId]
    );

    res.json(workouts);

  } catch (err) {
    console.error('getAllWorkouts error:', err.message);
    res.status(500).json({ error: 'Failed to fetch workouts', details: err.message });
  }
}

// CREATE: Log a new workout session
async function createWorkout(req, res) {
  try {
    const { name, category, sets, reps, weight, intensity, userId, date } = req.body;

    // Input validation
    if (!name || !category) {
      return res.status(400).json({ error: 'Workout name and category are required' });
    }

    const resolvedUserId = parseInt(userId, 10) || DEFAULT_USER;
    const logDate = date || new Date().toISOString().split('T')[0];

    const result = await db.query(
      `INSERT INTO workouts (user_id, name, category, sets, reps, weight, intensity, log_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resolvedUserId,
        name.trim(),
        category,
        parseInt(sets)     || 3,
        parseInt(reps)     || 10,
        parseFloat(weight) || 0,
        intensity || 'medium',
        logDate
      ]
    );

    // Return the newly created workout with its ID
    res.status(201).json({
      id:        result.insertId,
      name,
      category,
      sets,
      reps,
      weight,
      intensity,
      date:      logDate,
      userId:    resolvedUserId,
      message:   'Workout logged! '
    });

  } catch (err) {
    console.error('createWorkout error:', err.message);
    res.status(500).json({ error: 'Failed to log workout', details: err.message });
  }
}

// UPDATE: Modify an existing workout (e.g., update goals or correct a log)
async function updateWorkout(req, res) {
  try {
    const { id }    = req.params;
    const { name, category, sets, reps, weight, intensity, date, userId } = req.body;
    const resolvedUserId = parseInt(userId, 10) || DEFAULT_USER;

    if (!id) return res.status(400).json({ error: 'Workout ID is required' });

    // Check workout exists before updating
    const existing = await db.query('SELECT id FROM workouts WHERE id = ? AND user_id = ?', [id, resolvedUserId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: `Workout #${id} not found for this user` });
    }

    await db.query(
      `UPDATE workouts
       SET name = ?, category = ?, sets = ?, reps = ?, weight = ?, intensity = ?, log_date = ?
       WHERE id = ? AND user_id = ?`,
      [name, category, sets, reps, weight, intensity, date || new Date().toISOString().split('T')[0], id, resolvedUserId]
    );

    res.json({ message: 'Workout updated ', id: parseInt(id, 10), userId: resolvedUserId });

  } catch (err) {
    console.error('updateWorkout error:', err.message);
    res.status(500).json({ error: 'Failed to update workout', details: err.message });
  }
}

// DELETE: Remove a workout log
async function deleteWorkout(req, res) {
  try {
    const { id } = req.params;
    const userId = resolveUserId(req);
    if (!id) return res.status(400).json({ error: 'Workout ID is required' });

    const existing = await db.query('SELECT id FROM workouts WHERE id = ? AND user_id = ?', [id, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: `Workout #${id} not found for this user` });
    }

    await db.query('DELETE FROM workouts WHERE id = ? AND user_id = ?', [id, userId]);

    res.json({ message: 'Workout deleted 🗑️', id: parseInt(id, 10), userId });

  } catch (err) {
    console.error('deleteWorkout error:', err.message);
    res.status(500).json({ error: 'Failed to delete workout', details: err.message });
  }
}

// ============================================================
//  MEALS
// ============================================================

// READ: Get all meals — ORDER BY log_date DESC, calories DESC
async function getAllMeals(req, res) {
  try {
    const userId = resolveUserId(req);

    const meals = await db.query(
      `SELECT id, name, type, calories, protein, carbs, fat,
              DATE_FORMAT(log_date, '%Y-%m-%d') AS date
       FROM   meals
       WHERE  user_id = ?
       ORDER  BY log_date DESC, calories DESC`,  // ORDER BY = "+" factor
      [userId]
    );

    res.json(meals);

  } catch (err) {
    console.error('getAllMeals error:', err.message);
    res.status(500).json({ error: 'Failed to fetch meals', details: err.message });
  }
}

// CREATE: Log a new meal
async function createMeal(req, res) {
  try {
    const { name, type, calories, protein, carbs, fat, userId, date } = req.body;

    if (!name) return res.status(400).json({ error: 'Meal name is required' });

    const resolvedUserId = parseInt(userId, 10) || DEFAULT_USER;
    const logDate = date || new Date().toISOString().split('T')[0];

    const result = await db.query(
      `INSERT INTO meals (user_id, name, type, calories, protein, carbs, fat, log_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resolvedUserId,
        name.trim(),
        type     || 'Meal',
        parseInt(calories) || 0,
        parseFloat(protein) || 0,
        parseFloat(carbs)   || 0,
        parseFloat(fat)     || 0,
        logDate
      ]
    );

    res.status(201).json({
      id:      result.insertId,
      name, type, calories, protein, carbs, fat,
      date:    logDate,
      userId:  resolvedUserId,
      message: 'Meal logged! '
    });

  } catch (err) {
    console.error('createMeal error:', err.message);
    res.status(500).json({ error: 'Failed to log meal', details: err.message });
  }
}

// UPDATE: Modify an existing meal log
async function updateMeal(req, res) {
  try {
    const { id } = req.params;
    const { name, type, calories, protein, carbs, fat, date, userId } = req.body;
    const resolvedUserId = parseInt(userId, 10) || DEFAULT_USER;

    if (!id) return res.status(400).json({ error: 'Meal ID is required' });

    const existing = await db.query('SELECT id FROM meals WHERE id = ? AND user_id = ?', [id, resolvedUserId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: `Meal #${id} not found for this user` });
    }

    await db.query(
      `UPDATE meals
       SET name = ?, type = ?, calories = ?, protein = ?, carbs = ?, fat = ?, log_date = ?
       WHERE id = ? AND user_id = ?`,
      [name, type, calories, protein, carbs, fat, date || new Date().toISOString().split('T')[0], id, resolvedUserId]
    );

    res.json({ message: 'Meal updated ', id: parseInt(id, 10), userId: resolvedUserId });
  } catch (err) {
    console.error('updateMeal error:', err.message);
    res.status(500).json({ error: 'Failed to update meal', details: err.message });
  }
}

// DELETE: Remove a meal log
async function deleteMeal(req, res) {
  try {
    const { id } = req.params;
    const userId = resolveUserId(req);
    if (!id) return res.status(400).json({ error: 'Meal ID is required' });

    const existing = await db.query('SELECT id FROM meals WHERE id = ? AND user_id = ?', [id, userId]);
    if (existing.length === 0) {
      return res.status(404).json({ error: `Meal #${id} not found for this user` });
    }

    await db.query('DELETE FROM meals WHERE id = ? AND user_id = ?', [id, userId]);

    res.json({ message: 'Meal deleted ', id: parseInt(id, 10), userId });

  } catch (err) {
    console.error('deleteMeal error:', err.message);
    res.status(500).json({ error: 'Failed to delete meal', details: err.message });
  }
}

// ============================================================
//  DAILY TIP — bonus endpoint
// ============================================================
async function getDailyTip(req, res) {
  try {
    const tips = [
      'Eat protein within 45 minutes after training for maximum muscle recovery.',
      'Drinking water before meals helps control portions naturally.',
      'Complex carbs before workouts give steady energy without crashes.',
      'Healthy fats from nuts and avocado support hormone production.',
      'Sleep 7-9 hours — growth hormone is released during deep sleep.',
      'Progressive overload: add 2.5kg or 1 extra rep every week to keep growing.',
      'Track your food even on bad days — awareness creates better habits.',
    ];
    const tip = tips[new Date().getDay() % tips.length]; // Different tip each day of week
    res.json({ tip });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch tip', details: err.message });
  }
}

module.exports = {
  getAllWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getAllMeals,
  createMeal,
  updateMeal,
  deleteMeal,
  getDailyTip,
};
