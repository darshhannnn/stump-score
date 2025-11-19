const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const Razorpay = require('razorpay');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: 'YOUR_RAZORPAY_KEY_ID',
  key_secret: 'YOUR_RAZORPAY_KEY_SECRET'
});

router.post('/create-order', auth, createOrder);
router.post('/verify', auth, verifyPayment);

router.post('/test-payment', auth, async (req, res) => {
  try {
    const options = {
      amount: 49900,
      currency: 'INR',
      receipt: 'test_' + Date.now()
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/test-order', async (req, res) => {
  try {
    const options = {
      amount: req.body.amount,
      currency: req.body.currency,
      receipt: 'receipt_' + Date.now()
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
