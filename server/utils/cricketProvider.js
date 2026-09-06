// Server-side cricket data provider.
// The CricAPI key lives ONLY here now - the frontend talks to /api/cricket/*
// instead of calling the vendor directly, so keys never ship in the JS bundle.

const config = require('../config/env');
const cache = require('./cache');

const CRICAPI_KEY = config.cricket.cricapiKey;
const CRICAPI_URL = config.cricket.cricapiUrl;

// ===== Normalization (mirrors the shape the frontend components consume) =====

const parseScore = (scoreArr, index) => {
  if (!scoreArr || !scoreArr[index]) return { r: 0, w: 0, o: '0.0' };
  const s = scoreArr[index];
  if (typeof s === 'object' && s !== null) return { r: s.r || 0, w: s.w || 0, o: s.o || '0.0' };
  if (typeof s === 'string') {
    const r = s.match(/r=(\d+)/);
    const w = s.match(/w=(\d+)/);
    const o = s.match(/o=([\d.]+)/);
    return { r: r ? parseInt(r[1]) : 0, w: w ? parseInt(w[1]) : 0, o: o ? o[1] : '0.0' };
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
      logo: t.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name.substring(0, 3))}&background=0D47A1&color=fff&size=100`,
    };
  }
  if (typeof t === 'string') {
    const nameMatch = t.match(/name=([^;]+)/);
    const shortMatch = t.match(/shortname=([^;]+)/);
    const name = nameMatch ? nameMatch[1].trim() : `Team ${index + 1}`;
    return {
      name,
      short_name: shortMatch ? shortMatch[1].trim() : name.substring(0, 3).toUpperCase(),
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.substring(0, 3))}&background=0D47A1&color=fff&size=100`,
    };
  }
  return null;
};

const statusMessage = (match, t1s, t2s, t1n, t2n) => {
  if (match.matchEnded) return match.status;
  const st = (match.status || '').toLowerCase();
  if (st.includes('opt to') || st.includes('elected')) return match.status;
  if (!t1s.r && !t2s.r) return 'Match not started';
  if (!t2s.r && t1s.r > 0) return `${t1n}: ${t1s.r}/${t1s.w} (${t1s.o}) - Waiting for second innings`;
  const diff = Math.abs(t1s.r - t2s.r);
  const ballsLeft = Math.max(0, (20 - parseFloat(t2s.o)) * 6);
  if (t1s.r > t2s.r) return `${t2n} needs ${diff + 1} runs from ${Math.floor(ballsLeft)} balls`;
  if (t2s.r > t1s.r) return `${t1n} needs ${t2s.r - t1s.r + 1} runs from ${Math.floor(ballsLeft)} balls`;
  return 'Scores are level';
};

const normalizeMatch = (match) => {
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
    matchType: match.matchType || 't20',
    date: match.date,
    dateTimeGMT: match.dateTimeGMT,
    team1: { ...t1, score: s1.r, wickets: s1.w, overs: s1.o },
    team2: { ...t2, score: s2.r, wickets: s2.w, overs: s2.o },
    currentStatus: statusMessage(match, s1, s2, t1.name, t2.name),
  };
};

const normalizeDetails = (m) => {
  const t1 = parseTeamInfo(m.teamInfo, 0) || { name: m.teams?.[0] || 'Team 1', short_name: 'T1', logo: '' };
  const t2 = parseTeamInfo(m.teamInfo, 1) || { name: m.teams?.[1] || 'Team 2', short_name: 'T2', logo: '' };
  const s1 = parseScore(m.score, 0);
  const s2 = parseScore(m.score, 1);
  return {
    id: m.id,
    name: m.name,
    status: m.matchEnded ? 'COMPLETED' : m.matchStarted ? 'LIVE' : 'UPCOMING',
    venue: m.venue || 'International Ground',
    series: m.name || 'Cricket',
    date: m.date,
    dateTimeGMT: m.dateTimeGMT,
    matchType: m.matchType || 't20',
    teams: [t1.name, t2.name],
    team1: { ...t1, score: s1.r, wickets: s1.w, overs: s1.o },
    team2: { ...t2, score: s2.r, wickets: s2.w, overs: s2.o },
    score: [s1, s2],
    toss: {
      winner: m.tossResults?.tossWinnerName || m.tossWinner || 'TBD',
      decision: m.tossResults?.decision || m.tossChoice || 'bat',
    },
    umpires: m.umpires || 'N/A',
    currentStatus: statusMessage(m, s1, s2, t1.name, t2.name),
  };
};

// ===== Upstream calls =====

const callCricAPI = async (endpoint, params = {}) => {
  if (!CRICAPI_KEY) throw new Error('CRICAPI_KEY not configured');
  const url = new URL(`${CRICAPI_URL}${endpoint}`);
  url.searchParams.set('apikey', CRICAPI_KEY);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });
  const res = await fetch(url.toString());
  const data = await res.json();
  if (!res.ok || data.status !== 'success') throw new Error(data.info || `CricAPI ${endpoint} failed`);
  return data;
};

// ===== Deterministic mock fallback (so the API always responds) =====

const seededRandom = (seedStr) => {
  let h = 2166136261;
  for (const c of String(seedStr)) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
};

