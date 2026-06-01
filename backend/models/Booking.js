const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  // Booking details
  booking_type: { type: String, enum: ['trainer', 'physiotherapist', 'yoga_instructor', 'nutritionist'], required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service_provider_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainerProfile', required: true },
  
  // Session details
  session_date: { type: Date, required: true },
  start_time: { type: String, required: true }, // HH:MM format
  end_time: { type: String, required: true },
  duration_minutes: { type: Number, required: true },
  
  // Session type
  session_type: { type: String, enum: ['online', 'in_person', 'call'], required: true },
  location: { type: String }, // For in-person sessions (gym name or address)
  
  // Payment details
  price: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  payment_status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  payment_method: { type: String }, // 'card', 'upi', 'wallet', 'bank_transfer'
  transaction_id: { type: String },
  
  // Booking status
  status: { type: String, enum: ['confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled'], default: 'confirmed' },
  cancellation_reason: { type: String },
  cancelled_by: { type: String }, // 'user' or 'provider'
  cancelled_at: { type: Date },
  
  // Meeting details (for online sessions)
  meeting_link: { type: String }, // Zoom, Google Meet link
  meeting_code: { type: String },
  
  // Notes & description
  user_notes: { type: String }, // What user wants to focus on
  provider_notes: { type: String }, // Provider's notes about the session
  
  // Session outcome
  completed_at: { type: Date },
  feedback_from_user: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    would_recommend: Boolean
  },
  feedback_from_provider: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    client_behavior_rating: { type: String, enum: ['excellent', 'good', 'fair'] }
  },
  
  // Reschedule history
  reschedule_history: [{
    original_date: Date,
    new_date: Date,
    reason: String,
    rescheduled_at: Date
  }],
  
  // Reminders
  user_reminder_sent: { type: Boolean, default: false },
  provider_reminder_sent: { type: Boolean, default: false },
  user_reminder_sent_at: { type: Date },
  provider_reminder_sent_at: { type: Date },
  
  // Cancellation policy
  cancellation_allowed_till: { type: Date }, // User can cancel till this time
  cancellation_fee_percentage: { type: Number, default: 0 }, // % of session fee as cancellation fee
  
  // Package booking
  package_id: { type: String }, // If part of a package
  is_free_session: { type: Boolean, default: false }, // Promotional/free session
  
  // Wallet points
  points_earned: { type: Number, default: 0 }, // Points user earned from this booking
  points_used: { type: Number, default: 0 }, // Points user used for discount
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

BookingSchema.index({ user_id: 1, session_date: 1 });
BookingSchema.index({ service_provider_id: 1, session_date: 1 });
BookingSchema.index({ status: 1, session_date: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
