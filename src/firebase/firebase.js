// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';

// Your web app's Firebase configuration
// NOTE: This is a placeholder configuration. In a production app,
// you would use real Firebase credentials from your Firebase console
// For a local development environment, Firebase will actually work with these
// placeholders when running in emulator mode
const firebaseConfig = {
  apiKey: "demo-api-key-for-testing",
  authDomain: "localhost",
  projectId: "stumpscore-dev",
  storageBucket: "stumpscore-dev.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef1234567890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// For development only: If you're running into auth popup issues, you can
// uncomment this line to use the Firebase Auth Emulator
// This requires running the Firebase emulator locally with:
// firebase emulators:start --only auth
// connectAuthEmulator(auth, 'http://localhost:9099');

// Create Google provider instance
const googleProvider = new GoogleAuthProvider();

// Configure Google provider with additional OAuth 2.0 scopes if needed
googleProvider.addScope('profile');
googleProvider.addScope('email');

export { auth, googleProvider };
export default app;
