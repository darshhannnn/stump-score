// Cricket API service for StumpScore
// Using web scraping only with dynamic mock data

/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable no-unused-vars */

// Configuration for web scraping service
// Using dynamic mock data to avoid CORS issues
const ENABLE_LOGGING = true; // Enable/disable logging

// Cache settings
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

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
 * Fetch current matches data using web scraping only
 * @param {boolean} forceRefresh - Whether to force a refresh and bypass cache
 * @param {number} timestamp - Timestamp for cache-busting
 * @returns {Promise} Promise object representing the matches data
 */
export const fetchCurrentMatches = async (forceRefresh = false, timestamp = Date.now()) => {
  try {
    // Check if we have cached data and it's still valid (unless force refresh is requested)
    if (!forceRefresh && matchesCache.data.length > 0 && matchesCache.timestamp) {
      const cacheAge = Date.now() - matchesCache.timestamp;
      if (cacheAge < CACHE_EXPIRY) {
        logInfo(`Using cached match data (${Math.round(cacheAge / 1000)}s old)`);
        return matchesCache.data;
      }
    }
    
    logInfo('Fetching live cricket matches using web scraping...');
    
    // Import the scraping function dynamically to avoid circular dependencies
    const { scrapeLiveMatches } = await import('./cricketScraper');
    
    // Call the scraping function to get dynamic mock data
    const scrapedMatches = await scrapeLiveMatches();
    
    if (scrapedMatches && scrapedMatches.length > 0) {
      logInfo('Successfully scraped match data:', scrapedMatches.length + ' matches');
      
      // Update the cache
      matchesCache.data = scrapedMatches;
      matchesCache.timestamp = Date.now();
      
      return scrapedMatches;
    }
    
    throw new Error('No matches found from scraping');
  } catch (error) {
    logError('Error fetching matches using web scraping:', error);
    
    // Return empty array if scraping fails
    return [];
  }
};

/**
 * Fetch match details by ID using web scraping
 * @param {string} matchId - The ID of the match to fetch details for
 * @param {boolean} forceRefresh - Whether to force a refresh and bypass cache
 * @returns {Promise} Promise object representing the match details
 */
export const fetchMatchDetails = async (matchId, forceRefresh = false) => {
  try {
    // Check cache first if not forcing refresh
    if (!forceRefresh && matchDetailsCache[matchId] && matchDetailsCache[matchId].timestamp) {
      const cacheAge = Date.now() - matchDetailsCache[matchId].timestamp;
      if (cacheAge < CACHE_EXPIRY) {
        logInfo(`Using cached match details for ${matchId} (${Math.round(cacheAge / 1000)}s old)`);
        return matchDetailsCache[matchId].data;
      }
    }
    
    logInfo(`Fetching details for match ${matchId} using web scraping...`);
    
    // Import the scraping function dynamically
    const { scrapeMatchDetails } = await import('./cricketScraper');
    
    // Call the scraping function
    const matchDetails = await scrapeMatchDetails(matchId);
    
    if (matchDetails) {
      logInfo('Successfully scraped match details');
      
      // Update the cache
      matchDetailsCache[matchId] = {
        data: matchDetails,
        timestamp: Date.now()
      };
      
      return matchDetails;
    }
    
    throw new Error(`Match details not found for ID: ${matchId}`);
  } catch (error) {
    logError(`Error fetching match details for ${matchId}:`, error);
    return null;
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