# StumpScore - Master Developer & Agent Handoff Guide

**Purpose**: This document serves as the absolute source of truth for AI agents or developers taking over the `stump_score` project. Read this thoroughly before analyzing or modifying any code. It dictates structural rules, tech stack constraints, and exact workflows.

---

## 🏗️ 1. Architecture & Tech Stack

**StumpScore** is a monolithic repository containing a decoupled frontend and backend. Both are written in JavaScript (Node.js/React).

### Frontend Stack (`src/` directory)
- **Framework**: React.js (v18.2.0) built via Create React App (`react-scripts`).
- **Styling**: Tailwind CSS (v3) + PostCSS. `index.css` is the Tailwind injection point. Do not write custom CSS unless strictly necessary.
- **Routing**: `react-router-dom` (v6) handling navigation (`/`, `/login`, `/premium`, etc.).
- **State Management**: React Context API (`AuthContext`, etc.) combined with localized component state (`useState`, `useReducer`).
- **Icons/UI**: React Icons or standard SVGs embedded inline.

### Backend Stack (`server/` directory)
- **Framework**: Node.js + Express.js (v5.1).
- **Database**: MongoDB (via Mongoose v8.15).
- **Authentication**: JWT (`jsonwebtoken`) and bcrypt password hashing.
- **Payments**: Razorpay Node SDK.

---

## 📂 2. Core Directory Breakdown

```text
e:\Unreg\stump_score\
├── package.json          # Combined dependency map. "npm run dev" boots BOTH front/back ends.
├── server.js             # Root backend entry point. Connects DB and sets up Express.
├── .env                  # Environment Variables (Crucial: MongoDB credentials, Razorpay Sandbox)
├── src/                  
│   ├── components/       # Dumb/Reusable UI components.
│   │   ├── Header.js / Footer.js 
│   │   ├── LiveScoreCard.js    # Renders the individual match status.
│   │   ├── MatchDetail.js      # Expanded match view.
│   │   └── ProtectedRoute.js   # Higher Order Component preventing unauthenticated paths.
│   ├── pages/            # Smart components representing full routes.
│   │   ├── HomePage.js         # Fetches and renders live scores.
│   │   ├── PremiumPage.js      # Subscription CTA.
│   │   └── PaymentPage.js      # Razorpay client-side integration logic.
│   ├── services/         # All async fetches and external data sources.
│   │   ├── authService.js      # Wraps API calls to /api/users
│   │   ├── paymentService.js   # Wraps API calls to /api/payments
│   │   ├── cricketApi.js       # The "API" interface for live scores.
│   │   └── cricketScraper.js   # The Mock Data Engine (See Section 3).
│   └── utils/            # Shared logic.
└── server/               
    ├── models/           # Mongoose schemas (e.g., User.js containing subscription tiers).
    ├── routes/           # REST Handlers.
    │   ├── userRoutes.js       # Login, Register, Profile fetching.
    │   └── paymentRoutes.js    # Initiating Razorpay orders and webhook verifications.
    └── middleware/       # Express route protectors (e.g., extracting JWT from 'Authorization' header).
```

---

## 🧠 3. Crucial Workflows & "Gotchas"

### A. The "Live Score" Mock Data Engine (Important for Agents!)
**Do not attempt to debug network requests for live scores to an external domain.** 
Because browser extensions and web scraping inside React triggers CORS failures, the system currently employs an advanced **Dynamic Mock Engine** localized in `src/services/cricketScraper.js`.
- It generates mathematically plausible cricket scores dynamically using `Date.now()`.
- It formats data exactly as a real API would structure it.
- **Agent Task**: If the user asks to "Integrate a real cricket API", you must remove the `cricketScraper.js` local generation, purchase/find an API key (e.g., CricAPI), and re-wire `cricketApi.js` to execute `axios.get('https://api.cricapi.com...')`.

### B. Database Connection Fallback
The `server.js` file attempts to connect to `MONGO_URI` (MongoDB Atlas remote URL) defined in `.env`.
To ensure developer experience, there is a `.catch()` block that **falls back to `mongodb://localhost:27017/stumpscore`**.
- If Atlas authentication fails, it connects to local.
- **Agent Task**: When writing DB scripts, be aware that you might be interacting with the local instance if the user's IP isn't whitelisted in Atlas.

### C. Authentication Flow
1. User submits login form -> `src/services/authService.js` hits `POST http://localhost:5000/api/users/login`.
2. Backend validates bcrypt hash against DB.
3. Backend issues a signed JWT (`JWT_SECRET` in `.env`).
4. Frontend stores the JWT in `localStorage` and places the user payload in React Context.
5. Authorized requests (`/api/users/profile`, `/api/payments/...`) require passing `Authorization: Bearer <token>` in headers.

### D. Razorpay Payments Integration Flow
1. User clicks "Subscribe". Frontend triggers `paymentService.createOrder()`.
2. Backend (`server/routes/paymentRoutes.js`) hits Razorpay API to generate an `order_id` (amount is securely determined server-side).
3. Backend returns `order_id` to React.
4. React executes the Razorpay Checkout Modal (using keys passed down).
5. Upon user card approval, Razorpay returns a `razorpay_payment_id` and `razorpay_signature` to React.
6. React calls backend `paymentRoutes.verifyPayment()`, passing these credentials.
7. Backend updates `User.isPremium = true` in MongoDB upon valid signature verification.

---

## 🛠️ 4. Quick Execution Guide (Copy & Paste Commands)

To run everything simultaneously for development:
```bash
# 1. Ensure all NPM modules exist (Run this at the root!)
npm install

# 2. Boot both systems
# -> Backend launches on http://localhost:5000
# -> Frontend launches on http://localhost:1011 (Due to "set PORT=1011" in package.json)
npm run dev
```

---

## 🤖 5. Agent Instructions for Modifying Code

When another AI agent modifies this project, adhere strictly to these rules:

1. **Use Modern React Standards**: Do not use Class components. Use Functional components with Hooks (`useEffect`, `useState`).
2. **Tailwind First**: When modifying UI, utilize Tailwind utility classes (e.g., `flex items-center justify-between p-4`). Do not create new plain CSS files in `src/` unless designing complex CSS animations.
3. **Environment Integrity**: If you introduce a new API key or secret, you MUST document it in the `.env` section of this file, and ensure it is consumed as `process.env.NEW_KEY` (Backend) or `process.env.REACT_APP_NEW_KEY` (Frontend).
4. **Error Handling**: Express routes must `try { ... } catch (err) { res.status(500).json(...) }`. Unhandled promise rejections crash the server.
5. **Port Hardcoding**: Avoid hardcoding `http://localhost:5000` inside React components. API routes should funnel through the base URLs defined in `src/services/*`.

*End of Document. Proceed with building and refining StumpScore context-aware.*
