import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import paymentService, { PAYMENT_METHODS } from '../services/paymentService';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, upgradeToPremium } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    saveCard: false
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/payment' } } });
      return;
    }

    // Get selected plan from location state or redirect back to premium page
    if (location.state?.plan) {
      setSelectedPlan(location.state.plan);
    } else {
      navigate('/premium');
    }
  }, [isAuthenticated, navigate, location]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const formatCardNumber = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    // Add space after every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim().substring(0, 19);
  };

  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setFormData({
      ...formData,
      cardNumber: formattedValue
    });
    
    if (errors.cardNumber) {
      setErrors({
        ...errors,
        cardNumber: null
      });
    }
  };

  const handleExpiryDateChange = (e) => {
    let value = e.target.value;
    
    // Remove non-digits
    value = value.replace(/\D/g, '');
    
    // Format as MM/YY
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    setFormData({
      ...formData,
      expiryDate: value
    });
    
    if (errors.expiryDate) {
      setErrors({
        ...errors,
        expiryDate: null
      });
    }
  };

  const validateForm = () => {
    if (selectedPaymentMethod === 'card') {
      const validation = paymentService.validateCardDetails(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      // Process payment
      const paymentResult = await paymentService.processPayment({
        plan: selectedPlan,
        paymentMethod: selectedPaymentMethod,
        cardDetails: selectedPaymentMethod === 'card' ? formData : null,
        billingInfo: {
          name: user?.name || formData.cardholderName,
          email: user?.email
        }
      });
      
      // Upgrade user to premium
      await upgradeToPremium();
      
      setPaymentSuccess(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/premium-dashboard');
      }, 2000);
    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentError(error.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!selectedPlan) {
    return (
      <div className="pt-28 pb-10 min-h-screen bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
            <p>Loading payment information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-10 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Complete Your Purchase</h1>
            <p className="text-gray-600">You're just one step away from premium cricket insights</p>
          </div>
          
          {paymentSuccess ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-4">Thank you for subscribing to StumpScore Premium!</p>
              <p className="text-sm text-gray-500 mb-4">You will be redirected to your premium dashboard shortly...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Order summary */}
                <div className="bg-blue-800 text-white p-6 md:w-2/5">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                  <div className="border-b border-blue-700 pb-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <span>Plan</span>
                      <span className="font-medium">{selectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Duration</span>
                      <span className="font-medium">1 {selectedPlan.period}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trial period</span>
                      <span className="font-medium">{selectedPlan.trialDays} days</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>{selectedPlan.currency}{selectedPlan.price}</span>
                  </div>
                  <div className="mt-6">
                    <div className="bg-blue-700 rounded-lg p-4 text-sm">
                      <p className="mb-2 font-medium">✨ Premium Benefits</p>
                      <ul className="space-y-1">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Advanced match predictions</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Personalized dashboard</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Ad-free experience</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>In-depth statistics</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Payment form */}
                <div className="p-6 md:w-3/5">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Details</h2>
                  
                  {paymentError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                      <p>{paymentError}</p>
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Method</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {PAYMENT_METHODS.map(method => (
                        <button
                          key={method.id}
                          type="button"
                          className={`flex items-center justify-center border rounded-md py-2 px-3 ${
                            selectedPaymentMethod === method.id 
                              ? 'border-blue-500 bg-blue-50 text-blue-600' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                        >
                          <span className="mr-2">
                            {method.icon === 'credit-card' && (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                              </svg>
                            )}
                            {method.icon === 'bank' && (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path>
                              </svg>
                            )}
                            {method.icon === 'mobile' && (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                              </svg>
                            )}
                            {method.icon === 'wallet' && (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
                              </svg>
                            )}
                          </span>
                          {method.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <form onSubmit={handleSubmit}>
                    {selectedPaymentMethod === 'card' && (
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                          <input
                            type="text"
                            id="cardNumber"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="1234 5678 9012 3456"
                            maxLength="19"
                            className={`w-full border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                          {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                            <input
                              type="text"
                              id="expiryDate"
                              name="expiryDate"
                              value={formData.expiryDate}
                              onChange={handleExpiryDateChange}
                              placeholder="MM/YY"
                              maxLength="5"
                              className={`w-full border ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>}
                          </div>
                          
                          <div>
                            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                            <input
                              type="text"
                              id="cvv"
                              name="cvv"
                              value={formData.cvv}
                              onChange={handleInputChange}
                              placeholder="123"
                              maxLength="4"
                              className={`w-full border ${errors.cvv ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            {errors.cvv && <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>}
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                          <input
                            type="text"
                            id="cardholderName"
                            name="cardholderName"
                            value={formData.cardholderName}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className={`w-full border ${errors.cardholderName ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          />
                          {errors.cardholderName && <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>}
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="saveCard"
                            name="saveCard"
                            checked={formData.saveCard}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="saveCard" className="ml-2 block text-sm text-gray-700">
                            Save card for future payments
                          </label>
                        </div>
                      </div>
                    )}
                    
                    {selectedPaymentMethod === 'upi' && (
                      <div className="text-center py-6">
                        <div className="bg-gray-100 rounded-lg p-4 inline-block mb-4">
                          <svg className="w-20 h-20 mx-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <path d="M8 7v10"></path>
                            <path d="M16 7v10"></path>
                            <path d="M7 12h10"></path>
                          </svg>
                        </div>
                        <p className="mb-2 font-medium">Scan QR Code with UPI App</p>
                        <p className="text-sm text-gray-600 mb-4">or enter UPI ID: stumpscore@ybl</p>
                        <p className="text-xs text-gray-500">*This is a mock UPI implementation</p>
                      </div>
                    )}
                    
                    {(selectedPaymentMethod === 'netbanking' || selectedPaymentMethod === 'wallet') && (
                      <div className="text-center py-6">
                        <p className="mb-4">Click the button below to continue to {
                          selectedPaymentMethod === 'netbanking' ? 'Net Banking' : 'Wallet'
                        } payment page.</p>
                        <p className="text-xs text-gray-500 mb-4">*This is a mock implementation</p>
                      </div>
                    )}
                    
                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition duration-300 flex justify-center items-center ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
                      >
                        {isProcessing ? (
                          <>
                            <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                            Processing...
                          </>
                        ) : (
                          `Pay ${selectedPlan.currency}${selectedPlan.price}`
                        )}
                      </button>
                    </div>
                    
                    <p className="mt-4 text-xs text-gray-500 text-center">
                      By completing this purchase, you agree to our <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Link to="/premium" className="text-blue-600 hover:underline text-sm font-medium">
              ← Back to Premium Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
