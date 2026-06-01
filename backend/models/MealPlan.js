const mongoose = require('mongoose');

const MealPlanSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Plan details
  name: { type: String }, // e.g., "Muscle Gain - 2500 calories"
  duration_days: { type: Number, default: 30 },
  status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
  
  // User preferences at time of generation
  goal: { type: String },
  diet_preference: { type: String },
  budget: { type: Number },
  calorie_target: { type: Number },
  
  // Macros
  target_protein: { type: Number },
  target_carbs: { type: Number },
  target_fat: { type: Number },
  
  // Daily meals
  breakfast: {
    meal_name: String,
    quantity: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    indian_alternatives: [String]
  },
  lunch: {
    meal_name: String,
    quantity: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    indian_alternatives: [String]
  },
  dinner: {
    meal_name: String,
    quantity: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    indian_alternatives: [String]
  },
  snacks: [{
    meal_name: String,
    quantity: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  }],
  
  // Cost analysis
  estimated_monthly_cost: { type: Number },
  cost_breakdown: {
    breakfast: Number,
    lunch: Number,
    dinner: Number,
    snacks: Number
  },
  
  // AI generated content
  ai_notes: { type: String }, // Personalized notes from AI
  customization_advice: [String],
  
  start_date: { type: Date, default: Date.now },
  end_date: { type: Date },
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MealPlan', MealPlanSchema);
