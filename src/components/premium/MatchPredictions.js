import React, { useState, useEffect } from 'react';

// Advanced match prediction data - in a real app, this would come from an API with ML-based prediction models
const mockMatchData = [
  {
    id: 1,
    homeTeam: {
      name: 'India',
      flag: '🇮🇳',
      winProbability: 76.4,
      recentForm: ['W', 'W', 'L', 'W', 'W'],
      keyPlayers: [
        { name: 'Virat Kohli', role: 'Batsman', impact: 9.2 },
        { name: 'Jasprit Bumrah', role: 'Bowler', impact: 9.5 },
        { name: 'Ravindra Jadeja', role: 'All-rounder', impact: 8.7 }
      ],
      historicalPerformance: {
        overall: { matches: 145, wins: 98, losses: 41, noresult: 6 },
        vsOpponent: { matches: 45, wins: 27, losses: 16, noresult: 2 },
        atVenue: { matches: 12, wins: 9, losses: 2, noresult: 1 }
      }
    },
    awayTeam: {
      name: 'Australia',
      flag: '🇦🇺',
      winProbability: 23.6,
      recentForm: ['W', 'L', 'W', 'L', 'L'],
      keyPlayers: [
        { name: 'Steven Smith', role: 'Batsman', impact: 9.0 },
        { name: 'Mitchell Starc', role: 'Bowler', impact: 8.9 },
        { name: 'Glenn Maxwell', role: 'All-rounder', impact: 8.5 }
      ],
      historicalPerformance: {
        overall: { matches: 152, wins: 107, losses: 39, noresult: 6 },
        vsOpponent: { matches: 45, wins: 16, losses: 27, noresult: 2 },
        atVenue: { matches: 8, wins: 2, losses: 5, noresult: 1 }
      }
    },
    format: 'ODI',
    series: '3rd ODI',
    venue: 'M. Chinnaswamy Stadium, Bangalore',
    time: '2:30 PM',
    date: 'Today',
    status: 'live',
    predictionConfidence: 'High',
    matchContext: 'Series tied 1-1',
    weatherConditions: {
      forecast: 'Partly cloudy',
      temperature: '28°C',
      humidity: '65%',
      windSpeed: '12 km/h',
      chanceOfRain: '10%',
      impact: 'Neutral conditions with slight advantage to pacers early on'
    },
    pitchAnalysis: {
      type: 'Red soil',
      behavior: 'Initially good for batting, will assist spinners as match progresses',
      averageFirstInningsScore: 287,
      averageSecondInningsScore: 246,
      recommendation: 'Bat first'  
    },
    predictionDetails: {
      keyFactors: [
        'India has won 7 out of last 10 matches against Australia in home conditions',
        'The Bangalore pitch is showing signs of wear, expected to assist Indian spinners significantly',
        'Rohit Sharma averages 67.3 against Australia in ODIs with 4 centuries',
        'Mitchell Starc has struggled in Indian conditions, averaging 42.3 in last 5 matches',
        'Historical data shows teams batting first at this venue win 62% of matches'
      ],
      winProbabilityBreakdown: [
        { factor: 'Home advantage', impact: '+15%' },
        { factor: 'Recent form', impact: '+8%' },
        { factor: 'Head-to-head record', impact: '+7%' },
        { factor: 'Pitch conditions', impact: '+12%' },
        { factor: 'Key player availability', impact: '+5%' }
      ],
      playerToWatch: {
        name: 'Jasprit Bumrah',
        team: 'India',
        prediction: 'Likely to take 3+ wickets',
        recentForm: [
          { match: 'vs Australia, 2nd ODI', performance: '3/32', date: '28 May 2025' },
          { match: 'vs Australia, 1st ODI', performance: '2/41', date: '25 May 2025' },
          { match: 'vs England, 3rd ODI', performance: '4/28', date: '18 May 2025' }
        ],
        vsOpponent: { matches: 18, wickets: 38, economy: 4.72, average: 21.3 }
      }
    }
  },
  {
    id: 2,
    homeTeam: {
      name: 'England',
      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      winProbability: 55
    },
    awayTeam: {
      name: 'South Africa',
      flag: '🇿🇦',
      winProbability: 45
    },
    format: 'T20',
    series: '2nd T20I',
    venue: 'The Oval, London',
    time: '6:00 PM',
    date: 'Today',
    status: 'upcoming',
    predictionDetails: {
      keyFactors: [
        'England has home advantage with supportive crowd',
        "South Africa's recent form has been exceptional in T20s",
        'Weather conditions slightly favor fast bowlers'
      ],
      playerToWatch: {
        name: 'Jos Buttler',
        team: 'England',
        prediction: 'Likely to score 50+ runs'
      }
    }
  },
  {
    id: 3,
    homeTeam: {
      name: 'Pakistan',
      flag: '🇵🇰',
      winProbability: 60
    },
    awayTeam: {
      name: 'New Zealand',
      flag: '🇳🇿',
      winProbability: 40
    },
    format: 'Test',
    series: '1st Test',
    venue: 'National Stadium, Karachi',
    time: '10:00 AM',
    date: 'Tomorrow',
    status: 'upcoming',
    predictionDetails: {
      keyFactors: [
        'Pakistan has strong home record in Test matches',
        'Dry pitch expected to aid spin bowlers as match progresses',
        'New Zealand batsmen historically struggle against quality spin'
      ],
      playerToWatch: {
        name: 'Babar Azam',
        team: 'Pakistan',
        prediction: 'Likely to score a century'
      }
    }
  },
  {
    id: 4,
    homeTeam: {
      name: 'West Indies',
      flag: '🇼🇮',
      winProbability: 35
    },
    awayTeam: {
      name: 'Sri Lanka',
      flag: '🇱🇰',
      winProbability: 65
    },
    format: 'ODI',
    series: '1st ODI',
    venue: 'Kensington Oval, Barbados',
    time: '7:00 PM',
    date: 'Tomorrow',
    status: 'upcoming',
    predictionDetails: {
      keyFactors: [
        "Sri Lanka's recent ODI form has been excellent",
        'West Indies missing key players due to injury',
        'Pitch expected to assist spinners in the second innings'
      ],
      playerToWatch: {
        name: 'Wanindu Hasaranga',
        team: 'Sri Lanka',
        prediction: 'Likely to be the top all-rounder'
      }
    }
  },
  {
    id: 5,
    homeTeam: {
      name: 'Bangladesh',
      flag: '🇧🇩',
      winProbability: 70
    },
    awayTeam: {
      name: 'Afghanistan',
      flag: '🇦🇫',
      winProbability: 30
    },
    format: 'T20',
    series: '3rd T20I',
    venue: 'Shere Bangla National Stadium, Dhaka',
    time: '1:00 PM',
    date: 'Jun 2, 2025',
    status: 'upcoming',
    predictionDetails: {
      keyFactors: [
        'Bangladesh has home advantage with spinning tracks',
        'Bangladesh leads the series 2-0',
        "Afghanistan's key spinner Rashid Khan is in good form"
      ],
      playerToWatch: {
        name: 'Shakib Al Hasan',
        team: 'Bangladesh',
        prediction: 'Likely to deliver with both bat and ball'
      }
    }
  }
];

