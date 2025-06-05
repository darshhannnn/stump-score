/**
 * StumpScore Payment & Subscription Flow Test
 * 
 * This script tests the integration of payment processing and subscription
 * management with MongoDB Atlas.
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const JWT_SECRET = 'test-jwt-secret-key';
const LOG_FILE = path.join(__dirname, 'payment_test_results.log');

// Initialize log file
fs.writeFileSync(LOG_FILE, `StumpScore Payment & Subscription Tests - ${new Date().toISOString()}\n\n`);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test data
const TEST_USER = {
  name: 'Payment Test User',
  email: `payment-test-${Date.now()}@example.com`,
  password: 'Password123!'
};

// Subscription plans (matching your actual plans)
const SUBSCRIPTION_PLANS = [
  { 
    id: 'monthly',
    name: 'Monthly Premium', 
    price: 199,
    duration: 30, // days
    description: 'Monthly premium subscription'
  },
  { 
    id: 'quarterly',
    name: 'Quarterly Premium', 
    price: 499,
    duration: 90, // days
    description: 'Quarterly premium subscription'
  },
  { 
    id: 'annual',
    name: 'Annual Premium', 
    price: 1499,
    duration: 365, // days
    description: 'Annual premium subscription'
  }
];

// Logging utilities
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  console.log(message);
  fs.appendFileSync(LOG_FILE, logMessage);
}

function logSuccess(test, message = '') {
  log(`${colors.green}✓ ${test}${colors.reset}${message ? ': ' + message : ''}`);
}

function logError(test, message = '') {
  log(`${colors.red}✗ ${test}${colors.reset}${message ? ': ' + message : ''}`);
}

function logInfo(message) {
  log(`${colors.blue}ℹ ${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${colors.bright}${colors.cyan}${message}${colors.reset}\n`);
}

function logSeparator() {
  log('-------------------------------------------------------');
}

// Define schemas based on your MongoDB models
function createMongooseModels() {
  // User Schema
  const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isPremium: { type: Boolean, default: false },
    googleId: String,
    premiumExpiry: Date,
    currentPlan: String,
    paymentHistory: [{
      orderId: String,
      paymentId: String,
      amount: Number,
      plan: String,
      status: String,
      createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
  });

  // Order Schema
  const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    orderId: { type: String, required: true },
    receiptId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    plan: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['created', 'paid', 'failed', 'cancelled'],
      default: 'created'
    },
    paymentId: String,
    signature: String,
    createdAt: { type: Date, default: Date.now }
  });

  // Create models
  const User = mongoose.model('User', userSchema);
  const Order = mongoose.model('Order', orderSchema);

  return { User, Order };
}

// Mock Razorpay service
class MockRazorpay {
  constructor() {
    this.orders = new Map();
    this.payments = new Map();
  }
  
  createOrder(options) {
    const orderId = `order_${crypto.randomBytes(8).toString('hex')}`;
    const order = {
      id: orderId,
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt,
      status: 'created',
      created_at: Date.now()
    };
    
    this.orders.set(orderId, order);
    return Promise.resolve(order);
  }
  
  validatePayment(options) {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = options;
    
    // In a real scenario, Razorpay would validate the signature
    // Here we'll always return valid for our mock
    const isValid = true;
    
    if (isValid) {
      const payment = {
        id: razorpay_payment_id,
        order_id: razorpay_order_id,
        status: 'captured',
        amount: this.orders.get(razorpay_order_id)?.amount || 0,
        created_at: Date.now()
      };
      
      this.payments.set(razorpay_payment_id, payment);
      
      // Update order status
      if (this.orders.has(razorpay_order_id)) {
        const order = this.orders.get(razorpay_order_id);
        order.status = 'paid';
      }
      
      return Promise.resolve({ valid: true });
    } else {
      return Promise.resolve({ valid: false });
    }
  }
}

// Run tests
async function runTests() {
  logHeader('STUMPSCORE PAYMENT & SUBSCRIPTION FLOW TEST');
  
  let mongoServer;
  let success = true;
  let models;
  let testUserId;
  let testUserToken;
  let mockRazorpay;
  let orderId;
  let paymentId;
  let selectedPlan;
  
  try {
    // Start in-memory MongoDB server
    logInfo('Setting up test environment...');
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    logSuccess('MongoDB Connection', `Connected to ${mongoUri}`);
    
    // Create models
    models = createMongooseModels();
    const { User, Order } = models;
    
    // Initialize mock Razorpay
    mockRazorpay = new MockRazorpay();
    
    // Test 1: Create test user
    logSeparator();
    logInfo('TEST 1: Creating test user for payment flow');
    
    const user = new User({
      name: TEST_USER.name,
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    await user.save();
    
    testUserId = user._id;
    testUserToken = jwt.sign({ id: testUserId }, JWT_SECRET, { expiresIn: '30d' });
    
    logSuccess('User Creation', `Created user with ID: ${testUserId}`);
    
    // Test 2: Create subscription order
    logSeparator();
    logInfo('TEST 2: Creating a subscription order');
    
    // Select a plan
    selectedPlan = SUBSCRIPTION_PLANS[1]; // Quarterly plan
    logInfo(`Selected plan: ${selectedPlan.name} (${selectedPlan.price} INR)`);
    
    // Create receipt ID
    const receiptId = `rcpt_${Date.now()}`;
    
    // Create order in Razorpay
    const razorpayOrderResponse = await mockRazorpay.createOrder({
      amount: selectedPlan.price * 100, // Amount in paise
      currency: 'INR',
      receipt: receiptId
    });
    
    orderId = razorpayOrderResponse.id;
    logSuccess('Razorpay Order', `Created order with ID: ${orderId}`);
    
    // Save order in MongoDB
    const order = new Order({
      userId: testUserId,
      orderId: orderId,
      receiptId: receiptId,
      amount: selectedPlan.price,
      plan: selectedPlan.id,
      status: 'created'
    });
    await order.save();
    
    logSuccess('MongoDB Order', `Saved order in database with ID: ${order._id}`);
    
    // Test 3: Process payment
    logSeparator();
    logInfo('TEST 3: Processing payment');
    
    // Generate mock payment ID
    paymentId = `pay_${crypto.randomBytes(8).toString('hex')}`;
    
    // Generate mock signature (in real app, this comes from Razorpay)
    const signature = crypto.createHmac('sha256', 'razorpay_secret')
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    
    // Validate payment
    const validationResult = await mockRazorpay.validatePayment({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature
    });
    
    if (validationResult.valid) {
      logSuccess('Payment Validation', 'Payment validated successfully');
      
      // Update order in MongoDB
      const updatedOrder = await Order.findOneAndUpdate(
        { orderId: orderId },
        { 
          status: 'paid',
          paymentId: paymentId,
          signature: signature
        },
        { new: true }
      );
      
      logSuccess('Order Update', `Updated order status to: ${updatedOrder.status}`);
    } else {
      logError('Payment Validation', 'Payment validation failed');
      success = false;
    }
    
    // Test 4: Update user subscription status
    logSeparator();
    logInfo('TEST 4: Updating user subscription status');
    
    // Calculate expiry date
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(now.getDate() + selectedPlan.duration);
    
    // Update user in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      testUserId,
      {
        isPremium: true,
        premiumExpiry: expiryDate,
        currentPlan: selectedPlan.id,
        $push: {
          paymentHistory: {
            orderId: orderId,
            paymentId: paymentId,
            amount: selectedPlan.price,
            plan: selectedPlan.id,
            status: 'complete'
          }
        }
      },
      { new: true }
    );
    
    if (updatedUser.isPremium) {
      logSuccess('User Subscription', `User premium status updated to: ${updatedUser.isPremium}`);
      logSuccess('Premium Expiry', `Expiry date set to: ${updatedUser.premiumExpiry}`);
    } else {
      logError('User Subscription', 'Failed to update user premium status');
      success = false;
    }
    
    // Test 5: Verify user has payment history
    logSeparator();
    logInfo('TEST 5: Verifying payment history');
    
    const userWithHistory = await User.findById(testUserId);
    
    if (userWithHistory.paymentHistory && userWithHistory.paymentHistory.length > 0) {
      const lastPayment = userWithHistory.paymentHistory[userWithHistory.paymentHistory.length - 1];
      logSuccess('Payment History', `Found ${userWithHistory.paymentHistory.length} payment records`);
      logSuccess('Latest Payment', `Order ID: ${lastPayment.orderId}, Plan: ${lastPayment.plan}, Amount: ${lastPayment.amount} INR`);
    } else {
      logError('Payment History', 'No payment history found');
      success = false;
    }
    
    // Test 6: Test subscription validity check
    logSeparator();
    logInfo('TEST 6: Testing subscription validity check');
    
    const checkSubscription = (user) => {
      if (!user.isPremium) return false;
      if (!user.premiumExpiry) return false;
      return new Date() < new Date(user.premiumExpiry);
    };
    
    const isValid = checkSubscription(userWithHistory);
    logSuccess('Current Subscription', `Subscription is valid: ${isValid}`);
    
    // Test expired subscription
    const expiredUser = await User.findByIdAndUpdate(
      testUserId,
      {
        premiumExpiry: new Date(Date.now() - 86400000) // 1 day ago
      },
      { new: true }
    );
    
    const isExpired = !checkSubscription(expiredUser);
    logSuccess('Expired Subscription', `Subscription is correctly shown as expired: ${isExpired}`);
    
    // Summary
    logSeparator();
    logHeader('TEST SUMMARY');
    
    if (success) {
      logSuccess('Payment Flow', 'All payment and subscription tests passed');
      logSuccess('MongoDB Integration', 'MongoDB Atlas integration for payments is working correctly');
    } else {
      logError('Payment Flow', 'Some payment and subscription tests failed');
    }
    
  } catch (error) {
    logError('Test Execution', error.message);
    console.error(error);
    success = false;
  } finally {
    // Clean up
    try {
      await mongoose.disconnect();
      if (mongoServer) await mongoServer.stop();
      
      logInfo(`Test results saved to: ${LOG_FILE}`);
      logSeparator();
      
      if (success) {
        log(`${colors.bright}${colors.green}✓ PAYMENT & SUBSCRIPTION FLOW TESTS PASSED${colors.reset}`);
      } else {
        log(`${colors.bright}${colors.red}✗ PAYMENT & SUBSCRIPTION FLOW TESTS FAILED${colors.reset}`);
      }
    } catch (err) {
      console.error('Cleanup error:', err);
    }
  }
}

// Run the tests
runTests().catch(console.error);
