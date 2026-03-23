import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

/**
 * Advanced Match Analysis component
 * @param {Object} data - Data for charts
 * @param {Object} probability - Win probability data
 * @param {Object} teams - Team info
 * @returns {JSX.Element} Analysis charts
 */
const MatchAnalysis = ({ data, probability, teams }) => {
  if (!data || !probability || !teams) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
      <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
        <span className="mr-2">📊</span> Advanced Match Analysis
      </h3>

      {/* Win Probability Bar */}
      <div className="mb-10">
        <div className="flex justify-between text-sm font-semibold mb-2">
          <span className="text-blue-700">{teams.team1.name} ({probability.team1}%)</span>
          <span className="text-yellow-600">{teams.team2.name} ({probability.team2}%)</span>
        </div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex shadow-inner">
          <div 
            className="h-full bg-blue-600 transition-all duration-1000 ease-in-out"
            style={{ width: `${probability.team1}%` }}
          />
          <div 
            className="h-full bg-yellow-400 transition-all duration-1000 ease-in-out"
            style={{ width: `${probability.team2}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center italic">
          * Win probability calculated based on current run rate and wickets remaining
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Run Progression (Worm Graph) */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <h4 className="font-bold text-gray-700 mb-4 flex items-center">
            <span className="mr-2 text-blue-500">📈</span> Run Progression (Worm)
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorT1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorT2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="over" label={{ value: 'Overs', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Runs', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="team1" 
                  name={teams.team1.name} 
                  stroke="#2563eb" 
                  fillOpacity={1} 
                  fill="url(#colorT1)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="team2" 
                  name={teams.team2.name} 
                  stroke="#eab308" 
                  fillOpacity={1} 
                  fill="url(#colorT2)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Run Rate Comparison */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <h4 className="font-bold text-gray-700 mb-4 flex items-center">
            <span className="mr-2 text-green-500">📉</span> Run Rate Comparison
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="over" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Legend />
                <Line 
                  type="stepAfter" 
                  dataKey="team1RR" 
                  name={`${teams.team1.name} CRR`} 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="stepAfter" 
                  dataKey="team2RR" 
                  name={`${teams.team2.name} CRR`} 
                  stroke="#eab308" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchAnalysis;
