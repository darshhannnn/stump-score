import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TEAMS from '../data/teams';

const TeamsPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Brief delay so the loading state is perceivable (teams are local data)
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow py-8 bg-gray-50 dark:bg-gray-950 transition-colors">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-700 shadow-glow-brand flex items-center justify-center text-2xl">👥</div>
            <h1 className="text-3xl font-black mb-3">
              <span className="text-gradient-animated">Cricket Teams</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Explore the top ten ICC-ranked teams — squads, captains, form, and World Cup pedigree.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="skeleton h-28 rounded-none" />
                  <div className="p-6 space-y-3">
                    <div className="skeleton h-5 w-32" />
                    <div className="skeleton h-4 w-full" />
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-9 w-full rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {TEAMS.map((team, i) => (
                <div key={team.id} className="card overflow-hidden hover:-translate-y-1 hover:shadow-glow-brand transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  {/* Team banner */}
                  <div className={`relative h-28 bg-gradient-to-br ${team.gradient} overflow-hidden`}>
                    <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
                    <div className="absolute -right-4 -bottom-6 text-8xl opacity-90 select-none" role="img" aria-label={team.name}>{team.flag}</div>
                    <div className="absolute top-3 left-4 flex items-center gap-2">
                      <span className="badge bg-white/15 text-white backdrop-blur-sm">{team.short}</span>
                      <span className="badge bg-amber-400/90 text-amber-950">#{team.ranking}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-black text-gray-800 dark:text-gray-100">{team.name}</h3>
                      <div className="flex gap-1" title="Recent form">
                        {team.form.map((r, j) => (
                          <span key={j} className={`w-5 h-5 rounded text-[10px] font-black flex items-center justify-center ${r === 'W' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'}`}>{r}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-4">
                      <p>🏆 Captain: <b className="text-gray-700 dark:text-gray-300">{team.captain}</b></p>
                      <p>📋 Coach: <b className="text-gray-700 dark:text-gray-300">{team.coach}</b></p>
                      <p>🥇 World Cups: <b className="text-gray-700 dark:text-gray-300 tnum">{team.worldCups}</b> &bull; Rating: <b className="text-gray-700 dark:text-gray-300 tnum">{team.rating}</b></p>
                    </div>
                    <Link to={`/teams/${team.id}`} className="btn-primary w-full !py-2 text-sm">
                      View Team Details
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeamsPage;
