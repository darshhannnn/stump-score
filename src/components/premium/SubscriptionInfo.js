import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import paymentService from '../../services/paymentService';

const SubscriptionInfo = ({ subscriptionDetails, formatDate }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  if (!subscriptionDetails) {
    return (
      <div className="text-center py-8">
        <p>No subscription information available.</p>
      </div>
    );
  }

  const handleChangePlan = () => {
    navigate('/premium', { state: { fromDashboard: true }});
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    setActionError(null);
    
    try {
      await paymentService.cancelSubscription(user.id);
      setActionSuccess('Your subscription has been cancelled successfully. You will still have premium access until the end of your current billing period.');
      setShowCancelModal(false);
      
      // Update subscription details to show cancelled status
      subscriptionDetails.status = 'cancelled';
      subscriptionDetails.autoRenew = false;
    } catch (error) {
      setActionError('Failed to cancel subscription. Please try again later.');
      console.error('Error cancelling subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsLoading(true);
    setActionError(null);
    
    try {
      await paymentService.reactivateSubscription(user.id);
      setActionSuccess('Your subscription has been reactivated successfully. Your premium benefits will continue uninterrupted.');
      
      // Update subscription details to show active status
      subscriptionDetails.status = 'active';
      subscriptionDetails.autoRenew = true;
    } catch (error) {
      setActionError('Failed to reactivate subscription. Please try again later.');
      console.error('Error reactivating subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Subscription Management</h2>
      
      {actionSuccess && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p>{actionSuccess}</p>
        </div>
      )}
      
      {actionError && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{actionError}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">
              {subscriptionDetails.plan.name}
            </h3>
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                subscriptionDetails.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : subscriptionDetails.status === 'cancelled' 
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
              }`}>
                {subscriptionDetails.status === 'active' 
                  ? 'ACTIVE' 
                  : subscriptionDetails.status === 'cancelled' 
                    ? 'CANCELLED'
                    : 'TRIAL'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Subscription Plan</h4>
              <p className="text-base font-medium text-gray-900">{subscriptionDetails.plan.name}</p>
              <p className="text-sm text-gray-600 mt-1">{subscriptionDetails.plan.description}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Amount</h4>
              <p className="text-base font-medium text-gray-900">
                {subscriptionDetails.plan.currency}{subscriptionDetails.plan.price} per {subscriptionDetails.plan.period}
              </p>
              {subscriptionDetails.discount > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  You're saving {subscriptionDetails.plan.currency}{subscriptionDetails.discount}!
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Started On</h4>
              <p className="text-base text-gray-900">{formatDate(subscriptionDetails.startDate)}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Current Period Ends</h4>
              <p className="text-base text-gray-900">{formatDate(subscriptionDetails.nextBillingDate)}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Auto Renewal</h4>
              <p className={`text-base ${subscriptionDetails.autoRenew ? 'text-green-600' : 'text-red-600'}`}>
                {subscriptionDetails.autoRenew ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-800 mb-3">Payment Method</h4>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg mb-6">
              <div className="flex-shrink-0 mr-3">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {subscriptionDetails.paymentMethod.type === 'card' 
                    ? `${subscriptionDetails.paymentMethod.brand} •••• ${subscriptionDetails.paymentMethod.last4}` 
                    : subscriptionDetails.paymentMethod.type}
                </p>
                {subscriptionDetails.paymentMethod.type === 'card' && (
                  <p className="text-xs text-gray-500">
                    Expires {subscriptionDetails.paymentMethod.expiryMonth}/{subscriptionDetails.paymentMethod.expiryYear}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={handleChangePlan}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Change Plan
              </button>
              
              {subscriptionDetails.status === 'active' && (
                <button 
                  onClick={() => setShowCancelModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  Cancel Subscription
                </button>
              )}
              
              {subscriptionDetails.status === 'cancelled' && (
                <button 
                  onClick={handleReactivateSubscription}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Reactivate Subscription'}
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Billing History</h4>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscriptionDetails.billingHistory.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="px-4 py-3 text-sm text-gray-900">{formatDate(item.date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.amount}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : item.status === 'failed' 
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {subscriptionDetails.billingHistory.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No billing history available yet.</p>
          )}
        </div>
      </div>
      
      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                      Cancel Subscription
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to cancel your premium subscription? You'll lose access to premium features at the end of your current billing period.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  onClick={handleCancelSubscription}
                  disabled={isLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {isLoading ? 'Processing...' : 'Cancel Subscription'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCancelModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Keep Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionInfo;
