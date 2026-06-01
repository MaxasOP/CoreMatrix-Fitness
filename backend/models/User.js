const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String },
  profile_picture: { type: String },
  
  // Physical attributes
  goal: { type: String, default: 'Build Muscle', enum: ['Build Muscle', 'Lose Weight', 'Improve Health', 'Learn Yoga', 'Fix Posture'] },
  weight_kg: { type: Number },
  height_cm: { type: Number },
  age_years: { type: Number },
  activity_level: { type: String, default: 'moderate', enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'] },
  bmi: { type: Number },
  calorie_goal: { type: Number },
  protein_goal: { type: Number },
  target_weight: { type: Number },
  
  // Nutrition & preferences
  diet_preference: { type: String, enum: ['vegetarian', 'non-vegetarian', 'vegan', 'jain'], default: 'vegetarian' },
  budget_monthly: { type: Number }, // Monthly food budget
  dietary_restrictions: [String], // allergies, intolerances
  
  // Location & localization
  city: { type: String },
  state: { type: String },
  country: { type: String, default: 'India' },
  timezone: { type: String },
  language: { type: String, enum: ['en', 'hi', 'mr', 'ta', 'te', 'bn'], default: 'en' },
  
  // Family account
  family_account_id: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyAccount' },
  relationship: { type: String, enum: ['self', 'parent', 'spouse', 'child'] },
  
  // Health Twin scores
  health_scores: {
    fitness_age: { type: Number },
    strength_score: { type: Number },
    recovery_score: { type: Number },
    mobility_score: { type: Number },
    nutrition_score: { type: Number },
    consistency_score: { type: Number },
    overall_health_score: { type: Number },
    last_updated: { type: Date }
  },
  
  // Streaks & achievements
  current_workout_streak: { type: Number, default: 0 },
  current_meal_log_streak: { type: Number, default: 0 },
  current_yoga_streak: { type: Number, default: 0 },
  longest_workout_streak: { type: Number, default: 0 },
  
  // College & Company (for leaderboards)
  college_name: { type: String },
  company_name: { type: String },
  
  // Wallet
  wallet_points: { type: Number, default: 0 },
  
  // Preferences
  notifications_enabled: { type: Boolean, default: true },
  newsletter: { type: Boolean, default: true },
  
  // Account status
  is_trainer: { type: Boolean, default: false },
  is_verified: { type: Boolean, default: false },
  verification_code: { type: String },
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
