// backend/routes/leaderboards.js
// Leaderboard rankings: national, city, college, company

const express = require('express');
const router = express.Router();
const { authOptional: authMiddleware, authRequired } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
const Workout = require('../models/Workout');

/**
 * GET /api/leaderboards/national/:category
 * Get national leaderboard by category
 */
router.get('/national/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { period = 'monthly', limit = 50 } = req.query;

    // Validate category
    const validCategories = ['fat_loss', 'muscle_gain', 'most_consistent', 'longest_streak', 'most_active'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const leaderboard = await Leaderboard.find({
      category,
      scope: 'national',
      period,
      is_current: true
    })
      .sort({ rank: 1 })
      .limit(parseInt(limit));

    res.json({
      scope: 'national',
      category,
      period,
      leaderboard,
      total: leaderboard.length
    });
  } catch (error) {
    console.error('Error fetching national leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /api/leaderboards/city/:city/:category
 * Get city-level leaderboard
 */
router.get('/city/:city/:category', async (req, res) => {
  try {
    const { city, category } = req.params;
    const { period = 'monthly', limit = 50 } = req.query;

    const leaderboard = await Leaderboard.find({
      category,
      scope: 'city',
      city,
      period,
      is_current: true
    })
      .sort({ rank: 1 })
      .limit(parseInt(limit));

    res.json({
      scope: 'city',
      city,
      category,
      period,
      leaderboard,
      total: leaderboard.length
    });
  } catch (error) {
    console.error('Error fetching city leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /api/leaderboards/college/:collegeId/:category
 * Get college-level leaderboard
 */
router.get('/college/:collegeName/:category', async (req, res) => {
  try {
    const { collegeName, category } = req.params;
    const { period = 'monthly', limit = 50 } = req.query;

    const leaderboard = await Leaderboard.find({
      category,
      scope: 'college',
      college_name: collegeName,
      period,
      is_current: true
    })
      .sort({ rank: 1 })
      .limit(parseInt(limit));

    res.json({
      scope: 'college',
      college: collegeName,
      category,
      period,
      leaderboard,
      total: leaderboard.length
    });
  } catch (error) {
    console.error('Error fetching college leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /api/leaderboards/company/:companyId/:category
 * Get company-level leaderboard
 */
router.get('/company/:companyName/:category', async (req, res) => {
  try {
    const { companyName, category } = req.params;
    const { period = 'monthly', limit = 50 } = req.query;

    const leaderboard = await Leaderboard.find({
      category,
      scope: 'company',
      company_name: companyName,
      period,
      is_current: true
    })
      .sort({ rank: 1 })
      .limit(parseInt(limit));

    res.json({
      scope: 'company',
      company: companyName,
      category,
      period,
      leaderboard,
      total: leaderboard.length
    });
  } catch (error) {
    console.error('Error fetching company leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /api/leaderboards/my-rank
 * Get user's current rank across categories
 */
router.get('/my-rank', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's ranks in all categories
    const ranks = await Leaderboard.find({
      user_id: userId,
      is_current: true,
      period: 'monthly'
    });

    const userRanks = {
      user_id: userId,
      name: user.name,
      city: user.city,
      college: user.college_name,
      company: user.company_name,
      ranks: ranks.map(r => ({
        category: r.category,
        scope: r.scope,
        rank: r.rank,
        score: r.score,
        badge: r.badge
      }))
    };

    res.json(userRanks);
  } catch (error) {
    console.error('Error fetching user rank:', error);
    res.status(500).json({ error: 'Failed to fetch user rank' });
  }
});

/**
 * GET /api/leaderboards/cities
 * Get available cities with active leaderboards
 */
router.get('/', async (req, res) => {
  try {
    const cities = await Leaderboard.distinct('city', { is_current: true });
    const colleges = await Leaderboard.distinct('college_name', { is_current: true });
    const companies = await Leaderboard.distinct('company_name', { is_current: true });

    res.json({
      cities: cities.filter(c => c),
      colleges: colleges.filter(c => c),
      companies: companies.filter(c => c),
      categories: ['fat_loss', 'muscle_gain', 'most_consistent', 'longest_streak', 'most_active']
    });
  } catch (error) {
    console.error('Error fetching leaderboard info:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard info' });
  }
});

/**
 * POST /api/leaderboards/update (Admin/Cron)
 * Update leaderboards (should be called periodically)
 */
router.post('/update', async (req, res) => {
  try {
    // TODO: Add authentication for admin or cron job
    // This endpoint should be called by a scheduled job to update leaderboards

    // Get all users
    const users = await User.find();

    // Update each user's leaderboard positions
    for (const user of users) {
      // Calculate metrics
      const workouts = await Workout.find({ user_id: user._id });
      
      // Update leaderboard entries
      // This is a simplified version - would need full implementation
    }

    res.json({ message: 'Leaderboards updated' });
  } catch (error) {
    console.error('Error updating leaderboards:', error);
    res.status(500).json({ error: 'Failed to update leaderboards' });
  }
});

module.exports = router;
