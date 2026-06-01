const mongoose = require('mongoose');

const SupplementSchema = new mongoose.Schema({
  // Basic info
  name: { type: String, required: true, unique: true },
  category: { type: String, enum: ['protein', 'creatine', 'bcaa', 'multivitamin', 'fish_oil', 'vitamin_d', 'pre_workout', 'fat_burner', 'other'], required: true },
  description: { type: String },
  image_url: { type: String },
  
  // Specifications
  quantity: { type: String }, // e.g., "1kg", "300 tablets"
  servings_per_container: { type: Number },
  serving_size: { type: String },
  
  // Nutritional info (per serving)
  calories: { type: Number },
  protein: { type: Number },
  carbs: { type: Number },
  fat: { type: Number },
  sugar: { type: Number },
  fiber: { type: Number },
  
  // Ingredients
  ingredients: [String],
  allergens: [String],
  
  // Benefits & use cases
  benefits: [String],
  recommended_for: [String], // ['muscle_gain', 'fat_loss', 'recovery', 'energy']
  
  // Dosage & usage
  recommended_dosage: { type: String },
  timing: { type: String }, // 'pre_workout', 'post_workout', 'with_meals', 'anytime'
  cycle_recommendation: { type: String }, // e.g., "8-12 weeks on, 2 weeks off"
  
  // Authenticity & verification
  authenticity_score: { type: Number, min: 0, max: 100 }, // Based on reviews, batch verification
  batch_verification_available: { type: Boolean, default: false },
  qr_code_verifiable: { type: Boolean, default: false },
  
  // Pricing data (from various vendors)
  prices: [{
    vendor_name: { type: String }, // Amazon, Flipkart, HealthKart, MuscleBlaze Store
    price: { type: Number },
    original_price: { type: Number },
    discount_percentage: { type: Number },
    url: { type: String },
    in_stock: { type: Boolean, default: true },
    rating: { type: Number, min: 0, max: 5 },
    reviews_count: { type: Number },
    last_updated: { type: Date, default: Date.now }
  }],
  
  lowest_verified_price: { type: Number },
  lowest_price_vendor: { type: String },
  
  // Reviews & user data
  average_rating: { type: Number, min: 0, max: 5 },
  review_count: { type: Number, default: 0 },
  
  // Meta
  is_active: { type: Boolean, default: true },
  affiliate_link: { type: String },
  affiliate_commission_percentage: { type: Number },
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Index for searching
SupplementSchema.index({ name: 'text', category: 1, benefits: 1 });

module.exports = mongoose.model('Supplement', SupplementSchema);
