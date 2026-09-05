import React, { useState, useEffect, useRef } from 'react';

const PlayerCard = ({ player, onScoreChange, onNameChange, onRemove, isGameOver, canRemove }) => {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(player.name);
  const [scoreAnim, setScoreAnim] = useState(null);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const prevScoreRef = useRef(player.score);

  useEffect(() => {
    if (player.score !== prevScoreRef.current) {
      const delta = player.score - prevScoreRef.current;
      setScoreAnim(delta > 0 ? 'up' : 'down');
      setTimeout(() => setScoreAnim(null), 400);
      prevScoreRef.current = player.score;
    }
  }, [player.score]);

  const handleNameSubmit = () => {
    if (nameInput.trim()) {
      onNameChange(nameInput.trim());
    } else {
      setNameInput(player.name);
    }
    setEditingName(false);
  };

  const getScoreColor = () => {
    if (scoreAnim === 'up') return 'from-emerald-400 to-emerald-600';
    if (scoreAnim === 'down') return 'from-rose-400 to-rose-600';
    return 'from-brand-500 to-indigo-600';
  };

  const getBorderColor = () => {
    if (isGameOver) return 'border-amber-300 dark:border-amber-500/50';
    if (scoreAnim === 'up') return 'border-emerald-400 shadow-glow-emerald';
    if (scoreAnim === 'down') return 'border-rose-400 shadow-glow-rose';
    if (isHighlighted) return 'border-brand-400';
    return 'border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-500/40';
  };

  return (
    <div
      className={`group relative rounded-2xl p-6 shadow-card hover:shadow-lg transition-all duration-300 border-2 bg-white dark:bg-gray-900 ${getBorderColor()}
        ${scoreAnim === 'up' ? 'animate-bounce-in' : ''}
        ${scoreAnim === 'down' ? 'animate-fade-in' : ''}
        ${isGameOver ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/5' : ''}`}
      onMouseEnter={() => setIsHighlighted(true)}
      onMouseLeave={() => setIsHighlighted(false)}
    >
      {/* Rank badge */}
      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 shadow-lg
        flex items-center justify-center text-white text-xs font-bold opacity-0 scale-75
        group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
        {player.id}
      </div>

      {/* Name */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 min-w-0">
          {editingName ? (
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSubmit();
                if (e.key === 'Escape') {
                  setNameInput(player.name);
                  setEditingName(false);
                }
              }}
              className="w-full text-xl font-bold text-center bg-transparent border-b-2 border-brand-300
                dark:text-white focus:border-brand-500 outline-none px-2 py-1 transition-colors duration-200"
              autoFocus
            />
          ) : (
            <h3
              className="text-xl font-bold text-center cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 truncate
                transition-colors duration-200 text-gray-800 dark:text-gray-100"
              onClick={() => setEditingName(true)}
              title="Click to edit name"
            >
              {player.name}
            </h3>
          )}
        </div>
        {canRemove && (
          <button
            onClick={onRemove}
            className="ml-2 p-1.5 text-gray-300 dark:text-gray-600 hover:text-rose-500 transition-all duration-200
              rounded-full hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:scale-110 active:scale-95"
            title="Remove player"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Score Display */}
      <div className="text-center mb-6">
        <div className={`text-5xl md:text-6xl font-black bg-gradient-to-r ${getScoreColor()}
          bg-clip-text text-transparent mb-2 tracking-wide transition-all duration-300 tnum
          ${scoreAnim ? 'scale-110' : 'scale-100'}`}>
          {player.score}
        </div>
        <div className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] font-bold">
          Points
        </div>
      </div>

      {/* Score Buttons - minus = rose, plus = emerald (color-coded) */}
      {!isGameOver ? (
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onScoreChange(-5)}
            className="h-14 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 text-white
              font-bold shadow-md hover:shadow-lg hover:from-rose-500 hover:to-rose-700
              active:scale-90 transition-all duration-150 flex items-center justify-center text-lg"
            aria-label="Subtract 5 points"
          >
            -5
          </button>
          <button
            onClick={() => onScoreChange(-1)}
            className="h-14 rounded-xl bg-gradient-to-br from-rose-300 to-rose-500 text-white
              font-bold shadow-md hover:shadow-lg hover:from-rose-400 hover:to-rose-600
              active:scale-90 transition-all duration-150 flex items-center justify-center text-xl"
            aria-label="Subtract 1 point"
          >
            -1
          </button>
          <button
            onClick={() => onScoreChange(1)}
            className="h-14 row-span-2 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600
              text-white font-bold shadow-lg hover:shadow-xl hover:from-emerald-500 hover:to-emerald-700
              active:scale-90 transition-all duration-150 flex items-center justify-center text-2xl"
            aria-label="Add 1 point"
          >
            +1
          </button>
          <button
            onClick={() => onScoreChange(5)}
            className="h-14 col-span-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white
              font-bold shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-emerald-800
              active:scale-90 transition-all duration-150 flex items-center justify-center text-lg"
            aria-label="Add 5 points"
          >
            +5
          </button>
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/5 rounded-xl flex flex-col items-center
          justify-center border-2 border-dashed border-amber-200 dark:border-amber-500/30">
          <span className="text-2xl mb-1 animate-float">🏆</span>
          <span className="text-lg font-bold text-amber-700 dark:text-amber-300">Game Over!</span>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;
