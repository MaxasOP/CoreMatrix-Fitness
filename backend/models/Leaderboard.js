const mongoose = require('mongoose');

const LeaderboardSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  profile_picture: { type: String },
  
  // Leaderboard type & scope
  category: { type: String, enum: ['fat_loss', 'muscle_gain', 'most_consistent', 'longest_streak', 'most_active'], required: true },
  scope: { type: String, enum: ['national', 'city', 'college', 'company'], required: true },
  
  // Location/org identifier
  city: { type: String }, // For city-level leaderboards
  college_name: { type: String }, // For college leaderboards
  company_name: { type: String }, // For company leaderboards
  
  // Ranking
  rank: { type: Number },
  score: { type: Number }, // Points/value used for ranking
  
  // Category-specific metrics
  metrics: {
    // For fat_loss
    weight_lost_kg: { type: Number },
    weight_lost_percentage: { type: Number },
    
    // For muscle_gain
    muscle_gained_kg: { type: Number },
    body_fat_reduction: { type: Number },
    
    // For most_consistent
    workout_days_count: { type: Number },
    consistency_percentage: { type: Number },
    
    // For longest_streak
    current_streak_days: { type: Number },
    max_streak_days: { type: Number },
    
    // For most_active
    workouts_count: { type: Number },
    calories_burned: { type: Number },
    avg_workouts_per_week: { type: Number }
  },
  
  // Period
  period: { type: String, enum: ['weekly', 'monthly', 'all_time'], default: 'monthly' },
  period_start: { type: Date },
  period_end: { type: Date },
  
  // Rewards/badges
  badge: { type: String }, // 'gold', 'silver', 'bronze', etc.
  reward_points: { type: Number, default: 0 },
  
  // For historical tracking
  is_current: { type: Boolean, default: true },
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Index for efficient queries
LeaderboardSchema.index({ category: 1, scope: 1, period: 1, rank: 1 });
LeaderboardSchema.index({ user_id: 1, category: 1, scope: 1 });
LeaderboardSchema.index({ city: 1, category: 1 });

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);
