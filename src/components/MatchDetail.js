import React, { useState, useEffect } from 'react';
import { fetchMatchDetails } from '../services/cricketApi';

const MatchDetail = ({ match, matchId }) => {
  const [detailedMatch, setDetailedMatch] = useState(match);
  const [isLoading, setIsLoading] = useState(!match);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // If a match object is directly provided, use it
    if (match) {
      setDetailedMatch(match);
      setIsLoading(false);
      return;
    }
    
    // Otherwise, fetch match details using the matchId
    if (matchId) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          
          // Fetch match details using web scraping
          const matchDetails = await fetchMatchDetails(matchId);
          
          // Process and combine the data
          const processedMatch = {
            id: matchId,
            series: matchDetails.series || matchDetails.name || 'Cricket Match',
            status: matchDetails.status || 'LIVE',
            venue: matchDetails.venue || 'Cricket Stadium',
            currentStatus: matchDetails.currentStatus || 'Match in progress',
            team1: {
              name: matchDetails.teams?.[0] || 'Team 1',
              logo: `https://ui-avatars.com/api/?name=${(matchDetails.teams?.[0] || 'T1').substring(0, 3)}&background=0D47A1&color=fff&size=100`,
              score: matchDetails.score?.[0]?.r || 0,
              wickets: matchDetails.score?.[0]?.w || 0,
              overs: matchDetails.score?.[0]?.o || '0.0'
            },
            team2: {
              name: matchDetails.teams?.[1] || 'Team 2',
              logo: `https://ui-avatars.com/api/?name=${(matchDetails.teams?.[1] || 'T2').substring(0, 3)}&background=FFC107&color=000&size=100`,
              score: matchDetails.score?.[1]?.r || 0,
              wickets: matchDetails.score?.[1]?.w || 0,
              overs: matchDetails.score?.[1]?.o || '0.0'
            },
            currentStatus: matchDetails.status,
            // Process batting and bowling data if available
            currentBatsmen: matchDetails?.players?.batting
              ?.filter(batsman => !batsman.dismissal)
              ?.slice(0, 2)
              ?.map(batsman => ({
                name: batsman.batsman,
                runs: batsman.r,
                balls: batsman.b,
                fours: batsman['4s'],
                sixes: batsman['6s'],
                strikeRate: batsman.sr,
                onStrike: batsman.dismissal === 'batting'
              })) || [],
            currentBowler: matchDetails?.players?.bowling
              ?.sort((a, b) => b.overs - a.overs)[0] && {
                name: matchDetails.players.bowling[0].name,
                overs: matchDetails.players.bowling[0].overs,
                maidens: matchDetails.players.bowling[0].maidens,
                runs: matchDetails.players.bowling[0].runs,
                wickets: matchDetails.players.bowling[0].wickets,
                economy: matchDetails.players.bowling[0].economy
              },
            // Process recent overs if available
            recentOvers: []
          };
          
          setDetailedMatch(processedMatch);
        } catch (err) {
          console.error('Error fetching match details:', err);
          setError('Failed to load match details. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
      
      // Set up polling for real-time updates every 30 seconds
      const intervalId = setInterval(() => {
        fetchData();
      }, 30000);
      
      return () => clearInterval(intervalId);
    }
  }, [match, matchId]);
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-48 mb-6"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex flex-col items-center mb-4 md:mb-0">
            <div className="w-16 h-16 bg-gray-200 rounded-full mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
          
          <div className="h-6 bg-gray-200 rounded w-8 mb-4 md:mb-0"></div>
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
        
        <div className="h-20 bg-gray-200 rounded mb-6"></div>
        
        <div className="h-40 bg-gray-200 rounded mb-6"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-red-500 text-center p-8">
          <p>{error}</p>
          <button 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  if (!detailedMatch) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center p-8">
          <p className="text-gray-500">Match details not available</p>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{detailedMatch?.series || 'Cricket Match'}</h2>
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            {detailedMatch?.status || 'LIVE'}
          </span>
        </div>
        <p className="text-gray-600 mt-1">{detailedMatch?.venue || 'International Venue'}</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="flex flex-col items-center mb-4 md:mb-0">
          <img 
            src={detailedMatch?.team1?.logo || `https://ui-avatars.com/api/?name=${detailedMatch?.teams?.[0]?.substring(0, 3) || 'T1'}&background=0D47A1&color=fff&size=100`} 
            alt={detailedMatch?.teams?.[0] || 'Team 1'} 
            className="w-16 h-16 object-contain" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${detailedMatch?.teams?.[0]?.substring(0, 3) || 'T1'}&background=0D47A1&color=fff&size=100`;
            }}
          />
          <h3 className="text-lg font-semibold mt-2">{detailedMatch?.teams?.[0] || 'Team 1'}</h3>
          <p className="text-2xl font-bold mt-1">
            {detailedMatch?.score?.[0]?.r || 0}/{detailedMatch?.score?.[0]?.w || 0}
          </p>
          <p className="text-sm text-gray-600">({detailedMatch?.score?.[0]?.o || '0.0'} overs)</p>
        </div>

        <div className="text-center mb-4 md:mb-0">
          <span className="text-sm bg-gray-200 px-3 py-1 rounded-full">vs</span>
        </div>

        <div className="flex flex-col items-center">
          <img 
            src={detailedMatch?.team2?.logo || `https://ui-avatars.com/api/?name=${detailedMatch?.teams?.[1]?.substring(0, 3) || 'T2'}&background=FFC107&color=000&size=100`} 
            alt={detailedMatch?.teams?.[1] || 'Team 2'} 
            className="w-16 h-16 object-contain" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${detailedMatch?.teams?.[1]?.substring(0, 3) || 'T2'}&background=FFC107&color=000&size=100`;
            }}
          />
          <h3 className="text-lg font-semibold mt-2">{detailedMatch?.teams?.[1] || 'Team 2'}</h3>
          <p className="text-2xl font-bold mt-1">
            {detailedMatch?.score?.[1]?.r || 0}/{detailedMatch?.score?.[1]?.w || 0}
          </p>
          <p className="text-sm text-gray-600">({detailedMatch?.score?.[1]?.o || '0.0'} overs)</p>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h4 className="font-semibold text-blue-800 mb-2">Match Status</h4>
        <p className="text-gray-800">{detailedMatch?.currentStatus || 'Match in progress'}</p>
      </div>

      {detailedMatch?.players?.batting && detailedMatch.players.batting.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Current Batsmen</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batsman
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    R
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    B
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    4s
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    6s
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SR
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {detailedMatch.players.batting.map((batsman, index) => (
                  <tr key={index} className={batsman.dismissal === 'batting' ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {batsman.batsman || batsman.name} 
                            {batsman.dismissal === 'batting' && <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">*</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {batsman.r || batsman.runs || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {batsman.b || batsman.balls || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {batsman['4s'] || batsman.fours || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {batsman['6s'] || batsman.sixes || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {batsman.sr || batsman.strikeRate || '0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detailedMatch?.players?.bowling && detailedMatch.players.bowling.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Current Bowler</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bowler
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    O
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    M
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    R
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    W
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Econ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {detailedMatch.players.bowling.slice(0, 1).map((bowler, index) => (
                  <tr key={index} className="bg-blue-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900">
                            {bowler.name || bowler.bowler}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bowler.overs || bowler.o || '0.0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bowler.maidens || bowler.m || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bowler.runs || bowler.r || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bowler.wickets || bowler.w || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bowler.economy || bowler.econ || '0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h4 className="font-semibold mb-3">Recent Overs</h4>
        <div className="bg-gray-100 p-3 rounded-lg overflow-x-auto">
          <div className="whitespace-nowrap">
            {detailedMatch?.recentOvers && detailedMatch.recentOvers.length > 0 ? (
              detailedMatch.recentOvers.map((over, index) => (
                <div key={index} className="inline-block mr-4 mb-2">
                  <div className="text-xs text-gray-500 mb-1">Over {over.number || index + 1}</div>
                  <div className="flex space-x-1">
                    {over.balls.map((ball, ballIndex) => {
                      let bgColor = 'bg-gray-200';
                      let textColor = 'text-gray-800';
                      
                      if (ball === '0' || ball === 0) {
                        bgColor = 'bg-gray-200';
                      } else if (ball === '4' || ball === 4) {
                        bgColor = 'bg-green-200';
                        textColor = 'text-green-800';
                      } else if (ball === '6' || ball === 6) {
                        bgColor = 'bg-blue-200';
                        textColor = 'text-blue-800';
                      } else if (ball === 'W' || ball === 'w') {
                        bgColor = 'bg-red-200';
                        textColor = 'text-red-800';
                      }
                      
                      return (
                        <span 
                          key={ballIndex} 
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${bgColor} ${textColor} text-xs font-medium`}
                        >
                          {ball}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent overs data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetail;
