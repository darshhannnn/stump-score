// Game logic utilities for Stump Scorekeeper

// Full game state structure
export const createNewGame = (playerNames = ['Player 1', 'Player 2'], mode = 'casual', targetScore = 100) => ({
  id: crypto.randomUUID(),
  players: playerNames.map((name, index) => ({
    id: index + 1,
    name,
    score: 0,
    rounds: []
  })),
  rounds: [],
  currentRound: 1,
  gameMode: mode,
  targetScore,
  createdAt: new Date().toISOString(),
  history: [] // For undo
});

// Update score with history for undo
export const updateScore = (game, playerId, delta) => {
  const newHistory = [...game.history];
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return game;

  const oldScore = game.players[playerIndex].score;
  const newScore = Math.max(0, oldScore + delta);
  
  newHistory.push({
    type: 'score',
    playerId,
    oldValue: oldScore,
    newValue: newScore,
    timestamp: Date.now()
  });

  const newPlayers = [...game.players];
  newPlayers[playerIndex] = { ...newPlayers[playerIndex], score: newScore };

  return {
    ...game,
    players: newPlayers,
    history: newHistory.slice(-50) // Keep last 50 moves for performance
  };
};

// Undo last move
export const undoLastMove = (game) => {
  if (game.history.length === 0) return game;

  const lastMove = game.history[game.history.length - 1];
  const newHistory = game.history.slice(0, -1);

  if (lastMove.type === 'score') {
    const playerIndex = game.players.findIndex(p => p.id === lastMove.playerId);
    if (playerIndex !== -1) {
      const newPlayers = [...game.players];
      newPlayers[playerIndex] = { ...newPlayers[playerIndex], score: lastMove.oldValue };
      return { ...game, players: newPlayers, history: newHistory };
    }
  }

  return game;
};

// New round
export const newRound = (game) => {
  const newPlayers = game.players.map(p => ({ ...p, rounds: [...(p.rounds || []), p.score] }));
  return {
    ...game,
    players: newPlayers,
    currentRound: game.currentRound + 1,
    history: []
  };
};

// Reset game
export const resetGame = (game) => createNewGame(
  game.players.map(p => p.name),
  game.gameMode,
  game.targetScore
);

// Check if game over
export const isGameOver = (game) => 
  game.players.some(p => p.score >= game.targetScore);

// Get winner(s)
export const getWinners = (game) => 
  game.players.filter(p => p.score === Math.max(...game.players.map(p2 => p2.score)));

// Save game stats for leaderboard (player performance)
export const extractStats = (game, playerId) => {
  const player = game.players.find(p => p.id === playerId);
  if (!player) return null;
  return {
    gameId: game.id,
    playerId,
    playerName: player.name,
    score: player.score,
    wins: game.players.filter(p => p.id === playerId && p.score === Math.max(...game.players.map(p2 => p2.score))).length > 0 ? 1 : 0,
    playedAt: game.createdAt
  };
};

