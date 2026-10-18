const Workout = require('../models/Workout');
const Meal = require('../models/Meal');
const mongoose = require('mongoose');



async function getAllWorkouts(req, res) {
  try {
    const userId = req.user.id;
    const filter = {};
    try {
      filter.user_id = new mongoose.Types.ObjectId(userId);
    } catch (e) {
      filter.user_id = userId;
    }
    const workouts = await Workout.find(filter).sort({ log_date: -1, created_at: -1 }).lean();
    res.json(workouts);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function createWorkout(req, res) {
  try {
    const userId = req.user.id;
    const workoutData = {
      ...req.body,
      category: req.body.category || 'General',
      user_id: userId,
      log_date: req.body.date || req.body.log_date || Date.now()
    };
    const w = new Workout(workoutData);
    await w.save();
    res.status(201).json(w);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function updateWorkout(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = { ...req.body };
    if (req.body.date || req.body.log_date) {
      updateData.log_date = req.body.date || req.body.log_date;
    }
    const doc = await Workout.findOneAndUpdate({ _id: id, user_id: userId }, updateData, { new: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function deleteWorkout(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const doc = await Workout.findOneAndDelete({ _id: id, user_id: userId });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, id: doc._id });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

// Meals
async function getAllMeals(req, res) {
  try {
    const userId = req.user.id;
    const filter = {};
    try {
      filter.user_id = new mongoose.Types.ObjectId(userId);
    } catch (e) {
      filter.user_id = userId;
    }
    const meals = await Meal.find(filter).sort({ log_date: -1, calories: -1 }).lean();
    res.json(meals);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function createMeal(req, res) {
  try {
    const userId = req.user.id;
    const mealData = { ...req.body };
    if (mealData.protein_g !== undefined && mealData.protein === undefined) mealData.protein = mealData.protein_g;
    if (mealData.carbs_g !== undefined && mealData.carbs === undefined) mealData.carbs = mealData.carbs_g;
    if (mealData.fat_g !== undefined && mealData.fat === undefined) mealData.fat = mealData.fat_g;
    if (typeof mealData.type === 'string') mealData.type = mealData.type.toLowerCase();
    mealData.user_id = userId;
    mealData.log_date = req.body.date || req.body.log_date || Date.now();
    const m = new Meal(mealData);
    await m.save();
    res.status(201).json(m);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function updateMeal(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const mealData = { ...req.body };
    if (mealData.protein_g !== undefined && mealData.protein === undefined) mealData.protein = mealData.protein_g;
    if (mealData.carbs_g !== undefined && mealData.carbs === undefined) mealData.carbs = mealData.carbs_g;
    if (mealData.fat_g !== undefined && mealData.fat === undefined) mealData.fat = mealData.fat_g;
    if (typeof mealData.type === 'string') mealData.type = mealData.type.toLowerCase();
    if (req.body.date || req.body.log_date) {
      mealData.log_date = req.body.date || req.body.log_date;
    }
    const doc = await Meal.findOneAndUpdate({ _id: id, user_id: userId }, mealData, { new: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function deleteMeal(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
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
