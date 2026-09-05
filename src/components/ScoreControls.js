import React from 'react';

const ScoreControls = ({ onNewRound, onReset, onUndo, disabled, historyLength }) => {
  return (
    <div className="glass rounded-2xl p-8 shadow-card">
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center flex items-center justify-center gap-2">
        <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Game Controls
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Undo - amber */}
        <button
          onClick={onUndo}
          disabled={disabled || !historyLength}
          className="group relative h-16 px-6 bg-gradient-to-r from-amber-400 to-orange-500 text-white
            font-bold rounded-xl shadow-lg hover:shadow-glow-gold hover:from-amber-500 hover:to-orange-600
            active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
            disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none dark:disabled:from-gray-700 dark:disabled:to-gray-700
            flex items-center justify-center text-lg overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Undo
            {historyLength > 0 && (
              <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs tnum">
                {historyLength}
              </span>
            )}
          </span>
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>

        {/* New Round - violet */}
        <button
          onClick={onNewRound}
          disabled={disabled}
          className="group relative h-16 px-6 bg-gradient-to-r from-violet-500 to-purple-600 text-white
            font-bold rounded-xl shadow-lg hover:shadow-purple-500/40 hover:from-violet-600 hover:to-purple-700
            active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
            disabled:from-gray-300 disabled:to-gray-400 disabled:shadow-none dark:disabled:from-gray-700 dark:disabled:to-gray-700
            flex items-center justify-center text-lg overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            New Round
          </span>
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>

        {/* Reset - slate */}
        <button
          onClick={onReset}
          className="group relative h-16 px-6 bg-gradient-to-r from-slate-500 to-slate-600 text-white
            font-bold rounded-xl shadow-lg hover:shadow-slate-500/40 hover:from-slate-600 hover:to-slate-700
            active:scale-95 transition-all duration-200
            flex items-center justify-center text-lg overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </span>
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
      </div>

      {/* Pro Tips */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 font-mono shadow-sm">Space</kbd>
          +1
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 font-mono shadow-sm">Shift+Space</kbd>
          -1
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 font-mono shadow-sm">N</kbd>
          New Round
        </span>
      </div>
    </div>
  );
};

export default ScoreControls;
