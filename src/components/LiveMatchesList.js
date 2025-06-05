import React from 'react';
import LiveScoreCard from './LiveScoreCard';

const LiveMatchesList = ({ matches }) => {
  return (
    <div id="live-matches" className="container mx-auto py-4 scroll-mt-24">
      <h2 className="text-xl font-bold mb-4">Live Matches</h2>
      {matches.length === 0 ? (
        <div className="bg-gray-100 p-4 rounded-lg text-center">
          <p>No live matches at the moment</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((match) => (
            <LiveScoreCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveMatchesList;
