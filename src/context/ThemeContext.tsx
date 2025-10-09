"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'glass';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('glass');
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    if (savedTheme && ['light', 'dark', 'glass'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  // Update theme class and localStorage
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'glass');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem('app-theme', theme);
  }, [theme, mounted]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}