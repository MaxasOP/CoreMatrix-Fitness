// backend/models/Payment.js
// Payment transaction tracking
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order_type: { type: String, enum: ['supplement', 'trainer', 'gym', 'membership'], required: true },
  items: [mongoose.Schema.Types.Mixed],
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  payment_method: { type: String, enum: ['razorpay', 'stripe', 'upi', 'wallet'], required: true },
  razorpay_order_id: String,
  razorpay_payment_id: String,
  transaction_id: String,
  commission: {
    vendor_id: mongoose.Schema.Types.ObjectId,
    amount: Number,
    status: String
  },
  created_at: { type: Date, default: Date.now },
  completed_at: Date
});

module.exports = mongoose.model('Payment', paymentSchema);
