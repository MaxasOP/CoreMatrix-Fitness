// backend/routes/analytics.js
// Analytics and insights endpoints
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authRequired: authMiddleware } = require('../middleware/authMiddleware');

// Get user analytics
router.get('/user-analytics', authMiddleware, analyticsController.getUserAnalytics);

// Get milestones
router.get('/milestones', authMiddleware, analyticsController.getMilestones);

// Get progress trends
router.get('/trends', authMiddleware, analyticsController.getProgressTrends);

module.exports = router;
