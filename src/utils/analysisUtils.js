/**
 * Utility for advanced cricket match analysis
 */

/**
 * Calculate win probability based on current match state
 * @param {Object} matchState - Current state of the match
 * @returns {Object} Probability for both teams
 */
export const calculateWinProbability = (matchState) => {
  if (!matchState || !matchState.team1 || !matchState.team2) {
    return { team1: 50, team2: 50 };
  }

  const { team1, team2, status } = matchState;
  
  // If match is finished, return 100/0 or 0/100
  if (status.toLowerCase().includes('won') || status.toLowerCase().includes('finished')) {
    if (status.includes(team1.name)) return { team1: 100, team2: 0 };
    if (status.includes(team2.name)) return { team1: 0, team2: 100 };
  }

  // Base logic for live matches
  let team1Prob = 50;
  
  // 1. Consider Run Rate difference
  const crr1 = team1.score / (parseFloat(team1.overs) || 1);
  const crr2 = team2.score / (parseFloat(team2.overs) || 1);
  
  team1Prob += (crr1 - crr2) * 5;

  // 2. Consider Wickets lost
  team1Prob -= (team1.wickets - team2.wickets) * 8;

  // 3. Consider chasing situation (if target exists)
  // This is a simplified simulation
  if (team1.score > team2.score && parseFloat(team1.overs) > 40) {
    team1Prob += 15;
  }

  // Normalize between 5% and 95% for live matches
  team1Prob = Math.max(5, Math.min(95, team1Prob));
  
  return {
    team1: Math.round(team1Prob),
    team2: Math.round(100 - team1Prob)
  };
};

/**
 * Generate mock run rate and worm data for charts
 * @param {Object} matchState - Current match state
 * @returns {Array} Array of data points for Recharts
 */
export const generateMatchProgressData = (matchState) => {
  const data = [];
  const totalOvers = 20; // Default to T20
  
  let team1Score = 0;
  let team2Score = 0;
  
  for (let i = 1; i <= totalOvers; i++) {
    // Simulated progressive scores
    team1Score += Math.floor(Math.random() * 12) + 2;
    team2Score += Math.floor(Math.random() * 10) + 3;
    
    data.push({
      over: i,
      team1: team1Score,
      team2: team2Score,
      team1RR: (team1Score / i).toFixed(2),
      team2RR: (team2Score / i).toFixed(2)
    });
  }
  
  return data;
};

/**
 * Generate AI-like commentary based on match events
 * @param {Object} prevMatch - Previous match state
 * @param {Object} currMatch - Current match state
 * @returns {String|null} Commentary string
 */
export const generateAICommentary = (prevMatch, currMatch) => {
  if (!prevMatch || !currMatch) return "Welcome to the live coverage!";

  const t1Change = currMatch.team1.score - prevMatch.team1.score;
  const t2Change = currMatch.team2.score - prevMatch.team2.score;
  const t1Wicket = currMatch.team1.wickets > prevMatch.team1.wickets;
  const t2Wicket = currMatch.team2.wickets > prevMatch.team2.wickets;

  if (t1Wicket || t2Wicket) {
    const team = t1Wicket ? currMatch.team1.name : currMatch.team2.name;
    return `OUT! Huge blow for ${team}. The fielding side is ecstatic!`;
  }

  if (t1Change >= 6 || t2Change >= 6) {
    return "SIX! That's massive! Right into the stands. What a shot!";
  }

  if (t1Change >= 4 || t2Change >= 4) {
    return "FOUR! Elegantly placed through the gaps. Excellent timing.";
  }

  if (t1Change > 0 || t2Change > 0) {
    return "Good running between the wickets, keeping the scoreboard ticking.";
  }

  return null;
};
