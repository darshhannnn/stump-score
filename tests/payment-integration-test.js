const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../server/models/User');
const paymentRoutes = require('../server/routes/paymentRoutes');
const crypto = require('crypto');
const Razorpay = require('razorpay');

// Initialize real Razorpay instance with sandbox keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Load test environment variables
dotenv.config({ path: path.join(__dirname, 'config/test.env') });

const app = express();
app.use(express.json());

// Mock auth middleware for testing
app.use((req, res, next) => {
  req.user = {
    _id: '507f1f77bcf86cd799439011', // Test user ID
    name: 'Test User',
    email: 'test@example.com'
  };
  next();
});

app.use('/api/payments', paymentRoutes);

describe('Payment Routes Integration Tests', () => {
  let testUser;
  
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI);
    
    // Create test user
    testUser = await User.create({
      _id: '507f1f77bcf86cd799439011',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      paymentHistory: []
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/payments/create-order', () => {
    it('should create a new order successfully', async () => {
      const response = await request(app)
        .post('/api/payments/create-order')
        .send({
          amount: 499,
          currency: 'INR',
          planType: 'monthly'
        });

      // Verify real Razorpay order format
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toMatch(/^order_/);
      expect(response.body).toHaveProperty('amount', 49900);
      expect(response.body).toHaveProperty('currency', 'INR');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/payments/create-order')
        .send({
          amount: 499
          // Missing currency and planType
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Missing required payment details');
    });
  });

  describe('POST /api/payments/verify', () => {
    it('should verify payment successfully', async () => {
      // First create an order
      const orderResponse = await request(app)
        .post('/api/payments/create-order')
        .send({
          amount: 499,
          currency: 'INR',
          planType: 'monthly'
        });

      // Generate test signature
      const paymentId = 'pay_test123';
      const orderId = orderResponse.body.id;
      const signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(orderId + '|' + paymentId)
        .digest('hex');

      const response = await request(app)
        .post('/api/payments/verify')
        .send({
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature,
          planType: 'monthly',
          amount: 499
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.user).toHaveProperty('isPremium', true);
      expect(response.body.user).toHaveProperty('currentPlan', 'monthly');
    });

    it('should reject invalid signature', async () => {
      const response = await request(app)
        .post('/api/payments/verify')
        .send({
          razorpay_payment_id: 'pay_test123',
          razorpay_order_id: 'order_test123',
          razorpay_signature: 'invalid_signature',
          planType: 'monthly',
          amount: 499
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid payment signature');
    });
  });

  describe('POST /api/payments/webhook', () => {
    it('should process payment.captured webhook', async () => {
      const webhookBody = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_webhook_test',
              order_id: 'order_webhook_test',
              amount: 49900,
              currency: 'INR',
              status: 'captured'
            }
          }
        }
      };

      const signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(webhookBody))
        .digest('hex');

      const response = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', signature)
        .send(webhookBody);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('received', true);
    });

    it('should reject webhook with invalid signature', async () => {
      const webhookBody = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_webhook_test'
            }
          }
        }
      };

      const response = await request(app)
        .post('/api/payments/webhook')
        .set('x-razorpay-signature', 'invalid_signature')
        .send(webhookBody);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid signature');
    });
  });

  describe('GET /api/payments/history', () => {
    it('should return payment history for user', async () => {
      // Add a test payment to user's history
      await User.findByIdAndUpdate(testUser._id, {
        $push: {
          paymentHistory: {
            orderId: 'test_order_1',
            paymentId: 'test_payment_1',
            planType: 'monthly',
            amount: 499,
            currency: 'INR',
            status: 'completed',
            date: new Date()
          }
        }
      });

      const response = await request(app)
        .get('/api/payments/history');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('orderId', 'test_order_1');
    });

    it('should handle non-existent user', async () => {
      // Temporarily remove test user
      await User.findByIdAndDelete(testUser._id);

      const response = await request(app)
        .get('/api/payments/history');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User not found');

      // Restore test user for other tests
      testUser = await User.create({
        _id: '507f1f77bcf86cd799439011',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword',
        paymentHistory: []
      });
    });
  });
});
