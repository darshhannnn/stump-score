// Single source of truth for the API base URL.
// Override with REACT_APP_API_URL in .env (e.g. pointing at a deployed backend).
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default API_BASE_URL;
