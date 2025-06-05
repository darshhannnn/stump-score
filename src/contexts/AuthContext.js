import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

// Create the Authentication Context
const AuthContext = createContext(null);

// Custom hook for using the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Effect to check if user is already logged in (on app load)
  useEffect(() => {
    const checkLoggedIn = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = async (email, password, redirectPath = '/') => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      navigate(redirectPath);
      return response;
    } catch (err) {
      setError(err.message || 'Login failed');
      return { error: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (name, email, password, redirectPath = '/') => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.signup(name, email, password);
      setUser(response.user);
      navigate(redirectPath);
      return response;
    } catch (err) {
      setError(err.message || 'Signup failed');
      return { error: err.message || 'Signup failed' };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (redirectPath = '/login') => {
    setLoading(true);
    
    try {
      await authService.logout();
      setUser(null);
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  // Update user premium status
  const upgradeToPremium = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.upgradeToPremium();
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to upgrade to premium');
      return { error: err.message || 'Failed to upgrade to premium' };
    } finally {
      setLoading(false);
    }
  };

  // Check if user is premium
  const isPremium = () => {
    return user?.isPremium || false;
  };

  // Google sign-in function
  const loginWithGoogle = async (redirectPath = '/') => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.loginWithGoogle();
      
      // Check if there was an error returned by the service
      if (response.error) {
        setError(response.error);
        return { error: response.error };
      }
      
      // If user successfully authenticated
      if (response.user) {
        setUser(response.user);
        navigate(redirectPath);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Google login failed';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Value to be provided by the context
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isPremium,
    login,
    signup,
    logout,
    upgradeToPremium,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
