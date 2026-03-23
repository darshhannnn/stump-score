import React from 'react';

/**
 * Live Commentary component
 * @param {Array} commentary - List of commentary strings
 * @returns {JSX.Element} Commentary list
 */
const LiveCommentary = ({ commentary }) => {
  if (!commentary || commentary.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8 overflow-hidden relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-blue-900 flex items-center">
          <span className="mr-2">🎙️</span> Live AI Commentary
        </h3>
        <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center">
          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 animate-ping" />
          Powered by AI
        </span>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-gray-50">
        {commentary.map((text, index) => (
          <div 
            key={index} 
            className={`p-4 rounded-xl border-l-4 transition-all duration-500 hover:scale-[1.01] ${
              index === 0 
                ? 'bg-blue-50 border-blue-500 shadow-sm' 
                : 'bg-gray-50 border-gray-200 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="flex items-center mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {index === 0 ? 'Just now' : `${index * 2} mins ago`}
              </span>
              {index === 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded uppercase">
                  Latest Event
                </span>
              )}
            </div>
            <p className={`text-gray-800 leading-relaxed ${index === 0 ? 'font-medium text-lg' : 'text-base'}`}>
              {text}
            </p>
          </div>
        ))}
      </div>
      
      {/* Fade effect for older commentary */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white pointer-events-none" />
    </div>
  );
};

export default LiveCommentary;
