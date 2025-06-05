import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * A wrapper component for protecting routes that require authentication
 * Redirects to login if not authenticated, passing the current location
 * for redirect after successful login
 */
const ProtectedRoute = ({ children, requirePremium = false }) => {
  const { isAuthenticated, isPremium } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login with return path
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If premium required but user doesn't have premium, redirect to premium page
  if (requirePremium && !isPremium()) {
    return <Navigate to="/premium" replace />;
  }

  // If authenticated (and premium if required), render the children
  return children;
};

export default ProtectedRoute;
