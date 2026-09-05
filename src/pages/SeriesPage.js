import React from 'react';
import { Link } from 'react-router-dom';
import SERIES from '../data/series';

const statusStyles = {
  Live: 'bg-rose-500 text-white',
  Upcoming: 'bg-sky-500 text-white',
  Completed: 'bg-emerald-500 text-white',
};

const SeriesPage = () => {
  const live = SERIES.filter((s) => s.status === 'Live');
  const upcoming = SERIES.filter((s) => s.status === 'Upcoming');
  const completed = SERIES.filter((s) => s.status === 'Completed');

  const renderSeriesCard = (t, i) => {
    const progress = t.totalMatches > 0 ? Math.min(100, Math.round((t.played / t.totalMatches) * 100)) : 0;
    return (
      <div key={t.id} className="card p-5 hover:-translate-y-0.5 hover:shadow-card transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${i * 0.04}s` }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h3 className="font-black text-gray-900 dark:text-white truncate">{t.name}</h3>
              <span className={`badge ${statusStyles[t.status]} ${
                t.status === 'Live' ? 'shadow-glow-rose' : ''
              }`}>
                {t.status === 'Live' && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                )}
                {t.status}
              </span>
            </div>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
              <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">{t.type}</span>
              <span>👥 {t.teams} teams</span>
              <span>🏏 {t.played}/{t.totalMatches} matches</span>
              <span>📍 {t.venue}</span>
            </div>
            {/* Progress bar */}
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${
                  t.status === 'Completed' ? 'bg-gradient-to-r from-emerald-400 to-pitch-600' : 'bg-gradient-to-r from-brand-500 to-violet-500'
                }`} style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 tnum shrink-0">{progress}%</span>
            </div>
          </div>
          <Link to={`/series/${t.id}`} className="btn-ghost shrink-0 !px-4 !py-2 text-sm">
            View Matches
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4 transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* Teams Section */}
        <div className="mb-12">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-2xl">🏏</span> ICC Rankings
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tap a team to see its squad, form, and stats</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { name: 'India', short: 'IND', flag: '🇮🇳', ranking: 1, captain: 'Rohit Sharma', worldCups: 7, gradient: 'from-blue-600 to-indigo-900' },
              { name: 'Australia', short: 'AUS', flag: '🇦🇺', ranking: 2, captain: 'Pat Cummins', worldCups: 10, gradient: 'from-amber-500 to-yellow-700' },
              { name: 'England', short: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', ranking: 3, captain: 'Jos Buttler', worldCups: 4, gradient: 'from-sky-700 to-blue-950' },
              { name: 'South Africa', short: 'SA', flag: '🇿🇦', ranking: 4, captain: 'Temba Bavuma', worldCups: 0, gradient: 'from-emerald-600 to-green-900' },
              { name: 'New Zealand', short: 'NZ', flag: '🇳🇿', ranking: 5, captain: 'Kane Williamson', worldCups: 0, gradient: 'from-slate-600 to-gray-900' },
              { name: 'Pakistan', short: 'PAK', flag: '🇵🇰', ranking: 6, captain: 'Mohammad Rizwan', worldCups: 3, gradient: 'from-emerald-700 to-green-950' },
              { name: 'West Indies', short: 'WI', flag: '🇯🇲', ranking: 7, captain: 'Shai Hope', worldCups: 4, gradient: 'from-rose-800 to-red-950' },
              { name: 'Sri Lanka', short: 'SL', flag: '🇱🇰', ranking: 8, captain: 'Charith Asalanka', worldCups: 3, gradient: 'from-sky-600 to-blue-900' },
              { name: 'Bangladesh', short: 'BAN', flag: '🇧🇩', ranking: 9, captain: 'Najmul Shanto', worldCups: 0, gradient: 'from-green-600 to-emerald-900' },
              { name: 'Afghanistan', short: 'AFG', flag: '🇦🇫', ranking: 10, captain: 'Hashmatullah Shahidi', worldCups: 0, gradient: 'from-blue-700 to-slate-900' },
            ].map((team, i) => (
              <Link
                key={team.short}
                to={`/teams/${team.short.toLowerCase() === 'ind' ? 'india' : team.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="card p-4 text-center group hover:-translate-y-1 hover:shadow-glow-brand transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.04}s` }}
                title={`View ${team.name} details`}
              >
                <div className={`w-14 h-14 mx-auto mb-2.5 rounded-2xl bg-gradient-to-br ${team.gradient} flex items-center justify-center text-3xl shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`} role="img" aria-label={team.name}>
                  {team.flag}
                </div>
                <div className="font-bold text-sm text-gray-800 dark:text-white">{team.name}</div>
                <div className="text-xs text-amber-600 dark:text-amber-400 font-bold">#{team.ranking} Ranked</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">{team.captain}</div>
                <div className="flex justify-center gap-1.5 mt-2 text-[10px]">
                  <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400 font-semibold">
                    {team.worldCups} WC
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Tournaments by status */}
        {[
          { title: 'Live Now', icon: '🔴', items: live },
          { title: 'Upcoming', icon: '📅', items: upcoming },
          { title: 'Completed', icon: '✅', items: completed },
        ].filter((g) => g.items.length > 0).map((group) => (
          <div key={group.title} className="mb-10">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <span>{group.icon}</span> {group.title}
              <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{group.items.length}</span>
            </h2>
            <div className="space-y-3">
              {group.items.map(renderSeriesCard)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeriesPage;
