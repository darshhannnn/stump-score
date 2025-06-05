// Authentication service
// Supports both MongoDB and Firebase Google authentication
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/firebase';
import axios from 'axios';

// API URLs
const API_BASE_URL = 'http://localhost:5000/api';
const API_URLS = {
  register: `${API_BASE_URL}/users/register`,
  login: `${API_BASE_URL}/users/login`,
  google: `${API_BASE_URL}/users/google`,
  profile: `${API_BASE_URL}/users/profile`,
  subscription: `${API_BASE_URL}/users/subscription`
};

// Create an axios instance with auth token
const getAuthAxios = () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return axios.create({
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  });
};

// Store the current authenticated user in localStorage
const AUTH_TOKEN_KEY = 'stumpscore_auth_token';
const USER_KEY = 'stumpscore_user';

// Authentication service
const authService = {
  // Check if user is logged in
  isAuthenticated: () => {
    return localStorage.getItem(AUTH_TOKEN_KEY) !== null;
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      // Remove password from user object for security
      delete user.password;
      return user;
    } catch (e) {
      console.error('Error parsing user from localStorage', e);
      return null;
    }
  },

  // Login
  login: async (email, password) => {
    try {
      const response = await axios.post(API_URLS.login, { email, password });
      
      const { token, _id, name, email: userEmail, isPremium, premiumUntil } = response.data;
      
      // Store token and user data in localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      
      const userToStore = {
        id: _id,
        name,
        email: userEmail,
        isPremium,
        premiumUntil
      };
      
      localStorage.setItem(USER_KEY, JSON.stringify(userToStore));
      
      return { user: userToStore, token };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },


  // Signup
  signup: async (name, email, password) => {
    try {
      const response = await axios.post(API_URLS.register, { name, email, password });
      
      const { token, _id, name: userName, email: userEmail, isPremium } = response.data;
      
      // Store token and user data in localStorage
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      
      const userToStore = {
        id: _id,
        name: userName,
        email: userEmail,
        isPremium
      };
      
      localStorage.setItem(USER_KEY, JSON.stringify(userToStore));
      
      return { user: userToStore, token };
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },


  // Logout
  logout: async () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return { success: true };
  },


  // Check if the user is premium
  isPremiumUser: () => {
    const user = authService.getCurrentUser();
    return user ? user.isPremium : false;
  },

  // Upgrade to premium
  upgradeToPremium: async (paymentDetails) => {
    try {
      const user = authService.getCurrentUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const authAxios = getAuthAxios();
      const response = await authAxios.post(`${API_BASE_URL}/payments/verify`, {
        ...paymentDetails,
        userId: user.id
      });
      
      // Update user in local storage with premium status
      const updatedUser = {
        ...user,
        isPremium: true,
        premiumUntil: response.data.user.premiumUntil
      };
      
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      
      return { 
        user: updatedUser,
        success: true 
      };
    } catch (error) {
      console.error('Premium upgrade error:', error);
      throw new Error(error.response?.data?.message || 'Premium upgrade failed');
    }
  },


  // Google authentication
  loginWithGoogle: async () => {
    try {
      // Try to use real Firebase Google auth if credentials are set up
      let googleUser;
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const credential = googleProvider.credentialFromResult(result);
        googleUser = {
          name: result.user.displayName,
          email: result.user.email,
          googleId: result.user.uid,
          profilePicture: result.user.photoURL
        };
      } catch (firebaseError) {
        console.warn('Firebase Google auth failed, using mock Google auth:', firebaseError);
        // If Firebase auth fails, fall back to mock Google auth
        const confirmAuth = window.confirm(
          'MOCK GOOGLE AUTH: Click OK to simulate successful Google sign-in as "google.user@gmail.com", or Cancel to abort.'
        );

        if (!confirmAuth) {
          return { error: 'Sign-in canceled by user' };
        }

        googleUser = {
          name: 'Google User',
          email: 'google.user@gmail.com',
          googleId: `mock-google-${Date.now()}`,
          profilePicture: 'https://lh3.googleusercontent.com/a/default-user'
        };
      }
      
      // Send Google user data to our backend API
      const response = await axios.post(API_URLS.google, googleUser);
      
      const { token, _id, isPremium } = response.data;
      
      // Store token
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      
      // Store user info
      const userToStore = {
        id: _id,
        name: googleUser.name,
        email: googleUser.email,
        isPremium,
        profilePicture: googleUser.profilePicture
      };
      
      localStorage.setItem(USER_KEY, JSON.stringify(userToStore));
      
      return { user: userToStore, token };
    } catch (error) {
      console.error('Google Sign In Error:', error);
      throw new Error(error.response?.data?.message || 'Google sign-in failed');
    }
  }
};

export default authService;