const MatchPredictions = () => {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setMatches(mockMatchData);
      setSelectedMatch(mockMatchData[0]);
      setIsLoading(false);
    }, 800);
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <p>Loading match predictions...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Match Predictions</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match List */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-100 border-b border-gray-200">
              <h3 className="font-medium text-gray-800">Upcoming Matches</h3>
            </div>
            <div className="overflow-y-auto max-h-[500px]">
              <ul className="divide-y divide-gray-200">
                {matches.map(match => (
                  <li 
                    key={match.id}
                    className={`cursor-pointer hover:bg-blue-50 transition-colors ${selectedMatch?.id === match.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedMatch(match)}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          {match.status === 'live' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                              LIVE
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {match.date}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{match.time}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{match.homeTeam.flag}</span>
                          <span className="font-medium text-gray-800">{match.homeTeam.name}</span>
                        </div>
                        <span className="text-sm font-bold text-blue-600">{match.homeTeam.winProbability}%</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{match.awayTeam.flag}</span>
                          <span className="font-medium text-gray-800">{match.awayTeam.name}</span>
                        </div>
                        <span className="text-sm font-bold text-blue-600">{match.awayTeam.winProbability}%</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {match.format} • {match.venue}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Prediction Details */}
        <div className="lg:col-span-2">
          {selectedMatch ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800">
                    {selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name}
                  </h3>
                  <div className="flex items-center">
                    {selectedMatch.status === 'live' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                        LIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        UPCOMING
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-center mb-8">
                  <div className="flex flex-col items-center w-1/3">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-4xl mb-2">
                      {selectedMatch.homeTeam.flag}
                    </div>
                    <h4 className="font-bold text-gray-800">{selectedMatch.homeTeam.name}</h4>
                  </div>
                  
                  <div className="w-1/3">
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-100 text-blue-800">
                            Win Probability
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-blue-700">{selectedMatch.homeTeam.winProbability}%</span>
                        <span className="text-xs font-bold text-blue-700">{selectedMatch.awayTeam.winProbability}%</span>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div
                          style={{ width: `${selectedMatch.homeTeam.winProbability}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center w-1/3">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-4xl mb-2">
                      {selectedMatch.awayTeam.flag}
                    </div>
                    <h4 className="font-bold text-gray-800">{selectedMatch.awayTeam.name}</h4>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Match Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Match Details</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="text-gray-600 w-20 flex-shrink-0">Format:</span>
                        <span className="font-medium text-gray-800">{selectedMatch.format}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray-600 w-20 flex-shrink-0">Series:</span>
                        <span className="font-medium text-gray-800">{selectedMatch.series}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray-600 w-20 flex-shrink-0">Venue:</span>
                        <span className="font-medium text-gray-800">{selectedMatch.venue}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-gray-600 w-20 flex-shrink-0">Date & Time:</span>
                        <span className="font-medium text-gray-800">{selectedMatch.date}, {selectedMatch.time}</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Prediction Factors */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Key Prediction Factors</h4>
                    <ul className="space-y-2 text-sm">
                      {selectedMatch.predictionDetails.keyFactors.map((factor, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span className="text-gray-800">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Player to Watch */}
                <div className="mt-6 bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Player to Watch</h4>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-2xl mr-3">
                      👨‍🏏
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{selectedMatch.predictionDetails.playerToWatch.name} ({selectedMatch.predictionDetails.playerToWatch.team})</p>
                      <p className="text-sm text-gray-700">{selectedMatch.predictionDetails.playerToWatch.prediction}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-xs text-gray-500">
                  <p>Predictions are based on our AI algorithms analyzing historical data, player form, pitch conditions, and other factors. Predictions are for entertainment purposes only.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-600">Select a match to view detailed prediction</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchPredictions;
