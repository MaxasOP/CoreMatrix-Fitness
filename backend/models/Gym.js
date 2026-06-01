const mongoose = require('mongoose');

const GymSchema = new mongoose.Schema({
  // Basic info
  name: { type: String, required: true },
  description: { type: String },
  logo_url: { type: String },
  
  // Location
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  country: { type: String, default: 'India' },
  latitude: { type: Number },
  longitude: { type: Number },
  postal_code: { type: String },
  
  // Contact
  phone: { type: String },
  email: { type: String },
  website: { type: String },
  social_media: {
    instagram: String,
    facebook: String
  },
  
  // Hours of operation
  operating_hours: {
    monday: { open_time: String, close_time: String, open: Boolean },
    tuesday: { open_time: String, close_time: String, open: Boolean },
    wednesday: { open_time: String, close_time: String, open: Boolean },
    thursday: { open_time: String, close_time: String, open: Boolean },
    friday: { open_time: String, close_time: String, open: Boolean },
    saturday: { open_time: String, close_time: String, open: Boolean },
    sunday: { open_time: String, close_time: String, open: Boolean }
  },
  
  // Facilities & Equipment
  facilities: [String], // ['cardio', 'strength', 'yoga', 'crossfit', 'swimming', 'spa', 'sauna', 'steam', 'parking', 'wifi', 'cafe']
  equipment: [{
    name: String,
    category: String, // 'cardio', 'strength', 'functional'
    quantity: Number
  }],
  
  // Membership options
  memberships: [{
    name: String, // 'Monthly', 'Quarterly', '6 Months', 'Annual'
    duration_months: Number,
    price: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    features: [String], // Included features
    freeze_allowed: { type: Boolean, default: false },
    freeze_months: { type: Number }
  }],
  
  // Capacity & crowd
  total_members: { type: Number, default: 0 },
  max_capacity: { type: Number }, // Max people at any time
  current_occupancy: { type: Number, default: 0 }, // Real-time count
  occupancy_percentage: { type: Number, default: 0 }, // Current occupancy as percentage
  peak_hours: [{
    day: String,
    start_hour: Number,
    end_hour: Number,
    occupancy_percentage: Number
  }],
  
  // Live crowd prediction
  last_check_in_time: { type: Date },
  check_in_count_today: { type: Number, default: 0 },
  
  // Trainers available
  trainers_available: { type: Number, default: 0 },
  trainers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TrainerProfile' }],
  
  // Services
  additional_services: [String], // ['personal_training', 'nutrition_consultation', 'physiotherapy', 'group_classes']
  
  // Classes
  group_classes: [{
    name: String,
    type: String, // 'yoga', 'zumba', 'crossfit', 'pilates', 'spin'
    trainer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainerProfile' },
    schedule: String, // 'Mon/Wed/Fri 6:00 AM'
    capacity: Number,
    current_participants: Number,
    price_per_month: Number
  }],
  
  // Photos
  gallery: [String], // Photos of gym
  
  // Ratings & reviews
  average_rating: { type: Number, min: 0, max: 5 },
  total_reviews: { type: Number, default: 0 },
  
  // Verification & status
  is_verified: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },
  
  // Commission tracking
  affiliate_commission_percentage: { type: Number }, // % CoreMatrix gets from memberships
  
  // Amenities
  parking_available: { type: Boolean },
  parking_price: { type: Number }, // Monthly parking cost
  wifi_available: { type: Boolean },
  locker_facility: { type: Boolean },
  changing_rooms: { type: Boolean },
  shower_facility: { type: Boolean },
  cafe: { type: Boolean },
  medical_support: { type: Boolean },
  air_conditioning: { type: Boolean },
  
  // Hygiene & Safety
  last_hygiene_audit: { type: Date },
  hygiene_rating: { type: Number, min: 0, max: 5 },
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

GymSchema.index({ city: 1, is_verified: 1 });
GymSchema.index({ latitude: '2dsphere', longitude: '2dsphere' }); // For geospatial queries
GymSchema.index({ average_rating: -1 });

module.exports = mongoose.model('Gym', GymSchema);
