import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getCurrentUser();
        setCurrentUser(response.data.user);
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();

      if (!res.ok) {
        let msg = 'Login failed';
        try {
          if (contentType.includes('application/json')) {
            msg = JSON.parse(text).message;
          }
        } catch(e) {}
        return { success: false, error: msg };
      }

      const data = JSON.parse(text);
      if (data.token) localStorage.setItem('token', data.token);
      if (data.role) localStorage.setItem('role', data.role);

      return { success: true, role: data.role, token: data.token, user: data.user };
    } catch (err) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData) // Ensure userData includes name
      });

      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();

      if (!res.ok) {
        let msg = 'Registration failed';
        try {
          if (contentType.includes('application/json')) {
            msg = JSON.parse(text).message;
          }
        } catch(e) {}
        setError(msg);
        return { success: false, error: msg };
      }

      return { success: true };
    } catch (err) {
      const msg = err.message || 'Network error';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setCurrentUser(null);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};