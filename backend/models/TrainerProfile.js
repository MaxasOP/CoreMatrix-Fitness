const mongoose = require('mongoose');

const TrainerProfileSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Professional info
  full_name: { type: String, required: true },
  specialization: { type: String, enum: ['strength_training', 'cardio', 'yoga', 'physiotherapy', 'nutrition', 'general_fitness'], required: true },
  bio: { type: String },
  profile_picture: { type: String },
  certification: { type: String }, // Certificate name
  certification_image: { type: String }, // Certificate image
  years_experience: { type: Number },
  
  // Qualifications
  qualifications: [{
    qualification_name: String,
    issuing_body: String,
    year_obtained: Number,
    certificate_url: String
  }],
  
  // Services
  services_offered: [String], // 'online_training', 'in_person', 'nutrition_consultation', 'form_correction'
  
  // Pricing
  session_duration_minutes: { type: Number }, // Default session duration
  price_per_session: { type: Number }, // Base price in INR
  currency: { type: String, default: 'INR' },
  package_options: [{
    sessions_count: Number,
    price: Number,
    discount_percentage: Number
  }],
  
  // Availability
  availability: {
    time_zone: String,
    weekly_schedule: {
      monday: { available: Boolean, start_time: String, end_time: String },
      tuesday: { available: Boolean, start_time: String, end_time: String },
      wednesday: { available: Boolean, start_time: String, end_time: String },
      thursday: { available: Boolean, start_time: String, end_time: String },
      friday: { available: Boolean, start_time: String, end_time: String },
      saturday: { available: Boolean, start_time: String, end_time: String },
      sunday: { available: Boolean, start_time: String, end_time: String }
    }
  },
  
  // Location
  city: { type: String },
  state: { type: String },
  country: { type: String },
  is_online_available: { type: Boolean, default: true },
  
  // Ratings & reviews
  average_rating: { type: Number, min: 0, max: 5 },
  total_reviews: { type: Number, default: 0 },
  total_sessions_completed: { type: Number, default: 0 },
  
  // Contact info
  phone: { type: String },
  email: { type: String },
  social_media: {
    instagram: String,
    facebook: String,
    youtube: String
  },
  
  // Bank details (for payments)
  bank_account: {
    account_holder_name: String,
    account_number: String,
    ifsc_code: String,
    bank_name: String
  },
  
  // UPI (preferred in India)
  upi_id: { type: String },
  
  // Verification
  is_verified: { type: Boolean, default: false },
  verification_status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  
  // Preferences
  languages_spoken: [String],
  preferred_clients: [String], // 'beginners', 'intermediate', 'advanced', 'all'
  
  // Stats
  response_time_hours: { type: Number }, // Average response time
  cancellation_rate: { type: Number }, // Percentage
  
  // Status
  is_active: { type: Boolean, default: true },
  blocked_by: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who blocked this trainer
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

TrainerProfileSchema.index({ specialization: 1, city: 1, is_verified: 1 });
TrainerProfileSchema.index({ average_rating: -1 });

module.exports = mongoose.model('TrainerProfile', TrainerProfileSchema);
