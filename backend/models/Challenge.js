const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
  // Challenge details
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['steps', 'yoga', 'pushups', 'fat_loss', 'muscle_gain', 'consistency'], required: true },
  image_url: { type: String },
  
  // Challenge rules
  goal: { type: Number }, // e.g., 10000 steps, 30 days yoga, 100 pushups
  goal_unit: { type: String }, // 'steps', 'days', 'reps', 'kg', 'percentage'
  duration_days: { type: Number },
  
  // Dates
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  registration_deadline: { type: Date },
  
  // Participants
  creator_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  participants_count: { type: Number, default: 0 },
  max_participants: { type: Number }, // null = unlimited
  
  // Difficulty & level
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  recommended_for: [String], // 'beginners', 'intermediate', 'advanced'
  
  // Sponsorship (optional)
  is_sponsored: { type: Boolean, default: false },
  sponsor_name: { type: String },
  sponsor_logo_url: { type: String },
  sponsor_product: { type: String },
  
  // Rewards
  reward_points_per_participant: { type: Number, default: 100 },
  reward_points_first_place: { type: Number, default: 500 },
  reward_points_second_place: { type: Number, default: 300 },
  reward_points_third_place: { type: Number, default: 200 },
  
  prize_description: { type: String }, // E.g., "Free whey protein supply for 3 months"
  
  // Leaderboard
  leaderboard: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    current_progress: Number,
    progress_percentage: Number,
    rank: Number,
    is_completed: Boolean
  }],
  
  // Visibility & status
  status: { type: String, enum: ['upcoming', 'active', 'completed', 'cancelled'], default: 'upcoming' },
  is_public: { type: Boolean, default: true },
  
  // Special settings
  allow_late_join: { type: Boolean, default: false },
  requires_verification: { type: Boolean, default: false }, // Manual verification of completion
  verification_method: { type: String }, // 'automatic', 'manual', 'photo'
  
  // Rules & guidelines
  rules: [String],
  guidelines: [String],
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

ChallengeSchema.index({ status: 1, start_date: 1 });
ChallengeSchema.index({ type: 1, difficulty: 1 });

module.exports = mongoose.model('Challenge', ChallengeSchema);
