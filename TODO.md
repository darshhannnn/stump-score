# StumpScore - Project Status

Progress: Complete ✅ (backend v2: proxy, sync, comments, notifications, premium gating)

## Architecture
- `/` = Live Cricket Scores Hub (Cricbuzz-style)
- `/scorekeeper` = Casual board game scorekeeper
- `/leaderboard` = Game stats & history
- `/teams` = Team profiles, `/teams/:teamId` = Squad, form & stats
- `/series` = Tournaments, `/series/:seriesId` = Standings, fixtures & tracked matches
- `/search?q=` = Match search
- `/match/:id` = Match details, scorecard, AI commentary & win probability
- `/premium`, `/subscription`, `/payment` = Premium subscription (Razorpay)
- `/dashboard` = Premium dashboard (predictions, stats, subscription management)
- `/login`, `/signup`, `/forgot-password` = Auth
- `/privacy`, `/terms`, `/contact` = Legal & support
- `/home` = Legacy (redirects to `/`), `*` = 404 page

## Verified
- [x] `npm run build` compiles with no errors/warnings
- [x] `npx react-scripts test` - App.test.js passes
- [x] Backend boots in dev and production mode (Express 5 compatible)
- [x] `node tests/e2e-smoke-test.js` - register/login/order/verify/subscription/cancel/reactivate all pass
- [x] Backend v2: 40-assertion e2e suite passes (health, auth, prefs, favorites, game sync, comments, notifications, premium-gated predictions, real Razorpay verify path, password reset)
- [x] Link audit: every `to=` target resolves to a route, zero `#!` anchors, 404 catch-all in place

## Recently fixed
- Express 5 `app.get('*')` crash in production mode
- `/subscription` redirect loop (`isPremium` used as boolean instead of calling it)
- Premium payment flow (verify payload, user state refresh, wrong `/premium-dashboard` route)
- Match detail crash on `recentOvers` shape mismatch and non-array `umpires`
- Duplicate Header/Footer rendered by MatchDetails/Teams/Subscription pages
- Scorekeeper share URL missing `/scorekeeper` path
- Leaderboard "Start Playing" link and streak stat
- PlayerCard button grid hole

## Feature ideas (future)
- [ ] Multi-device game sync (Firebase/Supabase)
- [ ] QR code sharing for games
- [ ] Real Razorpay signature verification + webhooks (currently skipped for dev)
- [ ] More Jest tests for gameLogic/gameStorage
