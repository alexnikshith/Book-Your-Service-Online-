import React, { createContext, useState, useEffect } from 'react';
import API from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('userInfo')) || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password, role = 'user') => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.post('/auth/login', { email, password, role });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login Failed: Server Unreachable';
      setError(message);
      setLoading(false);
    }
  };

  const register = async (name, email, password, role, providerData = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await API.post('/auth/register', { 
        name, email, password, role, ...providerData 
      });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, clearError, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
