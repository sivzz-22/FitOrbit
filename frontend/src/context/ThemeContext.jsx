import { createContext, useContext, useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { user, updateStoredUser } = useAuth();
  const [theme, setThemeState] = useState('light');
  const initializedRef = useRef(false);
  const skipSyncRef = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const preferred = user?.themePreference;
    const nextTheme = preferred || stored || 'light';
    skipSyncRef.current = true;
    setThemeState(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    initializedRef.current = true;
  }, [user]);

  useEffect(() => {
    if (!initializedRef.current) {
      return;
    }

    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);

    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }

    const syncTheme = async () => {
      try {
        if (user) {
          await api.put('/users/profile', { themePreference: theme });
          updateStoredUser({ themePreference: theme });
        }
      } catch (error) {
        console.error('Failed to sync theme preference', error);
      }
    };

    syncTheme();
  }, [theme, user, updateStoredUser]);

  const setTheme = (nextTheme) => {
    setThemeState(nextTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};


