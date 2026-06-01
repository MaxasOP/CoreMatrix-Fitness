// backend/routes/payments.js
// Payment endpoints
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const { limiter, strictLimiter } = require('../middleware/rateLimiter');

// Create supplement order
router.post('/supplement-order', authMiddleware, limiter, paymentController.createSupplementOrder);

// Verify payment
router.post('/verify', authMiddleware, strictLimiter, paymentController.verifyPayment);

// Get transaction history
router.get('/history', authMiddleware, limiter, paymentController.getTransactionHistory);

module.exports = router;
