import { scrapeLiveMatches, scrapeMatchDetails } from './cricketScraper';
import { RAPID_API_CONFIG } from './rapidApiConfig';

// ===== PRIMARY: CricAPI (free: 100 req/day) =====
// Key is configured via REACT_APP_CRICAPI_KEY in .env
const CRICAPI_KEY = process.env.REACT_APP_CRICAPI_KEY || '8c428c05-056e-4d3b-9471-24956c550f47';
const CRICAPI_URL = 'https://api.cricapi.com/v1';

const logInfo = (msg, data) => console.log(`[CricketAPI] ${msg}`, data || '');
const logError = (msg, err) => console.error(`[CricketAPI] ${msg}`, err || '');

// ===== API Request Helpers =====

const fetchCricAPI = async (endpoint, params = {}) => {
  const url = new URL(`${CRICAPI_URL}${endpoint}`);
  url.searchParams.set('apikey', CRICAPI_KEY);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });

  const response = await fetch(url.toString());
  const data = await response.json();

  if (!response.ok || data.status !== 'success') {
    throw new Error(data.info || 'CricAPI failed');
  }
  return data;
};

const fetchRapidAPI = async (endpoint) => {
  const apiKey = RAPID_API_CONFIG.apiKey;
  if (!apiKey) throw new Error('No RapidAPI key configured');

  const response = await fetch(`${RAPID_API_CONFIG.baseUrl}${endpoint}`, {
    headers: RAPID_API_CONFIG.headers
  });

  if (!response.ok) throw new Error(`RapidAPI failed: ${response.status}`);
  return await response.json();
};

// ===== Score Parsing =====

const parseScore = (scoreArr, index) => {
  if (!scoreArr || !scoreArr[index]) return { r: 0, w: 0, o: '0.0' };
  const s = scoreArr[index];

  if (typeof s === 'object' && s !== null) {
    return { r: s.r || 0, w: s.w || 0, o: s.o || '0.0' };
  }

  if (typeof s === 'string') {
    const r = s.match(/r=(\d+)/);
    const w = s.match(/w=(\d+)/);
    const o = s.match(/o=([\d.]+)/);
    return {
      r: r ? parseInt(r[1]) : 0,
      w: w ? parseInt(w[1]) : 0,
      o: o ? o[1] : '0.0'
    };
  }

  return { r: 0, w: 0, o: '0.0' };
};

const parseTeamInfo = (teamInfoArr, index) => {
  if (!teamInfoArr || !teamInfoArr[index]) return null;
  const t = teamInfoArr[index];

  if (typeof t === 'object' && t !== null && t.name) {
    return {
      name: t.name,
      short_name: t.shortname || t.name.substring(0, 3).toUpperCase(),
      logo: t.img || `https://ui-avatars.com/api/?name=${t.name.substring(0, 3)}&background=0D47A1&color=fff&size=100`
    };
  }

  if (typeof t === 'string') {
    const nameMatch = t.match(/name=([^;]+)/);
    const shortMatch = t.match(/shortname=([^;]+)/);
    const imgMatch = t.match(/img=([^}]+)/);
    const name = nameMatch ? nameMatch[1].trim() : `Team ${index + 1}`;
    return {
      name,
      short_name: shortMatch ? shortMatch[1].trim() : name.substring(0, 3).toUpperCase(),
      logo: imgMatch ? imgMatch[1].trim() : `https://ui-avatars.com/api/?name=${name.substring(0, 3)}&background=0D47A1&color=fff&size=100`
    };
  }

  return null;
};

const generateStatusMessage = (match, t1s, t2s, t1n, t2n) => {
  if (match.matchEnded) return match.status;
  if (match.status?.toLowerCase().includes('opt to') || match.status?.toLowerCase().includes('elected')) return match.status;
  if (!t1s.r && !t2s.r) return 'Match not started';
  if (!t2s.r && t1s.r > 0) return `${t1n}: ${t1s.r}/${t1s.w} (${t1s.o}) - Waiting for second innings`;

  const diff = Math.abs(t1s.r - t2s.r);
  const ballsLeft = Math.max(0, (20 - parseFloat(t2s.o)) * 6);

  if (t1s.r > t2s.r) return `${t2n} needs ${diff + 1} runs from ${Math.floor(ballsLeft)} balls`;
  if (t2s.r > t1s.r) return `${t1n} needs ${t2s.r - t1s.r + 1} runs from ${Math.floor(ballsLeft)} balls`;
  return 'Scores are level';
};

