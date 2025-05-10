# StumpScore Backend

A Node.js/Express backend for the StumpScore cricket application.

## Features

- User Authentication (JWT)
- Live Cricket Scores
- News Integration
- Customizable UI
- Dark Mode Support
- Rate Limiting
- Security Headers
- MongoDB Integration

## Prerequisites

- Node.js >= 18.0.0
- MongoDB
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file:
   ```bash
   cp .env.example .env
   ```
4. Configure your environment variables in .env
5. Start the server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a .env file with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/stumpscore

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# API Keys
CRICAPI_KEY=your_cricapi_key
NEWSAPI_KEY=your_newsapi_key

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

## API Documentation

### Authentication

- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### External APIs

- GET /api/external/scores/live - Get live cricket scores
- GET /api/external/news/latest - Get latest cricket news

## Security Features

- Helmet for security headers
- Rate limiting
- CORS protection
- Input validation
- Password hashing
- JWT authentication

## Testing

Run tests using:

```bash
npm test
```

## Linting

Run ESLint:

```bash
npm run lint
```

## Code Formatting

Format code using Prettier:

```bash
npm run format
```

## License

ISC
