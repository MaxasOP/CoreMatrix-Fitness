// backend/routes/video.js
// Video upload and analysis routes
const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { authRequired: authMiddleware } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');
const multer = require('multer');

const allowedVideoTypes = new Set([
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm'
]);

const upload = multer({
  dest: (process.env.VIDEO_UPLOAD_DIR || 'uploads/videos/'),
  limits: { fileSize: 40 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!allowedVideoTypes.has(file.mimetype)) {
      return callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'video'));
    }
    callback(null, true);
  }
});


// Upload and analyze workout video
router.post('/analyze', authMiddleware, aiLimiter, upload.single('video'), videoController.uploadWorkoutVideo);

// Analyze from URL
router.post('/analyze-url', authMiddleware, aiLimiter, videoController.analyzeFormFromUrl);

// Get form feedback for workout
router.get('/feedback/:workoutId', authMiddleware, videoController.getFormFeedback);
router.get('/history', authMiddleware, videoController.getRecentAnalyses);

module.exports = router;
