import React from 'react';
import { Link } from 'react-router-dom';

const LiveScoreCard = ({ match }) => {
  // Determine status color based on match status
  const getStatusColor = (status) => {
    if (!status) return 'text-gray-600';
    
    status = status.toLowerCase();
    if (status.includes('live')) return 'text-red-600';
    if (status.includes('completed') || status.includes('finished')) return 'text-green-600';
    if (status.includes('upcoming') || status.includes('scheduled')) return 'text-blue-600';
    return 'text-gray-600';
  };
  
  // Format score display
  const formatScore = (score, wickets, overs) => {
    if (!score && score !== 0) return 'Yet to bat';
    return `${score}/${wickets} (${overs})`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-center mb-2">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(match.status)} bg-opacity-10`}>
          {match.status || 'UPCOMING'}
        </span>
        <span className="text-xs text-gray-500">{match.venue || 'International Match'}</span>
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 mr-2 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
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
          <span className="font-semibold">{match.team1.name}</span>
        </div>
        <span className="font-bold">{formatScore(match.team1.score, match.team1.wickets, match.team1.overs)}</span>
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 mr-2 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center">
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
          <span className="font-semibold">{match.team2.name}</span>
        </div>
        <span className="font-bold">{formatScore(match.team2.score, match.team2.wickets, match.team2.overs)}</span>
      </div>
      
      <div className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
        <p>{match.currentStatus || 'Match information will be updated soon'}</p>
      </div>
      
      <div className="mt-3 text-right">
        <Link to={`/match/${match.id}`} className="inline-block bg-blue-600 text-white text-sm px-4 py-1 rounded hover:bg-blue-700 transition-colors">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default LiveScoreCard;
