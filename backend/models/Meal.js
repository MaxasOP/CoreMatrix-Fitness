const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], default: 'Meal' },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  fiber: { type: Number },
  
  // Meal details
  ingredients: [String],
  quantity: { type: String }, // e.g., "200g", "1 bowl"
  recipe_source: { type: String }, // URL or name
  
  // Media & scanning
  image_url: { type: String }, // Photo of meal
  scanned_at: { type: String }, // If scanned from restaurant/package
  
  // Restaurant info (if meal scanned)
  restaurant_name: { type: String },
  restaurant_dish_name: { type: String },
  
  // Dietary info
  diet_type: { type: String, enum: ['vegetarian', 'vegan', 'non-vegetarian', 'jain'] },
  allergens: [String], // ['nuts', 'gluten', 'dairy']
  is_healthy: { type: Boolean }, // AI determined
  health_rating: { type: Number, min: 0, max: 100 }, // Healthiness score
  
  // User notes
  notes: { type: String },
  
  log_date: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Meal', MealSchema);
