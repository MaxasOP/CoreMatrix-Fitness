// backend/controllers/videoController.js
// Handle video upload and analysis for workout form correction
const FormAnalysis = require('../models/FormAnalysis');
const Workout = require('../models/Workout');
const videoAnalysisService = require('../services/videoAnalysisService');
const uploadService = require('../services/uploadService');
const fs = require('fs');

exports.uploadWorkoutVideo = async (req, res) => {
  try {
    const { exercise_name } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    // 1. Analyze video directly from temporary storage
    const analysis = await videoAnalysisService.analyzeExerciseForm(req.file.path, exercise_name);
    const feedbackData = await videoAnalysisService.generateFeedback(analysis);

    // 2. Save only results to MongoDB
    const formAnalysis = new FormAnalysis({
      userId: req.user.id,
      exercise: analysis.exercise || exercise_name || 'unknown',
      score: analysis.form_score || 0,
      issues: analysis.form_issues || [],
      feedback: (feedbackData.overall || '') + '. ' + (feedbackData.cues ? feedbackData.cues.join(' ') : ''),
      reps: analysis.rep_count || 0
    });

    await formAnalysis.save();

    // 3. Delete temporary file immediately after analysis
    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (err) {
      console.error('Error deleting temp video file:', err);
    }

    res.json({
      success: true,
      analysis: formAnalysis,
      feedback: feedbackData
    });
  } catch (error) {
    // Ensure file is deleted even if analysis fails
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error deleting temp video file after error:', err);
      }
    }
    const pythonServiceError = error.pythonServiceError;
    res.status(500).json({
      error: error.message,
      pythonServiceError: pythonServiceError
        ? {
            message: pythonServiceError.message,
            code: pythonServiceError.code,
            status: pythonServiceError.status,
            pythonServiceUrl: pythonServiceError.pythonServiceUrl,
            responseData: pythonServiceError.responseData
          }
        : undefined
    });
  }
};

exports.analyzeFormFromUrl = async (req, res) => {
  try {
    const { video_url, exercise_name } = req.body;

    // Download video temporarily
    const tempPath = await uploadService.downloadFile(video_url);

    // Analyze
    const analysis = await videoAnalysisService.analyzeExerciseForm(tempPath, exercise_name);
    const feedbackData = await videoAnalysisService.generateFeedback(analysis);

    const formAnalysis = new FormAnalysis({
      userId: req.user.id,
      exercise: analysis.exercise || exercise_name || 'unknown',
      score: analysis.form_score || 0,
      issues: analysis.form_issues || [],
      feedback: (feedbackData.overall || '') + '. ' + (feedbackData.cues ? feedbackData.cues.join(' ') : ''),
      reps: analysis.rep_count || 0
    });

    await formAnalysis.save();

    // Delete temp file if it was downloaded locally
    if (tempPath.startsWith('/') || tempPath.includes(':\\')) {
      try {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch (err) {
        console.error('Error deleting temp downloaded file:', err);
      }
    }

    res.json({
      success: true,
      analysis: formAnalysis,
      feedback: feedbackData
    });
  } catch (error) {
    const pythonServiceError = error.pythonServiceError;
    res.status(500).json({
      error: error.message,
      pythonServiceError: pythonServiceError
        ? {
            message: pythonServiceError.message,
            code: pythonServiceError.code,
            status: pythonServiceError.status,
            pythonServiceUrl: pythonServiceError.pythonServiceUrl,
            responseData: pythonServiceError.responseData
          }
        : undefined
    });
  }
};

exports.getFormFeedback = async (req, res) => {
  try {
    // Try finding in FormAnalysis first, then Workout (legacy)
    let analysis = await FormAnalysis.findById(req.params.workoutId);
    
    if (!analysis) {
      const workout = await Workout.findById(req.params.workoutId);
      if (workout) {
        return res.json({
          exercise: workout.exercise_name,
          form_score: workout.form_score,
          feedback: workout.form_feedback,
          analysis: workout.form_analysis
        });
      }
      return res.status(404).json({ error: 'Analysis not found' });
    }

    if (analysis.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      exercise: analysis.exercise,
      form_score: analysis.score,
      feedback: analysis.feedback,
      issues: analysis.issues,
      reps: analysis.reps
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
