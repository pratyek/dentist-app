// client/src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          localStorage.removeItem('token');
          setUser(null);
        } else {
          // Set auth token header
          setAuthToken(token);
          
          // Get current user data
          getCurrentUser();
        }
      } catch (err) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  // Set auth token for axios requests
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      const res = await axios.post('/api/users/register', userData);
      
      // Set token to localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set token to Auth header
      setAuthToken(res.data.token);
      
      // Set user data
      setUser(res.data.user);
      
      toast.success('Registration successful!');
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      toast.error(errorMsg);
      return false;
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      const res = await axios.post('/api/users/login', userData);
      
      // Set token to localStorage
      localStorage.setItem('token', res.data.token);
      
      // Set token to Auth header
      setAuthToken(res.data.token);
      
      // Set user data
      setUser(res.data.user);
      
      toast.success('Login successful!');
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      toast.error(errorMsg);
      return false;
    }
  };

  // Get current user
  const getCurrentUser = async () => {
    try {
      const res = await axios.get('/api/users/current');
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem('token');
      setAuthToken(null);
      setUser(null);
    }
  };

  // Logout user
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove auth header for future requests
    setAuthToken(null);
    
    // Clear user state
    setUser(null);
    
    toast.info('You have been logged out');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        getCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};