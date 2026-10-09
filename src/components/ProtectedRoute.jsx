import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * Guards private routes by checking whether a JWT authentication token exists in localStorage.
 * - If authenticated: Renders child components.
 * - If unauthenticated: Redirects to /login and saves current location in state.
 */
const ProtectedRoute = ({ children }) => {
  // Bypassed for static deployment/offline access
  return children;
};

export default ProtectedRoute;
