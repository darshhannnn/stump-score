import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import paymentService, { PAYMENT_PLANS } from '../../services/paymentService';
import { useNavigate } from 'react-router-dom';

const RazorpayCheckout = ({ onSuccess, onCancel, selectedPlan = PAYMENT_PLANS.MONTHLY }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [billingInfo, setBillingInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: ''
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Validate user is logged in
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/payment' } } });
    }
  }, [user, navigate]);

  // Field validation
  const validateFields = () => {
    const errors = {};
    
    if (!billingInfo.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!billingInfo.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(billingInfo.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!billingInfo.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(billingInfo.phone)) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillingInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate fields before proceeding
    if (!validateFields()) {
      return;
    }
    
    setLoading(true);

    try {
      const result = await paymentService.processSubscription(selectedPlan.id, {
        ...billingInfo,
        userId: user.uid
      });

      if (result.success) {
        onSuccess(result);
        navigate('/premium-dashboard');
      } else {
        setError(result.message || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      let errorMessage;
      
      switch (error.code) {
        case 'BAD_REQUEST_ERROR':
          errorMessage = 'Invalid payment details. Please check and try again.';
          break;
        case 'PAYMENT_CANCELLED':
          errorMessage = 'Payment was cancelled. Please try again.';
          break;
        case 'NETWORK_ERROR':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        default:
          errorMessage = error.message || 'Payment failed. Please try again.';
      }
      
      setError(errorMessage);
      onCancel();
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Payment</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
          </svg>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={billingInfo.name}
            onChange={handleInputChange}
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.name && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
          )}
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={billingInfo.email}
            onChange={handleInputChange}
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
          )}
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={billingInfo.phone}
            onChange={handleInputChange}
            required
            pattern="[0-9]{10}"
            placeholder="10-digit mobile number"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {validationErrors.phone && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-semibold text-lg mb-2">{selectedPlan.name}</h3>
          <p className="text-gray-600">{selectedPlan.description}</p>
          <div className="mt-2 text-xl font-bold text-blue-600">
            ₹{selectedPlan.price}
            <span className="text-sm text-gray-500 font-normal">
              /{selectedPlan.period}
            </span>
          </div>
          
          {selectedPlan.trialDays > 0 && (
            <p className="mt-2 text-sm text-green-600">
              Includes {selectedPlan.trialDays}-day free trial
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading || Object.keys(validationErrors).length > 0}
          className={`w-full py-3 px-4 text-white font-semibold rounded-md ${
            loading || Object.keys(validationErrors).length > 0
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors flex items-center justify-center`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            `Pay ₹${selectedPlan.price}`
          )}
        </button>

        <p className="mt-4 text-xs text-gray-500 text-center">
          By completing this purchase, you agree to our{' '}
          <a href="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </form>
    </div>
  );
};

export default RazorpayCheckout;
