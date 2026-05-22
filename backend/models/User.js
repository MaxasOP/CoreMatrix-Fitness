const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  goal: { type: String, default: 'Build Muscle' },
  weight_kg: { type: Number },
  height_cm: { type: Number },
  age_years: { type: Number },
  activity_level: { type: String, default: 'moderate' },
  bmi: { type: Number },
  calorie_goal: { type: Number },
  protein_goal: { type: Number },
  target_weight: { type: Number },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
