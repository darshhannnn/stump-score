import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchCurrentMatches } from '../services/cricketApi';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const search = async () => {
      setLoading(true);
      try {
        const allMatches = await fetchCurrentMatches();
        const q = query.toLowerCase();
        const filtered = allMatches.filter(m =>
          m.name?.toLowerCase().includes(q) ||
          m.team1?.name?.toLowerCase().includes(q) ||
          m.team2?.name?.toLowerCase().includes(q) ||
          m.venue?.toLowerCase().includes(q) ||
          m.series?.toLowerCase().includes(q)
        );
        setMatches(filtered);
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    };
    if (query) search();
  }, [query]);

  const formatScore = (team) => {
    if (!team.score && team.score !== 0) return 'Yet to bat';
    return `${team.score}/${team.wickets} (${team.overs})`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
          Search Results
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {loading ? 'Searching...' : `${matches.length} results for "${query}"`}
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No results found</h2>
            <p className="text-gray-500 dark:text-gray-400">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map(match => (
              <Link
                key={match.id}
                to={`/match/${match.id}`}
                className="block bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    match.status === 'LIVE' ? 'bg-red-100 text-red-600' :
                    match.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {match.status}
                  </span>
                  <span className="text-xs text-gray-400">{match.venue}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{match.team1.short_name ? '🏏' : ''}</span>
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-white">{match.team1.name}</div>
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatScore(match.team1)}</div>
                    </div>
                  </div>
                  <span className="text-gray-400 text-sm font-bold">vs</span>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold text-gray-800 dark:text-white">{match.team2.name}</div>
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatScore(match.team2)}</div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{match.currentStatus}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
