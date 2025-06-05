import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PAYMENT_PLANS } from '../services/paymentService';
import RazorpayCheckout from '../components/payment/RazorpayCheckout';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SubscriptionPage = () => {
  const { user, isPremium } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(PAYMENT_PLANS.MONTHLY);
  const [step, setStep] = useState('select-plan'); // 'select-plan' or 'checkout'
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  // If user is already premium, redirect to dashboard
  React.useEffect(() => {
    if (isPremium) {
      navigate('/dashboard');
    }
  }, [isPremium, navigate]);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setStep('checkout');
  };

  const handlePaymentSuccess = (details) => {
    setPaymentDetails(details);
    setPaymentSuccess(true);
    // In a real app, you would update the user's subscription status here
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  const handleCancel = () => {
    setStep('select-plan');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {paymentSuccess ? (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
            <div className="mb-6 text-green-500">
              <svg className="w-20 h-20 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for subscribing to StumpScore Premium. Your transaction has been completed.
            </p>
            <div className="mb-6 p-4 bg-gray-50 rounded-md text-left">
              <h3 className="font-semibold mb-2">Transaction Details:</h3>
              <p><span className="font-medium">Transaction ID:</span> {paymentDetails?.transactionId}</p>
              <p><span className="font-medium">Amount:</span> {selectedPlan.currency}{selectedPlan.price}</p>
              <p><span className="font-medium">Plan:</span> {selectedPlan.name}</p>
              <p><span className="font-medium">Date:</span> {new Date().toLocaleString()}</p>
            </div>
            <p className="text-gray-600 mb-6">
              You will be redirected to your dashboard shortly.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        ) : step === 'select-plan' ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Upgrade to StumpScore Premium</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Get access to exclusive predictions, advanced statistics, and personalized insights to stay ahead of the game.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Monthly Plan */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{PAYMENT_PLANS.MONTHLY.name}</h2>
                  <p className="text-gray-600 mb-6">{PAYMENT_PLANS.MONTHLY.description}</p>
                  <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-bold text-blue-600">{PAYMENT_PLANS.MONTHLY.currency}{PAYMENT_PLANS.MONTHLY.price}</span>
                    <span className="text-gray-500 ml-1">/{PAYMENT_PLANS.MONTHLY.period}</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>AI-powered match predictions</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Advanced player statistics</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Personalized notifications</span>
                    </li>
                  </ul>
                  {PAYMENT_PLANS.MONTHLY.trialDays > 0 && (
                    <p className="text-sm text-green-600 font-medium mb-6">
                      Includes {PAYMENT_PLANS.MONTHLY.trialDays}-day free trial
                    </p>
                  )}
                  <button
                    onClick={() => handlePlanSelect(PAYMENT_PLANS.MONTHLY)}
                    className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Select Monthly Plan
                  </button>
                </div>
              </div>
              
              {/* Annual Plan */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden relative transition-transform hover:scale-105">
                <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 rounded-bl-lg text-sm font-medium">
                  Best Value
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{PAYMENT_PLANS.ANNUAL.name}</h2>
                  <p className="text-gray-600 mb-6">{PAYMENT_PLANS.ANNUAL.description}</p>
                  <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-bold text-blue-600">{PAYMENT_PLANS.ANNUAL.currency}{PAYMENT_PLANS.ANNUAL.price}</span>
                    <span className="text-gray-500 ml-1">/{PAYMENT_PLANS.ANNUAL.period}</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Everything in Monthly plan</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Priority access to new features</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>67% savings compared to monthly</span>
                    </li>
                  </ul>
                  {PAYMENT_PLANS.ANNUAL.trialDays > 0 && (
                    <p className="text-sm text-green-600 font-medium mb-6">
                      Includes {PAYMENT_PLANS.ANNUAL.trialDays}-day free trial
                    </p>
                  )}
                  <button
                    onClick={() => handlePlanSelect(PAYMENT_PLANS.ANNUAL)}
                    className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Select Annual Plan
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Why Choose StumpScore Premium?</h3>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="p-4">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Make Informed Decisions</h4>
                  <p className="text-gray-600">Use our AI-powered predictions to make smarter decisions for fantasy cricket and more.</p>
                </div>
                <div className="p-4">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Deep Statistical Analysis</h4>
                  <p className="text-gray-600">Access detailed player and team statistics that you won't find anywhere else.</p>
                </div>
                <div className="p-4">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Personalized Alerts</h4>
                  <p className="text-gray-600">Get timely notifications about your favorite teams, players, and upcoming matches.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleCancel}
              className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Plans
            </button>
            
            <RazorpayCheckout
              selectedPlan={selectedPlan}
              onSuccess={handlePaymentSuccess}
              onCancel={handleCancel}
            />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default SubscriptionPage;
