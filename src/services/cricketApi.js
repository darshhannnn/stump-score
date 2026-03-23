import { scrapeLiveMatches, scrapeMatchDetails } from './cricketScraper';

// Cricket API service for StumpScore
// Using real API with fallback to web scraping

/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable no-unused-vars */

const API_KEY = '8c428c05-056e-4d3b-9471-24956c550f47'; // Use the key found in HomePage.js which seems to be the active one
const BASE_URL = 'https://api.cricapi.com/v1';

// Configuration for web scraping service
const ENABLE_LOGGING = true; // Enable/disable logging

// Cache settings
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

const jsonRequest = async (url, { method = 'GET', headers = {}, params } = {}) => {
  const fullUrl = (() => {
    if (!params) return url;
    const u = new URL(url);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) u.searchParams.set(key, String(value));
    });
    return u.toString();
  })();

  const response = await fetch(fullUrl, {
    method,
    headers
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const err = new Error('Request failed');
    err.response = { data };
    throw err;
  }

  return { data };
};

// In-memory cache for match data
let matchesCache = {
  data: [],
  timestamp: null
};

// In-memory cache for match details
let matchDetailsCache = {};

// Helper function to log activity if enabled
const logInfo = (message, data = null) => {
  if (ENABLE_LOGGING) {
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
};

// Helper function to log errors
const logError = (message, error = null) => {
  console.error(message, error || '');
};

/**
 * Fetch current live matches from CricketData API
 * Falls back to web scraping if API fails or returns no data
 */
export const fetchCurrentMatches = async (forceRefresh = false, timestamp = null) => {
  try {
    console.log('Fetching live matches from real API...');

    // Attempt to fetch from real API
    const response = await jsonRequest(`${BASE_URL}/currentMatches`, {
      method: 'GET',
      params: {
        apikey: API_KEY,
        offset: 0
      }
    });

    if (response.data && response.data.status === 'success' && response.data.data && response.data.data.length > 0) {
      console.log('Real API data received successfully');

      // Map real API data to our application format
      const matches = response.data.data.map(match => ({
        id: match.id,
        status: match.status.includes('Live') ? 'LIVE' : match.status,
        venue: match.venue || 'International Ground',
        team1: {
          name: match.teamInfo?.[0]?.name || 'Team 1',
          short_name: match.teamInfo?.[0]?.shortname || match.teamInfo?.[0]?.name?.substring(0, 3).toUpperCase() || 'T1',
          logo: match.teamInfo?.[0]?.img || `https://ui-avatars.com/api/?name=${match.teamInfo?.[0]?.name}&background=0D47A1&color=fff&size=100`,
          score: match.score?.[0]?.r || 0,
          wickets: match.score?.[0]?.w || 0,
          overs: match.score?.[0]?.o || '0.0'
        },
        team2: {
          name: match.teamInfo?.[1]?.name || 'Team 2',
          short_name: match.teamInfo?.[1]?.shortname || match.teamInfo?.[1]?.name?.substring(0, 3).toUpperCase() || 'T2',
          logo: match.teamInfo?.[1]?.img || `https://ui-avatars.com/api/?name=${match.teamInfo?.[1]?.name}&background=FFC107&color=000&size=100`,
          score: match.score?.[1]?.r || 0,
          wickets: match.score?.[1]?.w || 0,
          overs: match.score?.[1]?.o || '0.0'
        },
        currentStatus: match.status
      }));

      // Update the cache
      matchesCache.data = matches;
      matchesCache.timestamp = Date.now();

      return matches;
    } else {
      console.warn('Real API returned no live matches or failed. Falling back to scraper...');
      return await scrapeLiveMatches();
    }
  } catch (error) {
    console.error('API Fetch error:', error.message);
    console.log('Falling back to web scraping dynamic mock engine...');
    return await scrapeLiveMatches();
  }
};

/**
 * Fetch detailed information for a specific match
 */
export const fetchMatchDetails = async (matchId) => {
  try {
    console.log(`Fetching details for match ${matchId} from real API...`);

    // Attempt to fetch details from real API
    const response = await jsonRequest(`${BASE_URL}/match_info`, {
      method: 'GET',
      params: {
        apikey: API_KEY,
        id: matchId
      }
    });

    if (response.data && response.data.status === 'success' && response.data.data) {
      const match = response.data.data;

      // Map to our detailed format
      const matchDetails = {
        id: match.id,
        status: match.status,
        venue: match.venue,
        teams: [match.teamInfo?.[0]?.name, match.teamInfo?.[1]?.name],
        score: [
          { r: match.score?.[0]?.r || 0, w: match.score?.[0]?.w || 0, o: match.score?.[0]?.o || '0.0' },
          { r: match.score?.[1]?.r || 0, w: match.score?.[1]?.w || 0, o: match.score?.[1]?.o || '0.0' }
        ],
        toss: {
          winner: match.tossWinner || 'TBD',
          decision: match.tossChoice || 'bat'
        },
        players: {
          batting: [], // Real API often requires separate calls for full scorecard
          bowling: []
        },
        currentStatus: match.status
      };

      // Update the cache
      matchDetailsCache[matchId] = {
        data: matchDetails,
        timestamp: Date.now()
      };
      
      return matchDetails;
    } else {
      return await scrapeMatchDetails(matchId);
    }
  } catch (error) {
    console.error('API Match Details error:', error.message);
    return await scrapeMatchDetails(matchId);
  }
};

/**
 * Get featured match - returns the first match or null if no matches
 * @param {Array} matches - Array of matches to find featured match from
 * @returns {Object|null} Featured match object or null
 */
export const getFeaturedMatch = (matches) => {
  if (!matches || matches.length === 0) {
    return null;
  }
  
  // Find a live match if possible
  const liveMatch = matches.find(match => 
    match.status === 'LIVE' || 
    match.status === 'In Progress' || 
    match.status.toLowerCase().includes('live'));
  
  // Return the live match if found, otherwise the first match
  return liveMatch || matches[0];
};

/**
 * Clear the cache to force fresh data on next fetch
 */
export const clearCache = () => {
  logInfo('Clearing cache...');
  matchesCache = {
    data: [],
    timestamp: null
  };
  matchDetailsCache = {};
  logInfo('Cache cleared');
};

/**
 * Test the scraper connection - use this for debugging
 * @returns {Promise<boolean>} True if scraper is working
 */
export const testScraperConnection = async () => {
  try {
    logInfo('Testing scraper connection...');
    const { scrapeLiveMatches } = await import('./cricketScraper');
    const testData = await scrapeLiveMatches();
    logInfo('Scraper connection test result:', testData ? 'Success' : 'Failed');
    return !!testData;
  } catch (error) {
    logError('Scraper connection test failed:', error);
    return false;
  }
};

// Default export for legacy support
export default {
  fetchCurrentMatches,
  fetchMatchDetails,
  getFeaturedMatch,
  clearCache,
  testScraperConnection
};