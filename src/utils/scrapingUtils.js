/**
 * Utility functions for web scraping in StumpScore
 */

/**
 * Safely extract text from a cheerio element
 * @param {Object} $ - Cheerio instance
 * @param {Object} element - Element to extract text from
 * @param {string} selector - CSS selector
 * @param {string} defaultValue - Default value if element not found
 * @returns {string} Extracted text or default value
 */
export const safeExtractText = ($, element, selector, defaultValue = '') => {
  try {
    const selected = $(element).find(selector);
    return selected.length > 0 ? selected.text().trim() : defaultValue;
  } catch (error) {
    console.error(`Error extracting text with selector ${selector}:`, error);
    return defaultValue;
  }
};

/**
 * Parse score string into components (runs, wickets, overs)
 * @param {string} scoreText - Score text (e.g. "240/5 (42.3)")
 * @returns {Object} Object containing runs, wickets, and overs
 */
export const parseScoreText = (scoreText) => {
  try {
    if (!scoreText) return { r: 0, w: 0, o: '0.0' };
    
    // Handle different score formats
    const scoreParts = scoreText.split(' ');
    const runsWickets = scoreParts[0].split('/');
    
    return {
      r: parseInt(runsWickets[0], 10) || 0,
      w: runsWickets.length > 1 ? parseInt(runsWickets[1], 10) || 0 : 0,
      o: scoreParts.length > 1 ? scoreParts[1].replace(/[()]/g, '') : '0.0'
    };
  } catch (error) {
    console.error('Error parsing score text:', error);
    return { r: 0, w: 0, o: '0.0' };
  }
};

/**
 * Generate a team logo URL based on team name
 * @param {string} teamName - Name of the team
 * @param {string} colorScheme - Color scheme (blue or yellow)
 * @returns {string} URL for team logo
 */
export const generateTeamLogo = (teamName, colorScheme = 'blue') => {
  if (!teamName) return '';
  
  const shortName = teamName.substring(0, 3);
  const colors = colorScheme === 'blue' 
    ? { bg: '0D47A1', text: 'fff' }
    : { bg: 'FFC107', text: '000' };
    
  return `https://ui-avatars.com/api/?name=${shortName}&background=${colors.bg}&color=${colors.text}&size=100`;
};

/**
 * Format match status text
 * @param {string} statusText - Raw status text
 * @returns {string} Formatted status text
 */
export const formatMatchStatus = (statusText) => {
  if (!statusText) return 'UPCOMING';
  
  const status = statusText.toLowerCase().trim();
  
  if (status.includes('live') || status.includes('in progress')) {
    return 'LIVE';
  } else if (status.includes('complete') || status.includes('finished') || status.includes('end')) {
    return 'COMPLETED';
  } else if (status.includes('abandon') || status.includes('cancel')) {
    return 'ABANDONED';
  } else if (status.includes('postpone')) {
    return 'POSTPONED';
  } else if (status.includes('upcoming') || status.includes('yet to')) {
    return 'UPCOMING';
  }
  
  return statusText;
};

const scrapingUtils = {
  safeExtractText,
  parseScoreText,
  generateTeamLogo,
  formatMatchStatus
};

export default scrapingUtils;
