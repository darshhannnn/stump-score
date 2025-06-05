import React from 'react';

/**
 * A reusable modal component for displaying cricket statistics
 */
const StatisticsModal = ({ isOpen, onClose, title, subtitle, statsData, additionalContent }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative border-2 border-blue-500"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h3 className="text-xl font-bold text-blue-600 mb-2">{title}</h3>
        <p className="font-bold text-gray-800 text-lg mb-1">{subtitle}</p>
        <p className="text-sm text-gray-600 mb-4 border-b pb-2">India vs Australia</p>
        
        {statsData && (
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            {Object.entries(statsData).map(([key, value], index) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                <span className="font-medium">{key}:</span> {value}
              </div>
            ))}
          </div>
        )}
        
        {additionalContent}
        
        <div className="text-center mt-4">
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatisticsModal;
