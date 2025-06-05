/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MatchDetail from '../components/MatchDetail';
import { fetchMatchDetails } from '../services/cricketApi';

const MatchDetailsPage = () => {
  const { matchId } = useParams();
  const [matchInfo, setMatchInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Function to fetch match details
    const getMatchDetails = async () => {
      try {
        setIsLoading(true);
        const details = await fetchMatchDetails(matchId);
        setMatchInfo(details);
      } catch (error) {
        console.error('Error fetching match details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    getMatchDetails();
    
    // Set up polling for real-time updates
    const intervalId = setInterval(() => {
      getMatchDetails();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [matchId]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-20 pb-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Match Details</h1>
            <p className="text-gray-600">Live cricket score and detailed match information</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main match details */}
            <div className="lg:col-span-2">
              <MatchDetail matchId={matchId} />
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Match Info Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Match Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Series</span>
                    <span className="font-medium">{isLoading ? 'Loading...' : matchInfo?.series || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Venue</span>
                    <span className="font-medium">{isLoading ? 'Loading...' : matchInfo?.venue || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time</span>
                    <span className="font-medium">{isLoading ? 'Loading...' : matchInfo?.date || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toss</span>
                    <span className="font-medium">
                      {isLoading ? 'Loading...' : 
                        (matchInfo?.toss ? 
                          `${matchInfo.toss.winner} won, chose to ${matchInfo.toss.decision}` : 
                          'N/A')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Umpires</span>
                    <span className="font-medium">{isLoading ? 'Loading...' : (matchInfo?.umpires ? matchInfo.umpires.join(', ') : 'N/A')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Referee</span>
                    <span className="font-medium">{isLoading ? 'Loading...' : matchInfo?.referee || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              {/* Key Stats Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Key Stats</h3>
                {isLoading ? (
                  <p className="text-gray-500 text-sm">Loading stats...</p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Highest Score</span>
                      <span className="font-medium">
                        {matchInfo?.stats?.highestScore || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Most Wickets</span>
                      <span className="font-medium">
                        {matchInfo?.stats?.mostWickets || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Run Rate</span>
                      <span className="font-medium">
                        {matchInfo?.stats?.runRate || (matchInfo?.score?.[0]?.r && matchInfo?.score?.[0]?.o ? 
                          (matchInfo.score[0].r / parseFloat(matchInfo.score[0].o)).toFixed(2) : 'N/A')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Head to Head Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Head to Head</h3>
                {isLoading ? (
                  <p className="text-gray-500 text-sm">Loading head to head stats...</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
                          {matchInfo?.teams?.[0]?.substring(0, 3) || 'T1'}
                        </div>
                        <span>{matchInfo?.teams?.[0] || 'Team 1'}</span>
                      </div>
                      <span className="font-bold">{matchInfo?.headToHead?.team1Wins || '0'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
                          {matchInfo?.teams?.[1]?.substring(0, 3) || 'T2'}
                        </div>
                        <span>{matchInfo?.teams?.[1] || 'Team 2'}</span>
                      </div>
                      <span className="font-bold">{matchInfo?.headToHead?.team2Wins || '0'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">No Result</span>
                      <span className="font-bold">{matchInfo?.headToHead?.noResults || '0'}</span>
                    </div>
                    
                    <div className="text-center text-sm text-gray-500 mt-2">
                      Last 10 matches
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MatchDetailsPage;
