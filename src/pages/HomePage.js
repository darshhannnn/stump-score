import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LiveMatchesList from '../components/LiveMatchesList';
import StatisticsModal from '../components/StatisticsModal';
import { fetchCurrentMatches, getFeaturedMatch } from '../services/cricketApi';

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveMatches, setLiveMatches] = useState([]);
  const [featuredMatch, setFeaturedMatch] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [dataSource, setDataSource] = useState('Loading...');
  const [isScoreUpdating, setIsScoreUpdating] = useState(false);
  const previousScores = useRef({});
  
  // State for statistics and tabs
  const [activeTab, setActiveTab] = useState('liveMatches');
  const [currentStat, setCurrentStat] = useState(null);
  
  // Stats data for modals
  const statsData = {
    topScorer: {
      title: 'Top Scorer',
      subtitle: 'Rohit Sharma',
      stats: {
        'Runs': '115',
        'Balls': '87',
        '4s': '12',
        '6s': '6',
        'SR': '132.18'
      }
    },
    bestBowler: {
      title: 'Best Bowler',
      subtitle: 'Jasprit Bumrah',
      stats: {
        'Wickets': '4',
        'Runs': '32',
        'Overs': '8.2',
        'Economy': '3.85',
        'Maidens': '1'
      }
    },
    partnership: {
      title: 'Partnership Details',
      subtitle: 'Kohli - Pant Partnership',
      stats: {
        'Runs': '137',
        'Balls': '118',
        'Run Rate': '6.97',
        'For Wicket': '4th'
      },
      additionalContent: (
        <div className="mb-4">
          <div className="p-2 bg-blue-50 rounded mb-2">
            <span className="font-medium">Kohli:</span> 72 runs (63 balls)
          </div>
          <div className="p-2 bg-blue-50 rounded">
            <span className="font-medium">Pant:</span> 63 runs (51 balls)
          </div>
        </div>
      )
    },
    lastWicket: {
      title: 'Last Wicket',
      subtitle: 'S. Dhawan',
      stats: {
        'Runs': '45',
        'Balls': '39',
        'Dismissal': 'lbw',
        'Bowler': 'Starc',
        'Over': '18.4',
        'Team Score': '132/3'
      }
    }
  };
  
  // Function to open stat modal
  const openStatModal = (statType) => {
    console.log(`Opening stat modal: ${statType}`);
    setCurrentStat(statType);
  };
  
  // Function to close stat modal
  const closeStatModal = () => {
    console.log('Closing stat modal');
    setCurrentStat(null);
  };

  // Mock data for fallback when API fails
  const mockMatches = [
    {
      id: 'ind-vs-aus-2025',
      status: 'LIVE',
      venue: 'T20 World Cup',
      team1: {
        name: 'India',
        logo: 'https://ui-avatars.com/api/?name=IND&background=0D47A1&color=fff&size=100',
        score: 287,
        wickets: 5,
        overs: '42.3'
      },
      team2: {
        name: 'Australia',
        logo: 'https://ui-avatars.com/api/?name=AUS&background=FFC107&color=000&size=100',
        score: 182,
        wickets: 10,
        overs: '45.0'
      },
      currentStatus: 'India needs 43 runs from 45 balls'
    },
    {
      id: 'eng-vs-sa-2025',
      status: 'LIVE',
      venue: 'ODI Series',
      team1: {
        name: 'England',
        logo: 'https://ui-avatars.com/api/?name=ENG&background=0D47A1&color=fff&size=100',
        score: 230,
        wickets: 8,
        overs: '50.0'
      },
      team2: {
        name: 'South Africa',
        logo: 'https://ui-avatars.com/api/?name=SA&background=4CAF50&color=fff&size=100',
        score: 135,
        wickets: 2,
        overs: '25.3'
      },
      currentStatus: 'South Africa needs 96 runs'
    }
  ];

  const [usingMockData, setUsingMockData] = useState(false);

  const fetchData = useCallback(async (forceFetch = false) => {
    try {
      setIsLoading(true);
      setError(null);
      setUsingMockData(false);
      
      // Save current scores for comparison
      if (liveMatches && liveMatches.length > 0) {
        updatePreviousScores(liveMatches);
      }
      
      // Update last updated timestamp
      setLastUpdated(new Date());
      
      // Try to fetch from API with cache-busting parameter to ensure fresh data
      const timestamp = new Date().getTime();
      const apiData = await fetchCurrentMatches(forceFetch, timestamp);
      console.log('Raw API data:', apiData);
      
      // Always set data source to Web Scraping since we only use scraper now
      setDataSource('Web Scraping');
      
      if (apiData && apiData.length > 0) {
        // Process the matches data from scraper format
        const processedMatches = apiData.map(match => {
          // Process the data to match exactly what the LiveScoreCard component expects
          return {
            id: match.id || `match-${Math.random().toString(36).substr(2, 9)}`,
            status: match.status || 'LIVE',
            venue: match.venue || 'International Match',
            team1: {
              name: match.team1?.name || 'Team 1',
              short_name: match.team1?.short_name || match.team1?.name?.substring(0, 3) || 'T1',
              logo: match.team1?.logo || `https://ui-avatars.com/api/?name=${match.team1?.short_name || match.team1?.name?.substring(0, 3) || 'T1'}&background=0D47A1&color=fff&size=100`,
              score: match.team1?.score || 0,
              wickets: match.team1?.wickets || 0,
              overs: match.team1?.overs || '0.0'
            },
            team2: {
              name: match.team2?.name || 'Team 2',
              short_name: match.team2?.short_name || match.team2?.name?.substring(0, 3) || 'T2',
              logo: match.team2?.logo || `https://ui-avatars.com/api/?name=${match.team2?.short_name || match.team2?.name?.substring(0, 3) || 'T2'}&background=FFC107&color=000&size=100`,
              score: match.team2?.score || 0,
              wickets: match.team2?.wickets || 0,
              overs: match.team2?.overs || '0.0'
            },
            currentStatus: match.currentStatus || 'Live'
          };
        });
        
        setLiveMatches(processedMatches);
        
        // Set featured match using the helper function from cricketApi
        if (processedMatches.length > 0) {
          // Use the getFeaturedMatch function that selects a live match if available
          setFeaturedMatch(getFeaturedMatch(processedMatches));
          
          // Check if scores have changed and trigger animation
          const hasChanges = processedMatches.some(match => 
            hasScoreChanged(match)
          );
          
          if (hasChanges) {
            setIsScoreUpdating(true);
            setTimeout(() => setIsScoreUpdating(false), 2000);
          }
        }
      } else {
        throw new Error('No matches found');
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError('Failed to fetch live matches. Using demo data.');
      
      // Fallback to mock data
      setLiveMatches(mockMatches);
      setFeaturedMatch(mockMatches[0]);
      setUsingMockData(true);
      setDataSource('Mock Data');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh data
  const refreshData = () => {
    // Force refresh with cache-busting
    setDataSource('Refreshing...');
    setIsLoading(true); // Show loading state briefly
    fetchData(true);
  };

  // Check if scores have changed to enable visual indicators
  const hasScoreChanged = (match) => {
    if (!match || !match.id) return false;
    
    const prevMatch = previousScores.current[match.id];
    if (!prevMatch) return false;
    
    return (
      prevMatch.team1?.score !== match.team1?.score || 
      prevMatch.team1?.wickets !== match.team1?.wickets ||
      prevMatch.team2?.score !== match.team2?.score || 
      prevMatch.team2?.wickets !== match.team2?.wickets
    );
  };

  // Update the previous scores reference for change detection
  const updatePreviousScores = (matches) => {
    const newScoresMap = {};
    matches.forEach(match => {
      if (match && match.id) {
        newScoresMap[match.id] = {
          team1: { ...match.team1 },
          team2: { ...match.team2 }
        };
      }
    });
    previousScores.current = newScoresMap;
  };

  // Format the last updated time
  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Debug function to test API directly
  const testApiDirectly = async () => {
    try {
      console.log('Testing Cricket Data API directly...');
      
      // Make a direct API call using fetch to Cricket Data API
      const response = await fetch('https://api.cricapi.com/v1/currentMatches?apikey=8c428c05-056e-4d3b-9471-24956c550f47&offset=0');
      const data = await response.json();
      console.log('Cricket Data API Response:', data);
      
      // If no current matches, try the matches endpoint
      if (!data.data || data.data.length === 0) {
        console.log('No current matches found, trying matches endpoint...');
        const alternativeResponse = await fetch('https://api.cricapi.com/v1/matches?apikey=8c428c05-056e-4d3b-9471-24956c550f47&offset=0');
        const alternativeData = await alternativeResponse.json();
        console.log('Cricket Data API Matches Response:', alternativeData);
      }
      
      alert('API test complete. Check console for results.');
    } catch (error) {
      console.error('Direct API test failed:', error);
      alert('API test failed: ' + error.message);
    }
  };
  
  // Debug function to test web scraping functionality
  const testScrapingDirectly = async () => {
    try {
      console.log('Testing web scraping functionality directly...');
      setIsLoading(true);
      setDataSource('Web Scraping');
      
      // Import the scraping function dynamically
      const { scrapeLiveMatches } = await import('../services/cricketScraper');
      
      // Call the scraping function
      const scrapedMatches = await scrapeLiveMatches();
      console.log('Web Scraping Response:', scrapedMatches);
      
      // Update the UI with the scraped matches
      if (scrapedMatches && scrapedMatches.length > 0) {
        setLiveMatches(scrapedMatches);
        setFeaturedMatch(scrapedMatches[0]);
        setLastUpdated(new Date());
        setError(null);
        setUsingMockData(false);
      } else {
        throw new Error('No matches found from scraping');
      }
      
      // Notify user of success
      setTimeout(() => {
        alert('Web scraping successful! The data is now displayed on the page.');
      }, 500);
    } catch (error) {
      console.error('Web scraping test failed:', error);
      setError('Web scraping failed: ' + error.message);
      alert('Web scraping test failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh every 12 seconds for more frequent updates
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 12000);
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [fetchData]); // Added fetchData to dependency array
  
  // Additional effect to refresh specifically when using scraped data
  // This ensures dynamic score updates from our mock data
  useEffect(() => {
    if (dataSource === 'Web Scraping') {
      const scrapingRefreshInterval = setInterval(async () => {
        console.log('Refreshing web scraping data...');
        
        try {
          // Import the scraping function directly instead of calling testScrapingDirectly
          // to avoid circular dependency
          const { scrapeLiveMatches } = await import('../services/cricketScraper');
          
          // Save current scores for comparison
          if (liveMatches && liveMatches.length > 0) {
            updatePreviousScores(liveMatches);
          }
          
          // Get fresh data
          const scrapedMatches = await scrapeLiveMatches();
          
          // Silently update the UI without showing loading state
          if (scrapedMatches && scrapedMatches.length > 0) {
            setLiveMatches(scrapedMatches);
            setFeaturedMatch(scrapedMatches[0]);
            setLastUpdated(new Date());
            
            // Check if scores have changed and trigger animation
            const hasChanges = scrapedMatches.some(match => 
              hasScoreChanged(match)
            );
            
            if (hasChanges) {
              setIsScoreUpdating(true);
              setTimeout(() => setIsScoreUpdating(false), 2000);
            }
          }
        } catch (error) {
          console.error('Silent refresh error:', error);
          // Don't show errors for background refresh
        }
      }, 8000); // Refresh scraped data more frequently (every 8 seconds)
      
      return () => clearInterval(scrapingRefreshInterval);
    }
  }, [dataSource, liveMatches]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-blue-50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            {/* Left side content */}
            <div className="w-full lg:w-1/2 mb-10 lg:mb-0">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
                Live Cricket Updates
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Stay updated with real-time cricket scores, match statistics, and player performances from around the world.
              </p>
              
              {/* Featured match stats */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800">Featured Match</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {featuredMatch ? featuredMatch.venue : 'International Match'}
                  </span>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
                  </div>
                ) : featuredMatch ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <img 
                          src={featuredMatch.team1.logo} 
                          alt={featuredMatch.team1.name} 
                          className="w-10 h-10 rounded-full mr-3"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${featuredMatch.team1.name.substring(0, 3)}&background=0D47A1&color=fff&size=100`;
                          }}
                        />
                        <div>
                          <p className="font-semibold">{featuredMatch.team1.name}</p>
                          <p className="text-lg font-bold">{featuredMatch.team1.score}/{featuredMatch.team1.wickets} <span className="text-sm font-normal text-gray-500">({featuredMatch.team1.overs})</span></p>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          {featuredMatch.status}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="text-right">
                          <p className="font-semibold">{featuredMatch.team2.name}</p>
                          <p className="text-lg font-bold">{featuredMatch.team2.score}/{featuredMatch.team2.wickets} <span className="text-sm font-normal text-gray-500">({featuredMatch.team2.overs})</span></p>
                        </div>
                        <img 
                          src={featuredMatch.team2.logo} 
                          alt={featuredMatch.team2.name} 
                          className="w-10 h-10 rounded-full ml-3"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${featuredMatch.team2.name.substring(0, 3)}&background=FFC107&color=000&size=100`;
                          }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-center text-gray-600 mt-2">{featuredMatch.currentStatus}</p>
                  </div>
                ) : (
                  <p className="text-center text-gray-500">No matches available</p>
                )}
              </div>
            </div>
            
            {/* Right side image */}
            <div className="w-full lg:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="bg-blue-600 rounded-lg shadow-lg overflow-hidden w-full">
                  {/* Match header */}
                  <div className="bg-blue-700 p-4 text-white">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{featuredMatch ? featuredMatch.venue : 'T20 World Cup'}</span>
                      <span className="bg-red-500 text-xs px-2 py-1 rounded-full animate-pulse">
                        {featuredMatch ? featuredMatch.status : 'LIVE'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Team scores */}
                  <div className="p-6 text-white">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mr-4 overflow-hidden">
                          {featuredMatch ? (
                            <img 
                              src={featuredMatch.team1.logo}
                              alt={featuredMatch.team1.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${featuredMatch.team1.name ? featuredMatch.team1.name.substring(0, 3) : 'T1'}&background=0D47A1&color=fff&size=64`;
                              }}
                            />
                          ) : (
                            <span className="text-blue-600 font-bold text-xl">T1</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm opacity-90">{featuredMatch ? featuredMatch.team1.name : 'Team 1'}</p>
                          <p className={`text-2xl font-bold ${isScoreUpdating ? 'animate-pulse text-yellow-300' : ''}`}>
                            {featuredMatch ? `${featuredMatch.team1.score || 0}/${featuredMatch.team1.wickets || 0}` : '0/0'}
                          </p>
                          <p className="text-xs opacity-75">
                            {featuredMatch ? `${featuredMatch.team1.overs || '0.0'} overs` : '0.0 overs'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-center px-4">
                        <div className="text-xl font-bold mb-1">vs</div>
                        <div className="text-xs bg-blue-500 rounded-full px-3 py-1 animate-pulse">Live</div>
                      </div>
                      
                      <div className="flex items-center">
                        <div>
                          <p className="text-sm opacity-90 text-right">{featuredMatch ? featuredMatch.team2.name : 'Team 2'}</p>
                          <p className={`text-2xl font-bold text-right ${isScoreUpdating ? 'animate-pulse text-yellow-300' : ''}`}>
                            {featuredMatch ? `${featuredMatch.team2.score || 0}/${featuredMatch.team2.wickets || 0}` : '0/0'}
                          </p>
                          <p className="text-xs opacity-75 text-right">
                            {featuredMatch ? `${featuredMatch.team2.overs || '0.0'} overs` : '0.0 overs'}
                          </p>
                        </div>
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center ml-4 overflow-hidden">
                          {featuredMatch ? (
                            <img 
                              src={featuredMatch.team2.logo}
                              alt={featuredMatch.team2.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${featuredMatch.team2.name ? featuredMatch.team2.name.substring(0, 3) : 'T2'}&background=FFC107&color=000&size=64`;
                              }}
                            />
                          ) : (
                            <span className="text-yellow-600 font-bold text-xl">T2</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-blue-500">
                      <p className="text-sm">
                        {featuredMatch ? featuredMatch.currentStatus : 'Match in progress'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Quick stats row - Ensure this div is within the main Hero section's container or at the correct level */}
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              {/* Card 1: Top Scorer */}
              <div 
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
                onClick={() => openStatModal('topScorer')}
              >
                <p className="text-gray-500 text-sm">Top Scorer</p>
                <p className="font-bold text-lg">R. Sharma</p>
                <p className="text-blue-600 font-medium">115 (87)</p>
              </div>
              
              {/* Card 2: Best Bowler */}
              <div 
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
                onClick={() => openStatModal('bestBowler')}
              >
                <p className="text-gray-500 text-sm">Best Bowler</p>
                <p className="font-bold text-lg">J. Bumrah</p>
                <p className="text-blue-600 font-medium">4/32</p>
              </div>
              
              {/* Card 3: Partnership */}
              <div 
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
                onClick={() => openStatModal('partnership')}
              >
                <p className="text-gray-500 text-sm">Partnership</p>
                <p className="font-bold text-lg">Kohli - Pant</p>
                <p className="text-blue-600 font-medium">137 runs</p>
              </div>
              
              {/* Card 4: Last Wicket */}
              <div 
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
                onClick={() => openStatModal('lastWicket')}
              >
                <p className="text-gray-500 text-sm">Last Wicket</p>
                <p className="font-bold text-lg">S. Iyer</p>
                <p className="text-blue-600 font-medium">72 (64)</p>
              </div>
            </div>
          </div>
        </div> {/* Closing tag for the div wrapping hero content and quick stats */}
      </section> {/* Closing tag for Hero Section */}

      {/* Live Scores Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Live Scores</h2>
            <div className="flex items-center">
              {usingMockData ? (
                <span className="text-amber-600 text-sm mr-3 bg-amber-50 px-3 py-1 rounded-full">
                  <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mr-1"></span>
                  Using Demo Data
                </span>
              ) : (
                <span className="text-green-600 text-sm mr-3 bg-green-50 px-3 py-1 rounded-full">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  {dataSource}
                </span>
              )}
              <div className="flex space-x-2">
                <button 
                  onClick={refreshData}
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded transition-colors"
                  disabled={isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <button 
                  onClick={testApiDirectly}
                  className="flex items-center bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Test API
                </button>
                <button 
                  onClick={testScrapingDirectly}
                  className="flex items-center bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1 rounded transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
                  </svg>
                  Test Scraping
                </button>
              </div>
            </div>
          </div>
          
          {/* Data status indicator */}
          <div className="mb-4 flex justify-between items-center text-xs text-gray-500">
            <div className="flex items-center">
              <span>Last updated: {formatLastUpdated()}</span>
              {dataSource === 'Web Scraping' && (
                <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-1 rounded-full flex items-center">
                  <span className={`inline-block w-2 h-2 ${isScoreUpdating ? 'bg-green-500 animate-ping mr-1' : 'bg-purple-500 mr-1'}`}></span>
                  Auto-updating
                </span>
              )}
            </div>
            {error && <span className="text-amber-600">{error}</span>}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-700"></div>
            </div>
          ) : (
            <div className={isScoreUpdating ? 'animate-pulse-once transition-all duration-300' : ''}>
              <LiveMatchesList matches={liveMatches} />
              {isScoreUpdating && (
                <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg animate-bounce z-50">
                  Scores Updated!
                </div>
              )}
            </div>
          )}
          
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-4">
              <button 
                className={`px-6 py-2 rounded-md font-medium transition-colors ${activeTab === 'liveMatches' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => setActiveTab('liveMatches')}
              >
                Live Matches
              </button>
              <button 
                className={`px-6 py-2 rounded-md font-medium transition-colors ${activeTab === 'schedule' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => setActiveTab('schedule')}
              >
                Match Schedule
              </button>
              <button 
                className={`px-6 py-2 rounded-md font-medium transition-colors ${activeTab === 'stats' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                onClick={() => setActiveTab('stats')}
              >
                Player Stats
              </button>
            </div>
          </div>
          
          {/* Conditionally render content based on active tab */}
          {activeTab === 'schedule' && (
            <div className="mt-6 bg-white rounded-lg shadow-sm p-4 animate-fade-in">
              <h3 className="text-xl font-bold mb-4">Upcoming Matches</h3>
              <div className="space-y-4">
                <div className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">India vs England</p>
                      <p className="text-sm text-gray-500">T20 World Cup 2025</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-600 font-medium">Tomorrow, 14:30 IST</p>
                      <p className="text-xs text-gray-500">Lords, London</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Australia vs New Zealand</p>
                      <p className="text-sm text-gray-500">T20 World Cup 2025</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-600 font-medium">Tomorrow, 19:00 IST</p>
                      <p className="text-xs text-gray-500">MCG, Melbourne</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'stats' && (
            <div className="mt-6 bg-white rounded-lg shadow-sm p-4 animate-fade-in">
              <h3 className="text-xl font-bold mb-4">Top Player Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-100 rounded-lg">
                  <h4 className="font-semibold mb-2">Top Run Scorers</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>1. Virat Kohli (IND)</span>
                      <span className="font-medium">345 runs</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>2. Jos Buttler (ENG)</span>
                      <span className="font-medium">312 runs</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>3. Babar Azam (PAK)</span>
                      <span className="font-medium">298 runs</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border border-gray-100 rounded-lg">
                  <h4 className="font-semibold mb-2">Top Wicket Takers</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>1. Jasprit Bumrah (IND)</span>
                      <span className="font-medium">18 wickets</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>2. Shaheen Afridi (PAK)</span>
                      <span className="font-medium">16 wickets</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>3. Pat Cummins (AUS)</span>
                      <span className="font-medium">15 wickets</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* Render statistics modals */}
      {currentStat && statsData[currentStat] && (
        <StatisticsModal
          isOpen={Boolean(currentStat)}
          onClose={closeStatModal}
          title={statsData[currentStat].title}
          subtitle={statsData[currentStat].subtitle}
          statsData={statsData[currentStat].stats}
          additionalContent={statsData[currentStat].additionalContent}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default HomePage;
