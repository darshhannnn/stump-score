import React, { useState, useEffect } from 'react';

// Mock data - in a real app, this would come from an API
const mockBattingData = {
  title: 'Top Batting Performances',
  data: [
    { rank: 1, player: 'Virat Kohli', team: 'India', matches: 12, runs: 786, average: 65.5, strikeRate: 98.2, hundreds: 3, fifties: 4 },
    { rank: 2, player: 'Joe Root', team: 'England', matches: 10, runs: 723, average: 60.3, strikeRate: 78.6, hundreds: 2, fifties: 5 },
    { rank: 3, player: 'Babar Azam', team: 'Pakistan', matches: 11, runs: 688, average: 57.3, strikeRate: 87.1, hundreds: 2, fifties: 5 },
    { rank: 4, player: 'Kane Williamson', team: 'New Zealand', matches: 9, runs: 621, average: 56.5, strikeRate: 76.8, hundreds: 2, fifties: 3 },
    { rank: 5, player: 'Steve Smith', team: 'Australia', matches: 10, runs: 605, average: 55.0, strikeRate: 82.3, hundreds: 2, fifties: 3 },
    { rank: 6, player: 'Rohit Sharma', team: 'India', matches: 12, runs: 582, average: 48.5, strikeRate: 94.2, hundreds: 1, fifties: 5 },
    { rank: 7, player: 'Quinton de Kock', team: 'South Africa', matches: 9, runs: 543, average: 45.3, strikeRate: 103.6, hundreds: 1, fifties: 4 },
    { rank: 8, player: 'David Warner', team: 'Australia', matches: 10, runs: 518, average: 43.2, strikeRate: 96.8, hundreds: 1, fifties: 4 },
    { rank: 9, player: 'Shai Hope', team: 'West Indies', matches: 8, runs: 487, average: 48.7, strikeRate: 84.5, hundreds: 1, fifties: 4 },
    { rank: 10, player: 'Shubman Gill', team: 'India', matches: 11, runs: 462, average: 42.0, strikeRate: 97.3, hundreds: 1, fifties: 3 }
  ]
};

const mockBowlingData = {
  title: 'Top Bowling Performances',
  data: [
    { rank: 1, player: 'Jasprit Bumrah', team: 'India', matches: 12, wickets: 28, average: 18.2, economy: 4.82, bestFigures: '5/26' },
    { rank: 2, player: 'Shaheen Afridi', team: 'Pakistan', matches: 11, wickets: 26, average: 19.4, economy: 5.12, bestFigures: '5/32' },
    { rank: 3, player: 'Rashid Khan', team: 'Afghanistan', matches: 9, wickets: 22, average: 18.8, economy: 4.65, bestFigures: '4/29' },
    { rank: 4, player: 'Josh Hazlewood', team: 'Australia', matches: 10, wickets: 22, average: 20.1, economy: 4.95, bestFigures: '4/30' },
    { rank: 5, player: 'Trent Boult', team: 'New Zealand', matches: 9, wickets: 21, average: 22.3, economy: 5.11, bestFigures: '4/35' },
    { rank: 6, player: 'Kagiso Rabada', team: 'South Africa', matches: 9, wickets: 20, average: 23.6, economy: 5.32, bestFigures: '4/31' },
    { rank: 7, player: 'Mitchell Starc', team: 'Australia', matches: 10, wickets: 19, average: 24.2, economy: 5.45, bestFigures: '4/28' },
    { rank: 8, player: 'Mohammed Shami', team: 'India', matches: 11, wickets: 19, average: 23.8, economy: 5.21, bestFigures: '4/36' },
    { rank: 9, player: 'Jofra Archer', team: 'England', matches: 8, wickets: 18, average: 23.1, economy: 5.17, bestFigures: '4/33' },
    { rank: 10, player: 'Mustafizur Rahman', team: 'Bangladesh', matches: 9, wickets: 16, average: 25.8, economy: 5.38, bestFigures: '3/27' }
  ]
};