const mapCricAPIMatch = (match) => {
  const t1 = parseTeamInfo(match.teamInfo, 0) || { name: match.teams?.[0] || 'Team 1', short_name: 'T1', logo: '' };
  const t2 = parseTeamInfo(match.teamInfo, 1) || { name: match.teams?.[1] || 'Team 2', short_name: 'T2', logo: '' };
  const s1 = parseScore(match.score, 0);
  const s2 = parseScore(match.score, 1);
  const isLive = !match.matchEnded && match.matchStarted;
  const isComplete = match.matchEnded;

  return {
    id: match.id,
    name: match.name,
    status: isLive ? 'LIVE' : isComplete ? 'COMPLETED' : 'UPCOMING',
    venue: match.venue || 'International Ground',
    series: match.name?.split(',').pop()?.trim() || 'Cricket',
    matchType: match.matchType,
    date: match.date,
    dateTimeGMT: match.dateTimeGMT,
    team1: { ...t1, score: s1.r, wickets: s1.w, overs: s1.o },
    team2: { ...t2, score: s2.r, wickets: s2.w, overs: s2.o },
    currentStatus: generateStatusMessage(match, s1, s2, t1.name, t2.name)
  };
};

// ===== Main Fetch Function =====

export const fetchCurrentMatches = async () => {
  // Source 1: CricAPI
  try {
    logInfo('Fetching from CricAPI...');
    const data = await fetchCricAPI('/currentMatches', { offset: 0 });
    if (data.data && data.data.length > 0) {
      logInfo(`CricAPI: ${data.data.length} matches`);
      return data.data.map(mapCricAPIMatch);
    }
  } catch (e) {
    logError('CricAPI failed:', e.message);
  }

  // Source 2: RapidAPI (Cricbuzz)
  try {
    logInfo('Fetching from RapidAPI...');
    const data = await fetchRapidAPI(RAPID_API_CONFIG.endpoints.liveScores);
    if (data && data.length > 0) {
      logInfo(`RapidAPI: ${data.length} matches`);
      return data.map(m => ({
        id: m.id || m.matchId || `rapid-${Date.now()}`,
        name: m.matchTitle || m.title || `${m.team1?.name || 'T1'} vs ${m.team2?.name || 'T2'}`,
        status: m.status?.includes('Live') || m.matchStarted ? 'LIVE' : 'COMPLETED',
        venue: m.venue || m.ground || 'International Ground',
        series: m.series || m.seriesName || 'Cricket',
        matchType: m.matchType || m.format || 't20',
        team1: {
          name: m.team1?.name || m.homeTeam || 'Team 1',
          short_name: m.team1?.shortName || 'T1',
          logo: m.team1?.logo || '',
          score: m.team1?.score || m.homeScore || 0,
          wickets: m.team1?.wickets || 0,
          overs: m.team1?.overs || '0.0'
        },
        team2: {
          name: m.team2?.name || m.awayTeam || 'Team 2',
          short_name: m.team2?.shortName || 'T2',
          logo: m.team2?.logo || '',
          score: m.team2?.score || m.awayScore || 0,
          wickets: m.team2?.wickets || 0,
          overs: m.team2?.overs || '0.0'
        },
        currentStatus: m.status || m.statusText || 'Match in progress'
      }));
    }
  } catch (e) {
    logError('RapidAPI failed:', e.message);
  }

  // Source 3: Scraper fallback
  logInfo('All APIs failed, using scraper...');
  return await scrapeLiveMatches();
};

export const fetchMatchDetails = async (matchId) => {
  // Source 1: CricAPI
  try {
    logInfo(`Fetching match details from CricAPI: ${matchId}`);
    const data = await fetchCricAPI('/match_info', { id: matchId });
    if (data.data) {
      const m = data.data;
      const t1 = parseTeamInfo(m.teamInfo, 0) || { name: 'Team 1', short_name: 'T1', logo: '' };
      const t2 = parseTeamInfo(m.teamInfo, 1) || { name: 'Team 2', short_name: 'T2', logo: '' };
      const s1 = parseScore(m.score, 0);
      const s2 = parseScore(m.score, 1);

      return {
        id: m.id,
        name: m.name,
        status: m.matchEnded ? 'COMPLETED' : m.matchStarted ? 'LIVE' : 'UPCOMING',
        venue: m.venue,
        series: m.name,
        teams: [t1.name, t2.name],
        score: [{ r: s1.r, w: s1.w, o: s1.o }, { r: s2.r, w: s2.w, o: s2.o }],
        team1: { ...t1, score: s1.r, wickets: s1.w, overs: s1.o },
        team2: { ...t2, score: s2.r, wickets: s2.w, overs: s2.o },
        toss: { winner: m.tossWinner || 'TBD', decision: m.tossChoice || 'bat' },
        currentStatus: generateStatusMessage(m, s1, s2, t1.name, t2.name)
      };
    }
  } catch (e) {
    logError('CricAPI match details failed:', e.message);
  }

  return await scrapeMatchDetails(matchId);
};

export const getFeaturedMatch = (matches) => {
  if (!matches || !matches.length) return null;
  return matches.find(m => m.status === 'LIVE') || matches[0];
};

const cricketApi = { fetchCurrentMatches, fetchMatchDetails, getFeaturedMatch };
export default cricketApi;
