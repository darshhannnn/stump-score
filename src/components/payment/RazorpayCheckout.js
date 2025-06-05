import React, { useState } from 'react';
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBillingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Process payment with Razorpay - this will create an order on the backend
      // and open the Razorpay checkout modal
      const result = await paymentService.processPayment({
        plan: selectedPlan,
        paymentMethod: 'razorpay',
        billingInfo,
        user
      });

      console.log('Payment successful:', result);
      
      // The user's premium status is now updated in the database
      // We need to update the local user state to reflect premium status
      // This will happen automatically since the verify API endpoint returns the updated user
      
      if (onSuccess) {
        // Pass payment details to parent component
        onSuccess(result);
      } else {
        // Navigate to dashboard if no success handler provided
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Payment failed:', err);
      // Handle different error types from Razorpay and our backend
      setError(err.description || err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Your Subscription</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-6 p-4 bg-blue-50 rounded-md">
        <h3 className="text-lg font-semibold mb-2">{selectedPlan.name} Plan</h3>
        <p className="text-gray-600 mb-1">{selectedPlan.description}</p>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-blue-600">{selectedPlan.currency}{selectedPlan.price}</span>
          <span className="text-gray-500 ml-1">/{selectedPlan.period}</span>
        </div>
        {selectedPlan.trialDays > 0 && (
          <p className="mt-2 text-sm text-green-600 font-medium">
            Includes {selectedPlan.trialDays}-day free trial
          </p>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={billingInfo.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={billingInfo.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={billingInfo.phone}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 flex justify-center items-center rounded-md ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              `Pay with Razorpay - ${selectedPlan.currency}${selectedPlan.price}`
            )}
          </button>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          By clicking the button above, you agree to our Terms of Service and authorize StumpScore to charge your payment method
        </p>
      </form>
    </div>
  );
};

export default RazorpayCheckout;
