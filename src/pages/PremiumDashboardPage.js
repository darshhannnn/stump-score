import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import paymentService from '../services/paymentService';

// Dashboard components - these would be separate files in a larger app
import MatchPredictions from '../components/premium/MatchPredictions';
import PremiumStats from '../components/premium/PremiumStats';
import SubscriptionInfo from '../components/premium/SubscriptionInfo';

const PremiumDashboardPage = () => {
  const { user, isPremium } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is premium
    if (!isPremium()) {
      navigate('/premium');
      return;
    }

    const loadSubscriptionDetails = async () => {
      try {
        const details = await paymentService.getSubscriptionDetails(user.id);
        setSubscriptionDetails(details);
      } catch (err) {
        console.error('Error loading subscription details:', err);
        setError('Could not load your subscription details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscriptionDetails();
  }, [user, isPremium, navigate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="pt-28 pb-10 min-h-screen bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
            <p>Loading your premium dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-10 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-blue-900 mb-2">Premium Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name || 'Premium User'}</p>
            </div>
            
            {subscriptionDetails && (
              <div className="mt-4 md:mt-0 bg-white rounded-lg shadow-sm py-2 px-4 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">Premium Plan:</span> {subscriptionDetails.plan.name}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Next billing:</span> {formatDate(subscriptionDetails.nextBillingDate)}
                </p>
              </div>
            )}
          </div>

          {/* Dashboard Tabs */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="border-b">
              <nav className="-mb-px flex">
                <button
                  className={`py-4 px-6 border-b-2 ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  } font-medium focus:outline-none`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button
                  className={`py-4 px-6 border-b-2 ${
                    activeTab === 'predictions'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  } font-medium focus:outline-none`}
                  onClick={() => setActiveTab('predictions')}
                >
                  Match Predictions
                </button>
                <button
                  className={`py-4 px-6 border-b-2 ${
                    activeTab === 'stats'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  } font-medium focus:outline-none`}
                  onClick={() => setActiveTab('stats')}
                >
                  Statistics
                </button>
                <button
                  className={`py-4 px-6 border-b-2 ${
                    activeTab === 'subscription'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  } font-medium focus:outline-none`}
                  onClick={() => setActiveTab('subscription')}
                >
                  Subscription
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Your Premium Overview</h2>
                  
                  {/* Dashboard Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
                      <h3 className="text-lg font-semibold mb-2">Upcoming Matches</h3>
                      <p className="text-3xl font-bold mb-2">5</p>
                      <p className="text-sm text-blue-100">Predictions available for all matches</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-md p-6 text-white">
                      <h3 className="text-lg font-semibold mb-2">Prediction Accuracy</h3>
                      <p className="text-3xl font-bold mb-2">85.7%</p>
                      <p className="text-sm text-yellow-100">Based on last 28 matches</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
                      <h3 className="text-lg font-semibold mb-2">Premium Insights</h3>
                      <p className="text-3xl font-bold mb-2">12</p>
                      <p className="text-sm text-green-100">New insights available today</p>
                    </div>
                  </div>
                  
                  {/* Recent Activity & Upcoming Matches */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Activity */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <ul className="divide-y divide-gray-200">
                          <li className="py-3">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 bg-blue-100 rounded-full p-1">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-800">Premium activated</p>
                                <p className="text-xs text-gray-500">Today at 10:30 AM</p>
                              </div>
                            </div>
                          </li>
                          <li className="py-3">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 bg-green-100 rounded-full p-1">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-800">New prediction available</p>
                                <p className="text-xs text-gray-500">Yesterday at 6:45 PM</p>
                              </div>
                            </div>
                          </li>
                          <li className="py-3">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 bg-purple-100 rounded-full p-1">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-800">Stats updated</p>
                                <p className="text-xs text-gray-500">May 30, 2025</p>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    {/* Featured Match Prediction */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Featured Match Prediction</h3>
                      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              <span className="text-sm font-medium text-gray-700">Live</span>
                            </div>
                            <span className="text-xs text-gray-500">Today, 2:30 PM</span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-medium text-gray-800 mb-1">India</span>
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">🇮🇳</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-500 mb-1">Match Prediction</div>
                              <div className="flex items-center space-x-2">
                                <div className="text-right w-10">
                                  <span className="text-sm font-bold text-blue-600">78%</span>
                                </div>
                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '78%' }}></div>
                                </div>
                                <div className="w-10">
                                  <span className="text-sm font-bold text-yellow-600">22%</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-medium text-gray-800 mb-1">Australia</span>
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">🇦🇺</div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-700 mb-4">
                            <p>Our AI predicts India will win based on current form, pitch conditions, and head-to-head record.</p>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Match: 3rd ODI</span>
                            <span>Venue: M. Chinnaswamy Stadium, Bangalore</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'predictions' && (
                <MatchPredictions />
              )}
              
              {activeTab === 'stats' && (
                <PremiumStats />
              )}
              
              {activeTab === 'subscription' && (
                <SubscriptionInfo 
                  subscriptionDetails={subscriptionDetails} 
                  formatDate={formatDate}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumDashboardPage;
