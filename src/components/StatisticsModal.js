import React from 'react';

const StatisticsModal = ({ isOpen, onClose, title, subtitle, statsData, additionalContent }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden animate-scale-in border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 px-6 py-5 text-white overflow-hidden">
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start relative">
            <div>
              <h3 className="text-xl font-black">{title}</h3>
              <p className="text-blue-200 text-sm mt-0.5">{subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-xl transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {statsData && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {Object.entries(statsData).map(([key, value], index) => (
                <div key={index} className="p-3.5 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60">
                  <div className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">{key}</div>
                  <div className="text-lg font-black text-gray-800 dark:text-gray-100 mt-1 tnum">{value}</div>
                </div>
              ))}
            </div>
          )}

          {additionalContent && (
            <div className="mt-4">
              {additionalContent}
            </div>
          )}
        </div>

        <div className="px-6 pb-6">
          <button
            className="btn-primary w-full"
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
