# 🏏 StumpScore - Live Cricket Scores Hub & Scorekeeper

StumpScore is a full-stack cricket platform: a Cricbuzz-style live scores hub plus a casual board-game scorekeeper, with user accounts and a Razorpay premium subscription.

Progress: Complete ✅ (build passing, backend flows e2e-tested)

## Architecture
- `/` = Live Cricket Scores Hub (Cricbuzz-style)
- `/scorekeeper` = Casual board game scorekeeper
- `/leaderboard` = Game stats & history
- `/teams` = Team profiles
- `/series` = ICC rankings & tournaments
- `/search?q=` = Match search
- `/match/:id` = Match details, scorecard, AI commentary & win probability
- `/premium`, `/subscription`, `/payment` = Premium subscription (Razorpay)
- `/dashboard` = Premium member dashboard (predictions, stats, subscription management)
- `/login`, `/signup` = Auth (JWT + Google via Firebase, with mock fallback)
- `/home` = Legacy (redirects to `/`)

## Features
- Live match scores with auto-refresh (30s) and score-change highlight
- Score ticker scrolling bar
- Featured match hero section
- Tab navigation (Live / Completed / Upcoming / Series) with format filters (T20/ODI/Test)
- Quick stats row (top scorer, best bowler, partnership)
- Match cards with team logos, scores, status
- Match detail pages with AI commentary, win probability and run-rate charts
- Search across matches, teams, venues and series
- Dark mode (persisted + system preference)
- Scorekeeper game (undo, rounds, save/load, share, export JSON)
- Leaderboard with charts, win rates and streaks
- User auth (JWT + Google OAuth via Firebase with mock fallback)
- Premium subscription (Razorpay order + verify, cancel/reactivate/change-plan)
- PWA-ready
- 404 catch-all page

## Run
```bash
npm install
npm run dev   # backend on http://localhost:5000 + frontend on http://localhost:1011
```

Production:
```bash
npm run build
NODE_ENV=production npm run server   # serves the build folder on port 5000
```

Verify backend end-to-end (uses in-memory MongoDB, no setup needed):
```bash
node tests/e2e-smoke-test.js
```

## Live score data sources (in fallback order)
1. **CricAPI** (`REACT_APP_CRICAPI_KEY`, free: 100 req/day)
2. **RapidAPI Cricbuzz** (`REACT_APP_RAPIDAPI_KEY`, free: 100 req/month)
3. **Dynamic mock engine** (`src/services/cricketScraper.js`) - generates plausible live data so the UI always works

## Environment variables
Copy `.env.example` to `.env` and fill in your values. See `AGENT_INSTRUCTIONS.md` for the full list and architecture notes.

## Backend API (v2)

The backend is a full-featured Express 5 API — see the `server/` folder for the structure:

| Area | Endpoints |
|---|---|
| Health/Stats | `GET /api/health`, `GET /api/stats` |
| Auth | register, login, google, profile (GET/PUT), preferences, change-password, forgot/reset-password, delete account |
| Favorites | GET/POST `/api/users/favorites[/:teamId]` |
| Payments | create-order (real Razorpay SDK), verify (HMAC signature check), history, orders, webhook |
| Subscription | GET + cancel / reactivate / change-plan |
| Cricket proxy | `/api/cricket/matches`, `/match/:id`, `/search?q=` — cached server-side, API keys never leave the backend |
| Predictions | `/api/cricket/predictions/:matchId` — **premium-gated** |
| Cloud game sync | `/api/games` CRUD (Scorekeeper save/load across devices) |
| Match comments | `/api/matches/:matchId/comments` — public read, auth write, spam-limited |
| Notifications | `/api/notifications` list / read / read-all |

Includes: helmet security, compression, morgan logging, tiered rate limiting,
in-memory TTL cache with stale-while-error, order audit trail, welcome/premium
notifications, graceful shutdown, and JSON 404/error handlers.

## Tech stack
- **Frontend**: React 18 (CRA), Tailwind CSS 3, React Router 6, Recharts, Firebase Auth
- **Backend**: Express 5, MongoDB (Mongoose 8), JWT + bcrypt, Razorpay SDK, helmet/morgan/compression/express-rate-limit

## License
MIT - Free for all!
