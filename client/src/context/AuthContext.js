// client/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const response = await api.get('/api/users/current');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, callback) => {
    try {
      const response = await api.post('/api/users/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      toast.success('Login successful');
      
      // Use callback for navigation instead of useNavigate
      if (callback) {
        callback(user.role === 'patient' ? '/patient/dashboard' : '/dentist/dashboard');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false, error };
    }
  };

  const register = async (userData, callback) => {
    try {
      const response = await api.post('/api/users/register', userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      toast.success('Registration successful');
      
      // Use callback for navigation instead of useNavigate
      if (callback) {
        callback(user.role === 'patient' ? '/patient/dashboard' : '/dentist/dashboard');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false, error };
    }
  };

  const logout = (callback) => {
    localStorage.removeItem('token');
    setUser(null);
    
    // Use callback for navigation instead of useNavigate
    if (callback) {
      callback('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};