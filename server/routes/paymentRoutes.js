const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const config = require('../config/env');

// Lazily initialize the Razorpay SDK only if keys are configured
let razorpay = null;
if (config.razorpay.keyId && config.razorpay.keySecret) {
  try {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
    console.log('[payments] Razorpay SDK initialized');
  } catch (err) {
    console.warn('[payments] Razorpay SDK failed to initialize:', err.message);
  }
}

const hmac = (secret, payload) =>
  crypto.createHmac('sha256', secret).update(payload).digest('hex');

// @route   POST /api/payments/create-order
// @desc    Create a Razorpay order (real SDK if configured, mock otherwise)
// @access  Private
router.post('/create-order', auth, asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', planType } = req.body;

  if (!amount || !currency || !planType) {
    return res.status(400).json({ message: 'Missing required payment details' });
  }
  if (!['monthly', 'annual'].includes(planType)) {
    return res.status(400).json({ message: 'Invalid plan type. Must be "monthly" or "annual"' });
  }

  const amountInPaise = Math.round(amount * 100);
  let orderId;
  let source = 'mock';

  if (razorpay) {
    try {
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency,
        receipt: `receipt_${Date.now()}`,
        payment_capture: 1,
        notes: { userId: String(req.user._id), planType },
      });
      orderId = order.id;
      source = 'razorpay';
    } catch (err) {
      console.warn('[payments] Razorpay order creation failed, using mock order:', err.message);
    }
  }

  if (!orderId) {
    orderId = `order_${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }

  await Order.create({
    user: req.user._id,
    orderId,
    amount: amountInPaise,
    currency,
    planType,
    source,
  });

  res.json({ id: orderId, amount: amountInPaise, currency, source });
}));

// @route   POST /api/payments/verify
// @desc    Verify payment signature and upgrade user to premium
// @access  Private
router.post('/verify', auth, asyncHandler(async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, planType, amount } = req.body;

  if (!razorpay_payment_id || !razorpay_order_id) {
    return res.status(400).json({ message: 'Missing payment details' });
  }
  if (!['monthly', 'annual'].includes(planType)) {
    return res.status(400).json({ message: 'Invalid plan type' });
  }

  // Real signature verification: HMAC_SHA256(order_id|payment_id, key_secret)
  let verified = false;
  if (config.razorpay.keySecret) {
    const expected = hmac(config.razorpay.keySecret, `${razorpay_order_id}|${razorpay_payment_id}`);
    verified = expected === razorpay_signature;
    if (!verified && config.razorpay.devSkipVerify) {
      console.warn(`[payments] DEV MODE: signature verification failed but accepting payment ${razorpay_payment_id} (RAZORPAY_DEV_SKIP_VERIFY)`);
      verified = true;
    }
  } else {
    console.warn('[payments] No RAZORPAY_KEY_SECRET configured - accepting payment in development mode');
    verified = true;
  }

  if (!verified) {
    return res.status(400).json({ message: 'Invalid payment signature' });
  }

  // Calculate premium expiration
  const now = new Date();
  let premiumUntil;
  if (planType === 'monthly') {
    premiumUntil = new Date(now.setMonth(now.getMonth() + 1));
  } else {
    premiumUntil = new Date(now.setFullYear(now.getFullYear() + 1));
  }

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.isPremium = true;
  user.premiumUntil = premiumUntil;

  user.paymentHistory.push({
    planType,
    amount: amount ? amount / 100 : undefined, // paise -> rupees
    date: new Date(),
    paymentId: razorpay_payment_id,
  });

  await user.save();

  await Order.findOneAndUpdate(
    { orderId: razorpay_order_id },
    { status: 'paid', paymentId: razorpay_payment_id, paidAt: new Date() }
  );

  Notification.notify(user._id, 'premium', 'Premium activated! ✨',
    `Your ${planType} subscription is active until ${premiumUntil.toLocaleDateString()}. Enjoy AI predictions and advanced stats!`);

  res.json({
    success: true,
    message: 'Payment verified successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isPremium: user.isPremium,
      premiumUntil: user.premiumUntil
    }
  });
}));

// @route   POST /api/payments/webhook
// @desc    Razorpay webhook (payment.captured etc.) with signature verification
// @access  Public (verified by HMAC)
router.post('/webhook', asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];

  if (!config.razorpay.webhookSecret) {
    return res.status(503).json({ message: 'Webhook not configured (missing RAZORPAY_WEBHOOK_SECRET)' });
  }

  const expected = hmac(config.razorpay.webhookSecret, req.rawBody || '');
  if (expected !== signature) {
    return res.status(400).json({ message: 'Invalid webhook signature' });
  }

  const event = req.body;
  if (event.event === 'payment.captured') {
    const entity = event.payload?.payment?.entity;
    if (entity?.order_id) {
      const order = await Order.findOne({ orderId: entity.order_id });
      if (order && order.status !== 'paid') {
        order.status = 'paid';
        order.paymentId = entity.id;
        order.paidAt = new Date();
        await order.save();

        const user = await User.findById(order.user);
        if (user) {
          const now = new Date();
          const premiumUntil = order.planType === 'annual'
            ? new Date(now.setFullYear(now.getFullYear() + 1))
            : new Date(now.setMonth(now.getMonth() + 1));
          user.isPremium = true;
          user.premiumUntil = premiumUntil;
          user.paymentHistory.push({
            planType: order.planType,
            amount: order.amount / 100,
            date: new Date(),
            paymentId: entity.id,
          });
          await user.save();
          Notification.notify(user._id, 'premium', 'Premium activated! ✨',
            'Your payment was confirmed via webhook and premium is now active.');
        }
      }
    }
  }

  res.json({ received: true });
}));

// @route   GET /api/payments/history
// @desc    Get user payment history
// @access  Private
router.get('/history', auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user.paymentHistory);
}));

// @route   GET /api/payments/orders
// @desc    List this user's payment orders (audit trail)
// @access  Private
router.get('/orders', auth, asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json(orders);
}));

module.exports = router;
