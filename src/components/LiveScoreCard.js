import React from 'react';
import { Link } from 'react-router-dom';

const LiveScoreCard = ({ match }) => {
  const getStatusColor = (status) => {
    if (!status) return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' };
    const s = status.toLowerCase();
    if (s.includes('live')) return { bg: 'bg-red-50', text: 'text-red-600 dark:text-rose-400', dot: 'bg-red-500' };
    if (s.includes('completed') || s.includes('finished')) return { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' };
    if (s.includes('upcoming') || s.includes('scheduled')) return { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' };
    return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' };
  };

  const formatScore = (score, wickets, overs) => {
    if (!score && score !== 0) return 'Yet to bat';
    return `${score}/${wickets} (${overs})`;
  };

  const statusStyle = getStatusColor(match.status);

  return (
    <div className="card-hover p-5 group">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} ${
            match.status?.toLowerCase().includes('live') ? 'animate-pulse' : ''
          }`} />
          {match.status || 'UPCOMING'}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{match.venue || 'International'}</span>
      </div>

      {/* Teams */}
      <div className="space-y-3 mb-4">
        {/* Team 1 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-sm">
              <img 
                src={match.team1.logo || `https://ui-avatars.com/api/?name=${match.team1.name}&background=0D47A1&color=fff&size=40`} 
                alt={match.team1.name} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${match.team1.name}&background=0D47A1&color=fff&size=40`;
                }}
              />
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{match.team1.name}</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-gray-100 tabular-nums">{formatScore(match.team1.score, match.team1.wickets, match.team1.overs)}</span>
        </div>

        {/* Team 2 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-sm">
              <img 
                src={match.team2.logo || `https://ui-avatars.com/api/?name=${match.team2.name}&background=FFC107&color=000&size=40`} 
                alt={match.team2.name} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${match.team2.name}&background=FFC107&color=000&size=40`;
                }}
              />
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{match.team2.name}</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-gray-100 tabular-nums">{formatScore(match.team2.score, match.team2.wickets, match.team2.overs)}</span>
        </div>
      </div>

      {/* Status */}
      <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 mb-4">
        {match.currentStatus || 'Match information will be updated soon'}
      </div>

      {/* Action */}
      <Link 
        to={`/match/${match.id}`} 
        className="block w-full text-center py-2.5 bg-blue-600 text-white text-sm font-semibold 
          rounded-xl hover:bg-blue-700 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        View Details
      </Link>
    </div>
  );
};

export default LiveScoreCard;
