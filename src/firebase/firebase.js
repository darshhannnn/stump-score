// Firebase configuration and initialization
//
// To enable REAL Google sign-in:
//   1. Create a project at https://console.firebase.google.com
//   2. Authentication -> Sign-in method -> enable Google
//   3. Authentication -> Settings -> Authorized domains: add localhost (present by default)
//   4. Project settings -> Your apps -> Web app -> copy the config values into .env:
//        REACT_APP_FIREBASE_API_KEY=...
//        REACT_APP_FIREBASE_AUTH_DOMAIN=...
//        REACT_APP_FIREBASE_PROJECT_ID=...
//        REACT_APP_FIREBASE_STORAGE_BUCKET=...
//        REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
//        REACT_APP_FIREBASE_APP_ID=...
//   5. Restart the dev server.
//
// Without those variables the app falls back to a demo Google sign-in
// (simulated account) so the auth flow remains fully testable. The chosen
// user is still registered against the backend and receives a real JWT.

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'demo-api-key-for-testing',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'localhost',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'stumpscore-dev',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'stumpscore-dev.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:123456789:web:abcdef1234567890'
};

// True only when real Firebase credentials are provided via .env
export const isFirebaseConfigured = Boolean(
  process.env.REACT_APP_FIREBASE_API_KEY &&
  process.env.REACT_APP_FIREBASE_AUTH_DOMAIN &&
  process.env.REACT_APP_FIREBASE_APP_ID
);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// For development only: If you're running into auth popup issues, you can
// uncomment this line to use the Firebase Auth Emulator (requires
// `firebase emulators:start --only auth`):
// connectAuthEmulator(auth, 'http://localhost:9099');

// Create Google provider instance
const googleProvider = new GoogleAuthProvider();

// Configure Google provider with additional OAuth 2.0 scopes
googleProvider.addScope('profile');
googleProvider.addScope('email');

export { auth, googleProvider };
export default app;
