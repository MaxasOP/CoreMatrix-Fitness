// backend/routes/supplements.js
// Supplement recommendations and price comparison

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Supplement = require('../models/Supplement');
const aiService = require('../services/aiService');

/**
 * POST /api/supplements/recommend
 * Get supplement recommendations based on user profile
 */
router.post('/recommend', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get recommendations from AI
    const recommendations = await aiService.recommendSupplements({
      weight_kg: user.weight_kg,
      goal: user.goal,
      age: user.age_years,
      activity_level: user.activity_level
    });

    // Find matching supplements in database
    const supplementsData = [];
    for (const rec of recommendations) {
      const supplement = await Supplement.findOne({ name: { $regex: rec.name, $options: 'i' } });
      if (supplement) {
        supplementsData.push({
          ...rec,
          supplement_id: supplement._id,
          prices: supplement.prices,
          lowest_verified_price: supplement.lowest_verified_price,
          lowest_price_vendor: supplement.lowest_price_vendor,
          rating: supplement.average_rating
        });
      }
    }

    res.json({
      message: 'Supplements recommended',
      recommendations: supplementsData,
      total: supplementsData.length
    });
  } catch (error) {
    console.error('Error recommending supplements:', error);
    res.status(500).json({ error: 'Failed to recommend supplements' });
  }
});

/**
 * GET /api/supplements/search
 * Search supplements by name or category
 */
router.get('/search', async (req, res) => {
  try {
    const { query, category, limit = 10 } = req.query;

    let filter = { is_active: true };

    if (query) {
      filter.$text = { $search: query };
    }

    if (category) {
      filter.category = category;
    }

    const supplements = await Supplement.find(filter)
      .limit(parseInt(limit))
      .sort({ average_rating: -1 });

    res.json({
      message: 'Supplements found',
      supplements,
      total: supplements.length
    });
  } catch (error) {
    console.error('Error searching supplements:', error);
    res.status(500).json({ error: 'Failed to search supplements' });
  }
});

/**
 * GET /api/supplements/:supplementId
 * Get supplement details with prices
 */
router.get('/:supplementId', async (req, res) => {
  try {
    const supplement = await Supplement.findById(req.params.supplementId);

    if (!supplement) {
      return res.status(404).json({ error: 'Supplement not found' });
    }

    // Sort prices to show lowest first
    const sortedPrices = supplement.prices.sort((a, b) => a.price - b.price);

    res.json({
      message: 'Supplement details',
      supplement: {
        ...supplement.toObject(),
        prices: sortedPrices,
        cheapest_option: sortedPrices[0]
      }
    });
  } catch (error) {
    console.error('Error fetching supplement:', error);
    res.status(500).json({ error: 'Failed to fetch supplement' });
  }
});

/**
 * GET /api/supplements/:supplementId/prices
 * Get price comparison across vendors
 */
router.get('/:supplementId/prices', async (req, res) => {
  try {
    const supplement = await Supplement.findById(req.params.supplementId);

    if (!supplement) {
      return res.status(404).json({ error: 'Supplement not found' });
    }

    const sortedPrices = supplement.prices
      .sort((a, b) => a.price - b.price)
      .map(price => ({
        vendor: price.vendor_name,
        price: price.price,
        original_price: price.original_price,
        discount: price.discount_percentage,
        url: price.url,
        in_stock: price.in_stock,
        rating: price.rating,
        reviews_count: price.reviews_count
      }));

    res.json({
      supplement_name: supplement.name,
      prices: sortedPrices,
      lowest_price: sortedPrices[0]?.price,
      highest_price: sortedPrices[sortedPrices.length - 1]?.price,
      price_difference: sortedPrices[sortedPrices.length - 1]?.price - sortedPrices[0]?.price,
      authenticity_score: supplement.authenticity_score
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

/**
 * GET /api/supplements/:supplementId/authenticity
 * Get authenticity information
 */
router.get('/:supplementId/authenticity', async (req, res) => {
  try {
    const supplement = await Supplement.findById(req.params.supplementId);

    if (!supplement) {
      return res.status(404).json({ error: 'Supplement not found' });
    }

    res.json({
      supplement_name: supplement.name,
      authenticity_score: supplement.authenticity_score,
      batch_verification_available: supplement.batch_verification_available,
      qr_code_verifiable: supplement.qr_code_verifiable,
      verified_vendors: supplement.prices
        .filter(p => p.rating >= 4)
        .map(p => ({
          vendor: p.vendor_name,
          rating: p.rating,
          reviews_count: p.reviews_count
        })),
      message: 'Authenticity information retrieved'
    });
  } catch (error) {
    console.error('Error fetching authenticity:', error);
    res.status(500).json({ error: 'Failed to fetch authenticity information' });
  }
});

/**
 * POST /api/supplements (Admin)
 * Add new supplement to database
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    // TODO: Add admin verification
    const supplementData = req.body;

    const supplement = new Supplement(supplementData);
    await supplement.save();

    res.status(201).json({
      message: 'Supplement added successfully',
      supplement
    });
  } catch (error) {
    console.error('Error adding supplement:', error);
    res.status(500).json({ error: 'Failed to add supplement' });
  }
});

module.exports = router;
