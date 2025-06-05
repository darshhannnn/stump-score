// Payment service using Razorpay integration with MongoDB backend
import { RAZORPAY_CONFIG } from './razorpayConfig';
import axios from 'axios';

// API URLs
const API_BASE_URL = 'http://localhost:5000/api';
const PAYMENT_API = `${API_BASE_URL}/payments`;

// Helper to load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Create an axios instance with auth token
const getAuthAxios = () => {
  const token = localStorage.getItem('stumpscore_auth_token');
  return axios.create({
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  });
};

// Sample payment plans
export const PAYMENT_PLANS = {
  MONTHLY: {
    id: 'monthly',
    name: 'Monthly',
    price: 50,
    currency: '₹',
    period: 'month',
    description: 'Monthly premium subscription',
    trialDays: 14
  },
  ANNUAL: {
    id: 'annual',
    name: 'Annual',
    price: 200,
    currency: '₹',
    period: 'year',
    description: 'Annual premium subscription (Save 67%)',
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
  // Process a payment using Razorpay
  processPayment: async (paymentDetails) => {
    const { plan, paymentMethod, cardDetails, billingInfo, user } = paymentDetails;
    
    console.log('Processing payment with Razorpay:', {
      plan,
      paymentMethod,
      billingInfo
    });
    
    // Make sure Razorpay script is loaded
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }
    
    // Create an order on the backend
    const authAxios = getAuthAxios();
    let orderId;
    
    try {
      // Create order through our backend API
      const orderResponse = await authAxios.post(`${PAYMENT_API}/create-order`, {
        amount: plan.price,
        currency: plan.currency || 'INR',
        planType: plan.id
      });
      
      orderId = orderResponse.data.id;
    } catch (error) {
      console.error('Order creation failed:', error);
      throw new Error('Failed to create payment order');
    }
    
    // Calculate amount in paise (Razorpay uses smallest currency unit)
    const amountInPaise = plan.price * 100;
    
    // Return a promise that resolves when payment is complete
    return new Promise((resolve, reject) => {
      const options = {
        key: RAZORPAY_CONFIG.key_id,
        amount: amountInPaise,
        currency: plan.currency || 'INR',
        name: RAZORPAY_CONFIG.name,
        description: `${plan.name} - ${plan.description}`,
        image: RAZORPAY_CONFIG.image,
        order_id: orderId, // This should come from your backend in production
        handler: async function(response) {
          try {
            // Verify the payment with our backend
            const authAxios = getAuthAxios();
            const verifyResponse = await authAxios.post(`${PAYMENT_API}/verify`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id || orderId,
              razorpay_signature: response.razorpay_signature,
              planType: plan.id,
              amount: amountInPaise
            });
            
            // Payment successful and verified
            resolve({
              success: true,
              transactionId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id || orderId,
              signature: response.razorpay_signature,
              plan,
              amount: plan.price,
              currency: plan.currency,
              timestamp: new Date().toISOString(),
              paymentMethod,
              receiptUrl: '#',
              user: verifyResponse.data.user
            });
          } catch (error) {
            console.error('Payment verification failed:', error);
            reject({
              error: 'verification_failed',
              description: 'Payment verification failed',
              message: error.response?.data?.message || 'Failed to verify payment'
            });
          }
        },

        prefill: {
          name: user?.name || billingInfo?.name || '',
          email: user?.email || billingInfo?.email || '',
          contact: billingInfo?.phone || ''
        },
        notes: {
          planId: plan.id,
          userId: user?.id || ''
        },
        theme: RAZORPAY_CONFIG.theme
      };
      
      const razorpay = new window.Razorpay(options);
      
      // Handle payment failures
      razorpay.on('payment.failed', function(response) {
        reject({
          error: response.error.code,
          description: response.error.description,
          source: response.error.source,
          step: response.error.step,
          reason: response.error.reason
        });
      });
      
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
  },

  
  // Reactivate a cancelled subscription
  reactivateSubscription: async () => {
    try {
      const authAxios = getAuthAxios();
      const response = await authAxios.post(`${API_BASE_URL}/users/subscription/reactivate`);
      
      return response.data;
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
      throw new Error(error.response?.data?.message || 'Failed to reactivate subscription');
    }
  },

  
  // Change subscription plan
  changePlan: async (newPlan) => {
    try {
      const authAxios = getAuthAxios();
      const response = await authAxios.post(`${API_BASE_URL}/users/subscription/change-plan`, {
        planId: newPlan.id
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to change subscription plan:', error);
      throw new Error(error.response?.data?.message || 'Failed to change subscription plan');
    }
  },

  
  // Validate card details (basic validation)
  validateCardDetails: (cardDetails) => {
    const { cardNumber, expiryDate, cvv, cardholderName } = cardDetails;
    
    const errors = {};
    
    // Simple validation, a real app would use a library like card-validator
    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      errors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    
    if (!expiryDate || !expiryDate.match(/^\d{2}\/\d{2}$/)) {
      errors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    } else {
      const [month, year] = expiryDate.split('/');
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;
      
      if (parseInt(year, 10) < currentYear || 
         (parseInt(year, 10) === currentYear && parseInt(month, 10) < currentMonth)) {
        errors.expiryDate = 'Card has expired';
      }
    }
    
    if (!cvv || cvv.length < 3 || cvv.length > 4) {
      errors.cvv = 'Please enter a valid CVV';
    }
    
    if (!cardholderName || cardholderName.trim().length < 3) {
      errors.cardholderName = 'Please enter the cardholder name';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

export default paymentService;
