import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSeriesById } from '../data/series';
import { getTeamById } from '../data/teams';
import { fetchCurrentMatches } from '../services/cricketApi';

const flagFor = (teamName) => {
  const t = getTeamById(
    teamName?.toLowerCase().replace(/\s+/g, '-') || ''
  );
  return t?.flag || '🏏';
};

const statusBadge = (status) => {
  if (status === 'Live') return 'bg-rose-500 text-white shadow-glow-rose';
  if (status === 'Upcoming') return 'bg-sky-500 text-white';
  return 'bg-emerald-500 text-white shadow-glow-emerald';
};

const SeriesDetailPage = () => {
  const { seriesId } = useParams();
  const series = getSeriesById(seriesId);
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!series) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const all = await fetchCurrentMatches();
        if (!active) return;
        const matched = all.filter((m) => {
          const hay = `${m.series || ''} ${m.name || ''}`.toLowerCase();
          return series.keywords.some((k) => hay.includes(k));
        });
        setLiveMatches(matched);
      } catch {
        if (active) setLiveMatches([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 30000);
    return () => { active = false; clearInterval(id); };
  }, [series]);

  if (!series) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-2xl font-black text-gray-800 dark:text-white mb-2">Series not found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">That tournament isn't in our records.</p>
        <Link to="/series" className="btn-primary">Browse all series</Link>
      </div>
    );
  }

  const progress = series.totalMatches > 0 ? Math.min(100, Math.round((series.played / series.totalMatches) * 100)) : 0;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link to="/series" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline mb-5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          All Series & Tournaments
        </Link>

        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-950 via-blue-900 to-indigo-950 text-white p-6 md:p-9 mb-6 shadow-card animate-fade-in">
          <div className="absolute -top-20 -right-16 w-72 h-72 bg-brand-500/25 rounded-full blur-3xl animate-float pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.12] pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative">
            <div className="flex items-center gap-2.5 flex-wrap mb-2">
              <span className={`badge ${statusBadge(series.status)}`}>
                {series.status === 'Live' && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                )}
                {series.status}
              </span>
              <span className="badge bg-white/10 text-white backdrop-blur-sm">{series.type}</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-1">{series.name}</h1>
            <p className="text-blue-200/90 text-sm max-w-2xl">{series.description}</p>

            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Teams', value: series.teams, icon: '👥' },
                { label: 'Matches', value: `${series.played}/${series.totalMatches}`, icon: '🏏' },
                { label: 'Venue', value: series.venue, icon: '📍' },
                { label: 'Defending', value: series.defending, icon: '🛡️' },
              ].map((m) => (
                <div key={m.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <div className="text-lg">{m.icon}</div>
                  <div className="font-bold text-sm mt-0.5 truncate">{m.value}</div>
                  <div className="text-[11px] text-blue-300 uppercase tracking-wider font-semibold">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="mt-5">
              <div className="flex justify-between text-xs text-blue-200 mb-1.5 font-semibold">
                <span>{series.dates}</span>
                <span>{progress}% played</span>
              </div>
              <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-violet-400 transition-all duration-1000" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Standings */}
        {series.standings && (
          <div className="card p-6 mb-6 animate-fade-in-up">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">📊 Points Table</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-widest text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800">
                    <th className="py-2 pr-4 font-bold">Team</th>
                    <th className="py-2 px-3 font-bold">P</th>
                    <th className="py-2 px-3 font-bold">W</th>
                    <th className="py-2 px-3 font-bold">L</th>
                    <th className="py-2 px-3 font-bold">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {series.standings.map((row, i) => (
                    <tr key={row.team} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-gray-800 dark:text-gray-100">
                        <span className="inline-flex items-center gap-2.5">
                          {i === 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                          <span className="text-lg">{flagFor(row.team)}</span>
                          {row.team}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-500 dark:text-gray-400 tnum">{row.p}</td>
                      <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-semibold tnum">{row.w}</td>
                      <td className="py-3 px-3 text-rose-500 dark:text-rose-400 font-semibold tnum">{row.l}</td>
                      <td className="py-3 px-3 font-black text-gray-800 dark:text-gray-100 tnum">{row.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Live matches from API */}
        <div className="card p-6 mb-6 animate-fade-in-up">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            🔴 Matches
            {liveMatches.length > 0 && <span className="badge bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">{liveMatches.length} tracked</span>}
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div className="skeleton h-5 w-48" />
                  <div className="skeleton h-5 w-24 rounded-full" />
                </div>
              ))}
            </div>
          ) : liveMatches.length > 0 ? (
            <div className="space-y-3">
              {liveMatches.map((m) => (
                <Link key={m.id} to={`/match/${m.id}`} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 hover:border-brand-300 dark:hover:border-brand-500/40 hover:shadow-md transition-all duration-200 group">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{m.name || `${m.team1?.name} vs ${m.team2?.name}`}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{m.currentStatus}</div>
                  </div>
                  <span className={`badge shrink-0 ml-3 ${
                    m.status === 'LIVE' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                    : m.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400'
                  }`}>{m.status}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No {series.name} matches are being tracked right now{series.status === 'Live' ? ' — check the fixtures below and the live hub.' : '.'}
            </p>
          )}
        </div>

        {/* Fixtures / results from series data */}
        <div className="card p-6 mb-6 animate-fade-in-up">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            🗓️ {series.status === 'Completed' ? 'Key Results' : series.status === 'Upcoming' ? 'Schedule' : 'Recent & Upcoming Fixtures'}
          </h2>
          <div className="space-y-3">
            {series.fixtures.map((f, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl" role="img" aria-hidden="true">{flagFor(f.t1)}</span>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                      {f.t1} <span className="text-gray-400 font-normal">vs</span> {f.t2}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{f.venue}</div>
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <div className="text-xs font-bold text-brand-600 dark:text-brand-400">{f.date} &bull; {f.time}</div>
                  {f.result && <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">{f.result}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/" className="btn-primary">Go to Live Hub</Link>
          <Link to="/teams" className="btn-ghost">Explore Teams</Link>
        </div>
      </div>
    </div>
  );
};

export default SeriesDetailPage;
