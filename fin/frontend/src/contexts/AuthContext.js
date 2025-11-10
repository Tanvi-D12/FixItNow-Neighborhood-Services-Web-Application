import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/signin', { email, password });
      const { accessToken, refreshToken, ...userData } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    const merged = { ...user, ...updatedUserData };
    setUser(merged);
    localStorage.setItem('user', JSON.stringify(merged));
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      updateUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return null;
    }
  };

  // Helper functions for role checking
  const isProvider = () => user?.role?.toUpperCase() === 'PROVIDER';
  const isCustomer = () => user?.role?.toUpperCase() === 'CUSTOMER';
  const isAdmin = () => user?.role?.toUpperCase() === 'ADMIN';
  const canCreateServices = () => isProvider() || isAdmin();

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    loading,
    isProvider,
    isCustomer,
    isAdmin,
    canCreateServices
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};