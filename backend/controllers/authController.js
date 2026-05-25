const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

function calculateProfileMetrics(input) {
  const weightKg = Number(input.weightKg) || null;
  const heightCm = Number(input.heightCm) || null;
  const ageYears = Number(input.ageYears) || null;
  const activityLevel = (input.activityLevel || 'moderate').toLowerCase();
  const goal = (input.goal || 'Build Muscle').toLowerCase();

  const activityMultipliers = { sedentary:1.2, light:1.375, moderate:1.55, high:1.725, athlete:1.9 };
  const goalMultipliers = { 'build muscle':1.12, 'cut fat':0.88, 'improve endurance':1.0, 'general fitness':1.0 };
  const proteinPerKg = { 'build muscle':2.0, 'cut fat':2.2, 'improve endurance':1.6, 'general fitness':1.8 };
  const targetWeightFactor = { 'build muscle':1.05, 'cut fat':0.95, 'improve endurance':1.0, 'general fitness':1.0 };

  const bmi = weightKg && heightCm ? weightKg / Math.pow(heightCm/100,2) : null;
  const calorieGoal = weightKg ? Math.round(weightKg * 24 * (activityMultipliers[activityLevel] || 1.55) * (goalMultipliers[goal] || 1.0)) : null;
  const proteinGoal = weightKg ? Math.round(weightKg * (proteinPerKg[goal] || 1.8)) : null;
  const targetWeight = weightKg ? Math.round((weightKg * (targetWeightFactor[goal] || 1.0)) * 10) / 10 : null;

  return { weight_kg: weightKg, height_cm: heightCm, age_years: ageYears, activity_level: activityLevel, bmi, calorie_goal: calorieGoal, protein_goal: proteinGoal, target_weight: targetWeight };
}

async function register(req, res) {
  try {
    const { name, email, password, goal, weightKg, heightCm, ageYears, activityLevel } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing required fields' });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const profile = calculateProfileMetrics({ weightKg, heightCm, ageYears, activityLevel, goal });

    const user = new User({ name: name.trim(), email: email.toLowerCase().trim(), password: hashed, goal: goal || 'Build Muscle', ...profile });
    await user.save();

    const token = jwt.sign({ sub: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ message: 'Account created', userId: user._id, name: user.name, goal: user.goal, weight: user.weight_kg, height: user.height_cm, age: user.age_years, activityLevel: user.activity_level, bmi: user.bmi, calorieGoal: user.calorie_goal, proteinGoal: user.protein_goal, targetWeight: user.target_weight, token });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ sub: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ message: 'Login successful', userId: user._id, name: user.name, email: user.email, goal: user.goal, weight: user.weight_kg, height: user.height_cm, age: user.age_years, activityLevel: user.activity_level, bmi: user.bmi, calorieGoal: user.calorie_goal, proteinGoal: user.protein_goal, targetWeight: user.target_weight, token });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { goal, weightKg, heightCm, ageYears, activityLevel } = req.body || {};
    const input = {
      goal: goal || user.goal,
      weightKg: weightKg ?? user.weight_kg,
      heightCm: heightCm ?? user.height_cm,
      ageYears: ageYears ?? user.age_years,
      activityLevel: activityLevel || user.activity_level
    };

    const profile = calculateProfileMetrics(input);

    user.goal = goal || user.goal || 'Build Muscle';
    user.weight_kg = profile.weight_kg;
    user.height_cm = profile.height_cm;
    user.age_years = profile.age_years;
    user.activity_level = profile.activity_level;
    user.bmi = profile.bmi;
    user.calorie_goal = profile.calorie_goal;
    user.protein_goal = profile.protein_goal;
    user.target_weight = profile.target_weight;

    await user.save();

    res.json({
      message: 'Profile updated',
      userId: user._id,
      name: user.name,
      email: user.email,
      goal: user.goal,
      weight: user.weight_kg,
      height: user.height_cm,
      age: user.age_years,
      activityLevel: user.activity_level,
      bmi: user.bmi,
      calorieGoal: user.calorie_goal,
      proteinGoal: user.protein_goal,
      targetWeight: user.target_weight
    });
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ error: 'Profile update failed', details: err.message });
  }
}

module.exports = { register, login, updateProfile };
