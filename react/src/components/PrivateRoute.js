// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from "../context/AppContext";  // Import the combined App context

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AppContext);  // Check if the user is authenticated

  if (!isAuthenticated) {
    // If not authenticated, redirect to login page
    return <Navigate to="/login" />;
  }

  return children;  // If authenticated, render the child components
};

export default PrivateRoute;