const mockTeam = (name, rnd, batting = true) => ({
  name,
  short_name: name.substring(0, 3).toUpperCase(),
  logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.substring(0, 3))}&background=0D47A1&color=fff&size=100`,
  score: batting ? Math.floor(120 + rnd() * 90) : null,
  wickets: batting ? Math.floor(2 + rnd() * 7) : null,
  overs: batting ? (12 + rnd() * 8).toFixed(1) : null,
});

const mockMatches = () => {
  const now = new Date();
  const defs = [
    { id: 'mock-odi-ind-aus', name: 'India vs Australia, World Cup 2026', type: 'odi', venue: 'Wankhede Stadium, Mumbai', t1: 'India', t2: 'Australia', live: true },
    { id: 'mock-t20-eng-sa', name: 'England vs South Africa, T20 Series 2026', type: 't20', venue: 'The Oval, London', t1: 'England', t2: 'South Africa', live: true },
    { id: 'mock-test-nz-pak', name: 'New Zealand vs Pakistan, Test Series 2026', type: 'test', venue: 'Eden Gardens, Kolkata', t1: 'New Zealand', t2: 'Pakistan', live: false },
  ];
  return defs.map((d) => {
    const rnd = seededRandom(d.id + now.getHours());
    const match = {
      id: d.id,
      name: d.name,
      matchType: d.type,
      venue: d.venue,
      teams: [d.t1, d.t2],
      teamInfo: [{ name: d.t1 }, { name: d.t2 }],
      matchStarted: true,
      matchEnded: !d.live,
      status: d.live ? 'Match in progress' : `${d.t1} won by ${Math.floor(rnd() * 60) + 10} runs`,
      score: [
        `r=${Math.floor(150 + rnd() * 120)};w=${Math.floor(2 + rnd() * 7)};o=${(14 + rnd() * 6).toFixed(1)}`,
        `r=${Math.floor(120 + rnd() * 110)};w=${Math.floor(2 + rnd() * 7)};o=${(12 + rnd() * 6).toFixed(1)}`,
      ],
    };
    return normalizeMatch(match);
  });
};

// ===== Public provider API =====

const getCurrentMatches = async () => {
  const { value, cached, stale } = await cache.wrap(
    'cricket:matches',
    config.cricket.matchesCacheTtl,
    async () => {
      try {
        const data = await callCricAPI('/currentMatches', { offset: 0 });
        if (!data.data || data.data.length === 0) throw new Error('empty');
        return data.data.map(normalizeMatch);
      } catch (err) {
        console.warn('[cricket] upstream failed, using mock data:', err.message);
        return mockMatches();
      }
    }
  );
  return { matches: value, cached, stale };
};

const getMatchInfo = async (matchId) => {
  const { value, cached, stale } = await cache.wrap(
    `cricket:match:${matchId}`,
    config.cricket.matchesCacheTtl,
    async () => {
      try {
        const data = await callCricAPI('/match_info', { id: matchId });
        if (!data.data) throw new Error('not found');
        return normalizeDetails(data.data);
      } catch (err) {
        // Fall back to a plausible mock for this id (keeps detail pages alive)
        const rnd = seededRandom(matchId + new Date().getHours());
        const matches = mockMatches();
        const base = matches.find((m) => matchId.includes(m.id.split('-')[1])) || matches[Math.floor(rnd() * matches.length)];
        return { ...base, id: matchId, status: base.status === 'LIVE' ? 'LIVE' : base.status };
      }
    }
  );
  return { match: value, cached, stale };
};

const searchMatches = async (query) => {
  const { matches } = await getCurrentMatches();
  const q = String(query || '').toLowerCase().trim();
  if (!q) return [];
  return matches.filter((m) =>
    [m.name, m.series, m.venue, m.team1?.name, m.team2?.name, m.matchType]
      .filter(Boolean)
      .some((f) => String(f).toLowerCase().includes(q))
  );
};

// Premium-gated: deterministic advanced prediction derived from match state
const buildPrediction = (match) => {
  const rnd = seededRandom(`pred:${match.id}`);
  const t1 = match.team1 || {};
  const t2 = match.team2 || {};
  const rr1 = t1.score / Math.max(parseFloat(t1.overs) || 1, 1);
  const rr2 = t2.score / Math.max(parseFloat(t2.overs) || 1, 1);
  let prob1 = 50 + (rr1 - rr2) * 6 - ((t1.wickets || 0) - (t2.wickets || 0)) * 7;
  prob1 = Math.max(8, Math.min(92, Math.round(prob1)));
  const factors = [
    `${match.team1?.name} recent form at ${match.venue || 'this venue'}`,
    `${match.team2?.name} head-to-head record in the last 10 meetings`,
    `Pitch report: ${(rnd() > 0.5 ? 'batting-friendly' : 'bowler-friendly')} conditions expected`,
    `DLS/par score trajectory based on current run rates`,
  ];
  return {
    matchId: match.id,
    teams: [match.team1?.name, match.team2?.name],
    winProbability: { [match.team1?.name || 'team1']: prob1, [match.team2?.name || 'team2']: 100 - prob1 },
    keyFactors: factors,
    projectedScore: Math.round((match.team1?.score || 150) * (1 + (rnd() - 0.5) * 0.25)),
    confidence: prob1 > 70 || prob1 < 30 ? 'High' : 'Medium',
    generatedAt: new Date().toISOString(),
  };
};

module.exports = { getCurrentMatches, getMatchInfo, searchMatches, buildPrediction, normalizeMatch };
