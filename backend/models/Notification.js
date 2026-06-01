const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Notification type
  type: { 
    type: String, 
    enum: [
      'booking_reminder', 
      'challenge_update', 
      'leaderboard_rank_change',
      'new_reel_from_followee',
      'workout_milestone',
      'streak_warning',
      'meal_plan_ready',
      'trainer_response',
      'wallet_points_earned',
      'system_announcement',
      'promotion',
      'friend_request'
    ], 
    required: true 
  },
  
  // Content
  title: { type: String, required: true },
  message: { type: String, required: true },
  icon_url: { type: String },
  
  // Action & deep link
  action_type: { type: String }, // 'view_booking', 'view_challenge', 'view_leaderboard', etc.
  action_link: { type: String }, // Deep link to relevant page
  related_object_id: { type: mongoose.Schema.Types.ObjectId }, // Related booking/challenge/etc ID
  related_object_type: { type: String }, // Type of related object
  
  // Status
  status: { type: String, enum: ['unread', 'read', 'archived'], default: 'unread' },
  read_at: { type: Date },
  
  // Priority
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  
  // Channels
  channels: [String], // ['in_app', 'email', 'push', 'sms']
  
  // Sender (optional)
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sender_name: { type: String },
  
  // Expiry
  expires_at: { type: Date }, // Notification auto-deletes after this
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

NotificationSchema.index({ user_id: 1, status: 1, created_at: -1 });
NotificationSchema.index({ user_id: 1, expires_at: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
