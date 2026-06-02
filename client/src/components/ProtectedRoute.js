import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

function ProtectedRoute({ children }) { // Accepts children directly
  const { user } = useContext(AuthContext);

  if (!user) {
    // User not authenticated, redirect to login page
    return <Navigate to="/auth" replace />;
  }

  // User authenticated, render the children (the protected element)
  return children;
}

export default ProtectedRoute;
