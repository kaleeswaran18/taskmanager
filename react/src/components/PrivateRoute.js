// PrivateRoute.js
import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const PrivateRoute = ({ element, ...rest }) => {
  const user = sessionStorage.getItem('user'); // Check if user data exists in sessionStorage
  
  // Return a Route, and conditionally render based on user's session
  return (
    <Route 
      {...rest} 
      element={user ? element : <Navigate to="/login" />} 
    />
  );
};

export default PrivateRoute;
