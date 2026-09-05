import { getWinners } from './gameLogic.js';

// Persistence utilities using localStorage

const STORAGE_KEY = 'stump_games';
const MAX_GAMES = 50;

export const saveGame = (game) => {
  try {
    const games = getAllGames();
    const existingIndex = games.findIndex(g => g.id === game.id);
    const stats = game.players.flatMap(p => ({
      gameId: game.id,
      playerId: p.id,
      playerName: p.name,
      score: p.score,
      isWin: getWinners(game).some(w => w.id === p.id),
      playedAt: new Date().toISOString()
    }));

    const gameData = {
      ...game,
      stats // Flatten for leaderboard
    };

    if (existingIndex > -1) {
      games[existingIndex] = gameData;
    } else {
      games.unshift(gameData);
    }

    // Keep only recent games
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games.slice(0, MAX_GAMES)));
    return gameData;
  } catch (error) {
    console.error('Save failed:', error);
  }
};

export const loadGame = (gameId) => {
  const games = getAllGames();
  return games.find(g => g.id === gameId);
};

export const getAllGames = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getRecentGames = (limit = 10) => getAllGames().slice(0, limit);

export const getPlayerStats = () => {
  const games = getAllGames();
  const stats = {};

  // Streaks need chronological order (oldest first): count consecutive wins
  // up to the player's most recent game
  const chronological = [...games].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  chronological.forEach(game => {
    game.players.forEach(player => {
      if (!stats[player.name]) {
        stats[player.name] = { wins: 0, games: 0, totalScore: 0, highest: 0, streak: 0 };
      }
      stats[player.name].games += 1;
      stats[player.name].totalScore += player.score;
      stats[player.name].highest = Math.max(stats[player.name].highest, player.score);
      if (getWinners(game).some(w => w.id === player.id)) {
        stats[player.name].wins += 1;
        stats[player.name].streak += 1;
      } else {
        stats[player.name].streak = 0;
      }
    });
  });

  return Object.entries(stats).map(([name, data]) => ({
    name,
    avgScore: Math.round(data.totalScore / data.games),
    winRate: Math.round((data.wins / data.games) * 100),
    highest: data.highest,
    streak: data.streak
  })).sort((a, b) => b.winRate - a.winRate || b.highest - a.highest);
};

export const deleteGame = (gameId) => {
  const games = getAllGames().filter(g => g.id !== gameId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
};

