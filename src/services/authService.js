// Authentication service
// Supports both MongoDB and Firebase Google authentication
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase/firebase';
import { API_BASE_URL } from './apiConfig';

const jsonRequest = async (url, { method = 'GET', headers = {}, body } = {}) => {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof data === 'object' && data !== null ? data.message : undefined;
    const err = new Error(message || 'Request failed');
    err.response = { data };
    throw err;
  }

  return { data };
};

// API URLs
const API_URLS = {
  register: `${API_BASE_URL}/users/register`,
  login: `${API_BASE_URL}/users/login`,
  google: `${API_BASE_URL}/users/google`,
  profile: `${API_BASE_URL}/users/profile`,
  subscription: `${API_BASE_URL}/users/subscription`
};

// Store the current authenticated user in localStorage
const AUTH_TOKEN_KEY = 'stumpscore_auth_token';
const USER_KEY = 'stumpscore_user';

const getAuthHeaders = () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return {
    Authorization: token ? `Bearer ${token}` : ''
  };
};

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
      const response = await jsonRequest(API_URLS.login, { method: 'POST', body: { email, password } });
      
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
      const response = await jsonRequest(API_URLS.register, { method: 'POST', body: { name, email, password } });
      
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

  // Merge updates into the locally stored user (e.g. after a successful payment)
  updateStoredUser: (updates = {}) => {
    const current = authService.getCurrentUser() || {};
    const merged = { ...current, ...updates };
    if (!merged.id && merged._id) {
      merged.id = merged._id;
    }
    localStorage.setItem(USER_KEY, JSON.stringify(merged));
    return merged;
  },

  // Expose auth headers for other services (comments, cloud sync, etc.)
  authHeaders: () => getAuthHeaders(),

  // ===== Account & preferences =====

  // Update preferences (theme, notification toggles, favorite team)
  updatePreferences: async (preferences) => {
    try {
      const response = await jsonRequest(`${API_BASE_URL}/users/preferences`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: preferences
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update preferences');
    }
  },

  // Change password (requires the current password)
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await jsonRequest(`${API_BASE_URL}/users/change-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: { currentPassword, newPassword }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  },

  // Request a password reset link
  forgotPassword: async (email) => {
    try {
      const response = await jsonRequest(`${API_BASE_URL}/users/forgot-password`, {
        method: 'POST',
        body: { email }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to request password reset');
    }
  },

  // Consume a reset token and set a new password
  resetPassword: async (token, password) => {
    try {
      const response = await jsonRequest(`${API_BASE_URL}/users/reset-password`, {
        method: 'POST',
        body: { token, password }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  },

  // Delete the account and all associated server-side data
  deleteAccount: async () => {
    try {
      const response = await jsonRequest(`${API_BASE_URL}/users/account`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete account');
    }
  },

  // ===== Favorites =====

  getFavorites: async () => {
    try {
      const response = await jsonRequest(`${API_BASE_URL}/users/favorites`, {
        headers: getAuthHeaders()
      });
      return response.data.favorites || [];
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to load favorites');
    }
  },

  toggleFavorite: async (teamId) => {
    try {
      const response = await jsonRequest(`${API_BASE_URL}/users/favorites/${encodeURIComponent(teamId)}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update favorites');
    }
  },

  // ===== Notifications =====

  getNotifications: async (page = 1, limit = 15) => {
    try {
      const response = await jsonRequest(`${API_BASE_URL}/notifications?page=${page}&limit=${limit}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to load notifications');
    }
  },

  markNotificationRead: async (id) => {
    try {
      const response = await jsonRequest(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update notification');
    }
  },

  markAllNotificationsRead: async () => {
    try {
      const response = await jsonRequest(`${API_BASE_URL}/notifications/read-all`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update notifications');
    }
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
      
      const response = await jsonRequest(`${API_BASE_URL}/payments/verify`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: {
          ...paymentDetails,
          userId: user.id
        }
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
      // Try real Firebase Google auth only when credentials are configured;
      // otherwise go straight to the demo sign-in (still issues a real JWT
      // from our backend so the whole app flow works).
      let googleUser;

      if (isFirebaseConfigured) {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          googleUser = {
            name: result.user.displayName,
            email: result.user.email,
            googleId: result.user.uid,
            profilePicture: result.user.photoURL
          };
        } catch (firebaseError) {
          if (firebaseError?.code === 'auth/popup-closed-by-user' || firebaseError?.code === 'auth/cancelled-popup-request') {
            return { error: 'Google sign-in was cancelled' };
          }
          console.warn('Firebase Google auth failed, falling back to demo sign-in:', firebaseError?.code || firebaseError);
        }
      }

      if (!googleUser) {
        const confirmAuth = window.confirm(
          'Google sign-in (demo mode)\n\n' +
          'Real Google sign-in activates once Firebase credentials are added to .env ' +
          '(REACT_APP_FIREBASE_* - see src/firebase/firebase.js for the 4-step guide).\n\n' +
          'Continue with the demo account "google.user@gmail.com"? (OK = continue, Cancel = abort)'
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
      const response = await jsonRequest(API_URLS.google, { method: 'POST', body: googleUser });
      
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
