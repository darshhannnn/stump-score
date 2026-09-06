import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PlayerCard from '../components/PlayerCard';
import ScoreControls from '../components/ScoreControls';
import { createNewGame, updateScore as updateGameScore, undoLastMove, newRound as advanceRound, resetGame as resetGameState, isGameOver, getWinners } from '../utils/gameLogic';
import { saveGame, loadGame, getRecentGames, deleteGame } from '../utils/gameStorage';
import cloudSync from '../services/cloudSync';
import { useAuth } from '../contexts/AuthContext';

const ScorekeeperPage = () => {
  const [game, setGame] = useState(() => {
    const savedId = new URLSearchParams(window.location.search).get('game');
    if (savedId) {
      const loaded = loadGame(savedId);
      if (loaded) return loaded;
    }
    return createNewGame();
  });

  const [showSavedGames, setShowSavedGames] = useState(false);
  const [recentGames, setRecentGames] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const { isAuthenticated } = useAuth();
  const [syncState, setSyncState] = useState('idle'); // idle | syncing | synced | error

  useEffect(() => {
    saveGame(game);
  }, [game]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        const firstPlayer = game.players[0];
        if (firstPlayer) {
          setGame(prev => updateGameScore(prev, firstPlayer.id, e.shiftKey ? -1 : 1));
        }
      }
      if (e.key === 'n' || e.key === 'N') {
        setGame(prev => advanceRound(prev));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game.players]);

  const addPlayer = () => {
    if (game.players.length >= 8) return;
    const newId = Math.max(...game.players.map(p => p.id)) + 1;
    setGame({
      ...game,
      players: [...game.players, { id: newId, name: `Player ${newId}`, score: 0, rounds: [] }]
    });
  };

  const removePlayer = (id) => {
    if (game.players.length <= 2) return;
    setGame({
      ...game,
      players: game.players.filter(p => p.id !== id)
    });
  };

  const updatePlayerName = (id, name) => {
    setGame({
      ...game,
      players: game.players.map(p => p.id === id ? { ...p, name } : p)
    });
  };

  const handleScoreChange = (id, delta) => {
    setGame(updateGameScore(game, id, delta));
  };

  const handleUndo = () => {
    setGame(undoLastMove(game));
  };

  const handleNewRound = () => {
    setGame(advanceRound(game));
  };

  const handleReset = () => {
    setGame(resetGameState(game));
  };

  const handleShare = () => {
    const url = `${window.location.origin}/scorekeeper?game=${game.id}`;
    setShareUrl(url);
    setShowShareModal(true);
    setCopied(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  // Cloud sync: push the current game to the user's account
  const handleCloudSync = async () => {
    setSyncState('syncing');
    try {
      await cloudSync.pushGame(game);
      setSyncState('synced');
      setTimeout(() => setSyncState('idle'), 2500);
    } catch {
      setSyncState('error');
      setTimeout(() => setSyncState('idle'), 2500);
    }
  };

  const gameIsOver = isGameOver(game);
  const winners = gameIsOver ? getWinners(game) : [];

  const refreshSavedGames = () => setRecentGames(getRecentGames(5));

  const handleDeleteGame = (id) => {
    deleteGame(id);
    refreshSavedGames();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-gray-950 dark:via-gray-900 dark:to-brand-950/40 py-8 px-4 transition-colors">
      {/* Hero/Intro */}
      <div className="max-w-4xl mx-auto text-center mb-10 animate-fade-in-down">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 text-brand-600 dark:text-brand-300 ring-1 ring-brand-500/20 px-4 py-2 rounded-full text-sm font-semibold mb-6">
          <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
          Live Game
        </div>
        <h1 className="text-5xl md:text-6xl font-black mb-4">
          <span className="text-gradient-animated">Stump Scorekeeper</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed">
          Track scores, undo mistakes, save & share games.
          Perfect for casual or tournament play.
        </p>

        {/* Controls Row */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <button
            className="btn-primary"
            onClick={addPlayer}
            disabled={game.players.length >= 8}
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Player
          </button>

          <select
            value={game.gameMode}
            onChange={(e) => setGame({ ...game, gameMode: e.target.value })}
            className="input cursor-pointer font-semibold"
          >
            <option value="casual">Casual Mode</option>
            <option value="tournament">Tournament</option>
          </select>

          <div className="flex items-center gap-2 bg-white dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all duration-200">
            <label className="text-sm text-gray-500 dark:text-gray-400 font-medium">Target</label>
            <input
              type="number"
              value={game.targetScore}
              onChange={(e) => setGame({ ...game, targetScore: Math.max(1, Number(e.target.value)) })}
              className="w-16 text-center text-lg font-bold outline-none bg-transparent text-gray-800 dark:text-gray-100 tnum"
              min="1"
            />
          </div>
        </div>
      </div>

      {/* Game Over Banner */}
      {gameIsOver && (
        <div className="max-w-4xl mx-auto mb-8 animate-bounce-in">
          <div className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-pitch-600
            text-white px-8 py-6 rounded-3xl shadow-glow-emerald text-center">
            <div className="text-4xl mb-2 animate-float">🏆</div>
            <div className="text-2xl font-black mb-1">
              {winners.length === 1
                ? `${winners[0].name} Wins!`
                : `Tie! ${winners.map(w => w.name).join(' & ')}`
              }
            </div>
            <div className="text-emerald-100 text-sm">
              {winners[0].score} points &bull; Reset to play again
            </div>
          </div>
        </div>
      )}

      {/* Players Grid */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Players
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-brand-500 rounded-full" />
                Round {game.currentRound}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                {game.history.length} moves
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {game.players.map((player, index) => (
              <div key={player.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                <PlayerCard
                  player={player}
                  onScoreChange={(delta) => handleScoreChange(player.id, delta)}
                  onNameChange={(name) => updatePlayerName(player.id, name)}
                  onRemove={() => removePlayer(player.id)}
                  isGameOver={gameIsOver}
                  canRemove={game.players.length > 2}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Score Controls */}
        <ScoreControls 
          onNewRound={handleNewRound}
          onReset={handleReset}
          onUndo={handleUndo}
          disabled={gameIsOver}
          historyLength={game.history.length}
        />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={handleShare}
            className="btn-primary !py-2.5 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Game
          </button>
          {isAuthenticated ? (
            <button
              onClick={handleCloudSync}
              disabled={syncState === 'syncing'}
              className={`btn-ghost !py-2.5 text-sm ${
                syncState === 'synced' ? '!border-emerald-400 !text-emerald-600 dark:!text-emerald-400' : ''
              } ${syncState === 'error' ? '!border-rose-400 !text-rose-600 dark:!text-rose-400' : ''}`}
              title="Save this game to your account"
            >
              {syncState === 'syncing' ? (
                <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                '☁️'
              )}
              {syncState === 'synced' ? 'Synced!' : syncState === 'error' ? 'Sync failed' : 'Cloud Sync'}
            </button>
          ) : (
            <Link to="/login" className="btn-ghost !py-2.5 text-sm" title="Log in to sync games across devices">
              ☁️ Cloud Sync
            </Link>
          )}
          <button
            onClick={() => { refreshSavedGames(); setShowSavedGames(!showSavedGames); }}
            className="btn-ghost !py-2.5 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Load Game
          </button>
          <button
            onClick={() => {
              const gameData = JSON.stringify(game, null, 2);
              const blob = new Blob([gameData], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `stump-game-${game.id.slice(-6)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="btn-ghost !py-2.5 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>

        {/* Saved Games List */}
        {showSavedGames && (
          <div className="card p-6 max-w-md mx-auto animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Saved Games</h3>
              <button
                onClick={() => setShowSavedGames(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {recentGames.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📦</div>
                <p className="text-gray-500 dark:text-gray-400">No saved games yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentGames.map((g) => (
                  <div key={g.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/70 rounded-xl
                    hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors duration-200 group cursor-pointer"
                    onClick={() => { setGame(g); setShowSavedGames(false); }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-800 dark:text-gray-100 truncate">
                        {g.players.map(p => p.name).join(' vs ')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Round {g.currentRound} &bull; {new Date(g.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteGame(g.id); }}
                        className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        title="Delete saved game"
                        aria-label={`Delete game ${g.id}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <span className="text-xs text-brand-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        Load →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-gray-950/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={() => setShowShareModal(false)}>
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-100 dark:border-gray-800 animate-scale-in"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Share Game</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Copy this link to share your game:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="input flex-1"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                    flex items-center gap-2 ${copied
                      ? 'bg-gradient-to-r from-emerald-500 to-pitch-600 text-white shadow-glow-emerald'
                      : 'btn-primary'
                    }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScorekeeperPage;
