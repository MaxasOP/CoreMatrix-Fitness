// backend/controllers/videoController.js
// Handle video upload and analysis for workout form correction
const Workout = require('../models/Workout');
const videoAnalysisService = require('../services/videoAnalysisService');
const uploadService = require('../services/uploadService');

exports.uploadWorkoutVideo = async (req, res) => {
  try {
    const { exercise_name } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    // Upload to S3/Cloudinary
    const videoUrl = await uploadService.uploadVideo(req.file);

    // Analyze video
    const analysis = await videoAnalysisService.analyzeExerciseForm(req.file.path);
    const feedback = videoAnalysisService.generateFeedback(analysis);

    // Save workout with video and analysis
    const workout = new Workout({
      user_id: req.user.id,
      exercise_name: analysis.exercise || exercise_name,
      video_url: videoUrl,
      form_analysis: analysis,
      form_feedback: feedback,
      form_score: analysis.form_score,
      rep_count: analysis.rep_count
    });

    await workout.save();

    res.json({
      success: true,
      workout,
      feedback
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.analyzeFormFromUrl = async (req, res) => {
  try {
    const { video_url, exercise_name } = req.body;

    // Download video temporarily
    const tempPath = await uploadService.downloadFile(video_url);

    // Analyze
    const analysis = await videoAnalysisService.analyzeExerciseForm(tempPath);
    const feedback = videoAnalysisService.generateFeedback(analysis);

    res.json({
      success: true,
      analysis,
      feedback
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFormFeedback = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.workoutId);

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    if (workout.user_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      exercise: workout.exercise_name,
      form_score: workout.form_score,
      feedback: workout.form_feedback,
      analysis: workout.form_analysis
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
