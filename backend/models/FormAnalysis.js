const mongoose = require('mongoose');

const FormAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workoutId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout', default: null, index: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutPlan', default: null, index: true },
  planDayIndex: { type: Number, default: null },
  planExerciseIndex: { type: Number, default: null },
  exercise: { type: String, required: true },
  analysisMode: { type: String, enum: ['squat', 'deadlift', 'pushup', 'bench_press', 'shoulder_press', 'adaptive'], default: 'adaptive' },
  dominantJoint: { type: String, default: null },
  score: { type: Number, required: true },
  issues: [String],
  feedback: { type: String },
  reps: { type: Number },
  detectionConfidence: { type: Number, min: 0, max: 100, default: 0 },
  framesAnalyzed: { type: Number, min: 0, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FormAnalysis', FormAnalysisSchema);
