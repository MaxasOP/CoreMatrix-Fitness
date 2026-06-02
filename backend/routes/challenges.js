// backend/routes/challenges.js
// Fitness challenges: 10k steps, 30-day yoga, muscle gain, fat loss, etc.

const express = require('express');
const router = express.Router();
const { authOptional, authRequired } = require('../middleware/authMiddleware'); // Import both authOptional and authRequired
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const FitnessWallet = require('../models/FitnessWallet');

/**
 * GET /api/challenges
 * Get all active challenges
 */
router.get('/', async (req, res) => {
  try {
    const { status = 'active', type, limit = 20 } = req.query;

    let filter = {};
    if (status) {
      filter.status = status;
    }
    if (type) {
      filter.type = type;
    }

    const challenges = await Challenge.find(filter)
      .sort({ start_date: -1 })
      .limit(parseInt(limit));

    res.json({
      message: 'Challenges retrieved',
      challenges,
      total: challenges.length
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

/**
 * GET /api/challenges/:challengeId
 * Get challenge details
 */
router.get('/:challengeId', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.challengeId);

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    res.json({
      message: 'Challenge details',
      challenge
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ error: 'Failed to fetch challenge' });
  }
});

/**
 * POST /api/challenges
 * Create new challenge (admin)
 */
router.post('/', authRequired, async (req, res) => {
  try {
    // TODO: Add admin verification
    const challengeData = req.body;

    const challenge = new Challenge({
      ...challengeData,
      creator_id: req.user.id
    });

    await challenge.save();

    res.status(201).json({
      message: 'Challenge created successfully',
      challenge
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ error: 'Failed to create challenge' });
  }
});

/**
 * POST /api/challenges/:challengeId/join
 * Join a challenge
 */
router.post('/:challengeId/join', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Check if already joined
    if (challenge.participants.includes(userId)) {
      return res.status(400).json({ error: 'Already joined this challenge' });
    }

    // Check max participants
    if (challenge.max_participants && challenge.participants.length >= challenge.max_participants) {
      return res.status(400).json({ error: 'Challenge is full' });
    }

    // Get user details
    const user = await User.findById(userId);

    // Add participant
    challenge.participants.push(userId);
    challenge.participants_count += 1;

    // Add to leaderboard
    challenge.leaderboard.push({
      user_id: userId,
      username: user.name,
      current_progress: 0,
      progress_percentage: 0,
      rank: challenge.leaderboard.length + 1,
      is_completed: false
    });

    await challenge.save();

    res.status(200).json({
      message: 'Successfully joined challenge',
      challenge
    });
  } catch (error) {
    console.error('Error joining challenge:', error);
    res.status(500).json({ error: 'Failed to join challenge' });
  }
});

/**
 * POST /api/challenges/:challengeId/update-progress
 * Update user's progress in challenge
 */
router.post('/:challengeId/update-progress', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const { challengeId } = req.params;
    const { progress_value } = req.body;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Find user in leaderboard
    const userEntry = challenge.leaderboard.find(l => l.user_id.toString() === userId);
    if (!userEntry) {
      return res.status(400).json({ error: 'Not participating in this challenge' });
    }

    // Update progress
    userEntry.current_progress += progress_value;
    userEntry.progress_percentage = (userEntry.current_progress / challenge.goal) * 100;

    // Check if completed
    if (userEntry.current_progress >= challenge.goal) {
      userEntry.is_completed = true;

      // Award wallet points
      const wallet = await FitnessWallet.findOne({ user_id: userId });
      if (wallet) {
        wallet.available_points += challenge.reward_points_per_participant;
        wallet.total_points += challenge.reward_points_per_participant;
        await wallet.save();
      }
    }

    // Re-sort leaderboard by progress
    challenge.leaderboard.sort((a, b) => b.progress_percentage - a.progress_percentage);
    challenge.leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    await challenge.save();

    res.json({
      message: 'Progress updated',
      progress: userEntry.current_progress,
      progress_percentage: userEntry.progress_percentage,
      is_completed: userEntry.is_completed,
      rank: userEntry.rank
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

/**
 * GET /api/challenges/:challengeId/leaderboard
 * Get challenge leaderboard
 */
router.get('/:challengeId/leaderboard', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const challenge = await Challenge.findById(req.params.challengeId);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const leaderboard = challenge.leaderboard
      .slice(0, parseInt(limit))
      .map(entry => ({
        rank: entry.rank,
        username: entry.username,
        progress: entry.current_progress,
        progress_percentage: entry.progress_percentage,
        is_completed: entry.is_completed
      }));

    res.json({
      challenge_name: challenge.name,
      goal: challenge.goal,
      goal_unit: challenge.goal_unit,
      leaderboard,
      total_participants: challenge.participants_count
    });
  } catch (error) {
    console.error('Error fetching challenge leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /api/challenges/user-challenges
 * Get user's challenge participation
 */
router.get('/user-challenges', authRequired, async (req, res) => { // Apply authRequired and change route
  try {
    const userId = req.user.id; // Use req.user.id

    const challenges = await Challenge.find(
      { participants: userId }
    );

    const userChallenges = challenges.map(c => ({
      challenge_id: c._id,
      name: c.name,
      status: c.status,
      progress: c.leaderboard.find(l => l.user_id.toString() === userId)
    }));

    res.json({
      message: 'User challenges retrieved',
      challenges: userChallenges,
      total: userChallenges.length
    });
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    res.status(500).json({ error: 'Failed to fetch user challenges' });
  }
});

module.exports = router;
