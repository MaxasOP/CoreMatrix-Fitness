// backend/services/paymentService.js
// Payment processing for supplement purchases, trainer bookings, etc.
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const razorpay = require('razorpay');

class PaymentService {
  constructor() {
    // Razorpay throws at require-time if credentials are missing.
    // Keep the service from crashing the whole server when payments are not configured yet.
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    this.razorpayInstance = (keyId && keySecret)
      ? new razorpay({ key_id: keyId, key_secret: keySecret })
      : null;
  }


  // Stripe Payment
  async createStripePayment(amount, currency = 'INR') {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        payment_method_types: ['card']
      });
      return paymentIntent;
    } catch (error) {
      throw new Error(`Stripe payment error: ${error.message}`);
    }
  }

  // Razorpay Payment (Better for India)
  async createRazorpayOrder(amount, orderId) {
    try {
      const order = await this.razorpayInstance.orders.create({
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: orderId,
        notes: {
          order_id: orderId
        }
      });
      return order;
    } catch (error) {
      throw new Error(`Razorpay error: ${error.message}`);
    }
  }

  // Verify Razorpay Signature
  async verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, signature) {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    return signature === expectedSignature;
  }

  // Process Affiliate Commission
  async processAffiliateCommission(supplementId, vendorId, amount) {
    const commission = amount * 0.05; // 5% commission
    // Update vendor balance or create commission record
    return { commission, vendor: vendorId };
  }
}

module.exports = new PaymentService();
