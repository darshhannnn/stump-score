import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './PremiumPage.css';

const PremiumPage = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [animateChart, setAnimateChart] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const { isAuthenticated, isPremium, upgradeToPremium } = useAuth();
  const navigate = useNavigate();
  
  const features = [
    {
      id: 1,
      title: "Match Predictions",
      description: "Get AI-powered predictions with 85% accuracy for all major cricket matches.",
      icon: "📊"
    },
    {
      id: 2,
      title: "Personalized Dashboard",
      description: "Customize your dashboard to follow your favorite teams, players, and tournaments.",
      icon: "🔍"
    },
    {
      id: 3,
      title: "Advanced Statistics",
      description: "Access in-depth analytics, player comparisons, and performance trends.",
      icon: "📈"
    },
    {
      id: 4,
      title: "Ad-Free Experience",
      description: "Enjoy StumpScore without any advertisements or interruptions.",
      icon: "✨"
    },
    {
      id: 5,
      title: "Exclusive Content",
      description: "Get access to expert analyses, interviews, and behind-the-scenes content.",
      icon: "🎯"
    }
  ];
  
  const plans = [
    {
      name: "Monthly",
      price: "₹50",
      period: "per month",
      features: ["All premium features", "Cancel anytime", "14-day free trial"]
    },
    {
      name: "Annual",
      price: "₹200",
      period: "per year",
      features: ["All premium features", "Save 67%", "30-day free trial", "Priority support"]
    }
  ];
  
  // Cycling through features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [features.length]);
  
  // Trigger chart animation when component loads
  useEffect(() => {
    setTimeout(() => {
      setAnimateChart(true);
    }, 500);
  }, []);

  // Mock data for prediction chart
  const predictionData = {
    team1: {
      name: "India",
      winChance: 75,
      color: "#0066CC"
    },
    team2: {
      name: "Australia",
      winChance: 25,
      color: "#FFCC00"
    }
  };
  
  return (
    <div className="pt-20 pb-10 bg-gradient-to-b from-blue-50 to-white min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-10 fade-in-up">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4 fade-in-down">
            StumpScore <span className="text-yellow-500">Premium</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto fade-in">
            Elevate your cricket experience with exclusive features, match predictions, and personalized insights.
          </p>
        </div>
        
        {/* Feature Showcase */}
        <div className="grid md:grid-cols-2 gap-8 mb-20 fade-in-stagger">
          {/* Feature Carousel */}
          <div className="bg-white p-8 rounded-xl shadow-lg overflow-hidden fade-in-item">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">Premium Features</h2>
            <div className="relative h-80">
              {features.map((feature, index) => (
                <div 
                  key={feature.id}
                  className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center transition-all duration-500 ${
                    activeFeature === index ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
                  }`}
                >
                  <span className="text-5xl mb-4">{feature.icon}</span>
                  <h3 className="text-xl font-bold text-blue-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-2 mt-4">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`w-3 h-3 rounded-full ${
                    activeFeature === index ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Match Prediction Demo */}
          <div className="bg-white p-8 rounded-xl shadow-lg fade-in-item">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">Match Prediction</h2>
            <div className="mb-8">
              <h3 className="text-xl mb-4 text-center font-semibold">India vs Australia</h3>
              <div className="relative h-10 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-blue-600 transition-all duration-1500 ease-out"
                  style={{ width: animateChart ? `${predictionData.team1.winChance}%` : '0%' }}
                />
                <div 
                  className="absolute right-0 top-0 h-full bg-yellow-500 transition-all duration-1500 ease-out"
                  style={{ width: animateChart ? `${predictionData.team2.winChance}%` : '0%' }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-600 mr-2"></div>
                  <span className="text-sm font-medium">{predictionData.team1.name} ({predictionData.team1.winChance}%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-sm font-medium">{predictionData.team2.name} ({predictionData.team2.winChance}%)</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Based on IPL and international performance</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Considering Indian pitch conditions</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Player stats from all cricket formats</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="mb-20 fade-in-up delay-800">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-10">Why StumpScore Premium?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-4xl font-bold text-blue-500 mb-2">85%</div>
              <p className="text-gray-600">Prediction Accuracy</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-4xl font-bold text-blue-500 mb-2">50+</div>
              <p className="text-gray-600">Advanced Statistics</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-4xl font-bold text-blue-500 mb-2">24/7</div>
              <p className="text-gray-600">Expert Analysis</p>
            </div>
          </div>
        </div>
        
        {/* Dashboard Preview */}
        <div className="mb-20 fade-in-scale delay-1000">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">Personalized Dashboard</h2>
          <div className="bg-white p-4 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-blue-800 text-white p-4 rounded-t-lg">
              <h3 className="font-semibold">Your Cricket Hub</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-4 p-4">
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Favorite Teams</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-blue-600 rounded-full mr-2"></div>
                      <span className="text-sm">India</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="text-sm">Australia</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Upcoming Matches</h4>
                  <div className="space-y-2">
                    <div className="text-xs">IND vs AUS - Jun 2</div>
                    <div className="text-xs">ENG vs NZ - Jun 5</div>
                  </div>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Player Stats</h4>
                  <div className="space-y-2">
                    <div className="text-xs">V. Kohli - Avg: 59.8</div>
                    <div className="text-xs">J. Bumrah - Econ: 4.2</div>
                  </div>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Recent Predictions</h4>
                  <div className="space-y-2">
                    <div className="text-xs flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      IND vs SL - Correct
                    </div>
                    <div className="text-xs flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      ENG vs PAK - Correct
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Personalized Insights</h4>
                <div className="space-y-3 text-xs">
                  <p>India has a 78% chance to win their next match based on current form.</p>
                  <p>Jasprit Bumrah is likely to be the top wicket-taker in the upcoming series.</p>
                  <p>Your favorite team has improved their batting average by 12% this season.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pricing Section */}
        <div id="pricing-section" className="mb-12 fade-in delay-1200">
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-10">Choose Your Plan</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={plan.name}
                className={`bg-white p-8 rounded-xl shadow-lg border-2 ${index === 1 ? 'border-yellow-500' : 'border-transparent'} hover:-translate-y-1 hover:shadow-xl transition-all duration-300`}
              >
                {index === 1 && (
                  <div className="bg-yellow-500 text-blue-900 font-bold text-xs uppercase py-1 px-3 rounded-full inline-block mb-4">
                    Best Value
                  </div>
                )}
                <h3 className="text-xl font-bold text-blue-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-500 ml-1">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  className={`w-full ${isPremium() ? 'bg-green-500 cursor-default' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-2 px-4 rounded-lg transition duration-300 ${upgradeLoading ? 'opacity-70 cursor-wait' : ''}`}
                  onClick={() => {
                    if (isPremium()) return; // Already premium
                    
                    if (!isAuthenticated) {
                      navigate('/login', { state: { from: { pathname: '/premium' } } });
                      return;
                    }
                    
                    // Navigate to the new Razorpay subscription page
                    navigate('/subscription');
                  }}
                  disabled={isPremium() || upgradeLoading}
                >
                  {isPremium() ? 'Already Premium ✓' : 'Subscribe with Razorpay'}
                </button>
                {upgradeSuccess && (
                  <div className="mt-2 text-green-600 text-sm font-medium">
                    Successfully upgraded to Premium!
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="text-center fade-in delay-1400">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Ready to elevate your cricket experience?</h2>
          <p className="text-gray-600 mb-8">Join thousands of cricket fans who have upgraded to StumpScore Premium</p>
          <div className="space-x-4">
            <button 
              onClick={() => {
                if (isPremium()) return; // Already premium
                
                if (!isAuthenticated) {
                  navigate('/login', { state: { from: { pathname: '/premium' } } });
                  return;
                }
                
                // Navigate to the new Razorpay subscription page
                navigate('/subscription');
              }}
              className={`bg-yellow-500 ${isPremium() ? 'opacity-70 cursor-default' : 'hover:bg-yellow-600 cursor-pointer'} text-blue-900 font-bold py-3 px-8 rounded-full inline-flex items-center transition duration-300`}
              disabled={isPremium()}
            >
              <span className="mr-2">✨</span>
              {isPremium() ? 'You Already Have Premium' : 'Subscribe with Razorpay'}
            </button>
            
            <button 
              onClick={() => {
                if (isPremium()) return; // Already premium
                
                if (!isAuthenticated) {
                  navigate('/login', { state: { from: { pathname: '/premium' } } });
                  return;
                }
                
                // Navigate to the legacy payment page
                navigate('/payment');
              }}
              className={`bg-white border-2 border-blue-600 ${isPremium() ? 'opacity-70 cursor-default' : 'hover:bg-blue-50 cursor-pointer'} text-blue-600 font-bold py-3 px-8 rounded-full inline-flex items-center transition duration-300`}
              disabled={isPremium()}
            >
              <span className="mr-2">💳</span>
              {isPremium() ? 'You Already Have Premium' : 'Legacy Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;
