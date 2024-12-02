import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from "../config/Config";  // Ensure you import your Firebase auth configuration
import Login from '../components/Login';
import Home from '../components/Home';

const FirstPage = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Subscribe to the auth state change listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);  // If user is logged in, update state
      } else {
        setCurrentUser(null);  // If no user is logged in, set currentUser to null
      }
    });

    // Clean up the listener when component is unmounted
    return () => unsubscribe();
  }, []);

  // If a user is logged in, render the Home component, otherwise render the Login component
  return currentUser ? <Home /> : <Login />;
};

export default FirstPage;
