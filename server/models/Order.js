const mongoose = require('mongoose');

// Payment order audit trail (mirrors what we send/receive from Razorpay)
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  orderId: { type: String, required: true, index: true },
  paymentId: { type: String, default: null },
  amount: { type: Number, required: true }, // paise
  currency: { type: String, default: 'INR' },
  planType: { type: String, enum: ['monthly', 'annual'], required: true },
  status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
  source: { type: String, enum: ['razorpay', 'mock'], default: 'mock' },
  createdAt: { type: Date, default: Date.now },
  paidAt: { type: Date, default: null }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
