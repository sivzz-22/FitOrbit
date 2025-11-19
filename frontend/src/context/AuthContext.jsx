import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistUser = (data) => {
    if (!data) {
      localStorage.removeItem('user');
      setUser(null);
      return;
    }
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
  };

  const refreshUserProfile = async () => {
    try {
      if (!authService.getToken()) {
        setLoading(false);
        return null;
      }
      const { data } = await api.get('/users/profile');
      const stored = authService.getCurrentUser();
      const merged = {
        ...(stored || {}),
        _id: data._id?.toString() || stored?._id,
        name: data.name,
        email: data.email,
        role: data.role,
        username: data.username,
        phone: data.phone,
        profilePhoto: data.profilePhoto,
        themePreference: data.themePreference
      };
      if (stored?.token) {
        merged.token = stored.token;
      }
      persistUser(merged);
      return merged;
    } catch (error) {
      console.error('Failed to refresh user profile', error);
    } finally {
      setLoading(false);
    }
    return null;
  };

  useEffect(() => {
    const token = authService.getToken();
    const currentUser = authService.getCurrentUser();
    if (token && currentUser) {
      setUser(currentUser);
      refreshUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      persistUser(data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      persistUser(data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    authService.logout();
    persistUser(null);
  };

  const updateStoredUser = useCallback((updates) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...updates };
      if (next.token || prev?.token) {
        next.token = next.token || prev.token;
      }
      if (Object.keys(next).length === 0) {
        localStorage.removeItem('user');
      } else {
        localStorage.setItem('user', JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    refreshUserProfile,
    updateStoredUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

