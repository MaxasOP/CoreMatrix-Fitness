const Workout = require('../models/Workout');
const Meal = require('../models/Meal');
const mongoose = require('mongoose');

function resolveUserId(req) {
  if (req.user && req.user.id) return req.user.id;
  if (req.body && req.body.userId) return req.body.userId;
  if (req.query && req.query.userId) return req.query.userId;
  return null;
}

async function getAllWorkouts(req, res) {
  try {
    const userId = resolveUserId(req);
    // Don't expose other users' data to anonymous requests
    if (!userId) return res.json([]);
    const filter = {};
    try {
      filter.user_id = mongoose.Types.ObjectId(userId);
    } catch (e) {
      // If conversion fails, fall back to using the raw value (Mongoose will attempt casting)
      filter.user_id = userId;
    }
    const workouts = await Workout.find(filter).sort({ log_date: -1, created_at: -1 }).lean();
    res.json(workouts);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function createWorkout(req, res) {
  try {
    const userId = resolveUserId(req);
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const w = new Workout({ ...req.body, user_id: userId, log_date: req.body.date || Date.now() });
    await w.save();
    res.status(201).json(w);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function updateWorkout(req, res) {
  try {
    const { id } = req.params;
    const userId = resolveUserId(req);
    const doc = await Workout.findOneAndUpdate({ _id: id, user_id: userId }, { ...req.body, log_date: req.body.date }, { new: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function deleteWorkout(req, res) {
  try {
    const { id } = req.params;
    const userId = resolveUserId(req);
    const doc = await Workout.findOneAndDelete({ _id: id, user_id: userId });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, id: doc._id });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

// Meals
async function getAllMeals(req, res) {
  try {
    const userId = resolveUserId(req);
    // Don't expose other users' data to anonymous requests
    if (!userId) return res.json([]);
    const filter = {};
    try {
      filter.user_id = mongoose.Types.ObjectId(userId);
    } catch (e) {
      filter.user_id = userId;
    }
    const meals = await Meal.find(filter).sort({ log_date: -1, calories: -1 }).lean();
    res.json(meals);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function createMeal(req, res) {
  try {
    const userId = resolveUserId(req);
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const m = new Meal({ ...req.body, user_id: userId, log_date: req.body.date || Date.now() });
    await m.save();
    res.status(201).json(m);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function updateMeal(req, res) {
  try {
    const { id } = req.params;
    const userId = resolveUserId(req);
    const doc = await Meal.findOneAndUpdate({ _id: id, user_id: userId }, { ...req.body, log_date: req.body.date }, { new: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function deleteMeal(req, res) {
  try {
    const { id } = req.params;
    const userId = resolveUserId(req);
    const doc = await Meal.findOneAndDelete({ _id: id, user_id: userId });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, id: doc._id });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

// Daily tip
async function getDailyTip(req, res) {
  try {
    const tips = [
      'Eat protein within 45 minutes after training for maximum muscle recovery.',
      'Drinking water before meals helps control portions naturally.',
      'Complex carbs before workouts give steady energy without crashes.',
      'Healthy fats from nuts and avocado support hormone production.',
      'Sleep 7-9 hours — growth hormone is released during deep sleep.',
      'Progressive overload: add 2.5kg or 1 extra rep every week to keep growing.',
      'Track your food even on bad days — awareness creates better habits.'
    ];
    res.json({ tip: tips[new Date().getDay() % tips.length] });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

module.exports = { getAllWorkouts, createWorkout, updateWorkout, deleteWorkout, getAllMeals, createMeal, updateMeal, deleteMeal, getDailyTip };
