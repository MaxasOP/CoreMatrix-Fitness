const mongoose = require('mongoose');

const WorkoutSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String, required: true }, // Strength, Cardio, Yoga, Flexibility, Sports
  body_parts_targeted: [String], // ['chest', 'triceps', 'shoulders']
  sets: { type: Number, default: 3 },
  reps: { type: Number, default: 10 },
  weight: { type: Number, default: 0 },
  duration_minutes: { type: Number }, // Duration in minutes
  calories_burned: { type: Number },
  intensity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  difficulty_level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  
  // Video & Form Analysis
  video_url: { type: String },
  form_feedback: {
    issues: [String], // ['knee_valgus', 'rounded_back', 'shallow_depth']
    corrections_needed: [String],
    form_score: { type: Number, min: 0, max: 100 },
    depth_percentage: { type: Number }, // For squats, deadlifts, etc.
    range_of_motion_percentage: { type: Number },
    stance_alignment: { type: String }, // 'good', 'needs_adjustment'
    analyzed_at: { type: Date }
  },
  
  // Notes & experience
  notes: { type: String },
  feel: { type: String, enum: ['easy', 'moderate', 'hard', 'very_hard'] },
  
  log_date: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Workout', WorkoutSchema);
