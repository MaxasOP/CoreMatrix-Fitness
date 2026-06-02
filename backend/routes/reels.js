// backend/routes/reels.js
// Progress reels: user transformation photos, workout videos, meal posts

const express = require('express');
const router = express.Router();
const { authOptional: authMiddleware, authRequired } = require('../middleware/authMiddleware');
const ProgressReel = require('../models/ProgressReel');
const User = require('../models/User');
const aiService = require('../services/aiService');

/**
 * POST /api/reels
 * Create new progress reel
 */
router.post('/', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      type,
      media_url,
      media_type,
      tags,
      category
    } = req.body;

    // Validate required fields
    if (!title || !media_url || !media_type || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Moderate content
    const moderation = await aiService.moderateContent(media_url);
    if (!moderation.is_approved) {
      return res.status(400).json({ error: 'Content does not meet community standards' });
    }

    const user = await User.findById(userId);

    const reel = new ProgressReel({
      user_id: userId,
      title,
      description,
      type,
      media_url,
      media_type,
      tags: tags || [],
      category,
      user_attributes_at_creation: {
        age_group: user.age_years ? Math.floor(user.age_years / 5) * 5 : 'unknown',
        city: user.city,
        goal: user.goal,
        body_type_estimation: 'average'
      },
      ai_checks: moderation,
      moderation_status: moderation.is_approved ? 'approved' : 'pending'
    });

    await reel.save();

    res.status(201).json({
      message: 'Reel created successfully',
      reel
    });
  } catch (error) {
    console.error('Error creating reel:', error);
    res.status(500).json({ error: 'Failed to create reel' });
  }
});

/**
 * GET /api/reels
 * Get reels for user (home feed)
 */
router.get('/', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const user = await User.findById(userId);

    // Smart feed: show reels from people with similar goals, age, city
    const reels = await ProgressReel.find({
      moderation_status: 'approved',
      is_deleted: false,
      $or: [
        { 'user_attributes_at_creation.goal': user.goal },
        { 'user_attributes_at_creation.city': user.city },
        { 'user_attributes_at_creation.age_group': Math.floor(user.age_years / 5) * 5 }
      ]
    })
      .sort({ created_at: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .populate('user_id', 'name profile_picture');

    res.json({
      message: 'Feed retrieved',
      reels,
      total: reels.length
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

/**
 * GET /api/reels/:reelId
 * Get single reel details
 */
router.get('/:reelId', async (req, res) => {
  try {
    const reel = await ProgressReel.findByIdAndUpdate(
      req.params.reelId,
      { $inc: { views_count: 1 } },
      { new: true }
    ).populate('user_id', 'name profile_picture');

    if (!reel) {
      return res.status(404).json({ error: 'Reel not found' });
    }

    res.json({
      message: 'Reel retrieved',
      reel
    });
  } catch (error) {
    console.error('Error fetching reel:', error);
    res.status(500).json({ error: 'Failed to fetch reel' });
  }
});

/**
 * POST /api/reels/:reelId/like
 * Like a reel
 */
router.post('/:reelId/like', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const reelId = req.params.reelId;

    const reel = await ProgressReel.findById(reelId);
    if (!reel) {
      return res.status(404).json({ error: 'Reel not found' });
    }

    // Check if already liked
    if (reel.liked_by.includes(userId)) {
      // Unlike
      reel.liked_by = reel.liked_by.filter(id => id.toString() !== userId);
      reel.likes_count -= 1;
    } else {
      // Like
      reel.liked_by.push(userId);
      reel.likes_count += 1;
    }

    await reel.save();

    res.json({
      message: 'Like updated',
      likes_count: reel.likes_count,
      is_liked: reel.liked_by.includes(userId)
    });
  } catch (error) {
    console.error('Error updating like:', error);
    res.status(500).json({ error: 'Failed to update like' });
  }
});

/**
 * POST /api/reels/:reelId/comment
 * Add comment to reel
 */
router.post('/:reelId/comment', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const { comment_text } = req.body;

    if (!comment_text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const user = await User.findById(userId);
    const reel = await ProgressReel.findById(req.params.reelId);

    if (!reel) {
      return res.status(404).json({ error: 'Reel not found' });
    }

    reel.comments.push({
      user_id: userId,
      username: user.name,
      comment_text
    });

    reel.comments_count += 1;
    await reel.save();

    res.json({
      message: 'Comment added',
      comments_count: reel.comments_count
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

/**
 * DELETE /api/reels/:reelId
 * Delete reel (owner only)
 */
router.delete('/:reelId', authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const reel = await ProgressReel.findById(req.params.reelId);

    if (!reel) {
      return res.status(404).json({ error: 'Reel not found' });
    }

    if (reel.user_id.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this reel' });
    }

    reel.is_deleted = true;
    await reel.save();

    res.json({ message: 'Reel deleted' });
  } catch (error) {
    console.error('Error deleting reel:', error);
    res.status(500).json({ error: 'Failed to delete reel' });
  }
});

/**
 * GET /api/reels/my-reels
 * Get authenticated user's reels
 */
router.get('/my-reels', authRequired, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const userId = req.user.id; // Use req.user.id

    const reels = await ProgressReel.find({
      user_id: userId,
      is_deleted: false
    })
      .sort({ created_at: -1 })
      .limit(parseInt(limit));

    res.json({
      message: 'User reels retrieved',
      reels,
      total: reels.length
    });
  } catch (error) {
    console.error('Error fetching user reels:', error);
    res.status(500).json({ error: 'Failed to fetch user reels' });
  }
});

module.exports = router;
