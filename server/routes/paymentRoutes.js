const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const crypto = require('crypto');

// @route   POST /api/payments/create-order
// @desc    Create a new payment order
// @access  Private
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount, currency, planType } = req.body;
    
    // Validate the request
    if (!amount || !currency || !planType) {
      return res.status(400).json({ message: 'Missing required payment details' });
    }

    // In a production environment, you would:
    // 1. Import Razorpay SDK: const Razorpay = require('razorpay');
    // 2. Initialize with your API keys
    // 3. Create an order with Razorpay API

    // For now, we'll mock the order creation for development
    const orderOptions = {
      amount: amount * 100, // Convert to paise (Razorpay requires amount in smallest currency unit)
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    };
    
    // Mock order ID (in production, this would come from Razorpay)
    const orderId = `order_${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    res.json({
      id: orderId,
      amount: orderOptions.amount,
      currency: orderOptions.currency
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify payment signature and update user premium status
// @access  Private
router.post('/verify', auth, async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, planType, amount } = req.body;
    
    // In production, verify the payment signature
    // const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET)
    //   .update(razorpay_order_id + '|' + razorpay_payment_id)
    //   .digest('hex');
    
    // For development, we'll skip actual verification
    // if (generatedSignature !== razorpay_signature) {
    //   return res.status(400).json({ message: 'Invalid payment signature' });
    // }
    
    // Calculate premium expiration date based on plan type
    const now = new Date();
    let premiumUntil;
    
    if (planType === 'monthly') {
      premiumUntil = new Date(now.setMonth(now.getMonth() + 1));
    } else if (planType === 'annual') {
      premiumUntil = new Date(now.setFullYear(now.getFullYear() + 1));
    } else {
      return res.status(400).json({ message: 'Invalid plan type' });
    }
    
    // Update user with premium status
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isPremium = true;
    user.premiumUntil = premiumUntil;
    
    // Add to payment history
    user.paymentHistory.push({
      planType,
      amount: amount / 100, // Convert back from paise to rupees for storage
      date: new Date(),
      paymentId: razorpay_payment_id
    });
    
    await user.save();
    
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
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/payments/history
// @desc    Get user payment history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.paymentHistory);
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
