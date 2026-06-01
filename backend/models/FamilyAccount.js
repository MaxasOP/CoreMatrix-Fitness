const mongoose = require('mongoose');

const FamilyAccountSchema = new mongoose.Schema({
  // Account owner
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner_name: { type: String },
  
  // Family info
  family_name: { type: String },
  
  // Members
  members: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    relationship: { type: String, enum: ['self', 'parent', 'spouse', 'child', 'sibling', 'other'] },
    age: Number,
    role: { type: String, enum: ['owner', 'member'] },
    joined_at: { type: Date, default: Date.now }
  }],
  
  // Subscription
  subscription_type: { type: String, enum: ['basic', 'premium', 'family'] },
  subscription_price: { type: Number },
  subscription_start_date: { type: Date },
  subscription_end_date: { type: Date },
  max_members: { type: Number }, // Based on subscription type
  
  // Shared features
  shared_features: [String], // 'leaderboards', 'challenges', 'meal_plans', 'insights'
  
  // Privacy settings
  privacy_mode: { type: String, enum: ['private', 'friends_only', 'public'], default: 'private' },
  members_can_see: {
    workouts: { type: Boolean, default: true },
    meals: { type: Boolean, default: true },
    progress: { type: Boolean, default: true },
    health_scores: { type: Boolean, default: true }
  },
  
  // Family challenges
  active_challenges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }],
  
  // Family goals
  family_goals: [{
    goal_name: String,
    description: String,
    target_date: Date,
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    progress: Number
  }],
  
  // Family insights
  family_analytics: {
    total_workouts_week: Number,
    average_calories_burned: Number,
    total_meals_logged: Number,
    active_members_today: Number,
    family_health_score: Number
  },
  
  // Invitations
  pending_invitations: [{
    email: String,
    role: String,
    invited_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    invited_at: Date,
    expires_at: Date
  }],
  
  // Billing
  payment_method: { type: String },
  billing_email: { type: String },
  
  // Notifications
  email_notifications: { type: Boolean, default: true },
  weekly_family_summary: { type: Boolean, default: true },
  
  // Status
  is_active: { type: Boolean, default: true },
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

FamilyAccountSchema.index({ owner_id: 1 });
FamilyAccountSchema.index({ 'members.user_id': 1 });

module.exports = mongoose.model('FamilyAccount', FamilyAccountSchema);
