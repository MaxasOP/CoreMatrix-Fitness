// backend/controllers/paymentController.js
// Handle payment processing and transactions
const Payment = require('../models/Payment');
const User = require('../models/User');
const Supplement = require('../models/Supplement');
const paymentService = require('../services/paymentService');
const notificationService = require('../services/notificationService');

exports.createSupplementOrder = async (req, res) => {
  try {
    const { supplements, total_amount } = req.body;

    // Create Razorpay order
    const razorpayOrder = await paymentService.createRazorpayOrder(
      total_amount,
      `SUPPLEMENT_${Date.now()}`
    );

    // Create payment record
    const payment = new Payment({
      user_id: req.user.id,
      order_type: 'supplement',
      items: supplements,
      amount: total_amount,
      currency: 'INR',
      status: 'pending',
      payment_method: 'razorpay',
      razorpay_order_id: razorpayOrder.id
    });

    await payment.save();

    res.json({
      success: true,
      razorpay_order_id: razorpayOrder.id,
      amount: total_amount,
      payment_id: payment._id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const isValid = await paymentService.verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Update payment status
    const payment = await Payment.findOneAndUpdate(
      { razorpay_order_id },
      {
        status: 'completed',
        razorpay_payment_id,
        completed_at: new Date()
      },
      { new: true }
    );

    // Update user wallet points
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'fitness_wallet.points': 50 }
    });

    // Send confirmation email
    const user = await User.findById(req.user.id);
    await notificationService.sendEmail(
      user.email,
      'Order Confirmed',
      `<h2>Your supplement order has been confirmed!</h2><p>Order ID: ${payment._id}</p>`
    );

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user_id: req.user.id })
      .sort({ created_at: -1 })
      .limit(50);

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
