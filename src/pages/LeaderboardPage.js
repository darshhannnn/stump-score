import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { getPlayerStats, getRecentGames } from '../utils/gameStorage';

const LeaderboardPage = () => {
  const stats = getPlayerStats();
  const recentGames = getRecentGames(5);

  const chartData = stats.slice(0, 10).map((player, index) => ({
    name: player.name,
    wins: player.winRate,
    avg: player.avgScore,
    fill: index < 3 ? ['#F59E0B', '#EF4444', '#10B981'][index] : '#6B7280'
  }));

  const medals = ['🥇', '🥈', '🥉'];
  const medalColors = [
    'from-amber-400 to-amber-600',
    'from-gray-300 to-gray-500',
    'from-orange-400 to-orange-600'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-brand-950/40 py-12 px-4 transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <span className="text-lg">🏆</span>
            Hall of Fame
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            <span className="text-gradient-animated">Leaderboard</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Your Stump game history and stats. Wins, average scores, highest scores tracked automatically.
          </p>
        </div>

        {stats.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Stats Yet</h2>
            <p className="text-gray-500 mb-6">Play some games and your stats will appear here!</p>
            <Link
              to="/scorekeeper"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold
                rounded-xl shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-200"
            >
              Start Playing
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Top Players */}
            <div className="card p-6 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">🏅</span>
                <h2 className="text-xl font-bold text-gray-800">Top Players</h2>
              </div>
              <div className="space-y-3">
                {stats.slice(0, 10).map((player, index) => (
                  <div
                    key={player.name}
                    className={`flex items-center p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                      index < 3
                        ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/5 border border-amber-100 dark:border-amber-500/20'
                        : 'bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Rank */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white mr-4
                      bg-gradient-to-br ${index < 3 ? medalColors[index] : 'from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700'}
                      shadow-md text-sm`}>
                      {index < 3 ? medals[index] : index + 1}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 dark:text-gray-100 truncate">{player.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {player.avgScore} avg &bull; {player.highest} high &bull; {player.streak} win streak
                      </div>
                    </div>

                    {/* Win Rate */}
                    <div className="text-right ml-4">
                      <div className={`text-xl font-black tnum ${
                        player.winRate >= 70 ? 'text-emerald-600 dark:text-emerald-400' :
                        player.winRate >= 50 ? 'text-amber-600 dark:text-amber-400' :
                        'text-gray-600 dark:text-gray-300'
                      }`}>
                        {player.winRate}%
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">win rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Win Rate Chart */}
              <div className="card p-6 animate-fade-in-up stagger-2">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-2xl">📈</span>
                  <h2 className="text-xl font-bold text-gray-800">Win Rates</h2>
                </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: '#94a3b8' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#94a3b8' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                          contentStyle={{
                            borderRadius: '14px',
                            border: 'none',
                            backgroundColor: 'rgba(17, 24, 39, 0.92)',
                            boxShadow: '0 12px 32px -8px rgba(0, 0, 0, 0.35)',
                            color: '#f3f4f6',
                          }}
                          itemStyle={{ color: '#93c5fd', fontWeight: 700 }}
                          labelStyle={{ color: '#e5e7eb', fontWeight: 600 }}
                        />
                        <Bar
                          dataKey="wins"
                          radius={[8, 8, 0, 0]}
                          fill="#3377fb"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
              </div>

              {/* Recent Games */}
              <div className="card p-6 animate-fade-in-up stagger-4">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-2xl">🕐</span>
                  <h2 className="text-xl font-bold text-gray-800">Recent Games</h2>
                </div>
                <div className="space-y-3">
                  {recentGames.map((game, index) => (
                    <div
                      key={game.id}
                      className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all duration-200 group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-mono text-xs text-brand-600 dark:text-brand-300 bg-brand-500/10 px-2 py-1 rounded-md font-bold">
                          #{game.id.slice(-6).toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(game.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="space-y-1">
                        {game.players.map((p) => (
                          <div key={p.id} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 dark:text-gray-200 font-medium">{p.name}</span>
                            <span className={`font-bold tnum ${
                              game.stats?.some(s => s.isWin && s.playerId === p.id)
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {p.score}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
