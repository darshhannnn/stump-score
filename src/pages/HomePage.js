import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { fetchCurrentMatches, getFeaturedMatch } from '../services/cricketApi';
import StatisticsModal from '../components/StatisticsModal';

// Unified status color coding: LIVE = rose, COMPLETED = emerald, UPCOMING = sky
const getStatusBadge = (status) => {
  const s = (status || '').toLowerCase();
  if (s.includes('live')) {
    return {
      label: 'LIVE',
      chip: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
      dot: 'bg-rose-500',
      bar: 'border-l-rose-500',
      solid: 'bg-gradient-to-r from-rose-500 to-red-500 shadow-glow-rose',
    };
  }
  if (s.includes('completed') || s.includes('won') || s.includes('lost')) {
    return {
      label: 'COMPLETED',
      chip: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
      dot: 'bg-emerald-500',
      bar: 'border-l-emerald-500',
      solid: 'bg-gradient-to-r from-emerald-500 to-pitch-600 shadow-glow-emerald',
    };
  }
  return {
    label: 'UPCOMING',
    chip: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
    dot: 'bg-sky-500',
    bar: 'border-l-sky-500',
    solid: 'bg-gradient-to-r from-sky-500 to-brand-500',
  };
};

const formatScore = (team) => {
  if (!team.score && team.score !== 0) return 'Yet to bat';
  return `${team.score}/${team.wickets}`;
};

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState(null);
  const [liveMatches, setLiveMatches] = useState([]);
  const [featuredMatch, setFeaturedMatch] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [, setUsingMockData] = useState(false);
  const [activeTab, setActiveTab] = useState('live');
  const [currentStat, setCurrentStat] = useState(null);
  const [isScoreUpdating, setIsScoreUpdating] = useState(false);
  const [shareModal, setShareModal] = useState(null);
  const [filter, setFilter] = useState('all');
  const previousScores = useRef({});

  const hasScoreChanged = useCallback((match) => {
    if (!match?.id) return false;
    const prev = previousScores.current[match.id];
    if (!prev) return false;
    return prev.t1s !== match.team1?.score || prev.t2s !== match.team2?.score;
  }, []);

  const fetchData = useCallback(async (force = false) => {
    try {
      if (liveMatches.length === 0 || force) setIsLoading(true);
      setError(null);
      if (liveMatches.length > 0) {
        const map = {};
        liveMatches.forEach(m => { if (m?.id) map[m.id] = { t1s: m.team1?.score, t2s: m.team2?.score }; });
        previousScores.current = map;
      }
      setLastUpdated(new Date());
      const data = await fetchCurrentMatches();
      if (data && data.length > 0) {
        setLiveMatches(prev => JSON.stringify(prev) !== JSON.stringify(data) ? data : prev);
        setFeaturedMatch(getFeaturedMatch(data));
        setUsingMockData(false);
        if (data.some(m => hasScoreChanged(m))) {
          setIsScoreUpdating(true);
          setTimeout(() => setIsScoreUpdating(false), 2000);
        }
      } else {
        throw new Error('No matches');
      }
    } catch {
      if (liveMatches.length === 0) {
        setLiveMatches(getFallbackMatches());
        setFeaturedMatch(getFallbackMatches()[0]);
        setUsingMockData(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [liveMatches, hasScoreChanged]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const shareMatch = (match) => {
    const url = `${window.location.origin}/match/${match.id}`;
    if (navigator.share) {
      navigator.share({ title: `${match.team1.name} vs ${match.team2.name}`, url });
    } else {
      navigator.clipboard.writeText(url).catch(() => {});
      setShareModal(match);
      setTimeout(() => setShareModal(null), 2000);
    }
  };

  const liveList = liveMatches.filter(m => m.status?.includes('LIVE'));
  const completedList = liveMatches.filter(m => m.status?.includes('COMPLETED'));
  const upcomingList = liveMatches.filter(m => m.status?.includes('UPCOMING'));

  const filterMatches = (list) => {
    if (filter === 'all') return list;
    return list.filter(m => m.matchType?.toLowerCase() === filter);
  };

  const statsData = {
    topScorer: { title: 'Top Scorer', subtitle: 'Rohit Sharma', stats: { 'Runs': '115', 'Balls': '87', '4s': '12', '6s': '6', 'SR': '132.18' }},
    bestBowler: { title: 'Best Bowler', subtitle: 'Jasprit Bumrah', stats: { 'Wickets': '4', 'Runs': '32', 'Overs': '8.2', 'Economy': '3.85' }},
    partnership: { title: 'Partnership', subtitle: 'Kohli - Pant', stats: { 'Runs': '137', 'Balls': '118', 'Run Rate': '6.97', 'For Wicket': '4th' }},
  };

  const quickStats = [
    { label: 'Top Scorer', name: 'R. Sharma', value: '115 (87)', stat: 'topScorer', icon: '🏏', tile: 'from-amber-400 to-orange-500 shadow-amber-500/25' },
    { label: 'Best Bowler', name: 'J. Bumrah', value: '4/32', stat: 'bestBowler', icon: '🎯', tile: 'from-pitch-400 to-emerald-600 shadow-emerald-500/25' },
    { label: 'Partnership', name: 'Kohli - Pant', value: '137 runs', stat: 'partnership', icon: '🤝', tile: 'from-violet-400 to-purple-600 shadow-purple-500/25' },
    { label: "Today's Matches", name: `${liveMatches.length} Total`, value: `${liveList.length} Live`, stat: null, icon: '📅', tile: 'from-brand-400 to-indigo-600 shadow-brand-500/25' },
  ];

  const tabs = [
    { id: 'live', label: 'Live', count: liveList.length },
    { id: 'completed', label: 'Completed', count: completedList.length },
    { id: 'upcoming', label: 'Upcoming', count: upcomingList.length },
    { id: 'series', label: 'Series' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-blue-900 to-indigo-950 dark:from-gray-950 dark:via-brand-950 dark:to-indigo-950 text-white">
        {/* Ambient orbs */}
        <div className="absolute -top-24 -right-16 w-80 h-80 bg-brand-500/25 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute -bottom-28 -left-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2.5s' }} />
        <div className="absolute top-1/3 left-1/2 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        {/* Dot grid texture */}
        <div className="absolute inset-0 opacity-[0.12] pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative container mx-auto px-4 py-6 md:py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2.5">
                <span className="text-3xl">🏏</span> Live Cricket
              </h1>
              <p className="text-blue-200/80 text-xs md:text-sm mt-1">Ball-by-ball scores from around the world</p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-blue-200 bg-white/10 rounded-full px-3 py-1.5 backdrop-blur-sm">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button onClick={() => fetchData(true)} className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-200 backdrop-blur-sm" title="Refresh">
                <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {featuredMatch && (
            <Link to={`/match/${featuredMatch.id}`} className="block bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-xl rounded-3xl p-5 md:p-7 border border-white/15 hover:border-white/30 shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-2.5 mb-5 flex-wrap">
                <span className={`badge text-white ${featuredMatch.status === 'LIVE' ? getStatusBadge('LIVE').solid : featuredMatch.status === 'COMPLETED' ? getStatusBadge('COMPLETED').solid : 'bg-gradient-to-r from-sky-500 to-brand-500'}`}>
                  {featuredMatch.status === 'LIVE' && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                  )}
                  {featuredMatch.status}
                </span>
                <span className="text-blue-100 text-xs font-semibold">{featuredMatch.series || featuredMatch.name}</span>
                <span className="text-blue-300/70 text-xs hidden sm:inline flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {featuredMatch.venue}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 md:gap-5 min-w-0">
                  <div className="relative shrink-0">
                    <img src={featuredMatch.team1.logo} alt="" className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white shadow-xl ring-2 ring-white/25 group-hover:ring-white/40 transition-all" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${featuredMatch.team1.short_name}&background=0D47A1&color=fff&size=64`; }} />
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-br from-brand-400 to-indigo-500 border-2 border-blue-900" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-xs md:text-sm text-white/90 truncate">{featuredMatch.team1.name}</div>
                    <div className={`text-2xl md:text-4xl font-black tnum tracking-tight transition-all duration-500 ${isScoreUpdating ? 'text-amber-300 drop-shadow-[0_0_18px_rgba(252,211,77,0.65)] scale-105' : ''}`}>{formatScore(featuredMatch.team1)}</div>
                    <div className="text-blue-300/80 text-xs tnum">{featuredMatch.team1.overs ? `(${featuredMatch.team1.overs} ov)` : ''}</div>
                  </div>
                </div>
                <div className="shrink-0 w-11 h-11 md:w-14 md:h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[11px] md:text-sm font-black text-white/50 backdrop-blur-sm">VS</div>
                <div className="flex items-center gap-3 md:gap-5 flex-row-reverse min-w-0">
                  <div className="relative shrink-0">
                    <img src={featuredMatch.team2.logo} alt="" className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white shadow-xl ring-2 ring-white/25 transition-all" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${featuredMatch.team2.short_name}&background=FFC107&color=000&size=64`; }} />
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-blue-900" />
                  </div>
                  <div className="text-right min-w-0">
                    <div className="font-semibold text-xs md:text-sm text-white/90 truncate">{featuredMatch.team2.name}</div>
                    <div className={`text-2xl md:text-4xl font-black tnum tracking-tight transition-all duration-500 ${isScoreUpdating ? 'text-amber-300 drop-shadow-[0_0_18px_rgba(252,211,77,0.65)] scale-105' : ''}`}>{formatScore(featuredMatch.team2)}</div>
                    <div className="text-blue-300/80 text-xs tnum">{featuredMatch.team2.overs ? `(${featuredMatch.team2.overs} ov)` : ''}</div>
                  </div>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse shrink-0" />
                <p className="text-sm text-blue-100 font-medium">{featuredMatch.currentStatus}</p>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* ===== Quick Stats (color-coded) ===== */}
      <section className="bg-white/60 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-800 backdrop-blur-sm transition-colors">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickStats.map((s, i) => (
              <div key={i} className="group flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 cursor-pointer" onClick={() => s.stat && setCurrentStat(s.stat)}>
                <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.tile} shadow-lg flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  {s.icon}
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">{s.label}</div>
                  <div className="font-bold text-sm text-gray-800 dark:text-gray-100 truncate">{s.name}</div>
                  <div className="text-brand-600 dark:text-brand-400 font-bold text-sm tnum">{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Tabs + Filters ===== */}
      <section className="bg-white/60 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-800 sticky top-[104px] z-40 backdrop-blur-xl transition-colors">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-3 py-2.5">
            <div className="flex gap-1 bg-gray-100/80 dark:bg-gray-800/60 rounded-xl p-1 overflow-x-auto">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative px-3.5 md:px-5 py-2 text-sm font-bold rounded-lg whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-300 shadow-md'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}>
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      activeTab === tab.id ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300' : 'bg-gray-200/80 dark:bg-gray-700 text-gray-500'
                    }`}>{tab.count}</span>
                  )}
                </button>
              ))}
            </div>
            {activeTab !== 'series' && (
              <div className="hidden sm:flex gap-1 bg-gray-100/80 dark:bg-gray-800/60 rounded-xl p-1">
                {['all', 't20', 'odi', 'test'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                    filter === f
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}>
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== Content ===== */}
      <section className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map(i => <MatchCardSkeleton key={i} />)}
          </div>
        ) : activeTab === 'series' ? (
          <Link to="/series" className="block text-center py-14 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-glow-brand hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-glow-gold flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">🏆</div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">View All Series & Tournaments</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ICC Rankings, team stats, tournament brackets</p>
          </Link>
        ) : (
          <div className="space-y-3">
            {filterMatches(activeTab === 'live' ? liveList : activeTab === 'completed' ? completedList : upcomingList).map((match, i) => (
              <MatchCard key={match.id} match={match} shareMatch={shareMatch} index={i} />
            ))}
            {filterMatches(activeTab === 'live' ? liveList : activeTab === 'completed' ? completedList : upcomingList).length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-3xl">📭</div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">No {activeTab} matches</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try a different filter or check back later</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Share Toast */}
      {shareModal && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-500 to-pitch-600 text-white px-5 py-3 rounded-2xl shadow-glow-emerald animate-fade-in-up flex items-center gap-2.5 z-50 font-semibold">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Link copied!
        </div>
      )}

      {currentStat && statsData[currentStat] && (
        <StatisticsModal isOpen={true} onClose={() => setCurrentStat(null)} title={statsData[currentStat].title} subtitle={statsData[currentStat].subtitle} statsData={statsData[currentStat].stats} />
      )}

      <Footer />
    </div>
  );
};

const MatchCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 border-l-4 border-l-gray-200 dark:border-l-gray-700 p-4">
    <div className="flex items-center justify-between mb-4">
      <div className="skeleton h-5 w-24 rounded-full" />
      <div className="skeleton h-4 w-28" />
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <div className="skeleton w-10 h-10 rounded-full" />
        <div className="space-y-2">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-5 w-16" />
        </div>
      </div>
      <div className="skeleton w-8 h-8 rounded-full" />
      <div className="flex items-center gap-3 flex-1 justify-end">
        <div className="space-y-2">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton h-5 w-16" />
        </div>
        <div className="skeleton w-10 h-10 rounded-full" />
      </div>
    </div>
  </div>
);

const MatchCard = ({ match, shareMatch, index }) => {
  const badge = getStatusBadge(match.status);
  return (
    <div className={`group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 border-l-4 ${badge.bar} p-4 shadow-sm hover:shadow-card hover:-translate-y-0.5 hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300 animate-fade-in-up`} style={{ animationDelay: `${index * 0.04}s` }}>
      <div className="flex items-center justify-between mb-3.5 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`badge ${badge.chip}`}>
            <span className={`relative flex h-1.5 w-1.5`}>
              {match.status === 'LIVE' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />}
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${badge.dot} ${match.status === 'LIVE' ? '' : ''}`} />
            </span>
            {badge.label}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium truncate">{match.series || match.name?.split(',')[0]}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {match.matchType && <span className="px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{match.matchType.toUpperCase()}</span>}
          <button onClick={(e) => { e.preventDefault(); shareMatch(match); }} className="p-1.5 text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-all" title="Share">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          </button>
        </div>
      </div>
      <Link to={`/match/${match.id}`} className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img src={match.team1.logo} alt="" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-200/60 dark:ring-gray-700 group-hover:ring-brand-300 dark:group-hover:ring-brand-500/40 transition-all" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${match.team1.short_name}&background=0D47A1&color=fff&size=40`; }} />
          <div className="min-w-0">
            <div className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{match.team1.name}</div>
            <div className="text-lg font-black text-gray-900 dark:text-gray-50 tnum">{formatScore(match.team1)} <span className="text-xs font-medium text-gray-400">{match.team1.overs ? `(${match.team1.overs})` : ''}</span></div>
          </div>
        </div>
        <div className="text-center px-2 shrink-0">
          {match.status === 'LIVE' && (
            <span className="relative flex w-9 h-9 items-center justify-center">
              <span className="animate-ping absolute inline-flex w-6 h-6 rounded-full bg-rose-400/40" />
              <span className="relative w-3 h-3 rounded-full bg-gradient-to-br from-rose-500 to-red-600 shadow-glow-rose" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-1 justify-end text-right min-w-0">
          <div className="min-w-0">
            <div className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{match.team2.name}</div>
            <div className="text-lg font-black text-gray-900 dark:text-gray-50 tnum"><span className="text-xs font-medium text-gray-400">{match.team2.overs ? `(${match.team2.overs})` : ''}</span> {formatScore(match.team2)}</div>
          </div>
          <img src={match.team2.logo} alt="" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-200/60 dark:ring-gray-700 group-hover:ring-amber-300 dark:group-hover:ring-amber-500/40 transition-all" onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${match.team2.short_name}&background=FFC107&color=000&size=40`; }} />
        </div>
      </Link>
      {match.status === 'LIVE' && (
        <div className="mt-3.5 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{match.currentStatus}</p>
        </div>
      )}
    </div>
  );
};

const getFallbackMatches = () => [
  { id: 'ind-vs-aus-2025', status: 'LIVE', venue: 'M. Chinnaswamy Stadium, Bangalore', series: 'T20 World Cup 2025', matchType: 't20',
    team1: { name: 'India', short_name: 'IND', logo: 'https://ui-avatars.com/api/?name=IND&background=0D47A1&color=fff&size=100', score: 187, wickets: 4, overs: '17.2' },
    team2: { name: 'Australia', short_name: 'AUS', logo: 'https://ui-avatars.com/api/?name=AUS&background=FFC107&color=000&size=100', score: 142, wickets: 6, overs: '14.1' },
    currentStatus: 'India needs 43 runs from 16 balls' },
  { id: 'eng-vs-sa-2025', status: 'LIVE', venue: 'The Oval, London', series: 'ODI Series', matchType: 'odi',
    team1: { name: 'England', short_name: 'ENG', logo: 'https://ui-avatars.com/api/?name=ENG&background=1E3A8A&color=fff&size=100', score: 230, wickets: 8, overs: '48.3' },
    team2: { name: 'South Africa', short_name: 'SA', logo: 'https://ui-avatars.com/api/?name=SA&background=065F46&color=fff&size=100', score: 189, wickets: 3, overs: '32.4' },
    currentStatus: 'South Africa needs 42 runs from 105 balls' },
  { id: 'nz-vs-pak-2025', status: 'COMPLETED', venue: 'Eden Gardens, Kolkata', series: 'T20 World Cup 2025', matchType: 't20',
    team1: { name: 'New Zealand', short_name: 'NZ', logo: 'https://ui-avatars.com/api/?name=NZ&background=000000&color=fff&size=100', score: 195, wickets: 7, overs: '20.0' },
    team2: { name: 'Pakistan', short_name: 'PAK', logo: 'https://ui-avatars.com/api/?name=PAK&background=01411C&color=fff&size=100', score: 168, wickets: 10, overs: '18.5' },
    currentStatus: 'New Zealand won by 27 runs' },
];

export default HomePage;
