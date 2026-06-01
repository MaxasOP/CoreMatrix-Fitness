const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  // Reviewer
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user_name: { type: String },
  user_profile_picture: { type: String },
  
  // Subject of review
  subject_type: { type: String, enum: ['trainer', 'gym', 'supplement', 'booking'], required: true },
  subject_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  subject_name: { type: String },
  
  // For trainer reviews - linked to booking
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  
  // Rating & review
  rating: { type: Number, min: 1, max: 5, required: true },
  title: { type: String },
  comment: { type: String, required: true },
  
  // Detailed ratings (for trainer/gym)
  detailed_ratings: {
    professionalism: { type: Number, min: 1, max: 5 },
    knowledge: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    punctuality: { type: Number, min: 1, max: 5 },
    facilities: { type: Number, min: 1, max: 5 }, // For gym only
    cleanliness: { type: Number, min: 1, max: 5 }, // For gym only
    value_for_money: { type: Number, min: 1, max: 5 },
    would_recommend: { type: Boolean, default: true }
  },
  
  // Photos & media
  photos: [String], // URLs of review photos
  
  // Helpful votes
  helpful_votes: { type: Number, default: 0 },
  unhelpful_votes: { type: Number, default: 0 },
  voted_by: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Verification
  is_verified_purchase: { type: Boolean, default: false }, // True if user actually used the service
  
  // Status & moderation
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  moderation_reason: { type: String },
  
  // Response from business
  business_response: {
    response_text: String,
    responded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainerProfile' },
    responded_at: Date
  },
  
  // Update history
  edited: { type: Boolean, default: false },
  edit_history: [{
    edited_comment: String,
    edited_at: Date,
    rating: Number
  }],
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

ReviewSchema.index({ subject_type: 1, subject_id: 1 });
ReviewSchema.index({ user_id: 1 });
ReviewSchema.index({ rating: -1 });
ReviewSchema.index({ helpful_votes: -1 });

module.exports = mongoose.model('Review', ReviewSchema);
