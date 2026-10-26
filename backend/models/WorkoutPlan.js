const mongoose = require('mongoose');

const WorkoutPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  plan: { type: mongoose.Schema.Types.Mixed, required: true },
  preferences: {
    experienceLevel: String,
    daysPerWeek: Number,
    equipmentAvailable: String
  },
  status: { type: String, enum: ['active', 'archived'], default: 'active', index: true },
  createdAt: { type: Date, default: Date.now }
});

WorkoutPlanSchema.index({ userId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('WorkoutPlan', WorkoutPlanSchema);
