const mongoose = require('mongoose');

const FormAnalysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exercise: { type: String, required: true },
  score: { type: Number, required: true },
  issues: [String],
  feedback: { type: String },
  reps: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FormAnalysis', FormAnalysisSchema);
