// Payment service using Razorpay integration with MongoDB backend
import { RAZORPAY_CONFIG } from './razorpayConfig';
import axios from 'axios';

// API URLs
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const PAYMENT_API = `${API_BASE_URL}/payments`;

// Helper to load Razorpay script with retries
const loadRazorpayScript = (retries = 3) => {
  return new Promise((resolve) => {
    const tryLoad = (attemptsLeft) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      
      script.onload = () => {
        resolve(true);
      };
      
      script.onerror = () => {
        if (attemptsLeft > 0) {
          console.log(`Retrying script load, ${attemptsLeft} attempts left`);
          setTimeout(() => tryLoad(attemptsLeft - 1), 1000);
        } else {
          resolve(false);
        }
      };
      
      document.body.appendChild(script);
    };
    
    tryLoad(retries);
  });
};

// Create an axios instance with auth token and interceptors
const getAuthAxios = () => {
  const token = localStorage.getItem('scorex_auth_token');
  const instance = axios.create({
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  });

  // Add response interceptor for token expiry
  instance.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        // Token expired - redirect to login
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Validate currency and amount
const validatePaymentDetails = (amount, currency) => {
  if (!amount || amount <= 0) {
    throw new Error('Invalid payment amount');
  }

  if (!currency || !['INR', 'USD'].includes(currency)) {
    throw new Error('Invalid or unsupported currency');
  }

  // Additional validation for INR
  if (currency === 'INR' && amount % 1 !== 0) {
    throw new Error('Amount must be in whole rupees');
  }
};

// Sample payment plans
export const PAYMENT_PLANS = {
  MONTHLY: {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 199,
    currency: 'INR',
    period: 'month',
    description: 'Monthly premium subscription',
    features: [
      'Advanced match predictions',
      'Personalized dashboard',
      'Ad-free experience',
      'Premium statistics'
    ],
    trialDays: 14
  },
  ANNUAL: {
    id: 'annual',
    name: 'Annual Plan',
    price: 1999,
    currency: 'INR',
    period: 'year',
    description: 'Annual premium subscription (Save 16%)',
    features: [
      'Advanced match predictions',
      'Personalized dashboard',
      'Ad-free experience',
      'Premium statistics',
      '2 months free'
    ],
    trialDays: 14
  }
};

// Mock payment methods supported
export const PAYMENT_METHODS = [
  { id: 'card', name: 'Credit/Debit Card', icon: 'credit-card' },
  { id: 'upi', name: 'UPI', icon: 'mobile' },
  { id: 'netbanking', name: 'Net Banking', icon: 'bank' },
  { id: 'wallet', name: 'Paytm/PhonePe', icon: 'wallet' }
];

const paymentService = {
  // Process a subscription payment using Razorpay
  processSubscription: async (planId, billingInfo) => {
    // Validate plan
    const plan = PAYMENT_PLANS[planId.toUpperCase()];
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }

    // Validate amount and currency
    validatePaymentDetails(plan.price, plan.currency);

    // Make sure Razorpay script is loaded
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Failed to load payment gateway. Please check your internet connection and try again.');
    }

    // Create an order through our backend
    const authAxios = getAuthAxios();
    let orderId;

    try {
      const orderResponse = await authAxios.post(`${PAYMENT_API}/create-order`, {
        amount: plan.price,
        currency: plan.currency,
        planType: plan.id
      });

      orderId = orderResponse.data.id;
    } catch (error) {
      console.error('Order creation failed:', error);
      throw {
        code: error.response?.status === 401 ? 'AUTH_ERROR' : 'ORDER_CREATION_FAILED',
        message: error.response?.data?.message || 'Failed to create payment order. Please try again.'
      };
    }

    // Return a promise that resolves when payment is complete
    return new Promise((resolve, reject) => {
      const options = {
        key: RAZORPAY_CONFIG.key_id,
        amount: plan.price * 100, // Amount in paise
        currency: plan.currency,
        name: RAZORPAY_CONFIG.name,
        description: `${plan.name} - ${plan.description}`,
        image: RAZORPAY_CONFIG.image,
        order_id: orderId,
        retry: {
          enabled: true,
          max_count: 3
        },
        handler: async function(response) {
          try {
            // Verify payment with backend
            const verifyResponse = await authAxios.post(`${PAYMENT_API}/verify`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              planType: plan.id,
              amount: plan.price * 100 // Amount in paise
            });

            resolve({
              success: true,
              transactionId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              plan,
              amount: plan.price,
              currency: plan.currency,
              timestamp: new Date().toISOString(),
              user: verifyResponse.data.user,
              payment: verifyResponse.data.payment
            });
          } catch (error) {
            console.error('Payment verification failed:', error);
            reject({
              code: error.response?.status === 401 ? 'AUTH_ERROR' : 'VERIFICATION_FAILED',
              message: error.response?.data?.message || 'Payment verification failed'
            });
          }
        },
        prefill: {
          name: billingInfo.name,
          email: billingInfo.email,
          contact: billingInfo.phone
        },
        notes: {
          planId: plan.id,
          userId: billingInfo.userId
        },
        theme: RAZORPAY_CONFIG.theme,
        modal: {
          backdropclose: false,
          escape: false,
          handleback: true,
          ondismiss: function() {
            reject({
              code: 'PAYMENT_CANCELLED',
              message: 'Payment was cancelled'
            });
          }
        }
      };

      // Configure payment failures
      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function(response) {
        reject({
          code: response.error.code,
          message: response.error.description,
          source: response.error.source,
          step: response.error.step,
          reason: response.error.reason,
          paymentId: response.error.metadata.payment_id
        });
      });

      // Open Razorpay checkout
      razorpay.open();
    });
  },

  // Get subscription details for a user
  getSubscriptionDetails: async () => {
    try {
      const authAxios = getAuthAxios();
      const response = await authAxios.get(`${API_BASE_URL}/users/subscription`);
      return response.data;
    } catch (error) {
      console.error('Failed to get subscription details:', error);
      throw new Error(error.response?.data?.message || 'Failed to get subscription details');
    }
  },

  // Get payment history
  getPaymentHistory: async () => {
    try {
      const authAxios = getAuthAxios();
      const response = await authAxios.get(`${PAYMENT_API}/history`);
      return response.data;
    } catch (error) {
      console.error('Failed to get payment history:', error);
      throw new Error(error.response?.data?.message || 'Failed to get payment history');
    }
  },

  // Cancel a subscription
  cancelSubscription: async () => {
    try {
      const authAxios = getAuthAxios();
      const response = await authAxios.post(`${API_BASE_URL}/users/subscription/cancel`);
      return response.data;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel subscription');
    }
  }
};

export default paymentService;
