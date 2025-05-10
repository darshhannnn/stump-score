const axios = require('axios');

// Configure axios defaults
axios.defaults.timeout = 5000; // 5 second timeout

// Cache configuration
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get cached data
const getCachedData = (key) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
};

// Helper function to set cached data
const setCachedData = (key, data) => {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
};

// @desc    Get live cricket matches
// @route   GET /api/matches/live
// @access  Public
exports.getLiveMatches = async (req, res) => {
    try {
        // Check cache first
        const cachedMatches = getCachedData('live_matches');
        if (cachedMatches) {
            return res.json({
                success: true,
                matches: cachedMatches,
                cached: true
            });
        }

        const response = await axios.get(
            `https://api.cricapi.com/v1/currentMatches`,
            {
                params: {
                    apikey: process.env.CRICAPI_KEY,
                    offset: 0
                }
            }
        );
        console.log(JSON.stringify(response.data, null, 2));
        
        if (!response.data || response.data.status !== "success") {
            throw new Error('Failed to fetch matches');
        }

        // Transform the data
        const matches = response.data.data.map(match => ({
            id: match.id,
            // Use teamInfo if available, fallback to teams array
            teams: (Array.isArray(match.teamInfo) && match.teamInfo.length === 2)
                ? match.teamInfo.map(t => ({ name: t.name }))
                : (Array.isArray(match.teams) && match.teams.length === 2)
                    ? match.teams.map(n => ({ name: n }))
                    : [{ name: 'Team 1' }, { name: 'Team 2' }],
            status: match.status,
            date: match.date,
            venue: match.venue,
            score: match.score
        }));

        // Cache the results
        setCachedData('live_matches', matches);

        res.json({
            success: true,
            matches: matches,
            cached: false
        });
    } catch (error) {
        console.error('Error fetching live matches:', error.message);
        res.status(500).json({
            success: false,
            error: 'Unable to fetch live matches. Please try again later.'
        });
    }
};

// @desc    Get match details
// @route   GET /api/matches/:id
// @access  Public
exports.getMatchDetails = async (req, res) => {
    try {
        const matchId = req.params.id;
        
        // Validate match ID
        if (!matchId || !/^[a-zA-Z0-9-_]+$/.test(matchId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid match ID'
            });
        }

        // Check cache first
        const cachedMatch = getCachedData(`match_${matchId}`);
        if (cachedMatch) {
            return res.json({
                success: true,
                match: cachedMatch,
                cached: true
            });
        }

        const response = await axios.get(
            `https://api.cricapi.com/v1/match_info`,
            {
                params: {
                    apikey: process.env.CRICAPI_KEY,
                    id: matchId
                }
            }
        );
        
        if (!response.data || response.data.status !== "success") {
            throw new Error('Failed to fetch match details');
        }

        const match = response.data.data;
        const matchData = {
            id: match.id,
            teams: match.teams,
            status: match.status,
            date: match.date,
            venue: match.venue,
            score: match.score,
            details: match.details
        };

        // Cache the results
        setCachedData(`match_${matchId}`, matchData);

        res.json({
            success: true,
            match: matchData,
            cached: false
        });
    } catch (error) {
        console.error('Error fetching match details:', error.message);
        res.status(500).json({
            success: false,
            error: 'Unable to fetch match details. Please try again later.'
        });
    }
};

// @desc    Get latest cricket news
// @route   GET /api/news/latest
// @access  Public
exports.getLatestNews = async (req, res) => {
    try {
        // Check cache first
        const cachedNews = getCachedData('latest_news');
        if (cachedNews) {
            return res.json({
                success: true,
                articles: cachedNews,
                cached: true
            });
        }

        const response = await axios.get(
            `https://newsapi.org/v2/everything`,
            {
                params: {
                    q: 'cricket',
                    sortBy: 'publishedAt',
                    apiKey: process.env.NEWSAPI_KEY
                }
            }
        );
        
        if (!response.data || response.data.status !== "ok") {
            throw new Error('Failed to fetch news');
        }

        // Transform the data
        const articles = response.data.articles.map(article => ({
            title: article.title,
            url: article.url,
            publishedAt: article.publishedAt,
            source: article.source.name,
            description: article.description,
            imageUrl: article.urlToImage
        }));

        // Cache the results
        setCachedData('latest_news', articles);

        res.json({
            success: true,
            articles: articles,
            cached: false
        });
    } catch (error) {
        console.error('Error fetching news:', error.message);
        res.status(500).json({
            success: false,
            error: 'Unable to fetch news. Please try again later.'
        });
    }
}; 