import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeName = 'classic' | 'rose' | 'forest' | 'night';

export interface ThemeColors {
  primary: string; // Buttons, CTAs
  darker: string; // Links, icons, secondary text
  lighter: string; // Borders, subtle accents
}

export const themes: Record<ThemeName, ThemeColors> = {
  classic: {
    primary: '#A67C52', // Burnt umber - warmer, more leather-like
    darker: '#8B5F3F',
    lighter: '#B8906A',
  },
  rose: {
    primary: '#8B4A5E', // Dusty burgundy
    darker: '#6D3A4A',
    lighter: '#A05D72',
  },
  forest: {
    primary: '#4A5D4A', // Deep sage
    darker: '#3A4A3A',
    lighter: '#5D7260',
  },
  night: {
    primary: '#4A5568', // Muted slate
    darker: '#3A4455',
    lighter: '#5D6B7F',
  },
};

interface ThemeContextType {
  currentTheme: ThemeName;
  colors: ThemeColors;
  setTheme: (theme: ThemeName) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: 'rose',
  colors: themes.rose,
  setTheme: async () => {},
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

const THEME_STORAGE_KEY = 'app:theme';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('rose');
  const [colors, setColors] = useState<ThemeColors>(themes.rose);

  // Load theme from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && (savedTheme === 'classic' || savedTheme === 'rose' || savedTheme === 'forest' || savedTheme === 'night')) {
          setCurrentTheme(savedTheme as ThemeName);
          setColors(themes[savedTheme as ThemeName]);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (theme: ThemeName) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      setCurrentTheme(theme);
      setColors(themes[theme]);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, colors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

