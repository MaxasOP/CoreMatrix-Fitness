const mongoose = require('mongoose');

const ProgressReelSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Content
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['transformation', 'workout', 'yoga', 'meal', 'journey', 'progress'], required: true },
  
  // Media
  media_url: { type: String, required: true }, // Video or image URL
  media_type: { type: String, enum: ['image', 'video'], required: true },
  thumbnail_url: { type: String },
  duration_seconds: { type: Number }, // For videos
  
  // Metadata
  tags: [String], // #fatloss, #musclegain, #yoga, #healthy_eating
  category: { type: String }, // For filtering
  
  // Engagement
  likes_count: { type: Number, default: 0 },
  comments_count: { type: Number, default: 0 },
  shares_count: { type: Number, default: 0 },
  views_count: { type: Number, default: 0 },
  
  // Likes & comments stored separately for easier querying
  liked_by: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  comments: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    comment_text: String,
    created_at: { type: Date, default: Date.now }
  }],
  
  // Moderation
  moderation_status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  moderation_reason: { type: String },
  
  // AI moderation checks
  ai_checks: {
    nudity_detected: { type: Boolean, default: false },
    nudity_score: { type: Number },
    unrelated_content: { type: Boolean, default: false },
    spam_detected: { type: Boolean, default: false },
    contains_fitness_content: { type: Boolean, default: true }
  },
  
  // Smart feed algorithm
  user_attributes_at_creation: {
    age_group: String,
    city: String,
    goal: String,
    body_type_estimation: String
  },
  
  // Performance metrics
  viral_score: { type: Number, min: 0, max: 100 },
  engagement_rate: { type: Number },
  
  // Status
  is_pinned: { type: Boolean, default: false },
  is_deleted: { type: Boolean, default: false },
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProgressReel', ProgressReelSchema);
