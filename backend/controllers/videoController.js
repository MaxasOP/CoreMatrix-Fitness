// backend/controllers/videoController.js
// Handle video upload and analysis for workout form correction
const FormAnalysis = require('../models/FormAnalysis');
const Workout = require('../models/Workout');
const WorkoutPlan = require('../models/WorkoutPlan');
const videoAnalysisService = require('../services/videoAnalysisService');
const uploadService = require('../services/uploadService');
const fs = require('fs');

exports.uploadWorkoutVideo = async (req, res) => {
  try {
    const { exercise_name, workout_id } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const linkedWorkout = workout_id
      ? await Workout.findOne({ _id: workout_id, user_id: req.user.id }).lean()
      : null;
    if (workout_id && !linkedWorkout) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'The linked workout could not be found' });
    }

    // 1. Analyze video directly from temporary storage
    const analysis = await videoAnalysisService.analyzeExerciseForm(req.file.path, exercise_name);
    const feedbackData = analysis.form_issues?.includes('no_person_detected')
      ? {
          overall: 'No complete body position was detected in this clip.',
          cues: analysis.recommendations || [],
          issues_breakdown: analysis.form_issues,
          encouragement: 'Reframe the camera and record the set again.'
        }
      : await videoAnalysisService.generateFeedback(analysis);

    // 2. Save only results to MongoDB
    const formAnalysis = new FormAnalysis({
      userId: req.user.id,
      workoutId: linkedWorkout?._id || null,
      planId: linkedWorkout?.plan_id || null,
      planDayIndex: linkedWorkout?.plan_day_index ?? null,
      planExerciseIndex: linkedWorkout?.plan_exercise_index ?? null,
      exercise: analysis.exercise || exercise_name || 'unknown',
      analysisMode: analysis.analysis_mode || 'adaptive',
      dominantJoint: analysis.dominant_joint || null,
      score: analysis.form_score || 0,
      issues: analysis.form_issues || [],
      feedback: (feedbackData.overall || '') + '. ' + (feedbackData.cues ? feedbackData.cues.join(' ') : ''),
      reps: analysis.rep_count || 0,
      detectionConfidence: analysis.detection_confidence || 0,
      framesAnalyzed: analysis.frames_analyzed || 0
    });

    await formAnalysis.save();

    if (workout_id) {
      await Workout.updateOne(
        { _id: workout_id, user_id: req.user.id },
        { $set: { form_feedback: { issues: formAnalysis.issues, corrections_needed: feedbackData.cues || [], form_score: formAnalysis.score, analyzed_at: new Date() } } }
      );
    }
    const linkedPlanId = linkedWorkout?.plan_id;
    const linkedDayIndex = linkedWorkout?.plan_day_index;
    const linkedExerciseIndex = linkedWorkout?.plan_exercise_index;
    if (linkedPlanId && linkedDayIndex !== null && linkedDayIndex !== undefined && linkedExerciseIndex !== null && linkedExerciseIndex !== undefined) {
      await WorkoutPlan.updateOne(
        {
          _id: linkedPlanId,
          userId: req.user.id,
          progress: { $elemMatch: { dayIndex: Number(linkedDayIndex), exerciseIndex: Number(linkedExerciseIndex) } }
        },
        { $set: { 'progress.$.analysisId': formAnalysis._id, updatedAt: new Date() } }
      );
    }

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
    res.status(error.statusCode || 500).json({
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
    const feedbackData = analysis.form_issues?.includes('no_person_detected')
      ? {
          overall: 'No complete body position was detected in this clip.',
          cues: analysis.recommendations || [],
          issues_breakdown: analysis.form_issues,
          encouragement: 'Reframe the camera and record the set again.'
        }
      : await videoAnalysisService.generateFeedback(analysis);

    const formAnalysis = new FormAnalysis({
      userId: req.user.id,
      exercise: analysis.exercise || exercise_name || 'unknown',
      analysisMode: analysis.analysis_mode || 'adaptive',
      dominantJoint: analysis.dominant_joint || null,
      score: analysis.form_score || 0,
      issues: analysis.form_issues || [],
      feedback: (feedbackData.overall || '') + '. ' + (feedbackData.cues ? feedbackData.cues.join(' ') : ''),
      reps: analysis.rep_count || 0,
      detectionConfidence: analysis.detection_confidence || 0,
      framesAnalyzed: analysis.frames_analyzed || 0
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
    res.status(error.statusCode || 500).json({
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

exports.getRecentAnalyses = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const analyses = await FormAnalysis.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
