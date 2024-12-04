import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/auth"; // Ensure this function returns true or false

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }
  // Render children (protected components)
  return children;
};

export default ProtectedRoute;
