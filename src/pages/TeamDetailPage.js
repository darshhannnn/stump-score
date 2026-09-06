import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getTeamById, ROLE_STYLES } from '../data/teams';
import authService from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const TeamDetailPage = () => {
  const { teamId } = useParams();
  const team = getTeamById(teamId);
  const { isAuthenticated } = useAuth();
  const [favorited, setFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!isAuthenticated || !teamId) return;
      try {
        const favorites = await authService.getFavorites();
        setFavorited(favorites.includes(teamId));
      } catch {
        // Non-blocking: favorites are a nice-to-have
      }
    };
    checkFavorite();
  }, [isAuthenticated, teamId]);

  const toggleFavorite = async () => {
    if (!isAuthenticated || favLoading) return;
    setFavLoading(true);
    const prev = favorited;
    setFavorited(!prev); // optimistic
    try {
      const result = await authService.toggleFavorite(teamId);
      setFavorited(result.favorited);
    } catch {
      setFavorited(prev); // revert on failure
    } finally {
      setFavLoading(false);
    }
  };

  if (!team) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="text-6xl mb-4">🏏</div>
        <h1 className="text-2xl font-black text-gray-800 dark:text-white mb-2">Team not found</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">That team doesn't play in our database.</p>
        <Link to="/teams" className="btn-primary">Browse all teams</Link>
      </div>
    );
  }

  const stats = [
    { label: 'ICC Ranking', value: `#${team.ranking}`, icon: '🏆' },
    { label: 'World Cups', value: team.worldCups, icon: '🥇' },
    { label: 'ICC Rating', value: team.rating, icon: '📈' },
    { label: 'Win Rate', value: `${team.winPercent}%`, icon: '⚡' },
  ];

  const formColor = (r) =>
    r === 'W'
      ? 'bg-emerald-500 text-white shadow-glow-emerald'
      : 'bg-rose-500 text-white shadow-glow-rose';

  return (
    <div className="bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link to="/teams" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline mb-5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          All Teams
        </Link>

        {/* Hero banner */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${team.gradient} text-white p-6 md:p-10 mb-6 shadow-card animate-fade-in`}>
          <div className="absolute -top-16 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            <div className="text-7xl md:text-8xl animate-float shrink-0" role="img" aria-label={team.name}>{team.flag}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                <span className="badge bg-white/15 text-white backdrop-blur-sm">{team.short}</span>
                <span className="badge bg-amber-400/90 text-amber-950">#{team.ranking} ICC Ranked</span>
                {isAuthenticated && (
                  <button
                    onClick={toggleFavorite}
                    disabled={favLoading}
                    className={`badge transition-all duration-200 active:scale-90 ${
                      favorited
                        ? 'bg-rose-500 text-white shadow-glow-rose'
                        : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm'
                    }`}
                    title={favorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <span className={favorited ? 'scale-110' : ''}>{favorited ? '♥' : '♡'}</span>
                    {favorited ? 'Favorited' : 'Favorite'}
                  </button>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">{team.name}</h1>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-white/85">
                <span className="flex items-center gap-1.5"><span className="opacity-60">Captain</span> <b>{team.captain}</b></span>
                <span className="flex items-center gap-1.5"><span className="opacity-60">Coach</span> <b>{team.coach}</b></span>
              </div>
              {/* Recent form */}
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-white/60 font-bold mr-1">Form</span>
                {team.form.map((r, i) => (
                  <span key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${formColor(r)}`}>{r}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="card p-4 text-center hover:-translate-y-0.5 transition-all duration-300">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-2xl font-black text-gray-800 dark:text-gray-100 tnum">{s.value}</div>
              <div className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* About */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">About the {team.name}</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{team.description}</p>
        </div>

        {/* Squad */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            👥 Key Players
            <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{team.squad.length}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {team.squad.map((p) => (
              <div key={p.name} className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-500/30 hover:shadow-sm transition-all duration-200">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                    {p.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </span>
                  <span className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{p.name}</span>
                </div>
                <span className={`badge shrink-0 ${ROLE_STYLES[p.role] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>{p.role}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
            <span><span className="inline-block w-2 h-2 rounded-full bg-brand-500 mr-1" />Batsman</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-rose-500 mr-1" />Bowler</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-violet-500 mr-1" />All-rounder</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1" />Wicket-keeper</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/" className="btn-primary">View Live Matches</Link>
          <Link to="/series" className="btn-ghost">Browse Series</Link>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailPage;
