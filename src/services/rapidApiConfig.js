// RapidAPI Cricket Configuration
// Get your FREE API key at: https://rapidapi.com/cricbuzz-cricbuzz/api/cricket-live-scores1/
// Free tier: 100 requests/month

export const RAPID_API_CONFIG = {
  // Replace with your free RapidAPI key
  apiKey: process.env.REACT_APP_RAPIDAPI_KEY || '',
  
  // Cricket Live Scores API (Cricbuzz)
  baseUrl: 'https://cricket-live-scores1.p.rapidapi.com',
  
  // Endpoints
  endpoints: {
    liveScores: '/live-scores',
    matchDetails: '/match-details',
    matchScorecard: '/match-scorecard',
    seriesList: '/series-list',
  },

  headers: {
    'x-rapidapi-key': process.env.REACT_APP_RAPIDAPI_KEY || '',
    'x-rapidapi-host': 'cricket-live-scores1.p.rapidapi.com'
  }
};

// Alternative free cricket APIs on RapidAPI (backup options):
// 1. Cricket Data API: https://rapidapi.com/cricket-data-org-llc-cricket-data-org-llc-default/api/cricket-data/
// 2. CricBuzz API: https://rapidapi.com/cricbuzz-cricbuzz/api/cricket-live-scores1
// 3. SportsCrazy Cricket: https://rapidapi.com/sportscrazy-cricket/api/cricket-live-scores

export default RAPID_API_CONFIG;