const mockTeamData = {
  title: 'Team Rankings and Stats',
  data: [
    { rank: 1, team: 'India', played: 25, won: 19, lost: 5, noresult: 1, winPercentage: 79.2, rating: 121 },
    { rank: 2, team: 'Australia', played: 22, won: 16, lost: 5, noresult: 1, winPercentage: 76.2, rating: 118 },
    { rank: 3, team: 'England', played: 23, won: 15, lost: 7, noresult: 1, winPercentage: 68.2, rating: 116 },
    { rank: 4, team: 'New Zealand', played: 20, won: 13, lost: 6, noresult: 1, winPercentage: 68.4, rating: 113 },
    { rank: 5, team: 'Pakistan', played: 24, won: 15, lost: 8, noresult: 1, winPercentage: 65.2, rating: 112 },
    { rank: 6, team: 'South Africa', played: 19, won: 12, lost: 7, noresult: 0, winPercentage: 63.2, rating: 108 },
    { rank: 7, team: 'Bangladesh', played: 22, won: 9, lost: 12, noresult: 1, winPercentage: 42.9, rating: 92 },
    { rank: 8, team: 'Sri Lanka', played: 23, won: 9, lost: 13, noresult: 1, winPercentage: 40.9, rating: 90 },
    { rank: 9, team: 'West Indies', played: 21, won: 7, lost: 13, noresult: 1, winPercentage: 35.0, rating: 88 },
    { rank: 10, team: 'Afghanistan', played: 18, won: 6, lost: 11, noresult: 1, winPercentage: 35.3, rating: 86 }
  ]
};

const PremiumStats = () => {
  const [activeStats, setActiveStats] = useState('batting');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    batting: [],
    bowling: [],
    team: []
  });

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setStats({
        batting: mockBattingData.data,
        bowling: mockBowlingData.data,
        team: mockTeamData.data
      });
      setIsLoading(false);
    }, 800);
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
        <p>Loading statistics...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Premium Statistics</h2>
      
      <div className="mb-6">
        <div className="flex rounded-md shadow-sm">
          <button
            className={`px-5 py-2 text-sm font-medium rounded-l-md ${
              activeStats === 'batting'
                ? 'bg-blue-600 text-white'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            } border`}
            onClick={() => setActiveStats('batting')}
          >
            Batting
          </button>
          <button
            className={`px-5 py-2 text-sm font-medium ${
              activeStats === 'bowling'
                ? 'bg-blue-600 text-white'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            } border-t border-b border-r`}
            onClick={() => setActiveStats('bowling')}
          >
            Bowling
          </button>
          <button
            className={`px-5 py-2 text-sm font-medium rounded-r-md ${
              activeStats === 'team'
                ? 'bg-blue-600 text-white'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            } border-t border-b border-r`}
            onClick={() => setActiveStats('team')}
          >
            Team
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeStats === 'team' ? 'Team' : 'Player'}
                </th>
                {activeStats !== 'team' && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                )}
                {activeStats === 'batting' && (
                  <>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Matches
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Runs
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Strike Rate
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      100s/50s
                    </th>
                  </>
                )}
                {activeStats === 'bowling' && (
                  <>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Matches
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wickets
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Economy
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Best
                    </th>
                  </>
                )}
                {activeStats === 'team' && (
                  <>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Played
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Won
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lost
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Win %
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeStats === 'batting' &&
                stats.batting.map(player => (
                  <tr key={`batting-${player.rank}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{player.rank}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{player.player}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.team}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.matches}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{player.runs}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.average}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.strikeRate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.hundreds}/{player.fifties}</td>
                  </tr>
                ))}
                
              {activeStats === 'bowling' &&
                stats.bowling.map(player => (
                  <tr key={`bowling-${player.rank}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{player.rank}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{player.player}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.team}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.matches}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{player.wickets}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.average}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.economy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.bestFigures}</td>
                  </tr>
                ))}
                
              {activeStats === 'team' &&
                stats.team.map(team => (
                  <tr key={`team-${team.rank}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{team.rank}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{team.team}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.played}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.won}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.lost}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{team.winPercentage}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.rating}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="py-3 px-6 bg-gray-50 text-xs text-gray-500">
          <p>Stats updated as of May 31, 2025. Rankings based on ICC official ratings.</p>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-medium text-gray-800 mb-2">About Premium Statistics</h3>
        <p className="text-sm text-gray-600 mb-4">
          As a premium member, you have access to in-depth statistics and analytics that are updated daily. 
          Our comprehensive database covers all international cricket formats and major domestic leagues.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-3 rounded border border-gray-200">
            <h4 className="font-medium text-gray-800 mb-1">Advanced Metrics</h4>
            <p className="text-gray-600">Access to advanced performance metrics beyond traditional statistics</p>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <h4 className="font-medium text-gray-800 mb-1">Historical Data</h4>
            <p className="text-gray-600">Complete historical records dating back to the beginning of cricket</p>
          </div>
          <div className="bg-white p-3 rounded border border-gray-200">
            <h4 className="font-medium text-gray-800 mb-1">Comparative Analysis</h4>
            <p className="text-gray-600">Tools to compare players and teams across different eras</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumStats;
