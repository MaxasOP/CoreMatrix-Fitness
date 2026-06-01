const mongoose = require('mongoose');

const FitnessWalletSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  // Points
  total_points: { type: Number, default: 0 },
  available_points: { type: Number, default: 0 }, // Points that can be redeemed
  locked_points: { type: Number, default: 0 }, // Points in pending redemptions
  
  // Transaction history
  transactions: [{
    type: { type: String, enum: ['earned', 'redeemed', 'expired', 'bonus'] },
    amount: Number,
    description: String,
    reference_id: String, // Workout ID, meal log ID, challenge ID, etc.
    reference_type: { type: String }, // 'workout', 'meal_log', 'challenge', 'streak', 'referral'
    created_at: { type: Date, default: Date.now }
  }],
  
  // Point earning rules
  earning_rules: {
    per_workout: { type: Number, default: 10 }, // Points per workout
    per_meal_log: { type: Number, default: 2 }, // Points per meal logged
    per_streak_day: { type: Number, default: 5 }, // Points per day of streak
    challenge_completion: { type: Number, default: 50 }, // Points for completing a challenge
    challenge_first_place: { type: Number, default: 500 },
    challenge_second_place: { type: Number, default: 300 },
    challenge_third_place: { type: Number, default: 200 },
    first_workout: { type: Number, default: 50 }, // Bonus for first workout
    referral_bonus: { type: Number, default: 200 }, // Bonus for referring a friend
  },
  
  // Redemption options
  available_redemptions: [{
    redemption_id: { type: mongoose.Schema.Types.ObjectId, ref: 'RedemptionOption' },
    name: String,
    description: String,
    points_required: Number,
    category: String, // 'supplement', 'trainer_session', 'merchandise', 'premium_feature'
    discount_percentage: Number,
    product_id: String,
    is_available: Boolean
  }],
  
  // Redeemed items
  redemptions_made: [{
    redemption_id: String,
    item_name: String,
    points_spent: Number,
    discount_value: Number,
    redeemed_at: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'completed', 'expired'] },
    expiry_date: Date
  }],
  
  // Tier/Membership (VIP levels)
  tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
  tier_multiplier: { type: Number, default: 1 }, // 1.0 for bronze, 1.5 for silver, 2.0 for gold, 3.0 for platinum
  tier_benefits: [String], // E.g., 'Double points on weekends', 'Free trainer session monthly'
  
  // Special promotions
  active_coupons: [{
    coupon_code: String,
    discount_type: String, // 'percentage' or 'fixed_points'
    discount_value: Number,
    valid_till: Date,
    times_used: Number,
    max_usage: Number
  }],
  
  // Statistics
  total_earned: { type: Number, default: 0 },
  total_redeemed: { type: Number, default: 0 },
  total_expired: { type: Number, default: 0 },
  
  last_transaction_date: { type: Date },
  
  // Notifications
  milestone_achievements: [{
    milestone: String, // '1000 points', 'Gold tier', etc.
    achieved_at: Date,
    reward_given: String
  }],
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

FitnessWalletSchema.index({ user_id: 1 });
FitnessWalletSchema.index({ tier: 1 });

module.exports = mongoose.model('FitnessWallet', FitnessWalletSchema);
